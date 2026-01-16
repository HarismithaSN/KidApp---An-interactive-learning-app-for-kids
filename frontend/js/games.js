// js/games.js - 10 Games Implementation

let totalScore = 0;

function say(text) {
    if (window.__KidAppTTS) window.__KidAppTTS.speak(text);
    else {
        try {
            const u = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(u);
        } catch (e) { }
    }
}

// --- Menu UI ---
function showMenu() {
    document.getElementById('gameMenu').classList.remove('hidden');
    document.querySelectorAll('.game-container').forEach(el => el.classList.add('hidden'));
    say("More games!");
}

// Game Intros
const GAME_INTROS = {
    animal: "Animal Sounds. Listen to the sound, then click the matching animal.",
    memory: "Memory Match. Click the cards to find matching pairs.",
    math: "Math Quiz. Look at the question and pick the right answer.",
    color: "Color Fun. Find the color requested.",
    spell: "Spelling Bee. Click the letters to spell the word shown.",
    shape: "Learn Shapes. Find the shape asked for.",
    count: "Counting Fun. Count the objects and click the number.",
    pattern: "Logic Patterns. Look at the pattern and choose what comes next.",
    piano: "Mini Piano. Click the keys to play music.",
    odd: "Odd One Out. Find the item that is different from the others.",
    balloon: "Balloon Pop. Click the balloons before they fly away!",
    draw: "Drawing Pad. Draw whatever you like!"
};

function startGame(type) {
    document.getElementById('gameMenu').classList.add('hidden');
    document.querySelectorAll('.game-container').forEach(el => el.classList.add('hidden'));
    // Clear all feedback
    document.querySelectorAll('.feedback-msg').forEach(el => {
        el.textContent = '';
        el.className = 'feedback-msg';
    });

    // Speak Intro
    if (GAME_INTROS[type]) {
        say(GAME_INTROS[type]);
    }

    if (type === 'animal') { document.getElementById('gameAnimal').classList.remove('hidden'); initAnimalGame(); }
    else if (type === 'memory') { document.getElementById('gameMemory').classList.remove('hidden'); initMemoryGame(); }
    else if (type === 'math') { document.getElementById('gameMath').classList.remove('hidden'); initMathGame(); }
    else if (type === 'color') { document.getElementById('gameColor').classList.remove('hidden'); initColorGame(); }
    else if (type === 'spell') { document.getElementById('gameSpell').classList.remove('hidden'); initSpellGame(); }
    else if (type === 'shape') { document.getElementById('gameShape').classList.remove('hidden'); initShapeGame(); }
    else if (type === 'count') { document.getElementById('gameCount').classList.remove('hidden'); initCountGame(); }
    else if (type === 'pattern') { document.getElementById('gamePattern').classList.remove('hidden'); initPatternGame(); }
    else if (type === 'piano') { document.getElementById('gamePiano').classList.remove('hidden'); initPianoGame(); }
    else if (type === 'odd') { document.getElementById('gameOdd').classList.remove('hidden'); initOddGame(); }
    else if (type === 'balloon') { document.getElementById('gameBalloon').classList.remove('hidden'); initBalloonGame(); }
    else if (type === 'draw') { document.getElementById('gameDraw').classList.remove('hidden'); initDrawGame(); }
}

// Global Help Function for Feedback
function showFeedback(btn, isCorrect, correctMsg = "Correct!") {
    // Find closest feedback container or create one if missing
    // Each game section typically has a .feedback-msg or we can append nicely
    let fb = null;
    const gameContainer = btn.closest('.game-container');
    if (gameContainer) fb = gameContainer.querySelector('.feedback-msg');

    if (isCorrect) {
        say(correctMsg);
        if (fb) {
            fb.textContent = correctMsg;
            fb.className = "feedback-msg";
            fb.style.color = '#4caf50';
        }
        return true;
    } else {
        // Wrong
        btn.classList.add('shake', 'wrong-btn');
        setTimeout(() => btn.classList.remove('shake'), 500);

        if (fb) {
            fb.textContent = "Try again!";
            fb.className = "feedback-msg shake-text";
            // Flash red text
            setTimeout(() => fb.classList.remove('shake-text'), 500);
        }
        say("Try again");
        return false;
    }
}

