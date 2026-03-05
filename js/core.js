/* ═══════════════════════════════════════
   ArcOS — Core JS
   App registry, boot, overview
═══════════════════════════════════════ */

const APP_DEFS = [
  { id:'terminal',   name:'Terminal',        bg:'linear-gradient(145deg,#2d3436,#1a1a2e)',  icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="6" y="8" width="36" height="28" rx="4" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/><polyline points="12,18 20,24 12,30" stroke="#a8ff78" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="22" y1="30" x2="34" y2="30" stroke="#a8ff78" stroke-width="2" stroke-linecap="round"/></svg>` },
  { id:'editor',     name:'Text Editor',     bg:'linear-gradient(145deg,#7c3aed,#a855f7)',  icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="8" y="6" width="26" height="34" rx="3" fill="rgba(255,255,255,.15)" stroke="white" stroke-width="1.5"/><line x1="13" y1="14" x2="29" y2="14" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="13" y1="20" x2="29" y2="20" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="13" y1="26" x2="24" y2="26" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M32 28l8-8 4 4-8 8-5 1 1-5z" fill="white"/></svg>` },
  { id:'code',       name:'Code Editor',     bg:'linear-gradient(145deg,#007acc,#0066aa)',  icon:`<svg viewBox="0 0 48 48" fill="none"><path d="M17 14L7 24l10 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M31 14l10 10-10 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="27" y1="12" x2="21" y2="36" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity=".8"/></svg>` },
  { id:'browser',    name:'Web Browser',     bg:'linear-gradient(145deg,#4285f4,#1a73e8)',  icon:`<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="2"/><ellipse cx="24" cy="24" rx="8" ry="18" stroke="white" stroke-width="1.5" fill="none"/><line x1="6" y1="24" x2="42" y2="24" stroke="white" stroke-width="1.5"/></svg>` },
  { id:'files',      name:'Files',           bg:'linear-gradient(145deg,#1db0a6,#148f88)',  icon:`<svg viewBox="0 0 48 48" fill="none"><path d="M8 12a4 4 0 014-4h10l4 4h14a4 4 0 014 4v20a4 4 0 01-4 4H12a4 4 0 01-4-4V12z" fill="white" opacity=".9"/></svg>` },
  { id:'postman',    name:'API Tester',       bg:'linear-gradient(145deg,#ff6c37,#e05a2b)',  icon:`<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="16" stroke="white" stroke-width="2" fill="none"/><path d="M16 24h16M24 16l8 8-8 8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id:'paint',      name:'Paint',           bg:'linear-gradient(145deg,#fd79a8,#e84393)',  icon:`<svg viewBox="0 0 48 48" fill="none"><path d="M10 38c0-3 2-5 5-5s5 2 5 5-2 5-5 5-5-2-5-5z" fill="white" opacity=".9"/><path d="M14 33L34 10l4 4L18 37" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M34 10l4-4 4 4-4 4z" fill="white" opacity=".8"/></svg>` },
  { id:'youtube',    name:'YouTube',         bg:'linear-gradient(145deg,#ff0000,#cc0000)',  icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="12" width="40" height="24" rx="8" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><polygon points="20,18 34,24 20,30" fill="white"/></svg>` },
  { id:'camera',     name:'Camera',          bg:'linear-gradient(145deg,#00b894,#00897b)',  icon:`<svg viewBox="0 0 48 48" fill="none"><path d="M42 35a3 3 0 01-3 3H9a3 3 0 01-3-3V20a3 3 0 013-3h4l3-4h8l3 4h11a3 3 0 013 3v15z" fill="rgba(255,255,255,.15)" stroke="white" stroke-width="1.8"/><circle cx="24" cy="27" r="7" stroke="white" stroke-width="2"/></svg>` },
  { id:'music',      name:'Music Player',    bg:'linear-gradient(145deg,#e91e8c,#c2185b)',  icon:`<svg viewBox="0 0 48 48" fill="none"><circle cx="15" cy="36" r="6" fill="white" opacity=".9"/><circle cx="33" cy="30" r="6" fill="white" opacity=".9"/><line x1="21" y1="36" x2="21" y2="14" stroke="white" stroke-width="2.5"/><line x1="39" y1="30" x2="39" y2="8" stroke="white" stroke-width="2.5"/><polyline points="21,14 39,8" stroke="white" stroke-width="2.5"/></svg>` },
  { id:'imgviewer',  name:'Image Viewer',    bg:'linear-gradient(145deg,#f59e0b,#d97706)',  icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="8" width="40" height="32" rx="4" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.8"/><circle cx="16" cy="19" r="4" fill="white" opacity=".8"/><polyline points="4,36 14,24 22,30 30,20 44,32" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".9"/></svg>` },
  { id:'calculator', name:'Calculator',      bg:'linear-gradient(145deg,#10b981,#059669)',  icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="8" y="6" width="32" height="36" rx="4" fill="rgba(255,255,255,.12)" stroke="white" stroke-width="1.8"/><rect x="12" y="10" width="24" height="8" rx="2" fill="white" opacity=".8"/><circle cx="16" cy="26" r="2.5" fill="white" opacity=".7"/><circle cx="24" cy="26" r="2.5" fill="white" opacity=".7"/><circle cx="32" cy="26" r="2.5" fill="white" opacity=".7"/></svg>` },
  { id:'clock',      name:'Clock',           bg:'linear-gradient(145deg,#6366f1,#4f46e5)',  icon:`<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="white" stroke-width="2"/><line x1="24" y1="14" x2="24" y2="24" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="24" y1="24" x2="31" y2="29" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>` },
  { id:'sysmon',     name:'System Monitor',  bg:'linear-gradient(145deg,#f59e0b,#d97706)',  icon:`<svg viewBox="0 0 48 48" fill="none"><polyline points="4,36 14,20 22,28 30,14 38,24 44,12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>` },
  { id:'settings',   name:'Settings',        bg:'linear-gradient(145deg,#64748b,#475569)',  icon:`<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="7" stroke="white" stroke-width="2.5"/><path d="M24 4v5M24 39v5M4 24h5M39 24h5" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>` },
  { id:'github',     name:'GitHub',          bg:'linear-gradient(145deg,#24292e,#161b22)',  icon:`<svg viewBox="0 0 98 96" fill="white"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/></svg>` },
  { id:'jsonformat', name:'JSON Formatter',  bg:'linear-gradient(145deg,#0ea5e9,#0284c7)',  icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="6" width="40" height="36" rx="4" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><text x="24" y="30" text-anchor="middle" font-size="16" fill="white" font-weight="bold">{}</text></svg>` },
  { id:'markdown',   name:'Markdown',        bg:'linear-gradient(145deg,#14b8a6,#0d9488)',  icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="10" width="40" height="28" rx="4" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><path d="M10 30V18l6 8 6-8v12M28 18v12M34 24h-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id:'sticky',     name:'Sticky Notes',    bg:'linear-gradient(145deg,#fbbf24,#f59e0b)',  icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="6" y="6" width="36" height="36" rx="4" fill="white" opacity=".9"/><line x1="12" y1="16" x2="36" y2="16" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="24" x2="36" y2="24" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="32" x2="28" y2="32" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/></svg>` },
  { id:'snake',      name:'Snake',           bg:'linear-gradient(145deg,#16a34a,#15803d)',  icon:`<svg viewBox="0 0 48 48" fill="none"><path d="M8 24c0-8 6-12 12-12h8c6 0 10 4 10 10s-4 10-10 10H22c-4 0-6 2-6 4s2 4 6 4h6" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="34" cy="16" r="4" fill="white" opacity=".9"/></svg>` },
  { id:'tetris',     name:'Tetris',          bg:'linear-gradient(145deg,#dc2626,#b91c1c)',  icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="6" y="22" width="10" height="10" rx="2" fill="white" opacity=".9"/><rect x="16" y="22" width="10" height="10" rx="2" fill="white" opacity=".9"/><rect x="26" y="22" width="10" height="10" rx="2" fill="white" opacity=".9"/><rect x="16" y="12" width="10" height="10" rx="2" fill="white" opacity=".6"/></svg>` },
  { id:'memory',     name:'Memory Game',     bg:'linear-gradient(145deg,#7c3aed,#6d28d9)',  icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="18" height="18" rx="3" fill="rgba(255,255,255,.15)" stroke="white" stroke-width="1.8"/><rect x="26" y="4" width="18" height="18" rx="3" fill="white" opacity=".85"/><rect x="4" y="26" width="18" height="18" rx="3" fill="white" opacity=".85"/><rect x="26" y="26" width="18" height="18" rx="3" fill="rgba(255,255,255,.15)" stroke="white" stroke-width="1.8"/></svg>` },
  { id:'game2048',   name:'2048',            bg:'linear-gradient(145deg,#f97316,#ea580c)',  icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="40" height="40" rx="6" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><text x="24" y="32" text-anchor="middle" font-size="18" fill="white" font-weight="800">2048</text></svg>` },
  { id:'minesweeper',name:'Minesweeper',     bg:'linear-gradient(145deg,#6b7280,#4b5563)',  icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="40" height="40" rx="4" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><circle cx="24" cy="24" r="8" fill="white" opacity=".8"/><circle cx="24" cy="24" r="3" fill="rgba(0,0,0,.5)"/><line x1="24" y1="12" x2="24" y2="16" stroke="white" stroke-width="2"/><line x1="24" y1="32" x2="24" y2="36" stroke="white" stroke-width="2"/><line x1="12" y1="24" x2="16" y2="24" stroke="white" stroke-width="2"/><line x1="32" y1="24" x2="36" y2="24" stroke="white" stroke-width="2"/></svg>` },
  { id:'wordle',     name:'Wordle',          bg:'linear-gradient(145deg,#538d4e,#3a6b35)',  icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="18" height="18" rx="3" fill="#538d4e"/><rect x="26" y="4" width="18" height="18" rx="3" fill="#b59f3b"/><rect x="4" y="26" width="18" height="18" rx="3" fill="#3a3a3c"/><rect x="26" y="26" width="18" height="18" rx="3" fill="rgba(255,255,255,.15)" stroke="white" stroke-width="1.8"/></svg>` },
];

// ── Global State ──
const openWindows = {};
let zCounter = 100;
let dragTarget = null, dragOffX = 0, dragOffY = 0;
let overviewOpen = false;

// ── Clock ──
function startClock() {
  function tick() {
    const n = new Date();
    const s = n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const d = n.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const txt = `${d}  ${s}`;
    const a = document.getElementById('clock-display');
    const b = document.getElementById('clock-right');
    if (a) a.textContent = txt;
    if (b) b.textContent = txt;
  }
  tick(); setInterval(tick, 1000);
}

// ── App Grid ──
function buildAppGrid() {
  const grid = document.getElementById('app-grid');
  grid.innerHTML = APP_DEFS.map(a => `
    <div class="app-icon" data-app="${a.id}" data-name="${a.name.toLowerCase()}" onclick="openApp('${a.id}');closeOverview()">
      <div class="app-icon-img" style="background:${a.bg}">${a.icon}</div>
      <div class="app-icon-label">${a.name}</div>
    </div>`).join('');
}

function filterApps(q) {
  document.querySelectorAll('.app-icon').forEach(el => {
    el.style.display = el.dataset.name.includes(q.toLowerCase()) ? 'flex' : 'none';
  });
}

function toggleOverview() {
  overviewOpen = !overviewOpen;
  document.getElementById('overview').classList.toggle('active', overviewOpen);
  if (overviewOpen) setTimeout(() => document.getElementById('overview-search').focus(), 80);
}
function closeOverview() {
  overviewOpen = false;
  document.getElementById('overview').classList.remove('active');
}
