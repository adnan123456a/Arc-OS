/* ═══════════════════════════════════════
   ArcOS — Desktop Icons
   Draggable shortcuts · Right-click · Rename
═══════════════════════════════════════ */

let desktopIcons = [];
const DI_STORAGE_KEY = 'arcos_desktop_icons';

const DEFAULT_DESKTOP_ICONS = [
  { id:'di-trash',   label:'Trash',       icon:'🗑️',  type:'system',  app:null,     x:40,  y:80  },
  { id:'di-home',    label:'Home',        icon:'🏠',  type:'folder',  app:'files',  x:40,  y:175 },
  { id:'di-terminal',label:'Terminal',    icon:'⌨️',  type:'app',     app:'terminal',x:40, y:270 },
  { id:'di-readme',  label:'README.md',   icon:'📄',  type:'file',    app:'editor', x:40,  y:365 },
];

function loadDesktopIcons() {
  try {
    const saved = localStorage.getItem(DI_STORAGE_KEY);
    desktopIcons = saved ? JSON.parse(saved) : [...DEFAULT_DESKTOP_ICONS];
  } catch { desktopIcons = [...DEFAULT_DESKTOP_ICONS]; }
}

function saveDesktopIcons() {
  localStorage.setItem(DI_STORAGE_KEY, JSON.stringify(desktopIcons));
}

function renderDesktopIcons() {
  // Remove existing icon elements
  document.querySelectorAll('.desktop-icon').forEach(el => el.remove());

  desktopIcons.forEach(ic => {
    const el = document.createElement('div');
    el.className = 'desktop-icon';
    el.id = ic.id;
    el.style.cssText = `
      position:fixed;left:${ic.x}px;top:${ic.y}px;
      width:64px;z-index:5;
      display:flex;flex-direction:column;align-items:center;gap:4px;
      cursor:pointer;user-select:none;
    `;
    el.innerHTML = `
      <div class="di-icon-img" style="
        width:52px;height:52px;border-radius:12px;
        display:flex;align-items:center;justify-content:center;
        font-size:28px;
        background:rgba(255,255,255,.07);
        border:1.5px solid rgba(255,255,255,.1);
        transition:background .15s,transform .1s;
        backdrop-filter:blur(12px);
      ">${ic.icon}</div>
      <div class="di-label" style="
        font-size:11px;color:#fff;text-align:center;
        text-shadow:0 1px 4px rgba(0,0,0,.9);
        line-height:1.3;word-break:break-word;
        background:rgba(0,0,0,.35);
        padding:2px 5px;border-radius:4px;
        max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
      ">${ic.label}</div>
    `;

    // Single click = select, double click = open
    let clickTimer = null;
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        diOpenIcon(ic);
      } else {
        diSelectIcon(ic.id);
        clickTimer = setTimeout(() => { clickTimer = null; }, 300);
      }
    });

    // Right-click context menu
    el.addEventListener('contextmenu', e => {
      e.preventDefault();
      e.stopPropagation();
      showDiCtxMenu(ic, e.clientX, e.clientY);
    });

    // Drag
    el.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      e.stopPropagation();
      const startX = e.clientX, startY = e.clientY;
      let moved = false;
      const ox = e.clientX - ic.x, oy = e.clientY - ic.y;

      const mm = e2 => {
        if (Math.abs(e2.clientX-startX)>4 || Math.abs(e2.clientY-startY)>4) moved = true;
        if (!moved) return;
        ic.x = Math.max(0, Math.min(window.innerWidth-68, e2.clientX - ox));
        ic.y = Math.max(40, Math.min(window.innerHeight-100, e2.clientY - oy));
        el.style.left = ic.x + 'px';
        el.style.top  = ic.y + 'px';
      };
      const mu = () => {
        document.removeEventListener('mousemove', mm);
        document.removeEventListener('mouseup', mu);
        if (moved) saveDesktopIcons();
      };
      document.addEventListener('mousemove', mm);
      document.addEventListener('mouseup', mu);
    });

    document.body.appendChild(el);
  });
}

function diSelectIcon(id) {
  document.querySelectorAll('.desktop-icon .di-icon-img').forEach(el => {
    el.style.background = 'rgba(255,255,255,.07)';
    el.style.border = '1.5px solid rgba(255,255,255,.1)';
  });
  const el = document.querySelector(`#${id} .di-icon-img`);
  if (el) {
    el.style.background = 'rgba(94,129,244,.35)';
    el.style.border = '1.5px solid rgba(94,129,244,.7)';
  }
}

// Deselect when clicking desktop
document.addEventListener('click', e => {
  if (!e.target.closest('.desktop-icon') && !e.target.closest('#dock') && !e.target.closest('.window')) {
    document.querySelectorAll('.desktop-icon .di-icon-img').forEach(el => {
      el.style.background = 'rgba(255,255,255,.07)';
      el.style.border = '1.5px solid rgba(255,255,255,.1)';
    });
  }
});

function diOpenIcon(ic) {
  if (ic.app) openApp(ic.app);
  else if (ic.type === 'system' && ic.id === 'di-trash') showNotif('🗑️','Trash','Trash is empty');
  else if (ic.type === 'file') openApp('editor');
  else showNotif('📂','Desktop',ic.label+' opened');
}

