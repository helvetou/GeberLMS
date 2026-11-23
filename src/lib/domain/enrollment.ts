import { isSelfPayer, type User } from './user';
import { tutorsOfLearner, type GuardianshipList } from './guardianship';
import { ErrorCodes, type ErrorCode } from './errors';

export type EnrollmentStatus = 'pending' | 'active' | 'expired' | 'revoked';

export interface Enrollment {
  id: string;
  learnerId: string;
  courseId: string;
  /** Payeur unique : l'apprenant lui-même ou un tuteur lié. */
  payerId: string;
  status: EnrollmentStatus;
}

export class EnrollmentError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'EnrollmentError';
    this.code = code;
  }
}

/** Vérifie que le payeur finance légitimement l'apprenant (FR-06). */
export function validatePayer(opts: {
  learner: User;
  payerId: string;
  guardianships: GuardianshipList;
}): void {
  const { learner, payerId, guardianships } = opts;

  if (isSelfPayer(learner)) {
    if (payerId !== learner.id) {
      throw new EnrollmentError(
        ErrorCodes.SELF_PAYER_MUST_PAY_SELF,
        'Un apprenant auto-payeur doit se financer lui-même',
      );
    }
    return;
  }

  const tutors = tutorsOfLearner(guardianships, learner.id);
  if (!tutors.includes(payerId)) {
    throw new EnrollmentError(
      ErrorCodes.PAYER_NOT_LINKED,
      'Le payeur n\u2019est pas un tuteur lié à cet apprenant',
    );
  }
}

export function createEnrollment(opts: {
  id: string;
  learner: User;
  courseId: string;
  payerId: string;
  guardianships: GuardianshipList;
  status?: EnrollmentStatus;
}): Enrollment {
  validatePayer({
    learner: opts.learner,
    payerId: opts.payerId,
    guardianships: opts.guardianships,
  });

  return {
    id: opts.id,
    learnerId: opts.learner.id,
    courseId: opts.courseId,
    payerId: opts.payerId,
    status: opts.status ?? 'pending',
  };
}

/** Ajoute une inscription en garantissant l'unicité (apprenant, cours). */
export function enroll(
  entries: readonly Enrollment[],
  enrollment: Enrollment,
): Enrollment[] {
  const dup = entries.some(
    (e) =>
      e.learnerId === enrollment.learnerId &&
      e.courseId === enrollment.courseId,
  );
  if (dup) {
    throw new EnrollmentError(ErrorCodes.ALREADY_ENROLLED, 'Cet apprenant est déjà inscrit à ce cours');
  }
  return [...entries, enrollment];
}

export function enrollmentsOfLearner(
  entries: readonly Enrollment[],
  learnerId: string,
): Enrollment[] {
  return entries.filter((e) => e.learnerId === learnerId);
}

export function enrollmentsFundedBy(
  entries: readonly Enrollment[],
  payerId: string,
): Enrollment[] {
  return entries.filter((e) => e.payerId === payerId);
}

/** Active une inscription après confirmation du paiement (FR-41). */
export function activateEnrollment(enrollment: Enrollment): Enrollment {
  if (enrollment.status === 'active') {
    return enrollment;
  }
  if (enrollment.status !== 'pending') {
    throw new EnrollmentError(ErrorCodes.ENROLLMENT_NOT_ACTIVATABLE, 'Inscription non activable');
  }
  return { ...enrollment, status: 'active' };
}

/**
 * Détermine le payeur unique : l'apprenant lui-même (auto-payeur) ou
 * son tuteur lié. Lève une erreur si aucun ou plusieurs tuteurs (ambigu).
 */
export function resolvePayer(
  learner: User,
  guardianships: GuardianshipList,
): string {
  if (isSelfPayer(learner)) return learner.id;

  const tutors = tutorsOfLearner(guardianships, learner.id);
  if (tutors.length === 0) {
    throw new EnrollmentError(ErrorCodes.NO_TUTOR_LINKED, 'Aucun tuteur lié pour financer cet apprenant');
  }
  if (tutors.length > 1) {
    throw new EnrollmentError(ErrorCodes.PAYER_AMBIGUOUS, 'Plusieurs tuteurs liés — payeur ambigu');
  }
  return tutors[0]!;
}

/** Crée une inscription en résolvant automatiquement le payeur. */
export function createEnrollmentForLearner(opts: {
  id: string;
  learner: User;
  courseId: string;
  guardianships: GuardianshipList;
  status?: EnrollmentStatus;
}): Enrollment {
  const payerId = resolvePayer(opts.learner, opts.guardianships);
  return createEnrollment({
    id: opts.id,
    learner: opts.learner,
    courseId: opts.courseId,
    payerId,
    guardianships: opts.guardianships,
    status: opts.status,
  });
}
