/**
 * PSQI 匹兹堡睡眠质量指数（Pittsburgh Sleep Quality Index）
 *
 * ⚠️ 题目内容未完成核对（fullyVerified: false）
 * ⚠️ PSQI 的计分逻辑是 7 个 component 各自加权计算，不是简单 Likert 求和
 *    本骨架的 scoringMethod = "custom" —— Claude Code 需在 scoring.ts 里
 *    实现 PSQI 专用计分函数
 *
 * 来源：
 *   - Buysse, D. J., Reynolds, C. F., Monk, T. H., Berman, S. R., & Kupfer, D. J.
 *     (1989). The Pittsburgh Sleep Quality Index: A new instrument for psychiatric
 *     practice and research. Psychiatry Research, 28(2), 193-213.
 *   - 中文版：刘贤臣, 唐茂芹, 胡蕾, 等. (1996). 匹兹堡睡眠质量指数的信度和效度研究.
 *     中华精神科杂志, 29(2), 103-107.
 *
 * 7 个 component（每个 0-3 分，总分 0-21）：
 *   - C1 主观睡眠质量
 *   - C2 入睡时间
 *   - C3 睡眠时间
 *   - C4 睡眠效率
 *   - C5 睡眠紊乱
 *   - C6 催眠药物使用
 *   - C7 日间功能障碍
 *
 * 临床切点：
 *   - 总分 ≤ 5：睡眠质量良好
 *   - 总分 > 5：睡眠质量较差
 *   - 总分 ≥ 8：刘贤臣 (1996) 中国常模建议作为"睡眠障碍"切点
 *
 * 项目类型：
 *   - 自由文本（入睡时间分钟、卧床时间、起床时间）
 *   - Likert（频率：过去 1 月内 0/1-2/3-4/5-7 次/周）
 *   - 单选（睡眠质量：非常好/较好/较差/很差）
 *
 * 鉴于 PSQI 项目类型复杂，骨架仅放结构 + 引用，
 * Claude Code 接力任务包含：
 *   1. 设计 PSQI 专用作答 UI（支持时间输入、频率选择、单选）
 *   2. 实现 PSQI 计分算法（7 个 component 各自加权）
 *   3. 中文措辞从 刘贤臣 (1996) 修订版抽取
 */

import type { Scale } from "../types";

// PSQI 的"items" 是逻辑题，但实际 UI 是混合形式。
// 这里只列出 component 维度，具体题目放到 Claude Code 实现里。
export const psqi: Scale = {
  id: "psqi",
  slug: "psqi",
  name: "PSQI 匹兹堡睡眠质量指数",
  description: "评估过去一个月的睡眠质量与睡眠相关问题",
  timeFrame: "过去一个月",
  estimatedMinutes: 5,
  isCore: false,
  triggers: ["sleep_problems"],
  instructions:
    "下列问题与您最近 1 个月的睡眠状况有关。请回答最符合您过去 1 个月内大多数白天和晚上情况的答案。",
  options: [], // 各题选项不同，UI 端按题处理
  items: [], // Claude Code 接力时填入完整题目结构
  dimensions: [
    { code: "C1", name: "主观睡眠质量", itemIndices: [] },
    { code: "C2", name: "入睡时间", itemIndices: [] },
    { code: "C3", name: "睡眠时间", itemIndices: [] },
    { code: "C4", name: "睡眠效率", itemIndices: [] },
    { code: "C5", name: "睡眠紊乱", itemIndices: [] },
    { code: "C6", name: "催眠药物", itemIndices: [] },
    { code: "C7", name: "日间功能障碍", itemIndices: [] },
  ],
  scoringMethod: "custom",
  severityBands: {
    total: [
      { level: "normal", label: "睡眠质量良好", min: 0, max: 5 },
      { level: "moderate", label: "睡眠质量一般", min: 6, max: 7 },
      { level: "high", label: "存在睡眠障碍（中国常模建议）", min: 8, max: 21 },
    ],
  },
  citation: "Buysse et al. (1989); Chinese: 刘贤臣 et al. (1996)",
  fullyVerified: false,
  notes:
    "PSQI 项目类型复杂（含时长输入、频率单选等），需 Claude Code 专门实现 UI 与计分算法。骨架仅占位。",
};
