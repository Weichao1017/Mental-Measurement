"use client";

import { useState } from "react";
import type { CardModel, PersonaId } from "@/lib/feedbackCard";

/**
 * 个人反馈卡（家长扫码看到的那张）。
 *
 * 结构照脚本四段式：① 人设揭晓（幽默、先给台阶）→ ② 楼层定位（有火种必写火种）
 * → ③ 引用他自己的语料 → ④ 今晚的专属练习，用孩子的称呼收尾。
 *
 * 文案全部手写、来自工作坊脚本与《接住孩子的话》家长手册的既有语言，
 * 不做模型生成——每一句都可溯源（Gordon P.E.T. / Gottman 情绪教练 /
 * Scharmer U 型四层聆听 / 动机访谈）。只贴行为，不贴人。
 */

// ---------------- 文案库 ----------------

const PERSONA_COPY: Record<
  PersonaId,
  { name: string; tagline: string; reveal: string; instinct: string; practice: string }
> = {
  detective: {
    name: "侦探",
    tagline: "先查清楚，才敢出手",
    reveal:
      "孩子的话音刚落，你的问号已经排好队了：谁说的？为什么？是不是你先……",
    instinct:
      "这背后是想保护孩子的本能——总觉得先有真相，才好出手。只是审讯灯一亮，孩子往往就不往下说了。",
    practice:
      "今晚试试把问号先收起来。第一句不问「为什么」，改成接一句TA的感受——真相不会跑，孩子的话头会。",
  },
  dean: {
    name: "教导主任",
    tagline: "怕孩子走偏，急着校准方向",
    reveal:
      "孩子一开口，你已经听出了「问题」，道理和要求跟着就到了。",
    instinct:
      "这背后是怕孩子走偏的心——急着把方向盘掰回来。道理都对，只是道理一出口，孩子的后半句就咽回去了。",
    practice:
      "今晚把道理留到最后。第一句先接住人：「这事让你挺不舒服的吧。」——人接住了，道理才进得去。",
  },
  extinguisher: {
    name: "灭火器",
    tagline: "见不得孩子难受",
    reveal:
      "孩子情绪一冒头，你的第一反应是安抚、淡化、快点翻篇：「没事没事，别放心上。」",
    instinct:
      "这背后是见不得孩子难受——有时也是怕自己接不住。只是「没事」说出口，孩子的情绪就被先关了灯。",
    practice:
      "今晚别急着说「没事」。孩子要的不是火被扑灭，是有人陪TA在事里待一会儿。先说出TA的感受，再等一等。",
  },
  repairman: {
    name: "维修工",
    tagline: "孩子话音没落，工具箱已经打开",
    reveal:
      "孩子的问题还没说完，你的方案已经在路上了——跳过情绪，直接修理。",
    instinct:
      "这是爱得实干：问题没了，痛苦就该没了。只是孩子有时要的不是扳手，是有人先看见TA手上的伤。",
    practice:
      "今晚练的就是搬家：先接住，再修理。工具箱晚点开——等孩子把话说完、情绪落了地，再问「需要我帮你想想办法吗」。",
  },
  catcher: {
    name: "接球手",
    tagline: "先接住情绪，再把话头还给孩子",
    reveal: "你会先接住孩子的情绪，再把话头还给TA。",
    instinct: "你相信「被听见」本身就是帮助——这正是今晚全场要练的东西。",
    practice:
      "今晚你不用从头学，请把你的接法演给大家看——当观察员或示范者，帮同组的家长看见：接住之后，孩子多说了什么。",
  },
};

const FLOOR_COPY: Record<
  1 | 2 | 3 | 4,
  { name: string; short: string; desc: string }
> = {
  1: {
    name: "一楼 · 下载式",
    short: "听到的都是证据",
    desc: "听到的都是证据，证明我早就知道的——「我就知道你又……」。话说了不少，新东西一点没有。",
  },
  2: {
    name: "二楼 · 事实式",
    short: "开始听到新信息",
    desc: "开始听到新信息——「咦，跟我以为的不一样」。事实进来了，感受还在门外。",
  },
  3: {
    name: "三楼 · 同理式",
    short: "感觉到TA的感觉",
    desc: "站到孩子那边，感觉到TA的感觉。接球手住这层——被听见的孩子，才会继续说。",
  },
  4: {
    name: "四楼 · 生成式",
    short: "新东西自己长出来",
    desc: "聊着聊着新东西长出来：孩子自己想明白了，你也被改变了。这层不用教——在三楼待得够久，它自己会发生。",
  },
};

const FLOOR_LABELS = ["", "一楼", "二楼", "三楼", "四楼"];

// ---------------- 组件 ----------------

