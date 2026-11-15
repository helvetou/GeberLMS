# Test manual — GeberLMS v0.1.0 (milestone m1)

> **Version**: 0.1.0 · **Milestone**: m1
> **Git**: `main` branch · tag `v0.1.0`
> **Date**: 2026-11-01

Manual testing of version 0.1.0 in a **local** environment (local D1 via Wrangler).

---

## 1. Prerequisites

- Node ≥ 20, npm ≥ 9
- Cloned repo + `npm install` done

## 2. Local database setup

Run in order, at the repo root:

```bash
# 1. apply all migrations (0001 → 0006)
for f in migrations/*.sql; do npx wrangler d1 execute DB --local --file "$f"; done

# 2. create the admin
SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=changeme npx tsx scripts/seed-admin.ts

# 3. create demo data (tutor + learner + 1 course + 1 enrollment)
npx tsx scripts/seed-demo.ts
```

## 3. Startup

```bash
npm run dev
```

Open: **http://localhost:5173**

## 4. Test accounts

- **Admin** — `admin@example.com` / `changeme`
- **Tutor** — `tutor@demo.ee` / `DemoTutor123!`
- **Learner** — `learner@demo.ee` / `DemoLearner123!`

> ⚠️ These passwords are intentionally weak (demo, public repo). Do not reuse in production.

## 5. Automated checks (optional)

```bash
npm test            # 206 domain tests (Vitest)
npm run typecheck   # pure business-logic typing (tsconfig.domain.json)
npm run check       # svelte-check (app + server typing, tsconfig.json)
npm run build       # adapter-cloudflare build
```

> Note: `tsconfig.json` (root) extends `.svelte-kit/tsconfig.json` and covers the app
> (Svelte + server). `tsconfig.domain.json` covers only `src/lib/domain` + `tests`.

## 5.1 Frontend — shadcn-svelte + Tailwind v4

- UI built on **shadcn-svelte** (`bits-ui` primitives) + **Tailwind CSS v4** (CSS-first
  config in `src/app.css` via `@theme` — no `tailwind.config.ts`).
- `components.json`: base `stone`, style `nova`, icons `lucide`, alias `$lib`.
- Components generated in `src/lib/components/ui/` (38 components) — add:
  `npx shadcn-svelte@latest add <component>`.
- Latest additions: `carousel` (embla-carousel-svelte), `chart` (layerchart),
  `calendar`, `resizable` (paneforge), `toggle`.
- Fonts: Inter Variable (`--font-sans`) + Sora (`--font-display`) via Fontsource.
- Light/dark theme via `mode-watcher` (`.dark` variant).
- App Shell layout (Sidebar + Topbar) in `src/lib/components/layout/`.

---

## 6. Test scenarios

### 6.0 — Guided walkthrough (thread)

End-to-end sequence, to follow in order (**admin → tutor → learner**).
Each step: the action, then the "✅ Check" control point. Screen details: see 6.2 → 6.9.

#### Act 1 — Admin (`admin@example.com` / `changeme`)

1. **Login**: `/login` → Email + Password → "Se connecter".
   ✅ redirect `/admin/courses`; sidebar with 6 items.
2. **Create a course** (6.2): "Nouveau cours" → Title `Anglais professionnel`,
   Slug `en-pro`, Language `en`, Price (cents) `5000` → "Créer".
   ✅ the course appears (`€50`).
3. **Structure** (6.2): in the course, "Ajouter un module" (`Module 1`), then
   "Ajouter une leçon" (`Leçon 1`, type `text`) and (`Quiz 1`, type `quiz`), then
   "Ajouter une ressource" (`PDF support`).
   ✅ tree Course → Module → 2 lessons → 1 resource.
4. **Create a coupon** (6.5): "Coupons" → "Nouveau coupon" → Code `BIENVENUE10`,
   Type `%`, Value `10` → "Créer".
   ✅ `BIENVENUE10 — 10 %` in "Existants".
5. **Enroll** (6.4): "Inscrire un apprenant à un cours" → Email `learner@demo.ee`,
   Course `Anglais professionnel`, Coupon `BIENVENUE10` → "Inscrire".
   ✅ "Inscription créée — total 54 €."
6. **Mark paid** (6.6): "Inscriptions & paiements" → "Marquer payé (Payoneer)".
   ✅ "Paiement confirmé — facture INV-…".
7. *(Optional)* **Quiz** (6.7): add a question on `Quiz 1` — do not click
   "Générer (IA)" (cost).
8. **Logout**: avatar menu (top right) → "Déconnexion".

#### Act 2 — Tutor (`tutor@demo.ee` / `DemoTutor123!`)

