# 接力给 Claude Code 的工作清单

> 这份文档列出 Cowork 模式下未能完成、需要 Claude Code 接力的事项。按优先级排序。

## P0：核心量表题目核对（必做）

以下 6 个量表的数据文件已经把维度结构、反向题位置、计分规则全部建好，**只欠中文题目内容**。每个文件头部都注明了权威来源和具体的核对步骤。

| 量表 | 文件 | 来源论文 | 估计工作量 |
|---|---|---|---|
| FFMQ-15 | `src/lib/scales/ffmq15.ts` | Gu et al. (2016) + Deng et al. (2011) 中文版 | ~30 min |
| SCS-SF | `src/lib/scales/scs-sf.ts` | Raes et al. (2011) + Chen et al. (2011) 中文版 | ~20 min |
| MAIA-2 | `src/lib/scales/maia2.ts` | Mehling et al. (2018) PLoS ONE | ~60 min |
| DERS-SF | `src/lib/scales/ders-sf.ts` | Kaufman et al. (2016) + 李英华 (2014) | ~30 min |
| PSQI | `src/lib/scales/psqi.ts` | 刘贤臣 et al. (1996) | ~90 min（含 UI） |
| ECR-12 | `src/lib/scales/ecr12.ts` | Wei et al. (2007) + 李同归 (2006) | ~30 min |

操作模式：

1. 打开对应 `.ts` 文件
2. 阅读文件头部注释里的"Claude Code 接力任务"清单
3. 拿到权威源论文 / 中文版论文
4. 把 `items` 数组里的 `[TBD-VERIFY] ...` 占位文本逐个替换为真实中文题目
5. 核对每个 item 的 `reverse: true/false` 与原论文一致
6. 把文件顶部 `fullyVerified: false` 改为 `true`
7. 跑 `npm run test:scoring` 确保单元测试仍然通过

⚠️ **关于 PSQI 的特殊说明**：
PSQI 不是单纯的 Likert 量表，包含时长输入（"通常几点上床？"）、单选频率（"过去一月内你不能在 30 分钟内入睡的频率"）、自由文本等多种题型。**需要额外开发**：
- PSQI 专用作答 UI 组件（含时间选择器、频率单选）
- PSQI 专用计分算法（7 个 component 各自加权 → 总分 0–21）
- 在 `src/lib/scoring.ts` 里加 `scorePSQI(scale, response)` 分支

## P0：DASS-21 题目最后再核一遍

虽然 Cowork 阶段已经做了两轮自查和一次订正，但因为这是给真实客户用的，**Claude Code 上线前请最后做一次核对**：

1. 打开 `docs/DASS-21-mapping.md`
2. 把 `src/lib/scales/dass21.ts` 里 21 题的中文措辞、source-ref、维度、反向（DASS-21 全部不反向）逐字核对
3. 特别关注两处订正点：
   - 第 13 题 → DASS-42 #26 "我感到消沉和沮丧"（不是 #13）
   - 第 18 题 → DASS-42 #18 "我感到我曾极容易因为小事而生气"（不是 #27）
4. 跑 `npm run test:scoring` 通过

## P1：git push 到 GitHub

```bash
cd "Mental-Measurement"
git init
git add .
git commit -m "Initial scaffold: 8 scales, DASS-21 + WHO-5 fully verified, others stubbed"
git branch -M main
git remote add origin git@github.com:Weichao1017/Mental-Measurement.git
git push -u origin main
```

## P1：部署到 ai1017.com 子域名

详见 `docs/deployment.md`。推荐用 **Cloudflare Pages**：

1. Cloudflare → Pages → Create project → Connect to Git
2. 选 `Weichao1017/Mental-Measurement` 仓库
3. Build settings：
   - Build command: `npm run build`
   - Build output directory: `out`
   - Root directory: `/`
   - Environment variables: 无
4. 部署成功后会得到 `<random>.pages.dev` 临时域名
5. Custom domains → Set up a custom domain → 输入 `assessment.ai1017.com`
6. Cloudflare 会自动配置 DNS 记录（如果 ai1017.com 也在同一个 Cloudflare 账号下）。否则需手动加 CNAME。
7. 验证 https://assessment.ai1017.com 能打开

