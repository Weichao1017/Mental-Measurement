/**
 * PSQI 匹兹堡睡眠质量指数（简化版）
 *
 * ⚠️ 简化策略：
 * 原 PSQI 题型混合（时长输入、频率单选、自由文本），计分用 7 个 component 加权。
 * 本项目为快速上线 MVP 做了简化：
 *  1. 时长 / 时间题用 4 档 Likert 选项替代精确输入（如 Q1 上床时间："22 点前 / 22-23 / 23-24 / 24 点后"）
 *  2. 频率题保留 PSQI 经典 4 档（0=没有 / 1=<1次/周 / 2=1-2次/周 / 3=≥3次/周）
 *  3. 各题用独立 options（ScaleItem.options），不再共用 scale.options
 *  4. 总分 sum（0-54），不是标准 PSQI 加权（0-21）
 *  5. 切点近似：< 14 良好 / 14-22 一般 / ≥ 23 较差
 * 因此本量表 fullyVerified: false，UI 显示"题库待核对"。
 * 临床用途请做完整版 PSQI（含时长精确输入 + 加权计分）。
 *
 * 来源：
 *   - Buysse, D. J., Reynolds, C. F., Monk, T. H., Berman, S. R., & Kupfer, D. J.
 *     (1989). The Pittsburgh Sleep Quality Index. Psychiatry Research, 28(2), 193-213.
 *   - 中文版：刘贤臣, 唐茂芹, 胡蕾, 等. (1996). 匹兹堡睡眠质量指数的信度和效度研究.
 *     中华精神科杂志, 29(2), 103-107.
 */

import type { Scale, ScaleItem, LikertOption } from "../types";

// PSQI 经典 4 档频率（题 5-14、16、17 共用）
const FREQ_OPTIONS: LikertOption[] = [
  { value: 0, label: "过去一个月没有发生", short: "没有" },
  { value: 1, label: "每周少于 1 次", short: "<1次/周" },
  { value: 2, label: "每周 1-2 次", short: "1-2次/周" },
  { value: 3, label: "每周 3 次或更多", short: "≥3次/周" },
];

// 上床时间档（题 1）
const BEDTIME_OPTIONS: LikertOption[] = [
  { value: 0, label: "晚上 22 点前", short: "22 前" },
  { value: 1, label: "晚上 22-23 点", short: "22-23" },
  { value: 2, label: "晚上 23 点到次日 0 点", short: "23-24" },
  { value: 3, label: "次日 0 点之后", short: "24 后" },
];

// 入睡耗时档（题 2）
const SLEEP_LATENCY_OPTIONS: LikertOption[] = [
  { value: 0, label: "15 分钟以内", short: "≤15 分" },
  { value: 1, label: "16-30 分钟", short: "16-30" },
  { value: 2, label: "31-60 分钟", short: "31-60" },
  { value: 3, label: "60 分钟以上", short: ">60" },
];

// 起床时间档（题 3）
const WAKETIME_OPTIONS: LikertOption[] = [
  { value: 0, label: "早晨 5-6 点", short: "5-6 点" },
  { value: 1, label: "早晨 6-7 点", short: "6-7 点" },
  { value: 2, label: "早晨 7-8 点", short: "7-8 点" },
  { value: 3, label: "上午 8 点之后", short: "8 点后" },
];

// 实际睡眠时长档（题 4）
const SLEEP_DURATION_OPTIONS: LikertOption[] = [
  { value: 0, label: "7 小时以上", short: ">7h" },
  { value: 1, label: "6-7 小时", short: "6-7h" },
  { value: 2, label: "5-6 小时", short: "5-6h" },
  { value: 3, label: "5 小时以下", short: "<5h" },
];

// 主观睡眠质量评价档（题 15）
const QUALITY_OPTIONS: LikertOption[] = [
  { value: 0, label: "非常好", short: "非常好" },
  { value: 1, label: "较好", short: "较好" },
  { value: 2, label: "较差", short: "较差" },
  { value: 3, label: "很差", short: "很差" },
];

// 困难程度档（题 18）
const DIFFICULTY_OPTIONS: LikertOption[] = [
  { value: 0, label: "没有困难", short: "没有" },
  { value: 1, label: "只有一点点", short: "一点" },
  { value: 2, label: "有些困难", short: "有些" },
  { value: 3, label: "非常困难", short: "非常" },
];

