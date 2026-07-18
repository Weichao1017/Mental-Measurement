"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import SessionView from "@/components/SessionView";
import { decodeRawSession, readHashPayload, type DecodedSession } from "@/lib/decodeSession";

export default function TherapistPage() {
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "empty" }
    | { kind: "invalid"; message: string }
    | { kind: "ok"; decoded: DecodedSession }
  >({ kind: "loading" });

  useEffect(() => {
    const raw = readHashPayload(window.location.hash);
    if (!raw) {
      setState({ kind: "empty" });
      return;
    }
    const decoded = decodeRawSession(raw);
    if (!decoded) {
      setState({
        kind: "invalid",
        message:
          "链接格式无法识别。可能是链接被截断、版本不匹配，或不是本系统生成的分享链接。",
      });
      return;
    }
    setState({ kind: "ok", decoded });
  }, []);

  if (state.kind === "loading") {
    return (
      <Container>
        <p className="card text-center text-brand-500">正在解析…</p>
      </Container>
    );
  }

  if (state.kind === "empty") {
    return <EmptyView />;
  }

  if (state.kind === "invalid") {
    return (
      <Container>
        <div className="card text-center">
          <h1 className="mb-3 font-serif text-2xl text-ink">链接无效</h1>
          <p className="mb-6 text-sm text-brand-600">{state.message}</p>
          <Link href="/" className="btn-ghost">
            返回首页
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <SessionView decoded={state.decoded} />
    </Container>
  );
}

function EmptyView() {
  return (
    <Container>
      <div className="card">
        <h1 className="mb-3 font-serif text-2xl text-ink">疗愈师 / 心理咨询师视图</h1>
        <p className="mb-4 text-sm leading-relaxed text-brand-700">
          这个页面是给疗愈师 / 心理工作者看的：当客户完成评估后，
          客户会得到一个二维码或链接，扫描或打开后就会回到这个页面，
          展示完整的解读视图（包含逐题答案、维度分、警示信号）。
        </p>
        <p className="mb-6 text-xs text-brand-500">
          数据完全包含在链接的 hash 部分（URL 中 # 之后的内容），不会上传到任何服务器。
        </p>
        <Link href="/" className="btn-ghost">
          返回首页
        </Link>
      </div>
    </Container>
  );
}
