import { and, eq, inArray } from 'drizzle-orm';
import type { DB } from './db';
import { users, enrollments, progress, uploads, invoices, activityLogs } from './db/schema';
import { anonymizeUser, buildDataExport, canErase, type SubjectUser } from '$lib/domain/gdpr';

function toSubject(user: typeof users.$inferSelect): SubjectUser {
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    consentAt: user.consentAt,
    consentMarketing: user.consentMarketing,
  };
}

/** Enregistre le consentement RGPD d'un utilisateur (NFR-08). */
export async function recordConsent(db: DB, userId: string, marketing: boolean): Promise<void> {
  await db
    .update(users)
    .set({ consentAt: new Date().toISOString(), consentMarketing: marketing })
    .where(eq(users.id, userId))
    .run();
}

/** Export des données personnelles (portabilité, NFR-08). */
export async function exportUserData(db: DB, userId: string) {
  const user = await db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) return null;

  const enrollmentRows = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.learnerId, userId))
    .all();
  const enrollmentIds = enrollmentRows.map((e) => e.id);

  const progressRows = enrollmentIds.length
    ? await db.select().from(progress).where(inArray(progress.enrollmentId, enrollmentIds)).all()
    : [];
  const uploadRows = await db.select().from(uploads).where(eq(uploads.learnerId, userId)).all();
  const invoiceRows = enrollmentIds.length
    ? await db.select().from(invoices).where(inArray(invoices.enrollmentId, enrollmentIds)).all()
    : [];
  const activityRows = await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.actorId, userId))
    .all();

  return buildDataExport(toSubject(user), {
    enrollments: enrollmentRows,
    progress: progressRows,
    uploads: uploadRows,
    invoices: invoiceRows,
    activity: activityRows,
  });
}

/** Droit à l'effacement (NFR-08) : anonymisation plutôt que suppression. */
export async function eraseUserData(
  db: DB,
  userId: string,
): Promise<{ anonymized: boolean } | null> {
  const user = await db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) return null;

  const activeEnrollments = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.learnerId, userId), eq(enrollments.status, 'active')))
    .all();

  const subject = toSubject(user);
  const anon = anonymizeUser(subject);
  // On anonymise toujours (les factures/inscriptions restent référencées).
  await db
    .update(users)
    .set({
      email: anon.email,
      name: null,
      consentAt: null,
      consentMarketing: false,
      passwordHash: null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, userId))
    .run();

  void canErase(subject, activeEnrollments.length);
  return { anonymized: true };
}
