import { describe, it, expect } from 'vitest';
import {
  canCreateAccount,
  canManageGuardianship,
  canManageCourses,
  canManageCoupons,
} from '../../src/lib/domain/authz';

describe('authz (FR-03)', () => {
  it('only admin can create accounts', () => {
    expect(canCreateAccount('admin')).toBe(true);
    expect(canCreateAccount('tutor')).toBe(false);
    expect(canCreateAccount('learner')).toBe(false);
  });

  it('only admin manages guardianships', () => {
    expect(canManageGuardianship('admin')).toBe(true);
    expect(canManageGuardianship('tutor')).toBe(false);
    expect(canManageGuardianship('learner')).toBe(false);
  });

  it('only admin manages courses', () => {
    expect(canManageCourses('admin')).toBe(true);
    expect(canManageCourses('learner')).toBe(false);
  });

  it('only admin manages coupons', () => {
    expect(canManageCoupons('admin')).toBe(true);
    expect(canManageCoupons('tutor')).toBe(false);
  });
});
