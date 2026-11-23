# LMS Helveticore — GeberLMS

Learning Management System for selling courses produced by Helveticore OÜ (Estonia).

## Status

- **v0.1.0** (milestone m1) — working prototype: TDD domain (price/VAT/coupons, roles,
  guardianship, enrollments, catalog, progress, quiz, payment, invoicing), server auth,
  admin/tutor/learner routes, i18n/RTL (FR/EN/AR/DE), Payoneer payment + VAT invoicing,
  LLM quiz generation (Workers AI), R2 uploads, app shell.
- **210 green** Vitest tests; typecheck, svelte-check and build OK.
- 10-milestone plan: see `docs/planning.md` and `docs/geberLMSstatus-2026-11-11.md`.

## Prerequisites

- Node ≥ 20, npm ≥ 9

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server
npm run build      # SvelteKit build (adapter-cloudflare)
npm run check      # svelte-check (app + server typing)
npm test           # Vitest tests (business logic)
npm run test:watch
npm run typecheck  # business-logic typing (tsc)
npm run db:migrate # apply D1 migrations (idempotent, see below)
npm run db:migrate:remote
npm run smoke      # production smoke test (HTTP, PROD_URL env)
npm run test:e2e   # Playwright E2E (requires `npx playwright install`)
```

## Local database (D1)

```bash
# apply all migrations (idempotent — safe to re-run)
npm run db:migrate

# create the admin (idempotent — safe to re-run)
SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=changeme npx tsx scripts/seed-admin.ts

# demo data (tutor/learner/course)
npx tsx scripts/seed-demo.ts
```

> **Local dev prerequisite**: the Cloudflare bindings (`DB`, `R2`, `AI`) are
> provisioned through the platform. Run `npx wrangler login` (or export
> `CLOUDFLARE_API_TOKEN`) before `npm run dev`. Quiz generation degrades
> gracefully to a **local deterministic mock** when the Workers AI binding is
> unavailable, so the full flow works offline.

## Deployment (Cloudflare)

The Worker is deployed with Wrangler (`main = .svelte-kit/cloudflare/_worker.js`).
The SvelteKit build **must** run before `wrangler deploy`
(it generates `.svelte-kit/cloudflare/_worker.js`).

1. **Authentication**: `npx wrangler login` (or `CLOUDFLARE_API_TOKEN`).
2. **Remote D1 database** (once):
   ```bash
   npx wrangler d1 create geberlms
   # copy the returned database_id into wrangler.toml (replace the placeholder)
   npm run db:migrate:remote
   SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=changeme npx tsx scripts/seed-admin.ts --remote
   ```
3. **Deploy**:
   ```bash
   npm run deploy   # = npm run build && npx wrangler deploy
   ```

In Cloudflare Pages, use as "Deploy command":
`npm run deploy` (or set "Build command" = `npm run build` before the
deploy command).

## Structure

```
docs/spec/                     Specifications (CMMI L3)
docs/devlog/                   Per-milestone development journal (m1 → m10)
docs/planning.md               10-milestone plan
input-job-market-survey-drone/  Job-market drone proposals (import)
migrations/                    D1 SQL migrations
src/lib/domain/                Pure business logic (tested)
src/lib/server/                Server layer (D1/Drizzle, auth)
src/routes/                    SvelteKit pages (login, admin…)
tests/domain/                  Vitest tests
```

## Documentation

- `docs/planning.md` — 10-milestone plan (v0.1.0 → v1.0.0)
- `docs/geberLMSstatus-2026-11-11.md` — project status
- `docs/geberLMSrapport-technique-2026-11-11.md` — technical report + architecture
- `docs/manual-dev-v0.1.0-m1.md` — v0.1.0 test manual
- `docs/spec/01-exigences.md` — functional and non-functional requirements
- `docs/spec/02-architecture.md` — technical architecture and decisions
- `docs/spec/03-processus-cmmi3.md` — process, TDD, reviews, risks, traceability
