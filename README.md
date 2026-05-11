# Mental-Measurement · 疗愈机构客户心理评估平台

一份给疗愈 / 正念课程客户做的多维度心理状态自评，集成了 8 个国际公开发表的标准化心理量表，移动端优先、单题单屏的交互体验。

## 已集成量表

### 核心套装（所有客户必填，约 8–10 分钟）

| 量表 | 题数 | 评估 | 验证状态 |
|---|---|---|---|
| **DASS-21** | 21 | 抑郁 / 焦虑 / 压力三维度症状 | ✅ 已用 UNSW 官方简体版核对 |
| **WHO-5** | 5 | 主观幸福感（前测/后测核心指标） | ✅ 已用 WHO 官方简体版核对 |
| **FFMQ-15** | 15 | 五因素正念能力 | 🟡 AI 翻译，待与权威中文版对齐 |
| **SCS-SF** | 12 | 自我关怀（6 维度） | 🟡 AI 翻译，待与权威中文版对齐 |

### 可选模块（按主诉触发）

| 量表 | 题数 | 评估 | 触发条件 | 验证状态 |
|---|---|---|---|---|
| **MAIA-2** | 37 | 内感受 / 身体觉察（8 维度） | "和身体断联" | 🟡 AI 翻译 |
| **DERS-SF** | 18 | 情绪调节困难（6 维度） | "情绪上头" | 🟡 AI 翻译 |
| **PSQI** | 19 | 过去一个月睡眠质量 | "睡眠不好" | 🔵 暂未实现（需专用 UI，触发后显示跳过页） |
| **ECR-12** | 12 | 依恋焦虑 / 回避 | "亲密关系反复出问题" | 🟡 AI 翻译 |

> 🟡 = 题目内容由 AI 从英文原版翻译，结构（维度、反向题、计分规则）已按权威源设置；
> UI 会显示"题库待核对"提示。**正式上线给真实客户前**，建议参考 `docs/scales-sources.md` 列出的中文修订论文做权威对齐。

## Therapist 视图（分享给老师）

客户在 `/results` 页可以一键生成给疗愈师/心理咨询师看的链接 + 二维码：
- **零后端**：测评数据完整编码在 URL hash 里，不上传到任何服务器
- **老师视角**：跟客户视角并列存在但更详细——逐题答案明细、反向题标识、警示题置顶、teacherNote 解读
- **隐私优先**：URL 的 `#` 之后内容浏览器永远不发送到服务器，扫码或开链接即可看到
- **路由**：`/therapist/#d=<base64url 数据>`

## 技术栈

- **Next.js 15** （App Router + 静态导出 `output: "export"`）
- **TypeScript 5**
- **Tailwind CSS v3**
- **React 18**
- 零后端 MVP：作答状态存在 `localStorage`
- 静态部署适合 **Cloudflare Pages / Vercel** 等任何静态托管

## 项目结构

```
src/
├── app/
│   ├── layout.tsx                  根布局
│   ├── globals.css                 Tailwind + 主题
│   ├── page.tsx                    落地页
│   ├── intake/page.tsx             主诉勾选页（决定可选模块）
│   ├── assessment/[scaleId]/page.tsx  动态量表运行页
│   └── results/page.tsx            结果汇总页
├── components/
│   ├── Container.tsx
│   ├── ProgressBar.tsx
│   ├── LikertItem.tsx
│   ├── ScaleRunner.tsx
│   └── ResultCard.tsx
└── lib/
    ├── types.ts                    类型定义
    ├── scoring.ts                  通用计分逻辑（sum / ×2 / ×4 / mean）
    ├── store.ts                    localStorage 会话管理
    └── scales/
        ├── index.ts                量表注册中心 + 主诉路由
        ├── dass21.ts               ✅ 已核对（UNSW 官方简体版）
        ├── who5.ts                 ✅ 已核对（WHO 官方简体版）
        ├── ffmq15.ts               🟡 AI 翻译
        ├── scs-sf.ts               🟡 AI 翻译
        ├── maia2.ts                🟡 AI 翻译
        ├── ders-sf.ts              🟡 AI 翻译（已修正 CLA reverse 标识）
        ├── ecr12.ts                🟡 AI 翻译（AVO 3 题反向）
        └── psqi.ts                 🔵 stub（需专用 UI）

tests/
└── scoring.test.ts                 计分单元测试（含 DASS-21、WHO-5、反向题逻辑）

docs/
├── scales-sources.md               每个量表的权威来源 + Claude Code 接力清单
├── deployment.md                   部署到 ai1017.com 子域名的详细步骤
└── DASS-21-mapping.md              DASS-21 题目映射的审计文档
```

