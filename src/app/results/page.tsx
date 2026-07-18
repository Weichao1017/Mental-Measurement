"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import ResultCard from "@/components/ResultCard";
import ShareDialog from "@/components/ShareDialog";
import AIAnalysisCard from "@/components/AIAnalysisCard";
import ClinicalFlagCard from "@/components/ClinicalFlagCard";
import SurveyAnswersCard from "@/components/SurveyAnswersCard";
import { getScale } from "@/lib/scales";
import { scoreScale } from "@/lib/scoring";
import { loadSession, clearSession } from "@/lib/store";
import { uploadCurrentSession } from "@/lib/collect";
import { buildShareUrl, encodeSession } from "@/lib/share";
import { computeClinicalFlag, type ClinicalLevel } from "@/lib/clinical-flag";
import { getPercentile } from "@/lib/norms";
import { useT, useLang, pick, type Lang } from "@/lib/lang";
import type { SessionState, ScaleResult, Scale } from "@/lib/types";

const LEVEL_TEXT_MAP: Record<ClinicalLevel, { zh: string; en: string }> = {
  urgent: { zh: "紧急", en: "Urgent" },
  strong: { zh: "强烈建议专业评估", en: "Strongly advised" },
  consult: { zh: "建议心理咨询", en: "Counseling recommended" },
  self_help: { zh: "自助 / 常规范围", en: "Self-help / normal range" },
};

