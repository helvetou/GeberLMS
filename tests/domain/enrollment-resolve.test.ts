import { describe, it, expect } from 'vitest';
import {
  EnrollmentError,
  resolvePayer,
  createEnrollmentForLearner,
} from '../../src/lib/domain/enrollment';
import type { User } from '../../src/lib/domain/user';
import type { Guardianship } from '../../src/lib/domain/guardianship';

const learnerSelf: User = { id: 'l1', role: 'learner', selfPayer: true };
const learnerFunded: User = { id: 'l2', role: 'learner', selfPayer: false };
const link: Guardianship = { tutorId: 't1', learnerId: 'l2' };

describe('resolvePayer', () => {
  it('resolves a self-payer to themselves', () => {
    expect(resolvePayer(learnerSelf, [])).toBe('l1');
  });

  it('resolves a funded learner to their single tutor', () => {
    expect(resolvePayer(learnerFunded, [link])).toBe('t1');
  });

  it('throws when a funded learner has no tutor', () => {
    expect(() => resolvePayer(learnerFunded, [])).toThrow(EnrollmentError);
  });

  it('throws when a funded learner has multiple tutors', () => {
    expect(() =>
      resolvePayer(learnerFunded, [link, { tutorId: 't2', learnerId: 'l2' }]),
    ).toThrow(EnrollmentError);
  });
});

describe('createEnrollmentForLearner', () => {
  it('creates an enrollment with a resolved payer', () => {
    const e = createEnrollmentForLearner({
      id: 'e1',
      learner: learnerFunded,
      courseId: 'c1',
      guardianships: [link],
    });
    expect(e.payerId).toBe('t1');
    expect(e.status).toBe('pending');
  });

  it('resolves a self-payer learner to themselves', () => {
    const e = createEnrollmentForLearner({
      id: 'e2',
      learner: learnerSelf,
      courseId: 'c1',
      guardianships: [],
    });
    expect(e.payerId).toBe('l1');
  });
});
