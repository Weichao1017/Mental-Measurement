"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import TherapistResultCard from "@/components/TherapistResultCard";
import { getScale, CONCERN_OPTIONS } from "@/lib/scales";
import { scoreScale } from "@/lib/scoring";
import {
  decodePayload,
  payloadToResponses,
  readHashPayload,
  type SharePayload,
} from "@/lib/share";
import type { ScaleResult } from "@/lib/types";

interface Decoded {
  payload: SharePayload;
  results: Array<{
    scaleId: string;
    result: ScaleResult;
    response: { scaleId: string; answers: Record<number, number> };
  }>;
}

export default function TherapistPage() {
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "empty" }
    | { kind: "invalid"; message: string }
    | { kind: "ok"; decoded: Decoded }
  >({ kind: "loading" });

  useEffect(() => {
    const raw = readHashPayload(window.location.hash);
    if (!raw) {
      setState({ kind: "empty" });
      return;
    }
    const payload = decodePayload(raw);
    if (!payload) {
      setState({
        kind: "invalid",
        message: "链接格式无法识别。可能是链接被截断、版本不匹配，或不是本系统生成的分享链接。",
      });
      return;
    }
    const responses = payloadToResponses(payload);
    const results: Decoded["results"] = [];
    for (const scaleId of payload.b) {
      const scale = getScale(scaleId);
      const response = responses[scaleId];
      if (!scale || !response) continue;
      results.push({ scaleId, result: scoreScale(scale, response), response });
    }
    setState({ kind: "ok", decoded: { payload, results } });
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

  return <OkView decoded={state.decoded} />;
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

function OkView({ decoded }: { decoded: Decoded }) {
  const { payload, results } = decoded;
  const completedAt = useMemo(() => formatDate(payload.t), [payload.t]);

  const concernLabels = useMemo(() => {
    return payload.c
      .map((c) => CONCERN_OPTIONS.find((o) => o.value === c)?.label ?? c)
      .filter(Boolean);
  }, [payload.c]);

  const anyWarnings = results.some((r) => r.result.warnings.length > 0);
  const incompleteScales = results.filter((r) => !r.result.complete);

  return (
    <Container size="lg">
      <div className="mb-6 rounded-2xl border border-brand-200 bg-white p-6 sm:p-8">
        <p className="mb-1 text-xs uppercase tracking-[0.2em] text-brand-400">
          Therapist View
        </p>
        <h1 className="mb-3 font-serif text-2xl text-ink sm:text-3xl">
          客户评估解读
        </h1>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-brand-500">评估时间</dt>
            <dd className="text-ink">{completedAt}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-brand-500">量表数</dt>
            <dd className="text-ink">{results.length}</dd>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <dt className="w-20 shrink-0 text-brand-500">主诉</dt>
            <dd className="text-ink">
              {concernLabels.length > 0 ? (
                <ul className="space-y-0.5">
                  {concernLabels.map((c, i) => (
                    <li key={i}>· {c}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-brand-400">未勾选</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {anyWarnings ? (
        <div className="mb-6 rounded-2xl border-2 border-rose-300 bg-rose-50 p-6">
          <h2 className="mb-2 font-serif text-lg text-rose-900">⚠ 临床警示信号</h2>
          <p className="mb-3 text-sm leading-relaxed text-rose-800">
            客户在以下条目上选择了较高程度，建议在会谈中主动评估自杀风险 / 自伤意念，
            并视情况引导转介或启动危机干预流程：
          </p>
          <ul className="space-y-2 text-sm text-rose-900">
            {results.flatMap((r) =>
              r.result.warnings.map((w, wi) => (
                <li key={`${r.scaleId}-${wi}`} className="border-l-2 border-rose-400 pl-3">
                  <div className="font-medium">
                    {r.result.scaleName} 第 {w.itemIndex} 题
                  </div>
                  <div className="text-rose-800">"{w.itemText}"</div>
                  <div className="text-xs text-rose-700">
                    答 {w.answer} · 标签：{w.flag}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {incompleteScales.length > 0 ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          注意：以下量表未完整作答，结果仅供参考：
          {incompleteScales.map((r) => r.result.scaleName).join("、")}
        </div>
      ) : null}

      <div className="space-y-5">
        {results.map(({ scaleId, result, response }) => {
          const scale = getScale(scaleId)!;
          return (
            <TherapistResultCard
              key={scaleId}
              scale={scale}
              result={result}
              response={response}
            />
          );
        })}
      </div>

      <footer className="mt-12 border-t border-brand-200 pt-6 text-xs leading-relaxed text-brand-500">
        <p className="mb-2">
          <strong>解读注意：</strong>
          本平台提供的量表分级阈值参考国际公开发表的常模；
          中国本土常模在某些量表上略有差异，请结合临床访谈和客户实际情况综合判断。
        </p>
        <p>
          <strong>数据保密：</strong>
          所有答案数据均通过 URL hash 传递，未经服务器存储。
          若需保留客户档案，请自行截图或导出 PDF 保存到机构内部系统。
        </p>
      </footer>
    </Container>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}