export default function ResultsPage() {
  const t = useT();
  const { lang } = useLang();
  const [session, setSession] = useState<SessionState | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [copied, setCopied] = useState(false);

  // 该会话是否属于某收集本（决定 UI 走「回收态」还是「本机态」）
  const inCollection = !!session?.collectionId;
  // 上传是否真的成功（决定是否显示「✓ 已提交给发起人」）——不能只凭 collectionId，
  // 网络失败/超时下 uploadedAt 仍为空，否则会向来访者做假承诺
  const uploadOk = !!session?.uploadedAt;
  const [uploadTried, setUploadTried] = useState(false);

  useEffect(() => {
    const s = loadSession();
    setSession(s);
    // 兜底：若属于收集本但完成时上传失败（uploadedAt 为空），在结果页再试一次
    if (s?.collectionId && !s.uploadedAt) {
      uploadCurrentSession().then((ok) => {
        setUploadTried(true);
        if (ok) setSession(loadSession());
      });
    } else {
      setUploadTried(true);
    }
  }, []);

  const retryUpload = async () => {
    const ok = await uploadCurrentSession();
    if (ok) setSession(loadSession());
  };

  const shareUrl = useMemo(() => {
    if (!session) return "";
    return buildShareUrl(encodeSession(session));
  }, [session]);

  const results = useMemo<
    Array<{ scaleId: string; scale: Scale; result: ScaleResult }>
  >(() => {
    if (!session) return [];
    const out: Array<{ scaleId: string; scale: Scale; result: ScaleResult }> = [];
    for (const scaleId of session.battery) {
      const scale = getScale(scaleId);
      const response = session.responses[scaleId];
      if (!scale || !response) continue;
      out.push({ scaleId, scale, result: scoreScale(scale, response) });
    }
    return out;
  }, [session]);

  // 收集型问卷（isSurvey）不计分：走逐题回顾；临床判定 / AI 分析只吃计分量表
  const scoredResults = useMemo(
    () => results.filter((r) => !r.scale.isSurvey),
    [results]
  );
  const surveyResults = useMemo(
    () => results.filter((r) => r.scale.isSurvey),
    [results]
  );

  // AI 分析用的 session：把问卷从 battery 里剔除，避免文本回答（含个人信息）被编码进 AI 请求
  const aiSession = useMemo<SessionState | null>(() => {
    if (!session) return null;
    return {
      ...session,
      battery: session.battery.filter((id) => !getScale(id)?.isSurvey),
    };
  }, [session]);

  const clinicalFlag = useMemo(() => {
    if (scoredResults.length === 0) return null;
    return computeClinicalFlag(
      scoredResults.map((r) => ({ scale: r.scale, result: r.result })),
      lang
    );
  }, [scoredResults, lang]);

  if (!session) {
    return (
      <Container>
        <div className="card text-center">
          <p className="text-brand-700">{t("results_no_data")}</p>
          <Link href="/" className="btn-primary mt-6">
            {t("results_start")}
          </Link>
        </div>
      </Container>
    );
  }

  const anyWarnings = results.some((r) => r.result.warnings.length > 0);
  // 纯问卷会话：没有任何计分量表，只有收集型问卷。此时复制/分享卡不应沿用
  // 「切点表 / AI 分析 / 交给老师」等计分语境文案。
  const surveyOnly = scoredResults.length === 0 && surveyResults.length > 0;

  return (
    <Container size="lg">
      <div className="animate-fade-in">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-brand-400">
          {t("results_eyebrow")}
        </p>
        <h1 className="mb-4 font-serif text-3xl leading-tight text-ink sm:text-4xl">
          {t("results_title")}
        </h1>
        <p className="mb-8 max-w-prose leading-relaxed text-brand-700">
          {t(
            uploadOk
              ? surveyOnly
                ? "results_intro_survey_collected"
                : "results_intro_collected"
              : surveyOnly
                ? "results_intro_survey"
                : "results_intro"
          )}
        </p>

        {inCollection && uploadOk ? (
          <div className="mb-8 rounded-2xl border border-sage-300 bg-sage-50 p-4 text-sm leading-relaxed text-brand-700">
            {t("results_collected_banner")}
          </div>
        ) : null}
        {inCollection && !uploadOk && uploadTried ? (
          <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            <p className="mb-2">{t("results_upload_failed_banner")}</p>
            <button
              type="button"
              onClick={retryUpload}
              className="rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100"
            >
              {t("results_upload_retry")}
            </button>
          </div>
        ) : null}

        {clinicalFlag ? <ClinicalFlagCard flag={clinicalFlag} /> : null}

        {anyWarnings ? (
          <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-6">
            <h2 className="mb-2 font-serif text-lg text-rose-900">
              {t("results_hotline_title")}
            </h2>
            <p className="mb-2 text-sm leading-relaxed text-rose-800">
              {t("results_hotline_intro")}
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-rose-800">
              {lang === "en" ? (
                <>
                  <li>Beijing Psych Crisis Intervention Center: 010-82951332 (24h, CN)</li>
                  <li>National Hope Hotline (CN): 400-161-9995</li>
                  <li>
                    International:{" "}
                    <a
                      className="underline"
                      href="https://findahelpline.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      findahelpline.com
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li>北京心理危机研究与干预中心：010-82951332（24 小时）</li>
                  <li>全国希望热线：400-161-9995</li>
                  <li>华中师范大学心理援助热线：4001-888-976（24 小时）</li>
                </>
              )}
            </ul>
          </div>
        ) : null}

        <div className="space-y-6">
          {scoredResults.map(({ scaleId, result }) => {
            const scale = getScale(scaleId)!;
            return <ResultCard key={scaleId} scale={scale} result={result} />;
          })}
        </div>

        {/* 收集型问卷：提交确认 + 逐题回顾 */}
        {surveyResults.length > 0 ? (
          <div className={scoredResults.length > 0 ? "mt-6 space-y-6" : "space-y-6"}>
            <div className="rounded-2xl border border-sage-200 bg-sage-50 p-6">
              <h2 className="mb-2 font-serif text-lg text-ink">
                {t("survey_done_title")}
              </h2>
              <p className="text-sm leading-relaxed text-brand-700">
                {t(uploadOk ? "survey_done_desc_collected" : "survey_done_desc")}
              </p>
            </div>
            {surveyResults.map(({ scaleId, scale }) => {
              const response = session.responses[scaleId];
              if (!response) return null;
              return (
                <SurveyAnswersCard
                  key={scaleId}
                  scale={scale}
                  response={response}
                />
              );
            })}
          </div>
        ) : null}

        {scoredResults.length > 0 && aiSession ? (
          <AIAnalysisCard
            session={aiSession}
            results={scoredResults.map((r) => ({ scale: r.scale, result: r.result }))}
            clinicalFlag={clinicalFlag}
            onTextChange={setAiText}
          />
        ) : null}

        {/* 一键复制全部结果 */}
        <div className="mt-8 rounded-2xl border border-brand-200 bg-white p-6">
          <h2 className="mb-2 font-serif text-lg text-ink">
            {t(surveyOnly ? "results_copy_title_survey" : "results_copy_title")}
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-brand-700">
            {t(surveyOnly ? "results_copy_desc_survey" : "results_copy_desc")}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={async () => {
              const md = buildClipboardMarkdown({
                session,
                results,
                clinicalFlag,
                aiText,
                lang,
              });
              try {
                await navigator.clipboard.writeText(md);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              } catch {
                window.prompt(t("results_copy_fallback"), md);
              }
            }}
          >
            {copied ? `✓ ${t("results_copy_done")}` : t("results_copy_btn")}
          </button>
        </div>

        {/* 手动「交给老师/主持人」分享卡：仅在「上传确实成功」时才隐藏，
            否则(不属收集本 / 上传失败)都保留，给用户一个真实可用的兜底通道 */}
        {!uploadOk ? (
          <div className="mt-10 rounded-2xl border border-sage-200 bg-sage-50 p-6">
            <h2 className="mb-2 font-serif text-lg text-ink">
              {t(surveyOnly ? "results_share_title_survey" : "results_share_title")}
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-brand-700">
              {t(surveyOnly ? "results_share_desc_survey" : "results_share_desc")}
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShareOpen(true)}
              disabled={!shareUrl}
            >
              {t(surveyOnly ? "results_share_btn_survey" : "results_share_btn")}
            </button>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              clearSession();
              window.location.href = "/";
            }}
          >
            {t("results_restart")}
          </button>
        </div>

        <ShareDialog
          url={shareUrl}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          audience={surveyOnly ? "host" : "therapist"}
        />


        <footer className="mt-16 border-t border-brand-200 pt-6 text-xs leading-relaxed text-brand-400">
          <p>
            <strong>{t("results_disclaimer_title")}</strong>
            {t("results_disclaimer_body")}
          </p>
        </footer>
      </div>
    </Container>
  );
}

