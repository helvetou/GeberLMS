# Feedback — Milestone m1

Experience feedback on the current milestone (GeberLMS v0.1.0).

## Positives

- Environment ready: local DB already migrated, `npm run dev` starts without the
  `CLOUDFLARE_API_TOKEN` error (Cloudflare credentials present).
- The `test_integration_manuel_dev_m1` integration test automates the flow
  and avoids wasting time on manual-testing bugs.

## Blockers / improvements

- **500 Internal Error on enrollment**: re-enrolling a learner already enrolled in a
  course caused an unhandled SQLite error (`UNIQUE` constraint). **Fixed**: duplicate
  check in `enrollLearner` + clear message.
- **Hard-to-see quiz form**: "Ajouter une question" was hidden in a collapsed
  `<details>`. **Fixed**: open by default (`<details open>`).
- **Deleting an enrolled course**: the refusal is correct (§6.2), but the message
  "Cours avec inscriptions — suppression refusée" is a plain, hard-to-see paragraph
  → to be styled (red alert) later.
- Manual §6.5 announces coupon "enable/disable", but this toggle is not
  implemented (audit gap §7.2).
- Non-idempotent migrations (audit gap §7.3, planned in m8).

## Suggestions

- Add a real browser E2E test (Playwright) in m9 to cover the §6.0 flow.
- Fix manual §6.5 (remove "enable/disable" as long as the toggle doesn't exist).
- Style action errors (`form.error`) as a red alert, like the login page.

## Open questions

-