9. **Login** → ✅ redirect `/tutor`, sidebar with 1 item.
10. **Dashboard** (6.8) → ✅ `Élève Démo` listed with `x/y lessons` progress.
11. **Logout**.

#### Act 3 — Learner (`learner@demo.ee` / `DemoLearner123!`)

12. **Login** → ✅ redirect `/learner`.
13. **Dashboard** (6.9) → ✅ "Français débutant" + "Anglais professionnel" listed.
14. **Progress** (6.9): "Marquer terminée" on a lesson → ✅ `x/y` counter increases.
15. *(If 7 done)* **Quiz** (6.9): answer → "Valider le quiz" → ✅ score displayed.
16. *(Optional)* **Upload** (6.9): "Mes documents" → file → "Déposer".
17. **Logout**.

### 6.1 Global / cross-cutting

- Log in, then check role-based routing:
  - admin → `/admin/courses`
  - tutor → `/tutor`
  - learner → `/learner`
- **Language**: selector top right — FR / EN / AR / DE.
  - In **Arabic**, the interface switches to **RTL** (right-to-left).
- **Theme**: light/dark toggle (sun/moon icon in the topbar).
- **Sidebar**: role-adapted navigation (different items admin/tutor/learner).
- **Logout**: avatar menu (top right) → "Déconnexion" → back to `/login`.
- **Login error**: invalid credentials → red alert on the login page.

### 6.2 Admin — Course management (`/admin/courses`)

- Create a course: title, slug, language (fr/en/ar/de), price **in cents** (0 = free).
- Rename, **hide/show** (visibility), delete a course.
- In a course: add **modules** (title + position), **lessons** (type video / text / quiz), **resources** (title).
- Rename / hide / delete modules, lessons, resources.
- Deleting a course with enrollments is refused (error message).

### 6.3 Admin — Users (`/admin/users`)

- Create an account: email, name, password, role (learner / tutor), "self-payer" option.
- FR-03 reminder: no public registration — only the admin creates accounts.

### 6.4 Admin — Enrollment (`/admin/enroll`)

- Enroll a learner (by their email) in a course.
- Optional coupon: the displayed price includes discount + VAT.

### 6.5 Admin — Coupons (`/admin/coupons`)

- Create a coupon: code, type (**%** or **amount**), value, expiry date, max uses.
- List coupons, enable/disable.

### 6.6 Admin — Payments (`/admin/payments`)

- List enrollments and payments.
- "Marquer payé (Payoneer)" → confirms the payment and generates a (VAT) invoice number.

### 6.7 Admin — Quiz (`/admin/quizzes`)

- List `quiz`-type lessons (with their course/module).
- Add a question: prompt, answers (one per line), correct-answer index (0 = first), points.
- "Générer (IA)": question generation via Workers AI (requires the `AI` binding).

### 6.8 Tutor (`/tutor`)

- Dashboard: list of **funded** learners (guardianship links) and their per-course/lesson progress.

### 6.9 Learner (`/learner`)

- Dashboard: enrolled courses, lessons and progress (x/y lessons).
- "Marquer terminée" on a lesson → updates progress.
- Answer a **quiz** (MCQ) → displayed score (correct/total + %).
- **Upload** documents (R2 storage), optionally attached to a lesson.

---

## 7. Included demo data (`seed-demo.ts`)

- Users: `tutor@demo.ee` (tutor), `learner@demo.ee` (learner).
- 1 tutor → learner guardianship link.
- 1 course "Français débutant" (fr, €100.00 excl. VAT, public), 1 module, 1 lesson (type **text**), 1 active enrollment.

> The demo seed contains **no** quiz: to test the learner quiz, first create a `quiz`-type lesson + questions on the admin side (6.7).

---

## 8. Known limitations of v0.1.0

- **Frontend redesign in progress** (blueprint validated 2026-10-09): public catalog,
  course reader and learner dashboard to be implemented on the generated shadcn-svelte
  components (38 components, incl. carousel/chart/calendar/resizable/toggle).
- The learner sidebar's **"Catalogue"** link points to `/catalog`, a route
  **not yet created** → 404 (planned in the blueprint, coming).
- Only the **login** page has the shadcn "premium" design; the other pages still use
  the old markup (inside the new sidebar/topbar shell).
- The catalog fields added in the DB (migration 0006: description, thumbnail, category,
  level, public visibility, tutor) are **not yet exposed** in the admin UI.
- **Not implemented**: anti-copy (NFR-10), GDPR (NFR-08: consent/erasure),
  LLM budget tracking (NFR-06).
- AI quiz generation (Workers AI) may incur costs and requires access to the `AI` binding.
