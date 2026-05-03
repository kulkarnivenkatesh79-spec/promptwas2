/**
 * ElectED — src/ entry point.
 * Re-exports all modules for the TypeScript build system.
 * The actual website runs from the monolithic index.html.
 */

export { logger } from './utils/logger';
export { callGemini, getDemoResponse, buildApiUrl, buildRequestBody, extractResponseText } from './services/ai';
export {
  QUIZ_DATA,
  createInitialState,
  getCurrentQuestion,
  checkAnswer,
  nextQuestion,
  isQuizComplete,
  getScorePercentage,
  getGrade,
} from './quiz/engine';
