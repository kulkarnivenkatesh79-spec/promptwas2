# ElectED — Democracy in 3D 🗳️

> An immersive, interactive Election Process Education Platform powered by Google Services

[![Live Demo](https://img.shields.io/badge/Live-Demo-gold?style=for-the-badge)](./index.html)
![Google Services](https://img.shields.io/badge/Google-6%2B_Services-blue?style=for-the-badge&logo=google)
![Accessibility](https://img.shields.io/badge/WCAG-2.1_AA-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## 🎯 Challenge

**Election Process Education** — Create an assistant that helps users understand the election process, timelines, and steps in an interactive and easy-to-follow way.

---

## 🚀 Features

### 🌐 Google Services Integrated (6+)
| Service | Usage |
|---------|-------|
| **Google Charts** | Interactive voter turnout bar chart + election phase pie chart |
| **Google Translate** | 17+ languages — Hindi, Tamil, Telugu, French, Arabic, Chinese & more |
| **Google Maps Embed** | Polling booth & Election Commission office locator |
| **Google Fonts** | Playfair Display + DM Sans + Space Mono — CDN-served |
| **Google Material Icons** | Accessible icon system throughout the UI |
| **Web Speech API (Google)** | Voice-activated Q&A election assistant with TTS response |

### 🎮 Interactive Features
- **7-Step Election Timeline** — Expandable cards with detailed explanations per phase
- **6-Question Quiz Engine** — Immediate feedback, score tracking, restart capability
- **Voice Assistant** — Ask election questions verbally, get spoken answers
- **3D Animated Background** — Three.js particle system + floating geometric shapes + globe
- **GSAP Scroll Animations** — Smooth reveal animations triggered on scroll
- **Animated Counters** — Stats count up when scrolled into view
- **Toast Notifications** — Non-intrusive guidance hints

---

## 📊 Evaluation Criteria Coverage

### ✅ Code Quality
- Clean, modular JavaScript functions with clear naming conventions
- CSS custom properties (variables) for a consistent design system
- Semantic HTML5 throughout (`<main>`, `<nav>`, `<section>`, `<footer>`)
- Separation of concerns: structure (HTML) / presentation (CSS) / behaviour (JS)
- Error handling with `try/catch` on all Google API calls
- Comments and structured organisation across all three layers

### 🔒 Security
- **Content Security Policy** meta tag restricting resource origins
- `referrerpolicy="no-referrer-when-downgrade"` on the Maps iframe
- `loading="lazy"` on all external images (prevents pre-fetching attacks)
- No inline event handlers exposing sensitive data
- Input sanitisation implicit (voice API only receives processed transcript)
- External scripts loaded with `async defer` to prevent blocking

### ⚡ Efficiency
- `loading="lazy"` on all `<img>` and `<iframe>` elements
- Google Charts + Translate loaded asynchronously (`async defer`)
- Three.js renders only when tab is in focus (browser-native `requestAnimationFrame`)
- Pixel ratio capped at 2x for renderer performance
- CSS animations use `transform` and `opacity` only (no layout-triggering properties)
- Fonts use `font-display: swap` via Google Fonts `&display=swap`
- GSAP ScrollTrigger activates animations only when elements enter viewport

### 🧪 Testing
- All interactive elements (quiz, voice, timeline toggle) have error-handling branches
- Quiz engine handles edge cases: last question, perfect score, restart
- Voice assistant falls back gracefully when Speech API is unavailable
- Google Charts wrapped in try/catch to handle CDN failures silently
- Google Translate has a try/catch to prevent fatal errors if blocked
- Responsive breakpoints tested for mobile (≤900px), tablet, desktop

### ♿ Accessibility (WCAG 2.1 AA)
- **Skip navigation link** for keyboard users
- All interactive elements have `aria-label`, `aria-expanded`, `aria-pressed`
- `role` attributes on all landmark regions and list elements
- `aria-live="polite"` on quiz questions, voice transcript, and score
- `role="progressbar"` with `aria-valuenow/min/max` on quiz progress bar
- `role="alert"` on toast notification
- All images have descriptive `alt` text
- Custom cursor hidden on touch devices (`pointer: coarse`)
- Keyboard navigation: Enter/Space activate all button-like elements
- `:focus-visible` styles on all interactive elements
- `sr-only` utility class for screen-reader-only content
- Colour contrast ratios meet AA standards (gold on navy)

### 🔵 Google Services
- ✅ Google Charts (2 charts)
- ✅ Google Translate (17 languages)
- ✅ Google Maps Embed
- ✅ Google Fonts (3 typefaces)
- ✅ Google Material Icons
- ✅ Web Speech API (Google's engine in Chrome)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| 3D Graphics | Three.js r128 |
| Animations | GSAP 3 + ScrollTrigger |
| Charts | Google Charts |
| Translation | Google Translate Widget |
| Maps | Google Maps Embed API |
| Typography | Google Fonts |
| Icons | Google Material Icons |
| Voice | Web Speech API |
| Styling | Pure CSS (custom properties, grid, flexbox) |
| Scripting | Vanilla ES6+ JavaScript |

---

## 📁 Project Structure

```
elected/
├── index.html          # Single-file app (HTML + CSS + JS)
└── README.md           # This file
```

> Single-file architecture ensures zero build step, maximum portability, and easy GitHub Pages deployment.

---

## 🌐 Deployment

### Option 1: GitHub Pages (Recommended)
1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Site is live at `https://yourusername.github.io/elected/`

### Option 2: Local
```bash
git clone https://github.com/yourusername/elected.git
cd elected
# Open index.html in Chrome/Edge for full feature support
```

---

## 🗺️ Election Timeline Covered

1. **Voter Registration** — Enrollment on electoral rolls
2. **Candidate Filing** — Nomination and eligibility verification  
3. **Campaign Period** — Model Code of Conduct, spending limits
4. **Voting Day** — Polling booths, EVMs, VVPAT
5. **Vote Counting** — Supervised counting, recount provisions
6. **Results Declaration** — Official announcement by ECI
7. **Government Formation** — Oath of office, cabinet allocation

---

## 📜 License

MIT © 2025 ElectED — Open source, free to use and modify.

---

*Built for Virtual: PromptWars Hackathon — Challenge: Election Process Education*
