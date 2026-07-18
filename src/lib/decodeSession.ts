/**
 * 把一份分享 payload（base64url 串）解码成可渲染的会话结果。
 *
 * therapist 页（从 URL hash 读单份）与 inbox 看板页（从后端拉多份）共用同一套解码，
 * 避免两处重复。纯客户端函数，吃 getScale 打包的静态量表数据，不联网。
 */

import { getScale } from "./scales";
import { scoreScale } from "./scoring";
import {
  decodePayload,
  payloadToResponses,
  readHashPayload,
  type SharePayload,
} from "./share";
import type { ScaleResult, ScaleResponse } from "./types";

export interface DecodedSession {
  payload: SharePayload;
  results: Array<{
    scaleId: string;
    result: ScaleResult;
    response: ScaleResponse;
  }>;
}

/** base64url 串 → 解码 + 计分；无法识别返回 null */
export function decodeRawSession(raw: string): DecodedSession | null {
  const payload = decodePayload(raw);
  if (!payload) return null;
  const responses = payloadToResponses(payload);
  const results: DecodedSession["results"] = [];
  for (const scaleId of payload.b) {
    const scale = getScale(scaleId);
    const response = responses[scaleId];
    if (!scale || !response) continue;
    results.push({ scaleId, result: scoreScale(scale, response), response });
  }
  return { payload, results };
}

export { readHashPayload };
