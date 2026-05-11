/**
 * 计分单元测试（用 tsx 直接跑：npm run test:scoring）
 * 主要验证：
 *   1. DASS-21 三维度求和后 ×2 的正确性
 *   2. DASS-21 严重程度分级查表正确性
 *   3. WHO-5 ×4 转换正确性
 *   4. 警示题（自杀意念）触发逻辑
 *   5. 反向计分逻辑（用 SCS-SF / FFMQ-15 占位结构）
 */

import { scoreScale } from "../src/lib/scoring";
import { dass21 } from "../src/lib/scales/dass21";
import { who5 } from "../src/lib/scales/who5";
import { scsSf } from "../src/lib/scales/scs-sf";
import type { ScaleResponse } from "../src/lib/types";

let pass = 0;
let fail = 0;

function expectEq<T>(name: string, actual: T, expected: T) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    pass += 1;
    console.log(`  ✓ ${name}`);
  } else {
    fail += 1;
    console.log(`  ✗ ${name}`);
    console.log(`    expected: ${JSON.stringify(expected)}`);
    console.log(`    actual:   ${JSON.stringify(actual)}`);
  }
}

// ============================================================
// 测试 1：DASS-21 全选 0 → 三维度都是 0（正常）
// ============================================================
console.log("\nDASS-21 · 全 0 作答");
{
  const answers: Record<number, number> = {};
  for (let i = 1; i <= 21; i++) answers[i] = 0;
  const resp: ScaleResponse = { scaleId: "dass21", answers };
  const r = scoreScale(dass21, resp);
  expectEq("complete=true", r.complete, true);
  expectEq("D 维度 finalScore=0", r.dimensions.find((d) => d.code === "D")?.finalScore, 0);
  expectEq("A 维度 finalScore=0", r.dimensions.find((d) => d.code === "A")?.finalScore, 0);
  expectEq("S 维度 finalScore=0", r.dimensions.find((d) => d.code === "S")?.finalScore, 0);
  expectEq(
    "D 分级 = 正常",
    r.dimensions.find((d) => d.code === "D")?.band?.level,
    "normal"
  );
  expectEq("无警示", r.warnings.length, 0);
}

// ============================================================
// 测试 2：DASS-21 全选 3 → 三维度都是 42（极重度）
// ============================================================
console.log("\nDASS-21 · 全 3 作答");
{
  const answers: Record<number, number> = {};
  for (let i = 1; i <= 21; i++) answers[i] = 3;
  const resp: ScaleResponse = { scaleId: "dass21", answers };
  const r = scoreScale(dass21, resp);
  // 每维度 7 题 × 3 分 = 21，×2 = 42
  expectEq("D 维度 finalScore=42", r.dimensions.find((d) => d.code === "D")?.finalScore, 42);
  expectEq("A 维度 finalScore=42", r.dimensions.find((d) => d.code === "A")?.finalScore, 42);
  expectEq("S 维度 finalScore=42", r.dimensions.find((d) => d.code === "S")?.finalScore, 42);
  expectEq(
    "D 分级 = 极重度",
    r.dimensions.find((d) => d.code === "D")?.band?.level,
    "extremely_severe"
  );
  expectEq("第 21 题命中警示", r.warnings.length, 1);
  expectEq("警示题号 = 21", r.warnings[0]?.itemIndex, 21);
}

// ============================================================
// 测试 3：DASS-21 抑郁中度边界
// 每道 D 题选 1，共 7 题，和=7，×2=14（中度起点）
// ============================================================
console.log("\nDASS-21 · 抑郁维度 14 分 = 中度");
{
  const answers: Record<number, number> = {};
  for (let i = 1; i <= 21; i++) answers[i] = 0;
  // D 题：3, 5, 10, 13, 16, 17, 21
  [3, 5, 10, 13, 16, 17, 21].forEach((i) => (answers[i] = 1));
  const resp: ScaleResponse = { scaleId: "dass21", answers };
  const r = scoreScale(dass21, resp);
  expectEq("D 维度 finalScore=14", r.dimensions.find((d) => d.code === "D")?.finalScore, 14);
  expectEq(
    "D 分级 = 中度",
    r.dimensions.find((d) => d.code === "D")?.band?.level,
    "moderate"
  );
}

