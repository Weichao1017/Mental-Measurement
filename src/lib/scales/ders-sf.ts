/**
 * DERS-SF 情绪调节困难量表简版（Difficulties in Emotion Regulation Scale - Short Form）
 *
 * ⚠️ 题目内容：经 Claude（AI）从英文原版翻译，未与权威中文修订版逐字核对。
 *    UI 会显示"题库待核对"提示。上线给真实客户前建议参考李英华 (2014)
 *    DERS-36 中文版做权威对齐。
 *
 * ⚠️ 修正：原骨架把 CLA 子量表标记为反向计分，但 Kaufman 2016 DERS-SF 中
 *    选自 DERS-36 的 Clarity 3 题（#4, #5, #9）措辞都是负向（"I have no idea..."），
 *    直接计分即可，不需反向。只有 AWA 子量表（DERS-36 #2, #6, #10，全部正向措辞）
 *    需要反向计分。已在本文件中修正。
 *
 * 来源：
 *   - 短版：Kaufman, E. A., Xia, M., Fosco, G., Yaptangco, M., Skidmore, C. R.,
 *     & Crowell, S. E. (2016). The Difficulties in Emotion Regulation Scale
 *     Short Form (DERS-SF): Validation and replication in adolescent and
 *     adult samples. Journal of Psychopathology and Behavioral Assessment,
 *     38(3), 443-455.
 *   - 原始量表（36 题）：Gratz, K. L., & Roemer, L. (2004). Multidimensional
 *     assessment of emotion regulation and dysregulation. Journal of
 *     Psychopathology and Behavioral Assessment, 26(1), 41-54.
 *   - 中文版（36 题）：李英华, 等. (2014). 情绪调节困难量表中文版的修订. 中国心理卫生杂志.
 *
 * 6 个子量表（共 18 题，每个 3 题）：
 *   - STR  Strategies 策略（策略匮乏感）
 *   - NON  Non-Acceptance 不接纳
 *   - IMP  Impulse 冲动控制
 *   - GOA  Goals 目标
 *   - AWA  Awareness 觉察（反向计分）
 *   - CLA  Clarity 清晰度
 *
 * 计分：5 点 Likert（1=几乎从不 → 5=几乎总是）
 *      所有 18 题求和 → 18-90 分（反向题先翻转）
 *      高分 = 情绪调节困难越多
 */

import type { Scale } from "../types";

