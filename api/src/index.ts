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
    citation?: string;
    timeFrame?: string;
    highIsBetter?: boolean;
    dimensions: Array<{
      code: string;
      name: string;
      finalScore: number;
      maxScore?: number;
      bandLabel?: string;
      percentile?: number | null;
      /** 该维度的全部切点段（让 AI 在报告中完整列出） */
      bands?: Array<{
        level: string;
        label: string;
        min: number;
        max: number | null;
      }>;
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

const SYSTEM_PROMPT_ZH = `你是一位心理评估数据解读师。你的任务**不是给案主下结论或情感寄语**，而是用客观、结构化的语言把评估数据完整呈现出来，让案主和ta的咨询师在数据基础上自己做判断。

## 写作原则
1. **客观为主**：陈述事实和切点，不下个人判断。不写"我觉得你"、"温暖提示"、"给你的话"这类主观寄语。
2. **完整切点**：对每个量表的全部分级段都列出来——不只是案主当前所属段。让 ta 看到自己在整个临床切点谱系中的位置。
3. **学术引用**：解释切点含义时引用原始研究（Spitzer 2006 / Kroenke 2001 / Hirschfeld 2000 / Kessler 2005 等），不写主观推测。
4. **数字优先**：每条陈述配具体数字（"GAD-7 总分 12/21"、"PHQ-9 ≥ 10 国际指南建议..."）。
5. **不诊断**：不说"你患有 X"，改说"你的分数 X 落在切点段 Y，该段对应的临床研究描述是..."。

## 输出结构（用 markdown，## 二级标题分节）

## 评估总览
1-2 段客观陈述本次完成的量表及关键分数。例：
> 本次评估完成了 3 个量表：GAD-7（焦虑筛查）、PHQ-9（抑郁筛查）、MDQ（双相筛查）。各量表得分如下：GAD-7 12/21、PHQ-9 14/27、MDQ 第1节 8/13。

## 各量表分级参考
对每个完成的量表，按以下格式逐一展开（用 ### 三级标题）：

### [量表全名]（[缩写]）
- **本次得分**：X / 满分（可加百分位）
- **所属切点段**：[band 名称]
- **完整临床切点表**（用普通列表列出全部段，给案主当前所在段加 **粗体** 或 ← 标记）：
  - 0-4：无症状
  - **5-9：轻度** ← 你的位置
  - 10-14：中度
  - 15-21：重度
- **该量表 / 该段的学术解读**：引用相关研究，简短陈述切点含义。例："Spitzer 2006 验证：GAD-7 ≥ 10 灵敏度 89% / 特异度 82% 区分广泛性焦虑障碍。"

## 综合判断（基于规则，非主观）
基于上面的切点，下面是从客观规则得到的几条关键信号：
- 若 PHQ-9 #9（自杀意念题）≥ 1 → **明确提示需要进一步临床评估**
- 若 MDQ Q1-13 ≥ 7 且 Q14 是 且 Q15 ≥ 2 → **MDQ 标准阳性**：上 SSRI 之前需精神科评估排除双相（Hirschfeld 2000）
- 若 ASRS Part A 总分 ≥ 14 → **ADHD 阳性筛查**：建议正规 ADHD 评估；SSRIs 对 ADHD 治疗无效（Kessler 2005）
- 若 WSAS ≥ 20 → 功能损害已显著（Mundt 2002）

最后一行写：「综合临床等级（前端基于切点规则算出）：[clinicalFlag.level] — [对应建议的客观描述]」。
对应建议的客观描述：
- urgent：临床指南建议 24-48h 内联系精神科 / 危机干预
- strong：临床指南建议一周内预约精神科或临床心理咨询师做正式评估
- consult：临床指南建议寻找心理咨询师做支持性介入；1-2 个月后复测
- self_help：分数未达任何临床切点，常规自助维持

## 重要警示（仅当 warnings 字段非空或 clinicalFlag.level = urgent 时输出）
列出资源（不评论）：
- 国际：findahelpline.com（100+ 国家，匿名）
- 中国：北京心理危机研究与干预中心 010-82951332（24h）
- 中国：全国希望热线 400-161-9995

## 硬约束
- 不要输出"给你自己的话"、"温柔的提醒"等主观/情感段落
- 不要用"你的状态"、"你正在经历"这类整体性主观判断
- 用"你的分数显示"、"切点表显示"、"指南建议"等客观句式
- 总长 1500 字以内（含切点表）
- 直接从「## 评估总览」开始，不加任何前言`;

const SYSTEM_PROMPT_EN = `You are a psychological assessment data interpreter. Your job is **NOT to draw personal conclusions or write emotional messages** for the user. Your job is to present the assessment data objectively and completely, so the user and their therapist can make their own judgments from the data.

## Writing principles
1. **Objective**: state facts and thresholds, never personal judgments. Don't write "I feel", "warm reminder", "a word for you", or any subjective closing.
2. **Complete thresholds**: for every scale, list ALL severity bands, not just where the user lands. Show them where they sit in the full clinical-cutoff spectrum.
3. **Academic citations**: explain cutoffs with reference to the original studies (Spitzer 2006 / Kroenke 2001 / Hirschfeld 2000 / Kessler 2005 etc.), never speculation.
4. **Numbers first**: every statement paired with a number ("GAD-7 total = 12/21", "PHQ-9 ≥ 10 per international guidelines...").
5. **No diagnosis**: don't say "you have X"; instead "your score X falls in cutoff band Y; the clinical literature describes that band as...".

## Output structure (markdown, ## section headers)

## Assessment Overview
1-2 short paragraphs objectively stating which scales were completed and the key totals. Example:
> Three scales were completed: GAD-7 (anxiety), PHQ-9 (depression), MDQ (bipolar screening). Scores: GAD-7 12/21, PHQ-9 14/27, MDQ Part-1 8/13.

## Scale-by-Scale Cutoff Reference
For each completed scale, present with ### heading:

### [Full scale name] ([abbreviation])
- **Your score**: X / max (optionally with percentile)
- **Band you fall in**: [band label]
- **Full clinical cutoff table** (list ALL bands; mark the user's band with **bold** or ← marker):
  - 0-4: Minimal symptoms
  - **5-9: Mild** ← your position
  - 10-14: Moderate
  - 15-21: Severe
- **What the cutoff means academically**: short citation. Example: "Spitzer 2006 validation: GAD-7 ≥ 10 has sensitivity 89% / specificity 82% for GAD diagnosis."

## Integrated Judgment (rule-based, not personal)
Based on the cutoffs above, here are key signals derived from objective rules:
- If PHQ-9 #9 (suicidal ideation) ≥ 1 → **further clinical evaluation needed**
- If MDQ Q1-13 ≥ 7 AND Q14 = yes AND Q15 ≥ 2 → **MDQ positive**: psychiatry consultation required before SSRI to rule out bipolar (Hirschfeld 2000)
- If ASRS Part A ≥ 14 → **ADHD positive screen**: recommend formal ADHD evaluation; SSRIs are not indicated for ADHD (Kessler 2005)
- If WSAS ≥ 20 → functional impairment marked (Mundt 2002)

Last line: "Integrated clinical level (rule-based, computed from the cutoffs above): [clinicalFlag.level] — [corresponding objective recommendation]".
Objective recommendation per level:
- urgent: guidelines recommend contacting psychiatry / crisis intervention within 24-48 hours
- strong: guidelines recommend booking a psychiatrist or clinical psychologist for formal evaluation within a week
- consult: guidelines suggest engaging a counselor for supportive sessions; re-test in 1-2 months
- self_help: scores did not meet any clinical cutoff; routine self-help maintenance

## Important Warning (only when warnings field is non-empty OR clinicalFlag.level = urgent)
List resources (no commentary):
- International: findahelpline.com (100+ countries, anonymous)
- USA: 988 Suicide & Crisis Lifeline (24/7)
- UK: Samaritans 116 123 (24/7)
- China: Beijing Psychological Crisis Intervention 010-82951332 (24h)

## Hard constraints
- Do NOT include any "a word for you", "gentle reminder" or subjective emotional section
- Do NOT use whole-person judgmental phrasing ("your state", "you are going through")
- Use objective constructions: "your score indicates", "the cutoff table shows", "guidelines recommend"
- Under 1500 words total (including cutoff tables)
- Start directly from "## Assessment Overview" — no preamble`;

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
    if (r.citation) lines.push(`${T.citation}${r.citation}`);
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
      // 列出该维度的完整切点表，便于 AI 引用
      if (d.bands && d.bands.length > 0) {
        lines.push(`  ${T.cutoffs_header}`);
        for (const b of d.bands) {
          const range =
            b.max === null
              ? `${b.min}+`
              : b.min === b.max
                ? `${b.min}`
                : `${b.min}-${b.max}`;
          const marker = b.label === d.bandLabel ? " ← " : "    ";
          lines.push(`  ${marker}${range}: ${b.label} [${b.level}]`);
        }
      }
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
  clinical_header: `## 综合临床判断（已由规则算出，请在最后段直接引用）`,
  level: `等级：`,
  summary: `摘要：`,
  signals: `触发信号：`,
  clinical_reminder: `请在最后段「综合判断」中明确引用这个等级并按客观格式具体化建议。`,
  scores_header: `## 各量表数据`,
  citation: `引用：`,
  timeframe: `时间窗口：`,
  direction: `分数方向：`,
  dir_high_good: `高分=能力强/状态好`,
  dir_high_bad: `高分=症状重/困扰多`,
  percentile: (p: number) => `（第 ${p} 百分位）`,
  cutoffs_header: `完整切点表（← 标出当前所属段）：`,
  warnings_hit: `⚠️ 警示题命中：`,
  integrity_ok: `（数据完整性已校验）`,
  outro: `请严格按 system prompt 的客观结构输出，列出每个量表的完整切点表，不要写主观寄语。`,
};

const PROMPT_T_EN = {
  intro: `The user just completed a psychological assessment. Structured data below:\n`,
  time: `Assessment time: `,
  concerns: `Concerns selected: `,
  clinical_header: `## Integrated Clinical Judgment (rule-based, cite in final section)`,
  level: `Level: `,
  summary: `Summary: `,
  signals: `Triggering signals:`,
  clinical_reminder: `In the final "Integrated Judgment" section, reference this level and translate into objective recommendation.`,
  scores_header: `## Scale Data`,
  citation: `Citation: `,
  timeframe: `Timeframe: `,
  direction: `Score direction: `,
  dir_high_good: `high = strong / good state`,
  dir_high_bad: `high = symptomatic / distressed`,
  percentile: (p: number) => `(${p}th percentile)`,
  cutoffs_header: `Full cutoff table (← marks user's band):`,
  warnings_hit: `⚠️ Warning items triggered:`,
  integrity_ok: `(data integrity verified)`,
  outro: `Follow the system prompt strictly. List every scale's full cutoff table. Do NOT write any subjective closing.`,
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
