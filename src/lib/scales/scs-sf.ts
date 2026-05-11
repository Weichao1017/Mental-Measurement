/**
 * SCS-SF 自我关怀量表简版（Self-Compassion Scale - Short Form）
 *
 * ⚠️ 题目内容：经 Claude（AI）从英文原版翻译，未与权威中文修订版逐字核对。
 *    UI 会显示"题库待核对"提示。上线给真实客户前建议参考 Chen et al. (2011)
 *    或后续中文修订版做权威对齐。
 *
 * 来源：
 *   - 短版：Raes, F., Pommier, E., Neff, K. D., & Van Gucht, D. (2011).
 *     Construction and factorial validation of a short form of the
 *     Self-Compassion Scale. Clinical Psychology & Psychotherapy, 18(3), 250-255.
 *   - 中文版：Chen, J., Yan, L., & Zhou, L. (2011). Reliability and validity of
 *     Chinese version of Self-Compassion Scale. 中国临床心理学杂志, 19(6), 734-736.
 *   - Neff 官网（公开使用授权）：https://self-compassion.org/scales/
 *
 * 六个维度，每个 2 题：
 *   - SK  Self-Kindness 自我友善（正向）
 *   - SJ  Self-Judgment 自我评判（反向）
 *   - CH  Common Humanity 共同人性（正向）
 *   - IS  Isolation 孤立感（反向）
 *   - MI  Mindfulness 正念（正向）
 *   - OI  Over-Identification 过度认同（反向）
 *
 * 计分：5 点 Likert（1=几乎从不 → 5=几乎总是）
 * 总分：所有 12 题反向计分调整后求平均（1-5 分）
 *      高分 = 自我关怀水平高
 */

import type { Scale } from "../types";

