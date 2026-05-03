import './styles/index.css';
import { logger } from './utils/logger';
import { callGemini } from './services/ai';

// --- Global Types ---
declare const google: any;
declare const gsap: any;
declare const ScrollTrigger: any;
declare const THREE: any;

// --- Initialization ---
logger.info('ElectED App Initializing...');

// --- Custom Cursor ---
const initCursor = () => {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;

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
  } else {
    cursor.style.display = 'none';
    ring.style.display = 'none';
  }
};

// --- Three.js Background ---
const initThreeJS = () => {
  const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 400;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particles
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 1500;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({ size: 2, color: 0xd4a843, transparent: true, opacity: 0.5 });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  const animate = () => {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.001;
    renderer.render(scene, camera);
  };
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};

// --- Google Charts ---
const initCharts = () => {
  if (typeof google === 'undefined') return;
  google.charts.load('current', { packages: ['corechart', 'bar'] });
  google.charts.setOnLoadCallback(() => {
    drawVoterChart();
    drawPhaseChart();
  });
};

const drawVoterChart = () => {
  const data = google.visualization.arrayToDataTable([
    ['Year', 'Turnout %'],
    ['2014', 66.4],
    ['2019', 67.4],
    ['2024', 65.8],
  ]);
  const options = {
    backgroundColor: 'transparent',
    colors: ['#d4a843'],
    legend: 'none',
    hAxis: { textStyle: { color: 'rgba(240,244,255,0.6)' } },
    vAxis: { textStyle: { color: 'rgba(240,244,255,0.6)' } }
  };
  const chartEl = document.getElementById('voter_chart');
  if (chartEl) {
    const chart = new google.visualization.ColumnChart(chartEl);
    chart.draw(data, options);
  }
};

const drawPhaseChart = () => {
  const data = google.visualization.arrayToDataTable([
    ['Phase', 'Duration'],
    ['Registration', 30],
    ['Campaign', 40],
    ['Voting', 10],
    ['Counting', 10],
  ]);
  const options = {
    backgroundColor: 'transparent',
    colors: ['#d4a843', '#00c9a7', '#3498db', '#f0c96e'],
    legend: { textStyle: { color: 'rgba(240,244,255,0.7)' } },
    pieHole: 0.4,
    chartArea: { width: '100%', height: '80%' }
  };
  const chartEl = document.getElementById('phase_chart');
  if (chartEl) {
    const chart = new google.visualization.PieChart(chartEl);
    chart.draw(data, options);
  }
};

// --- Polling Booth Search ---
const initMapSearch = () => {
  const btn = document.getElementById('map-search-btn');
  const input = document.getElementById('map-search-input') as HTMLInputElement;
  const iframe = document.getElementById('gmap-frame') as HTMLIFrameElement;

  if (!btn || !input || !iframe) return;

  const search = async () => {
    const query = input.value.trim();
    if (!query) return;

    btn.textContent = 'Searching...';
    let mapQuery = query;

    try {
      const prompt = `Provide the exact name of a real polling booth or voting center in "${query}, India". Just output the name and city.`;
      const result = await callGemini(prompt);
      if (result) mapQuery = result.replace(/\n/g, '').trim();
    } catch (e) {
      logger.warn('Gemini map search failed, falling back.');
    }

    const MAP_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (MAP_KEY) {
      iframe.src = `https://www.google.com/maps/embed/v1/place?key=${MAP_KEY}&q=${encodeURIComponent(mapQuery)}`;
    } else {
      iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
    }
    btn.textContent = 'Find Booths';
  };

  btn.onclick = search;
  input.onkeydown = (e) => { if (e.key === 'Enter') search(); };
  
  // Default search
  input.value = "Election Commission of India, New Delhi";
  search();
  input.value = "";
};

// --- Voice Assistant ---
const initVoice = () => {
  const orb = document.getElementById('voice-orb');
  const transcriptEl = document.getElementById('voice-transcript');
  const answerEl = document.getElementById('voice-answer');
  
  // @ts-ignore
  const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!orb || !SpeechAPI) return;

  const recognition = new SpeechAPI();
  recognition.lang = 'en-IN';

  recognition.onresult = (e: any) => {
    const text = e.results[0][0].transcript.toLowerCase();
    if (transcriptEl) transcriptEl.textContent = `"${text}"`;
    respondToVoice(text);
  };

  orb.onclick = () => {
    orb.classList.add('listening');
    if (transcriptEl) transcriptEl.textContent = '🎙️ Listening...';
    recognition.start();
  };

  recognition.onend = () => {
    orb.classList.remove('listening');
  };
};

