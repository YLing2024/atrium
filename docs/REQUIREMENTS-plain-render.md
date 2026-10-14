# 需求：全站改为朴素排版（去掉自定义设计系统）

## 背景

本仓库当前的视觉是一套手写的「瑞士风」设计系统：`src/index.css` 共 1867 行、250 个选择器块，
配合 `scripts/check-tokens.mjs` 校验设计令牌（`--bg/--surface/--fg/--line/--accent` 等）。
现在决定**放弃这套定制设计**，改为「朴素排版」——基本交回浏览器默认渲染，不再手工调视觉。

## 目标

全站视觉去定制化：删掉颜色体系、自托管字体、字号/间距阶梯、圆角、阴影、分隔线、过渡动效、
自定义滚动条与选中色、装饰性结构（卡片、右侧滑出抽屉、图标字形）等一切手工设计。
页面回到浏览器默认样式，**只保留让页面"能用"的最低限度样式**（见下「允许保留」）。

## 必须删除

- `src/index.css` 里的全部设计令牌与基于它们的规则；`--ease`、`--maxw` 之类的变量一并去掉。
- 自托管字体：`package.json` 里三个字体包依赖、`public/fonts/` 目录、相关 `@font-face` 与 `index.html` 里的字体预载。
- 一切自定义视觉：调色、字号阶梯、间距阶梯、圆角、阴影、发丝线/装饰边框、`transition`/`animation`、
  自定义滚动条、自定义 `::selection`、装饰性伪元素、hover 变色或位移。
- 装饰性结构：卡片容器、右侧滑出抽屉（含「目录」按钮）、应用中心的图标绘制（`src/appIcons.tsx` 及调用点）。
- `scripts/check-tokens.mjs`、`package.json` 中 `check` 脚本里的 `check:tokens`、以及文档里对它的引用。
- `public/sw.js` 缓存白名单里的 `/fonts/*` 分支（并 bump 缓存版本号，保证老客户端能更新）。

## 允许保留（唯一豁免，需在 CSS 注释里写明理由）

1. **正文限宽**：内容容器 `max-width: 65ch~72ch` + 左右内边距——否则宽屏无法阅读；
2. `img, video { max-width: 100%; height: auto }`——防止图片撑破页面；
3. `pre, table { overflow-x: auto }`——代码块/表格横向滚动；
4. `color-scheme: light dark`（`:root`）+ 按 `data-theme` 覆盖为 `light`/`dark`——用浏览器默认的深浅色渲染，不自己写颜色；
5. 焦点可见性：**不得**写 `outline: none`，保留浏览器默认焦点环。

以上之外，`src/index.css` 中**不得出现**：颜色字面量（`#hex` / `rgb()` / `hsl()` / 颜色关键字）、
自定义 `font-family`（只允许 `monospace` 关键字）、`border-radius`、`box-shadow`、`transition`、`animation`。

**目标规模**：`src/index.css` 最终 ≤ 60 行。

## 结构改为朴素 HTML

- **顶栏**：普通 `<nav>` + 行内链接（首页 / 博客 / 应用）。任何视口下都可见，窄屏自动换行；删除抽屉与触发按钮。
- **列表页**（`/blog`、`/blog/collections`）：普通 `<ul>/<li>` 或 `<article>` + 链接，不用卡片视觉，日期用纯文本。
- **详情页**（`/blog/:slug`）：功能全部保留——TOC（渲染成普通 `<ul>` 链接列表）、代码高亮、锚点 `sec-N`、
  `post.subtitle` 独立字段（空则不渲染）、正文 `h1` 降级为 `h2`、Markdown 经 DOMPurify 消毒；
  去掉粘性定位、滚动高亮等定制行为。
- **应用中心**（`/apps`）：改为纯文本列表（应用名 + 链接 + 状态文字）；删除图标绘制，状态逻辑保留，
  用文字表达（在线 / 休眠 / 异常）。
- **主题按钮**：保留三态（自动 / 浅色 / 深色）与 `localStorage('site_theme')` 机制，使用默认按钮样式，
  只切换 `color-scheme`。
- **页脚**：纯文本。

## 红线（不得改动）

- 文案与内容：hero 名言原文必须保留（「立志欲坚不欲锐，成功在久不在速。—— 张孝祥」）；
  左上角品牌为纯几何菱形（朴素化后用字符 `◇` 表达，不加任何样式）；展示名一律 `Linden Zhang`；
  禁 emoji / 鸡汤 / AI 腔 / 网络热词；UI 上不写技术说明性文案。
- 路由与数据契约不变：`/`、`/blog`、`/blog/:slug`、`/blog/collections`、`/blog/collections/:slug`、`/apps`；
  `api.ts` 的 `API_BASE = '/api/blog'` 与 `?preview=` 草稿预览逻辑不动。
