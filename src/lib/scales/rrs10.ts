/**
 * RRS-10 反刍反应量表短版（Ruminative Response Scale - 10 items）
 *
 * 测的不是焦虑量，而是 spiral 反刍模式本身——
 * 高分预示对 CBT 反刍干预技术 + 正念干预的敏感性。
 *
 * ⚠️ 题目内容：经 Claude 从英文原版翻译，未与权威中文修订版（韩秀引 2009 等）逐字核对。
 *
 * 来源（10 题短版，Treynor 2003）：
 *   - Treynor, W., Gonzalez, R., & Nolen-Hoeksema, S. (2003).
 *     Rumination reconsidered: A psychometric analysis.
 *     Cognitive Therapy and Research, 27(3), 247-259.
 *   - 原始 RRS：Nolen-Hoeksema & Morrow (1991).
 *
 * 结构：5 题 brooding（沉思/纠结）+ 5 题 reflection（反思）
 * brooding 跟抑郁强相关（病理性）；reflection 是中性甚至适应性的。
 *
 * 计分：4 档 Likert（1-4），总分 10-40
 *      brooding 5-20；reflection 5-20
 * 切点（粗略经验值，非官方）：
 *   - 总分 < 20: 低
 *   - 20-30: 中
 *   - ≥ 31: 高
 */

import type { Scale } from "../types";

export const rrs10: Scale = {
  id: "rrs10",
  slug: "rrs10",
  name: "RRS-10 反刍反应量表（短版）",
  nameEn: "RRS-10 Ruminative Response Scale (Short)",
  description: "测量「想个不停、反复纠结」的反刍模式（10 题，约 3 分钟）",
  descriptionEn: "Measures the 'thinking-it-over-and-over' rumination pattern (10 items, ~3 min)",
  timeFrame: "心情低落、悲伤或抑郁时",
  timeFrameEn: "When feeling down, sad, or depressed",
  estimatedMinutes: 3,
  isCore: false,
  category: "anxiety_clinical",
  highIsBetter: false,
  dimensionMaxScore: 20,
  instructions:
    "当你心情低落、悲伤或抑郁时，你做以下事情的频率是多少？请按日常常态作答。",
  instructionsEn:
    "When you feel down, sad, or depressed, how often do you do each of the following? Please answer based on your usual patterns.",
  options: [
    { value: 1, label: "几乎从不", labelEn: "Almost never", short: "几乎从不", shortEn: "Almost never" },
    { value: 2, label: "偶尔", labelEn: "Sometimes", short: "偶尔", shortEn: "Sometimes" },
    { value: 3, label: "经常", labelEn: "Often", short: "经常", shortEn: "Often" },
    { value: 4, label: "几乎总是", labelEn: "Almost always", short: "几乎总是", shortEn: "Almost always" },
  ],
  items: [
    { index: 1, dimension: "BR", text: "反复想：「我为什么对什么都没反应？」", textEn: "Think 'Why do I react this way?'", sourceRef: "RRS Brooding 1" },
    { index: 2, dimension: "BR", text: "反复想：「我为什么会有这种感觉？」", textEn: "Think 'Why do I always react this way?'", sourceRef: "RRS Brooding 2" },
    { index: 3, dimension: "BR", text: "想：「如果继续这样下去，我什么都做不成」", textEn: "Think 'I won't be able to do my job if I don't snap out of this'", sourceRef: "RRS Brooding 3" },
    { index: 4, dimension: "BR", text: "想：「我做错了什么导致这种感觉？」", textEn: "Think 'What am I doing to deserve this?'", sourceRef: "RRS Brooding 4" },
    { index: 5, dimension: "BR", text: "反复回想最近发生的事，希望它们没有发生过", textEn: "Think about a recent situation, wishing it had gone better", sourceRef: "RRS Brooding 5" },
    { index: 6, dimension: "RF", text: "一个人静下来思考自己的感受", textEn: "Go someplace alone to think about your feelings", sourceRef: "RRS Reflection 1" },
    { index: 7, dimension: "RF", text: "写日记或文字，分析自己的想法", textEn: "Write down what you are thinking and analyze it", sourceRef: "RRS Reflection 2" },
    { index: 8, dimension: "RF", text: "分析最近发生的事，试图理解自己为什么会这样难受", textEn: "Analyze recent events to try to understand why you are depressed", sourceRef: "RRS Reflection 3" },
    { index: 9, dimension: "RF", text: "一个人离开人群静下来，思考「我为什么会有这种感受」", textEn: "Go away by yourself and think about why you feel this way", sourceRef: "RRS Reflection 4" },
    { index: 10, dimension: "RF", text: "分析自己的个性，试图理解自己为什么会感到抑郁", textEn: "Analyze your personality to try to understand why you are depressed", sourceRef: "RRS Reflection 5" },
  ],
  dimensions: [
    { code: "BR", name: "Brooding 沉思/纠结", nameEn: "Brooding", description: "病理性反刍，跟抑郁强相关", descriptionEn: "Pathological rumination, strongly correlated with depression", itemIndices: [1, 2, 3, 4, 5] },
    { code: "RF", name: "Reflection 反思", nameEn: "Reflection", description: "中性甚至适应性的思考", descriptionEn: "Neutral or adaptive contemplation", itemIndices: [6, 7, 8, 9, 10] },
  ],
  scoringMethod: "sum",
  severityBands: {
    BR: [
      { level: "low", label: "低", labelEn: "Low", min: 5, max: 9 },
      { level: "moderate", label: "中", labelEn: "Moderate", min: 10, max: 14 },
      { level: "high", label: "高（病理性反刍）", labelEn: "High (pathological rumination)", min: 15, max: 20 },
    ],
    RF: [
      { level: "low", label: "低", labelEn: "Low", min: 5, max: 9 },
      { level: "moderate", label: "中", labelEn: "Moderate", min: 10, max: 14 },
      { level: "high", label: "高（反思倾向强）", labelEn: "High (strong reflective tendency)", min: 15, max: 20 },
    ],
  },
  citation: "Treynor et al. (2003); Chinese: 韩秀引 et al. (2009)",
  fullyVerified: false,
  notes:
    "Brooding 高分跟抑郁强相关，是临床重点；Reflection 高分中性。这个区分对治疗方向（是否做反刍干预 / 是否引入正念）有直接指导意义。",
};
