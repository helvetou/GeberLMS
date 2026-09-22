import { describe, it, expect } from 'vitest';
import {
  validateQuizQuestion,
  gradeQuiz,
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