const respondToVoice = async (text: string) => {
  const ansEl = document.getElementById('voice-answer');
  if (!ansEl) return;
  ansEl.textContent = 'Thinking...';
  ansEl.classList.add('show');

  try {
    const prompt = `Answer concisely: "${text}"`;
    const answer = await callGemini(prompt);
    ansEl.textContent = answer.replace(/\*/g, '').trim();
  } catch (err) {
    ansEl.textContent = 'Error connecting to AI.';
  }
};

// --- Theme Toggle ---
const initTheme = () => {
  const btn = document.getElementById('theme-toggle-btn');
  const icon = document.getElementById('theme-icon');
  if (!btn || !icon) return;

  btn.onclick = () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    icon.textContent = isLight ? 'dark_mode' : 'light_mode';
    localStorage.setItem('elected-theme', isLight ? 'light' : 'dark');
  };

  if (localStorage.getItem('elected-theme') === 'light') {
    document.body.classList.add('light-theme');
    icon.textContent = 'dark_mode';
  }
};

// --- GSAP Animations ---
const initAnimations = () => {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.hero-content', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' });
  
  document.querySelectorAll('.importance-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: card,
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: i * 0.2
    });
  });
};

// --- Quiz Engine ---
const QUIZ_DATA = [
  {
    q: "What is the minimum voting age in India?",
    opts: ["16 years", "18 years", "21 years", "25 years"],
    ans: 1,
    exp: "India lowered the voting age from 21 to 18 in 1989."
  },
  {
    q: "Which body conducts elections in India?",
    opts: ["Parliament", "Supreme Court", "Election Commission", "Lok Sabha"],
    ans: 2,
    exp: "The Election Commission of India (ECI) is responsible."
  }
];

let qIdx = 0, score = 0, answered = false;

const renderQuestion = () => {
  const q = QUIZ_DATA[qIdx];
  if (!q) return;
  const qEl = document.getElementById('quiz-q');
  const optsEl = document.getElementById('quiz-opts');
  const scoreEl = document.getElementById('quiz-score-display');
  if (!qEl || !optsEl || !scoreEl) return;

  qEl.textContent = `Q${qIdx + 1}. ${q.q}`;
  optsEl.innerHTML = '';
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(i);
    optsEl.appendChild(btn);
  });

  const fb = document.getElementById('quiz-fb');
  if (fb) { fb.className = 'quiz-feedback'; fb.textContent = ''; }
  const nextBtn = document.getElementById('quiz-next-btn');
  if (nextBtn) nextBtn.style.display = 'none';
  scoreEl.textContent = `Score: ${score} / ${QUIZ_DATA.length}`;
  answered = false;
};

const selectAnswer = (idx: number) => {
  if (answered) return;
  answered = true;
  const q = QUIZ_DATA[qIdx];
  if (!q) return;
  const opts = document.querySelectorAll('.quiz-opt') as NodeListOf<HTMLButtonElement>;
  opts.forEach(btn => btn.disabled = true);
  opts[idx].classList.add(idx === q.ans ? 'correct' : 'wrong');
  if (idx !== q.ans) opts[q.ans].classList.add('correct');

  const fb = document.getElementById('quiz-fb');
  if (fb) {
    fb.className = `quiz-feedback ${idx === q.ans ? 'correct-fb' : 'wrong-fb'} show`;
    fb.textContent = `${idx === q.ans ? '✅ Correct!' : '❌ Incorrect.'} ${q.exp}`;
    if (idx === q.ans) score++;
  }
  const scoreEl = document.getElementById('quiz-score-display');
  if (scoreEl) scoreEl.textContent = `Score: ${score} / ${QUIZ_DATA.length}`;
  const nextBtn = document.getElementById('quiz-next-btn');
  if (nextBtn) nextBtn.style.display = 'inline-flex';
};

// --- Lifecycle ---
window.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initTheme();
  initAnimations();
  initThreeJS();
  initCharts();
  initMapSearch();
  initVoice();
  renderQuestion();
});
