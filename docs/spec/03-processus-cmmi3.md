# LMS Helveticore — Process (CMMI-DEV level 3)

Process document. Number: SPEC-003. Version: 0.1.

## 1. Purpose

This document defines the project's **standard development process**, aligned with the
spirit of CMMI-DEV level 3: documented, standardized, adaptable process, with peer
reviews, traceability and measurement. The implementation methodology is **TDD**.

## 2. Standard lifecycle

```
Requirement ──► Design ──► Implementation (TDD) ──► Verification ──► Validation ──► Delivery
                │              │                     │                 │              │
              review        code review          green tests       business review  deployment
```

Each requirement traverses the whole cycle. Nothing is "done" until verification
(tests) passes and the review is traced.

## 3. TDD — working rules

Strict loop: **Red → Green → Refactor**.

1. Write a test expressing the expected behavior (it fails: *red*).
2. Write the minimum code to pass the test (*green*).
3. Refactor without changing behavior (tests stay green).
4. Commit per validated increment.

Rules:

- No production code without a test covering it.
- Business logic in `src/lib/domain`, tested by Vitest without infrastructure.
- A test expresses a behavior, not an implementation.
- The test suite is part of the Definition of Done (DoD).

Example already in place: `domain/pricing`, `domain/coupon`, `domain/vat` + 23 green tests.

## 4. Review gates

| Gate | When | Exit criterion |
|------|------|----------------|
| G1 Requirements | end of SPEC-001 | requirements identified, testable, traced |
| G2 Design | before coding | architecture + data model approved |
| G3 Code | end of a requirement | green tests + peer review |
| G4 Verification | before delivery | full suite green, clean typecheck |
| G5 Validation | before prod | business scenarios validated by the operator |

Any blocking gate is documented and must be cleared before continuing.

## 5. Traceability matrix

Each requirement is linked to its implementation and its tests. Initial extract:

| Requirement | Module | Tests |
|----------|--------|-------|
| FR-01 / FR-03 | `src/lib/domain/roles.ts` | `tests/domain/roles.test.ts` |
| FR-02 | `src/lib/domain/user.ts` | `tests/domain/user.test.ts` |
| FR-04 / FR-07 | `src/lib/domain/guardianship.ts` | `tests/domain/guardianship.test.ts` |
| FR-05 / FR-06 | `src/lib/domain/enrollment.ts` | `tests/domain/enrollment.test.ts` |
| FR-13 / FR-14 | `src/lib/domain/content.ts` | `tests/domain/content.test.ts` |
| FR-10 / FR-11 / FR-12 | `src/lib/domain/catalog.ts` | `tests/domain/catalog.test.ts` |
| FR-42 / FR-43 / FR-44 | `src/lib/domain/coupon.ts` | `tests/domain/coupon.test.ts` |
| FR-46 / BR-01 / BR-02 / BR-03 / BR-04 | `src/lib/domain/pricing.ts` | `tests/domain/pricing.test.ts` |
| NFR-08 / BR-05 | `src/lib/domain/vat.ts` | `tests/domain/vat.test.ts` |
| FR-03 | `src/lib/domain/authz.ts` | `tests/domain/authz.test.ts` |
| NFR-03 (auth) | `src/lib/domain/password.ts`, `session.ts` | `tests/domain/password.test.ts`, `session.test.ts` |
| FR-20 | `src/lib/domain/progress.ts` | `tests/domain/progress.test.ts` |
| FR-21 | `src/lib/domain/dashboard.ts` | `tests/domain/dashboard.test.ts` |
| FR-22 | `src/lib/domain/dashboard.ts` | `tests/domain/dashboard.test.ts` |
| FR-23 | `src/lib/domain/activity.ts` | `tests/domain/activity.test.ts` |
| FR-24 | `src/lib/domain/upload.ts` | `tests/domain/upload.test.ts` |
| FR-30 | `src/lib/domain/quiz.ts` | `tests/domain/quiz.test.ts` |
| FR-31 | `src/lib/domain/quiz.ts` | `tests/domain/quiz.test.ts` |
| FR-40 / FR-41 | `src/lib/domain/payment.ts`, `enrollment.ts` | `tests/domain/payment.test.ts`, `enrollment.test.ts` |
| FR-47 | `src/lib/domain/invoice.ts` | `tests/domain/invoice.test.ts` |

The full matrix is kept up to date with each added requirement.

## 6. Risk management (initial register)

| Id | Risk | Severity | Mitigation |
|----|------|---------|------------|
| R-01 | Payoneer integration mode to confirm (semi-manual payment request vs automated checkout) and availability for an Estonian merchant | Medium | Validate the exact Payoneer product; the semi-manual flow fits the "account created by admin" model. |
| R-02 | Inaccurate/outdated EU VAT rates (OSS) | High | Versioned table + official re-validation before prod. |
| R-03 | LLM cost out of budget | Medium | Monthly tracking, alert at €80, generation cache. |
| R-04 | Anti-copy bypassed (capture) | Medium | Deterrence + logging; no false promise of impermeability. |
| R-05 | Access leak between tutors | High | Per-payer access control tested systematically. |
| R-06 | GDPR non-compliance | Medium | Consent, minimization, right to erasure. |

## 7. Measures and indicators

- Domain test coverage (target: ≥ 80% on `domain`).
- Defects per delivery.
- Cycle time (requirement → delivered).
- Monthly LLM spend (threshold: €100).
- p95 response time (threshold: 1.5 s).

## 8. Configuration management

- Code under Git (protected `main` branch, atomic commits).
- Semantic versioning.
- Secrets out of the repo (`.env`, `.dev.vars`, never committed).
- Spec documents versioned with the code.
- **Definition of Done per milestone**: a milestone is marked `✅ delivered` only when the local integration test (Vitest) **and** the production smoke test (HTTP) both pass.
- **SBOM per milestone**: `docs/devlog/mN/SBOM.md` (or generated in CI at the `v0.N.0` tag).
