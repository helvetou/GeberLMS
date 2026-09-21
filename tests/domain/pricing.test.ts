import { describe, it, expect } from 'vitest';
import { computePrice } from '../../src/lib/domain/pricing';

describe('computePrice', () => {
  it('adds VAT for an EU buyer', () => {
    const p = computePrice({ netCents: 10000, countryCode: 'FR' });
    expect(p).toEqual({
      netCents: 10000,
      discountCents: 0,
      discountedNetCents: 10000,
      vatRatePercent: 20,
      vatCents: 2000,
      totalCents: 12000,
    });
  });

  it('applies no VAT for a non-EU buyer', () => {
    const p = computePrice({ netCents: 10000, countryCode: 'CH' });
    expect(p.vatCents).toBe(0);
    expect(p.totalCents).toBe(10000);
  });

  it('applies a percent coupon, then VAT on the discounted amount', () => {
    const p = computePrice({
      netCents: 10000,
      countryCode: 'FR',
      coupon: { code: 'X', type: 'percent', value: 50 },
    });
    expect(p.discountCents).toBe(5000);
    expect(p.discountedNetCents).toBe(5000);
    expect(p.vatCents).toBe(1000);
    expect(p.totalCents).toBe(6000);
  });

  it('applies a fixed coupon, then VAT', () => {
    const p = computePrice({
      netCents: 10000,
      countryCode: 'DE',
      coupon: { code: 'X', type: 'amount', value: 2500 },
    });
    expect(p.discountedNetCents).toBe(7500);
    expect(p.vatRatePercent).toBe(19);
    expect(p.vatCents).toBe(1425); // 7500 * 19 / 100
    expect(p.totalCents).toBe(8925);
  });

  it('yields a zero total for a full discount', () => {
    const p = computePrice({
      netCents: 10000,
      countryCode: 'FR',
      coupon: { code: 'FREE', type: 'percent', value: 100 },
    });
    expect(p.totalCents).toBe(0);
    expect(p.vatCents).toBe(0);
  });

  it('rejects a negative net price', () => {
    expect(() => computePrice({ netCents: -1, countryCode: 'FR' })).toThrow();
  });

  it('rejects a non-integer net price', () => {
    expect(() => computePrice({ netCents: 10.5, countryCode: 'FR' })).toThrow();
  });
});
