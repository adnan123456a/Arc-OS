/* ═══════════════════════════════════════
   ArcOS — UI Components v3.0
   Notifications · Context Menu
   Wallpaper picker · Global handlers
═══════════════════════════════════════ */

// ─── NOTIFICATIONS ───────────────────────────────────
let notifTimer = null;
function showNotif(icon, title, msg) {
  const el = document.getElementById('notification');
  const ni = document.getElementById('notif-icon');
  const nt = document.getElementById('notif-title');
  const nm = document.getElementById('notif-msg');
  if (!el) return;
  if (notifTimer) clearTimeout(notifTimer);
  if (ni) ni.textContent = icon;
  if (nt) nt.textContent = title;
  if (nm) nm.textContent = msg;
  el.classList.add('show');
  notifTimer = setTimeout(() => el.classList.remove('show'), 3400);
}

// ─── CONTEXT MENU ────────────────────────────────────
function showCtxMenu(x, y) {
  const menu = document.getElementById('context-menu');
  if (!menu) return;
  menu.style.left = Math.min(x, window.innerWidth  - 200) + 'px';
  menu.style.top  = Math.min(y, window.innerHeight - 180) + 'px';
  menu.classList.add('show');
}
function hideCtxMenu() {
  document.getElementById('context-menu')?.classList.remove('show');
}

function ctxAction(action) {
  hideCtxMenu();
  if (action === 'terminal')   openApp('terminal');
  if (action === 'files')      openApp('files');
  if (action === 'settings')   openApp('settings');
  if (action === 'screenshot') takeScreenshot();
  if (action === 'wallpaper')  showWallpaperPicker();
}

// ─── WALLPAPER ───────────────────────────────────────
// Right-click desktop → opens Settings app on Wallpaper tab
function showWallpaperPicker() {
  openApp('settings');
  setTimeout(() => {
    const btn = document.querySelector('.settings-nav');
    if (btn) switchSettings('wallpaper', btn);
  }, 120);
}

function changeAccentColor(c) {
  document.documentElement.style.setProperty('--accent', c);
  localStorage.setItem('arcos_accent', c);
  showNotif('🎨', 'Accent', 'Color updated');
}

// ─── SCREENSHOT ──────────────────────────────────────
function takeScreenshot() {
  showNotif('📸', 'Screenshot', 'Saved to ~/Pictures/screenshot.png');
}

// ─── GLOBAL MOUSE HANDLERS ───────────────────────────
document.addEventListener('contextmenu', e => {
  const win    = e.target.closest('.window');
  const dock   = e.target.closest('#dock');
  const notif  = e.target.closest('#notification');
  if (!win && !dock && !notif) {
    e.preventDefault();
    showCtxMenu(e.clientX, e.clientY);
  }
});

document.addEventListener('click', e => {
  if (!e.target.closest('#context-menu')) hideCtxMenu();
  if (!e.target.closest('#dock-ctx')) hideDockCtx();
});

// Focus window on click
document.addEventListener('mousedown', e => {
  const win = e.target.closest('.window');
  if (win) {
    const id = win.id.replace('win-', '');
    win.style.zIndex = ++zCounter;
    document.getElementById('app-menu-name').textContent =
      APP_DEFS.find(a => a.id === id)?.name || 'ArcOS';
  }
});

// Settings helpers
window.changeWallpaper = function(key) { applyWallpaperStyle(key); };
window.changeAccent = function(c) { changeAccentColor(c); };
