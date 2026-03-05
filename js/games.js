/* ═══════════════════════════════════════
   ArcOS — Classic Games: Snake, Tetris, Memory
═══════════════════════════════════════ */

// ─── SNAKE ─────────────────────────────────────────────
let snakeGame = {}, snakeRunning = false, snakeAnimFrame = null;

function buildSnake() {
  return `<div id="snake-wrap">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:4px">
      <span id="snake-score" style="font-size:14px;font-weight:700">Score: 0</span>
      <span id="snake-high"  style="font-size:12px;color:var(--text-dim)">Best: 0</span>
      <select id="difficulty-select" class="settings-select">
        <option value="150">Easy 🟢</option>
        <option value="100" selected>Medium 🟡</option>
        <option value="60">Hard 🔴</option>
        <option value="35">Insane 💀</option>
      </select>
    </div>
    <canvas id="snake-canvas" width="320" height="320" style="border:2px solid var(--border);border-radius:8px"></canvas>
    <div style="display:flex;gap:8px;align-items:center">
      <button class="game-btn" onclick="startSnake()">▶ Start</button>
      <button class="game-btn" onclick="if(snakeGame)snakeGame.paused=!snakeGame.paused">⏸ Pause</button>
    </div>
    <div style="font-size:11px;color:var(--text-dim)">Arrow keys / WASD to move</div>
  </div>`;
}

function initSnake() {
  const c = document.getElementById('snake-canvas'); if (!c) return;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0b0b16'; ctx.fillRect(0,0,320,320);
  ctx.fillStyle = 'rgba(255,255,255,.3)';
  ctx.font = '16px Cantarell,sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Press Start to Play 🐍', 160, 160);
  document.addEventListener('keydown', snakeKeyDown);
}

function startSnake() {
  const speed = parseInt(document.getElementById('difficulty-select')?.value || 100);
  snakeGame = {
    snake: [{x:10, y:10}],
    dir:   {x:1, y:0},
    food:  randomFood(),
    score: 0, speed,
    best:  snakeGame.best || 0,
    paused: false,
  };
  snakeRunning = true;
  if (snakeAnimFrame) clearTimeout(snakeAnimFrame);
  snakeLoop();
}

function snakeLoop() {
  if (!snakeRunning) return;
  if (!snakeGame.paused) moveSnake();
  drawSnake();
  snakeAnimFrame = setTimeout(snakeLoop, snakeGame.speed);
}

function moveSnake() {
  const g    = snakeGame;
  const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
  if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || g.snake.some(s => s.x===head.x && s.y===head.y)) {
    snakeRunning = false;
    const c = document.getElementById('snake-canvas');
    if (c) {
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(0,0,320,320);
      ctx.fillStyle = '#ff6b6b'; ctx.font = '20px Cantarell,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Game Over!', 160, 150);
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '15px Cantarell';
      ctx.fillText('Score: '+g.score, 160, 180);
      ctx.fillText('Press Start to play again', 160, 210);
    }
    showNotif('🐍', 'Game Over', 'Score: ' + g.score);
    return;
  }
  g.snake.unshift(head);
  if (head.x === g.food.x && head.y === g.food.y) {
    g.score += 10; g.food = randomFood();
    if (g.score > g.best) g.best = g.score;
    document.getElementById('snake-score').textContent = 'Score: ' + g.score;
    document.getElementById('snake-high').textContent  = 'Best: '  + g.best;
    // Speed up slightly
    g.speed = Math.max(30, g.speed - 1);
  } else {
    g.snake.pop();
  }
}

