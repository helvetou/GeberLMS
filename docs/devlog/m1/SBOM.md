# SBOM — Milestone m1 (v0.1.0)

Software Bill of Materials of milestone **m1** — GeberLMS v0.1.0.

## Metadata

- **Milestone**: m1
- **Version**: 0.1.0
- **Tag**: v0.1.0
- **Date**: 2026-11-01
- **Status**: delivered

## Runtime dependencies (npm)

| Package | Version | Role |
|---|---|---|
| drizzle-orm | ^0.45.3 | D1 ORM (SQLite database) |
| mode-watcher | ^1.1.0 | light/dark theme |
| tw-animate-css | ^1.4.0 | Tailwind animations |
| @fontsource-variable/inter | ^5.3.0 | Inter font |
| @fontsource-variable/sora | ^5.3.0 | Sora font |

## Dev / build dependencies (npm)

| Package | Version | Role |
|---|---|---|
| svelte | ^5.0.0 | UI framework |
| @sveltejs/kit | ^2.0.0 | full-stack meta-framework |
| @sveltejs/adapter-cloudflare | ^7.0.0 | Workers deployment |
| @sveltejs/vite-plugin-svelte | ^5.0.0 | Vite integration |
| vite | ^6.0.0 | build |
| vitest | ^3.0.0 | unit tests |
| typescript | ^5.7.0 | strict typing |
| svelte-check | ^4.7.6 | app/server type checking |
| tailwindcss | ^4.3.3 | CSS (CSS-first config) |
| @tailwindcss/vite | ^4.3.3 | Tailwind Vite plugin |
| shadcn-svelte | ^1.7.0 | component CLI |
| bits-ui | ^2.19.5 | UI primitives |
| tailwind-variants | ^3.3.1 | component variants |
| @lucide/svelte | ^1.54.0 | icons |
| svelte-sonner | ^1.2.1 | toasts |
| vaul-svelte | ^1.0.0-next.7 | drawer |
| embla-carousel-svelte | ^8.6.0 | carousel |
| layerchart | ^2.6.0 | charts |
| paneforge | ^1.0.2 | resizable |
| @internationalized/date | ^3.12.4 | dates/calendar |
| wrangler | ^4.0.0 | Cloudflare CLI (D1/R2/AI) |
| @cloudflare/workers-types | ^5.0.0 | Workers types |
| @types/node | ^22.10.0 | Node types |
| tsx | ^4.0.0 | TS execution (scripts/seeds) |
| cn | ^0.4.0 | classnames utility |

## Platform services (Cloudflare / external)

| Service | Role | Binding |
|---|---|---|
| Cloudflare D1 | SQLite database | `DB` |
| Cloudflare R2 | object storage (uploads, resources) | `FILES` |
| Cloudflare Workers AI | LLM quiz generation (`@cf/meta/llama-3.1-8b-instruct`) | `AI` |
| Cloudflare KV | sessions / lightweight cache | (KV) |
| Cloudflare Pages/Assets | static assets | `ASSETS` |
| Payoneer | collection + Revolut withdrawal (semi-manual flow) | — |

## First-party modules — domain (`src/lib/domain/`)

`pricing`, `coupon`, `vat`, `roles`, `user`, `guardianship`, `enrollment`,
`catalog`, `content`, `progress`, `dashboard`, `activity`, `quiz`, `payment`,
`invoice`, `password`, `session`, `authz`, `upload`, `i18n`.

## First-party modules — server (`src/lib/server/`)

`auth`, `catalog`, `coupon`, `dashboard`, `enrollment`, `payment`, `progress`,
`quiz`, `upload`, `activity`, `db` (Drizzle, `schema.ts`).

## First-party modules — UI (`src/lib/components/`)

- Layout: `app-shell`, `sidebar-nav`, `topbar`, `user-menu`, `lang-switch`, `theme-toggle`.
- 38 shadcn-svelte components in `ui/`: `accordion`, `alert`, `aspect-ratio`,
  `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`,
  `chart`, `checkbox`, `command`, `dialog`, `drawer`, `dropdown-menu`,
  `input-group`, `input`, `label`, `pagination`, `popover`, `progress`,
  `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`,
  `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`,
  `textarea`, `toggle`, `tooltip`.
