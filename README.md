<p align="center"><img src="brand/skein-logo.svg" alt="Skein UI" width="72" height="72" /></p>

# Skein Admin

**English** | [简体中文](README.zh-CN.md)

Admin dashboard UI example for [Skein UI](https://github.com/skeinui/skein), with mock data and no backend.

**Live demo: <https://skein-admin.skeinui.com>** (sign in with `admin` / `admin123`)

It is the `admin` template of `skein create` with pages on top: every screen is built from existing
`@skeinui/ui` components, and every request is answered in the browser by [MSW](https://mswjs.io).

## What it shows

- **The admin shell**: side menu, header, tabs that keep each page alive, breadcrumb, preferences drawer (layout,
  theme style, color mode, the header's tools), four theme styles (HeroUI, Ant Design, shadcn/ui, Skein) with light
  and dark mode, Chinese and English.
- **Sign-in**: the library's `LoginLayout` in three looks (split, centered, cover), switchable on the page.
- **Tenants**: every page is under a tenant (`/acme/orders`), a switcher next to the logo, and each tenant has its
  own data and its own query cache.
- **Permissions**: `admin` may do everything, `viewer` only reads, `guest` has nothing. Buttons, pages and the 403
  page follow what the signed-in user may do.
- **Lists that search**: Orders and Products are list pages with a keyword box, conditions as chips, sortable
  headers, columns to show and reorder, CSV export, create / edit / delete and rows to tick; Orders has a detail
  page too. They were made by `skein new page --from <openapi>`.
- **More pages**: Dashboard, Users, Reports, and a System group with Roles and Logs.

## Run it

```bash
pnpm install
pnpm dev
```

Sign in with `admin` / `admin123` (or `viewer` / `viewer123`, `guest` / `guest123`); the app opens on the
Dashboard of the first tenant.

```bash
pnpm check   # skein check (types, i18n, hard-coded colors, theme coverage) and vp check
pnpm build
pnpm clean   # remove dist and node_modules
```

## Deploy

The app deploys to [Cloudflare](https://developers.cloudflare.com/workers/static-assets/) as static assets with
[Wrangler](https://developers.cloudflare.com/workers/wrangler/); `wrangler.jsonc` serves `dist` as a single-page app
on the custom domain `skein-admin.skeinui.com`.

```bash
npx wrangler login   # once
pnpm deploy          # vp build, then wrangler deploy
```

The build reads `VITE_ENABLE_MOCK` from `.env.production`: `true` keeps the MSW mock (the demo), `false` calls a
real API at `VITE_API_BASE_URL`.

## How it is put together

```
src/pages/<name>/          one directory per page: index.tsx, _meta.ts (the menu entry), api/, components/,
                           locales/ (zh and en), mocks/handlers.ts (the page's API)
src/routes/_auth/$tenant/  a thin route file per page, all under their tenant
src/modules/<name>/        parts that aren't pages: tenant switcher, toolbar, user menu, query builder, table tools
src/skein-shell/           AdminLayout wired to the router: menu, tabs, KeepAlive, page frame
src/lib/list-query/        the list contract: page, sort, keyword and a filter of conditions and groups
```

- **The menu comes from the page directories**: a directory with a `_meta.ts` (icon, `{ zh, en }` label, order) is
  a menu entry; a directory with only that file is a group.
- **Every page brings its own mock**: `mocks/handlers.ts` is picked up automatically, so a new page needs no edit
  to the others.
- **Lists ask with a `ListQuery`**: the page never builds backend parameters; a `QueryAdapter` turns the query into
  the request one backend takes, and the mock runs it over its rows with `applyListQuery`.

`AGENTS.md` has the rules for working in this project (it is also what coding agents read).

## Not in it

This is an example of the interface, not a product: there is no real API or database, nothing is kept between
reloads, and the numbers on the Dashboard and Reports pages are made up.

## Learn more

- [Skein UI](https://github.com/skeinui/skein): the components, the theme styles and the CLI that made this
  project.
- [Skein Mail](https://github.com/skeinui/skein-mail): another example, an email client.

## Contributing

Skein UI is open source and developed in the open. Contributions of every size are welcome.

- **Star the repository.** If Skein UI is useful to you, a ⭐ on [GitHub](https://github.com/skeinui/skein) is the simplest way to support it: it helps other developers discover the project and tells us the direction is worth pursuing.
- **Report bugs and suggest features** in [Issues](https://github.com/skeinui/skein/issues). A minimal reproduction, or a link to the relevant page on [skeinui.com](https://skeinui.com), helps us respond quickly.
- **Open a pull request.** Fixes, components, theme styles and documentation are all welcome. See [Development](https://github.com/skeinui/skein#development) for the setup, and run `pnpm ready` before submitting.
- **Join the core team.** We are looking for people who want to help shape the component API, the theme styles and the tooling for AI coding agents over the long term. We would love to work with you.

## License

MIT
