# LMS Helveticore — Requirements Specification

Requirements specification document. Number: SPEC-001. Version: 0.1.
Status: **Draft for review**. Methodology: CMMI-DEV level 3 (defined process).

## 1. Purpose and scope

The Helveticore LMS is a platform for selling courses produced by the operator,
operated via **Helveticore OÜ** (Estonia). It enables:

- selling courses to two categories of clients (funded learner, self-paying learner);
- managing promo codes (full or partial discount);
- tracking academic progress;
- providing e-testing and LLM-based quiz generation.

**Out of scope (v1)**: native mobile app, multi-vendor marketplace, integrated videoconferencing.

## 2. Business context

- **Tax**: declarations in Estonia. Invoicing in EUR.
- **Payment**: Payoneer (Helveticore account already validated), withdrawal to a recovery Revolut account (IBAN).
- **VAT**: buyer's country rate (OSS scheme for EU consumers). Outside the EU: no EU VAT.
- **Course languages**: one language among FR, EN, AR, DE (monolingual course).
- **Target volume at launch**: a few dozen users.
- **LLM budget**: ≤ €100/month.

## 3. Actors and roles

| Role | Description |
|------|-------------|
| **Admin** | Operator. Manages courses, resources, coupons, accounts. |
| **Learner** | Follows courses. Either funded by a tutor, or self-paying (`self_payer` flag). |
| **Tutor** | Funds one or more learners and tracks their progress. |

A learner can be funded by a tutor; a self-paying learner funds themselves.
Each enrollment is funded by **a single payer**.

## 4. Functional requirements

Unique identifiers `FR-xx`. Each requirement is testable and traced (see traceability matrix).

### 4.1 Accounts and access

- **FR-01** — The system distinguishes three roles: admin, learner, tutor.
- **FR-02** — A learner is self-paying if `self_payer = true`, otherwise funded.
- **FR-03** — No public self-registration. Learner and tutor accounts are created by the admin (via script / dashboard) after payment.
- **FR-04** — The admin links one or more learners to a tutor.
- **FR-05** — A learner can be enrolled in several courses.
- **FR-06** — Each enrollment is funded by a single payer (the tutor or the learner themselves).
- **FR-07** — A tutor sees only the learners they fund (and not those of other tutors).

### 4.2 Course structure

- **FR-10** — A course is structured into modules → lessons → resources.
- **FR-11** — The admin can add, modify, hide and delete a course, module, lesson or resource.
- **FR-12** — A resource can be hidden without being deleted (reversible visibility).
- **FR-13** — Content is mixed: video, text, quiz.
- **FR-14** — A course is monolingual (FR / EN / AR / DE).
- **FR-48** — The admin can **import a whole course (or a module)** from a **structured JSON** file (external authoring): strict validation, transactional insertion, reconciliation by stable key, and module/lesson reordering (milestone m3).

### 4.3 Tracking and progress

- **FR-20** — The system records academic progress per learner and per lesson.
- **FR-21** — The tutor dashboard shows, for each funded learner: courses, progress and results.
- **FR-22** — The learner dashboard shows their courses, progress and document submissions.
- **FR-23** — Every sensitive action (login, consultation, submission, grading, payment) is logged.
- **FR-24** — A learner can upload a document within a course or lesson.

### 4.4 Assessment

- **FR-30** — The system provides e-testing: quizzes, optional timing, automatic grading.
- **FR-31** — The admin can generate quizzes automatically via an LLM (default: Workers AI / Gemini; option: DeepSeek).

### 4.5 Payment and coupons

- **FR-40** — Payment goes through Payoneer (payment request or checkout); no card data is hosted by the LMS.
- **FR-41** — On Payoneer collection confirmation, access is activated and the learner account can be created by the admin.
- **FR-42** — The admin creates coupons: percentage discount (0–100) or fixed amount (EUR).
- **FR-43** — A 100% coupon means full free access.
- **FR-44** — A coupon can be limited (expiry date, number of uses).
- **FR-45** — Coupons apply to funded learners as well as self-payers.
- **FR-46** — The system computes the price: discount on the net, then VAT at the buyer's country rate.
- **FR-47** — The system generates a (VAT) invoice for each paid enrollment.

## 5. Non-functional requirements

- **NFR-01 (Platform)** — Deployment on Cloudflare (Workers/Pages, D1, R2, KV).
- **NFR-02 (Performance)** — Lightweight structure; target page response time < 1.5 s (p95).
- **NFR-03 (Security)** — No card data in the LMS (Payoneer); strict role-based access control; secrets out of code.
- **NFR-04 (Testability)** — TDD; business logic in pure modules with no infrastructure dependency.
- **NFR-05 (Maintainability)** — Typed code (strict TypeScript), modular, documented.
- **NFR-06 (Cost)** — LLM generation ≤ €100/month.
- **NFR-07 (Scale)** — Sized for a few dozen users at launch.
- **NFR-08 (Compliance)** — VAT/OSS; GDPR (personal data, consent, erasure).
- **NFR-09 (Traceability)** — Audit log of admin and academic actions.
- **NFR-10 (Anti-copy)** — Difficulty of mass extraction of content (see architecture, §5).

## 6. Business rules (BR)

- **BR-01** — Amounts handled in integer cents; no floating-point arithmetic on money.
- **BR-02** — Discount applied to the net price, VAT computed on the discounted amount.
- **BR-03** — Outside the EU: EU VAT rate = 0.
- **BR-04** — A discount can never make the total negative.
- **BR-05** — VAT rates are versioned data, re-validated before production.

## 7. Traceability

Each requirement is linked to at least one test and one module (see `03-processus-cmmi3.md`, §5).
Tracking is done via the requirements → tests → code matrix.
