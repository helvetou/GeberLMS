/**
 * Rôles et permissions statiques.
 *
 * Les permissions dépendantes d'une relation (ex. « un tuteur voit ses
 * apprenants financés ») sont gérées par le module `guardianship`, pas ici.
 */
export type Role = 'admin' | 'learner' | 'tutor';

export type Permission =
  | 'account.create'
  | 'account.manage'
  | 'course.manage'
  | 'guardianship.manage'
  | 'coupon.manage'
  | 'progress.view_own'
  | 'progress.view_funded';

const ROLE_PERMISSIONS = new Map<Role, ReadonlySet<Permission>>([
  [
    'admin',
    new Set<Permission>([
      'account.create',
      'account.manage',
      'course.manage',
      'guardianship.manage',
      'coupon.manage',
    ]),
  ],
  ['tutor', new Set<Permission>(['progress.view_funded'])],
  ['learner', new Set<Permission>(['progress.view_own'])],
]);

export function permissionsFor(role: Role): ReadonlySet<Permission> {
  return ROLE_PERMISSIONS.get(role) ?? new Set<Permission>();
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return permissionsFor(role).has(permission);
}
