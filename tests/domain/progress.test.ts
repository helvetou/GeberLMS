import { describe, it, expect } from 'vitest';
import {
  completedLessonIds,
  completionRatio,
  recordProgress,
  ProgressError,
  isProgressStatus,
  type ProgressEntry,
} from '../../src/lib/domain/progress';

const entries: ProgressEntry[] = [
  { id: 'p1', enrollmentId: 'e1', lessonId: 'la', status: 'completed' },
  { id: 'p2', enrollmentId: 'e1', lessonId: 'lb', status: 'in_progress' },
  { id: 'p3', enrollmentId: 'e1', lessonId: 'lc', status: 'completed' },
  { id: 'p4', enrollmentId: 'e2', lessonId: 'la', status: 'completed' },
];

describe('completedLessonIds', () => {
  it('returns only completed lesson ids for an enrollment', () => {
    expect(completedLessonIds(entries, 'e1')).toEqual(['la', 'lc']);
  });

  it('returns empty for an enrollment with no progress', () => {
    expect(completedLessonIds(entries, 'nope')).toEqual([]);
  });
});

describe('completionRatio', () => {
  it('computes a normal ratio', () => {
    expect(completionRatio(2, 4)).toBe(0.5);
  });

  it('returns 0 when there are no lessons', () => {
    expect(completionRatio(0, 0)).toBe(0);
    expect(completionRatio(3, 0)).toBe(0);
  });
});

describe('recordProgress (FR-20)', () => {
  it('records a completed lesson with score and completedAt', () => {
    const e = recordProgress({
      id: 'p',
      enrollmentId: 'e1',
      lessonId: 'la',
      status: 'completed',
      score: 80,
      completedAt: 1700000000000,
    });
    expect(e.status).toBe('completed');
    expect(e.score).toBe(80);
    expect(e.completedAt).toBe(1700000000000);
  });

  it('sets completedAt from now when status is completed and no completedAt given', () => {
    const e = recordProgress({
      id: 'p',
      enrollmentId: 'e1',
      lessonId: 'la',
      status: 'completed',
      now: 1700000000000,
    });
    expect(e.completedAt).toBe(1700000000000);
  });

  it('leaves completedAt undefined for a non-completed status', () => {
    const e = recordProgress({
      id: 'p',
      enrollmentId: 'e1',
      lessonId: 'la',
      status: 'in_progress',
      now: 1700000000000,
    });
    expect(e.completedAt).toBeUndefined();
  });

  it('accepts boundary scores 0 and 100', () => {
    expect(recordProgress({ id: 'a', enrollmentId: 'e', lessonId: 'l', status: 'completed', score: 0 }).score).toBe(0);
    expect(recordProgress({ id: 'b', enrollmentId: 'e', lessonId: 'l', status: 'completed', score: 100 }).score).toBe(100);
  });

  it('rejects a score below 0', () => {
    expect(() =>
      recordProgress({ id: 'p', enrollmentId: 'e', lessonId: 'l', status: 'completed', score: -1 }),
    ).toThrow(ProgressError);
  });

  it('rejects a score above 100', () => {
    expect(() =>
      recordProgress({ id: 'p', enrollmentId: 'e', lessonId: 'l', status: 'completed', score: 101 }),
    ).toThrow(ProgressError);
  });
});

describe('isProgressStatus', () => {
  it('recognizes the three valid statuses', () => {
    expect(isProgressStatus('not_started')).toBe(true);
    expect(isProgressStatus('in_progress')).toBe(true);
    expect(isProgressStatus('completed')).toBe(true);
  });

  it('rejects unknown statuses', () => {
    expect(isProgressStatus('done')).toBe(false);
    expect(isProgressStatus('')).toBe(false);
  });
});
