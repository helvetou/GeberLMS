import { eq, inArray } from 'drizzle-orm';
import type { DB } from './db';
import { users, guardianships, enrollments, courses, modules, lessons, progress } from './db/schema';
import { buildTutorDashboard, buildLearnerDashboard } from '$lib/domain/dashboard';
import type { ProgressEntry } from '$lib/domain/progress';

export interface TutorDashboardView {
  tutorId: string;
  learners: Array<{
    learnerId: string;
    name: string;
    courses: Array<{
      courseId: string;
      title: string;
      status: string;
      completedLessons: number;
      totalLessons: number;
    }>;
  }>;
}

export async function getTutorDashboardView(db: DB, tutorId: string): Promise<TutorDashboardView> {
  const links = await db.select().from(guardianships).where(eq(guardianships.tutorId, tutorId)).all();
  const enrollmentRows = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.payerId, tutorId))
    .all();

  const courseRows = await db.select().from(courses).all();
  const moduleRows = await db.select().from(modules).all();
  const lessonRows = await db.select().from(lessons).all();

  const enrollmentIds = enrollmentRows.map((e) => e.id);
  const progressRows = enrollmentIds.length
    ? await db.select().from(progress).where(inArray(progress.enrollmentId, enrollmentIds)).all()
    : [];

  const progressEntries: ProgressEntry[] = progressRows.map((p) => ({
    id: p.id,
    enrollmentId: p.enrollmentId,
    lessonId: p.lessonId,
    status: p.status,
    score: p.score ?? undefined,
    completedAt: p.completedAt ? Date.parse(p.completedAt) : undefined,
  }));

  const dashboard = buildTutorDashboard({
    tutorId,
    guardianships: links,
    enrollments: enrollmentRows,
    catalog: { courses: courseRows, modules: moduleRows, lessons: lessonRows, resources: [] },
    progress: progressEntries,
  });

  const learnerIds = dashboard.learners.map((l) => l.learnerId);
  const learnerRows = learnerIds.length
    ? await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(inArray(users.id, learnerIds))
        .all()
    : [];
  const nameById = new Map(learnerRows.map((u) => [u.id, u.name ?? u.email]));

  return {
    tutorId,
    learners: dashboard.learners.map((l) => ({
      learnerId: l.learnerId,
      name: nameById.get(l.learnerId) ?? l.learnerId,
      courses: l.courses,
    })),
  };
}

/**
 * Vue du tableau de bord apprenant (FR-22) : inscriptions, progression
 * par leçon et total complété, à partir de la base D1.
 */
export async function getLearnerDashboardView(db: DB, learnerId: string) {
  const enrollmentRows = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.learnerId, learnerId))
    .all();

  const courseRows = await db.select().from(courses).all();
  const moduleRows = await db.select().from(modules).all();
  const lessonRows = await db.select().from(lessons).all();

  const enrollmentIds = enrollmentRows.map((e) => e.id);
  const progressRows = enrollmentIds.length
    ? await db
        .select()
        .from(progress)
        .where(inArray(progress.enrollmentId, enrollmentIds))
        .all()
    : [];

  const progressEntries: ProgressEntry[] = progressRows.map((p) => ({
    id: p.id,
    enrollmentId: p.enrollmentId,
    lessonId: p.lessonId,
    status: p.status,
    score: p.score ?? undefined,
    completedAt: p.completedAt ? Date.parse(p.completedAt) : undefined,
  }));

  return buildLearnerDashboard({
    learnerId,
    enrollments: enrollmentRows,
    catalog: { courses: courseRows, modules: moduleRows, lessons: lessonRows, resources: [] },
    progress: progressEntries,
  });
}
