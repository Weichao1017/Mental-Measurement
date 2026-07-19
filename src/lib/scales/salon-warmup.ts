/**
 * 家庭沙龙——家长热身问卷
 *
 * 来源：沙龙主持人提供的《问卷正文.docx》（2026-07），逐字录入。
 * 性质：纯收集型问卷（isSurvey），无标准计分、无分级、无临床判定；
 *       回答通过分享链接（URL hash，零服务端）交给沙龙主持人。
 * 题型：单选（含自由补充）/ 多选 / 自由文本 / 数字填写 / 1-10 打分。
 */

import type { Scale } from "../types";

export const salonWarmup: Scale = {
  id: "salon-warmup",
  slug: "salon-warmup",
  name: "家庭沙龙——家长热身问卷",
  nameEn: "Family Salon — Parent Warm-up Questionnaire",
  // 卡片小字说明按用户要求留空（不展示）
  description: "",
  descriptionEn: "",
  timeFrame: "以你平时的真实情况为准",
  timeFrameEn: "Based on how you actually are day-to-day",
  estimatedMinutes: 7,
  isCore: false,
  category: "salon",
  isSurvey: true,
  highIsBetter: false,
  excludeFromClinicalFlag: true,
  instructions:
    "这不是考试卷，是热身。这次沙龙我们只聚焦一件事：与孩子的沟通。下面所有题，请选「你真实会做的」，不是「你觉得对的」——越真实，当天的练习对你越有用。你的回答只有主持人看得到；写到孩子时可以用化名。大约 7 分钟。",
  instructionsEn:
    "This is not a test — it's a warm-up. The salon focuses on one thing: communicating with your child. For every question below, choose what you would actually do, not what you think is 'right' — the more honest, the more useful the practice will be for you. Only the host sees your answers; feel free to use a pseudonym for your child. About 7 minutes.",
  options: [], // 各题自带选项 / 输入类型
  items: [
    // ============ 基本信息 ============
    {
      index: 1,
      text: "你的微信名",
      textEn: "Your WeChat name",
      dimension: "Q",
      inputType: "text",
      placeholder: "方便主持人对上号",
      section: { title: "基本信息" },
    },
    {
      index: 2,
      text: "你希望活动中大家怎么称呼你（昵称即可）",
      textEn: "What should we call you during the salon (a nickname is fine)",
      dimension: "Q",
      inputType: "text",
    },
    {
      index: 3,
      text: "孩子情况（可添加多个孩子，每个孩子填一个年龄 + 性别）",
      textEn:
        "Your children (add one row per child — age + gender; add as many as you have)",
      dimension: "Q",
      inputType: "children",
      min: 1,
      max: 60,
      unit: "岁",
      // 向后兼容：合并前「年龄」在本题(index 3)、「性别」在 index 4；旧提交无 children
      // JSON 时，用这两处旧字段合成「一个孩子」显示，保住已收集数据。
      childrenLegacy: { ageIndex: 3, genderIndex: 4 },
      options: [
        { value: 1, label: "男生", labelEn: "Boy" },
        { value: 2, label: "女生", labelEn: "Girl" },
      ],
    },
    {
      // 孩子出生地（2026-07-18 新增，自由填空）。
      // 铁律：一旦上线，新题必须取「比现有全部题号都大」的 index，使其在分享 payload 的
      // positional a 数组里排到最后、绝不挤动任何既有题的位置（保护已收集的真实数据）。
      // 显示位置由 items 数组顺序决定（与 index 解耦）——放在此处即问卷上部、孩子情况之后。
      index: 19,
      text: "孩子出生地",
      textEn: "Your child's birthplace",
      dimension: "Q",
      inputType: "text",
      // 显式空串：TextInput 用 `item.placeholder ?? 默认`，若删字段会回退到默认提示；
      // 空串（非 nullish）才能让输入框真正留空、无任何占位文字。
      placeholder: "",
    },
    {
      // 旧「孩子性别」题：已并入 index 3 的 children 复合题。保留在题库里只为维持
      // 分享 payload 的 positional 对齐（绝不删题/改题号），设 hidden 不再渲染。
      index: 4,
      text: "孩子性别（已并入上一题）",
      textEn: "Child's gender (merged into the previous question)",
      dimension: "Q",
      hidden: true,
      inputType: "multi",
      options: [
        { value: 1, label: "男生", labelEn: "Boy" },
        { value: 2, label: "女生", labelEn: "Girl" },
      ],
    },
    {
      index: 5,
      text: "孩子对你的性倾向／性别身份了解到什么程度？",
      textEn:
        "How much does your child know about your sexual orientation / gender identity?",
      dimension: "Q",
      optional: true,
      widget: "buttons",
      options: [
        { value: 1, label: "聊过", labelEn: "We've talked about it" },
        { value: 2, label: "知道但很少谈", labelEn: "Knows but we rarely talk about it" },
        { value: 3, label: "可能有察觉", labelEn: "May have sensed it" },
        { value: 4, label: "还不知道", labelEn: "Doesn't know yet" },
        { value: 5, label: "不适用", labelEn: "Not applicable" },
        { value: 6, label: "不想回答", labelEn: "Prefer not to answer" },
      ],
    },
    // ============ 第一部分 · 三个张力场景 ============
    {
      index: 6,
      text: "场景 1：晚饭时，孩子忽然说：「我们班主任就是针对我，今天又当着全班说我。」你最可能——",
      textEn:
        "Scenario 1: At dinner, your child suddenly says: 'My homeroom teacher is out to get me — today they called me out in front of the whole class again.' You would most likely —",
      dimension: "Q",
      widget: "buttons",
      freeTextLabel: "如果你实际会说的和选项都不一样，欢迎写下来：",
      section: {
        title: "第一部分 · 三个张力场景",
        note: "选你最可能脱口而出的那句。凭直觉选，选完别改。每题下面有一行空，如果你实际会说的和选项都不一样，欢迎写下来。",
      },
      options: [
        {
          value: 1,
          label: "「是不是你先做了什么，老师才说你？」",
          labelEn: "'Did you do something first, and that's why the teacher called you out?'",
        },
        {
          value: 2,
          label: "「老师严格是为你好，你自己也得反思。」",
          labelEn: "'The teacher is strict for your own good — you should reflect on yourself too.'",
        },
        {
          value: 3,
          label: "「别放心上，快吃饭。作业写完了吗？」",
          labelEn: "'Don't take it to heart, eat up. Have you finished your homework?'",
        },
        {
          value: 4,
          label: "「当着全班说你……这挺让人下不来台的。后来呢？」",
          labelEn: "'Called out in front of the whole class… that's really embarrassing. What happened next?'",
        },
        {
          value: 5,
          label: "「这老师不像话，明天我去学校问问。」",
          labelEn: "'That teacher is out of line — I'll go ask the school about it tomorrow.'",
        },
        {
          value: 6,
          label: "都不是，我实际大概会说：（写在下面）",
          labelEn: "None of these — what I'd actually say: (write below)",
        },
      ],
    },
    {
      index: 7,
      text: "场景 2：你说了句「手机收一下」，孩子突然爆发：「你烦不烦！」摔门进屋。你最可能——",
      textEn:
        "Scenario 2: You say 'put the phone away', and your child suddenly explodes: 'You're so annoying!' and slams the door. You would most likely —",
      dimension: "Q",
      widget: "buttons",
      freeTextLabel: "如果你实际会说的和选项都不一样，欢迎写下来：",
      options: [
        {
          value: 1,
          label: "敲门放话：「把门打开！跟爸爸这么说话像什么样子！」",
          labelEn: "Knock and declare: 'Open the door! Is that how you talk to your dad?!'",
        },
        {
          value: 2,
          label: "隔着门追问：「到底怎么了？是不是学校出什么事了？」",
          labelEn: "Press through the door: 'What's going on? Did something happen at school?'",
        },
        {
          value: 3,
          label: "过一会儿敲门：「刚才你好像真的很烦。手机先放一边，你想说的时候，我在客厅。」",
          labelEn:
            "Knock a bit later: 'You seemed really frustrated just now. Let's set the phone aside — when you feel like talking, I'll be in the living room.'",
        },
        {
          value: 4,
          label: "算了，等TA自己出来，就当没发生过。",
          labelEn: "Let it go — wait for them to come out, act like nothing happened.",
        },
        {
          value: 5,
          label: "隔门谈条件：「这样，一天两小时，周末加一小时，行了吧？」",
          labelEn: "Negotiate through the door: 'How about two hours a day, plus one on weekends, deal?'",
        },
        {
          value: 6,
          label: "都不是，我实际大概会说：（写在下面）",
          labelEn: "None of these — what I'd actually say: (write below)",
        },
      ],
    },
    {
      index: 8,
      text: "场景 3（可跳过）：孩子放学回来闷闷的，睡前小声说：「今天有同学问我，为什么咱们家跟别人家不一样。」你最可能——",
      textEn:
        "Scenario 3 (may skip): Your child comes home subdued, and at bedtime quietly says: 'A classmate asked me today why our family is different from other families.' You would most likely —",
      dimension: "Q",
      optional: true,
      widget: "buttons",
      freeTextLabel: "如果你实际会说的和选项都不一样，欢迎写下来：",
      options: [
        {
          value: 1,
          label: "「谁问的？怎么突然问这个？」",
          labelEn: "'Who asked? Why would they suddenly ask that?'",
        },
        {
          value: 2,
          label: "「咱家挺好的，不用理会这些话。」",
          labelEn: "'Our family is just fine — don't mind that talk.'",
        },
        {
          value: 3,
          label: "「别人怎么说不重要，你自己要立得住。」",
          labelEn: "'What others say doesn't matter — you have to stand firm yourself.'",
        },
        {
          value: 4,
          label: "「明天我跟老师说说，让同学别这么问。」",
          labelEn: "'I'll talk to the teacher tomorrow and ask them to stop the questions.'",
        },
        {
          value: 5,
          label: "「被这么一问，你心里是什么滋味？」",
          labelEn: "'Being asked that — how did it feel inside?'",
        },
        {
          value: 6,
          label: "我们还没遇到过类似情况／不好想象",
          labelEn: "We haven't encountered this / hard to imagine",
        },
        {
          value: 7,
          label: "都不是，我实际大概会说：（写在下面）",
          labelEn: "None of these — what I'd actually say: (write below)",
        },
      ],
    },
    // ============ 第二部分 · 平时你们聊天的样子 ============
    {
      index: 9,
      text: "对话 1：回想最近一次你和孩子聊了超过十分钟的对话，整体最像下面哪种？",
      textEn:
        "Conversation 1: Think of the last time you and your child talked for more than ten minutes. Overall it was most like —",
      dimension: "Q",
      widget: "buttons",
      section: { title: "第二部分 · 平时你们聊天的样子" },
      options: [
        {
          value: 1,
          label: "基本是例行公事：「作业写了吗」「嗯」——话说了不少，新东西一点没有",
          labelEn: "Mostly routine: 'Homework done?' 'Mm.' — lots of words, nothing new",
        },
        {
          value: 2,
          label: "说着说着成了辩论：各自守着立场，谁也没让谁",
          labelEn: "It turned into a debate: each holding their position, neither budging",
        },
        {
          value: 3,
          label: "我听到了一些以前不知道的事，有点意外",
          labelEn: "I heard things I didn't know before — a bit surprising",
        },
        {
          value: 4,
          label: "TA说着说着自己想明白了什么——或者我对TA、对自己有了新的认识",
          labelEn:
            "They figured something out while talking — or I saw them, or myself, in a new light",
        },
        {
          value: 5,
          label: "……想不起来最近有超过十分钟的对话",
          labelEn: "…I can't recall a conversation longer than ten minutes recently",
        },
      ],
    },
    {
      index: 10,
      text: "对话 2（多选）：孩子跟你说话时，你脑子里最常发生的是？（要诚实）",
      textEn:
        "Conversation 2 (multi-select): When your child talks to you, what most often happens in your head? (Be honest)",
      dimension: "Q",
      inputType: "multi",
      options: [
        {
          value: 1,
          label: "听两句就大概知道TA要说什么，回复已经在嘴边",
          labelEn: "Two sentences in, I already know where it's going — my reply is on my lips",
        },
        {
          value: 2,
          label: "我会认真核对事实：到底发生了什么、经过是怎样",
          labelEn: "I carefully check the facts: what exactly happened, and how",
        },
        {
          value: 3,
          label: "有时会被TA的感受带进去，一时忘了自己原本要说什么",
          labelEn: "Sometimes I get drawn into their feelings and forget what I meant to say",
        },
        {
          value: 4,
          label: "偶尔聊完会有「我们俩都被聊开了」的感觉",
          labelEn: "Occasionally we finish talking and both feel opened up",
        },
      ],
    },
    // ============ 第三部分 · 换个位置看 ============
    {
      index: 11,
      text: "翻转 1a：如果让孩子悄悄给「爸爸听我说话」打分（1＝根本没在听，10＝特别会听）——你猜TA打几分？",
      textEn:
        "Flip 1a: If your child secretly rated 'Dad listens to me' (1 = not listening at all, 10 = a great listener) — what score do you guess they'd give?",
      dimension: "Q",
      widget: "slider",
      section: { title: "第三部分 · 换个位置看" },
      options: [
        { value: 1, label: "1 分", labelEn: "1", short: "1＝根本没在听", shortEn: "1 = not listening at all" },
        { value: 2, label: "2 分", labelEn: "2" },
        { value: 3, label: "3 分", labelEn: "3" },
        { value: 4, label: "4 分", labelEn: "4" },
        { value: 5, label: "5 分", labelEn: "5" },
        { value: 6, label: "6 分", labelEn: "6" },
        { value: 7, label: "7 分", labelEn: "7" },
        { value: 8, label: "8 分", labelEn: "8" },
        { value: 9, label: "9 分", labelEn: "9" },
        { value: 10, label: "10 分", labelEn: "10", short: "10＝特别会听", shortEn: "10 = a great listener" },
      ],
    },
    {
      index: 12,
      text: "翻转 1b：同一件事——你给自己打几分？",
      textEn: "Flip 1b: Same question — what score would you give yourself?",
      dimension: "Q",
      widget: "slider",
      options: [
        { value: 1, label: "1 分", labelEn: "1", short: "1＝根本没在听", shortEn: "1 = not listening at all" },
        { value: 2, label: "2 分", labelEn: "2" },
        { value: 3, label: "3 分", labelEn: "3" },
        { value: 4, label: "4 分", labelEn: "4" },
        { value: 5, label: "5 分", labelEn: "5" },
        { value: 6, label: "6 分", labelEn: "6" },
        { value: 7, label: "7 分", labelEn: "7" },
        { value: 8, label: "8 分", labelEn: "8" },
        { value: 9, label: "9 分", labelEn: "9" },
        { value: 10, label: "10 分", labelEn: "10", short: "10＝特别会听", shortEn: "10 = a great listener" },
      ],
    },
    {
      index: 13,
      text: "翻转 2：孩子要是能改掉你一个接话习惯，你猜TA最想改哪个？",
      textEn:
        "Flip 2: If your child could change one of your conversational habits, which one do you guess they'd pick?",
      dimension: "Q",
      widget: "buttons",
      freeTextLabel: "选「其他」的话，写一笔：",
      options: [
        { value: 1, label: "问个不停", labelEn: "Endless questioning" },
        { value: 2, label: "讲道理", labelEn: "Lecturing" },
        { value: 3, label: "说「没事没事」", labelEn: "Saying 'it's nothing, it's nothing'" },
        { value: 4, label: "急着给办法", labelEn: "Rushing to offer solutions" },
        { value: 5, label: "打断插话", labelEn: "Interrupting" },
        { value: 6, label: "其他（写在下面）", labelEn: "Other (write below)" },
      ],
    },
    // ============ 第四部分 · 你家的台词 ============
    {
      index: 14,
      text: "语料 1：孩子最近说过的一句话，让你当时不知道怎么接——请尽量写原话。",
      textEn:
        "Line 1: Something your child said recently that left you unsure how to respond — please write the exact words if you can.",
      dimension: "Q",
      inputType: "text",
      multiline: true,
      placeholder: "尽量写原话",
      section: {
        title: "第四部分 · 你家的台词",
        note: "这部分是当天练习的原材料：我们可能会把它做成练习卡（细节会改到别人认不出）。",
      },
    },
    {
      index: 15,
      text: "语料 2：你最想听懂孩子的哪件事？",
      textEn: "Line 2: What about your child do you most want to truly understand?",
      dimension: "Q",
      inputType: "text",
      multiline: true,
      optional: true,
    },
    {
      index: 16,
      text: "孩子最近有没有让你特别担心的状况（情绪、上学、人际、安全……）？写一笔，我们不会在现场提。",
      textEn:
        "Anything about your child that especially worries you lately (mood, school, relationships, safety…)? Jot it down — we will not bring it up during the salon.",
      dimension: "Q",
      inputType: "text",
      multiline: true,
      optional: true,
    },
    // ============ 第五部分 · 两把尺 ============
    {
      index: 17,
      text: "尺 1：「与孩子的沟通」的能力，对你有多重要？（1–10）",
      textEn: "Scale 1: How important is the ability to communicate with your child to you? (1–10)",
      dimension: "Q",
      widget: "slider",
      section: { title: "第五部分 · 两把尺" },
      options: [
        { value: 1, label: "1 分", labelEn: "1", short: "1", shortEn: "1" },
        { value: 2, label: "2 分", labelEn: "2" },
        { value: 3, label: "3 分", labelEn: "3" },
        { value: 4, label: "4 分", labelEn: "4" },
        { value: 5, label: "5 分", labelEn: "5" },
        { value: 6, label: "6 分", labelEn: "6" },
        { value: 7, label: "7 分", labelEn: "7" },
        { value: 8, label: "8 分", labelEn: "8" },
        { value: 9, label: "9 分", labelEn: "9" },
        { value: 10, label: "10 分", labelEn: "10", short: "10", shortEn: "10" },
      ],
    },
    {
      index: 18,
      text: "尺 2：你觉得自己能练成的把握有几分？（1–10）",
      textEn: "Scale 2: How confident are you that you can master it? (1–10)",
      dimension: "Q",
      widget: "slider",
      options: [
        { value: 1, label: "1 分", labelEn: "1", short: "1", shortEn: "1" },
        { value: 2, label: "2 分", labelEn: "2" },
        { value: 3, label: "3 分", labelEn: "3" },
        { value: 4, label: "4 分", labelEn: "4" },
        { value: 5, label: "5 分", labelEn: "5" },
        { value: 6, label: "6 分", labelEn: "6" },
        { value: 7, label: "7 分", labelEn: "7" },
        { value: 8, label: "8 分", labelEn: "8" },
        { value: 9, label: "9 分", labelEn: "9" },
        { value: 10, label: "10 分", labelEn: "10", short: "10", shortEn: "10" },
      ],
    },
  ],
  dimensions: [],
  scoringMethod: "custom",
  severityBands: {},
  citation: "家庭沙龙内部热身问卷（非标准化量表，仅作沙龙练习准备用，无计分）",
  fullyVerified: true,
  notes:
    "纯收集型问卷：无计分、无分级；回答只用于沙龙当天的练习设计，通过分享链接交给主持人，不上传服务器。",
};
