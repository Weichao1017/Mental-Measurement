/**
 * PHQ-9 患者健康问卷-9（Patient Health Questionnaire-9）
 *
 * 抑郁筛查的国际通用工具。焦虑常和抑郁共病，必须同时筛。
 * 第 9 题专门问自杀意念，是临床高度关注项目。
 *
 * ✅ 题目已核对（Claude Opus 4.8, 2026-06）：中文措辞对照通用标准临床中文版 PHQ-9
 *    （此量表高度标准化、中文措辞基本固定）；维度/计分(sum 0-27)/Kroenke 2001 切点/
 *    #9 自杀意念警示位(≥1 触发) 均核对一致。
 *
 * 来源：
 *   - Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001).
 *     The PHQ-9: Validity of a brief depression severity measure.
 *     Journal of General Internal Medicine, 16(9), 606-613.
 *   - 中文版：胡星辰, 张迎黎, 梁炜, 张红梅, 杨世昌. (2014).
 *     患者健康问卷抑郁自评量表（PHQ-9）的临床应用. 临床精神医学杂志, 24(2), 137-138.
 *
 * 计分：4 档 Likert（0-3），总分 0-27
 * 临床切点（Kroenke 2001）：
 *   - 0-4: 无抑郁
 *   - 5-9: 轻度
 *   - 10-14: 中度
 *   - 15-19: 中重度
 *   - 20-27: 重度
 * 切点 ≥ 10 灵敏度 88%，特异度 88%（对应 MDD 临床诊断）
 *
 * ⚠️ 第 9 题为自杀意念警示题：回答 ≥ 1（哪怕只是"好几天"）都触发前端警示。
 */

import type { Scale } from "../types";

export const phq9: Scale = {
  id: "phq9",
  slug: "phq9",
  name: "PHQ-9 患者健康问卷（抑郁）",
  nameEn: "PHQ-9 Patient Health Questionnaire",
  description: "抑郁症状的国际通用筛查（9 题，约 3 分钟）",
  descriptionEn: "International standard depression screening (9 items, ~3 min)",
  timeFrame: "过去两周",
  timeFrameEn: "Past 2 weeks",
  estimatedMinutes: 3,
  isCore: false,
  category: "anxiety_clinical",
  highIsBetter: false,
  dimensionMaxScore: 27,
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
    { index: 1, dimension: "DEP", text: "做事时提不起劲或没有兴趣", textEn: "Little interest or pleasure in doing things", sourceRef: "PHQ-9 #1" },
    { index: 2, dimension: "DEP", text: "感到心情低落、沮丧或绝望", textEn: "Feeling down, depressed, or hopeless", sourceRef: "PHQ-9 #2" },
    { index: 3, dimension: "DEP", text: "入睡困难、睡不安稳，或者睡眠过多", textEn: "Trouble falling or staying asleep, or sleeping too much", sourceRef: "PHQ-9 #3" },
    { index: 4, dimension: "DEP", text: "感觉疲倦或没有活力", textEn: "Feeling tired or having little energy", sourceRef: "PHQ-9 #4" },
    { index: 5, dimension: "DEP", text: "食欲不振，或吃得过多", textEn: "Poor appetite or overeating", sourceRef: "PHQ-9 #5" },
    {
      index: 6,
      dimension: "DEP",
      text: "觉得自己很糟糕，或觉得自己是个失败者，或让自己/家人失望",
      textEn: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
      sourceRef: "PHQ-9 #6",
    },
    {
      index: 7,
      dimension: "DEP",
      text: "对事物专注有困难，例如阅读报纸或看电视时",
      textEn: "Trouble concentrating on things, such as reading the newspaper or watching television",
      sourceRef: "PHQ-9 #7",
    },
    {
      index: 8,
      dimension: "DEP",
      text: "行动或说话缓慢到别人能察觉？或正好相反——烦躁不安、坐立不定，比平常活动得更多",
      textEn: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
      sourceRef: "PHQ-9 #8",
    },
    {
      index: 9,
      dimension: "DEP",
      text: "有不如死掉或用某种方式伤害自己的想法",
      textEn: "Thoughts that you would be better off dead or of hurting yourself in some way",
      sourceRef: "PHQ-9 #9",
      flags: ["suicidal_ideation"],
      flagThreshold: 1, // PHQ-9 临床惯例：≥1 就要警示
    },
  ],
  dimensions: [
    {
      code: "DEP",
      name: "抑郁症状",
      nameEn: "Depression symptoms",
      description: "过去两周内抑郁症状的强度与频率",
      descriptionEn: "Severity and frequency of depression symptoms over the past 2 weeks",
      itemIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
  ],
  scoringMethod: "sum",
  severityBands: {
    DEP: [
      { level: "normal", label: "无抑郁", labelEn: "Minimal depression", min: 0, max: 4 },
      { level: "mild", label: "轻度抑郁", labelEn: "Mild depression", min: 5, max: 9 },
      { level: "moderate", label: "中度抑郁", labelEn: "Moderate depression", min: 10, max: 14 },
      { level: "severe", label: "中重度抑郁", labelEn: "Moderately severe depression", min: 15, max: 19 },
      { level: "extremely_severe", label: "重度抑郁", labelEn: "Severe depression", min: 20, max: 27 },
    ],
  },
  citation: "Kroenke et al. (2001); Chinese: 胡星辰 et al. (2014)",
  fullyVerified: true,
  notes:
    "第 9 题为自杀意念警示题，回答 ≥ 1 都会触发前端提示。建议跟 GAD-7（焦虑共病）+ MDQ（双相鉴别）一起做。",
};
