import { describe, it, expect } from 'vitest';
import { parseCourseImport, ImportError, normalizedPositions } from '../../src/lib/domain/import';
import { ErrorCodes } from '../../src/lib/domain/errors';

const validCourse = {
  title: 'Verilog pour débutants',
  slug: 'verilog-debutants',
  language: 'fr',
  description: 'Maîtrisez les bases du FPGA en Verilog.',
  thumbnail_key: 'courses/verilog/thumb.webp',
  category: 'fpga',
  level: 'debutant',
  is_public: false,
  price_cents: 4900,
  modules: [
    {
      key: 'fondations',
      title: 'Fondations',
      lessons: [
        {
          key: 'combinatoire',
          title: 'Combinatoire vs séquentiel',
          type: 'text',
          content_markdown: '# Introduction\nUn circuit combinatoire…',
          resources: [{ key: 'cheatsheet', title: 'Aide-mémoire', r2_key: 'courses/verilog/cheat.pdf' }],
        },
        {
          key: 'sim-icarus',
          title: 'Simulation avec Icarus Verilog',
          type: 'video',
          video_url: 'courses/verilog/sim.mp4',
          duration_seconds: 420,
        },
        {
          key: 'quiz-rappel',
          title: 'Quiz de rappel',
          type: 'quiz',
          quiz_data: {
            passing_score: 80,
            questions: [
              {
                question: 'Quel bloc est utilisé pour la logique séquentielle ?',
                options: ['assign', 'always @(posedge clk)', 'initial'],
                correct_index: 1,
                explanation: 'always @(posedge clk) décrit un front d\u2019horloge.',
              },
            ],
          },
        },
      ],
    },
  ],
};

describe('parseCourseImport (FR-48)', () => {
  it('parses a valid full course', () => {
    const course = parseCourseImport(validCourse);
    expect(course.slug).toBe('verilog-debutants');
    expect(course.modules).toHaveLength(1);
    expect(course.modules[0]!.lessons).toHaveLength(3);
    expect(course.modules[0]!.lessons[2]!.quizData?.questions).toHaveLength(1);
    expect(course.modules[0]!.lessons[2]!.quizData?.passingScore).toBe(80);
    expect(course.priceCents).toBe(4900);
  });

  it('assigns positions from array order when omitted', () => {
    const course = parseCourseImport(validCourse);
    const lessons = course.modules[0]!.lessons;
    expect(lessons.map((l) => l.position)).toEqual([0, 1, 2]);
    expect(lessons[0]!.resources[0]!.position).toBe(0);
  });

  it('respects explicit positions', () => {
    const course = parseCourseImport({
      ...validCourse,
      modules: [
        {
          key: 'm',
          title: 'M',
          position: 5,
          lessons: [
            { key: 'l', title: 'L', type: 'text', content_markdown: 'x', position: 9 },
          ],
        },
      ],
    });
    expect(course.modules[0]!.position).toBe(5);
    expect(course.modules[0]!.lessons[0]!.position).toBe(9);
  });

  it('rejects an invalid slug (not kebab-case)', () => {
    expect(() => parseCourseImport({ ...validCourse, slug: 'Bad Slug!' })).toThrowError(
      expect.objectContaining({ code: ErrorCodes.IMPORT_SLUG_FORMAT }),
    );
  });

  it('rejects an invalid language', () => {
    expect(() => parseCourseImport({ ...validCourse, language: 'xx' })).toThrowError(
      expect.objectContaining({ code: ErrorCodes.IMPORT_INVALID }),
    );
  });

  it('rejects a text lesson without content_markdown', () => {
    const course = {
      ...validCourse,
      modules: [
        { key: 'm', title: 'M', lessons: [{ key: 'l', title: 'L', type: 'text' }] },
      ],
    };
    expect(() => parseCourseImport(course)).toThrowError(
      expect.objectContaining({ code: ErrorCodes.IMPORT_LESSON_CONTENT }),
    );
  });

  it('rejects a video lesson without video_url', () => {
    const course = {
      ...validCourse,
      modules: [{ key: 'm', title: 'M', lessons: [{ key: 'l', title: 'L', type: 'video' }] }],
    };
    expect(() => parseCourseImport(course)).toThrowError(
      expect.objectContaining({ code: ErrorCodes.IMPORT_LESSON_CONTENT }),
    );
  });

  it('rejects a quiz lesson without quiz_data', () => {
    const course = {
      ...validCourse,
      modules: [{ key: 'm', title: 'M', lessons: [{ key: 'l', title: 'L', type: 'quiz' }] }],
    };
    expect(() => parseCourseImport(course)).toThrowError(
      expect.objectContaining({ code: ErrorCodes.IMPORT_LESSON_CONTENT }),
    );
  });

  it('rejects a quiz question with out-of-bounds correct_index', () => {
    const course = {
      ...validCourse,
      modules: [
        {
          key: 'm',
          title: 'M',
          lessons: [
            {
              key: 'l',
              title: 'L',
              type: 'quiz',
              quiz_data: { questions: [{ question: 'Q', options: ['a', 'b'], correct_index: 5 }] },
            },
          ],
        },
      ],
    };
    expect(() => parseCourseImport(course)).toThrowError(
      expect.objectContaining({ code: ErrorCodes.IMPORT_QUIZ_INVALID }),
    );
  });

  it('rejects duplicate module keys', () => {
    const course = {
      ...validCourse,
      modules: [
        { key: 'dup', title: 'A', lessons: [{ key: 'l1', title: 'L', type: 'text', content_markdown: 'x' }] },
        { key: 'dup', title: 'B', lessons: [{ key: 'l2', title: 'L', type: 'text', content_markdown: 'x' }] },
      ],
    };
    expect(() => parseCourseImport(course)).toThrowError(
      expect.objectContaining({ code: ErrorCodes.IMPORT_DUPLICATE_KEY }),
    );
  });

  it('rejects duplicate lesson keys within a module', () => {
    const course = {
      ...validCourse,
      modules: [
        {
          key: 'm',
          title: 'M',
          lessons: [
            { key: 'dup', title: 'A', type: 'text', content_markdown: 'x' },
            { key: 'dup', title: 'B', type: 'text', content_markdown: 'x' },
          ],
        },
      ],
    };
    expect(() => parseCourseImport(course)).toThrowError(
      expect.objectContaining({ code: ErrorCodes.IMPORT_DUPLICATE_KEY }),
    );
  });

  it('rejects missing required top-level fields', () => {
    expect(() => parseCourseImport({})).toThrowError(ImportError);
    expect(() => parseCourseImport({ ...validCourse, title: '' })).toThrowError(ImportError);
  });
});

describe('normalizedPositions', () => {
  it('sorts by position and renumbers without duplicates', () => {
    const out = normalizedPositions([
      { position: 9, id: 'a' },
      { position: 1, id: 'b' },
      { position: 4, id: 'c' },
    ]);
    expect(out.map((o) => o.id)).toEqual(['b', 'c', 'a']);
    expect(out.map((o) => o.position)).toEqual([0, 1, 2]);
  });
});
