"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { encodeSession } from "@/lib/share";
import type { Scale, ScaleResult, SessionState } from "@/lib/types";
import type { ClinicalFlag } from "@/lib/clinical-flag";
import { getPercentile } from "@/lib/norms";
import { useT, useLang, pick } from "@/lib/lang";

interface Props {
  session: SessionState;
  results: Array<{ scale: Scale; result: ScaleResult }>;
  clinicalFlag?: ClinicalFlag | null;
}

type Status = "idle" | "loading" | "thinking" | "streaming" | "done" | "error";

export default function AIAnalysisCard({ session, results, clinicalFlag }: Props) {
  const t = useT();
  const { lang } = useLang();
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState("");
  const [thinkingOpen, setThinkingOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const start = async () => {
    setStatus("loading");
    setText("");
    setThinking("");
    setThinkingOpen(true); // 思考过程默认展开（让用户看到进度）
    setErrorMsg(null);

    const payload = {
      lang, // 让 API 端选择输出语言（中文 / English）
      d: encodeSession(session),
      startedAt: session.startedAt,
      concerns: session.concerns,
      clinicalFlag: clinicalFlag
        ? {
            level: clinicalFlag.level,
            summary: clinicalFlag.summary,
            signals: clinicalFlag.signals.map((s) => ({
              scaleName: s.scaleName,
              description: s.description,
              level: s.level,
              warning: s.warning ?? false,
            })),
          }
        : null,
      results: results.map(({ scale, result }) => {
        const scaleName = pick(scale.name, scale.nameEn, lang);
        const timeFrame = pick(scale.timeFrame, scale.timeFrameEn, lang);
        return {
          scaleId: scale.id,
          scaleName,
          timeFrame,
          highIsBetter: scale.highIsBetter,
          dimensions: result.dimensions.map((d) => {
            const dimInfo = scale.dimensions.find((x) => x.code === d.code);
            const bandObj = scale.severityBands[d.code]?.find(
              (b) => b.label === d.band?.label
            );
            return {
              code: d.code,
              name: pick(d.name, dimInfo?.nameEn, lang),
              finalScore: d.finalScore,
              maxScore: scale.dimensionMaxScore,
              bandLabel: d.band
                ? pick(d.band.label, bandObj?.labelEn, lang)
                : undefined,
              percentile: getPercentile(scale.id, d.code, d.finalScore),
            };
          }),
          warnings: result.warnings.map((w) => ({
            itemText: w.itemText,
            answer: w.answer,
            flag: w.flag,
          })),
        };
      }),
    };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          (errJson as { message?: string }).message ??
            `请求失败 (HTTP ${res.status})`
        );
      }
      if (!res.body) throw new Error("响应无 body");

      setStatus("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        // 按 SSE 帧分割（\n\n）
        let idx;
        while ((idx = buf.indexOf("\n\n")) >= 0) {
          const frame = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const evt = parseSSEFrame(frame);
          if (!evt) continue;
          if (evt.event === "thinking") {
            try {
              const obj = JSON.parse(evt.data);
              if (typeof obj.text === "string") {
                setStatus("thinking");
                setThinking((prev) => prev + obj.text);
              }
            } catch {}
          } else if (evt.event === "chunk") {
            try {
              const obj = JSON.parse(evt.data);
              if (typeof obj.text === "string") {
                setStatus("streaming");
                setThinkingOpen(false); // 进入正文阶段，自动收起思考过程
                setText((prev) => prev + obj.text);
              }
            } catch {}
          } else if (evt.event === "done") {
            try {
              const obj = JSON.parse(evt.data);
              if (typeof obj.remaining === "number") setRemaining(obj.remaining);
            } catch {}
            setStatus("done");
          } else if (evt.event === "error") {
            try {
              const obj = JSON.parse(evt.data);
              throw new Error(obj.message ?? "服务端错误");
            } catch (e) {
              throw e instanceof Error ? e : new Error("服务端错误");
            }
          }
        }
      }
      // 流结束未收到 done 事件，也算结束
      setStatus((s) => (s === "streaming" ? "done" : s));
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "未知错误");
    }
  };

  return (
    <section className="mt-10 rounded-2xl border border-brand-200 bg-white p-6 shadow-sm">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-ink">{t("ai_title")}</h2>
          <p className="mt-1 text-xs text-brand-500">{t("ai_subtitle")}</p>
        </div>
        {remaining !== null ? (
          <span className="text-xs text-brand-400">
            {t("ai_remaining")}
            {remaining}
          </span>
        ) : null}
      </header>

      {status === "idle" ? (
        <div>
          <p className="mb-4 text-sm leading-relaxed text-brand-700">
            {t("ai_intro")}
          </p>
          <button type="button" onClick={start} className="btn-primary">
            {t("ai_start")}
          </button>
        </div>
      ) : null}

      {status === "loading" ? (
        <p className="text-sm text-brand-600">{t("ai_loading")}</p>
      ) : null}

      {/* deepseek-reasoner 的思考过程：默认展开，进入正文时自动收起，可手动展开看 */}
      {thinking ? (
        <details
          open={thinkingOpen}
          onToggle={(e) => setThinkingOpen((e.target as HTMLDetailsElement).open)}
          className="mb-4 rounded-lg border border-brand-200 bg-cream/60 p-4"
        >
          <summary className="cursor-pointer select-none text-xs font-medium text-brand-600 hover:text-brand-800">
            {status === "thinking" ? t("ai_thinking_active") : t("ai_thinking_view")}
            <span className="ml-2 text-brand-400">
              {t("ai_thinking_chars_prefix")}{thinking.length}{t("ai_thinking_chars_suffix")}
            </span>
          </summary>
          <div className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-brand-500">
            {thinking}
            {status === "thinking" ? (
              <span className="inline-block h-3 w-0.5 animate-pulse bg-brand-400 align-middle" />
            ) : null}
          </div>
        </details>
      ) : null}

      {status === "streaming" || status === "done" ? (
        <div className="prose prose-sm max-w-none text-ink prose-headings:font-serif prose-headings:text-ink prose-h2:mt-4 prose-h2:text-lg prose-p:leading-relaxed prose-p:text-brand-800 prose-li:text-brand-800 prose-strong:text-ink">
          <ReactMarkdown>{text}</ReactMarkdown>
          {status === "streaming" ? (
            <span className="inline-block h-4 w-1 animate-pulse bg-sage-500 align-middle" />
          ) : null}
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <div className="mb-1 font-medium">{t("ai_error_title")}</div>
          <p>{errorMsg}</p>
          <button
            type="button"
            onClick={start}
            className="mt-3 rounded-full border border-rose-300 bg-white px-4 py-1.5 text-sm text-rose-700 hover:bg-rose-100"
          >
            {t("ai_retry")}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function parseSSEFrame(frame: string): { event: string; data: string } | null {
  const lines = frame.split("\n");
  let event = "message";
  const dataParts: string[] = [];
  for (const line of lines) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataParts.push(line.slice(5).trim());
  }
  if (dataParts.length === 0) return null;
  return { event, data: dataParts.join("\n") };
}
