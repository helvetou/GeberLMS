import { and, eq } from 'drizzle-orm';
import type { DB } from './db';
import { enrollments, lessons, modules, progress } from './db/schema';
import {
  isProgressStatus,
  recordProgress,
  ProgressError,
  type ProgressEntry,
  type ProgressStatus,
} from '$lib/domain/progress';
import { ErrorCodes, type ErrorCode } from '$lib/domain/errors';

export class ProgressServiceError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'ProgressServiceError';
    this.code = code;
  }
}

export interface RecordLessonProgressInput {
  learnerId: string;
  enrollmentId: string;
  lessonId: string;
  status: string;
  score?: number;
}

/**
 * Enregistre la progression d'une leçon (FR-20) après avoir vérifié que
 * l'inscription appartient bien à l'apprenant, qu'elle est active et que la
 * leçon fait partie du cours de cette inscription.
 */
export async function recordLessonProgress(
  db: DB,
  input: RecordLessonProgressInput,
): Promise<void> {
  if (!isProgressStatus(input.status)) {
    throw new ProgressServiceError(ErrorCodes.PROGRESS_STATUS_INVALID, 'Statut de progression invalide');
  }

  const enrollment = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.id, input.enrollmentId))
    .get();
  if (!enrollment) {
    throw new ProgressServiceError(ErrorCodes.ENROLLMENT_NOT_FOUND, 'Inscription introuvable');
  }
  if (enrollment.learnerId !== input.learnerId) {
    throw new ProgressServiceError(ErrorCodes.ENROLLMENT_NOT_OWNED, 'Cette inscription ne vous appartient pas');
  }
  if (enrollment.status !== 'active') {
    throw new ProgressServiceError(ErrorCodes.ENROLLMENT_NOT_ACTIVE, 'Inscription non active');
  }

  const lesson = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, input.lessonId))
    .get();
  if (!lesson) {
    throw new ProgressServiceError(ErrorCodes.LESSON_NOT_FOUND, 'Leçon introuvable');
  }

  const module = await db
    .select()
    .from(modules)
    .where(eq(modules.id, lesson.moduleId))
    .get();
  if (!module || module.courseId !== enrollment.courseId) {
    throw new ProgressServiceError(ErrorCodes.LESSON_OUT_OF_COURSE, 'Leçon hors du cours de cette inscription');
  }

  const score =
    input.score !== undefined && !Number.isNaN(input.score) ? input.score : undefined;

  let entry: ProgressEntry;
  try {
    entry = recordProgress({
      id: crypto.randomUUID(),
      enrollmentId: input.enrollmentId,
      lessonId: input.lessonId,
      status: input.status as ProgressStatus,
      score,
    });
  } catch (err) {
    if (err instanceof ProgressError) {
      throw new ProgressServiceError(err.code, err.message);
    }
    throw err;
  }

  // Une seule progression par (inscription, leçon) : on remplace l'existante.
  await db
    .delete(progress)
    .where(
      and(
        eq(progress.enrollmentId, entry.enrollmentId),
        eq(progress.lessonId, entry.lessonId),
      ),
    )
    .run();

  await db
    .insert(progress)
    .values({
      id: entry.id,
      enrollmentId: entry.enrollmentId,
      lessonId: entry.lessonId,
      status: entry.status,
      score: entry.score ?? null,
      completedAt: entry.completedAt ? new Date(entry.completedAt).toISOString() : null,
      updatedAt: new Date().toISOString(),
    })
    .run();
}
