/* ═══════════════════════════════════════
   ArcOS — UI: Notifications, Context Menu,
               Global Mouse Handlers
═══════════════════════════════════════ */

// ─── NOTIFICATIONS ─────────────────────────────────────
let notifTimer = null;

function showNotif(icon, title, msg) {
  const n  = document.getElementById('notification');
  const ni = document.getElementById('notif-icon');
  const nt = document.getElementById('notif-title');
  const nm = document.getElementById('notif-msg');
  if (!n) return;
  if (ni) ni.textContent = icon;
  if (nt) nt.textContent = title;
  if (nm) nm.textContent = msg;
  n.classList.add('show');
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => n.classList.remove('show'), 3200);
}

// ─── CONTEXT MENU ──────────────────────────────────────
function showCtxMenu(e) {
  e.preventDefault();
  // Don't show on windows or dock
  if (e.target.closest('.window') || e.target.closest('#dock') || e.target.closest('#topbar')) return;
  const menu = document.getElementById('context-menu');
  if (!menu) return;
  menu.classList.add('show');
  const x = Math.min(e.clientX, window.innerWidth  - menu.offsetWidth  - 10);
  const y = Math.min(e.clientY, window.innerHeight - menu.offsetHeight - 10);
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
}

function hideCtxMenu() {
  document.getElementById('context-menu')?.classList.remove('show');
}

function ctxAction(action) {
  hideCtxMenu();
  if (action === 'terminal')   openApp('terminal');
  if (action === 'files')      openApp('files');
  if (action === 'settings')   openApp('settings');
  if (action === 'wallpaper')  openApp('settings');
  if (action === 'screenshot') takeScreenshot();
}

function takeScreenshot() {
  showNotif('📸', 'Screenshot', 'Captured! (simulated — use browser screenshot tools)');
}

// ─── GLOBAL MOUSE HANDLERS ─────────────────────────────
document.addEventListener('mousemove',  onMouseMove);
document.addEventListener('mouseup',    () => { dragTarget = null; });
document.addEventListener('contextmenu', showCtxMenu);
document.addEventListener('click',      hideCtxMenu);

// ─── KEYBOARD GLOBALS ──────────────────────────────────
document.addEventListener('keydown', e => {
  // Close overview with Escape
  if (e.key === 'Escape' && overviewOpen) closeOverview();
  // Super key to toggle overview
  if (e.key === 'Meta' || (e.key === 'F1')) toggleOverview();
});

// ─── DRAG & DROP FILES ONTO DESKTOP ────────────────────
document.addEventListener('dragover',  e => e.preventDefault());
document.addEventListener('drop', e => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      openApp('imgviewer');
      setTimeout(() => {
        const r = new FileReader();
        r.onload = ev => {
          const m = document.getElementById('imgviewer-main');
          if (m) m.innerHTML = `<img id="imgviewer-img" src="${ev.target.result}" style="max-width:100%;max-height:100%;object-fit:contain">`;
        };
        r.readAsDataURL(file);
      }, 200);
    } else if (file.type.startsWith('audio/')) {
      openApp('music');
      setTimeout(() => loadMusicFile({ files: [file] }), 200);
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      openApp('editor');
      setTimeout(() => {
        const r = new FileReader();
        r.onload = ev => {
          const ta = document.getElementById('text-area');
          const fn = document.getElementById('editor-filename');
          if (ta) ta.value = ev.target.result;
          if (fn) fn.value = file.name;
        };
        r.readAsText(file);
      }, 200);
    } else {
      showNotif('📂', 'File Dropped', file.name + ' — open Files app to manage');
    }
  });
});

// ─── WINDOW FOCUS ON CLICK ─────────────────────────────
document.addEventListener('mousedown', e => {
  const win = e.target.closest('.window');
  if (win) {
    const id = win.id.replace('win-', '');
    focusWindow(id);
  }
});
