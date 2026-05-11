"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import { SCALES } from "@/lib/scales";
import { newSession } from "@/lib/store";

/**
 * 测评题库：列出所有量表，用户可直接选择某个量表单独做完。
 * 跳过 intake 主诉勾选流程，新建一个只包含该量表的 session。
 */
export default function LibraryPage() {
  const router = useRouter();

  const startSingle = (scaleId: string) => {
    newSession([scaleId], []);
    router.push(`/assessment/${scaleId}/`);
  };

  // 按"可用 + 核心优先"排序
  const ordered = Object.values(SCALES).sort((a, b) => {
    const aReady = a.items.length > 0 ? 0 : 1;
    const bReady = b.items.length > 0 ? 0 : 1;
    if (aReady !== bReady) return aReady - bReady;
    if (a.isCore !== b.isCore) return a.isCore ? -1 : 1;
    return a.items.length - b.items.length;
  });

  return (
    <Container size="lg">
      <div className="animate-fade-in">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-brand-400">
          Library
        </p>
        <h1 className="mb-4 font-serif text-3xl leading-tight text-ink sm:text-4xl">
          测评题库
        </h1>
        <p className="mb-8 max-w-prose leading-relaxed text-brand-700">
          这里是本站集成的全部心理量表。
          你可以单独做某一个，看完结果就回家——不需要走完整流程。
          如果你想做完整评估，回到{" "}
          <Link href="/" className="text-sage-700 underline">
            首页
          </Link>{" "}
          点"开始评估"。
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {ordered.map((s) => {
            const stub = s.items.length === 0;
            const verifyBadge =
              !s.fullyVerified && !stub ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
                  题库待核对
                </span>
              ) : null;
            const stubBadge = stub ? (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] text-brand-600">
                开发中
              </span>
            ) : null;
            const coreBadge = s.isCore ? (
              <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[11px] text-sage-800">
                核心
              </span>
            ) : null;

            return (
              <article
                key={s.id}
                className="flex flex-col rounded-2xl border border-brand-200 bg-white p-5 shadow-sm transition hover:border-sage-300 hover:shadow"
              >
                <header className="mb-3 flex flex-wrap items-baseline gap-2">
                  <h2 className="font-serif text-lg text-ink">{s.name}</h2>
                  {coreBadge}
                  {verifyBadge}
                  {stubBadge}
                </header>
                <p className="mb-3 flex-1 text-sm leading-relaxed text-brand-700">
                  {s.description}
                </p>
                <dl className="mb-4 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-brand-500">
                  <div>
                    <dt className="inline">时间窗口：</dt>
                    <dd className="inline text-brand-700">{s.timeFrame}</dd>
                  </div>
                  <div>
                    <dt className="inline">题数：</dt>
                    <dd className="inline text-brand-700">
                      {s.items.length || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline">预计：</dt>
                    <dd className="inline text-brand-700">
                      ~{s.estimatedMinutes} 分钟
                    </dd>
                  </div>
                  <div>
                    <dt className="inline">方向：</dt>
                    <dd className="inline text-brand-700">
                      {s.highIsBetter ? "高分=能力强" : "高分=症状/困扰"}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => startSingle(s.id)}
                  disabled={stub}
                  className={
                    stub
                      ? "rounded-full border border-brand-200 bg-brand-50 px-5 py-2 text-sm text-brand-400"
                      : "rounded-full bg-sage-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-sage-700"
                  }
                >
                  {stub ? "暂未开放" : "做这个量表 →"}
                </button>
              </article>
            );
          })}
        </div>

        <footer className="mt-12 border-t border-brand-200 pt-6 text-xs leading-relaxed text-brand-400">
          所有量表均来自国际公开发表、被研究反复验证的心理评估工具。每个量表卡片的"题库待核对"标签表示中文题目内容由 AI 翻译，尚未与权威中文修订版逐字对齐，仅供研究和自我了解参考。
        </footer>
      </div>
    </Container>
  );
}
