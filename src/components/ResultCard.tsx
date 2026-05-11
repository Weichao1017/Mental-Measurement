import type { ScaleResult, Scale } from "@/lib/types";
import { getPercentile } from "@/lib/norms";

interface Props {
  scale: Scale;
  result: ScaleResult;
}

export default function ResultCard({ scale, result }: Props) {
  return (
    <article className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm sm:p-8">
      <header className="mb-5 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-xl text-ink sm:text-2xl">{scale.name}</h3>
        {!scale.fullyVerified ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
            题库待核对
          </span>
        ) : null}
      </header>

      <p className="mb-5 text-sm text-brand-600">{scale.description}</p>

      <div className="space-y-4">
        {result.dimensions.map((d) => {
          const bandClass = bandColor(d.band?.level, scale.highIsBetter);
          const percentile = getPercentile(scale.id, d.code, d.finalScore);
          return (
            <div key={d.code} className="border-t border-brand-100 pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="text-base font-medium text-ink">{d.name}</h4>
                <div className="text-right">
                  <div className="font-mono text-2xl tabular-nums text-ink">
                    {formatScore(d.finalScore, scale.scoringMethod)}
                    {scale.dimensionMaxScore ? (
                      <span className="text-sm text-brand-400">
                        {" "}/ {scale.dimensionMaxScore}
                      </span>
                    ) : null}
                  </div>
                  {d.band ? (
                    <div className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs ${bandClass}`}>
                      {d.band.label}
                    </div>
                  ) : null}
                </div>
              </div>
              {percentile !== null ? (
                <p className="mt-2 text-xs text-brand-500">
                  {percentileLabel(percentile, scale.highIsBetter)}
                  <span className="ml-1 text-brand-400">（澳大利亚成人非临床常模 N=1771）</span>
                </p>
              ) : null}
              {d.band?.clientNote ? (
                <p className="mt-2 text-sm leading-relaxed text-brand-700">
                  {d.band.clientNote}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {result.warnings.length > 0 ? (
        <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <div className="mb-1 font-medium">温和提醒</div>
          <p className="leading-relaxed">
            您在涉及自我价值或生命意义的问题上选择了较高的程度。这些感受是真实的，请记得您不必独自承担：
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>北京心理危机研究与干预中心：010-82951332（24 小时）</li>
            <li>全国希望热线：400-161-9995</li>
            <li>华中师范大学心理援助热线：4001-888-976（24 小时）</li>
          </ul>
        </div>
      ) : null}

      <div className="mt-6 border-t border-brand-100 pt-4 text-xs text-brand-400">
        引用：{scale.citation}
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

function percentileLabel(p: number, highIsBetter: boolean): string {
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
