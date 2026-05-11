"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { CONCERN_OPTIONS, batteryForConcerns } from "@/lib/scales";
import { newSession } from "@/lib/store";
import type { Concern } from "@/lib/types";

export default function IntakePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Concern[]>([]);

  const toggle = (c: Concern) => {
    setSelected((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const start = () => {
    const battery = batteryForConcerns(selected);
    newSession(battery, selected);
    router.push(`/assessment/${battery[0]}/`);
  };

  const battery = batteryForConcerns(selected);

  return (
    <Container>
      <div className="animate-fade-in">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-brand-400">
          STEP 1 / 2
        </p>
        <h1 className="mb-4 font-serif text-3xl leading-tight text-ink sm:text-4xl">
          你最想了解 / 改善的是？
        </h1>
        <p className="mb-8 max-w-prose leading-relaxed text-brand-700">
          以下选项可以多选，也可以一个都不选。
          你的选择只用于决定这份评估要不要加入额外的模块——
          所有人都会做基础的四个量表。
        </p>

        <div className="mb-8 space-y-3">
          {CONCERN_OPTIONS.map((opt) => {
            const isOn = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className={[
                  "block w-full rounded-2xl border px-5 py-4 text-left transition",
                  "focus:outline-none focus:ring-2 focus:ring-sage-400 focus:ring-offset-2",
                  isOn
                    ? "border-sage-500 bg-sage-50 shadow-sm"
                    : "border-brand-200 bg-white hover:border-brand-300",
                ].join(" ")}
                aria-pressed={isOn}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={[
                      "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition",
                      isOn ? "border-sage-500 bg-sage-500" : "border-brand-300 bg-white",
                    ].join(" ")}
                  >
                    {isOn ? (
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
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-ink">{opt.label}</div>
                    <div className="mt-1 text-sm text-brand-600">{opt.description}</div>
                    <div className="mt-1 text-xs text-brand-400">{opt.triggers}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="card mb-8">
          <div className="mb-2 text-sm text-brand-500">将要完成的评估</div>
          <ul className="space-y-1 text-sm text-brand-800">
            {battery.map((id, i) => (
              <li key={id}>
                <span className="font-mono text-brand-400">{(i + 1).toString().padStart(2, "0")}</span>{" "}
                {scaleLabel(id)}
              </li>
            ))}
          </ul>
        </div>

        <button type="button" onClick={start} className="btn-primary">
          开始第一个量表 →
        </button>
      </div>
    </Container>
  );
}

function scaleLabel(id: string) {
  const map: Record<string, string> = {
    dass21: "DASS-21 抑郁焦虑压力量表",
    who5: "WHO-5 主观幸福感指数",
    ffmq15: "FFMQ-15 正念能力量表（短版）",
    "scs-sf": "SCS-SF 自我关怀量表（简版）",
    maia2: "MAIA-2 内感受觉知量表",
    "ders-sf": "DERS-SF 情绪调节困难量表（简版）",
    psqi: "PSQI 匹兹堡睡眠质量指数",
    ecr12: "ECR-12 亲密关系经验量表（短版）",
  };
  return map[id] ?? id;
}
