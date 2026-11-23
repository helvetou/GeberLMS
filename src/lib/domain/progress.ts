/**
 * Progression académique (FR-20).
 */
import { ErrorCodes, type ErrorCode } from './errors';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export const PROGRESS_STATUSES = ['not_started', 'in_progress', 'completed'] as const;

export function isProgressStatus(value: string): value is ProgressStatus {
  return (PROGRESS_STATUSES as readonly string[]).includes(value);
}

export interface ProgressEntry {
  id: string;
  enrollmentId: string;
  lessonId: string;
  status: ProgressStatus;
  score?: number;
  completedAt?: number;
}

/** Leçons terminées (ids) pour une inscription. */
export function completedLessonIds(
  entries: readonly ProgressEntry[],
  enrollmentId: string,
): string[] {
  return entries
    .filter((e) => e.enrollmentId === enrollmentId && e.status === 'completed')
    .map((e) => e.lessonId);
}

/** Ratio de complétion, toujours défini (0 si aucun total). */
export function completionRatio(completed: number, total: number): number {
  if (total <= 0) return 0;
  return completed / total;
}

export class ProgressError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'ProgressError';
    this.code = code;
  }
}

export interface RecordProgressInput {
  id: string;
  enrollmentId: string;
  lessonId: string;
  status: ProgressStatus;
  score?: number;
  completedAt?: number;
  /** Horodatage injectable pour rendre le comportement déterministe. */
  now?: number;
}

/**
 * Enregistre (valide et normalise) une progression académique (FR-20).
 * Le score, lorsqu'il est fourni, doit être compris entre 0 et 100.
 */
export function recordProgress(input: RecordProgressInput): ProgressEntry {
  if (input.score !== undefined && (input.score < 0 || input.score > 100)) {
    throw new ProgressError(ErrorCodes.SCORE_OUT_OF_RANGE, 'Score hors bornes (0–100)');
  }

  const completedAt =
    input.status === 'completed'
      ? input.completedAt ?? input.now ?? Date.now()
      : undefined;

  return {
    id: input.id,
    enrollmentId: input.enrollmentId,
    lessonId: input.lessonId,
    status: input.status,
    score: input.score,
    completedAt,
  };
}
