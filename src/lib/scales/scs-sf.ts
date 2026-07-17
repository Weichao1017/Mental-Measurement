/**
 * SCS-SF 自我关怀量表简版（Self-Compassion Scale - Short Form）
 *
 * ⚠️ 题目内容：经 Claude（AI）从英文原版翻译，未与权威中文修订版逐字核对。
 *    UI 会显示"题库待核对"提示。上线给真实客户前建议参考 Chen et al. (2011)
 *    或后续中文修订版做权威对齐。
 *
 * 来源：
 *   - 短版：Raes, F., Pommier, E., Neff, K. D., & Van Gucht, D. (2011).
 *     Construction and factorial validation of a short form of the
 *     Self-Compassion Scale. Clinical Psychology & Psychotherapy, 18(3), 250-255.
 *   - 中文版：Chen, J., Yan, L., & Zhou, L. (2011). Reliability and validity of
 *     Chinese version of Self-Compassion Scale. 中国临床心理学杂志, 19(6), 734-736.
 *   - Neff 官网（公开使用授权）：https://self-compassion.org/scales/
 *
 * 六个维度，每个 2 题：
 *   - SK  Self-Kindness 自我友善（正向）
 *   - SJ  Self-Judgment 自我评判（反向）
 *   - CH  Common Humanity 共同人性（正向）
 *   - IS  Isolation 孤立感（反向）
 *   - MI  Mindfulness 正念（正向）
 *   - OI  Over-Identification 过度认同（反向）
 *
 * 计分：5 点 Likert（1=几乎从不 → 5=几乎总是）
 * 总分：所有 12 题反向计分调整后求平均（1-5 分）
 *      高分 = 自我关怀水平高
 */

import type { Scale } from "../types";

