// frontend/js/learn.js
// Full Learn page with: shadow/template trace, A→Z, quiz, match, memory, count, number-line,
// explore tiles (including Colors tile that asks by name), and auto-advance on correct answers.
console.log('Loaded learn.js (full features, auto-advance & colors)');

(function () {
  // --- TTS helper ---
  function speakText(text) {
    if (!text) return;
    try {
      if (window.__KidAppTTS && typeof window.__KidAppTTS.speak === 'function') {
        window.__KidAppTTS.speak(text);
        return;
      }
    } catch (e) { /* ignore */ }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } catch (e) { }
    } else {
      console.log('[TTS missing]', text);
    }
  }

  // --- DOM refs (must match learn.html) ---
  const targetLabel = document.getElementById('targetLabel');
  const traceCanvas = document.getElementById('traceCanvas');
  const clearBtn = document.getElementById('clearTrace');
  const checkBtn = document.getElementById('checkTrace');
  const nextBtn = document.getElementById('nextTarget');
  const traceResult = document.getElementById('traceResult');
  const letterGrid = document.getElementById('letterGrid');
  const alphabetStrip = document.getElementById('alphabetStrip');
  const explorePanel = document.getElementById('explorePanel');

  if (!targetLabel || !traceCanvas || !clearBtn || !checkBtn || !nextBtn || !letterGrid || !alphabetStrip || !explorePanel) {
    console.error('learn.js: missing required element(s). Check learn.html IDs.');
    return;
  }

  // --- Canvas contexts & shadow ---
  const ctx = traceCanvas.getContext('2d');
  let shadowCanvas = document.createElement('canvas');
  let shadowCtx = shadowCanvas.getContext('2d');

  // drawing state
  const strokeColor = '#0d8a3d';
  let drawing = false;
  let last = { x: 0, y: 0 };

  // --- utility constants & mappings ---
  const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  // helpful mapping for examples / emoji
  const letterExample = {
    A: { word: 'Apple', emoji: '🍎', color: 'red' },
    B: { word: 'Bee', emoji: '🐝', color: 'yellow' },
    C: { word: 'Cat', emoji: '🐱', color: 'orange' },
    D: { word: 'Dog', emoji: '🐶', color: 'brown' },
    E: { word: 'Elephant', emoji: '🐘', color: 'gray' },
    F: { word: 'Frog', emoji: '🐸', color: 'green' },
    G: { word: 'Grapes', emoji: '🍇', color: 'purple' },
    H: { word: 'House', emoji: '🏠', color: 'blue' },
    I: { word: 'Ice cream', emoji: '🍦', color: 'pink' },
    J: { word: 'Jam', emoji: '🍓', color: 'red' },
    K: { word: 'Kite', emoji: '🪁', color: 'red' },
    L: { word: 'Lion', emoji: '🦁', color: 'goldenrod' },
    M: { word: 'Moon', emoji: '🌝', color: 'silver' },
    N: { word: 'Nest', emoji: '🪺', color: 'brown' },
    O: { word: 'Orange', emoji: '🍊', color: 'orange' },
    P: { word: 'Penguin', emoji: '🐧', color: 'black' },
    Q: { word: 'Queen', emoji: '👸', color: 'purple' },
    R: { word: 'Rabbit', emoji: '🐰', color: 'white' },
    S: { word: 'Sun', emoji: '🌞', color: 'yellow' },
    T: { word: 'Tree', emoji: '🌳', color: 'green' },
    U: { word: 'Umbrella', emoji: '☂️', color: 'blue' },
    V: { word: 'Violin', emoji: '🎻', color: 'brown' },
    W: { word: 'Whale', emoji: '🐋', color: 'blue' },
    X: { word: 'Xylophone', emoji: '🎵', color: 'multicolor' },
    Y: { word: 'Yacht', emoji: '⛵', color: 'white' },
    Z: { word: 'Zebra', emoji: '🦓', color: 'black' }
  };

  // --- canvas resolution helpers ---
  function fixCanvasResolution() {
    const rect = traceCanvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const displayW = Math.max(300, Math.floor(rect.width));
    const displayH = Math.max(200, Math.floor(rect.height));
    traceCanvas.width = Math.floor(displayW * dpr);
    traceCanvas.height = Math.floor(displayH * dpr);
    traceCanvas.style.width = rect.width + 'px';
    traceCanvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    shadowCanvas.width = displayW;
    shadowCanvas.height = displayH;
    shadowCtx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // --- drawing handlers ---
  function getPointerPos(e) {
    const rect = traceCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startStroke(e) {
    e.preventDefault();
    drawing = true;
    last = getPointerPos(e);
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = Math.max(6, traceCanvas.width / 120);
    ctx.moveTo(last.x, last.y);
  }
  function moveStroke(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = getPointerPos(e);
    ctx.quadraticCurveTo(last.x, last.y, (p.x + last.x) / 2, (p.y + last.y) / 2);
    ctx.stroke();
    last = p;
  }
  function endStroke(e) {
    if (!drawing) return;
    drawing = false;
    ctx.closePath();
  }

  traceCanvas.addEventListener('pointerdown', startStroke);
  traceCanvas.addEventListener('pointermove', moveStroke);
  window.addEventListener('pointerup', endStroke);
  traceCanvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });

  // --- shadow rendering: letters & emojis ---
  function renderShadowLetter(letter, opts = { color: '#0d8a3d', alpha: 0.08, fontScale: 0.72 }) {
    const w = shadowCanvas.width, h = shadowCanvas.height;
    shadowCtx.clearRect(0, 0, w, h);
    const fontSize = Math.floor(Math.min(w, h) * opts.fontScale);
    shadowCtx.fillStyle = opts.color;
    shadowCtx.globalAlpha = opts.alpha;
    shadowCtx.textAlign = 'center';
    shadowCtx.textBaseline = 'middle';
    shadowCtx.font = `bold ${fontSize}px "Comic Sans MS", "Poppins", Arial, sans-serif`;
    shadowCtx.fillText(letter, w / 2, h / 2 + fontSize * 0.04);
    shadowCtx.globalAlpha = 1;
    // copy to visible backing
    compositeShadowToVisible();
  }

  function renderShadowEmoji(emoji, opts = { alpha: 0.06, fontScale: 0.36 }) {
    const w = shadowCanvas.width, h = shadowCanvas.height;
    shadowCtx.clearRect(0, 0, w, h);
    const fontSize = Math.floor(Math.min(w, h) * opts.fontScale);
    shadowCtx.fillStyle = '#000';
    shadowCtx.globalAlpha = opts.alpha;
    shadowCtx.textAlign = 'center';
    shadowCtx.textBaseline = 'middle';
    // emoji fonts
    shadowCtx.font = `bold ${fontSize}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji", Arial`;
    shadowCtx.fillText(emoji, w / 2, h / 2);
    shadowCtx.globalAlpha = 1;
    compositeShadowToVisible();
  }

  function compositeShadowToVisible() {
    const rect = traceCanvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, traceCanvas.width, traceCanvas.height);
    ctx.drawImage(shadowCanvas, 0, 0, shadowCanvas.width, shadowCanvas.height, 0, 0, Math.floor(rect.width * dpr), Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.restore();
  }

  // --- set target and show example in explore panel ---
  function setTarget(letter, { speak = true } = {}) {
    const L = (letter || 'A').toString().charAt(0).toUpperCase();
    targetLabel.textContent = L;
    try { localStorage.setItem('kidapp.target', L); } catch (e) { }
    renderShadowLetter(L);
    compositeShadowToVisible(); // clears strokes and shows shadow
    traceResult.textContent = '';
    showLetterExample(L);
    if (speak) speakText(`Letter ${L}`);
  }

  function nextLetter(cur) {
    const c = (cur || (targetLabel.textContent || 'A')[0]).toUpperCase();
    const idx = LETTERS.indexOf(c);
    return idx >= 0 && idx < LETTERS.length - 1 ? LETTERS[idx + 1] : LETTERS[0];
  }

  function advanceToNext() {
    const next = nextLetter(targetLabel.textContent || 'A');
    setTarget(next);
    refreshActivities();
  }
  function showLetterExample(L) {
    const info = letterExample[L] || { word: 'Item', emoji: '🔎' };
    explorePanel.innerHTML = `<strong>${L} is for ${info.word} ${info.emoji}</strong><p class="small">Tap any activity on the right to practice ${L}.</p>`;
  }

  // --- scoring helpers (render template for comparison) ---
  function renderLetterTemplateForCompare(letter) {
    const off = document.createElement('canvas');
    off.width = shadowCanvas.width;
    off.height = shadowCanvas.height;
    const g = off.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, off.width, off.height);
    const fontSize = Math.floor(Math.min(off.width, off.height) * 0.6);
    g.fillStyle = '#000000';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `bold ${fontSize}px "Comic Sans MS", "Poppins", Arial, sans-serif`;
    g.fillText(letter, off.width / 2, off.height / 2 + fontSize * 0.05);
    return off;
  }

  function getImageDataFromCanvasDisplay(canvas) {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    const tmp = document.createElement('canvas');
    tmp.width = w;
    tmp.height = h;
    const tctx = tmp.getContext('2d');
    tctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, w, h);
    return tctx.getImageData(0, 0, w, h);
  }

  function comparePixelArrays(templateData, drawnData) {
    const len = Math.min(templateData.length, drawnData.length);
    let templatePixels = 0, overlapPixels = 0;
    for (let i = 0; i < len; i += 4) {
      const tr = templateData[i], tg = templateData[i + 1], tb = templateData[i + 2], ta = templateData[i + 3];
      const dr = drawnData[i], dg = drawnData[i + 1], db = drawnData[i + 2], da = drawnData[i + 3];
      const templateIsInk = (ta > 16) && (tr + tg + tb < 700);
      const drawnIsInk = da > 10 && (dr + dg + db < 700);
      if (templateIsInk) templatePixels++;
      if (templateIsInk && drawnIsInk) overlapPixels++;
    }
    const overlapRatio = templatePixels ? (overlapPixels / templatePixels) : 0;
    return { overlapPixels, templatePixels, overlapRatio };
  }

  function showScore(result) {
    const percent = Math.round(result.overlapRatio * 100);
    let msg;
    if (percent >= 55) msg = `Excellent! ${percent}% match — great tracing!`;
    else if (percent >= 35) msg = `Good effort — ${percent}% match. Try again.`;
    else msg = `Keep trying — ${percent}% match. Trace more carefully.`;
    traceResult.textContent = msg;
    speakText(msg);
    if (percent >= 55 && typeof window.awardStarFor === 'function') try { window.awardStarFor(); } catch (e) { }
    if (percent >= 55) setTimeout(advanceToNext, 800);
  }

  function checkTrace() {
    const L = (targetLabel.textContent || 'A').charAt(0).toUpperCase();
    const templateCanvas = renderLetterTemplateForCompare(L);
    const drawnImg = getImageDataFromCanvasDisplay(traceCanvas);
    if (templateCanvas.width !== drawnImg.width || templateCanvas.height !== drawnImg.height) {
      const s = document.createElement('canvas'); s.width = drawnImg.width; s.height = drawnImg.height;
      const sc = s.getContext('2d');
      sc.drawImage(templateCanvas, 0, 0, templateCanvas.width, templateCanvas.height, 0, 0, s.width, s.height);
      const td = sc.getImageData(0, 0, s.width, s.height).data;
      const result = comparePixelArrays(td, drawnImg.data);
      showScore(result);
    } else {
      const td = templateCanvas.getContext('2d').getImageData(0, 0, templateCanvas.width, templateCanvas.height).data;
      const result = comparePixelArrays(td, drawnImg.data);
      showScore(result);
    }
  }

  // --- A→Z population & click shows example ---
  function populateGrids() {
    letterGrid.innerHTML = '';
    alphabetStrip.innerHTML = '';
    for (const L of LETTERS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'letter-cell';
      b.dataset.letter = L;
      b.textContent = L;
      b.addEventListener('click', () => {
        setTarget(L);
        // show example in explore panel
        showLetterExample(L);
      });
      letterGrid.appendChild(b);

      const s = document.createElement('button');
      s.type = 'button';
      s.className = 'strip-letter';
      s.dataset.letter = L;
      s.textContent = L;
      s.addEventListener('click', () => {
        setTarget(L);
        showLetterExample(L);
      });
      alphabetStrip.appendChild(s);
    }
  }

  // --- render current shadow into visible canvas and clear strokes ---
  function renderCurrentShadowToCanvas() {
    // compositeShadowToVisible already clears and draws; use that
    compositeShadowToVisible();
  }

  // --- controls: clear / check / random ---
  clearBtn.addEventListener('click', () => {
    renderCurrentShadowToCanvas();
    traceResult.textContent = '';
    speakText('Cleared drawing');
  });

  checkBtn.addEventListener('click', () => {
    checkTrace();
  });

  nextBtn.addEventListener('click', () => {
    const cur = (targetLabel.textContent || 'A')[0];
    const pick = nextLetter(cur);
    setTarget(pick);
    refreshActivities();
  });

  // --- QUIZ ---
  const quizQuestion = document.getElementById('quizQuestion');
  const quizButtons = document.getElementById('quizButtons');
  const quizFeedback = document.getElementById('quizFeedback');

  function populateQuiz() {
    const types = ['startWith', 'matchCase', 'nextLetter', 'listenLetter'];
    // pick random type
    const type = types[Math.floor(Math.random() * types.length)];

    quizButtons.innerHTML = '';
    quizFeedback.textContent = '';

    if (type === 'startWith') quizStartWith();
    else if (type === 'matchCase') quizMatchCase();
    else if (type === 'nextLetter') quizNextLetter();
    else if (type === 'listenLetter') quizListenLetter();
  }

  // 1. Existing: Which starts with [Letter]?
  function quizStartWith() {
    const correct = (targetLabel.textContent || 'A')[0];
    const choices = new Set([correct]);
    while (choices.size < 4) choices.add(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
    const arr = Array.from(choices).sort(() => Math.random() - 0.5);

    quizQuestion.textContent = `Which of these starts with '${correct}'?`;
    speakText(quizQuestion.textContent);

    arr.forEach(ch => {
      const b = document.createElement('button');
      b.textContent = `${ch} — for ${ch.toLowerCase()}`; // e.g. "A — for a" 
      // Note: original had examples, but simple letter is fine too. Let's keep consistent.
      // Actually original code was just "A — for a" logic essentially? 
      // Original: `${ch} — for ${ch.toLowerCase()}` 
      // Let's improve it to use words if possible? 
      // actually the original just did generic. Let's stick to simple to avoid complexity.
      b.className = 'btn soft';
      b.addEventListener('click', () => handleQuizAnswer(ch === correct));
      quizButtons.appendChild(b);
    });
  }

  // 2. Match Case: shown 'A', find 'a'
  function quizMatchCase() {
    const big = (targetLabel.textContent || 'A')[0].toUpperCase();
    const small = big.toLowerCase();

    // distractors: other small letters
    const choices = new Set([small]);
    while (choices.size < 4) {
      const rand = LETTERS[Math.floor(Math.random() * LETTERS.length)].toLowerCase();
      if (rand !== small) choices.add(rand);
    }
    const arr = Array.from(choices).sort(() => Math.random() - 0.5);

    quizQuestion.textContent = `Find the small letter for '${big}'`;
    speakText(quizQuestion.textContent);

    arr.forEach(s => {
      const b = document.createElement('button');
      b.textContent = s;
      b.className = 'btn soft';
      b.style.fontSize = '24px';
      b.addEventListener('click', () => handleQuizAnswer(s === small));
      quizButtons.appendChild(b);
    });
  }

  // 3. Next Letter: What comes after 'A'?
  function quizNextLetter() {
    const cur = (targetLabel.textContent || 'A')[0].toUpperCase();
    // if Z, maybe ask what comes BEFORE? or simply wrap A? Let's wrapping A for simplicity or avoid Z.
    // If Z, we can ask "What is the first letter?" or just "Start over with A"
    const isZ = cur === 'Z';
    const answer = isZ ? 'A' : LETTERS[LETTERS.indexOf(cur) + 1];

    quizQuestion.textContent = `What letter comes after '${cur}'?`;
    speakText(quizQuestion.textContent);

    const choices = new Set([answer]);
    while (choices.size < 4) {
      const r = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      if (r !== answer) choices.add(r);
    }
    const arr = Array.from(choices).sort(() => Math.random() - 0.5);

    arr.forEach(c => {
      const b = document.createElement('button');
      b.textContent = c;
      b.className = 'btn soft';
      b.addEventListener('click', () => handleQuizAnswer(c === answer));
      quizButtons.appendChild(b);
    });
  }

  // 4. Listen & Pick: "Tap the letter: [Audio]"
  function quizListenLetter() {
    // Pick a target. Could be the current letter or random. 
    // Let's use the current Target letter to reinforce it.
    const correct = (targetLabel.textContent || 'A')[0].toUpperCase();

    quizQuestion.textContent = `Listen carefully... Tap '${correct}'`;
    // We speak it after a slight delay or immediately
    setTimeout(() => speakText(`Tap the letter ${correct}`), 200);

    const choices = new Set([correct]);
    while (choices.size < 4) choices.add(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
    const arr = Array.from(choices).sort(() => Math.random() - 0.5);

    arr.forEach(c => {
      const b = document.createElement('button');
      b.textContent = c;
      b.className = 'btn soft';
      b.addEventListener('click', () => {
        // If they click wrong, maybe speak the letter they clicked?
        if (c !== correct) speakText(c);
        handleQuizAnswer(c === correct);
      });
      quizButtons.appendChild(b);
    });

    // add a replay button
    const replay = document.createElement('button');
    replay.textContent = '🔊 Hear again';
    replay.className = 'btn soft';
    replay.style.marginLeft = '10px';
    replay.onclick = () => speakText(`Tap the letter ${correct}`);
    quizQuestion.appendChild(replay);
  }

  function handleQuizAnswer(isCorrect) {
    if (isCorrect) {
      quizFeedback.textContent = 'Correct!';
      speakText('Correct!');
      try { if (typeof awardStarFor === 'function') awardStarFor(); } catch (e) { }
      setTimeout(advanceToNext, 600);
    } else {
      quizFeedback.textContent = 'Try again.';
      // speakText('Try again.'); // Optional, might be annoying if repetitive
    }
  }

  // --- Image / Emoji Match ---
  const imgButtons = document.getElementById('imgButtons');
  const imgFeedback = document.getElementById('imgFeedback');
  const imgQuestion = document.getElementById('imgQuestion'); // Get reference
  const emojiPool = ['🍎', '🐝', '🚗', '🐶', '🍌', '🦊', '🐘', '🦁', '🍇', '🐸', '🐔', '🌟'];

  function populateImgMatch() {
    imgButtons.innerHTML = '';
    const map = letterExample;
    const currentLetter = (targetLabel.textContent || 'A')[0];
    const correct = map[currentLetter]?.emoji || emojiPool[Math.floor(Math.random() * emojiPool.length)];

    // meaningful instruction
    const word = map[currentLetter]?.word || 'item';
    const instr = `Which picture shows the ${word}?`;
    if (imgQuestion) imgQuestion.innerHTML = instr + ` <span style="font-weight:normal;font-size:0.9em">(Starts with <strong>${currentLetter}</strong>)</span>`;
    speakText(instr);

    const choices = new Set([correct]);
    while (choices.size < 4) choices.add(emojiPool[Math.floor(Math.random() * emojiPool.length)]);
    const arr = Array.from(choices).sort(() => Math.random() - 0.5);
    arr.forEach(emj => {
      const card = document.createElement('div');
      card.className = 'memory-card'; // re-use memory card style for uniformity
      // actually the original used memory-card class but was in imgButtons container. 
      // let's keep it consistent with previous code but maybe add a title?
      card.style.fontSize = '42px';
      card.textContent = emj;
      card.addEventListener('click', () => {
        if (emj === correct) {
          imgFeedback.textContent = 'Correct! That is the ' + word + '.';
          speakText('Correct! ' + word);
          renderShadowEmoji(emj);
          try { if (typeof awardStarFor === 'function') awardStarFor(); } catch (e) { }
          setTimeout(advanceToNext, 1200); // slightly longer to read
        } else {
          imgFeedback.textContent = 'Not that one. Try again.';
          speakText('Not that one.');
        }
      });
      imgButtons.appendChild(card);
    });
    imgFeedback.textContent = '';
  }

  // --- Memory ---
  const memBoard = document.getElementById('memBoard');
  const memFeedback = document.getElementById('memFeedback');

  function populateMemory() {
    memBoard.innerHTML = '';
    memFeedback.textContent = '';
    const icons = ['🍎', '🐶', '🚗', '🌟', '🐘', '🍌'];
    const deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
    const state = { flipped: [], matched: [] };
    deck.forEach((icon, i) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.icon = icon;
      card.dataset.idx = i;
      card.style.fontSize = '28px';
      card.textContent = '?';
      card.addEventListener('click', () => {
        if (state.matched.includes(i) || state.flipped.includes(i)) return;
        state.flipped.push(i);
        card.textContent = icon;
        if (state.flipped.length === 2) {
          const [a, b] = state.flipped;
          const aIcon = document.querySelector(`.memory-card[data-idx="${a}"]`).dataset.icon;
          const bIcon = document.querySelector(`.memory-card[data-idx="${b}"]`).dataset.icon;
          if (aIcon === bIcon) {
            state.matched.push(a, b);
            memFeedback.textContent = 'Matched!';
            speakText('Nice match!');
            try { if (typeof awardStarFor === 'function') awardStarFor(); } catch (e) { }
            // if all matched -> advance
            if (state.matched.length === deck.length) {
              setTimeout(advanceToNext, 700);
            }
          } else {
            memFeedback.textContent = 'Try again';
            setTimeout(() => {
              document.querySelector(`.memory-card[data-idx="${a}"]`).textContent = '?';
              document.querySelector(`.memory-card[data-idx="${b}"]`).textContent = '?';
            }, 600);
          }
          state.flipped = [];
        }
      });
      memBoard.appendChild(card);
    });
  }

  // --- Count ---
  const countDisplay = document.getElementById('countDisplay');
  const countButtons = document.getElementById('countButtons');
  const countFeedback = document.getElementById('countFeedback');

  function populateCount() {
    const count = 2 + Math.floor(Math.random() * 7);
    const fruits = ['🍎', '🍌', '🍇', '🍓', '🍊'];
    const chosen = fruits[Math.floor(Math.random() * fruits.length)];
    countDisplay.textContent = chosen.repeat(count);
    countButtons.innerHTML = '';
    const choices = new Set([count]);
    while (choices.size < 4) choices.add(1 + Math.floor(Math.random() * 10));
    Array.from(choices).sort(() => Math.random() - 0.5).forEach(n => {
      const b = document.createElement('button');
      b.className = 'btn soft';
      b.textContent = n;
      b.addEventListener('click', () => {
        if (n === count) {
          countFeedback.textContent = 'Correct!';
          speakText('Correct!');
          try { if (typeof awardStarFor === 'function') awardStarFor(); } catch (e) { }
          setTimeout(advanceToNext, 700);
        } else {
          countFeedback.textContent = 'Try again.';
          speakText('Try again.');
        }
      });
      countButtons.appendChild(b);
    });
    countFeedback.textContent = '';
  }

  // --- Number Line ---
  const numlineMarkers = document.getElementById('numlineMarkers');
  const numlineChoices = document.getElementById('numlineChoices');
  const numlineFeedback = document.getElementById('numlineFeedback');

  function populateNumline() {
    numlineMarkers.innerHTML = '';
    numlineChoices.innerHTML = '';
    numlineFeedback.textContent = '';
    const start = 1 + Math.floor(Math.random() * 10);
    const len = 5;
    const missingIndex = 1 + Math.floor(Math.random() * (len - 2));
    for (let i = 0; i < len; i++) {
      const val = start + i;
      const span = document.createElement('span');
      span.className = 'number-line-marker';
      span.textContent = (i === missingIndex) ? ' ? ' : val;
      span.dataset.val = val;
      span.dataset.pos = i;
      numlineMarkers.appendChild(span);
    }
    const correct = start + missingIndex;
    const choices = new Set([correct]);
    while (choices.size < 4) choices.add(correct + (Math.floor(Math.random() * 5) - 2));
    Array.from(choices).sort(() => Math.random() - 0.5).forEach(n => {
      const b = document.createElement('button');
      b.className = 'btn soft';
      b.textContent = n;
      b.draggable = true;
      b.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', n);
      });
      numlineChoices.appendChild(b);
    });
    const missingSpan = Array.from(numlineMarkers.children).find(ch => ch.textContent.trim() === '?');
    missingSpan.addEventListener('dragover', (e) => e.preventDefault());
    missingSpan.addEventListener('drop', (e) => {
      e.preventDefault();
      const val = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (val === correct) {
        missingSpan.textContent = val;
        numlineFeedback.textContent = 'Correct!';
        speakText('Correct!');
        try { if (typeof awardStarFor === 'function') awardStarFor(); } catch (e) { }
        setTimeout(advanceToNext, 700);
      } else {
        numlineFeedback.textContent = 'Try again';
        speakText('Try again');
      }
    });
  }

  // --- Explore / Colors activity ---
  const exploreGrid = document.getElementById('exploreGrid');

  function populateExplore() {
    exploreGrid.innerHTML = '';
    const topics = [
      { title: 'Animals', emoji: '🐻', content: 'Learn about animals: Cat, Dog, Elephant...' },
      { title: 'Fruits', emoji: '🍎', content: 'Fruits are healthy. Apple, Banana, Grapes...' },
      { title: 'Numbers', emoji: '🔢', content: 'Numbers help us count. Try counting objects.' },
      { title: 'Colors', emoji: '🎨', content: 'Pick the color by name (interactive).', isColor: true },
      { title: 'Shapes', emoji: '🔺', content: 'Circle, Square, Triangle — match them!' },
      { title: 'Transport', emoji: '🚗', content: 'Cars, buses, and bikes move us around.' }
    ];
    topics.forEach(t => {
      const tile = document.createElement('div');
      tile.className = 'explore-tile';
      tile.innerHTML = `<div class="emoji">${t.emoji}</div><div style="font-weight:700;margin-top:6px">${t.title}</div>`;
      tile.addEventListener('click', () => {
        if (t.isColor) showColorsActivity();
        else {
          explorePanel.innerHTML = `<h4>${t.title}</h4><p>${t.content}</p>`;
          speakText(t.title);
        }
      });
      exploreGrid.appendChild(tile);
    });
  }

  // Colors activity: ask a color by name, show color swatches to pick
  function showColorsActivity() {
    // choose current letter's color if available, else random
    const L = (targetLabel.textContent || 'A')[0];
    const info = letterExample[L] || {};
    const colorName = (info.color && info.color !== 'multicolor') ? info.color : pickRandom(['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray', 'black', 'white']);
    // create UI
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray', 'black', 'white'];
    explorePanel.innerHTML = `<h4>Colors — select the color named <strong>${colorName}</strong></h4><div id="colorOptions" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"></div><div id="colorFeedback" class="feedback" style="margin-top:8px"></div>`;
    const optDiv = document.getElementById('colorOptions');
    const feedback = document.getElementById('colorFeedback');
    colors.forEach(c => {
      const sw = document.createElement('button');
      sw.className = 'btn soft';
      sw.style.padding = '14px';
      sw.style.minWidth = '72px';
      sw.style.display = 'flex';
      sw.style.gap = '8px';
      sw.style.alignItems = 'center';
      // color sample and name
      sw.innerHTML = `<span style="width:28px;height:18px;border-radius:4px;background:${c};display:inline-block;border:1px solid rgba(0,0,0,0.08)"></span><span style="text-transform:capitalize">${c}</span>`;
      sw.addEventListener('click', () => {
        if (c === colorName) {
          feedback.textContent = 'Correct!';
          speakText('Correct!');
          try { if (typeof awardStarFor === 'function') awardStarFor(); } catch (e) { }
          setTimeout(advanceToNext, 700);
        } else {
          feedback.textContent = 'Try again';
          speakText('Try again');
        }
      });
      optDiv.appendChild(sw);
    });
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // --- Refresh activities when target changes or tabs clicked ---
  function refreshActivities() {
    populateQuiz();
    populateImgMatch();
    populateMemory();
    populateCount();
    populateNumline();
    populateExplore();
    renderShadowLetter((targetLabel.textContent || 'A')[0]);
    renderCurrentShadowToCanvas();
  }

  // small helper to re-draw shadow into visible canvas and clear strokes
  function renderCurrentShadowToCanvas() {
    compositeShadowToVisible();
  }

  // --- Tab switching behavior ---
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const tab = t.dataset.tab;
      document.querySelectorAll('section.activity').forEach(s => s.classList.remove('active'));
      const panel = document.getElementById(tab);
      if (panel) panel.classList.add('active');
      if (['quiz', 'img', 'mem', 'count', 'numline', 'explore', 'az'].includes(tab)) {
        refreshActivities();
      }
    });
  });

  // --- initialization ---
  window.addEventListener('resize', () => { fixCanvasResolution(); renderCurrentShadowToCanvas(); });
  fixCanvasResolution();
  populateGrids();
  try {
    const saved = localStorage.getItem('kidapp.target');
    if (saved && saved.length === 1) setTarget(saved.toUpperCase(), { speak: false });
    else setTarget('A', { speak: false });
  } catch (e) {
    setTarget('A', { speak: false });
  }
  refreshActivities();
  setTimeout(() => speakText('Tap the big letter to change. Draw inside the box and press Check to score your trace.'), 700);

  // expose helpers for debugging
  window.__KidAppLearn = {
    setTarget, checkTrace, refreshActivities
  };

  console.log('Learn.js initialized with auto-advance & Colors activity.');
})();
