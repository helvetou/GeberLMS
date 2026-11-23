/**
 * Facturation TVA (FR-47). Montants en centimes entiers.
 */
import { ErrorCodes, type ErrorCode } from './errors';
export interface Invoice {
  id: string;
  enrollmentId: string;
  number: string;
  netCents: number;
  vatRatePercent: number;
  vatCents: number;
  totalCents: number;
  createdAt: string;
}

export class InvoiceError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'InvoiceError';
    this.code = code;
  }
}

/** Numéro de facture séquentiel par année : INV-AAAA-0001. */
export function formatInvoiceNumber(year: number, sequence: number): string {
  return `INV-${year}-${String(sequence).padStart(4, '0')}`;
}

/** Prochain numéro à partir du précédent (même année → +1, sinon 0001). */
export function nextInvoiceNumber(previous: string | undefined, year: number): string {
  const match = previous?.match(/^INV-(\d{4})-(\d+)$/);
  if (!match) {
    return formatInvoiceNumber(year, 1);
  }
  const prevYear = Number(match[1]);
  const sequence = prevYear === year ? Number(match[2]) + 1 : 1;
  return formatInvoiceNumber(year, sequence);
}

/** Vérifie la cohérence d'une facture (totaux, signes, numéro). */
export function validateInvoice(invoice: Invoice): void {
  if (!invoice.number.trim()) {
    throw new InvoiceError(ErrorCodes.INVOICE_INVALID, 'Numéro de facture requis');
  }
  if (invoice.netCents < 0 || invoice.vatCents < 0 || invoice.totalCents < 0) {
    throw new InvoiceError(ErrorCodes.INVOICE_INVALID, 'Montants négatifs invalides');
  }
  if (invoice.netCents + invoice.vatCents !== invoice.totalCents) {
    throw new InvoiceError(ErrorCodes.INVOICE_INVALID, 'Total incohérent (net + TVA ≠ total)');
  }
}
