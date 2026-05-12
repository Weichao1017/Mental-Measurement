/**
 * ASRS-v1.1 成人 ADHD 自评量表（Adult ADHD Self-Report Scale）
 *
 * 重要的鉴别诊断工具。「脑子转得很快、很难活在当下」听起来像焦虑，
 * 但也是 ADHD（特别是注意力涣散型 / 内化型）的核心体验。
 * 焦虑和 ADHD 经常被混淆甚至共病；ADHD 漏诊会导致治疗思路错误
 * （SSRI 对 ADHD 没用）。
 *
 * ⚠️ 题目内容：经 Claude 从英文原版翻译，未与权威中文修订版逐字核对。
 *
 * 来源：
 *   - Kessler, R. C., Adler, L., Ames, M., Demler, O., Faraone, S.,
 *     Hiripi, E., et al. (2005). The World Health Organization Adult ADHD
 *     Self-Report Scale (ASRS): a short screening scale for use in the
 *     general population. Psychological Medicine, 35(2), 245-256.
 *   - 中文版参考：Yeh et al. (2008) 台湾繁体版。
 *
 * 结构：
 *   Part A (Q1-6): screener，最重要——单独阳性即建议正规评估
 *   Part B (Q7-18): 补充症状，临床完整画像用
 *
 * 计分：5 档 Likert（0-4），Part A sum 0-24，Part B sum 0-48
 * Kessler 2005 官方切点：Part A 中 ≥ 4 题答到题目对应阈值
 *   - Q1-3 阈值 = 2（"有时"及以上）
 *   - Q4-6 阈值 = 3（"经常"及以上）
 *
 * 简化判定：Part A sum ≥ 14 提示阳性（粗略一致，临床请以正规 ADHD 评估为准）。
 */

import type { Scale } from "../types";