## P2：增强 UX / 文案

完成 P0 + P1 之后建议做的优化：

- [ ] **登录态 / 邮箱收集**：目前 MVP 是匿名 + localStorage，客户重新打开浏览器结果就丢。加一个简单的邮箱收集（在落地页或结果页），把结果 base64 / JSON 发到用户邮箱，并存到机构后台
- [ ] **给老师的画像简报页**：`/therapist/<token>` 路由，展示客户结果 + 解读 + 课程建议
- [ ] **前测 / 后测对比视图**：同一个客户多次测评后能看到趋势
- [ ] **结果页 PDF 导出**：让客户能下载一份自己的结果
- [ ] **动效优化**：每题之间加柔和的进出动画（Framer Motion）
- [ ] **暗黑模式适配**

## P2：合规与法律

- [ ] 在落地页加正式的"用户协议"和"隐私政策"链接
- [ ] 数据收集了用户回答，符合个人信息保护法（PIPL）要求——明示告知 + 同意
- [ ] 评估结果属于个人健康信息，存储/传输需加密
- [ ] 若机构后续把数据用于群体分析，需脱敏 + 二次告知

## P2：考虑的后端方向

如果将来要做完整的客户管理系统：

- **数据库**：Postgres（Supabase / Neon）
- **后端**：Next.js API Routes（同 monorepo）或 Cloudflare Workers
- **认证**：Supabase Auth 或 Clerk
- **画像简报存档**：测评完成后生成结构化 JSON，老师后台访问
- **数据导出**：CSV / JSON 导出供机构内部分析

## 自查回顾（Cowork 已做）

- ✅ DASS-21 题目核验：英文母版反向回译，订正了两处常见错位
- ✅ DASS-21 + WHO-5 + SCS-SF 反向题逻辑的单元测试
- ✅ 警示题（DASS-21 #21）触发逻辑测试
- ✅ 量表数据文件结构与计分规则一致性
- ✅ 主诉 → 可选模块的路由逻辑
- ✅ 静态导出 (output: "export") 配置正确，动态路由有 generateStaticParams
- ✅ UX 按 SBTI 真实样式做成"单页滚动 + sticky 进度条 + 维度已隐藏徽章"
- ✅ 自动滚动只在首次答题时触发，回头修改不打扰
- ✅ PSQI 这类需专用 UI 的量表，给 SkipScalePlaceholder 让用户能跳过继续
- ⚠️ npm install 在 Cowork 沙盒里因 FUSE 文件系统问题没能完成
  本地一定能装好；Claude Code 接力第一步就是 `npm install && npm run typecheck && npm run test:scoring && npm run build`

## Claude Code 上手第一步（务必先跑通）

```bash
cd "Mental-Measurement"
# 沙盒里没装完，本地从零装
rm -rf node_modules package-lock.json
npm install

# 跑类型检查（最快验证整个项目能编译）
npm run typecheck

# 跑计分单元测试（验证 DASS-21、WHO-5、反向题逻辑）
npm run test:scoring
# 期望输出：通过 17 项 / 失败 0 项

# 跑构建（生成 out/ 静态站点）
npm run build

# 本地预览
npx serve out/
```

如果 `npm run typecheck` 报错，先按报错信息定位文件再问我；多半是 Next.js 15 / Tailwind 版本飘移。

## 已知限制 / 后续注意

1. `output: "export"` 模式下不支持服务端 features（API Routes、Server Actions、ISR）。如果之后加后端要切回默认 SSR 模式或使用 Next.js 的 `output: "standalone"`
2. localStorage 在隐私模式 / 跨设备 / 跨浏览器是不持久的，作为 MVP 可以接受但产品化必须加后端
3. 当前没有做国际化（只支持简体中文）。若要加英文版需要把所有 UI 文本和量表题目都抽取到 i18n 文件
4. PSQI 是这个项目里唯一不属于"纯 Likert"的量表，处理它的工作量比其他大