function showDiCtxMenu(ic, x, y) {
  document.getElementById('di-ctx-menu')?.remove();
  const menu = document.createElement('div');
  menu.id = 'di-ctx-menu';
  menu.style.cssText = `
    position:fixed;left:${Math.min(x, window.innerWidth-180)}px;top:${Math.min(y, window.innerHeight-200)}px;
    background:rgba(14,14,28,.97);border:1px solid var(--border);border-radius:12px;
    padding:5px;min-width:170px;z-index:999990;
    box-shadow:0 16px 50px rgba(0,0,0,.7);backdrop-filter:blur(20px);
  `;
  const items = [
    ['▶ Open',          () => diOpenIcon(ic)],
    ['✏️ Rename',        () => diRename(ic)],
    ['🗑 Delete',        () => diDelete(ic.id)],
    null,
    ['📌 Pin to Dock',   () => pinApp(ic.app||'files')],
    ['+ New Shortcut',   () => diAddShortcut()],
  ];
  items.forEach(item => {
    if (!item) { const sep=document.createElement('div'); sep.style.cssText='height:1px;background:var(--border);margin:3px 5px'; menu.appendChild(sep); return; }
    const [label, fn] = item;
    const el = document.createElement('div');
    el.className = 'ctx-item';
    el.textContent = label;
    el.onclick = () => { menu.remove(); fn(); };
    menu.appendChild(el);
  });
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener('click', function off() { menu.remove(); document.removeEventListener('click',off); }), 10);
}

function diRename(ic) {
  const el = document.querySelector(`#${ic.id} .di-label`);
  if (!el) return;
  const prev = ic.label;
  el.contentEditable = 'true';
  el.style.background = 'rgba(0,0,0,.7)';
  el.style.outline = '1px solid var(--accent)';
  el.focus();
  const range = document.createRange(); range.selectNodeContents(el); window.getSelection()?.removeAllRanges(); window.getSelection()?.addRange(range);
  const done = () => {
    el.contentEditable = 'false';
    el.style.outline = '';
    ic.label = el.textContent.trim() || prev;
    el.textContent = ic.label;
    saveDesktopIcons();
  };
  el.onblur = done;
  el.onkeydown = e => { if (e.key==='Enter') { e.preventDefault(); done(); } if (e.key==='Escape') { el.textContent=prev; done(); } };
}

function diDelete(id) {
  desktopIcons = desktopIcons.filter(ic => ic.id !== id);
  document.getElementById(id)?.remove();
  saveDesktopIcons();
}

function diAddShortcut() {
  // Show app picker
  const picker = document.createElement('div');
  picker.style.cssText = `
    position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
    background:var(--bg2);border:1px solid var(--border);border-radius:16px;
    padding:16px;z-index:999999;width:340px;max-height:400px;
    display:flex;flex-direction:column;gap:10px;
    box-shadow:0 20px 60px rgba(0,0,0,.8);
  `;
  picker.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="font-weight:700">Add Desktop Shortcut</span>
      <button onclick="this.closest('div[style]').remove()" style="background:none;border:none;color:var(--text-dim);font-size:18px;cursor:pointer">×</button>
    </div>
    <div style="overflow-y:auto;max-height:300px;display:flex;flex-direction:column;gap:4px">
      ${APP_DEFS.map(a => `
        <div onclick="diCreateShortcut('${a.id}');this.closest('div[style]').remove()"
          style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;transition:background .1s"
          onmouseover="this.style.background='var(--card)'" onmouseout="this.style.background=''">
          <div style="width:32px;height:32px;border-radius:8px;background:${a.bg};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">
            ${a.icon.replace(/width="[^"]*"/g,'width="20"').replace(/height="[^"]*"/g,'height="20"')}
          </div>
          <span style="font-size:13px">${a.name}</span>
        </div>`).join('')}
    </div>
  `;
  document.body.appendChild(picker);
}

function diCreateShortcut(appId) {
  const app = APP_DEFS.find(a => a.id === appId);
  if (!app) return;
  const ic = {
    id: 'di-'+appId+'-'+Date.now(),
    label: app.name,
    icon: '🔗',
    type: 'app',
    app: appId,
    x: 40 + Math.random()*200,
    y: 80 + Math.random()*300,
  };
  desktopIcons.push(ic);
  saveDesktopIcons();
  renderDesktopIcons();
  showNotif('📌','Desktop',app.name+' shortcut added');
}

// Add to right-click desktop menu
const _diOrigCtxAction = window.ctxAction;
window.ctxAction = function(action) {
  if (action === 'shortcut') { diAddShortcut(); return; }
  if (_diOrigCtxAction) _diOrigCtxAction(action);
};

// Inject into existing context menu HTML
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const menu = document.getElementById('context-menu');
    if (menu && !menu.querySelector('[data-di]')) {
      const item = document.createElement('div');
      item.className = 'ctx-item';
      item.dataset.di = '1';
      item.textContent = '📌 Add Desktop Shortcut';
      item.onclick = () => { hideCtxMenu(); diAddShortcut(); };
      menu.appendChild(item);
    }
    loadDesktopIcons();
    renderDesktopIcons();
  }, 2900);
});
