[English](README.en.md) | [简体中文](README.md)

# atrium

A purely static single-page app for the personal homepage and blog frontend. It starts no long-running process of its own.

## What it does

- Home: hero title row, About, latest three posts, Contact.
- Blog list `/blog`: filters locally by title, excerpt and tag in the browser, and shows the total post count.
- Post detail `/blog/:slug`: `marked` renders and DOMPurify sanitizes; code blocks are highlighted, numbered and copyable in one click.
- Collection list `/blog/collections` and collection detail `/blog/collections/:slug`, showing the posts and count under a collection.
- Table of contents: collects `h1`/`h2`/`h3` from the body; anchors use plain sequence numbers `sec-N`; a sidebar on wide screens, a slide-out drawer on narrow screens.
- Draft preview: when the URL carries `?preview=<short-lived token>`, the server lets unpublished posts through and the title area is marked Draft preview.
- Light/dark theme: `auto` / `light` / `dark`, stored in `localStorage` as `site_theme`, applied before the first frame to avoid a flash.
- Post links prefer the snowflake ID `public_id`; older posts without one fall back to `slug`.
- Navigation is never hidden on narrow screens; it becomes a right-side slide-out drawer.

## Quick start

```bash
npm install
npm run dev      # Vite dev server
npm run build    # build; output goes to /var/www/homepage
npm run preview  # preview the build output
```

Local development needs the blog backend (`atrium-blog`, `:4000`) running; `dev` uses the relative path `/api`, so configure a proxy yourself.

`vite.config.ts` defaults `outDir` to `/var/www/homepage` (overridable with `BUILD_OUT_DIR`) and sets `emptyOutDir: true`, so **building is deploying**: `npm run build` clears that directory first, and no process needs restarting afterwards. The repo has no `dist/`.

## Configuration

This repo holds **no environment variables**; the code does not read `import.meta.env.VITE_*`. `.gitignore` only blocks local files (`node_modules/`, `dist/`, `data/`, `*.db`, `.env`, `PROJECT_MEMORY.md`).

API addresses are hard-coded relative paths, see `src/api.ts`:

| Name | Default | Description |
|---|---|---|
| `API_BASE` | `/api/blog` | Prefix for all blog APIs, reverse-proxied to the backend on the same origin |

## Deployment

- Shape: a purely static SPA, no Node process, no systemd unit. nginx serves the build output at `/var/www/homepage` directly.
- Same-origin reverse proxy (at the nginx layer):
  - `/api/blog/*` public reads → `127.0.0.1:4000` (the blog backend `atrium-blog`).
  - `/api/blog/admin/*` and `/api/admin/*` → Auth Gateway (`127.0.0.1:18920`), which authenticates and then proxies, injecting `X-Auth-User` for admin APIs. There is no `auth_request` probe in the config.
- `/admin/`: the admin frontend is mounted by nginx separately; its source is not in this repo (the admin frontend repo is `atrium-console`). This repo's SPA contains no admin code and no admin routes.
- The site domain is decided at deployment; the repo contains no `server_name`. Examples use `example.com` throughout.

## Authentication and security

- Any Markdown / HTML coming from the API must be sanitized with DOMPurify before `dangerouslySetInnerHTML`.
- Admin APIs do no frontend authentication; the Auth Gateway intercepts them at the nginx layer and injects `X-Auth-User`.
- The only `<h1>` on the detail page is the title area `post.title`; any `h1` in the body is downgraded to `h2` at render time.
- The subtitle reads only the `post.subtitle` field and is not rendered when empty; it is never inferred from the body.

## License

MIT, see [LICENSE](./LICENSE).
