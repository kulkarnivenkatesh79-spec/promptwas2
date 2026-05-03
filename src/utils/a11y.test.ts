import { describe, it, expect } from 'vitest';
import {
  createAnnouncement,
  isValidAccessibleId,
  generateQuizAriaLabel,
  getAriaRole,
  createFocusTrap,
} from './a11y';

describe('Accessibility Utilities', () => {
  describe('createAnnouncement', () => {
    it('should create polite announcement by default', () => {
      const a = createAnnouncement('Hello');
      expect(a.message).toBe('Hello');
      expect(a.priority).toBe('polite');
      expect(a.timestamp).toBeGreaterThan(0);
    });

    it('should create assertive announcement', () => {
      const a = createAnnouncement('Error!', 'assertive');
      expect(a.priority).toBe('assertive');
    });

    it('should trim whitespace', () => {
      const a = createAnnouncement('  spaces  ');
      expect(a.message).toBe('spaces');
    });
  });

  describe('isValidAccessibleId', () => {
    it('should accept valid kebab-case IDs', () => {
      expect(isValidAccessibleId('main-content')).toBe(true);
      expect(isValidAccessibleId('quiz-section')).toBe(true);
      expect(isValidAccessibleId('a')).toBe(true);
    });

    it('should reject empty string', () => {
      expect(isValidAccessibleId('')).toBe(false);
    });

    it('should reject IDs starting with number', () => {
      expect(isValidAccessibleId('1-invalid')).toBe(false);
    });

    it('should reject IDs with uppercase', () => {
      expect(isValidAccessibleId('Main-Content')).toBe(false);
    });

    it('should reject null/undefined', () => {
      expect(isValidAccessibleId(null as unknown as string)).toBe(false);
      expect(isValidAccessibleId(undefined as unknown as string)).toBe(false);
    });

    it('should reject IDs over 100 chars', () => {
      expect(isValidAccessibleId('a'.repeat(101))).toBe(false);
    });

    it('should accept IDs with numbers after first char', () => {
      expect(isValidAccessibleId('step-1')).toBe(true);
      expect(isValidAccessibleId('h2s-quiz')).toBe(true);
    });
  });

  describe('generateQuizAriaLabel', () => {
    it('should generate correct label for perfect score', () => {
      const label = generateQuizAriaLabel(6, 6);
      expect(label).toContain('6 out of 6');
      expect(label).toContain('100 percent');
    });

    it('should generate correct label for zero score', () => {
      const label = generateQuizAriaLabel(0, 6);
      expect(label).toContain('0 out of 6');
      expect(label).toContain('0 percent');
    });

    it('should handle zero total gracefully', () => {
      const label = generateQuizAriaLabel(0, 0);
      expect(label).toBe('Quiz not available');
    });

    it('should round percentage', () => {
      const label = generateQuizAriaLabel(1, 3);
      expect(label).toContain('33 percent');
    });
  });

  describe('getAriaRole', () => {
    it('should return known roles', () => {
      expect(getAriaRole('navigation')).toBe('navigation');
      expect(getAriaRole('main')).toBe('main');
      expect(getAriaRole('search')).toBe('search');
      expect(getAriaRole('alert')).toBe('alert');
    });

    it('should return region for unknown types', () => {
      expect(getAriaRole('unknown')).toBe('region');
      expect(getAriaRole('custom')).toBe('region');
    });

    it('should be case-insensitive', () => {
      expect(getAriaRole('NAVIGATION')).toBe('navigation');
      expect(getAriaRole('Main')).toBe('main');
    });
  });

  describe('createFocusTrap', () => {
    it('should create active focus trap with valid IDs', () => {
      const trap = createFocusTrap('first-btn', 'last-btn');
      expect(trap.firstId).toBe('first-btn');
      expect(trap.lastId).toBe('last-btn');
      expect(trap.active).toBe(true);
    });

    it('should be inactive with empty first ID', () => {
      const trap = createFocusTrap('', 'last-btn');
      expect(trap.active).toBe(false);
    });

    it('should be inactive with empty last ID', () => {
      const trap = createFocusTrap('first-btn', '');
      expect(trap.active).toBe(false);
    });

    it('should trim IDs', () => {
      const trap = createFocusTrap('  first  ', '  last  ');
      expect(trap.firstId).toBe('first');
      expect(trap.lastId).toBe('last');
    });
  });
});
