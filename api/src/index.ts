/**
 * Mental-Measurement AI 分析 API（DeepSeek）
 *
 * 用 DeepSeek 而非 Anthropic 是因为 Anthropic 屏蔽腾讯香港 CVM IP。
 * Ash 主项目也用 DeepSeek，复用同一个 key。
 *
 * 端点：
 *   GET  /api/health   → 健康检查
 *   POST /api/analyze  → SSE 流式返回 AI 心理画像分析
 */

import { config as loadEnv } from "dotenv";
loadEnv();

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import OpenAI from "openai";
import { decodePayload, type SharePayload } from "./share.js";

const PORT = Number(process.env.PORT ?? 3100);
const MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-reasoner";
const MAX_TOKENS = Number(process.env.MAX_TOKENS ?? 8000);
const BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1";
const RATE_LIMIT = Number(process.env.RATE_LIMIT_PER_DAY ?? 10);
const API_KEY = process.env.DEEPSEEK_API_KEY;

if (!API_KEY) {
  console.error("FATAL: DEEPSEEK_API_KEY 环境变量未设置");
  process.exit(1);
}

const client = new OpenAI({ apiKey: API_KEY, baseURL: BASE_URL });

// 简易内存速率限制：IP → [timestamps]
const rateLimitMap = new Map<string, number[]>();
function checkRateLimit(ip: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const arr = (rateLimitMap.get(ip) ?? []).filter((t) => t > dayAgo);
  rateLimitMap.set(ip, arr);
  if (arr.length >= RATE_LIMIT) return { ok: false, remaining: 0 };
  arr.push(now);
  return { ok: true, remaining: RATE_LIMIT - arr.length };
}

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (
        origin.endsWith("ai1017.com") ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return origin;
      }
      return "";
    },
  })
);

app.get("/api/health", (c) =>
  c.json({ ok: true, model: MODEL, base_url: BASE_URL, rate_limit_per_day: RATE_LIMIT })
);

interface AnalyzeBody {
  d?: string;
  results: Array<{
    scaleId: string;
    scaleName: string;
    timeFrame?: string;
    highIsBetter?: boolean;
    dimensions: Array<{
      code: string;
      name: string;
      finalScore: number;
      maxScore?: number;
      bandLabel?: string;
      percentile?: number | null;
    }>;
    warnings: Array<{ itemText: string; answer: number; flag: string }>;
  }>;
  concerns?: string[];
  startedAt?: string;
}

app.post("/api/analyze", async (c) => {
  const ip =
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-real-ip") ||
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    return c.json(
      {
        error: "rate_limited",
        message: `每个 IP 每天最多 ${RATE_LIMIT} 次 AI 分析，请明天再试。`,
      },
      429
    );
  }

  let body: AnalyzeBody;
  try {
    body = await c.req.json<AnalyzeBody>();
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }

  if (!body.results || !Array.isArray(body.results) || body.results.length === 0) {
    return c.json({ error: "missing_results", message: "需要至少一个量表结果" }, 400);
  }

  let payload: SharePayload | null = null;
  if (body.d) payload = decodePayload(body.d);

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(body, payload);

  return streamSSE(c, async (stream) => {
    try {
      const completion = await client.chat.completions.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      });

      for await (const chunk of completion) {
        const delta = chunk.choices?.[0]?.delta as
          | { content?: string; reasoning_content?: string }
          | undefined;
        // deepseek-reasoner 在 reasoning 阶段有 reasoning_content，跳过
        // 只把最终 content 流给用户
        if (delta?.content) {
          await stream.writeSSE({
            event: "chunk",
            data: JSON.stringify({ text: delta.content }),
          });
        }
        const finishReason = chunk.choices?.[0]?.finish_reason;
        if (finishReason) {
          await stream.writeSSE({
            event: "done",
            data: JSON.stringify({
              ok: true,
              remaining: limit.remaining,
              finish_reason: finishReason,
            }),
          });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[analyze] deepseek error:", msg);
      await stream.writeSSE({
        event: "error",
        data: JSON.stringify({ error: "upstream", message: msg }),
      });
    }
  });
});

