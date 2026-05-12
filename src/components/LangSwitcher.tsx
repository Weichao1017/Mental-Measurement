"use client";

import { useLang } from "@/lib/lang";

/**
 * 顶部全局语言切换器。中文 / EN 两个按钮，当前语言高亮。
 */
export default function LangSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="fixed right-3 top-3 z-40 flex items-center gap-0.5 rounded-full border border-brand-200 bg-cream/90 p-0.5 shadow-sm backdrop-blur sm:right-5 sm:top-5">
      <button
        type="button"
        onClick={() => setLang("zh")}
        className={[
          "rounded-full px-3 py-1 text-xs font-medium transition",
          lang === "zh"
            ? "bg-sage-600 text-white"
            : "text-brand-600 hover:bg-brand-100",
        ].join(" ")}
        aria-pressed={lang === "zh"}
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={[
          "rounded-full px-3 py-1 text-xs font-medium transition",
          lang === "en"
            ? "bg-sage-600 text-white"
            : "text-brand-600 hover:bg-brand-100",
        ].join(" ")}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