export const asrs: Scale = {
  id: "asrs",
  slug: "asrs",
  name: "ASRS-v1.1 成人 ADHD 自评量表",
  description: "WHO 成人 ADHD 筛查工具，跟焦虑/抑郁的重要鉴别诊断（18 题，约 5 分钟）",
  timeFrame: "过去 6 个月",
  estimatedMinutes: 5,
  isCore: false,
  category: "anxiety_clinical",
  highIsBetter: false,
  dimensionMaxScore: 24, // Part A 满分，主要展示
  instructions:
    "请回想你过去 6 个月里的状态，评估每种情况发生的频率。前 6 题是关键筛查题，后 12 题是补充。",
  options: [
    { value: 0, label: "从不", short: "从不" },
    { value: 1, label: "很少", short: "很少" },
    { value: 2, label: "有时", short: "有时" },
    { value: 3, label: "经常", short: "经常" },
    { value: 4, label: "很经常", short: "很经常" },
  ],
  items: [
    // Part A (screener) — 题 1-6
    {
      index: 1,
      dimension: "PA",
      text: "完成一项工作的细节部分（项目接近尾声、需要收尾时），你有多大程度难以做到？",
      sourceRef: "ASRS Q1",
    },
    {
      index: 2,
      dimension: "PA",
      text: "当你必须做一件需要组织条理的任务时，你有多大程度难以按顺序进行？",
      sourceRef: "ASRS Q2",
    },
    {
      index: 3,
      dimension: "PA",
      text: "你有多大程度难以记住约会或要履行的义务？",
      sourceRef: "ASRS Q3",
    },
    {
      index: 4,
      dimension: "PA",
      text: "当你面对一项需要大量思考的任务时，你有多大程度会拖延或迟迟不开始？",
      sourceRef: "ASRS Q4",
    },
    {
      index: 5,
      dimension: "PA",
      text: "需要长时间静坐时，你有多大程度坐立不安、动来动去？",
      sourceRef: "ASRS Q5",
    },
    {
      index: 6,
      dimension: "PA",
      text: "你有多大程度感到「过度活跃」、被某种动力驱使着不得不去做事？",
      sourceRef: "ASRS Q6",
    },
    // Part B — 题 7-18
    {
      index: 7,
      dimension: "PB",
      text: "你有多大程度会犯粗心错误（例如细节上的失误）？",
      sourceRef: "ASRS Q7",
    },
    {
      index: 8,
      dimension: "PB",
      text: "做枯燥或重复的工作时，你有多大程度难以保持注意力？",
      sourceRef: "ASRS Q8",
    },
    {
      index: 9,
      dimension: "PB",
      text: "即使别人直接对你说话，你有多大程度难以集中精神听？",
      sourceRef: "ASRS Q9",
    },
    {
      index: 10,
      dimension: "PB",
      text: "你有多大程度在家或工作中放错东西、找不到东西？",
      sourceRef: "ASRS Q10",
    },
    {
      index: 11,
      dimension: "PB",
      text: "你有多大程度容易被周围的活动或声音分心？",
      sourceRef: "ASRS Q11",
    },
    {
      index: 12,
      dimension: "PB",
      text: "在会议或其他需要保持坐姿的场合，你有多大程度会站起来离开？",
      sourceRef: "ASRS Q12",
    },
    {
      index: 13,
      dimension: "PB",
      text: "你有多大程度感到坐立不安或局促不安？",
      sourceRef: "ASRS Q13",
    },
    {
      index: 14,
      dimension: "PB",
      text: "当自己一个人独处时，你有多大程度难以放松下来？",
      sourceRef: "ASRS Q14",
    },
    {
      index: 15,
      dimension: "PB",
      text: "你有多大程度发现自己在社交场合中说话过多？",
      sourceRef: "ASRS Q15",
    },
    {
      index: 16,
      dimension: "PB",
      text: "在交谈中，你有多大程度会在对方话还没说完时就替对方接下去说完？",
      sourceRef: "ASRS Q16",
    },
    {
      index: 17,
      dimension: "PB",
      text: "需要排队或等候时，你有多大程度难以耐心等待？",
      sourceRef: "ASRS Q17",
    },
    {
      index: 18,
      dimension: "PB",
      text: "你有多大程度会打断别人，或在别人正忙时打扰他们？",
      sourceRef: "ASRS Q18",
    },
  ],
  dimensions: [
    {
      code: "PA",
      name: "Part A 关键筛查",
      description: "6 题 screener，阳性即建议正规 ADHD 评估",
      itemIndices: [1, 2, 3, 4, 5, 6],
    },
    {
      code: "PB",
      name: "Part B 补充症状",
      description: "12 题补充画像，临床完整评估用",
      itemIndices: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    },
  ],
  scoringMethod: "sum",
  severityBands: {
    PA: [
      {
        level: "low",
        label: "Part A 阴性",
        min: 0,
        max: 13,
        clientNote: "关键筛查题分数较低，未提示明显 ADHD 倾向。",
      },
      {
        level: "high",
        label: "Part A 阳性（建议正规评估）",
        min: 14,
        max: 24,
        clientNote: "关键筛查题分数较高，建议做一次正规 ADHD 评估——如果共存或本来就是 ADHD，治疗思路会很不一样。",
        teacherNote: "Kessler 2005: Part A ≥ 4 题命中阈值即阳性。SSRI 对 ADHD 无效；建议精神科 / 神经科正规 ADHD 评估。",
      },
    ],
    PB: [
      { level: "low", label: "症状较少", min: 0, max: 16 },
      { level: "moderate", label: "中等", min: 17, max: 32 },
      { level: "high", label: "症状较多", min: 33, max: 48 },
    ],
  },
  citation: "Kessler et al. (2005) Psychol Med; WHO ASRS-v1.1",
  fullyVerified: false,
  notes:
    "焦虑/抑郁与 ADHD 的核心鉴别工具。GP 几乎不主动筛 ADHD。如果 Part A 阳性，结论不是「你有 ADHD」，而是「值得做一次正规评估」——因为如果共存或其实是 ADHD，单用 SSRI 的治疗思路是错的。",
};
