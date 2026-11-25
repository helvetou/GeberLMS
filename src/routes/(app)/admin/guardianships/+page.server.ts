import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import {
  listGuardianships,
  linkGuardianship,
  unlinkGuardianship,
  GuardianshipServiceError,
} from '$lib/server/guardianship';
import { listTutors, listLearners } from '$lib/server/auth';
import { canManageGuardianship } from '$lib/domain/authz';
import { ErrorCodes } from '$lib/domain/errors';

export const load: PageServerLoad = async ({ locals, platform }) => {
  if (!locals.user || !canManageGuardianship(locals.user.role)) {
    throw redirect(303, '/login');
  }
  const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
  if (!db) {
    return { guardianships: [], tutors: [], learners: [], error: ErrorCodes.DB_UNAVAILABLE };
  }
  return {
    guardianships: await listGuardianships(db),
    tutors: await listTutors(db),
    learners: await listLearners(db),
  };
};

export const actions: Actions = {
  link: async ({ request, locals, platform }) => {
    if (!locals.user || !canManageGuardianship(locals.user.role)) {
      return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    }
    const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
    if (!db) return fail(503, { error: ErrorCodes.DB_UNAVAILABLE });

    const data = await request.formData();
    const tutorId = String(data.get('tutorId') ?? '').trim();
    const learnerId = String(data.get('learnerId') ?? '').trim();
    if (!tutorId || !learnerId) return fail(400, { error: ErrorCodes.PARAMS_REQUIRED });

    try {
      await linkGuardianship(db, tutorId, learnerId);
    } catch (err) {
      if (err instanceof GuardianshipServiceError) return fail(400, { error: err.code });
      throw err;
    }
    throw redirect(303, '/admin/guardianships');
  },

  unlink: async ({ request, locals, platform }) => {
    if (!locals.user || !canManageGuardianship(locals.user.role)) {
      return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    }
    const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
    if (!db) return fail(503, { error: ErrorCodes.DB_UNAVAILABLE });

    const data = await request.formData();
    const tutorId = String(data.get('tutorId') ?? '');
    const learnerId = String(data.get('learnerId') ?? '');
    await unlinkGuardianship(db, tutorId, learnerId);
    throw redirect(303, '/admin/guardianships');
  },
};