- PWA：`public/sw.js` 的语义保持不变（白名单缓存制；`/api/blog/admin/` 判定必须排在 `/api/blog/` 之前；
  含 `preview=` 的请求不进缓存；`install` 用 `skipWaiting()`、`activate` 清旧缓存 + `clients.claim()`）。
- 安全：源码与文档里不得硬编码真实域名 / 公网 IP / 内网地址 / 凭据；本仓库不得引入任何环境变量。
- **不得引入任何 UI 库、CSS 框架或 CSS-in-JS**（Tailwind、组件库、styled-components 等一律不要）——
  「朴素」指回到浏览器默认，不是换一套框架。
- 构建：`vite.config.ts` 的 `outDir` 指向生产目录，**验证构建必须显式覆盖输出目录**：
  `BUILD_OUT_DIR=/tmp/homepage-verify npm run build`，禁止裸跑 `npm run build`。

## 交付标准（硬性，缺一不算完成）

1. `npm run check`（typecheck + lint + lint:css + test 聚合）退出码必须为 0，报告里贴**原始输出**，不要转述。
2. 新增/改动的逻辑必须有对应单测，用例要满足"改坏了会红"；现有 `test/utils.test.ts`、`test/appStatus.test.ts` 保持绿。
3. 新建 `docs/COMPONENTS.md` 组件登记表，字段：组件 | 用途 | 关键 props | 最小示例 | 注意事项；
   本轮改动到的可复用组件在文件头写 TSDoc（用途、props 含类型与默认值、可访问性要点：键盘 / aria / 焦点）。
   不引入 Storybook；组件层不得写颜色 / 圆角 / 字号。
4. 注释与命名：导出符号必须有文档注释（TSDoc）；注释写"为什么"（取舍、兼容包袱、坑），不写"这行在做什么"；
   不留注释掉的死代码、不留 `console.log`/调试残留、不新增 TODO/FIXME；TS 保持 `strict`，禁止 `any` 逃逸；禁止空 catch。
5. 单文件超过约 600 行按职责拆层。
6. 源码与文档里绝不出现真实域名 / 公网 IP / 内网地址 / 凭据（文档只允许占位符）。
7. 小步多次提交（见「提交纪律」），**禁止 push**。
8. 报告四要素：改了什么 / 新增或删除了哪些依赖 / 哪些没做到 / 留下什么风险；发现既有问题只报告不修。
9. 禁止"看起来对"的实现（假实现、空壳、占位 TODO）；做不到的点在报告里明说。
10. 机器可判自检（报告里贴命令与结果）：
    - `wc -l src/index.css` → ≤ 60
    - `grep -nE '#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(' src/index.css` → 0 命中
    - `grep -n 'font-family' src/index.css` → 只允许出现 `monospace`
    - `grep -nE 'border-radius|box-shadow|transition|animation' src/index.css` → 0 命中
    - `git grep -nE '@font|fontsource' -- ':!docs'` → 0 命中（`docs/` 里的需求书本身会引用这些名字，故排除）；`ls public/fonts` → 不存在
    - `git grep -In 'check-tokens' -- ':!docs'` → 0 命中（同上排除 `docs/`）

## 提交纪律（必须遵守）

- **每完成一个逻辑单元就 `git commit` 一次**（小步多次），不要憋到最后一次性提交；
  多文件同一件事可以一次提交，多件事不要塞进一次提交。
- 提交消息用 conventional commits：`feat:` / `fix:` / `refactor:` / `test:` / `docs:` / `chore:` + 一行摘要。
- **禁止**：`git push`、`git checkout -b`、`git rebase`、`git reset --hard`、`git merge`；只在当前分支工作，历史只准往前走。
- 提交使用仓库当前 git 身份，不得自报署名，不得写 `Co-authored-by` / `Generated-by` 之类的附加标记。
- 交付时工作区必须干净（`git status --short` 无未提交改动）。
- 报告里给出 `git log --oneline -n <本次提交数>`，并说明每笔提交对应哪个改动点。

## 环境约束

- 只允许改动本仓库内的文件；不得触碰 `/etc`、其它项目目录、系统路径。
- 不得执行 `systemctl` / `service` / `kill` / `pkill` / `fuser -k` 等进程或服务操作。
- 命令必须自带 `timeout`；同一条命令失败后不要死循环重试。

## 验收方式（供参考）

逐 commit 审 + 复跑 `npm run check` 与上述 10 条机器自检 + 在浏览器里按真人路径走一遍：
首页 / 博客列表 / 详情 / 合集 / 应用中心、窄屏布局、三态主题切换。
