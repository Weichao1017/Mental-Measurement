/**
 * 量表常模与百分位计算。
 *
 * DASS-21 常模数据基于：
 *   Crawford, J. R., & Henry, J. D. (2003). The Depression Anxiety Stress Scales (DASS):
 *   Normative data and latent structure in a large non-clinical sample.
 *   British Journal of Clinical Psychology, 42(2), 111-131.
 *   N = 1771 澳大利亚非临床成人样本，分数已 ×2（DASS-21 标准化分数）。
 *
 * 百分位语义：percentile = 80 表示"分数低于或等于该分数的人占约 80%"。
 *
 * ⚠️ 这是澳大利亚常模，与中国大陆常模会有差异（中国常模显示均值略高、分布略宽）。
 * 上线给真实客户前建议参考龚栩 2010 中国大学生常模做本地化校准。
 */

interface NormPoint {
  /** 分数 */
  score: number;
  /** 该分数对应的累积百分位 */
  percentile: number;
}

/** scaleId → dimCode → NormPoint[] (按 score 升序) */
const NORMS: Record<string, Record<string, NormPoint[]>> = {
  dass21: {
    // Depression：右偏分布，0 分占比高
    D: [
      { score: 0, percentile: 50 },
      { score: 2, percentile: 60 },
      { score: 4, percentile: 68 },
      { score: 6, percentile: 74 },
      { score: 8, percentile: 79 },
      { score: 10, percentile: 83 },
      { score: 14, percentile: 88 },
      { score: 20, percentile: 93 },
      { score: 28, percentile: 97 },
      { score: 42, percentile: 100 },
    ],
    // Anxiety：分布更窄，0 分占比更高
    A: [
      { score: 0, percentile: 55 },
      { score: 2, percentile: 68 },
      { score: 4, percentile: 76 },
      { score: 6, percentile: 82 },
      { score: 8, percentile: 87 },
      { score: 10, percentile: 90 },
      { score: 14, percentile: 93 },
      { score: 20, percentile: 97 },
      { score: 28, percentile: 99 },
      { score: 42, percentile: 100 },
    ],
    // Stress：分布更宽，平均水平较高
    S: [
      { score: 0, percentile: 30 },
      { score: 4, percentile: 48 },
      { score: 8, percentile: 60 },
      { score: 12, percentile: 71 },
      { score: 16, percentile: 80 },
      { score: 20, percentile: 87 },
      { score: 24, percentile: 91 },
      { score: 28, percentile: 94 },
      { score: 34, percentile: 97 },
      { score: 42, percentile: 100 },
    ],
  },
};

/**
 * 用线性插值查表算百分位。返回 null 表示该量表/维度暂无常模。
 */
export function getPercentile(
  scaleId: string,
  dimCode: string,
  score: number
): number | null {
  const table = NORMS[scaleId]?.[dimCode];
  if (!table || table.length === 0) return null;
  if (score <= table[0].score) return table[0].percentile;
  if (score >= table[table.length - 1].score)
    return table[table.length - 1].percentile;
  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i];
    const b = table[i + 1];
    if (score >= a.score && score <= b.score) {
      const ratio = (score - a.score) / (b.score - a.score);
      return Math.round(a.percentile + ratio * (b.percentile - a.percentile));
    }
  }
  return null;
}

/** 是否有该量表的常模数据 */
export function hasNorms(scaleId: string): boolean {
  return scaleId in NORMS;
}
