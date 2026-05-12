"use client";

import type { ClinicalFlag } from "@/lib/clinical-flag";
import { useT, type UIKey } from "@/lib/lang";

interface Props {
  flag: ClinicalFlag;
}

const LEVEL_TO_KEY: Record<ClinicalFlag["level"], UIKey> = {
  urgent: "cf_level_urgent",
  strong: "cf_level_strong",
  consult: "cf_level_consult",
  self_help: "cf_level_self_help",
};

/**
 * 临床综合建议卡片，显示在结果页顶部（在 AI 分析之前）。
 * 把分散在各量表的临床信号合并成一个明确的"是否建议就医 / 用药"等级。
 */
export default function ClinicalFlagCard({ flag }: Props) {
  const t = useT();
  const styles = STYLES[flag.color];

  return (
    <section
      className={`mb-8 rounded-2xl border-2 p-6 sm:p-8 ${styles.container}`}
    >
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className={`mb-1 text-xs uppercase tracking-[0.2em] ${styles.label}`}>
            {t("cf_eyebrow")}
          </p>
          <h2 className={`font-serif text-2xl ${styles.heading}`}>
            {t(LEVEL_TO_KEY[flag.level])}
          </h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${styles.badge}`}
        >
          {flag.signals.length}
          {t("cf_signals_count_suffix")}
        </span>
      </header>

      <p className={`mb-5 text-sm leading-relaxed ${styles.body}`}>
        {flag.summary}
      </p>

      {flag.signals.length > 0 ? (
        <div className="mb-5">
          <h3 className={`mb-2 text-xs font-medium uppercase tracking-wider ${styles.label}`}>
            {t("cf_signals_header")}
          </h3>
          <ul className="space-y-1.5 text-sm">
            {flag.signals.map((s, i) => (
              <li
                key={i}
                className={`flex items-start gap-2 ${styles.signal}`}
              >
                <span className={`mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
                <span>
                  <span className={styles.signalScale}>{s.scaleName}</span>
                  <span className={styles.body}> · {s.description}</span>
                  {s.warning ? (
                    <span className="ml-1 rounded-full bg-rose-200 px-1.5 py-0.5 text-[10px] font-medium text-rose-900">
                      {t("cf_warn_badge")}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className={`mb-2 text-xs font-medium uppercase tracking-wider ${styles.label}`}>
          {t("cf_rec_header")}
        </h3>
        <ol className="space-y-2 text-sm leading-relaxed">
          {flag.recommendations.map((r, i) => (
            <li key={i} className={`flex items-start gap-2 ${styles.body}`}>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${styles.numberCircle}`}
              >
                {i + 1}
              </span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className={`mt-5 text-[11px] leading-relaxed ${styles.footer}`}>
        {t("cf_footer")}
      </p>
    </section>
  );
}

const STYLES = {
  rose: {
    container: "border-rose-300 bg-rose-50",
    label: "text-rose-700",
    heading: "text-rose-900",
    badge: "bg-rose-200 text-rose-900",
    body: "text-rose-900",
    signal: "text-rose-900",
    signalScale: "font-medium text-rose-900",
    dot: "bg-rose-500",
    numberCircle: "bg-rose-600 text-white",
    footer: "text-rose-700",
  },
  amber: {
    container: "border-amber-300 bg-amber-50",
    label: "text-amber-700",
    heading: "text-amber-900",
    badge: "bg-amber-200 text-amber-900",
    body: "text-amber-900",
    signal: "text-amber-900",
    signalScale: "font-medium text-amber-900",
    dot: "bg-amber-500",
    numberCircle: "bg-amber-600 text-white",
    footer: "text-amber-700",
  },
  sage: {
    container: "border-sage-300 bg-sage-50",
    label: "text-sage-700",
    heading: "text-sage-900",
    badge: "bg-sage-200 text-sage-900",
    body: "text-sage-900",
    signal: "text-sage-900",
    signalScale: "font-medium text-sage-900",
    dot: "bg-sage-500",
    numberCircle: "bg-sage-600 text-white",
    footer: "text-sage-700",
  },
  neutral: {
    container: "border-brand-300 bg-brand-50",
    label: "text-brand-500",
    heading: "text-brand-800",
    badge: "bg-brand-200 text-brand-800",
    body: "text-brand-800",
    signal: "text-brand-800",
    signalScale: "font-medium text-brand-800",
    dot: "bg-brand-500",
    numberCircle: "bg-brand-600 text-white",
    footer: "text-brand-500",
  },
};
