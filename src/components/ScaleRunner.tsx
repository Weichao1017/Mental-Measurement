"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Scale, ScaleResponse } from "@/lib/types";
import { loadSession, saveResponse, advanceToNext } from "@/lib/store";
import QuestionCard from "./QuestionCard";

interface Props {
  scale: Scale;
}

export default function ScaleRunner({ scale }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [mounted, setMounted] = useState(false);

  // 恢复之前的答案
  useEffect(() => {
    const session = loadSession();
    if (session?.responses[scale.id]) {
      setAnswers(session.responses[scale.id].answers ?? {});
    }
    setMounted(true);
  }, [scale.id]);

  // 每次答题变化，自动落盘到 localStorage（避免刷新丢失）
  useEffect(() => {
    if (!mounted) return;
    const resp: ScaleResponse = {
      scaleId: scale.id,
      answers,
    };
    saveResponse(scale.id, resp);
  }, [answers, mounted, scale.id]);

  const items = scale.items;
  const total = items.length;
  const answered = useMemo(
    () => items.filter((i) => typeof answers[i.index] === "number").length,
    [items, answers]
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
          const nextUnanswered = items.find(
            (it) => typeof next[it.index] !== "number"
          );
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

  const handleSubmit = () => {
    const resp: ScaleResponse = {
      scaleId: scale.id,
      answers,
      completedAt: new Date().toISOString(),
    };
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
    const firstUn = items.find((it) => typeof answers[it.index] !== "number");
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
            <span className="font-medium text-brand-700">{scale.name}</span>
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
        <div className="mb-1 font-medium text-ink">{scale.name}</div>
        <p>{scale.instructions}</p>
        <p className="mt-2 text-xs text-brand-500">时间窗口：{scale.timeFrame}</p>
      </div>

      {/* 所有题目按顺序渲染 */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <QuestionCard
            key={item.index}
            id={`q-${item.index}`}
            position={idx + 1}
            text={item.text}
            options={item.options ?? scale.options}
            value={answers[item.index] ?? null}
            onChange={(v) => handleAnswer(item.index, v)}
            unverified={item.unverified}
            flagWarning={item.flags?.includes("suicidal_ideation")}
            flagThreshold={item.flagThreshold}
          />
        ))}
      </div>

      {/* 底部提交区 */}
      <div className="mt-10 rounded-2xl border border-brand-200 bg-white p-6 text-center">
        {allDone ? (
          <>
            <p className="mb-4 text-brand-700">已完成本量表全部题目。</p>
            <button type="button" className="btn-primary" onClick={handleSubmit}>
              提交并继续 →
            </button>
          </>
        ) : (
          <>
            <p className="mb-1 text-brand-700">
              还有 <span className="font-mono font-medium">{total - answered}</span> 道题没答
            </p>
            <p className="mb-4 text-xs text-brand-500">所有题目答完才能进入下一个量表</p>
            <button type="button" className="btn-ghost" onClick={scrollToFirstUnanswered}>
              跳到下一道未答的题
            </button>
          </>
        )}
      </div>
    </>
  );
}
