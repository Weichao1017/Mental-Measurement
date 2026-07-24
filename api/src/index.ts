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
import * as store from "./storage.js";

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

// ============================================================================
// 收集本（老师后端回收作答）
//   POST /api/collections                  老师创建收集本 → { collectionId, ownerKey }
//   POST /api/collections/:id/responses    来访者作答完自动上传 { d }
//   GET  /api/collections/:id/responses    老师凭 ownerKey（Authorization: Bearer）查看全部提交
// 数据存 DATA_DIR（nginx /api 反代后面，不对外静态暴露）。默认关闭：前端不带 collectionId 就完全不调这些端点，维持纯本机现状。
// ============================================================================

const SUBMIT_LIMIT = Number(process.env.COLLECT_SUBMIT_LIMIT_PER_DAY ?? 300);
const CREATE_LIMIT = Number(process.env.COLLECT_CREATE_LIMIT_PER_DAY ?? 50);
const MAX_PAYLOAD_CHARS = Number(process.env.COLLECT_MAX_PAYLOAD_CHARS ?? 200000);
const collectSubmitMap = new Map<string, number[]>();
const collectCreateMap = new Map<string, number[]>();

function clientIp(c: { req: { header: (k: string) => string | undefined } }): string {
  // 只信任 nginx 在源站设置的 x-real-ip；cf-connecting-ip / x-forwarded-for
  // 是客户端可任意伪造的头（node 监听 127.0.0.1，nginx 未剥离即透传），
  // 用它做限流键就等于把限流拆桶——每请求换值即失效。此站生产在 nginx 后无
  // Cloudflare，x-real-ip 由 vhost 设置为可信来源 IP。
  return c.req.header("x-real-ip") || "unknown";
}

// 通用滑动 24h 窗口限流（独立于 /api/analyze 的限流；作答提交额度给得高，
// 因为一个班/一场沙龙的家长可能共用同一出口 IP）
function checkRate(map: Map<string, number[]>, ip: string, limit: number): boolean {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const arr = (map.get(ip) ?? []).filter((t) => t > dayAgo);
  map.set(ip, arr);
  if (arr.length >= limit) return false;
  arr.push(now);
  return true;
}

app.post("/api/collections", async (c) => {
  if (!checkRate(collectCreateMap, clientIp(c), CREATE_LIMIT)) {
    return c.json({ error: "rate_limited" }, 429);
  }
  let body: { battery?: unknown; title?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }
  const battery = Array.isArray(body.battery)
    ? body.battery
        .filter((x): x is string => typeof x === "string" && x.length > 0 && x.length <= 64)
        .slice(0, 50)
    : [];
  if (battery.length === 0) {
    return c.json({ error: "missing_battery" }, 400);
  }
  const title =
    typeof body.title === "string" && body.title.trim() !== ""
      ? body.title.slice(0, 200)
      : null;
  const { id, ownerKey } = await store.createCollection({ battery, title });
  return c.json({ collectionId: id, ownerKey });
});

app.post("/api/collections/:id/responses", async (c) => {
  const id = c.req.param("id");
  if (!store.isValidId(id)) return c.json({ error: "bad_id" }, 400);
  const meta = await store.getMeta(id);
  if (!meta) return c.json({ error: "not_found" }, 404);
  if (!meta.open) return c.json({ error: "closed" }, 403);
  if (!checkRate(collectSubmitMap, clientIp(c), SUBMIT_LIMIT)) {
    return c.json({ error: "rate_limited" }, 429);
  }
  // 先按 Content-Length 早拒超大 body，防没有 bodyLimit 时先全量解析进内存
  const clen = Number(c.req.header("content-length") || 0);
  if (clen > MAX_PAYLOAD_CHARS + 4096) {
    return c.json({ error: "payload_too_large" }, 413);
  }
  let body: { d?: unknown; idempotencyKey?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }
  const d = body.d;
  // d = encodeSession 产出的 base64url 串，原样不透明存储；只做字符集与长度校验
  if (
    typeof d !== "string" ||
    d.length === 0 ||
    d.length > MAX_PAYLOAD_CHARS ||
    !/^[A-Za-z0-9_-]+$/.test(d)
  ) {
    return c.json({ error: "bad_payload" }, 400);
  }
  // 幂等键（可选，前端建议带）：同 id+同 key 已入库则直接视为成功，防超时重传写重复
  const idem =
    typeof body.idempotencyKey === "string" &&
    body.idempotencyKey.length > 0 &&
    body.idempotencyKey.length <= 128 &&
    /^[A-Za-z0-9_-]+$/.test(body.idempotencyKey)
      ? body.idempotencyKey
      : undefined;
  try {
    const r = await store.appendResponse(id, d, idem);
    return c.json({ ok: true, duplicate: !r.appended });
  } catch (err) {
    if (err instanceof store.CollectionFullError) {
      return c.json({ error: "collection_full" }, 403);
    }
    throw err;
  }
});

