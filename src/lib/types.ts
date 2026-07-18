// 量表与作答的核心类型定义

/** 量表条目（题目） */
export interface ScaleItem {
  /** 在本量表中的题号（从 1 开始） */
  index: number;
  /** 题目正文（默认简体中文） */
  text: string;
  /** 英文原版题目（量表原版语言；若量表本身就是英文起源则这里是 ground truth） */
  textEn?: string;
  /** 所属维度（缩写代码，如 "D" / "A" / "S"） */
  dimension: string;
  /** 是否反向计分 */
  reverse?: boolean;
  /** 题目额外标签（如自杀意念警示题、需要单独处理） */
  flags?: Array<"suicidal_ideation" | "warning">;
  /**
   * 警示题的触发阈值（≥ 该值才触发警示）。默认 2。
   * - DASS-21 #21 用默认 2（"很大程度上符合"才触发）
   * - PHQ-9 #9 临床惯例用 1（"好几天"已需进一步评估）
   */
  flagThreshold?: number;
  /**
   * 来源标注（用于审计 / 引用透明度）
   * 例如 DASS-21 #1 来自 DASS-42 #22
   */
  sourceRef?: string;
  /** 仍未从权威来源核对，前端可显示警告 */
  unverified?: boolean;
  /**
   * 该题专属选项；不传则使用 scale.options。
   * 用于 PSQI 这种各题选项不同的量表。
   */
  options?: LikertOption[];
  /**
   * 题型（收集型问卷用；标准量表不设，默认 "choice" 即 Likert 单选）：
   *  - choice：单选（答案存 answers[index]，number）
   *  - multi：多选（答案存 multiAnswers[index]，number[]）
   *  - text：自由文本（答案存 textAnswers[index]，string）
   *  - number：数字填写（答案存 answers[index]，number）
   */
  inputType?: "choice" | "multi" | "text" | "number";
  /** 选答题：不计入完成度门槛，可跳过 */
  optional?: boolean;
  /** text 题用多行 textarea（默认单行 input） */
  multiline?: boolean;
  /** text / number 题的占位提示 */
  placeholder?: string;
  /**
   * choice 题下方附加的自由补充输入（如「都不是，我实际大概会说：」）。
   * 始终可见、不计入完成度；内容存 textAnswers[index]。
   */
  freeTextLabel?: string;
  /** 强制 UI 形态；不设则沿用 QuestionCard 现有启发式（≥5 项用滑杆） */
  widget?: "buttons" | "slider";
  /** number 题的最小/最大值与单位 */
  min?: number;
  max?: number;
  unit?: string;
  /** 分节标题：设在每节第一题上，渲染于该题卡片之前 */
  section?: { title: string; note?: string };
}

/** Likert 选项 */
export interface LikertOption {
  value: number;
  label: string;
  labelEn?: string;
  /** 短标签，结果页 / 进度回顾展示用 */
  short?: string;
  shortEn?: string;
}

/** 量表维度（用于结果分维度展示） */
export interface ScaleDimension {
  code: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  /** 该维度包含的题号（DASS-21 index） */
  itemIndices: number[];
  /**
   * 该维度是「中性/适应性」的——高分不代表更差，结果页不按 scale.highIsBetter
   * 的好/坏语义上色（改用中性灰）。如 RRS 的 Reflection 反思维度。
   */
  neutralValence?: boolean;
}

/** 严重程度分级阈值 */
export interface SeverityBand {
  level: "normal" | "mild" | "moderate" | "severe" | "extremely_severe" | "low" | "high";
  label: string;
  labelEn?: string;
  /** 最小值（含） */
  min: number;
  /** 最大值（含），null 表示无上限 */
  max: number | null;
  /** 给客户看的简短解读 */
  clientNote?: string;
  clientNoteEn?: string;
  /** 给老师看的简短建议 */
  teacherNote?: string;
  teacherNoteEn?: string;
}

/** 量表元数据 */
export interface Scale {
  id: string;
  /** 短标识，URL 路径用 */
  slug: string;
  /** 显示名（中文） */
  name: string;
  nameEn?: string;
  /** 短描述 */
  description: string;
  descriptionEn?: string;
  /** 时间窗口（"过去一周" / "过去两周" 等） */
  timeFrame: string;
  timeFrameEn?: string;
  /** 估算填写时长（分钟） */
  estimatedMinutes: number;
  /** 是否核心量表（所有客户必填） */
  isCore: boolean;
  /**
   * 分类（题库页分组用）。常见值：
   *  - "anxiety_clinical"：焦虑情绪测评（GAD-7、PHQ-9、MDQ、WSAS、PSWQ、RRS-10、ASRS）
   *  - "general"：综合 / 默认（DASS-21、WHO-5 等其它）
   * 未设置则归入 "其他评估"。
   */
  category?: string;
  /**
   * 分数方向：true 表示高分=能力强/状态好（如 WHO-5、FFMQ、SCS、MAIA），
   * false 表示高分=症状重/困难多（如 DASS-21、DERS-SF、ECR-12、PSQI）。
   * 影响结果页色彩语义（高=绿 vs 高=红）。
   */
  highIsBetter: boolean;
  /**
   * 不参与「临床综合判定」(computeClinicalFlag) —— 即不产生「建议就医 / 用药」类信号。
   * 用于关系/人格类构念量表（如 ECR-12 依恋）：高分有意义、仍按严重度上色，
   * 但不应推导出 SSRI / 精神科取向的医学建议。结果页维度分照常展示。
   */
  excludeFromClinicalFlag?: boolean;
  /**
   * 纯收集型问卷（无标准计分）：不产出维度分/分级/总分，不参与临床综合判定
   * 与 AI 分析；结果页与 therapist 视图改为逐题回顾原始回答。
   * 例：家庭沙龙——家长热身问卷。
   */
  isSurvey?: boolean;
  /** 每个维度的满分（用于结果页显示 "14 / 42"），未设置则不显示分母 */
  dimensionMaxScore?: number;
  /** 触发该量表的"主诉关键词"（仅 isCore=false 时有用） */
  triggers?: string[];
  /** 指导语 */
  instructions: string;
  instructionsEn?: string;
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
  /** 文本题 / 自由补充的回答（收集型问卷用），键是 item.index */
  textAnswers?: Record<number, string>;
  /** 多选题的回答（收集型问卷用），键是 item.index */
  multiAnswers?: Record<number, number[]>;
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
  /**
   * 收集本 id（老师后端回收作答）。仅当来访者从「已开启回收」的作答链接
   * (/start/?b=...&collect=<id>) 进入时才有；无此字段=默认关，作答只留本机、零上传。
   */
  collectionId?: string;
  /** 已成功上传到收集本的时间（幂等标记，避免重复提交） */
  uploadedAt?: string;
}
