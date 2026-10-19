(() => {
  const meta = {
    clicker: ['COIN CLICKER', '16 / IDLE', 'Tap for coins, buy upgrades, and unlock new looks. Your progress saves automatically.'],
    wordle: ['FIVE LETTER', '17 / WORDS', 'Guess the five-letter word in six tries. Green is right spot; gold is in the word.'],
    blackjack: ['BLACKJACK', '18 / CHANCE', 'Try to beat the dealer without going over 21.'],
    pong: ['PONG DUEL', '19 / ARCADE', 'Move with W/S or ↑/↓. First to five wins.'],
    breakout: ['BRICK BREAKER', '20 / ARCADE', 'Move with ←/→ or A/D. Break every brick without dropping the ball.']
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
    const cleanup = ({ clicker: clicker, wordle: wordle, blackjack: blackjack, pong: pong, breakout: breakout })[id]();
    window.__extraGameCleanup = cleanup || (() => {});
  }
  window.addEventListener('playroom:open-extra', e => open(e.detail));

  function clicker() {
    const key = 'playroom.clicker.v1';
    const defaults = { coins: 0, power: 1, powerLevel: 0, auto: 0, owned: ['classic'], skin: 'classic' };
    let data;
    try { data = { ...defaults, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { data = { ...defaults }; }
    data.owned = Array.isArray(data.owned) ? data.owned : ['classic'];
    if (!data.owned.includes('classic')) data.owned.unshift('classic');
    const skins = [
      { id: 'classic', name: 'CLASSIC', cost: 0, face: '🟡' },
      { id: 'peach', name: 'PEACH', cost: 100, face: '🍑' },
      { id: 'ocean', name: 'OCEAN', cost: 250, face: '🔵' },
      { id: 'grape', name: 'GRAPE', cost: 500, face: '🍇' }
    ];
    const wrap = $('div', 'clicker-wrap');
    const wallet = $('div', 'clicker-wallet');
    const coinCount = $('strong', 'clicker-count');
    const coinLabel = $('span', 'clicker-caption', 'COINS');
    wallet.append(coinCount, coinLabel);
    const coin = $('button', `coin-button skin-${data.skin}`);
    coin.type = 'button'; coin.setAttribute('aria-label', 'Tap to earn coins');
    coin.innerHTML = '<span class="coin-face"></span><span class="coin-tap">TAP!</span>';
    const shop = $('div', 'clicker-shop');
    const upgradeHeading = $('h3', '', 'UPGRADES');
    const powerButton = $('button', 'shop-button');
    const autoButton = $('button', 'shop-button');
    const skinHeading = $('h3', '', 'SKINS');
    const skinList = $('div', 'skin-list');
    shop.append(upgradeHeading, powerButton, autoButton, skinHeading, skinList);
    wrap.append(wallet, coin, shop); board.append(wrap);
    const powerCost = () => 25 + data.powerLevel * 30;
    const autoCost = () => Math.round(60 * Math.pow(1.65, data.auto));
    function save() { localStorage.setItem(key, JSON.stringify(data)); }
    function paint() {
      coinCount.textContent = Math.floor(data.coins).toLocaleString();
      coin.className = `coin-button skin-${data.skin}`;
      coin.querySelector('.coin-face').textContent = skins.find(s => s.id === data.skin)?.face || '🟡';
      powerButton.innerHTML = `CLICK POWER <b>+1</b><small>LV ${data.powerLevel} · ${powerCost()} COINS</small>`;
      autoButton.innerHTML = `AUTO CLICK <b>+1 / SEC</b><small>LV ${data.auto} · ${autoCost()} COINS</small>`;
      powerButton.disabled = data.coins < powerCost(); autoButton.disabled = data.coins < autoCost();
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
    coin.onclick = () => { data.coins += data.power; paint(); coin.classList.remove('coin-pop'); void coin.offsetWidth; coin.classList.add('coin-pop'); };
    powerButton.onclick = () => { const cost = powerCost(); if (data.coins < cost) return; data.coins -= cost; data.powerLevel++; data.power++; paint(); status.textContent = `CLICK POWER IS NOW ${data.power} COINS`; };
    autoButton.onclick = () => { const cost = autoCost(); if (data.coins < cost) return; data.coins -= cost; data.auto++; paint(); status.textContent = `AUTO CLICKER: ${data.auto} COINS PER SECOND`; };
    const timer = setInterval(() => { if (data.auto) { data.coins += data.auto; paint(); } }, 1000);
    paint(); status.textContent = 'YOUR COINS AND SKINS SAVE ON THIS DEVICE';
    return () => clearInterval(timer);
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
    const ctx=canvas.getContext('2d'); let py=120, ay=120, x=240,y=150,vx=4,vy=2,ps=0,as=0,held={},raf,paused=false;
    function resetBall(toward) { x=240;y=150;vx=toward*4;vy=(Math.random()-.5)*4; }
    function draw() {
      ctx.fillStyle='#17181b';ctx.fillRect(0,0,480,300);ctx.fillStyle='#f3f1e9';
      for(let yy=8;yy<300;yy+=22)ctx.fillRect(238,yy,4,12);
      ctx.font='bold 32px DM Mono,monospace';ctx.textAlign='center';ctx.fillText(ps,190,43);ctx.fillText(as,290,43);
      ctx.fillRect(18,py,9,60);ctx.fillRect(453,ay,9,60);ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();
    }
    function frame(){if(paused)return; if(held.ArrowUp||held.w)py=Math.max(0,py-6);if(held.ArrowDown||held.s)py=Math.min(240,py+6);ay+=((y-30)-ay)*.075;ay=Math.max(0,Math.min(240,ay));x+=vx;y+=vy;
      if(y<7||y>293)vy*=-1;if(vx<0&&x<32&&y>py-4&&y<py+64){vx=Math.abs(vx)*1.04;vy+=(y-(py+30))*.09}
      if(vx>0&&x>448&&y>ay-4&&y<ay+64){vx=-Math.abs(vx)*1.04;vy+=(y-(ay+30))*.09}
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
    function tick(){if(!running)return;if(keys.ArrowLeft||keys.a)paddle=Math.max(0,paddle-6);if(keys.ArrowRight||keys.d)paddle=Math.min(340,paddle+6);ball.x+=ball.dx;ball.y+=ball.dy;if(ball.x<6||ball.x>414)ball.dx*=-1;if(ball.y<6)ball.dy=Math.abs(ball.dy);if(ball.y>273&&ball.y<290&&ball.x>paddle-2&&ball.x<paddle+82){ball.dy=-Math.abs(ball.dy);ball.dx+=(ball.x-(paddle+40))*.04}for(const b of bricks)if(b.on&&ball.x>b.x&&ball.x<b.x+36&&ball.y>b.y&&ball.y<b.y+15){b.on=false;ball.dy*=-1;break}if(ball.y>306){lives--;if(lives<=0){running=false;status.textContent='OUT OF LIVES · TRY AGAIN'}else ball={x:210,y:260,dx:3,dy:-4}}if(bricks.every(b=>!b.on)){running=false;status.textContent='ALL CLEAR — YOU WIN!'}draw()}
    const onKey=e=>{const k=e.key.toLowerCase();if(['arrowleft','arrowright','a','d'].includes(k)){keys[k==='arrowleft'?'ArrowLeft':k==='arrowright'?'ArrowRight':k]=e.type==='keydown';e.preventDefault()}};
    window.addEventListener('keydown',onKey);window.addEventListener('keyup',onKey);timer=setInterval(tick,16);button('RESTART ↻',reset,true);reset();
    return()=>{clearInterval(timer);window.removeEventListener('keydown',onKey);window.removeEventListener('keyup',onKey)};
  }
})();

