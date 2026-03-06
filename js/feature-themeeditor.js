/* ═══════════════════════════════════════
   ArcOS — Theme Editor
   Live CSS variables · Presets · Export
═══════════════════════════════════════ */

const THEME_PRESETS = {
  'Arc Dark': {
    '--bg':'#05050f','--bg2':'#0b0b1e','--card':'rgba(255,255,255,.06)',
    '--card-hover':'rgba(255,255,255,.1)','--border':'rgba(255,255,255,.1)',
    '--text':'#e8e8f0','--text-dim':'rgba(255,255,255,.45)',
    '--accent':'#5e81f4','--accent2':'#c77dff','--accent3':'#48cfad',
    '--win-bar':'rgba(8,8,20,.9)','--topbar':'rgba(6,6,16,.95)',
    '--red':'#ff6b6b','--green':'#6bcb77','--yellow':'#ffd93d',
  },
  'Catppuccin': {
    '--bg':'#1e1e2e','--bg2':'#181825','--card':'rgba(49,50,68,.7)',
    '--card-hover':'rgba(69,71,90,.8)','--border':'rgba(137,180,250,.15)',
    '--text':'#cdd6f4','--text-dim':'rgba(205,214,244,.5)',
    '--accent':'#89b4fa','--accent2':'#cba6f7','--accent3':'#a6e3a1',
    '--win-bar':'rgba(24,24,37,.95)','--topbar':'rgba(17,17,27,.97)',
    '--red':'#f38ba8','--green':'#a6e3a1','--yellow':'#f9e2af',
  },
  'Dracula': {
    '--bg':'#282a36','--bg2':'#21222c','--card':'rgba(68,71,90,.6)',
    '--card-hover':'rgba(98,114,164,.4)','--border':'rgba(98,114,164,.3)',
    '--text':'#f8f8f2','--text-dim':'rgba(248,248,242,.5)',
    '--accent':'#bd93f9','--accent2':'#ff79c6','--accent3':'#50fa7b',
    '--win-bar':'rgba(33,34,44,.95)','--topbar':'rgba(21,22,28,.97)',
    '--red':'#ff5555','--green':'#50fa7b','--yellow':'#f1fa8c',
  },
  'Tokyo Night': {
    '--bg':'#1a1b26','--bg2':'#16161e','--card':'rgba(42,46,62,.7)',
    '--card-hover':'rgba(52,59,79,.8)','--border':'rgba(122,162,247,.15)',
    '--text':'#c0caf5','--text-dim':'rgba(192,202,245,.45)',
    '--accent':'#7aa2f7','--accent2':'#bb9af7','--accent3':'#73daca',
    '--win-bar':'rgba(22,22,30,.95)','--topbar':'rgba(15,15,22,.97)',
    '--red':'#f7768e','--green':'#9ece6a','--yellow':'#e0af68',
  },
  'Solarized': {
    '--bg':'#002b36','--bg2':'#073642','--card':'rgba(7,54,66,.7)',
    '--card-hover':'rgba(0,43,54,.9)','--border':'rgba(0,128,128,.25)',
    '--text':'#839496','--text-dim':'rgba(131,148,150,.5)',
    '--accent':'#268bd2','--accent2':'#2aa198','--accent3':'#859900',
    '--win-bar':'rgba(7,54,66,.95)','--topbar':'rgba(0,43,54,.97)',
    '--red':'#dc322f','--green':'#859900','--yellow':'#b58900',
  },
  'Gruvbox': {
    '--bg':'#282828','--bg2':'#1d2021','--card':'rgba(60,56,54,.7)',
    '--card-hover':'rgba(80,73,69,.7)','--border':'rgba(168,153,132,.2)',
    '--text':'#ebdbb2','--text-dim':'rgba(235,219,178,.5)',
    '--accent':'#fabd2f','--accent2':'#fe8019','--accent3':'#b8bb26',
    '--win-bar':'rgba(32,32,32,.95)','--topbar':'rgba(22,22,22,.97)',
    '--red':'#fb4934','--green':'#b8bb26','--yellow':'#fabd2f',
  },
  'Nord': {
    '--bg':'#2e3440','--bg2':'#242933','--card':'rgba(59,66,82,.7)',
    '--card-hover':'rgba(67,76,94,.8)','--border':'rgba(136,192,208,.15)',
    '--text':'#eceff4','--text-dim':'rgba(236,239,244,.45)',
    '--accent':'#88c0d0','--accent2':'#b48ead','--accent3':'#a3be8c',
    '--win-bar':'rgba(36,41,51,.95)','--topbar':'rgba(26,30,38,.97)',
    '--red':'#bf616a','--green':'#a3be8c','--yellow':'#ebcb8b',
  },
  'Monokai': {
    '--bg':'#272822','--bg2':'#1e1f1c','--card':'rgba(57,58,52,.7)',
    '--card-hover':'rgba(73,72,62,.7)','--border':'rgba(248,248,242,.1)',
    '--text':'#f8f8f2','--text-dim':'rgba(248,248,242,.45)',
    '--accent':'#a6e22e','--accent2':'#66d9e8','--accent3':'#fd971f',
    '--win-bar':'rgba(30,31,28,.95)','--topbar':'rgba(22,23,20,.97)',
    '--red':'#f92672','--green':'#a6e22e','--yellow':'#e6db74',
  },
};

