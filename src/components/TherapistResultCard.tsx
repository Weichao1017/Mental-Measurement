"use client";

import { useState } from "react";
import type { ScaleResult, Scale, ScaleResponse } from "@/lib/types";

interface Props {
  scale: Scale;
  result: ScaleResult;
  response: ScaleResponse;
}

/**
 * 老师视角的量表结果卡片。
 * 跟 ResultCard 的区别：
 *  - 不显示给客户的温和措辞（clientNote），改显示 teacherNote
 *  - 可展开"答案明细"：每题题干 + 用户选项 + 是否反向
 *  - 警示题原文置顶显示，方便老师定位
 */
export default function TherapistResultCard({ scale, result, response }: Props) {
  const [open, setOpen] = useState(false);

  const itemsByIndex = new Map(scale.items.map((it) => [it.index, it]));
  const flaggedItems = scale.items.filter(
    (it) =>
      it.flags?.length &&
      typeof response.answers[it.index] === "number" &&
      response.answers[it.index] >= 2
  );

  return (
    <article className="rounded-2xl border border-brand-200 bg-white p-6 sm:p-8">
      <header className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl text-ink sm:text-2xl">
            {scale.name}
          </h3>
          <p className="mt-1 text-xs text-brand-500">
            {scale.timeFrame} · 共 {scale.items.length} 题 · 计分方式：
            {scoringMethodLabel(scale.scoringMethod)}
          </p>
        </div>
        {!scale.fullyVerified ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
            题库待核对
          </span>
        ) : null}
      </header>

      {flaggedItems.length > 0 ? (
        <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <div className="mb-1 font-medium">⚠ 警示题命中</div>
          <ul className="space-y-1.5">
            {flaggedItems.map((it) => (
              <li key={it.index}>
                <span className="font-mono text-xs text-rose-700">
                  #{it.index}
                </span>{" "}
                "{it.text}" → 答 {response.answers[it.index]}
                <span className="ml-1 text-xs text-rose-600">
                  ({it.flags?.join(", ")})
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {result.dimensions.map((d) => {
          const bandClass = bandColor(d.band?.level);
          return (
            <div
              key={d.code}
              className="rounded-lg border border-brand-100 bg-cream/40 p-4"
            >
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h4 className="text-sm font-medium text-ink">{d.name}</h4>
                <div className="font-mono text-xl tabular-nums text-ink">
                  {formatScore(d.finalScore, scale.scoringMethod)}
                </div>
              </div>
              {d.band ? (
                <div
                  className={`mb-2 inline-block rounded-full px-2 py-0.5 text-xs ${bandClass}`}
                >
                  {d.band.label}
                </div>
              ) : null}
              {d.band?.teacherNote ? (
                <p className="text-xs leading-relaxed text-brand-700">
                  {d.band.teacherNote}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-medium text-sage-700 hover:text-sage-800"
        >
          {open ? "↑ 收起答案明细" : "↓ 展开答案明细"}
        </button>

        {open ? (
          <div className="mt-3 overflow-x-auto rounded-lg border border-brand-100">
            <table className="w-full text-xs">
              <thead className="bg-brand-50">
                <tr className="text-left text-brand-600">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">维度</th>
                  <th className="px-3 py-2 font-medium">题目</th>
                  <th className="px-3 py-2 font-medium text-right">答</th>
                  <th className="px-3 py-2 font-medium text-right">原始分</th>
                </tr>
              </thead>
              <tbody>
                {[...scale.items]
                  .sort((a, b) => a.index - b.index)
                  .map((it) => {
                    const raw = response.answers[it.index];
                    const optMin = Math.min(
                      ...scale.options.map((o) => o.value)
                    );
                    const optMax = Math.max(
                      ...scale.options.map((o) => o.value)
                    );
                    const scored =
                      typeof raw === "number" && it.reverse
                        ? optMax + optMin - raw
                        : raw;
                    return (
                      <tr
                        key={it.index}
                        className="border-t border-brand-100 align-top"
                      >
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-brand-500">
                          {it.index}
                          {it.reverse ? (
                            <span className="ml-1 text-amber-600">R</span>
                          ) : null}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-brand-600">
                          {it.dimension}
                        </td>
                        <td className="px-3 py-2 text-ink">
                          {it.text}
                          {it.sourceRef ? (
                            <span className="ml-1 text-brand-400">
                              · {it.sourceRef}
                            </span>
                          ) : null}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-ink">
                          {typeof raw === "number" ? raw : "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-brand-700">
                          {typeof scored === "number" ? scored : "—"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <p className="border-t border-brand-100 bg-brand-50 px-3 py-2 text-[11px] text-brand-500">
              R = 反向计分。原始分 = 反向题翻转后的得分。维度合计依此求和或求均。
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 border-t border-brand-100 pt-4 text-[11px] leading-relaxed text-brand-400">
        引用：{scale.citation}
        {scale.notes ? <span> · 备注：{scale.notes}</span> : null}
      </div>

      {/* 隐藏字段保留：用于未来 result 字段扩展 */}
      <span className="sr-only">
        总分：{result.totalScore} · 是否完整：{result.complete ? "是" : "否"}
      </span>
      {itemsByIndex.size === 0 ? null : null}
    </article>
  );
}

function bandColor(level?: string) {
  switch (level) {
    case "normal":
    case "low":
      return "bg-sage-100 text-sage-800";
    case "mild":
    case "moderate":
      return "bg-amber-100 text-amber-800";
    case "severe":
    case "high":
    case "extremely_severe":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-brand-100 text-brand-700";
  }
}

function formatScore(score: number, method: Scale["scoringMethod"]) {
  if (method === "mean") return score.toFixed(2);
  return Math.round(score);
}

function scoringMethodLabel(method: Scale["scoringMethod"]) {
  switch (method) {
    case "sum":
      return "求和";
    case "sum_times_2":
      return "求和 ×2";
    case "sum_times_4":
      return "求和 ×4";
    case "mean":
      return "求均";
    case "custom":
      return "自定义";
  }
}
