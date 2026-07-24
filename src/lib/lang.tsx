"use client";

/**
 * 语言上下文 + UI 文本字典。
 *
 * 设计：
 *  - 中文是默认 / fallback 语言（量表内容、UI 文本主语言）
 *  - 英文是可选：用户朋友是英文母语者时切换
 *  - localStorage 持久化（key=mm.lang）
 *  - 量表层面：ScaleItem.textEn 等 *En 字段（如未设则 fallback 到中文）
 *  - UI 层面：本文件的 UI 字典
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "zh" | "en";

const STORAGE_KEY = "mm.lang";

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({
  lang: "zh",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  // 客户端水合后读 localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, l);
    }
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

/**
 * 从带中英双字段的对象选语言：
 *   pick(scale.name, scale.nameEn, lang)
 */
export function pick<T extends string | undefined>(
  zh: T,
  en: T | undefined | null,
  lang: Lang
): T {
  if (lang === "en" && en) return en as T;
  return zh;
}

/** UI 文本字典 */
export const UI = {
  // 顶部导航
  nav_zh: { zh: "中文", en: "中文" },
  nav_en: { zh: "EN", en: "EN" },

  // 首页
  home_eyebrow: { zh: "Mental Measurement", en: "Mental Measurement" },
  home_title: {
    zh: "一份认真的心理状态自评",
    en: "A serious mental health self-assessment",
  },
  home_intro: {
    zh: "这是一份给愿意花十几分钟认真了解自己的人准备的评估。所有题目都来自国际公开发表、被研究反复验证的心理量表。完成后你会得到一份属于自己的多维度画像——也是你和你的疗愈老师之后一起工作的起点。",
    en: "An assessment for people willing to spend 10-20 minutes understanding themselves carefully. All items are drawn from internationally published, peer-validated psychological scales. After completion you'll receive a multi-dimensional picture of yourself — and a starting point for work with your therapist.",
  },
  home_includes_title: {
    zh: "这份评估包括什么",
    en: "What's included",
  },
  home_core_label: { zh: "核心：", en: "Core: " },
  home_core_desc: {
    zh: "DASS-21 抑郁焦虑压力量表（21 题，约 4 分钟）——所有人都做。",
    en: "DASS-21 Depression Anxiety Stress Scale (21 items, ~4 min) — for everyone.",
  },
  home_optional_label: { zh: "可选模块：", en: "Optional modules: " },
  home_optional_desc: {
    zh: "根据你之后勾选的兴趣方向，加做不同的量表（每个 3-8 分钟）：",
    en: "Based on your concerns selected next, add different scales (3-8 min each):",
  },
  home_optional_list_a: {
    zh: "主观幸福感（WHO-5）/ 正念能力（FFMQ）/ 自我关怀（SCS）",
    en: "Wellbeing (WHO-5) / Mindfulness (FFMQ) / Self-compassion (SCS)",
  },
  home_optional_list_b: {
    zh: "身体觉察（MAIA）/ 情绪调节（DERS）/ 睡眠（PSQI）/ 依恋（ECR）",
    en: "Interoception (MAIA) / Emotion regulation (DERS) / Sleep (PSQI) / Attachment (ECR)",
  },
  home_library_hint: {
    zh: "想直接选某一个量表做？去",
    en: "Want to pick a specific scale directly? Go to",
  },
  home_library_link: { zh: "测评题库", en: "Library" },
  home_before_title: { zh: "在你开始之前", en: "Before you start" },
  home_before_li1: {
    zh: "完整评估大约 5 – 25 分钟（取决于你选了多少可选模块）",
    en: "Full assessment ~5-25 min (depends on how many optional modules)",
  },
  home_before_li2: {
    zh: "请按你近期真实的感受作答，不要思考「应该选什么」",
    en: "Answer based on your actual recent feelings, not what you 'should' choose",
  },
  home_before_li3: {
    zh: "结果只用于帮助你和你的老师更好地了解你，不构成任何临床诊断",
    en: "Results help you and your therapist understand you better — not a clinical diagnosis",
  },
  home_before_li4: {
    zh: "如果在评估中触发了不舒服的感受，随时可以暂停",
    en: "If uncomfortable feelings arise during the assessment, feel free to pause anytime",
  },
  home_start: { zh: "开始评估 →", en: "Start Assessment →" },
  home_library_btn: { zh: "浏览题库", en: "Browse Library" },
  home_footer: {
    zh: "本评估基于公开发表的心理量表（DASS-21 / WHO-5 / FFMQ / SCS / MAIA / DERS / PSQI / ECR / GAD-7 / PHQ-9 / MDQ / WSAS / PSWQ / RRS-10 / ASRS）改编整理。结果仅供自我了解，不能替代专业诊断。",
    en: "This assessment is based on publicly published psychological scales (DASS-21, WHO-5, FFMQ, SCS, MAIA, DERS, PSQI, ECR, GAD-7, PHQ-9, MDQ, WSAS, PSWQ, RRS-10, ASRS). Results are for self-understanding only and cannot replace professional diagnosis.",
  },

  // intake
  intake_step: { zh: "STEP 1 / 2", en: "STEP 1 / 2" },
  intake_title: {
    zh: "你最想了解 / 改善的是？",
    en: "What do you most want to learn about or improve?",
  },
  intake_subtitle: {
    zh: "以下选项可以多选，也可以一个都不选。你的选择只用于决定这份评估要不要加入额外的模块——核心量表（DASS-21）所有人都会做。",
    en: "You can select multiple, none, or one of the options below. Your selection only determines whether additional modules are added — the core scale (DASS-21) is done by everyone.",
  },
  intake_battery_label: { zh: "将要完成的评估", en: "Assessments to complete" },
  intake_start: { zh: "开始第一个量表 →", en: "Start the first scale →" },

  // library
  library_eyebrow: { zh: "Library", en: "Library" },
  library_title: { zh: "测评题库", en: "Library of Scales" },
  library_intro: {
    zh: "点击量表卡片即可勾选，可以同时选几个一起做——完成后所有结果会汇总在一页，AI 深度分析也会综合所有量表给出整体画像。",
    en: "Click a card to select. You can pick several to do at once — all results will be combined on one page, and AI deep analysis will give an integrated picture across all scales.",
  },
  library_back_home: { zh: "首页", en: "home page" },
  library_back_home_hint: {
    zh: "如果你想走完整推荐流程，回到",
    en: "If you want the full recommended flow, return to the",
  },
  library_back_home_action: {
    zh: "点「开始评估」。",
    en: "and click 'Start Assessment'.",
  },
  library_cat_anxiety: {
    zh: "焦虑情绪测评",
    en: "Anxiety & Mood Clinical",
  },
  library_cat_anxiety_sub: {
    zh: "焦虑/抑郁/双相的临床金标准筛查 + 慢性担忧、反刍、成人 ADHD 鉴别",
    en: "Clinical gold-standard screeners for anxiety/depression/bipolar + chronic worry, rumination, adult ADHD differential",
  },
  library_cat_general: {
    zh: "综合心理评估",
    en: "General Psychological Assessment",
  },
  library_cat_general_sub: {
    zh: "情绪症状、幸福感、正念能力、自我关怀、身体觉察、情绪调节、睡眠、依恋等",
    en: "Emotional symptoms, wellbeing, mindfulness, self-compassion, body awareness, emotion regulation, sleep, attachment, etc.",
  },
  library_cat_salon: {
    zh: "活动 · 沙龙问卷",
    en: "Workshops & Salons",
  },
  library_cat_salon_sub: {
    zh: "配合线下沙龙 / 工作坊使用的收集型问卷——不打分，回答通过链接交给主持人",
    en: "Collection questionnaires for offline salons / workshops — unscored; responses go to the host via a share link",
  },
  library_card_type: { zh: "类型：", en: "Type: " },
  library_type_survey: { zh: "问卷收集（无计分）", en: "survey (unscored)" },
  library_selected_count: { zh: "已选", en: "Selected" },
  library_scales_unit: { zh: "个量表", en: "scales" },
  library_items_unit: { zh: "题", en: "items" },
  library_minutes_prefix: { zh: "预计 ~", en: "~" },
  library_minutes_unit: { zh: "分钟", en: "min" },
  library_clear: { zh: "清空", en: "Clear" },
  library_start_selected: {
    zh: "开始所选量表 →",
    en: "Start Selected Scales →",
  },
  library_badge_core: { zh: "核心", en: "Core" },
  library_badge_unverified: { zh: "题库待核对", en: "Translation in review" },
  library_badge_stub: { zh: "开发中", en: "Coming soon" },
  library_card_timeframe: { zh: "时间窗口：", en: "Timeframe: " },
  library_card_items: { zh: "题数：", en: "Items: " },
  library_card_minutes: { zh: "预计：", en: "Est: " },
  library_card_direction: { zh: "方向：", en: "Direction: " },
  library_dir_high_good: { zh: "高=能力强", en: "high = strong" },
  library_dir_high_bad: { zh: "高=症状/困扰", en: "high = symptomatic" },
  library_footer: {
    zh: "所有量表均来自国际公开发表、被研究反复验证的心理评估工具。「题库待核对」标签表示中文题目由 AI 翻译，尚未与权威中文修订版逐字对齐；英文版为量表原版语言。",
    en: "All scales are publicly published, peer-validated psychological assessment tools. The 'Translation in review' tag means the Chinese version is AI-translated and not yet aligned with authoritative Chinese revisions; the English version is the original.",
  },

  // /start/ 套餐启动页
  start_eyebrow: { zh: "Battery", en: "Battery" },
  start_title: { zh: "准备开始评估", en: "Ready to begin" },
  start_intro_prefix: { zh: "下面这套评估包含 ", en: "This battery contains " },
  start_intro_scales_unit: { zh: " 个量表", en: " scales" },
  start_intro_items_unit: { zh: " 题", en: " items" },
  start_intro_minutes_prefix: { zh: "预计 ", en: "estimated " },
  start_intro_minutes_unit: { zh: " 分钟", en: " min" },
  start_begin: { zh: "开始评估", en: "Begin Assessment" },
  start_share: { zh: "复制链接 / 二维码", en: "Copy link / QR" },
  start_share_title: {
    zh: "把这份套餐发给朋友 / 来访者",
    en: "Share this battery with a friend or client",
  },
  start_share_desc: {
    zh: "复制上方「复制链接 / 二维码」生成的链接，对方打开后会看到完全一样的量表清单，点开始即可作答。链接本身不带任何答题数据，他们的作答只保存在自己的设备上。",
    en: "Copy the link from the button above. When they open it, they'll see the exact same battery and can start. The link contains no answer data — their responses stay on their own device.",
  },
  // ── 收集本（老师后端回收作答）──
  start_collect_toggle: {
    zh: "把作答回收到我的收集本（我作为发起人能看到所有提交）",
    en: "Collect responses to my inbox (I can see every submission as the organizer)",
  },
  start_collect_toggle_hint: {
    zh: "开启后，来访者答完会自动把作答提交给你；你用下方生成的「看板链接」就能看到所有提交。关闭则不回收，作答只留在对方设备上。",
    en: "When on, respondents' answers are submitted to you automatically once they finish; open the inbox link below to see them all. When off, nothing is collected — answers stay only on their device.",
  },
  start_collect_creating: { zh: "正在创建收集本…", en: "Creating your inbox…" },
  start_collect_error: {
    zh: "创建收集本失败，请稍后重试。",
    en: "Couldn't create the inbox. Please try again.",
  },
  start_collect_inbox_title: {
    zh: "你的看板链接（只给自己保存）",
    en: "Your inbox link (keep it for yourself)",
  },
  start_collect_inbox_desc: {
    zh: "打开它就能看到所有提交。这条链接 = 你的查看密钥，请妥善保管、不要外发；任何拿到它的人都能看到全部作答。",
    en: "Open it to see all submissions. This link IS your access key — keep it safe and don't forward it; anyone who has it can see every response.",
  },
  start_collect_fill_hint: {
    zh: "现在下方「复制链接 / 二维码」得到的就是发给来访者的作答链接（已开启回收）。",
    en: "The Copy link / QR button below now gives you the fill-out link to send to respondents (collection is on).",
  },
  start_collect_notice: {
    zh: "这份问卷由发起人收集作答：你完成后，回答会提交给发起人。",
    en: "This questionnaire is collected by its organizer: when you finish, your answers are submitted to them.",
  },
  start_share_title_collect: {
    zh: "把作答链接发给来访者（已开启回收）",
    en: "Send the fill-out link to respondents (collection on)",
  },
  start_share_desc_collect: {
    zh: "复制上方「复制链接 / 二维码」生成的作答链接发给来访者。他们答完后，回答会自动提交到你的收集本，你用看板链接即可查看。请在邀请时让对方知道作答会提交给你。",
    en: "Copy the fill-out link above and send it to respondents. When they finish, their answers are submitted to your inbox automatically, viewable via your inbox link. Please let them know their answers will be sent to you.",
  },
  start_empty: {
    zh: "这个链接没有指定要做哪些量表。",
    en: "This link doesn't specify any scales.",
  },
  start_to_library: { zh: "去题库选择", en: "Go to Library" },

  // ScaleRunner
  runner_section_completed: { zh: "已答", en: "Answered" },
  runner_section_total_sep: { zh: " / ", en: " / " },
  runner_timeframe_prefix: { zh: "时间窗口：", en: "Timeframe: " },
  runner_completed_all: {
    zh: "已完成本量表全部题目。",
    en: "All items in this scale completed.",
  },
  runner_submit_continue: { zh: "提交并继续 →", en: "Submit & Continue →" },
  runner_remaining_prefix: { zh: "还有 ", en: "Still " },
  runner_remaining_mid: { zh: " 道题没答", en: " items unanswered" },
  runner_remaining_note: {
    zh: "所有题目答完才能进入下一个量表",
    en: "All items must be answered to proceed to the next scale",
  },
  runner_remaining_note_survey: {
    zh: "带「选答」标记的题可以跳过，必答题都答完即可提交",
    en: "Items marked 'Optional' can be skipped; submit once all required items are answered",
  },
  runner_jump_unanswered: {
    zh: "跳到下一道未答的题",
    en: "Jump to next unanswered",
  },

  // QuestionCard / SurveyQuestionCard
  q_position_prefix: { zh: "第 ", en: "Q" },
  q_position_suffix: { zh: " 题", en: "" },
  q_optional_badge: { zh: "选答", en: "Optional" },
  q_multi_hint: { zh: "可多选", en: "Select all that apply" },
  q_number_hint: { zh: "填一个数字", en: "Enter a number" },
  q_text_placeholder: { zh: "写在这里…", en: "Write here…" },
  q_dim_hidden: { zh: "维度已隐藏", en: "Dimension hidden" },
  q_slider_hint: { zh: "拖动滑块选择程度", en: "Drag slider to choose" },
  q_warning_title: {
    zh: "我们注意到您选择的程度较高",
    en: "We notice your response indicates a higher level",
  },
  q_warning_body: {
    zh: "如果您正在经历持续的低落或对生活感到无望，这些感受是值得被认真对待的。您可以在结果页找到一些可以拨打的支持热线，也欢迎您向身边信任的人或专业人员寻求支持。",
    en: "If you're experiencing persistent low mood or hopelessness, these feelings deserve to be taken seriously. You'll find support hotlines on the results page; please also reach out to a trusted person or professional.",
  },

  // results 页
  results_eyebrow: { zh: "完成了", en: "Completed" },
  results_title: { zh: "你的评估结果", en: "Your Assessment Results" },
  results_intro: {
    zh: "这是你各个维度此刻的状态。结果只是一张「快照」，不代表你这个人。和老师交流时，可以把这份结果作为对话的起点。",
    en: "Here's a snapshot of where each dimension stands. The result is just a snapshot, not your identity. When talking with your therapist, this can serve as the starting point of the conversation.",
  },
  results_intro_survey: {
    zh: "以下是你在这份问卷里的全部回答。它不打分，只是把你此刻的想法收集起来，作为家庭沙龙里对话的起点。确认无误后，可以把回答交给本次的主持人。",
    en: "Below are all your responses to this questionnaire. It isn't scored — it simply gathers where you are right now, as a starting point for the family salon. Once they look right, you can send them to the host.",
  },
  results_no_data: { zh: "还没有评估数据。", en: "No assessment data yet." },
  results_start: { zh: "开始评估", en: "Start Assessment" },
  results_hotline_title: { zh: "危机干预热线", en: "Crisis Hotlines" },
  results_hotline_intro: {
    zh: "如果你正在经历强烈的低落、无望感或自伤想法——这些感受是真实的、值得被认真对待。你不必独自承担：",
    en: "If you're experiencing intense low mood, hopelessness, or self-harm thoughts — these feelings are real and deserve serious attention. You don't have to carry this alone:",
  },
  results_share_title: { zh: "把这份结果交给老师", en: "Share with Your Therapist" },
  results_share_desc: {
    zh: "生成一个二维码或链接，给疗愈师 / 心理咨询师扫描或打开。老师会看到含逐题答案、维度分、警示信号的解读视图，方便会谈时一起讨论。数据完全包含在链接里，没有上传任何服务器。",
    en: "Generate a QR code or link for your therapist to scan or open. They'll see a view with per-item answers, dimension scores, and warning signals — useful for session discussion. Data is fully contained in the link; nothing is uploaded to any server.",
  },
  results_share_btn: {
    zh: "生成给老师的链接 / 二维码",
    en: "Generate Link / QR Code for Therapist",
  },
  results_share_title_survey: { zh: "把回答交给主持人", en: "Share with the Host" },
  results_share_desc_survey: {
    zh: "生成一个二维码或链接，给本次家庭沙龙的主持人扫描或打开。主持人会看到你逐题的原始回答，方便沙龙里一起讨论。回答完全包含在链接里，没有上传任何服务器。",
    en: "Generate a QR code or link for the family-salon host to scan or open. They'll see your per-item responses as you wrote them — useful for discussion during the salon. Your responses are fully contained in the link; nothing is uploaded to any server.",
  },
  results_share_btn_survey: {
    zh: "生成给主持人的链接 / 二维码",
    en: "Generate Link / QR Code for the Host",
  },
  results_restart: { zh: "清空并重新开始", en: "Clear and Restart" },
  results_copy_title: {
    zh: "复制完整结果（含切点表 + AI 分析）",
    en: "Copy Full Results (cutoffs + AI analysis)",
  },
  results_copy_desc: {
    zh: "一键把全部量表分数、完整切点表、综合建议和 AI 分析复制为 Markdown 文本，方便粘贴到聊天工具 / 邮件 / 文档里发给医生或自己存档。",
    en: "Copy all scale scores, full cutoff tables, integrated recommendation, and AI analysis as Markdown — easy to paste into chat / email / document for a clinician or your own records.",
  },
  results_copy_title_survey: {
    zh: "复制全部回答",
    en: "Copy All Responses",
  },
  results_copy_desc_survey: {
    zh: "一键把你逐题的原始回答复制为 Markdown 文本，方便粘贴到聊天工具 / 文档里发给主持人或自己留存。",
    en: "Copy your per-item responses as Markdown — easy to paste into chat / a document to send to the host or keep for yourself.",
  },
  results_copy_btn: { zh: "复制全部结果", en: "Copy Full Results" },
  results_copy_done: { zh: "已复制", en: "Copied" },
  results_copy_fallback: {
    zh: "你的浏览器不支持自动复制，请手动复制下方文本：",
    en: "Your browser doesn't support auto-copy. Please copy the text below manually:",
  },
  results_disclaimer_title: { zh: "免责声明：", en: "Disclaimer: " },
  results_disclaimer_body: {
    zh: "本评估基于公开发表的心理量表改编整理，结果仅供自我了解和与老师的工作参考，不构成任何临床诊断。如果你或你身边的人出现持续的低落、强烈的无望感或自伤想法，请尽快联系专业心理科 / 精神科，或拨打上述危机干预热线。",
    en: "This assessment is adapted from publicly published psychological scales. Results are for self-understanding and therapist reference only, and do not constitute any clinical diagnosis. If you or someone close to you experiences persistent low mood, strong hopelessness, or self-harm thoughts, please contact a psychiatry / psychology service or call one of the hotlines above as soon as possible.",
  },

  // SurveyAnswersCard（收集型问卷的逐题回顾）
  survey_done_title: { zh: "回答已收好", en: "Responses recorded" },
  survey_done_desc: {
    zh: "这份问卷不打分。下面是你的全部回答，确认无误后，用下方「生成链接 / 二维码」把它交给主持人。",
    en: "This questionnaire isn't scored. Below are all your responses — once they look right, use the share button below to send them to the host.",
  },
  survey_done_desc_collected: {
    zh: "这份问卷不打分。你的回答已提交给这份问卷的发起人，下面是你刚刚提交的全部回答，供你自己核对。",
    en: "This questionnaire isn't scored. Your responses have been submitted to the organizer; below are all the answers you just submitted, for your own reference.",
  },
  results_collected_banner: {
    zh: "✓ 你的回答已提交给这份问卷的发起人。",
    en: "✓ Your responses have been submitted to the organizer.",
  },
  results_upload_failed_banner: {
    zh: "网络似乎不太顺，回答还没能提交给发起人。你可以稍后点这里再试一次，或用下方「把这份结果交给…」把链接手动发过去。",
    en: "Network hiccup — your responses haven't reached the organizer yet. Try again in a moment, or use the Share section below to send the link manually.",
  },
  results_upload_retry: { zh: "重试上传", en: "Retry upload" },
  results_intro_collected: {
    zh: "这是你各个维度此刻的状态。你的回答已提交给这份问卷的发起人，下面这些内容供你自己核对与保存。",
    en: "Here's a snapshot of where each dimension stands right now. Your responses have been submitted to the organizer; what follows is for your own reference.",
  },
  results_intro_survey_collected: {
    zh: "你的回答已提交给这份问卷的发起人。下面是你刚刚提交的全部回答，供你自己核对。",
    en: "Your responses have been submitted to the organizer. Below are all the answers you just submitted, for your own reference.",
  },
  runner_submitting: { zh: "正在提交…", en: "Submitting…" },
  // ── 老师看板 /inbox ──
  inbox_loading: { zh: "正在载入收集本…", en: "Loading inbox…" },
  inbox_nokey_title: { zh: "缺少看板密钥", en: "Missing inbox key" },
  inbox_nokey_desc: {
    zh: "这个页面需要用完整的看板链接（含密钥）打开。请使用你创建收集本时保存的那条链接。",
    en: "This page needs the full inbox link (with its key). Please open the link you saved when you created the collection.",
  },
  inbox_error_title: { zh: "打不开收集本", en: "Can't open this inbox" },
  inbox_error_401: {
    zh: "密钥不正确。请确认你用的是创建时保存的完整看板链接。",
    en: "The key is incorrect. Please make sure you're using the full inbox link you saved.",
  },
  inbox_error_404: {
    zh: "找不到这个收集本，可能链接有误或已被删除。",
    en: "This collection can't be found — the link may be wrong or it was removed.",
  },
  inbox_error_generic: {
    zh: "载入失败，请稍后重试。",
    en: "Failed to load. Please try again later.",
  },
  inbox_home: { zh: "返回首页", en: "Back to home" },
  inbox_untitled: { zh: "收集本", en: "Collection" },
  inbox_count_prefix: { zh: "共 ", en: "Total " },
  inbox_count_suffix: { zh: " 份提交", en: " submissions" },
  inbox_empty: {
    zh: "还没有人提交。把作答链接发给来访者，提交会自动出现在这里。",
    en: "No submissions yet. Share the fill-out link — submissions will appear here automatically.",
  },
  inbox_view: { zh: "查看", en: "View" },
  inbox_card_btn: { zh: "反馈卡", en: "Card" },
  share_title_card: { zh: "给TA的个人反馈卡", en: "Personal Feedback Card" },
  share_intro_card: {
    zh: "把下面的二维码或链接发给这位家长，TA打开就是自己的个人反馈卡。数据完全包含在链接里，没有上传任何服务器。",
    en: "Send this QR code or link to the parent — it opens their personal feedback card. Data is fully contained in the link; nothing is uploaded.",
  },
  share_warning_card: {
    zh: "提示：链接包含这位家长的问卷作答与反馈内容，请只发给TA本人。",
    en: "Note: The link contains this parent's questionnaire responses and feedback. Send it only to them.",
  },
  inbox_back: { zh: "返回列表", en: "Back to list" },
  inbox_received_prefix: { zh: "提交于 ", en: "Submitted " },
  inbox_warning_badge: { zh: "⚠ 含警示", en: "⚠ has warnings" },
  inbox_decode_fail: {
    zh: "这份数据无法解析（可能版本不匹配）。",
    en: "This entry can't be parsed (possible version mismatch).",
  },
  inbox_privacy_note: {
    zh: "这些是来访者提交的作答，属敏感个人数据，保存在服务器的收集本中，仅持有本看板密钥者可见。请按机构规范妥善保管，不要转发看板链接。",
    en: "These are respondents' submitted answers — sensitive personal data stored in the server-side collection, visible only to whoever holds this inbox key. Handle per your organization's norms and don't forward the inbox link.",
  },
  survey_unanswered: { zh: "未作答", en: "Not answered" },
  // 版本更新提示条
  update_available: { zh: "问卷已更新", en: "A new version is available" },
  update_refresh: { zh: "点此刷新", en: "Refresh" },
  update_dismiss: { zh: "关闭", en: "Dismiss" },

  survey_extra_note: { zh: "补充", en: "Note" },
  survey_items_unit: { zh: "题", en: "items" },
  survey_answered_label: { zh: "已答", en: "Answered" },
  // children 复合题（可添加多个孩子：年龄 + 性别）
  children_child_prefix: { zh: "孩子 ", en: "Child " },
  children_add: { zh: "再添加一个孩子", en: "Add another child" },
  children_remove: { zh: "删除", en: "Remove" },
  children_age_placeholder: { zh: "年龄", en: "Age" },

  // ResultCard / Therapist
  rc_band_pending: { zh: "题库待核对", en: "Translation in review" },
  rc_norm_suffix: {
    zh: "（澳大利亚成人非临床常模 N=1771）",
    en: " (Australian adult non-clinical norm, N=1771)",
  },
  rc_citation: { zh: "引用：", en: "Citation: " },
  rc_cutoffs_view: {
    zh: "▸ 展开完整切点表",
    en: "▸ Show full cutoff table",
  },
  rc_cutoffs_source: { zh: "来源：", en: "Source: " },

  // AI 分析
  ai_title: { zh: "AI 深入分析", en: "AI In-depth Analysis" },
  ai_subtitle: {
    zh: "由 Claude Opus 4 综合所有维度生成的个性化解读 · 仅供参考，不构成诊断",
    en: "Personalized interpretation across all dimensions · Reference only, not diagnostic",
  },
  ai_remaining: { zh: "今日剩余次数：", en: "Today's remaining: " },
  ai_intro: {
    zh: "点下方按钮，AI 会读取你的全部维度分数 + 百分位 + 警示题，生成一份温暖且有具体可操作建议的整体画像。这一份分析仅用于本次访问的展示，不会被保存。",
    en: "Click below — the AI will read all your dimension scores, percentiles, and warning items, and generate a warm, actionable integrated picture. This analysis is only shown in this session and won't be saved.",
  },
  ai_start: { zh: "生成 AI 深入分析", en: "Generate AI Deep Analysis" },
  ai_loading: { zh: "正在请求 AI 分析…", en: "Requesting AI analysis…" },
  ai_thinking_active: { zh: "AI 正在深度思考…", en: "AI is thinking deeply…" },
  ai_thinking_view: { zh: "查看 AI 思考过程", en: "View AI reasoning" },
  ai_thinking_chars_suffix: { zh: " 字)", en: " chars)" },
  ai_thinking_chars_prefix: { zh: "(", en: "(" },
  ai_error_title: { zh: "AI 分析请求失败", en: "AI analysis request failed" },
  ai_retry: { zh: "重试", en: "Retry" },

  // ShareDialog
  share_title: { zh: "给老师看的链接", en: "Therapist Link" },
  share_intro: {
    zh: "把下面的二维码或链接交给老师，老师在浏览器打开后可以看到完整的解读视图。数据完全包含在链接里，没有上传到任何服务器。",
    en: "Share the QR code or link below with your therapist. When they open it in a browser, they'll see the full interpretation view. Data is fully contained in the link; nothing is uploaded to any server.",
  },
  share_title_host: { zh: "给主持人看的链接", en: "Host Link" },
  share_intro_host: {
    zh: "把下面的二维码或链接交给本次家庭沙龙的主持人，主持人在浏览器打开后可以看到你的全部回答。数据完全包含在链接里，没有上传到任何服务器。",
    en: "Share the QR code or link below with the family-salon host. When they open it in a browser, they'll see all your responses. Data is fully contained in the link; nothing is uploaded to any server.",
  },
  share_qr_fail: {
    zh: "内容较多，二维码无法生成。请改用下方链接复制发送。",
    en: "There's too much content to fit in a QR code. Please copy and send the link below instead.",
  },
  share_qr_loading: { zh: "正在生成二维码…", en: "Generating QR code…" },
  share_url_label: { zh: "链接", en: "Link" },
  share_copy: { zh: "复制", en: "Copy" },
  share_copied: { zh: "已复制", en: "Copied" },
  share_prompt_copy: {
    zh: "复制下面这段链接给老师：",
    en: "Copy this link for your therapist:",
  },
  share_warning: {
    zh: "提示：链接包含本次评估的全部答案，请只发给信任的疗愈师 / 心理工作者。链接较长属正常现象，二维码扫描更方便。",
    en: "Note: The link contains all your assessment answers. Only share with a trusted therapist. The length is normal — scanning the QR code is more convenient.",
  },
  share_warning_host: {
    zh: "提示：链接包含你在问卷里的全部回答，请只发给本次家庭沙龙的主持人。链接较长属正常现象；二维码能生成时扫描更方便，否则直接复制链接发送即可。",
    en: "Note: The link contains all your questionnaire responses. Only share it with your family-salon host. The length is normal — scan the QR code when it's available, otherwise just copy and send the link.",
  },
  // taker = 被邀请去「作答」的来访者/朋友（/start 页分享的是空白邀请链接，不含任何答案）
  share_title_taker: { zh: "邀请对方作答的链接", en: "Link to Invite Someone" },
  share_intro_taker: {
    zh: "把下面的二维码或链接发给你想邀请的人。对方打开后会看到同样的题目，点「开始」即可作答。这个链接只是邀请，不包含任何答案。",
    en: "Send the QR code or link below to whoever you'd like to invite. When they open it they'll see the same questions and can tap Start to begin. This link is only an invitation — it contains no answers.",
  },
  share_warning_taker: {
    zh: "提示：这个链接只是邀请对方作答，不含任何答题数据；对方的作答只保存在他们自己的设备上。链接较长属正常现象，二维码扫描更方便。",
    en: "Note: This link only invites someone to respond — it carries no answer data, and their responses stay only on their own device. The length is normal; scanning the QR code is more convenient.",
  },
  // taker_collect = 已开启回收：对方作答会上传到老师的收集本
  share_title_taker_collect: { zh: "邀请对方作答的链接", en: "Link to Invite Someone" },
  share_intro_taker_collect: {
    zh: "把下面的二维码或链接发给你想邀请的人。对方完成后，回答会自动提交给你，你可在看板里查看。",
    en: "Send the QR code or link below to whoever you'd like to invite. When they finish, their answers are submitted to you automatically and you can view them in your inbox.",
  },
  share_warning_taker_collect: {
    zh: "提示：这份链接已开启回收——对方提交的回答会上传到服务器由你查看，请在邀请时让对方知情。链接较长属正常现象，二维码扫描更方便。",
    en: "Note: This link has collection turned on — the answers people submit are uploaded to the server for you to review, so please let them know when you invite them. The length is normal; scanning the QR code is more convenient.",
  },

  // ClinicalFlag
  cf_eyebrow: { zh: "综合建议", en: "Integrated Recommendation" },
  cf_level_urgent: { zh: "紧急", en: "Urgent" },
  cf_level_strong: {
    zh: "强烈建议专业评估",
    en: "Professional Assessment Strongly Advised",
  },
  cf_level_consult: { zh: "建议心理咨询", en: "Counseling Recommended" },
  cf_level_self_help: {
    zh: "自助 / 常规范围",
    en: "Self-help / Normal Range",
  },
  cf_signals_count_suffix: { zh: " 个相关信号", en: " signals" },
  cf_signals_header: { zh: "触发的信号", en: "Triggering Signals" },
  cf_rec_header: { zh: "建议行动", en: "Suggested Actions" },
  cf_warn_badge: { zh: "警示", en: "WARN" },
  cf_footer: {
    zh: "本评估仅供自我了解和与专业人员沟通的参考，不构成临床诊断。如果出现持续的低落、强烈的无望感或自伤想法，请尽快联系专业精神科 / 心理科。",
    en: "This assessment is for self-understanding and professional communication only, not a clinical diagnosis. If you experience persistent low mood, strong hopelessness, or self-harm thoughts, please contact a psychiatry / psychology service as soon as possible.",
  },
} as const;

export type UIKey = keyof typeof UI;

export function t(key: UIKey, lang: Lang): string {
  return UI[key][lang];
}

/** 在组件里使用：const t = useT(); <h1>{t("home_title")}</h1> */
export function useT() {
  const { lang } = useLang();
  return (key: UIKey) => UI[key][lang];
}
