/**
 * MDQ 心境障碍问卷（Mood Disorder Questionnaire）
 *
 * 双相筛查工具。临床特别强调：上 SSRI 之前最好都先筛一遍，
 * 因为如果实际是双相，单用 SSRI 可能诱发躁狂或快速循环。
 *
 * ⚠️ 题目内容：经 Claude 从英文原版翻译，未与权威中文版（罗炯 2003 等）逐字核对。
 *
 * 来源：
 *   - Hirschfeld, R. M., Williams, J. B., Spitzer, R. L., Calabrese, J. R.,
 *     Flynn, L., Keck, P. E. Jr., et al. (2000). Development and validation of
 *     a screening instrument for bipolar spectrum disorder: the Mood Disorder
 *     Questionnaire. American Journal of Psychiatry, 157(11), 1873-1875.
 *   - 中文版参考：罗炯, 方贻儒 et al. (2003) 等。
 *
 * 结构（3 部分共 15 题）：
 *   Part 1 (Q1-13): 13 个 yes/no 症状题
 *   Part 2 (Q14):   "以上几个症状是否在同一时间段同时发生?" yes/no
 *   Part 3 (Q15):   "这些症状对你造成多少问题?" (0=无 / 1=轻 / 2=中 / 3=重)
 *
 * 标准阳性判定（Hirschfeld 2000）：
 *   - Q1-13 中 ≥ 7 个 yes
 *   - AND Q14 = yes
 *   - AND Q15 ≥ 2 （中度或重度影响）
 *
 * 本项目用 sum 简化（Q1-13 + Q14 + Q15 = 0-17），高分提示"建议进一步评估"。
 * 临床切点解读：
 *   - Q1-13 < 7：阴性
 *   - Q1-13 ≥ 7 但 Q14/Q15 不满足：临床可疑
 *   - 三条件全满足：阳性（建议精神科评估）
 */

import type { Scale, LikertOption } from "../types";

const YES_NO: LikertOption[] = [
  { value: 0, label: "否", short: "否" },
  { value: 1, label: "是", short: "是" },
];

const IMPACT_OPTIONS: LikertOption[] = [
  { value: 0, label: "没有任何影响", short: "无" },
  { value: 1, label: "轻微影响", short: "轻" },
  { value: 2, label: "中度影响", short: "中" },
  { value: 3, label: "严重影响", short: "重" },
];

