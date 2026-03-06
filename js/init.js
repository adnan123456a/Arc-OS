/* ═══════════════════════════════════════
   ArcOS — Init v3.0
   Boot · Taskbar · Alt+Tab · Window Snap
   Drag+Drop · LocalStorage
═══════════════════════════════════════ */

window.addEventListener('DOMContentLoaded', () => {

  // ── Load stored preferences ──
  loadStorage();

  // ── Build dock from saved order ──
  buildDock();

  // ── Clock ──
  startClock();

  // ── Inject keyframe animations ──
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
    @keyframes winOpen{from{transform:scale(.88) translateY(8px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes notifIn{from{transform:translateX(120%)}to{transform:translateX(0)}}
  `;
  document.head.appendChild(style);

  // ── Loader dismiss ──
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.transition = 'opacity .6s';
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 700);
    }
    // Welcome notif
    setTimeout(() => showNotif('🐧', 'Welcome to ArcOS 3.0', 'Right-click desktop · Drag dock icons · Pin/unpin apps'), 500);
    // Auto-open terminal
    setTimeout(() => openApp('terminal'), 700);
  }, 2400);

  // ── Prevent back navigation on Backspace ──
  document.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
      e.preventDefault();
    }
    // Alt+Tab
    if (e.altKey && e.key === 'Tab') { e.preventDefault(); showAltTab(); }
    // Close alt-tab on Alt release
    if (e.key === 'Alt' && altTabActive) closeAltTab();
    // Escape: close overview or alt-tab
    if (e.key === 'Escape') { closeOverview(); closeAltTab(); }
    // Super / F1 = toggle overview
    if (e.key === 'F1') { e.preventDefault(); toggleOverview(); }
  });

  // ── Middle-click windows to close ──
  document.addEventListener('mousedown', e => {
    if (e.button === 1) {
      const win = e.target.closest('.window');
      if (win) { e.preventDefault(); closeApp(win.id.replace('win-', '')); }
    }
  });

  console.log(`
  ╔══════════════════════════════════════╗
  ║   ArcOS 3.0 — ${APP_DEFS.length} Apps Loaded         ║
  ║   Pinned: ${pinnedApps.length} · Storage: localStorage  ║
  ╚══════════════════════════════════════╝`);
});

// ─── TASKBAR ─────────────────────────────────────────
function updateTaskbar() {
  const bar = document.getElementById('taskbar'); if (!bar) return;
  bar.innerHTML = '';
  Object.keys(openWindows).forEach(id => {
    const app = APP_DEFS.find(a => a.id === id);
    const pill = document.createElement('div');
    pill.className = 'taskbar-pill';
    const iconDiv = document.createElement('div');
    iconDiv.className = 'taskbar-pill-icon';
    iconDiv.style.background = app?.bg || 'var(--card)';
    iconDiv.innerHTML = (app?.icon || '').replace(/width="[^"]*"/g,'width="14"').replace(/height="[^"]*"/g,'height="14"');
    pill.appendChild(iconDiv);
    const label = document.createElement('span');
    label.textContent = app?.name || id;
    pill.appendChild(label);
    const xBtn = document.createElement('span');
    xBtn.className = 'taskbar-pill-x';
    xBtn.textContent = '✕';
    xBtn.onclick = ev => { ev.stopPropagation(); closeApp(id); };
    pill.appendChild(xBtn);
    pill.onclick = () => focusWindow(id);
    bar.appendChild(pill);
  });
}

// ─── WINDOW SNAP ─────────────────────────────────────
const SNAP_ZONES = {
  left:  { x:0,    y:36,  w:'50vw',          h:'calc(100vh - 36px)' },
  right: { x:'50vw',y:36, w:'50vw',          h:'calc(100vh - 36px)' },
  max:   { x:0,    y:36,  w:'100vw',         h:'calc(100vh - 36px)' },
  tl:    { x:0,    y:36,  w:'50vw',          h:'calc(50vh - 18px)'  },
  tr:    { x:'50vw',y:36, w:'50vw',          h:'calc(50vh - 18px)'  },
  bl:    { x:0,    y:'calc(50vh + 18px)', w:'50vw', h:'calc(50vh - 18px)' },
  br:    { x:'50vw',y:'calc(50vh + 18px)',w:'50vw', h:'calc(50vh - 18px)' },
};

function checkSnapZone(x, y) {
  if (x < 8)                              return 'left';
  if (x > window.innerWidth - 8)          return 'right';
  if (y <= 40)                            return 'max';
  return null;
}

function showSnapPreview(zone) {
  const el = document.getElementById('snap-preview');
  if (!el || !zone) { if(el) el.style.display='none'; return; }
  const z = SNAP_ZONES[zone];
  Object.assign(el.style, {
    display:'block', left:z.x+(typeof z.x==='number'?'px':''),
    top:z.y+(typeof z.y==='number'?'px':''), width:z.w, height:z.h
  });
}

function applySnap(id, zone) {
  const win = openWindows[id]; if (!win) return;
  const z = SNAP_ZONES[zone];
  Object.assign(win.style, {
    left:  z.x + (typeof z.x==='number' ? 'px' : ''),
    top:   z.y + (typeof z.y==='number' ? 'px' : ''),
    width: z.w, height: z.h,
  });
}

// ─── OVERRIDE openApp / closeApp to update taskbar ───
const _openAppOrig = window.openApp;
window.openApp = function(id) {
  if (_openAppOrig) _openAppOrig(id);
  setTimeout(updateTaskbar, 50);
  // Update dock active state
  document.querySelectorAll('.dock-icon').forEach(d => {
    if (d.id === `dock-${id}`) d.classList.add('active');
  });
};

const _closeAppOrig = window.closeApp;
window.closeApp = function(id) {
  if (_closeAppOrig) _closeAppOrig(id);
  setTimeout(updateTaskbar, 50);
  document.getElementById(`dock-${id}`)?.classList.remove('active');
};

// ─── DRAG with SNAP support ───────────────────────────
document.addEventListener('mousemove', e => {
  onMouseMove(e);
  if (dragTarget) {
    const zone = checkSnapZone(e.clientX, e.clientY);
    showSnapPreview(zone);
  }
});

document.addEventListener('mouseup', e => {
  if (dragTarget) {
    const zone = checkSnapZone(e.clientX, e.clientY);
    if (zone) {
      // Find which window is being dragged
      const id = dragTarget.id.replace('win-', '');
      applySnap(id, zone);
    }
    document.getElementById('snap-preview').style.display = 'none';
  }
  dragTarget = null;
});

// ─── DROP FILES ONTO DESKTOP ──────────────────────────
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => {
  e.preventDefault();
  Array.from(e.dataTransfer.files).forEach(file => {
    if (file.type.startsWith('image/')) {
      openApp('imgviewer');
      setTimeout(() => {
        const r = new FileReader();
        r.onload = ev => { const m = document.getElementById('imgviewer-main'); if (m) m.innerHTML = `<img src="${ev.target.result}" style="max-width:100%;max-height:100%;object-fit:contain">`; };
        r.readAsDataURL(file);
      }, 200);
    } else if (file.type.startsWith('audio/')) {
      openApp('visualizer');
      setTimeout(() => {
        const fi = document.getElementById('viz-file');
        if (fi) { const dt = new DataTransfer(); dt.items.add(file); fi.files = dt.files; vizFileChosen(fi); }
      }, 300);
    } else {
      openApp('editor');
      setTimeout(() => {
        const r = new FileReader();
        r.onload = ev => { const ta=document.getElementById('text-area'); const fn=document.getElementById('editor-filename'); if(ta)ta.value=ev.target.result; if(fn)fn.value=file.name; };
        r.readAsText(file);
      }, 200);
    }
  });
});
