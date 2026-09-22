import { describe, it, expect } from 'vitest';
import { CouponError, discountFor, consumeCoupon, type Coupon } from '../../src/lib/domain/coupon';

const base: Coupon = { code: 'TEST', type: 'percent', value: 20 };

describe('coupon discountFor', () => {
  it('applies a percent discount', () => {
    expect(discountFor({ ...base, value: 20 }, 10000)).toBe(2000);
  });

  it('applies a full (100%) discount', () => {
    expect(discountFor({ ...base, value: 100 }, 10000)).toBe(10000);
  });

  it('applies a fixed amount discount', () => {
    expect(discountFor({ ...base, type: 'amount', value: 2500 }, 10000)).toBe(2500);
  });

  it('caps an amount discount at the net price', () => {
    expect(discountFor({ ...base, type: 'amount', value: 15000 }, 10000)).toBe(10000);
  });

  it('rounds a percent discount to the nearest cent', () => {
    // 9999 * 33 / 100 = 3299.67 -> 3300
    expect(discountFor({ ...base, value: 33 }, 9999)).toBe(3300);
  });

  it('rejects a percent value above 100', () => {
    expect(() => discountFor({ ...base, value: 101 }, 10000)).toThrow(CouponError);
  });

  it('rejects a negative amount', () => {
    expect(() => discountFor({ ...base, type: 'amount', value: -1 }, 10000)).toThrow(CouponError);
  });

  it('rejects an expired coupon', () => {
    expect(() => discountFor({ ...base, expiresAt: '2020-01-01' }, 10000)).toThrow(CouponError);
  });

  it('rejects when the usage limit is reached', () => {
    expect(() => discountFor({ ...base, maxUses: 1, usedCount: 1 }, 10000)).toThrow(CouponError);
  });

  it('rejects a disabled coupon', () => {
    expect(() => discountFor({ ...base, enabled: false }, 10000)).toThrow(CouponError);
  });
});

describe('coupon consumeCoupon', () => {
  it('increments the used count', () => {
    expect(consumeCoupon(base).usedCount).toBe(1);
    expect(consumeCoupon({ ...base, usedCount: 3 }).usedCount).toBe(4);
  });

  it('treats a missing usedCount as 0', () => {
    expect(consumeCoupon(base).usedCount).toBe(1);
  });

  it('rejects when the limit is already reached', () => {
    expect(() => consumeCoupon({ ...base, maxUses: 2, usedCount: 2 })).toThrow(CouponError);
  });

  it('rejects an expired coupon', () => {
    expect(() => consumeCoupon({ ...base, expiresAt: '2020-01-01' })).toThrow(CouponError);
  });
});
