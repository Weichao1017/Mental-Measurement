"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { CardModel, PersonaId } from "@/lib/feedbackCard";

/**
 * 个人反馈卡（家长扫码看到的那张）。
 *
 * v2：保留丰富 UI 骨架（四层楼交互、语料 blockquote），核心分析改为**生成式 1v1**——
 * 前端把规则骨架 + 家长自己的原话（不含安全题/身份）发给 /api/feedback-card，
 * DeepSeek 流式生成个性化、专业、切中要害的反馈。AI 失败/超时时回退到规则化文案，
 * 保证卡永远能看。
 *
 * 判定与练习依据：Gordon P.E.T.、Gottman 情绪教练、Scharmer U 型四层聆听、动机访谈。
 * 只贴行为，不贴人。
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

const PERSONA_COPY: Record<
  PersonaId,
  { name: string; tagline: string; reveal: string; instinct: string; practice: string }
> = {
  detective: {
    name: "侦探",
    tagline: "先查清楚，才敢出手",
    reveal: "孩子话音刚落，你的问号已经排好队：谁说的？为什么？是不是你先……",
    instinct:
      "这背后是想保护孩子的本能——总觉得先有真相，才好出手。只是审讯灯一亮，孩子往往就不往下说了。",
    practice:
      "今晚试试把问号先收起来。第一句不问「为什么」，改成先说出TA的感受——真相不会跑，孩子的话头会。",
  },
  dean: {
    name: "教导主任",
    tagline: "怕孩子走偏，急着校准方向",
    reveal: "孩子一开口，你已经听出了「问题」，道理和要求跟着就到。",
    instinct:
      "这背后是怕孩子走偏的心——急着把方向盘掰回来。道理都对，只是道理一出口，孩子的后半句就咽了回去。",
    practice: "今晚把道理留到最后。第一句先接住人：「这事让你挺不舒服的吧。」——人被接住了，道理才进得去。",
  },
  extinguisher: {
    name: "灭火器",
    tagline: "见不得孩子难受",
    reveal: "孩子情绪一冒头，你的第一反应是安抚、淡化、快点翻篇：「没事没事，别放心上。」",
    instinct:
      "这背后是见不得孩子难受——有时也是怕自己接不住。只是「没事」说出口，孩子的情绪就被先关了灯。",
    practice:
      "今晚别急着说「没事」。孩子要的不是火被扑灭，是有人陪TA在事里待一会儿——先说出TA的感受，再等一等。",
  },
  repairman: {
    name: "维修工",
    tagline: "孩子话音没落，工具箱已经打开",
    reveal: "孩子的问题还没说完，你的方案已经在路上——跳过情绪，直接修理。",
    instinct:
      "这是爱得实干：问题没了，痛苦就该没了。只是孩子有时要的不是扳手，是有人先看见TA手上的伤。",
    practice:
      "今晚练的就是把顺序倒过来：先听懂，再修理。等孩子把话说完、情绪落了地，再问「需要我帮你想想办法吗」。",
  },
  catcher: {
    name: "接球手",
    tagline: "先听见情绪，再把话头还给孩子",
    reveal: "你会先接住孩子的情绪，再把话头还给TA。",
    instinct: "你相信「被听见」本身就是帮助——这正是今晚全场要练的东西。",
    practice: "今晚请你把自己的听法示范给大家：当观察员，帮同组的家长看见——一句话被听见之后，孩子会怎样。",
  },
};

const FLOOR_COPY: Record<1 | 2 | 3 | 4, { name: string; short: string; desc: string }> = {
  1: { name: "一楼 · 下载式", short: "听到的都是证据", desc: "听到的都是证据，证明我早就知道的——「我就知道你又……」。话说了不少，新东西一点没有。" },
  2: { name: "二楼 · 事实式", short: "开始听到新信息", desc: "开始听到新信息——「咦，跟我以为的不一样」。事实进来了，感受还在门外。" },
  3: { name: "三楼 · 同理式", short: "感觉到TA的感觉", desc: "站到孩子那边，感觉到TA的感觉。被真正听见的孩子，才会继续说。" },
  4: { name: "四楼 · 生成式", short: "新东西自己长出来", desc: "聊着聊着新东西长出来：孩子自己想明白了，你也被改变了。这层不用教——在同理层待得够久，它自己会发生。" },
};

const FLOOR_LABELS = ["", "一楼", "二楼", "三楼", "四楼"];

export default function FeedbackCard({
  model,
  bakedAnalysis,
}: {
  model: CardModel;
  /** 预先写好、烘焙进链接的个性化分析（有则直接渲染，不调 AI） */
  bakedAnalysis?: string;
}) {
  const m = model;
  const persona = m.persona ? PERSONA_COPY[m.persona] : null;

  return (
    <article className="mx-auto max-w-xl">
      <header className="mb-6 rounded-2xl bg-sage-600 p-6 text-white sm:p-8">
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-sage-100">
          聆听演练 · 个人反馈
        </p>
        <h1 className="font-serif text-2xl leading-snug sm:text-3xl">
          {m.nickname}，这是写给你的。
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-sage-50">
          它来自你自己的问卷——说的不是「你是什么样的人」，只是你听孩子说话时的习惯。
          习惯，看见了就能变。
        </p>
      </header>

      {/* 画像 + 四层楼（结构化骨架） */}
      {persona || m.defaultFloor ? (
        <Section no="01" title={m.isCatcherStar ? "你已经在场上了" : "你此刻的位置"}>
          {persona ? (
            <>
              <VoteLine model={m} />
              <h3 className="mb-1 mt-3 font-serif text-xl text-ink">
                {persona.name}
                <span className="ml-2 text-sm font-normal text-brand-500">
                  {persona.tagline}
                </span>
              </h3>
            </>
          ) : null}
          {m.defaultFloor ? <FloorTower model={m} /> : null}
        </Section>
      ) : null}

      {/* 个性化 1v1 分析（核心）。烘焙分析优先直接渲染；否则 AI 流式，失败回退规则文案 */}
      <Section no="02" title="为你细读之后">
        {bakedAnalysis ? (
          <div className="prose-card space-y-3 leading-relaxed text-brand-800">
            <ReactMarkdown>{bakedAnalysis}</ReactMarkdown>
          </div>
        ) : (
          <GenerativeAnalysis model={m} fallback={<RuleProse model={m} />} />
        )}
      </Section>

      {/* 他自己写下的话 */}
      <QuoteSection model={m} />

      {/* 练习 */}
      <PracticeSection model={m} />

      <footer className="mt-8 border-t border-brand-200 pt-5 text-xs leading-relaxed text-brand-400">
        <p className="mb-1.5">
          这份反馈的判定与练习，依据 Gordon 父母效能训练（P.E.T.）、Gottman 情绪教练、
          Scharmer《U 型理论》四层聆听与动机访谈。
        </p>
        <p>只谈聆听行为，不谈身份。数据完全包含在这条链接里，只有拿到链接的人能看到。</p>
      </footer>
    </article>
  );
}