/**
 * 把整个 results 页的内容（量表分数 + 完整切点表 + 临床建议 + AI 分析）
 * 序列化为 markdown 文本，方便复制到 IM / 文档 / 邮件。
 */
function buildClipboardMarkdown(args: {
  session: SessionState;
  results: Array<{ scaleId: string; scale: Scale; result: ScaleResult }>;
  clinicalFlag: ReturnType<typeof computeClinicalFlag> | null;
  aiText: string;
  lang: Lang;
}): string {
  const { session, results, clinicalFlag, aiText, lang } = args;
  const lines: string[] = [];

  lines.push(lang === "en" ? "# Mental Health Assessment Results" : "# 心理评估结果");
  lines.push("");
  lines.push(`${lang === "en" ? "Assessment time" : "评估时间"}: ${formatDate(session.startedAt)}`);
  if (session.concerns.length) {
    lines.push(`${lang === "en" ? "Concerns" : "主诉勾选"}: ${session.concerns.join(", ")}`);
  }
  lines.push("");

  // 综合建议
  if (clinicalFlag) {
    lines.push(`## ${lang === "en" ? "Integrated Recommendation" : "综合建议"}`);
    lines.push(`**${lang === "en" ? "Level" : "等级"}**: ${LEVEL_TEXT_MAP[clinicalFlag.level][lang]}`);
    lines.push("");
    lines.push(clinicalFlag.summary);
    if (clinicalFlag.signals.length > 0) {
      lines.push("");
      lines.push(`**${lang === "en" ? "Triggering signals" : "触发信号"}**:`);
      for (const s of clinicalFlag.signals) {
        const w = s.warning ? " ⚠️" : "";
        lines.push(`- [${s.level}] ${s.scaleName}: ${s.description}${w}`);
      }
    }
    if (clinicalFlag.recommendations.length > 0) {
      lines.push("");
      lines.push(`**${lang === "en" ? "Suggested actions" : "建议行动"}**:`);
      clinicalFlag.recommendations.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
    }
    lines.push("");
  }

  // 各量表
  for (const { scale, result } of results) {
    const scaleName = pick(scale.name, scale.nameEn, lang);
    lines.push(`## ${scaleName}`);
    if (scale.citation) {
      lines.push(`> ${lang === "en" ? "Citation" : "引用"}: ${scale.citation}`);
    }
    lines.push("");

    // 收集型问卷：逐题列出原始回答（无计分）
    if (scale.isSurvey) {
      const response = session.responses[scale.id];
      const items = [...scale.items].sort((a, b) => a.index - b.index);
      items.forEach((item, idx) => {
        const q = pick(item.text, item.textEn, lang);
        lines.push(`**${idx + 1}. ${q}**`);
        const kind = item.inputType ?? "choice";
        const options = item.options ?? scale.options;
        if (kind === "text") {
          const v = response?.textAnswers?.[item.index];
          lines.push(v && v.trim() !== "" ? v : lang === "en" ? "_(not answered)_" : "_（未作答）_");
        } else if (kind === "multi") {
          const vals = response?.multiAnswers?.[item.index] ?? [];
          if (vals.length === 0) {
            lines.push(lang === "en" ? "_(not answered)_" : "_（未作答）_");
          } else {
            for (const v of vals) {
              const opt = options.find((o) => o.value === v);
              lines.push(`- ${opt ? pick(opt.label, opt.labelEn, lang) : v}`);
            }
          }
        } else {
          const raw = response?.answers?.[item.index];
          if (typeof raw !== "number") {
            lines.push(lang === "en" ? "_(not answered)_" : "_（未作答）_");
          } else if (kind === "number") {
            lines.push(`${raw}${item.unit ?? ""}`);
          } else {
            const opt = options.find((o) => o.value === raw);
            lines.push(opt ? pick(opt.label, opt.labelEn, lang) : String(raw));
          }
        }
        // choice/multi 的自由补充
        if (kind !== "text") {
          const extra = response?.textAnswers?.[item.index];
          if (extra && extra.trim() !== "") {
            lines.push(`> ${lang === "en" ? "Note" : "补充"}: ${extra}`);
          }
        }
        lines.push("");
      });
      continue;
    }

    for (const d of result.dimensions) {
      const dimInfo = scale.dimensions.find((x) => x.code === d.code);
      const dName = pick(d.name, dimInfo?.nameEn, lang);
      const bandObj = scale.severityBands[d.code]?.find(
        (b) => b.label === d.band?.label
      );
      const bandLabel = d.band ? pick(d.band.label, bandObj?.labelEn, lang) : "";
      const scoreStr = scale.dimensionMaxScore
        ? `${formatScore(d.finalScore, scale.scoringMethod)} / ${scale.dimensionMaxScore}`
        : `${formatScore(d.finalScore, scale.scoringMethod)}`;
      const percentile = getPercentile(scale.id, d.code, d.finalScore);
      const pctStr =
        percentile !== null ? ` (P${percentile})` : "";

      lines.push(`### ${dName}: ${scoreStr}${pctStr}${bandLabel ? ` — ${bandLabel}` : ""}`);

      // 全部切点
      const bands = scale.severityBands[d.code] ?? [];
      if (bands.length > 0) {
        lines.push("");
        lines.push(lang === "en" ? "**Cutoff table:**" : "**完整切点表:**");
        for (const b of bands) {
          const range =
            b.max === null
              ? `${b.min}+`
              : b.min === b.max
                ? `${b.min}`
                : `${b.min}-${b.max}`;
          const label = pick(b.label, b.labelEn, lang);
          const isCurrent = b.label === d.band?.label;
          const marker = isCurrent ? " ← " : "   ";
          const wrap = isCurrent ? "**" : "";
          lines.push(`- ${marker}${wrap}${range}: ${label}${wrap}`);
        }
      }
      lines.push("");
    }

    if (result.warnings.length > 0) {
      lines.push(`**⚠️ ${lang === "en" ? "Warning items triggered" : "警示题命中"}:**`);
      for (const w of result.warnings) {
        lines.push(`- "${w.itemText}" → ${lang === "en" ? "answered" : "答"} ${w.answer} (${w.flag})`);
      }
      lines.push("");
    }
  }

  // AI 分析（如果已生成）
  if (aiText.trim()) {
    lines.push("---");
    lines.push("");
    lines.push(`## ${lang === "en" ? "AI Deep Analysis" : "AI 深入分析"}`);
    lines.push("");
    lines.push(aiText);
    lines.push("");
  }

  lines.push("---");
  lines.push(
    lang === "en"
      ? "_Generated by assessment.ai1017.com. This is not a clinical diagnosis._"
      : "_由 assessment.ai1017.com 生成。本评估不构成临床诊断。_"
  );

  return lines.join("\n");
}

function formatScore(n: number, method: Scale["scoringMethod"]): string {
  if (method === "mean") return n.toFixed(2);
  return String(Math.round(n));
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}
