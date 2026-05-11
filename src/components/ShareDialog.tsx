"use client";

import { useEffect, useState } from "react";

interface Props {
  /** 完整分享 URL */
  url: string;
  open: boolean;
  onClose: () => void;
}

export default function ShareDialog({ url, open, onClose }: Props) {
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  // 懒加载 qrcode 库，避免在主 bundle 里
  useEffect(() => {
    if (!open) return;
    setQrSvg(null);
    setQrError(null);
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
      .catch((err: unknown) => {
        if (!cancelled) {
          setQrError(err instanceof Error ? err.message : "二维码生成失败");
        }
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
      window.prompt("复制下面这段链接给老师：", url);
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
          <h2 className="mb-2 font-serif text-xl text-ink">给老师看的链接</h2>
          <p className="mb-6 text-sm leading-relaxed text-brand-600">
            把下面的二维码或链接交给老师，老师在浏览器打开后可以看到完整的解读视图。
            数据完全包含在链接里，没有上传到任何服务器。
          </p>

          <div className="mb-6 flex items-center justify-center rounded-xl bg-cream p-4">
            {qrError ? (
              <p className="py-12 text-sm text-rose-700">{qrError}</p>
            ) : qrSvg ? (
              <div
                className="h-[280px] w-[280px]"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="flex h-[280px] w-[280px] items-center justify-center text-sm text-brand-400">
                正在生成二维码…
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-brand-500">
              链接
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
                {copied ? "已复制" : "复制"}
              </button>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-brand-400">
            提示：链接包含本次评估的全部答案，请只发给信任的疗愈师 / 心理工作者。
            链接较长属正常现象，二维码扫描更方便。
          </p>
        </div>
      </div>
    </div>
  );
}
