/**
 * Anti-copie avancé (NFR-10, m8) : quota de requêtes par utilisateur sur une
 * fenêtre glissante, pour détecter/bloquer l'aspiration de contenu.
 */
export interface AccessEvent {
  timestamp: number;
}

export interface RateLimitResult {
  blocked: boolean;
  windowCount: number;
}

export const DEFAULT_WINDOW_MS = 60_000; // 1 minute
export const DEFAULT_MAX_REQUESTS = 120;

/** Vrai si le nombre d'accès dans la fenêtre atteint le quota. */
export function isRateLimited(
  events: readonly AccessEvent[],
  now: number,
  windowMs: number = DEFAULT_WINDOW_MS,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
): RateLimitResult {
  const start = now - windowMs;
  const windowCount = events.filter((e) => e.timestamp > start).length;
  return { blocked: windowCount >= maxRequests, windowCount };
}
