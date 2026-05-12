"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import { SCALES } from "@/lib/scales";
import { newSession } from "@/lib/store";
import { useT, useLang, pick, type UIKey } from "@/lib/lang";
import type { Scale } from "@/lib/types";

/**
 * 测评题库：
 * - 全部量表按 category 分组展示
 * - 用户可以多选几个量表，一次性做完，结果页 + AI 分析也会一次性整合
 * - 单选也行：选 1 个 + 开始评估 = 单做这一个
 */

const CATEGORY_ORDER: Array<{
  key: string;
  titleKey: UIKey;
  subKey: UIKey;
}> = [
  {
    key: "general",
    titleKey: "library_cat_general",
    subKey: "library_cat_general_sub",
  },
  {
    key: "anxiety_clinical",
    titleKey: "library_cat_anxiety",
    subKey: "library_cat_anxiety_sub",
  },
];

export default function LibraryPage() {
  const router = useRouter();
  const t = useT();
  const { lang } = useLang();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string, disabled: boolean) => {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clear = () => setSelected(new Set());

  const startBatch = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    newSession(ids, []);
    router.push(`/assessment/${ids[0]}/`);
  };

  // 按 category 分组（默认 category = "general"）
  const grouped = useMemo(() => {
    const map = new Map<string, Scale[]>();
    for (const s of Object.values(SCALES)) {
      const key = s.category ?? "general";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    // 组内排序：核心优先 → 题数从少到多
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const aReady = a.items.length > 0 ? 0 : 1;
        const bReady = b.items.length > 0 ? 0 : 1;
        if (aReady !== bReady) return aReady - bReady;
        if (a.isCore !== b.isCore) return a.isCore ? -1 : 1;
        return a.items.length - b.items.length;
      });
    }
    return map;
  }, []);

  // 选中数量统计
  const selectedScales = useMemo(
    () => Object.values(SCALES).filter((s) => selected.has(s.id)),
    [selected]
  );
  const totalItems = selectedScales.reduce(
    (acc, s) => acc + s.items.length,
    0
  );
  const totalMinutes = selectedScales.reduce(
    (acc, s) => acc + s.estimatedMinutes,
    0
  );

  return (
    <>
      {/* 顶部 sticky 选择栏 */}
      {selected.size > 0 ? (
        <div className="sticky top-0 z-30 border-b border-sage-300 bg-sage-50/95 backdrop-blur">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-5 py-3 sm:px-6">
            <div className="flex-1 text-sm text-sage-900">
              {t("library_selected_count")}{" "}
              <span className="font-mono font-semibold">{selected.size}</span>{" "}
              {t("library_scales_unit")}
              <span className="text-sage-700">
                {" "}
                · {totalItems} {t("library_items_unit")} ·{" "}
                {t("library_minutes_prefix")}
                {totalMinutes} {t("library_minutes_unit")}
              </span>
            </div>
            <button
              type="button"
              onClick={clear}
              className="rounded-full border border-brand-300 bg-white px-4 py-1.5 text-sm text-brand-700 hover:bg-brand-50"
            >
              {t("library_clear")}
            </button>
            <button
              type="button"
              onClick={startBatch}
              className="rounded-full bg-sage-600 px-5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-sage-700"
            >
              {t("library_start_selected")}
            </button>
          </div>
        </div>
      ) : null}

      <Container size="lg">
        <div className="animate-fade-in">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-brand-400">
            {t("library_eyebrow")}
          </p>
          <h1 className="mb-4 font-serif text-3xl leading-tight text-ink sm:text-4xl">
            {t("library_title")}
          </h1>
          <p className="mb-10 max-w-prose leading-relaxed text-brand-700">
            {t("library_intro")} {t("library_back_home_hint")}{" "}
            <Link href="/" className="text-sage-700 underline">
              {t("library_back_home")}
            </Link>{" "}
            {t("library_back_home_action")}
          </p>

          {CATEGORY_ORDER.map((cat) => {
            const scales = grouped.get(cat.key) ?? [];
            if (scales.length === 0) return null;
            return (
              <section key={cat.key} className="mb-12">
                <header className="mb-5 border-b border-brand-200 pb-3">
                  <h2 className="font-serif text-2xl text-ink">
                    {t(cat.titleKey)}
                  </h2>
                  <p className="mt-1 text-sm text-brand-500">{t(cat.subKey)}</p>
                </header>
                <div className="grid gap-4 sm:grid-cols-2">
                  {scales.map((s) => (
                    <ScaleCard
                      key={s.id}
                      scale={s}
                      isSelected={selected.has(s.id)}
                      onToggle={toggle}
                      lang={lang}
                      t={t}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          <footer className="mt-12 border-t border-brand-200 pt-6 text-xs leading-relaxed text-brand-400">
            {t("library_footer")}
          </footer>
        </div>
      </Container>
    </>
  );
}

function ScaleCard({
  scale,
  isSelected,
  onToggle,
  lang,
  t,
}: {
  scale: Scale;
  isSelected: boolean;
  onToggle: (id: string, disabled: boolean) => void;
  lang: "zh" | "en";
  t: (key: UIKey) => string;
}) {
  const stub = scale.items.length === 0;
  const disabled = stub;

  return (
    <article
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
      aria-disabled={disabled}
      onClick={() => onToggle(scale.id, disabled)}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(scale.id, disabled);
        }
      }}
      className={[
        "flex flex-col rounded-2xl border p-5 shadow-sm transition",
        disabled
          ? "cursor-not-allowed border-brand-200 bg-brand-50/40 opacity-60"
          : isSelected
            ? "cursor-pointer border-sage-500 bg-sage-50 shadow-md"
            : "cursor-pointer border-brand-200 bg-white hover:border-sage-300 hover:bg-cream",
      ].join(" ")}
    >
      <header className="mb-3 flex items-start gap-3">
        {/* 复选框 */}
        <span
          aria-hidden
          className={[
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition",
            disabled
              ? "border-brand-300 bg-brand-100"
              : isSelected
                ? "border-sage-500 bg-sage-500"
                : "border-brand-300 bg-white",
          ].join(" ")}
        >
          {isSelected ? (
            <svg
              viewBox="0 0 16 16"
              className="h-3 w-3 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M3 8l3 3 7-7" />
            </svg>
          ) : null}
        </span>

        <div className="flex flex-1 flex-wrap items-baseline gap-2">
          <h3 className="font-serif text-lg text-ink">
            {pick(scale.name, scale.nameEn, lang)}
          </h3>
          {scale.isCore ? (
            <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[11px] text-sage-800">
              {t("library_badge_core")}
            </span>
          ) : null}
          {!scale.fullyVerified && !stub ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
              {t("library_badge_unverified")}
            </span>
          ) : null}
          {stub ? (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] text-brand-600">
              {t("library_badge_stub")}
            </span>
          ) : null}
        </div>
      </header>

      <p className="mb-3 flex-1 text-sm leading-relaxed text-brand-700">
        {pick(scale.description, scale.descriptionEn, lang)}
      </p>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-brand-500">
        <div>
          <dt className="inline">{t("library_card_timeframe")}</dt>
          <dd className="inline text-brand-700">
            {pick(scale.timeFrame, scale.timeFrameEn, lang)}
          </dd>
        </div>
        <div>
          <dt className="inline">{t("library_card_items")}</dt>
          <dd className="inline text-brand-700">{scale.items.length || "—"}</dd>
        </div>
        <div>
          <dt className="inline">{t("library_card_minutes")}</dt>
          <dd className="inline text-brand-700">
            ~{scale.estimatedMinutes} {t("library_minutes_unit")}
          </dd>
        </div>
        <div>
          <dt className="inline">{t("library_card_direction")}</dt>
          <dd className="inline text-brand-700">
            {scale.highIsBetter
              ? t("library_dir_high_good")
              : t("library_dir_high_bad")}
          </dd>
        </div>
      </dl>
    </article>
  );
}
