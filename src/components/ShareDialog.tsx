"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/lang";

interface Props {
  /** 完整分享 URL */
  url: string;
  open: boolean;
  onClose: () => void;
  /** 接收方语气：默认给疗愈师看；收集型问卷给家庭沙龙主持人看 */
  audience?: "therapist" | "host";
}

export default function ShareDialog({ url, open, onClose, audience = "therapist" }: Props) {
  const t = useT();
  const isHost = audience === "host";
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
          <h2 className="mb-2 font-serif text-xl text-ink">
            {t(isHost ? "share_title_host" : "share_title")}
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-brand-600">
            {t(isHost ? "share_intro_host" : "share_intro")}
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
            {t(isHost ? "share_warning_host" : "share_warning")}
          </p>
        </div>
      </div>
    </div>
  );
}
