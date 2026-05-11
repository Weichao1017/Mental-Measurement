// 量表与作答的核心类型定义

/** 量表条目（题目） */
export interface ScaleItem {
  /** 在本量表中的题号（从 1 开始） */
  index: number;
  /** 题目正文（默认简体中文） */
  text: string;
  /** 所属维度（缩写代码，如 "D" / "A" / "S"） */
  dimension: string;
  /** 是否反向计分 */
  reverse?: boolean;
  /** 题目额外标签（如自杀意念警示题、需要单独处理） */
  flags?: Array<"suicidal_ideation" | "warning">;
  /**
   * 来源标注（用于审计 / 引用透明度）
   * 例如 DASS-21 #1 来自 DASS-42 #22
   */
  sourceRef?: string;
  /** 仍未从权威来源核对，前端可显示警告 */
  unverified?: boolean;
}

/** Likert 选项 */
export interface LikertOption {
  value: number;
  label: string;
  /** 短标签，结果页 / 进度回顾展示用 */
  short?: string;
}

/** 量表维度（用于结果分维度展示） */
export interface ScaleDimension {
  code: string;
  name: string;
  description?: string;
  /** 该维度包含的题号（DASS-21 index） */
  itemIndices: number[];
}

/** 严重程度分级阈值 */
export interface SeverityBand {
  level: "normal" | "mild" | "moderate" | "severe" | "extremely_severe" | "low" | "high";
  label: string;
  /** 最小值（含） */
  min: number;
  /** 最大值（含），null 表示无上限 */
  max: number | null;
  /** 给客户看的简短解读 */
  clientNote?: string;
  /** 给老师看的简短建议 */
  teacherNote?: string;
}

/** 量表元数据 */
export interface Scale {
  id: string;
  /** 短标识，URL 路径用 */
  slug: string;
  /** 显示名（中文） */
  name: string;
  /** 短描述 */
  description: string;
  /** 时间窗口（"过去一周" / "过去两周" 等） */
  timeFrame: string;
  /** 估算填写时长（分钟） */
  estimatedMinutes: number;
  /** 是否核心量表（所有客户必填） */
  isCore: boolean;
  /**
   * 分数方向：true 表示高分=能力强/状态好（如 WHO-5、FFMQ、SCS、MAIA），
   * false 表示高分=症状重/困难多（如 DASS-21、DERS-SF、ECR-12、PSQI）。
   * 影响结果页色彩语义（高=绿 vs 高=红）。
   */
  highIsBetter: boolean;
  /** 每个维度的满分（用于结果页显示 "14 / 42"），未设置则不显示分母 */
  dimensionMaxScore?: number;
  /** 触发该量表的"主诉关键词"（仅 isCore=false 时有用） */
  triggers?: string[];
  /** 指导语 */
  instructions: string;
  /** Likert 选项 */
  options: LikertOption[];
  /** 所有题目 */
  items: ScaleItem[];
  /** 维度 */
  dimensions: ScaleDimension[];
  /**
   * 子维度得分如何计算
   *  - sum: 直接相加
   *  - sum_times_2: 相加后 ×2（DASS-21 用）
   *  - mean: 平均分
   *  - sum_times_4: ×4（WHO-5 转换为 0-100）
   */
  scoringMethod: "sum" | "sum_times_2" | "mean" | "sum_times_4" | "custom";
  /** 每个维度的严重程度分级表（key 为维度 code） */
  severityBands: Record<string, SeverityBand[]>;
  /** 引用来源 */
  citation: string;
  /** 是否所有题目都已从权威来源核对 */
  fullyVerified: boolean;
  /** 备注 */
  notes?: string;
}

/** 用户对一个量表的作答 */
export interface ScaleResponse {
  scaleId: string;
  /** 每道题的回答，键是 item.index，值是用户选择的 value */
  answers: Record<number, number>;
  /** 完成时间 */
  completedAt?: string;
}

/** 计分结果（单维度） */
export interface DimensionScore {
  code: string;
  name: string;
  rawSum: number;
  finalScore: number;
  band: SeverityBand | null;
}

/** 计分结果（整个量表） */
export interface ScaleResult {
  scaleId: string;
  scaleName: string;
  scoringMethod: Scale["scoringMethod"];
  dimensions: DimensionScore[];
  /** 总分（如适用） */
  totalScore?: number;
  /** 警示题命中（如 DASS-21 第 21 题） */
  warnings: Array<{ itemIndex: number; itemText: string; answer: number; flag: string }>;
  /** 是否完整作答 */
  complete: boolean;
}

/** 主诉勾选 → 决定带哪些可选量表 */
export type Concern =
  | "body_disconnect"
  | "emotion_dysregulation"
  | "sleep_problems"
  | "relationship_issues"
  | "wellbeing"
  | "mindfulness"
  | "self_compassion";

/** 整个会话的状态 */
export interface SessionState {
  /** 当前选中的主诉 */
  concerns: Concern[];
  /** 当前将要做的量表 id 列表（按顺序） */
  battery: string[];
  /** 当前正在做第几个量表 */
  currentIndex: number;
  /** 各量表答卷 */
  responses: Record<string, ScaleResponse>;
  /** 创建时间 */
  startedAt: string;
}
