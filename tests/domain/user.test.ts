import { describe, it, expect } from 'vitest';
import { isSelfPayer } from '../../src/lib/domain/user';

describe('isSelfPayer', () => {
  it('is true for a learner flagged self_payer', () => {
    expect(isSelfPayer({ id: '1', role: 'learner', selfPayer: true })).toBe(true);
  });

  it('is false for a learner not flagged', () => {
    expect(isSelfPayer({ id: '2', role: 'learner', selfPayer: false })).toBe(false);
    expect(isSelfPayer({ id: '3', role: 'learner' })).toBe(false);
  });

  it('is false for non-learners regardless of the flag', () => {
    expect(isSelfPayer({ id: '4', role: 'tutor', selfPayer: true })).toBe(false);
    expect(isSelfPayer({ id: '5', role: 'admin', selfPayer: true })).toBe(false);
  });
});
