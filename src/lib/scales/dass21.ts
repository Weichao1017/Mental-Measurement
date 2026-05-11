/**
 * DASS-21 简体中文（UNSW 官方版本对齐版）
 *
 * 题目措辞：取自 UNSW DASS 官方简体中文 DASS-42 PDF（Taouk, Lovibond & Laube, 2001），
 * 按 Lovibond 标准 DASS-21 → DASS-42 子集映射抽取。
 *
 * 验证状态：
 *  - 21 道题目逐字与 UNSW 官方简体中文 DASS-42 PDF 比对核验
 *  - DASS-21 → DASS-42 题号映射经英文母版反向回译逐题核验
 *  - 特别注意：DASS-21 #13 → DASS-42 #26（不是 #13）；DASS-21 #18 → DASS-42 #18（不是 #27）
 *  - 维度分布 7+7+7 与 Lovibond 设计一致
 *  - 计分规则：每个维度求和后 ×2，对照 Lovibond (1995) 澳大利亚成人非临床常模
 *
 * 引用：
 *   Lovibond, S.H., & Lovibond, P.F. (1995). Manual for the Depression Anxiety
 *   Stress Scales (2nd ed.). Sydney: Psychology Foundation of Australia.
 *   ISBN 0-7334-1423-0.
 *   Taouk, M., Lovibond, P.F., & Laube, R. (2001). Translation of the Depression
 *   Anxiety Stress Scales into Chinese. Transcultural Mental Health Centre, Cumberland Hospital.
 *   UNSW DASS 官网：http://www2.psy.unsw.edu.au/dass/
 */

import type { Scale } from "../types";

export const dass21: Scale = {
  id: "dass21",
  slug: "dass21",
  name: "DASS-21 抑郁焦虑压力量表",
  description: "评估过去一周内抑郁、焦虑、压力三个维度的情绪状态",
  timeFrame: "过去一周",
  estimatedMinutes: 4,
  isCore: true,
  highIsBetter: false,
  dimensionMaxScore: 42,
  instructions:
    "请阅读以下各项，然后根据过去一周之内符合您的实际情况，选择相应的选项。您的回答没有对错之分，请不要在任何一项上花太多时间。",
  options: [
    { value: 0, label: "不符合", short: "不符合" },
    { value: 1, label: "某种程度上或某些时候符合", short: "有时符合" },
    { value: 2, label: "很大程度上或大部分情况下符合", short: "经常符合" },
    { value: 3, label: "非常符合", short: "总是符合" },
  ],
  items: [
    { index: 1, dimension: "S", text: "我发现很难让自己安静下来休息", sourceRef: "DASS-42 #22" },
    { index: 2, dimension: "A", text: "我感到嘴巴很干", sourceRef: "DASS-42 #2" },
    { index: 3, dimension: "D", text: "我似乎完全不能积极乐观起来", sourceRef: "DASS-42 #3" },
    {
      index: 4,
      dimension: "A",
      text: "我感到过呼吸困难（例如：在没有体力透支的情况下而感到呼吸急促，喘不过气来）",
      sourceRef: "DASS-42 #4",
    },
    { index: 5, dimension: "D", text: "我发现很难发挥主动性去做事情", sourceRef: "DASS-42 #42" },
    { index: 6, dimension: "S", text: "我对于所处的环境（情况）易于反应过度", sourceRef: "DASS-42 #6" },
    { index: 7, dimension: "A", text: "我曾感到发抖（例如：手打哆嗦）", sourceRef: "DASS-42 #41" },
    { index: 8, dimension: "S", text: "我感到时常神经紧张", sourceRef: "DASS-42 #12" },
    { index: 9, dimension: "A", text: "我担心自己可能因为惊慌而干蠢事出洋相", sourceRef: "DASS-42 #40" },
    { index: 10, dimension: "D", text: "我感到我没什么可期待的", sourceRef: "DASS-42 #10" },
    { index: 11, dimension: "S", text: "我发现自己变得焦虑不安", sourceRef: "DASS-42 #39" },
    { index: 12, dimension: "S", text: "我发现很难放松下来", sourceRef: "DASS-42 #8" },
    { index: 13, dimension: "D", text: "我感到消沉和沮丧", sourceRef: "DASS-42 #26" },
    {
      index: 14,
      dimension: "S",
      text: "我曾对阻碍我正在进行的工作的事情感到无法容忍",
      sourceRef: "DASS-42 #35",
    },
    { index: 15, dimension: "A", text: "我感到我曾接近恐慌", sourceRef: "DASS-42 #28" },
    { index: 16, dimension: "D", text: "我对任何事情都没法充满热情", sourceRef: "DASS-42 #31" },
    { index: 17, dimension: "D", text: "我感到自己曾不具备作为人而存在的价值", sourceRef: "DASS-42 #17" },
    { index: 18, dimension: "S", text: "我感到我曾极容易因为小事而生气", sourceRef: "DASS-42 #18" },
    {
      index: 19,
      dimension: "A",
      text: "在没有体力透支的情况下我也能感觉到自己的心跳或心律不正常（例如：感到心跳过快或心律不齐）",
      sourceRef: "DASS-42 #25",
    },
    { index: 20, dimension: "A", text: "没有什么特殊原因的情况下，我感到害怕", sourceRef: "DASS-42 #20" },
    {
      index: 21,
      dimension: "D",
      text: "我曾感到生活没有意义",
      sourceRef: "DASS-42 #38",
      flags: ["suicidal_ideation"],
    },
  ],
  dimensions: [
    {
      code: "D",
      name: "抑郁 Depression",
      description: "情绪低落、缺乏动力、自我贬低、对未来无望",
      itemIndices: [3, 5, 10, 13, 16, 17, 21],
    },
    {
      code: "A",
      name: "焦虑 Anxiety",
      description: "躯体性焦虑反应、自主神经唤起、惊恐",
      itemIndices: [2, 4, 7, 9, 15, 19, 20],
    },
    {
      code: "S",
      name: "压力 Stress",
      description: "易激惹、紧张、过度反应、难以放松",
      itemIndices: [1, 6, 8, 11, 12, 14, 18],
    },
  ],
  scoringMethod: "sum_times_2",
  severityBands: {
    D: [
      { level: "normal", label: "正常", min: 0, max: 9 },
      { level: "mild", label: "轻度", min: 10, max: 13 },
      { level: "moderate", label: "中度", min: 14, max: 20 },
      { level: "severe", label: "重度", min: 21, max: 27 },
      { level: "extremely_severe", label: "极重度", min: 28, max: null },
    ],
    A: [
      { level: "normal", label: "正常", min: 0, max: 7 },
      { level: "mild", label: "轻度", min: 8, max: 9 },
      { level: "moderate", label: "中度", min: 10, max: 14 },
      { level: "severe", label: "重度", min: 15, max: 19 },
      { level: "extremely_severe", label: "极重度", min: 20, max: null },
    ],
    S: [
      { level: "normal", label: "正常", min: 0, max: 14 },
      { level: "mild", label: "轻度", min: 15, max: 18 },
      { level: "moderate", label: "中度", min: 19, max: 25 },
      { level: "severe", label: "重度", min: 26, max: 33 },
      { level: "extremely_severe", label: "极重度", min: 34, max: null },
    ],
  },
  citation:
    "Lovibond & Lovibond (1995); Taouk, Lovibond & Laube (2001) Chinese translation",
  fullyVerified: true,
  notes:
    "分级阈值参考 Lovibond & Lovibond (1995) 澳大利亚成人非临床常模。第 21 题为自杀意念警示题，回答 2 或 3 时前端需弹出心理援助引导，不论总分多少。",
};