function openThemeEditor() {
  if (document.getElementById('theme-editor-win')) {
    document.getElementById('theme-editor-win').remove();
    return;
  }

  const vars = [
    ['Background',    '--bg',        'color'],
    ['Background 2',  '--bg2',       'color'],
    ['Accent',        '--accent',    'color'],
    ['Accent 2',      '--accent2',   'color'],
    ['Accent 3',      '--accent3',   'color'],
    ['Text',          '--text',      'color'],
    ['Border',        '--border',    'text'],
    ['Card BG',       '--card',      'text'],
    ['Win Bar',       '--win-bar',   'text'],
    ['Red',           '--red',       'color'],
    ['Green',         '--green',     'color'],
    ['Yellow',        '--yellow',    'color'],
  ];

  const win = document.createElement('div');
  win.id = 'theme-editor-win';
  win.style.cssText = `
    position:fixed;top:60px;right:20px;width:320px;
    background:var(--bg2);border:1px solid var(--border);border-radius:16px;
    z-index:99998;box-shadow:0 24px 80px rgba(0,0,0,.8);
    display:flex;flex-direction:column;overflow:hidden;
    max-height:80vh;
  `;

  const currentVars = {};
  vars.forEach(([,cssVar]) => {
    currentVars[cssVar] = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  });

  win.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--win-bar);border-bottom:1px solid var(--border);cursor:move" id="te-drag-handle">
      <span style="font-weight:700;font-size:14px">🎨 Theme Editor</span>
      <button onclick="document.getElementById('theme-editor-win').remove()" style="background:none;border:none;color:var(--text-dim);font-size:18px;cursor:pointer;line-height:1">×</button>
    </div>

    <div style="padding:10px 12px;border-bottom:1px solid var(--border)">
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px;text-transform:uppercase;letter-spacing:.8px">Presets</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${Object.keys(THEME_PRESETS).map(name => `
          <button onclick="applyThemePreset('${name}')"
            style="padding:4px 10px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:11px;cursor:pointer;font-family:inherit;transition:all .12s"
            onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'"
          >${name}</button>`).join('')}
      </div>
    </div>

    <div style="flex:1;overflow-y:auto;padding:10px 12px;display:flex;flex-direction:column;gap:8px">
      ${vars.map(([label, cssVar, type]) => {
        const val = currentVars[cssVar] || '#ffffff';
        const isSimpleColor = type === 'color' && val.startsWith('#');
        return `
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:100px;font-size:12px;color:var(--text-dim);flex-shrink:0">${label}</div>
          ${isSimpleColor ? `
            <input type="color" value="${val}" id="te-${cssVar.replace(/-/g,'_')}"
              oninput="teApplyVar('${cssVar}',this.value)"
              style="width:36px;height:28px;border:1px solid var(--border);border-radius:6px;cursor:pointer;background:none;padding:1px">
          ` : ''}
          <input type="text" value="${val}" id="te-text-${cssVar.replace(/-/g,'_')}"
            oninput="teApplyVar('${cssVar}',this.value)"
            style="flex:1;padding:5px 8px;background:var(--card);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:11px;font-family:'Source Code Pro',monospace;outline:none">
        </div>`;
      }).join('')}
    </div>

    <div style="padding:10px 12px;border-top:1px solid var(--border);display:flex;gap:6px">
      <button onclick="teExport()" style="flex:1;padding:7px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:12px;cursor:pointer;font-family:inherit">📋 Copy CSS</button>
      <button onclick="teReset()" style="flex:1;padding:7px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text-dim);font-size:12px;cursor:pointer;font-family:inherit">↺ Reset</button>
      <button onclick="teSave()" style="flex:1;padding:7px;border-radius:8px;border:none;background:var(--accent);color:#fff;font-size:12px;cursor:pointer;font-family:inherit;font-weight:700">💾 Save</button>
    </div>
  `;

  document.body.appendChild(win);

  // Make draggable
  const handle = document.getElementById('te-drag-handle');
  let ox, oy;
  handle.addEventListener('mousedown', e => {
    ox = e.clientX - win.offsetLeft; oy = e.clientY - win.offsetTop;
    const mm = e2 => { win.style.left=(e2.clientX-ox)+'px'; win.style.top=(e2.clientY-oy)+'px'; win.style.right='auto'; };
    const mu = () => { document.removeEventListener('mousemove',mm); document.removeEventListener('mouseup',mu); };
    document.addEventListener('mousemove',mm); document.addEventListener('mouseup',mu);
  });
}

