# SBOM — Milestone m1 (v0.1.0)

Software Bill of Materials du milestone **m1** — GeberLMS v0.1.0.

## Métadonnées

- **Milestone** : m1
- **Version** : 0.1.0
- **Tag** : v0.1.0
- **Date** : 2026-11-01
- **Statut** : livré

## Dépendances runtime (npm)

| Paquet | Version | Rôle |
|---|---|---|
| drizzle-orm | ^0.45.3 | ORM D1 (base SQLite) |
| mode-watcher | ^1.1.0 | thème clair/sombre |
| tw-animate-css | ^1.4.0 | animations Tailwind |
| @fontsource-variable/inter | ^5.3.0 | police Inter |
| @fontsource-variable/sora | ^5.3.0 | police Sora |

## Dépendances dev / build (npm)

| Paquet | Version | Rôle |
|---|---|---|
| svelte | ^5.0.0 | framework UI |
| @sveltejs/kit | ^2.0.0 | meta-framework full-stack |
| @sveltejs/adapter-cloudflare | ^7.0.0 | déploiement Workers |
| @sveltejs/vite-plugin-svelte | ^5.0.0 | intégration Vite |
| vite | ^6.0.0 | build |
| vitest | ^3.0.0 | tests unitaires |
| typescript | ^5.7.0 | typage strict |
| svelte-check | ^4.7.6 | vérif typage app/serveur |
| tailwindcss | ^4.3.3 | CSS (config CSS-first) |
| @tailwindcss/vite | ^4.3.3 | plugin Tailwind Vite |
| shadcn-svelte | ^1.7.0 | CLI composants |
| bits-ui | ^2.19.5 | primitives UI |
| tailwind-variants | ^3.3.1 | variants composants |
| @lucide/svelte | ^1.54.0 | icônes |
| svelte-sonner | ^1.2.1 | toasts |
| vaul-svelte | ^1.0.0-next.7 | drawer |
| embla-carousel-svelte | ^8.6.0 | carousel |
| layerchart | ^2.6.0 | charts |
| paneforge | ^1.0.2 | resizable |
| @internationalized/date | ^3.12.4 | dates/calendrier |
| wrangler | ^4.0.0 | CLI Cloudflare (D1/R2/AI) |
| @cloudflare/workers-types | ^5.0.0 | types Workers |
| @types/node | ^22.10.0 | types Node |
| tsx | ^4.0.0 | exécution TS (scripts/seeds) |
| cn | ^0.4.0 | utilitaire classnames |

## Services plateforme (Cloudflare / externes)

| Service | Rôle | Binding |
|---|---|---|
| Cloudflare D1 | base de données SQLite | `DB` |
| Cloudflare R2 | stockage d'objets (uploads, ressources) | `FILES` |
| Cloudflare Workers AI | génération de quiz LLM (`@cf/meta/llama-3.1-8b-instruct`) | `AI` |
| Cloudflare KV | sessions / cache léger | (KV) |
| Cloudflare Pages/Assets | assets statiques | `ASSETS` |
| Payoneer | encaissement + retrait Revolut (flux semi-manuel) | — |

## Modules first-party — domaine (`src/lib/domain/`)

`pricing`, `coupon`, `vat`, `roles`, `user`, `guardianship`, `enrollment`,
`catalog`, `content`, `progress`, `dashboard`, `activity`, `quiz`, `payment`,
`invoice`, `password`, `session`, `authz`, `upload`, `i18n`.

## Modules first-party — serveur (`src/lib/server/`)

`auth`, `catalog`, `coupon`, `dashboard`, `enrollment`, `payment`, `progress`,
`quiz`, `upload`, `activity`, `db` (Drizzle, `schema.ts`).

## Modules first-party — UI (`src/lib/components/`)

- Layout : `app-shell`, `sidebar-nav`, `topbar`, `user-menu`, `lang-switch`, `theme-toggle`.
- 38 composants shadcn-svelte dans `ui/` : `accordion`, `alert`, `aspect-ratio`,
  `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`,
  `chart`, `checkbox`, `command`, `dialog`, `drawer`, `dropdown-menu`,
  `input-group`, `input`, `label`, `pagination`, `popover`, `progress`,
  `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`,
  `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`,
  `textarea`, `toggle`, `tooltip`.