app.get("/api/collections/:id/responses", async (c) => {
  const id = c.req.param("id");
  if (!store.isValidId(id)) return c.json({ error: "bad_id" }, 400);
  const meta = await store.getMeta(id);
  if (!meta) return c.json({ error: "not_found" }, 404);
  const auth = c.req.header("authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  const key = m ? m[1].trim() : "";
  if (!store.verifyOwnerKey(meta, key)) {
    return c.json({ error: "unauthorized" }, 401);
  }
  const responses = await store.listResponses(id);
  return c.json({
    collection: {
      id: meta.id,
      battery: meta.battery,
      title: meta.title,
      createdAt: meta.createdAt,
      count: responses.length,
    },
    responses,
  });
});

// ============================================================================
// 家长个人反馈卡 · 生成式 1v1（父亲聆听沙龙）
//   POST /api/feedback-card  —— 读结构化画像 + 家长原话 → DeepSeek 流式生成个性化分析
// 安全：担心状况(问卷16)、身份了解(问卷5) 由前端剔除、绝不进本请求；这里只谈聆听行为。
// ============================================================================
const CARD_LIMIT = Number(process.env.FEEDBACK_CARD_LIMIT_PER_DAY ?? 120);
const cardRateMap = new Map<string, number[]>();

interface CardProfile {
  nickname?: string;
  childName?: string;
  persona?: string | null;
  personaSecondary?: string | null;
  votes?: Record<string, number>;
  behaviorFloor?: number | null;
  attentionFloor?: number | null;
  defaultFloor?: number | null;
  sparkFloor?: number | null;
  empathicSignal?: boolean;
  dialogueField?: number | null;
  perspectiveGap?: number | null;
  guessScore?: number | null;
  selfScore?: number | null;
  habit?: string | null;
  importance?: number | null;
  confidence?: number | null;
  ownWords?: Array<{ scenario: number; text: string }>;
  childQuote?: string | null;
  wantToUnderstand?: string | null;
}

const FLOOR_NAME = ["", "一楼·下载式", "二楼·事实式", "三楼·同理式", "四楼·生成式"];

app.post("/api/feedback-card", async (c) => {
  if (!checkRate(cardRateMap, clientIp(c), CARD_LIMIT)) {
    return c.json({ error: "rate_limited", message: "今日生成次数已达上限，请稍后再试。" }, 429);
  }
  let body: { lang?: string; profile?: CardProfile };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }
  const p = body.profile;
  if (!p || typeof p !== "object") return c.json({ error: "missing_profile" }, 400);
  const lang = body.lang === "en" ? "en" : "zh";

  const cut = (s: unknown, n = 400) =>
    typeof s === "string" ? s.slice(0, n) : "";
  const childName = cut(p.childName, 20) || "孩子";
  const lines: string[] = [];
  lines.push(`称呼：${cut(p.nickname, 30) || "这位家长"}；孩子的称呼：${childName}`);
  if (p.persona)
    lines.push(
      `问卷选项算出的默认接法：主型「${cut(p.persona, 12)}」${
        p.personaSecondary ? `、副型「${cut(p.personaSecondary, 12)}」` : ""
      }（这是初判，仅供参考）`
    );
  if (typeof p.defaultFloor === "number" && p.defaultFloor >= 1)
    lines.push(`按选项定的默认聆听层：${FLOOR_NAME[p.defaultFloor] ?? p.defaultFloor}`);
  if (typeof p.sparkFloor === "number" && p.sparkFloor >= 2)
    lines.push(`已探到的更高层（火种）：${FLOOR_NAME[p.sparkFloor] ?? p.sparkFloor}`);
  if (p.empathicSignal)
    lines.push(
      "★重要信号：他在「我实际会说」里，已经出现命名情绪 / 邀请孩子多说的话——按脚本铁律「自由填写优先于选项」，他其实已经摸到同理层（三楼），别被选项压低，务必点亮这是他的火种。"
    );
  if (Array.isArray(p.ownWords) && p.ownWords.length)
    lines.push(
      `他在场景里写下「我实际会说」的原话：\n${p.ownWords
        .map((w) => `　· 场景${w.scenario}：「${cut(w.text, 300)}」`)
        .join("\n")}`
    );
  if (p.childQuote) lines.push(`孩子最近让他不知道怎么接的一句：「${cut(p.childQuote, 300)}」`);
  if (p.wantToUnderstand) lines.push(`他最想听懂孩子的：「${cut(p.wantToUnderstand, 200)}」`);
  if (p.habit) lines.push(`他猜孩子最想改掉他的接话习惯：${cut(p.habit, 40)}`);
  if (typeof p.selfScore === "number" && typeof p.guessScore === "number")
    lines.push(
      `换位：他给自己「会听」打 ${p.selfScore} 分，猜孩子会给他 ${p.guessScore} 分${
        typeof p.perspectiveGap === "number" && p.perspectiveGap >= 2
          ? "（敢往低了猜，已在换位）"
          : ""
      }`
    );
  if (typeof p.importance === "number")
    lines.push(`两把尺：与孩子沟通的重要性 ${p.importance}/10；能练成的把握 ${p.confidence ?? "?"}/10`);

  const system = lang === "en" ? CARD_SYSTEM_EN : CARD_SYSTEM_ZH;
  const user =
    (lang === "en"
      ? "Here is this father's questionnaire profile and his own words:\n\n"
      : "以下是这位父亲的问卷画像与他自己写下的原话：\n\n") + lines.join("\n");

  return streamSSE(c, async (stream) => {
    try {
      const completion = (await client.chat.completions.create({
        model: MODEL,
        max_tokens: Math.min(MAX_TOKENS, 2200),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        stream: true,
        ...({ thinking: { type: "disabled" } } as object),
      })) as AsyncIterable<{
        choices?: Array<{ delta?: { content?: string }; finish_reason?: string | null }>;
      }>;
      for await (const chunk of completion) {
        const t = chunk.choices?.[0]?.delta?.content;
        if (t) await stream.writeSSE({ event: "chunk", data: JSON.stringify({ text: t }) });
        if (chunk.choices?.[0]?.finish_reason)
          await stream.writeSSE({ event: "done", data: JSON.stringify({ ok: true }) });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[feedback-card] deepseek error:", msg);
      await stream.writeSSE({ event: "error", data: JSON.stringify({ error: "upstream", message: msg }) });
    }
  });
});

const CARD_SYSTEM_ZH = `你是一位儿童发展与家庭系统取向的资深工作坊主持人，受过 Scharmer《U型理论》聆听训练。你在为一位参加「父亲聆听沙龙」的父亲写一份一对一的个性化反馈——不是测评报告，是一位懂行的前辈看完他的问卷后，对他说的一段既专业又贴心的话。

对象：单亲爸爸，孩子 10–15 岁，主题是练习听懂、接住孩子的话。

写作要求：
- 语气专业、具体、有洞察、有温度，像一位信得过的前辈。不油腻、不空泛、不说教、不堆砌比喻——尤其别反复用「接球」这个词（整段最多出现一次，最好一次都不用）。用第二人称「你」。中文，约 450–650 字，分 3–4 个自然段，不加标题、不用列表符号，直接开始，不要「你好」之类开场白。
- 用 U 型理论的四层聆听（下载式/事实式/同理式/生成式）给他准确定位，但**以他自己写下的原话为准，不要被问卷选项压低**：如果他在「我实际会说」里已经在命名孩子的情绪、在邀请孩子多说，那他其实已经摸到同理层（三楼）——明确、笃定地点出这是他的「火种」，是他身上最值钱、最该被看见的地方。若选项与原话矛盾，相信原话。
- 至少引用他自己的一句原话，落到具体，不要泛泛而谈。
- 给一到两个切中要害、当晚就能用、也能带回家的具体练习，扣住他的真实情况（他的把握分数、他猜孩子想改的习惯、他最想听懂的事）。**不要假设现场会角色扮演孩子**。
- 依据可含 Gottman 情绪教练（先接住情绪、再解决问题）、Gordon 父母效能训练的「沟通路障」、动机访谈；引用要专业、克制、不掉书袋。

硬约束：只谈聆听与沟通行为，绝不推测或提及孩子的性别、家庭结构、身份认同等任何身份信息；不虚构问卷里没有的事实；不下临床诊断。`;

const CARD_SYSTEM_EN = `You are a seasoned family-workshop facilitator grounded in child development, family-systems thinking, and Scharmer's Theory U listening. Write a personalized 1:1 note to a father who took a "fathers' listening salon" questionnaire — not a report, but what a wise, knowledgeable mentor would say after reading his answers.

Audience: single fathers, children aged 10–15; theme is learning to truly hear and hold their child's words.

Requirements: professional, specific, insightful, warm; second person; ~350–500 words; 3–4 paragraphs, no headings or bullet lists, start directly. Locate him on Theory U's four levels of listening (downloading / factual / empathic / generative), but **trust his own written words over the multiple-choice options** — if his "what I'd actually say" already names the child's feeling or invites more, he has reached the empathic level; name that as his spark. Quote at least one of his own lines. Give one or two incisive, doable practices tied to his specifics; do NOT assume any on-site child role-play. Ground lightly in Gottman emotion coaching, Gordon's roadblocks, and motivational interviewing. Hard limits: discuss only listening/communication behavior — never infer or mention the child's gender, family structure, or identity; invent no facts; give no clinical diagnosis.`;

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
