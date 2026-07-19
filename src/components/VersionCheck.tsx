"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/lang";

// 构建时内联的版本号（git 短 sha）。next.config.mjs 注入；取不到则为空。
const BUILD = process.env.NEXT_PUBLIC_BUILD_VERSION ?? "";

/**
 * 「有新版·点此刷新」提示条。
 *
 * 机制：客户端每隔一段时间（+ 标签页重新可见时）拉取线上 /version.json，与本次构建
 * 内联的 BUILD 版本比对，不同 = 已有新部署 → 顶部弹提示，用户点一下刷新即拿最新。
 *
 * 生产安全（绝不消极影响）：
 *  - 无 BUILD（dev / 非 git 构建）→ 完全禁用，不发任何请求。
 *  - /version.json 拉取或解析失败 → 静默忽略，不报错、不打扰。
 *  - 只读文件，绝不动 localStorage 作答；提示条可关闭、非阻断。
 *  - 关闭后**记住已关闭的版本**：同一版本不再弹回来（避免每 90s/切回标签页反复遮挡
 *    正在作答的问卷）；仅当又有更新的部署时才会再次提示。
 */
export default function VersionCheck() {
  const t = useT();
  const [stale, setStale] = useState(false);
  const detectedRef = useRef<string>(""); // 当前检测到的线上新版本
  const dismissedRef = useRef<string>(""); // 用户已关闭过的版本

  useEffect(() => {
    if (!BUILD) return; // fail-safe：没有构建版本号就彻底不启用
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch("/version.json", { cache: "no-store" });
        if (!res.ok) return;
        const j = await res.json();
        const v = typeof j?.v === "string" ? j.v : "";
        // 有新版 且 不是用户已关闭过的那个版本，才弹
        if (!cancelled && v && v !== BUILD && v !== dismissedRef.current) {
          detectedRef.current = v;
          setStale(true);
        }
      } catch {
        // 网络/解析失败一律静默，绝不打扰用户
      }
    };

    check();
    const id = window.setInterval(check, 90_000);
    const onVis = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  if (!stale) return null;

  const dismiss = () => {
    // 记住这个版本已被关闭：check() 之后不再为同一版本弹回
    dismissedRef.current = detectedRef.current;
    setStale(false);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-3 bg-sage-600 px-4 py-2 text-center text-sm text-white shadow-md">
      <span>{t("update_available")}</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="shrink-0 rounded-full bg-white/20 px-3 py-1 font-medium transition hover:bg-white/30"
      >
        {t("update_refresh")}
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("update_dismiss")}
        className="shrink-0 text-lg leading-none text-white/70 transition hover:text-white"
      >
        ×
      </button>
    </div>
  );
}
