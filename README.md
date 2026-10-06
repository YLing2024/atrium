[简体中文](README.md) ｜ [English](README.en.md)

# atrium

个人主页与博客前台的纯静态单页应用，自身不启动任何常驻进程。

## 它能做什么

- 首页：Hero 横排标题、About、最新三篇文章、Contact。
- 博客列表 `/blog`：按标题、摘要、标签在前端本地过滤，并显示文章总数。
- 文章详情 `/blog/:slug`：`marked` 渲染后经 DOMPurify 消毒；代码块高亮、行号、一键复制。
- 合集列表 `/blog/collections` 与合集详情 `/blog/collections/:slug`，展示合集下的文章与篇数。
- 目录：收集正文里的 `h1`/`h2`/`h3`，锚点用纯序号 `sec-N`；宽屏为侧栏，窄屏为滑出抽屉。
- 草稿预览：URL 带 `?preview=<短时效令牌>` 时，服务端放行未发布文章，标题区标注 Draft preview。
- 深浅色主题：`auto` / `light` / `dark`，存在 `localStorage` 的 `site_theme`，首帧前落地以免闪回。
- 文章链接优先用雪花 ID `public_id`，无 `public_id` 的旧文章回退 `slug`。
- 窄屏不隐藏导航，走右侧滑出抽屉。

## 快速开始

```bash
npm install
npm run dev      # Vite dev server
npm run build    # 构建，产物写入 /var/www/homepage
npm run preview  # 预览构建产物
```

本地开发需要博客后端（`atrium-blog`，`:4000`）在运行；`dev` 走相对路径 `/api`，需自行配置代理。

`vite.config.ts` 把 `outDir` 默认写为 `/var/www/homepage`（可用 `BUILD_OUT_DIR` 覆盖）且 `emptyOutDir: true`，**构建即部署**：`npm run build` 会先清空该目录，构建后无需重启任何进程。仓库里没有 `dist/`。

## 配置

本仓库**不持有任何环境变量**，代码不读取 `import.meta.env.VITE_*`，`.gitignore` 仅拦截本地文件（`node_modules/`、`dist/`、`data/`、`*.db`、`.env`、`PROJECT_MEMORY.md`）。

接口地址是硬编码的相对路径，见 `src/api.ts`：

| 名称 | 默认值 | 说明 |
|---|---|---|
| `API_BASE` | `/api/blog` | 全部博客接口前缀，同域反代到后端 |

## 部署

- 形态：纯静态 SPA，无 Node 进程、无 systemd 单元。nginx 直接托管构建产物 `/var/www/homepage`。
- 同域反代（nginx 层）：
  - `/api/blog/*` 公开读 → `127.0.0.1:4000`（博客后端 `atrium-blog`）。
  - `/api/blog/admin/*` 与 `/api/admin/*` → Auth Gateway（`127.0.0.1:18920`）鉴权后反代，管理员接口由网关注入 `X-Auth-User`。配置里没有 `auth_request` 探针。
- `/admin/`：管理后台前端由 nginx 单独挂载，源码不在本仓库（后台前端仓库 `atrium-console`）。本仓库的 SPA 不包含后台代码，也没有后台路由。
- 站点域名由部署决定，仓库内不含 `server_name`。示例统一用 `example.com`。

## 认证与安全

- 渲染任何来自接口的 Markdown / HTML 前必须经 DOMPurify 消毒，再交给 `dangerouslySetInnerHTML`。
- 管理接口不做前端鉴权，统一由 Auth Gateway 在 nginx 层拦截并注入 `X-Auth-User`。
- 详情页唯一的 `<h1>` 是标题区 `post.title`；正文里的 `h1` 渲染时一律降级为 `h2`。
- 副标题只读 `post.subtitle` 字段，为空不渲染；不从正文推断。

## 许可证

MIT，见 [LICENSE](./LICENSE)。
