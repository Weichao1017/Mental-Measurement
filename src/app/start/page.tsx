"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import ShareDialog from "@/components/ShareDialog";
import { getScale } from "@/lib/scales";
import { newSession } from "@/lib/store";
import {
  createCollection,
  buildInboxUrl,
  buildCollectFillUrl,
} from "@/lib/collect";
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

  // 来访者从「已开启回收」的作答链接进入时会带 collect=<收集本 id>
  const collectId = (sp.get("collect") || "").trim();
  const respondentCollect = collectId !== "";

  // 老师侧：是否把作答回收到收集本，以及创建出来的收集本
  const [collectEnabled, setCollectEnabled] = useState(false);
  const [collection, setCollection] = useState<{
    collectionId: string;
    ownerKey: string;
  } | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(false);
  const [inboxCopied, setInboxCopied] = useState(false);

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

  const ids = useMemo(() => scales.map((s) => s.id), [scales]);
  const totalItems = scales.reduce((a, s) => a + s.items.length, 0);
  const totalMin = scales.reduce((a, s) => a + s.estimatedMinutes, 0);

  // 老师切换「回收」开关：开启时创建收集本（换回 collectionId + ownerKey）
  const toggleCollect = async (next: boolean) => {
    setCreateError(false);
    if (!next) {
      setCollectEnabled(false);
      return;
    }
    setCollectEnabled(true);
    if (collection || creating || ids.length === 0) return;
    setCreating(true);
    const created = await createCollection(ids);
    setCreating(false);
    if (created) setCollection(created);
    else {
      setCreateError(true);
      setCollectEnabled(false);
    }
  };

  // 是否处于「回收开启」态：来访者带 collect，或老师开了开关且已建好收集本
  const collectOn = respondentCollect || (collectEnabled && !!collection);
  const activeCollectId = respondentCollect
    ? collectId
    : collection?.collectionId ?? "";

  // 发给来访者的作答 URL（含 origin）— SSR 时为空，仅客户端水合后填充
  const shareUrl =
    typeof window === "undefined"
      ? ""
      : collectOn && activeCollectId
        ? buildCollectFillUrl(battery, activeCollectId)
        : `${window.location.origin}/start/?b=${encodeURIComponent(battery.join(","))}`;

  // 老师的看板链接（含密钥，只给自己保存）
  const inboxUrl =
    typeof window !== "undefined" && collection
      ? buildInboxUrl(collection.collectionId, collection.ownerKey)
      : "";

  const begin = () => {
    if (scales.length === 0) return;
    newSession(
      scales.map((s) => s.id),
      [],
      respondentCollect ? collectId : undefined
    );
    router.push(`/assessment/${scales[0].slug}/`);
  };

  const copyInbox = async () => {
    if (!inboxUrl) return;
    try {
      await navigator.clipboard.writeText(inboxUrl);
      setInboxCopied(true);
      setTimeout(() => setInboxCopied(false), 2200);
    } catch {
      window.prompt(t("start_collect_inbox_title"), inboxUrl);
    }
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
                {pick(s.description, s.descriptionEn, lang) ? (
                  <div className="mt-0.5 text-xs text-brand-500">
                    {pick(s.description, s.descriptionEn, lang)}
                  </div>
                ) : null}
                <div className="mt-1 text-xs text-brand-400">
                  {s.items.length}
                  {t("start_intro_items_unit")} · ~{s.estimatedMinutes}
                  {t("start_intro_minutes_unit")}
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* 来访者从回收链接进入：告知作答会提交给发起人 */}
        {respondentCollect ? (
          <div className="mb-8 rounded-2xl border border-sage-300 bg-sage-50 p-4 text-sm leading-relaxed text-brand-700">
            {t("start_collect_notice")}
          </div>
        ) : null}

        {/* 开始按钮 */}
        <div className="mb-6 flex flex-wrap gap-3">
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

        {/* 老师：把作答回收到我的收集本（来访者模式不显示） */}
        {!respondentCollect ? (
          <div className="mb-6 rounded-2xl border border-brand-200 bg-white p-5">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={collectEnabled}
                onChange={(e) => toggleCollect(e.target.checked)}
                className="mt-1 h-4 w-4 accent-sage-600"
              />
              <span>
                <span className="block font-medium text-ink">
                  {t("start_collect_toggle")}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-brand-600">
                  {t("start_collect_toggle_hint")}
                </span>
              </span>
            </label>

            {creating ? (
              <p className="mt-3 text-sm text-brand-500">
                {t("start_collect_creating")}
              </p>
            ) : null}
            {createError ? (
              <p className="mt-3 text-sm text-rose-700">
                {t("start_collect_error")}
              </p>
            ) : null}

            {collectEnabled && collection ? (
              <div className="mt-4 rounded-xl border border-sage-300 bg-sage-50 p-4">
                <h3 className="mb-1 font-medium text-ink">
                  {t("start_collect_inbox_title")}
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-brand-700">
                  {t("start_collect_inbox_desc")}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inboxUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className="flex-1 truncate rounded-lg border border-brand-200 bg-white px-3 py-2 font-mono text-xs text-ink"
                  />
                  <button
                    type="button"
                    onClick={copyInbox}
                    className="shrink-0 rounded-lg bg-sage-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sage-700"
                  >
                    {inboxCopied ? t("share_copied") : t("share_copy")}
                  </button>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-brand-500">
                  {t("start_collect_fill_hint")}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* 分享提示（措辞随是否回收变化） */}
        <div className="rounded-2xl border border-sage-200 bg-sage-50 p-5">
          <h2 className="mb-2 font-serif text-base text-ink">
            {collectOn ? t("start_share_title_collect") : t("start_share_title")}
          </h2>
          <p className="text-sm leading-relaxed text-brand-700">
            {collectOn ? t("start_share_desc_collect") : t("start_share_desc")}
          </p>
        </div>

        <ShareDialog
          url={shareUrl}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          audience={collectOn ? "taker_collect" : "taker"}
        />
      </div>
    </Container>
  );
}