export const scsSf: Scale = {
  id: "scs-sf",
  slug: "scs-sf",
  name: "SCS-SF 自我关怀量表（简版）",
  description: "测量自我友善、共同人性、正念三组对立面共六个维度",
  timeFrame: "通常情况下",
  estimatedMinutes: 3,
  isCore: true,
  instructions:
    "请根据您平常对待自己的方式，判断每一项陈述对您的符合程度。这里没有对错之分，请如实选择最贴近您日常状态的选项。",
  options: [
    { value: 1, label: "几乎从不", short: "几乎从不" },
    { value: 2, label: "偶尔" },
    { value: 3, label: "有时" },
    { value: 4, label: "经常" },
    { value: 5, label: "几乎总是", short: "几乎总是" },
  ],
  items: [
    {
      index: 1,
      dimension: "SJ",
      text: "我会因为自己的缺点和不足而否定、评判自己。",
      reverse: true,
      sourceRef: "SCS-26 #1",
    },
    {
      index: 2,
      dimension: "IS",
      text: "当我心情低落时，我倾向于觉得大多数人可能都比我更幸福。",
      reverse: true,
      sourceRef: "SCS-26 #4",
    },
    {
      index: 3,
      dimension: "CH",
      text: "我会尝试把自己的失败看作是人之常情的一部分。",
      sourceRef: "SCS-26 #7",
    },
    {
      index: 4,
      dimension: "MI",
      text: "当痛苦的事情发生时，我会尝试用相对平衡的视角看待这件事。",
      sourceRef: "SCS-26 #9",
    },
    {
      index: 5,
      dimension: "SK",
      text: "当我经历情绪上的痛苦时，我会尝试以爱意对待自己。",
      sourceRef: "SCS-26 #5",
    },
    {
      index: 6,
      dimension: "OI",
      text: "当我在重要的事情上失败时，我会被无能感淹没。",
      reverse: true,
      sourceRef: "SCS-26 #2",
    },
    {
      index: 7,
      dimension: "CH",
      text: "当我陷入低谷时，我会提醒自己世上还有很多人也正在经历类似的感受。",
      sourceRef: "SCS-26 #3",
    },
    {
      index: 8,
      dimension: "SJ",
      text: "在真正艰难的时刻，我对自己反而会很苛刻。",
      reverse: true,
      sourceRef: "SCS-26 #11",
    },
    {
      index: 9,
      dimension: "MI",
      text: "当某件事让我心烦时，我会尝试让自己的情绪保持平衡。",
      sourceRef: "SCS-26 #17",
    },
    {
      index: 10,
      dimension: "SK",
      text: "在我经历非常艰难的时期，我会给予自己所需要的关怀和温柔。",
      sourceRef: "SCS-26 #19",
    },
    {
      index: 11,
      dimension: "IS",
      text: "当我心情低落时，我倾向于反复想着所有出了问题的事情，很难走出来。",
      reverse: true,
      sourceRef: "SCS-26 #13",
    },
    {
      index: 12,
      dimension: "OI",
      text: "当我在重要的事情上失败时，我会觉得自己孤零零地承受这份失败。",
      reverse: true,
      sourceRef: "SCS-26 #6",
    },
  ],
  dimensions: [
    {
      code: "SK",
      name: "自我友善 Self-Kindness",
      description: "在困难时刻能温柔对待自己",
      itemIndices: [5, 10],
    },
    {
      code: "SJ",
      name: "自我评判 Self-Judgment（反向）",
      description: "对自己的不足过度责备",
      itemIndices: [1, 8],
    },
    {
      code: "CH",
      name: "共同人性 Common Humanity",
      description: "把困境看作是人类共同体验的一部分",
      itemIndices: [3, 7],
    },
    {
      code: "IS",
      name: "孤立感 Isolation（反向）",
      description: "感觉自己的痛苦与众不同、被隔离",
      itemIndices: [2, 11],
    },
    {
      code: "MI",
      name: "正念 Mindfulness",
      description: "对痛苦保持觉察的同时不被席卷",
      itemIndices: [4, 9],
    },
    {
      code: "OI",
      name: "过度认同 Over-Identification（反向）",
      description: "被负面情绪过度卷入",
      itemIndices: [6, 12],
    },
  ],
  scoringMethod: "mean",
  severityBands: {
    SK: [
      { level: "low", label: "较低", min: 1, max: 2.5 },
      { level: "moderate", label: "中等", min: 2.5, max: 3.5 },
      { level: "high", label: "较高", min: 3.5, max: 5 },
    ],
    SJ: [
      { level: "low", label: "较低", min: 1, max: 2.5 },
      { level: "moderate", label: "中等", min: 2.5, max: 3.5 },
      { level: "high", label: "较高", min: 3.5, max: 5 },
    ],
    CH: [
      { level: "low", label: "较低", min: 1, max: 2.5 },
      { level: "moderate", label: "中等", min: 2.5, max: 3.5 },
      { level: "high", label: "较高", min: 3.5, max: 5 },
    ],
    IS: [
      { level: "low", label: "较低", min: 1, max: 2.5 },
      { level: "moderate", label: "中等", min: 2.5, max: 3.5 },
      { level: "high", label: "较高", min: 3.5, max: 5 },
    ],
    MI: [
      { level: "low", label: "较低", min: 1, max: 2.5 },
      { level: "moderate", label: "中等", min: 2.5, max: 3.5 },
      { level: "high", label: "较高", min: 3.5, max: 5 },
    ],
    OI: [
      { level: "low", label: "较低", min: 1, max: 2.5 },
      { level: "moderate", label: "中等", min: 2.5, max: 3.5 },
      { level: "high", label: "较高", min: 3.5, max: 5 },
    ],
  },
  citation: "Raes et al. (2011); Chinese version: Chen et al. (2011)",
  fullyVerified: false,
  notes:
    "题目内容由 AI 从英文原版翻译，建议上线前与 Chen et al. (2011) 中文版对齐。SCS-SF 的总分用 12 题均值（反向题翻转后），反映自我关怀整体水平。",
};
