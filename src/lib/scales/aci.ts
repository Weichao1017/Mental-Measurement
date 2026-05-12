/**
 * ACI 成人注意力量表 / CDS-A 认知脱离综合征-成人版
 * （Adult Concentration Inventory）
 *
 * 测量"认知脱离综合征 / Cognitive Disengagement Syndrome"（CDS，原 SCT
 * Sluggish Cognitive Tempo）：发呆、走神、脑雾、慢、白日梦、容易疲倦等
 * "安静走神型"症状。
 *
 * 用途：
 *  - ADHD 鉴别诊断的关键补充。ASRS 偏多动 / 注意力涣散外化型，对内化型
 *    （女性高发、高 IQ compensation 群体）灵敏度低，ACI 补这个空白
 *  - CDS 跟 ADHD inattention 重叠但独立 — Becker 2017 验证显示 CDS 跟焦虑/抑郁也有重叠
 *  - 适合"我注意力有问题但 ASRS 阴性"的用户进一步评估
 *
 * ⚠️ 中文：经 AI 从英文原版翻译，未与权威中文修订版对齐（CDS 概念较新，
 *    中国大陆尚未广泛标准化中文版）。
 *
 * 来源：
 *   - Becker, S. P., Burns, G. L., Leopold, D. R., Olson, R. K., & Willcutt,
 *     E. G. (2017). Sluggish cognitive tempo in adults: Psychometric
 *     validation of the Adult Concentration Inventory. Psychological
 *     Assessment. （16 题 verbatim 取自 Table 1）
 *   - Fredrick et al. (2022) JPA — Structural and external validity 验证
 *   - 概念更新：Becker et al. (2023) 将 SCT 重命名为 CDS（Cognitive
 *     Disengagement Syndrome）
 *
 * 计分：4 档 Likert（0-3），总分 0-48
 * 切点参考（基于 Becker 2017 N=480 成人样本，mean ≈ 14, SD ≈ 8）：
 *   - 0-13: 无显著 CDS 迹象
 *   - 14-21: 轻度（约 1 SD 内）
 *   - 22-29: 中度（> 1 SD）
 *   - ≥ 30: 显著（> 2 SD，临床关注）
 * CDS 不是 DSM 诊断，切点是经验性参考，不构成诊断标准。
 */

import type { Scale } from "../types";

