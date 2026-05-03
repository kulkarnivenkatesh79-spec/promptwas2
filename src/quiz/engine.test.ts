import { describe, it, expect } from 'vitest';
import {
  QUIZ_DATA,
  createInitialState,
  getCurrentQuestion,
  checkAnswer,
  nextQuestion,
  isQuizComplete,
  getScorePercentage,
  getGrade,
} from './engine';

describe('Quiz Engine', () => {
  describe('QUIZ_DATA', () => {
    it('should have 6 questions', () => {
      expect(QUIZ_DATA).toHaveLength(6);
    });

    it('each question should have q, opts, ans, exp', () => {
      QUIZ_DATA.forEach((q) => {
        expect(q.q).toBeDefined();
        expect(q.opts).toHaveLength(4);
        expect(q.ans).toBeGreaterThanOrEqual(0);
        expect(q.ans).toBeLessThan(4);
        expect(q.exp.length).toBeGreaterThan(0);
      });
    });
  });

  describe('createInitialState', () => {
    it('should start at index 0 with score 0', () => {
      const state = createInitialState();
      expect(state.currentIndex).toBe(0);
      expect(state.score).toBe(0);
      expect(state.answered).toBe(false);
      expect(state.total).toBe(6);
    });
  });

  describe('getCurrentQuestion', () => {
    it('should return first question for initial state', () => {
      const state = createInitialState();
      const q = getCurrentQuestion(state);
      expect(q).not.toBeNull();
      expect(q!.q).toBe(QUIZ_DATA[0].q);
    });

    it('should return null for out-of-bounds index', () => {
      const state = { ...createInitialState(), currentIndex: 99 };
      expect(getCurrentQuestion(state)).toBeNull();
    });

    it('should return null for negative index', () => {
      const state = { ...createInitialState(), currentIndex: -1 };
      expect(getCurrentQuestion(state)).toBeNull();
    });
  });

  describe('checkAnswer', () => {
    it('should mark correct answer and increment score', () => {
      const state = createInitialState();
      const correctIdx = QUIZ_DATA[0].ans;
      const result = checkAnswer(state, correctIdx);
      expect(result.correct).toBe(true);
      expect(result.newState.score).toBe(1);
      expect(result.newState.answered).toBe(true);
    });

    it('should mark wrong answer without incrementing score', () => {
      const state = createInitialState();
      const wrongIdx = QUIZ_DATA[0].ans === 0 ? 1 : 0;
      const result = checkAnswer(state, wrongIdx);
      expect(result.correct).toBe(false);
      expect(result.newState.score).toBe(0);
      expect(result.newState.answered).toBe(true);
    });

    it('should return explanation for both correct and wrong', () => {
      const state = createInitialState();
      const result = checkAnswer(state, QUIZ_DATA[0].ans);
      expect(result.explanation).toBe(QUIZ_DATA[0].exp);
    });

    it('should not allow answering when already answered', () => {
      const state = { ...createInitialState(), answered: true };
      const result = checkAnswer(state, 0);
      expect(result.correct).toBe(false);
      expect(result.explanation).toBe('');
    });

    it('should handle invalid question index gracefully', () => {
      const state = { ...createInitialState(), currentIndex: 999 };
      const result = checkAnswer(state, 0);
      expect(result.correct).toBe(false);
    });
  });

  describe('nextQuestion', () => {
    it('should advance index and reset answered', () => {
      const state = { ...createInitialState(), answered: true, score: 1 };
      const next = nextQuestion(state);
      expect(next.currentIndex).toBe(1);
      expect(next.answered).toBe(false);
      expect(next.score).toBe(1);
    });
  });

  describe('isQuizComplete', () => {
    it('should be false at start', () => {
      expect(isQuizComplete(createInitialState())).toBe(false);
    });

    it('should be true when index equals total', () => {
      const state = { ...createInitialState(), currentIndex: 6 };
      expect(isQuizComplete(state)).toBe(true);
    });
  });

  describe('getScorePercentage', () => {
    it('should return 0 for no correct answers', () => {
      expect(getScorePercentage(createInitialState())).toBe(0);
    });

    it('should return 100 for perfect score', () => {
      const state = { ...createInitialState(), score: 6 };
      expect(getScorePercentage(state)).toBe(100);
    });

    it('should return 50 for half correct', () => {
      const state = { ...createInitialState(), score: 3 };
      expect(getScorePercentage(state)).toBe(50);
    });

    it('should handle zero total gracefully', () => {
      const state = { ...createInitialState(), total: 0 };
      expect(getScorePercentage(state)).toBe(0);
    });
  });

  describe('getGrade', () => {
    it('should return Perfect for 100%', () => {
      expect(getGrade(100)).toContain('Perfect');
    });

    it('should return Excellent for 80-99%', () => {
      expect(getGrade(80)).toContain('Excellent');
      expect(getGrade(90)).toContain('Excellent');
    });

    it('should return Good for 60-79%', () => {
      expect(getGrade(60)).toContain('Good');
      expect(getGrade(79)).toContain('Good');
    });

    it('should return Keep learning for below 60%', () => {
      expect(getGrade(59)).toContain('Keep learning');
      expect(getGrade(0)).toContain('Keep learning');
    });
  });
});
