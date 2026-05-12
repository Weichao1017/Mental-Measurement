/**
 * 临床综合判定（Clinical Flag）
 *
 * 输入：所有量表的计分结果
 * 输出：一个综合"是否建议就医 / 用药 / 临床评估"的等级 + 触发的具体信号
 *
 * 算法：基于已有的 severityBands 系统而非每个量表写硬编码切点：
 *  - 警示题命中（如 PHQ-9 #9 ≥ 1，DASS-21 #21 ≥ 2）→ urgent
 *  - extremely_severe → urgent
 *  - severe / high（仅在 highIsBetter=false 量表）→ strong
 *  - moderate（仅在 highIsBetter=false 量表）→ consult
 *  - 否则 → self_help
 *
 * 量表方向区分：
 *  - highIsBetter=false 的量表（DASS-21、GAD-7、PHQ-9、MDQ、WSAS、PSWQ、
 *    RRS-10、ASRS、DERS-SF、ECR-12、PSQI）：高分=症状重，参与临床判断
 *  - highIsBetter=true 的量表（WHO-5、FFMQ、SCS、MAIA）：高分=能力强，不参与
 *    （这些量表低分不直接 → 建议就医，更像是"建议学习正念/自我关怀"）
 */

import type { Scale, ScaleResult } from "./types";
import type { Lang } from "./lang";
import { pick } from "./lang";

export type ClinicalLevel = "urgent" | "strong" | "consult" | "self_help";

export interface ClinicalSignal {
  /** 触发该信号的量表 ID */
  scaleId: string;
  /** 量表显示名 */
  scaleName: string;
  /** 信号描述（如"PHQ-9 抑郁: 重度"） */
  description: string;
  /** 该信号对应的等级 */
  level: Exclude<ClinicalLevel, "self_help">;
  /** 是否警示题（自杀意念等） */
  warning?: boolean;
}

export interface ClinicalFlag {
  level: ClinicalLevel;
  signals: ClinicalSignal[];
  /** 摘要描述（用于卡片顶部展示） */
  summary: string;
  /** 建议清单（用于卡片正文） */
  recommendations: string[];
  /** UI 配色提示 */
  color: "rose" | "amber" | "sage" | "neutral";
}

export function computeClinicalFlag(
  results: Array<{ scale: Scale; result: ScaleResult }>,
  lang: Lang = "zh"
): ClinicalFlag {
  const signals: ClinicalSignal[] = [];

  for (const { scale, result } of results) {
    const scaleName = pick(scale.name, scale.nameEn, lang);
    // 警示题命中（任何量表）
    for (const w of result.warnings) {
      signals.push({
        scaleId: scale.id,
        scaleName,
        description:
          lang === "en"
            ? `Warning item triggered: "${truncate(w.itemText, 30)}" → ${w.answer}`
            : `警示题命中："${truncate(w.itemText, 30)}" → 答 ${w.answer}`,
        level: "urgent",
        warning: true,
      });
    }

    // 只对 highIsBetter=false 的量表做症状 → 临床等级映射
    if (!scale.highIsBetter) {
      for (const d of result.dimensions) {
        const dimInfo = scale.dimensions.find((x) => x.code === d.code);
        const dName = pick(d.name, dimInfo?.nameEn, lang);
        const bandObj = scale.severityBands[d.code]?.find(
          (b) => b.label === d.band?.label
        );
        const bandLabel = d.band
          ? pick(d.band.label, bandObj?.labelEn, lang)
          : "";
        const level = d.band?.level;
        const desc = `${dName}: ${bandLabel}`;
        if (level === "extremely_severe") {
          signals.push({ scaleId: scale.id, scaleName, description: desc, level: "urgent" });
        } else if (level === "severe" || level === "high") {
          signals.push({ scaleId: scale.id, scaleName, description: desc, level: "strong" });
        } else if (level === "moderate") {
          signals.push({ scaleId: scale.id, scaleName, description: desc, level: "consult" });
        }
      }
    }
  }

  // 取最高等级
  const hasUrgent = signals.some((s) => s.level === "urgent");
  const hasStrong = signals.some((s) => s.level === "strong");
  const hasConsult = signals.some((s) => s.level === "consult");

  const level: ClinicalLevel = hasUrgent
    ? "urgent"
    : hasStrong
      ? "strong"
      : hasConsult
        ? "consult"
        : "self_help";

  return {
    level,
    signals,
    summary: SUMMARIES[level][lang],
    recommendations: RECOMMENDATIONS[level][lang],
    color: COLORS[level],
  };
}

