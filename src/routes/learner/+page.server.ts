import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { getLearnerDashboardView } from '$lib/server/dashboard';
import { recordLessonProgress, ProgressServiceError } from '$lib/server/progress';
import { logActivity } from '$lib/server/activity';
import { ACTIONS as ACTIVITY_ACTIONS } from '$lib/domain/activity';

export const load: PageServerLoad = async ({ locals, platform }) => {
  if (!locals.user) {
    throw redirect(303, '/login');
  }
  if (locals.user.role !== 'learner') {
    throw redirect(303, '/');
  }

  const dbBinding = platform?.env?.DB;
  if (!dbBinding) {
    return { view: null, error: 'Base de données indisponible' };
  }

  const view = await getLearnerDashboardView(createDb(dbBinding), locals.user.id);
  return { view, userName: locals.user.name ?? locals.user.email };
};

export const actions: Actions = {
  complete: async ({ request, locals, platform }) => {
    if (!locals.user || locals.user.role !== 'learner') {
      return fail(403, { error: 'Accès refusé' });
    }

    const dbBinding = platform?.env?.DB;
    if (!dbBinding) {
      return fail(503, { error: 'Base de données indisponible' });
    }

    const data = await request.formData();
    const enrollmentId = String(data.get('enrollmentId') ?? '').trim();
    const lessonId = String(data.get('lessonId') ?? '').trim();
    if (!enrollmentId || !lessonId) {
      return fail(400, { error: 'Paramètres requis' });
    }

    const db = createDb(dbBinding);
    try {
      await recordLessonProgress(db, {
        learnerId: locals.user.id,
        enrollmentId,
        lessonId,
        status: 'completed',
      });
      await logActivity(db, {
        actorId: locals.user.id,
        action: ACTIVITY_ACTIONS.progressUpdate,
        targetType: 'lesson',
        targetId: lessonId,
      });
      return { ok: true };
    } catch (err) {
      if (err instanceof ProgressServiceError) {
        return fail(400, { error: err.message });
      }
      throw err;
    }
  },
};
