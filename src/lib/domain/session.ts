/**
 * Session — jeton aléatoire et fenêtre de validité.
 */

export interface Session {
  token: string;
  userId: string;
  /** Époch ms. */
  createdAt: number;
  /** Époch ms. */
  expiresAt: number;
}

export const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 jours

export function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return toHex(bytes);
}

export function createSession(
  userId: string,
  opts: { ttlMs?: number; now?: number } = {},
): Session {
  const now = opts.now ?? Date.now();
  const ttlMs = opts.ttlMs ?? DEFAULT_SESSION_TTL_MS;
  return {
    token: generateSessionToken(),
    userId,
    createdAt: now,
    expiresAt: now + ttlMs,
  };
}

export function isSessionActive(session: Session, now: number = Date.now()): boolean {
  return now < session.expiresAt;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
