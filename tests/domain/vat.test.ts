import { describe, it, expect } from 'vitest';
import { EU_VAT_RATES, euVatRate, vatRateForCountry } from '../../src/lib/domain/vat';

const EU_MEMBERS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'EL', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
];

describe('EU VAT rates', () => {
  it('covers all current EU member states', () => {
    for (const cc of EU_MEMBERS) {
      expect(euVatRate(cc), cc).not.toBeNull();
    }
  });

  it('returns known standard rates', () => {
    expect(euVatRate('FR')).toBe(20);
    expect(euVatRate('DE')).toBe(19);
    expect(euVatRate('EE')).toBe(22);
    expect(euVatRate('IT')).toBe(22);
    expect(euVatRate('ES')).toBe(21);
  });

  it('returns null for non-EU countries', () => {
    expect(euVatRate('CH')).toBeNull();
    expect(euVatRate('US')).toBeNull();
    expect(euVatRate('GB')).toBeNull();
  });

  it('applies 0% VAT for non-EU buyers', () => {
    expect(vatRateForCountry('CH')).toBe(0);
    expect(vatRateForCountry('US')).toBe(0);
  });

  it('is case-insensitive', () => {
    expect(euVatRate('fr')).toBe(20);
  });

  it('holds only sane rate values', () => {
    for (const [cc, rate] of Object.entries(EU_VAT_RATES)) {
      expect(rate, cc).toBeGreaterThan(0);
      expect(rate, cc).toBeLessThan(100);
    }
  });
});
