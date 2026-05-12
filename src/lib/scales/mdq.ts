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
  { value: 0, label: "否", labelEn: "No", short: "否", shortEn: "No" },
  { value: 1, label: "是", labelEn: "Yes", short: "是", shortEn: "Yes" },
];

const IMPACT_OPTIONS: LikertOption[] = [
  { value: 0, label: "没有任何影响", labelEn: "No problem", short: "无", shortEn: "None" },
  { value: 1, label: "轻微影响", labelEn: "Minor problem", short: "轻", shortEn: "Minor" },
  { value: 2, label: "中度影响", labelEn: "Moderate problem", short: "中", shortEn: "Moderate" },
  { value: 3, label: "严重影响", labelEn: "Serious problem", short: "重", shortEn: "Serious" },
];

export const mdq: Scale = {
  id: "mdq",
  slug: "mdq",
  name: "MDQ 心境障碍问卷（双相筛查）",
  nameEn: "MDQ Mood Disorder Questionnaire (Bipolar Screener)",
  description: "筛查双相情感障碍的国际标准工具（15 题，约 5 分钟）",
  descriptionEn: "International standard for bipolar disorder screening (15 items, ~5 min)",
  timeFrame: "过去任何一段时间（4 天以上）",
  timeFrameEn: "Any past period of 4+ days",
  estimatedMinutes: 5,
  isCore: false,
  category: "anxiety_clinical",
  highIsBetter: false,
  instructions:
    "请回想过去任何一段持续 4 天或以上的时间。在那段时间里，您与平时相比是否曾出现以下不同寻常的状态？请按「是 / 否」如实回答。",
  instructionsEn:
    "Think about any past period (4+ days). During that time, did you ever experience the following unusual states compared to your typical self? Please answer Yes / No honestly.",
  options: YES_NO,
  items: [
    {
      index: 1,
      dimension: "MD",
      text: "你感到状态特别好、特别快乐，以至于身边人觉得你不太像自己；或者你过度兴奋而招致麻烦",
      textEn: "You felt so good or so hyper that other people thought you were not your normal self, or you were so hyper that you got into trouble",
      options: YES_NO,
      sourceRef: "MDQ Q1.1",
    },
    {
      index: 2,
      dimension: "MD",
      text: "你比平时易怒得多，对人大喊大叫或与人争吵打闹",
      textEn: "You were so irritable that you shouted at people or started fights or arguments",
      options: YES_NO,
      sourceRef: "MDQ Q1.2",
    },
    {
      index: 3,
      dimension: "MD",
      text: "你比平时对自己感到自信很多",
      textEn: "You felt much more self-confident than usual",
      options: YES_NO,
      sourceRef: "MDQ Q1.3",
    },
    {
      index: 4,
      dimension: "MD",
      text: "你比平时睡得少很多，且并不觉得需要更多睡眠",
      textEn: "You got much less sleep than usual and found you didn't really miss it",
      options: YES_NO,
      sourceRef: "MDQ Q1.4",
    },
    {
      index: 5,
      dimension: "MD",
      text: "你比平时话多得多，或说话比平时快得多",
      textEn: "You were much more talkative or spoke much faster than usual",
      options: YES_NO,
      sourceRef: "MDQ Q1.5",
    },
    {
      index: 6,
      dimension: "MD",
      text: "你的思维不停地跳来跳去，或脑子转得太快以至于跟不上",
      textEn: "Thoughts raced through your head or you couldn't slow your mind down",
      options: YES_NO,
      sourceRef: "MDQ Q1.6",
    },
    {
      index: 7,
      dimension: "MD",
      text: "你比平时更容易被周围的事物分心，难以集中注意力",
      textEn: "You were so easily distracted by things around you that you had trouble concentrating or staying on track",
      options: YES_NO,
      sourceRef: "MDQ Q1.7",
    },
    {
      index: 8,
      dimension: "MD",
      text: "你比平时精力更充沛",
      textEn: "You had much more energy than usual",
      options: YES_NO,
      sourceRef: "MDQ Q1.8",
    },
    {
      index: 9,
      dimension: "MD",
      text: "你比平时活动量大得多，或做的事情多得多",
      textEn: "You were much more active or did many more things than usual",
      options: YES_NO,
      sourceRef: "MDQ Q1.9",
    },
    {
      index: 10,
      dimension: "MD",
      text: "你比平时更外向、更喜欢社交（例如深夜还给朋友打电话）",
      textEn: "You were much more social or outgoing than usual (e.g., telephoned friends in the middle of the night)",
      options: YES_NO,
      sourceRef: "MDQ Q1.10",
    },
    {
      index: 11,
      dimension: "MD",
      text: "你比平时对性更感兴趣",
      textEn: "You were much more interested in sex than usual",
      options: YES_NO,
      sourceRef: "MDQ Q1.11",
    },
    {
      index: 12,
      dimension: "MD",
      text: "你做的事情对你而言是异乎寻常的，或者别人觉得是过分、愚蠢、有风险的",
      textEn: "You did things that were unusual for you or that other people thought were excessive, foolish, or risky",
      options: YES_NO,
      sourceRef: "MDQ Q1.12",
    },
    {
      index: 13,
      dimension: "MD",
      text: "花钱使你自己或家人陷入麻烦",
      textEn: "Spending money got you or your family into trouble",
      options: YES_NO,
      sourceRef: "MDQ Q1.13",
    },
    {
      index: 14,
      dimension: "CO",
      text: "你在以上题目中圈选「是」的这些状况，是否曾在同一段时间内同时出现？",
      textEn: "If you ticked YES to more than one of the above, did several of these ever happen during the same period of time?",
      options: YES_NO,
      sourceRef: "MDQ Q2",
    },
    {
      index: 15,
      dimension: "IM",
      text: "这些状况对你造成的问题（例如无法工作、家庭/财务/法律问题、与人争吵打架等）有多严重？",
      textEn: "How much of a problem did any of these cause you — like being unable to work; having family, money, or legal troubles; getting into arguments or fights?",
      options: IMPACT_OPTIONS,
      sourceRef: "MDQ Q3",
    },
  ],
  dimensions: [
    {
      code: "MD",
      name: "躁狂/轻躁狂症状",
      nameEn: "Mania / Hypomania symptoms",
      description: "标准切点：≥ 7 个「是」考虑阳性",
      descriptionEn: "Standard threshold: ≥ 7 'yes' considered positive",
      itemIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    },
    {
      code: "CO",
      name: "症状同时性",
      nameEn: "Co-occurrence",
      description: "标准要求：同时发生才算阳性",
      descriptionEn: "Required: symptoms must co-occur for positive screen",
      itemIndices: [14],
    },
    {
      code: "IM",
      name: "功能影响",
      nameEn: "Functional impact",
      description: "标准要求：中度以上影响（≥ 2）",
      descriptionEn: "Required: moderate or higher impact (≥ 2)",
      itemIndices: [15],
    },
  ],
  scoringMethod: "sum",
  severityBands: {
    MD: [
      { level: "low", label: "症状少（阴性）", labelEn: "Few symptoms (negative)", min: 0, max: 6 },
      { level: "moderate", label: "症状达切点（需结合 Q14/Q15）", labelEn: "Meets threshold (check Q14/Q15)", min: 7, max: 10 },
      { level: "high", label: "症状显著", labelEn: "Notable symptoms", min: 11, max: 13 },
    ],
    CO: [
      { level: "low", label: "不同时", labelEn: "Not co-occurring", min: 0, max: 0 },
      { level: "high", label: "同时发生", labelEn: "Co-occurring", min: 1, max: 1 },
    ],
    IM: [
      { level: "low", label: "无影响", labelEn: "No impact", min: 0, max: 0 },
      { level: "moderate", label: "轻度", labelEn: "Minor", min: 1, max: 1 },
      { level: "high", label: "中度及以上", labelEn: "Moderate or higher", min: 2, max: 3 },
    ],
  },
  citation: "Hirschfeld et al. (2000); Chinese: 罗炯 et al. (2003)",
  fullyVerified: false,
  notes:
    "标准阳性 = Q1-13 ≥ 7 yes AND Q14 yes AND Q15 ≥ 2。三条件全满足时建议精神科评估，特别是在考虑 SSRI 治疗前——单用 SSRI 治疗双相可能诱发躁狂或快速循环。",
};
