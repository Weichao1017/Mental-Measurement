/**
 * WURS-25 Wender Utah 评定量表-25 项
 *
 * 25 题成人 retrospective 自评，回忆童年 8-10 岁的行为/情绪表现，
 * 用于辅助成人 ADHD 临床诊断。
 *
 * 临床地位：成人 ADHD 诊断**必须**有童年症状证据（DSM-5 要求症状在 12 岁
 * 前出现）。WURS-25 是临床实践中最常用的成人 retrospective 工具。
 *
 * ⚠️ 中文：经 AI 从英文原版翻译，未与朱晋（北医六院）等中文修订版逐字对齐。
 *
 * 来源：
 *   - Ward, M. F., Wender, P. H., & Reimherr, F. W. (1993). The Wender Utah
 *     Rating Scale: An aid in the retrospective diagnosis of childhood
 *     attention deficit hyperactivity disorder. American Journal of
 *     Psychiatry, 150(6), 885-890.
 *   - 25 题 verbatim 取自 CADDRA 官方表单（2025 版）
 *
 * 计分：5 档 Likert（0-4），总分 0-100
 * 临床切点（Ward 1993）：
 *   - 总分 ≥ 36 → ADHD 阳性筛查（区分 ADHD vs 控制组的最佳切点）
 *     · 灵敏度 86% / 特异度 96%（成人样本）
 *   - 总分 < 36 → 童年 ADHD 症状证据不充分
 */

import type { Scale } from "../types";

