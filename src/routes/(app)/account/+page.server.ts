import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { recordConsent, exportUserData, eraseUserData } from '$lib/server/gdpr';
import { ErrorCodes } from '$lib/domain/errors';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(303, '/login');
  return { user: locals.user };
};

export const actions: Actions = {
  consent: async ({ request, locals, platform }) => {
    if (!locals.user) return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
    if (!db) return fail(503, { error: ErrorCodes.DB_UNAVAILABLE });

    const data = await request.formData();
    const marketing = data.get('marketing') === 'on';
    await recordConsent(db, locals.user.id, marketing);
    return { ok: true, consentSaved: true };
  },

  export: async ({ locals, platform }) => {
    if (!locals.user) return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
    if (!db) return fail(503, { error: ErrorCodes.DB_UNAVAILABLE });

    const bundle = await exportUserData(db, locals.user.id);
    const json = JSON.stringify(bundle, null, 2);
    return new Response(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="geberlms-export.json"',
      },
    });
  },

  erase: async ({ locals, platform }) => {
    if (!locals.user) return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
    if (!db) return fail(503, { error: ErrorCodes.DB_UNAVAILABLE });

    await eraseUserData(db, locals.user.id);
    throw redirect(303, '/logout');
  },
};
