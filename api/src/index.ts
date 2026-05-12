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
  /** 输出语言：zh（默认）或 en */
  lang?: "zh" | "en";
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
  /** 前端规则化算出的综合临床判断（用于 AI 综合解读时引用） */
  clinicalFlag?: {
    level: "urgent" | "strong" | "consult" | "self_help";
    summary: string;
    signals: Array<{
      scaleName: string;
      description: string;
      level: string;
      warning: boolean;
    }>;
  } | null;
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

  const lang = body.lang === "en" ? "en" : "zh";
  const systemPrompt = buildSystemPrompt(lang);
  const userPrompt = buildUserPrompt(body, payload, lang);

  return streamSSE(c, async (stream) => {
    try {
      // DeepSeek V4 系列默认开 thinking。心理评估解读不需要深度推理，
      // 显式关掉以减少 5-30s 的 reasoning 等待，首 token 更快。
      // thinking 是 DeepSeek-specific 字段，OpenAI SDK 不识别，先 cast 透传。
      const completion = (await client.chat.completions.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
        ...({ thinking: { type: "disabled" } } as object),
      })) as AsyncIterable<{
        choices?: Array<{
          delta?: { content?: string; reasoning_content?: string };
          finish_reason?: string | null;
        }>;
      }>;

      for await (const chunk of completion) {
        const delta = chunk.choices?.[0]?.delta;
        // deepseek-reasoner: reasoning_content 阶段先到，content 后到
        // 两段都流给前端，前端分别渲染（思考过程灰色折叠、最终正文主体显示）
        if (delta?.reasoning_content) {
          await stream.writeSSE({
            event: "thinking",
            data: JSON.stringify({ text: delta.reasoning_content }),
          });
        }
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

function buildSystemPrompt(lang: "zh" | "en"): string {
  if (lang === "en") return SYSTEM_PROMPT_EN;
  return SYSTEM_PROMPT_ZH;
}

const SYSTEM_PROMPT_ZH = `你是一位有经验、温暖、专业的心理评估解读师，正在帮一位普通用户理解 ta 刚完成的多维度心理评估结果。

输出结构（用 markdown，## 二级标题分节）：

## 整体状态
2-3 句话概括用户当前的整体心理状态画像。避免诊断性语言。

## 突出的优势
列 2-3 点用户在评估中体现出的资源、能力、积极迹象。具体引用维度名和分数。

## 值得关注的方面
列 2-3 点需要留意或可能从专业支持中受益的方面。语气温和，不制造焦虑。

## 临床建议层级
**这一段必须明确给出"自助 / 心理咨询 / 精神科评估 / 紧急就医"四个层级中的一个判断**，并说明理由。
用户的数据中带有 clinicalFlag 字段，已经规则化算出建议层级（self_help / consult / strong / urgent），请引用这个层级并具体化：
- urgent → 24-48 小时内联系精神科；提供危机干预热线
- strong → 一周内预约精神科 / 临床心理咨询师；如考虑 SSRI 务必先看 MDQ 结果排除双相
- consult → 寻找心理咨询师做 6-12 次支持性会谈；1-2 个月后复测
- self_help → 自助 + 课程足够，可以做正念 / 自我关怀练习维持

特别提示：
- 如 MDQ Q1-13 ≥ 7 且 Q14 是、Q15 中度以上：双相阳性，上 SSRI 前必须先看精神科
- 如 ASRS Part A ≥ 14：ADHD 阳性，建议做正规 ADHD 评估（SSRI 对 ADHD 无效）
- 如 GAD-7 ≥ 15 或 PHQ-9 ≥ 15：症状已经严重影响生活，优先专业介入
- 如 WSAS ≥ 20：心理问题已经把生活搞乱，无论症状量表如何都要正视

## 给疗愈师 / 咨询师的工作方向
一段 3-5 句。具体到可操作的会谈聚焦点、推荐的工作方法（ACT、CFT、somatic、attachment-based、MBCT、CBT、RFCBT 等），以及需要补充评估的方向。

## 给你自己的话
一段 2-3 句温和的、人性化的、像朋友说话一样的提醒。不要居高临下，不要复述上面已经说过的内容。

## 重要警示（仅当数据中 warnings 字段非空，或 clinicalFlag.level = urgent 时才输出此节）
若有自杀意念警示题命中或临床等级为 urgent，必须在此节明确列出求助资源：
- 北京心理危机研究与干预中心：010-82951332（24 小时）
- 全国希望热线：400-161-9995
- 华中师范大学心理援助热线：4001-888-976（24 小时）
并明确鼓励用户寻求专业支持。

硬约束：
- 总长不超过 1000 字
- 避免临床诊断词汇（如「您患有抑郁症」），改用「评分提示焦虑倾向较显著」之类
- 客观又温暖，不写冷冰冰的报告口吻
- 引用具体数字（"DASS-21 焦虑维度 14/42，第 88 百分位"）以增加可信度
- 部分量表未完成时，明确说「这一维度本次未评估」而非强行解读
- 不要输出 markdown 代码块或额外解释，直接从「## 整体状态」开始`;

const SYSTEM_PROMPT_EN = `You are an experienced, warm, professional psychological assessment interpreter, helping an everyday user understand the multi-dimensional psychological assessment they just completed.

Output structure (use markdown with ## section headers):

## Overall State
2-3 sentences summarizing the user's current overall psychological state. Avoid diagnostic language.

## Notable Strengths
List 2-3 resources, capacities, or positive signs reflected in the assessment. Reference specific dimension names and scores.

## Areas Worth Attention
List 2-3 areas to monitor or where professional support might help. Warm tone, do not create anxiety.

## Clinical Recommendation Level
**This section MUST explicitly give one of four levels: "self-help / counseling / professional assessment / urgent care"**, with the reason. The user data includes a clinicalFlag field with a rule-based level (self_help / consult / strong / urgent). Reference this level and translate it into concrete advice:
- urgent → Contact psychiatry within 24-48 hours; provide crisis hotlines
- strong → Book psychiatrist or clinical psychologist within a week; if considering SSRI, MUST check MDQ result first to rule out bipolar
- consult → Find a counselor for 6-12 supportive sessions; re-test in 1-2 months
- self_help → Self-help + courses sufficient; mindfulness / self-compassion practice to maintain

Specific clinical notes:
- If MDQ Q1-13 ≥ 7 AND Q14 = yes AND Q15 ≥ 2: bipolar-positive; psychiatry consultation REQUIRED before SSRI
- If ASRS Part A ≥ 14: ADHD-positive; recommend formal ADHD evaluation (SSRIs don't help ADHD)
- If GAD-7 ≥ 15 or PHQ-9 ≥ 15: symptoms severely affecting life; prioritize professional intervention
- If WSAS ≥ 20: functioning has been substantially disrupted, requires attention regardless of symptom scales

## Direction for Therapist / Counselor
A paragraph of 3-5 sentences. Specific actionable session focus, recommended modalities (ACT, CFT, somatic, attachment-based, MBCT, CBT, RFCBT, etc.), and additional assessments needed.

## A Word for You
A paragraph of 2-3 sentences — warm, human, like a friend speaking. No condescension. Don't repeat what's been said above.

## Important Warning (only output this section if warnings field is non-empty OR clinicalFlag.level = urgent)
If suicidal-ideation warning items triggered or level is urgent, explicitly list crisis resources:
- International: findahelpline.com (free, 100+ countries, anonymous)
- USA: 988 Suicide & Crisis Lifeline (24/7)
- UK: Samaritans 116 123 (24/7)
- China: Beijing Psychological Crisis Intervention 010-82951332 (24h)
Explicitly encourage the user to seek professional support.

Hard constraints:
- Total length under 1000 words (English)
- Avoid clinical diagnostic terms (don't say "you have depression"); say "scores suggest pronounced anxiety tendency" etc.
- Objective yet warm — not a cold report tone
- Reference specific numbers ("DASS-21 Anxiety 14/42, 88th percentile") for credibility
- If a scale is incomplete, say "this dimension wasn't assessed in this round" rather than forcing interpretation
- Do not output markdown code blocks or extra explanation — start directly from "## Overall State"`;
}

function buildUserPrompt(
  body: AnalyzeBody,
  payload: SharePayload | null,
  lang: "zh" | "en"
): string {
  const T = lang === "en" ? PROMPT_T_EN : PROMPT_T_ZH;
  const lines: string[] = [];
  lines.push(T.intro);

  if (body.startedAt) lines.push(`${T.time}${body.startedAt}`);
  if (body.concerns && body.concerns.length > 0) {
    lines.push(`${T.concerns}${body.concerns.join(", ")}`);
  }

  if (body.clinicalFlag) {
    lines.push(`\n${T.clinical_header}`);
    lines.push(`- ${T.level}${body.clinicalFlag.level}`);
    lines.push(`- ${T.summary}${body.clinicalFlag.summary}`);
    if (body.clinicalFlag.signals.length > 0) {
      lines.push(`- ${T.signals}`);
      for (const s of body.clinicalFlag.signals) {
        const w = s.warning ? " ⚠️" : "";
        lines.push(`  · [${s.level}] ${s.scaleName}: ${s.description}${w}`);
      }
    }
    lines.push("");
    lines.push(T.clinical_reminder);
  }

  lines.push(`\n${T.scores_header}\n`);

  for (const r of body.results) {
    lines.push(`### ${r.scaleName}`);
    if (r.timeFrame) lines.push(`${T.timeframe}${r.timeFrame}`);
    lines.push(
      `${T.direction}${
        r.highIsBetter ? T.dir_high_good : T.dir_high_bad
      }`
    );
    for (const d of r.dimensions) {
      const scoreStr =
        d.maxScore !== undefined
          ? `${formatScore(d.finalScore)} / ${d.maxScore}`
          : formatScore(d.finalScore);
      const pctStr =
        d.percentile !== null && d.percentile !== undefined
          ? T.percentile(d.percentile)
          : "";
      const bandStr = d.bandLabel ? `[${d.bandLabel}]` : "";
      lines.push(`- ${d.name}: ${scoreStr} ${pctStr} ${bandStr}`);
    }
    if (r.warnings && r.warnings.length > 0) {
      lines.push(T.warnings_hit);
      for (const w of r.warnings) {
        lines.push(`  - "${w.itemText}" → ${w.answer} (${w.flag})`);
      }
    }
    lines.push("");
  }

  if (payload) lines.push(T.integrity_ok);
  lines.push(`\n${T.outro}`);

  return lines.join("\n");
}

const PROMPT_T_ZH = {
  intro: `用户刚完成了一次心理评估。以下是结构化数据：\n`,
  time: `评估时间：`,
  concerns: `主诉勾选：`,
  clinical_header: `## 综合临床判断（已由规则算出）`,
  level: `等级：`,
  summary: `摘要：`,
  signals: `触发信号：`,
  clinical_reminder: `请在"临床建议层级"段引用这个等级并具体化建议。`,
  scores_header: `## 评分明细`,
  timeframe: `时间窗口：`,
  direction: `分数方向：`,
  dir_high_good: `高分=能力强/状态好`,
  dir_high_bad: `高分=症状重/困扰多`,
  percentile: (p: number) => `（第 ${p} 百分位）`,
  warnings_hit: `⚠️ 警示题命中：`,
  integrity_ok: `（数据完整性已校验）`,
  outro: `请按 system prompt 中的结构给出温暖、客观、可操作的解读。`,
};

const PROMPT_T_EN = {
  intro: `The user just completed a psychological assessment. Structured data below:\n`,
  time: `Assessment time: `,
  concerns: `Concerns selected: `,
  clinical_header: `## Integrated Clinical Judgment (rule-based)`,
  level: `Level: `,
  summary: `Summary: `,
  signals: `Triggering signals:`,
  clinical_reminder: `Please reference this level in the "Clinical Recommendation Level" section with concrete advice.`,
  scores_header: `## Score Details`,
  timeframe: `Timeframe: `,
  direction: `Score direction: `,
  dir_high_good: `high = strong / good state`,
  dir_high_bad: `high = symptomatic / distressed`,
  percentile: (p: number) => `(${p}th percentile)`,
  warnings_hit: `⚠️ Warning items triggered:`,
  integrity_ok: `(data integrity verified)`,
  outro: `Follow the system prompt structure to give a warm, objective, actionable interpretation.`,
};

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
