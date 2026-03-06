/* ═══════════════════════════════════════
   ArcOS — Mega Apps Pack
   AI Chat · Piano · Chess · Sudoku
   Stock/Crypto · VM/Docker · Vault
   E-Book Reader · Photo Editor · Database
═══════════════════════════════════════ */

// ─── AI CHAT (Claude inside ArcOS) ────────────────────
function buildAichat() {
  return `<div id="aichat-content" style="display:flex;flex-direction:column;height:100%;background:#0d0d1a">
    <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--win-bar);border-bottom:1px solid var(--border)">
      <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#5e81f4,#c77dff);display:flex;align-items:center;justify-content:center;font-size:16px">🧠</div>
      <div>
        <div style="font-weight:700;font-size:14px">Claude AI</div>
        <div style="font-size:11px;color:var(--text-dim)">Powered by Anthropic</div>
      </div>
      <button class="editor-btn" onclick="aichatClear()" style="margin-left:auto">🗑 Clear</button>
      <select class="settings-select" id="ai-model-sel" style="font-size:11px">
        <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
      </select>
    </div>
    <div id="aichat-msgs" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px"></div>
    <div style="padding:12px 16px;background:var(--win-bar);border-top:1px solid var(--border);display:flex;gap:8px;align-items:flex-end">
      <textarea id="aichat-input" placeholder="Ask Claude anything…" rows="2" style="flex:1;padding:10px 14px;background:rgba(255,255,255,.07);border:1px solid var(--border);border-radius:10px;color:var(--text);font-family:inherit;font-size:13px;resize:none;outline:none;line-height:1.5" onkeydown="if((event.ctrlKey||event.metaKey)&&event.key==='Enter')aichatSend()"></textarea>
      <button onclick="aichatSend()" style="background:linear-gradient(135deg,#5e81f4,#c77dff);border:none;color:#fff;border-radius:10px;padding:10px 18px;cursor:pointer;font-size:13px;font-weight:700;font-family:inherit;white-space:nowrap">Send ↵</button>
    </div>
    <div style="padding:4px 16px 8px;font-size:10px;color:rgba(255,255,255,.2);text-align:center">Ctrl+Enter to send · Conversations saved locally</div>
  </div>`;
}

let aichatHistory = [];
try { aichatHistory = JSON.parse(localStorage.getItem('arcos_ai_history') || '[]'); } catch {}

function initAichat() {
  const saved = JSON.parse(localStorage.getItem('arcos_ai_history') || '[]');
  aichatHistory = saved;
  const msgs = document.getElementById('aichat-msgs');
  if (!msgs) return;
  if (aichatHistory.length === 0) {
    aichatAddMsg('assistant', "Hi! I'm Claude, running inside ArcOS. Ask me anything — code help, explanations, creative writing, math, or just chat. What's on your mind?");
  } else {
    aichatHistory.forEach(m => aichatRenderMsg(m.role, m.content));
  }
}

function aichatAddMsg(role, content) {
  aichatHistory.push({ role, content });
  localStorage.setItem('arcos_ai_history', JSON.stringify(aichatHistory.slice(-40)));
  aichatRenderMsg(role, content);
}

function aichatRenderMsg(role, content) {
  const msgs = document.getElementById('aichat-msgs');
  if (!msgs) return;
  const isUser = role === 'user';
  const div = document.createElement('div');
  div.style.cssText = `display:flex;gap:10px;align-items:flex-start;${isUser ? 'flex-direction:row-reverse' : ''}`;
  const avatar = document.createElement('div');
  avatar.style.cssText = `width:28px;height:28px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;background:${isUser ? 'linear-gradient(135deg,#5e81f4,#4f46e5)' : 'linear-gradient(135deg,#c77dff,#8b5cf6)'}`;
  avatar.textContent = isUser ? '🧑' : '🧠';
  const bubble = document.createElement('div');
  bubble.style.cssText = `max-width:75%;padding:10px 14px;border-radius:${isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px'};font-size:13px;line-height:1.65;${isUser ? 'background:rgba(94,129,244,.25);color:var(--text)' : 'background:rgba(255,255,255,.07);color:var(--text)'}`;
  bubble.innerHTML = content.replace(/`([^`]+)`/g,'<code style="background:rgba(0,0,0,.4);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:12px">$1</code>').replace(/\n/g,'<br>');
  div.appendChild(avatar);
  div.appendChild(bubble);
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

async function aichatSend() {
  const inp = document.getElementById('aichat-input');
  const text = inp?.value?.trim();
  if (!text) return;
  inp.value = '';
  inp.disabled = true;
  aichatAddMsg('user', text);
  
  // Loading indicator
  const msgs = document.getElementById('aichat-msgs');
  const loading = document.createElement('div');
  loading.id = 'ai-loading';
  loading.style.cssText = 'display:flex;gap:10px;align-items:center;padding:8px 0';
  loading.innerHTML = `<div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#c77dff,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:13px">🧠</div><div style="display:flex;gap:5px;align-items:center">${[0,150,300].map(d=>`<div style="width:7px;height:7px;border-radius:50%;background:var(--accent);animation:pulse 1.2s ease-in-out ${d}ms infinite alternate"></div>`).join('')}</div>`;
  msgs?.appendChild(loading);
  msgs.scrollTop = msgs.scrollHeight;

  const style = document.createElement('style');
  style.textContent = '@keyframes pulse{from{opacity:.3;transform:scale(.8)}to{opacity:1;transform:scale(1)}}';
  document.head.appendChild(style);

  try {
    const messages = aichatHistory.filter(m=>m.role!=='system').slice(-20).map(m=>({role:m.role,content:m.content}));
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: document.getElementById('ai-model-sel')?.value || 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'You are Claude, an AI assistant running inside ArcOS — a browser-based Linux desktop environment. Be helpful, concise, and friendly. You can help with code, explanations, creative writing, and general questions. Format code in backticks.',
        messages
      })
    });
    const data = await res.json();
    loading.remove();
    const reply = data.content?.[0]?.text || 'Sorry, I could not get a response.';
    aichatAddMsg('assistant', reply);
  } catch (e) {
    loading.remove();
    aichatAddMsg('assistant', `⚠️ Connection error: ${e.message}\n\nMake sure you're connected to the internet. The Anthropic API is being called directly from your browser.`);
  }
  if (inp) inp.disabled = false;
  inp?.focus();
}

function aichatClear() {
  aichatHistory = [];
  localStorage.removeItem('arcos_ai_history');
  const msgs = document.getElementById('aichat-msgs');
  if (msgs) msgs.innerHTML = '';
  aichatAddMsg('assistant', "Chat cleared! Fresh start — what can I help you with?");
}

// ─── PIANO ─────────────────────────────────────────────
function buildPiano() {
  const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const keys = [];
  for (let oct = 3; oct <= 5; oct++) {
    notes.forEach((n,i) => keys.push({ note: n, oct, isBlack: n.includes('#'), idx: i }));
  }
  const whites = keys.filter(k => !k.isBlack);
  const keyW = 38, keyH = 160, blackH = 100, blackW = 26;
  let wPos = 0;
  const whiteKeys = whites.map((k,i) => {
    const x = i * keyW;
    return `<div class="piano-key white-key" data-note="${k.note}${k.oct}" onmousedown="pianoPlay('${k.note}${k.oct}')" onmouseup="pianoRelease('${k.note}${k.oct}')" onmouseleave="pianoRelease('${k.note}${k.oct}')"
      style="left:${x}px;width:${keyW-2}px;height:${keyH}px"></div>`;
  }).join('');
  
  let wIdx = 0;
  const blackKeys = keys.filter(k=>!k.isBlack).map(()=>wIdx++);
  const blackPositions = keys.map((k,i)=>{
    if (!k.isBlack) { wPos++; return null; }
    return { k, x: (wPos-1)*keyW + keyW - blackW/2 - 1 };
  }).filter(Boolean);
  
  const bKeys = blackPositions.map(({k,x}) =>
    `<div class="piano-key black-key" data-note="${k.note}${k.oct}" onmousedown="pianoPlay('${k.note}${k.oct}');event.stopPropagation()" onmouseup="pianoRelease('${k.note}${k.oct}')" onmouseleave="pianoRelease('${k.note}${k.oct}')"
      style="left:${x}px;width:${blackW}px;height:${blackH}px"></div>`
  ).join('');

  const totalW = whites.length * keyW;
  return `<div id="piano-content" style="display:flex;flex-direction:column;height:100%;background:#111118;align-items:center;gap:0;overflow:hidden">
    <div style="padding:10px 16px;background:var(--win-bar);border-bottom:1px solid var(--border);width:100%;display:flex;align-items:center;gap:12px">
      <span style="font-weight:700">🎹 Piano</span>
      <select class="settings-select" id="piano-wave" style="font-size:12px">
        <option value="sine">Sine (Soft)</option>
        <option value="triangle">Triangle (Mellow)</option>
        <option value="square">Square (Retro)</option>
        <option value="sawtooth">Sawtooth (Bright)</option>
      </select>
      <label style="font-size:12px;color:var(--text-dim)">Volume</label>
      <input type="range" min="0" max="100" value="60" id="piano-vol" style="width:80px;accent-color:var(--accent)">
      <label style="font-size:12px;color:var(--text-dim)">Reverb</label>
      <input type="range" min="0" max="100" value="20" id="piano-rev" style="width:60px;accent-color:var(--accent)">
      <span id="piano-note-display" style="font-size:14px;font-weight:700;color:var(--accent);min-width:50px;text-align:right;font-family:'Source Code Pro',monospace"></span>
    </div>
    <div id="piano-keyboard-hint" style="padding:6px 16px;font-size:11px;color:var(--text-dim);width:100%;text-align:center">
      A S D F G H J = white keys C4-B4 · W E T Y U = black keys · Z/X = octave down/up
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;overflow-x:auto;overflow-y:hidden;width:100%;padding:10px 0">
      <div style="position:relative;height:${keyH}px;width:${totalW}px;flex-shrink:0">
        ${whiteKeys}
        ${bKeys}
      </div>
    </div>
    <div id="piano-roll" style="height:60px;background:#080810;width:100%;border-top:1px solid var(--border);display:flex;align-items:center;padding:0 16px;gap:4px;overflow:hidden">
      <span style="font-size:11px;color:var(--text-dim)">Recently played:</span>
      <div id="piano-roll-notes" style="display:flex;gap:4px;flex-wrap:nowrap;overflow:hidden"></div>
    </div>
  </div>`;
}