export default function FeedbackCard({ model }: { model: CardModel }) {
  const m = model;
  const persona = m.persona ? PERSONA_COPY[m.persona] : null;

  return (
    <article className="mx-auto max-w-xl">
      {/* 头 */}
      <header className="mb-6 rounded-2xl bg-sage-600 p-6 text-white sm:p-8">
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-sage-100">
          聆听演练 · 个人反馈卡
        </p>
        <h1 className="font-serif text-2xl leading-snug sm:text-3xl">
          {m.nickname}，欢迎来练球。
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-sage-50">
          这张卡来自你自己的问卷——它说的不是「你是什么样的人」，
          只是你接话时的习惯动作。习惯，练一练就能搬家。
        </p>
      </header>

      {/* ① 人设揭晓 */}
      {persona ? (
        <Section no="01" title={m.isCatcherStar ? "你已经在场上了" : "你的默认接法"}>
          <VoteLine model={m} />
          <h3 className="mb-1 mt-3 font-serif text-xl text-ink">
            {persona.name}
            <span className="ml-2 text-sm font-normal text-brand-500">
              {persona.tagline}
            </span>
          </h3>
          <p className="mb-3 leading-relaxed text-brand-700">{persona.reveal}</p>
          <p className="leading-relaxed text-brand-700">{persona.instinct}</p>
          {!m.isCatcherStar ? (
            <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-sm leading-relaxed text-brand-600">
              这不是错。侦探、教导主任、灭火器、维修工——都是本能，都是爱的形状。
              只是它们常常让孩子把后半句话咽回去。今晚练第五种：接球手。
            </p>
          ) : null}
        </Section>
      ) : null}

      {/* ② 楼层定位 */}
      {m.defaultFloor ? (
        <Section no="02" title="听孩子说话，有四层楼">
          <FloorTower model={m} />
          <FloorVerdict model={m} />
        </Section>
      ) : null}

      {/* ③ 他自己的话 */}
      <QuoteSection model={m} />

      {/* ④ 今晚的练习 */}
      <PracticeSection model={m} />

      {/* 脚注 */}
      <footer className="mt-8 border-t border-brand-200 pt-5 text-xs leading-relaxed text-brand-400">
        <p className="mb-1.5">
          这张卡的判定与练习来自：Gordon 父母效能训练（P.E.T.）的「沟通路障」与积极倾听、
          Gottman 情绪教练五步骤、Scharmer《U 型理论》的四层聆听，以及动机访谈。
        </p>
        <p>画像只贴行为，不贴人。数据完全包含在这条链接里，只有拿到链接的人能看到。</p>
      </footer>
    </article>
  );
}

/* 票数一句话：「三个场景里，你出手了两次维修工、一次侦探」 */
function VoteLine({ model: m }: { model: CardModel }) {
  const parts = (Object.entries(m.votes) as Array<[PersonaId, number]>)
    .sort((a, b) => b[1] - a[1])
    .map(([p, n]) => `${n === 1 ? "一" : n === 2 ? "两" : "三"}次${PERSONA_COPY[p].name}`);
  if (parts.length === 0) return null;
  return (
    <p className="text-sm text-brand-500">
      {m.scenarioCount === 3 ? "三" : "两"}个场景里，你出手了{parts.join("、")}。
    </p>
  );
}

