import { describe, it, expect } from 'vitest';
import { completedLessonIds, completionRatio, type ProgressEntry } from '../../src/lib/domain/progress';

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
