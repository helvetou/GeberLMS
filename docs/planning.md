# Planning — GeberLMS · 10 milestones (m1 → m10)

Revised end-of-implementation plan in **10 milestones** (optimized ordering: Tooling → Creation/Import → Consumption → Monetization/Compliance → Launch).

## Convention — deliverables per milestone

Each milestone **mN** delivers:

- a **directory** `docs/devlog/mN/` (`README.md`, `test-log.md`, `feedback.md`, `howto/`) ;
- a **version** `0.N.0` and a **tag** `v0.N.0` ;
- an **SBOM** (`docs/devlog/mN/SBOM.md` or generated automatically in CI at the `v0.N.0` tag) ;
- a **doc** (versioned test manual `manual-dev-v0.N.0-mN.md`) ;
- a **feedback** recorded in the devlog ;
- an **integration test run locally AND in production** :
  - *local* — Vitest `tests/domain/integration-manuel-dev-mN.test.ts` (business invariants),
  - *production* — HTTP smoke test `scripts/smoke-production.ts` against the deployed URL.

> **Convention:** semantic versioning — m1 = v0.1.0 … m10 = v1.0.0.  
> **Strict rule (Definition of Done):** a milestone is marked `✅ delivered` only when the local test **AND** the production smoke test both pass.

---

## AI architecture & LLM boundary (Clarification)

- **Course authoring (100% external, no internal LLM):** courses, modules and lessons are written externally (Gemini, DeepSeek, etc.) then injected via **JSON Import** (`m3`). The LMS calls no LLM for course creation or editing.
- **Runtime usage (Workers AI):** the Cloudflare Workers AI binding (introduced in `m1`) is strictly reserved for dynamic domain-defined features (e.g. on-the-fly quiz generation/variants), gated by an offline local mock (`m2`) and strict budget quotas (`m8`).

---

## Overview

| Milestone | Version | Tag | Status | Scope |
|-----------|---------|-----|--------|-------|
| m1 | 0.1.0 | v0.1.0 | ⏳ prod to validate | Backend foundation + TDD domain + auth + routes + i18n/RTL + Payoneer + quiz + R2 uploads + app shell |
| m2 | 0.2.0 | v0.2.0 | ⬜ planned | Quality, tooling & reproducibility — idempotent migrations/seeds, local dev without remote AI, Playwright foundation |
| m3 | 0.3.0 | v0.3.0 | ⬜ planned | Admin content + **JSON course import** — CRUD, forms, reordering, transactional import |
| m4 | 0.4.0 | v0.4.0 | ⬜ planned | Public catalog — `/catalog` route, 0006 fields, search/filters, public visibility |
| m5 | 0.5.0 | v0.5.0 | ⬜ planned | Course reader — lesson-player, curriculum, resource-sheet, quiz-player, progress, basic anti-copy |
| m6 | 0.6.0 | v0.6.0 | ⬜ planned | Dashboards redesign — learner + tutor (fed by real progress) |
| m7 | 0.7.0 | v0.7.0 | ⬜ planned | Admin accounts, monetization & **OSS accounting validation** — users, enrollments, coupons, payments |
| m8 | 0.8.0 | v0.8.0 | ⬜ planned | Compliance & security — GDPR, advanced anti-copy (quotas/logs), LLM budget (alerts 80/100 €) |
| m9 | 0.9.0 | v0.9.0 | ⬜ planned | Full E2E tests & audit — complete Playwright suite, replayed audit, coverage ≥ 80 %, p95 < 1.5 s |
| m10 | 1.0.0 | v1.0.0 | ⬜ planned | Launch — final prod deployment, first real courses published, final docs |

---

## Detail per milestone

### m1 — v0.1.0 — Technical foundation & domain (closing)
Foundation: TDD domain (price/VAT/coupons, roles, guardianship, enrollments, catalog,
progress, quiz, payment, invoicing), server auth, admin/tutor/learner routes,
i18n/RTL (FR/EN/AR/DE), Payoneer payment + VAT invoicing, LLM quiz generation
(Workers AI), R2 uploads, app shell (sidebar/topbar).
- Doc: `docs/manual-dev-v0.1.0-m1.md` · SBOM: `docs/devlog/m1/SBOM.md`
- Local test: `tests/domain/integration-manuel-dev-m1.test.ts` ✅
- **Required action before m2:** run and validate `scripts/smoke-production.ts` on the deployed environment.