// ============================================================
// 测试 4：DASS-21 焦虑轻度边界
// 焦虑题选 0,0,0,0,0,2,2 = 4，×2 = 8（轻度起点）
// ============================================================
console.log("\nDASS-21 · 焦虑维度 8 分 = 轻度");
{
  const answers: Record<number, number> = {};
  for (let i = 1; i <= 21; i++) answers[i] = 0;
  // A 题：2, 4, 7, 9, 15, 19, 20
  answers[19] = 2;
  answers[20] = 2;
  const resp: ScaleResponse = { scaleId: "dass21", answers };
  const r = scoreScale(dass21, resp);
  expectEq("A 维度 finalScore=8", r.dimensions.find((d) => d.code === "A")?.finalScore, 8);
  expectEq(
    "A 分级 = 轻度",
    r.dimensions.find((d) => d.code === "A")?.band?.level,
    "mild"
  );
}

// ============================================================
// 测试 5：DASS-21 第 21 题（自杀意念）警示触发
// ============================================================
console.log("\nDASS-21 · 警示题触发");
{
  const answers: Record<number, number> = {};
  for (let i = 1; i <= 21; i++) answers[i] = 0;
  answers[21] = 2; // 触发
  const resp: ScaleResponse = { scaleId: "dass21", answers };
  const r = scoreScale(dass21, resp);
  expectEq("有 1 条警示", r.warnings.length, 1);
  expectEq("警示题号 = 21", r.warnings[0]?.itemIndex, 21);
  expectEq("警示标识 = suicidal_ideation", r.warnings[0]?.flag, "suicidal_ideation");

  // 即使第 21 题不命中，分数仍能正常计算
  answers[21] = 1;
  const r2 = scoreScale(dass21, { scaleId: "dass21", answers });
  expectEq("第 21 题 = 1 不触发警示", r2.warnings.length, 0);
}

