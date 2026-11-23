/**
 * Paiement (FR-40). Le LMS n'héberge aucune donnée de carte :
 * le paiement passe par Payoneer et n'est que confirmé ici.
 */
import { ErrorCodes, type ErrorCode } from './errors';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed';

export interface Payment {
  id: string;
  enrollmentId: string;
  provider: string;
  providerRef?: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  confirmedAt?: string;
}

export class PaymentError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
  }
}

/** Confirme un paiement en attente (FR-41). */
export function confirmPayment(payment: Payment, now: string = new Date().toISOString()): Payment {
  if (payment.status !== 'pending') {
    throw new PaymentError(ErrorCodes.PAYMENT_ALREADY_PROCESSED, 'Paiement déjà traité');
  }
  if (!Number.isInteger(payment.amountCents) || payment.amountCents <= 0) {
    throw new PaymentError(ErrorCodes.PAYMENT_AMOUNT_INVALID, 'Montant invalide');
  }
  return { ...payment, status: 'confirmed', confirmedAt: now };
}
