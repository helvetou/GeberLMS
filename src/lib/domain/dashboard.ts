import { learnersOfTutor, type GuardianshipList } from './guardianship';
import { enrollmentsOfLearner, type Enrollment } from './enrollment';
import { visibleLessonsOfCourse, type Catalog } from './catalog';
import { completedLessonIds, type ProgressEntry } from './progress';

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
