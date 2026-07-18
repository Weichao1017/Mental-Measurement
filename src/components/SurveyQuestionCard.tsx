"use client";

import type { LikertOption, ScaleItem } from "@/lib/types";
import { useT } from "@/lib/lang";
import { parseChildren, childRowFilled, type ChildEntry } from "@/lib/scoring";
import { SliderInput } from "./QuestionCard";

/**
 * 收集型问卷（Scale.isSurvey）的题目卡片。
 *
 * 与 QuestionCard 的分工：QuestionCard 只服务标准 Likert 量表（保持零改动）；
 * 本组件按 item.inputType 渲染四种题型：
 *  - choice：单选按钮（widget: "slider" 时用 1-10 滑杆），可带自由补充输入
 *  - multi：多选按钮
 *  - text：单行 / 多行文本
 *  - number：数字填写（带单位）
 * 选答题（item.optional）在角标处显示「选答」。
 */

interface Props {
  /** 页面上的序号（第几题） */
  position: number;
  /** 已按语言解析的题干 */
  text: string;
  /** 已按语言解析的选项（choice / multi / slider 用） */
  options: LikertOption[];
  /** 原始条目（读取 inputType / optional / multiline / placeholder / min / max / unit / freeTextLabel / widget） */
  item: ScaleItem;
  /** 单选 / 滑杆 / 数字的当前值 */
  value: number | null;
  onChange: (v: number) => void;
  /** 数字题清空 */
  onClearNumber?: () => void;
  /** 文本题 / 自由补充的当前值 */
  textValue: string;
  onTextChange: (s: string) => void;
  /** 多选题的当前值 */
  multiValue: number[];
  onMultiToggle: (v: number) => void;
  /** HTML id（供锚点滚动） */
  id?: string;
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export default function SurveyQuestionCard(props: Props) {
  const { item, value, textValue, multiValue } = props;
  const kind = item.inputType ?? "choice";
  const answered =
    kind === "text"
      ? textValue.trim() !== ""
      : kind === "children"
        ? parseChildren(textValue).some(childRowFilled)
        : kind === "multi"
          ? multiValue.length > 0
          : value !== null;

  return (
    <Shell {...props} answered={answered}>
      {kind === "text" ? (
        <TextInput {...props} />
      ) : kind === "children" ? (
        <ChildrenInput {...props} />
      ) : kind === "multi" ? (
        <MultiInput {...props} />
      ) : kind === "number" ? (
        <NumberInput {...props} />
      ) : item.widget === "slider" ? (
        <SliderInput
          position={props.position}
          text={props.text}
          options={props.options}
          value={value}
          onChange={props.onChange}
        />
      ) : (
        <ChoiceInput {...props} />
      )}

      {/* choice 题的自由补充（始终可见，选答性质，不计入完成度） */}
      {(kind === "choice" || kind === "multi") && item.freeTextLabel ? (
        <div className="mt-4">
          <label className="mb-1.5 block text-sm text-brand-600">
            {item.freeTextLabel}
          </label>
          <textarea
            value={textValue}
            onChange={(e) => props.onTextChange(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-brand-200 bg-cream/50 px-4 py-3 text-base text-ink placeholder:text-brand-300 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200"
          />
        </div>
      ) : null}
    </Shell>
  );
}

function Shell({
  id,
  position,
  text,
  item,
  answered,
  children,
}: Props & { answered: boolean; children: React.ReactNode }) {
  const t = useT();
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
          {t("q_position_prefix")}
          {position}
          {t("q_position_suffix")}
        </span>
        <span className="flex items-center gap-2 text-xs text-brand-400">
          {item.inputType === "multi" ? <span>{t("q_multi_hint")}</span> : null}
          {item.optional ? (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-brand-600">
              {t("q_optional_badge")}
            </span>
          ) : null}
        </span>
      </header>

      <h3 className="mb-5 text-lg leading-relaxed text-ink sm:text-xl">{text}</h3>

      {children}
    </section>
  );
}

function ChoiceInput({ options, value, onChange }: Props) {
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
                {selected ? (
                  <span className="block h-1.5 w-1.5 rounded-full bg-white" />
                ) : null}
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

function MultiInput({ options, multiValue, onMultiToggle }: Props) {
  return (
    <div className="space-y-2.5">
      {options.map((opt, idx) => {
        const selected = multiValue.includes(opt.value);
        const letter = LETTERS[idx] ?? String(idx + 1);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onMultiToggle(opt.value)}
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
              {/* 多选用方形勾选框，与单选圆点区分 */}
              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition",
                  selected ? "border-sage-500 bg-sage-500" : "border-brand-300 bg-white",
                ].join(" ")}
                aria-hidden
              >
                {selected ? (
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3 w-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M3 8l3 3 7-7" />
                  </svg>
                ) : null}
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

function ChildrenInput({ item, options, textValue, onTextChange }: Props) {
  const t = useT();
  const rows = parseChildren(textValue);
  // 至少显示一行，方便用户直接看到「年龄 + 性别」输入
  const display: ChildEntry[] = rows.length > 0 ? rows : [{ age: null, gender: null }];

  const commit = (next: ChildEntry[]) => {
    const hasAny = next.some((c) => c.age !== null || c.gender !== null);
    // 全空 → 存空串（走未答）；否则序列化进文本通道
    onTextChange(hasAny ? JSON.stringify(next) : "");
  };
  const setRow = (i: number, patch: Partial<ChildEntry>) =>
    commit(display.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const addRow = () => commit([...display, { age: null, gender: null }]);
  const removeRow = (i: number) => {
    const next = display.filter((_, idx) => idx !== i);
    commit(next.length ? next : [{ age: null, gender: null }]);
  };

  return (
    <div className="space-y-3">
      {display.map((c, i) => (
        <div key={i} className="rounded-xl border border-brand-200 bg-cream/40 p-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-600">
              {t("children_child_prefix")}
              {i + 1}
            </span>
            {display.length > 1 ? (
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-xs text-brand-400 transition hover:text-rose-600"
              >
                {t("children_remove")}
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                inputMode="numeric"
                value={c.age ?? ""}
                min={item.min}
                max={item.max}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") return setRow(i, { age: null });
                  const n = Number(raw);
                  if (Number.isFinite(n)) setRow(i, { age: n });
                }}
                placeholder={t("children_age_placeholder")}
                className="w-24 rounded-xl border border-brand-200 bg-white px-3 py-2 text-base text-ink placeholder:text-brand-300 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200"
              />
              {item.unit ? (
                <span className="text-sm text-brand-600">{item.unit}</span>
              ) : null}
            </div>
            <div className="flex gap-2">
              {options.map((opt) => {
                const sel = c.gender === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRow(i, { gender: sel ? null : opt.value })}
                    aria-pressed={sel}
                    className={[
                      "rounded-xl border px-4 py-2 text-base transition-all focus:outline-none focus:ring-2 focus:ring-sage-400",
                      sel
                        ? "border-sage-500 bg-sage-50 text-ink"
                        : "border-brand-200 bg-white text-brand-700 hover:border-brand-300 hover:bg-cream",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="rounded-xl border border-dashed border-sage-400 px-4 py-2.5 text-sm font-medium text-sage-700 transition hover:bg-sage-50"
      >
        ＋ {t("children_add")}
      </button>
    </div>
  );
}

function TextInput({ item, textValue, onTextChange }: Props) {
  const t = useT();
  const placeholder = item.placeholder ?? t("q_text_placeholder");
  const cls =
    "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-base text-ink placeholder:text-brand-300 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200";
  if (item.multiline) {
    return (
      <textarea
        value={textValue}
        onChange={(e) => onTextChange(e.target.value)}
        rows={4}
        placeholder={placeholder}
        className={cls}
      />
    );
  }
  return (
    <input
      type="text"
      value={textValue}
      onChange={(e) => onTextChange(e.target.value)}
      placeholder={placeholder}
      className={cls}
    />
  );
}

function NumberInput({ item, value, onChange, onClearNumber }: Props) {
  const t = useT();
  const handle = (raw: string) => {
    if (raw === "") {
      onClearNumber?.();
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    onChange(n);
  };
  const clamp = () => {
    if (value === null) return;
    let v = value;
    if (typeof item.min === "number" && v < item.min) v = item.min;
    if (typeof item.max === "number" && v > item.max) v = item.max;
    if (v !== value) onChange(v);
  };
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ""}
        min={item.min}
        max={item.max}
        onChange={(e) => handle(e.target.value)}
        onBlur={clamp}
        placeholder={item.placeholder ?? t("q_number_hint")}
        className="w-32 rounded-xl border border-brand-200 bg-white px-4 py-3 text-base text-ink placeholder:text-brand-300 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200"
      />
      {item.unit ? <span className="text-base text-brand-600">{item.unit}</span> : null}
    </div>
  );
}
