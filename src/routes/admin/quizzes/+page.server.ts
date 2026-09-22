import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import {
  listQuizLessons,
  createQuizQuestion,
  deleteQuizQuestion,
  QuizServiceError,
} from '$lib/server/quiz';

export const load: PageServerLoad = async ({ locals, platform }) => {
  if (locals.user?.role !== 'admin') {
    throw redirect(303, '/login');
  }
  const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
  if (!db) {
    return { lessons: [], error: 'Base de données indisponible' };
  }
  return { lessons: await listQuizLessons(db) };
};

export const actions: Actions = {
  createQuestion: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
    if (!db) return fail(503, { error: 'Base de données indisponible' });

    const data = await request.formData();
    const lessonId = String(data.get('lessonId') ?? '');
    const prompt = String(data.get('prompt') ?? '');
    const choices = String(data.get('choices') ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const correctIndex = Number(data.get('correctIndex') ?? NaN);
    const pointsRaw = String(data.get('points') ?? '');
    const points = pointsRaw ? Number(pointsRaw) : undefined;

    try {
      await createQuizQuestion(db, { lessonId, prompt, choices, correctIndex, points });
    } catch (err) {
      if (err instanceof QuizServiceError) return fail(400, { error: err.message });
      throw err;
    }
    throw redirect(303, '/admin/quizzes');
  },

  deleteQuestion: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
    if (!db) return fail(503, { error: 'Base de données indisponible' });

    const data = await request.formData();
    try {
      await deleteQuizQuestion(db, String(data.get('id') ?? ''));
    } catch (err) {
      if (err instanceof QuizServiceError) return fail(400, { error: err.message });
      throw err;
    }
    throw redirect(303, '/admin/quizzes');
  },
};
