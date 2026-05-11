/**
 * MAIA-2 内感受觉知多维度评估量表 v2
 * （Multidimensional Assessment of Interoceptive Awareness, version 2）
 *
 * ⚠️ 题目内容：经 Claude（AI）从英文原版翻译，未与权威中文修订版逐字核对。
 *    内感受领域用词专业，UI 会显示"题库待核对"。上线给真实客户前强烈建议
 *    委托双语专业人士对照 Mehling et al. (2018) PLoS ONE 原文核对。
 *
 * ⚠️ 反向计分修正：MAIA-1 (2012) 的 ND 和 NW 全部反向计分；MAIA-2 (2018) 在
 *    MAIA-1 基础上追加了正向措辞的新题，所以 ND/NW 子量表内部是 mixed scoring：
 *      - ND 共 6 题：前 3 题（来自 MAIA-1）反向，后 3 题（MAIA-2 新增）正向
 *      - NW 共 5 题：前 2 题（来自 MAIA-1）反向，后 3 题（MAIA-2 新增）正向
 *    其余 6 个子量表全部正向计分。
 *
 * 来源：
 *   - Mehling, W. E., Acree, M., Stewart, A., Silas, J., & Jones, A. (2018).
 *     The Multidimensional Assessment of Interoceptive Awareness, Version 2 (MAIA-2).
 *     PLoS ONE, 13(12), e0208034.
 *   - MAIA-1 原版：Mehling et al. (2012). PLoS ONE, 7(11), e48230.
 *   - 中文版参考：Lin, F. L., Hsu, C. C., Mehling, W., & Yeh, M. L. (2017)
 *     台湾繁体版。简体版需检索 CNKI 近期文献。
 *   - 官方网站：https://osher.ucsf.edu/research/maia
 *
 * 8 个子量表（共 37 题）：
 *   - NOT Noticing 觉察（4 题）
 *   - ND  Not-Distracting 不分心（6 题，前 3 反向）
 *   - NW  Not-Worrying 不担忧（5 题，前 2 反向）
 *   - AR  Attention Regulation 注意调节（7 题）
 *   - EA  Emotional Awareness 情绪觉察（5 题）
 *   - SR  Self-Regulation 自我调节（4 题）
 *   - BL  Body Listening 倾听身体（3 题）
 *   - TR  Trusting 信任身体（3 题）
 *
 * 计分：6 点 Likert（0=从不 → 5=总是），每个子量表求均值
 */

import type { Scale, ScaleItem } from "../types";

const items: ScaleItem[] = [
  // NOT Noticing (4)
  { index: 1, dimension: "NOT", text: "当我紧张时，我能注意到身体哪个部位在紧张。" },
  { index: 2, dimension: "NOT", text: "我能注意到身体什么时候感到不舒服。" },
  { index: 3, dimension: "NOT", text: "我能注意到身体哪些部位感到舒服。" },
  { index: 4, dimension: "NOT", text: "我能注意到呼吸的变化，比如变慢或变快。" },

  // ND Not-Distracting (6) — 前 3 题反向（MAIA-1 留存），后 3 题正向（MAIA-2 新增）
  {
    index: 5,
    dimension: "ND",
    text: "当感到身体的紧张或不适时，我会一直忽略，直到它变得严重。",
    reverse: true,
    sourceRef: "MAIA-1 留存（反向）",
  },
  {
    index: 6,
    dimension: "ND",
    text: "当感到疼痛或不舒服时，我会尝试硬撑过去、不去理它。",
    reverse: true,
    sourceRef: "MAIA-1 留存（反向）",
  },
  {
    index: 7,
    dimension: "ND",
    text: "当感到痛苦时，我会通过分散注意力来逃避身体的感觉。",
    reverse: true,
    sourceRef: "MAIA-1 留存（反向）",
  },
  {
    index: 8,
    dimension: "ND",
    text: "当注意力被分散时，我能把它带回到身体的感觉上。",
    sourceRef: "MAIA-2 新增（正向）",
  },
  {
    index: 9,
    dimension: "ND",
    text: "当我有不舒服的身体感觉时，我能允许它停留而不去压抑。",
    sourceRef: "MAIA-2 新增（正向）",
  },
  {
    index: 10,
    dimension: "ND",
    text: "感到痛苦时，我仍能让注意力停留在身体感觉上。",
    sourceRef: "MAIA-2 新增（正向）",
  },

  // NW Not-Worrying (5) — 前 2 题反向，后 3 题正向
  {
    index: 11,
    dimension: "NW",
    text: "当感到身体疼痛或不适时，我会变得很难过。",
    reverse: true,
    sourceRef: "MAIA-1 留存（反向）",
  },
  {
    index: 12,
    dimension: "NW",
    text: "当我留意到身体某处不舒服时，我会担心是不是出了什么严重的问题。",
    reverse: true,
    sourceRef: "MAIA-1 留存（反向）",
  },
  {
    index: 13,
    dimension: "NW",
    text: "即使身体感觉不适，我也能注意到它而不感到担心。",
    sourceRef: "MAIA-2 新增（正向）",
  },
  {
    index: 14,
    dimension: "NW",
    text: "即使身体出现疼痛，我也能与之共处而不焦虑。",
    sourceRef: "MAIA-2 新增（正向）",
  },
  {
    index: 15,
    dimension: "NW",
    text: "我能注意到身体的不舒服而不让它扰乱我的状态。",
    sourceRef: "MAIA-2 新增（正向）",
  },

  // AR Attention Regulation (7)
  { index: 16, dimension: "AR", text: "我能把注意力集中到呼吸上。" },
  { index: 17, dimension: "AR", text: "我能持续地保持对身体感觉的觉察。" },
  { index: 18, dimension: "AR", text: "当走神时，我能把注意力重新带回到身体上。" },
  { index: 19, dimension: "AR", text: "必要时，我能让注意力较长时间停留在身体感觉上。" },
  { index: 20, dimension: "AR", text: "我能主动选择把注意力放在身体的某个部位上。" },
  { index: 21, dimension: "AR", text: "在和别人交谈或互动时，我仍能保持对身体的觉察。" },
  { index: 22, dimension: "AR", text: "在专注做事的同时，我仍能注意到身体的感觉。" },

  // EA Emotional Awareness (5)
  { index: 23, dimension: "EA", text: "我能注意到不同情绪是如何在身体上呈现的。" },
  { index: 24, dimension: "EA", text: "当愤怒时，我能注意到身体发生了哪些变化。" },
  { index: 25, dimension: "EA", text: "当悲伤时，我能注意到身体感觉的变化。" },
  { index: 26, dimension: "EA", text: "我能在身体里感觉到情绪的存在。" },
  { index: 27, dimension: "EA", text: "当心情变化时，我能在身体上感受到这种变化。" },

  // SR Self-Regulation (4)
  { index: 28, dimension: "SR", text: "心烦的时候，我能通过觉察身体让自己冷静下来。" },
  { index: 29, dimension: "SR", text: "我能通过把注意力放在身体上来调节情绪。" },
  { index: 30, dimension: "SR", text: "紧张时，我能通过身体觉察让自己放松下来。" },
  { index: 31, dimension: "SR", text: "心情低落时，我能从身体感觉中找到一些稳定的力量。" },

  // BL Body Listening (3)
  { index: 32, dimension: "BL", text: "我会倾听身体在告诉我什么。" },
  { index: 33, dimension: "BL", text: "需要做决定时，我会参考身体的感觉。" },
  { index: 34, dimension: "BL", text: "我会留意身体传递的信号并把它当回事。" },

  // TR Trusting (3)
  { index: 35, dimension: "TR", text: "我把自己的身体当作朋友。" },
  { index: 36, dimension: "TR", text: "我信任自己身体的感觉。" },
  { index: 37, dimension: "TR", text: "我感到身体是安全可靠的。" },
];