export const dersSf: Scale = {
  id: "ders-sf",
  slug: "ders-sf",
  name: "DERS-SF 情绪调节困难量表（简版）",
  description: "评估情绪策略、不接纳、冲动控制、觉察、清晰度等六个维度",
  timeFrame: "通常情况下",
  estimatedMinutes: 4,
  isCore: false,
  highIsBetter: false,
  dimensionMaxScore: 15,
  triggers: ["emotion_dysregulation"],
  instructions:
    "请根据您通常情况下处理情绪的方式，判断每一项陈述对您的符合程度。这里的「心烦」指的是情绪受到较强冲击的状态。",
  options: [
    { value: 1, label: "几乎从不（0-10%）", short: "几乎从不" },
    { value: 2, label: "有时（11-35%）" },
    { value: 3, label: "大约一半时间（36-65%）" },
    { value: 4, label: "大部分时间（66-90%）" },
    { value: 5, label: "几乎总是（91-100%）", short: "几乎总是" },
  ],
  items: [
    // STR Strategies (3 题, 正向措辞, 不反向)
    {
      index: 1,
      dimension: "STR",
      text: "心烦的时候，我相信自己什么也做不了来让自己好起来。",
      sourceRef: "DERS-36 #16",
    },
    {
      index: 2,
      dimension: "STR",
      text: "心烦的时候，我相信这种感觉会持续很长时间。",
      sourceRef: "DERS-36 #28",
    },
    {
      index: 3,
      dimension: "STR",
      text: "心烦的时候，我相信自己最后会陷入很深的低落。",
      sourceRef: "DERS-36 #35",
    },
    // NON Non-Acceptance (3 题, 正向措辞)
    {
      index: 4,
      dimension: "NON",
      text: "心烦的时候，我会因为有这样的情绪而生自己的气。",
      sourceRef: "DERS-36 #11",
    },
    {
      index: 5,
      dimension: "NON",
      text: "心烦的时候，我会因为有这样的情绪而觉得难为情。",
      sourceRef: "DERS-36 #12",
    },
    {
      index: 6,
      dimension: "NON",
      text: "心烦的时候，我会因为这样感觉而觉得自己很糟糕。",
      sourceRef: "DERS-36 #25",
    },
    // IMP Impulse (3 题, 正向措辞)
    {
      index: 7,
      dimension: "IMP",
      text: "心烦的时候，我会失去对自己行为的控制。",
      sourceRef: "DERS-36 #3",
    },
    {
      index: 8,
      dimension: "IMP",
      text: "心烦的时候，我很难管住自己的行为。",
      sourceRef: "DERS-36 #19",
    },
    {
      index: 9,
      dimension: "IMP",
      text: "心烦的时候，我会做出一些之后会后悔的事情。",
      sourceRef: "DERS-36 #24",
    },
    // GOA Goals (3 题, 正向措辞)
    {
      index: 10,
      dimension: "GOA",
      text: "心烦的时候，我很难集中精力做其他事情。",
      sourceRef: "DERS-36 #13",
    },
    {
      index: 11,
      dimension: "GOA",
      text: "心烦的时候，我没办法完成手头正在做的事。",
      sourceRef: "DERS-36 #18",
    },
    {
      index: 12,
      dimension: "GOA",
      text: "心烦的时候，我难以专注于其他事情。",
      sourceRef: "DERS-36 #26",
    },
    // AWA Awareness (3 题, 反向 — 题目正向措辞)
    {
      index: 13,
      dimension: "AWA",
      text: "我会主动关注自己的感受。",
      reverse: true,
      sourceRef: "DERS-36 #2（反向）",
    },
    {
      index: 14,
      dimension: "AWA",
      text: "我能敏锐地察觉到自己的情绪。",
      reverse: true,
      sourceRef: "DERS-36 #6（反向）",
    },
    {
      index: 15,
      dimension: "AWA",
      text: "心烦的时候，我会承认自己确实有这些情绪。",
      reverse: true,
      sourceRef: "DERS-36 #10（反向）",
    },
    // CLA Clarity (3 题, 正向措辞 → 不反向，修正 Cowork 骨架的错误)
    {
      index: 16,
      dimension: "CLA",
      text: "我对自己当下的感受没有头绪。",
      sourceRef: "DERS-36 #4",
    },
    {
      index: 17,
      dimension: "CLA",
      text: "我很难弄明白自己的感受到底是什么。",
      sourceRef: "DERS-36 #5",
    },
    {
      index: 18,
      dimension: "CLA",
      text: "对自己当下的感受，我感到很困惑。",
      sourceRef: "DERS-36 #9",
    },
  ],
  dimensions: [
    { code: "STR", name: "策略 Strategies", itemIndices: [1, 2, 3] },
    { code: "NON", name: "不接纳 Non-Acceptance", itemIndices: [4, 5, 6] },
    { code: "IMP", name: "冲动控制 Impulse", itemIndices: [7, 8, 9] },
    { code: "GOA", name: "目标 Goals", itemIndices: [10, 11, 12] },
    {
      code: "AWA",
      name: "觉察 Awareness（反向）",
      description: "题目正向措辞，反向计分后反映觉察困难程度",
      itemIndices: [13, 14, 15],
    },
    { code: "CLA", name: "清晰度 Clarity", itemIndices: [16, 17, 18] },
  ],
  scoringMethod: "sum",
  severityBands: {
    STR: defaultBandsSubscale(),
    NON: defaultBandsSubscale(),
    IMP: defaultBandsSubscale(),
    GOA: defaultBandsSubscale(),
    AWA: defaultBandsSubscale(),
    CLA: defaultBandsSubscale(),
  },
  citation: "Kaufman et al. (2016); Gratz & Roemer (2004); Chinese: 李英华 et al. (2014)",
  fullyVerified: false,
  notes:
    "题目内容由 AI 从英文原版翻译。每子量表 3 题 × 1-5 分 → 3-15 分。建议作为情绪调节类课程客户的基线与课程后追踪指标。",
};

function defaultBandsSubscale() {
  // 每个子量表 3 题 × 1-5 分 = 3-15 分
  return [
    { level: "low" as const, label: "困难较少", min: 3, max: 7 },
    { level: "moderate" as const, label: "中等", min: 8, max: 11 },
    { level: "high" as const, label: "困难较多", min: 12, max: 15 },
  ];
}