function addScore(pts) {
    totalScore += pts;
    document.getElementById('totalScore').textContent = totalScore;
    if (window.spawnCelebration) window.spawnCelebration();

    // Remote Save
    const uStr = localStorage.getItem('kidAppUser');
    if (uStr) {
        const u = JSON.parse(uStr);
        fetch('../backend/api.php?action=save_activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: u.id,
                type: 'game',
                name: 'Game Zone Point',
                score: pts,
                details: 'Verified score'
            })
        }).catch(e => console.warn('Save failed', e));
    }
}


// --- 1. Animal Sounds ---
const ANIMALS = [
    { name: 'Dog', emoji: '🐶', soundText: 'Woof Woof', file: 'dog.wav' },
    { name: 'Cat', emoji: '🐱', soundText: 'Meow Meow', file: 'cat.wav' },
    { name: 'Cow', emoji: '🐄', soundText: 'Moo Moo', file: 'cow.wav' },
    { name: 'Lion', emoji: '🦁', soundText: 'Roar', file: 'lion.wav' },
    { name: 'Eleph', emoji: '🐘', soundText: 'Pawoo', file: 'elephant.mp3' },
    { name: 'Parrot', emoji: '🦜', soundText: 'Squawk', file: 'parrot.mp3' },
    { name: 'Peacock', emoji: '🦚', soundText: 'Scream', file: 'peacock.mp3' },
    { name: 'Duck', emoji: '🦆', soundText: 'Quack Quack', file: 'duck.mp3' },
    { name: 'Pig', emoji: '🐷', soundText: 'Oink Oink', file: 'pig.mp3' },
    { name: 'Wolf', emoji: '🐺', soundText: 'Awooo', file: 'wolf.wav' },
    { name: 'Horse', emoji: '🐴', soundText: 'Neigh', file: 'horse.wav' },
    { name: 'Frog', emoji: '🐸', soundText: 'Ribbit', file: 'frog.mp3' },
    { name: 'Owl', emoji: '🦉', soundText: 'Hoot Hoot', file: 'owl.mp3' },
    { name: 'Penguin', emoji: '🐧', soundText: 'Honk', file: 'penguin.mp3' },
    { name: 'Tiger', emoji: '🐯', soundText: 'Growl', file: 'tiger.mp3' }
];

let curAnimal = null;
let wrongAttempts = 0;

function initAnimalGame() { loadNextAnimal(); }

function loadNextAnimal() {
    curAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    wrongAttempts = 0;
    const div = document.getElementById('animalOptions');
    div.innerHTML = '';

    // Reset feedback
    const fb = document.getElementById('animalFeedback');
    if (fb) fb.innerHTML = '';

    let opts = [curAnimal];
    while (opts.length < 4) {
        let r = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        if (r.name !== curAnimal.name && !opts.includes(r)) opts.push(r);
    }
    opts.sort(() => Math.random() - 0.5);

    opts.forEach(a => {
        const btn = document.createElement('button');
        btn.className = 'game-option-btn';
        btn.textContent = a.emoji;
        btn.onclick = () => {
            if (a.name === curAnimal.name) {
                say("Correct! " + a.name);
                addScore(10);
                setTimeout(loadNextAnimal, 1500);
            } else {
                // Wrong Answer Logic
                wrongAttempts++;
                btn.classList.add('shake', 'wrong-btn');
                setTimeout(() => btn.classList.remove('shake'), 500);

                // Feedback message
                if (fb) {
                    fb.textContent = "Try again!";
                    fb.className = "feedback-msg shake-text";
                    setTimeout(() => fb.classList.remove('shake-text'), 500);
                }

                if (wrongAttempts >= 2) {
                    // Hint: Highlight correct answer
                    const correctBtn = Array.from(div.children).find(b => b.textContent === curAnimal.emoji);
                    if (correctBtn) correctBtn.classList.add('highlight-hint');
                }
            }
        };
        div.appendChild(btn);
    });
    setTimeout(playCurrentAnimalSound, 500);
}

