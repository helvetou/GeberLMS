import { describe, it, expect } from 'vitest';
import { hasPermission, type Permission, type Role } from '../../src/lib/domain/roles';

describe('role permissions', () => {
  it('grants admin account and content permissions', () => {
    const perms: Permission[] = [
      'account.create',
      'account.manage',
      'course.manage',
      'guardianship.manage',
      'coupon.manage',
    ];
    for (const p of perms) {
      expect(hasPermission('admin', p), p).toBe(true);
    }
  });

  it('denies admin learner-scoped permissions', () => {
    expect(hasPermission('admin', 'progress.view_own')).toBe(false);
    expect(hasPermission('admin', 'progress.view_funded')).toBe(false);
  });

  it('grants tutor only funded-progress view', () => {
    expect(hasPermission('tutor', 'progress.view_funded')).toBe(true);
    expect(hasPermission('tutor', 'account.create')).toBe(false);
    expect(hasPermission('tutor', 'course.manage')).toBe(false);
    expect(hasPermission('tutor', 'progress.view_own')).toBe(false);
  });

  it('grants learner only own-progress view', () => {
    expect(hasPermission('learner', 'progress.view_own')).toBe(true);
    expect(hasPermission('learner', 'account.create')).toBe(false);
    expect(hasPermission('learner', 'course.manage')).toBe(false);
    expect(hasPermission('learner', 'progress.view_funded')).toBe(false);
  });

  it('denies unknown permissions', () => {
    expect(hasPermission('admin', 'unknown.perm' as Permission)).toBe(false);
  });

  it('never throws for any role', () => {
    const roles: Role[] = ['admin', 'learner', 'tutor'];
    for (const r of roles) {
      expect(() => hasPermission(r, 'course.manage')).not.toThrow();
    }
  });
});
