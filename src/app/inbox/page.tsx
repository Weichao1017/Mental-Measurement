"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import SessionView from "@/components/SessionView";
import ShareDialog from "@/components/ShareDialog";
import { fetchCollection, type CollectionInbox } from "@/lib/collect";
import { decodeRawSession } from "@/lib/decodeSession";
import { CONCERN_OPTIONS } from "@/lib/scales";
import { useT } from "@/lib/lang";

/**
 * 老师看板：凭看板链接 hash 里的 c=<收集本 id>&k=<ownerKey> 拉取全部提交。
 * 密钥放 hash（不进 URL query / 服务器日志），拉取时以 Authorization 头发送。
 */
export default function InboxPage() {
  const t = useT();
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "nokey" }
    | { kind: "error"; status: number }
    | { kind: "ok"; data: CollectionInbox }
  >({ kind: "loading" });
  const [selected, setSelected] = useState<number | null>(null);
  // 给某份提交生成「反馈卡」二维码。卡链接只带该份 #d=，绝不带看板密钥 c/k。
  const [cardFor, setCardFor] = useState<number | null>(null);

  useEffect(() => {
    const h = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(h);
    const id = (params.get("c") || "").trim();
    const key = (params.get("k") || "").trim();
    if (!id || !key) {
      setState({ kind: "nokey" });
      return;
    }
    let cancelled = false;
    fetchCollection(id, key).then((r) => {
      if (cancelled) return;
      if (r.ok) setState({ kind: "ok", data: r.data });
      else setState({ kind: "error", status: r.status });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === "loading") {
    return (
      <Container>
        <p className="card text-center text-brand-500">{t("inbox_loading")}</p>
      </Container>
    );
  }

  if (state.kind === "nokey") {
    return (
      <Container>
        <div className="card text-center">
          <h1 className="mb-3 font-serif text-2xl text-ink">{t("inbox_nokey_title")}</h1>
          <p className="mb-6 text-sm leading-relaxed text-brand-600">
            {t("inbox_nokey_desc")}
          </p>
          <Link href="/" className="btn-ghost">
            {t("inbox_home")}
          </Link>
        </div>
      </Container>
    );
  }

  if (state.kind === "error") {
    const msg =
      state.status === 401
        ? t("inbox_error_401")
        : state.status === 404
          ? t("inbox_error_404")
          : t("inbox_error_generic");
    return (
      <Container>
        <div className="card text-center">
          <h1 className="mb-3 font-serif text-2xl text-ink">{t("inbox_error_title")}</h1>
          <p className="mb-6 text-sm leading-relaxed text-brand-600">{msg}</p>
          <Link href="/" className="btn-ghost">
            {t("inbox_home")}
          </Link>
        </div>
      </Container>
    );
  }

  const { collection, responses } = state.data;

  // 查看单份
  if (selected !== null && responses[selected]) {
    const decoded = decodeRawSession(responses[selected].d);
    return (
      <Container size="lg">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="btn-ghost mb-6"
        >
          ← {t("inbox_back")}
        </button>
        {decoded ? (
          <SessionView decoded={decoded} collected />
        ) : (
          <div className="card text-center text-sm text-brand-600">
            {t("inbox_decode_fail")}
          </div>
        )}
      </Container>
    );
  }

  return (
    <Container size="lg">
      <div className="mb-6">
        <p className="mb-1 text-xs uppercase tracking-[0.2em] text-brand-400">Inbox</p>
        <h1 className="mb-2 font-serif text-2xl text-ink sm:text-3xl">
          {collection.title || t("inbox_untitled")}
        </h1>
        <p className="text-sm text-brand-600">
          {t("inbox_count_prefix")}
          <span className="font-mono font-medium text-ink">{collection.count}</span>
          {t("inbox_count_suffix")}
        </p>
      </div>

      {responses.length === 0 ? (
        <div className="card text-center text-sm text-brand-500">
          {t("inbox_empty")}
        </div>
      ) : (
        <ul className="space-y-3">
          {responses.map((resp, i) => (
            <InboxRow
              key={i}
              index={i}
              d={resp.d}
              receivedAt={resp.receivedAt}
              onOpen={() => setSelected(i)}
              onCard={() => setCardFor(i)}
            />
          ))}
        </ul>
      )}

      <p className="mt-8 border-t border-brand-200 pt-4 text-xs leading-relaxed text-brand-400">
        {t("inbox_privacy_note")}
      </p>

      {/* 反馈卡二维码：链接只含该份提交的 #d=（自包含），绝不携带看板密钥 */}
      {cardFor !== null && responses[cardFor] ? (
        <ShareDialog
          url={`${window.location.origin}/card/#d=${responses[cardFor].d}`}
          open
          onClose={() => setCardFor(null)}
          audience="card"
        />
      ) : null}
    </Container>
  );
}

function InboxRow({
  index,
  d,
  receivedAt,
  onOpen,
  onCard,
}: {
  index: number;
  d: string;
  receivedAt: string;
  onOpen: () => void;
  onCard: () => void;
}) {
  const t = useT();
  const decoded = useMemo(() => decodeRawSession(d), [d]);
  // 填写人昵称（昵称 > 微信名）：老师发反馈卡时得知道这是谁的
  const respondentName = useMemo(() => {
    const resp = decoded?.results.find((r) => r.scaleId === "salon-warmup")?.response;
    const x = resp?.textAnswers ?? {};
    const name = (x[2] ?? x[1] ?? "").trim();
    return name || null;
  }, [decoded]);
  const concernLabels = useMemo(() => {
    if (!decoded) return [];
    return decoded.payload.c
      .map((c) => CONCERN_OPTIONS.find((o) => o.value === c)?.label ?? c)
      .filter(Boolean);
  }, [decoded]);
  const hasWarnings = decoded
    ? decoded.results.some((r) => r.result.warnings.length > 0)
    : false;

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-white p-4">
      <span className="w-8 shrink-0 text-right font-mono text-sm text-brand-400">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          {respondentName ? (
            <span className="text-sm font-medium text-ink">{respondentName}</span>
          ) : null}
          <span className="text-sm text-brand-500">
            {t("inbox_received_prefix")}
            {formatDate(receivedAt)}
          </span>
          {hasWarnings ? (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700">
              {t("inbox_warning_badge")}
            </span>
          ) : null}
        </div>
        {concernLabels.length > 0 ? (
          <div className="mt-0.5 truncate text-xs text-brand-500">
            {concernLabels.join("、")}
          </div>
        ) : null}
        {!decoded ? (
          <div className="mt-0.5 text-xs text-rose-600">{t("inbox_decode_fail")}</div>
        ) : null}
      </div>
      <button type="button" onClick={onCard} className="btn-ghost shrink-0">
        {t("inbox_card_btn")}
      </button>
      <button type="button" onClick={onOpen} className="btn-ghost shrink-0">
        {t("inbox_view")}
      </button>
    </li>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}