function drawSnake() {
  const c = document.getElementById('snake-canvas'); if (!c) return;
  const ctx = c.getContext('2d');
  const g   = snakeGame;
  const cs  = 16;
  ctx.fillStyle = '#0b0b16'; ctx.fillRect(0,0,320,320);
  ctx.strokeStyle = 'rgba(255,255,255,.03)';
  for (let x=0;x<20;x++) for (let y=0;y<20;y++) ctx.strokeRect(x*cs, y*cs, cs, cs);

  g.snake.forEach((s, i) => {
    ctx.globalAlpha = i===0 ? 1 : Math.max(0.3, 1-i*0.04);
    ctx.fillStyle   = i===0 ? '#6bcb77' : '#4aab55';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(s.x*cs+1, s.y*cs+1, cs-2, cs-2, 3);
    else ctx.rect(s.x*cs+1, s.y*cs+1, cs-2, cs-2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.arc(g.food.x*cs+cs/2, g.food.y*cs+cs/2, cs/2-2, 0, Math.PI*2);
  ctx.fill();
  // Eye on head
  if (g.snake.length) {
    ctx.fillStyle = '#0b0b16';
    ctx.beginPath();
    ctx.arc(g.snake[0].x*cs + cs*0.65, g.snake[0].y*cs + cs*0.3, 2, 0, Math.PI*2);
    ctx.fill();
  }
}

function randomFood() { return { x:Math.floor(Math.random()*20), y:Math.floor(Math.random()*20) }; }

function snakeKeyDown(e) {
  if (!snakeGame?.dir) return;
  const map = {
    ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0},
    KeyW:{x:0,y:-1},    KeyS:{x:0,y:1},     KeyA:{x:-1,y:0},      KeyD:{x:1,y:0},
  };
  const nd = map[e.code];
  if (nd && !(nd.x===-snakeGame.dir.x && nd.y===-snakeGame.dir.y)) {
    snakeGame.dir = nd; e.preventDefault();
  }
}

// ─── TETRIS ────────────────────────────────────────────
let tetrisGame = {}, tetrisRunning = false, tetrisAnimFrame = null;
const PIECES = [
  { shape:[[1,1,1,1]],         color:'#5e81f4' },
  { shape:[[1,1],[1,1]],       color:'#ffd93d' },
  { shape:[[0,1,0],[1,1,1]],   color:'#c77dff' },
  { shape:[[1,0,0],[1,1,1]],   color:'#ff6b6b' },
  { shape:[[0,0,1],[1,1,1]],   color:'#48cfad' },
  { shape:[[1,1,0],[0,1,1]],   color:'#fd79a8' },
  { shape:[[0,1,1],[1,1,0]],   color:'#6bcb77' },
];

function buildTetris() {
  return `<div id="tetris-wrap">
    <canvas id="tetris-canvas" width="180" height="360" style="border:2px solid var(--border);border-radius:8px"></canvas>
    <div id="tetris-side">
      <div style="font-size:11px;font-weight:700;color:var(--text-dim)">NEXT</div>
      <canvas id="tetris-next-canvas" width="90" height="90" style="border:1px solid var(--border);border-radius:6px"></canvas>
      <div class="tetris-stat"><div class="tetris-stat-label">SCORE</div><div class="tetris-stat-val" id="tet-score">0</div></div>
      <div class="tetris-stat"><div class="tetris-stat-label">LEVEL</div><div class="tetris-stat-val" id="tet-level">1</div></div>
      <div class="tetris-stat"><div class="tetris-stat-label">LINES</div><div class="tetris-stat-val" id="tet-lines">0</div></div>
      <select id="tet-difficulty" class="settings-select">
        <option value="800">Easy 🟢</option>
        <option value="500" selected>Normal 🟡</option>
        <option value="250">Hard 🔴</option>
        <option value="100">Expert 💀</option>
      </select>
      <button class="game-btn" onclick="startTetris()">▶ Start</button>
      <button class="game-btn" onclick="if(tetrisGame)tetrisGame.paused=!tetrisGame.paused">⏸ Pause</button>
    </div>
  </div>`;
}

function initTetris() {
  const c = document.getElementById('tetris-canvas'); if (!c) return;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0b0b16'; ctx.fillRect(0,0,180,360);
  ctx.fillStyle = 'rgba(255,255,255,.3)';
  ctx.font = '13px Cantarell'; ctx.textAlign = 'center';
  ctx.fillText('Press Start', 90, 180);
  document.addEventListener('keydown', tetrisKey);
}

function startTetris() {
  tetrisGame = {
    board:  Array.from({length:20}, () => Array(10).fill(0)),
    score:  0, level: 1, lines: 0,
    speed:  parseInt(document.getElementById('tet-difficulty').value),
    paused: false,
  };
  tetrisGame.cur  = newTetPiece();
  tetrisGame.next = newTetPiece();
  tetrisRunning = true;
  if (tetrisAnimFrame) clearTimeout(tetrisAnimFrame);
  tetrisLoop();
}

function tetrisLoop() {
  if (!tetrisRunning) return;
  if (!tetrisGame.paused) tetrisStep();
  drawTetris();
  tetrisAnimFrame = setTimeout(tetrisLoop, tetrisGame.speed);
}

function newTetPiece() {
  const p = PIECES[Math.floor(Math.random()*PIECES.length)];
  return { shape: p.shape.map(r => [...r]), color: p.color, x: 4, y: 0 };
}

function tetrisStep() {
  const g = tetrisGame;
  g.cur.y++;
  if (tetCollides(g.cur)) {
    g.cur.y--;
    placeTet();
    clearLines();
    g.cur  = g.next;
    g.next = newTetPiece();
    if (tetCollides(g.cur)) { tetrisRunning = false; showNotif('🟥','Tetris','Game Over! Score: '+g.score); }
  }
}

function tetCollides(p) {
  return p.shape.some((row, r) => row.some((v, c) => {
    if (!v) return false;
    const nx = p.x+c, ny = p.y+r;
    return nx<0 || nx>=10 || ny>=20 || (ny>=0 && tetrisGame.board[ny][nx]);
  }));
}

function placeTet() {
  const g = tetrisGame;
  g.cur.shape.forEach((row, r) => row.forEach((v, c) => {
    if (v && g.cur.y+r >= 0) g.board[g.cur.y+r][g.cur.x+c] = g.cur.color;
  }));
}

function clearLines() {
  const g = tetrisGame;
  let cleared = 0;
  g.board = g.board.filter(row => { if (row.every(v => v)) { cleared++; return false; } return true; });
  while (g.board.length < 20) g.board.unshift(Array(10).fill(0));
  if (cleared) {
    const pts = [0,100,300,500,800];
    g.lines += cleared;
    g.score += (pts[cleared] || 800) * g.level;
    g.level  = Math.floor(g.lines / 10) + 1;
    g.speed  = Math.max(60, parseInt(document.getElementById('tet-difficulty')?.value || 500) - g.level*30);
    document.getElementById('tet-score').textContent = g.score;
    document.getElementById('tet-level').textContent = g.level;
    document.getElementById('tet-lines').textContent = g.lines;
  }
}

function drawTetris() {
  const c = document.getElementById('tetris-canvas'); if (!c || !tetrisGame.board) return;
  const ctx = c.getContext('2d');
  const cs  = 18;
  const g   = tetrisGame;
  ctx.fillStyle = '#0b0b16'; ctx.fillRect(0,0,180,360);
  ctx.strokeStyle = 'rgba(255,255,255,.04)';
  for (let x=0;x<10;x++) for (let y=0;y<20;y++) ctx.strokeRect(x*cs, y*cs, cs, cs);

  g.board.forEach((row, y) => row.forEach((v, x) => {
    if (!v) return;
    ctx.fillStyle = v;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x*cs+1,y*cs+1,cs-2,cs-2,2); ctx.fill(); }
    else ctx.fillRect(x*cs+1,y*cs+1,cs-2,cs-2);
  }));

  if (g.cur) {
    // Ghost piece
    let ghost = { ...g.cur, shape: g.cur.shape };
    while (!tetCollides({...ghost,y:ghost.y+1})) ghost.y++;
    ghost.shape.forEach((row,r) => row.forEach((v,c2) => {
      if (!v) return;
      ctx.fillStyle = 'rgba(255,255,255,.08)';
      ctx.fillRect((ghost.x+c2)*cs+1,(ghost.y+r)*cs+1,cs-2,cs-2);
    }));
    g.cur.shape.forEach((row,r) => row.forEach((v,c2) => {
      if (!v) return;
      ctx.fillStyle = g.cur.color;
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect((g.cur.x+c2)*cs+1,(g.cur.y+r)*cs+1,cs-2,cs-2,2); ctx.fill(); }
      else ctx.fillRect((g.cur.x+c2)*cs+1,(g.cur.y+r)*cs+1,cs-2,cs-2);
    }));
  }

  // Next piece preview
  const nc = document.getElementById('tetris-next-canvas'); if (!nc || !g.next) return;
  const nctx = nc.getContext('2d');
  nctx.fillStyle = '#0b0b16'; nctx.fillRect(0,0,90,90);
  g.next.shape.forEach((row,r) => row.forEach((v,c2) => {
    if (!v) return;
    nctx.fillStyle = g.next.color;
    nctx.fillRect(c2*20+15, r*20+20, 18, 18);
  }));
}

