"use client";

import type { ScaleResult, Scale } from "@/lib/types";
import { getPercentile } from "@/lib/norms";
import { useT, useLang, pick, type Lang } from "@/lib/lang";

interface Props {
  scale: Scale;
  result: ScaleResult;
}

export default function ResultCard({ scale, result }: Props) {
  const t = useT();
  const { lang } = useLang();
  return (
    <article className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm sm:p-8">
      <header className="mb-5 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-xl text-ink sm:text-2xl">
          {pick(scale.name, scale.nameEn, lang)}
        </h3>
        {!scale.fullyVerified ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
            {t("rc_band_pending")}
          </span>
        ) : null}
      </header>

      <p className="mb-5 text-sm text-brand-600">
        {pick(scale.description, scale.descriptionEn, lang)}
      </p>

      <div className="space-y-4">
        {result.dimensions.map((d) => {
          // 取本地化的 name / label / clientNote
          const dimInfo = scale.dimensions.find((x) => x.code === d.code);
          const dName = pick(d.name, dimInfo?.nameEn, lang);
          const bandObj = scale.severityBands[d.code]?.find(
            (b) => b.label === d.band?.label
          );
          const bandLabel = d.band
            ? pick(d.band.label, bandObj?.labelEn, lang)
            : null;
          const clientNote = d.band?.clientNote
            ? pick(d.band.clientNote, bandObj?.clientNoteEn, lang)
            : null;
          const bandClass = bandColor(d.band?.level, scale.highIsBetter);
          const percentile = getPercentile(scale.id, d.code, d.finalScore);
          return (
            <div key={d.code} className="border-t border-brand-100 pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="text-base font-medium text-ink">{dName}</h4>
                <div className="text-right">
                  <div className="font-mono text-2xl tabular-nums text-ink">
                    {formatScore(d.finalScore, scale.scoringMethod)}
                    {scale.dimensionMaxScore ? (
                      <span className="text-sm text-brand-400">
                        {" "}/ {scale.dimensionMaxScore}
                      </span>
                    ) : null}
                  </div>
                  {bandLabel ? (
                    <div className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs ${bandClass}`}>
                      {bandLabel}
                    </div>
                  ) : null}
                </div>
              </div>
              {percentile !== null ? (
                <p className="mt-2 text-xs text-brand-500">
                  {percentileLabel(percentile, scale.highIsBetter, lang)}
                  <span className="ml-1 text-brand-400">
                    {t("rc_norm_suffix")}
                  </span>
                </p>
              ) : null}
              {clientNote ? (
                <p className="mt-2 text-sm leading-relaxed text-brand-700">
                  {clientNote}
                </p>
              ) : null}

              {/* 完整切点表（折叠展示，客观分级体系，不依赖 AI） */}
              {scale.severityBands[d.code]?.length ? (
                <details className="mt-3 rounded-lg bg-cream/40 px-3 py-2">
                  <summary className="cursor-pointer select-none text-xs font-medium text-brand-600 hover:text-brand-800">
                    {t("rc_cutoffs_view")}
                  </summary>
                  <ul className="mt-2 space-y-1 font-mono text-xs leading-relaxed">
                    {scale.severityBands[d.code].map((b) => {
                      const isCurrent = b.label === d.band?.label;
                      const range =
                        b.max === null
                          ? `${b.min}+`
                          : b.min === b.max
                            ? `${b.min}`
                            : `${b.min}-${b.max}`;
                      const label = pick(b.label, b.labelEn, lang);
                      return (
                        <li
                          key={b.label}
                          className={
                            isCurrent
                              ? "font-semibold text-ink"
                              : "text-brand-600"
                          }
                        >
                          <span className="inline-block w-4 shrink-0">
                            {isCurrent ? "→" : " "}
                          </span>
                          <span className="inline-block w-16 tabular-nums">
                            {range}
                          </span>
                          <span>{label}</span>
                        </li>
                      );
                    })}
                  </ul>
                  {scale.citation ? (
                    <p className="mt-2 border-t border-brand-100 pt-2 font-sans text-[11px] leading-relaxed text-brand-400">
                      {t("rc_cutoffs_source")}
                      {scale.citation}
                    </p>
                  ) : null}
                </details>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-brand-100 pt-4 text-xs text-brand-400">
        {t("rc_citation")}{scale.citation}
      </div>
    </article>
  );
}

/**
 * 色彩映射。
 * highIsBetter=true 的量表（FFMQ/SCS/WHO-5/MAIA）：
 *   high = 绿（能力强是好事），low = 黄/橙（提示有提升空间）
 * highIsBetter=false 的量表（DASS-21/DERS/ECR/PSQI）：
 *   high = 红（症状重），low/normal = 绿
 */
function bandColor(level: string | undefined, highIsBetter: boolean) {
  switch (level) {
    case "normal":
      return "bg-sage-100 text-sage-800";
    case "low":
      return highIsBetter
        ? "bg-amber-100 text-amber-800"
        : "bg-sage-100 text-sage-800";
    case "high":
      return highIsBetter
        ? "bg-sage-100 text-sage-800"
        : "bg-rose-100 text-rose-800";
    case "mild":
    case "moderate":
      return "bg-amber-100 text-amber-800";
    case "severe":
    case "extremely_severe":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-brand-100 text-brand-700";
  }
}

function formatScore(score: number, method: Scale["scoringMethod"]) {
  if (method === "mean") return score.toFixed(2);
  return Math.round(score);
}

function percentileLabel(
  p: number,
  highIsBetter: boolean,
  lang: Lang
): string {
  if (lang === "en") {
    if (highIsBetter) {
      if (p >= 90) return `Your score is higher than about ${p}% of adults — notably strong`;
      if (p >= 60) return `Your score is higher than about ${p}% of adults — slightly above average`;
      if (p >= 40) return `Your score is around the adult average`;
      return `Your score is lower than about ${100 - p}% of adults — room to grow in this area`;
    }
    if (p >= 90) return `Your score is higher than about ${p}% of adults — significant distress in this dimension`;
    if (p >= 70) return `Your score is higher than about ${p}% of adults — slightly above average`;
    if (p >= 40) return `Your score is around the adult average`;
    return `Your score is lower than about ${100 - p}% of adults — relatively stable in this dimension`;
  }
  if (highIsBetter) {
    if (p >= 90) return `你的得分高于约 ${p}% 的成人——较为出色`;
    if (p >= 60) return `你的得分高于约 ${p}% 的成人——略高于平均`;
    if (p >= 40) return `你的得分大致处于成人平均水平`;
    return `你的得分低于约 ${100 - p}% 的成人——这一方面有较多成长空间`;
  } else {
    if (p >= 90) return `你的分数高于约 ${p}% 的成人——这一维度的困扰程度比较显著`;
    if (p >= 70) return `你的分数高于约 ${p}% 的成人——略高于平均`;
    if (p >= 40) return `你的分数大致处于成人平均水平`;
    return `你的分数低于约 ${100 - p}% 的成人——这一维度状态较为平稳`;
  }
}
