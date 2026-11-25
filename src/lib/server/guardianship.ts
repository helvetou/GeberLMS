import { and, eq, inArray } from 'drizzle-orm';
import type { DB } from './db';
import { users, guardianships } from './db/schema';
import { ErrorCodes, type ErrorCode } from '$lib/domain/errors';

export class GuardianshipServiceError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'GuardianshipServiceError';
    this.code = code;
  }
}

export interface GuardianshipRow {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorEmail: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  createdAt: string;
}

/** Tutelles existantes avec nom/email du tuteur et de l'apprenant (FR-04). */
export async function listGuardianships(db: DB): Promise<GuardianshipRow[]> {
  const links = await db.select().from(guardianships).all();
  const ids = [...new Set([...links.map((l) => l.tutorId), ...links.map((l) => l.learnerId)])];
  const rows = ids.length ? await db.select().from(users).where(inArray(users.id, ids)).all() : [];
  const byId = new Map(rows.map((u) => [u.id, u]));

  return links.map((l) => {
    const tutor = byId.get(l.tutorId);
    const learner = byId.get(l.learnerId);
    return {
      id: `${l.tutorId}:${l.learnerId}`,
      tutorId: l.tutorId,
      tutorName: tutor?.name ?? tutor?.email ?? l.tutorId,
      tutorEmail: tutor?.email ?? l.tutorId,
      learnerId: l.learnerId,
      learnerName: learner?.name ?? learner?.email ?? l.learnerId,
      learnerEmail: learner?.email ?? l.learnerId,
      createdAt: l.createdAt,
    };
  });
}

/** Lie un tuteur à un apprenant (idempotent). */
export async function linkGuardianship(db: DB, tutorId: string, learnerId: string): Promise<void> {
  const tutor = await db.select().from(users).where(eq(users.id, tutorId)).get();
  if (!tutor || tutor.role !== 'tutor') {
    throw new GuardianshipServiceError(ErrorCodes.TUTOR_NOT_FOUND, 'Tuteur introuvable');
  }
  const learner = await db.select().from(users).where(eq(users.id, learnerId)).get();
  if (!learner || learner.role !== 'learner') {
    throw new GuardianshipServiceError(ErrorCodes.LEARNER_NOT_FOUND, 'Apprenant introuvable');
  }

  await db
    .insert(guardianships)
    .values({ tutorId, learnerId, createdAt: new Date().toISOString() })
    .onConflictDoNothing()
    .run();
}

/** Délie un tuteur d'un apprenant. */
export async function unlinkGuardianship(db: DB, tutorId: string, learnerId: string): Promise<void> {
  await db
    .delete(guardianships)
    .where(and(eq(guardianships.tutorId, tutorId), eq(guardianships.learnerId, learnerId)))
    .run();
}
