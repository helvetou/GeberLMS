# The `test_integration_manuel_dev_m1` integration test

File: `tests/domain/integration-manuel-dev-m1.test.ts`

## 1. What is it?

A **Vitest** test that replays the **thread** of the m1 test manual
(`docs/manual-dev-v0.1.0-m1.md`, §6.1 → §6.9) over **pure business logic**.

- **No D1 database**, **no browser**: only pure functions from
  `src/lib/domain/*`, called with in-memory objects.
- The test is split into **4 `it`** blocks: Act 1 (admin), Act 2 (tutor),
  Act 3 (learner), cross-cutting invariants.

## 2. The "fixtures" (starting data)

```ts
const learner: User = { id: 'l1', role: 'learner', selfPayer: false };
const guardianships: Guardianship[] = [{ tutorId: 't1', learnerId: 'l1' }];
const NOW = 1_700_000_000_000; // deterministic timestamp
```

- `learner`: learner `l1`, **not self-paying** → funded by a tutor.
- `guardianships`: `t1 → l1` link (the tutor funds the learner).

### Helper `buildCatalog()`

Builds the "Anglais professionnel" course (id `c1`, **€50.00 excl. VAT**, public):

```ts
let c = emptyCatalog();
c = addCourse(c, { id: 'c1', slug: 'en-pro', title: 'Anglais professionnel',
                   language: 'en', visibility: 'visible', priceCents: 5000, isPublic: true });
c = addModule(c, { id: 'm1', courseId: 'c1', title: 'Module 1', ... });
c = addLesson(c, { id: 'l-text', moduleId: 'm1', title: 'Leçon 1', type: 'text', ... });
c = addLesson(c, { id: 'l-quiz', moduleId: 'm1', title: 'Quiz 1', type: 'quiz', ... });
c = addResource(c, { id: 'r1', lessonId: 'l-text', title: 'PDF support', ... });
```

Each `addX` **validates** the input (valid language, existing parent, no duplicate)
and **returns a new catalog** (immutable) — hence `c = …`.

### Helper `buildEnrollment()`

```ts
return activateEnrollment(
  createEnrollmentForLearner({ id: 'e1', learner, courseId: 'c1', guardianships }),
);
```

- `createEnrollmentForLearner` **resolves the payer**: non-self-paying learner
  → their linked tutor `t1` (FR-06). Initial status `pending`.
- `activateEnrollment` switches the enrollment to `active` (FR-41).

## 3. Act 1 — admin (the money chain)

The sequence: **course → coupon → price → enrollment → payment → invoice**.

```ts
// authz: only the admin manages courses
expect(canManageCourses('admin')).toBe(true);
expect(canManageCourses('tutor')).toBe(false);

// 10% coupon
const coupon: Coupon = { code: 'BIENVENUE10', type: 'percent', value: 10 };
expect(discountFor(coupon, 5000)).toBe(500);

// price: discount on the net, then VAT (BR-02)
const price = computePrice({ netCents: 5000, countryCode: 'FR', coupon });
// → discount 500, discounted net 4500, VAT 20% = 900, total 5400
```

The core invariant (BR-02): **the discount applies first to the net, then
VAT is computed on the discounted amount** — never the other way around.

Then:

```ts
// enrollment: single resolved payer = linked tutor (FR-05/06)
const enrollment = buildEnrollment();
expect(enrollment.payerId).toBe('t1');

// confirmed Payoneer payment (FR-40/41)
const confirmed = confirmPayment(payment, '2026-11-02T10:05:00.000Z');
expect(confirmed.status).toBe('confirmed');

// coherent VAT invoice + numbering (FR-47)
expect(invoice.number).toBe('INV-2026-0001');
expect(() => validateInvoice(invoice)).not.toThrow();       // net + VAT = total
expect(nextInvoiceNumber(invoice.number, 2026)).toBe('INV-2026-0002');
```

## 4. Act 2 — tutor (FR-21, FR-07)

```ts
expect(tutorCanViewLearner(guardianships, 't1', 'l1')).toBe(true);
expect(tutorCanViewLearner(guardianships, 't1', 'l2')).toBe(false); // no link
expect(learnersOfTutor(guardianships, 't1')).toEqual(['l1']);

const d = buildTutorDashboard({ tutorId: 't1', ... });
expect(d.learners.map((l) => l.learnerId)).toEqual(['l1']);
expect(d.learners[0]!.courses[0]!.completedLessons).toBe(1); // 1/2
```

The **FR-07** invariant is **relationship-based security**: a tutor sees only the
learners they have a guardianship link with — not the others.

## 5. Act 3 — learner (FR-22, FR-20, FR-30)

```ts
const d = buildLearnerDashboard({ learnerId: 'l1', ... });
expect(d.courses[0]!.lessons.map((l) => l.status)).toEqual(['completed', 'not_started']);

expect(completionRatio(1, 2)).toBe(0.5); // 1 lesson out of 2

const q: QuizQuestion = { id: 'q1', ..., correctIndex: 0, points: 1 };
expect(gradeQuiz([q], [{ questionId: 'q1', selectedIndex: 0 }]))
  .toEqual({ correct: 1, total: 1, score: 1, maxScore: 1, percentage: 100 });
```

- `buildLearnerDashboard` projects per-lesson progress (FR-22).
- `gradeQuiz` grades automatically (FR-30): correct = 100%, wrong = 0%.

## 6. Cross-cutting invariants

```ts
expect(vatRateForCountry('FR')).toBe(20);
expect(vatRateForCountry('EE')).toBe(22);
expect(vatRateForCountry('US')).toBe(0); // outside EU (BR-03)

expect(hasPermission('tutor', 'course.manage')).toBe(false);
expect(canCreateAccount('learner')).toBe(false); // no self-registration (FR-03)

catalog = setLessonVisibility(catalog, 'l-text', 'hidden');
expect(visibleLessonsOfCourse(catalog, 'c1')).toHaveLength(1); // FR-12

expect(publicCourses(catalog).map((c) => c.id)).toEqual(['c1']); // visible + is_public
```

## 7. Key concepts to remember

- **Immutability**: domain functions **never** mutate the input; they return a new
  value (`[...list, item]`, `{ ...obj, field }`). That's why we write `c = addCourse(c, …)`.
- **Integer cents**: all money is in cents (BR-01), never floats. `5000` = €50.00.
- **Injected clock**: `now`/`completedAt` are passed as parameters to make results
  **deterministic** (no dependence on the real time).
- **Integration ≠ E2E**: this test chains business modules **in memory**.
  The real **browser** flow will be covered in **m9** (Playwright).
