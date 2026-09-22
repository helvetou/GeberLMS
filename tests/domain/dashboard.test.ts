import { describe, it, expect } from 'vitest';
import { buildTutorDashboard } from '../../src/lib/domain/dashboard';
import type { Catalog } from '../../src/lib/domain/catalog';
import type { Enrollment } from '../../src/lib/domain/enrollment';
import type { Guardianship } from '../../src/lib/domain/guardianship';
import type { ProgressEntry } from '../../src/lib/domain/progress';

const guardianships: Guardianship[] = [
  { tutorId: 't1', learnerId: 'l1' },
  { tutorId: 't1', learnerId: 'l3' },
  { tutorId: 't2', learnerId: 'l2' },
];

const catalog: Catalog = {
  courses: [
    { id: 'c1', slug: 'fr', title: 'Français', language: 'fr', visibility: 'visible' },
    { id: 'c2', slug: 'de', title: 'Allemand', language: 'de', visibility: 'visible' },
  ],
  modules: [
    { id: 'm1', courseId: 'c1', title: 'M1', visibility: 'visible' },
    { id: 'm2', courseId: 'c2', title: 'M2', visibility: 'visible' },
  ],
  lessons: [
    { id: 'la', moduleId: 'm1', title: 'A', type: 'text', visibility: 'visible' },
    { id: 'lb', moduleId: 'm1', title: 'B', type: 'video', visibility: 'visible' },
    { id: 'lc', moduleId: 'm1', title: 'C cachée', type: 'text', visibility: 'hidden' },
    { id: 'ld', moduleId: 'm2', title: 'D', type: 'quiz', visibility: 'visible' },
  ],
  resources: [],
};

const enrollments: Enrollment[] = [
  { id: 'e1', learnerId: 'l1', courseId: 'c1', payerId: 't1', status: 'active' },
  { id: 'e2', learnerId: 'l1', courseId: 'c2', payerId: 't1', status: 'active' },
  { id: 'e3', learnerId: 'l2', courseId: 'c1', payerId: 't2', status: 'active' },
];

const progress: ProgressEntry[] = [
  { id: 'p1', enrollmentId: 'e1', lessonId: 'la', status: 'completed' },
  { id: 'p2', enrollmentId: 'e1', lessonId: 'lb', status: 'in_progress' },
];

describe('buildTutorDashboard (FR-21)', () => {
  it('lists funded learners with their course progress', () => {
    const d = buildTutorDashboard({ tutorId: 't1', guardianships, enrollments, catalog, progress });
    expect(d.learners.map((l) => l.learnerId)).toEqual(['l1', 'l3']);

    const l1 = d.learners[0]!;
    expect(l1.courses.map((c) => c.courseId)).toEqual(['c1', 'c2']);

    const c1 = l1.courses[0]!;
    expect(c1.title).toBe('Français');
    expect(c1.status).toBe('active');
    expect(c1.completedLessons).toBe(1);
    expect(c1.totalLessons).toBe(2); // la + lb (lc cachée exclue)
  });

  it('does not show learners of other tutors', () => {
    const d = buildTutorDashboard({ tutorId: 't1', guardianships, enrollments, catalog, progress });
    expect(d.learners.map((l) => l.learnerId)).not.toContain('l2');
  });

  it('shows a linked learner with no enrollment (empty courses)', () => {
    const d = buildTutorDashboard({ tutorId: 't1', guardianships, enrollments, catalog, progress });
    const l3 = d.learners.find((l) => l.learnerId === 'l3')!;
    expect(l3.courses).toEqual([]);
  });

  it('returns empty learners for a tutor with no guardianships', () => {
    const d = buildTutorDashboard({ tutorId: 'nope', guardianships, enrollments, catalog, progress });
    expect(d.learners).toEqual([]);
  });
});