export const mdq: Scale = {
  id: "mdq",
  slug: "mdq",
  name: "MDQ 心境障碍问卷（双相筛查）",
  description: "筛查双相情感障碍的国际标准工具（15 题，约 5 分钟）",
  timeFrame: "过去任何一段时间（4 天以上）",
  estimatedMinutes: 5,
  isCore: false,
  category: "anxiety_clinical",
  highIsBetter: false,
  // 不设 dimensionMaxScore：症状题(0-13) + 同时性题(0-1) + 影响度(0-3) 分级别不一致
  instructions:
    "请回想过去任何一段持续 4 天或以上的时间。在那段时间里，您与平时相比是否曾出现以下不同寻常的状态？请按「是 / 否」如实回答。",
  options: YES_NO,
  items: [
    {
      index: 1,
      dimension: "MD",
      text: "你感到状态特别好、特别快乐，以至于身边人觉得你不太像自己；或者你过度兴奋而招致麻烦",
      options: YES_NO,
      sourceRef: "MDQ Q1.1",
    },
    {
      index: 2,
      dimension: "MD",
      text: "你比平时易怒得多，对人大喊大叫或与人争吵打闹",
      options: YES_NO,
      sourceRef: "MDQ Q1.2",
    },
    {
      index: 3,
      dimension: "MD",
      text: "你比平时对自己感到自信很多",
      options: YES_NO,
      sourceRef: "MDQ Q1.3",
    },
    {
      index: 4,
      dimension: "MD",
      text: "你比平时睡得少很多，且并不觉得需要更多睡眠",
      options: YES_NO,
      sourceRef: "MDQ Q1.4",
    },
    {
      index: 5,
      dimension: "MD",
      text: "你比平时话多得多，或说话比平时快得多",
      options: YES_NO,
      sourceRef: "MDQ Q1.5",
    },
    {
      index: 6,
      dimension: "MD",
      text: "你的思维不停地跳来跳去，或脑子转得太快以至于跟不上",
      options: YES_NO,
      sourceRef: "MDQ Q1.6",
    },
    {
      index: 7,
      dimension: "MD",
      text: "你比平时更容易被周围的事物分心，难以集中注意力",
      options: YES_NO,
      sourceRef: "MDQ Q1.7",
    },
    {
      index: 8,
      dimension: "MD",
      text: "你比平时精力更充沛",
      options: YES_NO,
      sourceRef: "MDQ Q1.8",
    },
    {
      index: 9,
      dimension: "MD",
      text: "你比平时活动量大得多，或做的事情多得多",
      options: YES_NO,
      sourceRef: "MDQ Q1.9",
    },
    {
      index: 10,
      dimension: "MD",
      text: "你比平时更外向、更喜欢社交（例如深夜还给朋友打电话）",
      options: YES_NO,
      sourceRef: "MDQ Q1.10",
    },
    {
      index: 11,
      dimension: "MD",
      text: "你比平时对性更感兴趣",
      options: YES_NO,
      sourceRef: "MDQ Q1.11",
    },
    {
      index: 12,
      dimension: "MD",
      text: "你做的事情对你而言是异乎寻常的，或者别人觉得是过分、愚蠢、有风险的",
      options: YES_NO,
      sourceRef: "MDQ Q1.12",
    },
    {
      index: 13,
      dimension: "MD",
      text: "花钱使你自己或家人陷入麻烦",
      options: YES_NO,
      sourceRef: "MDQ Q1.13",
    },
    {
      index: 14,
      dimension: "CO",
      text: "你在以上题目中圈选「是」的这些状况，是否曾在同一段时间内同时出现？",
      options: YES_NO,
      sourceRef: "MDQ Q2",
    },
    {
      index: 15,
      dimension: "IM",
      text: "这些状况对你造成的问题（例如无法工作、家庭/财务/法律问题、与人争吵打架等）有多严重？",
      options: IMPACT_OPTIONS,
      sourceRef: "MDQ Q3",
    },
  ],
  dimensions: [
    {
      code: "MD",
      name: "躁狂/轻躁狂症状",
      description: "标准切点：≥ 7 个「是」考虑阳性",
      itemIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    },
    {
      code: "CO",
      name: "症状同时性",
      description: "标准要求：同时发生才算阳性",
      itemIndices: [14],
    },
    {
      code: "IM",
      name: "功能影响",
      description: "标准要求：中度以上影响（≥ 2）",
      itemIndices: [15],
    },
  ],
  scoringMethod: "sum",
  severityBands: {
    MD: [
      { level: "low", label: "症状少（阴性）", min: 0, max: 6 },
      { level: "moderate", label: "症状达切点（需结合 Q14/Q15）", min: 7, max: 10 },
      { level: "high", label: "症状显著", min: 11, max: 13 },
    ],
    CO: [
      { level: "low", label: "不同时", min: 0, max: 0 },
      { level: "high", label: "同时发生", min: 1, max: 1 },
    ],
    IM: [
      { level: "low", label: "无影响", min: 0, max: 0 },
      { level: "moderate", label: "轻度", min: 1, max: 1 },
      { level: "high", label: "中度及以上", min: 2, max: 3 },
    ],
  },
  citation: "Hirschfeld et al. (2000); Chinese: 罗炯 et al. (2003)",
  fullyVerified: false,
  notes:
    "标准阳性 = Q1-13 ≥ 7 yes AND Q14 yes AND Q15 ≥ 2。三条件全满足时建议精神科评估，特别是在考虑 SSRI 治疗前——单用 SSRI 治疗双相可能诱发躁狂或快速循环。",
};
