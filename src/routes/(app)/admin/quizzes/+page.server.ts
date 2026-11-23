import { ErrorCodes } from '$lib/domain/errors';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import {
  listQuizLessons,
  createQuizQuestion,
  deleteQuizQuestion,
  updateQuizQuestion,
  generateQuizQuestions,
  QuizServiceError,
  type QuizLlm,
} from '$lib/server/quiz';
import { mockQuizQuestions } from '$lib/domain/quiz';
import { recordLlmUsage, getLlmBudgetState } from '$lib/server/llm-budget';

export const load: PageServerLoad = async ({ locals, platform }) => {
  if (locals.user?.role !== 'admin') {
    throw redirect(303, '/login');
  }
  const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
  if (!db) {
    return { lessons: [], budget: null, error: ErrorCodes.DB_UNAVAILABLE };
  }
  return { lessons: await listQuizLessons(db), budget: await getLlmBudgetState(db) };
};

export const actions: Actions = {
  createQuestion: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
    if (!db) return fail(503, { error: ErrorCodes.DB_UNAVAILABLE });

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
      if (err instanceof QuizServiceError) return fail(400, { error: err.code });
      throw err;
    }
    throw redirect(303, '/admin/quizzes');
  },

  deleteQuestion: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
    if (!db) return fail(503, { error: ErrorCodes.DB_UNAVAILABLE });

    const data = await request.formData();
    try {
      await deleteQuizQuestion(db, String(data.get('id') ?? ''));
    } catch (err) {
      if (err instanceof QuizServiceError) return fail(400, { error: err.code });
      throw err;
    }
    throw redirect(303, '/admin/quizzes');
  },

  updateQuestion: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
    if (!db) return fail(503, { error: ErrorCodes.DB_UNAVAILABLE });

    const data = await request.formData();
    const id = String(data.get('id') ?? '');
    const prompt = String(data.get('prompt') ?? '');
    const choices = String(data.get('choices') ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const correctIndex = Number(data.get('correctIndex') ?? NaN);
    const pointsRaw = String(data.get('points') ?? '');
    const points = pointsRaw ? Number(pointsRaw) : undefined;

    try {
      await updateQuizQuestion(db, id, { prompt, choices, correctIndex, points });
    } catch (err) {
      if (err instanceof QuizServiceError) return fail(400, { error: err.code });
      throw err;
    }
    throw redirect(303, '/admin/quizzes');
  },

  generate: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    const dbBinding = platform?.env?.DB;
    if (!dbBinding) return fail(503, { error: ErrorCodes.DB_UNAVAILABLE });

    const data = await request.formData();
    const lessonId = String(data.get('lessonId') ?? '');
    const topic = String(data.get('topic') ?? '');
    const count = Number(data.get('count') ?? '5');

    const aiBinding = platform?.env?.AI;
    const llm: QuizLlm = aiBinding
      ? {
          generate: async (prompt) => {
            const ai = aiBinding as unknown as {
              run: (model: string, inputs: unknown) => Promise<{ response?: string }>;
            };
            const res = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
              messages: [{ role: 'user', content: prompt }],
            });
            return res.response ?? '';
          },
        }
      : {
          // Mock local hors ligne (m2) : dev/test sans binding AI distant.
          generate: async () => JSON.stringify(mockQuizQuestions(topic, count)),
        };

    try {
      const created = await generateQuizQuestions(createDb(dbBinding), llm, {
        lessonId,
        topic,
        count,
      });
      if (aiBinding) {
        const promptTokens = Math.max(1, Math.round((topic.length + 200) / 4));
        await recordLlmUsage(createDb(dbBinding), '@cf/meta/llama-3.1-8b-instruct', promptTokens);
      }
      return { ok: true, created };
    } catch (err) {
      if (err instanceof QuizServiceError) return fail(400, { error: err.code });
      throw err;
    }
  },
};
