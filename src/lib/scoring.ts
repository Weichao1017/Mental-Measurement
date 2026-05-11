import type {
  Scale,
  ScaleResponse,
  ScaleResult,
  DimensionScore,
  SeverityBand,
} from "./types";

/**
 * 通用计分函数
 * 支持 sum / sum_times_2 / mean / sum_times_4 / custom
 * custom 模式由各量表自己实现（如 PSQI）
 */
export function scoreScale(scale: Scale, response: ScaleResponse): ScaleResult {
  const answers = response.answers ?? {};

  const dimensions: DimensionScore[] = scale.dimensions.map((dim) => {
    let rawSum = 0;
    let validCount = 0;

    for (const idx of dim.itemIndices) {
      const item = scale.items.find((i) => i.index === idx);
      if (!item) continue;
      const raw = answers[idx];
      if (typeof raw !== "number") continue;
      validCount += 1;
      // 反向计分：max + min - raw
      const optionVals = scale.options.map((o) => o.value);
      const optMin = Math.min(...optionVals);
      const optMax = Math.max(...optionVals);
      const v = item.reverse ? optMax + optMin - raw : raw;
      rawSum += v;
    }

    let finalScore = rawSum;
    if (scale.scoringMethod === "sum_times_2") finalScore = rawSum * 2;
    else if (scale.scoringMethod === "sum_times_4") finalScore = rawSum * 4;
    else if (scale.scoringMethod === "mean")
      finalScore = validCount > 0 ? rawSum / validCount : 0;

    const bands = scale.severityBands[dim.code] ?? [];
    const band = findBand(finalScore, bands);

    return {
      code: dim.code,
      name: dim.name,
      rawSum,
      finalScore,
      band,
    };
  });

  // 警示题检查
  const warnings: ScaleResult["warnings"] = [];
  for (const item of scale.items) {
    if (!item.flags?.length) continue;
    const ans = answers[item.index];
    if (typeof ans !== "number") continue;
    // 触发条件：分数 >= 2 即视为命中（按 0-3 量表）
    // 不同量表可能要不同阈值，这里走通用规则
    if (ans >= 2) {
      for (const flag of item.flags) {
        warnings.push({
          itemIndex: item.index,
          itemText: item.text,
          answer: ans,
          flag,
        });
      }
    }
  }

  // 是否完整
  const complete = scale.items.every((i) => typeof answers[i.index] === "number");

  // 总分（部分量表用得到，比如 WHO-5）
  const totalScore =
    scale.dimensions.length === 1
      ? dimensions[0]?.finalScore
      : dimensions.reduce((acc, d) => acc + d.finalScore, 0);

  return {
    scaleId: scale.id,
    scaleName: scale.name,
    scoringMethod: scale.scoringMethod,
    dimensions,
    totalScore,
    warnings,
    complete,
  };
}

function findBand(score: number, bands: SeverityBand[]): SeverityBand | null {
  for (const b of bands) {
    const min = b.min;
    const max = b.max ?? Number.POSITIVE_INFINITY;
    if (score >= min && score <= max) return b;
  }
  return null;
}

/** 计算整体进度（已答 / 总题数） */
export function calcProgress(scale: Scale, response: ScaleResponse) {
  const total = scale.items.length;
  const answered = scale.items.filter(
    (i) => typeof response.answers[i.index] === "number"
  ).length;
  return { answered, total, pct: total > 0 ? answered / total : 0 };
}