let pianoAudioCtx = null;
let pianoNodes = {};
let pianoOctaveShift = 0;
const NOTE_FREQS = { C:261.63, 'C#':277.18, D:293.66, 'D#':311.13, E:329.63, F:349.23, 'F#':369.99, G:392.00, 'G#':415.30, A:440.00, 'A#':466.16, B:493.88 };
const KEYBOARD_MAP = { a:'C4',w:'C#4',s:'D4',e:'D#4',d:'E4',f:'F4',t:'F#4',g:'G4',y:'G#4',h:'A4',u:'A#4',j:'B4',k:'C5',o:'C#5',l:'D5',p:'D#5' };

function initPiano() {
  document.addEventListener('keydown', pianoKeyDown);
  document.addEventListener('keyup', pianoKeyUp);
}

function pianoKeyDown(e) {
  if (!document.getElementById('piano-content')) { document.removeEventListener('keydown', pianoKeyDown); return; }
  if (e.repeat) return;
  const note = KEYBOARD_MAP[e.key?.toLowerCase()];
  if (note) pianoPlay(note);
  if (e.key === 'z') pianoOctaveShift = Math.max(-2, pianoOctaveShift - 1);
  if (e.key === 'x') pianoOctaveShift = Math.min(2, pianoOctaveShift + 1);
}
function pianoKeyUp(e) {
  const note = KEYBOARD_MAP[e.key?.toLowerCase()];
  if (note) pianoRelease(note);
}

function pianoPlay(noteStr) {
  if (!pianoAudioCtx) pianoAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const match = noteStr.match(/([A-G#]+)(\d)/);
  if (!match) return;
  const [,note, octStr] = match;
  const oct = parseInt(octStr) + pianoOctaveShift;
  const freq = NOTE_FREQS[note] * Math.pow(2, oct - 4);
  const wave = document.getElementById('piano-wave')?.value || 'sine';
  const vol  = (document.getElementById('piano-vol')?.value || 60) / 100;
  const rev  = (document.getElementById('piano-rev')?.value || 20) / 100;
  const key  = noteStr;
  if (pianoNodes[key]) { try { pianoNodes[key].stop(); } catch {} }
  const osc = pianoAudioCtx.createOscillator();
  const gain = pianoAudioCtx.createGain();
  osc.type = wave;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol * 0.5, pianoAudioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(vol * 0.3, pianoAudioCtx.currentTime + 0.1);
  osc.connect(gain); gain.connect(pianoAudioCtx.destination);
  osc.start();
  pianoNodes[key] = osc;
  // Highlight key
  document.querySelector(`[data-note="${noteStr}"]`)?.classList.add('pressed');
  // Display note
  const disp = document.getElementById('piano-note-display');
  if (disp) disp.textContent = note + oct;
  // Roll
  const roll = document.getElementById('piano-roll-notes');
  if (roll) {
    const pill = document.createElement('span');
    pill.textContent = note + oct;
    pill.style.cssText = 'font-size:11px;padding:2px 7px;background:var(--accent);border-radius:10px;color:#fff;font-family:monospace;animation:fadeIn .1s ease;flex-shrink:0';
    roll.prepend(pill);
    if (roll.children.length > 20) roll.lastChild?.remove();
  }
}
function pianoRelease(noteStr) {
  const osc = pianoNodes[noteStr];
  if (osc) { try { osc.stop(pianoAudioCtx.currentTime + 0.3); } catch {} delete pianoNodes[noteStr]; }
  document.querySelector(`[data-note="${noteStr}"]`)?.classList.remove('pressed');
}

// ─── CHESS ─────────────────────────────────────────────
function buildChess() {
  return `<div id="chess-content" style="display:flex;height:100%;background:#0f0f1a">
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px">
      <div style="margin-bottom:8px;display:flex;justify-content:space-between;width:400px">
        <span id="chess-black-info" style="font-size:13px;display:flex;align-items:center;gap:6px"><span style="font-size:20px">♟</span> Black <span id="chess-black-cap" style="color:var(--text-dim);font-size:11px"></span></span>
        <span id="chess-status" style="font-size:13px;color:var(--accent);font-weight:700">White's turn</span>
      </div>
      <div id="chess-board" style="display:grid;grid-template-columns:repeat(8,50px);grid-template-rows:repeat(8,50px);border:2px solid var(--border);box-shadow:0 8px 40px rgba(0,0,0,.6)"></div>
      <div style="margin-top:8px;display:flex;justify-content:space-between;width:400px">
        <span id="chess-white-info" style="font-size:13px;display:flex;align-items:center;gap:6px"><span style="font-size:20px">♙</span> White (You) <span id="chess-white-cap" style="color:var(--text-dim);font-size:11px"></span></span>
        <div style="display:flex;gap:6px">
          <button class="editor-btn" onclick="chessUndo()">↩ Undo</button>
          <button class="editor-btn" onclick="chessNewGame()">↺ New</button>
        </div>
      </div>
    </div>
    <div style="width:200px;background:rgba(0,0,0,.3);border-left:1px solid var(--border);padding:12px;display:flex;flex-direction:column;gap:8px">
      <div style="font-weight:700;font-size:13px">Move History</div>
      <div id="chess-history" style="flex:1;overflow-y:auto;font-size:11px;font-family:'Source Code Pro',monospace;color:var(--text-dim);display:flex;flex-direction:column;gap:2px"></div>
      <select class="settings-select" id="chess-difficulty" style="font-size:12px">
        <option value="1">Easy</option>
        <option value="2" selected>Normal</option>
        <option value="3">Hard</option>
      </select>
      <div id="chess-eval" style="font-size:11px;color:var(--text-dim);font-family:'Source Code Pro',monospace"></div>
    </div>
  </div>`;
}

const CHESS_PIECES = {
  wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',
  bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'
};
let chessBoard = [], chessSelected = null, chessTurn = 'w', chessHistory = [], chessCaptured = {w:[],b:[]};

function initChess() { chessNewGame(); }
function chessNewGame() {
  chessHistory = []; chessCaptured = {w:[],b:[]}; chessTurn = 'w';
  chessBoard = [
    ['bR','bN','bB','bQ','bK','bB','bN','bR'],
    ['bP','bP','bP','bP','bP','bP','bP','bP'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ['wP','wP','wP','wP','wP','wP','wP','wP'],
    ['wR','wN','wB','wQ','wK','wB','wN','wR'],
  ];
  chessSelected = null;
  chessRender();
  document.getElementById('chess-history').innerHTML = '';
  document.getElementById('chess-status').textContent = "White's turn";
}

function chessRender() {
  const board = document.getElementById('chess-board'); if (!board) return;
  board.innerHTML = '';
  const moves = chessSelected ? chessGetMoves(chessSelected[0], chessSelected[1]) : [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement('div');
      const isLight = (r + c) % 2 === 0;
      const isSelected = chessSelected && chessSelected[0]===r && chessSelected[1]===c;
      const isMove = moves.some(m=>m[0]===r&&m[1]===c);
      cell.style.cssText = `width:50px;height:50px;display:flex;align-items:center;justify-content:center;font-size:28px;cursor:pointer;position:relative;user-select:none;
        background:${isSelected?'rgba(94,129,244,.5)':isLight?'#d8b483':'#a0522d'};
        ${isMove?'box-shadow:inset 0 0 0 4px rgba(72,207,173,.7)':''}`;
      const piece = chessBoard[r][c];
      if (piece) cell.textContent = CHESS_PIECES[piece];
      if (isMove && !piece) {
        const dot = document.createElement('div');
        dot.style.cssText = 'position:absolute;width:14px;height:14px;border-radius:50%;background:rgba(72,207,173,.5)';
        cell.appendChild(dot);
      }
      cell.onclick = () => chessClick(r, c);
      board.appendChild(cell);
    }
  }
}

function chessClick(r, c) {
  const piece = chessBoard[r][c];
  if (chessSelected) {
    const moves = chessGetMoves(chessSelected[0], chessSelected[1]);
    if (moves.some(m=>m[0]===r&&m[1]===c)) {
      chessMove(chessSelected[0], chessSelected[1], r, c);
      chessSelected = null;
      return;
    }
  }
  if (piece && piece[0] === chessTurn) {
    chessSelected = [r, c];
  } else {
    chessSelected = null;
  }
  chessRender();
}

function chessMove(fr, fc, tr, tc) {
  const p = chessBoard[fr][fc];
  const target = chessBoard[tr][tc];
  if (target) chessCaptured[chessTurn].push(target);
  // Pawn promotion
  let moved = p;
  if (p === 'wP' && tr === 0) moved = 'wQ';
  if (p === 'bP' && tr === 7) moved = 'bQ';
  chessBoard[tr][tc] = moved;
  chessBoard[fr][fc] = null;
  const cols = 'abcdefgh';
  const moveStr = `${cols[fc]}${8-fr}→${cols[tc]}${8-tr}`;
  chessHistory.push({ p, fr, fc, tr, tc, target });
  const hist = document.getElementById('chess-history');
  if (hist) {
    const el = document.createElement('div');
    el.textContent = `${chessHistory.length}. ${CHESS_PIECES[p]} ${moveStr}`;
    hist.appendChild(el); hist.scrollTop = hist.scrollHeight;
  }
  chessTurn = chessTurn === 'w' ? 'b' : 'w';
  const statusEl = document.getElementById('chess-status');
  if (statusEl) statusEl.textContent = chessTurn === 'w' ? "White's turn" : "Black thinking…";
  document.getElementById('chess-white-cap').textContent = chessCaptured.w.map(p=>CHESS_PIECES[p]).join('');
  document.getElementById('chess-black-cap').textContent = chessCaptured.b.map(p=>CHESS_PIECES[p]).join('');
  chessRender();
  if (chessTurn === 'b') setTimeout(chessAiMove, 400);
}

function chessGetMoves(r, c) {
  const p = chessBoard[r][c]; if (!p) return [];
  const color = p[0], type = p[1], moves = [];
  const inBounds = (r,c) => r>=0&&r<8&&c>=0&&c<8;
  const isEmpty = (r,c) => inBounds(r,c) && !chessBoard[r][c];
  const isEnemy = (r,c,col) => inBounds(r,c) && chessBoard[r][c] && chessBoard[r][c][0]!==col;
  const slide = (dr,dc) => { let nr=r+dr,nc=c+dc; while(inBounds(nr,nc)){if(chessBoard[nr][nc]){if(chessBoard[nr][nc][0]!==color)moves.push([nr,nc]);break;}moves.push([nr,nc]);nr+=dr;nc+=dc;} };
  if (type==='P'){const dir=color==='w'?-1:1;const start=color==='w'?6:1;if(isEmpty(r+dir,c)){moves.push([r+dir,c]);if(r===start&&isEmpty(r+2*dir,c))moves.push([r+2*dir,c]);}if(isEnemy(r+dir,c-1,color))moves.push([r+dir,c-1]);if(isEnemy(r+dir,c+1,color))moves.push([r+dir,c+1]);}
  if (type==='N'){[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc])=>{if(inBounds(r+dr,c+dc)&&(!chessBoard[r+dr][c+dc]||chessBoard[r+dr][c+dc][0]!==color))moves.push([r+dr,c+dc]);});}
  if (type==='R'){[[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>slide(dr,dc));}
  if (type==='B'){[[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc])=>slide(dr,dc));}
  if (type==='Q'){[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc])=>slide(dr,dc));}
  if (type==='K'){[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc])=>{if(inBounds(r+dr,c+dc)&&(!chessBoard[r+dr][c+dc]||chessBoard[r+dr][c+dc][0]!==color))moves.push([r+dr,c+dc]);});}
  return moves;
}

