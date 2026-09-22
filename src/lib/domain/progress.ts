/**
 * Progression académique (FR-20).
 */
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

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