export const wurs25: Scale = {
  id: "wurs25",
  slug: "wurs25",
  name: "WURS-25 Wender Utah 量表（童年回顾）",
  nameEn: "WURS-25 Wender Utah Rating Scale (Childhood Retrospective)",
  description:
    "回顾童年 8-10 岁的表现，辅助成人 ADHD 临床诊断（成人 ADHD 必须有童年症状证据）（25 题，约 5 分钟）",
  descriptionEn:
    "Retrospective assessment of childhood behavior at ages 8-10 — required evidence for adult ADHD diagnosis (childhood symptoms must precede age 12) (25 items, ~5 min)",
  timeFrame: "童年（约 8-10 岁）",
  timeFrameEn: "Childhood (around ages 8-10)",
  estimatedMinutes: 5,
  isCore: false,
  category: "anxiety_clinical",
  highIsBetter: false,
  dimensionMaxScore: 100,
  instructions:
    "请回想你 8-10 岁左右的童年时期。下面每一项描述你当时的情况符合多少？请如实选择，没有标准答案。",
  instructionsEn:
    "Think back to your childhood, around ages 8-10. For each item below, indicate how much it describes you at that age. Answer honestly — there are no right or wrong answers.",
  options: [
    { value: 0, label: "完全没有 / 很轻微", labelEn: "Not At All or Very Slightly", short: "完全没有", shortEn: "Not at all" },
    { value: 1, label: "轻度", labelEn: "Mildly", short: "轻度", shortEn: "Mildly" },
    { value: 2, label: "中度", labelEn: "Moderately", short: "中度", shortEn: "Moderately" },
    { value: 3, label: "较重", labelEn: "Quite a Bit", short: "较重", shortEn: "Quite a Bit" },
    { value: 4, label: "非常严重", labelEn: "Very Much", short: "非常", shortEn: "Very Much" },
  ],
  // 题干前缀："童年时我（曾经）..."
  items: [
    { index: 1, dimension: "WU", text: "童年时我注意力不集中，容易分心", textEn: "Concentration problems, easily distracted", sourceRef: "WURS-25 #1" },
    { index: 2, dimension: "WU", text: "童年时我焦虑、爱担心", textEn: "Anxious, worrying", sourceRef: "WURS-25 #2" },
    { index: 3, dimension: "WU", text: "童年时我紧张、坐立不安", textEn: "Nervous, fidgety", sourceRef: "WURS-25 #3" },
    { index: 4, dimension: "WU", text: "童年时我不专注、爱做白日梦", textEn: "Inattentive, daydreaming", sourceRef: "WURS-25 #4" },
    { index: 5, dimension: "WU", text: "童年时我脾气暴躁、一点就着", textEn: "Hot- or short-tempered, low boiling point", sourceRef: "WURS-25 #5" },
    { index: 6, dimension: "WU", text: "童年时我发脾气、爱闹脾气", textEn: "Temper outbursts, tantrums", sourceRef: "WURS-25 #6" },
    {
      index: 7,
      dimension: "WU",
      text: "童年时我难以坚持、虎头蛇尾，开始了的事做不完",
      textEn: "Trouble with stick-to-it-tiveness, not following through, failing to finish things started",
      sourceRef: "WURS-25 #7",
    },
    { index: 8, dimension: "WU", text: "童年时我固执、倔强", textEn: "Stubborn, strong-willed", sourceRef: "WURS-25 #8" },
    { index: 9, dimension: "WU", text: "童年时我悲伤、忧郁、不开心", textEn: "Sad or blue, depressed, unhappy", sourceRef: "WURS-25 #9" },
    {
      index: 10,
      dimension: "WU",
      text: "童年时我对父母不听话、叛逆、顶嘴",
      textEn: "Disobedient with parents, rebellious, sassy",
      sourceRef: "WURS-25 #10",
    },
    { index: 11, dimension: "WU", text: "童年时我对自己评价很低", textEn: "Low opinion of myself", sourceRef: "WURS-25 #11" },
    { index: 12, dimension: "WU", text: "童年时我容易烦躁", textEn: "Irritable", sourceRef: "WURS-25 #12" },
    { index: 13, dimension: "WU", text: "童年时我情绪起伏、忽好忽坏", textEn: "Moody, ups and downs", sourceRef: "WURS-25 #13" },
    { index: 14, dimension: "WU", text: "童年时我易怒、爱生气", textEn: "Angry", sourceRef: "WURS-25 #14" },
    {
      index: 15,
      dimension: "WU",
      text: "童年时我冲动、做事不经思考",
      textEn: "Acting without thinking, impulsive",
      sourceRef: "WURS-25 #15",
    },
    { index: 16, dimension: "WU", text: "童年时我显得不成熟", textEn: "Tendency to be immature", sourceRef: "WURS-25 #16" },
    { index: 17, dimension: "WU", text: "童年时我感到内疚、后悔", textEn: "Guilty feelings, regretful", sourceRef: "WURS-25 #17" },
    { index: 18, dimension: "WU", text: "童年时我会失控", textEn: "Losing control of myself", sourceRef: "WURS-25 #18" },
    {
      index: 19,
      dimension: "WU",
      text: "童年时我有时表现得不理性",
      textEn: "Tendency to be or act irrational",
      sourceRef: "WURS-25 #19",
    },
    {
      index: 20,
      dimension: "WU",
      text: "童年时我在其他孩子中不受欢迎、交不到长久的朋友、跟其他孩子相处不来",
      textEn: "Unpopular with other children, didn't keep friends for long, didn't get along with other children",
      sourceRef: "WURS-25 #20",
    },
    {
      index: 21,
      dimension: "WU",
      text: "童年时我很难从别人的角度看问题",
      textEn: "Trouble seeing things from someone else's point of view",
      sourceRef: "WURS-25 #21",
    },
    {
      index: 22,
      dimension: "WU",
      text: "童年时我在学校跟权威发生过冲突，被叫到校长办公室",
      textEn: "Trouble with authorities, trouble with school, visits to principal's office",
      sourceRef: "WURS-25 #22",
    },
    { index: 23, dimension: "WU", text: "童年时我整体学习成绩不好，学得很慢", textEn: "Overall a poor student, slow learner", sourceRef: "WURS-25 #23" },
    { index: 24, dimension: "WU", text: "童年时我数学或算数有困难", textEn: "Trouble with mathematics or numbers", sourceRef: "WURS-25 #24" },
    { index: 25, dimension: "WU", text: "童年时我表现没有发挥出自己的潜力", textEn: "Not achieving up to potential", sourceRef: "WURS-25 #25" },
  ],
  dimensions: [
    {
      code: "WU",
      name: "童年 ADHD 症状回顾",
      nameEn: "Childhood ADHD symptoms (retrospective)",
      description: "童年 8-10 岁时 ADHD 相关行为/情绪症状的回顾自评",
      descriptionEn:
        "Retrospective self-report of childhood (ages 8-10) ADHD-related behaviors and emotions",
      itemIndices: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25,
      ],
    },
  ],
  scoringMethod: "sum",
  severityBands: {
    WU: [
      {
        level: "low",
        label: "童年 ADHD 证据不充分（< 36）",
        labelEn: "Insufficient childhood ADHD evidence (< 36)",
        min: 0,
        max: 35,
      },
      {
        level: "high",
        label: "童年 ADHD 阳性筛查（≥ 36）",
        labelEn: "Childhood ADHD positive screen (≥ 36)",
        min: 36,
        max: 100,
      },
    ],
  },
  citation: "Ward, Wender & Reimherr (1993) Am J Psychiatry 150:885-890",
  fullyVerified: false,
  notes:
    "成人 ADHD 临床诊断要求症状在 12 岁前出现（DSM-5）。WURS-25 阳性（≥ 36）+ 现况 ADHD 量表阳性（ASRS / BAARS / ACI 等）才能构成完整的临床证据链。单独 WURS 阳性不等于 ADHD 诊断——可能反映童年其它情绪 / 行为问题。中文翻译为 AI 译版。",
};