function chessAiMove() {
  const depth = parseInt(document.getElementById('chess-difficulty')?.value||2);
  let bestMove = null, bestScore = -Infinity;
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    if (chessBoard[r][c]?.[0]==='b') {
      chessGetMoves(r,c).forEach(([tr,tc]) => {
        const saved=chessBoard[tr][tc];
        chessBoard[tr][tc]=chessBoard[r][c]; chessBoard[r][c]=null;
        const score = chessEval() + (Math.random()-.5)*(depth<2?40:5);
        chessBoard[r][c]=chessBoard[tr][tc]; chessBoard[tr][tc]=saved;
        if (score>bestScore){bestScore=score;bestMove=[r,c,tr,tc];}
      });
    }
  }
  if (bestMove) {
    chessMove(bestMove[0],bestMove[1],bestMove[2],bestMove[3]);
  }
  document.getElementById('chess-status').textContent = "White's turn";
  const evalEl=document.getElementById('chess-eval');
  if(evalEl) evalEl.textContent = `Eval: ${bestScore>0?'+':''}${Math.round(bestScore/10)/10}`;
}

function chessUndo() {
  if (chessHistory.length < 2) return;
  for (let i=0;i<2;i++) {
    const m = chessHistory.pop(); if(!m) return;
    chessBoard[m.fr][m.fc]=m.p; chessBoard[m.tr][m.tc]=m.target||null;
    if(m.target) chessCaptured[m.p[0]].pop();
  }
  chessTurn='w'; chessRender();
}

const PIECE_VALUES = {P:10,N:30,B:30,R:50,Q:90,K:900};
function chessEval() {
  let score=0;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
    const p=chessBoard[r][c]; if(!p) continue;
    const v=PIECE_VALUES[p[1]]||0;
    score += p[0]==='b'?v:-v;
  }
  return score;
}

