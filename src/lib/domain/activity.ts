/**
 * Journal d'activité (audit) — FR-23.
 *
 * Entrées immuables, validées, horodatées. Les actions anonymes (ex. échec de
 * connexion) n'ont pas d'acteur.
 */
export interface ActivityEntry {
  id: string;
  /** Identifiant de l'acteur (absent pour les actions anonymes/système). */
  actorId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  /** Métadonnées sérialisées (JSON). */
  meta?: string;
  createdAt: string;
}

export const ACTIONS = {
  login: 'auth.login',
  loginFailed: 'auth.login_failed',
  logout: 'auth.logout',
  enrollmentCreate: 'enrollment.create',
  progressUpdate: 'progress.update',
} as const;

export class ActivityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ActivityError';
  }
}

export function createActivityEntry(input: {
  id: string;
  actorId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  meta?: string;
  createdAt?: string;
}): ActivityEntry {
  if (!input.id.trim()) {
    throw new ActivityError('Identifiant requis');
  }
  if (!input.action.trim()) {
    throw new ActivityError('Action requise');
  }

  return {
    id: input.id,
    actorId: input.actorId?.trim() || undefined,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    meta: input.meta,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}
