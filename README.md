# Homepage — 个人网站（zhangyunling.cn）

个人主页 + 博客，Swiss 国际主义设计风格（米白/炭黑/琥珀，扁平细线排版）。

## 技术栈

- React 18 + Vite（SPA，构建产物 `/var/www/homepage`）
- 博客前端：文章列表/详情、合集、搜索、代码高亮、一键复制
- nginx 静态托管，API 反代到 blog-server（4000）/ admin-server（3100）

## 页面

- `/` — 主页（Hero + 名言 + 最新文章）
- `/blog` — 博客（列表/搜索/合集）
- `/blog/:slug` — 文章详情
- `/admin/` — Admin 管理后台（独立 SPA，登录由 Auth Gateway 负责）

## 构建部署

```bash
npm install
npm run build -- --outDir /var/www/homepage   # 测试: /var/www/homepage-test
```

域名：`zhangyunling.cn` / `www.zhangyunling.cn`（nginx + certbot HTTPS）。
