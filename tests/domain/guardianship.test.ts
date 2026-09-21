import { describe, it, expect } from 'vitest';
import {
  addGuardianship,
  removeGuardianship,
  learnersOfTutor,
  tutorsOfLearner,
  tutorCanViewLearner,
  type Guardianship,
} from '../../src/lib/domain/guardianship';

const g: Guardianship = { tutorId: 't1', learnerId: 'l1' };

describe('guardianship', () => {
  it('adds a link', () => {
    expect(addGuardianship([], g)).toEqual([g]);
  });

  it('does not duplicate an existing link', () => {
    expect(addGuardianship([g], g)).toEqual([g]);
  });

  it('does not mutate the original list', () => {
    const links = [{ tutorId: 't1', learnerId: 'l2' }];
    const next = addGuardianship(links, g);
    expect(links).toHaveLength(1);
    expect(next).toHaveLength(2);
  });

  it('removes a link', () => {
    const input = [g, { tutorId: 't1', learnerId: 'l2' }];
    expect(removeGuardianship(input, g)).toEqual([{ tutorId: 't1', learnerId: 'l2' }]);
  });

  it('removing a missing link is a no-op', () => {
    expect(removeGuardianship([], g)).toEqual([]);
  });

  it('lists unique learners of a tutor', () => {
    const links = [g, { tutorId: 't1', learnerId: 'l2' }, { tutorId: 't1', learnerId: 'l1' }];
    expect(learnersOfTutor(links, 't1')).toEqual(['l1', 'l2']);
  });

  it('returns empty for a tutor with no learners', () => {
    expect(learnersOfTutor([g], 't2')).toEqual([]);
  });

  it('lists tutors of a learner', () => {
    const links = [g, { tutorId: 't2', learnerId: 'l1' }];
    expect(tutorsOfLearner(links, 'l1')).toEqual(['t1', 't2']);
  });

  it('grants view only between linked tutor and learner', () => {
    expect(tutorCanViewLearner([g], 't1', 'l1')).toBe(true);
    expect(tutorCanViewLearner([g], 't2', 'l1')).toBe(false);
    expect(tutorCanViewLearner([g], 't1', 'l2')).toBe(false);
  });
});
