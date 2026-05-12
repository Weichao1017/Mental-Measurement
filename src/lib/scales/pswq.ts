/**
 * PSWQ 宾州州立担忧问卷（Penn State Worry Questionnaire）
 *
 * 专门测量慢性担忧的强度——区分"情境性担忧"（事件触发）与"特质性担忧"（持续模式）。
 * 适合"脑子转得很快、停不下来"的画像。
 *
 * ⚠️ 题目内容：经 Claude 从英文原版翻译，未与权威中文修订版（钟杰 2008 等）逐字核对。
 *
 * 来源：
 *   - Meyer, T. J., Miller, M. L., Metzger, R. L., & Borkovec, T. D. (1990).
 *     Development and validation of the Penn State Worry Questionnaire.
 *     Behaviour Research and Therapy, 28(6), 487-495.
 *   - 中文版：钟杰, 李波, 钱铭怡. (2008). 中文版宾州担忧问卷在大学生人群中的修订.
 *
 * 计分：5 档 Likert（1-5），含 5 道反向题（#1, #3, #8, #10, #11）
 *      总分（反向后）：16-80
 * 临床切点（Meyer 1990 / Behar 2009）：
 *   - < 45: 低担忧
 *   - 45-59: 中度担忧
 *   - ≥ 60: 高担忧（GAD 患者均值约 67-68）
 */

import type { Scale } from "../types";

export const pswq: Scale = {
  id: "pswq",
  slug: "pswq",
  name: "PSWQ 宾州州立担忧问卷",
  description: "测量慢性担忧倾向——「脑子转个不停」模式的临床量化（16 题，约 4 分钟）",
  timeFrame: "通常情况下",
  estimatedMinutes: 4,
  isCore: false,
  category: "anxiety_clinical",
  highIsBetter: false,
  dimensionMaxScore: 80,
  instructions:
    "请根据下面每句话描述你的程度作答，1 表示完全不像我，5 表示非常像我。请如实选择，没有标准答案。",
  options: [
    { value: 1, label: "完全不像我", short: "完全不像" },
    { value: 2, label: "不太像我", short: "不太像" },
    { value: 3, label: "有些像我", short: "有些像" },
    { value: 4, label: "比较像我", short: "比较像" },
    { value: 5, label: "非常像我", short: "非常像" },
  ],
  items: [
    { index: 1, dimension: "WO", text: "如果我没有时间做完所有事，我也不会担心", reverse: true, sourceRef: "PSWQ #1 (R)" },
    { index: 2, dimension: "WO", text: "我的担忧让我感到不安", sourceRef: "PSWQ #2" },
    { index: 3, dimension: "WO", text: "我倾向于不太担心事情", reverse: true, sourceRef: "PSWQ #3 (R)" },
    { index: 4, dimension: "WO", text: "许多情境会让我担心", sourceRef: "PSWQ #4" },
    { index: 5, dimension: "WO", text: "我知道自己不该担心，但就是控制不住", sourceRef: "PSWQ #5" },
    { index: 6, dimension: "WO", text: "当我承受压力时，我会担心得很厉害", sourceRef: "PSWQ #6" },
    { index: 7, dimension: "WO", text: "我总在为某些事情担心", sourceRef: "PSWQ #7" },
    { index: 8, dimension: "WO", text: "我能很容易把烦心的念头搁置一边", reverse: true, sourceRef: "PSWQ #8 (R)" },
    { index: 9, dimension: "WO", text: "一项任务一做完，我立刻开始担心下一件可能要做的事", sourceRef: "PSWQ #9" },
    { index: 10, dimension: "WO", text: "我从不担心任何事情", reverse: true, sourceRef: "PSWQ #10 (R)" },
    {
      index: 11,
      dimension: "WO",
      text: "当一件事已经无能为力时，我就不会再担心它",
      reverse: true,
      sourceRef: "PSWQ #11 (R)",
    },
    { index: 12, dimension: "WO", text: "我从小到大一直是个担心很多的人", sourceRef: "PSWQ #12" },
    { index: 13, dimension: "WO", text: "我留意到自己总是在担心事情", sourceRef: "PSWQ #13" },
    { index: 14, dimension: "WO", text: "一旦开始担心，我就停不下来", sourceRef: "PSWQ #14" },
    { index: 15, dimension: "WO", text: "我一直在担心", sourceRef: "PSWQ #15" },
    { index: 16, dimension: "WO", text: "对于即将到来的计划，我会担心", sourceRef: "PSWQ #16" },
  ],
  dimensions: [
    {
      code: "WO",
      name: "担忧倾向",
      description: "慢性担忧的强度（含 5 道反向题已自动翻转）",
      itemIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    },
  ],
  scoringMethod: "sum",
  severityBands: {
    WO: [
      {
        level: "low",
        label: "低担忧",
        min: 16,
        max: 44,
        clientNote: "担忧水平在常规范围。",
      },
      {
        level: "moderate",
        label: "中度担忧",
        min: 45,
        max: 59,
        clientNote: "担忧已经成为一定模式，正念、认知行为练习可能帮助打断 spiral。",
        teacherNote: "CBT for worry / 元认知治疗（MCT）适用。",
      },
      {
        level: "high",
        label: "高担忧（GAD 谱系）",
        min: 60,
        max: 80,
        clientNote: "担忧已成为持续的特质模式，建议结合 GAD-7 评估并寻求专业支持。",
        teacherNote: "Behar 2009: GAD 患者均值约 67-68；建议 GAD-7 + 元认知治疗。",
      },
    ],
  },
  citation: "Meyer et al. (1990); Chinese: 钟杰 et al. (2008)",
  fullyVerified: false,
  notes:
    "区分情境性担忧 vs 特质性担忧。≥ 60 提示已形成持续担忧模式，元认知治疗（MCT）效果较好。",
};