function teApplyVar(cssVar, val) {
  document.documentElement.style.setProperty(cssVar, val);
  // Sync text and color inputs
  const key = cssVar.replace(/-/g,'_');
  const colorEl = document.getElementById('te-'+key);
  const textEl  = document.getElementById('te-text-'+key);
  if (colorEl && val.startsWith('#') && val.length === 7) colorEl.value = val;
  if (textEl)  textEl.value = val;
}

function applyThemePreset(name) {
  const preset = THEME_PRESETS[name];
  if (!preset) return;
  Object.entries(preset).forEach(([cssVar, val]) => {
    document.documentElement.style.setProperty(cssVar, val);
    const key = cssVar.replace(/-/g,'_');
    const colorEl = document.getElementById('te-'+key);
    const textEl  = document.getElementById('te-text-'+key);
    if (colorEl && val.startsWith('#') && val.length===7) colorEl.value = val;
    if (textEl)  textEl.value = val;
  });
  localStorage.setItem('arcos_theme_preset', name);
  localStorage.setItem('arcos_theme_vars', JSON.stringify(preset));
  showNotif('🎨','Theme',name+' applied');
}

function teSave() {
  const vars = {};
  document.querySelectorAll('[id^="te-text-"]').forEach(el => {
    const cssVar = '--' + el.id.replace('te-text-','').replace(/_/g,'-');
    vars[cssVar] = el.value;
  });
  localStorage.setItem('arcos_theme_vars', JSON.stringify(vars));
  showNotif('💾','Theme','Theme saved');
}

function teReset() {
  localStorage.removeItem('arcos_theme_vars');
  localStorage.removeItem('arcos_theme_preset');
  location.reload();
}

function teExport() {
  const lines = [':root {'];
  document.querySelectorAll('[id^="te-text-"]').forEach(el => {
    const cssVar = '--' + el.id.replace('te-text-','').replace(/_/g,'-');
    lines.push(`  ${cssVar}: ${el.value};`);
  });
  lines.push('}');
  navigator.clipboard?.writeText(lines.join('\n'));
  showNotif('📋','Theme','CSS variables copied to clipboard');
}

// Load saved theme on boot
function loadSavedTheme() {
  try {
    const saved = localStorage.getItem('arcos_theme_vars');
    if (saved) {
      const vars = JSON.parse(saved);
      Object.entries(vars).forEach(([k,v]) => document.documentElement.style.setProperty(k,v));
    }
  } catch {}
}

// Add Theme Editor to right-click context menu
const _teOrigCtxMenu = window.showCtxMenu;
window.showCtxMenu = function(x, y) {
  if (_teOrigCtxMenu) _teOrigCtxMenu(x, y);
  // Inject theme editor option into context menu if not already there
  const menu = document.getElementById('context-menu');
  if (menu && !menu.querySelector('[data-te]')) {
    const item = document.createElement('div');
    item.className = 'ctx-item';
    item.dataset.te = '1';
    item.textContent = '🎨 Theme Editor';
    item.onclick = () => { hideCtxMenu(); openThemeEditor(); };
    menu.appendChild(item);
  }
};

window.openThemeEditor = openThemeEditor;
window.applyThemePreset = applyThemePreset;

document.addEventListener('DOMContentLoaded', () => setTimeout(loadSavedTheme, 100));
