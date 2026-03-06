/* ═══════════════════════════════════════
   ArcOS — Spotlight Search
   Ctrl+Space · Apps · Files · Web
═══════════════════════════════════════ */

let spotlightOpen = false;

function buildSpotlight() {
  if (document.getElementById('spotlight-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'spotlight-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:999990;
    background:rgba(0,0,0,.55);backdrop-filter:blur(8px);
    display:none;align-items:flex-start;justify-content:center;padding-top:14vh;
  `;
  overlay.onclick = e => { if (e.target === overlay) closeSpotlight(); };
  overlay.innerHTML = `
    <div id="spotlight-box" style="
      width:620px;max-width:92vw;
      background:rgba(12,12,24,.97);
      border:1px solid rgba(255,255,255,.12);
      border-radius:18px;
      box-shadow:0 32px 100px rgba(0,0,0,.85);
      overflow:hidden;
    ">
      <div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.07)">
        <span style="font-size:18px;opacity:.5">🔍</span>
        <input id="spotlight-input" type="text"
          placeholder="Search apps, files, commands…"
          autocomplete="off" spellcheck="false"
          style="flex:1;background:transparent;border:none;color:#fff;font-size:17px;outline:none;font-family:'Nunito',sans-serif;"
          oninput="spotlightSearch(this.value)"
          onkeydown="spotlightKey(event)">
        <kbd style="font-size:10px;padding:2px 7px;background:rgba(255,255,255,.08);border-radius:5px;color:rgba(255,255,255,.4);font-family:monospace">ESC</kbd>
      </div>
      <div id="spotlight-results" style="max-height:400px;overflow-y:auto;padding:6px 0"></div>
      <div id="spotlight-footer" style="padding:7px 18px;font-size:11px;color:rgba(255,255,255,.25);border-top:1px solid rgba(255,255,255,.05);display:flex;gap:14px">
        <span>↑↓ navigate</span><span>↵ open</span><span>ESC close</span>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

let spotlightIdx = 0;
let spotlightMatches = [];

function openSpotlight() {
  buildSpotlight();
  const ov = document.getElementById('spotlight-overlay');
  if (!ov) return;
  ov.style.display = 'flex';
  spotlightOpen = true;
  const inp = document.getElementById('spotlight-input');
  if (inp) { inp.value = ''; inp.focus(); }
  spotlightSearch('');
}

function closeSpotlight() {
  const ov = document.getElementById('spotlight-overlay');
  if (ov) ov.style.display = 'none';
  spotlightOpen = false;
}

function spotlightSearch(q) {
  const res = document.getElementById('spotlight-results');
  if (!res) return;
  spotlightIdx = 0;
  q = q.trim().toLowerCase();

  const sections = [];

  // ── Apps ──
  const appMatches = APP_DEFS.filter(a =>
    !q || a.name.toLowerCase().includes(q) || a.cat.includes(q) || a.id.includes(q)
  ).slice(0, 6);
  if (appMatches.length) sections.push({ label:'Apps', items: appMatches.map(a => ({
    icon: `<div style="width:28px;height:28px;border-radius:8px;background:${a.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">${a.icon.replace(/width="[^"]*"/g,'width="18"').replace(/height="[^"]*"/g,'height="18"')}</div>`,
    label: a.name, sub: a.cat, action: () => { openApp(a.id); closeSpotlight(); }
  }))});

  // ── Commands ──
  const cmds = [
    { name:'Lock Screen',      icon:'🔒', fn:() => { if(typeof showLockScreen==='function') showLockScreen(); closeSpotlight(); } },
    { name:'New Sticky Note',  icon:'📝', fn:() => { createSticky(); closeSpotlight(); } },
    { name:'Change Wallpaper', icon:'🎨', fn:() => { showWallpaperPicker(); closeSpotlight(); } },
    { name:'Theme Editor',     icon:'🎨', fn:() => { if(typeof openThemeEditor==='function') openThemeEditor(); closeSpotlight(); } },
    { name:'Switch Desktop 1', icon:'🖥️', fn:() => { if(typeof switchDesktop==='function') switchDesktop(1); closeSpotlight(); } },
    { name:'Switch Desktop 2', icon:'🖥️', fn:() => { if(typeof switchDesktop==='function') switchDesktop(2); closeSpotlight(); } },
    { name:'Tile Windows',     icon:'🪟', fn:() => { if(typeof tileWindows==='function') tileWindows('2col'); closeSpotlight(); } },
    { name:'Screenshot',       icon:'📸', fn:() => { takeScreenshot(); closeSpotlight(); } },
  ].filter(c => !q || c.name.toLowerCase().includes(q));
  if (cmds.length) sections.push({ label:'Commands', items: cmds.map(c => ({
    icon: `<div style="width:28px;height:28px;border-radius:8px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:15px">${c.icon}</div>`,
    label: c.name, sub: 'command', action: c.fn
  }))});

  // ── Web search fallback ──
  if (q) sections.push({ label:'Web', items: [{
    icon:`<div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#4285f4,#34a853);display:flex;align-items:center;justify-content:center;font-size:14px">🌐</div>`,
    label: `Search Google: "${q}"`, sub:'web search',
    action: () => { openApp('browser'); closeSpotlight(); }
  }]});

  // Build flat list
  spotlightMatches = sections.flatMap(s => s.items);

  if (!spotlightMatches.length) {
    res.innerHTML = `<div style="padding:20px;text-align:center;color:rgba(255,255,255,.3);font-size:13px">No results for "${q}"</div>`;
    return;
  }

  let html = '';
  let globalIdx = 0;
  sections.forEach(section => {
    html += `<div style="padding:8px 18px 4px;font-size:10px;font-weight:700;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px">${section.label}</div>`;
    section.items.forEach(item => {
      const idx = globalIdx++;
      html += `<div class="sl-row" data-idx="${idx}" onclick="spotlightActivate(${idx})" onmouseover="spotlightHover(${idx})"
        style="display:flex;align-items:center;gap:12px;padding:9px 18px;cursor:pointer;transition:background .1s;${idx===0?'background:rgba(94,129,244,.2);':''}">
        ${item.icon}
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;color:#fff;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.label}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.35)">${item.sub}</div>
        </div>
      </div>`;
    });
  });
  res.innerHTML = html;
}

function spotlightHover(idx) {
  spotlightIdx = idx;
  document.querySelectorAll('.sl-row').forEach((r,i) => {
    r.style.background = i === idx ? 'rgba(94,129,244,.2)' : '';
  });
}

function spotlightActivate(idx) {
  const item = spotlightMatches[idx];
  if (item) item.action();
}

function spotlightKey(e) {
  const rows = document.querySelectorAll('.sl-row');
  if (e.key === 'ArrowDown') { e.preventDefault(); spotlightHover(Math.min(spotlightIdx+1, rows.length-1)); }
  if (e.key === 'ArrowUp')   { e.preventDefault(); spotlightHover(Math.max(spotlightIdx-1, 0)); }
  if (e.key === 'Enter')     { spotlightActivate(spotlightIdx); }
  if (e.key === 'Escape')    { closeSpotlight(); }
}

// Keyboard shortcut: Ctrl+Space or Cmd+Space
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
    e.preventDefault();
    if (spotlightOpen) closeSpotlight(); else openSpotlight();
  }
});
