/* ═══════════════════════════════════════
   ArcOS — Window Tiling
   Presets: 2-col, 3-col, quad, full
   Keyboard: Ctrl+Shift+Arrow
═══════════════════════════════════════ */

function buildTilingBar() {
  // Tiling bar is now hidden — access via Ctrl+Shift+T or Settings
  // Register keyboard shortcut only
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'T') { toggleTilingBar(); }
    if (e.ctrlKey && e.shiftKey && e.key === 'ArrowLeft')  snapFocused('left');
    if (e.ctrlKey && e.shiftKey && e.key === 'ArrowRight') snapFocused('right');
    if (e.ctrlKey && e.shiftKey && e.key === 'ArrowUp')    snapFocused('max');
    if (e.ctrlKey && e.shiftKey && e.key === 'ArrowDown')  untileAll();
  });
}

function toggleTilingBar() {
  let bar = document.getElementById('tiling-bar');
  if (bar) { bar.remove(); return; }
  bar = document.createElement('div');
  bar.id = 'tiling-bar';
  bar.style.cssText = `
    position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;
    display:flex;gap:8px;align-items:center;
    background:rgba(10,10,24,.97);
    border:1px solid var(--border);
    border-radius:16px;
    padding:12px 18px;
    backdrop-filter:blur(24px);
    box-shadow:0 20px 60px rgba(0,0,0,.7);
    animation:fadeIn .15s ease;
  `;
  bar.innerHTML = `
    <span style="font-size:12px;color:var(--text-dim);margin-right:4px">Tile:</span>
    ${[
      ['2col','⬜⬜','2 Cols'],
      ['3col','▪▪▪','3 Cols'],
      ['quad','⊞','Quad'],
      ['main','▊▌','Main+Side'],
      ['full','⬛','Full'],
    ].map(([mode,icon,label])=>
      `<button onclick="tileWindows('${mode}');document.getElementById('tiling-bar')?.remove()"
        style="background:var(--card);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:8px 14px;cursor:pointer;font-size:13px;font-family:inherit;transition:all .12s;display:flex;flex-direction:column;align-items:center;gap:3px"
        onmouseover="this.style.background='var(--accent)';this.style.borderColor='var(--accent)'"
        onmouseout="this.style.background='var(--card)';this.style.borderColor='var(--border)'">
        <span style="font-size:16px">${icon}</span>
        <span style="font-size:10px;opacity:.7">${label}</span>
      </button>`
    ).join('')}
    <button onclick="untileAll();document.getElementById('tiling-bar')?.remove()"
      style="background:var(--card);border:1px solid var(--border);color:var(--text-dim);border-radius:10px;padding:8px 14px;cursor:pointer;font-size:11px;font-family:inherit"
      onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--text-dim)'">Float</button>
    <button onclick="document.getElementById('tiling-bar')?.remove()"
      style="background:none;border:none;color:var(--text-dim);font-size:18px;cursor:pointer;padding:4px 6px;margin-left:4px">×</button>
  `;
  document.body.appendChild(bar);
  // Close on outside click
  setTimeout(() => document.addEventListener('click', function off(e) {
    if (!bar.contains(e.target)) { bar.remove(); document.removeEventListener('click', off); }
  }), 10);
}

function tileWindows(mode) {
  const wins = Object.entries(openWindows)
    .filter(([,w]) => w.style.display !== 'none')
    .map(([id, w]) => ({ id, w }));
  if (!wins.length) { showNotif('🪟','Tiling','No open windows to tile'); return; }

  const topH = 36, dockH = 80;
  const W = window.innerWidth;
  const H = window.innerHeight - topH - dockH;
  const top = topH;

  if (mode === '2col') {
    const cols = 2;
    wins.forEach(({ w }, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const rowCount = Math.ceil(wins.length / cols);
      Object.assign(w.style, {
        left: `${col * (W / cols)}px`,
        top:  `${top + row * (H / rowCount)}px`,
        width:`${W / cols - 4}px`,
        height:`${H / rowCount - 4}px`,
      });
    });
  } else if (mode === '3col') {
    const cols = Math.min(3, wins.length);
    wins.forEach(({ w }, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const rowCount = Math.ceil(wins.length / cols);
      Object.assign(w.style, {
        left: `${col * (W / cols)}px`,
        top:  `${top + row * (H / rowCount)}px`,
        width:`${W / cols - 4}px`,
        height:`${H / rowCount - 4}px`,
      });
    });
  } else if (mode === 'quad') {
    wins.slice(0, 4).forEach(({ w }, i) => {
      Object.assign(w.style, {
        left: `${(i % 2) * (W / 2)}px`,
        top:  `${top + Math.floor(i / 2) * (H / 2)}px`,
        width:`${W / 2 - 4}px`,
        height:`${H / 2 - 4}px`,
      });
    });
  } else if (mode === 'main') {
    if (wins.length === 1) {
      Object.assign(wins[0].w.style, { left:'0', top:`${top}px`, width:`${W}px`, height:`${H}px` });
    } else {
      Object.assign(wins[0].w.style, { left:'0', top:`${top}px`, width:`${Math.round(W * .62) - 2}px`, height:`${H}px` });
      const sideW = Math.round(W * .38);
      const sideH = Math.floor(H / (wins.length - 1));
      wins.slice(1).forEach(({ w }, i) => {
        Object.assign(w.style, {
          left:  `${Math.round(W * .62) + 2}px`,
          top:   `${top + i * sideH}px`,
          width: `${sideW - 4}px`,
          height:`${sideH - 4}px`,
        });
      });
    }
  } else if (mode === 'full') {
    wins.forEach(({ w }) => Object.assign(w.style, {
      left:'0', top:`${top}px`, width:`${W}px`, height:`${H}px`
    }));
  }
  showNotif('🪟','Tiling',`${mode} layout applied to ${wins.length} window${wins.length>1?'s':''}`);
}

function untileAll() {
  // Cascade windows
  let offset = 0;
  Object.values(openWindows).forEach(w => {
    if (w.style.display === 'none') return;
    w.style.width  = '';
    w.style.height = '';
    w.style.left   = `${80 + offset}px`;
    w.style.top    = `${80 + offset}px`;
    offset += 28;
  });
  showNotif('🪟','Tiling','Windows floated');
}

// Keyboard shortcuts: Ctrl+Shift+Arrows
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.shiftKey) {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); snapFocused('left'); }
    if (e.key === 'ArrowRight') { e.preventDefault(); snapFocused('right'); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); snapFocused('max'); }
    if (e.key === 'ArrowDown')  { e.preventDefault(); untileAll(); }
  }
});

function snapFocused(side) {
  // Get topmost window
  let topZ = 0, topId = null;
  Object.entries(openWindows).forEach(([id, w]) => {
    const z = parseInt(w.style.zIndex || 0);
    if (z > topZ) { topZ = z; topId = id; }
  });
  if (!topId) return;
  if (typeof applySnap === 'function') applySnap(topId, side);
  else showNotif('🪟','Snap','Snap feature ready');
}

// Init after boot
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(buildTilingBar, 2700);
});

window.tileWindows = tileWindows;
