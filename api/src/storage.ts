/**
 * 「收集本」持久化层（老师后端回收作答用）。
 *
 * 设计取向：零新依赖，用 node 内置 fs，贴合当前「tsx 直跑 TS、单 PM2 进程」的极简架构。
 * 落盘位置：DATA_DIR（默认 <api cwd>/data），在 nginx /api 反代后面，绝不放进静态 out/。
 *
 * 布局：
 *   <DATA_DIR>/collections/<id>.json    收集本元信息（含 ownerKey 的 sha256，不存明文）
 *   <DATA_DIR>/collections/<id>.ndjson  该收集本的提交，每行一条 {receivedAt, d}
 *
 * 安全：
 *   - id / ownerKey 均由 crypto.randomBytes 生成；ownerKey 只在创建时返回一次，服务端只留哈希。
 *   - 查看端点用 timingSafeEqual 比对哈希，防时序侧信。
 *   - id 严格白名单校验，杜绝路径穿越。
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
const COLL_DIR = path.join(DATA_DIR, "collections");

// id / ownerKey 用 base64url 字符集；只允许这些字符做文件名，防路径穿越
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

export interface CollectionMeta {
  id: string;
  battery: string[];
  title: string | null;
  ownerKeyHash: string;
  createdAt: string;
  open: boolean;
}

export interface StoredResponse {
  receivedAt: string;
  d: string;
}

// 单收集本硬上限：防止公开 collectionId 被灌爆磁盘 + 看板 GET 时 OOM。
// 300 份是家庭沙龙/一节课的家长数量的 10 倍，够真实场景用。
const MAX_RESPONSES_PER_COLLECTION = Number(
  process.env.COLLECT_MAX_RESPONSES_PER_COLLECTION ?? 300
);

export class CollectionFullError extends Error {
  constructor() {
    super("collection_full");
  }
}

function sha256hex(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(COLL_DIR, { recursive: true });
}

export function isValidId(id: string): boolean {
  return typeof id === "string" && ID_RE.test(id);
}

/** 创建收集本，返回公开 id 与只此一次的 ownerKey（明文，服务端只留哈希）。 */
export async function createCollection(input: {
  battery: string[];
  title?: string | null;
}): Promise<{ id: string; ownerKey: string }> {
  await ensureDir();
  const id = b64url(crypto.randomBytes(9)); // ~12 字符
  const ownerKey = b64url(crypto.randomBytes(24)); // ~32 字符
  const meta: CollectionMeta = {
    id,
    battery: input.battery,
    title: input.title ?? null,
    ownerKeyHash: sha256hex(ownerKey),
    createdAt: new Date().toISOString(),
    open: true,
  };
  const file = path.join(COLL_DIR, `${id}.json`);
  const tmp = `${file}.tmp`;
  // 原子写：先写临时文件再 rename
  await fs.writeFile(tmp, JSON.stringify(meta), "utf8");
  await fs.rename(tmp, file);
  return { id, ownerKey };
}

export async function getMeta(id: string): Promise<CollectionMeta | null> {
  if (!isValidId(id)) return null;
  try {
    const raw = await fs.readFile(path.join(COLL_DIR, `${id}.json`), "utf8");
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return null;
    return obj as CollectionMeta;
  } catch {
    return null;
  }
}

/**
 * 追加一条提交（NDJSON）。
 *
 * 幂等：客户端在请求体里带 idempotencyKey，落盘时与 receivedAt 一起入库；同 id+同 key
 * 已存在则直接跳过。防「上传写盘后连接超时→客户端 8s abort→兜底重传」造成的重复。
 *
 * 顺手加上「每收集本上限」，防公开 collectionId 被灌爆导致看板 OOM。
 *
 * 并发写：Node/Hono 单进程 fork，通过一个进程内 promise chain 串行化本进程内的
 * 所有 append，避免大 payload 需要多次 write() 时的行交错（否则 listResponses 会
 * 因坏行 try/catch 静默丢弃该条敏感作答）。
 */
let appendChain: Promise<unknown> = Promise.resolve();
export async function appendResponse(
  id: string,
  d: string,
  idempotencyKey?: string
): Promise<{ appended: boolean }> {
  if (!isValidId(id)) throw new Error("bad id");
  await ensureDir();
  // 串行化本进程内的所有 append（大 payload 的多次 write 交错→坏行）
  const task = appendChain.then(async () => {
    const file = path.join(COLL_DIR, `${id}.ndjson`);
    // 幂等 + 容量检查：一次性读现状（同一进程串行，无并发问题）
    let existing = "";
    try {
      existing = await fs.readFile(file, "utf8");
    } catch {
      existing = "";
    }
    let count = 0;
    if (idempotencyKey && typeof idempotencyKey === "string") {
      for (const line of existing.split("\n")) {
        const s = line.trim();
        if (!s) continue;
        count++;
        try {
          const o = JSON.parse(s);
          if (o && o.idempotencyKey === idempotencyKey) {
            return { appended: false }; // 已存在，跳过重传
          }
        } catch {
          // 坏行不影响幂等判定
        }
      }
    } else {
      count = existing.split("\n").filter((l) => l.trim()).length;
    }
    if (count >= MAX_RESPONSES_PER_COLLECTION) {
      throw new CollectionFullError();
    }
    const entry: {
      receivedAt: string;
      d: string;
      idempotencyKey?: string;
    } = { receivedAt: new Date().toISOString(), d };
    if (idempotencyKey) entry.idempotencyKey = idempotencyKey;
    await fs.appendFile(file, JSON.stringify(entry) + "\n", "utf8");
    return { appended: true };
  });
  // 无论成败都让链继续（否则一次错误会永远卡死后续所有 append）
  appendChain = task.catch(() => undefined);
  return task;
}

export async function listResponses(id: string): Promise<StoredResponse[]> {
  if (!isValidId(id)) return [];
  let raw: string;
  try {
    raw = await fs.readFile(path.join(COLL_DIR, `${id}.ndjson`), "utf8");
  } catch {
    return []; // 还没有任何提交
  }
  const out: StoredResponse[] = [];
  for (const line of raw.split("\n")) {
    const s = line.trim();
    if (!s) continue;
    try {
      const o = JSON.parse(s);
      if (o && typeof o.d === "string" && typeof o.receivedAt === "string") {
        out.push({ receivedAt: o.receivedAt, d: o.d });
      }
    } catch {
      // 跳过损坏行，不让一行坏数据拖垮整个看板
    }
  }
  return out;
}

/** 恒定时间比对 ownerKey，防时序侧信。 */
export function verifyOwnerKey(meta: CollectionMeta, ownerKey: string): boolean {
  if (typeof ownerKey !== "string" || ownerKey.length === 0) return false;
  const a = Buffer.from(sha256hex(ownerKey), "hex");
  const b = Buffer.from(meta.ownerKeyHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
