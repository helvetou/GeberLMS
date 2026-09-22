import { eq } from 'drizzle-orm';
import type { DB } from './db';
import { users, courses, guardianships, enrollments } from './db/schema';
import { createEnrollmentForLearner } from '$lib/domain/enrollment';
import { computePrice } from '$lib/domain/pricing';
import type { User } from '$lib/domain/user';

export class EnrollmentServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnrollmentServiceError';
  }
}

export interface CourseOption {
  id: string;
  title: string;
  slug: string;
  priceCents: number;
}

export async function listCourses(db: DB): Promise<CourseOption[]> {
  return db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      priceCents: courses.priceCents,
    })
    .from(courses)
    .all();
}

/**
 * Inscrit un apprenant à un cours : résout le payeur (domaine), calcule le
 * prix (remise + TVA) et enregistre l'inscription.
 */
export async function enrollLearner(
  db: DB,
  input: { learnerEmail: string; courseId: string; countryCode?: string },
): Promise<{ enrollmentId: string; totalCents: number }> {
  const userRow = await db.select().from(users).where(eq(users.email, input.learnerEmail)).get();
  if (!userRow || userRow.role !== 'learner') {
    throw new EnrollmentServiceError('Apprenant introuvable');
  }

  const courseRow = await db.select().from(courses).where(eq(courses.id, input.courseId)).get();
  if (!courseRow) {
    throw new EnrollmentServiceError('Cours introuvable');
  }

  const links = await db
    .select()
    .from(guardianships)
    .where(eq(guardianships.learnerId, userRow.id))
    .all();

  const learner: User = { id: userRow.id, role: userRow.role, selfPayer: userRow.selfPayer };

  const enrollment = createEnrollmentForLearner({
    id: crypto.randomUUID(),
    learner,
    courseId: input.courseId,
    guardianships: links,
  });

  const price = computePrice({
    netCents: courseRow.priceCents,
    countryCode: input.countryCode ?? 'EE',
  });

  await db.insert(enrollments).values({
    id: enrollment.id,
    learnerId: enrollment.learnerId,
    courseId: enrollment.courseId,
    payerId: enrollment.payerId,
    status: enrollment.status,
    netCents: price.netCents,
    vatRatePercent: price.vatRatePercent,
    vatCents: price.vatCents,
    totalCents: price.totalCents,
    createdAt: new Date().toISOString(),
  });

  return { enrollmentId: enrollment.id, totalCents: price.totalCents };
}
