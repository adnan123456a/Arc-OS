/* ═══════════════════════════════════════
   ArcOS — Tools: Files, Calculator, Clock, SysMon, Settings,
                  GitHub, JSON Formatter, Markdown, Sticky Notes
═══════════════════════════════════════ */

// ─── FILES ─────────────────────────────────────────────
function buildFiles() {
  return `<div id="files-content">
    <div id="files-sidebar">
      <div class="files-nav-item active" onclick="navigateTo(['home'])">🏠 Home</div>
      <div class="files-nav-item" onclick="navigateTo(['home','Documents'])">📄 Documents</div>
      <div class="files-nav-item" onclick="navigateTo(['home','Downloads'])">⬇️ Downloads</div>
      <div class="files-nav-item" onclick="navigateTo(['home','Pictures'])">🖼️ Pictures</div>
      <div class="files-nav-item" onclick="navigateTo(['home','Music'])">🎵 Music</div>
      <div class="files-nav-item" onclick="navigateTo(['tmp'])">🗑️ Trash</div>
    </div>
    <div id="files-main">
      <div id="files-path" style="font-size:12px;color:var(--text-dim);margin-bottom:12px;padding:4px 0;border-bottom:1px solid var(--border)"></div>
      <div id="files-grid"></div>
    </div>
  </div>`;
}
function navigateTo(path) { cwd = path; renderFiles(); }
function renderFiles() {
  const grid = document.getElementById('files-grid');
  const pe   = document.getElementById('files-path');
  if (!grid) return;
  let dir = fileSystem;
  for (const k of cwd) dir = dir[k] || dir.children?.[k] || dir;
  if (pe) pe.textContent = '/' + cwd.join('/');
  const entries = Object.values(dir.children || {});
  const folderIcon = `<svg viewBox="0 0 48 48" fill="none"><path d="M8 12a4 4 0 014-4h10l4 4h14a4 4 0 014 4v20a4 4 0 01-4 4H12a4 4 0 01-4-4V12z" fill="#1db0a6" opacity=".9"/></svg>`;
  const fileIcon   = `<svg viewBox="0 0 48 48" fill="none"><rect x="10" y="6" width="28" height="36" rx="3" fill="#a29bfe"/><line x1="16" y1="18" x2="32" y2="18" stroke="white" stroke-width="2"/><line x1="16" y1="24" x2="32" y2="24" stroke="white" stroke-width="2"/><line x1="16" y1="30" x2="24" y2="30" stroke="white" stroke-width="2"/></svg>`;
  grid.innerHTML = entries.length
    ? entries.map(e => `<div class="file-item" ondblclick="fileOpen('${e.name}')"><div class="file-icon-wrap">${e.type === 'dir' ? folderIcon : fileIcon}</div><div>${e.name}</div></div>`).join('')
    : '<div style="color:var(--text-dim);font-size:13px;padding:10px">Empty folder</div>';
}
function fileOpen(name) {
  let dir = fileSystem;
  for (const k of cwd) dir = dir[k] || dir.children?.[k] || dir;
  const f = dir.children?.[name]; if (!f) return;
  if (f.type === 'dir') { cwd = [...cwd, name]; renderFiles(); }
  else {
    openApp('editor');
    setTimeout(() => {
      const ta = document.getElementById('text-area');
      const fn = document.getElementById('editor-filename');
      if (ta) ta.value = f.content || '';
      if (fn) fn.value = f.name;
    }, 120);
  }
}

