import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { listCoupons, createCoupon, CouponServiceError } from '$lib/server/coupon';

export const load: PageServerLoad = async ({ locals, platform }) => {
  if (locals.user?.role !== 'admin') {
    throw redirect(303, '/login');
  }
  const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
  if (!db) {
    return { coupons: [], error: 'Base de données indisponible' };
  }
  return { coupons: await listCoupons(db) };
};

export const actions: Actions = {
  create: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') {
      return fail(403, { error: 'Accès refusé' });
    }
    const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
    if (!db) {
      return fail(503, { error: 'Base de données indisponible' });
    }

    const data = await request.formData();
    const code = String(data.get('code') ?? '');
    const type = String(data.get('type') ?? '');
    const value = Number(data.get('value') ?? NaN);
    const expiresAt = String(data.get('expiresAt') ?? '') || undefined;
    const maxUsesRaw = String(data.get('maxUses') ?? '');
    const maxUses = maxUsesRaw ? Number(maxUsesRaw) : undefined;

    try {
      await createCoupon(db, { code, type, value, expiresAt, maxUses });
    } catch (err) {
      if (err instanceof CouponServiceError) {
        return fail(400, { error: err.message });
      }
      throw err;
    }

    throw redirect(303, '/admin/coupons');
  },
};
