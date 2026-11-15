# Technical report — GeberLMS

**Date:** 2026-11-11 · **Version:** v0.1.0 (milestone m1) · **Branch:** `main`

---

## 1. Project state

GeberLMS is the Learning Management System of **Helveticore OÜ** (Estonia), for selling online courses (monolingual: FR / EN / AR / DE). The **v0.1.0** prototype is functional and deployed; it is in a **production-validation** phase (smoke test) before the next milestone.

- **m1 status:** foundation delivered, production to validate.
- **Quality:** 210 automated tests (22 files) green; typecheck, svelte-check and build OK.
- **Deployment:** https://geberlms.haroudm.workers.dev/ (Cloudflare Workers).

## 2. Technical architecture

### 2.1 Stack
| Decision | Choice |
|---|---|
| Runtime | Cloudflare Workers + Pages/Static Assets |
| Framework | SvelteKit (adapter-cloudflare) |
| Language | TypeScript (strict) |
| Database | Cloudflare D1 (SQLite) via Drizzle ORM |
| Files | Cloudflare R2 |
| Auth | Workers sessions + D1 accounts |
| Payment | Payoneer + Revolut withdrawal |
| LLM | Workers AI (Gemini) by default, DeepSeek as an option |
| Tests | Vitest (TDD, business logic) |

### 2.2 Code structure (3 layers)
- **`src/lib/domain`** — pure business logic, no framework/infra dependency (tested in isolation). Price/VAT/coupons, roles, guardianship, enrollments, catalog, progress, quiz, payment, invoicing.
- **`src/lib/server`** — Cloudflare adapters (D1/Drizzle, R2, Payoneer, LLM) and services (auth, catalog, enrollment, payment, quiz, progress, upload, activity, dashboard).
- **`src/routes`** — SvelteKit pages (login, admin, tutor, learner).

### 2.3 Data model (D1)
Main entities: `users`, `sessions`, `guardianships` (tutor↔learner), `courses`, `modules`, `lessons`, `resources`, `coupons`, `enrollments`, `payments`, `invoices`, `progress`, `quiz_questions`, `uploads`, `activity_logs`. Amounts are in **integer cents** (BR-01). `ON DELETE CASCADE` foreign keys.

### 2.4 Payment flow
1. Course selection + optional coupon → price computation (discount on the net, then VAT at the buyer's country rate, OSS scheme).
2. Payoneer payment request (no card in the LMS).
3. Collection notification → enrollment activation.
4. Learner account creation by the admin (no self-registration).
5. VAT invoice generation.
6. Payoneer → Revolut withdrawal (outside the LMS).

### 2.5 LLM strategy
- `QuizLlm` abstraction; default **Workers AI (Gemini)**, **DeepSeek** option.
- Quiz generation **reviewed/validated by the admin** before publication (never auto-published).
- Budget tracked (NFR-06: ≤ €100/month, alert at €80).
- **m3 clarification:** course authoring is **100% external** (Gemini/DeepSeek) + JSON import — Workers AI is reserved for the **runtime** (quiz variants), with offline local mock and quotas.

### 2.6 Internationalization
FR interface (default) then EN / AR / DE; **RTL** support for Arabic. Monolingual course content.

### 2.7 Security & anti-copy
- Strict role-based + guardianship access control (FR-07: a tutor sees only their learners).
- Anti-copy (deterrence): no mass export, on-the-fly rendering, watermark, quotas + logging.

### 2.8 Architecture decisions (ADR)
ADR-001 SvelteKit · ADR-002 D1 · ADR-003 integer cents · ADR-004 isolated domain · ADR-005 Payoneer (vs Stripe) · ADR-006 pinned Vite 6 · ADR-007 adapter-cloudflare 7 + wrangler 4 chain.

## 3. Quality & tests
- **210 tests** Vitest (domain) green.
- **Integration test** of the manual m1 flow (`test_integration_manuel_dev_m1`).
- `typecheck` (tsconfig.domain.json), `check` (svelte-check 0/0), `build` (adapter-cloudflare): OK.

## 4. Deployment
- Cloudflare Worker: https://geberlms.haroudm.workers.dev/
- Bindings: `DB` (D1), `FILES` (R2), `AI` (Workers AI), `ASSETS`.
- `npm run build` before `wrangler deploy`.

## 5. Plan & next steps
10 milestones (v0.1.0 → v1.0.0): **m2** quality/tooling · **m3** admin content + JSON import (external authoring, upsert, R2 media) · **m4** public catalog · **m5** reader · **m6** dashboards · **m7** monetization + OSS accounting validation · **m8** compliance & security · **m9** E2E & audit · **m10** launch.
