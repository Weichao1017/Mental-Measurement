/**
 * 分享给 therapist 的数据编解码。
 *
 * 设计：把整个 SessionState 紧凑编码到 URL hash（fragment），therapist 用
 * 同一个域名的 /therapist/ 路由打开链接即可看到。
 *
 * 选 hash 而不是 query 的原因：
 *  1. hash 不会发送到服务器，整个解读过程零服务端日志，更隐私
 *  2. 静态站点 (output: "export") 没有后端，hash 完全在客户端解析
 *
 * 编码：
 *   1. SessionState → 紧凑 payload（每个量表的 answers 用按 item.index 顺序的数组）
 *   2. JSON.stringify
 *   3. UTF-8 → base64url（去掉 +/=）
 *
 * 容量：8 个量表全部 ~140 题 → JSON 约 600-800 字节 → base64 约 800-1100 字节，
 * URL 完全装得下（浏览器普遍支持 8000+），二维码也能在 Version 15 内放下。
 */

import type { SessionState, ScaleResponse, Concern } from "./types";
import { getScale } from "./scales";

export const SHARE_FORMAT_VERSION = 1;

/** URL hash 中的 payload */
export interface SharePayload {
  /** 格式版本 */
  v: number;
  /** 评估开始时间 ISO 字符串 */
  t: string;
  /** 主诉 */
  c: Concern[];
  /** 量表 battery（按完成顺序） */
  b: string[];
  /** 答案：{ scaleId: [按 item.index 升序排列的 value 数组]，未答用 -1 } */
  a: Record<string, number[]>;
  /**
   * 文本题 / 自由补充答案（收集型问卷用）：{ scaleId: { itemIndex: 文本 } }。
   * 可选字段：旧版链接没有它也能正常解码（版本号保持 1）。
   */
  x?: Record<string, Record<number, string>>;
  /** 多选题答案（收集型问卷用）：{ scaleId: { itemIndex: 选中值数组 } } */
  m?: Record<string, Record<number, number[]>>;
}

/** 把 SessionState 编码成 base64url 字符串 */
export function encodeSession(session: SessionState): string {
  const a: Record<string, number[]> = {};
  const x: Record<string, Record<number, string>> = {};
  const m: Record<string, Record<number, number[]>> = {};
  for (const scaleId of session.battery) {
    const scale = getScale(scaleId);
    const response = session.responses[scaleId];
    if (!scale || !response) continue;
    // 按 item.index 升序排列，未答的题位置写 -1
    const sortedItems = [...scale.items].sort((x, y) => x.index - y.index);
    a[scaleId] = sortedItems.map((it) => {
      const v = response.answers[it.index];
      return typeof v === "number" ? v : -1;
    });
    // 文本 / 多选答案（收集型问卷）：只带非空项
    for (const it of sortedItems) {
      const txt = response.textAnswers?.[it.index];
      if (typeof txt === "string" && txt.trim() !== "") {
        (x[scaleId] ??= {})[it.index] = txt;
      }
      const mv = response.multiAnswers?.[it.index];
      if (Array.isArray(mv) && mv.length > 0) {
        (m[scaleId] ??= {})[it.index] = mv;
      }
    }
  }

  const payload: SharePayload = {
    v: SHARE_FORMAT_VERSION,
    t: session.startedAt,
    c: session.concerns,
    b: session.battery,
    a,
    ...(Object.keys(x).length > 0 ? { x } : {}),
    ...(Object.keys(m).length > 0 ? { m } : {}),
  };

  const json = JSON.stringify(payload);
  return toBase64Url(json);
}

/** 解码 base64url 字符串 → SharePayload；失败返回 null */
export function decodePayload(encoded: string): SharePayload | null {
  try {
    const json = fromBase64Url(encoded);
    const obj = JSON.parse(json);
    if (!obj || typeof obj !== "object") return null;
    if (obj.v !== SHARE_FORMAT_VERSION) return null;
    if (typeof obj.t !== "string") return null;
    if (!Array.isArray(obj.c)) return null;
    if (!Array.isArray(obj.b)) return null;
    if (!obj.a || typeof obj.a !== "object") return null;
    // x / m 是可选扩展字段：形状不对就丢弃，不让整个链接失效
    if (obj.x !== undefined && (typeof obj.x !== "object" || obj.x === null)) delete obj.x;
    if (obj.m !== undefined && (typeof obj.m !== "object" || obj.m === null)) delete obj.m;
    return obj as SharePayload;
  } catch {
    return null;
  }
}

/** payload → 重建可用于计分的 responses 字典 */
export function payloadToResponses(
  payload: SharePayload
): Record<string, ScaleResponse> {
  const responses: Record<string, ScaleResponse> = {};
  for (const scaleId of payload.b) {
    const scale = getScale(scaleId);
    if (!scale) continue;
    const arr = payload.a[scaleId];
    if (!Array.isArray(arr)) continue;
    const sortedItems = [...scale.items].sort((x, y) => x.index - y.index);
    const answers: Record<number, number> = {};
    sortedItems.forEach((it, i) => {
      const v = arr[i];
      if (typeof v === "number" && v >= 0) answers[it.index] = v;
    });
    const response: ScaleResponse = { scaleId, answers };
    // 还原文本 / 多选答案（JSON 对象键是字符串，转回 number 键）
    const xMap = payload.x?.[scaleId];
    if (xMap && typeof xMap === "object") {
      const textAnswers: Record<number, string> = {};
      for (const [k, v] of Object.entries(xMap)) {
        const idx = Number(k);
        if (Number.isFinite(idx) && typeof v === "string") textAnswers[idx] = v;
      }
      if (Object.keys(textAnswers).length > 0) response.textAnswers = textAnswers;
    }
    const mMap = payload.m?.[scaleId];
    if (mMap && typeof mMap === "object") {
      const multiAnswers: Record<number, number[]> = {};
      for (const [k, v] of Object.entries(mMap)) {
        const idx = Number(k);
        if (Number.isFinite(idx) && Array.isArray(v)) {
          const vals = v.filter((n): n is number => typeof n === "number");
          if (vals.length > 0) multiAnswers[idx] = vals;
        }
      }
      if (Object.keys(multiAnswers).length > 0) response.multiAnswers = multiAnswers;
    }
    responses[scaleId] = response;
  }
  return responses;
}

/** 拼出 therapist 看结果的完整 URL（带 hash） */
export function buildShareUrl(encoded: string, origin?: string): string {
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/therapist/#d=${encoded}`;
}

/** 从 window.location.hash 提取 ?d= 编码串 */
export function readHashPayload(hash: string): string | null {
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!h) return null;
  // 支持 #d=xxx 和 #xxx 两种形式
  const m = /(?:^|&)d=([^&]+)/.exec(h);
  if (m) return decodeURIComponent(m[1]);
  return h;
}

// ---------- base64url helpers ----------

function toBase64Url(input: string): string {
  // 用 TextEncoder 处理 UTF-8 多字节字符
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 =
    typeof btoa !== "undefined"
      ? btoa(binary)
      : Buffer.from(binary, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const binary =
    typeof atob !== "undefined"
      ? atob(b64)
      : Buffer.from(b64, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