// ─── CALCULATOR ────────────────────────────────────────
let calcExpr = '';
function buildCalculator() {
  const btns = [
    {l:'C',c:'clear'},{l:'±',c:'num',fn:"calcToggle()"},{l:'%',c:'num',fn:"calcPercent()"},{l:'÷',c:'op',fn:"calcOp('/')"},
    {l:'7',c:'num',fn:"calcNum('7')"},{l:'8',c:'num',fn:"calcNum('8')"},{l:'9',c:'num',fn:"calcNum('9')"},{l:'×',c:'op',fn:"calcOp('*')"},
    {l:'4',c:'num',fn:"calcNum('4')"},{l:'5',c:'num',fn:"calcNum('5')"},{l:'6',c:'num',fn:"calcNum('6')"},{l:'−',c:'op',fn:"calcOp('-')"},
    {l:'1',c:'num',fn:"calcNum('1')"},{l:'2',c:'num',fn:"calcNum('2')"},{l:'3',c:'num',fn:"calcNum('3')"},{l:'+',c:'op',fn:"calcOp('+')"},
    {l:'0',c:'num span2',fn:"calcNum('0')"},{l:'.',c:'num',fn:"calcNum('.')"},{l:'=',c:'eq',fn:'calcEquals()'},
  ];
  return `<div id="calc-content">
    <div id="calc-display">
      <div id="calc-expr"></div>
      <div id="calc-result">0</div>
    </div>
    <div id="calc-buttons">
      ${btns.map(b => `<button class="calc-btn ${b.c==='clear'?'clear':b.c==='op'?'op':b.c==='eq'?'eq':'num'}" ${b.c.includes('span2')?'style="grid-column:span 2"':''} onclick="${b.c==='clear'?'calcClear()':b.fn}">${b.l}</button>`).join('')}
    </div>
  </div>`;
}
function calcNum(n)     { calcExpr += n; document.getElementById('calc-result').textContent = calcExpr; }
function calcOp(op)     { calcExpr += op; document.getElementById('calc-expr').textContent = calcExpr; document.getElementById('calc-result').textContent = calcExpr; }
function calcEquals()   {
  try {
    const r = Function('"use strict";return (' + calcExpr.replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-') + ')')();
    document.getElementById('calc-expr').textContent = calcExpr + '=';
    document.getElementById('calc-result').textContent = r;
    calcExpr = String(r);
  } catch (e) { document.getElementById('calc-result').textContent = 'Error'; calcExpr = ''; }
}
function calcClear()    { calcExpr = ''; document.getElementById('calc-result').textContent = '0'; document.getElementById('calc-expr').textContent = ''; }
function calcToggle()   { calcExpr = String(-parseFloat(calcExpr)); document.getElementById('calc-result').textContent = calcExpr; }
function calcPercent()  { calcExpr = String(parseFloat(calcExpr) / 100); document.getElementById('calc-result').textContent = calcExpr; }

