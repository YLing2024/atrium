# AGENTS.md — homepage（个人主页 + 博客前台）

> 本文件是本仓库的维护约定。**改代码前先读这里**；README.md 是面向用户的介绍，本文件与 README 冲突时以本文件为准。

## 这个项目是什么

个人主页 + 博客前台的静态站点（文章列表 / 详情 / 合集 / 搜索 + 代码高亮），并在 `/admin/` 挂载管理后台入口。**真实域名不写进仓库**。

- 纯静态 SPA，**无 Node 进程**：构建产物直接由 nginx 托管。
- 数据全部来自博客后端（`:4000`，仓库 `atrium-blog`），前端不直连数据库。
- 管理后台前端**不在本仓库**，在 `atrium-console`（构建到 `/var/www/admin`）。

## 技术栈

| 项 | 值 |
|---|---|
| 框架 | React 18 + Vite 5 + react-router-dom 7 + TypeScript（`strict`，校验用 `npm run typecheck`） |
| 样式 | 朴素 CSS（`src/index.css`，≤60 行，仅保留最低限度规则），**无 UI 库、无 Tailwind、无 CSS-in-JS** |
| Markdown | `marked` + `dompurify`（必须经 DOMPurify 消毒后再 `dangerouslySetInnerHTML`） |
| 高亮 | `highlight.js` + `highlightjs-line-numbers.js`（npm 包，主题 CSS 在 `public/hljs/`） |
| 字体 | 系统默认（不再自托管，`src/index.css` 不写 `font-family`） |
| 运行时 | Node 24 / npm 11（服务器 nvm v24.19.0） |

## 目录结构

```
src/
├── main.tsx / App.tsx     # 入口 + 路由 + Layout（顶栏、页脚）
├── api.ts                 # 全部接口封装，API_BASE = '/api/blog'
├── theme.ts               # 深浅色：localStorage('site_theme') ∈ auto|light|dark，写 <html data-theme>
├── utils.ts               # formatDate 等纯函数
├── index.css              # 朴素样式（唯一 CSS 文件，仅保留最低限度规则）
├── hooks/useAsync.ts      # 异步加载 hook
├── components/States.tsx  # 加载中 / 空 / 错误态
└── pages/
    ├── Home.tsx           # /
    ├── BlogList.tsx       # /blog
    ├── BlogPost.tsx       # /blog/:slug（详情渲染主文件）
    ├── Collections.tsx    # /blog/collections
    └── CollectionDetail.tsx
public/                    # hljs/、icons/、favicon 等原样拷贝资源
```

## 路由

| 路径 | 组件 |
|---|---|
| `/` | Home |
| `/blog` | BlogList |
| `/blog/:slug` | BlogPost — 参数名仍是 `slug`，但**现在承载雪花 ID（`public_id`）**，无 `public_id` 的老文章才回退 slug |
| `/blog/collections` | Collections |
| `/blog/collections/:slug` | CollectionDetail |

详情页支持草稿预览：URL 带 `?preview=<短时效令牌>` 时服务端放行未发布文章（见 `api.ts#fetchPost`）。

## 命令

```bash
npm install
npm run dev      # Vite dev server（本地需要 blog-server :4000 在跑，dev 走相对 /api 需自行代理）
npm run build    # 输出到 /var/www/homepage（vite.config.ts 写死 outDir + emptyOutDir）
npm run preview
```

> **构建即部署**：`outDir` 指向 `/var/www/homepage`，`npm run build` 会先清空该目录。构建后无需重启任何进程。

## 部署

- nginx：站点 `root /var/www/homepage`，配置在 `/etc/nginx/conf.d/` 下（`server_name` 由部署决定，不写进仓库）。
- 同域 API 反代（nginx 层）：`/api/blog/*` 公开读 → `127.0.0.1:4000`；`/api/blog/admin/*` 与 `/api/admin/*` 交给 Auth Gateway（`127.0.0.1:18920`）鉴权后反代（管理员接口由网关注入 `X-Auth-User`）。配置里**不再有** `auth_request` / SSO 探针。
- 另有**镜像域名**体系（配置在同目录下的另一份 conf）。**改 nginx 时两套域名要同步对齐**，否则会出现「镜像站行为和主站不一样」。
- 前端无 systemd 单元。

## 朴素排版（硬性）