// 帮手函数：构造频率题
const freqItem = (index: number, dimension: string, text: string): ScaleItem => ({
  index,
  dimension,
  text,
  options: FREQ_OPTIONS,
  sourceRef: `PSQI Q5${String.fromCharCode(96 + index - 4)}`,
});

const items: ScaleItem[] = [
  // Q1-4：时长 / 时间
  {
    index: 1,
    dimension: "C2",
    text: "过去一个月，你通常什么时间上床睡觉？",
    options: BEDTIME_OPTIONS,
    sourceRef: "PSQI Q1",
  },
  {
    index: 2,
    dimension: "C2",
    text: "过去一个月，你通常需要多长时间才能入睡？",
    options: SLEEP_LATENCY_OPTIONS,
    sourceRef: "PSQI Q2",
  },
  {
    index: 3,
    dimension: "C3",
    text: "过去一个月，你通常早晨什么时间起床？",
    options: WAKETIME_OPTIONS,
    sourceRef: "PSQI Q3",
  },
  {
    index: 4,
    dimension: "C3",
    text: "过去一个月，你每晚实际睡眠时间大约是？",
    options: SLEEP_DURATION_OPTIONS,
    sourceRef: "PSQI Q4",
  },
  // Q5-14：10 种睡眠困扰频率
  freqItem(5, "C5", "过去一个月，你 30 分钟内不能入睡的频率是？"),
  freqItem(6, "C5", "过去一个月，你半夜或凌晨醒来的频率是？"),
  freqItem(7, "C5", "过去一个月，你必须起夜上厕所的频率是？"),
  freqItem(8, "C5", "过去一个月，你呼吸不畅或感到喘不上气的频率是？"),
  freqItem(9, "C5", "过去一个月，你大声咳嗽或打鼾的频率是？"),
  freqItem(10, "C5", "过去一个月，你感觉太冷的频率是？"),
  freqItem(11, "C5", "过去一个月，你感觉太热的频率是？"),
  freqItem(12, "C5", "过去一个月，你做噩梦的频率是？"),
  freqItem(13, "C5", "过去一个月，你因疼痛影响睡眠的频率是？"),
  freqItem(14, "C5", "过去一个月，因其他原因影响睡眠的频率是？"),
  // Q15：主观评价
  {
    index: 15,
    dimension: "C1",
    text: "总体而言，你如何评价过去一个月的睡眠质量？",
    options: QUALITY_OPTIONS,
    sourceRef: "PSQI Q9",
  },
  // Q16：催眠药频率
  freqItem(16, "C6", "过去一个月，你服用催眠药物（处方或非处方）的频率是？"),
  // Q17：日间嗜睡频率
  freqItem(17, "C7", "过去一个月，你在开车、用餐或社交活动中难以保持清醒的频率是？"),
  // Q18：保持精力的困难度
  {
    index: 18,
    dimension: "C7",
    text: "过去一个月，保持足够精力做日常事情对你而言有多困难？",
    options: DIFFICULTY_OPTIONS,
    sourceRef: "PSQI Q10",
  },
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
    "下列问题与你最近 1 个月的睡眠状况有关。请回答最符合你过去 1 个月内大多数白天和晚上情况的答案。每题选项各不相同，请仔细看选项标签。",
  // 默认 options：PSQI 各题用 item.options 覆盖，这里保留通用 fallback
  options: FREQ_OPTIONS,
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
    "简化版 PSQI：18 题 Likert，每题各自选项，总分 0-54（非标准 PSQI 加权）。切点近似：总分 < 14 良好 / 14-22 一般 / ≥ 23 较差。临床用途请做完整版 PSQI。",
};

function defaultBands(maxSum: number) {
  const a = Math.round(maxSum / 3);
  const b = Math.round((2 * maxSum) / 3);
  return [
    { level: "low" as const, label: "困扰较少", min: 0, max: a },
    { level: "moderate" as const, label: "中等", min: a + 1, max: b },
    { level: "high" as const, label: "困扰较多", min: b + 1, max: maxSum },
  ];
}
