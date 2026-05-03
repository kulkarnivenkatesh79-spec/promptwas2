import './styles/index.css';
import { logger } from './utils/logger';
import { callGemini } from './services/ai';
// --- Initialization ---
logger.info('ElectED App Initializing...');
// Check for Demo Mode
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    logger.warn('Running in DEMO MODE. AI features will use mock responses.');
}
// --- Custom Cursor ---
const initCursor = () => {
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    if (!cursor || !ring)
        return;
    if (!window.matchMedia('(pointer: coarse)').matches) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
            setTimeout(() => {
                ring.style.left = `${e.clientX}px`;
                ring.style.top = `${e.clientY}px`;
            }, 80);
        });
        document.querySelectorAll('a, button, [role="button"], .step-card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                ring.style.transform = 'translate(-50%,-50%) scale(1.5)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '12px';
                cursor.style.height = '12px';
                ring.style.transform = 'translate(-50%,-50%) scale(1)';
            });
        });
    }
    else {
        cursor.style.display = 'none';
        ring.style.display = 'none';
    }
};
// --- Timeline Toggle ---
export const toggleStep = (card) => {
    const isExpanded = card.classList.contains('expanded');
    card.classList.toggle('expanded');
    card.setAttribute('aria-expanded', String(!isExpanded));
};
// --- Quiz Engine ---
const QUIZ_DATA = [
    {
        q: "What is the minimum voting age in India?",
        opts: ["16 years", "18 years", "21 years", "25 years"],
        ans: 1,
        exp: "India lowered the voting age from 21 to 18 in 1989 via the 61st Constitutional Amendment."
    },
    {
        q: "Which body is responsible for conducting elections in India?",
        opts: ["Parliament of India", "Supreme Court", "Election Commission of India", "Lok Sabha Secretariat"],
        ans: 2,
        exp: "The Election Commission of India (ECI) is an autonomous constitutional authority responsible for administering electoral processes."
    },
    {
        q: "What does EVM stand for in the context of Indian elections?",
        opts: ["Electronic Voting Machine", "Enabled Voter Module", "Electoral Verification Method", "Electronic Vote Monitor"],
        ans: 0,
        exp: "EVM (Electronic Voting Machine) replaced paper ballots to reduce fraud and speed up counting. VVPATs were added for paper trail."
    }
];
let qIdx = 0, score = 0, answered = false;
const renderQuestion = () => {
    const q = QUIZ_DATA[qIdx];
    const qEl = document.getElementById('quiz-q');
    const optsEl = document.getElementById('quiz-opts');
    const scoreEl = document.getElementById('quiz-score-display');
    if (!qEl || !optsEl || !scoreEl)
        return;
    qEl.textContent = `Q${qIdx + 1}. ${q.q}`;
    optsEl.innerHTML = '';
    const keys = ['A', 'B', 'C', 'D'];
    q.opts.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt';
        btn.setAttribute('aria-label', `Option ${keys[i]}: ${opt}`);
        btn.innerHTML = `<span class="quiz-key" aria-hidden="true">${keys[i]}</span>${opt}`;
        btn.onclick = () => selectAnswer(i);
        optsEl.appendChild(btn);
    });
    const feedbackEl = document.getElementById('quiz-fb');
    if (feedbackEl) {
        feedbackEl.className = 'quiz-feedback';
        feedbackEl.textContent = '';
    }
    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn)
        nextBtn.style.display = 'none';
    scoreEl.textContent = `Score: ${score} / ${QUIZ_DATA.length}`;
    QUIZ_DATA.forEach((_, i) => {
        const dot = document.getElementById(`qdot-${i}`);
        if (dot) {
            if (i < qIdx)
                dot.className = 'quiz-dot done';
            else if (i === qIdx)
                dot.className = 'quiz-dot active';
            else
                dot.className = 'quiz-dot';
        }
    });
    answered = false;
};
const selectAnswer = (idx) => {
    if (answered)
        return;
    answered = true;
    const q = QUIZ_DATA[qIdx];
    const opts = document.querySelectorAll('.quiz-opt');
    opts.forEach(btn => btn.disabled = true);
    opts[idx].classList.add(idx === q.ans ? 'correct' : 'wrong');
    if (idx !== q.ans)
        opts[q.ans].classList.add('correct');
    const fb = document.getElementById('quiz-fb');
    if (fb) {
        if (idx === q.ans) {
            score++;
            fb.className = 'quiz-feedback correct-fb show';
            fb.textContent = `✅ Correct! ${q.exp}`;
        }
        else {
            fb.className = 'quiz-feedback wrong-fb show';
            fb.textContent = `❌ Not quite. ${q.exp}`;
        }
    }
    const scoreEl = document.getElementById('quiz-score-display');
    if (scoreEl)
        scoreEl.textContent = `Score: ${score} / ${QUIZ_DATA.length}`;
    const globalBadge = document.getElementById('global-score-badge');
    const globalText = document.getElementById('global-score-text');
    if (globalBadge && globalText) {
        globalBadge.style.display = 'flex';
        globalText.textContent = `${score}/${QUIZ_DATA.length}`;
    }
    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn)
        nextBtn.style.display = 'inline-flex';
};
// --- Voice Assistant ---
const initVoice = () => {
    // @ts-ignore
    const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechAPI)
        return;
    const recognition = new SpeechAPI();
    recognition.lang = 'en-IN';
    recognition.onresult = (e) => {
        const text = e.results[0][0].transcript.toLowerCase();
        const transcriptEl = document.getElementById('voice-transcript');
        if (transcriptEl)
            transcriptEl.textContent = `"${text}"`;
        respondToVoice(text);
    };
};
const respondToVoice = async (text) => {
    const ansEl = document.getElementById('voice-answer');
    if (!ansEl)
        return;
    ansEl.textContent = 'Thinking...';
    ansEl.classList.add('show');
    try {
        const prompt = `Answer concisely: "${text}"`;
        const answer = await callGemini(prompt);
        ansEl.textContent = answer.replace(/\*/g, '').trim();
    }
    catch (err) {
        logger.error('Voice response failed:', err);
        ansEl.textContent = 'Error connecting to AI.';
    }
};
// --- Lifecycle ---
window.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initVoice();
    renderQuestion();
});
//# sourceMappingURL=main.js.map