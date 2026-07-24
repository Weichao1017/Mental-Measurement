"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/lang";

interface Props {
  /** 完整分享 URL */
  url: string;
  open: boolean;
  onClose: () => void;
  /**
   * 接收方角色，决定弹窗文案：
   *  - therapist：/results 分享「含答案」的解读链接给疗愈师（默认）
   *  - host：收集型问卷把「含回答」的链接交给家庭沙龙主持人
   *  - taker：/start 把「空白邀请链接」（不含任何答案）发给来访者去作答
   *  - taker_collect：同 taker，但已开启回收——对方作答会上传到老师的收集本
   *  - card：老师把某位家长的「个人反馈卡」二维码/链接发给TA本人
   */
  audience?: "therapist" | "host" | "taker" | "taker_collect" | "card";
}

const AUDIENCE_KEYS = {
  therapist: { title: "share_title", intro: "share_intro", warning: "share_warning" },
  host: { title: "share_title_host", intro: "share_intro_host", warning: "share_warning_host" },
  taker: { title: "share_title_taker", intro: "share_intro_taker", warning: "share_warning_taker" },
  taker_collect: {
    title: "share_title_taker_collect",
    intro: "share_intro_taker_collect",
    warning: "share_warning_taker_collect",
  },
  card: {
    title: "share_title_card",
    intro: "share_intro_card",
    warning: "share_warning_card",
  },
} as const;

export default function ShareDialog({ url, open, onClose, audience = "therapist" }: Props) {
  const t = useT();
  const k = AUDIENCE_KEYS[audience];
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);

  // 懒加载 qrcode 库，避免在主 bundle 里
  useEffect(() => {
    if (!open) return;
    setQrSvg(null);
    setQrFailed(false);
    let cancelled = false;
    import("qrcode")
      .then((QRCode) =>
        QRCode.toString(url, {
          type: "svg",
          margin: 1,
          errorCorrectionLevel: "M",
          width: 280,
          color: { dark: "#1f2933", light: "#fffdf7" },
        })
      )
      .then((svg) => {
        if (!cancelled) setQrSvg(svg);
      })
      .catch(() => {
        // 常见失败：答案文本过长撑爆二维码容量。标记失败，改由 JSX 渲染中文提示
        // 并引导用户改用下方链接，不把库的英文原始报错直接抛给用户。
        if (!cancelled) setQrFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [url, open]);

  // 关闭时重置 copied 状态
  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // clipboard 可能在非 HTTPS / 旧浏览器不可用
      window.prompt(t("share_prompt_copy"), url);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-brand-500 hover:bg-brand-100"
          aria-label="关闭"
        >
          ×
        </button>

        <div className="p-6 sm:p-8">
          <h2 className="mb-2 font-serif text-xl text-ink">{t(k.title)}</h2>
          <p className="mb-6 text-sm leading-relaxed text-brand-600">
            {t(k.intro)}
          </p>

          <div className="mb-6 flex items-center justify-center rounded-xl bg-cream p-4">
            {qrFailed ? (
              <p className="py-12 text-center text-sm leading-relaxed text-rose-700">
                {t("share_qr_fail")}
              </p>
            ) : qrSvg ? (
              <div
                className="h-[280px] w-[280px]"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="flex h-[280px] w-[280px] items-center justify-center text-sm text-brand-400">
                {t("share_qr_loading")}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-brand-500">
              {t("share_url_label")}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 truncate rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 font-mono text-xs text-ink"
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg bg-sage-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sage-700"
              >
                {copied ? t("share_copied") : t("share_copy")}
              </button>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-brand-400">
            {t(k.warning)}
          </p>
        </div>
      </div>
    </div>
  );
}
