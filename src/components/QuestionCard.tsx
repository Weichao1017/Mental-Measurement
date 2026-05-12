"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LikertOption } from "@/lib/types";
import { useT } from "@/lib/lang";

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
  /** 警示触发阈值，默认 2（DASS-21 #21）；PHQ-9 #9 设 1 更敏感 */
  flagThreshold?: number;
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
  flagThreshold,
  children,
}: Props & { children: React.ReactNode }) {
  const t = useT();
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
          {t("q_position_prefix")}{position}{t("q_position_suffix")}
        </span>
        <span className="text-xs text-brand-400">{t("q_dim_hidden")}</span>
      </header>

      {unverified ? (
        <div className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          ⚠️ 此题题目尚未从权威源核对（开发占位）
        </div>
      ) : null}

      <h3 className="mb-5 text-lg leading-relaxed text-ink sm:text-xl">{text}</h3>

      {children}

      {flagWarning && value !== null && value >= (flagThreshold ?? 2) ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-relaxed text-rose-900">
          <div className="mb-1 font-medium">{t("q_warning_title")}</div>
          <p>{t("q_warning_body")}</p>
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
  const t = useT();
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

  // 未选时 slider 显示在最左（minValue）。
  // 这跟大多数频率类量表的语义一致：「0 / 1 = 完全没有」是合理默认起点。
  // 如果默认放在 middle，对 GAD-7 等量表会让用户误以为"中度"是初始选项。
  const sliderValue = displayLocal !== null ? displayLocal : minValue;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    setLocalValue(Number(e.target.value));
  };

  const handleCommit = () => {
    // 永远 commit 当前 localValue（即使 value 没变也要 notify ScaleRunner，
    // 这样用户"单击当前 thumb 位置"也算作"选定该值"）
    if (localValue !== null) {
      onChange(localValue);
    }
  };

  // 单击 wrapper 任意位置 → thumb 跳到那 + commit。
  // 用 onClick 而非 onPointerDown：onClick 在 drag 时不触发（mousedown/mouseup
  // 位置不同的 case 浏览器不识别为 click），单击时才触发，正好分开两种交互。
  // 即使用户单击 thumb 当前位置（value 不变），handleCommit 也会 onChange，
  // 让 ScaleRunner 把该题标记为"已答" + 自动滚到下一题。
  const trackRef = useRef<HTMLDivElement>(null);
  const sliderInputRef = useRef<HTMLInputElement>(null);
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const span = maxValue - minValue;
    const v = Math.round(minValue + ratio * span);
    setHasInteracted(true);
    setLocalValue(v);
    onChange(v); // 永远 commit（即使 v === value）
    sliderInputRef.current?.focus();
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
          <span className="text-sm text-brand-400">{t("q_slider_hint")}</span>
        )}
      </div>

      {/* 滑块 + 刻度 — 整行可点击，单击任意位置 thumb 跳过去 + commit */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative cursor-pointer px-2 py-3 select-none"
      >
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
          ref={sliderInputRef}
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
