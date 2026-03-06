/* ═══════════════════════════════════════
   ArcOS — Virtual Desktops
   4 workspaces · Ctrl+1-4 · Overview
═══════════════════════════════════════ */

let currentDesktop = 1;
const DESKTOP_COUNT = 4;
// Store window IDs per desktop: {1: Set(['terminal','files',...], 2: Set([...]), ...}
const desktopWindows = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() };

// ── Build the desktop switcher — triggered via Ctrl+D or dock button ──
function buildDesktopBar() {
  // Register keyboard shortcuts only — no persistent visible bar
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && !e.shiftKey && e.key === '1') switchDesktop(1);
    if (e.ctrlKey && !e.shiftKey && e.key === '2') switchDesktop(2);
    if (e.ctrlKey && !e.shiftKey && e.key === '3') switchDesktop(3);
    if (e.ctrlKey && !e.shiftKey && e.key === '4') switchDesktop(4);
    if (e.ctrlKey && e.key === 'd') { e.preventDefault(); toggleDesktopBar(); }
  });
  // Add a small desktop indicator dot to topbar-right
  const indicator = document.createElement('div');
  indicator.id = 'desktop-indicator';
  indicator.style.cssText = `
    width:28px;height:22px;border-radius:6px;border:1px solid var(--border);
    background:rgba(94,129,244,.15);cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    font-size:11px;font-weight:700;color:var(--accent);
    transition:all .15s;
  `;
  indicator.textContent = '1';
  indicator.title = 'Virtual Desktops (Ctrl+D)';
  indicator.onclick = toggleDesktopBar;
  const tr = document.getElementById('topbar-right');
  if (tr) tr.insertBefore(indicator, tr.firstChild);
}

function updateDesktopIndicator() {
  const el = document.getElementById('desktop-indicator');
  if (el) el.textContent = currentDesktop;
}

function toggleDesktopBar() {
  let panel = document.getElementById('desktop-popup');
  if (panel) { panel.remove(); return; }
  panel = document.createElement('div');
  panel.id = 'desktop-popup';
  panel.style.cssText = `
    position:fixed;top:48px;right:100px;z-index:99999;
    background:rgba(10,10,24,.97);border:1px solid var(--border);border-radius:14px;
    padding:14px;backdrop-filter:blur(24px);box-shadow:0 16px 50px rgba(0,0,0,.7);
    min-width:180px;animation:fadeIn .15s ease;
  `;
  panel.innerHTML = `
    <div style="font-size:11px;color:var(--text-dim);font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Virtual Desktops</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">
      ${Array.from({length:DESKTOP_COUNT},(_,i)=>`
        <div onclick="switchDesktop(${i+1});document.getElementById('desktop-popup')?.remove()"
          style="padding:8px 10px;border-radius:9px;border:1.5px solid ${i+1===currentDesktop?'var(--accent)':'var(--border)'};
            background:${i+1===currentDesktop?'rgba(94,129,244,.2)':'var(--card)'};
            cursor:pointer;display:flex;align-items:center;gap:8px;transition:all .12s;font-size:13px;font-weight:600"
          onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='${i+1===currentDesktop?'var(--accent)':'var(--border)'}'">
          <span style="font-size:16px">🖥</span>
          <span style="color:${i+1===currentDesktop?'var(--accent)':'var(--text)'}">Desktop ${i+1}</span>
          ${desktopWindows[i+1]?.size>0?`<span style="margin-left:auto;width:5px;height:5px;border-radius:50%;background:var(--accent);flex-shrink:0"></span>`:''}
        </div>`).join('')}
    </div>
    <div style="font-size:11px;color:var(--text-dim);padding-top:8px;border-top:1px solid var(--border)">Ctrl+1–4 to switch · Ctrl+D to close</div>
  `;
  document.body.appendChild(panel);
  setTimeout(() => document.addEventListener('click', function off(e) {
    if (!panel.contains(e.target) && e.target.id !== 'desktop-indicator') {
      panel.remove(); document.removeEventListener('click', off);
    }
  }), 10);
}

function updateDesktopBar() {
  updateDesktopIndicator();
  // Also refresh popup if open
  const popup = document.getElementById('desktop-popup');
  if (popup) { popup.remove(); toggleDesktopBar(); }
}

function switchDesktop(n) {
  if (n === currentDesktop || n < 1 || n > DESKTOP_COUNT) return;
  // Hide all windows on current desktop
  desktopWindows[currentDesktop].forEach(id => {
    const w = openWindows[id];
    if (w) w.style.display = 'none';
  });
  // Show windows on new desktop (that were open before)
  const prev = currentDesktop;
  currentDesktop = n;
  desktopWindows[currentDesktop].forEach(id => {
    const w = openWindows[id];
    if (w) w.style.display = 'flex';
  });
  updateDesktopBar();
  showNotif('🖥️', `Desktop ${n}`, `Switched from Desktop ${prev}`);
  if (typeof updateTaskbar === 'function') updateTaskbar();
}

function addDesktop() { showNotif('🖥️','Virtual Desktops','Max 4 desktops supported'); }

// Patch openApp to assign to current desktop
const _vdOpenApp = window.openApp;
window.openApp = function(id) {
  _vdOpenApp(id);
  // Register window on current desktop
  if (openWindows[id]) {
    desktopWindows[currentDesktop].add(id);
  }
};

// Patch closeApp to remove from desktop registry
const _vdCloseApp = window.closeApp;
window.closeApp = function(id) {
  _vdCloseApp(id);
  for (let i = 1; i <= DESKTOP_COUNT; i++) desktopWindows[i].delete(id);
};

// Move current window to another desktop
function moveWindowToDesktop(id, n) {
  const w = openWindows[id]; if (!w) return;
  for (let i = 1; i <= DESKTOP_COUNT; i++) desktopWindows[i].delete(id);
  desktopWindows[n].add(id);
  if (n !== currentDesktop) {
    w.style.display = 'none';
    showNotif('🖥️','Moved',`Window moved to Desktop ${n}`);
  }
  updateDesktopBar();
}

// Keyboard shortcuts: Ctrl+1..4
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key >= '1' && e.key <= '4') {
    e.preventDefault();
    switchDesktop(parseInt(e.key));
  }
});

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(buildDesktopBar, 2600);
});
