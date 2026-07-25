"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import FeedbackCard from "@/components/FeedbackCard";
import { decodeRawSession, readHashPayload } from "@/lib/decodeSession";
import { buildCardModel, type CardModel } from "@/lib/feedbackCard";

/**
 * 家长个人反馈卡页。
 * 数据从 URL hash（#d=<base64url>）读，纯客户端解码——与 /therapist 同构：
 * 不发服务器、不需要后端，扫码即看。老师在 /inbox 里对某份提交生成本页链接。
 */
export default function CardPage() {
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "empty" }
    | { kind: "invalid" }
    | { kind: "ok"; model: CardModel; baked?: string }
  >({ kind: "loading" });

  useEffect(() => {
    const raw = readHashPayload(window.location.hash);
    if (!raw) {
      setState({ kind: "empty" });
      return;
    }
    const decoded = decodeRawSession(raw);
    if (!decoded) {
      setState({ kind: "invalid" });
      return;
    }
    const resp = decoded.results.find((r) => r.scaleId === "salon-warmup")?.response;
    const model = buildCardModel(resp);
    if (!model) {
      setState({ kind: "invalid" });
      return;
    }
    // 预烘焙的个性化分析（#a=<base64url utf-8>）；解不出就走 AI/规则
    const baked = readBakedAnalysis(window.location.hash);
    setState({ kind: "ok", model, baked });
  }, []);

  if (state.kind === "loading") {
    return (
      <Container>
        <p className="card text-center text-brand-500">正在打开你的反馈卡…</p>
      </Container>
    );
  }

  if (state.kind === "empty" || state.kind === "invalid") {
    return (
      <Container>
        <div className="card text-center">
          <h1 className="mb-3 font-serif text-2xl text-ink">打不开这张卡</h1>
          <p className="mb-6 text-sm leading-relaxed text-brand-600">
            {state.kind === "empty"
              ? "这个页面需要用完整的反馈卡链接（或扫二维码）打开。"
              : "链接似乎不完整，或不是本系统生成的反馈卡链接。请联系发给你链接的主持人。"}
          </p>
          <Link href="/" className="btn-ghost">
            返回首页
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <FeedbackCard model={state.model} bakedAnalysis={state.baked} />
    </Container>
  );
}

/** 从 hash 读 a=<base64url(UTF-8)> 并解码为文本；无 / 解码失败返回 undefined */
function readBakedAnalysis(hash: string): string | undefined {
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  const m = /(?:^|&)a=([^&]+)/.exec(h);
  if (!m) return undefined;
  try {
    let b64 = decodeURIComponent(m[1]).replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const s = new TextDecoder().decode(bytes).trim();
    return s || undefined;
  } catch {
    return undefined;
  }
}
