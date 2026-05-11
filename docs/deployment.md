# 部署到 ai1017.com 子域名

推荐方案：**Cloudflare Pages**（免费、CDN 自动、和域名同账号无需手动配 DNS）

替代方案：Vercel（也很好用，UI 更友好；DNS 需手动配 CNAME）

---

## 方案 A：Cloudflare Pages（推荐）

### 前提

- `ai1017.com` 已经在 Cloudflare 管理（即 Cloudflare 是该域名的 DNS / 注册商）
- 项目代码已经 push 到 `git@github.com:Weichao1017/Mental-Measurement.git`

### 步骤

#### 1. 在 GitHub 推送代码

```bash
cd Mental-Measurement
git init
git add .
git commit -m "Initial commit: scaffold with DASS-21 + WHO-5 verified"
git branch -M main
git remote add origin git@github.com:Weichao1017/Mental-Measurement.git
git push -u origin main
```

#### 2. 在 Cloudflare Pages 创建项目

1. 登录 https://dash.cloudflare.com
2. 左侧菜单选 **Workers & Pages**
3. **Create application** → **Pages** tab → **Connect to Git**
4. 授权 GitHub，选 `Weichao1017/Mental-Measurement` 仓库

#### 3. 配置构建设置

| 字段 | 值 |
|---|---|
| **Project name** | `mental-measurement`（这决定临时域名 `mental-measurement.pages.dev`）|
| **Production branch** | `main` |
| **Framework preset** | `Next.js (Static HTML Export)` |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| **Root directory** | `/` |
| **Environment variables** | 暂无 |

Node 版本：在 **Settings → Environment variables** 加一个变量 `NODE_VERSION` = `20` 或 `22`（Next.js 15 要求 Node ≥ 18.18）

点 **Save and Deploy**

#### 4. 等待第一次构建完成

通常 2-3 分钟。完成后会得到一个临时域名 `mental-measurement.pages.dev`，先打开它验证页面正常。

#### 5. 配置自定义子域名

1. 进入项目 → **Custom domains** tab
2. **Set up a custom domain**
3. 输入 `assessment.ai1017.com`（或你想要的子域名，比如 `test.ai1017.com` / `eval.ai1017.com`）
4. Cloudflare 检测到 `ai1017.com` 已在你的账号下，会自动询问是否帮你添加 DNS 记录
5. 点确认，DNS 记录会自动配好（CNAME → Cloudflare Pages）
6. 等 30 秒，访问 https://assessment.ai1017.com 验证

SSL 证书 Cloudflare 自动颁发，无需手动配置。

#### 6. 每次推送自动部署

之后每次 `git push origin main`，Cloudflare 自动构建并部署到生产环境。
Pull Request 会得到独立的预览域名 `<pr-id>.mental-measurement.pages.dev`，方便测试。

---

## 方案 B：Vercel

### 步骤

1. 登录 https://vercel.com
2. **New Project** → 连接 GitHub → 选 `Weichao1017/Mental-Measurement`
3. Framework preset 应该自动识别为 Next.js
4. Build command: `npm run build`，Output: 系统自动识别（因为是 export 模式）
5. **Deploy**
6. 部署完成后 → **Settings → Domains** → 添加 `assessment.ai1017.com`
7. Vercel 会显示 DNS 配置要求，类似：

   ```
   Type: CNAME
   Name: assessment
   Value: cname.vercel-dns.com
   ```

8. 到你的域名 DNS 管理（Cloudflare）添加上述 CNAME 记录
9. **重要**：如果 ai1017.com 在 Cloudflare，CNAME 记录必须**关闭 Cloudflare 代理（小云朵改成灰色）**，否则 Vercel 验证不过

---

## 建议的子域名选项

| 子域名 | 风格 | 建议场景 |
|---|---|---|
| `assessment.ai1017.com` | 正式、专业 | 入组评估正式入口 |
| `test.ai1017.com` | 通用、简短 | 测评中心通用入口 |
| `eval.ai1017.com` | 中性 | 给老师用的内部地址 |
| `heal.ai1017.com` | 品牌感 | 偏疗愈调性 |
| `me.ai1017.com` | 个性 | 客户视角，"了解我自己" |

我个人推荐 `assessment.ai1017.com`，专业感最强；如果想做小红书引流，再加一个 `m.ai1017.com` 子站做轻量入口。

---

## 部署后的检查清单

- [ ] 落地页能正常打开
- [ ] /intake 能勾选主诉
- [ ] /assessment/dass21 能进入并答题
- [ ] 完成一遍 DASS-21 + WHO-5 + FFMQ-15 + SCS-SF 全流程
- [ ] /results 能正确显示分数
- [ ] DASS-21 第 21 题选 2 能触发警示
- [ ] 移动端（小红书 webview）渲染正常
- [ ] HTTPS 证书有效
- [ ] /404 友好提示（Next.js 默认就有）

---

## 后续

如果后面要加后端（用户账号、画像简报存档），有两条路：

### 路径 1：保持 Cloudflare 生态
- API：Cloudflare Workers（同账号、低延迟、按请求计费）
- 数据库：Cloudflare D1（SQLite）或 Supabase 外接

### 路径 2：切到 Next.js SSR
- 把 `next.config.mjs` 里的 `output: "export"` 删掉
- 部署改用 Vercel（对 Next.js 全功能支持最好）
- 数据库：Supabase / Neon Postgres
- 认证：Supabase Auth / Clerk

短期 MVP 阶段方案 1 性价比更高。
