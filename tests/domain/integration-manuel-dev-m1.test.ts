/**
 * Test d'intégration — parcours du manuel de test m1 (v0.1.0).
 *
 * Reprend le « fil conducteur » du manuel `docs/manual-dev-v0.1.0-m1.md`
 * (§6.1 → §6.9) et le vérifie en chaîne sur la logique métier pure :
 *
 *   Acte 1 (admin)  : cours → coupon → prix (remise + TVA) → inscription → paiement → facture.
 *   Acte 2 (tuteur) : dashboard des apprenants financés (FR-21, FR-07).
 *   Acte 3 (apprenant) : dashboard, progression, quiz (FR-22, FR-20, FR-30).
 *
 * Les invariants transversaux (TVA, rôles/authz, visibilité, catalogue public)
 * sont vérifiés dans un bloc dédié.
 */
import { describe, it, expect } from 'vitest';

import { computePrice } from '../../src/lib/domain/pricing';
import { discountFor, type Coupon } from '../../src/lib/domain/coupon';
import { vatRateForCountry } from '../../src/lib/domain/vat';
import {
  addCourse,
  addLesson,
  addModule,
  addResource,
  emptyCatalog,
  publicCourses,
  setLessonVisibility,
  visibleLessonsOfCourse,
  type Catalog,
} from '../../src/lib/domain/catalog';
import {
  activateEnrollment,
  createEnrollmentForLearner,
  type Enrollment,
} from '../../src/lib/domain/enrollment';
import {
  completedLessonIds,
  completionRatio,
  recordProgress,
  type ProgressEntry,
} from '../../src/lib/domain/progress';
import {
  buildLearnerDashboard,
  buildTutorDashboard,
} from '../../src/lib/domain/dashboard';
import { confirmPayment, type Payment } from '../../src/lib/domain/payment';
import {
  formatInvoiceNumber,
  nextInvoiceNumber,
  validateInvoice,
  type Invoice,
} from '../../src/lib/domain/invoice';
import { gradeQuiz, type QuizQuestion } from '../../src/lib/domain/quiz';
import {
  canCreateAccount,
  canManageCoupons,
  canManageCourses,
} from '../../src/lib/domain/authz';
import { hasPermission } from '../../src/lib/domain/roles';
import {
  learnersOfTutor,
  tutorCanViewLearner,
  type Guardianship,
} from '../../src/lib/domain/guardianship';
import type { User } from '../../src/lib/domain/user';