const SUMMARIES: Record<ClinicalLevel, Record<Lang, string>> = {
  urgent: {
    zh: "你的评估结果出现了需要立即关注的信号。建议尽快寻求专业精神科或心理科评估，不要独自承担。",
    en: "Your assessment shows signals that need immediate attention. Please seek professional psychiatric or psychological evaluation soon — you don't have to carry this alone.",
  },
  strong: {
    zh: "你的多项指标命中临床关注切点。建议在近期（一周内）预约精神科医生或临床心理咨询师做正式评估。",
    en: "Multiple indicators meet clinical thresholds. We recommend booking a psychiatrist or clinical psychologist for formal evaluation within a week.",
  },
  consult: {
    zh: "你的部分指标提示存在一些中度困扰。建议结合心理咨询 / 正念课程进行支持性介入，并在 1-2 个月后复测观察趋势。",
    en: "Some indicators suggest moderate distress. Consider supportive psychological counseling / mindfulness programs, and re-test in 1-2 months to track trends.",
  },
  self_help: {
    zh: "目前各项指标基本在常规范围内。通过正念练习、自我关怀、规律作息等自助方式维持即可。",
    en: "Indicators are largely within normal range. Maintain via mindfulness practice, self-compassion, and regular routines.",
  },
};

const RECOMMENDATIONS: Record<ClinicalLevel, Record<Lang, string[]>> = {
  urgent: {
    zh: [
      "24-48 小时内联系精神科医生（综合医院精神科、心理科或专科医院）",
      "如出现自伤/自杀想法，立刻拨打危机干预热线（结果页下方有列表）",
      "把这份评估结果截图或导出交给接诊医生作为参考",
      "告诉一位你信任的人你现在的状态，不要独自承担",
    ],
    en: [
      "Contact a psychiatrist within 24-48 hours (hospital psychiatry/psychology department, or specialist clinic)",
      "If you have self-harm or suicidal thoughts, call a crisis hotline immediately (see list below)",
      "Screenshot or export this assessment to share with your clinician",
      "Tell someone you trust about your current state — don't carry this alone",
    ],
  },
  strong: {
    zh: [
      "一周内预约精神科医生或临床心理咨询师做正式评估",
      "如考虑药物治疗（如 SSRI），务必同时参考 MDQ 双相筛查结果——上 SSRI 前要先排除双相",
      "把评估结果作为初诊参考，可以省下不少问诊时间",
      "持续记录每天的状态变化，作为后续复诊的依据",
    ],
    en: [
      "Book a psychiatrist or clinical psychologist within a week for formal evaluation",
      "If medication (e.g., SSRI) is being considered, review the MDQ bipolar screening result first — bipolar must be ruled out before starting SSRI",
      "Bring this assessment to your initial consultation to save time",
      "Track daily state changes for follow-up reference",
    ],
  },
  consult: {
    zh: [
      "寻找资质合格的心理咨询师做支持性会谈（建议 6-12 次一个疗程）",
      "结合正念、CBT 自助、自我关怀等系统性练习",
      "1-2 个月后用同样的量表复测，看分数趋势",
      "如果分数继续上升或出现新症状，升级到精神科评估",
    ],
    en: [
      "Find a qualified psychological counselor for supportive sessions (recommend 6-12 sessions)",
      "Combine with mindfulness, CBT self-help, self-compassion practices",
      "Re-test with the same scales in 1-2 months to monitor trends",
      "If scores keep rising or new symptoms emerge, escalate to psychiatric evaluation",
    ],
  },
  self_help: {
    zh: [
      "继续日常的自我关怀和正念练习",
      "保持规律作息、适度运动、社交连接",
      "如状态有变化（如某段时间持续低落、焦虑），可以再次测评",
    ],
    en: [
      "Continue daily self-compassion and mindfulness practice",
      "Maintain regular routines, moderate exercise, social connection",
      "If state changes (persistent low mood or anxiety), re-test",
    ],
  },
};

const COLORS: Record<ClinicalLevel, ClinicalFlag["color"]> = {
  urgent: "rose",
  strong: "amber",
  consult: "sage",
  self_help: "neutral",
};

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + "…";
}

// 旧导出保留（向后兼容，但 UI 现在统一用 lang.tsx 里的 cf_level_* keys）
export const LEVEL_LABELS: Record<ClinicalLevel, string> = {
  urgent: "紧急",
  strong: "强烈建议专业评估",
  consult: "建议心理咨询",
  self_help: "自助 / 常规范围",
};