function tetrisKey(e) {
  if (!tetrisGame?.cur || tetrisGame.paused) return;
  const c = tetrisGame.cur;
  if (e.code==='ArrowLeft')  { c.x--; if(tetCollides(c))c.x++; }
  else if (e.code==='ArrowRight') { c.x++; if(tetCollides(c))c.x--; }
  else if (e.code==='ArrowDown')  { tetrisStep(); }
  else if (e.code==='ArrowUp' || e.code==='KeyX') {
    const rot = c.shape[0].map((_,i) => c.shape.map(r=>r[i]).reverse());
    const old = c.shape; c.shape = rot; if (tetCollides(c)) c.shape = old;
  } else if (e.code==='Space') {
    while (!tetCollides({...c,y:c.y+1})) c.y++;
    tetrisStep();
  }
  if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Space'].includes(e.code)) e.preventDefault();
  drawTetris();
}

// ─── MEMORY GAME ───────────────────────────────────────
let memCards = [], memFlipped = [], memMatched = [], memLocked = false, memMoves = 0;
const MEM_EMOJIS = ['🌟','🎮','🚀','🐍','🎵','🦄','🔥','💎'];

function buildMemory() {
  return `<div id="memory-wrap">
    <div style="display:flex;gap:16px;align-items:center">
      <span style="font-size:14px;font-weight:700">Moves: <span id="mem-moves">0</span></span>
      <span style="font-size:14px;font-weight:700">Pairs: <span id="mem-pairs">0</span>/8</span>
      <select id="mem-difficulty" class="settings-select">
        <option value="2000">Easy</option>
        <option value="1000" selected>Normal</option>
        <option value="500">Hard</option>
      </select>
      <button class="game-btn" onclick="initMemory()">↺ Reset</button>
    </div>
    <div id="memory-grid"></div>
  </div>`;
}