function playCurrentAnimalSound() {
    if (!curAnimal) return;

    // Try playing File first, fallback to TTS
    // Support full filename in .file property
    const filename = curAnimal.file.includes('.') ? curAnimal.file : curAnimal.file + '.mp3';
    const audio = new Audio(`audio/${filename}`);

    audio.play().catch(e => {
        // Fallback to TTS if file missing or error
        console.warn('Audio file missing or failed: ' + filename, e);
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(curAnimal.soundText);
        u.pitch = 1.2;
        window.speechSynthesis.speak(u);
    });
}

// --- 2. Memory ---
const MEM_ICONS = ['🍎', '🍌', '🍇', '🍒', '🍉', '🍓'];
let flippedCards = [];
let matchedCount = 0;
function initMemoryGame() {
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';
    flippedCards = [];
    matchedCount = 0;
    let items = [...MEM_ICONS, ...MEM_ICONS].sort(() => Math.random() - 0.5);
    items.forEach((icon, idx) => {
        const c = document.createElement('div');
        c.className = 'memory-card';
        c.dataset.icon = icon;
        c.innerHTML = `<div class="front">❓</div><div class="back">${icon}</div>`;
        c.onclick = () => {
            if (c.classList.contains('flipped') || flippedCards.length >= 2) return;
            c.classList.add('flipped');
            flippedCards.push(c);
            if (flippedCards.length === 2) {
                const [c1, c2] = flippedCards;
                if (c1.dataset.icon === c2.dataset.icon) {
                    matchedCount++;
                    flippedCards = [];
                    addScore(20);
                    showFeedback(c2, true, "Match!");
                    if (matchedCount === MEM_ICONS.length) say("You won!");
                } else {
                    showFeedback(c2, false);
                    setTimeout(() => { c1.classList.remove('flipped'); c2.classList.remove('flipped'); flippedCards = []; }, 1000);
                }
            }
        };
        grid.appendChild(c);
    });
}

// --- 3. Math ---
let mathAns = 0;
function initMathGame() { loadNextMath(); }
function loadNextMath() {
    const n1 = Math.floor(Math.random() * 5) + 1;
    const n2 = Math.floor(Math.random() * 5) + 1;
    mathAns = n1 + n2;
    document.getElementById('mathQuestion').textContent = `${n1} + ${n2} = ?`;
    const div = document.getElementById('mathOptions');
    div.innerHTML = '';

    // Clear old feedback
    const fb = document.getElementById('gameMath').querySelector('.feedback-msg');
    if (fb) fb.textContent = '';

    let opts = [mathAns];
    while (opts.length < 3) {
        let r = Math.floor(Math.random() * 10) + 1;
        if (!opts.includes(r)) opts.push(r);
    }
    opts.sort(() => Math.random() - 0.5);
    opts.forEach(n => {
        const btn = document.createElement('button');
        btn.className = 'game-option-btn';
        btn.textContent = n;
        btn.onclick = () => {
            if (n === mathAns) {
                showFeedback(btn, true, "Correct!");
                addScore(10);
                setTimeout(loadNextMath, 1500);
            } else {
                showFeedback(btn, false);
            }
        };
        div.appendChild(btn);
    });
}

// --- 4. Color ---
const COLORS = [
    { name: 'RED', hex: '#f44336' }, { name: 'BLUE', hex: '#2196f3' }, { name: 'GREEN', hex: '#4caf50' }, { name: 'YELLOW', hex: '#ffeb3b' }
];
let targetCol = null;
function initColorGame() { loadNextColor(); }
function loadNextColor() {
    targetCol = COLORS[Math.floor(Math.random() * COLORS.length)];
    const instr = document.getElementById('colorInstruction');
    instr.textContent = `Find ${targetCol.name}!`;
    instr.style.color = targetCol.hex;
    const div = document.getElementById('colorOptions');
    div.innerHTML = '';
    [...COLORS].sort(() => Math.random() - 0.5).forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'game-option-btn';
        btn.style.backgroundColor = c.hex;
        btn.style.width = '80px';
        btn.style.height = '80px';
        btn.style.borderRadius = '50%';
        btn.onclick = () => {
            if (c.name === targetCol.name) {
                say("Correct!");
                addScore(10);
                setTimeout(loadNextColor, 1500);
            } else say("Wrong color.");
        };
        div.appendChild(btn);
    });
}

