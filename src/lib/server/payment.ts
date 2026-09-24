import { desc, eq, inArray } from 'drizzle-orm';
import type { DB } from './db';
import { enrollments, users, courses, payments, invoices } from './db/schema';
import { activateEnrollment } from '$lib/domain/enrollment';
import { confirmPayment } from '$lib/domain/payment';
import { nextInvoiceNumber, validateInvoice } from '$lib/domain/invoice';

export class PaymentServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentServiceError';
  }
}

export interface EnrollmentAdminView {
  enrollmentId: string;
  learnerEmail: string;
  learnerName: string;
  courseTitle: string;
  status: string;
  netCents: number;
  vatCents: number;
  totalCents: number;
  createdAt: string;
}

export async function listEnrollmentsForAdmin(db: DB): Promise<EnrollmentAdminView[]> {
  const rows = await db.select().from(enrollments).all();
  const learnerIds = rows.map((e) => e.learnerId);
  const courseIds = rows.map((e) => e.courseId);

  const learners = learnerIds.length
    ? await db
        .select({ id: users.id, email: users.email, name: users.name })
        .from(users)
        .where(inArray(users.id, learnerIds))
        .all()
    : [];
  const coursesRows = courseIds.length
    ? await db
        .select({ id: courses.id, title: courses.title })
        .from(courses)
        .where(inArray(courses.id, courseIds))
        .all()
    : [];

  const learnerById = new Map(learners.map((l) => [l.id, l]));
  const courseById = new Map(coursesRows.map((c) => [c.id, c]));

  return rows.map((e) => ({
    enrollmentId: e.id,
    learnerEmail: learnerById.get(e.learnerId)?.email ?? e.learnerId,
    learnerName: learnerById.get(e.learnerId)?.name ?? '—',
    courseTitle: courseById.get(e.courseId)?.title ?? e.courseId,
    status: e.status,
    netCents: e.netCents,
    vatCents: e.vatCents,
    totalCents: e.totalCents,
    createdAt: e.createdAt,
  }));
}

/**
 * Confirme le paiement Payoneer d'une inscription : enregistre le paiement,
 * active l'inscription et génère la facture TVA (FR-40/41/47).
 */
export async function confirmEnrollmentPayment(
  db: DB,
  enrollmentId: string,
): Promise<{ invoiceNumber: string }> {
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.id, enrollmentId))
    .get();
  if (!enrollment) {
    throw new PaymentServiceError('Inscription introuvable');
  }

  // Valide la transition pending → active (lève sinon).
  activateEnrollment({
    id: enrollment.id,
    learnerId: enrollment.learnerId,
    courseId: enrollment.courseId,
    payerId: enrollment.payerId,
    status: enrollment.status,
  });

  const now = new Date().toISOString();
  const payment = confirmPayment(
    {
      id: crypto.randomUUID(),
      enrollmentId,
      provider: 'payoneer',
      amountCents: enrollment.totalCents,
      currency: 'EUR',
      status: 'pending',
      createdAt: now,
    },
    now,
  );

  await db
    .insert(payments)
    .values({
      id: payment.id,
      enrollmentId: payment.enrollmentId,
      provider: payment.provider,
      providerRef: null,
      amountCents: payment.amountCents,
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
    })
    .run();

  await db.update(enrollments).set({ status: 'active' }).where(eq(enrollments.id, enrollmentId)).run();

  const year = new Date().getFullYear();
  const latest = await db
    .select({ number: invoices.number })
    .from(invoices)
    .orderBy(desc(invoices.number))
    .limit(1)
    .get();

  const invoice = {
    id: crypto.randomUUID(),
    enrollmentId,
    number: nextInvoiceNumber(latest?.number, year),
    netCents: enrollment.netCents,
    vatRatePercent: enrollment.vatRatePercent,
    vatCents: enrollment.vatCents,
    totalCents: enrollment.totalCents,
    createdAt: now,
  };
  validateInvoice(invoice);

  await db
    .insert(invoices)
    .values({
      id: invoice.id,
      enrollmentId: invoice.enrollmentId,
      number: invoice.number,
      pdfRef: null,
      netCents: invoice.netCents,
      vatRatePercent: invoice.vatRatePercent,
      vatCents: invoice.vatCents,
      totalCents: invoice.totalCents,
      createdAt: invoice.createdAt,
    })
    .run();

  return { invoiceNumber: invoice.number };
}
