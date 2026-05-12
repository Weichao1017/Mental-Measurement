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
    "心理状态会影响一个人完成日常事务的能力。请阅读以下每一项，并根据「心理状态在多大程度上影响你执行该活动的能力」作答。0 = 完全不受影响，8 = 受到非常严重的影响。",
  instructionsEn:
    "Mental health can affect one's ability to do certain day-to-day tasks in their lives. Please read each item below and respond based on how much your mental health impairs your ability to carry out the activity.",
  options: [
    { value: 0, label: "完全不受影响", labelEn: "Not at All", short: "完全不", shortEn: "Not at All" },
    { value: 1, label: "1", labelEn: "1" },
    { value: 2, label: "2 - 轻微影响", labelEn: "2 - Slightly", short: "轻微", shortEn: "Slightly" },
    { value: 3, label: "3", labelEn: "3" },
    { value: 4, label: "4 - 明显影响", labelEn: "4 - Definitely", short: "明显", shortEn: "Definitely" },
    { value: 5, label: "5", labelEn: "5" },
    { value: 6, label: "6 - 显著影响", labelEn: "6 - Markedly", short: "显著", shortEn: "Markedly" },
    { value: 7, label: "7", labelEn: "7" },
    { value: 8, label: "8 - 非常严重影响", labelEn: "8 - Very Severely", short: "非常严重", shortEn: "Very Severely" },
  ],
  items: [
    {
      index: 1,
      dimension: "FN",
      text: "因为我的心理状态，我工作的能力受到影响。0 表示「完全不受影响」，8 表示「严重到我无法工作」。",
      textEn: "Because of my mental health my ability to work is impaired. '0' means 'not at all impaired' and '8' means very severely impaired to the point I can't work.",
      sourceRef: "WSAS Q1",
    },
    {
      index: 2,
      dimension: "FN",
      text: "因为我的心理状态，我做家务（打扫、整理、购物、做饭、照顾家或孩子、缴费）的能力受到影响。",
      textEn: "Because of my mental health my home management (cleaning, tidying, shopping, cooking, looking after home or children, paying bills) is impaired.",
      sourceRef: "WSAS Q2",
    },
    {
      index: 3,
      dimension: "FN",
      text: "因为我的心理状态，我的社交休闲活动（与他人一起，如聚会、酒吧、俱乐部、外出、串门、约会、家中招待）受到影响。",
      textEn: "Because of my mental health my social leisure activities (with other people e.g. parties, bars, clubs, outings, visits, dating, home entertaining) are impaired.",
      sourceRef: "WSAS Q3",
    },
    {
      index: 4,
      dimension: "FN",
      text: "因为我的心理状态，我的私人休闲活动（独自做的事情，如阅读、园艺、收藏、缝纫、独自散步）受到影响。",
      textEn: "Because of my mental health, my private leisure activities (done alone, such as reading, gardening, collecting, sewing, walking alone) are impaired.",
      sourceRef: "WSAS Q4",
    },
    {
      index: 5,
      dimension: "FN",
      text: "因为我的心理状态，我与他人（包括跟我一起生活的人）建立和维持亲密关系的能力受到影响。",
      textEn: "Because of my mental health, my ability to form and maintain close relationships with others, including those I live with, is impaired.",
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
