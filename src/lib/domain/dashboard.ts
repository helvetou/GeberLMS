import { learnersOfTutor, type GuardianshipList } from './guardianship';
import { enrollmentsOfLearner, type Enrollment } from './enrollment';
import { visibleLessonsOfCourse, type Catalog, type Lesson } from './catalog';
import { completedLessonIds, type ProgressEntry, type ProgressStatus } from './progress';

export interface CourseProgress {
  courseId: string;
  title: string;
  status: Enrollment['status'];
  completedLessons: number;
  totalLessons: number;
}

export interface LearnerOverview {
  learnerId: string;
  courses: CourseProgress[];
}

export interface TutorDashboard {
  tutorId: string;
  learners: LearnerOverview[];
}

/**
 * Vue du tableau de bord tuteur (FR-21) : pour chaque apprenant financé,
 * ses cours et sa progression académique (leçons visibles uniquement).
 */
export function buildTutorDashboard(input: {
  tutorId: string;
  guardianships: GuardianshipList;
  enrollments: readonly Enrollment[];
  catalog: Catalog;
  progress: readonly ProgressEntry[];
}): TutorDashboard {
  const learnerIds = learnersOfTutor(input.guardianships, input.tutorId);

  const learners: LearnerOverview[] = learnerIds.map((learnerId) => {
    const enrollments = enrollmentsOfLearner(input.enrollments, learnerId);
    const courses: CourseProgress[] = enrollments.map((enrollment) => {
      const course = input.catalog.courses.find((c) => c.id === enrollment.courseId);
      const lessons = visibleLessonsOfCourse(input.catalog, enrollment.courseId);
      const completed = completedLessonIds(input.progress, enrollment.id).length;
      return {
        courseId: enrollment.courseId,
        title: course?.title ?? enrollment.courseId,
        status: enrollment.status,
        completedLessons: completed,
        totalLessons: lessons.length,
      };
    });
    return { learnerId, courses };
  });

  return { tutorId: input.tutorId, learners };
}

export interface LearnerLessonProgress {
  lessonId: string;
  title: string;
  type: Lesson['type'];
  status: ProgressStatus;
  score?: number;
}

export interface LearnerCourseProgress {
  enrollmentId: string;
  courseId: string;
  title: string;
  status: Enrollment['status'];
  completedLessons: number;
  totalLessons: number;
  lessons: LearnerLessonProgress[];
}

export interface LearnerDashboard {
  learnerId: string;
  courses: LearnerCourseProgress[];
}

/**
 * Vue du tableau de bord apprenant (FR-22) : ses inscriptions, la progression
 * par leçon (leçons visibles uniquement) et le total complété.
 */
export function buildLearnerDashboard(input: {
  learnerId: string;
  enrollments: readonly Enrollment[];
  catalog: Catalog;
  progress: readonly ProgressEntry[];
}): LearnerDashboard {
  const enrollments = enrollmentsOfLearner(input.enrollments, input.learnerId);

  const courses: LearnerCourseProgress[] = enrollments.map((enrollment) => {
    const course = input.catalog.courses.find((c) => c.id === enrollment.courseId);
    const lessons = visibleLessonsOfCourse(input.catalog, enrollment.courseId);

    const lessonRows: LearnerLessonProgress[] = lessons.map((lesson) => {
      const entry = input.progress.find(
        (p) => p.enrollmentId === enrollment.id && p.lessonId === lesson.id,
      );
      return {
        lessonId: lesson.id,
        title: lesson.title,
        type: lesson.type,
        status: entry?.status ?? 'not_started',
        score: entry?.score,
      };
    });

    return {
      enrollmentId: enrollment.id,
      courseId: enrollment.courseId,
      title: course?.title ?? enrollment.courseId,
      status: enrollment.status,
      completedLessons: lessonRows.filter((l) => l.status === 'completed').length,
      totalLessons: lessons.length,
      lessons: lessonRows,
    };
  });

  return { learnerId: input.learnerId, courses };
}

export interface LearnerStats {
  totalCourses: number;
  completedLessons: number;
  inProgressLessons: number;
  averageScore: number;
}

/** Statistiques globales du tableau de bord apprenant (m6). */
export function buildLearnerStats(dashboard: LearnerDashboard): LearnerStats {
  const allLessons = dashboard.courses.flatMap((c) => c.lessons);
  const scored = allLessons.filter((l) => l.score !== undefined && l.score !== null);
  return {
    totalCourses: dashboard.courses.length,
    completedLessons: allLessons.filter((l) => l.status === 'completed').length,
    inProgressLessons: allLessons.filter((l) => l.status === 'in_progress').length,
    averageScore: scored.length
      ? Math.round(scored.reduce((sum, l) => sum + (l.score ?? 0), 0) / scored.length)
      : 0,
  };
}

export interface NextLesson {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
}

/** Prochaine leçon à reprendre : en cours, sinon première non commencée. */
export function nextLesson(dashboard: LearnerDashboard): NextLesson | null {
  for (const course of dashboard.courses) {
    const next =
      course.lessons.find((l) => l.status === 'in_progress') ??
      course.lessons.find((l) => l.status === 'not_started');
    if (next) {
      return {
        courseId: course.courseId,
        courseTitle: course.title,
        lessonId: next.lessonId,
        lessonTitle: next.title,
      };
    }
  }
  return null;
}
