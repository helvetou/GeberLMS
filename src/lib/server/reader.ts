import { and, eq, inArray } from 'drizzle-orm';
import type { DB } from './db';
import { enrollments, courses, modules, lessons, resources, progress } from './db/schema';
import { buildCourseReader, type CourseReader } from '$lib/domain/reader';
import type { ProgressEntry } from '$lib/domain/progress';
import { ErrorCodes, type ErrorCode } from '$lib/domain/errors';
import { marked } from 'marked';

export class ReaderServiceError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'ReaderServiceError';
    this.code = code;
  }
}

/**
 * Rendu markdown → HTML (leçons de type texte). Le contenu est rédigé par
 * l'admin (frontière de confiance) ; la sanitisation est renforcée en m8.
 */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

/**
 * Lecteur de cours pour un apprenant inscrit (FR-20, FR-30, m5) : vérifie
 * l'inscription active, charge le catalogue + progression, assemble la vue.
 */
export async function getLearnerCourseReader(
  db: DB,
  learnerId: string,
  courseId: string,
): Promise<CourseReader> {
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.learnerId, learnerId), eq(enrollments.courseId, courseId)))
    .get();
  if (!enrollment) {
    throw new ReaderServiceError(ErrorCodes.ENROLLMENT_NOT_FOUND, 'Inscription introuvable');
  }
  if (enrollment.status !== 'active') {
    throw new ReaderServiceError(ErrorCodes.ENROLLMENT_NOT_ACTIVE, 'Inscription non active');
  }

  const courseRows = await db.select().from(courses).where(eq(courses.id, courseId)).all();
  const moduleRows = await db.select().from(modules).where(eq(modules.courseId, courseId)).all();
  const moduleIds = moduleRows.map((m) => m.id);
  const lessonRows = moduleIds.length
    ? await db.select().from(lessons).where(inArray(lessons.moduleId, moduleIds)).all()
    : [];
  const lessonIds = lessonRows.map((l) => l.id);
  const resourceRows = lessonIds.length
    ? await db.select().from(resources).where(inArray(resources.lessonId, lessonIds)).all()
    : [];
  const progressRows = await db
    .select()
    .from(progress)
    .where(eq(progress.enrollmentId, enrollment.id))
    .all();

  const progressEntries: ProgressEntry[] = progressRows.map((p) => ({
    id: p.id,
    enrollmentId: p.enrollmentId,
    lessonId: p.lessonId,
    status: p.status,
    score: p.score ?? undefined,
    completedAt: p.completedAt ? Date.parse(p.completedAt) : undefined,
  }));

  return buildCourseReader({
    courseId,
    enrollmentId: enrollment.id,
    catalog: { courses: courseRows, modules: moduleRows, lessons: lessonRows, resources: resourceRows },
    progress: progressEntries,
  });
}
