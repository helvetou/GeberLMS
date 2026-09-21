import { discountFor, type Coupon } from './coupon';
import { vatRateForCountry } from './vat';

export interface PriceBreakdown {
  /** Prix de base hors TVA, en centimes. */
  netCents: number;
  /** Remise appliquée, en centimes. */
  discountCents: number;
  /** Prix hors TVA après remise, en centimes. */
  discountedNetCents: number;
  /** Taux de TVA en pourcentage (ex. 20). */
  vatRatePercent: number;
  /** Montant de TVA, en centimes. */
  vatCents: number;
  /** Total TTC à facturer, en centimes. */
  totalCents: number;
}

/**
 * Calcule le prix final TTC pour un acheteur.
 *
 * Règle : remise appliquée sur le prix net, puis TVA calculée sur le
 * montant remisé, au taux du pays de l'acheteur (régime OSS).
 */
export function computePrice(opts: {
  netCents: number;
  countryCode: string;
  coupon?: Coupon;
  now?: Date;
}): PriceBreakdown {
  const { netCents, countryCode, coupon } = opts;

  if (!Number.isInteger(netCents) || netCents < 0) {
    throw new Error('netCents doit être un entier positif ou nul (centimes)');
  }

  const discountCents = coupon ? discountFor(coupon, netCents, opts.now) : 0;
  const discountedNetCents = netCents - discountCents;
  const vatRatePercent = vatRateForCountry(countryCode);
  const vatCents = Math.round((discountedNetCents * vatRatePercent) / 100);
  const totalCents = discountedNetCents + vatCents;

  return {
    netCents,
    discountCents,
    discountedNetCents,
    vatRatePercent,
    vatCents,
    totalCents,
  };
}
