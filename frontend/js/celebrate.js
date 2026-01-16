// js/celebrate.js
function spawnCelebration() {
    // Create container if not exists
    let container = document.getElementById('celebration-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'celebration-container';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    const colors = ['rgba(255,0,0,0.5)', 'rgba(0,255,0,0.5)', 'rgba(0,0,255,0.5)', 'rgba(255,255,0,0.5)', 'rgba(255,0,255,0.5)'];

    for (let i = 0; i < 15; i++) {
        const b = document.createElement('div');
        b.innerHTML = '🎈';
        b.style.position = 'absolute';
        b.style.fontSize = (Math.random() * 5 + 4) + 'rem'; // Big
        b.style.left = Math.random() * 90 + '%';
        b.style.bottom = '-150px';
        b.style.opacity = '0.8';
        // Transparent effect by text-shadow or color
        b.style.filter = 'drop-shadow(0 0 10px rgba(255,255,255,0.5))';
        b.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;

        // Animation
        b.animate([
            { transform: `translateY(0) rotate(0deg)`, opacity: 0.8 },
            { transform: `translateY(-120vh) rotate(${Math.random() * 60 - 30}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 3000 + 4000,
            easing: 'ease-out'
        });

        container.appendChild(b);
        setTimeout(() => b.remove(), 7000);
    }
}
window.spawnCelebration = spawnCelebration;
