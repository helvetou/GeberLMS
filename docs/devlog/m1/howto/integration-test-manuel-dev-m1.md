# Le test d'intégration `test_integration_manuel_dev_m1`

Fichier : `tests/domain/integration-manuel-dev-m1.test.ts`

## 1. C'est quoi ?

Un test **Vitest** qui rejoue le **fil conducteur** du manuel de test m1
(`docs/manual-dev-v0.1.0-m1.md`, §6.1 → §6.9) sur la **logique métier pure**.

- **Pas de base D1**, **pas de navigateur** : uniquement des fonctions pures de
  `src/lib/domain/*`, appelées avec des objets en mémoire.
- Le test est découpé en **4 `it`** : Acte 1 (admin), Acte 2 (tuteur),
  Acte 3 (apprenant), Invariants transversaux.

## 2. Les « fixtures » (données de départ)

```ts
const learner: User = { id: 'l1', role: 'learner', selfPayer: false };
const guardianships: Guardianship[] = [{ tutorId: 't1', learnerId: 'l1' }];
const NOW = 1_700_000_000_000; // horodatage déterministe
```

- `learner` : apprenant `l1`, **non auto-payeur** → il est financé par un tuteur.
- `guardianships` : liaison `t1 → l1` (le tuteur finance l'apprenant).

### Helper `buildCatalog()`

Construit le cours « Anglais professionnel » (id `c1`, **50,00 € HT**, public) :

```ts
let c = emptyCatalog();
c = addCourse(c, { id: 'c1', slug: 'en-pro', title: 'Anglais professionnel',
                   language: 'en', visibility: 'visible', priceCents: 5000, isPublic: true });
c = addModule(c, { id: 'm1', courseId: 'c1', title: 'Module 1', ... });
c = addLesson(c, { id: 'l-text', moduleId: 'm1', title: 'Leçon 1', type: 'text', ... });
c = addLesson(c, { id: 'l-quiz', moduleId: 'm1', title: 'Quiz 1', type: 'quiz', ... });
c = addResource(c, { id: 'r1', lessonId: 'l-text', title: 'PDF support', ... });
```

Chaque `addX` **valide** l'entrée (langue valide, parent existant, pas de doublon)
et **retourne un nouveau catalogue** (immuable) — on réaffecte `c = …`.

### Helper `buildEnrollment()`

```ts
return activateEnrollment(
  createEnrollmentForLearner({ id: 'e1', learner, courseId: 'c1', guardianships }),
);
```

- `createEnrollmentForLearner` **résout le payeur** : apprenant non auto-payeur
  → son tuteur lié `t1` (FR-06). Statut initial `pending`.
- `activateEnrollment` passe l'inscription à `active` (FR-41).

## 3. Acte 1 — admin (la chaîne monétaire)

L'enchaînement : **cours → coupon → prix → inscription → paiement → facture**.

```ts
// authz : seul l'admin gère les cours
expect(canManageCourses('admin')).toBe(true);
expect(canManageCourses('tutor')).toBe(false);

// coupon 10 %
const coupon: Coupon = { code: 'BIENVENUE10', type: 'percent', value: 10 };
expect(discountFor(coupon, 5000)).toBe(500);

// prix : remise sur le net, puis TVA (BR-02)
const price = computePrice({ netCents: 5000, countryCode: 'FR', coupon });
// → discount 500, net remisé 4500, TVA 20 % = 900, total 5400
```

Le cœur de l'invariant (BR-02) : **la remise s'applique d'abord sur le net, puis
la TVA est calculée sur le montant remisé** — jamais l'inverse.

Puis :

```ts
// inscription : payeur unique résolu = tuteur lié (FR-05/06)
const enrollment = buildEnrollment();
expect(enrollment.payerId).toBe('t1');

// paiement Payoneer confirmé (FR-40/41)
const confirmed = confirmPayment(payment, '2026-11-02T10:05:00.000Z');
expect(confirmed.status).toBe('confirmed');

// facture TVA cohérente + numérotation (FR-47)
expect(invoice.number).toBe('INV-2026-0001');
expect(() => validateInvoice(invoice)).not.toThrow();       // net + TVA = total
expect(nextInvoiceNumber(invoice.number, 2026)).toBe('INV-2026-0002');
```

## 4. Acte 2 — tuteur (FR-21, FR-07)

```ts
expect(tutorCanViewLearner(guardianships, 't1', 'l1')).toBe(true);
expect(tutorCanViewLearner(guardianships, 't1', 'l2')).toBe(false); // pas de lien
expect(learnersOfTutor(guardianships, 't1')).toEqual(['l1']);

const d = buildTutorDashboard({ tutorId: 't1', ... });
expect(d.learners.map((l) => l.learnerId)).toEqual(['l1']);
expect(d.learners[0]!.courses[0]!.completedLessons).toBe(1); // 1/2
```

L'invariant **FR-07** est la **sécurité par relation** : un tuteur ne voit que les
apprenants avec lesquels il a un lien de tutelle — pas les autres.

## 5. Acte 3 — apprenant (FR-22, FR-20, FR-30)

```ts
const d = buildLearnerDashboard({ learnerId: 'l1', ... });
expect(d.courses[0]!.lessons.map((l) => l.status)).toEqual(['completed', 'not_started']);

expect(completionRatio(1, 2)).toBe(0.5); // 1 leçon sur 2

const q: QuizQuestion = { id: 'q1', ..., correctIndex: 0, points: 1 };
expect(gradeQuiz([q], [{ questionId: 'q1', selectedIndex: 0 }]))
  .toEqual({ correct: 1, total: 1, score: 1, maxScore: 1, percentage: 100 });
```

- `buildLearnerDashboard` projette la progression **par leçon** (FR-22).
- `gradeQuiz` corrige automatiquement (FR-30) : bonne réponse = 100 %, mauvaise = 0 %.

## 6. Invariants transversaux

```ts
expect(vatRateForCountry('FR')).toBe(20);
expect(vatRateForCountry('EE')).toBe(22);
expect(vatRateForCountry('US')).toBe(0); // hors UE (BR-03)

expect(hasPermission('tutor', 'course.manage')).toBe(false);
expect(canCreateAccount('learner')).toBe(false); // pas d'auto-inscription (FR-03)

catalog = setLessonVisibility(catalog, 'l-text', 'hidden');
expect(visibleLessonsOfCourse(catalog, 'c1')).toHaveLength(1); // FR-12

expect(publicCourses(catalog).map((c) => c.id)).toEqual(['c1']); // visible + is_public
```

## 7. Concepts clés à retenir

- **Immutabilité** : les fonctions du domaine ne modifient **jamais** l'entrée ;
  elles retournent une nouvelle valeur (`[...list, item]`, `{ ...obj, champ }`).
  C'est pour ça qu'on écrit `c = addCourse(c, …)`.
- **Centimes entiers** : tout l'argent est en centimes (BR-01), jamais en flottant.
  `5000` = 50,00 €.
- **Horloge injectée** : `now`/`completedAt` sont passés en paramètre pour rendre
  les résultats **déterministes** (pas de dépendance à l'heure réelle).
- **Intégration ≠ E2E** : ce test enchaîne des modules métier **en mémoire**.
  Le vrai parcours **navigateur** sera couvert en **m9** (Playwright).
