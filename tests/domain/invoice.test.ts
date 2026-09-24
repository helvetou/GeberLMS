import { describe, it, expect } from 'vitest';
import {
  formatInvoiceNumber,
  nextInvoiceNumber,
  validateInvoice,
  InvoiceError,
  type Invoice,
} from '../../src/lib/domain/invoice';

const invoice = (overrides: Partial<Invoice> = {}): Invoice => ({
  id: 'i1',
  enrollmentId: 'e1',
  number: 'INV-2026-0001',
  netCents: 10000,
  vatRatePercent: 20,
  vatCents: 2000,
  totalCents: 12000,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('formatInvoiceNumber (FR-47)', () => {
  it('zero-pads the sequence', () => {
    expect(formatInvoiceNumber(2026, 1)).toBe('INV-2026-0001');
    expect(formatInvoiceNumber(2026, 42)).toBe('INV-2026-0042');
  });
});

describe('nextInvoiceNumber (FR-47)', () => {
  it('starts at 0001 when there is no previous invoice', () => {
    expect(nextInvoiceNumber(undefined, 2026)).toBe('INV-2026-0001');
  });

  it('increments within the same year', () => {
    expect(nextInvoiceNumber('INV-2026-0042', 2026)).toBe('INV-2026-0043');
  });

  it('restarts at 0001 on a new year', () => {
    expect(nextInvoiceNumber('INV-2025-0099', 2026)).toBe('INV-2026-0001');
  });

  it('falls back to 0001 on an unrecognized previous number', () => {
    expect(nextInvoiceNumber('weird', 2026)).toBe('INV-2026-0001');
  });
});

describe('validateInvoice (FR-47)', () => {
  it('accepts a coherent invoice', () => {
    expect(() => validateInvoice(invoice())).not.toThrow();
  });

  it('rejects a missing number', () => {
    expect(() => validateInvoice(invoice({ number: '  ' }))).toThrow(InvoiceError);
  });

  it('rejects negative amounts', () => {
    expect(() => validateInvoice(invoice({ totalCents: -1 }))).toThrow(InvoiceError);
  });

  it('rejects an inconsistent total (net + vat ≠ total)', () => {
    expect(() => validateInvoice(invoice({ totalCents: 99999 }))).toThrow(InvoiceError);
  });
});
