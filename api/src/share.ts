/**
 * 服务端版本的 SharePayload 解码 + 类型定义。
 * 这里跟前端 src/lib/share.ts 保持兼容，但独立实现（不引前端代码）。
 */

export const SHARE_FORMAT_VERSION = 1;

export type Concern =
  | "body_disconnect"
  | "emotion_dysregulation"
  | "sleep_problems"
  | "relationship_issues"
  | "wellbeing"
  | "mindfulness"
  | "self_compassion";

export interface SharePayload {
  v: number;
  t: string; // ISO time
  c: Concern[]; // concerns
  b: string[]; // battery scale ids
  a: Record<string, number[]>; // answers: scaleId -> [values by item.index ascending; -1 = unanswered]
}

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
    return obj as SharePayload;
  } catch {
    return null;
  }
}

function fromBase64Url(input: string): string {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return Buffer.from(b64, "base64").toString("utf-8");
}
