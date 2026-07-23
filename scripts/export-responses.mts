/**
 * 把收集本的原始作答（.ndjson）解码导出成人可读的存档。
 *
 *   npx tsx scripts/export-responses.mts <collections目录> <输出目录> [收集本id]
 *
 * 产出：
 *   全部作答存档.md —— 每份逐题全文
 *   作答汇总.csv    —— 一行一人（Excel 可直接开，带 BOM）
 *
 * 说明：解码复用站点自身的 share/scoring/scales 逻辑，因此与看板显示口径一致
 * （含 children 复合题、以及题型变更前旧数据的向后兼容回退）。
 * 只读输入、只写输出，绝不修改任何作答数据。
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { decodePayload, payloadToResponses } from "../src/lib/share.ts";
import { getScale } from "../src/lib/scales/index.ts";
import { parseChildren, isItemAnswered } from "../src/lib/scoring.ts";

const [, , srcDir, outDir, wantId] = process.argv;
if (!srcDir || !outDir) {
  console.error("用法: npx tsx scripts/export-responses.mts <collections目录> <输出目录> [收集本id]");
  process.exit(1);
}

const scale = getScale("salon-warmup")!;
const items = scale.items.filter((i) => !i.hidden);

function renderValue(item: any, r: any): string {
  const kind = item.inputType ?? "choice";
  const opts = item.options ?? scale.options;
  if (kind === "text") return (r.textAnswers?.[item.index] ?? "").trim() || "（未答）";
  if (kind === "children") {
    let rows = parseChildren(r.textAnswers?.[item.index]);
    if (rows.length === 0 && item.childrenLegacy) {
      const a = r.answers[item.childrenLegacy.ageIndex];
      const g =
        r.multiAnswers?.[item.childrenLegacy.genderIndex]?.[0] ??
        r.answers[item.childrenLegacy.genderIndex];
      if (typeof a === "number" || typeof g === "number") {
        rows = [{ age: typeof a === "number" ? a : null, gender: typeof g === "number" ? g : null }];
      }
    }
    if (!rows.length) return "（未答）";
    return rows
      .map(
        (c, i) =>
          `孩子${i + 1}: ${c.age ?? "?"}${item.unit ?? ""}·${
            opts.find((o: any) => o.value === c.gender)?.label ?? "?"
          }`
      )
      .join("；");
  }
  if (kind === "multi") {
    let vals: number[] = r.multiAnswers?.[item.index] ?? [];
    if (!vals.length && typeof r.answers[item.index] === "number") vals = [r.answers[item.index]];
    if (!vals.length) return "（未答）";
    return vals.map((v) => opts.find((o: any) => o.value === v)?.label ?? String(v)).join("；");
  }
  const raw = r.answers[item.index];
  if (typeof raw !== "number") return "（未答）";
  if (kind === "number") return `${raw}${item.unit ?? ""}`;
  return opts.find((o: any) => o.value === raw)?.label ?? String(raw);
}

const ndjsons = readdirSync(srcDir)
  .filter((f) => f.endsWith(".ndjson"))
  .filter((f) => !wantId || f === `${wantId}.ndjson`);

if (ndjsons.length === 0) {
  console.error(`在 ${srcDir} 里没找到 .ndjson`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const esc = (s: string) => `"${String(s).replace(/"/g, '""').replace(/\n/g, " ")}"`;
let total = 0;

for (const file of ndjsons) {
  const cid = file.replace(/\.ndjson$/, "");
  const lines = readFileSync(path.join(srcDir, file), "utf8").trim().split("\n").filter(Boolean);
  const md: string[] = [
    `# 家庭沙龙——家长热身问卷 · 作答存档`,
    ``,
    `收集本：${cid}　共 ${lines.length} 份　导出于 ${new Date().toISOString()}`,
    ``,
  ];
  const csv: string[] = ["序号,提交时间,微信名,昵称,孩子,出生地,沟通重要性(1-10),练成把握(1-10)"];

  lines.forEach((line, i) => {
    let o: any;
    try {
      o = JSON.parse(line);
    } catch {
      md.push(`## #${i + 1} 该行数据损坏，已跳过`, ``);
      return;
    }
    const p = decodePayload(o.d);
    if (!p) {
      md.push(`## #${i + 1} 解码失败（版本不匹配？）`, ``);
      return;
    }
    const r = payloadToResponses(p)["salon-warmup"];
    const get = (idx: number) => {
      const it = items.find((x) => x.index === idx);
      return it ? renderValue(it, r) : "-";
    };
    const answered = items.filter((it) => isItemAnswered(it, r)).length;
    md.push(
      `## #${i + 1}　${get(1)}（${get(2)}）`,
      ``,
      `- 提交时间：${o.receivedAt}`,
      `- 完成度：${answered}/${items.length}`,
      ``
    );
    items.forEach((it, n) => {
      md.push(`**${n + 1}. ${it.text}**`, ``, renderValue(it, r), ``);
    });
    md.push(`---`, ``);
    csv.push(
      [i + 1, o.receivedAt, get(1), get(2), get(3), get(19), get(17), get(18)]
        .map((x) => esc(String(x)))
        .join(",")
    );
    total++;
  });

  const suffix = ndjsons.length > 1 ? `-${cid}` : "";
  // 结尾补换行：否则部分表格/脚本工具会漏读最后一行
  writeFileSync(path.join(outDir, `全部作答存档${suffix}.md`), md.join("\n") + "\n", "utf8");
  writeFileSync(
    path.join(outDir, `作答汇总${suffix}.csv`),
    "﻿" + csv.join("\n") + "\n",
    "utf8"
  );
}

console.log(`✅ 已导出 ${total} 份作答 → ${outDir}`);
