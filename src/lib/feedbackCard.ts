import type { ScaleResponse } from "./types";

/**
 * 「父亲/家长沙龙 · 聆听演练」个人反馈卡 —— 判定引擎。
 *
 * 规则完全照工作坊脚本《父亲沙龙聆听演练版-问卷与现场脚本》第三节
 * 「画像规则与个人反馈卡」实现，不做任何自由发挥：
 *
 *  1) 五种默认接法（人设）：三个场景题(index 6/7/8)按「选项对照表」计票，
 *     最多者为主型、其次为副型；接球手 ≥2 票单独点亮。
 *  2) 聆听四层楼（U 型理论）：场景给「行为层」（教导主任/灭火器=1F，
 *     侦探/维修工=2F，接球手=3F）；对话2(index 10) 给「注意力层」(A=1F B=2F
 *     C=3F门口 D=4F痕迹，线上是多选 → 取所选最高层)。两者不一致时取
 *     较低者为「默认楼层」，较高者为「火种」——脚本称这句是全卡最值钱的。
 *  3) 对话1(index 9) 定「他们之间的对话场域」；选 E(=5) 的家长首要目标
 *     不是上楼，是先有一场十分钟对话（「先约一场球」）。
 *  4) 翻转1(11/12)：自评 − 猜孩子打分 ≥ 2 → 已在换位，卡上肯定。
 *  5) 语料(index 14) / 场景「实际会说」自由填写 → 卡上引用他自己的话。
 *
 * 安全红线：index 16（担心状况）与 index 5（身份了解程度）的内容
 * 绝不进入卡片模型 —— 只贴行为，不贴人。
 */

export type PersonaId =
  | "detective" // 侦探
  | "dean" // 教导主任
  | "extinguisher" // 灭火器
  | "repairman" // 维修工
  | "catcher"; // 接球手

/** 选项对照表（脚本 3.2，与线上 salon-warmup 选项顺序逐项核对过） */
const SCENARIO_PERSONA: Record<number, Record<number, PersonaId>> = {
  6: { 1: "detective", 2: "dean", 3: "extinguisher", 4: "catcher", 5: "repairman" },
  7: { 1: "dean", 2: "detective", 3: "catcher", 4: "extinguisher", 5: "repairman" },
  8: { 1: "detective", 2: "extinguisher", 3: "dean", 4: "repairman", 5: "catcher" },
};

/** 人设 → 行为层（脚本 3.3） */
const PERSONA_FLOOR: Record<PersonaId, 1 | 2 | 3> = {
  dean: 1,
  extinguisher: 1,
  detective: 2,
  repairman: 2,
  catcher: 3,
};

export interface CardModel {
  /** 称呼：昵称(2) > 微信名(1) > 通用 */
  nickname: string;
  /** 孩子的称呼(20)；未填则「孩子」 */
  childName: string;
  /** 主型人设；三个场景全空时为 null（卡片走通用模式） */
  persona: PersonaId | null;
  /** 副型（若有） */
  personaSecondary: PersonaId | null;
  /** 各人设票数 */
  votes: Partial<Record<PersonaId, number>>;
  /** 参与计票的场景数（2 或 3） */
  scenarioCount: number;
  /** 接球手 ≥2：点亮为观察员/示范者 */
  isCatcherStar: boolean;
  /** 行为层（主型的楼层） */
  behaviorFloor: 1 | 2 | 3 | null;
  /** 注意力层（对话2 多选取最高；未答为 null） */
  attentionFloor: 1 | 2 | 3 | 4 | null;
  /** 默认楼层 = min(行为, 注意力)；只有一方时取该方 */
  defaultFloor: 1 | 2 | 3 | 4 | null;
  /** 火种楼层 = 两者不一致时的较高者 */
  sparkFloor: 2 | 3 | 4 | null;
  /** 对话1 场域（1-4 层；5 = 频道还没搭起来） */
  dialogueField: 1 | 2 | 3 | 4 | 5 | null;
  /** 翻转1：自评(12) − 猜孩子打分(11)；任一未答为 null */
  perspectiveGap: number | null;
  guessScore: number | null;
  selfScore: number | null;
  /** 翻转2：孩子最想改的接话习惯（选项文字或自由填写） */
  habit: string | null;
  /** 语料1(14)：孩子最近说的原话 */
  childQuote: string | null;
  /** 语料3(15)：最想听懂的事 */
  wantToUnderstand: string | null;
  /** 场景题「我实际大概会说」自由填写（家长自己的话） */
  ownWords: string | null;
  /** 两把尺 */
  importance: number | null;
  confidence: number | null;
}

