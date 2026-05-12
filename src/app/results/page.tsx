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
import { useT, useLang } from "@/lib/lang";
import type { SessionState, ScaleResult, Scale } from "@/lib/types";

export default function ResultsPage() {
  const t = useT();
  const { lang } = useLang();
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
      results.map((r) => ({ scale: r.scale, result: r.result })),
      lang
    );
  }, [results, lang]);

  if (!session) {
    return (
      <Container>
        <div className="card text-center">
          <p className="text-brand-700">{t("results_no_data")}</p>
          <Link href="/" className="btn-primary mt-6">
            {t("results_start")}
          </Link>
        </div>
      </Container>
    );
  }

  const anyWarnings = results.some((r) => r.result.warnings.length > 0);

  return (
    <Container size="lg">
      <div className="animate-fade-in">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-brand-400">
          {t("results_eyebrow")}
        </p>
        <h1 className="mb-4 font-serif text-3xl leading-tight text-ink sm:text-4xl">
          {t("results_title")}
        </h1>
        <p className="mb-8 max-w-prose leading-relaxed text-brand-700">
          {t("results_intro")}
        </p>

        {clinicalFlag ? <ClinicalFlagCard flag={clinicalFlag} /> : null}

        {anyWarnings ? (
          <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-6">
            <h2 className="mb-2 font-serif text-lg text-rose-900">
              {t("results_hotline_title")}
            </h2>
            <p className="mb-2 text-sm leading-relaxed text-rose-800">
              {t("results_hotline_intro")}
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-rose-800">
              {lang === "en" ? (
                <>
                  <li>Beijing Psych Crisis Intervention Center: 010-82951332 (24h, CN)</li>
                  <li>National Hope Hotline (CN): 400-161-9995</li>
                  <li>
                    International:{" "}
                    <a
                      className="underline"
                      href="https://findahelpline.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      findahelpline.com
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li>北京心理危机研究与干预中心：010-82951332（24 小时）</li>
                  <li>全国希望热线：400-161-9995</li>
                  <li>华中师范大学心理援助热线：4001-888-976（24 小时）</li>
                </>
              )}
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
          <h2 className="mb-2 font-serif text-lg text-ink">
            {t("results_share_title")}
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-brand-700">
            {t("results_share_desc")}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShareOpen(true)}
            disabled={!shareUrl}
          >
            {t("results_share_btn")}
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
            {t("results_restart")}
          </button>
        </div>

        <ShareDialog
          url={shareUrl}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />


        <footer className="mt-16 border-t border-brand-200 pt-6 text-xs leading-relaxed text-brand-400">
          <p>
            <strong>{t("results_disclaimer_title")}</strong>
            {t("results_disclaimer_body")}
          </p>
        </footer>
      </div>
    </Container>
  );
}