/* ---- 生成式分析 ---- */

function buildProfile(m: CardModel) {
  const nameOf = (p: PersonaId | null) => (p ? PERSONA_COPY[p].name : null);
  const votes: Record<string, number> = {};
  for (const [k, v] of Object.entries(m.votes)) {
    const nm = PERSONA_COPY[k as PersonaId]?.name;
    if (nm && typeof v === "number") votes[nm] = v;
  }
  return {
    nickname: m.nickname,
    childName: m.childName,
    persona: nameOf(m.persona),
    personaSecondary: nameOf(m.personaSecondary),
    votes,
    behaviorFloor: m.behaviorFloor,
    attentionFloor: m.attentionFloor,
    defaultFloor: m.defaultFloor,
    sparkFloor: m.sparkFloor,
    empathicSignal: m.empathicSignal,
    dialogueField: m.dialogueField,
    perspectiveGap: m.perspectiveGap,
    guessScore: m.guessScore,
    selfScore: m.selfScore,
    habit: m.habit,
    importance: m.importance,
    confidence: m.confidence,
    ownWords: m.ownWordsAll,
    childQuote: m.childQuote,
    wantToUnderstand: m.wantToUnderstand,
  };
}

function GenerativeAnalysis({
  model,
  fallback,
}: {
  model: CardModel;
  fallback: React.ReactNode;
}) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"loading" | "streaming" | "done" | "failed">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45000);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/feedback-card`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang: "zh", profile: buildProfile(model) }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let got = false;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf("\n\n")) >= 0) {
            const frame = buf.slice(0, i);
            buf = buf.slice(i + 2);
            const evt = parseSSE(frame);
            if (!evt) continue;
            if (evt.event === "chunk") {
              try {
                const o = JSON.parse(evt.data);
                if (typeof o.text === "string" && !cancelled) {
                  got = true;
                  setState("streaming");
                  setText((prev) => prev + o.text);
                }
              } catch {}
            } else if (evt.event === "error") {
              throw new Error("upstream");
            }
          }
        }
        if (!got) throw new Error("empty");
        if (!cancelled) setState("done");
      } catch {
        if (!cancelled) setState("failed");
      } finally {
        clearTimeout(timer);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [model]);

  if (state === "failed") return <>{fallback}</>;
  if (state === "loading") {
    return (
      <p className="animate-pulse text-sm leading-relaxed text-brand-400">
        正在为你细读刚才写下的每一句……
      </p>
    );
  }
  return (
    <div className="prose-card space-y-3 leading-relaxed text-brand-800">
      <ReactMarkdown>{text}</ReactMarkdown>
      {state === "streaming" ? (
        <span className="inline-block h-4 w-1.5 animate-pulse bg-sage-400 align-middle" />
      ) : null}
    </div>
  );
}

/* AI 失败时的规则化兜底文案 */
function RuleProse({ model: m }: { model: CardModel }) {
  const persona = m.persona ? PERSONA_COPY[m.persona] : null;
  return (
    <div className="space-y-3 leading-relaxed text-brand-700">
      {persona ? (
        <>
          <p>{persona.reveal}</p>
          <p>{persona.instinct}</p>
        </>
      ) : null}
      {persona && m.defaultFloor ? (
        <p>
          招式是习惯，站位是楼层。出手常像{persona.name}的你，平时多半在
          {FLOOR_LABELS[m.defaultFloor]}。
        </p>
      ) : null}
      {m.sparkFloor && m.behaviorFloor ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          <span className="mr-1 font-medium">✦ 有一处别错过：</span>
          {m.empathicSignal
            ? "你在「我实际会说」里写下的那句，其实已经在说孩子的感受了——"
            : "你说过，跟孩子聊到深处时你会被TA的感受带进去——"}
          {FLOOR_LABELS[m.sparkFloor]}的门，你早就摸到过。今晚练的不是新东西，是让你已经会的那部分先出手。
        </p>
      ) : null}
      {m.dialogueField === 5 ? (
        <p>
          你写到，最近想不起一次超过十分钟的对话。那今晚你的目标最清楚，也最不难：不急着上楼，先约一场十分钟的对话，聊什么都行。
        </p>
      ) : null}
    </div>
  );
}

/* ---- 结构化 UI 组件 ---- */

function VoteLine({ model: m }: { model: CardModel }) {
  const parts = (Object.entries(m.votes) as Array<[PersonaId, number]>)
    .sort((a, b) => b[1] - a[1])
    .map(([p, n]) => `${n === 1 ? "一" : n === 2 ? "两" : "三"}次${PERSONA_COPY[p].name}`);
  if (parts.length === 0) return null;
  return (
    <p className="text-sm text-brand-500">
      {m.scenarioCount === 3 ? "三" : "两"}个场景里，你的第一反应是{parts.join("、")}。
    </p>
  );
}

function FloorTower({ model: m }: { model: CardModel }) {
  const [open, setOpen] = useState<1 | 2 | 3 | 4>((m.defaultFloor ?? 1) as 1 | 2 | 3 | 4);
  return (
    <div className="mt-3">
      <div className="mb-3 space-y-1.5">
        {([4, 3, 2, 1] as const).map((f) => {
          const isHome = m.defaultFloor === f;
          const isSpark = m.sparkFloor === f;
          const active = open === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setOpen(f)}
              className={[
                "flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all",
                active ? "border-sage-500 bg-sage-50" : "border-brand-200 bg-white hover:bg-cream",
              ].join(" ")}
            >
              <span className="w-24 shrink-0 text-sm font-medium text-ink">
                {FLOOR_COPY[f].name}
              </span>
              <span className="flex-1 truncate text-xs text-brand-500">
                {FLOOR_COPY[f].short}
              </span>
              {isHome ? (
                <span className="shrink-0 rounded-full bg-sage-600 px-2 py-0.5 text-[11px] font-medium text-white">
                  你常在这层
                </span>
              ) : null}
              {isSpark ? (
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                  ✦ 你的火种
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="rounded-xl bg-cream px-4 py-3 text-sm leading-relaxed text-brand-700">
        {FLOOR_COPY[open].desc}
      </p>
    </div>
  );
}

function QuoteSection({ model: m }: { model: CardModel }) {
  const has = m.childQuote || m.ownWords || (m.perspectiveGap !== null && m.perspectiveGap >= 2);
  if (!has) return null;
  return (
    <Section no="03" title="你自己写下的，比什么都准">
      <div className="space-y-3">
        {m.childQuote ? (
          <blockquote className="rounded-xl border-l-4 border-sage-400 bg-sage-50 px-4 py-3">
            <p className="mb-1 text-xs text-brand-500">
              {m.childName}最近的那句话，你还记得：
            </p>
            <p className="font-serif text-lg leading-relaxed text-ink">「{m.childQuote}」</p>
          </blockquote>
        ) : null}
        {!m.childQuote && m.ownWords ? (
          <blockquote className="rounded-xl border-l-4 border-sage-400 bg-sage-50 px-4 py-3">
            <p className="mb-1 text-xs text-brand-500">你写下的、你实际会说的话：</p>
            <p className="font-serif text-base leading-relaxed text-ink">「{m.ownWords}」</p>
          </blockquote>
        ) : null}
        {m.perspectiveGap !== null && m.perspectiveGap >= 2 ? (
          <p className="text-sm leading-relaxed text-brand-600">
            你给自己「会听」打了 {m.selfScore} 分，却猜{m.childName}只会给 {m.guessScore} 分。
            敢往低了猜，说明你已经站到TA那边看过自己了。
          </p>
        ) : null}
      </div>
    </Section>
  );
}

function PracticeSection({ model: m }: { model: CardModel }) {
  return (
    <Section no="04" title={m.isCatcherStar ? "今晚，也请你出场" : "今晚，只练一件事"}>
      {!m.isCatcherStar ? (
        <>
          <div className="mb-4 space-y-2">
            {[
              ["停一拍", "心里数三秒，把冲到嘴边的那句先咽回去。"],
              ["说情绪", "「你好像挺委屈 / 很烦 / 有点怕……」说错没关系——孩子来纠正你，就还在说。"],
              ["还话头", "「后来呢？」「想多说说吗？」——或者就安静待着。"],
            ].map(([t, d], i) => (
              <div key={t} className="flex gap-3 rounded-xl border border-brand-200 bg-white px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-600 text-xs font-medium text-white">
                  {i + 1}
                </span>
                <div>
                  <span className="font-medium text-ink">{t}</span>
                  <span className="ml-2 text-sm text-brand-600">{d}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mb-4 text-sm leading-relaxed text-brand-500">
            这一步先别做三件事：先别问为什么、先别讲道理、先别给办法。卡住时听一听，是哪个声音在替你抢答——
            评判、嘲讽，还是担心。那不是你不爱{m.childName}，是本能先替你出了手；认出它，先别照它做。
          </p>
        </>
      ) : null}

      <p className="rounded-xl bg-sage-600 px-4 py-3.5 leading-relaxed text-white">
        {m.dialogueField === 5 ? (
          <>回家第一步：这周留意一次{m.childName}主动开口的时刻，记下TA说的第一句话——先别急着接好，先听见。</>
        ) : m.isCatcherStar ? (
          <>今晚请你把自己的听法示范给同组的家长——你已经会的，值得被更多人看见。</>
        ) : (
          <>今晚练的这一步，回家就从{m.childName}的下一句话开始用。</>
        )}
      </p>

      {m.confidence !== null ? (
        <p className="mt-3 text-sm leading-relaxed text-brand-500">
          你给「能练成」的把握打了 {m.confidence} 分。今晚不求变成 10 分——只要让它加 1，就够了。
        </p>
      ) : null}
    </Section>
  );
}

function Section({
  no,
  title,
  children,
}: {
  no: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5 rounded-2xl border border-brand-200 bg-white p-5 sm:p-7">
      <header className="mb-4 flex items-baseline gap-3">
        <span className="font-mono text-sm text-brand-300">{no}</span>
        <h2 className="font-serif text-lg text-ink sm:text-xl">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function parseSSE(frame: string): { event: string; data: string } | null {
  const lines = frame.split("\n");
  let event = "message";
  const data: string[] = [];
  for (const line of lines) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).trim());
  }
  if (data.length === 0) return null;
  return { event, data: data.join("\n") };
}
