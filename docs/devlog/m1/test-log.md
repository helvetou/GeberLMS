# Test log — Milestone m1

Test-session journal for the current milestone (GeberLMS v0.1.0).

## Entry template

### [YYYY-MM-DD] — <tested subject>

- **Context**: …
- **Steps**: …
- **Expected result**: …
- **Observed result**: …
- **Verdict**: PASS / FAIL / BLOCKED
- **Notes**: …

## Sessions

### [2026-11-02] — §1 Prerequisites

- **Context**: check the environment before starting.
- **Steps**: `node --version`, `npm --version`.
- **Expected result**: Node ≥ 20, npm ≥ 9.
- **Observed result**: Node v22.22.1, npm 9.2.0.
- **Verdict**: PASS
- **Notes**: —

### [2026-11-02] — §2 Local database setup

- **Context**: apply migrations + seeds.
- **Steps**: loop `for f in migrations/*.sql; do npx wrangler d1 execute DB --local --file "$f"; done`.
- **Expected result**: 6 migrations applied.
- **Observed result**: 6 `already exists` / `duplicate column` errors → DB already migrated. seed-admin / seed-demo not re-run (already done).
- **Verdict**: PASS (DB already up to date)
- **Notes**: migration non-idempotence = audit gap §7.3, fixed in m8.

### [2026-11-02] — §3 Startup

- **Context**: start the dev server.
- **Steps**: `npm run dev`.
- **Expected result**: server on http://localhost:5173.
- **Observed result**: Vite v6.4.3 "ready", `Local: http://localhost:5173/`; "Establishing remote connection…" (Cloudflare proxy) without error; warning "AI bindings always access remote resources"; `[404] GET /favicon.png`; no `CLOUDFLARE_API_TOKEN` failure.
- **Verdict**: PASS
- **Notes**: starts without the `CLOUDFLARE_API_TOKEN` error reported by audit §7.1 (Cloudflare credentials present). Remote `AI` binding → possible costs (§6.7). Deprecated `punycode` warning (harmless). Missing `favicon.png` (minor).

### [2026-11-02] — Integration test `test_integration_manuel_dev_m1`

- **Context**: automate the manual flow (thread) to avoid wasting time on manual-testing bugs.
- **Steps**: creation of `tests/domain/integration-manuel-dev-m1.test.ts`; run `npm test`.
- **Expected result**: the new test passes + the suite stays green.
- **Observed result**: 210 tests passed (206 existing + 4 new), 22 files.
- **Verdict**: PASS
- **Notes**: **domain** integration test (not browser E2E — planned in m9). Explanation: `howto/integration-test-manuel-dev-m1.md`.

### [2026-11-03] — Act 1 (browser) — §6.0 flow

- **Context**: manual Act 1 (admin) browser testing.
- **Steps**: course creation, structuring, coupon, enrollment, payment, quiz.
- **Expected result**: the whole admin flow works.
- **Observed result**:
  1. Deleting "Français débutant" refused (course with enrollments) → **correct behavior** (§6.2), but hard-to-see message.
  2. **500 Internal Error** on enrollment: re-enrolling an already-enrolled learner → unhandled `UNIQUE(learner_id, course_id)` constraint.
  3. "Ajouter une question" form hidden in a collapsed `<details>` → hard to find.
- **Verdict**: FAIL (2 real issues) → **fixed**
- **Notes**: fix #2 = duplicate check in `enrollLearner` (server); fix #3 = `<details open>` on the quiz page.
