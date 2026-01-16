// js/tts.js - safe, minimal TTS helper (no alerts)

(function(){
    // debug log
    console.log('Loaded js/tts.js');
  
    if (!('speechSynthesis' in window)) {
      console.warn('TTS unavailable');
      window.__KidAppTTS = { speak: function(){ console.warn('TTS not supported'); } };
      return;
    }
  
    function speak(text, opts = {}) {
      if (!text || !String(text).trim()) return;
      try { window.speechSynthesis.cancel(); } catch(e){}
      const u = new SpeechSynthesisUtterance(String(text).trim());
      u.lang = opts.lang || (navigator.language || 'en-US');
      u.rate = typeof opts.rate === 'number' ? opts.rate : 1;
      u.pitch = typeof opts.pitch === 'number' ? opts.pitch : 1;
      u.volume = typeof opts.volume === 'number' ? opts.volume : 1;
      try { window.speechSynthesis.speak(u); } catch(e){ console.error('TTS error', e); }
    }
  
    // conservative label detection
    function labelFor(el) {
      if (!el) return '';
      if (el.getAttribute) {
        const explicit = el.getAttribute('data-tts');
        if (explicit && explicit.trim()) return explicit.trim();
        const aria = el.getAttribute('aria-label');
        if (aria && aria.trim()) return aria.trim();
        const attrs = ['data-animal','data-letter','data-target','title','alt'];
        for (const a of attrs) {
          const v = el.getAttribute(a);
          if (v && v.trim()) return v.trim();
        }
      }
      if ('value' in el && String(el.value || '').trim()) return String(el.value).trim();
      const t = (el.textContent || '').trim().replace(/\s+/g,' ');
      if (t && t.length <= 40) return t;
      return '';
    }
  
    function isSpeakable(el) {
      if (!el) return false;
      if (el.getAttribute && el.getAttribute('data-tts')) return true;
      const tag = el.tagName;
      if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return true;
      const role = el.getAttribute && el.getAttribute('role');
      if (role && /button|tab|link|option/.test(role)) return true;
      const allowed = ['animal-card','big-tile','small-tile','letter-card','letter-cell','strip-letter','start-btn','auth-tab'];
      if (el.classList) for (const c of allowed) if (el.classList.contains(c)) return true;
      return false;
    }
  
    function findSpeakable(el) {
      let cur = el, depth = 0;
      while (cur && depth < 6) {
        if (isSpeakable(cur)) return cur;
        cur = cur.parentElement;
        depth++;
      }
      return null;
    }
  
    document.addEventListener('click', function(e){
      const clicked = e.target;
      const cur = findSpeakable(clicked);
      if (!cur) return;
      const label = labelFor(cur);
      if (!label) return;
      e.stopPropagation();
      speak(label);
    }, false);
  
    document.addEventListener('keydown', function(e){
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      const active = document.activeElement;
      const cur = findSpeakable(active);
      if (!cur) return;
      const label = labelFor(cur);
      if (!label) return;
      e.preventDefault();
      speak(label);
    }, false);
  
    window.__KidAppTTS = window.__KidAppTTS || {};
    window.__KidAppTTS.speak = speak;
    window.__KidAppTTS.labelFor = labelFor;
  })();
  