// ============================================================
// 测试 6：WHO-5 ×4 转换
// 全选 5 → 5 × 5 = 25 × 4 = 100
// 全选 0 → 0
// 全选 3 → 15 × 4 = 60
// ============================================================
console.log("\nWHO-5 · ×4 转换");
{
  const r1 = scoreScale(who5, {
    scaleId: "who5",
    answers: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
  });
  expectEq("全 5 → 100", r1.dimensions[0]?.finalScore, 100);
  expectEq("全 5 分级 = high", r1.dimensions[0]?.band?.level, "high");

  const r2 = scoreScale(who5, {
    scaleId: "who5",
    answers: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  expectEq("全 0 → 0", r2.dimensions[0]?.finalScore, 0);
  expectEq("全 0 分级 = low（抑郁筛查）", r2.dimensions[0]?.band?.level, "low");

  const r3 = scoreScale(who5, {
    scaleId: "who5",
    answers: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 },
  });
  expectEq("全 3 → 60", r3.dimensions[0]?.finalScore, 60);
}

// ============================================================
// 测试 7：反向计分（SCS-SF 占位结构）
// SCS-SF options: 1..5
// 全选 1，所有反向题翻转后 → 第 1, 8 (SJ 反向) 翻为 5
// 维度均值 = 5（这里只测反向题逻辑能跑通，不验证具体题目内容）
// ============================================================
console.log("\nSCS-SF · 反向计分逻辑");
{
  const answers: Record<number, number> = {};
  for (let i = 1; i <= 12; i++) answers[i] = 1;
  const r = scoreScale(scsSf, { scaleId: "scs-sf", answers });
  // 反向题被翻转后值变为 5；非反向题保持 1
  // SJ 维度全是反向题（item 1, 8），所以均值 = 5
  expectEq("SJ 反向均值 = 5", r.dimensions.find((d) => d.code === "SJ")?.finalScore, 5);
  // SK 维度全是正向（item 5, 10），所以均值 = 1
  expectEq("SK 正向均值 = 1", r.dimensions.find((d) => d.code === "SK")?.finalScore, 1);
}

// ============================================================
// 测试 8：share 编解码 round-trip（therapist 视图能正确重建答案）
// ============================================================
import { encodeSession, decodePayload, payloadToResponses } from "../src/lib/share";
import type { SessionState } from "../src/lib/types";

console.log("\nshare · 编解码 round-trip");
{
  const original: SessionState = {
    startedAt: "2026-05-10T12:34:56.000Z",
    concerns: ["body_disconnect", "sleep_problems"],
    battery: ["dass21", "who5"],
    currentIndex: 2,
    responses: {
      dass21: {
        scaleId: "dass21",
        answers: {
          1: 0, 2: 1, 3: 2, 4: 3, 5: 0, 6: 1, 7: 2,
          8: 3, 9: 0, 10: 1, 11: 2, 12: 3, 13: 0, 14: 1,
          15: 2, 16: 3, 17: 0, 18: 1, 19: 2, 20: 3, 21: 2,
        },
      },
      who5: {
        scaleId: "who5",
        answers: { 1: 5, 2: 4, 3: 3, 4: 2, 5: 1 },
      },
    },
  };

  const encoded = encodeSession(original);
  expectEq("encoded 是非空字符串", typeof encoded === "string" && encoded.length > 0, true);
  expectEq("encoded 不含 URL 不安全字符", /^[A-Za-z0-9_-]+$/.test(encoded), true);

  const payload = decodePayload(encoded);
  expectEq("decode 不返回 null", payload !== null, true);
  expectEq("payload.t 一致", payload?.t, original.startedAt);
  expectEq("payload.c 一致", payload?.c, original.concerns);
  expectEq("payload.b 一致", payload?.b, original.battery);

  const responses = payloadToResponses(payload!);
  expectEq("重建后 dass21.answers 一致", responses.dass21.answers, original.responses.dass21.answers);
  expectEq("重建后 who5.answers 一致", responses.who5.answers, original.responses.who5.answers);

  // 警示题触发逻辑通过 round-trip 也要能识别
  const dass21Result = scoreScale(dass21, responses.dass21);
  expectEq(
    "round-trip 后警示题仍触发",
    dass21Result.warnings.length >= 1 && dass21Result.warnings[0].itemIndex === 21,
    true
  );
}

console.log("\nshare · 损坏链接安全处理");
{
  expectEq("空串 → null", decodePayload(""), null);
  expectEq("乱码 → null", decodePayload("!!!not-base64!!!"), null);
  expectEq("非 JSON → null", decodePayload("aGVsbG8"), null); // "hello"
  // 旧版本号
  const oldVersion = Buffer.from(JSON.stringify({ v: 999, t: "x", c: [], b: [], a: {} })).toString("base64url");
  expectEq("不匹配版本 → null", decodePayload(oldVersion), null);
}

console.log("\nshare · 部分未答题的处理");
{
  const partial: SessionState = {
    startedAt: "2026-05-10T00:00:00.000Z",
    concerns: [],
    battery: ["who5"],
    currentIndex: 0,
    responses: {
      who5: { scaleId: "who5", answers: { 1: 5, 3: 3 } }, // 只答了 1 和 3
    },
  };
  const encoded = encodeSession(partial);
  const payload = decodePayload(encoded)!;
  const responses = payloadToResponses(payload);
  expectEq("未答题不出现在 answers 里", Object.keys(responses.who5.answers).sort(), ["1", "3"]);
  expectEq("已答题值保留", responses.who5.answers[1], 5);
}

// ============================================================
// 结果
// ============================================================
console.log(`\n${"=".repeat(50)}`);
console.log(`通过 ${pass} 项 / 失败 ${fail} 项`);
console.log("=".repeat(50));

if (fail > 0) {
  process.exit(1);
}
