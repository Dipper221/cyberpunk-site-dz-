document.addEventListener('DOMContentLoaded', () => {
    
    // ===========================
    // 1. ГЛОБАЛЬНЫЕ НАСТРОЙКИ
    // ===========================
    const body = document.body;
    const themeBtn = document.getElementById('theme-btn');
    const soundBtn = document.getElementById('sound-btn');
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    let isRed = localStorage.getItem('nexus_theme') === 'red';
    let isSound = localStorage.getItem('nexus_sound') === 'true';

    function applySettings() {
        if(isRed) body.classList.add('red-theme');
        else body.classList.remove('red-theme');
        if(soundBtn) {
            soundBtn.textContent = isSound ? '🔊' : '🔇';
            soundBtn.style.color = isSound ? 'var(--primary)' : '#fff';
        }
    }
    applySettings();

    if(themeBtn) themeBtn.addEventListener('click', () => {
        isRed = !isRed;
        localStorage.setItem('nexus_theme', isRed ? 'red' : 'blue');
        applySettings();
        playTone(400, 'square', 0.1);
    });

    if(soundBtn) soundBtn.addEventListener('click', () => {
        isSound = !isSound;
        localStorage.setItem('nexus_sound', isSound);
        applySettings();
        if(isSound) {
            if(audioCtx.state === 'suspended') audioCtx.resume();
            playTone(600, 'sine', 0.1);
        }
    });

    function playTone(freq, type, dur) {
        if(!isSound) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
    }

    // ===========================
    // 2. ХАКЕРСКИЙ ТЕКСТ (Меню)
    // ===========================
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$";
    document.querySelectorAll('.hacker-text, .nav-item').forEach(el => {
        el.addEventListener('mouseenter', e => {
            const original = e.target.dataset.value || e.target.dataset.text;
            let iter = 0;
            const interval = setInterval(() => {
                e.target.innerText = original.split("").map((letter, index) => {
                    if(index < iter) return original[index];
                    return chars[Math.floor(Math.random() * chars.length)]
                }).join("");
                if(iter >= original.length) clearInterval(interval);
                iter += 1/3;
            }, 30);
            playTone(800, 'sawtooth', 0.02);
        });
    });

    // ===========================
    // 3. МИНИ-ИГРА (Главная)
    // ===========================
    const hackBtn = document.getElementById('hack-btn');
    if(hackBtn) {
        hackBtn.addEventListener('click', () => {
            const bar = document.querySelector('.progress-fill');
            const status = document.querySelector('.hack-status');
            const secret = document.getElementById('secret-data');
            
            status.innerText = "ВЫПОЛНЕНИЕ КОДА...";
            status.style.color = "var(--primary)";
            let width = 0;
            hackBtn.disabled = true;
            
            const interval = setInterval(() => {
                width += Math.random() * 4;
                if(width > 100) width = 100;
                bar.style.width = width + '%';
                playTone(200 + width * 5, 'square', 0.05);

                if(width === 100) {
                    clearInterval(interval);
                    status.innerText = "ВЗЛОМ ЗАВЕРШЕН";
                    secret.classList.add('visible');
                    playTone(1000, 'sine', 0.5);
                }
            }, 80);
        });
        
        // Матрица на фоне
        const c = document.getElementById('matrix-canvas');
        const ctx = c.getContext('2d');
        c.width = window.innerWidth; c.height = window.innerHeight;
        const drops = Array(Math.floor(c.width/20)).fill(1);
        setInterval(() => {
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.fillRect(0,0,c.width,c.height);
            ctx.fillStyle = getComputedStyle(body).getPropertyValue('--primary');
            ctx.font = '15px monospace';
            drops.forEach((y, i) => {
                const char = String.fromCharCode(0x30A0 + Math.random()*96);
                ctx.fillText(char, i*20, y*20);
                if(y*20 > c.height && Math.random()>0.975) drops[i]=0;
                drops[i]++;
            });
        }, 50);

        // Печатная машинка
        const txtEl = document.getElementById('typing');
        const txt = "SYSTEM_READY...";
        let i=0;
        function type() { if(i<txt.length) { txtEl.innerHTML+=txt.charAt(i); i++; setTimeout(type, 100); } }
        setTimeout(type, 500);
    }

    // ===========================
    // 4. МИССИИ И МОДАЛКИ
    // ===========================
    if(document.getElementById('tours-page')) {
        const btns = document.querySelectorAll('.open-modal');
        const backdrop = document.getElementById('modal-backdrop');
        const closers = document.querySelectorAll('.close-modal');
        const search = document.getElementById('search-input');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.cyber-card');

        // Модалки
        btns.forEach(btn => btn.addEventListener('click', e => {
            const id = btn.dataset.target;
            document.getElementById(id).classList.add('open');
            backdrop.classList.add('open');
            playTone(500, 'sine', 0.1);
        }));
        closers.forEach(c => c.addEventListener('click', () => {
            document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
            backdrop.classList.remove('open');
        }));

        // Поиск и Фильтр
        function filterCards() {
            const q = search.value.toLowerCase();
            const cat = document.querySelector('.filter-btn.active').dataset.filter;
            cards.forEach(c => {
                const match = c.dataset.title.toLowerCase().includes(q) && (cat === 'all' || cat === c.dataset.cat);
                c.style.display = match ? 'flex' : 'none';
            });
        }
        search.addEventListener('input', () => { filterCards(); playTone(800, 'sine', 0.02); });
        filterBtns.forEach(b => b.addEventListener('click', function() {
            filterBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterCards();
        }));
    }

    // ===========================
    // 5. КОНТАКТЫ
    // ===========================
    if(document.getElementById('contacts-page')) {
        const sendBtn = document.getElementById('send-btn');
        const inputs = document.querySelectorAll('input');
        const log = document.getElementById('status-log');
        
        sendBtn.addEventListener('click', () => {
            let valid = true;
            inputs.forEach(i => { if(!i.value) valid = false; });
            
            if(valid) {
                log.innerHTML = "<span style='color:#0f0'>СОЕДИНЕНИЕ УСТАНОВЛЕНО</span>";
                playTone(1000, 'sine', 0.4);
                inputs.forEach(i => i.value = '');
            } else {
                log.innerHTML = "<span style='color:#f00'>ОШИБКА: НЕТ ДАННЫХ</span>";
                playTone(150, 'sawtooth', 0.3);
            }
        });
    }

    // Курсор
    const dot = document.querySelector('.cursor-dot');
    const circle = document.querySelector('.cursor-circle');
    document.addEventListener('mousemove', e => {
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
        setTimeout(() => { circle.style.left = e.clientX + 'px'; circle.style.top = e.clientY + 'px'; }, 50);
    });
    document.querySelectorAll('a, button, input, .cyber-card').forEach(el => {
        el.addEventListener('mouseenter', () => { circle.classList.add('hovered'); playTone(300, 'triangle', 0.02); });
        el.addEventListener('mouseleave', () => circle.classList.remove('hovered'));
    });
});