/**
 * WHO-5 主观幸福感指数（World Health Organization Five Well-Being Index）
 *
 * 5 题、6 级评分（0-5）、覆盖过去两周。
 * 原始分 × 4 → 0-100 转换分。
 * 国际通用切点：
 *   - 转换分 ≤ 50：幸福感偏低，建议进一步评估
 *   - 转换分 ≤ 28：抑郁可能（建议做 ICD-10 抑郁评估或 PHQ-9 进一步筛查）
 *
 * 简体中文译本来源：
 *   - WHO Collaborating Centre in Mental Health (Psychiatric Research Unit,
 *     Frederiksborg General Hospital, Denmark) 维护的官方 WHO-5 多语言版本中的简体中文版
 *   - 网址：https://www.psykiatri-regionh.dk/who-5/
 *
 * 引用：
 *   Topp, C. W., Østergaard, S. D., Søndergaard, S., & Bech, P. (2015).
 *   The WHO-5 Well-Being Index: a systematic review of the literature.
 *   Psychotherapy and Psychosomatics, 84(3), 167-176.
 */

import type { Scale } from "../types";

export const who5: Scale = {
  id: "who5",
  slug: "who5",
  name: "WHO-5 主观幸福感指数",
  description: "评估过去两周内主观幸福感水平（正向情绪、活力、生活兴趣）",
  timeFrame: "过去两周",
  estimatedMinutes: 1,
  isCore: false,
  highIsBetter: true,
  dimensionMaxScore: 100,
  triggers: ["wellbeing"],
  instructions:
    "下列陈述描述了您在过去两周内的感受。请在每一项中选择最贴近您实际情况的选项。",
  options: [
    { value: 5, label: "所有时间都是这样", short: "总是" },
    { value: 4, label: "大部分时间是这样", short: "大部分时间" },
    { value: 3, label: "超过一半时间是这样", short: "多于一半" },
    { value: 2, label: "不到一半时间是这样", short: "少于一半" },
    { value: 1, label: "偶尔是这样", short: "偶尔" },
    { value: 0, label: "从来没有", short: "从来没有" },
  ],
  items: [
    { index: 1, dimension: "WB", text: "我感到心情愉悦，精神振作" },
    { index: 2, dimension: "WB", text: "我感到平静、放松" },
    { index: 3, dimension: "WB", text: "我感到充满活力，积极向上" },
    { index: 4, dimension: "WB", text: "我醒来时感到精神饱满，得到了休息" },
    { index: 5, dimension: "WB", text: "我的日常生活中充满了我感兴趣的事" },
  ],
  dimensions: [
    {
      code: "WB",
      name: "主观幸福感 Well-being",
      description: "正向情绪、活力、对生活的兴趣",
      itemIndices: [1, 2, 3, 4, 5],
    },
  ],
  scoringMethod: "sum_times_4",
  severityBands: {
    WB: [
      {
        level: "low",
        label: "幸福感较低（建议进一步抑郁筛查）",
        min: 0,
        max: 28,
        clientNote: "过去两周积极感受较少。如果这种状态持续，建议向专业人士寻求支持。",
        teacherNote: "建议补做 PHQ-9 或考虑转介。课程上以稳态化、安全感建立为优先。",
      },
      {
        level: "low",
        label: "幸福感偏低",
        min: 29,
        max: 50,
        clientNote: "过去两周积极体验不算充分，正念与自我关怀练习可能对你有帮助。",
        teacherNote: "可作为基线，重点关注课程后 WHO-5 是否上升。",
      },
      {
        level: "normal",
        label: "幸福感处于中等水平",
        min: 51,
        max: 70,
        clientNote: "你的积极体验在中等水平，仍有提升空间。",
        teacherNote: "稳态基线，关注个体化主诉。",
      },
      {
        level: "high",
        label: "幸福感良好",
        min: 71,
        max: 100,
        clientNote: "你过去两周整体感受不错，继续保持。",
        teacherNote: "已有较好基线，课程可侧重深化与维持。",
      },
    ],
  },
  citation: "Topp et al. (2015); WHO Collaborating Centre in Mental Health (Frederiksborg)",
  fullyVerified: true,
  notes:
    "建议作为课程前测/中测/后测的核心追踪指标。WHO-5 转换分变化 ≥ 10 分被视为有意义的改变（Topp et al., 2015）。",
};
