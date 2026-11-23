/**
 * Conformité RGPD (NFR-08, m8) : consentement, export des données personnelles
 * et droit à l'effacement (anonymisation plutôt que suppression, pour conserver
 * les enregistrements comptables obligatoires).
 */
import type { Role } from './roles';

export interface SubjectUser {
  id: string;
  role: Role;
  email: string;
  name?: string | null;
  consentAt?: string | null;
  consentMarketing?: boolean;
}

export interface AnonymizedUser {
  id: string;
  role: Role;
  email: string;
  name: null;
  consentAt: null;
  consentMarketing: false;
}

/**
 * Anonymise un utilisateur (droit à l'effacement) : l'identifiant est conservé
 * (références), mais les données personnelles sont supprimées.
 */
export function anonymizeUser(user: SubjectUser): AnonymizedUser {
  return {
    id: user.id,
    role: user.role,
    email: `anonymized-${user.id}@invalid.local`,
    name: null,
    consentAt: null,
    consentMarketing: false,
  };
}

/**
 * Un utilisateur ne peut pas être « supprimé » physiquement s'il a des
 * inscriptions actives payantes (obligations comptables) ; on anonymise alors.
 */
export function canErase(user: SubjectUser, activeEnrollments: number): boolean {
  return activeEnrollments === 0;
}

export interface DataExport {
  version: number;
  exportedAt: string;
  user: SubjectUser;
  enrollments: unknown[];
  progress: unknown[];
  uploads: unknown[];
  invoices: unknown[];
  activity: unknown[];
}

/** Assemble un export des données personnelles (portabilité, NFR-08). */
export function buildDataExport(
  user: SubjectUser,
  data: Omit<DataExport, 'version' | 'exportedAt' | 'user'>,
  now: string = new Date().toISOString(),
): DataExport {
  return {
    version: 1,
    exportedAt: now,
    user,
    ...data,
  };
}