// ─── SUDOKU ────────────────────────────────────────────
function buildSudoku() {
  return `<div id="sudoku-content" style="display:flex;height:100%;background:#0f0f1a;align-items:center;justify-content:center;gap:24px;padding:16px">
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px">
        <span style="font-weight:700;font-size:16px">Sudoku</span>
        <select class="settings-select" id="sudoku-diff">
          <option value="easy">Easy</option>
          <option value="medium" selected>Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button class="editor-btn" onclick="sudokuNew()">↺ New</button>
        <button class="editor-btn" onclick="sudokuSolve()">🔍 Solve</button>
        <button class="editor-btn" onclick="sudokuHint()">💡 Hint</button>
      </div>
      <div id="sudoku-board" style="display:grid;grid-template-columns:repeat(9,48px);grid-template-rows:repeat(9,48px);border:3px solid rgba(255,255,255,.4);gap:0"></div>
      <div id="sudoku-numpad" style="display:flex;gap:6px;margin-top:4px">
        ${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="editor-btn" onclick="sudokuInput(${n})" style="width:40px;height:40px;font-size:16px;font-weight:700">${n}</button>`).join('')}
        <button class="editor-btn" onclick="sudokuInput(0)" style="width:40px;height:40px;font-size:16px">⌫</button>
      </div>
      <div id="sudoku-status" style="font-size:13px;color:var(--text-dim)">Select a cell and type a number</div>
      <div id="sudoku-timer" style="font-size:22px;font-weight:300;font-family:'Source Code Pro',monospace;color:var(--accent)">0:00</div>
    </div>
  </div>`;
}

let sudokuGrid=[], sudokuFixed=[], sudokuSelected=null, sudokuTimerSec=0, sudokuTimerInt=null;
function initSudoku() { sudokuNew(); }
function sudokuNew() {
  clearInterval(sudokuTimerInt); sudokuTimerSec=0; sudokuSelected=null;
  const diff = document.getElementById('sudoku-diff')?.value||'medium';
  const blanks = diff==='easy'?30:diff==='medium'?45:55;
  // Generate solved board
  sudokuGrid = Array.from({length:9},()=>Array(9).fill(0));
  sudokuFill(0,0);
  sudokuFixed = sudokuGrid.map(r=>r.map(v=>v));
  // Remove cells
  let removed=0;
  while(removed<blanks){const r=Math.floor(Math.random()*9),c=Math.floor(Math.random()*9);if(sudokuFixed[r][c]!==0){sudokuFixed[r][c]=0;removed++;}}
  sudokuGrid=sudokuFixed.map(r=>[...r]);
  sudokuRender();
  sudokuTimerInt=setInterval(()=>{sudokuTimerSec++;const m=Math.floor(sudokuTimerSec/60),s=sudokuTimerSec%60;const el=document.getElementById('sudoku-timer');if(el)el.textContent=`${m}:${s.toString().padStart(2,'0')}`;else clearInterval(sudokuTimerInt);},1000);
}
function sudokuFill(r,c){
  if(r===9)return true;
  const nr=c===8?r+1:r,nc=c===8?0:c+1;
  if(sudokuGrid[r][c]!==0)return sudokuFill(nr,nc);
  const nums=[1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-.5);
  for(const n of nums){if(sudokuValid(r,c,n)){sudokuGrid[r][c]=n;if(sudokuFill(nr,nc))return true;sudokuGrid[r][c]=0;}}
  return false;
}
function sudokuValid(r,c,n){
  for(let i=0;i<9;i++){if(sudokuGrid[r][i]===n&&i!==c)return false;if(sudokuGrid[i][c]===n&&i!==r)return false;}
  const br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;
  for(let i=0;i<3;i++)for(let j=0;j<3;j++){if(sudokuGrid[br+i][bc+j]===n&&(br+i!==r||bc+j!==c))return false;}
  return true;
}
function sudokuRender(){
  const board=document.getElementById('sudoku-board');if(!board)return;
  board.innerHTML='';
  for(let r=0;r<9;r++)for(let c=0;c<9;c++){
    const cell=document.createElement('div');
    const isFixed=sudokuFixed[r][c]!==0;
    const isSel=sudokuSelected&&sudokuSelected[0]===r&&sudokuSelected[1]===c;
    const val=sudokuGrid[r][c];
    const isWrong=val!==0&&!sudokuValid(r,c,val);
    cell.style.cssText=`width:48px;height:48px;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:${isFixed?'default':'pointer'};font-weight:${isFixed?700:400};
      color:${isFixed?'var(--text)':isWrong?'var(--red)':'var(--accent)'};
      background:${isSel?'rgba(94,129,244,.3)':'transparent'};
      border-right:${(c+1)%3===0&&c<8?'2px solid rgba(255,255,255,.3)':'1px solid rgba(255,255,255,.1)'};
      border-bottom:${(r+1)%3===0&&r<8?'2px solid rgba(255,255,255,.3)':'1px solid rgba(255,255,255,.1)'}`;
    if(val!==0)cell.textContent=val;
    if(!isFixed)cell.onclick=()=>{sudokuSelected=[r,c];sudokuRender();};
    board.appendChild(cell);
  }
}
function sudokuInput(n){
  if(!sudokuSelected)return;const[r,c]=sudokuSelected;
  if(sudokuFixed[r][c]!==0)return;
  sudokuGrid[r][c]=n;sudokuRender();
  if(sudokuGrid.every(row=>row.every(v=>v!==0))){clearInterval(sudokuTimerInt);const m=Math.floor(sudokuTimerSec/60),s=sudokuTimerSec%60;document.getElementById('sudoku-status').textContent=`🎉 Solved in ${m}:${s.toString().padStart(2,'0')}!`;showNotif('🎉','Sudoku','Puzzle solved!');}
}
function sudokuSolve(){
  const solved=sudokuGrid.map(r=>[...r]);
  if(sudokuSolveHelper(solved)){sudokuGrid=solved;sudokuRender();showNotif('🔍','Sudoku','Board solved!');}
}
function sudokuSolveHelper(g){
  for(let r=0;r<9;r++)for(let c=0;c<9;c++){if(g[r][c]===0){for(let n=1;n<=9;n++){const tmp=sudokuGrid;sudokuGrid=g;if(sudokuValid(r,c,n)){g[r][c]=n;sudokuGrid=tmp;if(sudokuSolveHelper(g))return true;g[r][c]=0;}else{sudokuGrid=tmp;}}return false;}}return true;
}
function sudokuHint(){
  for(let r=0;r<9;r++)for(let c=0;c<9;c++){if(sudokuGrid[r][c]===0){const solved=sudokuGrid.map(r=>[...r]);if(sudokuSolveHelper(solved)){sudokuGrid[r][c]=solved[r][c];sudokuSelected=[r,c];sudokuRender();showNotif('💡','Hint',`Placed ${solved[r][c]} at row ${r+1}, col ${c+1}`);return;}}}
}
document.addEventListener('keydown',e=>{
  if(!document.getElementById('sudoku-board'))return;
  const n=parseInt(e.key);if(n>=1&&n<=9)sudokuInput(n);
  if(e.key==='Backspace'||e.key==='Delete')sudokuInput(0);
  if(sudokuSelected){const[r,c]=sudokuSelected;if(e.key==='ArrowUp'&&r>0)sudokuSelected=[r-1,c];if(e.key==='ArrowDown'&&r<8)sudokuSelected=[r+1,c];if(e.key==='ArrowLeft'&&c>0)sudokuSelected=[r,c-1];if(e.key==='ArrowRight'&&c<8)sudokuSelected=[r,c+1];sudokuRender();}
});

// ─── STOCK / CRYPTO TRACKER ───────────────────────────
function buildStocktracker() {
  const assets = [
    {sym:'AAPL', name:'Apple Inc.',       price:189.30, change:+1.24, pct:+0.66, type:'stock'},
    {sym:'MSFT', name:'Microsoft Corp.',  price:415.50, change:+3.20, pct:+0.78, type:'stock'},
    {sym:'GOOGL',name:'Alphabet Inc.',    price:175.80, change:-0.95, pct:-0.54, type:'stock'},
    {sym:'NVDA', name:'NVIDIA Corp.',     price:875.40, change:+12.3, pct:+1.43, type:'stock'},
    {sym:'TSLA', name:'Tesla Inc.',       price:245.60, change:-4.20, pct:-1.68, type:'stock'},
    {sym:'AMZN', name:'Amazon.com',       price:198.20, change:+2.10, pct:+1.07, type:'stock'},
    {sym:'META', name:'Meta Platforms',   price:512.70, change:+8.40, pct:+1.67, type:'stock'},
    {sym:'BTC',  name:'Bitcoin',          price:67420,  change:+1250, pct:+1.89, type:'crypto'},
    {sym:'ETH',  name:'Ethereum',         price:3840,   change:-45,   pct:-1.16, type:'crypto'},
    {sym:'SOL',  name:'Solana',           price:185.20, change:+4.80, pct:+2.66, type:'crypto'},
    {sym:'BNB',  name:'Binance Coin',     price:612.50, change:-8.20, pct:-1.32, type:'crypto'},
    {sym:'ADA',  name:'Cardano',          price:0.62,   change:+0.02, pct:+3.33, type:'crypto'},
  ];
  return `<div id="stocktracker-content" style="display:flex;flex-direction:column;height:100%;background:#0a0a14">
    <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--win-bar);border-bottom:1px solid var(--border)">
      <span style="font-weight:700;font-size:15px">📈 Market</span>
      <div style="display:flex;gap:4px">
        <button class="editor-btn st-tab active" onclick="stockTab('all',this)">All</button>
        <button class="editor-btn st-tab" onclick="stockTab('stock',this)">Stocks</button>
        <button class="editor-btn st-tab" onclick="stockTab('crypto',this)">Crypto</button>
      </div>
      <span id="stock-last-update" style="font-size:11px;color:var(--text-dim);margin-left:auto"></span>
      <button class="editor-btn" onclick="stockRefresh()">↻ Refresh</button>
    </div>
    <div id="stock-ticker" style="padding:6px 16px;background:rgba(0,0,0,.3);border-bottom:1px solid var(--border);overflow:hidden;white-space:nowrap">
      <span id="stock-ticker-inner" style="display:inline-block;animation:tickerScroll 30s linear infinite;font-size:12px;font-family:'Source Code Pro',monospace"></span>
    </div>
    <div style="flex:1;display:flex;min-height:0">
      <div id="stock-list" style="width:380px;overflow-y:auto;border-right:1px solid var(--border)">
        ${assets.map(a=>`
          <div class="stock-row" data-type="${a.type}" onclick="stockSelect('${a.sym}')" style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;transition:background .12s">
            <div style="width:44px;height:44px;border-radius:10px;background:${a.type==='crypto'?'linear-gradient(135deg,#f97316,#ea580c)':'linear-gradient(135deg,#5e81f4,#4f46e5)'};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;flex-shrink:0">${a.sym.slice(0,3)}</div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:13px">${a.sym}</div>
              <div style="font-size:11px;color:var(--text-dim)">${a.name}</div>
            </div>
            <div style="text-align:right">
              <div style="font-weight:700;font-size:14px;font-family:'Source Code Pro',monospace">$${a.price.toLocaleString()}</div>
              <div style="font-size:12px;color:${a.change>=0?'#6bcb77':'#ff6b6b'};font-family:'Source Code Pro',monospace">${a.change>=0?'+':''}${a.change} (${a.pct>=0?'+':''}${a.pct}%)</div>
            </div>
          </div>`).join('')}
      </div>
      <div id="stock-detail" style="flex:1;padding:20px;overflow-y:auto;display:flex;flex-direction:column;gap:16px">
        <div style="color:var(--text-dim);text-align:center;margin-top:40px;font-size:13px">👈 Select an asset to view details</div>
      </div>
    </div>
  </div>`;
}

let stockCurrentType = 'all';
function initStocktracker() {
  const style = document.createElement('style');
  style.textContent = '.stock-row:hover{background:rgba(255,255,255,.05)!important} @keyframes tickerScroll{from{transform:translateX(100%)}to{transform:translateX(-100%)}}';
  document.head.appendChild(style);
  stockUpdateTicker();
  stockRefresh();
}
function stockUpdateTicker() {
  const tickers = ['AAPL $189.30 ▲','MSFT $415.50 ▲','NVDA $875.40 ▲','BTC $67,420 ▲','ETH $3,840 ▼','TSLA $245.60 ▼','GOOGL $175.80 ▼','SOL $185.20 ▲'];
  const el = document.getElementById('stock-ticker-inner');
  if (el) el.textContent = tickers.map(t=>`  •  ${t}`).join('');
}
function stockTab(type, btn) {
  stockCurrentType = type;
  document.querySelectorAll('.st-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.stock-row').forEach(r=>{
    r.style.display = (type==='all'||r.dataset.type===type)?'flex':'none';
  });
}
function stockRefresh() {
  document.getElementById('stock-last-update').textContent = 'Updated: '+new Date().toLocaleTimeString();
  showNotif('📈','Market','Prices refreshed');
}
function stockSelect(sym) {
  const detail = document.getElementById('stock-detail'); if (!detail) return;
  const pts = Array.from({length:30},(_,i)=>(Math.random()-.45)*5).reduce((acc,v,i)=>[...acc,((acc[i-1]||100)+v).toFixed(2)],[]);
  const max=Math.max(...pts), min=Math.min(...pts), range=max-min||1;
  const w=400,h=160;
  const pathPts = pts.map((v,i)=>`${(i/(pts.length-1))*w},${h-((v-min)/range*h*.8+h*.1)}`).join(' ');
  const colors = {AAPL:'#4285f4',MSFT:'#00a4ef',GOOGL:'#34a853',NVDA:'#76b900',TSLA:'#e31937',AMZN:'#ff9900',META:'#0467df',BTC:'#f7931a',ETH:'#627eea',SOL:'#9945ff',BNB:'#f3ba2f',ADA:'#0033ad'};
  const col=colors[sym]||'var(--accent)';
  detail.innerHTML=`
    <div style="font-size:22px;font-weight:800">${sym}</div>
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      ${[['Open','$'+pts[0]],['High','$'+max],['Low','$'+min],['Volume',Math.floor(Math.random()*50+10)+'M'],['Mkt Cap','$'+(Math.floor(Math.random()*2000+100))+'B'],['P/E',Math.floor(Math.random()*50+10)]].map(([l,v])=>`
        <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 14px;min-width:90px">
          <div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;font-weight:700">${l}</div>
          <div style="font-size:16px;font-weight:700;margin-top:2px;font-family:'Source Code Pro',monospace">${v}</div>
        </div>`).join('')}
    </div>
    <div style="background:rgba(0,0,0,.3);border-radius:12px;padding:12px;border:1px solid var(--border)">
      <div style="font-size:12px;color:var(--text-dim);margin-bottom:8px">30-Day Price Chart</div>
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px">
        <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${col}" stop-opacity=".3"/><stop offset="100%" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
        <polygon points="${pathPts} ${w},${h} 0,${h}" fill="url(#sg)"/>
        <polyline points="${pathPts}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linejoin="round"/>
      </svg>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${['Buy','Sell','Alert','Watchlist'].map(a=>`<button class="editor-btn" onclick="showNotif('📈','${sym}','${a} order placed')">${a}</button>`).join('')}
    </div>`;
}

// ─── VM / DOCKER SIMULATOR ────────────────────────────
function buildVmdocker() {
  return `<div id="vm-content" style="display:flex;flex-direction:column;height:100%;background:#0a0f18">
    <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;background:var(--win-bar);border-bottom:1px solid var(--border)">
      <span style="font-weight:700;font-size:14px">🐳 Docker / VM Manager</span>
      <div style="display:flex;gap:4px;margin-left:auto">
        <button class="editor-btn" onclick="vmPull()">⬇ Pull Image</button>
        <button class="editor-btn" onclick="vmRun()">▶ Run Container</button>
        <button class="editor-btn" onclick="vmRefresh()">↻ Refresh</button>
      </div>
    </div>
    <div style="display:flex;gap:0;border-bottom:1px solid var(--border);background:rgba(0,0,0,.2)">
      <button class="editor-btn vm-tab active" onclick="vmTab('containers',this)" style="border-radius:0;border:none;border-bottom:2px solid var(--accent)">🗂 Containers</button>
      <button class="editor-btn vm-tab" onclick="vmTab('images',this)" style="border-radius:0;border:none;border-bottom:2px solid transparent">📦 Images</button>
      <button class="editor-btn vm-tab" onclick="vmTab('volumes',this)" style="border-radius:0;border:none;border-bottom:2px solid transparent">💾 Volumes</button>
      <button class="editor-btn vm-tab" onclick="vmTab('networks',this)" style="border-radius:0;border:none;border-bottom:2px solid transparent">🌐 Networks</button>
    </div>
    <div id="vm-containers" class="vm-panel" style="flex:1;overflow-y:auto;padding:12px"></div>
    <div id="vm-images" class="vm-panel" style="flex:1;overflow-y:auto;padding:12px;display:none"></div>
    <div id="vm-volumes" class="vm-panel" style="flex:1;overflow-y:auto;padding:12px;display:none"></div>
    <div id="vm-networks" class="vm-panel" style="flex:1;overflow-y:auto;padding:12px;display:none"></div>
    <div id="vm-log" style="height:100px;background:#040810;border-top:1px solid var(--border);padding:8px 12px;font-family:'Source Code Pro',monospace;font-size:11px;color:#48cfad;overflow-y:auto;flex-shrink:0"></div>
  </div>`;
}

const VM_CONTAINERS = [
  {id:'a3f2b1c',name:'nginx-proxy',image:'nginx:latest',status:'running',ports:'80:80, 443:443',cpu:'0.2%',mem:'18MB',uptime:'2d 14h'},
  {id:'b7e9d4f',name:'postgres-db',image:'postgres:15',status:'running',ports:'5432:5432',cpu:'1.1%',mem:'124MB',uptime:'5d 3h'},
  {id:'c2a8e5b',name:'redis-cache',image:'redis:7',status:'running',ports:'6379:6379',cpu:'0.0%',mem:'8MB',uptime:'5d 3h'},
  {id:'d1f3c9e',name:'node-api',image:'node:20',status:'stopped',ports:'3000:3000',cpu:'—',mem:'—',uptime:'—'},
  {id:'e4b7a2d',name:'python-worker',image:'python:3.11',status:'running',ports:'—',cpu:'3.4%',mem:'67MB',uptime:'1h 22m'},
  {id:'f6c3b8a',name:'arcos-dev',image:'arcos/dev:latest',status:'paused',ports:'8080:8080',cpu:'—',mem:'245MB',uptime:'—'},
];
const VM_IMAGES = [
  {name:'nginx',tag:'latest',size:'187MB',id:'4f28e50'},
  {name:'postgres',tag:'15',size:'412MB',id:'89a7c31'},
  {name:'redis',tag:'7',size:'117MB',id:'2b94e67'},
  {name:'node',tag:'20',size:'1.1GB',id:'c38f124'},
  {name:'python',tag:'3.11',size:'920MB',id:'7d51b89'},
  {name:'arcos/dev',tag:'latest',size:'2.3GB',id:'f14e902'},
];

function initVmdocker() { vmRenderContainers(); vmRenderImages(); vmLog('Docker daemon connected. 6 containers loaded.'); }
function vmRenderContainers() {
  const el=document.getElementById('vm-containers');if(!el)return;
  el.innerHTML=VM_CONTAINERS.map(c=>`
    <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:12px">
      <div style="width:10px;height:10px;border-radius:50%;flex-shrink:0;background:${c.status==='running'?'#6bcb77':c.status==='paused'?'#ffd93d':'#ff6b6b'}"></div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:13px">${c.name}</div>
        <div style="font-size:11px;color:var(--text-dim);font-family:'Source Code Pro',monospace">${c.image} · ${c.ports||'no ports'}</div>
      </div>
      <div style="font-size:11px;color:var(--text-dim);text-align:right;min-width:80px">
        <div>CPU: ${c.cpu}</div><div>Mem: ${c.mem}</div>
      </div>
      <div style="display:flex;gap:4px">
        ${c.status==='running'?`<button class="editor-btn" onclick="vmAction('${c.name}','stop')" style="font-size:11px;padding:3px 8px">⏹</button><button class="editor-btn" onclick="vmAction('${c.name}','logs')" style="font-size:11px;padding:3px 8px">📋</button>`:''}
        ${c.status==='stopped'?`<button class="editor-btn" onclick="vmAction('${c.name}','start')" style="font-size:11px;padding:3px 8px">▶</button>`:''}
        ${c.status==='paused'?`<button class="editor-btn" onclick="vmAction('${c.name}','resume')" style="font-size:11px;padding:3px 8px">▶</button>`:''}
        <button class="editor-btn" onclick="vmAction('${c.name}','rm')" style="font-size:11px;padding:3px 8px;background:rgba(255,107,107,.2);border-color:var(--red);color:var(--red)">🗑</button>
      </div>
    </div>`).join('');
}
function vmRenderImages() {
  const el=document.getElementById('vm-images');if(!el)return;
  el.innerHTML=VM_IMAGES.map(i=>`
    <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:center;gap:12px;font-family:'Source Code Pro',monospace;font-size:12px">
      <span style="font-size:20px">📦</span>
      <span style="font-weight:700;color:var(--accent);flex:1">${i.name}:${i.tag}</span>
      <span style="color:var(--text-dim)">${i.size}</span>
      <span style="color:var(--text-dim)">${i.id}</span>
      <button class="editor-btn" onclick="vmLog('Running container from ${i.name}:${i.tag}…');showNotif('🐳','Docker','Container started from ${i.name}:${i.tag}')" style="font-size:11px;padding:3px 8px">▶ Run</button>
      <button class="editor-btn" onclick="vmLog('Removing image ${i.name}:${i.tag}…')" style="font-size:11px;padding:3px 8px;background:rgba(255,107,107,.2);border-color:var(--red);color:var(--red)">🗑</button>
    </div>`).join('');
}
function vmTab(tab, btn) {
  document.querySelectorAll('.vm-panel').forEach(p=>p.style.display='none');
  document.querySelectorAll('.vm-tab').forEach(b=>{b.style.borderBottomColor='transparent';b.classList.remove('active');});
  document.getElementById('vm-'+tab).style.display='block';
  btn.style.borderBottomColor='var(--accent)';btn.classList.add('active');
}
function vmAction(name, action) {
  const msgs={stop:`Stopping ${name}…`,start:`Starting ${name}…`,logs:`Fetching logs for ${name}…`,rm:`Removing container ${name}…`,resume:`Resuming ${name}…`};
  vmLog(msgs[action]||`${action} ${name}`);
  showNotif('🐳','Docker',msgs[action]||`${action} on ${name}`);
}
function vmLog(msg) {
  const el=document.getElementById('vm-log');if(!el)return;
  el.innerHTML+=`<span style="color:rgba(72,207,173,.5)">[${new Date().toLocaleTimeString()}]</span> ${msg}\n`;
  el.scrollTop=el.scrollHeight;
}
function vmPull() {
  const img=prompt('Image to pull (e.g. ubuntu:22.04):','alpine:latest');if(!img)return;
  vmLog(`Pulling ${img}…`);
  setTimeout(()=>vmLog(`✓ ${img} pulled successfully (${Math.floor(Math.random()*400+50)}MB)`),1200);
  showNotif('⬇️','Docker','Pulling '+img);
}
function vmRun() {
  const img=prompt('Run image:','nginx:latest');if(!img)return;
  vmLog(`docker run -d ${img}`);
  showNotif('🐳','Docker','Container started from '+img);
}
function vmRefresh(){vmLog('Refreshing container list…');showNotif('↻','Docker','Refreshed');}

// ─── PASSWORD VAULT ───────────────────────────────────
function buildVault() {
  return `<div id="vault-content" style="display:flex;flex-direction:column;height:100%;background:#0a0a14">
    <div id="vault-lock-screen" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px">
      <div style="font-size:48px">🔐</div>
      <div style="font-size:20px;font-weight:700">ArcOS Vault</div>
      <div style="font-size:13px;color:var(--text-dim)">Enter your master password to unlock</div>
      <input type="password" id="vault-master-input" placeholder="Master password" style="padding:12px 16px;background:rgba(255,255,255,.07);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:14px;width:280px;outline:none;text-align:center" onkeydown="if(event.key==='Enter')vaultUnlock()">
      <button onclick="vaultUnlock()" style="background:var(--accent);border:none;color:#fff;padding:10px 30px;border-radius:10px;cursor:pointer;font-size:14px;font-weight:700;font-family:inherit">🔓 Unlock</button>
      <div style="font-size:11px;color:var(--text-dim)">Default: "arcos" · Change in settings</div>
    </div>
    <div id="vault-main" style="display:none;flex:1;flex-direction:column">
      <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--win-bar);border-bottom:1px solid var(--border)">
        <span style="font-weight:700">🔐 Vault</span>
        <input id="vault-search" type="text" placeholder="Search…" style="flex:1;padding:5px 10px;background:rgba(255,255,255,.07);border:1px solid var(--border);border-radius:7px;color:var(--text);font-size:12px;outline:none" oninput="vaultFilter(this.value)">
        <button class="editor-btn" onclick="vaultAdd()">+ Add</button>
        <button class="editor-btn" onclick="vaultLock()" style="background:rgba(255,107,107,.15);border-color:var(--red);color:var(--red)">🔒 Lock</button>
      </div>
      <div id="vault-list" style="flex:1;overflow-y:auto;padding:10px"></div>
    </div>
  </div>`;
}

let vaultData = [], vaultUnlocked = false;
function initVault() {
  try { vaultData = JSON.parse(localStorage.getItem('arcos_vault') || '[]'); } catch { vaultData=[]; }
  if (vaultData.length === 0) {
    vaultData = [
      {id:1,site:'github.com',username:'arcuser',password:'gh_token_abc123',notes:'Personal account',icon:'🐙'},
      {id:2,site:'gmail.com',username:'arc@gmail.com',password:'SecureP@ss2024',notes:'',icon:'📧'},
      {id:3,site:'netflix.com',username:'arc@gmail.com',password:'NetFl1x!2024',notes:'Family plan',icon:'🎬'},
      {id:4,site:'amazon.com',username:'arc@gmail.com',password:'Am@zon#Secure',notes:'Prime account',icon:'📦'},
    ];
  }
}
function vaultUnlock() {
  const pass = document.getElementById('vault-master-input')?.value;
  const stored = localStorage.getItem('arcos_vault_pass') || 'arcos';
  if (pass === stored) {
    vaultUnlocked = true;
    document.getElementById('vault-lock-screen').style.display = 'none';
    document.getElementById('vault-main').style.display = 'flex';
    vaultRender(vaultData);
  } else {
    showNotif('❌','Vault','Wrong master password');
    document.getElementById('vault-master-input').style.borderColor='var(--red)';
    setTimeout(()=>document.getElementById('vault-master-input').style.borderColor='var(--border)',1000);
  }
}
function vaultLock() {
  vaultUnlocked=false;
  document.getElementById('vault-lock-screen').style.display='flex';
  document.getElementById('vault-main').style.display='none';
  document.getElementById('vault-master-input').value='';
}
function vaultRender(data) {
  const el=document.getElementById('vault-list');if(!el)return;
  el.innerHTML=data.map(v=>`
    <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:7px;display:flex;align-items:center;gap:12px;transition:background .12s" onmouseover="this.style.background='var(--card-hover)'" onmouseout="this.style.background='var(--card)'">
      <div style="font-size:24px">${v.icon||'🔑'}</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:13px">${v.site}</div>
        <div style="font-size:12px;color:var(--text-dim)">${v.username}</div>
        ${v.notes?`<div style="font-size:11px;color:rgba(255,255,255,.3)">${v.notes}</div>`:''}
      </div>
      <div style="display:flex;gap:5px">
        <button class="editor-btn" onclick="vaultCopyPass(${v.id})" style="font-size:11px;padding:4px 9px" title="Copy password">📋 Copy</button>
        <button class="editor-btn" onclick="vaultReveal(${v.id})" style="font-size:11px;padding:4px 9px" title="Reveal">👁</button>
        <button class="editor-btn" onclick="vaultEdit(${v.id})" style="font-size:11px;padding:4px 9px">✏️</button>
        <button class="editor-btn" onclick="vaultDelete(${v.id})" style="font-size:11px;padding:4px 9px;background:rgba(255,107,107,.15);border-color:var(--red);color:var(--red)">🗑</button>
      </div>
      <div id="vault-pw-${v.id}" style="font-size:12px;color:var(--accent3);font-family:'Source Code Pro',monospace;display:none;max-width:150px;word-break:break-all">${v.password}</div>
    </div>`).join('');
}
function vaultCopyPass(id) {
  const v=vaultData.find(x=>x.id===id);if(!v)return;
  navigator.clipboard?.writeText(v.password);
  showNotif('📋','Vault','Password copied for '+v.site);
}
function vaultReveal(id) {
  const el=document.getElementById('vault-pw-'+id);if(!el)return;
  el.style.display=el.style.display==='none'?'block':'none';
}
function vaultFilter(q) { vaultRender(vaultData.filter(v=>v.site.toLowerCase().includes(q.toLowerCase())||v.username.toLowerCase().includes(q.toLowerCase()))); }
function vaultAdd() {
  const site=prompt('Website:'); if(!site)return;
  const user=prompt('Username/Email:'); if(!user)return;
  const pass=prompt('Password:'); if(!pass)return;
  const icons={'github':'🐙','gmail':'📧','google':'🔍','facebook':'👤','twitter':'🐦','amazon':'📦','netflix':'🎬','spotify':'🎵','apple':'🍎'};
  const icon=Object.entries(icons).find(([k])=>site.toLowerCase().includes(k))?.[1]||'🔑';
  const entry={id:Date.now(),site,username:user,password:pass,notes:'',icon};
  vaultData.push(entry);
  localStorage.setItem('arcos_vault',JSON.stringify(vaultData));
  vaultRender(vaultData);
  showNotif('🔐','Vault','Entry added for '+site);
}
function vaultEdit(id) {
  const v=vaultData.find(x=>x.id===id);if(!v)return;
  const newPass=prompt('New password (leave empty to keep):','');
  if(newPass){v.password=newPass;localStorage.setItem('arcos_vault',JSON.stringify(vaultData));showNotif('✏️','Vault','Password updated for '+v.site);}
}
function vaultDelete(id) {
  if(!confirm('Delete this entry?'))return;
  vaultData=vaultData.filter(x=>x.id!==id);
  localStorage.setItem('arcos_vault',JSON.stringify(vaultData));
  vaultRender(vaultData);
}

// ─── E-BOOK READER ────────────────────────────────────
function buildEbook() {
  const sampleBook = `<h1>The Art of Computing</h1>
