import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { getAdminCourseDetail } from '$lib/server/catalog';
import { renderMarkdown } from '$lib/server/reader';
import { listQuizQuestions } from '$lib/server/quiz';
import { ErrorCodes } from '$lib/domain/errors';
import type { QuizQuestion } from '$lib/domain/quiz';

/** Détail d'un cours en lecture (admin) : métadonnées + programme complet +
 *  aperçu du contenu des leçons (texte rendu, vidéo, quiz) comme un apprenant
 *  inscrit le verrait — sans progression, ni filigrane, ni soumission de quiz. */
export const load: PageServerLoad = async ({ locals, params, platform }) => {
  if (locals.user?.role !== 'admin') {
    throw redirect(303, '/login');
  }
  const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
  if (!db) return { detail: null, rendered: {}, quizzes: {}, error: ErrorCodes.DB_UNAVAILABLE };

  const detail = await getAdminCourseDetail(db, params.id);
  const rendered: Record<string, string> = {};
  const quizzes: Record<string, QuizQuestion[]> = {};
  if (detail) {
    for (const m of detail.modules) {
      for (const l of m.lessons) {
        if (l.lesson.type === 'text' && l.lesson.contentRef) {
          rendered[l.lesson.id] = renderMarkdown(l.lesson.contentRef);
        }
        if (l.lesson.type === 'quiz') {
          quizzes[l.lesson.id] = await listQuizQuestions(db, l.lesson.id);
        }
      }
    }
  }
  return { detail, rendered, quizzes };
};
