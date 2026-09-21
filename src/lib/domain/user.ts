import type { Role } from './roles';

export interface User {
  id: string;
  role: Role;
  /** Pertinent uniquement pour les apprenants. */
  selfPayer?: boolean;
}

/**
 * Vrai si l'apprenant paie lui-même ; sinon il est financé par un tuteur.
 * Le flag est ignoré pour les non-apprenants (FR-02, FR-03).
 */
export function isSelfPayer(user: User): boolean {
  return user.role === 'learner' && user.selfPayer === true;
}