// --- 5. Spelling ---
const WORDS = [
    { word: 'CAT', emoji: '🐱' }, { word: 'DOG', emoji: '🐶' }, { word: 'CAR', emoji: '🚗' }, { word: 'BUS', emoji: '🚌' }, { word: 'SUN', emoji: '☀️' }
];
let curWordObj = null;
let curSpelled = '';
function initSpellGame() { loadNextSpell(); }
function loadNextSpell() {
    curWordObj = WORDS[Math.floor(Math.random() * WORDS.length)];
    curSpelled = '';
    document.getElementById('spellImage').textContent = curWordObj.emoji;
    document.getElementById('spellSlots').textContent = '_ '.repeat(curWordObj.word.length);
    const div = document.getElementById('spellLetters');
    div.innerHTML = '';
    // Shuffle letters needed plus distractions
    let letters = curWordObj.word.split('');
    letters.push('X', 'O', 'Z');
    letters = letters.sort(() => Math.random() - 0.5).slice(0, 6); // max 6
    letters.forEach(l => {
        const btn = document.createElement('button');
        btn.className = 'game-option-btn';
        btn.textContent = l;
        btn.onclick = () => {
            curSpelled += l;
            document.getElementById('spellSlots').textContent = curSpelled + ' ' + '_ '.repeat(Math.max(0, curWordObj.word.length - curSpelled.length));
            say(l);
            if (curSpelled.length === curWordObj.word.length) {
                if (curSpelled === curWordObj.word) {
                    say("Correct! " + curWordObj.word);
                    addScore(15);
                    setTimeout(loadNextSpell, 1500);
                } else {
                    say("Oops");
                    setTimeout(() => {
                        curSpelled = '';
                        document.getElementById('spellSlots').textContent = '_ '.repeat(curWordObj.word.length);
                    }, 1000);
                }
            }
        };
        div.appendChild(btn);
    });
}

// --- 6. Shapes ---
const SHAPES = [
    { name: 'Circle', css: 'border-radius:50%' },
    { name: 'Square', css: 'border-radius:0' },
    { name: 'Triangle', css: 'clip-path: polygon(50% 0%, 0% 100%, 100% 100%)' }
];
let targetShape = null;
function initShapeGame() { loadNextShape(); }
function loadNextShape() {
    targetShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    document.getElementById('shapeInstruction').textContent = `Find the ${targetShape.name}!`;
    const div = document.getElementById('shapeOptions');
    div.innerHTML = '';
    SHAPES.forEach(s => {
        const btn = document.createElement('div');
        btn.className = 'game-option-btn';
        btn.style.cssText = `width:80px; height:80px; background:#ff9800; display:inline-block; margin:10px; ${s.css}`;
        btn.onclick = () => {
            if (s.name === targetShape.name) {
                say("Correct!");
                addScore(10);
                setTimeout(loadNextShape, 1500);
            } else say("Not that one.");
        };
        div.appendChild(btn);
    });
}

// --- 7. Counting ---
let countNum = 0;
function initCountGame() { loadNextCount(); }
function loadNextCount() {
    countNum = Math.floor(Math.random() * 5) + 1; // 1-5
    const box = document.getElementById('countObjects');
    box.innerHTML = '';
    for (let i = 0; i < countNum; i++) {
        const s = document.createElement('span');
        s.textContent = '🍎';
        s.style.fontSize = '3rem';
        box.appendChild(s);
    }
    const div = document.getElementById('countOptions');
    div.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const btn = document.createElement('button');
        btn.className = 'game-option-btn';
        btn.textContent = i;
        btn.onclick = () => {
            if (i === countNum) {
                say("Correct! " + i);
                addScore(10);
                setTimeout(loadNextCount, 1500);
            } else say("Try again.");
        };
        div.appendChild(btn);
    }
}

