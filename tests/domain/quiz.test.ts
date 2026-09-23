import { describe, it, expect } from 'vitest';
import {
  validateQuizQuestion,
  gradeQuiz,
  parseGeneratedQuiz,
  buildQuizPrompt,
  QuizError,
  type QuizQuestion,
  type AnswerSelection,
} from '../../src/lib/domain/quiz';

const q = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
  id: 'q1',
  lessonId: 'l1',
  prompt: 'Quelle est la capitale ?',
  choices: ['Paris', 'Londres', 'Berlin'],
  correctIndex: 0,
  points: 1,
  ...overrides,
});

describe('validateQuizQuestion (FR-30)', () => {
  it('accepts a valid question', () => {
    expect(() => validateQuizQuestion(q())).not.toThrow();
  });

  it('rejects an empty prompt', () => {
    expect(() => validateQuizQuestion(q({ prompt: '   ' }))).toThrow(QuizError);
  });

  it('rejects fewer than two choices', () => {
    expect(() => validateQuizQuestion(q({ choices: ['Seul'] }))).toThrow(QuizError);
  });

  it('rejects a correct index below zero', () => {
    expect(() => validateQuizQuestion(q({ correctIndex: -1 }))).toThrow(QuizError);
  });

  it('rejects a correct index beyond the choices', () => {
    expect(() => validateQuizQuestion(q({ correctIndex: 3 }))).toThrow(QuizError);
  });
});

describe('gradeQuiz (FR-30)', () => {
  const questions: QuizQuestion[] = [
    q({ id: 'q1', correctIndex: 0, points: 1 }),
    q({ id: 'q2', prompt: '2+2 ?', choices: ['3', '4'], correctIndex: 1, points: 2 }),
  ];

  it('scores full marks when all answers are correct', () => {
    const answers: AnswerSelection[] = [
      { questionId: 'q1', selectedIndex: 0 },
      { questionId: 'q2', selectedIndex: 1 },
    ];
    expect(gradeQuiz(questions, answers)).toEqual({
      correct: 2,
      total: 2,
      score: 3,
      maxScore: 3,
      percentage: 100,
    });
  });

  it('scores partial marks with weighted points', () => {
    const answers: AnswerSelection[] = [
      { questionId: 'q1', selectedIndex: 2 }, // wrong (0 pt)
      { questionId: 'q2', selectedIndex: 1 }, // correct (2 pts)
    ];
    expect(gradeQuiz(questions, answers).score).toBe(2);
    expect(gradeQuiz(questions, answers).percentage).toBe(67);
  });

  it('counts an unanswered question as wrong', () => {
    const answers: AnswerSelection[] = [{ questionId: 'q1', selectedIndex: 0 }];
    expect(gradeQuiz(questions, answers)).toMatchObject({ correct: 1, score: 1 });
  });

  it('returns zero for an empty quiz', () => {
    expect(gradeQuiz([], [])).toEqual({ correct: 0, total: 0, score: 0, maxScore: 0, percentage: 0 });
  });
});

describe('parseGeneratedQuiz (FR-31)', () => {
  it('parses a plain JSON array', () => {
    const raw = '[{"prompt":"Capital of France?","choices":["Paris","Berlin"],"correctIndex":0}]';
    expect(parseGeneratedQuiz(raw)).toEqual([
      { prompt: 'Capital of France?', choices: ['Paris', 'Berlin'], correctIndex: 0 },
    ]);
  });

  it('strips markdown fences', () => {
    const raw = '```json\n[{"prompt":"2+2?","choices":["3","4"],"correctIndex":1}]\n```';
    expect(parseGeneratedQuiz(raw)).toHaveLength(1);
    expect(parseGeneratedQuiz(raw)[0]!.correctIndex).toBe(1);
  });

  it('extracts an array embedded in prose', () => {
    const raw = 'Voici les questions :\n[{"prompt":"Q?","choices":["A","B"],"correctIndex":0}]\nBonne chance !';
    expect(parseGeneratedQuiz(raw)).toHaveLength(1);
  });

  it('rejects invalid JSON', () => {
    expect(() => parseGeneratedQuiz('not json at all')).toThrow(QuizError);
  });

  it('rejects a non-array JSON value', () => {
    expect(() => parseGeneratedQuiz('{"prompt":"x"}')).toThrow(QuizError);
  });

  it('rejects a question with an out-of-bounds correct index', () => {
    const raw = '[{"prompt":"Q?","choices":["A"],"correctIndex":5}]';
    expect(() => parseGeneratedQuiz(raw)).toThrow(QuizError);
  });
});

describe('buildQuizPrompt (FR-31)', () => {
  it('includes the topic, the count and the JSON format', () => {
    const p = buildQuizPrompt('Le subjonctif', 3);
    expect(p).toContain('Le subjonctif');
    expect(p).toContain('3');
    expect(p).toContain('JSON');
    expect(p).toContain('correctIndex');
  });
});