<h2>Chapter 1: The Beginning</h2>
<p>In the beginning, there was the punch card. Long before the glowing screens and wireless keyboards of today, computation was performed by teams of human "computers" — people whose job was to calculate numbers by hand.</p>
<p>Ada Lovelace, often credited as the world's first programmer, wrote algorithms intended for Charles Babbage's Analytical Engine in 1843. She recognized that the machine could go beyond mere calculation to compose music, produce graphics, and be used for any problem that could be expressed in mathematical terms.</p>
<h2>Chapter 2: The Binary World</h2>
<p>At the heart of every modern computer lies a simple truth: everything is a zero or a one. This binary system, developed by Gottfried Wilhelm Leibniz in the 17th century, became the foundation upon which the entire digital age was built.</p>
<p>A single bit can represent two states. Eight bits make a byte, capable of representing 256 different values. From these humble building blocks emerge the rich tapestries of images, sounds, videos, and programs that define our digital lives.</p>
<h2>Chapter 3: The Internet Age</h2>
<p>When Tim Berners-Lee proposed the World Wide Web in 1989, he described it as a "vague but exciting" idea. His vision of a globally connected system of documents linked by hypertext would transform civilization in ways even he could not fully anticipate.</p>
<p>Today, over 5 billion people use the internet. In a single minute, 500 hours of video are uploaded to YouTube, 6 million Google searches are made, and 200 million emails are sent. The scale is almost incomprehensible.</p>
<h2>Chapter 4: Artificial Intelligence</h2>
<p>The dream of creating artificial minds is as old as computing itself. Alan Turing proposed his famous test in 1950: if a machine could converse indistinguishably from a human, could we say it was intelligent?</p>
<p>Modern large language models, trained on vast swaths of human-generated text, represent perhaps the most dramatic leap forward yet. They can write poetry, debug code, explain complex concepts, and engage in nuanced conversation — though whether this constitutes true "intelligence" remains one of the great philosophical questions of our time.</p>`;
  return `<div id="ebook-content" style="display:flex;flex-direction:column;height:100%;background:#0c0c16">
    <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;background:var(--win-bar);border-bottom:1px solid var(--border)">
      <button class="editor-btn" onclick="ebookOpen()">📂 Open</button>
      <input type="file" id="ebook-file" accept=".txt,.md,.html,.epub" style="display:none" onchange="ebookLoad(this)">
      <span id="ebook-title" style="font-weight:700;font-size:13px;flex:1;text-align:center">The Art of Computing</span>
      <label style="font-size:12px;color:var(--text-dim)">Font</label>
      <input type="range" min="12" max="22" value="16" id="ebook-font-size" oninput="document.getElementById('ebook-reader').style.fontSize=this.value+'px'" style="width:70px;accent-color:var(--accent)">
      <select class="settings-select" id="ebook-theme" onchange="ebookTheme(this.value)" style="font-size:11px">
        <option value="dark">Dark</option>
        <option value="sepia">Sepia</option>
        <option value="light">Light</option>
        <option value="night">Night</option>
      </select>
    </div>
    <div id="ebook-reader" style="flex:1;overflow-y:auto;padding:40px;max-width:700px;margin:0 auto;font-size:16px;line-height:1.9;color:#d4d4e0;font-family:'Nunito',sans-serif">
      ${sampleBook}
    </div>
    <div style="padding:8px 16px;background:var(--win-bar);border-top:1px solid var(--border);display:flex;align-items:center;gap:12px;font-size:12px;color:var(--text-dim)">
      <span id="ebook-progress">Reading: 0%</span>
      <div style="flex:1;height:3px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden"><div id="ebook-progress-bar" style="height:100%;background:var(--accent);border-radius:2px;width:0%;transition:width .3s"></div></div>
      <span id="ebook-words">~800 words</span>
    </div>
  </div>`;
}
function initEbook() {
  const reader = document.getElementById('ebook-reader');
  if (reader) reader.addEventListener('scroll', ebookScrollTrack);
}
function ebookScrollTrack() {
  const el=document.getElementById('ebook-reader');if(!el)return;
  const pct=Math.round(el.scrollTop/(el.scrollHeight-el.clientHeight)*100);
  document.getElementById('ebook-progress').textContent=`Reading: ${pct}%`;
  document.getElementById('ebook-progress-bar').style.width=pct+'%';
}
function ebookOpen() { document.getElementById('ebook-file')?.click(); }
function ebookLoad(inp) {
  const f=inp.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=e=>{
    const reader=document.getElementById('ebook-reader');
    document.getElementById('ebook-title').textContent=f.name.replace(/\.[^.]+$/,'');
    if(reader){
      if(f.name.endsWith('.md')||f.name.endsWith('.txt')){
        reader.innerHTML=`<pre style="white-space:pre-wrap;font-family:inherit">${e.target.result}</pre>`;
      } else {
        reader.innerHTML=e.target.result;
      }
    }
    const words=e.target.result.replace(/<[^>]*>/g,'').split(/\s+/).length;
    document.getElementById('ebook-words').textContent=`~${words.toLocaleString()} words`;
    showNotif('📚','E-Book',f.name+' opened');
  };
  r.readAsText(f);
}
function ebookTheme(theme) {
  const reader=document.getElementById('ebook-reader');if(!reader)return;
  const themes={dark:{bg:'#0c0c16',color:'#d4d4e0'},sepia:{bg:'#2c1f0e',color:'#c9b08a'},light:{bg:'#f5f5f0',color:'#2c2c2c'},night:{bg:'#000000',color:'#a0a0b0'}};
  const t=themes[theme]||themes.dark;
  reader.style.background=t.bg;reader.style.color=t.color;
}

// ─── PHOTO EDITOR ─────────────────────────────────────
function buildPhotoeditor() {
  return `<div id="photoeditor-content" style="display:flex;flex-direction:column;height:100%;background:#0a0a14">
    <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;background:var(--win-bar);border-bottom:1px solid var(--border);flex-wrap:wrap">
      <button class="editor-btn" onclick="photoOpen()">📂 Open</button>
      <button class="editor-btn" onclick="photoSave()">💾 Save</button>
      <input type="file" id="photo-file" accept="image/*" style="display:none" onchange="photoLoad(this)">
      <div style="width:1px;height:20px;background:var(--border);margin:0 4px"></div>
      <button class="editor-btn" onclick="photoFilter('none')">Original</button>
      <button class="editor-btn" onclick="photoFilter('grayscale')">B&W</button>
      <button class="editor-btn" onclick="photoFilter('sepia')">Sepia</button>
      <button class="editor-btn" onclick="photoFilter('invert')">Invert</button>
      <button class="editor-btn" onclick="photoFilter('saturate')">Vivid</button>
      <button class="editor-btn" onclick="photoFilter('cool')">Cool</button>
      <button class="editor-btn" onclick="photoFilter('warm')">Warm</button>
      <button class="editor-btn" onclick="photoFilter('dramatic')">Dramatic</button>
      <div style="width:1px;height:20px;background:var(--border);margin:0 4px"></div>
      <button class="editor-btn" onclick="photoCrop()">✂ Crop</button>
      <button class="editor-btn" onclick="photoRotate(-90)">↺ Rotate</button>
      <button class="editor-btn" onclick="photoFlip('h')">↔ Flip H</button>
      <button class="editor-btn" onclick="photoFlip('v')">↕ Flip V</button>
    </div>
    <div style="display:flex;gap:0;height:calc(100% - 80px)">
      <div style="width:200px;background:rgba(0,0,0,.3);border-right:1px solid var(--border);padding:12px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;flex-shrink:0">
        ${[
          ['Brightness','photo-brightness','0','-100','100'],
          ['Contrast','photo-contrast','0','-100','100'],
          ['Saturation','photo-sat','0','-100','100'],
          ['Hue Rotate','photo-hue','0','0','360'],
          ['Blur','photo-blur','0','0','20'],
          ['Sharpen','photo-sharp','0','0','10'],
          ['Opacity','photo-opacity','100','10','100'],
          ['Vignette','photo-vignette','0','0','100'],
        ].map(([label,id,def,min,max])=>`
          <div>
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
              <span style="color:var(--text-dim)">${label}</span>
              <span id="${id}-val" style="color:var(--accent);font-family:'Source Code Pro',monospace">${def}</span>
            </div>
            <input type="range" min="${min}" max="${max}" value="${def}" id="${id}" style="width:100%;accent-color:var(--accent)" oninput="photoAdjust();document.getElementById('${id}-val').textContent=this.value">
          </div>`).join('')}
        <button class="editor-btn" onclick="photoResetAdj()" style="margin-top:4px">↺ Reset All</button>
        <div style="border-top:1px solid var(--border);padding-top:10px;font-size:11px;color:var(--text-dim)">
          <div id="photo-info">No image loaded</div>
        </div>
      </div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.4);overflow:hidden;position:relative">
        <div id="photo-placeholder" style="color:var(--text-dim);text-align:center">
          <div style="font-size:48px;margin-bottom:12px">🖼️</div>
          <div>Open an image to start editing</div>
          <div style="font-size:12px;margin-top:6px;color:rgba(255,255,255,.3)">JPG · PNG · GIF · WebP · SVG</div>
        </div>
        <canvas id="photo-canvas" style="display:none;max-width:100%;max-height:100%;object-fit:contain"></canvas>
      </div>
    </div>
  </div>`;
}

let photoImg = null, photoOrigData = null, photoRotation = 0, photoFlipH = false, photoFlipV = false;
function photoOpen() { document.getElementById('photo-file')?.click(); }
function photoLoad(inp) {
  const f=inp.files[0];if(!f)return;
  const url=URL.createObjectURL(f);
  photoImg=new Image();
  photoImg.onload=()=>{
    const canvas=document.getElementById('photo-canvas');
    const ph=document.getElementById('photo-placeholder');
    if(!canvas)return;
    canvas.style.display='block';if(ph)ph.style.display='none';
    canvas.width=photoImg.width;canvas.height=photoImg.height;
    const ctx=canvas.getContext('2d');
    ctx.drawImage(photoImg,0,0);
    photoOrigData=ctx.getImageData(0,0,canvas.width,canvas.height);
    document.getElementById('photo-info').innerHTML=`${f.name}<br>${photoImg.width}×${photoImg.height}<br>${(f.size/1024).toFixed(1)}KB`;
    photoAdjust();showNotif('🖼️','Photo Editor',f.name+' opened');
  };
  photoImg.src=url;
}
function photoAdjust() {
  const canvas=document.getElementById('photo-canvas');if(!canvas||!photoImg)return;
  const ctx=canvas.getContext('2d');
  const br=parseInt(document.getElementById('photo-brightness')?.value||0);
  const co=parseInt(document.getElementById('photo-contrast')?.value||0);
  const sa=parseInt(document.getElementById('photo-sat')?.value||0);
  const hu=parseInt(document.getElementById('photo-hue')?.value||0);
  const bl=parseInt(document.getElementById('photo-blur')?.value||0);
  const op=parseInt(document.getElementById('photo-opacity')?.value||100);
  ctx.save();ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.filter=`brightness(${1+br/100}) contrast(${1+co/100}) saturate(${1+sa/100}) hue-rotate(${hu}deg) blur(${bl/4}px) opacity(${op/100})`;
  ctx.drawImage(photoImg,0,0);ctx.restore();
}
function photoFilter(name) {
  const filters={none:'',grayscale:'grayscale(100%)',sepia:'sepia(80%)',invert:'invert(100%)',saturate:'saturate(250%) contrast(110%)',cool:'hue-rotate(180deg) saturate(120%)',warm:'sepia(40%) saturate(150%)',dramatic:'contrast(150%) brightness(90%) saturate(80%)'};
  const canvas=document.getElementById('photo-canvas');if(!canvas||!photoImg)return;
  const ctx=canvas.getContext('2d');
  ctx.save();ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.filter=filters[name]||'';
  ctx.drawImage(photoImg,0,0);ctx.restore();
  showNotif('🎨','Filter',name+' applied');
}
function photoRotate(deg) {
  const canvas=document.getElementById('photo-canvas');if(!canvas||!photoImg)return;
  photoRotation=(photoRotation+deg+360)%360;
  const swap=photoRotation%180!==0;
  const w=swap?canvas.height:canvas.width,h=swap?canvas.width:canvas.height;
  const off=document.createElement('canvas');off.width=w;off.height=h;
  const ctx=off.getContext('2d');
  ctx.translate(w/2,h/2);ctx.rotate(deg*Math.PI/180);ctx.drawImage(canvas,-canvas.width/2,-canvas.height/2);
  canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(off,0,0);
  photoImg=new Image();photoImg.src=canvas.toDataURL();
}
function photoFlip(dir) {
  const canvas=document.getElementById('photo-canvas');if(!canvas||!photoImg)return;
  const ctx=canvas.getContext('2d');
  const off=document.createElement('canvas');off.width=canvas.width;off.height=canvas.height;
  const oc=off.getContext('2d');
  oc.save();if(dir==='h'){oc.translate(canvas.width,0);oc.scale(-1,1);}else{oc.translate(0,canvas.height);oc.scale(1,-1);}
  oc.drawImage(canvas,0,0);oc.restore();
  ctx.drawImage(off,0,0);
  photoImg=new Image();photoImg.src=canvas.toDataURL();
}
function photoCrop(){showNotif('✂️','Photo Editor','Crop: drag on canvas (coming soon)');}
function photoSave() {
  const canvas=document.getElementById('photo-canvas');if(!canvas)return;
  const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='arcos-photo.png';a.click();
  showNotif('💾','Photo Editor','Image saved as PNG');
}
function photoResetAdj() {
  ['photo-brightness','photo-contrast','photo-sat','photo-hue','photo-blur','photo-sharp','photo-opacity','photo-vignette'].forEach(id=>{
    const el=document.getElementById(id);const valEl=document.getElementById(id+'-val');
    if(el){el.value=id==='photo-opacity'?100:0;if(valEl)valEl.textContent=el.value;}
  });
  photoAdjust();
}

// ─── DATABASE BROWSER ─────────────────────────────────
function buildDatabase() {
  return `<div id="db-content" style="display:flex;height:100%;background:#0a0a14">
    <div style="width:200px;background:rgba(0,0,0,.3);border-right:1px solid var(--border);display:flex;flex-direction:column">
      <div style="padding:10px 12px;font-weight:700;font-size:13px;border-bottom:1px solid var(--border)">🗄️ Databases</div>
      <div id="db-sidebar" style="flex:1;overflow-y:auto;padding:6px"></div>
      <div style="padding:8px;border-top:1px solid var(--border)">
        <button class="editor-btn" onclick="dbConnect()" style="width:100%;font-size:11px">+ Connect</button>
      </div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--win-bar);border-bottom:1px solid var(--border)">
        <button class="editor-btn" onclick="dbRunQuery()" style="background:var(--accent);border-color:var(--accent);color:#fff">▶ Run</button>
        <button class="editor-btn" onclick="dbClear()">Clear</button>
        <button class="editor-btn" onclick="dbFormat()">✨ Format</button>
        <span id="db-status" style="font-size:11px;color:var(--text-dim);margin-left:auto"></span>
      </div>
      <textarea id="db-query" spellcheck="false" style="height:130px;padding:12px;background:#060610;border:none;border-bottom:1px solid var(--border);color:#cdd6f4;font-family:'Source Code Pro',monospace;font-size:13px;resize:none;outline:none;line-height:1.7;tab-size:2" placeholder="-- Write SQL here…
