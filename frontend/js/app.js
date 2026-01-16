// js/app.js (updated — no alerts; uses TTS)

// Debug loader log (helps confirm file loaded)
console.log('Loaded js/app.js (updated)');

document.addEventListener('DOMContentLoaded', () => {
  buildAlphabet();
  setupAnimals();
  setupTiles();
  setupRoadmapButtons();
  renderRoadmap();
  updateStarCount();
  startClock();
});

/* ---------- TTS helper (uses global module if present) ---------- */
function speak(text) {
  if (!text) return;
  if (window.__KidAppTTS && typeof window.__KidAppTTS.speak === 'function') {
    try { window.__KidAppTTS.speak(text); return; } catch (e) { /* fallback */ }
  }
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = navigator.language || 'en-US';
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('TTS fallback failed', e);
    }
  } else {
    console.info('TTS not available. Message:', text);
  }
}

/* ---------- Alphabet strip ---------- */
function buildAlphabet() {
  const alphabetStrip = document.getElementById('alphabetStrip');
  if (!alphabetStrip) return;
  alphabetStrip.innerHTML = '';
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const card = document.createElement('div');
    card.className = 'letter-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-letter', letter);
    card.setAttribute('data-tts', `Letter ${letter}`);
    card.innerHTML = `<div class="big">${letter}</div><div class="letter-small">for ${letter.toLowerCase()}</div>`;
    card.addEventListener('click', () => onLetterClick(letter));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onLetterClick(letter);
      }
    });
    alphabetStrip.appendChild(card);
  }
}

/* ---------- Animals ---------- */
function setupAnimals() {
  document.querySelectorAll('.animal-card').forEach(card => {
    card.setAttribute('role', 'button');
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');

    if (!card.getAttribute('data-tts')) {
      const a = card.dataset.animal || card.textContent || '';
      if (a) card.setAttribute('data-tts', a.trim());
    }

    const handler = () => {
      const name = card.dataset.animal || card.getAttribute('data-tts') || card.textContent || 'animal';
      speak(name);
      awardStarFor();
    };

    card.addEventListener('click', handler);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  });
}

/* ---------- Tiles / Navigation ---------- */
function setupTiles() {
  document.querySelectorAll('.big-tile, .small-tile, .cloud-btn').forEach(btn => {
    if (!btn.hasAttribute('tabindex')) btn.setAttribute('tabindex', '0');

    btn.addEventListener('click', (e) => {
      // If it's an anchor with href, just speak and let browser navigate
      if (btn.tagName === 'A' && btn.hasAttribute('href')) {
        const tts = btn.dataset.tts || btn.textContent;
        speak(`Opening ${tts}`);
        return;
      }

      const page = btn.dataset.target;
      if (!page) return;
      if (page === 'parents') {
        speak("Parent area locked");
        return;
      }
      speak(`Opening ${page}`);
      window.location.href = page + ".html";
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}

/* ---------- Roadmap Buttons ---------- */
function setupRoadmapButtons() {
  const markBtn = document.getElementById('markLearn');
  const resetBtn = document.getElementById('resetRoad');

  if (markBtn) {
    markBtn.addEventListener('click', () => {
      markStepCompleted('learn');
      speak('Learn marked completed');
    });
    markBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); markBtn.click(); }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetRoadmap();
      speak('Roadmap reset');
    });
    resetBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); resetBtn.click(); }
    });
  }
}

/* ---------- Roadmap Storage ---------- */
const ROAD_KEY = 'kidapp_road_progress';

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(ROAD_KEY)) || {};
  } catch (err) {
    return {};
  }
}

function saveProgress(p) {
  localStorage.setItem(ROAD_KEY, JSON.stringify(p));
}

function markStepCompleted(key) {
  if (!key) return;
  const progress = loadProgress();
  if (!progress[key]) {
    progress[key] = true;
    progress.stars = (progress.stars || 0) + 1;
    saveProgress(progress);
    renderRoadmap();
    updateStarCount();
  } else {
    speak(`${key} already completed`);
  }
}

function resetRoadmap() {
  localStorage.removeItem(ROAD_KEY);
  renderRoadmap();
  updateStarCount();
}

/* ---------- Render Roadmap ---------- */
function renderRoadmap() {
  const progress = loadProgress();
  document.querySelectorAll('.road .step').forEach(step => {
    const k = step.dataset.key;
    if (progress[k]) step.classList.add('completed');
    else step.classList.remove('completed');
  });
}

/* ---------- Stars UI ---------- */
function updateStarCount() {
  const p = loadProgress();
  const stars = p.stars || 0;
  const el1 = document.getElementById('starCount');
  const el2 = document.getElementById('starCountSmall');
  if (el1) el1.textContent = stars;
  if (el2) el2.textContent = stars;
}

function awardStarFor() {
  const p = loadProgress();
  p.stars = (p.stars || 0) + 1;
  saveProgress(p);
  updateStarCount();
}

/* ---------- Alphabet click ---------- */
function onLetterClick(name) {
  const displayName = name || 'A';
  speak(`Letter ${displayName}`);
  markStepCompleted('learn');
}

/* ---------- Time Tracker ---------- */
function startClock() {
  const el = document.getElementById('timeSmall');
  if (!el) return;
  let minutes = 0;
  el.textContent = '0m';
  setInterval(() => {
    minutes++;
    el.textContent = `${minutes}m`;
  }, 60000);
}
