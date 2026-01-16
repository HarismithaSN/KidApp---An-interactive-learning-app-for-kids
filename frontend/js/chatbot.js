// js/chatbot.js
(function () {
    // Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .kid-bot-icon {
            position: fixed; bottom: 20px; right: 20px;
            width: 70px; height: 70px; background: #fff;
            border-radius: 50%; box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            display: flex; align-items: center; justify-content: center;
            font-size: 3rem; cursor: pointer; z-index: 10000;
            transition: transform 0.3s;
            animation: bounceBot 3s infinite;
        }
        .kid-bot-icon:hover { transform: scale(1.1); }
        @keyframes bounceBot { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        .kid-bot-window {
            position: fixed; bottom: 100px; right: 20px;
            width: 300px; height: 400px; background: #fff;
            border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            display: none; flex-direction: column; z-index: 10000;
            overflow: hidden; border: 4px solid #aaf;
        }
        .kb-header {
            background: #aaf; padding: 15px; color: white; font-weight: bold;
            display: flex; justify-content: space-between; align-items: center;
        }
        .kb-body {
            flex: 1; padding: 15px; overflow-y: auto; background: #f9f9f9;
        }
        .kb-input-area {
            padding: 10px; border-top: 1px solid #eee; display: flex;
        }
        .kb-input {
            flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 20px; outline: none;
        }
        .kb-send {
            background: #aaf; border: none; padding: 8px 15px; margin-left: 5px;
            border-radius: 20px; color: white; cursor: pointer;
        }
        .msg { margin-bottom: 10px; max-width: 80%; padding: 8px 12px; border-radius: 15px; font-size: 0.9rem; }
        .msg.bot { background: #e3f2fd; color: #333; align-self: flex-start; border-bottom-left-radius: 2px; }
        .msg.user { background: #aaf; color: white; align-self: flex-end; margin-left: auto; border-bottom-right-radius: 2px; }
    `;
    document.head.appendChild(style);

    // HTML
    const icon = document.createElement('div');
    icon.className = 'kid-bot-icon';
    icon.innerHTML = '🤖';
    document.body.appendChild(icon);

    const win = document.createElement('div');
    win.className = 'kid-bot-window';
    win.innerHTML = `
        <div class="kb-header">
            <span>KidBot Helper</span>
            <button style="background:none; border:none; color:white; font-size:1.2rem; cursor:pointer;" id="closeBot">×</button>
        </div>
        <div class="kb-body" id="kbMessages">
            <div class="msg bot">Hi! I'm KidBot. I can tell jokes or help you! 🤖</div>
        </div>
        <div class="kb-input-area">
            <input type="text" class="kb-input" id="kbInput" placeholder="Ask me anything...">
            <button class="kb-send" id="kbSend">➤</button>
        </div>
    `;
    document.body.appendChild(win);

    // Logic
    let isOpen = false;
    icon.onclick = () => {
        isOpen = !isOpen;
        win.style.display = isOpen ? 'flex' : 'none';
        if (isOpen) document.getElementById('kbInput').focus();
    };
    document.getElementById('closeBot').onclick = () => {
        isOpen = false;
        win.style.display = 'none';
    };

    const input = document.getElementById('kbInput');
    const send = document.getElementById('kbSend');
    const msgs = document.getElementById('kbMessages');

    function addMsg(txt, isUser) {
        const d = document.createElement('div');
        d.className = 'msg ' + (isUser ? 'user' : 'bot');
        d.textContent = txt;
        msgs.appendChild(d);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function botReply(txt) {
        setTimeout(() => addMsg(txt, false), 500);
    }

    async function handleSend() {
        const txt = input.value.trim();
        if (!txt) return;

        addMsg(txt, true);
        input.value = '';
        input.disabled = true;

        // Loading bubble
        const loadingId = 'loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'msg bot';
        loadingDiv.id = loadingId;
        loadingDiv.textContent = '...';
        msgs.appendChild(loadingDiv);
        msgs.scrollTop = msgs.scrollHeight;

        try {
            const res = await fetch('../backend/api.php?action=chat', {
                method: 'POST',
                body: JSON.stringify({ message: txt })
            });
            const data = await res.json();

            // Remove loading
            document.getElementById(loadingId).remove();

            if (data.ok) {
                botReply(data.reply);
            } else {
                botReply("Error: " + (data.error || "Unknown"));
            }
        } catch (e) {
            document.getElementById(loadingId).remove();
            botReply("Network error! 🔌");
        }

        input.disabled = false;
        input.focus();
    }

    send.onclick = handleSend;
    input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

})();
