import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { getLearnerDashboardView } from '$lib/server/dashboard';
import { recordLessonProgress, ProgressServiceError } from '$lib/server/progress';
import { listQuizQuestions, gradeQuizForLesson, QuizServiceError } from '$lib/server/quiz';
import { listUploads, createUpload, UploadServiceError } from '$lib/server/upload';
import { logActivity } from '$lib/server/activity';
import { ACTIONS as ACTIVITY_ACTIONS } from '$lib/domain/activity';
import type { AnswerSelection, QuizQuestion } from '$lib/domain/quiz';

export const load: PageServerLoad = async ({ locals, platform }) => {
  if (!locals.user) {
    throw redirect(303, '/login');
  }
  if (locals.user.role !== 'learner') {
    throw redirect(303, '/');
  }

  const dbBinding = platform?.env?.DB;
  if (!dbBinding) {
    return { view: null, quizzes: {}, error: 'Base de données indisponible' };
  }

  const db = createDb(dbBinding);
  const view = await getLearnerDashboardView(db, locals.user.id);

  const quizzes: Record<string, QuizQuestion[]> = {};
  for (const course of view.courses) {
    for (const lesson of course.lessons) {
      if (lesson.type === 'quiz') {
        quizzes[lesson.lessonId] = await listQuizQuestions(db, lesson.lessonId);
      }
    }
  }

  return {
    view,
    quizzes,
    uploads: await listUploads(db, locals.user.id),
    userName: locals.user.name ?? locals.user.email,
  };
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

  submitQuiz: async ({ request, locals, platform }) => {
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

    const answers: AnswerSelection[] = [];
    for (const [key, value] of data.entries()) {
      if (key.startsWith('q_')) {
        answers.push({ questionId: key.slice(2), selectedIndex: Number(value) });
      }
    }

    const db = createDb(dbBinding);
    try {
      const quizResult = await gradeQuizForLesson(db, {
        learnerId: locals.user.id,
        enrollmentId,
        lessonId,
        answers,
      });
      await logActivity(db, {
        actorId: locals.user.id,
        action: ACTIVITY_ACTIONS.progressUpdate,
        targetType: 'lesson',
        targetId: lessonId,
      });
      return { ok: true, quizResult };
    } catch (err) {
      if (err instanceof QuizServiceError) {
        return fail(400, { error: err.message });
      }
      throw err;
    }
  },

  upload: async ({ request, locals, platform }) => {
    if (!locals.user || locals.user.role !== 'learner') {
      return fail(403, { error: 'Accès refusé' });
    }

    const dbBinding = platform?.env?.DB;
    const r2 = platform?.env?.FILES;
    if (!dbBinding || !r2) {
      return fail(503, { error: 'Stockage indisponible' });
    }

    const data = await request.formData();
    const file = data.get('file');
    if (!(file instanceof File) || file.size === 0) {
      return fail(400, { error: 'Fichier requis' });
    }
    const lessonId = String(data.get('lessonId') ?? '').trim() || undefined;

    try {
      const buf = await file.arrayBuffer();
      await createUpload(
        createDb(dbBinding),
        r2,
        locals.user.id,
        { filename: file.name, contentType: file.type || undefined, data: buf },
        lessonId,
      );
      await logActivity(createDb(dbBinding), {
        actorId: locals.user.id,
        action: ACTIVITY_ACTIONS.uploadCreate,
        targetType: 'upload',
      });
      return { ok: true, uploaded: true };
    } catch (err) {
      if (err instanceof UploadServiceError) {
        return fail(400, { error: err.message });
      }
      throw err;
    }
  },
};
