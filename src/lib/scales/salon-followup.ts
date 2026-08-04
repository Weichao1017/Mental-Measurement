/**
 * 家庭沙龙 · 下一场 & 这次反馈（沙龙后脉冲问卷）
 *
 * 性质：纯收集型问卷（isSurvey），无计分/分级/临床判定；回答经收集本上传给主持人。
 * 核心：收集「下一场想要什么」的需求（形式 / 主题 / 时间 / 频次）；附带这次沙龙的反馈。
 * 语言：仅中文（不设 *En；pick() 无 en 时回退中文，切 EN 也正常）。
 *
 * 铁律：id/slug 固定为 "salon-followup"，永不更改——填答二维码与收集者看板链接
 *       靠它保持永久有效。日后要调内容只用 hidden + 位置安全（绝不删题/改题号/改题型）。
 */

import type { Scale } from "../types";

export const salonFollowup: Scale = {
  id: "salon-followup",
  slug: "salon-followup",
  name: "家庭沙龙 · 回访反馈",
  description:
    "沙龙后的小回访：这次的感受，以及你想要的下一场——什么形式、聊什么、什么时间。",
  timeFrame: "凭你此刻的真实想法",
  estimatedMinutes: 3,
  isCore: false,
  category: "salon",
  isSurvey: true,
  highIsBetter: false,
  excludeFromClinicalFlag: true,
  instructions:
    "谢谢你来这次家庭沙龙 🌱 这份小问卷 2-3 分钟，帮我们把下一场办得更合你的心意，也听听你这次的感受。只有主持人看得到，想到什么写什么就好。",
  options: [], // 各题自带选项 / 输入类型
  items: [
    // ============ 这次沙龙的感受 ============
    {
      index: 1,
      text: "这次家庭沙龙，整体你会打几分？",
      dimension: "Q",
      widget: "slider",
      section: { title: "这次沙龙的感受" },
      options: [
        { value: 1, label: "1", short: "毫无收获" },
        { value: 2, label: "2" },
        { value: 3, label: "3" },
        { value: 4, label: "4" },
        { value: 5, label: "5" },
        { value: 6, label: "6" },
        { value: 7, label: "7" },
        { value: 8, label: "8" },
        { value: 9, label: "9" },
        { value: 10, label: "10", short: "很有收获" },
      ],
    },
    {
      index: 2,
      text: "哪部分对你最有帮助？（可多选）",
      dimension: "Q",
      inputType: "multi",
      freeTextLabel: "还有别的？写一笔：",
      options: [
        { value: 1, label: "现场爸爸真实案例讨论" },
        { value: 2, label: "亲子沟通的练习 / 示范" },
        { value: 3, label: "听其他家长分享" },
        { value: 4, label: "主持人的点评和引导" },
        { value: 5, label: "认识到同路的家长" },
        { value: 6, label: "都挺有帮助的" },
      ],
    },
    {
      index: 3,
      text: "有没有哪个瞬间印象最深，或者想对主持人说的一句话？（选填）",
      dimension: "Q",
      inputType: "text",
      multiline: true,
      optional: true,
      placeholder: "想到什么写什么",
    },
    // ============ 下一场，你想要什么 ============
    {
      index: 4,
      text: "接下来你更想参加哪种形式的活动？（可多选）",
      dimension: "Q",
      inputType: "multi",
      freeTextLabel: "其他形式：",
      section: {
        title: "下一场，你想要什么",
        note: "这部分最关键——你的选择直接决定我们下一场怎么办。",
      },
      options: [
        { value: 1, label: "线下面对面沙龙" },
        { value: 2, label: "线上直播讲座" },
        { value: 3, label: "线上小组（视频围坐，人少）" },
        { value: 4, label: "亲子一起参与的工作坊" },
        { value: 5, label: "一对一咨询 / 深聊" },
        { value: 6, label: "家长读书会 / 共学" },
      ],
    },
    {
      index: 5,
      text: "如果办下一场，你最想聊哪个主题？（可多选，选最想要的几个就好）",
      dimension: "Q",
      inputType: "multi",
      freeTextLabel: "还想聊的：",
      options: [
        { value: 1, label: "和青春期孩子怎么沟通" },
        { value: 2, label: "孩子的情绪与压力" },
        { value: 3, label: "性倾向 / 性别身份的家庭对话" },
        { value: 4, label: "学业、手机与边界" },
        { value: 5, label: "冲突当下，怎么接住那句话" },
        { value: 6, label: "照顾好自己（家长的情绪与消耗）" },
        { value: 7, label: "夫妻 / 共同养育怎么配合" },
      ],
    },
    {
      index: 6,
      text: "什么时间你更方便参加？",
      dimension: "Q",
      widget: "buttons",
      options: [
        { value: 1, label: "工作日晚上" },
        { value: 2, label: "周六" },
        { value: 3, label: "周日" },
        { value: 4, label: "都可以" },
        { value: 5, label: "看主题再定" },
      ],
    },
    {
      index: 7,
      text: "你希望这样的活动多久一次？（选填）",
      dimension: "Q",
      optional: true,
      widget: "buttons",
      options: [
        { value: 1, label: "每两周一次" },
        { value: 2, label: "每月一次" },
        { value: 3, label: "每季度一次" },
        { value: 4, label: "有就参加，不强求" },
      ],
    },
    // ============ 想被跟进的话（选填） ============
    {
      index: 8,
      text: "如果你希望我们根据你的反馈做一对一跟进，可以留下微信名",
      dimension: "Q",
      inputType: "text",
      optional: true,
      placeholder: "选填，昵称即可",
      section: { title: "想被跟进的话（选填）" },
    },
  ],
  dimensions: [],
  scoringMethod: "custom",
  severityBands: {},
  citation: "家庭沙龙后续需求 & 反馈问卷（主办方内部使用）",
  fullyVerified: true,
  notes: "本问卷不打分，回答仅用于策划下一场活动。",
};
