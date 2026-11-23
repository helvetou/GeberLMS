# GeberLMS — Project status

## Overview
**GeberLMS** is the Learning Management System of **Helveticore OÜ** (Estonia) for selling online courses (FR / EN / AR / DE). Stack: **SvelteKit + Cloudflare** (D1, R2, Workers AI).

## Current version
- **v1.0.0** — milestone **m10** (tag `v1.0.0`)
- Status: **delivered** (local + production)
- Production: **https://geberlms.haroudm.workers.dev/**

## What is implemented (m1 → m10)
- Pure, tested business logic (TDD): price/VAT/coupons, roles, tutor↔learner guardianship, enrollments, catalog, progress, quiz, payment, invoicing, GDPR, LLM budget, anti-copy.
- Server authentication (sessions) + 3 roles (admin, tutor, learner).
- Tutor and learner dashboards (progress, activity, stats).
- Course catalog, content (modules → lessons → resources) and **JSON course import** (FR-48).
- Public catalog `/catalog` (search/filters) + course reader.
- Coupons (% / amount) + enable/disable + price/VAT calculation (OSS scheme).
- Payoneer payment + VAT invoicing (sequential numbering, admin view).
- E-testing (quiz) + LLM quiz generation (Workers AI) + budget tracking.
- Learner document uploads (R2).
- Internationalization + RTL (FR / EN / AR / DE).
- UI: app shell, shadcn-svelte + Tailwind CSS v4.
- GDPR (consent, export, erasure).

## Quality & tests
- **255 automated tests** (26 files) — all green.
- Domain coverage **98.79 %** (≥ 80 % target).
- Typecheck, svelte-check (0 errors / 0 warnings) and build: OK.
- Production smoke test 3/3 (latency max 572 ms) + E2E Playwright 3/3.

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
