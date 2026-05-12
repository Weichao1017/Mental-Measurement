"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { CONCERN_OPTIONS, batteryForConcerns, getScale } from "@/lib/scales";
import { newSession } from "@/lib/store";
import { useT, useLang, pick } from "@/lib/lang";
import type { Concern } from "@/lib/types";

export default function IntakePage() {
  const router = useRouter();
  const t = useT();
  const { lang } = useLang();
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
          {t("intake_step")}
        </p>
        <h1 className="mb-4 font-serif text-3xl leading-tight text-ink sm:text-4xl">
          {t("intake_title")}
        </h1>
        <p className="mb-8 max-w-prose leading-relaxed text-brand-700">
          {t("intake_subtitle")}
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
                    <div className="font-medium text-ink">
                      {pick(opt.label, opt.labelEn, lang)}
                    </div>
                    <div className="mt-1 text-sm text-brand-600">
                      {pick(opt.description, opt.descriptionEn, lang)}
                    </div>
                    <div className="mt-1 text-xs text-brand-400">
                      {pick(opt.triggers, opt.triggersEn, lang)}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="card mb-8">
          <div className="mb-2 text-sm text-brand-500">
            {t("intake_battery_label")}
          </div>
          <ul className="space-y-1 text-sm text-brand-800">
            {battery.map((id, i) => {
              const scale = getScale(id);
              const name = scale
                ? pick(scale.name, scale.nameEn, lang)
                : id;
              return (
                <li key={id}>
                  <span className="font-mono text-brand-400">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>{" "}
                  {name}
                </li>
              );
            })}
          </ul>
        </div>

        <button type="button" onClick={start} className="btn-primary">
          {t("intake_start")}
        </button>
      </div>
    </Container>
  );
}
