# AGENTS.md — homepage（个人主页 + 博客前台）

> 本文件是本仓库的维护约定。**改代码前先读这里**；README.md 是面向用户的介绍，本文件与 README 冲突时以本文件为准。

## 这个项目是什么

`zhangyunling.cn` 主站前端：个人主页 + 博客前台（文章列表 / 详情 / 合集 / 搜索）+ 代码高亮，并在 `/admin/` 挂载管理后台入口。

- 纯静态 SPA，**无 Node 进程**：构建产物直接由 nginx 托管。
- 数据全部来自 `blog-server`（`:4000`，仓库 `../blog`），前端不直连数据库。
- 管理后台前端**不在本仓库**，在 `../admin-web`（构建到 `/var/www/admin`）。

## 技术栈

| 项 | 值 |
|---|---|
| 框架 | React 18 + Vite 5 + react-router-dom 7 |
| 样式 | 手写 CSS（`src/index.css`），**无 UI 库、无 Tailwind、无 CSS-in-JS** |
| Markdown | `marked` + `dompurify`（必须经 DOMPurify 消毒后再 `dangerouslySetInnerHTML`） |
| 高亮 | `highlight.js` + `highlightjs-line-numbers.js`（npm 包，主题 CSS 在 `public/hljs/`） |
| 字体 | 自托管 `public/fonts/`：Inter Tight / Inter / JetBrains Mono（latin 子集） |
| 运行时 | Node 24 / npm 11（服务器 nvm v24.19.0） |

## 目录结构

```
src/
├── main.jsx / App.jsx     # 入口 + 路由 + Layout（顶栏、抽屉目录、页脚）
├── api.js                 # 全部接口封装，API_BASE = '/api/blog'
├── theme.js               # 深浅色：localStorage('site_theme') ∈ auto|light|dark，写 <html data-theme>
├── utils.js               # formatDate 等纯函数
├── index.css              # 设计令牌 + 全站样式（唯一 CSS 文件）
├── hooks/useAsync.js      # 异步加载 hook
├── components/States.jsx  # 加载中 / 空 / 错误态
└── pages/
    ├── Home.jsx           # /
    ├── BlogList.jsx       # /blog
    ├── BlogPost.jsx       # /blog/:slug（详情渲染主文件）
    ├── Collections.jsx    # /blog/collections
    └── CollectionDetail.jsx
public/                    # fonts/、hljs/、favicon 等原样拷贝资源
```

## 路由

| 路径 | 组件 |
|---|---|
| `/` | Home |
| `/blog` | BlogList |
| `/blog/:slug` | BlogPost — 参数名仍是 `slug`，但**现在承载雪花 ID（`public_id`）**，无 `public_id` 的老文章才回退 slug |
| `/blog/collections` | Collections |
| `/blog/collections/:slug` | CollectionDetail |

详情页支持草稿预览：URL 带 `?preview=<短时效令牌>` 时服务端放行未发布文章（见 `api.js#fetchPost`）。

## 命令

```bash
npm install
npm run dev      # Vite dev server（本地需要 blog-server :4000 在跑，dev 走相对 /api 需自行代理）
npm run build    # 输出到 /var/www/homepage（vite.config.js 写死 outDir + emptyOutDir）
npm run preview
```

> **构建即部署**：`outDir` 指向 `/var/www/homepage`，`npm run build` 会先清空该目录。构建后无需重启任何进程。

## 部署

- nginx：`server_name zhangyunling.cn www.zhangyunling.cn`，`root /var/www/homepage`（配置 `/etc/nginx/conf.d/homepage.conf`）。
- 同域 API 反代（nginx 层）：`/api/blog/*` → `127.0.0.1:4000`、`/api/admin/*` → `127.0.0.1:3100`、`/api/blog/admin/*` 走 SSO 探针。
- `yling.site`（含 `www`）是镜像域名，配置在 `/etc/nginx/conf.d/yingsite.conf` 与 `yling-sub.conf`。**改 nginx 时两个域名体系要同步对齐**，否则会出现「镜像站行为和主站不一样」。
- 前端无 systemd 单元。

## 设计系统（硬性，与 admin-web / quotahub / v2link 同一套）

```css
--bg #f7f6f3  --surface #fbfaf8  --fg #171512  --muted #6f6a63  --faint #9b958d
--line rgba(23,21,18,.16)  --accent #a05b0c  --accent-ink #7c4508
/* 深色（prefers-color-scheme + [data-theme] 手动覆盖）*/
--bg #13110f  --surface #191715  --fg #efeae3  --accent #c77c1f
--ease cubic-bezier(.23,1,.32,1)  --maxw 1120px
```

- Swiss 国际主义：8pt 网格、发丝线分隔（**不用阴影卡片**）、直角（radius 0）、中性色 ~90%、琥珀只做点缀。
- 动效一条缓动曲线，hover ≤150ms，仅抽屉可以更长。
- 字体分工：Inter Tight（标题）/ Inter（正文）/ JetBrains Mono（标签、数字，常配合大写小字号）。

## 文案与内容红线

以下内容**不要"顺手优化"**，改了会被打回：

- Hero 名言必须保留原句：**「立志欲坚不欲锐，成功在久不在速。—— 张孝祥」**。
- 左上角品牌是**纯几何菱形标记**，不放名字文字。
- 中文页面展示名一律 **Linden Zhang**，不用中文名。
- 文案唯美克制：**禁 emoji、禁鸡汤 / AI 腔、禁网络热词**。UI 上不要写技术说明性文案。

## 移动端

- 窄屏**绝不隐藏导航**：用右侧滑出抽屉（顶部「目录」按钮触发），不要放到正文开头。
- TOC 锚点用纯序号 `sec-N`，**不要用标题 slug**（中文编码会乱、改标题即失效）。

## 安全约定

- 私有地址（认证中心域名、`monitor.` 子域、服务器公网 IP）**一律不得硬编码**；需要时走构建时 `import.meta.env.VITE_*` 注入，仓库只提交 `.env.example`，真实 `.env` 由 `.gitignore` 拦截。本仓库目前**不持有任何环境变量**；`/admin/` 入口是相对路径跳转。
- 渲染任何来自接口的 Markdown/HTML 前必须经 DOMPurify。

## 已知坑

- 构建产物在 `/var/www/homepage`，**仓库内没有 `dist/`**，别去仓库里找构建结果。
- `blog/web`、`blog/admin`（在 `../blog`）是**已停用的旧前端**，真正的博客前台就是本仓库、后台是 `../admin-web`，不要去改旧目录。
- 改 `index.css` 里的设计令牌会同时影响全站，改前确认深浅色两套值都同步。
