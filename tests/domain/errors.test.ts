import { describe, it, expect } from 'vitest';
import { ErrorCodes, isErrorCode } from '../../src/lib/domain/errors';
import { LOCALES, translate } from '../../src/lib/domain/i18n';

describe('error code catalog', () => {
  it('is free of duplicates', () => {
    const codes = Object.values(ErrorCodes);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('translates every code in every locale (no raw key leak)', () => {
    for (const locale of LOCALES) {
      for (const code of Object.values(ErrorCodes)) {
        const message = translate(locale, code);
        expect(message, `${code} in ${locale}`).not.toBe(code);
      }
    }
  });

  it('recognizes known codes', () => {
    expect(isErrorCode(ErrorCodes.COUPON_EXPIRED)).toBe(true);
    expect(isErrorCode('errors.unknown')).toBe(false);
    expect(isErrorCode(42)).toBe(false);
  });
});
