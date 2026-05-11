"use client";

import type { LikertOption } from "@/lib/types";

interface Props {
  /** 题目编号 */
  position: number;
  /** 题目正文 */
  text: string;
  /** Likert 选项 */
  options: LikertOption[];
  /** 当前选中的 value（null 表示未选） */
  value: number | null;
  /** 选择回调 */
  onChange: (v: number) => void;
  /** 是否显示未核对警告 */
  unverified?: boolean;
  /** 警示题标识（如自杀意念） */
  flagWarning?: boolean;
  /** HTML id（供锚点滚动） */
  id?: string;
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export default function QuestionCard({
  position,
  text,
  options,
  value,
  onChange,
  unverified,
  flagWarning,
  id,
}: Props) {
  const answered = value !== null;
  return (
    <section
      id={id}
      className={[
        "rounded-2xl border bg-white p-5 transition-colors sm:p-7",
        answered ? "border-sage-200 shadow-sm" : "border-brand-200",
      ].join(" ")}
    >
      <header className="mb-4 flex items-center justify-between">
        <span
          className={[
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
            answered ? "bg-sage-100 text-sage-800" : "bg-brand-100 text-brand-700",
          ].join(" ")}
        >
          第 {position} 题
        </span>
        <span className="text-xs text-brand-400">维度已隐藏</span>
      </header>

      {unverified ? (
        <div className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          ⚠️ 此题题目尚未从权威源核对（开发占位）
        </div>
      ) : null}

      <h3 className="mb-5 text-lg leading-relaxed text-ink sm:text-xl">{text}</h3>

      <div className="space-y-2.5">
        {options.map((opt, idx) => {
          const selected = value === opt.value;
          const letter = LETTERS[idx] ?? String(idx + 1);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                "block w-full rounded-xl border px-4 py-3.5 text-left transition-all",
                "focus:outline-none focus:ring-2 focus:ring-sage-400 focus:ring-offset-1",
                selected
                  ? "border-sage-500 bg-sage-50"
                  : "border-brand-200 bg-white hover:border-brand-300 hover:bg-cream",
              ].join(" ")}
              aria-pressed={selected}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={[
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                    selected ? "border-sage-500 bg-sage-500" : "border-brand-300 bg-white",
                  ].join(" ")}
                  aria-hidden
                >
                  {selected ? <span className="block h-1.5 w-1.5 rounded-full bg-white" /> : null}
                </span>
                <span className="w-5 font-medium text-brand-500">{letter}</span>
                <span className="flex-1 text-base text-ink">{opt.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {flagWarning && value !== null && value >= 2 ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-relaxed text-rose-900">
          <div className="mb-1 font-medium">我们注意到您选择的程度较高</div>
          <p>
            如果您正在经历持续的低落或对生活感到无望，这些感受是值得被认真对待的。
            您可以在结果页找到一些可以拨打的支持热线，也欢迎您向身边信任的人或专业人员寻求支持。
          </p>
        </div>
      ) : null}
    </section>
  );
}