function initMemory() {
  const emojis = [...MEM_EMOJIS,...MEM_EMOJIS].sort(() => Math.random()-.5);
  memCards = emojis; memFlipped = []; memMatched = []; memLocked = false; memMoves = 0;
  document.getElementById('mem-moves').textContent = '0';
  document.getElementById('mem-pairs').textContent = '0';
  const g = document.getElementById('memory-grid'); if (!g) return;
  g.innerHTML = emojis.map((e,i) =>
    `<div class="mem-card" id="mc${i}" onclick="flipMemCard(${i})"><span id="mce${i}" style="display:none">${e}</span></div>`
  ).join('');
}

function flipMemCard(i) {
  if (memLocked || memFlipped.includes(i) || memMatched.includes(i)) return;
  const c = document.getElementById(`mc${i}`);
  const ic= document.getElementById(`mce${i}`);
  if (!c || !ic) return;
  c.classList.add('flipped'); ic.style.display = 'block';
  memFlipped.push(i);
  if (memFlipped.length === 2) {
    memMoves++;
    document.getElementById('mem-moves').textContent = memMoves;
    memLocked = true;
    const [a, b] = memFlipped;
    const delay  = parseInt(document.getElementById('mem-difficulty')?.value || 1000);
    if (memCards[a] === memCards[b]) {
      memMatched.push(a, b);
      [a,b].forEach(idx => document.getElementById(`mc${idx}`)?.classList.add('matched'));
      memFlipped = []; memLocked = false;
      document.getElementById('mem-pairs').textContent = memMatched.length / 2;
      if (memMatched.length === 16) showNotif('🃏','Solved!','Memory game done in '+memMoves+' moves 🎉');
    } else {
      setTimeout(() => {
        memFlipped.forEach(idx => {
          document.getElementById(`mc${idx}`)?.classList.remove('flipped');
          const ic2 = document.getElementById(`mce${idx}`);
          if (ic2) ic2.style.display = 'none';
        });
        memFlipped = []; memLocked = false;
      }, delay);
    }
  }
}
