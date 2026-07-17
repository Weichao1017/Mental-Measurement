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
  nameEn: "ASRS-v1.1 Adult ADHD Self-Report Scale",
  description: "WHO 成人 ADHD 筛查工具，跟焦虑/抑郁的重要鉴别诊断（18 题，约 5 分钟）",
  descriptionEn: "WHO adult ADHD screener — important differential from anxiety/depression (18 items, ~5 min)",
  timeFrame: "过去 6 个月",
  timeFrameEn: "Past 6 months",
  estimatedMinutes: 5,
  isCore: false,
  category: "anxiety_clinical",
  highIsBetter: false,
  // ADHD 筛查 ≠ 抑郁/焦虑/用药通路；阳性结论由 Part A 判定盒给出（建议正规 ADHD 评估），
  // 不进通用「临床综合判定」，避免误出「精神科 / SSRI」取向的医学建议。
  excludeFromClinicalFlag: true,
  dimensionMaxScore: 24,
  instructions:
    "请回想你过去 6 个月里的状态，评估每种情况发生的频率。前 6 题是关键筛查题，后 12 题是补充。",
  instructionsEn:
    "Reflect on the past 6 months and rate how often each occurs. The first 6 items are the key screener; the last 12 are supplemental.",
  options: [
    { value: 0, label: "从不", labelEn: "Never", short: "从不", shortEn: "Never" },
    { value: 1, label: "很少", labelEn: "Rarely", short: "很少", shortEn: "Rarely" },
    { value: 2, label: "有时", labelEn: "Sometimes", short: "有时", shortEn: "Sometimes" },
    { value: 3, label: "经常", labelEn: "Often", short: "经常", shortEn: "Often" },
    { value: 4, label: "很经常", labelEn: "Very Often", short: "很经常", shortEn: "Very Often" },
  ],
  items: [
    { index: 1, dimension: "PA", text: "完成一项工作的细节部分（项目接近尾声、需要收尾时），你有多大程度难以做到？", textEn: "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?", sourceRef: "ASRS Q1" },
    { index: 2, dimension: "PA", text: "当你必须做一件需要组织条理的任务时，你有多大程度难以按顺序进行？", textEn: "How often do you have difficulty getting things in order when you have to do a task that requires organization?", sourceRef: "ASRS Q2" },
    { index: 3, dimension: "PA", text: "你有多大程度难以记住约会或要履行的义务？", textEn: "How often do you have problems remembering appointments or obligations?", sourceRef: "ASRS Q3" },
    { index: 4, dimension: "PA", text: "当你面对一项需要大量思考的任务时，你有多大程度会拖延或迟迟不开始？", textEn: "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?", sourceRef: "ASRS Q4" },
    { index: 5, dimension: "PA", text: "需要长时间静坐时，你有多大程度坐立不安、动来动去？", textEn: "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?", sourceRef: "ASRS Q5" },
    { index: 6, dimension: "PA", text: "你有多大程度感到「过度活跃」、被某种动力驱使着不得不去做事？", textEn: "How often do you feel overly active and compelled to do things, like you were driven by a motor?", sourceRef: "ASRS Q6" },
    { index: 7, dimension: "PB", text: "你有多大程度会犯粗心错误（例如细节上的失误）？", textEn: "How often do you make careless mistakes when you have to work on a boring or difficult project?", sourceRef: "ASRS Q7" },
    { index: 8, dimension: "PB", text: "做枯燥或重复的工作时，你有多大程度难以保持注意力？", textEn: "How often do you have difficulty keeping your attention when you are doing boring or repetitive work?", sourceRef: "ASRS Q8" },
    { index: 9, dimension: "PB", text: "即使别人直接对你说话，你有多大程度难以集中精神听？", textEn: "How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?", sourceRef: "ASRS Q9" },
    { index: 10, dimension: "PB", text: "你有多大程度在家或工作中放错东西、找不到东西？", textEn: "How often do you misplace or have difficulty finding things at home or at work?", sourceRef: "ASRS Q10" },
    { index: 11, dimension: "PB", text: "你有多大程度容易被周围的活动或声音分心？", textEn: "How often are you distracted by activity or noise around you?", sourceRef: "ASRS Q11" },
    { index: 12, dimension: "PB", text: "在会议或其他需要保持坐姿的场合，你有多大程度会站起来离开？", textEn: "How often do you leave your seat in meetings or other situations in which you are expected to remain seated?", sourceRef: "ASRS Q12" },
    { index: 13, dimension: "PB", text: "你有多大程度感到坐立不安或局促不安？", textEn: "How often do you feel restless or fidgety?", sourceRef: "ASRS Q13" },
    { index: 14, dimension: "PB", text: "当自己一个人独处时，你有多大程度难以放松下来？", textEn: "How often do you have difficulty unwinding and relaxing when you have time to yourself?", sourceRef: "ASRS Q14" },
    { index: 15, dimension: "PB", text: "你有多大程度发现自己在社交场合中说话过多？", textEn: "How often do you find yourself talking too much when you are in social situations?", sourceRef: "ASRS Q15" },
    { index: 16, dimension: "PB", text: "在交谈中，你有多大程度会在对方话还没说完时就替对方接下去说完？", textEn: "When you're in a conversation, how often do you find yourself finishing the sentences of the people you are talking to, before they can finish them themselves?", sourceRef: "ASRS Q16" },
    { index: 17, dimension: "PB", text: "需要排队或等候时，你有多大程度难以耐心等待？", textEn: "How often do you have difficulty waiting your turn in situations when turn taking is required?", sourceRef: "ASRS Q17" },
    { index: 18, dimension: "PB", text: "你有多大程度会打断别人，或在别人正忙时打扰他们？", textEn: "How often do you interrupt others when they are busy?", sourceRef: "ASRS Q18" },
  ],
  dimensions: [
    { code: "PA", name: "Part A 关键筛查", nameEn: "Part A — Screener", description: "6 题 screener，阳性即建议正规 ADHD 评估", descriptionEn: "6-item screener; if positive, formal ADHD evaluation is recommended", itemIndices: [1, 2, 3, 4, 5, 6] },
    { code: "PB", name: "Part B 补充症状", nameEn: "Part B — Supplemental", description: "12 题补充画像，临床完整评估用", descriptionEn: "12 supplemental items for clinical completeness", itemIndices: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
  ],
  scoringMethod: "sum",
  severityBands: {
    PA: [
      { level: "low", label: "Part A 阴性", labelEn: "Part A negative", min: 0, max: 13 },
      { level: "high", label: "Part A 阳性（建议正规评估）", labelEn: "Part A positive (formal evaluation recommended)", min: 14, max: 24 },
    ],
    PB: [
      { level: "low", label: "症状较少", labelEn: "Few symptoms", min: 0, max: 16 },
      { level: "moderate", label: "中等", labelEn: "Moderate", min: 17, max: 32 },
      { level: "high", label: "症状较多", labelEn: "Many symptoms", min: 33, max: 48 },
    ],
  },
  citation: "Kessler et al. (2005) Psychol Med; WHO ASRS-v1.1",
  fullyVerified: false,
  notes:
    "焦虑/抑郁与 ADHD 的核心鉴别工具。GP 几乎不主动筛 ADHD。如果 Part A 阳性，结论不是「你有 ADHD」，而是「值得做一次正规评估」——因为如果共存或其实是 ADHD，单用 SSRI 的治疗思路是错的。",
};