/* 可点的四层楼 */
function FloorTower({ model: m }: { model: CardModel }) {
  const [open, setOpen] = useState<1 | 2 | 3 | 4>(
    (m.defaultFloor ?? 1) as 1 | 2 | 3 | 4
  );
  return (
    <div>
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
                active
                  ? "border-sage-500 bg-sage-50"
                  : "border-brand-200 bg-white hover:bg-cream",
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
                  你常住这层
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

/* 楼层判词 + 火种句（全卡最值钱的一句） */
function FloorVerdict({ model: m }: { model: CardModel }) {
  const persona = m.persona ? PERSONA_COPY[m.persona] : null;
  return (
    <div className="mt-4 space-y-3">
      {persona && m.defaultFloor ? (
        <p className="leading-relaxed text-brand-700">
          招式是人设，站位是楼层。出手常是{persona.name}的你，平时多半住在
          {FLOOR_LABELS[m.defaultFloor]}。
        </p>
      ) : null}
      {m.sparkFloor && m.attentionFloor && m.behaviorFloor ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 leading-relaxed text-amber-900">
          <span className="mr-1 font-medium">✦ 但有一处别错过：</span>
          你说过，孩子跟你说话时，你
          {m.attentionFloor >= 4
            ? "偶尔会有「我们俩都被聊开了」的时刻"
            : "有时会被TA的感受带进去"}
          ——{FLOOR_LABELS[m.sparkFloor]}的门，你其实摸到过。
          只是出手的瞬间，习惯抢在了前面。今晚练的不是新东西，是让你已经会的那部分，先出手。
        </p>
      ) : null}
      {m.dialogueField === 5 ? (
        <p className="rounded-xl border border-brand-200 bg-white px-4 py-3 leading-relaxed text-brand-700">
          你写到，最近想不起来一次超过十分钟的对话。那今晚你的目标比谁都清楚，也比谁都不难：
          不急着上楼，先约一场球。十分钟，聊什么都行。
        </p>
      ) : null}
    </div>
  );
}

/* ③ 引用他自己的语料 */
function QuoteSection({ model: m }: { model: CardModel }) {
  const hasAny =
    m.childQuote || m.ownWords || m.perspectiveGap !== null || m.habit;
  if (!hasAny) return null;
  return (
    <Section no="03" title="你自己写下的，比什么都准">
      <div className="space-y-3">
        {m.childQuote ? (
          <blockquote className="rounded-xl border-l-4 border-sage-400 bg-sage-50 px-4 py-3">
            <p className="mb-1 text-xs text-brand-500">
              {m.childName}最近的那句话，你还记得：
            </p>
            <p className="font-serif text-lg leading-relaxed text-ink">
              「{m.childQuote}」
            </p>
            <p className="mt-2 text-sm leading-relaxed text-brand-600">
              当时不知道怎么接，不是你的错——那正是今晚要练的那一球。
            </p>
          </blockquote>
        ) : null}
        {!m.childQuote && m.ownWords ? (
          <blockquote className="rounded-xl border-l-4 border-sage-400 bg-sage-50 px-4 py-3">
            <p className="mb-1 text-xs text-brand-500">你写下的、你实际会说的话：</p>
            <p className="font-serif text-base leading-relaxed text-ink">
              「{m.ownWords}」
            </p>
            <p className="mt-2 text-sm leading-relaxed text-brand-600">
              比选项更真实的，永远是你自己的话——今晚就从它练起。
            </p>
          </blockquote>
        ) : null}
        {m.perspectiveGap !== null && m.perspectiveGap >= 2 ? (
          <p className="leading-relaxed text-brand-700">
            还有一件事想让你看见：你给自己的「会听」打了 {m.selfScore} 分，却猜
            {m.childName}只会给你 {m.guessScore} 分。敢往低了猜，说明你已经站到TA那边看过自己了——
            这就是换位，而且是你自己做到的。
          </p>
        ) : null}
        {m.habit ? (
          <p className="leading-relaxed text-brand-700">
            你猜{m.childName}最想改掉你的「{m.habit}」。你看，其实你都知道——知道，就是改的开始。
          </p>
        ) : null}
        {m.wantToUnderstand ? (
          <p className="leading-relaxed text-brand-700">
            你说最想听懂的，是{m.childName}的「{m.wantToUnderstand}」。把今晚练的带回家，从这件事开始听。
          </p>
        ) : null}
      </div>
    </Section>
  );
}

/* ④ 今晚的练习 */
function PracticeSection({ model: m }: { model: CardModel }) {
  const persona = m.persona ? PERSONA_COPY[m.persona] : null;
  return (
    <Section no="04" title={m.isCatcherStar ? "今晚，请你出场" : "今晚，只练一件事"}>
      {persona ? (
        <p className="mb-4 leading-relaxed text-brand-700">{persona.practice}</p>
      ) : null}

      {!m.isCatcherStar ? (
        <>
          <div className="mb-4 space-y-2">
            {[
              ["停一拍", "心里数三秒，把冲到嘴边的那句咽回去。"],
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
            禁用三件套：先别问为什么、先别讲道理、先别给办法。卡住的时候听一听，
            是哪个声音在替你抢答——评判、嘲讽，还是担心。那不是你不爱{m.childName}，
            是你的本能先替你出手了。认出它，先别照它做。
          </p>
        </>
      ) : null}

      <p className="rounded-xl bg-sage-600 px-4 py-3.5 leading-relaxed text-white">
        {m.dialogueField === 5 ? (
          <>回家第一球：这周留意一次{m.childName}主动开口的时刻，记下TA的第一句话。别急着接好，先接住。</>
        ) : m.isCatcherStar ? (
          <>第一轮，请你来演{m.childName === "孩子" ? "孩子" : m.childName}——让大家看看，被接住是什么感觉。</>
        ) : (
          <>别急着修，先接住。第一球，从{m.childName}开始。</>
        )}
      </p>

      {m.confidence !== null ? (
        <p className="mt-3 text-sm leading-relaxed text-brand-500">
          你给「能练成」的把握打了 {m.confidence} 分。今晚不求变成 10 分——
          只要让它加 1，就够了。
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
