# GeberLMS — Project status

## Overview
**GeberLMS** is the Learning Management System of **Helveticore OÜ** (Estonia) for selling online courses (FR / EN / AR / DE). Stack: **SvelteKit + Cloudflare** (D1, R2, Workers AI).

## Current version
- **v0.1.0** — milestone **m1** (tag `v0.1.0`)
- Status: **working prototype**, in production-validation phase

## What is implemented (m1)
- Pure, tested business logic (TDD): price/VAT/coupons, roles, tutor↔learner guardianship, enrollments, catalog, progress, quiz, payment, invoicing.
- Server authentication (sessions) + 3 roles (admin, tutor, learner).
- Tutor and learner dashboards (progress).
- Course catalog and content (modules → lessons → resources).
- Coupons (% / amount) + price/VAT calculation (OSS scheme).
- Payoneer payment + VAT invoicing (sequential numbering).
- E-testing (quiz) + LLM quiz generation (Workers AI).
- Learner document uploads (R2).
- Internationalization + RTL (FR / EN / AR / DE).
- UI: app shell (sidebar/topbar), shadcn-svelte + Tailwind CSS v4.

## Quality & tests
- **210 automated tests** (22 files) — all green.
- Typecheck, svelte-check (0 errors / 0 warnings) and build: OK.
- **Integration test** of the manual flow (`test_integration_manuel_dev_m1`).

## Deployment
- Production: **https://geberlms.haroudm.workers.dev/** (Cloudflare Workers).

## Plan (10 milestones)
Semantic versioning `v0.1.0` → `v1.0.0`:
- **m2** — Quality, tooling & reproducibility
- **m3** — Admin content + **JSON course import** (external authoring, no internal LLM)
- **m4** — Public catalog
- **m5** — Course reader
- **m6** — Dashboards redesign
- **m7** — Admin accounts, monetization & OSS accounting validation
- **m8** — Compliance & security (GDPR, anti-copy, LLM budget)
- **m9** — Full E2E tests & audit
- **m10** — Launch

## In progress
- Validation of the **production smoke test** (m1).
- Documentation: per-milestone devlog, SBOM, revised plan.
- Preparation of milestone **m3** (JSON import: format, upsert, R2 media).
