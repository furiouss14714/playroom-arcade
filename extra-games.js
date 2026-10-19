(() => {
  const meta = {
    clicker: ['COIN CLICKER', '16 / IDLE', 'Tap, buy upgrades, collect skins, and rebirth for permanent power. Your progress saves automatically.'],
    wordle: ['FIVE LETTER', '17 / WORDS', 'Guess the five-letter word in six tries. Green is right spot; gold is in the word.'],
    blackjack: ['BLACKJACK', '18 / CHANCE', 'Try to beat the dealer without going over 21.'],
    pong: ['PONG DUEL', '19 / ARCADE', 'Move with W/S or ↑/↓. The ball moves at a gentler pace and only speeds up a little after paddle hits. First to five wins.'],
    breakout: ['BRICK BREAKER', '20 / ARCADE', 'Move with ←/→ or A/D. Break every brick without dropping the ball.'],
    higherlower: ['HIGHER OR LOWER', '21 / CHANCE', 'Guess if the next card will be higher or lower. Build the longest streak.'],
    diceduel: ['DICE DUEL', '22 / CHANCE', 'Roll against the arcade. First to three wins the match.'],
    colormatch: ['COLOR CHECK', '23 / REFLEX', 'Decide if the color of the word matches the word itself. Score before time runs out.'],
    sequence: ['NUMBER SEQUENCE', '24 / MEMORY', 'Memorize each number string and type it back. How long can you last?'],
    targettap: ['TARGET TAP', '25 / ACTION', 'Tap the moving star as many times as you can in twenty seconds.'],
    patternlock: ['PATTERN LOCK', '26 / MEMORY', 'Watch the glowing path, then repeat it in order. Each round adds another step.'],
    dodgedrop: ['DODGE DROP', '27 / ACTION', 'Move left and right to dodge the falling blocks. The pace rises as you survive. Use arrow keys or A and D.'],
    oddoneout: ['ODD ONE OUT', '28 / FOCUS', 'Find the one symbol that is different. Each round gets a little busier.'],
    kingdom: ['CROWN & COUNTRY', '29 / STRATEGY', 'Rule a growing realm: house citizens, assign work, build vital structures, collect taxes, and defend against rival kingdoms.']
  };
  const modal = document.getElementById('game-modal');
  const board = document.getElementById('game-board');
  const status = document.getElementById('game-status');
  const controls = document.getElementById('game-controls');
  const title = document.getElementById('game-name');
  const category = document.getElementById('game-category');
  const instructions = document.getElementById('game-instructions');
  const $ = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const button = (label, fn, secondary = false) => { const b = $('button', `control-btn${secondary ? ' secondary' : ''}`, label); b.onclick = fn; controls.append(b); return b; };
  function open(id) {
    const info = meta[id]; if (!info) return;
    title.textContent = info[0]; category.textContent = info[1]; instructions.textContent = info[2];
    board.innerHTML = ''; status.textContent = ''; controls.innerHTML = '';
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
    const cleanup = ({ clicker: clicker, wordle: wordle, blackjack: blackjack, pong: pong, breakout: breakout, higherlower: higherlower, diceduel: diceduel, colormatch: colormatch, sequence: sequence, targettap: targettap, patternlock: patternlock, dodgedrop: dodgedrop, oddoneout: oddoneout, kingdom: kingdom })[id]();
    window.__extraGameCleanup = cleanup || (() => {});
  }
  window.addEventListener('playroom:open-extra', e => open(e.detail));

  function clicker() {
    const key = 'playroom.clicker.v1';
    const defaults = { coins: 0, power: 1, powerLevel: 0, auto: 0, multiplierLevel: 0, luckyLevel: 0, turboLevel: 0, megaLevel: 0, autoBoostLevel: 0, criticalLevel: 0, growthLevel: 0, rebirths: 0, owned: ['classic'], skin: 'classic' };
    let data;
    try { data = { ...defaults, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { data = { ...defaults }; }
    data.owned = Array.isArray(data.owned) ? data.owned : ['classic'];
    if (!data.owned.includes('classic')) data.owned.unshift('classic');
    ['coins', 'powerLevel', 'auto', 'multiplierLevel', 'luckyLevel', 'turboLevel', 'megaLevel', 'autoBoostLevel', 'criticalLevel', 'growthLevel', 'rebirths'].forEach(k => { if (!Number.isFinite(data[k]) || data[k] < 0) data[k] = defaults[k]; });
    if (!Number.isFinite(data.power) || data.power < 1) data.power = 1;
    const skins = [
      { id: 'classic', name: 'CLASSIC', cost: 0, face: '🟡' },
      { id: 'peach', name: 'PEACH', cost: 100, face: '🍑' },
      { id: 'ocean', name: 'OCEAN', cost: 250, face: '🔵' },
      { id: 'grape', name: 'GRAPE', cost: 500, face: '🍇' },
      { id: 'sunset', name: 'SUNSET', cost: 750, face: '🌅' },
      { id: 'mint', name: 'MINT', cost: 1100, face: '🌿' },
      { id: 'cosmic', name: 'COSMIC', cost: 1600, face: '🌌' },
      { id: 'cherry', name: 'CHERRY', cost: 2400, face: '🍒' },
      { id: 'gold', name: 'GOLD', cost: 4000, face: '🌟' },
      { id: 'aurora', name: 'AURORA', cost: 6000, face: '🌈' },
      { id: 'neon', name: 'NEON', cost: 8500, face: '💚' },
      { id: 'frost', name: 'FROST', cost: 12000, face: '🧊' },
      { id: 'lava', name: 'LAVA', cost: 17000, face: '🌋' },
      { id: 'tiger', name: 'TIGER', cost: 24000, face: '🐯' },
      { id: 'starlight', name: 'STARLIGHT', cost: 35000, face: '✨' }
    ];
    let bonusTimer, bonusExpiry, frenzyTimer, activeBonus = null, frenzyUntil = 0;
    const wrap = $('div', 'clicker-wrap');
    const wallet = $('div', 'clicker-wallet');
    const coinCount = $('strong', 'clicker-count');
    const coinLabel = $('span', 'clicker-caption', 'COINS');
    wallet.append(coinCount, coinLabel);
    const coin = $('button', `coin-button skin-${data.skin}`);
    coin.type = 'button'; coin.setAttribute('aria-label', 'Tap to earn coins');
    coin.innerHTML = '<span class="coin-face"></span><span class="coin-tap">TAP!</span>';
    const bonus = $('button', 'clicker-event');
    bonus.type = 'button';
    bonus.setAttribute('aria-label', '');
    bonus.hidden = true;
    const shop = $('div', 'clicker-shop');
    const upgradeHeading = $('h3', '', 'UPGRADES');
    const upgrades = [
      { name: 'CLICK POWER', info: '+1 PER TAP', level: () => data.powerLevel, cost: () => 25 + data.powerLevel * 30, buy: () => { data.powerLevel++; data.power++; } },
      { name: 'AUTO CLICK', info: '+1 PER SEC', level: () => data.auto, cost: () => Math.round(60 * Math.pow(1.65, data.auto)), buy: () => { data.auto++; } },
      { name: 'COIN MULTIPLIER', info: '2× TAP VALUE', level: () => data.multiplierLevel, cost: () => Math.round(400 * Math.pow(2.1, data.multiplierLevel)), buy: () => { data.multiplierLevel++; } },
      { name: 'LUCKY TAP', info: '+5% CHANCE FOR 5×', level: () => data.luckyLevel, cost: () => Math.round(250 * Math.pow(1.9, data.luckyLevel)), buy: () => { data.luckyLevel++; } },
      { name: 'AUTO TURBO', info: '+5 PER SEC', level: () => data.turboLevel, cost: () => Math.round(900 * Math.pow(2, data.turboLevel)), buy: () => { data.turboLevel++; } },
      { name: 'MEGA CLICK', info: '+5 PER TAP', level: () => data.megaLevel, cost: () => Math.round(300 * Math.pow(1.75, data.megaLevel)), buy: () => { data.megaLevel++; data.power += 5; } },
      { name: 'AUTO BOOST', info: '+20 PER SEC', level: () => data.autoBoostLevel, cost: () => Math.round(2200 * Math.pow(1.85, data.autoBoostLevel)), buy: () => { data.autoBoostLevel++; } },
      { name: 'CRITICAL TAP', info: '+2% CHANCE FOR 25×', level: () => data.criticalLevel, cost: () => Math.round(1400 * Math.pow(1.8, data.criticalLevel)), buy: () => { data.criticalLevel++; } },
      { name: 'COIN GROWTH', info: '+10% ALL INCOME', level: () => data.growthLevel, cost: () => Math.round(3200 * Math.pow(1.9, data.growthLevel)), buy: () => { data.growthLevel++; } }
    ];
    const upgradeButtons = upgrades.map(() => $('button', 'shop-button'));
    const rebirthHeading = $('h3', '', 'REBIRTH');
    const rebirthButton = $('button', 'shop-button rebirth-button');
    const skinHeading = $('h3', '', 'SKINS');
    const skinList = $('div', 'skin-list');
    shop.append(upgradeHeading, ...upgradeButtons, rebirthHeading, rebirthButton, skinHeading, skinList);
    wrap.append(wallet, coin, bonus, shop); board.append(wrap);
    function save() { localStorage.setItem(key, JSON.stringify(data)); }
    function paint() {
      coinCount.textContent = Math.floor(data.coins).toLocaleString();
      coinLabel.textContent = `COINS · REBIRTH ${data.rebirths}`;
      coin.className = `coin-button skin-${data.skin}`;
      coin.classList.toggle('frenzy-active', frenzyUntil > Date.now());
      coin.querySelector('.coin-face').textContent = skins.find(s => s.id === data.skin)?.face || '🟡';
      upgrades.forEach((u, i) => {
        const cost = u.cost(), b = upgradeButtons[i];
        b.innerHTML = `${u.name}<b>${u.info}</b><small>LV ${u.level()} · ${cost.toLocaleString()} COINS</small>`;
        b.disabled = data.coins < cost;
        b.onclick = () => { if (data.coins < cost) return; data.coins -= cost; u.buy(); paint(); status.textContent = `${u.name} UPGRADED!`; };
      });
      const rebirthCost = Math.round(25000 * Math.pow(6, data.rebirths));
      rebirthButton.innerHTML = `REBIRTH ${data.rebirths + 1}<b>RESET COINS & UPGRADES · PERMANENT 2×</b><small>${rebirthCost.toLocaleString()} COINS REQUIRED</small>`;
      rebirthButton.disabled = data.coins < rebirthCost;
      rebirthButton.onclick = () => {
        if (data.coins < rebirthCost) return;
        data.coins = 0; data.power = 1; data.rebirths++;
        ['powerLevel','auto','multiplierLevel','luckyLevel','turboLevel','megaLevel','autoBoostLevel','criticalLevel','growthLevel'].forEach(level => { data[level] = 0; });
        paint(); status.textContent = `REBIRTH ${data.rebirths}! YOUR PERMANENT MULTIPLIER IS NOW ${Math.pow(2, data.rebirths)}×`;
        coin.classList.remove('rebirth-pop'); void coin.offsetWidth; coin.classList.add('rebirth-pop');
      };
      skinList.innerHTML = '';
      skins.forEach(s => {
        const b = $('button', `skin-choice skin-${s.id}${data.skin === s.id ? ' selected' : ''}`);
        b.innerHTML = `<span>${s.face}</span><small>${data.owned.includes(s.id) ? (data.skin === s.id ? 'EQUIPPED' : 'USE SKIN') : `${s.cost} COINS`}</small>`;
        b.disabled = !data.owned.includes(s.id) && data.coins < s.cost;
        b.onclick = () => { if (data.owned.includes(s.id)) data.skin = s.id; else { data.coins -= s.cost; data.owned.push(s.id); data.skin = s.id; } save(); paint(); };
        skinList.append(b);
      });
      save();
    }
    function baseTap() {
      return data.power * Math.pow(2, data.multiplierLevel) * Math.pow(2, Math.min(20, data.rebirths)) * Math.pow(1.1, data.growthLevel);
    }
    function earnTap() {
      const prestige = Math.pow(2, Math.min(20, data.rebirths));
      const growth = Math.pow(1.1, data.growthLevel);
      const base = data.power * Math.pow(2, data.multiplierLevel) * prestige * growth * (frenzyUntil > Date.now() ? 6 : 1);
      const critical = Math.random() < Math.min(0.5, data.criticalLevel * 0.02);
      const lucky = !critical && Math.random() < Math.min(0.5, data.luckyLevel * 0.05);
      const earned = Math.round(base * (critical ? 25 : lucky ? 5 : 1));
      data.coins += earned; paint();
      status.textContent = frenzyUntil > Date.now() ? `CLICKING FRENZY ×6! +${earned} COINS` : critical ? `CRITICAL TAP! +${earned} COINS` : lucky ? `LUCKY TAP! +${earned} COINS` : `+${earned} COINS`;
      const burst = $('span', 'coin-float', `+${earned}`); wrap.append(burst); setTimeout(() => burst.remove(), 850);
      coin.classList.remove('coin-pop'); void coin.offsetWidth; coin.classList.add('coin-pop');
    }
    coin.onclick = earnTap;
    function scheduleBonus(delay = 25000 + Math.random() * 35000) {
      clearTimeout(bonusTimer);
      bonusTimer = setTimeout(() => {
        if (activeBonus || frenzyUntil > Date.now()) return scheduleBonus(10000);
        activeBonus = Math.random() < .52 ? 'frenzy' : 'jackpot';
        bonus.setAttribute('aria-label', activeBonus === 'frenzy' ? 'Collect the clicking frenzy power-up' : 'Collect the rare coin bonus');
        bonus.innerHTML = activeBonus === 'frenzy'
          ? '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="#ffe978" stroke="#17181b" stroke-width="2.5"/><path d="m27 5-14 23h10l-2 15 15-24H26z" fill="#ff704d" stroke="#17181b" stroke-width="2" stroke-linejoin="round"/></svg>'
          : '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="#9df2d2" stroke="#17181b" stroke-width="2.5"/><circle cx="24" cy="24" r="15" fill="#ffe978" stroke="#17181b" stroke-width="2"/><path d="m24 12 3.5 7.3 8 .9-5.9 5.4 1.6 7.8-7.2-3.9-7.2 3.9 1.6-7.8-5.9-5.4 8-.9z" fill="#ff985c" stroke="#17181b" stroke-width="1.5" stroke-linejoin="round"/></svg>';
        bonus.hidden = false;
        bonusExpiry = setTimeout(() => { activeBonus = null; bonus.hidden = true; scheduleBonus(); }, 14000);
      }, delay);
    }
    bonus.onclick = () => {
      if (!activeBonus) return;
      clearTimeout(bonusExpiry);
      bonus.hidden = true;
      if (activeBonus === 'jackpot') {
        const earned = Math.max(75, Math.round(baseTap() * (30 + Math.floor(Math.random() * 41))));
        data.coins += earned; status.textContent = `LUCKY DROP! +${earned.toLocaleString()} COINS`;
        const burst = $('span', 'coin-float', `+${earned.toLocaleString()}`); wrap.append(burst); setTimeout(() => burst.remove(), 1000);
        paint();
      } else if (activeBonus === 'frenzy') {
        frenzyUntil = Date.now() + 10000; clearInterval(frenzyTimer);
        status.textContent = 'CLICKING FRENZY ×6 — TAP FAST!'; paint();
        frenzyTimer = setInterval(() => {
          const left = Math.max(0, Math.ceil((frenzyUntil - Date.now()) / 1000));
          if (!left) { clearInterval(frenzyTimer); frenzyUntil = 0; paint(); scheduleBonus(); }
        }, 200);
      }
      activeBonus = null;
      if (frenzyUntil <= Date.now()) scheduleBonus();
    };
    scheduleBonus();
    const timer = setInterval(() => { const income = Math.round((data.auto + data.turboLevel * 5 + data.autoBoostLevel * 20) * Math.pow(2, Math.min(20, data.rebirths)) * Math.pow(1.1, data.growthLevel)); if (income) { data.coins += income; paint(); } }, 1000);
    paint(); status.textContent = 'UPGRADES, SKINS & REBIRTHS SAVE ON THIS DEVICE';
    return () => { clearInterval(timer); clearTimeout(bonusTimer); clearTimeout(bonusExpiry); clearInterval(frenzyTimer); };
  }

  function higherlower() {
    const suits = ['♥', '♦', '♣', '♠'];
    const face = value => ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }[value] || value);
    let current = 1 + Math.floor(Math.random() * 13), streak = 0, best = Number(localStorage.getItem('playroom.higherlower.best') || 0);
    const row = $('div', 'higher-lower-row');
    const card = $('div', 'higher-lower-card');
    const next = $('div', 'higher-lower-next', '?');
    let suit = suits[Math.floor(Math.random() * suits.length)];
    const score = $('div', 'higher-lower-score');
    row.append(card, $('span', '', '→'), next); board.append(row, score);
    function paint() {
      card.textContent = `${face(current)} ${suit}`;
      card.className = `higher-lower-card ${suit === '♥' || suit === '♦' ? 'red' : ''}`;
      score.textContent = `STREAK ${streak} · BEST ${best}`;
    }
    function guess(direction) {
      const previous = current;
      current = 1 + Math.floor(Math.random() * 13);
      suit = suits[Math.floor(Math.random() * suits.length)];
      next.textContent = `${face(current)} ${suit}`;
      const correct = current === previous || (direction === 'higher' ? current > previous : current < previous);
      if (correct) { streak++; best = Math.max(best, streak); localStorage.setItem('playroom.higherlower.best', String(best)); status.textContent = current === previous ? 'A TIE! STREAK SAVED.' : 'NICE PICK!'; }
      else { status.textContent = `STREAK ENDED AT ${streak}. TRY AGAIN!`; streak = 0; }
      paint();
    }
    button('HIGHER ▲', () => guess('higher'));
    button('LOWER ▼', () => guess('lower'), true);
    paint(); status.textContent = 'PICK THE NEXT CARD';
  }

  function diceduel() {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    let player = 0, arcade = 0, round = 0, ended = false;
    const wrap = $('div', 'dice-duel');
    const dice = $('div', 'dice-pair');
    const score = $('div', 'dice-score');
    wrap.append(dice, score); board.append(wrap);
    const rollButton = button('ROLL DICE 🎲', roll);
    function paint(a = 0, b = 0) {
      dice.innerHTML = `<span>${faces[a]}</span><span>${faces[b]}</span>`;
      score.textContent = `YOU ${player} · ${arcade} ARCADE`;
      rollButton.disabled = ended;
    }
    function roll() {
      if (ended) return;
      const a = Math.floor(Math.random() * 6), b = Math.floor(Math.random() * 6);
      round++;
      if (a > b) player++; else if (b > a) arcade++;
      if (player === 3 || arcade === 3) ended = true;
      paint(a, b);
      status.textContent = ended ? (player > arcade ? 'YOU WIN THE DUEL!' : 'THE ARCADE TAKES IT!') : `ROUND ${round} · ${a === b ? 'TIE ROUND' : a > b ? 'YOUR POINT' : 'ARCADE POINT'}`;
    }
    button('NEW MATCH ↻', () => { player = 0; arcade = 0; round = 0; ended = false; paint(); status.textContent = 'FIRST TO THREE WINS'; }, true);
    paint(); status.textContent = 'FIRST TO THREE WINS';
  }

  function colormatch() {
    const colors = [{ name: 'RED', hex: '#ed4966' }, { name: 'BLUE', hex: '#4264d5' }, { name: 'GREEN', hex: '#44945a' }, { name: 'PURPLE', hex: '#8c55bd' }];
    let score = 0, seconds = 20, ended = false, word, ink;
    const prompt = $('div', 'color-match-prompt');
    const clock = $('div', 'color-match-clock');
    board.append(prompt, clock);
    function next() { word = colors[Math.floor(Math.random() * colors.length)]; ink = colors[Math.floor(Math.random() * colors.length)]; prompt.textContent = word.name; prompt.style.color = ink.hex; }
    function answer(saysMatch) {
      if (ended) return;
      if ((word.name === ink.name) === saysMatch) { score++; status.textContent = 'GOOD EYE!'; } else { score = Math.max(0, score - 1); status.textContent = 'NOT QUITE — KEEP GOING'; }
      next(); clock.textContent = `SCORE ${score} · ${seconds} SEC`;
    }
    button('MATCH ✓', () => answer(true)); button('NO MATCH ✕', () => answer(false), true);
    next(); clock.textContent = `SCORE 0 · ${seconds} SEC`;
    const timer = setInterval(() => {
      seconds--; clock.textContent = `SCORE ${score} · ${seconds} SEC`;
      if (seconds <= 0) { ended = true; clearInterval(timer); status.textContent = `TIME! YOU SCORED ${score}.`; }
    }, 1000);
    status.textContent = 'DOES THE WORD MATCH ITS COLOR?';
    return () => clearInterval(timer);
  }

  function sequence() {
    let digits = '', level = 3, locked = true, revealTimer;
    const display = $('div', 'sequence-display');
    const input = $('input', 'arcade-input');
    input.inputMode = 'numeric'; input.maxLength = 14; input.placeholder = 'TYPE THE NUMBERS'; input.setAttribute('aria-label', 'Type the number sequence');
    board.append(display, input);
    const submit = button('CHECK ↵', check);
    function round() {
      locked = true; input.value = ''; input.disabled = true; submit.disabled = true;
      digits = Array.from({ length: level }, () => Math.floor(Math.random() * 10)).join('');
      display.textContent = digits; status.textContent = `LEVEL ${level} · MEMORIZE`;
      revealTimer = setTimeout(() => { display.textContent = '• '.repeat(level).trim(); input.disabled = false; submit.disabled = false; input.focus(); locked = false; status.textContent = 'NOW TYPE THE SEQUENCE'; }, Math.max(1200, 650 + level * 260));
    }
    function check() {
      if (locked || !input.value) return;
      locked = true;
      if (input.value === digits) { level++; display.textContent = '✓'; status.textContent = 'PERFECT! NEXT LEVEL…'; setTimeout(round, 700); }
      else { display.textContent = digits; status.textContent = `OOPS! LEVEL ${level}. TRY AGAIN.`; level = 3; button('PLAY AGAIN ↻', round, true); }
    }
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    round();
    return () => clearTimeout(revealTimer);
  }

  function targettap() {
    let hits = 0, seconds = 20, ended = false, target = Math.floor(Math.random() * 9), timer;
    const grid = $('div', 'target-grid'), clock = $('div', 'target-clock');
    const star = $('span', 'target-star-icon', '✳'), cells = [];
    board.append(grid, clock);
    const replay = button('PLAY AGAIN ↻', start, true); replay.hidden = true;
    for (let i = 0; i < 9; i++) {
      const cell = $('button', 'target-cell');
      cell.setAttribute('aria-label', 'Empty target'); cell.disabled = ended;
      cell.onclick = () => {
        if (ended || i !== target) return;
        const oldRect = star.getBoundingClientRect();
        hits++; target = Math.floor(Math.random() * 9); if (target === i) target = (target + 1) % 9;
        paint(oldRect); clock.textContent = `${hits} HITS · ${seconds} SEC`;
      };
      cells.push(cell); grid.append(cell);
    }
    function paint(oldRect = null) {
      cells.forEach((cell, i) => {
        cell.classList.toggle('target-active', i === target);
        cell.setAttribute('aria-label', i === target ? 'Tap the star target' : 'Empty target'); cell.disabled = ended;
      });
      const destination = cells[target];
      if (destination && star.parentElement !== destination) {
        const from = oldRect || (star.isConnected ? star.getBoundingClientRect() : null);
        destination.append(star);
        if (from) {
          const to = star.getBoundingClientRect(), dx = from.left - to.left, dy = from.top - to.top;
          star.style.transition = 'none'; star.style.transform = `translate(${dx}px,${dy}px)`; star.getBoundingClientRect();
          requestAnimationFrame(() => { star.style.transition = ''; star.style.transform = ''; });
        }
      }
    }
    function start() {
      clearInterval(timer); hits = 0; seconds = 20; ended = false; target = Math.floor(Math.random() * 9);
      replay.hidden = true; paint(); clock.textContent = '0 HITS · 20 SEC'; status.textContent = 'CATCH THE STAR!';
      timer = setInterval(() => {
        seconds--; clock.textContent = `${hits} HITS · ${seconds} SEC`;
        if (seconds <= 0) { ended = true; clearInterval(timer); paint(); replay.hidden = false; status.textContent = `TIME! YOU CAUGHT ${hits} STARS.`; }
      }, 1000);
    }
    start(); return () => clearInterval(timer);
  }

  function patternlock() {
    const pads = Array.from({ length: 9 }, (_, i) => $('button', 'pattern-pad'));
    const grid = $('div', 'pattern-grid'); pads.forEach((pad, i) => { pad.setAttribute('aria-label', `Pattern tile ${i + 1}`); grid.append(pad); });
    board.append(grid);
    let sequence = [], position = 0, locked = true, timers = new Set();
    const later = (fn, ms) => { const timer = setTimeout(() => { timers.delete(timer); fn(); }, ms); timers.add(timer); };
    function flash(index) { const pad = pads[index]; pad.classList.add('lit'); later(() => pad.classList.remove('lit'), 300); }
    function nextRound() {
      sequence.push(Math.floor(Math.random() * pads.length)); position = 0; locked = true;
      status.textContent = `ROUND ${sequence.length} · WATCH THE PATTERN`;
      sequence.forEach((index, i) => later(() => { flash(index); if (i === sequence.length - 1) later(() => { locked = false; status.textContent = 'YOUR TURN — REPEAT THE PATTERN'; }, 380); }, 500 + i * 600));
    }
    pads.forEach((pad, i) => { pad.onclick = () => {
      if (locked) return;
      flash(i);
      if (i !== sequence[position]) { locked = true; status.textContent = `PATTERN BROKE AT ROUND ${sequence.length}.`; button('TRY AGAIN ↻', start, true); return; }
      position++;
      if (position === sequence.length) { locked = true; status.textContent = 'PERFECT! NEXT PATTERN…'; later(nextRound, 700); }
    }; });
    function start() { timers.forEach(clearTimeout); timers.clear(); pads.forEach(pad => pad.classList.remove('lit')); sequence = []; position = 0; nextRound(); }
    button('START OVER ↻', start, true); start();
    return () => timers.forEach(clearTimeout);
  }

  function dodgedrop() {
    const columns = 7, rows = 7, slots = [], rocks = new Map(); let player = 3, nextId = 0, score = 0, dodged = 0, timer, ended = false;
    const grid = $('div', 'dodge-grid'); board.append(grid);
    for (let i = 0; i < columns * rows; i++) { const slot = $('div', 'dodge-slot'); slots.push(slot); grid.append(slot); }
    const runner = $('span', 'dodge-player', '◆'); slots[(rows - 1) * columns + player].append(runner);
    function move(node, slot) {
      const from = node.isConnected ? node.getBoundingClientRect() : null;
      slot.append(node);
      if (from) {
        const to = node.getBoundingClientRect(), dx = from.left - to.left, dy = from.top - to.top;
        if (dx || dy) { node.style.transition = 'none'; node.style.transform = `translate(${dx}px,${dy}px)`; node.getBoundingClientRect(); requestAnimationFrame(() => { node.style.transition = ''; node.style.transform = ''; }); }
      }
    }
    function paint() {
      move(runner, slots[(rows - 1) * columns + player]);
      for (const [id, rock] of rocks) { if (rock.row >= rows) { rock.node.remove(); rocks.delete(id); dodged++; continue; } move(rock.node, slots[rock.row * columns + rock.column]); }
    }
    function finish() { ended = true; clearInterval(timer); status.textContent = `CRASH AFTER ${score} STEPS · ${dodged} BLOCKS DODGED.`; }
    function step() {
      if (ended) return;
      for (const rock of rocks.values()) rock.row++;
      if (Math.random() < .82) { const column = Math.floor(Math.random() * columns), id = nextId++; const node = $('span', 'dodge-rock', '■'); rocks.set(id, { id, column, row: 0, node }); }
      if ([...rocks.values()].some(rock => rock.row === rows - 1 && rock.column === player)) { paint(); finish(); return; }
      score++; paint(); status.textContent = `SURVIVED ${score} STEPS · SPEED ${Math.min(5, 1 + Math.floor(score / 15))} · AVOID THE RED`;
      clearInterval(timer); timer = setInterval(step, Math.max(340, 560 - Math.floor(score / 15) * 42));
    }
    const onKey = e => { const key = e.key.toLowerCase(); if (!['arrowleft','arrowright','a','d'].includes(key)) return; e.preventDefault(); if (ended) return; player = Math.max(0, Math.min(columns - 1, player + (key === 'arrowleft' || key === 'a' ? -1 : 1))); paint(); };
    window.addEventListener('keydown', onKey);
    const left = button('◀ LEFT', () => { if (!ended) { player = Math.max(0, player - 1); paint(); } }, true);
    const right = button('RIGHT ▶', () => { if (!ended) { player = Math.min(columns - 1, player + 1); paint(); } }, true);
    button('PLAY AGAIN ↻', start);
    function start() { clearInterval(timer); rocks.forEach(rock => rock.node.remove()); rocks.clear(); player = 3; score = 0; dodged = 0; ended = false; paint(); status.textContent = 'READY — DODGE THE FALLING BLOCKS'; timer = setInterval(step, 560); }
    start(); return () => { clearInterval(timer); window.removeEventListener('keydown', onKey); };
  }

  function oddoneout() {
    const grid = $('div', 'odd-grid'); board.append(grid);
    const symbols = ['●','■','▲','✦']; let level = 1, size = 3, odd = 0;
    function round() {
      size = Math.min(6, 3 + Math.floor((level - 1) / 3)); const total = size * size;
      const common = symbols[Math.floor(Math.random() * symbols.length)]; let different; do { different = symbols[Math.floor(Math.random() * symbols.length)]; } while (different === common);
      odd = Math.floor(Math.random() * total); grid.style.setProperty('--odd-size', size); grid.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const cell = $('button', 'odd-cell', i === odd ? different : common); cell.setAttribute('aria-label', i === odd ? 'Odd symbol' : 'Matching symbol');
        cell.onclick = () => { if (i === odd) { level++; status.textContent = `NICE SPOT! LEVEL ${level}`; round(); } else { status.textContent = `NOT THAT ONE — YOU REACHED LEVEL ${level}`; buttons.forEach(b => b.disabled = true); replay.hidden = false; } };
        grid.append(cell);
      }
      buttons = [...grid.children]; status.textContent = `LEVEL ${level} · FIND THE DIFFERENT SYMBOL`;
    }
    let buttons = [];
    const replay = button('PLAY AGAIN ↻', () => { level = 1; replay.hidden = true; round(); }, true); replay.hidden = true;
    round();
  }

  function wordle() {
    const words = ['APPLE','BRICK','CHAIR','DREAM','FLAME','GRAPE','HOUSE','JUICE','KNIFE','LEMON','MOUSE','NIGHT','OCEAN','PLANT','QUIET','ROBOT','SHEEP','TIGER','WATER','ZEBRA'];
    const answer = words[Math.floor(Math.random() * words.length)];
    let guesses = [], current = '', ended = false;
    const grid = $('div', 'wordle-grid');
    const keyboard = $('div', 'wordle-keyboard');
    const keys = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
    function paint() {
      grid.innerHTML = '';
      for (let r = 0; r < 6; r++) {
        const guess = guesses[r] || (r === guesses.length ? current : '');
        const marks = guesses[r] ? evaluate(guesses[r]) : [];
        for (let c = 0; c < 5; c++) {
          const cell = $('div', `wordle-cell${marks[c] ? ` ${marks[c]}` : guess[c] ? ' filled' : ''}`, guess[c] || '');
          grid.append(cell);
        }
      }
      keyboard.innerHTML = '';
      keys.forEach(ch => { const b = $('button', 'wordle-key', ch); b.onclick = () => key(ch); keyboard.append(b); });
      [['ENTER','enter'],['⌫','back']].forEach(([label, action]) => { const b = $('button', 'wordle-key wordle-wide', label); b.onclick = () => action === 'enter' ? submit() : key('BACKSPACE'); keyboard.append(b); });
    }
    function evaluate(word) {
      const marks = Array(5).fill('absent'), remaining = {};
      for (let i = 0; i < 5; i++) { if (word[i] === answer[i]) marks[i] = 'correct'; else remaining[answer[i]] = (remaining[answer[i]] || 0) + 1; }
      for (let i = 0; i < 5; i++) if (marks[i] !== 'correct' && remaining[word[i]]) { marks[i] = 'present'; remaining[word[i]]--; }
      return marks;
    }
    function key(k) { if (ended) return; if (k === 'BACKSPACE') current = current.slice(0, -1); else if (/^[A-Z]$/.test(k) && current.length < 5) current += k; paint(); }
    function submit() {
      if (ended) return;
      if (current.length !== 5) { status.textContent = 'ENTER FIVE LETTERS FIRST'; return; }
      guesses.push(current); const won = current === answer; current = ''; paint();
      if (won) { ended = true; status.textContent = `GOT IT IN ${guesses.length}!`; }
      else if (guesses.length === 6) { ended = true; status.textContent = `THE WORD WAS ${answer}`; }
      else status.textContent = `${6 - guesses.length} GUESSES LEFT`;
    }
    const onKey = e => { if (modal.classList.contains('open') && title.textContent === 'FIVE LETTER') { if (e.key === 'Enter') submit(); else if (e.key === 'Backspace') key('BACKSPACE'); else key(e.key.toUpperCase()); } };
    window.addEventListener('keydown', onKey);
    board.append(grid); controls.append(keyboard); paint(); status.textContent = 'TYPE A WORD, THEN PRESS ENTER';
    return () => window.removeEventListener('keydown', onKey);
  }

  function blackjack() {
    const deck = [];
    let player = [], dealer = [], done = true;
    const area = $('div', 'blackjack-table'); const dealerArea = $('div', 'hand-area'); const playerArea = $('div', 'hand-area');
    const dealerLabel = $('div', 'hand-label', 'DEALER'); const playerLabel = $('div', 'hand-label', 'YOU');
    area.append(dealerLabel, dealerArea, playerLabel, playerArea); board.append(area);
    const values = c => c.rank === 'A' ? 11 : ['K','Q','J'].includes(c.rank) ? 10 : +c.rank;
    function total(hand) { let sum = hand.reduce((a,c)=>a+values(c),0), aces=hand.filter(c=>c.rank==='A').length; while(sum>21&&aces-- >0)sum-=10; return sum; }
    function drawCard() { return deck.pop(); }
    function newDeck() { for (const suit of ['♠','♥','♦','♣']) for (const rank of ['A','2','3','4','5','6','7','8','9','10','J','Q','K']) deck.push({rank,suit}); deck.sort(()=>Math.random()-.5); }
    function paint(hideDealer = false) {
      dealerArea.innerHTML=''; playerArea.innerHTML='';
      dealer.forEach((c,i)=>dealerArea.append($('span',`playing-card${(c.suit==='♥'||c.suit==='♦')?' red':''}`,hideDealer&&i===1?'?':`${c.rank}${c.suit}`)));
      player.forEach(c=>playerArea.append($('span',`playing-card${(c.suit==='♥'||c.suit==='♦')?' red':''}`,`${c.rank}${c.suit}`)));
      dealerLabel.textContent=`DEALER${hideDealer?'':` · ${total(dealer)}`}`; playerLabel.textContent=`YOU · ${total(player)}`;
    }
    function roundOver(message) { done=true; paint(false); status.textContent=message; controls.innerHTML=''; button('DEAL AGAIN ↻',start,true); }
    function start() { controls.innerHTML=''; newDeck(); player=[drawCard(),drawCard()]; dealer=[drawCard(),drawCard()]; done=false; paint(true); status.textContent='HIT OR STAND'; button('HIT',hit); button('STAND',stand,true); }
    function hit() { if(done)return; player.push(drawCard()); paint(true); const t=total(player); if(t>21)roundOver(`BUST — ${t}. DEALER WINS.`); else if(t===21)stand(); }
    function stand() { if(done)return; done=true; while(total(dealer)<17)dealer.push(drawCard()); const p=total(player),d=total(dealer); roundOver(d>21||p>d?`YOU WIN · ${p} TO ${d}`:p===d?`PUSH · BOTH ${p}`:`DEALER WINS · ${d} TO ${p}`); }
    start();
  }

  function pong() {
    const canvas=$('canvas','arcade-canvas'); canvas.width=480; canvas.height=300; board.append(canvas);
    const ctx=canvas.getContext('2d'); let py=120, ay=120, x=240,y=150,vx=2.25,vy=1.1,ps=0,as=0,held={},raf,paused=false;
    function resetBall(toward) { x=240;y=150;vx=toward*2.25;vy=(Math.random()-.5)*2.4; if(Math.abs(vy)<.55)vy=Math.sign(vy||1)*.55; }
    function draw() {
      ctx.fillStyle='#17181b';ctx.fillRect(0,0,480,300);ctx.fillStyle='#f3f1e9';
      for(let yy=8;yy<300;yy+=22)ctx.fillRect(238,yy,4,12);
      ctx.font='bold 32px DM Mono,monospace';ctx.textAlign='center';ctx.fillText(ps,190,43);ctx.fillText(as,290,43);
      ctx.fillRect(18,py,9,60);ctx.fillRect(453,ay,9,60);ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();
    }
    function frame(){if(paused)return; if(held.ArrowUp||held.w)py=Math.max(0,py-5.2);if(held.ArrowDown||held.s)py=Math.min(240,py+5.2);const aiTarget=Math.max(0,Math.min(240,y-30)),aiStep=Math.max(-.92,Math.min(.92,(aiTarget-ay)*.018));ay=Math.max(0,Math.min(240,ay+aiStep));x+=vx;y+=vy;
      if(y<7||y>293)vy*=-1;if(vx<0&&x<32&&y>py-4&&y<py+64){vx=Math.min(3.8,Math.abs(vx)*1.025);vy+=(y-(py+30))*.055;vy=Math.max(-2.8,Math.min(2.8,vy))}
      if(vx>0&&x>448&&y>ay-4&&y<ay+64){vx=-Math.min(3.8,Math.abs(vx)*1.025);vy+=(y-(ay+30))*.055;vy=Math.max(-2.8,Math.min(2.8,vy))}
      if(x<0){as++;resetBall(-1)}if(x>480){ps++;resetBall(1)}draw();
      if(ps>=5||as>=5){paused=true;status.textContent=ps>=5?'YOU WIN THE MATCH!':'ARCADE WINS THIS MATCH';return}raf=requestAnimationFrame(frame);
    }
    const onKey=e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','w','s'].includes(k)){held[k==='arrowup'?'ArrowUp':k==='arrowdown'?'ArrowDown':k]=e.type==='keydown';e.preventDefault();}};
    window.addEventListener('keydown',onKey);window.addEventListener('keyup',onKey);draw();raf=requestAnimationFrame(frame);
    status.textContent='FIRST TO FIVE';
    button('NEW MATCH ↻',()=>{ps=0;as=0;py=ay=120;paused=false;resetBall(Math.random()<.5?1:-1);cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);status.textContent='FIRST TO FIVE'},true);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('keydown',onKey);window.removeEventListener('keyup',onKey)};
  }

  function breakout() {
    const canvas=$('canvas','arcade-canvas');canvas.width=420;canvas.height=300;board.append(canvas);
    const ctx=canvas.getContext('2d');let paddle=170,ball={x:210,y:260,dx:3,dy:-4},bricks=[],keys={},lives=3,running=true,timer;
    function reset(){bricks=[];for(let r=0;r<4;r++)for(let c=0;c<10;c++)bricks.push({x:12+c*40,y:28+r*22,on:true,color:['#ff718d','#859fff','#d9f365','#ffc36b'][r]});paddle=170;ball={x:210,y:260,dx:3,dy:-4};lives=3;running=true;status.textContent='3 LIVES · BREAK EVERY BRICK';draw()}
    function draw(){ctx.fillStyle='#17181b';ctx.fillRect(0,0,420,300);bricks.filter(b=>b.on).forEach(b=>{ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,36,15)});ctx.fillStyle='#f3f1e9';ctx.fillRect(paddle,280,80,8);ctx.beginPath();ctx.arc(ball.x,ball.y,6,0,Math.PI*2);ctx.fill();ctx.font='12px DM Mono,monospace';ctx.fillText(`LIVES ${lives}`,8,292)}
    function tick(){if(!running)return;if(keys.ArrowLeft||keys.a)paddle=Math.max(0,paddle-6);if(keys.ArrowRight||keys.d)paddle=Math.min(340,paddle+6);ball.x+=ball.dx;ball.y+=ball.dy;if(ball.x<6||ball.x>414)ball.dx*=-1;if(ball.y<6)ball.dy=Math.abs(ball.dy);if(ball.y>273&&ball.y<290&&ball.x>paddle-2&&ball.x<paddle+82){ball.dy=-Math.abs(ball.dy);ball.dx=Math.max(-5,Math.min(5,ball.dx+(ball.x-(paddle+40))*.04))}for(const b of bricks)if(b.on&&ball.x>b.x&&ball.x<b.x+36&&ball.y>b.y&&ball.y<b.y+15){b.on=false;ball.dy*=-1;break}if(ball.y>306){lives--;if(lives<=0){running=false;status.textContent='OUT OF LIVES · TRY AGAIN'}else ball={x:210,y:260,dx:3,dy:-4}}if(bricks.every(b=>!b.on)){running=false;status.textContent='ALL CLEAR — YOU WIN!'}draw()}
    const onKey=e=>{const k=e.key.toLowerCase();if(['arrowleft','arrowright','a','d'].includes(k)){keys[k==='arrowleft'?'ArrowLeft':k==='arrowright'?'ArrowRight':k]=e.type==='keydown';e.preventDefault()}};
    window.addEventListener('keydown',onKey);window.addEventListener('keyup',onKey);timer=setInterval(tick,16);button('RESTART ↻',reset,true);reset();
    return()=>{clearInterval(timer);window.removeEventListener('keydown',onKey);window.removeEventListener('keyup',onKey)};
  }

  function kingdom() {
    const key = 'playroom.kingdom.v1';
    const base = { gold: 120, wood: 55, stone: 35, food: 90, people: 8, soldiers: 0, day: 1, tax: 1, jobs: { lumberjack: 1, miner: 1, farmer: 2, collector: 0 }, buildings: { house: 0, farm: 0, sawmill: 0, mine: 0, market: 0, wall: 0 }, lastReport: 'Your new kingdom is ready. Give everyone a home and a useful job.' };
    let state;
    try { state = { ...base, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { state = { ...base }; }
    state.jobs = { ...base.jobs, ...(state.jobs || {}) }; state.buildings = { ...base.buildings, ...(state.buildings || {}) };
    for (const k of ['gold','wood','stone','food','people','soldiers','day','tax']) if (!Number.isFinite(state[k]) || state[k] < 0) state[k] = base[k];
    const root = $('div', 'kingdom-game');
    const top = $('div', 'kingdom-top');
    const crest = $('div', 'kingdom-crest', '♛');
    const headline = $('div', 'kingdom-headline'); headline.innerHTML = '<strong>YOUR REALM</strong><span>BUILD A HOME FOR EVERYONE</span>';
    const dayBadge = $('div', 'kingdom-day'); top.append(crest, headline, dayBadge);
    const resources = $('div', 'kingdom-resources');
    const population = $('div', 'kingdom-population');
    const columns = $('div', 'kingdom-columns');
    const workforce = $('section', 'kingdom-panel');
    const buildingPanel = $('section', 'kingdom-panel');
    const event = $('div', 'kingdom-report');
    const workforceTitle = $('h3', '', 'CIVILIAN WORK');
    const buildingTitle = $('h3', '', 'BUILD & IMPROVE');
    const jobRows = $('div', 'kingdom-jobs');
    const buildingRows = $('div', 'kingdom-buildings');
    workforce.append(workforceTitle, jobRows);
    buildingPanel.append(buildingTitle, buildingRows);
    columns.append(workforce, buildingPanel);
    root.append(top, resources, population, columns, event);
    board.append(root);
    const resourceInfo = [['gold','🪙','GOLD'],['food','🌾','FOOD'],['wood','🪵','WOOD'],['stone','🪨','STONE']];
    const resourceEls = {};
    resourceInfo.forEach(([id, icon, name]) => { const item = $('div', 'kingdom-resource'); item.innerHTML = `<span>${icon}</span><small>${name}</small><strong>0</strong>`; resources.append(item); resourceEls[id] = item.querySelector('strong'); });
    const jobTypes = [
      ['lumberjack','🪓','LUMBERJACK','wood','Gathers logs for homes and workshops.'],
      ['miner','⛏️','MINER','stone','Quarries stone for sturdy buildings.'],
      ['farmer','🌾','FARMER','food','Grows food so your people can thrive.'],
      ['collector','📜','TAX COLLECTOR','gold','Collects taxes from your growing town.']
    ];
    const jobControls = {};
    jobTypes.forEach(([id, icon, name, output, help]) => {
      const row = $('div', 'kingdom-job');
      const info = $('div', 'kingdom-job-info'); info.innerHTML = `<span>${icon}</span><div><b>${name}</b><small>${help}</small></div>`;
      const assign = $('div', 'kingdom-assign');
      const less = $('button', 'kingdom-step', '−'), count = $('strong', '', '0'), more = $('button', 'kingdom-step', '+');
      less.type = more.type = 'button'; less.setAttribute('aria-label', `Remove a ${name.toLowerCase()}`); more.setAttribute('aria-label', `Assign a ${name.toLowerCase()}`);
      less.onclick = () => { if (state.jobs[id]) { state.jobs[id]--; paint(); } };
      more.onclick = () => { if (available() > 0) { state.jobs[id]++; paint(); } };
      assign.append(less, count, more); row.append(info, assign); jobRows.append(row); jobControls[id] = { less, count, more };
    });
    const structures = [
      ['house','🏠','COTTAGE','Adds 6 beds so more families can settle.','wood',24,'stone',10,'gold',35],
      ['farm','🌱','COMMUNITY GARDEN','Each farmer grows more food.','wood',18,'stone',8,'gold',25],
      ['sawmill','🪚','SAWMILL','Lumberjacks bring in extra wood.','wood',32,'stone',16,'gold',55],
      ['mine','⛏','STONE MINE','Miners bring in extra stone.','wood',28,'stone',22,'gold',65],
      ['market','🏪','MARKET SQUARE','Tax collectors earn more gold.','wood',40,'stone',26,'gold',90],
      ['wall','🛡️','DEFENSIVE WALL','Helps your soldiers repel rival raids.','wood',35,'stone',44,'gold',80]
    ];
    const structureControls = [];
    structures.forEach(([id, icon, name, desc, r1, c1, r2, c2, r3, c3]) => {
      const row = $('div', 'kingdom-build-row'); const info = $('div', 'kingdom-build-info');
      const costText = `${c1} wood · ${c2} stone · ${c3} gold`;
      info.innerHTML = `<b><span>${icon}</span> ${name}</b><small>${desc}</small><em>${costText}</em>`;
      const build = $('button', 'kingdom-build', 'BUILD'); build.type = 'button';
      build.onclick = () => { if (state[r1] < c1 || state[r2] < c2 || state[r3] < c3) return; state[r1] -= c1; state[r2] -= c2; state[r3] -= c3; state.buildings[id]++; state.lastReport = `${name} completed! Your kingdom grows stronger.`; paint(); };
      row.append(info, build); buildingRows.append(row); structureControls.push({ id, r1,c1,r2,c2,r3,c3,build });
    });
    const army = $('div', 'kingdom-army');
    const armyInfo = $('div', 'kingdom-army-info'); armyInfo.innerHTML = '<b>⚔️ ROYAL GUARD <span></span></b><small>Soldiers protect the kingdom when rivals attack.</small><em>1 citizen · 16 food · 28 gold</em>';
    const recruit = $('button', 'kingdom-recruit', 'RECRUIT'); recruit.type = 'button'; recruit.onclick = () => {
      if (!available() || state.food < 16 || state.gold < 28) return;
      state.food -= 16; state.gold -= 28; state.soldiers++; state.lastReport = 'A new guard has joined your royal army.'; paint();
    };
    army.append(armyInfo, recruit); buildingPanel.append(army);
    function available() { return Math.max(0, state.people - state.soldiers - Object.values(state.jobs).reduce((a,b)=>a+b,0)); }
    function save() { localStorage.setItem(key, JSON.stringify(state)); }
    function paint() {
      resourceInfo.forEach(([id]) => resourceEls[id].textContent = Math.floor(state[id]).toLocaleString());
      const cap = 12 + state.buildings.house * 6;
      dayBadge.textContent = `DAY ${state.day}`;
      population.innerHTML = `<span>👥</span><b>${state.people} / ${cap}</b><small> residents · ${available()} ready to work</small><span class="kingdom-army-count">⚔️ ${state.soldiers} guards</span>`;
      jobTypes.forEach(([id]) => { const c = jobControls[id]; c.count.textContent = state.jobs[id]; c.less.disabled = !state.jobs[id]; c.more.disabled = !available(); });
      structureControls.forEach(({id,r1,c1,r2,c2,r3,c3,build}) => { build.disabled = state[r1] < c1 || state[r2] < c2 || state[r3] < c3; build.textContent = `BUILD · ${state.buildings[id]}`; });
      recruit.disabled = !available() || state.food < 16 || state.gold < 28;
      armyInfo.querySelector('b span').textContent = `× ${state.soldiers}`;
      event.textContent = state.lastReport;
      save();
    }
    let cycle = 0, raidTimer;
    function scheduleRaid() {
      clearTimeout(raidTimer);
      raidTimer = setTimeout(() => {
        const threat = 2 + Math.floor(state.day / 2) + Math.floor(Math.random() * 4);
        const defense = state.soldiers * 2 + state.buildings.wall * 4;
        if (defense >= threat) {
          state.gold += 15 + threat * 4; state.food += 12;
          state.lastReport = `RIVAL RAID REPELLED! Your guards turned back ${threat} raiders. The town celebrates.`;
        } else {
          const loss = Math.min(state.soldiers, Math.max(1, threat - Math.floor(defense / 2)));
          state.soldiers -= loss;
          const stolen = Math.min(state.gold, threat * 12); state.gold -= stolen;
          state.lastReport = `RIVALS RAIDED THE BORDER. ${loss} guard${loss===1?'':'s'} fell and the raiders stole ${stolen} gold. Build walls and recruit more guards.`;
        }
        paint(); scheduleRaid();
      }, 30000 + Math.random() * 18000);
    }
    const timer = setInterval(() => {
      state.wood += state.jobs.lumberjack * .42 * (1 + state.buildings.sawmill * .35);
      state.stone += state.jobs.miner * .32 * (1 + state.buildings.mine * .4);
      state.food += state.jobs.farmer * .48 * (1 + state.buildings.farm * .45);
      state.gold += state.jobs.collector * .32 * (1 + state.buildings.market * .5) + state.tax * .08;
      if (++cycle % 10 === 0) {
        state.day++;
        state.food = Math.max(0, state.food - state.people * .65);
        const capacity = 12 + state.buildings.house * 6;
        if (state.people < capacity && state.food >= state.people * .4) { state.people++; state.food -= state.people * .4; state.lastReport = `A new family settled in town. Welcome, resident ${state.people}!`; }
        else if (state.food === 0 && state.people > 4 && state.day % 2 === 0) { state.people--; state.lastReport = 'Food ran short. Some residents left to seek a safer home. Add farmers or gardens.'; }
      }
      paint();
    }, 1000);
    button('SET FAIR TAXES', () => { if (state.gold < 30) { status.textContent = 'NEED 30 GOLD TO SETTLE THE TAX RATE'; return; } state.gold -= 30; state.tax = Math.min(12, state.tax + 1); state.lastReport = `Tax rate adjusted to ${state.tax} coins a day. Keep it fair so the town can prosper.`; paint(); status.textContent = `TAX RATE ${state.tax}/DAY`; }, true);
    paint(); scheduleRaid(); status.textContent = 'GROW YOUR TOWN · PREPARE FOR RIVAL RAIDS';
    return () => { clearInterval(timer); clearTimeout(raidTimer); };
  }
})();
