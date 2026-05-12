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
  description: "量化心理问题对实际生活功能的影响（5 题，约 2 分钟）",
  timeFrame: "当前状况",
  estimatedMinutes: 2,
  isCore: false,
  category: "anxiety_clinical",
  highIsBetter: false,
  dimensionMaxScore: 40,
  instructions:
    "请评估你当前的心理状态（焦虑、抑郁或其它困扰）在多大程度上影响以下方面。0 表示完全没有影响，8 表示影响非常严重。",
  options: [
    { value: 0, label: "完全没有影响", short: "无" },
    { value: 1, label: "1" },
    { value: 2, label: "2 - 轻微影响", short: "轻微" },
    { value: 3, label: "3" },
    { value: 4, label: "4 - 显著影响", short: "显著" },
    { value: 5, label: "5" },
    { value: 6, label: "6 - 严重影响", short: "严重" },
    { value: 7, label: "7" },
    { value: 8, label: "8 - 影响非常严重", short: "非常严重" },
  ],
  items: [
    {
      index: 1,
      dimension: "FN",
      text: "工作能力（如果你目前不工作，可视为「胜任工作的能力」）",
      sourceRef: "WSAS Q1",
    },
    {
      index: 2,
      dimension: "FN",
      text: "家务能力（清洁、整理、煮饭、照顾家、购物、维修等）",
      sourceRef: "WSAS Q2",
    },
    {
      index: 3,
      dimension: "FN",
      text: "社交休闲活动（与他人一起的活动，如聚会、外出吃饭、看电影等）",
      sourceRef: "WSAS Q3",
    },
    {
      index: 4,
      dimension: "FN",
      text: "私人休闲活动（独自做的事情，如读书、园艺、爱好、看电视等）",
      sourceRef: "WSAS Q4",
    },
    {
      index: 5,
      dimension: "FN",
      text: "家庭关系或私人亲密关系",
      sourceRef: "WSAS Q5",
    },
  ],
  dimensions: [
    {
      code: "FN",
      name: "功能损害",
      description: "5 个生活领域的功能影响总和",
      itemIndices: [1, 2, 3, 4, 5],
    },
  ],
  scoringMethod: "sum",
  severityBands: {
    FN: [
      {
        level: "normal",
        label: "基本正常",
        min: 0,
        max: 9,
        clientNote: "目前的心理状态对实际生活功能影响较小。",
      },
      {
        level: "moderate",
        label: "中度功能受损",
        min: 10,
        max: 19,
        clientNote: "心理状态已经在影响生活的几个方面，建议同步关注情绪和功能。",
        teacherNote: "建议同步评估 GAD-7 / PHQ-9，了解症状基线。",
      },
      {
        level: "severe",
        label: "严重功能受损",
        min: 20,
        max: 40,
        clientNote: "心理状态对生活的影响已经较为显著，建议尽快寻求专业支持。",
        teacherNote: "≥ 20 是 Mundt 2002 区分较严重病例的阈值，建议精神科评估。",
      },
    ],
  },
  citation: "Mundt et al. (2002) Br J Psychiatry",
  fullyVerified: false,
  notes:
    "客观反映「心理问题是否把生活搞乱」。与 GAD-7/PHQ-9 配合，可以区分「症状重但功能尚可」与「症状中等但功能崩盘」两种不同临床画像。",
};
