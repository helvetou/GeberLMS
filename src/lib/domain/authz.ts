import { hasPermission, type Role } from './roles';

/**
 * Règles d'autorisation nommées (FR-03 : pas d'auto-inscription,
 * seul l'admin crée des comptes).
 */
export function canCreateAccount(actorRole: Role): boolean {
  return hasPermission(actorRole, 'account.create');
}

export function canManageGuardianship(actorRole: Role): boolean {
  return hasPermission(actorRole, 'guardianship.manage');
}

export function canManageCourses(actorRole: Role): boolean {
  return hasPermission(actorRole, 'course.manage');
}

export function canManageCoupons(actorRole: Role): boolean {
  return hasPermission(actorRole, 'coupon.manage');
}
