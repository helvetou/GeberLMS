/**
 * Modèle de coupon / code promo.
 *
 * Montants exprimés en centimes (entiers) pour éviter les erreurs de
 * virgule flottante. Exemple : 10000 = 100,00 €.
 */
export type CouponType = 'percent' | 'amount';

export interface Coupon {
  code: string;
  type: CouponType;
  /** percent : 0–100. amount : centimes. */
  value: number;
  /** Date d'expiration ISO (optionnel). */
  expiresAt?: string;
  /** Nombre maximal d'utilisations (optionnel). */
  maxUses?: number;
  /** Nombre d'utilisations déjà consommées. */
  usedCount?: number;
  enabled?: boolean;
}

export class CouponError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CouponError';
  }
}

/** Montant de la remise, en centimes. */
export function discountFor(
  coupon: Coupon,
  netCents: number,
  now: Date = new Date(),
): number {
  validateCoupon(coupon, now);

  if (coupon.type === 'percent') {
    return Math.round((netCents * coupon.value) / 100);
  }

  // Remise en montant fixe, plafonnée au prix net (jamais négatif).
  return Math.min(coupon.value, netCents);
}

/** Lève une CouponError si le coupon ne peut pas être appliqué. */
export function validateCoupon(coupon: Coupon, now: Date = new Date()): void {
  if (coupon.enabled === false) {
    throw new CouponError('Coupon désactivé');
  }

  if (coupon.type === 'percent') {
    if (coupon.value < 0 || coupon.value > 100) {
      throw new CouponError('Un coupon en % doit être entre 0 et 100');
    }
  } else if (coupon.type === 'amount') {
    if (coupon.value < 0) {
      throw new CouponError('Un coupon en montant doit être positif ou nul');
    }
  } else {
    throw new CouponError('Type de coupon inconnu');
  }

  if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
    throw new CouponError('Coupon expiré');
  }

  if (coupon.maxUses !== undefined && (coupon.usedCount ?? 0) >= coupon.maxUses) {
    throw new CouponError('Limite d\u2019utilisation du coupon atteinte');
  }
}
