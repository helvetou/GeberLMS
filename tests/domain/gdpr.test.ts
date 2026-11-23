import { describe, it, expect } from 'vitest';
import { anonymizeUser, canErase, buildDataExport } from '../../src/lib/domain/gdpr';
import { budgetState, estimateCostEuros } from '../../src/lib/domain/llm-budget';
import { isRateLimited } from '../../src/lib/domain/antipiracy';

describe('gdpr (m8)', () => {
  const user = { id: 'u1', role: 'learner' as const, email: 'a@b.c', name: 'Alice', consentAt: '2026-01-01', consentMarketing: true };

  it('anonymizes PII but keeps the id', () => {
    const anon = anonymizeUser(user);
    expect(anon.id).toBe('u1');
    expect(anon.email).toContain('anonymized-');
    expect(anon.email).not.toContain('a@b.c');
    expect(anon.name).toBeNull();
  });

  it('allows physical erase only without active enrollments', () => {
    expect(canErase(user, 0)).toBe(true);
    expect(canErase(user, 1)).toBe(false);
  });

  it('builds a versioned export bundle', () => {
    const bundle = buildDataExport(user, { enrollments: [], progress: [], uploads: [], invoices: [], activity: [] });
    expect(bundle.version).toBe(1);
    expect(bundle.user.email).toBe('a@b.c');
  });
});

describe('llm-budget (m8)', () => {
  it('is ok below 80%', () => {
    expect(budgetState(50, 100).status).toBe('ok');
    expect(budgetState(79, 100).status).toBe('ok');
  });

  it('warns at 80% and blocks at 100%', () => {
    expect(budgetState(80, 100).status).toBe('warning');
    expect(budgetState(100, 100).status).toBe('critical');
    expect(budgetState(100, 100).blocked).toBe(true);
    expect(budgetState(99, 100).blocked).toBe(false);
  });

  it('estimates cost from tokens', () => {
    expect(estimateCostEuros(0)).toBe(0);
    expect(estimateCostEuros(1_000_000)).toBeGreaterThan(0);
  });
});

describe('antipiracy (m8)', () => {
  const now = 1_000_000;

  it('blocks when the window quota is reached', () => {
    const events = Array.from({ length: 120 }, (_, i) => ({ timestamp: now - i * 100 }));
    expect(isRateLimited(events, now).blocked).toBe(true);
  });

  it('ignores events outside the window', () => {
    const events = Array.from({ length: 200 }, (_, i) => ({ timestamp: now - 120_000 - i }));
    expect(isRateLimited(events, now).blocked).toBe(false);
  });
});
