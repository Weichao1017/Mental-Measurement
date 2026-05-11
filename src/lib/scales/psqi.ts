/**
 * PSQI 匹兹堡睡眠质量指数（简化版）
 *
 * ⚠️ 简化策略：
 * 原 PSQI 题型混合（时长输入、频率单选、自由文本），计分用 7 个 component 加权。
 * 本项目为快速上线 MVP，做了如下简化：
 *  1. 时长 / 时间题改为 4 档 Likert（"22 点之前" → "24 点之后" 等）
 *  2. 频率题保留 4 档（0=没有 / 1=<1次/周 / 2=1-2次/周 / 3=≥3次/周）
 *  3. 总分用 sum（0-54），不是标准 PSQI 加权（0-21）
 *  4. 切点用近似映射：< 14 良好 / 14-22 一般 / ≥ 23 较差
 * 因此本量表 fullyVerified: false，UI 显示"题库待核对"。
 * 临床用途请做完整版 PSQI（含时长精确输入 + 加权计分）。
 *
 * ⚠️ 题目内容：经 Claude 从英文原版翻译，未与刘贤臣 1996 中文版逐字核对。
 *
 * 来源：
 *   - Buysse, D. J., Reynolds, C. F., Monk, T. H., Berman, S. R., & Kupfer, D. J.
 *     (1989). The Pittsburgh Sleep Quality Index. Psychiatry Research, 28(2), 193-213.
 *   - 中文版：刘贤臣, 唐茂芹, 胡蕾, 等. (1996). 匹兹堡睡眠质量指数的信度和效度研究.
 *     中华精神科杂志, 29(2), 103-107.
 */

import type { Scale, ScaleItem } from "../types";

// 4 档频率（PSQI 经典频率分级）
const FREQ_OPTIONS = [
  { value: 0, label: "过去一个月没有发生", short: "没有" },
  { value: 1, label: "每周少于 1 次", short: "<1/周" },
  { value: 2, label: "每周 1-2 次", short: "1-2/周" },
  { value: 3, label: "每周 3 次或更多", short: "≥3/周" },
];

// 频率题（10 题，编号 5-14 都用同样选项）
const freqItem = (index: number, text: string): ScaleItem => ({
  index,
  dimension: "C5", // 睡眠紊乱 component
  text,
  sourceRef: "PSQI Q5",
});

const items: ScaleItem[] = [
  // 时长 / 时间（题 1-4，4 档 Likert 替代精确输入）
  { index: 1, dimension: "C2", text: "过去一个月，你通常什么时间上床睡觉？", sourceRef: "PSQI Q1" },
  { index: 2, dimension: "C2", text: "过去一个月，你通常需要多长时间才能入睡？", sourceRef: "PSQI Q2" },
  { index: 3, dimension: "C3", text: "过去一个月，你通常什么时间起床？", sourceRef: "PSQI Q3" },
  { index: 4, dimension: "C3", text: "过去一个月，你每晚实际睡眠时间大约是？", sourceRef: "PSQI Q4" },
  // 睡眠困扰频率（题 5-14，全部用 FREQ_OPTIONS）
  freqItem(5, "过去一个月，你 30 分钟内不能入睡的频率是？"),
  freqItem(6, "过去一个月，你半夜或凌晨醒来的频率是？"),
  freqItem(7, "过去一个月，你必须起夜上厕所的频率是？"),
  freqItem(8, "过去一个月，你呼吸不畅或感到喘不上气的频率是？"),
  freqItem(9, "过去一个月，你大声咳嗽或打鼾的频率是？"),
  freqItem(10, "过去一个月，你感觉太冷的频率是？"),
  freqItem(11, "过去一个月，你感觉太热的频率是？"),
  freqItem(12, "过去一个月，你做噩梦的频率是？"),
  freqItem(13, "过去一个月，你因疼痛影响睡眠的频率是？"),
  freqItem(14, "过去一个月，因其他原因影响睡眠的频率是？"),
  // 主观评价（题 15）
  { index: 15, dimension: "C1", text: "总体而言，你如何评价过去一个月的睡眠质量？", sourceRef: "PSQI Q9" },
  // 催眠药（题 16）
  freqItem(16, "过去一个月，你服用催眠药物（处方或非处方）的频率是？"),
  // 日间功能（题 17-18）
  freqItem(17, "过去一个月，你在开车、用餐或社交活动中难以保持清醒的频率是？"),
  { index: 18, dimension: "C7", text: "过去一个月，保持足够的精力做事对你而言有多困难？", sourceRef: "PSQI Q10" },
];

export const psqi: Scale = {
  id: "psqi",
  slug: "psqi",
  name: "PSQI 匹兹堡睡眠质量指数（简化版）",
  description: "评估过去一个月的睡眠质量与睡眠相关问题（简化为 18 题 Likert）",
  timeFrame: "过去一个月",
  estimatedMinutes: 4,
  isCore: false,
  highIsBetter: false,
  dimensionMaxScore: 54,
  triggers: ["sleep_problems"],
  instructions:
    "下列问题与你最近 1 个月的睡眠状况有关。请回答最符合你过去 1 个月内大多数白天和晚上情况的答案。",
  options: [
    // 默认选项（题 1-4、15、18 各自有特殊选项，UI 暂时统一用 4 档）
    { value: 0, label: "几乎没问题 / 状况良好", short: "良好" },
    { value: 1, label: "偶尔 / 轻微", short: "偶尔" },
    { value: 2, label: "经常 / 较多", short: "经常" },
    { value: 3, label: "几乎每晚 / 严重", short: "严重" },
  ],
  items,
  dimensions: [
    { code: "C1", name: "主观睡眠质量", itemIndices: [15] },
    { code: "C2", name: "入睡困难", itemIndices: [1, 2] },
    { code: "C3", name: "睡眠时间", itemIndices: [3, 4] },
    {
      code: "C5",
      name: "睡眠紊乱",
      description: "夜间各种因素影响睡眠的频率（10 题汇总）",
      itemIndices: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    },
    { code: "C6", name: "催眠药物使用", itemIndices: [16] },
    { code: "C7", name: "日间功能障碍", itemIndices: [17, 18] },
  ],
  scoringMethod: "sum",
  severityBands: {
    C1: defaultBands(3),
    C2: defaultBands(6),
    C3: defaultBands(6),
    C5: defaultBands(30),
    C6: defaultBands(3),
    C7: defaultBands(6),
  },
  citation: "Buysse et al. (1989); Chinese: 刘贤臣 et al. (1996)",
  fullyVerified: false,
  notes:
    "简化版 PSQI：18 题 Likert，总分 0-54（非标准 PSQI 加权）。临床切点近似：总分 < 14 良好 / 14-22 一般 / ≥ 23 较差。临床用途请做完整版 PSQI。",
};

function defaultBands(maxSum: number) {
  // 把维度分按三段映射：低、中、高（高 = 困扰多）
  const a = Math.round(maxSum / 3);
  const b = Math.round((2 * maxSum) / 3);
  return [
    { level: "low" as const, label: "困扰较少", min: 0, max: a },
    { level: "moderate" as const, label: "中等", min: a + 1, max: b },
    { level: "high" as const, label: "困扰较多", min: b + 1, max: maxSum },
  ];
}
