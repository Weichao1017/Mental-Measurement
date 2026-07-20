"use client";

import type { Scale, ScaleResponse } from "@/lib/types";
import { isItemAnswered, parseChildren, type ChildEntry } from "@/lib/scoring";
import { useT, useLang, pick } from "@/lib/lang";

/**
 * 收集型问卷（Scale.isSurvey）的逐题回顾卡。
 * 两处复用：
 *  - /results/：填写者提交后核对自己的回答
 *  - /therapist/：主持人通过分享链接查看回答
 * 不做任何计分 / 分级，只忠实展示原始回答。
 */

interface Props {
  scale: Scale;
  response: ScaleResponse;
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export default function SurveyAnswersCard({ scale, response }: Props) {
  const t = useT();
  const { lang } = useLang();

  // 隐藏题（如已并入别题的旧题）不展示、不计入。
  // 按 items 数组顺序展示（与填写页 ScaleRunner 一致）——因为新题为保护既有数据取了
  // 大题号(如出生地 index 19)但要显示在问卷上部，展示顺序须跟数组走、不能按 index 排。
  const items = scale.items.filter((i) => !i.hidden);
  const answeredCount = items.filter((i) => isItemAnswered(i, response)).length;

  return (
    <article className="rounded-2xl border border-brand-200 bg-white p-6 sm:p-8">
      <header className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-serif text-xl text-ink sm:text-2xl">
          {pick(scale.name, scale.nameEn, lang)}
        </h3>
        <span className="text-xs text-brand-500">
          {t("survey_answered_label")}{" "}
          <span className="font-mono tabular-nums">{answeredCount}</span> /{" "}
          {items.length} {t("survey_items_unit")}
        </span>
      </header>

      <div className="space-y-5">
        {items.map((item, idx) => {
          const answered = isItemAnswered(item, response);
          const kind = item.inputType ?? "choice";
          const extraText = response.textAnswers?.[item.index];
          return (
            <div key={item.index}>
              {item.section ? (
                <div className="mb-4 mt-7 border-b border-brand-100 pb-2 first:mt-0">
                  <h4 className="font-serif text-base text-ink">
                    {item.section.title}
                  </h4>
                </div>
              ) : null}
              <div className="flex gap-3">
                <span className="mt-0.5 w-6 shrink-0 text-right font-mono text-xs text-brand-400">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-brand-700">
                    {pick(item.text, item.textEn, lang)}
                    {item.optional ? (
                      <span className="ml-2 rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] text-brand-500">
                        {t("q_optional_badge")}
                      </span>
                    ) : null}
                  </p>
                  <div className="mt-1.5">
                    {answered ? (
                      <AnswerValue scale={scale} item={item} response={response} />
                    ) : (
                      <span className="text-sm text-brand-300">
                        {t("survey_unanswered")}
                      </span>
                    )}
                    {/* 自由补充：仅 choice/multi 题才有。
                        必须排除 children——它的数据本身就存在 textAnswers（JSON 串），
                        若不排除会把原始 JSON 当「补充」原样打印出来。 */}
                    {(kind === "choice" || kind === "multi") &&
                    typeof extraText === "string" &&
                    extraText.trim() !== "" ? (
                      <p className="mt-1.5 whitespace-pre-wrap break-words rounded-lg bg-cream/70 px-3 py-2 text-sm leading-relaxed text-ink">
                        <span className="mr-1.5 text-xs text-brand-500">
                          {t("survey_extra_note")}:
                        </span>
                        {extraText}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {scale.notes ? (
        <footer className="mt-6 border-t border-brand-100 pt-4 text-[11px] leading-relaxed text-brand-400">
          {scale.notes}
        </footer>
      ) : null}
    </article>
  );
}

function AnswerValue({
  scale,
  item,
  response,
}: {
  scale: Scale;
  item: Scale["items"][number];
  response: ScaleResponse;
}) {
  const { lang } = useLang();
  const t = useT();
  const kind = item.inputType ?? "choice";
  const options = item.options ?? scale.options;

  if (kind === "text") {
    const v = response.textAnswers?.[item.index] ?? "";
    return (
      <p className="whitespace-pre-wrap break-words rounded-lg bg-sage-50 px-3 py-2 text-sm leading-relaxed text-ink">
        {v}
      </p>
    );
  }

  if (kind === "children") {
    let rows: ChildEntry[] = parseChildren(response.textAnswers?.[item.index]);
    // 向后兼容：合并前的旧提交没有 children JSON，用旧「年龄(ageIndex)+性别(genderIndex)」
    // 合成「一个孩子」显示，保住已收集数据（不因合并题型而丢显示）。
    if (rows.length === 0 && item.childrenLegacy) {
      const { ageIndex, genderIndex } = item.childrenLegacy;
      const legacyAge = response.answers[ageIndex];
      const legacyGender =
        response.multiAnswers?.[genderIndex]?.[0] ?? response.answers[genderIndex];
      if (typeof legacyAge === "number" || typeof legacyGender === "number") {
        rows = [
          {
            age: typeof legacyAge === "number" ? legacyAge : null,
            gender: typeof legacyGender === "number" ? legacyGender : null,
          },
        ];
      }
    }
    if (rows.length === 0) {
      return <span className="text-sm text-brand-300">{t("survey_unanswered")}</span>;
    }
    return (
      <ul className="space-y-1.5">
        {rows.map((c, i) => {
          const g = options.find((o) => o.value === c.gender);
          const parts: string[] = [];
          if (typeof c.age === "number") parts.push(`${c.age}${item.unit ?? ""}`);
          if (g) parts.push(pick(g.label, g.labelEn, lang));
          return (
            <li key={i} className="text-sm font-medium text-ink">
              <span className="mr-1.5 text-sage-700">
                {t("children_child_prefix")}
                {i + 1}
              </span>
              {parts.length > 0 ? parts.join(" · ") : "—"}
            </li>
          );
        })}
      </ul>
    );
  }

  if (kind === "multi") {
    let vals = response.multiAnswers?.[item.index] ?? [];
    // 向后兼容：该题型从单选改多选之前的旧提交把答案存在 answers 里，
    // 回退成单元素数组，保证已收集的作答仍能正常显示（不因改题型而丢显示）
    if (vals.length === 0 && typeof response.answers[item.index] === "number") {
      vals = [response.answers[item.index]];
    }
    return (
      <ul className="space-y-1">
        {vals.map((v) => {
          const optIdx = options.findIndex((o) => o.value === v);
          const opt = options[optIdx];
          return (
            <li key={v} className="text-sm font-medium text-ink">
              <span className="mr-1.5 text-sage-700">
                {LETTERS[optIdx] ?? String(optIdx + 1)}
              </span>
              {opt ? pick(opt.label, opt.labelEn, lang) : String(v)}
            </li>
          );
        })}
      </ul>
    );
  }

  const raw = response.answers[item.index];

  if (kind === "number") {
    return (
      <p className="text-sm font-medium text-ink">
        <span className="font-mono">{raw}</span>
        {item.unit ? <span className="ml-1 text-brand-600">{item.unit}</span> : null}
      </p>
    );
  }

  // choice（含滑杆打分）
  const optIdx = options.findIndex((o) => o.value === raw);
  const opt = options[optIdx];
  return (
    <p className="text-sm font-medium text-ink">
      {item.widget !== "slider" ? (
        <span className="mr-1.5 text-sage-700">
          {LETTERS[optIdx] ?? String(optIdx + 1)}
        </span>
      ) : null}
      {opt ? pick(opt.label, opt.labelEn, lang) : String(raw)}
    </p>
  );
}
