"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Scale, ScaleResponse } from "@/lib/types";
import { loadSession, saveResponse, advanceToNext } from "@/lib/store";
import { isItemAnswered } from "@/lib/scoring";
import { useT, useLang, pick } from "@/lib/lang";
import QuestionCard from "./QuestionCard";
import SurveyQuestionCard from "./SurveyQuestionCard";

interface Props {
  scale: Scale;
}

export default function ScaleRunner({ scale }: Props) {
  const router = useRouter();
  const t = useT();
  const { lang } = useLang();
  const scaleName = pick(scale.name, scale.nameEn, lang);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [texts, setTexts] = useState<Record<number, string>>({});
  const [multis, setMultis] = useState<Record<number, number[]>>({});
  const [mounted, setMounted] = useState(false);

  // 恢复之前的答案
  useEffect(() => {
    const session = loadSession();
    if (session?.responses[scale.id]) {
      setAnswers(session.responses[scale.id].answers ?? {});
      setTexts(session.responses[scale.id].textAnswers ?? {});
      setMultis(session.responses[scale.id].multiAnswers ?? {});
    }
    setMounted(true);
  }, [scale.id]);

  const buildResponse = (completedAt?: string): ScaleResponse => {
    const resp: ScaleResponse = { scaleId: scale.id, answers };
    if (Object.keys(texts).length > 0) resp.textAnswers = texts;
    if (Object.keys(multis).length > 0) resp.multiAnswers = multis;
    if (completedAt) resp.completedAt = completedAt;
    return resp;
  };

  // 每次答题变化，自动落盘到 localStorage（避免刷新丢失）
  useEffect(() => {
    if (!mounted) return;
    const resp: ScaleResponse = { scaleId: scale.id, answers };
    if (Object.keys(texts).length > 0) resp.textAnswers = texts;
    if (Object.keys(multis).length > 0) resp.multiAnswers = multis;
    saveResponse(scale.id, resp);
  }, [answers, texts, multis, mounted, scale.id]);

  const items = scale.items;
  // 完成度只看必答题（标准量表没有 optional，等同全部题目）
  const requiredItems = useMemo(() => items.filter((i) => !i.optional), [items]);
  const currentResponse = useMemo<ScaleResponse>(
    () => ({ scaleId: scale.id, answers, textAnswers: texts, multiAnswers: multis }),
    [scale.id, answers, texts, multis]
  );
  const total = requiredItems.length;
  const answered = useMemo(
    () => requiredItems.filter((i) => isItemAnswered(i, currentResponse)).length,
    [requiredItems, currentResponse]
  );
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  const allDone = answered === total && total > 0;

  const handleAnswer = (itemIndex: number, value: number) => {
    setAnswers((prev) => {
      const isNewAnswer = typeof prev[itemIndex] !== "number";
      const next = { ...prev, [itemIndex]: value };
      // 只有"首次回答这道题"时才自动滚到下一道未答题
      // 用户回头修改已选答案时不打扰
      if (isNewAnswer) {
        requestAnimationFrame(() => {
          const merged: ScaleResponse = {
            scaleId: scale.id,
            answers: next,
            textAnswers: texts,
            multiAnswers: multis,
          };
          const nextUnanswered = items.find((it) => !isItemAnswered(it, merged));
          if (nextUnanswered) {
            const el = document.getElementById(`q-${nextUnanswered.index}`);
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY - 100;
              window.scrollTo({ top, behavior: "smooth" });
            }
          }
        });
      }
      return next;
    });
  };

  // 数字题：清空输入框时移除答案
  const handleClearNumber = (itemIndex: number) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[itemIndex];
      return next;
    });
  };

  // 文本题 / 自由补充：空串时移除，避免把空答案算作已答
  const handleText = (itemIndex: number, s: string) => {
    setTexts((prev) => {
      const next = { ...prev };
      if (s === "") delete next[itemIndex];
      else next[itemIndex] = s;
      return next;
    });
  };

  // 多选题：点选切换
  const handleMultiToggle = (itemIndex: number, v: number) => {
    setMultis((prev) => {
      const cur = prev[itemIndex] ?? [];
      const nextVals = cur.includes(v)
        ? cur.filter((x) => x !== v)
        : [...cur, v].sort((a, b) => a - b);
      const next = { ...prev };
      if (nextVals.length > 0) next[itemIndex] = nextVals;
      else delete next[itemIndex];
      return next;
    });
  };

  const handleSubmit = () => {
    const resp = buildResponse(new Date().toISOString());
    saveResponse(scale.id, resp);
    const session = advanceToNext();
    if (session && session.currentIndex < session.battery.length) {
      const nextScaleSlug = session.battery[session.currentIndex];
      window.scrollTo({ top: 0, behavior: "instant" });
      router.push(`/assessment/${nextScaleSlug}/`);
    } else {
      router.push("/results/");
    }
  };

  const scrollToFirstUnanswered = () => {
    // 跳到第一道未答的"必答题"（挡住提交的就是它们）
    const firstUn = requiredItems.find((it) => !isItemAnswered(it, currentResponse));
    if (!firstUn) return;
    const el = document.getElementById(`q-${firstUn.index}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <>
      {/* 顶部 sticky 进度条 */}
      <div className="sticky top-0 z-20 -mx-5 mb-6 border-b border-brand-100 bg-cream/90 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-1.5 flex items-baseline justify-between text-xs">
            <span className="font-medium text-brand-700">{scaleName}</span>
            <span className="font-mono tabular-nums text-brand-500">
              {answered} / {total}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full bg-sage-500 transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 量表指导语 */}
      <div className="mb-6 rounded-xl bg-brand-50 p-5 text-sm leading-relaxed text-brand-700">
        <div className="mb-1 font-medium text-ink">{scaleName}</div>
        <p>{pick(scale.instructions, scale.instructionsEn, lang)}</p>
        <p className="mt-2 text-xs text-brand-500">
          {t("runner_timeframe_prefix")}
          {pick(scale.timeFrame, scale.timeFrameEn, lang)}
        </p>
      </div>

      {/* 所有题目按顺序渲染 */}
      <div className="space-y-4">
        {items.map((item, idx) => {
          const itemText = pick(item.text, item.textEn, lang);
          const itemOptions = (item.options ?? scale.options).map((opt) => ({
            ...opt,
            label: pick(opt.label, opt.labelEn, lang),
            short: opt.short ? pick(opt.short, opt.shortEn, lang) : undefined,
          }));
          if (!scale.isSurvey) {
            return (
              <QuestionCard
                key={item.index}
                id={`q-${item.index}`}
                position={idx + 1}
                text={itemText}
                options={itemOptions}
                value={answers[item.index] ?? null}
                onChange={(v) => handleAnswer(item.index, v)}
                unverified={item.unverified}
                flagWarning={item.flags?.includes("suicidal_ideation")}
                flagThreshold={item.flagThreshold}
              />
            );
          }
          // 收集型问卷：分节标题 + 多题型卡片
          return (
            <div key={item.index}>
              {item.section ? (
                <div className="mb-4 mt-10 border-b border-brand-200 pb-3 first:mt-0">
                  <h2 className="font-serif text-xl text-ink">{item.section.title}</h2>
                  {item.section.note ? (
                    <p className="mt-1.5 text-sm leading-relaxed text-brand-600">
                      {item.section.note}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <SurveyQuestionCard
                id={`q-${item.index}`}
                position={idx + 1}
                text={itemText}
                options={itemOptions}
                item={item}
                value={answers[item.index] ?? null}
                onChange={(v) => handleAnswer(item.index, v)}
                onClearNumber={() => handleClearNumber(item.index)}
                textValue={texts[item.index] ?? ""}
                onTextChange={(s) => handleText(item.index, s)}
                multiValue={multis[item.index] ?? []}
                onMultiToggle={(v) => handleMultiToggle(item.index, v)}
              />
            </div>
          );
        })}
      </div>

      {/* 底部提交区 */}
      <div className="mt-10 rounded-2xl border border-brand-200 bg-white p-6 text-center">
        {allDone ? (
          <>
            <p className="mb-4 text-brand-700">{t("runner_completed_all")}</p>
            <button type="button" className="btn-primary" onClick={handleSubmit}>
              {t("runner_submit_continue")}
            </button>
          </>
        ) : (
          <>
            <p className="mb-1 text-brand-700">
              {t("runner_remaining_prefix")}
              <span className="font-mono font-medium">{total - answered}</span>
              {t("runner_remaining_mid")}
            </p>
            <p className="mb-4 text-xs text-brand-500">
              {scale.isSurvey
                ? t("runner_remaining_note_survey")
                : t("runner_remaining_note")}
            </p>
            <button
              type="button"
              className="btn-ghost"
              onClick={scrollToFirstUnanswered}
            >
              {t("runner_jump_unanswered")}
            </button>
          </>
        )}
      </div>
    </>
  );
}