## 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev
# → http://localhost:3000

# 跑计分单元测试
npm run test:scoring

# TypeScript 类型检查
npm run typecheck

# 构建静态站点
npm run build
# → 输出到 out/ 目录

# 本地预览构建产物
npx serve out/
```

## 部署到 ai1017.com 子域名

详见 `docs/deployment.md`。简要说：

1. 把项目 push 到 `git@github.com:Weichao1017/Mental-Measurement.git`
2. 在 Cloudflare Pages 或 Vercel 新建项目，连接 GitHub 仓库
3. 构建命令 `npm run build`，输出目录 `out`
4. 在域名 DNS（Cloudflare 控制台）添加 CNAME 记录：
   `assessment.ai1017.com` → 部署平台分配的目标
5. 部署平台 Custom Domain 配置 `assessment.ai1017.com`

## 关键设计决策

### 1. DASS-21 的题目映射经过严格核验

简体中文版 DASS-21 在中文心理学界有多个流通版本（龚栩 2010、Taouk UNSW 官方版等）。本项目使用 **UNSW 官方简体中文 DASS-42（Taouk, Lovibond & Laube, 2001）** 按 Lovibond 标准映射抽取的 21 题。

**两处容易踩坑的"双胞胎题"** 已经特别处理：
- DASS-21 #13 → DASS-42 **#26**（消沉和沮丧），不是 #13（伤心和郁闷）
- DASS-21 #18 → DASS-42 **#18**（极容易因为小事而生气），不是 #27（容易烦躁）

详细映射审计见 `docs/DASS-21-mapping.md`。

### 2. 待核对题目的占位策略

对于尚未从权威源核对的量表（FFMQ-15、SCS-SF 等），数据文件**绝不凭记忆填入中文题目**。占位符格式：
```
[TBD-VERIFY] FFMQ-15 第 N 题（对应 FFMQ-39 #M，facet=AWA，反向）
```
- 维度归属、反向计分、对应 DASS-42 题号等结构信息**已经预填**
- 中文措辞由 Claude Code 接力时从权威源抄入
- 量表数据文件头部包含完整的来源引用 + 接力任务清单

### 3. 警示题（自杀意念）单独处理

DASS-21 第 21 题（"我曾感到生活没有意义"）被打了 `suicidal_ideation` flag。**只要用户在该题选 2 或 3，前端立即显示心理援助提示**——不论总分多少。

`LikertItem` 组件检测到 `flagWarning && value >= 2` 时实时显示。结果页也会汇总所有警示并在顶部独立展示求助资源。

### 4. 主诉驱动的模块化测评

`/intake` 页面让用户勾选最相关的困扰（多选或不选都行），系统据此决定要不要追加 MAIA-2 / DERS-SF / PSQI / ECR-12。核心四量表所有人都做。

### 5. 前测 / 后测一致性

WHO-5、FFMQ-15、DASS-21 都是国际公认的"对正念干预敏感"的量表，**适合做课程前测和课程后测对比**。结果页留出了未来加入"对比上次结果"的接口。

## 引用与合规

每个量表数据文件头部都包含完整的引用信息和原作者授权说明。所有量表均为公共领域或允许研究使用。
落地页和结果页都包含免责声明：本评估不构成临床诊断；高分人群会自动看到心理援助热线。

## 接力给 Claude Code

详见 `HANDOFF.md`。

---

**License**：本项目代码使用 MIT License；各量表的版权归原作者所有，本项目仅为合规使用。
