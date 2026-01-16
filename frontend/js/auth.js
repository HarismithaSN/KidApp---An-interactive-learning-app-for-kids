// frontend/js/auth.js (updated — adds TTS feedback)

// ---------- small TTS helper ----------
function speakAuth(text) {
  if (!text) return;
  try {
    if (window.__KidAppTTS && typeof window.__KidAppTTS.speak === 'function') {
      window.__KidAppTTS.speak(text);
      return;
    }
  } catch (e) { /* continue to fallback */ }

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = navigator.language || 'en-US';
      window.speechSynthesis.speak(u);
    } catch (err) {
      console.warn('TTS fallback failed', err);
    }
  } else {
    // no-op if nothing available
    console.info('TTS not available:', text);
  }
}

// ---------- Switch tabs (register / login) ----------
const tabs = document.querySelectorAll('.auth-tab');
const regForm = document.getElementById('registerForm');
const logForm = document.getElementById('loginForm');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const mode = tab.dataset.mode;
    if (mode === 'register') {
      regForm.classList.add('active');
      logForm.classList.remove('active');
      speakAuth('Register tab selected');
    } else {
      logForm.classList.add('active');
      regForm.classList.remove('active');
      speakAuth('Login tab selected');
    }
  });

  // keyboard activation for accessibility
  tab.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      tab.click();
    }
  });
});

// ---------- Avatar selection ----------
const avatarRow = document.getElementById('avatarRow');
let selectedAvatar = '🌈';

if (avatarRow) {
  avatarRow.querySelectorAll('.avatar-option').forEach(opt => {
    opt.addEventListener('click', () => {
      avatarRow.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedAvatar = opt.dataset.emoji || opt.textContent || selectedAvatar;

      // speak the selection (explicit friendly label if provided)
      const label = opt.getAttribute('data-tts') || opt.getAttribute('aria-label') || `${selectedAvatar} avatar`;
      speakAuth(label);
    });

    // keyboard accessibility for avatar options
    opt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        opt.click();
      }
    });
  });
}

// ---------- Helper to call backend ----------
async function callAuth(action, payload) {
  const res = await fetch('../backend/auth.php', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ action, ...payload })
  });
  return res.json();
}

/* ------------ REGISTER FORM SUBMIT ------------ */
regForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fb = document.getElementById('registerFeedback');
  fb.textContent = 'Creating account...';
  fb.className = 'feedback';
  speakAuth('Creating account');

  const form = new FormData(regForm);
  const parentName = (form.get('parentName') || '').trim();
  const childName  = (form.get('childName') || '').trim();
  const email      = (form.get('email') || '').trim();
  const password   = form.get('password');

  try {
    const data = await callAuth('register', {
      parentName, childName, email, password, avatar: selectedAvatar
    });

    if (data.ok) {
      const welcomeMsg = `Welcome ${data.user.childName || childName}. Redirecting to KidApp.`;
      fb.textContent = `Welcome, ${data.user.childName || childName}! 🎉 Redirecting...`;
      fb.classList.add('ok');
      speakAuth(welcomeMsg);

      // small delay then go to home
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    } else {
      const errMsg = data.error || 'Something went wrong.';
      fb.textContent = errMsg;
      fb.classList.add('err');
      speakAuth(errMsg);
    }
  } catch (err) {
    console.error(err);
    fb.textContent = 'Server error. Please try again.';
    fb.classList.add('err');
    speakAuth('Server error. Please try again.');
  }
});

/* ------------ LOGIN FORM SUBMIT ------------ */
logForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fb = document.getElementById('loginFeedback');
  fb.textContent = 'Signing you in...';
  fb.className = 'feedback';
  speakAuth('Signing you in');

  const form = new FormData(logForm);
  const email    = (form.get('email') || '').trim();
  const password = form.get('password');

  try {
    const data = await callAuth('login', { email, password });

    if (data.ok) {
      const child = data.user && data.user.childName ? data.user.childName : 'Friend';
      fb.textContent = `Hi, ${child}! 🌈 Taking you to KidApp…`;
      fb.classList.add('ok');
      speakAuth(`Hi ${child}. Taking you to KidApp.`);

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 700);
    } else {
      const errMsg = data.error || 'Login failed.';
      fb.textContent = errMsg;
      fb.classList.add('err');
      speakAuth(errMsg);
    }
  } catch (err) {
    console.error(err);
    fb.textContent = 'Server error. Please try again.';
    fb.classList.add('err');
    speakAuth('Server error. Please try again.');
  }
});
