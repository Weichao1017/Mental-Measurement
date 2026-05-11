"use client";

import { useRouter } from "next/navigation";
import { advanceToNext, loadSession } from "@/lib/store";

interface Props {
  scaleName: string;
  scaleId: string;
}

/**
 * 当某个量表的题目数据还没填好时（如 PSQI 需要专用 UI），
 * 这个占位页让用户知道开发中，并允许跳过继续下一个量表。
 */
export default function SkipScalePlaceholder({ scaleName, scaleId }: Props) {
  const router = useRouter();

  const skip = () => {
    const session = advanceToNext();
    if (session && session.currentIndex < session.battery.length) {
      router.push(`/assessment/${session.battery[session.currentIndex]}/`);
    } else {
      router.push("/results/");
    }
  };

  return (
    <div className="card">
      <h2 className="mb-3 font-serif text-2xl text-ink">{scaleName}</h2>
      <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        ⚠️ 这个量表（{scaleId}）使用了较复杂的题型（如时长输入、频率单选等），
        专用作答界面正在开发中，暂时无法在线作答。
      </div>
      <p className="mb-6 text-sm leading-relaxed text-brand-700">
        请你的疗愈老师在线下用纸质版与你一起完成这一量表。
        目前你可以先跳过这一项，继续完成其他量表。
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={skip}>
          跳过这个量表，继续 →
        </button>
        <a href="/results/" className="btn-ghost">
          直接查看已完成的结果
        </a>
      </div>
    </div>
  );
}
