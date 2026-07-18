"use client";

/**
 * 收集本（老师后端回收作答）客户端。
 *
 * 全部走独立 Hono api（生产由 nginx 把 /api 反代到 :3100；本地 dev 用
 * NEXT_PUBLIC_API_BASE 指向本机 api 端口，CORS 已放行 localhost）。
 * 相对同源约定沿用 AIAnalysisCard。
 */

import { encodeSession } from "./share";
import { loadSession, saveSession } from "./store";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";
function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

// 带超时的 fetch，避免作答完成时因网络卡住阻塞跳转
async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  ms = 8000
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** 老师创建收集本 → { collectionId, ownerKey }；失败返回 null */
export async function createCollection(
  battery: string[],
  title?: string
): Promise<{ collectionId: string; ownerKey: string } | null> {
  try {
    const res = await fetchWithTimeout(apiUrl("/api/collections"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ battery, title }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    if (typeof j?.collectionId === "string" && typeof j?.ownerKey === "string") {
      return { collectionId: j.collectionId, ownerKey: j.ownerKey };
    }
    return null;
  } catch {
    return null;
  }
}

// 稳定的会话幂等键：一次会话产出一个，全生命周期用同一个。
// 服务端按 (collectionId, idempotencyKey) 去重，即使上传后连接超时/断网、
// 客户端把「服务端已成功」误判为失败并触发兜底重传，服务端也不会再存一份。
const IDEM_STORAGE_KEY = "mm.session.idem.v1";
function getOrCreateIdemKey(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(IDEM_STORAGE_KEY);
  if (existing) return existing;
  // crypto.randomUUID 在 iOS 15.4+/所有现代浏览器可用；老浏览器兜底走 Math.random
  let k = "";
  try {
    k = (window.crypto as Crypto).randomUUID().replace(/-/g, "");
  } catch {
    k = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
  window.localStorage.setItem(IDEM_STORAGE_KEY, k);
  return k;
}
function clearIdemKey() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(IDEM_STORAGE_KEY);
}

// 进程内并发守卫：ScaleRunner 完成分支与 /results 兜底可能同时发起，
// 且用户可能在 8s 上传窗口内快速双击提交按钮——本次进行中的调用直接
// 返回 in-flight promise，杜绝同一会话并发发出多次 POST。
let inFlight: Promise<boolean> | null = null;

/**
 * 若当前会话属于某收集本且尚未上传，则把作答提交到后端（best-effort）。
 * 幂等三重防护：
 *  1) session.uploadedAt 标记（重复调用同步跳过）
 *  2) inFlight promise（同进程并发调用共享同一次网络请求）
 *  3) 服务端按 idempotencyKey 去重（网络超时误判为失败时的最终兜底）
 * 失败静默返回 false，数据仍在 localStorage，可由 /results 兜底重试。
 */
export async function uploadCurrentSession(): Promise<boolean> {
  const s = loadSession();
  if (!s || !s.collectionId || s.uploadedAt) return false;
  if (inFlight) return inFlight;
  const p = (async () => {
    try {
      const d = encodeSession(s);
      const idem = getOrCreateIdemKey();
      const res = await fetchWithTimeout(
        apiUrl(`/api/collections/${encodeURIComponent(s.collectionId!)}/responses`),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ d, idempotencyKey: idem }),
        }
      );
      if (!res.ok) return false;
      const cur = loadSession();
      if (cur) {
        cur.uploadedAt = new Date().toISOString();
        saveSession(cur);
      }
      clearIdemKey();
      return true;
    } catch {
      return false;
    }
  })();
  inFlight = p;
  try {
    return await p;
  } finally {
    inFlight = null;
  }
}

export interface CollectionInbox {
  collection: {
    id: string;
    battery: string[];
    title: string | null;
    createdAt: string;
    count: number;
  };
  responses: Array<{ receivedAt: string; d: string }>;
}

/** 老师凭 ownerKey 拉取该收集本的全部提交 */
export async function fetchCollection(
  id: string,
  ownerKey: string
): Promise<{ ok: true; data: CollectionInbox } | { ok: false; status: number }> {
  try {
    const res = await fetch(
      apiUrl(`/api/collections/${encodeURIComponent(id)}/responses`),
      { headers: { authorization: `Bearer ${ownerKey}` } }
    );
    if (!res.ok) return { ok: false, status: res.status };
    return { ok: true, data: (await res.json()) as CollectionInbox };
  } catch {
    return { ok: false, status: 0 };
  }
}

/** 拼老师的看板链接（密钥放 hash，不进 URL query/服务器日志） */
export function buildInboxUrl(
  collectionId: string,
  ownerKey: string,
  origin?: string
): string {
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/inbox/#c=${encodeURIComponent(
    collectionId
  )}&k=${encodeURIComponent(ownerKey)}`;
}

/** 拼发给来访者的作答链接（带 collect 标志开启回收） */
export function buildCollectFillUrl(
  battery: string[],
  collectionId: string,
  origin?: string
): string {
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/start/?b=${encodeURIComponent(
    battery.join(",")
  )}&collect=${encodeURIComponent(collectionId)}`;
}
