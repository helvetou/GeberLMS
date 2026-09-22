import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/lib/domain/password';

describe('password', () => {
  it('hashes and verifies a correct password', async () => {
    const stored = await hashPassword('secret123');
    await expect(verifyPassword('secret123', stored)).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const stored = await hashPassword('secret123');
    await expect(verifyPassword('wrong', stored)).resolves.toBe(false);
  });

  it('produces a different hash each time (salt)', async () => {
    const a = await hashPassword('secret123');
    const b = await hashPassword('secret123');
    expect(a).not.toBe(b);
  });

  it('rejects a malformed stored hash', async () => {
    await expect(verifyPassword('secret123', 'not-a-valid-hash')).resolves.toBe(false);
    await expect(verifyPassword('secret123', 'pbkdf2_sha256$abc$salt$hash')).resolves.toBe(false);
  });

  it('rejects a tampered hash', async () => {
    const stored = await hashPassword('secret123');
    const [algo, iter, salt, hash] = stored.split('$');
    const tampered = `${algo}$${iter}$${salt}$${'A'.repeat(hash!.length)}`;
    await expect(verifyPassword('secret123', tampered)).resolves.toBe(false);
  });
});