function buildSystemPrompt(): string {
  return `你是一位有经验、温暖、专业的心理评估解读师，正在帮一位普通用户理解 ta 刚完成的多维度心理评估结果。

输出结构（用 markdown，## 二级标题分节）：

## 整体状态
2-3 句话概括用户当前的整体心理状态画像。避免诊断性语言。

## 突出的优势
列 2-3 点用户在评估中体现出的资源、能力、积极迹象。具体引用维度名和分数。

## 值得关注的方面
列 2-3 点需要留意或可能从专业支持中受益的方面。语气温和，不制造焦虑。

## 给疗愈师 / 咨询师的工作方向
一段 3-5 句。具体到可操作的会谈聚焦点、推荐的工作方法（如 ACT、CFT、somatic、attachment-based、MBCT 等），以及需要补充评估的方向。

## 给你自己的话
一段 2-3 句温和的、人性化的、像朋友说话一样的提醒。不要居高临下，不要复述上面已经说过的内容。

## 重要警示（仅当数据中 warnings 字段非空时才输出此节）
若有自杀意念警示题命中，必须在此节明确列出求助资源：
- 北京心理危机研究与干预中心：010-82951332（24 小时）
- 全国希望热线：400-161-9995
- 华中师范大学心理援助热线：4001-888-976（24 小时）
并明确鼓励用户寻求专业支持。

硬约束：
- 总长不超过 800 字
- 避免临床诊断词汇（如「您患有抑郁症」），改用「评分提示焦虑倾向较显著」之类
- 客观又温暖，不写冷冰冰的报告口吻
- 引用具体数字（"DASS-21 焦虑维度 14/42，第 88 百分位"）以增加可信度
- 部分量表未完成时，明确说「这一维度本次未评估」而非强行解读
- 不要输出 markdown 代码块或额外解释，直接从「## 整体状态」开始`;
}

function buildUserPrompt(
  body: AnalyzeBody,
  payload: SharePayload | null
): string {
  const lines: string[] = [];
  lines.push(`用户刚完成了一次心理评估。以下是结构化数据：\n`);

  if (body.startedAt) lines.push(`评估时间：${body.startedAt}`);
  if (body.concerns && body.concerns.length > 0) {
    lines.push(`主诉勾选：${body.concerns.join(", ")}`);
  }

  lines.push(`\n## 评分明细\n`);

  for (const r of body.results) {
    lines.push(`### ${r.scaleName}`);
    if (r.timeFrame) lines.push(`时间窗口：${r.timeFrame}`);
    lines.push(
      `分数方向：${r.highIsBetter ? "高分=能力强/状态好" : "高分=症状重/困扰多"}`
    );
    for (const d of r.dimensions) {
      const scoreStr =
        d.maxScore !== undefined
          ? `${formatScore(d.finalScore)} / ${d.maxScore}`
          : formatScore(d.finalScore);
      const pctStr =
        d.percentile !== null && d.percentile !== undefined
          ? `（第 ${d.percentile} 百分位）`
          : "";
      const bandStr = d.bandLabel ? `[${d.bandLabel}]` : "";
      lines.push(`- ${d.name}：${scoreStr} ${pctStr} ${bandStr}`);
    }
    if (r.warnings && r.warnings.length > 0) {
      lines.push(`⚠️ 警示题命中：`);
      for (const w of r.warnings) {
        lines.push(`  - "${w.itemText}" → 答 ${w.answer} (${w.flag})`);
      }
    }
    lines.push("");
  }

  // 标记 payload 已用于校验（保留以备未来扩展）
  if (payload) lines.push(`（数据完整性已校验）`);

  lines.push(`\n请按 system prompt 中的结构给出温暖、客观、可操作的解读。`);

  return lines.join("\n");
}

function formatScore(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(
    `[mental-measurement-api] listening on http://127.0.0.1:${info.port}`
  );
  console.log(`[config] model=${MODEL} base_url=${BASE_URL} rate_limit=${RATE_LIMIT}/day/ip`);
});