describe('test_integration_manuel_dev_m1', () => {
  // ─── Fixtures (données de démo du manuel §7) ─────────────────────────────
  const learner: User = { id: 'l1', role: 'learner', selfPayer: false };
  const guardianships: Guardianship[] = [{ tutorId: 't1', learnerId: 'l1' }];

  const NOW = 1_700_000_000_000; // horodatage déterministe

  /** Construit le cours « Anglais professionnel » de l'Acte 1 (§6.2). */
  function buildCatalog(): Catalog {
    let c = emptyCatalog();
    c = addCourse(c, {
      id: 'c1',
      slug: 'en-pro',
      title: 'Anglais professionnel',
      language: 'en',
      visibility: 'visible',
      priceCents: 5000, // 50,00 € HT
      isPublic: true,
    });
    c = addModule(c, { id: 'm1', courseId: 'c1', title: 'Module 1', visibility: 'visible', position: 0 });
    c = addLesson(c, { id: 'l-text', moduleId: 'm1', title: 'Leçon 1', type: 'text', visibility: 'visible', position: 0 });
    c = addLesson(c, { id: 'l-quiz', moduleId: 'm1', title: 'Quiz 1', type: 'quiz', visibility: 'visible', position: 1 });
    c = addResource(c, { id: 'r1', lessonId: 'l-text', title: 'PDF support', visibility: 'visible' });
    return c;
  }

  /** Inscription active de l'apprenant (démo) au cours c1, financée par t1. */
  function buildEnrollment(): Enrollment {
    return activateEnrollment(
      createEnrollmentForLearner({
        id: 'e1',
        learner,
        courseId: 'c1',
        guardianships,
      }),
    );
  }

  it('Acte 1 (admin) : cours → coupon → prix → inscription → paiement → facture', () => {
    // §6.2 / FR-03 : seul l'admin gère les cours
    expect(canManageCourses('admin')).toBe(true);
    expect(canManageCourses('tutor')).toBe(false);

    const catalog = buildCatalog();
    expect(catalog.courses).toHaveLength(1);
    expect(visibleLessonsOfCourse(catalog, 'c1')).toHaveLength(2); // FR-12

    // §6.5 : coupon 10 %
    const coupon: Coupon = { code: 'BIENVENUE10', type: 'percent', value: 10 };
    expect(discountFor(coupon, 5000)).toBe(500);

    // §6.4 / FR-46 / BR-02 : remise sur le net, puis TVA au pays de l'acheteur
    const price = computePrice({ netCents: 5000, countryCode: 'FR', coupon });
    expect(price.discountCents).toBe(500);
    expect(price.discountedNetCents).toBe(4500);
    expect(price.vatRatePercent).toBe(20);
    expect(price.vatCents).toBe(900);
    expect(price.totalCents).toBe(5400); // 54,00 € TTC

    // §6.4 / FR-05 / FR-06 : inscription, payeur unique résolu = tuteur lié
    const enrollment = buildEnrollment();
    expect(enrollment.payerId).toBe('t1');
    expect(enrollment.status).toBe('active');

    // §6.6 / FR-40 / FR-41 : confirmation du paiement Payoneer
    const payment: Payment = {
      id: 'pay1',
      enrollmentId: 'e1',
      provider: 'payoneer',
      amountCents: price.totalCents,
      currency: 'EUR',
      status: 'pending',
      createdAt: '2026-11-02T10:00:00.000Z',
    };
    const confirmed = confirmPayment(payment, '2026-11-02T10:05:00.000Z');
    expect(confirmed.status).toBe('confirmed');
    expect(confirmed.amountCents).toBe(5400);

    // §6.6 / FR-47 : facture TVA cohérente + numérotation séquentielle
    const invoice: Invoice = {
      id: 'inv1',
      enrollmentId: 'e1',
      number: formatInvoiceNumber(2026, 1),
      netCents: price.discountedNetCents,
      vatRatePercent: price.vatRatePercent,
      vatCents: price.vatCents,
      totalCents: price.totalCents,
      createdAt: '2026-11-02T10:05:00.000Z',
    };
    expect(invoice.number).toBe('INV-2026-0001');
    expect(() => validateInvoice(invoice)).not.toThrow();
    expect(nextInvoiceNumber(invoice.number, 2026)).toBe('INV-2026-0002');
  });

  it('Acte 2 (tuteur) : dashboard des apprenants financés (FR-21, FR-07)', () => {
    const catalog = buildCatalog();
    const enrollment = buildEnrollment();
    const progress: ProgressEntry[] = [
      recordProgress({ id: 'p1', enrollmentId: 'e1', lessonId: 'l-text', status: 'completed', now: NOW }),
    ];

    // FR-07 : le tuteur ne voit que ses apprenants liés
    expect(tutorCanViewLearner(guardianships, 't1', 'l1')).toBe(true);
    expect(tutorCanViewLearner(guardianships, 't1', 'l2')).toBe(false);
    expect(learnersOfTutor(guardianships, 't1')).toEqual(['l1']);

    // FR-21 : vue tuteur
    const d = buildTutorDashboard({
      tutorId: 't1',
      guardianships,
      enrollments: [enrollment],
      catalog,
      progress,
    });
    expect(d.learners.map((l) => l.learnerId)).toEqual(['l1']);
    const course = d.learners[0]!.courses[0]!;
    expect(course.title).toBe('Anglais professionnel');
    expect(course.completedLessons).toBe(1);
    expect(course.totalLessons).toBe(2);
  });

  it('Acte 3 (apprenant) : dashboard, progression, quiz (FR-22, FR-20, FR-30)', () => {
    const catalog = buildCatalog();
    const enrollment = buildEnrollment();
    const progress: ProgressEntry[] = [
      recordProgress({ id: 'p1', enrollmentId: 'e1', lessonId: 'l-text', status: 'completed', now: NOW }),
    ];

    // FR-22 : vue apprenant
    const d = buildLearnerDashboard({
      learnerId: 'l1',
      enrollments: [enrollment],
      catalog,
      progress,
    });
    expect(d.courses).toHaveLength(1);
    const course = d.courses[0]!;
    expect(course.title).toBe('Anglais professionnel');
    expect(course.completedLessons).toBe(1);
    expect(course.totalLessons).toBe(2);
    expect(course.lessons.map((l) => l.status)).toEqual(['completed', 'not_started']);

    // FR-20 : progression
    expect(completedLessonIds(progress, 'e1')).toEqual(['l-text']);
    expect(completionRatio(1, 2)).toBe(0.5);

    // FR-30 : correction automatique du quiz
    const q: QuizQuestion = {
      id: 'q1',
      lessonId: 'l-quiz',
      prompt: 'Que signifie KISS ?',
      choices: ['Keep it simple', 'Keep it secret'],
      correctIndex: 0,
      points: 1,
    };
    const good = gradeQuiz([q], [{ questionId: 'q1', selectedIndex: 0 }]);
    expect(good).toEqual({ correct: 1, total: 1, score: 1, maxScore: 1, percentage: 100 });
    const bad = gradeQuiz([q], [{ questionId: 'q1', selectedIndex: 1 }]);
    expect(bad.percentage).toBe(0);
  });

  it('Invariants transversaux : TVA, rôles/authz, visibilité, catalogue public', () => {
    // BR-03 / BR-05 : TVA UE vs hors UE
    expect(vatRateForCountry('FR')).toBe(20);
    expect(vatRateForCountry('EE')).toBe(22);
    expect(vatRateForCountry('US')).toBe(0);

    // FR-01 / FR-03 : rôles et autorisations
    expect(hasPermission('admin', 'course.manage')).toBe(true);
    expect(hasPermission('tutor', 'course.manage')).toBe(false);
    expect(hasPermission('tutor', 'progress.view_funded')).toBe(true);
    expect(hasPermission('learner', 'progress.view_own')).toBe(true);
    expect(canCreateAccount('admin')).toBe(true);
    expect(canCreateAccount('learner')).toBe(false); // pas d'auto-inscription
    expect(canManageCoupons('admin')).toBe(true);
    expect(canManageCoupons('tutor')).toBe(false);

    // FR-12 : visibilité des leçons ; catalogue public (is_public)
    let catalog = buildCatalog();
    expect(visibleLessonsOfCourse(catalog, 'c1')).toHaveLength(2);
    catalog = setLessonVisibility(catalog, 'l-text', 'hidden');
    expect(visibleLessonsOfCourse(catalog, 'c1')).toHaveLength(1);
    expect(publicCourses(catalog).map((c) => c.id)).toEqual(['c1']);
  });
});
