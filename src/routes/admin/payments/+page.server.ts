import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import {
  listEnrollmentsForAdmin,
  confirmEnrollmentPayment,
  PaymentServiceError,
} from '$lib/server/payment';

export const load: PageServerLoad = async ({ locals, platform }) => {
  if (locals.user?.role !== 'admin') {
    throw redirect(303, '/login');
  }
  const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
  if (!db) {
    return { enrollments: [], error: 'Base de données indisponible' };
  }
  return { enrollments: await listEnrollmentsForAdmin(db) };
};

export const actions: Actions = {
  markPaid: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') {
      return fail(403, { error: 'Accès refusé' });
    }
    const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
    if (!db) {
      return fail(503, { error: 'Base de données indisponible' });
    }

    const data = await request.formData();
    const enrollmentId = String(data.get('enrollmentId') ?? '').trim();

    try {
      const { invoiceNumber } = await confirmEnrollmentPayment(db, enrollmentId);
      return { ok: true, invoiceNumber };
    } catch (err) {
      if (err instanceof PaymentServiceError) {
        return fail(400, { error: err.message });
      }
      throw err;
    }
  },
};