全站**不套自定义设计系统**，交回浏览器默认渲染。`src/index.css` 是唯一 CSS 文件，**≤ 60 行**，只允许保留需求文档列出的 5 条豁免，并在注释里写明理由：

1. **正文限宽**：`.container` `max-width: 65ch~72ch` + 左右内边距——否则宽屏无法阅读；
2. `img, video { max-width: 100%; height: auto }`——防止媒体撑破页面；
3. `pre, table { overflow-x: auto }`——代码块/表格横向滚动；
4. `color-scheme: light dark`（`:root`）+ 按 `data-theme` 覆盖为 `light`/`dark`——用浏览器默认深浅色；
5. 焦点可见性：**不得**写 `outline: none`，保留浏览器默认焦点环。

除此之外，`src/index.css` 里**不得出现**：颜色字面量（`#hex` / `rgb()` / `hsl()` / 颜色关键字）、自定义 `font-family`（只允许 `monospace` 关键字）、`border-radius`、`box-shadow`、`transition`、`animation`。组件层同样不得写颜色 / 圆角 / 字号。

- 结构一律朴素 HTML：顶栏是普通 `<nav>` + 行内链接，列表页用 `<ul>/<li>`，详情页目录是正文前的普通链接列表；**没有**卡片、抽屉、图标绘制、装饰性伪元素、hover 位移。

## 文案与内容红线

以下内容**不要"顺手优化"**，改了会被打回：

- Hero 名言必须保留原句：**「立志欲坚不欲锐，成功在久不在速。—— 张孝祥」**。
- 左上角品牌是**纯几何菱形标记**（朴素化后用字符 `◇` 表达，不加任何样式），不放名字文字。
- 中文页面展示名一律 **Linden Zhang**，不用中文名。
- 文案唯美克制：**禁 emoji、禁鸡汤 / AI 腔、禁网络热词**。UI 上不要写技术说明性文案。

## 博客详情页的标题与副标题（强约束）

- 详情页唯一的 `<h1>` 是文章标题 `post.title`；正文里出现的 `h1` 在渲染时**一律降级为 `h2`**（h1 属于标题区）。
- 副标题是**独立字段** `post.subtitle`（后端返回、后台表单填写），非空时渲染为 `<p class="post__subtitle">`（类名仅作语义对口，不再有自定义样式）；留空不渲染。
- **禁止**"从正文里猜副标题"的隐式推断（曾实现过：取开头 h1 当副标题，已被用户否决，改为读字段）。
- 目录收集 `h1, h2, h3`，锚点是纯序号 `sec-N`（不用标题 slug）。

## 移动端

- 窄屏**绝不隐藏导航**：顶栏链接保持可见，由浏览器自动换行；不要做抽屉或汉堡菜单。
- TOC 锚点用纯序号 `sec-N`，**不要用标题 slug**（中文编码会乱、改标题即失效）。

## 安全约定

- 私有地址（认证中心域名、监控子域、服务器公网 IP）**一律不得硬编码**；需要时走构建时 `import.meta.env.VITE_*` 注入，仓库只提交 `.env.example`，真实 `.env` 由 `.gitignore` 拦截。本仓库目前**不持有任何环境变量**；`/admin/` 入口是相对路径跳转。
- 渲染任何来自接口的 Markdown/HTML 前必须经 DOMPurify。

## PWA

- Service Worker 是**手写单文件** `public/sw.js`（无 workbox、无新增依赖），生产构建下由 `src/pwa.ts` 在 `load` 时注册，scope `/`；开发态不注册，并注销遗留 worker。
- **缓存白名单制**：只有导航请求、`/assets/*`、`/hljs/*`、`/icons/*`、图片、公开只读 `GET /api/blog/*` 允许缓存；其余一律 network-only 直接放行。改 `sw.js` 的 fetch 分支时，`/api/blog/admin/` 的判断必须排在 `/api/blog/` **之前**，且 URL 含 `preview=` 的请求绝不入缓存。
- **更新可靠优先**：`install` → `skipWaiting()`；`activate` → 删掉所有非当前版本缓存 + `clients.claim()`；页面在 `controllerchange` 时自动刷新一次。不要改成"等所有标签页关闭才接管"。
- `sw.js` **不得被长缓存**：它自身不在 SW 白名单内；部署时 nginx 需对 `/sw.js` 下发短缓存（当前对 `/sw.js` 返回 404 的历史防御须由运维在部署时改掉）。
- 图标由 `python3 scripts/gen-pwa-icons.py` 生成（构图 = `index.html` 内联 favicon），改图形先改脚本再重跑，`public/icons/` 产物一并提交。
- 验证构建**必须**显式覆盖输出目录，禁止裸跑 `npm run build`（会清空 `/var/www/homepage`）：`BUILD_OUT_DIR=/tmp/homepage-verify npm run build`。