SELECT * FROM users LIMIT 10;">SELECT * FROM users;</textarea>
      <div id="db-results" style="flex:1;overflow:auto;padding:0">
        <div style="padding:20px;color:var(--text-dim);text-align:center;font-size:13px">Run a query to see results</div>
      </div>
    </div>
  </div>`;
}

const DB_SCHEMA = {
  arcos_main: {
    users: [
      {id:1,name:'Alice Johnson',email:'alice@arcos.dev',role:'admin',created:'2024-01-15'},
      {id:2,name:'Bob Smith',email:'bob@arcos.dev',role:'user',created:'2024-02-20'},
      {id:3,name:'Carol White',email:'carol@arcos.dev',role:'user',created:'2024-03-10'},
      {id:4,name:'David Lee',email:'david@arcos.dev',role:'mod',created:'2024-03-25'},
      {id:5,name:'Eve Brown',email:'eve@arcos.dev',role:'user',created:'2024-04-05'},
    ],
    posts: [
      {id:1,user_id:1,title:'Welcome to ArcOS',content:'Hello world!',views:1240,created:'2024-01-16'},
      {id:2,user_id:2,title:'Getting Started',content:'ArcOS tutorial.',views:890,created:'2024-02-21'},
      {id:3,user_id:1,title:'New Features',content:'v3.0 changelog.',views:3400,created:'2024-04-01'},
    ],
    sessions: [
      {id:1,user_id:1,token:'abc123',ip:'192.168.1.10',active:1},
      {id:2,user_id:3,token:'xyz789',ip:'10.0.0.5',active:1},
    ],
    settings: [
      {key:'theme',value:'dark',updated:'2024-04-10'},
      {key:'version',value:'3.0.0',updated:'2024-04-01'},
    ]
  }
};

function initDatabase() {
  const sidebar=document.getElementById('db-sidebar');if(!sidebar)return;
  sidebar.innerHTML=Object.entries(DB_SCHEMA).map(([db,tables])=>`
    <div style="margin-bottom:4px">
      <div style="padding:5px 8px;font-size:12px;font-weight:700;color:var(--accent);cursor:pointer;border-radius:5px;display:flex;align-items:center;gap:6px" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
        🗄️ ${db}
      </div>
      <div style="padding-left:12px">
        ${Object.keys(tables).map(t=>`
          <div style="padding:4px 8px;font-size:12px;color:var(--text-dim);cursor:pointer;border-radius:5px;font-family:'Source Code Pro',monospace" onclick="document.getElementById('db-query').value='SELECT * FROM ${t} LIMIT 20;';dbRunQuery()" onmouseover="this.style.background='var(--card)'" onmouseout="this.style.background=''"
          >📋 ${t}</div>`).join('')}
      </div>
    </div>`).join('');
}

function dbRunQuery() {
  const q=(document.getElementById('db-query')?.value||'').trim().toUpperCase();
  const results=document.getElementById('db-results');
  const status=document.getElementById('db-status');
  if(!results)return;
  const t=Date.now();
  let data=null,tableName='';
  Object.entries(DB_SCHEMA.arcos_main).forEach(([name,rows])=>{
    if(q.includes(name.toUpperCase())){data=rows;tableName=name;}
  });
  if(!data&&q.includes('USERS')){data=DB_SCHEMA.arcos_main.users;tableName='users';}
  if(!data&&q.includes('POSTS')){data=DB_SCHEMA.arcos_main.posts;tableName='posts';}
  if(q.startsWith('SELECT')&&data){
    const cols=Object.keys(data[0]);
    const ms=Date.now()-t;
    if(status)status.textContent=`${data.length} rows · ${ms}ms`;
    results.innerHTML=`<table style="width:100%;border-collapse:collapse;font-family:'Source Code Pro',monospace;font-size:12px">
      <thead><tr>${cols.map(c=>`<th style="padding:8px 12px;background:rgba(0,0,0,.4);border-bottom:2px solid var(--border);text-align:left;color:var(--text-dim);font-size:10px;text-transform:uppercase;letter-spacing:.6px;white-space:nowrap">${c}</th>`).join('')}</tr></thead>
      <tbody>${data.map((row,i)=>`<tr style="background:${i%2?'transparent':'rgba(255,255,255,.02)'}">
        ${cols.map(c=>`<td style="padding:6px 12px;border-bottom:1px solid rgba(255,255,255,.04);color:${typeof row[c]==='number'?'var(--accent)':row[c]===1?'var(--green)':row[c]===0?'var(--red)':'var(--text)'}">${row[c]??'NULL'}</td>`).join('')}
      </tr>`).join('')}</tbody>
    </table>`;
  } else if(q.startsWith('INSERT')){
    if(status)status.textContent='1 row inserted';results.innerHTML=`<div style="padding:16px;color:var(--green)">✓ 1 row inserted successfully</div>`;
  } else if(q.startsWith('UPDATE')){
    const cnt=Math.floor(Math.random()*5+1);if(status)status.textContent=cnt+' rows updated';results.innerHTML=`<div style="padding:16px;color:var(--green)">✓ ${cnt} rows updated</div>`;
  } else if(q.startsWith('DELETE')){
    if(status)status.textContent='1 row deleted';results.innerHTML=`<div style="padding:16px;color:var(--yellow)">⚠ 1 row deleted</div>`;
  } else if(q.startsWith('CREATE')){
    if(status)status.textContent='Table created';results.innerHTML=`<div style="padding:16px;color:var(--green)">✓ Table created successfully</div>`;
  } else if(q.startsWith('DROP')){
    if(status)status.textContent='Table dropped';results.innerHTML=`<div style="padding:16px;color:var(--red)">✓ Table dropped</div>`;
  } else {
    if(status)status.textContent='Error';results.innerHTML=`<div style="padding:16px;color:var(--red)">⚠ Unknown query or table not found. Available tables: users, posts, sessions, settings</div>`;
  }
}
function dbClear(){const ta=document.getElementById('db-query');if(ta)ta.value='';}
function dbFormat(){
  const ta=document.getElementById('db-query');if(!ta)return;
  ta.value=ta.value.replace(/\b(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|HAVING|LIMIT|INSERT INTO|VALUES|UPDATE|SET|DELETE|CREATE TABLE|DROP TABLE|JOIN|LEFT JOIN|INNER JOIN|ON)\b/gi,'\n$1').trim();
}
function dbConnect(){showNotif('🗄️','Database','Connection dialog coming soon');}

// ─── HOOK INTO WINDOWS SYSTEM ─────────────────────────
const _prevBuildContent = window.buildContent;
window.buildContent = function(id) {
  const megaMap = {
    aichat:       buildAichat,
    piano:        buildPiano,
    chess:        buildChess,
    sudoku:       buildSudoku,
    stocktracker: buildStocktracker,
    vmdocker:     buildVmdocker,
    vault:        buildVault,
    ebook:        buildEbook,
    photoeditor:  buildPhotoeditor,
    database:     buildDatabase,
  };
  if (megaMap[id]) return megaMap[id]();
  return _prevBuildContent ? _prevBuildContent(id) : `<div style="padding:20px;color:var(--text-dim)">App: ${id}</div>`;
};

const _prevAfterOpen = window.afterOpen;
window.afterOpen = function(id) {
  if (_prevAfterOpen) _prevAfterOpen(id);
  if (id==='aichat')       initAichat();
  if (id==='piano')        initPiano();
  if (id==='chess')        initChess();
  if (id==='sudoku')       initSudoku();
  if (id==='stocktracker') initStocktracker();
  if (id==='vmdocker')     initVmdocker();
  if (id==='vault')        initVault();
  if (id==='ebook')        initEbook();
  if (id==='database')     initDatabase();
};

const _prevGetSize = window.getDefaultSize;
window.getDefaultSize = function(id) {
  const megaSizes = {
    aichat:[680,560], piano:[820,420], chess:[720,520],
    sudoku:[560,580], stocktracker:[860,560], vmdocker:[820,540],
    vault:[600,500], ebook:[760,560], photoeditor:[860,560],
    database:[860,540],
  };
  if (megaSizes[id]) {
    const [w,h]=megaSizes[id];
    const x=Math.max(60,Math.random()*(window.innerWidth-w-100)+50);
    const y=Math.max(44,Math.random()*(window.innerHeight-h-120)+44);
    return [w,h,Math.round(x),Math.round(y)];
  }
  return _prevGetSize ? _prevGetSize(id) : [600,420,120,80];
};
