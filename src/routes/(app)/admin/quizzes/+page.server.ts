import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import {
  listQuizLessons,
  createQuizQuestion,
  deleteQuizQuestion,
  generateQuizQuestions,
  QuizServiceError,
  type QuizLlm,
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

  generate: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const dbBinding = platform?.env?.DB;
    const aiBinding = platform?.env?.AI;
    if (!dbBinding || !aiBinding) return fail(503, { error: 'Service d\u2019IA indisponible' });

    const data = await request.formData();
    const lessonId = String(data.get('lessonId') ?? '');
    const topic = String(data.get('topic') ?? '');
    const count = Number(data.get('count') ?? '5');

    const ai = aiBinding as unknown as {
      run: (model: string, inputs: unknown) => Promise<{ response?: string }>;
    };
    const llm: QuizLlm = {
      generate: async (prompt) => {
        const res = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [{ role: 'user', content: prompt }],
        });
        return res.response ?? '';
      },
    };

    try {
      const created = await generateQuizQuestions(createDb(dbBinding), llm, {
        lessonId,
        topic,
        count,
      });
      return { ok: true, created };
    } catch (err) {
      if (err instanceof QuizServiceError) return fail(400, { error: err.message });
      throw err;
    }
  },
};
