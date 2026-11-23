/**
 * Lecteur de cours (m5) — vue assemblée pour un apprenant inscrit :
 * modules visibles, leçons visibles (avec ressources et progression) et totaux.
 */
import type { Catalog, Course, Lesson, Module, Resource } from './catalog';
import type { ProgressEntry, ProgressStatus } from './progress';

export interface ReaderLesson {
  lesson: Lesson;
  resources: Resource[];
  status: ProgressStatus;
  score?: number;
}

export interface ReaderModule {
  module: Module;
  lessons: ReaderLesson[];
}

export interface CourseReader {
  course: Course;
  enrollmentId: string;
  modules: ReaderModule[];
  completedLessons: number;
  totalLessons: number;
}

export interface CourseReaderInput {
  courseId: string;
  enrollmentId: string;
  catalog: Catalog;
  progress: readonly ProgressEntry[];
}

/**
 * Assemble la vue du lecteur pour une inscription donnée : uniquement les
 * modules/leçons visibles, ordonnés par position, avec statut et score.
 */
export function buildCourseReader(input: CourseReaderInput): CourseReader {
  const course = input.catalog.courses.find((c) => c.id === input.courseId);
  if (!course) {
    throw new Error('Cours introuvable');
  }

  const visibleModules = input.catalog.modules
    .filter((m) => m.courseId === input.courseId && m.visibility === 'visible')
    .sort(byPosition);

  const modules: ReaderModule[] = visibleModules.map((module) => {
    const lessons: ReaderLesson[] = input.catalog.lessons
      .filter((l) => l.moduleId === module.id && l.visibility === 'visible')
      .sort(byPosition)
      .map((lesson) => {
        const entry = input.progress.find(
          (p) => p.enrollmentId === input.enrollmentId && p.lessonId === lesson.id,
        );
        return {
          lesson,
          resources: input.catalog.resources
            .filter((r) => r.lessonId === lesson.id && r.visibility === 'visible')
            .sort((a, b) => a.title.localeCompare(b.title)),
          status: entry?.status ?? 'not_started',
          score: entry?.score,
        };
      });

    return { module, lessons };
  });

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.status === 'completed').length,
    0,
  );

  return { course, enrollmentId: input.enrollmentId, modules, completedLessons, totalLessons };
}

function byPosition<T extends { position?: number }>(a: T, b: T): number {
  return (a.position ?? 0) - (b.position ?? 0);
}