// ─── CLOCK ──────────────────────────────────────────────
function buildClock() {
  return `<div id="clock-content">
    <div id="big-clock">00:00:00</div>
    <div id="big-date"></div>
    <div id="calendar-grid"></div>
  </div>`;
}
let clockInterval;
function startClockWidget() {
  function tick() {
    const n = new Date();
    const cl = document.getElementById('big-clock');
    const dt = document.getElementById('big-date');
    if (cl) cl.textContent = n.toLocaleTimeString('en-US', { hour12:false });
    if (dt) dt.textContent = n.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    buildCalendar(n);
  }
  tick(); clockInterval = setInterval(tick, 1000);
}
function buildCalendar(now) {
  const grid = document.getElementById('calendar-grid'); if (!grid) return;
  const y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days  = new Date(y, m+1, 0).getDate();
  let html = ['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => `<div class="cal-header">${d}</div>`).join('');
  for (let i = 0; i < first; i++) html += `<div class="cal-day other-month"></div>`;
  for (let d = 1; d <= days; d++) html += `<div class="cal-day${d === now.getDate() ? ' today' : ''}">${d}</div>`;
  grid.innerHTML = html;
}

// ─── SYSTEM MONITOR ────────────────────────────────────
function buildSysMon() {
  return `<div id="sysmon-content">
    <div style="margin-bottom:16px">
      <div class="sysmon-title">CPU Usage</div>
      ${[0,1,2,3].map(i => `<div class="bar-row"><div class="bar-label">Core ${i}</div><div class="bar-track"><div class="bar-fill" id="cpu${i}" style="background:var(--accent);width:0"></div></div><div class="bar-val" id="cpu${i}v">0%</div></div>`).join('')}
    </div>
    <div style="margin-bottom:16px">
      <div class="sysmon-title">Memory</div>
      <div class="bar-row"><div class="bar-label">RAM</div><div class="bar-track"><div class="bar-fill" id="ram" style="background:var(--accent3);width:42%"></div></div><div class="bar-val">42%</div></div>
      <div class="bar-row"><div class="bar-label">Swap</div><div class="bar-track"><div class="bar-fill" id="swap" style="background:var(--yellow);width:8%"></div></div><div class="bar-val">8%</div></div>
    </div>
    <div>
      <div class="sysmon-title">Processes</div>
      <table id="processes-table">
        <tr><th>PID</th><th>Name</th><th>CPU%</th><th>MEM</th><th>Status</th></tr>
        <tr><td>1</td><td>arcwm</td><td id="p1cpu">2.1</td><td>12MB</td><td style="color:var(--green)">running</td></tr>
        <tr><td>42</td><td>arcshell</td><td id="p2cpu">0.3</td><td>4MB</td><td style="color:var(--green)">running</td></tr>
        <tr><td>99</td><td>browser</td><td id="p3cpu">14.2</td><td>88MB</td><td style="color:var(--green)">running</td></tr>
        <tr><td>201</td><td>networkd</td><td id="p4cpu">0.1</td><td>3MB</td><td style="color:var(--yellow)">sleeping</td></tr>
        <tr><td>305</td><td>youtube</td><td id="p5cpu">3.8</td><td>22MB</td><td style="color:var(--green)">running</td></tr>
      </table>
    </div>
  </div>`;
}
function startSysMon() {
  function u() {
    [0,1,2,3].forEach(i => {
      const v = Math.round(Math.random() * 75 + 5);
      const e = document.getElementById(`cpu${i}`); const vl = document.getElementById(`cpu${i}v`);
      if (e) e.style.width = v + '%'; if (vl) vl.textContent = v + '%';
    });
    ['p1cpu','p2cpu','p3cpu','p4cpu','p5cpu'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = (Math.random() * 20).toFixed(1); });
  }
  u(); setInterval(u, 1500);
}

// ─── SETTINGS ──────────────────────────────────────────
// Photo wallpapers used in settings panel
const SETTINGS_WALLPAPERS = [
  { key:'wp-galaxy',    label:'Galaxy',     url:'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1920&q=85', thumb:'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=600&q=80' },
  { key:'wp-aurora',   label:'Aurora',      url:'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=85', thumb:'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80' },
  { key:'wp-mountain', label:'Mountains',   url:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=85', thumb:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80' },
  { key:'wp-ocean',    label:'Ocean',       url:'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=85', thumb:'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80' },
  { key:'wp-forest',   label:'Forest',      url:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=85', thumb:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80' },
  { key:'wp-city',     label:'City Night',  url:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=85', thumb:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80' },
  { key:'wp-desert',   label:'Desert',      url:'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=85', thumb:'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80' },
  { key:'wp-abstract', label:'Abstract',    url:'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=85', thumb:'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80' },
  { key:'wp-night',    label:'Starry Night',url:'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=85', thumb:'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80' },
  { key:'wp-volcano',  label:'Volcano',     url:'https://images.unsplash.com/photo-1611095560587-e36d83f63b38?w=1920&q=85', thumb:'https://images.unsplash.com/photo-1611095560587-e36d83f63b38?w=600&q=80' },
  { key:'wp-snow',     label:'Snow Peak',   url:'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=1920&q=85', thumb:'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=600&q=80' },
  { key:'wp-lake',     label:'Lake',        url:'https://images.unsplash.com/photo-1439853949212-36589f9bcc06?w=1920&q=85', thumb:'https://images.unsplash.com/photo-1439853949212-36589f9bcc06?w=600&q=80' },
];

