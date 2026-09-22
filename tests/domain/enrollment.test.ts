import { describe, it, expect } from 'vitest';
import {
  EnrollmentError,
  createEnrollment,
  enroll,
  enrollmentsOfLearner,
  enrollmentsFundedBy,
  type Enrollment,
} from '../../src/lib/domain/enrollment';
import type { User } from '../../src/lib/domain/user';
import type { Guardianship } from '../../src/lib/domain/guardianship';

const learnerSelf: User = { id: 'l1', role: 'learner', selfPayer: true };
const learnerFunded: User = { id: 'l2', role: 'learner', selfPayer: false };
const link: Guardianship = { tutorId: 't1', learnerId: 'l2' };

describe('createEnrollment — financement (FR-06)', () => {
  it('accepts a self-payer paying for themselves', () => {
    const e = createEnrollment({
      id: 'e1',
      learner: learnerSelf,
      courseId: 'c1',
      payerId: 'l1',
      guardianships: [],
    });
    expect(e.payerId).toBe('l1');
    expect(e.status).toBe('pending');
  });

  it('rejects a self-payer with an external payer', () => {
    expect(() =>
      createEnrollment({
        id: 'e1',
        learner: learnerSelf,
        courseId: 'c1',
        payerId: 't1',
        guardianships: [],
      }),
    ).toThrow(EnrollmentError);
  });

  it('accepts a funded learner paid by a linked tutor', () => {
    const e = createEnrollment({
      id: 'e1',
      learner: learnerFunded,
      courseId: 'c1',
      payerId: 't1',
      guardianships: [link],
    });
    expect(e.payerId).toBe('t1');
  });

  it('rejects a funded learner paid by an unlinked tutor', () => {
    expect(() =>
      createEnrollment({
        id: 'e1',
        learner: learnerFunded,
        courseId: 'c1',
        payerId: 't2',
        guardianships: [link],
      }),
    ).toThrow(EnrollmentError);
  });

  it('rejects a funded learner with no tutor', () => {
    expect(() =>
      createEnrollment({
        id: 'e1',
        learner: learnerFunded,
        courseId: 'c1',
        payerId: 't1',
        guardianships: [],
      }),
    ).toThrow(EnrollmentError);
  });

  it('rejects a funded learner paying for themselves', () => {
    expect(() =>
      createEnrollment({
        id: 'e1',
        learner: learnerFunded,
        courseId: 'c1',
        payerId: 'l2',
        guardianships: [link],
      }),
    ).toThrow(EnrollmentError);
  });

  it('honours an explicit initial status', () => {
    const e = createEnrollment({
      id: 'e1',
      learner: learnerSelf,
      courseId: 'c1',
      payerId: 'l1',
      guardianships: [],
      status: 'active',
    });
    expect(e.status).toBe('active');
  });
});

describe('enroll — unicité (FR-05)', () => {
  const base: Enrollment = {
    id: 'e1',
    learnerId: 'l1',
    courseId: 'c1',
    payerId: 'l1',
    status: 'active',
  };

  it('adds an enrollment', () => {
    expect(enroll([], base)).toEqual([base]);
  });

  it('rejects a duplicate learner+course', () => {
    expect(() => enroll([base], { ...base, id: 'e2' })).toThrow(EnrollmentError);
  });

  it('allows the same learner in multiple courses', () => {
    const next = enroll([base], { ...base, id: 'e2', courseId: 'c2' });
    expect(next).toHaveLength(2);
  });

  it('allows different learners in the same course', () => {
    const next = enroll([base], { ...base, id: 'e2', learnerId: 'l2', payerId: 't1' });
    expect(next).toHaveLength(2);
  });
});

describe('requêtes', () => {
  const entries: Enrollment[] = [
    { id: 'e1', learnerId: 'l1', courseId: 'c1', payerId: 'l1', status: 'active' },
    { id: 'e2', learnerId: 'l1', courseId: 'c2', payerId: 'l1', status: 'active' },
    { id: 'e3', learnerId: 'l2', courseId: 'c1', payerId: 't1', status: 'active' },
  ];

  it('lists enrollments of a learner', () => {
    expect(enrollmentsOfLearner(entries, 'l1').map((e) => e.id)).toEqual(['e1', 'e2']);
  });

  it('lists enrollments funded by a payer', () => {
    expect(enrollmentsFundedBy(entries, 't1').map((e) => e.id)).toEqual(['e3']);
  });
});
