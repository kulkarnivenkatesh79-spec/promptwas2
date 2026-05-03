/**
 * Quiz engine — pure logic, no DOM.
 * Powers the election knowledge quiz in the main HTML.
 */

export interface QuizQuestion {
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}

export interface QuizState {
  currentIndex: number;
  score: number;
  answered: boolean;
  total: number;
}

export const QUIZ_DATA: QuizQuestion[] = [
  {
    q: 'What is the minimum voting age in India?',
    opts: ['16 years', '18 years', '21 years', '25 years'],
    ans: 1,
    exp: 'India lowered the voting age from 21 to 18 in 1989 via the 61st Constitutional Amendment.',
  },
  {
    q: 'Which body is responsible for conducting elections in India?',
    opts: ['Parliament of India', 'Supreme Court', 'Election Commission of India', 'Lok Sabha Secretariat'],
    ans: 2,
    exp: 'The Election Commission of India (ECI) is an autonomous constitutional authority.',
  },
  {
    q: 'What does EVM stand for?',
    opts: ['Electronic Voting Machine', 'Enabled Voter Module', 'Electoral Verification Method', 'Electronic Vote Monitor'],
    ans: 0,
    exp: 'EVM (Electronic Voting Machine) replaced paper ballots to reduce fraud.',
  },
  {
    q: "What is the 'Model Code of Conduct'?",
    opts: ['A code for journalists', 'ECI guidelines restricting government during elections', 'A voter rulebook', 'A law punishing fraud'],
    ans: 1,
    exp: 'The Model Code of Conduct regulates political parties and government during elections.',
  },
  {
    q: 'How many Lok Sabha constituencies are there in India?',
    opts: ['414', '543', '552', '600'],
    ans: 1,
    exp: 'The Lok Sabha has 543 elected constituencies.',
  },
  {
    q: "What is 'NOTA' in Indian elections?",
    opts: ['None Of The Above', 'New Officer Training Academy', 'National Online Transaction Act', 'National Order of Transport Authority'],
    ans: 0,
    exp: 'NOTA was introduced in 2013 allowing voters to reject all candidates.',
  },
];

export function createInitialState(): QuizState {
  return {
    currentIndex: 0,
    score: 0,
    answered: false,
    total: QUIZ_DATA.length,
  };
}

export function getCurrentQuestion(state: QuizState): QuizQuestion | null {
  if (state.currentIndex < 0 || state.currentIndex >= QUIZ_DATA.length) {
    return null;
  }
  return QUIZ_DATA[state.currentIndex];
}

export function checkAnswer(state: QuizState, selectedIndex: number): { correct: boolean; explanation: string; newState: QuizState } {
  const question = getCurrentQuestion(state);
  if (!question || state.answered) {
    return { correct: false, explanation: '', newState: state };
  }

  const correct = selectedIndex === question.ans;
  return {
    correct,
    explanation: question.exp,
    newState: {
      ...state,
      score: correct ? state.score + 1 : state.score,
      answered: true,
    },
  };
}

export function nextQuestion(state: QuizState): QuizState {
  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    answered: false,
  };
}

export function isQuizComplete(state: QuizState): boolean {
  return state.currentIndex >= QUIZ_DATA.length;
}

export function getScorePercentage(state: QuizState): number {
  if (state.total === 0) return 0;
  return Math.round((state.score / state.total) * 100);
}

export function getGrade(percentage: number): string {
  if (percentage === 100) return '🏆 Perfect!';
  if (percentage >= 80) return '🌟 Excellent!';
  if (percentage >= 60) return '👍 Good!';
  return '📚 Keep learning!';
}