// --- 8. Patterns ---
// e.g. ABAB ? -> A or B
const P_ITEMS = ['🔴', '🔵'];
let nextItem = '';
function initPatternGame() { loadNextPattern(); }
function loadNextPattern() {
    const row = document.getElementById('patternRow');
    row.innerHTML = '';
    // Simple ABAB pattern
    const a = P_ITEMS[0];
    const b = P_ITEMS[1];
    nextItem = a; // A B A B -> A
    [a, b, a, b].forEach(i => {
        const s = document.createElement('span');
        s.textContent = i;
        s.style.fontSize = '3rem';
        s.style.margin = '0 5px';
        row.appendChild(s);
    });
    const q = document.createElement('span');
    q.textContent = '❓';
    q.style.fontSize = '3rem';
    row.appendChild(q);

    const div = document.getElementById('patternOptions');
    div.innerHTML = '';
    [a, b].forEach(i => {
        const btn = document.createElement('button');
        btn.className = 'game-option-btn';
        btn.textContent = i;
        btn.onclick = () => {
            if (i === nextItem) {
                say("Correct!");
                addScore(15);
                setTimeout(loadNextPattern, 1500);
            } else say("Try again.");
        };
        div.appendChild(btn);
    });
}

// --- 9. Piano ---
const PIANO_NOTES = [
    { note: 'C4', freq: 261.63, type: 'white' },
    { note: 'C#4', freq: 277.18, type: 'black' },
    { note: 'D4', freq: 293.66, type: 'white' },
    { note: 'D#4', freq: 311.13, type: 'black' },
    { note: 'E4', freq: 329.63, type: 'white' },
    { note: 'F4', freq: 349.23, type: 'white' },
    { note: 'F#4', freq: 369.99, type: 'black' },
    { note: 'G4', freq: 392.00, type: 'white' },
    { note: 'G#4', freq: 415.30, type: 'black' },
    { note: 'A4', freq: 440.00, type: 'white' },
    { note: 'A#4', freq: 466.16, type: 'black' },
    { note: 'B4', freq: 493.88, type: 'white' },
    { note: 'C5', freq: 523.25, type: 'white' }
];

function initPianoGame() {
    const div = document.getElementById('pianoKeys');
    div.innerHTML = '';

    // Add Song Controls
    let controls = document.getElementById('pianoControls');
    if (!controls) {
        controls = document.createElement('div');
        controls.id = 'pianoControls';
        controls.style.marginBottom = '20px';
        controls.innerHTML = `
            <button class="pill" onclick="playSong('twinkle')">⭐ Twinkle Twinkle</button>
            <button class="pill" onclick="playSong('happy')">🎂 Happy Birthday</button>
        `;
        div.parentElement.insertBefore(controls, div);
    }

    PIANO_NOTES.forEach(n => {
        const btn = document.createElement('button');
        btn.className = `piano-key ${n.type}`;
        btn.dataset.note = n.note;
        if (n.type === 'white') btn.textContent = n.note;

        const play = () => {
            playTone(n.freq);
            btn.classList.add('active');
            setTimeout(() => btn.classList.remove('active'), 200);
        };

        btn.onmousedown = play;
        // Also support touch
        btn.ontouchstart = (e) => { e.preventDefault(); play(); };

        div.appendChild(btn);
    });
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle'; // Smoother than sine/square for piano
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.01); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5); // Decay

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
}

async function playSong(name) {
    const songs = {
        twinkle: [
            ['C4', 500], ['C4', 500], ['G4', 500], ['G4', 500], ['A4', 500], ['A4', 500], ['G4', 1000],
            ['F4', 500], ['F4', 500], ['E4', 500], ['E4', 500], ['D4', 500], ['D4', 500], ['C4', 1000]
        ],
        happy: [
            ['C4', 300], ['C4', 100], ['D4', 500], ['C4', 500], ['F4', 500], ['E4', 1000],
            ['C4', 300], ['C4', 100], ['D4', 500], ['C4', 500], ['G4', 500], ['F4', 1000]
        ]
    };

    const notes = songs[name];
    if (!notes) return;

    for (let [note, dur] of notes) {
        const item = PIANO_NOTES.find(n => n.note === note);
        if (item) {
            playTone(item.freq);
            // Visual highlight
            const keyBtn = document.querySelector(`.piano-key[data-note="${note}"]`);
            if (keyBtn) {
                keyBtn.classList.add('active');
                setTimeout(() => keyBtn.classList.remove('active'), dur - 100);
            }
        }
        await new Promise(r => setTimeout(r, dur));
    }
}