### m2 — v0.2.0 — Quality, tooling & reproducibility (ex-m8)
Stabilize the development environment before tackling UI features:
- Idempotent migrations and seeds.
- Localization of server/domain messages.
- Documented `CLOUDFLARE_API_TOKEN` prerequisite + local dev mode without remote AI binding (local mock).
- Initialize the Playwright foundation (1 basic browser smoke test) to avoid a tunnel effect in `m9`.
- *Fixes audit gaps §7.1, §7.3, §7.4, §7.5.*

### m3 — v0.3.0 — Admin content + course import (ex-m5)
Feeds the platform with real courses from the start:
- Tables + `form` component (formsnap/superforms/zod).
- CRUD courses/modules/lessons/resources (0006 fields + public visibility `is_public`).
- **Enriched JSON import** (see § Import below) + upsert strategy.
- Module and lesson reordering (`position` + "move up/down" actions).

### m4 — v0.4.0 — Public catalog (ex-m2)
Public `/catalog` route (anonymous), tested with courses imported in `m3`:
- List with `course-card`, search bar, filters (category, level, language).
- Course detail page + syllabus (modules/lessons).
- Exposure of 0006 fields (`description`, `thumbnail_url`, `category`, `level`, `is_public`).
- Closes the "Catalog" 404.

### m5 — v0.5.0 — Course reader (ex-m3)
Reading of a course by an enrolled learner:
- Components: `lesson-player` (text/markdown, video), `curriculum-accordion`, `resource-sheet`, `quiz-player`.
- Progress tracking ("mark complete", percentage calculation) and learner work upload (R2).
- Basic anti-copy: on-the-fly rendering, no mass export, dynamic watermark (learner identifier).

### m6 — v0.6.0 — Dashboards redesign (ex-m4)
shadcn redesign of the dashboards, wired to the reader's real data (`m5`):
- **Learner:** `stat-card`, `continue-learning`, `progress-list`, `activity-feed`.
- **Tutor:** funded-learner tracking (guardianship) + detailed progress.

### m7 — v0.7.0 — Admin accounts, monetization & accounting validation (ex-m6 + OSS)
Financial management and early legal validation:
- Admin forms: users, manual enrollments, coupons (with enable/disable toggle — *fixes audit gap §7.2*), payments, quiz moderation.
- **Invoicing/VAT/OSS accounting validation:** audit of generated invoices (legal mentions, sequential numbering, VAT/OSS rates) with the accountant, to allow adjustments before `v1.0.0`.

### m8 — v0.8.0 — Compliance & security (ex-m7)
Hardening before pre-production:
- **GDPR:** consent management, personal-data export, right to erasure (anonymization of invoices/progress).
- **Advanced anti-copy:** per-user request quotas + logging of suspicious behavior (scraping).
- **LLM budget:** Workers AI consumption tracking + circuit breaker and alerts at €80 / €100.

### m9 — v0.9.0 — Full E2E tests & audit
Global pre-launch validation:
- Extension of the Playwright suite to all critical flows (enrollment → payment → reading → quiz → invoice).
- Full compliance audit replayed clean.
- Domain test coverage ≥ 80 %.
- Load tests and performance validation: latency `p95 < 1.5 s`.

### m10 — v1.0.0 — Launch
Final production rollout:
- Final production deployment.
- Publication of the first real courses from the import pipeline (pedagogically validated).
- Final operations documentation (runbook) and `v1.0.0` tag.

---

## Course import — Phase 1 (admin content, no LLM)

Authoring is **external**: content is generated and reviewed outside the LMS (via Gemini, DeepSeek, or manual writing), then imported via a JSON file.

- **Import a whole course**: structured JSON → Zod validation → insert/update course + modules + lessons + resources + quiz in a single D1/SQLite transaction.
- **Import a module**: insert a module (+ its lessons) into an existing course.
- **Modify / reorder a module**: rename (exists), hide (exists), **reorder** (`position` + "move up/down" actions).