const HABIT_LABELS: Record<number, string> = {
  1: "问个不停",
  2: "讲道理",
  3: "说「没事没事」",
  4: "急着给办法",
  5: "打断插话",
};

function cleanText(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s === "" ? null : s;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** 从一份 salon-warmup 作答构建反馈卡模型；response 缺失返回 null */
export function buildCardModel(response: ScaleResponse | undefined): CardModel | null {
  if (!response) return null;
  const a = response.answers ?? {};
  const x = response.textAnswers ?? {};
  const m = response.multiAnswers ?? {};

  // ---- 1) 人设计票（脚本 3.2）----
  const votes: Partial<Record<PersonaId, number>> = {};
  // 记录每个场景投给了谁，平票时按场景 1 > 2 > 3 的先后取先出现者
  const voteOrder: PersonaId[] = [];
  let scenarioCount = 0;
  for (const idx of [6, 7, 8]) {
    const v = num(a[idx]);
    if (v === null) continue;
    const persona = SCENARIO_PERSONA[idx][v];
    if (!persona) continue; // 「都不是」「没遇到过」不计票
    scenarioCount++;
    votes[persona] = (votes[persona] ?? 0) + 1;
    voteOrder.push(persona);
  }

  const ranked = (Object.entries(votes) as Array<[PersonaId, number]>).sort(
    (p, q) => {
      if (q[1] !== p[1]) return q[1] - p[1];
      // 平票：非接球手优先当主型（把接球手留作亮点，别让他「陪跑」）；
      // 仍平则按场景先后（更日常的场景更能代表默认反应）
      const pc = p[0] === "catcher" ? 1 : 0;
      const qc = q[0] === "catcher" ? 1 : 0;
      if (pc !== qc) return pc - qc;
      return voteOrder.indexOf(p[0]) - voteOrder.indexOf(q[0]);
    }
  );

  const persona = ranked[0]?.[0] ?? null;
  const personaSecondary = ranked[1]?.[0] ?? null;
  const catcherVotes = votes.catcher ?? 0;
  const isCatcherStar = catcherVotes >= 2;

  // ---- 2) 楼层（脚本 3.3）----
  const behaviorFloor = persona ? PERSONA_FLOOR[persona] : null;
  const attnVals = Array.isArray(m[10])
    ? m[10].filter((v): v is number => typeof v === "number" && v >= 1 && v <= 4)
    : [];
  // 线上对话2是多选（脚本设想单选）：取所选中的最高注意力层——
  // 「已有的火种」看的是他到过的最高处
  const attentionFloor = (attnVals.length > 0 ? Math.max(...attnVals) : null) as
    | 1 | 2 | 3 | 4 | null;

  let defaultFloor: CardModel["defaultFloor"] = null;
  let sparkFloor: CardModel["sparkFloor"] = null;
  if (behaviorFloor !== null && attentionFloor !== null) {
    defaultFloor = Math.min(behaviorFloor, attentionFloor) as 1 | 2 | 3;
    if (attentionFloor !== behaviorFloor) {
      sparkFloor = Math.max(behaviorFloor, attentionFloor) as 2 | 3 | 4;
    }
  } else {
    defaultFloor = behaviorFloor ?? attentionFloor;
  }

  // ---- 3) 对话1 场域 ----
  const d1 = num(a[9]);
  const dialogueField = (d1 && d1 >= 1 && d1 <= 5 ? d1 : null) as CardModel["dialogueField"];

  // ---- 4) 翻转 ----
  const guessScore = num(a[11]);
  const selfScore = num(a[12]);
  const perspectiveGap =
    guessScore !== null && selfScore !== null ? selfScore - guessScore : null;

  const habitChoice = num(a[13]);
  const habit =
    habitChoice !== null && HABIT_LABELS[habitChoice]
      ? HABIT_LABELS[habitChoice]
      : cleanText(x[13]);

  // ---- 5) 语料（他自己的话）----
  const childQuote = cleanText(x[14]);
  const wantToUnderstand = cleanText(x[15]);
  const ownWords = cleanText(x[6]) ?? cleanText(x[7]) ?? cleanText(x[8]);

  return {
    nickname: cleanText(x[2]) ?? cleanText(x[1]) ?? "这位家长",
    childName: cleanText(x[20]) ?? "孩子",
    persona,
    personaSecondary,
    votes,
    scenarioCount,
    isCatcherStar,
    behaviorFloor,
    attentionFloor,
    defaultFloor,
    sparkFloor,
    dialogueField,
    perspectiveGap,
    guessScore,
    selfScore,
    habit,
    childQuote,
    wantToUnderstand,
    ownWords,
    importance: num(a[17]),
    confidence: num(a[18]),
  };
}
