/**
 * ECR-12 亲密关系经验量表简版（Experiences in Close Relationships – Short Form）
 *
 * ⚠️ 题目内容：经 Claude（AI）从英文原版翻译，未与权威中文修订版逐字核对。
 *    UI 会显示"题库待核对"提示。上线给真实客户前建议参考李同归 & 加藤和生 (2006)
 *    ECR 中文版（虽然是 36 题版本，可抽对应 12 题）。
 *
 * 来源（采用 Wei 2007 短版）：
 *   - Wei, M., Russell, D. W., Mallinckrodt, B., & Vogel, D. L. (2007).
 *     The Experiences in Close Relationship Scale (ECR)-Short Form:
 *     Reliability, validity, and factor structure.
 *     Journal of Personality Assessment, 88(2), 187-204.
 *   - 原始量表（36 题）：Brennan, K. A., Clark, C. L., & Shaver, P. R. (1998).
 *     Self-report measurement of adult attachment: An integrative overview.
 *   - 中文版（36 题）：李同归, 加藤和生. (2006). 成人依恋的测量：
 *     亲密关系经历量表（ECR）中文版. 心理学报, 38(3), 399-406.
 *
 * 2 个子量表，每个 6 题：
 *   - ANX  Anxiety 依恋焦虑（担心被抛弃 / 渴望亲近被拒绝）—— 全部正向计分
 *   - AVO  Avoidance 依恋回避（不愿意亲密 / 不信任他人）—— 含 3 题反向计分
 *
 * 计分：7 点 Likert（1=非常不同意 → 7=非常同意）
 *      各子量表 6 题求均值 → 1-7 分（反向题先翻转）
 */

import type { Scale } from "../types";

export const ecr12: Scale = {
  id: "ecr12",
  slug: "ecr12",
  name: "ECR-12 亲密关系经验量表（短版）",
  description: "测量依恋焦虑（担心被抛弃）与依恋回避（不愿意亲密）两个维度",
  timeFrame: "通常情况下",
  estimatedMinutes: 3,
  isCore: false,
  highIsBetter: false,
  dimensionMaxScore: 7,
  triggers: ["relationship_issues"],
  instructions:
    "下面是关于您在亲密关系（恋人/伴侣）中感受的描述。请根据您一般情况下在这类关系中的真实感受作答。如果您目前没有恋爱关系，请回想过去最近的一段关系或假想一段关系来回答。",
  options: [
    { value: 1, label: "非常不同意", short: "非常不同意" },
    { value: 2, label: "不同意" },
    { value: 3, label: "略不同意" },
    { value: 4, label: "中立" },
    { value: 5, label: "略同意" },
    { value: 6, label: "同意" },
    { value: 7, label: "非常同意", short: "非常同意" },
  ],
  items: [
    {
      index: 1,
      dimension: "ANX",
      text: "我担心自己会被抛弃。",
      sourceRef: "ECR-36 Anxiety",
    },
    {
      index: 2,
      dimension: "AVO",
      text: "我会尽量避免和伴侣走得太近。",
      sourceRef: "ECR-36 Avoidance",
    },
    {
      index: 3,
      dimension: "ANX",
      text: "我对自己的恋爱/亲密关系常常感到很担心。",
      sourceRef: "ECR-36 Anxiety",
    },
    {
      index: 4,
      dimension: "AVO",
      text: "可以依靠伴侣让我感到很舒服。",
      reverse: true,
      sourceRef: "ECR-36 Avoidance（反向）",
    },
    {
      index: 5,
      dimension: "ANX",
      text: "我担心伴侣并不像我在乎他/她那样在乎我。",
      sourceRef: "ECR-36 Anxiety",
    },
    {
      index: 6,
      dimension: "AVO",
      text: "当伴侣想要和我靠得太近时，我会感到紧张。",
      sourceRef: "ECR-36 Avoidance",
    },
    {
      index: 7,
      dimension: "ANX",
      text: "我渴望和伴侣非常亲近，但这种渴望有时反而把对方推开了。",
      sourceRef: "ECR-36 Anxiety",
    },
    {
      index: 8,
      dimension: "AVO",
      text: "需要的时候向伴侣求助，对我来说是一件自然且有帮助的事。",
      reverse: true,
      sourceRef: "ECR-36 Avoidance（反向）",
    },
    {
      index: 9,
      dimension: "ANX",
      text: "我需要伴侣不断地向我确认他/她是爱我的。",
      sourceRef: "ECR-36 Anxiety",
    },
    {
      index: 10,
      dimension: "AVO",
      text: "我想和伴侣走得更近，但同时又会忍不住后退一步。",
      sourceRef: "ECR-36 Avoidance",
    },
    {
      index: 11,
      dimension: "ANX",
      text: "我感觉伴侣并不像我希望的那样想要和我亲近。",
      sourceRef: "ECR-36 Anxiety",
    },
    {
      index: 12,
      dimension: "AVO",
      text: "我会把几乎所有事情都告诉伴侣，包括自己的脆弱。",
      reverse: true,
      sourceRef: "ECR-36 Avoidance（反向）",
    },
  ],
  dimensions: [
    {
      code: "ANX",
      name: "依恋焦虑 Anxiety",
      description: "担心被抛弃、对伴侣回应过度敏感、需要持续被确认爱意",
      itemIndices: [1, 3, 5, 7, 9, 11],
    },
    {
      code: "AVO",
      name: "依恋回避 Avoidance",
      description: "回避亲密、难以依赖他人、不愿暴露脆弱",
      itemIndices: [2, 4, 6, 8, 10, 12],
    },
  ],
  scoringMethod: "mean",
  severityBands: {
    ANX: [
      { level: "low", label: "低依恋焦虑（更安全）", min: 1, max: 3 },
      { level: "moderate", label: "中等", min: 3, max: 5 },
      { level: "high", label: "高依恋焦虑", min: 5, max: 7 },
    ],
    AVO: [
      { level: "low", label: "低依恋回避（更安全）", min: 1, max: 3 },
      { level: "moderate", label: "中等", min: 3, max: 5 },
      { level: "high", label: "高依恋回避", min: 5, max: 7 },
    ],
  },
  citation: "Wei et al. (2007); Chinese: 李同归 & 加藤和生 (2006)",
  fullyVerified: false,
  notes:
    "题目内容由 AI 从英文原版翻译，建议上线前与李同归 (2006) ECR-36 中文版对齐。依恋焦虑 + 回避两个维度可组合成 4 种依恋风格（安全/痴迷/疏离/恐惧），后续可以在结果页加象限可视化。",
};
