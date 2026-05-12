/**
 * WSAS 工作与社交适应量表（Work and Social Adjustment Scale）
 *
 * 量化焦虑/情绪问题对生活实际功能的影响——比"她说她很焦虑"客观得多。
 *
 * ⚠️ 题目内容：经 Claude 从英文原版翻译，未与权威中文修订版逐字核对。
 *
 * 来源：
 *   - Mundt, J. C., Marks, I. M., Shear, M. K., & Greist, J. H. (2002).
 *     The Work and Social Adjustment Scale: a simple measure of impairment
 *     in functioning. British Journal of Psychiatry, 180, 461-464.
 *
 * 计分：9 档 Likert（0-8），总分 0-40
 * 临床切点（Mundt 2002）：
 *   - 0-9: 基本正常
 *   - 10-20: 中度功能受损
 *   - 20-40: 严重功能受损
 *   - 阈值 20 区分门诊与较严重病例
 */

import type { Scale } from "../types";

export const wsas: Scale = {
  id: "wsas",
  slug: "wsas",
  name: "WSAS 工作与社交适应量表",
  nameEn: "WSAS Work and Social Adjustment Scale",
  description: "量化心理问题对实际生活功能的影响（5 题，约 2 分钟）",
  descriptionEn: "Quantify the impact of psychological problems on real-life functioning (5 items, ~2 min)",
  timeFrame: "当前状况",
  timeFrameEn: "Current state",
  estimatedMinutes: 2,
  isCore: false,
  category: "anxiety_clinical",
  highIsBetter: false,
  dimensionMaxScore: 40,
  instructions:
    "请评估你当前的心理状态（焦虑、抑郁或其它困扰）在多大程度上影响以下方面。0 表示完全没有影响，8 表示影响非常严重。",
  instructionsEn:
    "Rate how much your current psychological state (anxiety, depression, or other distress) impairs each of the following. 0 = no impairment at all; 8 = very severe impairment.",
  options: [
    { value: 0, label: "完全没有影响", labelEn: "No impairment at all", short: "无", shortEn: "None" },
    { value: 1, label: "1", labelEn: "1" },
    { value: 2, label: "2 - 轻微影响", labelEn: "2 - Slight", short: "轻微", shortEn: "Slight" },
    { value: 3, label: "3", labelEn: "3" },
    { value: 4, label: "4 - 显著影响", labelEn: "4 - Definitely", short: "显著", shortEn: "Definite" },
    { value: 5, label: "5", labelEn: "5" },
    { value: 6, label: "6 - 严重影响", labelEn: "6 - Markedly", short: "严重", shortEn: "Marked" },
    { value: 7, label: "7", labelEn: "7" },
    { value: 8, label: "8 - 影响非常严重", labelEn: "8 - Very severe", short: "非常严重", shortEn: "V.severe" },
  ],
  items: [
    {
      index: 1,
      dimension: "FN",
      text: "工作能力（如果你目前不工作，可视为「胜任工作的能力」）",
      textEn: "Ability to work (if you don't currently work, consider 'ability to do work-like tasks')",
      sourceRef: "WSAS Q1",
    },
    {
      index: 2,
      dimension: "FN",
      text: "家务能力（清洁、整理、煮饭、照顾家、购物、维修等）",
      textEn: "Home management (cleaning, tidying, cooking, looking after home, shopping, repairs)",
      sourceRef: "WSAS Q2",
    },
    {
      index: 3,
      dimension: "FN",
      text: "社交休闲活动（与他人一起的活动，如聚会、外出吃饭、看电影等）",
      textEn: "Social leisure activities (with other people — parties, eating out, movies, etc.)",
      sourceRef: "WSAS Q3",
    },
    {
      index: 4,
      dimension: "FN",
      text: "私人休闲活动（独自做的事情，如读书、园艺、爱好、看电视等）",
      textEn: "Private leisure activities (done alone — reading, gardening, hobbies, watching TV, etc.)",
      sourceRef: "WSAS Q4",
    },
    {
      index: 5,
      dimension: "FN",
      text: "家庭关系或私人亲密关系",
      textEn: "Family relationships or close personal relationships",
      sourceRef: "WSAS Q5",
    },
  ],
  dimensions: [
    {
      code: "FN",
      name: "功能损害",
      nameEn: "Functional impairment",
      description: "5 个生活领域的功能影响总和",
      descriptionEn: "Sum of functional impact across 5 life domains",
      itemIndices: [1, 2, 3, 4, 5],
    },
  ],
  scoringMethod: "sum",
  severityBands: {
    FN: [
      { level: "normal", label: "基本正常", labelEn: "Mostly normal", min: 0, max: 9 },
      { level: "moderate", label: "中度功能受损", labelEn: "Moderate impairment", min: 10, max: 19 },
      { level: "severe", label: "严重功能受损", labelEn: "Severe impairment", min: 20, max: 40 },
    ],
  },
  citation: "Mundt et al. (2002) Br J Psychiatry",
  fullyVerified: false,
  notes:
    "客观反映「心理问题是否把生活搞乱」。与 GAD-7/PHQ-9 配合，可以区分「症状重但功能尚可」与「症状中等但功能崩盘」两种不同临床画像。",
};
