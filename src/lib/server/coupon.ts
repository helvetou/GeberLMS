import { eq } from 'drizzle-orm';
import type { DB } from './db';
import { coupons } from './db/schema';
import { validateCoupon, type Coupon } from '$lib/domain/coupon';

export class CouponServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CouponServiceError';
  }
}

export interface CouponRecord {
  id: string;
  coupon: Coupon;
}

export interface CreateCouponInput {
  code: string;
  type: string;
  value: number;
  expiresAt?: string;
  maxUses?: number;
}

export function listCoupons(db: DB) {
  return db.select().from(coupons).all();
}

export async function findCouponByCode(db: DB, code: string): Promise<CouponRecord | null> {
  const row = await db.select().from(coupons).where(eq(coupons.code, code.trim())).get();
  if (!row) return null;
  return {
    id: row.id,
    coupon: {
      code: row.code,
      type: row.type,
      value: row.value,
      expiresAt: row.expiresAt ?? undefined,
      maxUses: row.maxUses ?? undefined,
      usedCount: row.usedCount,
      enabled: row.enabled,
    },
  };
}

export async function createCoupon(db: DB, input: CreateCouponInput): Promise<string> {
  const code = input.code.trim();
  if (!code) throw new CouponServiceError('Code requis');
  if (input.type !== 'percent' && input.type !== 'amount') {
    throw new CouponServiceError('Type de coupon invalide');
  }

  const value = Number(input.value);
  const maxUses =
    input.maxUses !== undefined && !Number.isNaN(input.maxUses) ? input.maxUses : undefined;

  const coupon: Coupon = {
    code,
    type: input.type as 'percent' | 'amount',
    value,
    expiresAt: input.expiresAt?.trim() || undefined,
    maxUses,
    usedCount: 0,
    enabled: true,
  };

  try {
    validateCoupon(coupon);
  } catch (err) {
    if (err instanceof Error) {
      throw new CouponServiceError(err.message);
    }
    throw err;
  }

  const existing = await db
    .select({ id: coupons.id })
    .from(coupons)
    .where(eq(coupons.code, code))
    .get();
  if (existing) {
    throw new CouponServiceError('Ce code existe déjà');
  }

  const id = crypto.randomUUID();
  await db.insert(coupons).values({
    id,
    code,
    type: coupon.type,
    value: coupon.value,
    scope: null,
    expiresAt: coupon.expiresAt ?? null,
    maxUses: coupon.maxUses ?? null,
    usedCount: 0,
    enabled: true,
    createdAt: new Date().toISOString(),
  });
  return id;
}
