/**
 * Accessibility utility module.
 * Provides helpers for ARIA attributes, focus management,
 * and screen reader announcements.
 */

/**
 * Creates screen reader-only announcement text.
 * @param message - The message to announce
 * @param priority - 'polite' or 'assertive'
 * @returns Formatted announcement object
 */
export function createAnnouncement(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
): { message: string; priority: 'polite' | 'assertive'; timestamp: number } {
  return {
    message: message.trim(),
    priority,
    timestamp: Date.now(),
  };
}

/**
 * Validates that an element ID follows accessibility best practices.
 * IDs should be descriptive, lowercase with hyphens, and non-empty.
 * @param id - The element ID to validate
 * @returns True if the ID is valid
 */
export function isValidAccessibleId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (trimmed.length === 0 || trimmed.length > 100) return false;
  return /^[a-z][a-z0-9-]*$/.test(trimmed);
}

/**
 * Generates ARIA label text for quiz score results.
 * @param score - Number of correct answers
 * @param total - Total number of questions
 * @returns Human-readable ARIA label
 */
export function generateQuizAriaLabel(score: number, total: number): string {
  if (total <= 0) return 'Quiz not available';
  const pct = Math.round((score / total) * 100);
  return `Quiz complete. You scored ${score} out of ${total}, which is ${pct} percent.`;
}

/**
 * Determines appropriate ARIA role for a section type.
 * @param sectionType - Type of content section
 * @returns ARIA role string
 */
export function getAriaRole(sectionType: string): string {
  const roleMap: Record<string, string> = {
    navigation: 'navigation',
    main: 'main',
    search: 'search',
    form: 'form',
    alert: 'alert',
    status: 'status',
    timer: 'timer',
    complementary: 'complementary',
    banner: 'banner',
    contentinfo: 'contentinfo',
  };
  return roleMap[sectionType.toLowerCase()] || 'region';
}

/**
 * Creates a keyboard-navigable focus trap descriptor.
 * @param firstId - ID of first focusable element
 * @param lastId - ID of last focusable element
 * @returns Focus trap configuration
 */
export function createFocusTrap(
  firstId: string,
  lastId: string,
): { firstId: string; lastId: string; active: boolean } {
  return {
    firstId: firstId.trim(),
    lastId: lastId.trim(),
    active: Boolean(firstId && lastId),
  };
}
