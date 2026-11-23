import { describe, it, expect } from 'vitest';
import { buildCourseReader } from '../../src/lib/domain/reader';
import { emptyCatalog, addCourse, addModule, addLesson, addResource, setLessonVisibility } from '../../src/lib/domain/catalog';
import type { ProgressEntry } from '../../src/lib/domain/progress';

function makeCatalog() {
  let cat = emptyCatalog();
  cat = addCourse(cat, { id: 'c1', slug: 's', title: 'Cours', language: 'fr', visibility: 'visible', isPublic: true });
  cat = addModule(cat, { id: 'm1', courseId: 'c1', title: 'M1', visibility: 'visible', position: 0 });
  cat = addModule(cat, { id: 'm2', courseId: 'c1', title: 'M2', visibility: 'visible', position: 1 });
  cat = addLesson(cat, { id: 'l1', moduleId: 'm1', title: 'L1', type: 'text', visibility: 'visible', position: 0 });
  cat = addLesson(cat, { id: 'l2', moduleId: 'm1', title: 'L2', type: 'video', visibility: 'visible', position: 1 });
  cat = addLesson(cat, { id: 'l3', moduleId: 'm2', title: 'L3', type: 'quiz', visibility: 'visible', position: 0 });
  cat = addResource(cat, { id: 'r1', lessonId: 'l1', title: 'R1', visibility: 'visible' });
  return cat;
}

const progress: ProgressEntry[] = [
  { id: 'p1', enrollmentId: 'e1', lessonId: 'l1', status: 'completed', score: 90 },
  { id: 'p2', enrollmentId: 'e1', lessonId: 'l2', status: 'in_progress' },
];

describe('buildCourseReader (m5)', () => {
  it('assembles visible modules and lessons in order', () => {
    const reader = buildCourseReader({ courseId: 'c1', enrollmentId: 'e1', catalog: makeCatalog(), progress });
    expect(reader.modules.map((m) => m.module.id)).toEqual(['m1', 'm2']);
    expect(reader.modules[0]!.lessons.map((l) => l.lesson.id)).toEqual(['l1', 'l2']);
  });

  it('attaches resources and progress status/score', () => {
    const reader = buildCourseReader({ courseId: 'c1', enrollmentId: 'e1', catalog: makeCatalog(), progress });
    const l1 = reader.modules[0]!.lessons[0]!;
    expect(l1.status).toBe('completed');
    expect(l1.score).toBe(90);
    expect(l1.resources.map((r) => r.id)).toEqual(['r1']);
    expect(reader.modules[0]!.lessons[1]!.status).toBe('in_progress');
    expect(reader.modules[1]!.lessons[0]!.status).toBe('not_started');
  });

  it('computes completed/total counts', () => {
    const reader = buildCourseReader({ courseId: 'c1', enrollmentId: 'e1', catalog: makeCatalog(), progress });
    expect(reader.totalLessons).toBe(3);
    expect(reader.completedLessons).toBe(1);
  });

  it('excludes hidden lessons', () => {
    let cat = makeCatalog();
    cat = setLessonVisibility(cat, 'l2', 'hidden');
    const reader = buildCourseReader({ courseId: 'c1', enrollmentId: 'e1', catalog: cat, progress });
    expect(reader.totalLessons).toBe(2);
  });

  it('throws when the course is missing', () => {
    expect(() =>
      buildCourseReader({ courseId: 'nope', enrollmentId: 'e1', catalog: makeCatalog(), progress }),
    ).toThrow('Cours introuvable');
  });
});