## 已知坑

- 构建产物在 `/var/www/homepage`，**仓库内没有 `dist/`**，别去仓库里找构建结果。
- `blog/web`、`blog/admin`（在 `atrium-blog` 里）是**已停用的旧前端**，真正的博客前台就是本仓库、后台是 `atrium-console`，不要去改旧目录。
- `src/index.css` 是朴素排版的唯一 CSS：不得引入颜色字面量、自定义 `font-family`（仅 `monospace`）、`border-radius` / `box-shadow` / `transition` / `animation`；改动前先确认仍 **≤ 60 行**。

## 项目记忆（PROJECT_MEMORY.md）

**分工**：`AGENTS.md` 记**规则**（稳定、必须遵守）；`PROJECT_MEMORY.md` 记**记忆**（可演进、随事实更新）。
两者冲突时以 `AGENTS.md` 为准；只有经用户明确确认、且长期稳定的规则，才由用户决定升级进 `AGENTS.md`。
`PROJECT_MEMORY.md` 已被 `.gitignore` 拦截：**只存本机，不提交、不推送**。

### 什么时候写

- 读完代码 / 查完日志后，**确认了可复用、长期有效**的结论：API 契约与参数语义、数据模型与单位、踩坑的根因、
  产品与 UI 习惯、历史 bug 的判据（"见到 X 现象就查 Y"）。
- **任务收尾时必须回写**：本次确认了什么、推翻了什么、遗留了什么（写清复核条件）。
- **不要写**：临时猜测、单次偶发现象、未经验证的产品判断、敏感信息（密钥 / token / 口令 / 私有地址）、
  与项目无关的个人偏好、以及从代码一眼可见的常识。

### 每条记忆的字段（缺一不可）

```md
### YYYY-MM-DD · 主题（一句话）
- **结论**：一句话说清（可执行、可判断真假）。
- **适用范围**：哪个模块 / 接口 / 页面；**不适用**的情况也要写。
- **证据**：`路径:行号` / commit / 实测输出摘要（附可复现命令）。
- **复核条件**：什么情况下这条会失效（如"升级 Flutter 大版本后重测"）。
- **最后复核**：YYYY-MM-DD
```

### 迭代规则

1. **先查后写**：任务开始时按关键词（模块名 / 接口名 / 报错文本 / 表名）检索本文件；命中就按结论行事，
   并**把该条的「最后复核」更新为今天**（同一次任务只更新一次，不要刷日期）。
2. **更新优先于新增**：主题已有条目 → 就地改写（结论变了要写"曾认为 X，实测为 Y"），**不要追加重复条目**。
3. **失效即删**：结论被推翻、或复核条件已命中（代码已改 / 版本已升）→ 直接删掉或改写，不留"已废弃"堆积。
4. **合并同类**：同一模块超过 3 条相关记忆 → 合并成一节，只保留最新结论 + 关键证据。

### 容量与清理（硬约束）

- 文件上限 **200 行 / 12 KB**（以 `wc -c` 为准）。超限时按以下优先级淘汰：
  ① 已被代码或配置取代的（先删）→ ② 「最后复核」最久远的 → ③ 证据最弱的（只有结论、没有出处）。
- 单条记忆 **≤ 15 行**；细节过长就把细节留在代码注释 / `references/` 里，本文件只留结论与指针。
- **每次写入后顺手清理一次**（行数、体积、重复项、失效项），保证文件始终处于上限内。
- 清理若删掉仍有价值的内容，必须在提交说明或对话里说明，**不要静默丢弃**。

### 写法

- 读者是**下一个接手这个仓库的人**：用最短的句子、最强的证据，先写结论再写理由。
- 结论要能被证伪：写"接口 X 的 `:id` 是数据库数字 id（`WHERE id = ?`）"，不要写"注意 id 类型"。
- 需要跨文件的长篇背景（架构选型、迁移过程）放 `references/` 或项目文档，这里只留一行指针。
