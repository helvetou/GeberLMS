import { and, eq } from 'drizzle-orm';
import type { DB } from './db';
import { users, courses, guardianships, enrollments, coupons } from './db/schema';
import { createEnrollmentForLearner, EnrollmentError } from '$lib/domain/enrollment';
import { computePrice } from '$lib/domain/pricing';
import { consumeCoupon, CouponError, type Coupon } from '$lib/domain/coupon';
import { findCouponByCode } from './coupon';
import type { User } from '$lib/domain/user';
import { ErrorCodes, type ErrorCode } from '$lib/domain/errors';

export class EnrollmentServiceError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'EnrollmentServiceError';
    this.code = code;
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
 * Inscrit un apprenant à un cours : résout le payeur (domaine), applique un
 * éventuel coupon, calcule le prix (remise + TVA) et enregistre l'inscription.
 */
export async function enrollLearner(
  db: DB,
  input: { learnerEmail: string; courseId: string; countryCode?: string; couponCode?: string },
): Promise<{ enrollmentId: string; totalCents: number }> {
  const userRow = await db.select().from(users).where(eq(users.email, input.learnerEmail)).get();
  if (!userRow || userRow.role !== 'learner') {
    throw new EnrollmentServiceError(ErrorCodes.LEARNER_NOT_FOUND, 'Apprenant introuvable');
  }

  const courseRow = await db.select().from(courses).where(eq(courses.id, input.courseId)).get();
  if (!courseRow) {
    throw new EnrollmentServiceError(ErrorCodes.COURSE_NOT_FOUND, 'Cours introuvable');
  }

  const existing = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(and(eq(enrollments.learnerId, userRow.id), eq(enrollments.courseId, input.courseId)))
    .get();
  if (existing) {
    throw new EnrollmentServiceError(ErrorCodes.ALREADY_ENROLLED, 'Cet apprenant est déjà inscrit à ce cours');
  }

  const links = await db
    .select()
    .from(guardianships)
    .where(eq(guardianships.learnerId, userRow.id))
    .all();

  const learner: User = { id: userRow.id, role: userRow.role, selfPayer: userRow.selfPayer };

  let enrollment;
  try {
    enrollment = createEnrollmentForLearner({
      id: crypto.randomUUID(),
      learner,
      courseId: input.courseId,
      guardianships: links,
    });
  } catch (err) {
    if (err instanceof EnrollmentError) {
      throw new EnrollmentServiceError(err.code, err.message);
    }
    throw err;
  }

  let coupon: Coupon | undefined;
  let couponId: string | null = null;
  const couponCode = input.couponCode?.trim();
  if (couponCode) {
    const record = await findCouponByCode(db, couponCode);
    if (!record) {
      throw new EnrollmentServiceError(ErrorCodes.COUPON_NOT_FOUND, 'Coupon introuvable');
    }
    try {
      coupon = consumeCoupon(record.coupon);
    } catch (err) {
      if (err instanceof CouponError) {
        throw new EnrollmentServiceError(err.code, err.message);
      }
      throw err;
    }
    couponId = record.id;
  }

  const price = computePrice({
    netCents: courseRow.priceCents,
    countryCode: input.countryCode ?? 'EE',
    coupon,
  });

  await db.insert(enrollments).values({
    id: enrollment.id,
    learnerId: enrollment.learnerId,
    courseId: enrollment.courseId,
    payerId: enrollment.payerId,
    couponId,
    status: enrollment.status,
    netCents: price.discountedNetCents,
    discountCents: price.discountCents,
    vatRatePercent: price.vatRatePercent,
    vatCents: price.vatCents,
    totalCents: price.totalCents,
    createdAt: new Date().toISOString(),
  });

  if (couponId && coupon) {
    await db
      .update(coupons)
      .set({ usedCount: coupon.usedCount ?? 0 })
      .where(eq(coupons.id, couponId))
      .run();
  }

  return { enrollmentId: enrollment.id, totalCents: price.totalCents };
}