export const scsSf: Scale = {
  id: "scs-sf",
  slug: "scs-sf",
  name: "SCS-SF 自我关怀量表（简版）",
  nameEn: "SCS-SF Self-Compassion Scale (Short Form)",
  description: "测量自我友善、共同人性、正念三组对立面共六个维度",
  descriptionEn: "Measures self-kindness, common humanity, and mindfulness — three pairs across six dimensions",
  timeFrame: "通常情况下",
  timeFrameEn: "Generally",
  estimatedMinutes: 3,
  isCore: false,
  highIsBetter: true,
  dimensionMaxScore: 5,
  triggers: ["self_compassion"],
  instructions:
    "请根据您平常对待自己的方式，判断每一项陈述对您的符合程度。这里没有对错之分，请如实选择最贴近您日常状态的选项。",
  options: [
    { value: 1, label: "几乎从不", short: "几乎从不" },
    { value: 2, label: "偶尔" },
    { value: 3, label: "有时" },
    { value: 4, label: "经常" },
    { value: 5, label: "几乎总是", short: "几乎总是" },
  ],
  items: [
    {
      index: 1,
      dimension: "SJ",
      text: "我会因为自己的缺点和不足而否定、评判自己。",
      reverse: true,
      sourceRef: "SCS-26 #1",
    },
    {
      index: 2,
      dimension: "IS",
      text: "当我心情低落时，我倾向于觉得大多数人可能都比我更幸福。",
      reverse: true,
      sourceRef: "SCS-26 #4",
    },
    {
      index: 3,
      dimension: "CH",
      text: "我会尝试把自己的失败看作是人之常情的一部分。",
      sourceRef: "SCS-26 #7",
    },
    {
      index: 4,
      dimension: "MI",
      text: "当痛苦的事情发生时，我会尝试用相对平衡的视角看待这件事。",
      sourceRef: "SCS-26 #9",
    },
    {
      index: 5,
      dimension: "SK",
      text: "当我经历情绪上的痛苦时，我会尝试以爱意对待自己。",
      sourceRef: "SCS-26 #5",
    },
    {
      index: 6,
      dimension: "OI",
      text: "当我在重要的事情上失败时，我会被无能感淹没。",
      reverse: true,
      sourceRef: "SCS-26 #2",
    },
    {
      index: 7,
      dimension: "CH",
      text: "当我陷入低谷时，我会提醒自己世上还有很多人也正在经历类似的感受。",
      sourceRef: "SCS-26 #3",
    },
    {
      index: 8,
      dimension: "SJ",
      text: "在真正艰难的时刻，我对自己反而会很苛刻。",
      reverse: true,
      sourceRef: "SCS-26 #11",
    },
    {
      index: 9,
      dimension: "MI",
      text: "当某件事让我心烦时，我会尝试让自己的情绪保持平衡。",
      sourceRef: "SCS-26 #17",
    },
    {
      index: 10,
      dimension: "SK",
      text: "在我经历非常艰难的时期，我会给予自己所需要的关怀和温柔。",
      sourceRef: "SCS-26 #19",
    },
    {
      index: 11,
      dimension: "IS",
      text: "当我心情低落时，我倾向于反复想着所有出了问题的事情，很难走出来。",
      reverse: true,
      sourceRef: "SCS-26 #13",
    },
    {
      index: 12,
      dimension: "OI",
      text: "当我在重要的事情上失败时，我会觉得自己孤零零地承受这份失败。",
      reverse: true,
      sourceRef: "SCS-26 #6",
    },
  ],
  // ⚠️ SCS-SF 心理测量学定论：短版每个子维度仅 2 题、信度不足，**不建议**分维度报告，
  //    应只用 12 题总分。故这里只暴露一个「自我关怀总分」维度（负向维度题已 reverse 翻转）。
  dimensions: [
    {
      code: "TOTAL",
      name: "自我关怀总分",
      nameEn: "Self-Compassion (total)",
      description: "12 题综合（自我评判/孤立/过度认同等负向题已反向计分）；越高=越能善待自己",
      descriptionEn: "Overall across 12 items (negative facets reverse-scored); higher = kinder to oneself",
      itemIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
  ],
  scoringMethod: "mean",
  severityBands: {
    // Neff 常用解读切点：1-2.5 偏低 / 2.5-3.5 中等 / 3.5-5 较高
    TOTAL: [
      {
        level: "low",
        label: "自我关怀偏低",
        labelEn: "Lower self-compassion",
        min: 1,
        max: 2.5,
        clientNote:
          "面对挫折和痛苦时，你现在更容易自我批评、感到孤立、被情绪卷走。这不是性格缺陷——自我关怀是一种可以练习的能力。可以从一个小动作开始：下次自责时，试着像安慰一位处境相同的好友那样，对自己说话。",
        clientNoteEn:
          "Right now you tend to be self-critical, feel isolated, and get swept up by emotion when things go wrong. This isn't a flaw — self-compassion is a trainable skill. A small start: next time you're self-critical, speak to yourself the way you'd comfort a close friend in the same situation.",
        teacherNote:
          "总分偏低（<2.5）。来访者在困境中以自我批评 / 孤立 / 过度认同为主，适合作为自我关怀（CFT / MSC）干预的重点对象，建议前后测追踪。",
      },
      {
        level: "moderate",
        label: "中等",
        labelEn: "Moderate",
        min: 2.5,
        max: 3.5,
        clientNote:
          "你的自我关怀处于中等水平：有时能善待自己，有时又会陷入自责或反复纠结。在压力时刻有意识地停一下、提醒自己「此刻确实很难，我可以对自己温柔一点」，会帮你更稳。",
        clientNoteEn:
          "Your self-compassion is moderate: sometimes kind to yourself, sometimes caught in self-criticism. Pausing in hard moments to remind yourself 'this is genuinely difficult, I can be a bit gentler with myself' will help you steady.",
        teacherNote:
          "总分中等（2.5-3.5）。自我关怀能力不稳定，正念 / 自我关怀练习有较大提升空间。",
      },
      {
        level: "high",
        label: "自我关怀较高",
        labelEn: "Higher self-compassion",
        min: 3.5,
        max: 5,
        clientNote:
          "你具备较强的自我关怀能力——能在困难中善待自己、把挫折看作人之常情，并在情绪来袭时保持觉察而不被淹没。这是一项重要的心理资源，继续保持。",
        clientNoteEn:
          "You have strong self-compassion — you can be kind to yourself in hard times, see setbacks as part of being human, and stay aware without being overwhelmed. This is a real psychological resource; keep nurturing it.",
        teacherNote:
          "总分较高（≥3.5）。自我关怀是其重要保护性资源，可作为治疗中的优势加以调动。",
      },
    ],
  },
  citation: "Raes et al. (2011); Chinese version: Chen et al. (2011)",
  fullyVerified: false,
  notes:
    "题目内容由 AI 从英文原版翻译，建议上线前与 Chen et al. (2011) 中文版对齐。按心理测量学定论，SCS-SF 只报告 12 题总分（均值，反向题已翻转），不分维度——每个 2 题子量表信度不足。",
};