### Enriched import format (JSON)

```json
{
  "title": "Verilog pour débutants",
  "slug": "verilog-debutants",
  "language": "fr",
  "description": "Maîtrisez les bases de la conception numérique sur FPGA en Verilog.",
  "thumbnail_key": "courses/verilog-debutants/thumb.webp",
  "category": "fpga",
  "level": "debutant",
  "is_public": false,
  "price_cents": 4900,
  "currency": "EUR",
  "modules": [
    {
      "key": "fondations",
      "title": "Fondations",
      "position": 1,
      "lessons": [
        {
          "key": "combinatoire-vs-sequentiel",
          "title": "Combinatoire vs séquentiel",
          "position": 1,
          "type": "text",
          "content_markdown": "# Introduction\nUn circuit combinatoire...",
          "resources": [
            {
              "key": "cheatsheet-verilog",
              "title": "Aide-mémoire syntaxe Verilog (PDF)",
              "r2_key": "courses/verilog-debutants/cheatsheet.pdf"
            }
          ]
        },
        {
          "key": "sim-icarus-verilog",
          "title": "Simulation avec Icarus Verilog",
          "position": 2,
          "type": "video",
          "video_url": "courses/verilog-debutants/sim-icarus.mp4",
          "duration_seconds": 420
        },
        {
          "key": "quiz-rappel",
          "title": "Quiz de rappel",
          "position": 3,
          "type": "quiz",
          "quiz_data": {
            "passing_score": 80,
            "questions": [
              {
                "question": "Quel bloc procédural est utilisé pour la logique séquentielle ?",
                "options": ["assign", "always @(posedge clk)", "initial", "generate"],
                "correct_index": 1,
                "explanation": "always @(posedge clk) décrit un comportement déclenché sur front d'horloge."
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### Invariants to test (domain — m3)

- **Strict validation:** valid language (`fr` | `en` | `ar` | `de`) ; valid lesson types (`video` | `text` | `quiz`) ; non-empty titles ; `slug` in unique kebab-case format.
- **Polymorphic lesson coherence:**
  - `type === "text"` requires non-empty `content_markdown` ;
  - `type === "video"` requires non-empty `video_url` ;
  - `type === "quiz"` requires valid `quiz_data` (at least 1 question and `correct_index` within `options` bounds).
- **Ordering:** `position` auto-assigned in JSON array order if omitted, or respected if explicit (no duplicates within a parent).
- **Reconciliation key:** `key` stable and unique per parent (module within the course, lesson within the module, resource within the lesson) — upsert reconciles on `key`, never on `title`/`position`; learner progress is preserved.
- **Relative media references:** `thumbnail_key`, `video_url` and `r2_key` are **relative** R2 keys (no absolute URL); the application prefixes the bucket's public URL per environment.
- **R2 media existence:** each referenced key is checked at import (presence in the bucket).
- **Idempotence & Upsert (`mode: "strict" | "upsert"`):**
  - In `strict` mode (default): explicit refusal if the `slug` already exists.
  - In `upsert` mode: update of metadata and module/lesson content without deleting the course ID or breaking existing learner enrollments and progress.
- **Reordering:** atomic update of `position`, order reflected by `nestCatalog`.

---

## Backlog — future ideas (Phase 2, post-v1.0.0)

- **Math: LLM + symbolic-solver hybrid** — the LLM generates the statement, a symbolic solver (SymPy/SageMath) computes the exact answer + step-by-step solution. To study: where the solver runs (Cloudflare Containers / external service / Pyodide WASM).
- **One LLM per use, not one global LLM** — dedicated model/tuning per use (language vocabulary, question variants…). Generalize `QuizLlm`.
- **In-course AI-assisted pedagogy** — selective Workers AI during learning (math, languages, learning tracking); authoring remains external + import.

## Drone input

The job-market drone's course/project proposals arrive in `input-job-market-survey-drone/` (see `docs/sharedDirwithDrone.md`) and directly feed the JSON import files from milestone **m3**, as well as catalog prioritization (**m4**).
