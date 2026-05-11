"use client";

import { useEffect, useMemo, useState } from "react";
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

/**
 * UI 模式选择：
 *  - options.length <= 4：按钮（A/B/C/D 字母明确，4 档不易混淆）
 *  - options.length >= 5：滑块（避免「偶尔/有时」中文歧义，连续光谱更直观）
 */
function shouldUseSlider(options: LikertOption[]) {
  return options.length >= 5;
}

export default function QuestionCard(props: Props) {
  const useSlider = shouldUseSlider(props.options);
  return (
    <Shell {...props}>
      {useSlider ? <SliderInput {...props} /> : <ButtonsInput {...props} />}
    </Shell>
  );
}

function Shell({
  id,
  position,
  text,
  value,
  unverified,
  flagWarning,
  children,
}: Props & { children: React.ReactNode }) {
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

      {children}

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

function ButtonsInput({ options, value, onChange }: Props) {
  return (
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
  );
}

function SliderInput({ options, value, onChange }: Props) {
  // 按分数升序排列：左 = 低分，右 = 高分
  const sorted = useMemo(
    () => [...options].sort((a, b) => a.value - b.value),
    [options]
  );
  const minValue = sorted[0].value;
  const maxValue = sorted[sorted.length - 1].value;
  const n = sorted.length;

  // 本地拖动 state：拖动时 thumb 实时跟手，但不立即 commit 到 props.onChange
  // （否则拖动过程中 ScaleRunner 会把中间值当作答案 + 自动滚走）
  // 用户松手 / 离开 thumb 时才真正 commit。
  const [hasInteracted, setHasInteracted] = useState(value !== null);
  const [localValue, setLocalValue] = useState<number | null>(value);

  // 外部 value 变化（如 localStorage 恢复、用户回退修改）时同步本地状态
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const displayLocal = localValue !== null ? localValue : null;
  const currentOption =
    displayLocal !== null
      ? sorted.find((o) => o.value === displayLocal)
      : null;

  const sliderValue =
    displayLocal !== null ? displayLocal : Math.round((minValue + maxValue) / 2);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    setLocalValue(Number(e.target.value));
  };

  const handleCommit = () => {
    if (localValue !== null && localValue !== value) {
      onChange(localValue);
    }
  };

  const leftLabel = sorted[0].short ?? sorted[0].label;
  const rightLabel = sorted[n - 1].short ?? sorted[n - 1].label;

  return (
    <div>
      {/* 拖动提示 / 当前选项标签 */}
      <div className="mb-3 flex h-7 items-center justify-center">
        {currentOption ? (
          <span className="rounded-full bg-sage-100 px-3 py-1 text-sm font-medium text-sage-800">
            {currentOption.label}
          </span>
        ) : (
          <span className="text-sm text-brand-400">拖动滑块选择程度</span>
        )}
      </div>

      {/* 滑块 + 刻度 */}
      <div className="relative px-2 pb-1">
        {/* 中间刻度点 */}
        <div className="pointer-events-none absolute left-2 right-2 top-1/2 flex -translate-y-1/2 items-center justify-between">
          {sorted.map((opt, i) => (
            <span
              key={opt.value}
              className={[
                "h-2 w-2 rounded-full transition",
                displayLocal !== null && displayLocal >= opt.value
                  ? "bg-sage-400"
                  : "bg-brand-200",
                i === 0 || i === n - 1 ? "h-2.5 w-2.5" : "",
              ].join(" ")}
            />
          ))}
        </div>

        <input
          type="range"
          min={minValue}
          max={maxValue}
          step={1}
          value={sliderValue}
          onChange={handleInput}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          onKeyUp={handleCommit}
          onBlur={handleCommit}
          aria-label="选择程度"
          className={[
            "relative w-full appearance-none bg-transparent",
            "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full",
            hasInteracted
              ? "[&::-webkit-slider-runnable-track]:bg-sage-200"
              : "[&::-webkit-slider-runnable-track]:bg-brand-200",
            "[&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full",
            hasInteracted
              ? "[&::-moz-range-track]:bg-sage-200"
              : "[&::-moz-range-track]:bg-brand-200",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:-mt-3 [&::-webkit-slider-thumb]:cursor-pointer",
            hasInteracted
              ? "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sage-500"
              : "[&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-brand-300 [&::-webkit-slider-thumb]:opacity-70",
            "[&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer",
            hasInteracted
              ? "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-sage-500"
              : "[&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-brand-300",
          ].join(" ")}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-brand-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
