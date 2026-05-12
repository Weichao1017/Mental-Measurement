/**
 * GAD-7 广泛性焦虑量表（Generalized Anxiety Disorder 7-item）
 *
 * 焦虑领域的金标准筛查工具。约 2 分钟做完。
 *
 * ⚠️ 题目内容：经 Claude 从英文原版翻译，未与权威中文修订版（何筱衍 2010 / Spitzer 2006 中文版）逐字核对。
 *
 * 来源：
 *   - Spitzer, R. L., Kroenke, K., Williams, J. B. W., & Löwe, B. (2006).
 *     A brief measure for assessing generalized anxiety disorder: the GAD-7.
 *     Archives of Internal Medicine, 166(10), 1092-1097.
 *   - 中文版：何筱衍, 李春波, 钱洁, 万玉美, 鲍秋玲, 严尚谊. (2010).
 *     广泛性焦虑量表在综合性医院的信度和效度. 上海精神医学, 22(4), 200-203.
 *
 * 计分：4 档 Likert（0-3），总分 0-21
 * 临床切点：
 *   - 0-4: 无焦虑症状
 *   - 5-9: 轻度焦虑
 *   - 10-14: 中度焦虑
 *   - 15-21: 重度焦虑（建议专业评估）
 * 切点 ≥ 10 灵敏度 89%，特异度 82%（对应 GAD 临床诊断）
 */

import type { Scale } from "../types";

export const gad7: Scale = {
  id: "gad7",
  slug: "gad7",
  name: "GAD-7 广泛性焦虑量表",
  description: "焦虑领域的金标准筛查（7 题，约 2 分钟）",
  timeFrame: "过去两周",
  estimatedMinutes: 2,
  isCore: false,
  category: "anxiety_clinical",
  highIsBetter: false,
  dimensionMaxScore: 21,
  instructions:
    "在过去 2 周里，您被以下问题困扰的频率是？请如实选择最贴近您实际状态的选项。",
  options: [
    { value: 0, label: "完全没有", short: "没有" },
    { value: 1, label: "好几天", short: "好几天" },
    { value: 2, label: "超过一半的天数", short: "过半" },
    { value: 3, label: "几乎每天", short: "几乎每天" },
  ],
  items: [
    { index: 1, dimension: "GAD", text: "感到紧张、焦虑或心里发慌", sourceRef: "GAD-7 #1" },
    { index: 2, dimension: "GAD", text: "无法停止或控制担忧", sourceRef: "GAD-7 #2" },
    { index: 3, dimension: "GAD", text: "对各种各样的事情担心过多", sourceRef: "GAD-7 #3" },
    { index: 4, dimension: "GAD", text: "很难放松下来", sourceRef: "GAD-7 #4" },
    { index: 5, dimension: "GAD", text: "由于坐立不安而难以保持安静", sourceRef: "GAD-7 #5" },
    { index: 6, dimension: "GAD", text: "容易烦躁或易怒", sourceRef: "GAD-7 #6" },
    { index: 7, dimension: "GAD", text: "感到害怕，好像有可怕的事情要发生", sourceRef: "GAD-7 #7" },
  ],
  dimensions: [
    {
      code: "GAD",
      name: "广泛性焦虑",
      description: "过去两周内焦虑症状的强度与频率",
      itemIndices: [1, 2, 3, 4, 5, 6, 7],
    },
  ],
  scoringMethod: "sum",
  severityBands: {
    GAD: [
      {
        level: "normal",
        label: "无焦虑症状",
        min: 0,
        max: 4,
        clientNote: "过去两周的焦虑水平在常规范围内。",
        teacherNote: "无需特别干预，关注是否有其它共病因素。",
      },
      {
        level: "mild",
        label: "轻度焦虑",
        min: 5,
        max: 9,
        clientNote: "出现了一些焦虑信号，正念、自我关怀练习可能有帮助。",
        teacherNote: "适合心理咨询 / 正念课程介入，关注是否伴随抑郁。",
      },
      {
        level: "moderate",
        label: "中度焦虑",
        min: 10,
        max: 14,
        clientNote: "焦虑已经较为持续，建议向专业心理工作者咨询。",
        teacherNote: "建议进一步评估（含 PHQ-9 抑郁、MDQ 双相筛查），上 SSRI 之前先排除双相。",
      },
      {
        level: "severe",
        label: "重度焦虑",
        min: 15,
        max: 21,
        clientNote: "焦虑水平较高，强烈建议尽快寻求专业精神科 / 心理科评估。",
        teacherNote: "高优先级专业转介；同时筛查 PHQ-9、MDQ、WSAS；GP 上 SSRI 前必查双相。",
      },
    ],
  },
  citation: "Spitzer et al. (2006); Chinese: 何筱衍 et al. (2010)",
  fullyVerified: false,
  notes:
    "焦虑筛查金标准。≥10 分对应中度以上焦虑，建议同时做 PHQ-9（抑郁共病筛查）和 MDQ（双相筛查，SSRI 处方前必查）。",
};
