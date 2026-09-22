import { describe, it, expect } from 'vitest';
import { createActivityEntry, ActivityError, ACTIONS } from '../../src/lib/domain/activity';

describe('createActivityEntry (FR-23)', () => {
  it('creates an entry with action and optional fields', () => {
    const e = createActivityEntry({
      id: 'a1',
      actorId: 'u1',
      action: ACTIONS.login,
      targetType: 'session',
      targetId: 's1',
      meta: '{"ok":true}',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(e).toEqual({
      id: 'a1',
      actorId: 'u1',
      action: 'auth.login',
      targetType: 'session',
      targetId: 's1',
      meta: '{"ok":true}',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('defaults createdAt when not provided', () => {
    const before = new Date().toISOString();
    const e = createActivityEntry({ id: 'a1', actorId: 'u1', action: ACTIONS.login });
    expect(e.createdAt >= before).toBe(true);
  });

  it('allows an anonymous action without an actor', () => {
    const e = createActivityEntry({ id: 'a1', action: ACTIONS.loginFailed });
    expect(e.actorId).toBeUndefined();
  });

  it('rejects an empty action', () => {
    expect(() => createActivityEntry({ id: 'a1', action: '   ' })).toThrow(ActivityError);
  });

  it('rejects an empty id', () => {
    expect(() => createActivityEntry({ id: '', action: ACTIONS.login })).toThrow(ActivityError);
  });
});
