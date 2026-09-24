import { describe, it, expect } from 'vitest';
import { confirmPayment, PaymentError, type Payment } from '../../src/lib/domain/payment';

const payment = (overrides: Partial<Payment> = {}): Payment => ({
  id: 'p1',
  enrollmentId: 'e1',
  provider: 'payoneer',
  amountCents: 12000,
  currency: 'EUR',
  status: 'pending',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('confirmPayment (FR-40/FR-41)', () => {
  it('confirms a pending payment with a timestamp', () => {
    const p = confirmPayment(payment(), '2026-01-02T00:00:00.000Z');
    expect(p.status).toBe('confirmed');
    expect(p.confirmedAt).toBe('2026-01-02T00:00:00.000Z');
  });

  it('rejects an already-confirmed payment', () => {
    expect(() => confirmPayment(payment({ status: 'confirmed' }))).toThrow(PaymentError);
  });

  it('rejects a non-positive amount', () => {
    expect(() => confirmPayment(payment({ amountCents: 0 }))).toThrow(PaymentError);
  });
});