export const aci: Scale = {
  id: "aci",
  slug: "aci",
  name: "ACI 成人注意力量表 / CDS-A",
  nameEn: "ACI — Adult Concentration Inventory (CDS-A)",
  description:
    "测量「安静走神 / 脑雾 / 慢」型注意力问题；ADHD 内化型与高 compensation 群体的关键补充评估（16 题，约 4 分钟）",
  descriptionEn:
    "Measures 'quiet daydreaming / mental fog / slow' attention problems; key supplement for ADHD inattentive subtype and high-compensation profiles (16 items, ~4 min)",
  timeFrame: "过去 6 个月",
  timeFrameEn: "Past 6 months",
  estimatedMinutes: 4,
  isCore: false,
  category: "anxiety_clinical",
  highIsBetter: false,
  dimensionMaxScore: 48,
  instructions:
    "请评估下列描述跟你在过去 6 个月里的实际状态符合的程度。这一份量表测量的是「认知脱离 / 注意力涣散」相关的体验，跟外化型多动症状不同。",
  instructionsEn:
    "Rate how each statement describes you over the past 6 months. This scale measures cognitive disengagement / attentional drift — a distinct profile from externalized hyperactive symptoms.",
  options: [
    { value: 0, label: "完全没有", labelEn: "Not at all", short: "没有", shortEn: "Not at all" },
    { value: 1, label: "有时", labelEn: "Sometimes", short: "有时", shortEn: "Sometimes" },
    { value: 2, label: "经常", labelEn: "Often", short: "经常", shortEn: "Often" },
    { value: 3, label: "非常经常", labelEn: "Very often", short: "非常经常", shortEn: "Very often" },
  ],
  items: [
    { index: 1, dimension: "CDS", text: "我做事速度很慢", textEn: "I am slow at doing things.", sourceRef: "ACI #1" },
    { index: 2, dimension: "CDS", text: "我的脑子感觉像在雾里", textEn: "My mind feels like it is in a fog.", sourceRef: "ACI #2" },
    { index: 3, dimension: "CDS", text: "我会发呆、眼神放空", textEn: "I stare off into space.", sourceRef: "ACI #3" },
    { index: 4, dimension: "CDS", text: "我白天会感到困倦或昏昏欲睡", textEn: "I feel sleepy or drowsy during the day.", sourceRef: "ACI #4" },
    { index: 5, dimension: "CDS", text: "我会做白日梦", textEn: "I daydream.", sourceRef: "ACI #5" },
    { index: 6, dimension: "CDS", text: "我会忘记自己原本在想什么", textEn: "I lose my train of thought.", sourceRef: "ACI #6" },
    { index: 7, dimension: "CDS", text: "我不太活跃", textEn: "I am not very active.", sourceRef: "ACI #7" },
    { index: 8, dimension: "CDS", text: "我会陷在自己的思绪里出不来", textEn: "I get lost in my own thoughts.", sourceRef: "ACI #8" },
    { index: 9, dimension: "CDS", text: "我容易感到疲倦", textEn: "I get tired easily.", sourceRef: "ACI #9" },
    { index: 10, dimension: "CDS", text: "我会忘记自己刚才要说什么", textEn: "I forget what I was going to say.", sourceRef: "ACI #10" },
    { index: 11, dimension: "CDS", text: "我感到困惑", textEn: "I feel confused.", sourceRef: "ACI #11" },
    { index: 12, dimension: "CDS", text: "我对做事缺乏动力", textEn: "I am not motivated to do things.", sourceRef: "ACI #12" },
    { index: 13, dimension: "CDS", text: "我会走神或放空", textEn: "I zone out or space out.", sourceRef: "ACI #13" },
    { index: 14, dimension: "CDS", text: "我的思绪会混乱", textEn: "My mind gets mixed up.", sourceRef: "ACI #14" },
    { index: 15, dimension: "CDS", text: "我的思考似乎缓慢或迟钝", textEn: "My thinking seems slow or slowed down.", sourceRef: "ACI #15" },
    { index: 16, dimension: "CDS", text: "我很难把自己的想法用语言表达出来", textEn: "I have a hard time putting my thoughts into words.", sourceRef: "ACI #16" },
  ],
  dimensions: [
    {
      code: "CDS",
      name: "认知脱离综合征",
      nameEn: "Cognitive Disengagement Syndrome",
      description: "脑雾、慢、白日梦、走神、容易疲倦等内化型注意力问题",
      descriptionEn:
        "Mental fog, slow processing, daydreaming, zoning out, easy fatigue — the internalized attention profile",
      itemIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    },
  ],
  scoringMethod: "sum",
  severityBands: {
    CDS: [
      {
        level: "normal",
        label: "无显著 CDS 迹象",
        labelEn: "No significant CDS signs",
        min: 0,
        max: 13,
      },
      {
        level: "mild",
        label: "轻度",
        labelEn: "Mild",
        min: 14,
        max: 21,
      },
      {
        level: "moderate",
        label: "中度（值得关注）",
        labelEn: "Moderate (worth attention)",
        min: 22,
        max: 29,
      },
      {
        level: "severe",
        label: "显著（建议进一步评估）",
        labelEn: "Significant (further evaluation recommended)",
        min: 30,
        max: 48,
      },
    ],
  },
  citation: "Becker et al. (2017) Psychological Assessment; Fredrick et al. (2022) JPA",
  fullyVerified: false,
  notes:
    "CDS（原 SCT）不是 DSM 诊断，但在科研和临床上被广泛用作 ADHD 内化型/高 compensation 群体的补充评估。中文翻译为 AI 译版，权威中文修订版尚未广泛标准化。建议跟 ASRS（外化型）+ WURS-25（童年史）一起使用做完整 ADHD 鉴别。",
};
