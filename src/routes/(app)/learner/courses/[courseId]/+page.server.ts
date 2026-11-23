import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { getLearnerCourseReader, renderMarkdown, ReaderServiceError } from '$lib/server/reader';
import { recordLessonProgress, ProgressServiceError } from '$lib/server/progress';
import { listQuizQuestions, gradeQuizForLesson, QuizServiceError } from '$lib/server/quiz';
import { logActivity } from '$lib/server/activity';
import { ACTIONS as ACTIVITY_ACTIONS } from '$lib/domain/activity';
import { ErrorCodes } from '$lib/domain/errors';
import type { AnswerSelection, QuizQuestion } from '$lib/domain/quiz';

export const load: PageServerLoad = async ({ locals, params, platform }) => {
  if (!locals.user) throw redirect(303, '/login');
  if (locals.user.role !== 'learner') throw redirect(303, '/');

  const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
  if (!db) return { reader: null, error: ErrorCodes.DB_UNAVAILABLE, quizzes: {}, rendered: {} };

  try {
    const reader = await getLearnerCourseReader(db, locals.user.id, params.courseId);
    const quizzes: Record<string, QuizQuestion[]> = {};
    const rendered: Record<string, string> = {};
    for (const m of reader.modules) {
      for (const l of m.lessons) {
        if (l.lesson.type === 'text' && l.lesson.contentRef) {
          rendered[l.lesson.id] = renderMarkdown(l.lesson.contentRef);
        }
        if (l.lesson.type === 'quiz') {
          quizzes[l.lesson.id] = await listQuizQuestions(db, l.lesson.id);
        }
      }
    }
    return {
      reader,
      quizzes,
      rendered,
      learnerEmail: locals.user.email,
      learnerName: locals.user.name ?? locals.user.email,
    };
  } catch (err) {
    if (err instanceof ReaderServiceError) {
      return { reader: null, error: err.code, quizzes: {}, rendered: {} };
    }
    throw err;
  }
};

export const actions: Actions = {
  complete: async ({ request, locals, platform }) => {
    if (!locals.user || locals.user.role !== 'learner') {
      return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    }
    const dbBinding = platform?.env?.DB;
    if (!dbBinding) return fail(503, { error: ErrorCodes.DB_UNAVAILABLE });

    const data = await request.formData();
    const enrollmentId = String(data.get('enrollmentId') ?? '').trim();
    const lessonId = String(data.get('lessonId') ?? '').trim();
    if (!enrollmentId || !lessonId) return fail(400, { error: ErrorCodes.PARAMS_REQUIRED });

    const db = createDb(dbBinding);
    try {
      await recordLessonProgress(db, { learnerId: locals.user.id, enrollmentId, lessonId, status: 'completed' });
      await logActivity(db, {
        actorId: locals.user.id,
        action: ACTIVITY_ACTIONS.progressUpdate,
        targetType: 'lesson',
        targetId: lessonId,
      });
      return { ok: true };
    } catch (err) {
      if (err instanceof ProgressServiceError) return fail(400, { error: err.code });
      throw err;
    }
  },

  submitQuiz: async ({ request, locals, platform }) => {
    if (!locals.user || locals.user.role !== 'learner') {
      return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    }
    const dbBinding = platform?.env?.DB;
    if (!dbBinding) return fail(503, { error: ErrorCodes.DB_UNAVAILABLE });

    const data = await request.formData();
    const enrollmentId = String(data.get('enrollmentId') ?? '').trim();
    const lessonId = String(data.get('lessonId') ?? '').trim();
    if (!enrollmentId || !lessonId) return fail(400, { error: ErrorCodes.PARAMS_REQUIRED });

    const answers: AnswerSelection[] = [];
    for (const [key, value] of data.entries()) {
      if (key.startsWith('q_')) answers.push({ questionId: key.slice(2), selectedIndex: Number(value) });
    }

    const db = createDb(dbBinding);
    try {
      const quizResult = await gradeQuizForLesson(db, { learnerId: locals.user.id, enrollmentId, lessonId, answers });
      await logActivity(db, {
        actorId: locals.user.id,
        action: ACTIVITY_ACTIONS.progressUpdate,
        targetType: 'lesson',
        targetId: lessonId,
      });
      return { ok: true, quizResult, lessonId };
    } catch (err) {
      if (err instanceof QuizServiceError || err instanceof ProgressServiceError) {
        return fail(400, { error: err.code });
      }
      throw err;
    }
  },
};
