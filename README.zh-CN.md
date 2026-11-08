<p align="center"><img src="brand/skein-logo.svg" alt="Skein UI" width="72" height="72" /></p>

# Skein Admin

[English](README.md) | **简体中文**

[Skein UI](https://github.com/skeinui/skein) 的管理后台（Admin Dashboard）界面示例，数据用 mock，不需要后端。

**在线体验：<https://skein-admin.skeinui.com>**（用 `admin` / `admin123` 登录）

它是 `skein create` 的 `admin` 模板，加上若干页面：所有页面都由现有的 `@skeinui/ui` 组件搭成，所有请求由 [MSW](https://mswjs.io) 在浏览器里应答。

## 演示了什么

- **管理后台外壳**：侧边菜单、头部、保持每个页面存活的页签、面包屑、偏好设置抽屉（布局、主题、亮暗模式、头部工具），四个主题（HeroUI、Ant Design、shadcn/ui、Skein）、亮色和暗色、中文和英文。
- **登录**：组件库的 `LoginLayout`，三种样式（分栏、居中、封面），可以在页面上切换。
- **租户**：每个页面都在租户之下（`/acme/orders`），logo 旁边有切换器，每个租户有自己的数据和自己的查询缓存。
- **权限**：`admin` 可以做所有事，`viewer` 只能查看，`guest` 什么都没有。按钮、页面和 403 页面都跟着当前用户能做什么。
- **能搜索的列表**：订单和商品是列表页，有关键词框、以芯片显示的条件、可排序的表头、可显示和调整顺序的列、CSV 导出、新建 / 编辑 / 删除和可勾选的行；订单还有详情页。它们由 `skein new page --from <openapi>` 生成。
- **更多页面**：仪表盘、用户、报表，以及系统分组下的角色和日志。

## 运行

```bash
pnpm install
pnpm dev
```

用 `admin` / `admin123`（或 `viewer` / `viewer123`、`guest` / `guest123`）登录，应用打开后进入第一个租户的仪表盘。

```bash
pnpm check   # skein check（类型、i18n、硬编码颜色、主题覆盖）和 vp check
pnpm build
pnpm clean   # 删除 dist 和 node_modules
```

## 部署

应用用 [Wrangler](https://developers.cloudflare.com/workers/wrangler/) 以静态资源的方式部署到
[Cloudflare](https://developers.cloudflare.com/workers/static-assets/)；`wrangler.jsonc` 把 `dist` 作为单页应用，
绑定在自定义域名 `skein-admin.skeinui.com` 上。

```bash
npx wrangler login   # 只需一次
pnpm deploy          # 先 vp build，再 wrangler deploy
```

构建时读取 `.env.production` 里的 `VITE_ENABLE_MOCK`：`true` 保留 MSW 模拟（演示站），`false` 则请求
`VITE_API_BASE_URL` 指向的真实接口。

## 结构

```
src/pages/<名称>/          每个页面一个目录：index.tsx、_meta.ts（菜单项）、api/、components/、
                           locales/（中英文）、mocks/handlers.ts（页面的接口）
src/routes/_auth/$tenant/  每个页面一个很薄的路由文件，都在租户之下
src/modules/<名称>/        不是页面的部分：租户切换器、工具条、用户菜单、查询构建器、表格工具
src/skein-shell/           接到路由上的 AdminLayout：菜单、页签、KeepAlive、页面外框
src/lib/list-query/        列表的约定：页码、排序、关键词和由条件与条件组构成的筛选
```

- **菜单来自页面目录**：有 `_meta.ts`（图标、`{ zh, en }` 名称、顺序）的目录就是一个菜单项；只有这个文件的目录是一个分组。
- **每个页面自带 mock**：`mocks/handlers.ts` 会被自动收集，新增页面不需要改别的页面。
- **列表用 `ListQuery` 请求**：页面从不拼后端参数；由 `QueryAdapter` 把查询转成某个后端接受的请求，mock 用 `applyListQuery` 在它的数据上执行。

`AGENTS.md` 写了在这个项目里工作的规则（编程智能体也会读它）。

## 没有的

这是界面的示例，不是产品：没有真正的接口和数据库，刷新后数据不保留，仪表盘和报表页上的数字是编的。

## 了解更多

- [Skein UI](https://github.com/skeinui/skein)：组件、主题和生成这个项目的 CLI。
- [Skein Mail](https://github.com/skeinui/skein-mail)：另一个示例，邮件客户端。

## 参与贡献

Skein UI 是开源项目，开发过程完全公开，欢迎任何形式的参与。

- **点一个 Star。** 如果 Skein UI 对你有帮助，在 [GitHub](https://github.com/skeinui/skein) 上点一个 ⭐ 是最简单的支持方式：它能让更多开发者发现这个项目，也是对我们方向的肯定。
- **反馈问题与建议**：在 [Issues](https://github.com/skeinui/skein/issues) 中提交 bug 或功能需求。附上最小复现，或 [skeinui.com](https://skeinui.com) 上对应页面的链接，能帮助我们更快处理。
- **提交 Pull Request**：修复、新组件、新主题风格、文档改进都欢迎。开发环境见[开发](https://github.com/skeinui/skein#development)，提交前请运行 `pnpm ready`。
- **加入核心开发团队**：我们在寻找愿意长期参与组件 API、主题风格和 AI 编程工具链建设的伙伴。期待与你一起把 Skein UI 做好。

## 许可证

MIT
