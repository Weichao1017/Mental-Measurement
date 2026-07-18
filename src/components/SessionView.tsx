"use client";

import { useMemo } from "react";
import TherapistResultCard from "@/components/TherapistResultCard";
import SurveyAnswersCard from "@/components/SurveyAnswersCard";
import { getScale, CONCERN_OPTIONS } from "@/lib/scales";
import type { DecodedSession } from "@/lib/decodeSession";

/**
 * 单份评估/问卷的完整解读视图。
 * 从 therapist 页抽出以便 /inbox 看板复用（点开一份提交时渲染同一视图）。
 *
 * @param collected 该份数据是否来自后端收集本（决定底部「数据保密」措辞：
 *                  hash 分享=未过服务器；收集本=已上传由发起人保管）。
 */
export default function SessionView({
  decoded,
  collected = false,
}: {
  decoded: DecodedSession;
  collected?: boolean;
}) {
  const { payload, results } = decoded;
  const completedAt = useMemo(() => formatDate(payload.t), [payload.t]);

  const concernLabels = useMemo(() => {
    return payload.c
      .map((c) => CONCERN_OPTIONS.find((o) => o.value === c)?.label ?? c)
      .filter(Boolean);
  }, [payload.c]);

  const anyWarnings = results.some((r) => r.result.warnings.length > 0);
  const incompleteScales = results.filter((r) => !r.result.complete);

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-brand-200 bg-white p-6 sm:p-8">
        <p className="mb-1 text-xs uppercase tracking-[0.2em] text-brand-400">
          Therapist View
        </p>
        <h1 className="mb-3 font-serif text-2xl text-ink sm:text-3xl">
          客户评估解读
        </h1>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-brand-500">评估时间</dt>
            <dd className="text-ink">{completedAt}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-brand-500">量表数</dt>
            <dd className="text-ink">{results.length}</dd>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <dt className="w-20 shrink-0 text-brand-500">主诉</dt>
            <dd className="text-ink">
              {concernLabels.length > 0 ? (
                <ul className="space-y-0.5">
                  {concernLabels.map((c, i) => (
                    <li key={i}>· {c}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-brand-400">未勾选</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {anyWarnings ? (
        <div className="mb-6 rounded-2xl border-2 border-rose-300 bg-rose-50 p-6">
          <h2 className="mb-2 font-serif text-lg text-rose-900">⚠ 临床警示信号</h2>
          <p className="mb-3 text-sm leading-relaxed text-rose-800">
            客户在以下条目上选择了较高程度，建议在会谈中主动评估自杀风险 / 自伤意念，
            并视情况引导转介或启动危机干预流程：
          </p>
          <ul className="space-y-2 text-sm text-rose-900">
            {results.flatMap((r) =>
              r.result.warnings.map((w, wi) => (
                <li key={`${r.scaleId}-${wi}`} className="border-l-2 border-rose-400 pl-3">
                  <div className="font-medium">
                    {r.result.scaleName} 第 {w.itemIndex} 题
                  </div>
                  <div className="text-rose-800">&quot;{w.itemText}&quot;</div>
                  <div className="text-xs text-rose-700">
                    答 {w.answer} · 标签：{w.flag}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {incompleteScales.length > 0 ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          注意：以下量表未完整作答，结果仅供参考：
          {incompleteScales.map((r) => r.result.scaleName).join("、")}
        </div>
      ) : null}

      <div className="space-y-5">
        {results.map(({ scaleId, result, response }) => {
          const scale = getScale(scaleId)!;
          // 收集型问卷：不计分，展示逐题原始回答
          if (scale.isSurvey) {
            return (
              <SurveyAnswersCard key={scaleId} scale={scale} response={response} />
            );
          }
          return (
            <TherapistResultCard
              key={scaleId}
              scale={scale}
              result={result}
              response={response}
            />
          );
        })}
      </div>

      <footer className="mt-12 border-t border-brand-200 pt-6 text-xs leading-relaxed text-brand-500">
        <p className="mb-2">
          <strong>解读注意：</strong>
          本平台提供的量表分级阈值参考国际公开发表的常模；
          中国本土常模在某些量表上略有差异，请结合临床访谈和客户实际情况综合判断。
        </p>
        <p>
          <strong>数据保密：</strong>
          {collected
            ? "本份作答由填写者通过「收集」链接提交，保存在你的收集本中，仅持有看板密钥者可见。请按机构规范妥善保管，勿转发密钥链接。"
            : "所有答案数据均通过 URL hash 传递，未经服务器存储。若需保留客户档案，请自行截图或导出 PDF 保存到机构内部系统。"}
        </p>
      </footer>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}
