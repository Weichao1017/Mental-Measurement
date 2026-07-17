/**
 * GAD-7 广泛性焦虑量表（Generalized Anxiety Disorder 7-item）
 *
 * 焦虑领域的金标准筛查工具。约 2 分钟做完。
 *
 * ✅ 题目已核对（Claude Opus 4.8, 2026-06）：中文措辞对照通用标准临床中文版 GAD-7
 *    （此量表高度标准化、中文措辞基本固定）；维度/计分(sum 0-21)/Spitzer 2006 切点 均核对一致。
 *
 * 来源：
 *   - Spitzer, R. L., Kroenke, K., Williams, J. B. W., & Löwe, B. (2006).
 *     A brief measure for assessing generalized anxiety disorder: the GAD-7.
 *     Archives of Internal Medicine, 166(10), 1092-1097.
 *   - 中文版：何筱衍, 李春波, 钱洁, 万玉美, 鲍秋玲, 严尚谊. (2010).
 *     广泛性焦虑量表在综合性医院的信度和效度. 上海精神医学, 22(4), 200-203.
 *
 * 计分：4 档 Likert（0-3），总分 0-21
 * 临床切点：
 *   - 0-4: 无焦虑症状
 *   - 5-9: 轻度焦虑
 *   - 10-14: 中度焦虑
 *   - 15-21: 重度焦虑（建议专业评估）
 * 切点 ≥ 10 灵敏度 89%，特异度 82%（对应 GAD 临床诊断）
 */

import type { Scale } from "../types";

export const gad7: Scale = {
  id: "gad7",
  slug: "gad7",
  name: "GAD-7 广泛性焦虑量表",
  nameEn: "GAD-7 Generalized Anxiety Disorder Scale",
  description: "焦虑领域的金标准筛查（7 题，约 2 分钟）",
  descriptionEn: "Gold-standard anxiety screening (7 items, ~2 min)",
  timeFrame: "过去两周",
  timeFrameEn: "Past 2 weeks",
  estimatedMinutes: 2,
  isCore: false,
  category: "anxiety_clinical",
  highIsBetter: false,
  dimensionMaxScore: 21,
  instructions:
    "在过去 2 周里，您被以下问题困扰的频率是？请如实选择最贴近您实际状态的选项。",
  instructionsEn:
    "Over the last 2 weeks, how often have you been bothered by the following problems?",
  options: [
    { value: 0, label: "完全没有", labelEn: "Not at all", short: "没有", shortEn: "Not at all" },
    { value: 1, label: "好几天", labelEn: "Several days", short: "好几天", shortEn: "Several days" },
    { value: 2, label: "超过一半的天数", labelEn: "More than half the days", short: "过半", shortEn: ">Half" },
    { value: 3, label: "几乎每天", labelEn: "Nearly every day", short: "几乎每天", shortEn: "Nearly daily" },
  ],
  items: [
    { index: 1, dimension: "GAD", text: "感到紧张、焦虑或心里发慌", textEn: "Feeling nervous, anxious or on edge", sourceRef: "GAD-7 #1" },
    { index: 2, dimension: "GAD", text: "无法停止或控制担忧", textEn: "Not being able to stop or control worrying", sourceRef: "GAD-7 #2" },
    { index: 3, dimension: "GAD", text: "对各种各样的事情担心过多", textEn: "Worrying too much about different things", sourceRef: "GAD-7 #3" },
    { index: 4, dimension: "GAD", text: "很难放松下来", textEn: "Trouble relaxing", sourceRef: "GAD-7 #4" },
    { index: 5, dimension: "GAD", text: "由于坐立不安而难以保持安静", textEn: "Being so restless that it is hard to sit still", sourceRef: "GAD-7 #5" },
    { index: 6, dimension: "GAD", text: "容易烦躁或易怒", textEn: "Becoming easily annoyed or irritable", sourceRef: "GAD-7 #6" },
    { index: 7, dimension: "GAD", text: "感到害怕，好像有可怕的事情要发生", textEn: "Feeling afraid as if something awful might happen", sourceRef: "GAD-7 #7" },
  ],
  dimensions: [
    {
      code: "GAD",
      name: "广泛性焦虑",
      nameEn: "Generalized Anxiety",
      description: "过去两周内焦虑症状的强度与频率",
      descriptionEn: "Severity and frequency of anxiety symptoms over the past 2 weeks",
      itemIndices: [1, 2, 3, 4, 5, 6, 7],
    },
  ],
  scoringMethod: "sum",
  severityBands: {
    GAD: [
      {
        level: "normal",
        label: "无焦虑症状",
        labelEn: "Minimal anxiety",
        min: 0,
        max: 4,
        clientNote: "过去两周的焦虑水平在常规范围内。",
        clientNoteEn: "Your anxiety level over the past 2 weeks is within the normal range.",
      },
      {
        level: "mild",
        label: "轻度焦虑",
        labelEn: "Mild anxiety",
        min: 5,
        max: 9,
        clientNote: "出现了一些焦虑信号，正念、自我关怀练习可能有帮助。",
        clientNoteEn: "Some anxiety signals present. Mindfulness and self-compassion practice may help.",
      },
      {
        level: "moderate",
        label: "中度焦虑",
        labelEn: "Moderate anxiety",
        min: 10,
        max: 14,
        clientNote: "焦虑已经较为持续，建议向专业心理工作者咨询。",
        clientNoteEn: "Anxiety has been somewhat persistent. Recommend consulting a mental health professional.",
      },
      {
        level: "severe",
        label: "重度焦虑",
        labelEn: "Severe anxiety",
        min: 15,
        max: 21,
        clientNote: "焦虑水平较高，强烈建议尽快寻求专业精神科 / 心理科评估。",
        clientNoteEn: "Anxiety level is high. Strongly recommend seeking psychiatric / psychological evaluation soon.",
      },
    ],
  },
  citation: "Spitzer et al. (2006); Chinese: 何筱衍 et al. (2010)",
  fullyVerified: true,
  notes:
    "焦虑筛查金标准。≥10 分对应中度以上焦虑，建议同时做 PHQ-9（抑郁共病筛查）和 MDQ（双相筛查，SSRI 处方前必查）。",
};