function buildSettings() {
  return `<div id="settings-content">
    <div id="settings-sidebar">
      <div style="padding:16px 14px 10px;border-bottom:1px solid var(--border)">
        <div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#5e81f4,#c77dff);margin:0 auto 8px;display:flex;align-items:center;justify-content:center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div style="text-align:center;font-weight:700;font-size:13px">User</div>
        <div style="text-align:center;font-size:11px;color:var(--text-dim)">ArcOS Desktop</div>
      </div>
      <div class="settings-nav active" onclick="switchSettings('wallpaper',this)">🖼️ Wallpaper</div>
      <div class="settings-nav" onclick="switchSettings('appearance',this)">🎨 Appearance</div>
      <div class="settings-nav" onclick="switchSettings('windows',this)">🪟 Windows & Tiling</div>
      <div class="settings-nav" onclick="switchSettings('desktops',this)">🖥️ Virtual Desktops</div>
      <div class="settings-nav" onclick="switchSettings('sound',this)">🔊 Sound</div>
      <div class="settings-nav" onclick="switchSettings('network',this)">📡 Network</div>
      <div class="settings-nav" onclick="switchSettings('about',this)">ℹ️ About</div>
    </div>
    <div id="settings-main">

      <!-- WALLPAPER -->
      <div class="settings-section active" id="settings-wallpaper">
        <h3 style="margin-bottom:4px">Wallpaper</h3>
        <p style="font-size:12px;color:var(--text-dim);margin-bottom:16px">Click any photo to apply it as your desktop background.</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
          ${SETTINGS_WALLPAPERS.map(w=>`
            <div onclick="settingsApplyWallpaper('${w.url}','${w.key}')"
              id="wpthumb-${w.key}"
              style="cursor:pointer;border-radius:12px;overflow:hidden;border:2px solid var(--border);aspect-ratio:16/9;position:relative;background:#1a1a2e;transition:all .18s"
              onmouseover="this.style.borderColor='var(--accent)';this.style.transform='scale(1.03)'"
              onmouseout="this.style.borderColor='var(--border)';this.style.transform=''">
              <img src="${w.thumb}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block"
                onerror="this.style.display='none'">
              <div style="position:absolute;bottom:0;left:0;right:0;padding:6px 8px;background:linear-gradient(transparent,rgba(0,0,0,.85));font-size:11px;font-weight:700;color:rgba(255,255,255,.95)">${w.label}</div>
              <div id="wpcheck-${w.key}" style="display:none;position:absolute;top:6px;right:6px;background:var(--accent);border-radius:50%;width:20px;height:20px;align-items:center;justify-content:center;font-size:12px">✓</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- APPEARANCE -->
      <div class="settings-section" id="settings-appearance">
        <h3 style="margin-bottom:14px">Appearance</h3>
        <div class="settings-group">
          <div class="settings-row"><div class="settings-label">Blur Effects</div><div class="toggle on" onclick="this.classList.toggle('on')"></div></div>
          <div class="settings-row"><div class="settings-label">Animations</div><div class="toggle on" onclick="this.classList.toggle('on')"></div></div>
        </div>
        <div class="settings-group">
          <div class="settings-row">
            <div class="settings-label">Accent Color</div>
            <div style="display:flex;gap:7px;flex-wrap:wrap">
              ${['#5e81f4','#c77dff','#48cfad','#ff6b6b','#ffd93d','#fd79a8','#ff9f43','#00d4d8','#a9e34b'].map(c=>
                `<div style="width:24px;height:24px;border-radius:50%;background:${c};cursor:pointer;border:2px solid rgba(255,255,255,.15);transition:transform .15s" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform=''" onclick="changeAccent('${c}')"></div>`
              ).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- WINDOWS & TILING -->
      <div class="settings-section" id="settings-windows">
        <h3 style="margin-bottom:4px">Windows & Tiling</h3>
        <p style="font-size:12px;color:var(--text-dim);margin-bottom:16px">Tile all open windows. Also accessible via <kbd style="background:var(--card);padding:2px 6px;border-radius:4px;font-size:11px">Ctrl+Shift+T</kbd></p>
        <div class="settings-group">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            ${[
              ['2col','Two Columns','⬜⬜','Split screen left/right'],
              ['3col','Three Columns','▪▪▪','Three equal columns'],
              ['quad','Quad Grid','⊞','Four windows in grid'],
              ['main','Main + Side','▊▌','Large left, stack right'],
              ['full','Fullscreen','⬛','Active window fills screen'],
            ].map(([mode,label,icon,desc])=>`
              <div onclick="tileWindows('${mode}');showNotif('🪟','Tiling','${label} applied')"
                style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 12px;cursor:pointer;text-align:center;transition:all .15s"
                onmouseover="this.style.borderColor='var(--accent)';this.style.background='rgba(94,129,244,.1)'"
                onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--card)'">
                <div style="font-size:26px;margin-bottom:6px">${icon}</div>
                <div style="font-weight:700;font-size:13px;margin-bottom:3px">${label}</div>
                <div style="font-size:10px;color:var(--text-dim)">${desc}</div>
              </div>`).join('')}
            <div onclick="untileAll();showNotif('🪟','Tiling','Windows floating')"
              style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 12px;cursor:pointer;text-align:center;transition:all .15s"
              onmouseover="this.style.borderColor='rgba(255,107,107,.6)';this.style.background='rgba(255,107,107,.08)'"
              onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--card)'">
              <div style="font-size:26px;margin-bottom:6px">🌊</div>
              <div style="font-weight:700;font-size:13px;margin-bottom:3px">Float All</div>
              <div style="font-size:10px;color:var(--text-dim)">Restore free movement</div>
            </div>
          </div>
        </div>
        <div class="settings-group">
          <div class="settings-row"><div class="settings-label">Snap to edges<small>Drag window to edge to snap</small></div><div class="toggle on" onclick="this.classList.toggle('on')"></div></div>
          <div class="settings-row"><div class="settings-label">Show snap preview</div><div class="toggle on" onclick="this.classList.toggle('on')"></div></div>
        </div>
      </div>

      <!-- VIRTUAL DESKTOPS -->
      <div class="settings-section" id="settings-desktops">
        <h3 style="margin-bottom:4px">Virtual Desktops</h3>
        <p style="font-size:12px;color:var(--text-dim);margin-bottom:16px">Switch between workspaces. Also <kbd style="background:var(--card);padding:2px 6px;border-radius:4px;font-size:11px">Ctrl+1–4</kbd></p>
        <div class="settings-group">
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px" id="settings-desk-grid">
            ${Array.from({length:4},(_,i)=>`
              <div onclick="switchDesktop(${i+1});showNotif('🖥️','Desktop','Switched to Desktop ${i+1}')"
                id="settings-desk-${i+1}"
                style="background:var(--card);border:2px solid ${typeof currentDesktop!=='undefined'&&currentDesktop===i+1?'var(--accent)':'var(--border)'};border-radius:12px;padding:18px 14px;cursor:pointer;display:flex;align-items:center;gap:12px;transition:all .15s"
                onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='${typeof currentDesktop!=='undefined'&&currentDesktop===i+1?'var(--accent)':'var(--border)'}'">
                <div style="width:40px;height:30px;border-radius:6px;border:1.5px solid var(--border);background:rgba(94,129,244,.1);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:var(--accent);flex-shrink:0">${i+1}</div>
                <div>
                  <div style="font-weight:700;font-size:13px">Desktop ${i+1}</div>
                  <div style="font-size:11px;color:var(--text-dim)">${typeof desktopWindows!=='undefined'&&desktopWindows[i+1]?.size>0?desktopWindows[i+1].size+' window(s) open':'Empty'}</div>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- SOUND -->
      <div class="settings-section" id="settings-sound">
        <h3 style="margin-bottom:14px">Sound</h3>
        <div class="settings-group">
          <div class="settings-row"><div class="settings-label">Master Volume</div><input type="range" min="0" max="100" value="75" style="accent-color:var(--accent)"></div>
          <div class="settings-row"><div class="settings-label">System Sounds</div><div class="toggle on" onclick="this.classList.toggle('on')"></div></div>
        </div>
      </div>

      <!-- NETWORK -->
      <div class="settings-section" id="settings-network">
        <h3 style="margin-bottom:14px">Network</h3>
        <div class="settings-group">
          <div class="settings-row"><div class="settings-label">Wi-Fi<small>Connected: ArcOS-5G</small></div><div class="toggle on" onclick="this.classList.toggle('on')"></div></div>
          <div class="settings-row"><div class="settings-label">Bluetooth</div><div class="toggle" onclick="this.classList.toggle('on')"></div></div>
        </div>
      </div>

      <!-- ABOUT -->
      <div class="settings-section" id="settings-about">
        <h3 style="margin-bottom:14px">About ArcOS</h3>
        <div class="settings-group">
          <div class="settings-row"><div class="settings-label">Version</div><div style="font-size:12px;color:var(--text-dim)">ArcOS v3.0</div></div>
          <div class="settings-row"><div class="settings-label">Kernel</div><div style="font-size:12px;color:var(--text-dim)">6.2.0-arcos</div></div>
          <div class="settings-row"><div class="settings-label">Apps Installed</div><div style="font-size:12px;color:var(--text-dim)">${typeof APP_DEFS!=='undefined'?APP_DEFS.length:'48'}</div></div>
          <div class="settings-row"><div class="settings-label">Memory</div><div style="font-size:12px;color:var(--text-dim)">∞ GB RAM</div></div>
        </div>
      </div>

    </div>
  </div>`;
}

function settingsApplyWallpaper(url, key) {
  // Mark selected
  document.querySelectorAll('[id^="wpcheck-"]').forEach(el => el.style.display = 'none');
  document.querySelectorAll('[id^="wpthumb-"]').forEach(el => el.style.borderColor = 'var(--border)');
  const check = document.getElementById('wpcheck-' + key);
  const thumb = document.getElementById('wpthumb-' + key);
  if (check) check.style.display = 'flex';
  if (thumb) thumb.style.borderColor = 'var(--accent)';
  // Apply via the photo layer
  applyPhotoWallpaper(url, key);
  showNotif('🖼️', 'Wallpaper', 'Applying…');
}

function switchSettings(id, btn) {
  document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.settings-nav').forEach(n => n.classList.remove('active'));
  document.getElementById('settings-' + id)?.classList.add('active');
  btn?.classList.add('active');
}
function changeAccent(c) { document.documentElement.style.setProperty('--accent', c); showNotif('🎨', 'Accent', 'Color updated'); }
function changeWallpaper(w) { applyWallpaperStyle(w); }

// ─── GITHUB ────────────────────────────────────────────
function buildGithub() {
  const repos = [
    { name:'linux-desktop-browser', desc:'Full GNOME-like Linux desktop in the browser', stars:142, lang:'JavaScript', langColor:'#f1e05a', forks:28 },
    { name:'arcos-kernel',          desc:'Simulated Linux kernel modules for ArcOS',    stars:89,  lang:'C',           langColor:'#555555', forks:12 },
    { name:'arc-shell',             desc:'Unix-like shell interpreter in WebAssembly',  stars:67,  lang:'Rust',        langColor:'#dea584', forks:9  },
    { name:'web-terminal',          desc:'Feature-rich terminal emulator with Canvas',  stars:234, lang:'TypeScript',  langColor:'#2b7489', forks:45 },
    { name:'dotfiles',              desc:'Personal ArcOS configuration files',          stars:31,  lang:'Shell',       langColor:'#89e051', forks:6  },
  ];
  return `<div id="github-content">
    <div id="github-header">
      <svg width="32" height="32" viewBox="0 0 98 96" fill="white"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/></svg>
      <div><div style="font-weight:700;font-size:16px;color:#c9d1d9">GitHub Repos</div><div style="font-size:12px;color:#8b949e">Your open source projects</div></div>
      <a href="https://github.com" target="_blank" style="margin-left:auto;background:#238636;color:#fff;border:none;padding:7px 14px;border-radius:8px;text-decoration:none;font-size:12px;">Open GitHub ↗</a>
    </div>
    <div style="padding:12px 14px;overflow-y:auto;height:calc(100% - 72px)">
      ${repos.map(r => `
        <div class="github-card" onclick="window.open('https://github.com','_blank')">
          <div class="repo-name">📦 ${r.name}</div>
          <div class="repo-desc">${r.desc}</div>
          <div class="repo-meta">
            <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${r.langColor};margin-right:4px"></span>${r.lang}</span>
            <span>⭐ ${r.stars}</span><span>🍴 ${r.forks}</span>
            <span style="margin-left:auto;color:#58a6ff">View →</span>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}

// ─── JSON FORMATTER ────────────────────────────────────
function buildJsonFormat() {
  return `<div id="jsonformat-content">
    <div id="jsonformat-toolbar">
      <button class="editor-btn" onclick="jsonFormat()">✨ Format</button>
      <button class="editor-btn" onclick="jsonMinify()">⬜ Minify</button>
      <button class="editor-btn" onclick="jsonValidate()">✓ Validate</button>
      <button class="editor-btn" onclick="jsonClear()">Clear</button>
      <button class="editor-btn" onclick="jsonCopy()">📋 Copy</button>
      <span id="json-status" style="font-size:12px;color:var(--text-dim);margin-left:8px"></span>
    </div>
    <div id="jsonformat-body">
      <textarea id="jsonformat-input" placeholder="Paste your JSON here…" oninput="jsonLiveValidate()"></textarea>
      <div id="jsonformat-output" style="padding:14px;background:#09090f;font-family:'Source Code Pro',monospace;font-size:12px;overflow-y:auto;color:#cdd6f4;white-space:pre-wrap;border-left:1px solid var(--border)">Formatted output will appear here…</div>
    </div>
  </div>`;
}
function jsonFormat() {
  try {
    const inp = document.getElementById('jsonformat-input').value;
    const parsed = JSON.parse(inp);
    document.getElementById('jsonformat-output').textContent = JSON.stringify(parsed, null, 2);
    document.getElementById('json-status').style.color = 'var(--green)';
    document.getElementById('json-status').textContent = '✓ Valid JSON';
  } catch (e) {
    document.getElementById('json-status').style.color = 'var(--red)';
    document.getElementById('json-status').textContent = '✗ ' + e.message;
  }
}
function jsonMinify() {
  try {
    const parsed = JSON.parse(document.getElementById('jsonformat-input').value);
    document.getElementById('jsonformat-output').textContent = JSON.stringify(parsed);
    document.getElementById('json-status').style.color = 'var(--green)';
    document.getElementById('json-status').textContent = '✓ Minified';
  } catch (e) {
    document.getElementById('json-status').style.color = 'var(--red)';
    document.getElementById('json-status').textContent = '✗ ' + e.message;
  }
}
function jsonValidate() {
  try {
    JSON.parse(document.getElementById('jsonformat-input').value);
    document.getElementById('json-status').style.color = 'var(--green)';
    document.getElementById('json-status').textContent = '✓ Valid JSON';
  } catch (e) {
    document.getElementById('json-status').style.color = 'var(--red)';
    document.getElementById('json-status').textContent = '✗ Invalid: ' + e.message;
  }
}
function jsonLiveValidate() {
  try { JSON.parse(document.getElementById('jsonformat-input').value); document.getElementById('json-status').style.color='var(--green)'; document.getElementById('json-status').textContent='✓ Valid'; }
  catch { document.getElementById('json-status').style.color='var(--red)'; document.getElementById('json-status').textContent='✗ Invalid'; }
}
function jsonClear() { document.getElementById('jsonformat-input').value = ''; document.getElementById('jsonformat-output').textContent = 'Formatted output will appear here…'; document.getElementById('json-status').textContent = ''; }
function jsonCopy() { navigator.clipboard?.writeText(document.getElementById('jsonformat-output').textContent); showNotif('📋', 'Copied', 'JSON copied to clipboard'); }

// ─── MARKDOWN PREVIEWER ────────────────────────────────
function buildMarkdown() {
  return `<div id="markdown-content">
    <textarea id="markdown-input" placeholder="# Type Markdown here…" oninput="updateMarkdownPreview()"></textarea>
    <div id="markdown-preview"></div>
  </div>`;
}
function initMarkdown() {
  const inp = document.getElementById('markdown-input');
  if (inp) { inp.value = '# Welcome to ArcOS Markdown\n\nType **markdown** here and see a *live preview*!\n\n## Features\n- Bold, italic, lists\n- `code` blocks\n- > Blockquotes\n- [Links](https://github.com)\n\n```javascript\nconsole.log("Hello!");\n```\n'; updateMarkdownPreview(); }
}
function updateMarkdownPreview() {
  const inp = document.getElementById('markdown-input');
  const pre = document.getElementById('markdown-preview');
  if (!inp || !pre) return;
  pre.innerHTML = simpleMarkdown(inp.value);
}

// ─── STICKY NOTES ──────────────────────────────────────
let stickyCount = 0;
const STICKY_COLORS = ['#ffd93d','#6bcb77','#ff6b6b','#74b9ff','#fd79a8','#a29bfe','#ffeaa7'];
function buildSticky() {
  return `<div style="padding:16px;background:#11111e;height:100%;display:flex;flex-direction:column;gap:10px;align-items:center;justify-content:center">
    <div style="font-size:40px">📝</div>
    <div style="font-size:14px;text-align:center;color:var(--text-dim)">Click below to create sticky notes on your desktop</div>
    <button onclick="createSticky()" style="background:var(--accent);border:none;color:#fff;padding:10px 24px;border-radius:10px;cursor:pointer;font-size:14px;font-family:inherit;font-weight:600">+ New Sticky Note</button>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:8px">
      ${STICKY_COLORS.map(c => `<div style="width:20px;height:20px;border-radius:50%;background:${c};cursor:pointer;border:2px solid rgba(255,255,255,.2)" onclick="createStickyColor('${c}')"></div>`).join('')}
    </div>
  </div>`;
}
function createSticky(color) { createStickyColor(color || STICKY_COLORS[stickyCount % STICKY_COLORS.length]); }
function createStickyColor(color) {
  stickyCount++;
  const note = document.createElement('div');
  note.className = 'sticky-note';
  note.id = `sticky-${stickyCount}`;
  note.style.cssText = `left:${100 + stickyCount * 20}px;top:${100 + stickyCount * 20}px;background:${color};z-index:${++zCounter}`;
  note.innerHTML = `
    <div class="sticky-header" style="background:${color}" onmousedown="startStickyDrag(event,'sticky-${stickyCount}')">
      <span style="font-size:11px;font-weight:700;color:rgba(0,0,0,.5)">Note ${stickyCount}</span>
      <button class="sticky-close" onclick="this.closest('.sticky-note').remove()">×</button>
    </div>
    <textarea class="sticky-body" placeholder="Type your note…" style="background:${color}"></textarea>`;
  document.body.appendChild(note);
}
function startStickyDrag(e, id) {
  const note = document.getElementById(id); if (!note) return;
  note.style.zIndex = ++zCounter;
  const r = note.getBoundingClientRect();
  const ox = e.clientX - r.left, oy = e.clientY - r.top;
  function mm(e) { note.style.left = (e.clientX - ox) + 'px'; note.style.top = (e.clientY - oy) + 'px'; }
  function mu() { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); }
  document.addEventListener('mousemove', mm); document.addEventListener('mouseup', mu);
  e.preventDefault();
}
