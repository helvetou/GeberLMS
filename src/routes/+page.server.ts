import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Page d'accueil : aiguillage selon l'état de connexion.
 * - anonyme → /login
 * - admin → /admin/courses
 * - tuteur → /tutor
 * - apprenant → /learner
 */
export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    throw redirect(303, '/login');
  }

  switch (user.role) {
    case 'admin':
      throw redirect(303, '/admin/courses');
    case 'tutor':
      throw redirect(303, '/tutor');
    case 'learner':
      throw redirect(303, '/learner');
    default:
      throw redirect(303, '/login');
  }
};
