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
| 样式 | 朴素排版（`src/index.css` 唯一 CSS，≤60 行，只留 5 条豁免），**无 UI 库、无 Tailwind、无 CSS-in-JS** |
| Markdown | `marked` + `dompurify`（必须经 DOMPurify 消毒后再 `dangerouslySetInnerHTML`） |
| 高亮 | `highlight.js` + `highlightjs-line-numbers.js`（npm 包，主题 CSS 在 `public/hljs/`，属第三方皮肤） |
| 字体 | 无自托管字体，用浏览器默认；代码块用等宽 |
| 组件文档 | `docs/COMPONENTS.md`（新增/改动可复用组件同笔登记 + 文件头 TSDoc） |
| 运行时 | Node 24 / npm 11（服务器 nvm v24.19.0） |

## 目录结构

```
src/
├── main.tsx / App.tsx     # 入口 + 路由 + Layout（顶栏、主内容、页脚）
├── api.ts                 # 全部接口封装，API_BASE = '/api/blog'
├── theme.ts               # 深浅色：localStorage('site_theme') ∈ auto|light|dark，写 <html data-theme>
├── utils.ts               # formatDate 等纯函数
├── index.css              # 朴素排版的唯一 CSS：只留 5 条豁免
├── hooks/useAsync.ts      # 异步加载 hook
├── components/States.tsx  # 加载中 / 空 / 错误态
└── pages/
    ├── Home.tsx           # /
    ├── BlogList.tsx       # /blog
    ├── BlogPost.tsx       # /blog/:slug（详情渲染主文件）
    ├── Collections.tsx    # /blog/collections
    ├── CollectionDetail.tsx
    └── Apps.tsx           # /apps（纯文本列表）
public/                    # hljs/、icons/、favicon、manifest 等原样拷贝资源
```

## 路由

| 路径 | 组件 |
|---|---|
| `/` | Home |
| `/blog` | BlogList |
| `/blog/:slug` | BlogPost — 参数名仍是 `slug`，但**现在承载雪花 ID（`public_id`）**，无 `public_id` 的老文章才回退 slug |
| `/blog/collections` | Collections |
| `/blog/collections/:slug` | CollectionDetail |
| `/apps` | Apps（纯文本列表，状态用文字表达） |

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

## 排版（朴素，硬性）

全站交回浏览器默认渲染，不再手工调视觉。`src/index.css` 是唯一 CSS，≤60 行，**只允许**保留 5 条豁免，且每条在 CSS 注释里写明理由：

1. 正文限宽：`.container` 的 `max-width: 65ch~72ch` + 左右内边距；
2. `img, video { max-width: 100%; height: auto }`；
3. `pre, table { overflow-x: auto }`；
4. `color-scheme: light dark`（`:root`）+ 按 `data-theme` 覆盖为 `light`/`dark`；
5. 不写 `outline: none`，保留浏览器默认焦点环。

除上述外，`src/index.css` 内**不得出现**：颜色字面量、自定义 `font-family`（只允许 `monospace`）、`border-radius`、`box-shadow`、`transition`、`animation`。不引入任何 UI 库 / CSS 框架 / CSS-in-JS。

## 文案与内容红线

以下内容**不要"顺手优化"**，改了会被打回：

- Hero 名言必须保留原句：**「立志欲坚不欲锐，成功在久不在速。—— 张孝祥」**。
- 左上角品牌是**纯几何菱形标记**，不放名字文字。
- 中文页面展示名一律 **Linden Zhang**，不用中文名。
- 文案唯美克制：**禁 emoji、禁鸡汤 / AI 腔、禁网络热词**。UI 上不要写技术说明性文案。

## 博客详情页的标题与副标题（强约束）

- 详情页唯一的 `<h1>` 是文章标题 `post.title`；正文里出现的 `h1` 在渲染时**一律降级为 `h2`**（h1 属于标题区）。
- 副标题是**独立字段** `post.subtitle`（后端返回、后台表单填写），非空时渲染为 `<p class="post__subtitle">`（类名保留作语义标记，朴素排版下无自定义样式）；留空不渲染。
- **禁止**"从正文里猜副标题"的隐式推断（曾实现过：取开头 h1 当副标题，已被用户否决，改为读字段）。
- 目录收集 `h1, h2, h3`，锚点是纯序号 `sec-N`（不用标题 slug）。

## 移动端

- 窄屏**绝不隐藏导航**：顶栏是普通行内链接，窄屏由浏览器自动换行；**没有**抽屉与触发按钮。
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
- 朴素排版下不要再往 `index.css` 里加设计令牌、颜色、字体或组件库；只允许上面那 5 条豁免。

