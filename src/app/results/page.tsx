"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import ResultCard from "@/components/ResultCard";
import ShareDialog from "@/components/ShareDialog";
import AIAnalysisCard from "@/components/AIAnalysisCard";
import ClinicalFlagCard from "@/components/ClinicalFlagCard";
import { getScale } from "@/lib/scales";
import { scoreScale } from "@/lib/scoring";
import { loadSession, clearSession } from "@/lib/store";
import { buildShareUrl, encodeSession } from "@/lib/share";
import { computeClinicalFlag } from "@/lib/clinical-flag";
import type { SessionState, ScaleResult, Scale } from "@/lib/types";

export default function ResultsPage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    setSession(loadSession());
  }, []);

  const shareUrl = useMemo(() => {
    if (!session) return "";
    return buildShareUrl(encodeSession(session));
  }, [session]);

  const results = useMemo<
    Array<{ scaleId: string; scale: Scale; result: ScaleResult }>
  >(() => {
    if (!session) return [];
    const out: Array<{ scaleId: string; scale: Scale; result: ScaleResult }> = [];
    for (const scaleId of session.battery) {
      const scale = getScale(scaleId);
      const response = session.responses[scaleId];
      if (!scale || !response) continue;
      out.push({ scaleId, scale, result: scoreScale(scale, response) });
    }
    return out;
  }, [session]);

  const clinicalFlag = useMemo(() => {
    if (results.length === 0) return null;
    return computeClinicalFlag(
      results.map((r) => ({ scale: r.scale, result: r.result }))
    );
  }, [results]);

  if (!session) {
    return (
      <Container>
        <div className="card text-center">
          <p className="text-brand-700">还没有评估数据。</p>
          <Link href="/" className="btn-primary mt-6">
            开始评估
          </Link>
        </div>
      </Container>
    );
  }

  const anyWarnings = results.some((r) => r.result.warnings.length > 0);

  return (
    <Container size="lg">
      <div className="animate-fade-in">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-brand-400">完成了</p>
        <h1 className="mb-4 font-serif text-3xl leading-tight text-ink sm:text-4xl">
          你的评估结果
        </h1>
        <p className="mb-8 max-w-prose leading-relaxed text-brand-700">
          这是你各个维度此刻的状态。结果只是一张"快照"，
          不代表你这个人。和老师交流时，可以把这份结果作为对话的起点。
        </p>

        {clinicalFlag ? <ClinicalFlagCard flag={clinicalFlag} /> : null}

        {anyWarnings ? (
          <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-6">
            <h2 className="mb-2 font-serif text-lg text-rose-900">危机干预热线</h2>
            <p className="mb-2 text-sm leading-relaxed text-rose-800">
              如果你正在经历强烈的低落、无望感或自伤想法——这些感受是真实的、值得被认真对待。你不必独自承担：
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-rose-800">
              <li>北京心理危机研究与干预中心：010-82951332（24 小时）</li>
              <li>全国希望热线：400-161-9995</li>
              <li>华中师范大学心理援助热线：4001-888-976（24 小时）</li>
            </ul>
          </div>
        ) : null}

        <div className="space-y-6">
          {results.map(({ scaleId, result }) => {
            const scale = getScale(scaleId)!;
            return <ResultCard key={scaleId} scale={scale} result={result} />;
          })}
        </div>

        <AIAnalysisCard
          session={session}
          results={results.map((r) => ({ scale: r.scale, result: r.result }))}
          clinicalFlag={clinicalFlag}
        />

        <div className="mt-10 rounded-2xl border border-sage-200 bg-sage-50 p-6">
          <h2 className="mb-2 font-serif text-lg text-ink">把这份结果交给老师</h2>
          <p className="mb-4 text-sm leading-relaxed text-brand-700">
            生成一个二维码或链接，给疗愈师 / 心理咨询师扫描或打开。
            老师会看到含逐题答案、维度分、警示信号的解读视图，方便会谈时一起讨论。
            数据完全包含在链接里，没有上传任何服务器。
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShareOpen(true)}
            disabled={!shareUrl}
          >
            生成给老师的链接 / 二维码
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              clearSession();
              window.location.href = "/";
            }}
          >
            清空并重新开始
          </button>
        </div>

        <ShareDialog
          url={shareUrl}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />


        <footer className="mt-16 border-t border-brand-200 pt-6 text-xs leading-relaxed text-brand-400">
          <p>
            <strong>免责声明：</strong>
            本评估基于公开发表的心理量表改编整理，结果仅供自我了解和与老师的工作参考，不构成任何临床诊断。
            如果你或你身边的人出现持续的低落、强烈的无望感或自伤想法，请尽快联系专业心理科 / 精神科，
            或拨打上述危机干预热线。
          </p>
        </footer>
      </div>
    </Container>
  );
}
