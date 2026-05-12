/**
 * FFMQ-15 五因素正念量表 15 题短版
 *
 * ⚠️ 题目内容：经 Claude（AI）从英文原版翻译，未与权威中文修订版逐字核对。
 *    UI 会显示"题库待核对"提示。上线给真实客户前建议参考 Deng et al. (2011)
 *    中文 FFMQ-39 修订版，把对应 15 题的中文措辞替换为权威版本。
 *
 * 来源：
 *   - 短版结构：Gu, J., Strauss, C., Crane, C., Barnhofer, T., Karl, A.,
 *     Cavanagh, K., & Kuyken, W. (2016). Examining the Factor Structure of the
 *     39-Item and 15-Item Versions of the Five Facets Mindfulness Questionnaire
 *     Before and After Mindfulness-Based Cognitive Therapy for People with
 *     Recurrent Depression. Psychological Assessment, 28(7), 791-802.
 *   - 原始量表（39 题）：Baer, R. A., Smith, G. T., Hopkins, J., Krietemeyer, J.,
 *     & Toney, L. (2006). Using self-report assessment methods to explore facets
 *     of mindfulness. Assessment, 13(1), 27-45.
 *   - 中文版（39 题）：Deng, Y.Q., Liu, X.H., Rodriguez, M.A., & Xia, C.Y. (2011).
 *     The Five Facet Mindfulness Questionnaire: Psychometric Properties of the
 *     Chinese Version. Mindfulness, 2(2), 123-128.
 *
 * 五个 facet（每 facet 3 题）：
 *   - OBS Observing（觉察）
 *   - DES Describing（描述）
 *   - AWA Acting with Awareness（有觉知地行动）—— 全反向
 *   - NJ  Non-judging of inner experience（不评判）—— 全反向
 *   - NR  Non-reactivity to inner experience（不反应）
 *
 * 计分：5 点 Likert（1=从未/非常少 → 5=非常经常/总是）
 * 报告：每个 facet 求和 → 3-15 分，越高越好（反向题已翻转后）
 */

import type { Scale } from "../types";

