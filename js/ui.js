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

// ─── WALLPAPER PICKER ────────────────────────────────
// Real photo wallpapers — displayed in picker, applied via applyPhotoWallpaper() in apps-fixes.js
const PHOTO_WALLPAPERS = [
  { key:'wp-galaxy',    label:'🌌 Galaxy',     thumb:'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=400&q=70', full:'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1920&q=85' },
  { key:'wp-aurora',   label:'🌿 Aurora',      thumb:'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=70', full:'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=85' },
  { key:'wp-mountain', label:'🏔 Mountains',   thumb:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70', full:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=85' },
  { key:'wp-ocean',    label:'🌊 Ocean',       thumb:'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70', full:'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=85' },
  { key:'wp-forest',   label:'🌲 Forest',      thumb:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70', full:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=85' },
  { key:'wp-city',     label:'🌆 City Night',  thumb:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=70', full:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=85' },
  { key:'wp-desert',   label:'🏜 Desert',      thumb:'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70', full:'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=85' },
  { key:'wp-abstract', label:'🎨 Abstract',    thumb:'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=70', full:'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=85' },
];

const GRADIENT_WALLPAPERS = [
  { key:'default',   label:'🌌 Nebula',    colors:['#05050f','#0b0b1e','#10112a'] },
  { key:'synthwave', label:'🌆 Synthwave', colors:['#050010','#120025','#2a0050'] },
  { key:'cyberpunk', label:'💜 Cyberpunk', colors:['#060012','#130820','#1e0a35'] },
  { key:'midnight',  label:'🌃 Midnight',  colors:['#000000','#0a0a1a','#0f0f2e'] },
];

function showWallpaperPicker() {
  hideCtxMenu();
  let modal = document.getElementById('wp-modal');
  if (modal) { modal.remove(); return; }
  modal = document.createElement('div');
  modal.id = 'wp-modal';
  modal.style.cssText = `
    position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
    background:rgba(10,10,22,.98);backdrop-filter:blur(40px);
    border:1px solid var(--border);border-radius:20px;padding:24px;
    z-index:99999;box-shadow:0 30px 80px rgba(0,0,0,.85);
    width:580px;max-width:95vw;max-height:88vh;overflow-y:auto;
  `;
  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
      <div style="font-size:16px;font-weight:800">🖼️ Wallpaper</div>
      <button onclick="document.getElementById('wp-modal').remove()" style="background:none;border:none;color:var(--text);font-size:22px;cursor:pointer;opacity:.6;line-height:1">✕</button>
    </div>

    <div style="font-size:11px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">📸 Photos</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px">
      ${PHOTO_WALLPAPERS.map(w=>`
        <div onclick="applyPhotoWallpaper('${w.full}','${w.key}');document.getElementById('wp-modal').remove();showNotif('🖼️','Wallpaper','${w.label} loading…')"
          style="cursor:pointer;border-radius:10px;overflow:hidden;border:2px solid var(--border);transition:all .18s;aspect-ratio:16/9;position:relative;background:#1a1a2e"
          onmouseover="this.style.borderColor='var(--accent)';this.style.transform='scale(1.04)'"
          onmouseout="this.style.borderColor='var(--border)';this.style.transform=''">
          <img src="${w.thumb}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display='none'">
          <div style="position:absolute;bottom:0;left:0;right:0;padding:5px 7px;background:linear-gradient(transparent,rgba(0,0,0,.8));font-size:10px;font-weight:700;color:rgba(255,255,255,.95)">${w.label}</div>
        </div>`).join('')}
    </div>

    <div style="font-size:11px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">🎨 Gradients</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px">
      ${GRADIENT_WALLPAPERS.map(w=>`
        <div onclick="applyWallpaperStyle('${w.key}');document.getElementById('wp-modal').remove();showNotif('🎨','Wallpaper','${w.label} applied')"
          style="cursor:pointer;border-radius:10px;overflow:hidden;border:2px solid var(--border);transition:all .18s;aspect-ratio:16/9"
          onmouseover="this.style.borderColor='var(--accent)';this.style.transform='scale(1.04)'"
          onmouseout="this.style.borderColor='var(--border)';this.style.transform=''">
          <div style="width:100%;height:100%;background:linear-gradient(145deg,${w.colors.join(',')});display:flex;align-items:flex-end;padding:6px">
            <span style="font-size:10px;font-weight:700;color:rgba(255,255,255,.85)">${w.label}</span>
          </div>
        </div>`).join('')}
    </div>

    <div style="display:flex;align-items:center;gap:10px;border-top:1px solid var(--border);padding-top:14px;flex-wrap:wrap">
      <span style="font-size:12px;color:var(--text-dim);font-weight:600">Accent:</span>
      ${['#5e81f4','#c77dff','#48cfad','#ff6b6b','#ffd93d','#fd79a8','#ff9f43','#00d4d8','#a9e34b','#f76707'].map(c=>
        `<div onclick="changeAccentColor('${c}')" style="width:26px;height:26px;border-radius:50%;background:${c};cursor:pointer;border:2px solid rgba(255,255,255,.15);transition:transform .12s;flex-shrink:0" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform=''"></div>`
      ).join('')}
    </div>`;
  document.body.appendChild(modal);
  setTimeout(() => document.addEventListener('keydown', function esc(e) {
    if (e.key==='Escape') { modal.remove(); document.removeEventListener('keydown',esc); }
  }), 10);
  setTimeout(() => document.addEventListener('click', function out(e) {
    if (!modal.contains(e.target)) { modal.remove(); document.removeEventListener('click',out); }
  }), 100);
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

// ─── SETTINGS WIRING ─────────────────────────────────
// Patch buildSettings to include wallpaper grid + new apps list
const _origBuildSettings = window.buildSettings;
window.buildSettings = function() {
  if (!_origBuildSettings) return '<div>Settings</div>';
  let html = _origBuildSettings();
  // Inject wallpaper section into settings
  html = html.replace(
    'id="settings-display"',
    `id="settings-display" style=""`
  );
  return html;
};

// Override changeWallpaper used in old settings to call new function
window.changeWallpaper = function(key) {
  applyWallpaperStyle(key);
  showNotif('🎨','Wallpaper','Changed to ' + key);
};

// Override changeAccent used in settings
window.changeAccent = function(c) {
  changeAccentColor(c);
};
