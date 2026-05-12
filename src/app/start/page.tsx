"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import ShareDialog from "@/components/ShareDialog";
import { getScale } from "@/lib/scales";
import { newSession } from "@/lib/store";
import { useT, useLang, pick } from "@/lib/lang";
import type { Scale } from "@/lib/types";

/**
 * 量表套餐启动页。
 *
 * URL：/start/?b=gad7,phq9,mdq （battery = 逗号分隔的 scale id 列表）
 *
 * 用途：
 *  - library 多选后跳到这里，用户预览要做哪些量表后点"开始"
 *  - URL 本身可以分享给朋友 / 来访者，他们打开同样的链接就能做同一套量表
 *
 * Suspense 包裹是 Next 15 + useSearchParams 的硬性要求。
 */
export default function StartPage() {
  return (
    <Suspense fallback={<Container><p className="card text-center text-brand-500">…</p></Container>}>
      <StartContent />
    </Suspense>
  );
}

function StartContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const t = useT();
  const { lang } = useLang();
  const [shareOpen, setShareOpen] = useState(false);

  // 解析 ?b= 量表 id 列表（去重、过滤、保序）
  const battery = useMemo(() => {
    const b = sp.get("b");
    if (!b) return [] as string[];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of b.split(",")) {
      const id = raw.trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }
    return out;
  }, [sp]);

  const scales = useMemo(() => {
    return battery
      .map((id) => getScale(id))
      .filter((s): s is Scale => !!s && s.items.length > 0);
  }, [battery]);

  const totalItems = scales.reduce((a, s) => a + s.items.length, 0);
  const totalMin = scales.reduce((a, s) => a + s.estimatedMinutes, 0);

  // 完整可分享 URL（含 origin）— SSR 时为空，仅客户端水合后填充
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/start/?b=${encodeURIComponent(battery.join(","))}`
      : "";

  const begin = () => {
    if (scales.length === 0) return;
    newSession(
      scales.map((s) => s.id),
      []
    );
    router.push(`/assessment/${scales[0].slug}/`);
  };

  if (scales.length === 0) {
    return (
      <Container>
        <div className="card text-center">
          <p className="mb-4 text-brand-700">{t("start_empty")}</p>
          <Link href="/library/" className="btn-primary">
            {t("start_to_library")}
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="animate-fade-in">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-brand-400">
          {t("start_eyebrow")}
        </p>
        <h1 className="mb-4 font-serif text-3xl leading-tight text-ink sm:text-4xl">
          {t("start_title")}
        </h1>
        <p className="mb-8 max-w-prose leading-relaxed text-brand-700">
          {t("start_intro_prefix")}
          <span className="font-mono font-medium text-ink">{scales.length}</span>
          {t("start_intro_scales_unit")} ·{" "}
          <span className="font-mono font-medium text-ink">{totalItems}</span>
          {t("start_intro_items_unit")} · {t("start_intro_minutes_prefix")}
          <span className="font-mono font-medium text-ink">~{totalMin}</span>
          {t("start_intro_minutes_unit")}
        </p>

        {/* 量表清单 */}
        <ol className="card mb-8 space-y-3">
          {scales.map((s, i) => (
            <li
              key={s.id}
              className="flex items-baseline gap-3 border-b border-brand-100 pb-3 last:border-b-0 last:pb-0"
            >
              <span className="font-mono text-sm text-brand-400">
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <div className="flex-1">
                <div className="font-medium text-ink">
                  {pick(s.name, s.nameEn, lang)}
                </div>
                <div className="mt-0.5 text-xs text-brand-500">
                  {pick(s.description, s.descriptionEn, lang)}
                </div>
                <div className="mt-1 text-xs text-brand-400">
                  {s.items.length}
                  {t("start_intro_items_unit")} · ~{s.estimatedMinutes}
                  {t("start_intro_minutes_unit")}
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* 开始按钮 */}
        <div className="mb-10 flex flex-wrap gap-3">
          <button type="button" onClick={begin} className="btn-primary">
            {t("start_begin")} →
          </button>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="btn-ghost"
          >
            {t("start_share")}
          </button>
        </div>

        {/* 分享提示 */}
        <div className="rounded-2xl border border-sage-200 bg-sage-50 p-5">
          <h2 className="mb-2 font-serif text-base text-ink">
            {t("start_share_title")}
          </h2>
          <p className="text-sm leading-relaxed text-brand-700">
            {t("start_share_desc")}
          </p>
        </div>

        <ShareDialog
          url={shareUrl}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      </div>
    </Container>
  );
}