export const ffmq15: Scale = {
  id: "ffmq15",
  slug: "ffmq15",
  name: "FFMQ-15 五因素正念量表（短版）",
  nameEn: "FFMQ-15 Five Facet Mindfulness Questionnaire (Short)",
  description: "测量当下觉察、描述、不评判、不反应等正念能力的五个维度",
  descriptionEn: "Measures five facets of mindfulness: observing, describing, acting with awareness, non-judging, non-reactivity",
  timeFrame: "通常情况下",
  timeFrameEn: "Generally",
  estimatedMinutes: 3,
  isCore: false,
  highIsBetter: true,
  dimensionMaxScore: 15,
  triggers: ["mindfulness"],
  instructions:
    "请根据您一般情况下的真实状态判断每一项陈述对您的符合程度，不要在任何一项上花太多时间。",
  options: [
    { value: 1, label: "从未或非常少这样", short: "从未" },
    { value: 2, label: "偶尔这样" },
    { value: 3, label: "有时这样" },
    { value: 4, label: "经常这样" },
    { value: 5, label: "非常经常或总是这样", short: "总是" },
  ],
  items: [
    {
      index: 1,
      dimension: "OBS",
      text: "走路时，我会留意身体移动时的感觉。",
      sourceRef: "FFMQ-39 #1",
    },
    {
      index: 2,
      dimension: "DES",
      text: "我能很好地找到合适的词来描述自己的感受。",
      sourceRef: "FFMQ-39 #2",
    },
    {
      index: 3,
      dimension: "AWA",
      text: "我做事时常常匆忙赶进度，并不真正专注于此刻在做的事。",
      reverse: true,
      sourceRef: "FFMQ-39 #5",
    },
    {
      index: 4,
      dimension: "NJ",
      text: "当我感受到某种情绪时，我会告诉自己不该有这种感受。",
      reverse: true,
      sourceRef: "FFMQ-39 #10",
    },
    {
      index: 5,
      dimension: "NR",
      text: "通常我能觉察自己的感受和情绪，而不需要立即对它们做出反应。",
      sourceRef: "FFMQ-39 #19",
    },
    {
      index: 6,
      dimension: "OBS",
      text: "洗澡或泡澡时，我会留意水流接触皮肤的感觉。",
      sourceRef: "FFMQ-39 #11",
    },
    {
      index: 7,
      dimension: "DES",
      text: "我能很轻松地把自己的信念、观点和期待用语言表达出来。",
      sourceRef: "FFMQ-39 #16",
    },
    {
      index: 8,
      dimension: "AWA",
      text: "我做事时常常没有真正用心，像是在自动驾驶一样。",
      reverse: true,
      sourceRef: "FFMQ-39 #8",
    },
    {
      index: 9,
      dimension: "NJ",
      text: "我觉得自己的某些情绪是不好的或不恰当的，本不应该有。",
      reverse: true,
      sourceRef: "FFMQ-39 #14",
    },
    {
      index: 10,
      dimension: "NR",
      text: "处境艰难时，我能停下来，不立刻做出反应。",
      sourceRef: "FFMQ-39 #21",
    },
    {
      index: 11,
      dimension: "OBS",
      text: "我会留意周围环境中细微的事物，比如声音、气味、阳光、风等。",
      sourceRef: "FFMQ-39 #15",
    },
    {
      index: 12,
      dimension: "DES",
      text: "即使心情非常糟糕，我也能找到方式把它说出来。",
      sourceRef: "FFMQ-39 #27",
    },
    {
      index: 13,
      dimension: "AWA",
      text: "我发现自己常常心不在焉地做着各种事情。",
      reverse: true,
      sourceRef: "FFMQ-39 #13",
    },
    {
      index: 14,
      dimension: "NJ",
      text: "当我有不合理或不恰当的情绪时，我会责备自己。",
      reverse: true,
      sourceRef: "FFMQ-39 #17",
    },
    {
      index: 15,
      dimension: "NR",
      text: "当烦扰的念头或画面出现时，我能看见它们，然后让它们流过去。",
      sourceRef: "FFMQ-39 #24",
    },
  ],
  dimensions: [
    {
      code: "OBS",
      name: "觉察 Observing",
      description: "对内外部体验的觉察能力",
      itemIndices: [1, 6, 11],
    },
    {
      code: "DES",
      name: "描述 Describing",
      description: "用语言描述内部体验的能力",
      itemIndices: [2, 7, 12],
    },
    {
      code: "AWA",
      name: "有觉知地行动 Acting with Awareness",
      description: "在当下行动而非自动驾驶（反向题）",
      itemIndices: [3, 8, 13],
    },
    {
      code: "NJ",
      name: "不评判 Non-judging",
      description: "对内部体验的不评判态度（反向题）",
      itemIndices: [4, 9, 14],
    },
    {
      code: "NR",
      name: "不反应 Non-reactivity",
      description: "面对情绪/想法时不被牵着走的能力",
      itemIndices: [5, 10, 15],
    },
  ],
  scoringMethod: "sum",
  severityBands: {
    OBS: [
      { level: "low", label: "偏弱", min: 3, max: 7 },
      { level: "moderate", label: "中等", min: 8, max: 11 },
      { level: "high", label: "较强", min: 12, max: 15 },
    ],
    DES: [
      { level: "low", label: "偏弱", min: 3, max: 7 },
      { level: "moderate", label: "中等", min: 8, max: 11 },
      { level: "high", label: "较强", min: 12, max: 15 },
    ],
    AWA: [
      { level: "low", label: "偏弱", min: 3, max: 7 },
      { level: "moderate", label: "中等", min: 8, max: 11 },
      { level: "high", label: "较强", min: 12, max: 15 },
    ],
    NJ: [
      { level: "low", label: "偏弱", min: 3, max: 7 },
      { level: "moderate", label: "中等", min: 8, max: 11 },
      { level: "high", label: "较强", min: 12, max: 15 },
    ],
    NR: [
      { level: "low", label: "偏弱", min: 3, max: 7 },
      { level: "moderate", label: "中等", min: 8, max: 11 },
      { level: "high", label: "较强", min: 12, max: 15 },
    ],
  },
  citation: "Gu et al. (2016); Baer et al. (2006); Chinese version: Deng et al. (2011)",
  fullyVerified: false,
  notes:
    "题目内容由 AI 从英文原版翻译，建议上线给真实客户前与 Deng et al. (2011) 中文版对齐。FFMQ 适合作为正念练习课程前后效果追踪的核心指标。",
};