export const maia2: Scale = {
  id: "maia2",
  slug: "maia2",
  name: "MAIA-2 内感受觉知量表",
  description: "评估 8 个维度的身体觉察、注意调节、信任身体等能力",
  timeFrame: "通常情况下",
  estimatedMinutes: 8,
  isCore: false,
  highIsBetter: true,
  dimensionMaxScore: 5,
  triggers: ["body_disconnect"],
  instructions:
    "下面是关于您与自己身体之间关系的描述。请根据您一般情况下的真实状态作答。"
    + "这些题目没有对错，请如实选择最贴近您日常状态的选项。",
  options: [
    { value: 0, label: "从不", short: "从不" },
    { value: 1, label: "极少" },
    { value: 2, label: "偶尔" },
    { value: 3, label: "有时" },
    { value: 4, label: "大部分时间" },
    { value: 5, label: "总是", short: "总是" },
  ],
  items,
  dimensions: [
    { code: "NOT", name: "觉察 Noticing", itemIndices: [1, 2, 3, 4] },
    {
      code: "ND",
      name: "不分心 Not-Distracting",
      description: "不用分心来逃避身体不适（混合反向题）",
      itemIndices: [5, 6, 7, 8, 9, 10],
    },
    {
      code: "NW",
      name: "不担忧 Not-Worrying",
      description: "面对身体不适时不过度担忧（混合反向题）",
      itemIndices: [11, 12, 13, 14, 15],
    },
    { code: "AR", name: "注意调节 Attention Regulation", itemIndices: [16, 17, 18, 19, 20, 21, 22] },
    { code: "EA", name: "情绪觉察 Emotional Awareness", itemIndices: [23, 24, 25, 26, 27] },
    { code: "SR", name: "自我调节 Self-Regulation", itemIndices: [28, 29, 30, 31] },
    { code: "BL", name: "倾听身体 Body Listening", itemIndices: [32, 33, 34] },
    { code: "TR", name: "信任身体 Trusting", itemIndices: [35, 36, 37] },
  ],
  scoringMethod: "mean",
  severityBands: {
    NOT: defaultBands(),
    ND: defaultBands(),
    NW: defaultBands(),
    AR: defaultBands(),
    EA: defaultBands(),
    SR: defaultBands(),
    BL: defaultBands(),
    TR: defaultBands(),
  },
  citation: "Mehling et al. (2018) PLoS ONE; MAIA-1: Mehling et al. (2012)",
  fullyVerified: false,
  notes:
    "题目内容由 AI 从英文原版翻译。适合做躯体扫描、瑜伽、somatic experiencing 等身体取向课程的基线评估。课程后重测能反映身体觉察能力的提升。",
};

function defaultBands() {
  return [
    { level: "low" as const, label: "较低", min: 0, max: 2 },
    { level: "moderate" as const, label: "中等", min: 2, max: 3.5 },
    { level: "high" as const, label: "较高", min: 3.5, max: 5 },
  ];
}