// --- 10. Odd One Out ---
const ODD_SETS = [
    { common: '🍎', odd: '🍇' },
    { common: '🐶', odd: '🐱' },
    { common: '🚗', odd: '✈️' },
    { common: '🔵', odd: '🔴' }
];
let curOdd = null;
function initOddGame() { loadNextOdd(); }
function loadNextOdd() {
    const set = ODD_SETS[Math.floor(Math.random() * ODD_SETS.length)];
    curOdd = set.odd;
    const div = document.getElementById('oddOptions');
    div.innerHTML = '';
    // 3 common, 1 odd
    let items = [set.common, set.common, set.common, set.odd];
    items.sort(() => Math.random() - 0.5);
    items.forEach(i => {
        const btn = document.createElement('button');
        btn.className = 'game-option-btn';
        btn.textContent = i;
        btn.onclick = () => {
            if (i === curOdd) {
                say("You found it!");
                addScore(10);
                setTimeout(loadNextOdd, 1500);
            } else say("Not that one.");
        }
        div.appendChild(btn);
    });
}

// --- 11. Balloon Pop ---
let balloonInterval;
let balloonScore = 0;

function initBalloonGame() {
    if (balloonInterval) clearInterval(balloonInterval);
    balloonScore = 0;
    document.getElementById('balloonScore').textContent = '0';
    document.getElementById('balloonArea').innerHTML = '';

    // Spawn balloons
    balloonInterval = setInterval(spawnBalloon, 800);
}

function spawnBalloon() {
    const area = document.getElementById('balloonArea');
    if (!area) return; // if left screen

    const b = document.createElement('div');
    b.textContent = '🎈';
    b.style.fontSize = '3rem';
    b.style.position = 'absolute';
    b.style.left = Math.random() * 90 + '%';
    b.style.bottom = '-50px';
    b.style.cursor = 'pointer';
    b.style.transition = 'bottom 4s linear, opacity 0.2s';
    b.style.userSelect = 'none';

    b.onclick = () => {
        b.style.opacity = '0';
        b.style.pointerEvents = 'none'; // prevent double click
        playPopSound();
        balloonScore += 10;
        document.getElementById('balloonScore').textContent = balloonScore;
        addScore(10);
        setTimeout(() => b.remove(), 200);
    };

    area.appendChild(b);

    // Animate
    setTimeout(() => {
        b.style.bottom = '110%'; // Float off top
    }, 50);

    // Initial cleanup
    setTimeout(() => {
        if (b.parentNode) b.remove();
    }, 4100);
}

function playPopSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.value = 800;
    osc.start();
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.stop(ctx.currentTime + 0.1);
}

// --- 12. Drawing Pad ---
let drawCtx;
let isDrawing = false;

function initDrawGame() {
    const cvs = document.getElementById('drawCanvas');
    drawCtx = cvs.getContext('2d');
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';

    // Mouse events
    cvs.onmousedown = startDraw;
    cvs.onmousemove = doDraw;
    cvs.onmouseup = endDraw;
    cvs.onmouseout = endDraw;

    // Touch events
    cvs.ontouchstart = (e) => { e.preventDefault(); startDraw(e.touches[0]); };
    cvs.ontouchmove = (e) => { e.preventDefault(); doDraw(e.touches[0]); };
    cvs.ontouchend = endDraw;
}

function startDraw(e) {
    isDrawing = true;
    const box = e.target.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;

    drawCtx.strokeStyle = document.getElementById('drawColor').value;
    drawCtx.lineWidth = document.getElementById('drawSize').value;
    drawCtx.beginPath();
    drawCtx.moveTo(x, y);
}

function doDraw(e) {
    if (!isDrawing) return;
    const box = (e.target || document.getElementById('drawCanvas')).getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    drawCtx.lineTo(x, y);
    drawCtx.stroke();
}

function endDraw() {
    isDrawing = false;
    drawCtx.closePath();
}

function clearCanvas() {
    const cvs = document.getElementById('drawCanvas');
    drawCtx.clearRect(0, 0, cvs.width, cvs.height);
}