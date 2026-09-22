import { describe, it, expect } from 'vitest';
import { createSession, isSessionActive, generateSessionToken } from '../../src/lib/domain/session';

describe('session', () => {
  it('generates a 64-char hex token', () => {
    expect(generateSessionToken()).toMatch(/^[0-9a-f]{64}$/);
  });

  it('generates distinct tokens', () => {
    expect(generateSessionToken()).not.toBe(generateSessionToken());
  });

  it('sets expiry from ttl', () => {
    const s = createSession('u1', { ttlMs: 1000, now: 0 });
    expect(s.userId).toBe('u1');
    expect(s.createdAt).toBe(0);
    expect(s.expiresAt).toBe(1000);
  });

  it('is active before expiry and inactive after', () => {
    const s = createSession('u1', { ttlMs: 1000, now: 0 });
    expect(isSessionActive(s, 999)).toBe(true);
    expect(isSessionActive(s, 1000)).toBe(false);
    expect(isSessionActive(s, 1001)).toBe(false);
  });
});
