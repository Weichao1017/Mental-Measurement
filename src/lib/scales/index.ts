// 所有量表的注册中心
import { dass21 } from "./dass21";
import { who5 } from "./who5";
import { ffmq15 } from "./ffmq15";
import { scsSf } from "./scs-sf";
import { maia2 } from "./maia2";
import { dersSf } from "./ders-sf";
import { psqi } from "./psqi";
import { ecr12 } from "./ecr12";
// 焦虑情绪测评组（金标准 + 加项）
import { gad7 } from "./gad7";
import { phq9 } from "./phq9";
import { mdq } from "./mdq";
import { wsas } from "./wsas";
import { pswq } from "./pswq";
import { rrs10 } from "./rrs10";
import { asrs } from "./asrs";
import type { Concern, Scale } from "../types";

export const SCALES: Record<string, Scale> = {
  dass21,
  who5,
  ffmq15,
  "scs-sf": scsSf,
  maia2,
  "ders-sf": dersSf,
  psqi,
  ecr12,
  gad7,
  phq9,
  mdq,
  wsas,
  pswq,
  rrs10,
  asrs,
};

/** 默认核心套装：所有人必做的最少集合 */
export const CORE_BATTERY = ["dass21"];

/** 根据主诉决定要追加哪些可选量表 */
export function batteryForConcerns(concerns: Concern[]): string[] {
  const optional: string[] = [];
  // 正面方向（建议早一点，正向氛围）
  if (concerns.includes("wellbeing")) optional.push("who5");
  if (concerns.includes("mindfulness")) optional.push("ffmq15");
  if (concerns.includes("self_compassion")) optional.push("scs-sf");
  // 困扰/症状方向
  if (concerns.includes("body_disconnect")) optional.push("maia2");
  if (concerns.includes("emotion_dysregulation")) optional.push("ders-sf");
  if (concerns.includes("sleep_problems")) optional.push("psqi");
  if (concerns.includes("relationship_issues")) optional.push("ecr12");
  return [...CORE_BATTERY, ...optional];
}

/** 通过 slug 取量表 */
export function getScale(idOrSlug: string): Scale | undefined {
  return SCALES[idOrSlug] ?? Object.values(SCALES).find((s) => s.slug === idOrSlug);
}

/** 主诉选项配置 */
export const CONCERN_OPTIONS: Array<{
  value: Concern;
  label: string;
  description: string;
  triggers: string;
}> = [
  {
    value: "wellbeing",
    label: "想看看最近的整体幸福感 / 活力状态",
    description: "近两周的活力、平静、对生活的兴趣（前后测对比敏感）",
    triggers: "→ 加做 WHO-5 主观幸福感量表（5 题）",
  },
  {
    value: "mindfulness",
    label: "想了解自己的正念能力",
    description: "觉察、描述、不评判、不反应等五个维度",
    triggers: "→ 加做 FFMQ-15 正念能力量表（15 题）",
  },
  {
    value: "self_compassion",
    label: "想了解自己对自己的关怀程度",
    description: "自我友善、共同人性、正念对待困境（6 维度）",
    triggers: "→ 加做 SCS-SF 自我关怀量表（12 题）",
  },
  {
    value: "body_disconnect",
    label: "和身体的联系比较弱 / 想做身体觉察练习",
    description: "感觉和身体断联，或想通过身体扫描、瑜伽、正念身体练习改善",
    triggers: "→ 加做 MAIA-2 内感受觉知量表（37 题）",
  },
  {
    value: "emotion_dysregulation",
    label: "情绪容易上头 / 难以管理情绪",
    description: "情绪来得快去得慢，常常被情绪牵着走，想改善",
    triggers: "→ 加做 DERS-SF 情绪调节困难量表（18 题）",
  },
  {
    value: "sleep_problems",
    label: "睡眠不好 / 入睡困难 / 多梦易醒",
    description: "过去一个月睡眠质量不佳，影响日间状态",
    triggers: "→ 加做 PSQI 匹兹堡睡眠质量指数",
  },
  {
    value: "relationship_issues",
    label: "亲密关系反复出问题 / 关系焦虑",
    description: "在恋爱或亲密关系中常感到不安、容易担心被抛弃或回避亲密",
    triggers: "→ 加做 ECR-12 亲密关系经验量表（12 题）",
  },
];
