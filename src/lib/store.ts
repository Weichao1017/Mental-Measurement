"use client";

import type { SessionState, ScaleResponse, Concern } from "./types";

// 客户端 localStorage 状态管理（MVP）
// Claude Code 接力可以替换为真正的后端持久化

const KEY = "mm.session.v1";

export function loadSession(): SessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

export function saveSession(s: SessionState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function newSession(
  battery: string[],
  concerns: Concern[],
  collectionId?: string
): SessionState {
  const s: SessionState = {
    concerns,
    battery,
    currentIndex: 0,
    responses: {},
    startedAt: new Date().toISOString(),
    ...(collectionId ? { collectionId } : {}),
  };
  saveSession(s);
  return s;
}

export function saveResponse(scaleId: string, response: ScaleResponse) {
  const s = loadSession();
  if (!s) return;
  s.responses[scaleId] = response;
  saveSession(s);
}

export function advanceToNext() {
  const s = loadSession();
  if (!s) return null;
  s.currentIndex += 1;
  saveSession(s);
  return s;
}
