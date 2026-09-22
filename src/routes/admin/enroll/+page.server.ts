import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { listCourses, enrollLearner, EnrollmentServiceError } from '$lib/server/enrollment';
import { logActivity } from '$lib/server/activity';
import { ACTIONS as ACTIVITY_ACTIONS } from '$lib/domain/activity';

export const load: PageServerLoad = async ({ locals, platform }) => {
  if (locals.user?.role !== 'admin') {
    throw redirect(303, '/login');
  }
  const dbBinding = platform?.env?.DB;
  if (!dbBinding) return { courses: [] };
  const courses = await listCourses(createDb(dbBinding));
  return { courses };
};

export const actions: Actions = {
  enroll: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') {
      return fail(403, { error: 'Accès refusé' });
    }
    const dbBinding = platform?.env?.DB;
    if (!dbBinding) return fail(503, { error: 'Base de données indisponible' });

    const data = await request.formData();
    const learnerEmail = String(data.get('learnerEmail') ?? '').trim();
    const courseId = String(data.get('courseId') ?? '').trim();
    const couponCode = String(data.get('couponCode') ?? '').trim();
    if (!learnerEmail || !courseId) {
      return fail(400, { error: 'Email et cours requis' });
    }

    const db = createDb(dbBinding);
    try {
      const { enrollmentId, totalCents } = await enrollLearner(db, {
        learnerEmail,
        courseId,
        couponCode: couponCode || undefined,
      });
      await logActivity(db, {
        actorId: locals.user.id,
        action: ACTIVITY_ACTIONS.enrollmentCreate,
        targetType: 'enrollment',
        targetId: enrollmentId,
      });
      return { ok: true, totalCents };
    } catch (err) {
      if (err instanceof EnrollmentServiceError) {
        return fail(400, { error: err.message });
      }
      throw err;
    }
  },
};
