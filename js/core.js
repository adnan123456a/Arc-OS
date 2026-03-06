/* ═══════════════════════════════════════
   ArcOS — Core JS  v3.0
   App registry · localStorage · pinning
   Draggable dock · Alt+Tab switcher
═══════════════════════════════════════ */

const APP_DEFS = [
  { id:'terminal',       name:'Terminal',           cat:'system',       bg:'linear-gradient(145deg,#2d3436,#1a1a2e)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="6" y="8" width="36" height="28" rx="4" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/><polyline points="12,18 20,24 12,30" stroke="#a8ff78" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="22" y1="30" x2="34" y2="30" stroke="#a8ff78" stroke-width="2" stroke-linecap="round"/></svg>` },
  { id:'editor',         name:'Text Editor',        cat:'productivity',  bg:'linear-gradient(145deg,#7c3aed,#a855f7)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="8" y="6" width="26" height="34" rx="3" fill="rgba(255,255,255,.15)" stroke="white" stroke-width="1.5"/><line x1="13" y1="14" x2="29" y2="14" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="13" y1="20" x2="29" y2="20" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="13" y1="26" x2="24" y2="26" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M32 28l8-8 4 4-8 8-5 1 1-5z" fill="white"/></svg>` },
  { id:'code',           name:'Code Editor',        cat:'dev',           bg:'linear-gradient(145deg,#007acc,#0066aa)', icon:`<svg viewBox="0 0 48 48" fill="none"><path d="M17 14L7 24l10 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M31 14l10 10-10 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="27" y1="12" x2="21" y2="36" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity=".8"/></svg>` },
  { id:'browser',        name:'Web Browser',        cat:'internet',      bg:'linear-gradient(145deg,#4285f4,#1a73e8)', icon:`<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="2"/><ellipse cx="24" cy="24" rx="8" ry="18" stroke="white" stroke-width="1.5" fill="none"/><line x1="6" y1="24" x2="42" y2="24" stroke="white" stroke-width="1.5"/></svg>` },
  { id:'files',          name:'Files',              cat:'system',        bg:'linear-gradient(145deg,#1db0a6,#148f88)', icon:`<svg viewBox="0 0 48 48" fill="none"><path d="M8 12a4 4 0 014-4h10l4 4h14a4 4 0 014 4v20a4 4 0 01-4 4H12a4 4 0 01-4-4V12z" fill="white" opacity=".9"/></svg>` },
  { id:'postman',        name:'API Tester',          cat:'dev',           bg:'linear-gradient(145deg,#ff6c37,#e05a2b)', icon:`<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="16" stroke="white" stroke-width="2" fill="none"/><path d="M16 24h16M24 16l8 8-8 8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id:'spreadsheet',    name:'Spreadsheet',         cat:'productivity',  bg:'linear-gradient(145deg,#16a34a,#15803d)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="40" height="40" rx="4" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><line x1="4" y1="16" x2="44" y2="16" stroke="white" stroke-width="1.5" opacity=".6"/><line x1="4" y1="28" x2="44" y2="28" stroke="white" stroke-width="1.5" opacity=".6"/><line x1="17" y1="4" x2="17" y2="44" stroke="white" stroke-width="1.5" opacity=".6"/><line x1="31" y1="4" x2="31" y2="44" stroke="white" stroke-width="1.5" opacity=".6"/></svg>` },
  { id:'sticky',         name:'Sticky Notes',        cat:'productivity',  bg:'linear-gradient(145deg,#fbbf24,#f59e0b)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="6" y="6" width="36" height="36" rx="4" fill="white" opacity=".9"/><line x1="12" y1="16" x2="36" y2="16" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="24" x2="36" y2="24" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="32" x2="28" y2="32" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/></svg>` },
  { id:'markdown',       name:'Markdown',            cat:'productivity',  bg:'linear-gradient(145deg,#14b8a6,#0d9488)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="10" width="40" height="28" rx="4" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><path d="M10 30V18l6 8 6-8v12M28 18v12M34 24h-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id:'youtube',        name:'YouTube',             cat:'media',         bg:'linear-gradient(145deg,#ff0000,#cc0000)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="12" width="40" height="24" rx="8" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><polygon points="20,18 34,24 20,30" fill="white"/></svg>` },
  { id:'camera',         name:'Camera',              cat:'media',         bg:'linear-gradient(145deg,#00b894,#00897b)', icon:`<svg viewBox="0 0 48 48" fill="none"><path d="M42 35a3 3 0 01-3 3H9a3 3 0 01-3-3V20a3 3 0 013-3h4l3-4h8l3 4h11a3 3 0 013 3v15z" fill="rgba(255,255,255,.15)" stroke="white" stroke-width="1.8"/><circle cx="24" cy="27" r="7" stroke="white" stroke-width="2"/></svg>` },
  { id:'music',          name:'Music Player',        cat:'media',         bg:'linear-gradient(145deg,#e91e8c,#c2185b)', icon:`<svg viewBox="0 0 48 48" fill="none"><circle cx="15" cy="36" r="6" fill="white" opacity=".9"/><circle cx="33" cy="30" r="6" fill="white" opacity=".9"/><line x1="21" y1="36" x2="21" y2="14" stroke="white" stroke-width="2.5"/><line x1="39" y1="30" x2="39" y2="8" stroke="white" stroke-width="2.5"/><polyline points="21,14 39,8" stroke="white" stroke-width="2.5"/></svg>` },
  { id:'imgviewer',      name:'Image Viewer',        cat:'media',         bg:'linear-gradient(145deg,#f59e0b,#d97706)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="8" width="40" height="32" rx="4" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.8"/><circle cx="16" cy="19" r="4" fill="white" opacity=".8"/><polyline points="4,36 14,24 22,30 30,20 44,32" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".9"/></svg>` },
  { id:'paint',          name:'Paint',               cat:'creative',      bg:'linear-gradient(145deg,#fd79a8,#e84393)', icon:`<svg viewBox="0 0 48 48" fill="none"><path d="M10 38c0-3 2-5 5-5s5 2 5 5-2 5-5 5-5-2-5-5z" fill="white" opacity=".9"/><path d="M14 33L34 10l4 4L18 37" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M34 10l4-4 4 4-4 4z" fill="white" opacity=".8"/></svg>` },
  { id:'visualizer',     name:'Audio Visualizer',    cat:'media',         bg:'linear-gradient(145deg,#8b5cf6,#7c3aed)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="28" width="5" height="16" rx="2" fill="white" opacity=".9"/><rect x="12" y="18" width="5" height="26" rx="2" fill="white"/><rect x="20" y="8" width="5" height="36" rx="2" fill="white"/><rect x="28" y="14" width="5" height="30" rx="2" fill="white"/><rect x="36" y="22" width="5" height="22" rx="2" fill="white" opacity=".9"/></svg>` },
  { id:'maps',           name:'Maps',                cat:'internet',      bg:'linear-gradient(145deg,#34a853,#1e8e3e)', icon:`<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="20" r="10" stroke="white" stroke-width="2" fill="rgba(255,255,255,.1)"/><circle cx="24" cy="20" r="4" fill="white" opacity=".9"/><path d="M24 30c0 0-12 10-12 18h24c0-8-12-18-12-18z" fill="white" opacity=".7"/></svg>` },
  { id:'github',         name:'GitHub',              cat:'dev',           bg:'linear-gradient(145deg,#24292e,#161b22)', icon:`<svg viewBox="0 0 98 96" fill="white"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/></svg>` },
  { id:'jsonformat',     name:'JSON Formatter',      cat:'dev',           bg:'linear-gradient(145deg,#0ea5e9,#0284c7)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="6" width="40" height="36" rx="4" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><text x="24" y="30" text-anchor="middle" font-size="16" fill="white" font-weight="bold">{}</text></svg>` },
  { id:'hexeditor',      name:'Hex Editor',          cat:'dev',           bg:'linear-gradient(145deg,#475569,#334155)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="6" width="40" height="36" rx="4" fill="rgba(255,255,255,.08)" stroke="white" stroke-width="1.5"/><text x="12" y="22" font-size="9" fill="#a8ff78" font-family="monospace">48 65</text><text x="12" y="32" font-size="9" fill="#79dcff" font-family="monospace">78 20</text><text x="28" y="22" font-size="9" fill="rgba(255,255,255,.5)" font-family="monospace">He</text><text x="28" y="32" font-size="9" fill="rgba(255,255,255,.5)" font-family="monospace">x </text></svg>` },
  { id:'netscanner',     name:'Network Scanner',     cat:'dev',           bg:'linear-gradient(145deg,#0891b2,#0e7490)', icon:`<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="white" stroke-width="1.5" fill="none" stroke-dasharray="4 2"/><circle cx="24" cy="24" r="10" stroke="white" stroke-width="1.5" fill="none" stroke-dasharray="3 2"/><circle cx="24" cy="24" r="3" fill="white"/><line x1="24" y1="6" x2="24" y2="24" stroke="#a8ff78" stroke-width="2" stroke-linecap="round"/></svg>` },
  { id:'processinspect', name:'Process Inspector',   cat:'dev',           bg:'linear-gradient(145deg,#6d28d9,#5b21b6)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="8" width="40" height="6" rx="2" fill="white" opacity=".8"/><rect x="4" y="20" width="28" height="6" rx="2" fill="white" opacity=".6"/><rect x="4" y="32" width="36" height="6" rx="2" fill="white" opacity=".7"/><circle cx="40" cy="23" r="5" fill="#ff6b6b"/><line x1="38" y1="21" x2="42" y2="25" stroke="white" stroke-width="1.5"/><line x1="42" y1="21" x2="38" y2="25" stroke="white" stroke-width="1.5"/></svg>` },
  { id:'arduino',        name:'Arduino IDE',         cat:'dev',           bg:'linear-gradient(145deg,#00878a,#006b6e)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="10" width="40" height="28" rx="6" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><circle cx="16" cy="24" r="5" stroke="white" stroke-width="2" fill="none"/><circle cx="32" cy="24" r="5" stroke="white" stroke-width="2" fill="none"/><line x1="21" y1="24" x2="27" y2="24" stroke="white" stroke-width="2"/></svg>` },
  { id:'translator',     name:'Translator',          cat:'internet',      bg:'linear-gradient(145deg,#4f46e5,#4338ca)', icon:`<svg viewBox="0 0 48 48" fill="none"><path d="M6 10h18M15 6v4M10 14c2 4 8 8 11 8M21 14c-1 3-5 7-6 8" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M26 28l4-12 4 12M28 24h4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id:'calculator',     name:'Calculator',          cat:'system',        bg:'linear-gradient(145deg,#10b981,#059669)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="8" y="6" width="32" height="36" rx="4" fill="rgba(255,255,255,.12)" stroke="white" stroke-width="1.8"/><rect x="12" y="10" width="24" height="8" rx="2" fill="white" opacity=".8"/><circle cx="16" cy="26" r="2.5" fill="white" opacity=".7"/><circle cx="24" cy="26" r="2.5" fill="white" opacity=".7"/><circle cx="32" cy="26" r="2.5" fill="white" opacity=".7"/></svg>` },
  { id:'clock',          name:'Clock',               cat:'system',        bg:'linear-gradient(145deg,#6366f1,#4f46e5)', icon:`<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="white" stroke-width="2"/><line x1="24" y1="14" x2="24" y2="24" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="24" y1="24" x2="31" y2="29" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>` },
  { id:'sysmon',         name:'System Monitor',      cat:'system',        bg:'linear-gradient(145deg,#f59e0b,#d97706)', icon:`<svg viewBox="0 0 48 48" fill="none"><polyline points="4,36 14,20 22,28 30,14 38,24 44,12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>` },
  { id:'settings',       name:'Settings',            cat:'system',        bg:'linear-gradient(145deg,#64748b,#475569)', icon:`<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="7" stroke="white" stroke-width="2.5"/><path d="M24 4v5M24 39v5M4 24h5M39 24h5" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>` },
  { id:'colorpicker',    name:'Color Picker',        cat:'creative',      bg:'linear-gradient(145deg,#ec4899,#db2777)', icon:`<svg viewBox="0 0 48 48" fill="none"><circle cx="14" cy="14" r="8" fill="#ff6b6b"/><circle cx="34" cy="14" r="8" fill="#ffd93d"/><circle cx="14" cy="34" r="8" fill="#5e81f4"/><circle cx="34" cy="34" r="8" fill="#6bcb77"/><circle cx="24" cy="24" r="7" fill="white" opacity=".9"/></svg>` },
  { id:'unitconvert',    name:'Unit Converter',      cat:'system',        bg:'linear-gradient(145deg,#0891b2,#0e7490)', icon:`<svg viewBox="0 0 48 48" fill="none"><text x="5" y="22" font-size="10" fill="white" font-weight="700">km</text><text x="5" y="36" font-size="10" fill="white" opacity=".6">mi</text><path d="M28 18l8 6-8 6M20 30l-8-6 8-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id:'passgen',        name:'Password Gen',        cat:'system',        bg:'linear-gradient(145deg,#b91c1c,#991b1b)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="10" y="22" width="28" height="20" rx="4" fill="rgba(255,255,255,.12)" stroke="white" stroke-width="2"/><path d="M16 22v-6a8 8 0 0116 0v6" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="24" cy="33" r="3" fill="white" opacity=".9"/></svg>` },
  { id:'archivemanager', name:'Archive Manager',     cat:'system',        bg:'linear-gradient(145deg,#92400e,#78350f)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="8" y="10" width="32" height="6" rx="2" fill="white" opacity=".9"/><rect x="8" y="20" width="32" height="6" rx="2" fill="white" opacity=".7"/><rect x="8" y="30" width="32" height="12" rx="3" fill="rgba(255,255,255,.15)" stroke="white" stroke-width="1.5"/><line x1="24" y1="32" x2="24" y2="38" stroke="white" stroke-width="2"/><line x1="21" y1="35" x2="27" y2="35" stroke="white" stroke-width="2"/></svg>` },
  { id:'snake',          name:'Snake',               cat:'games',         bg:'linear-gradient(145deg,#16a34a,#15803d)', icon:`<svg viewBox="0 0 48 48" fill="none"><path d="M8 24c0-8 6-12 12-12h8c6 0 10 4 10 10s-4 10-10 10H22c-4 0-6 2-6 4s2 4 6 4h6" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="34" cy="16" r="4" fill="white" opacity=".9"/></svg>` },
  { id:'tetris',         name:'Tetris',              cat:'games',         bg:'linear-gradient(145deg,#dc2626,#b91c1c)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="6" y="22" width="10" height="10" rx="2" fill="white" opacity=".9"/><rect x="16" y="22" width="10" height="10" rx="2" fill="white" opacity=".9"/><rect x="26" y="22" width="10" height="10" rx="2" fill="white" opacity=".9"/><rect x="16" y="12" width="10" height="10" rx="2" fill="white" opacity=".6"/></svg>` },
  { id:'memory',         name:'Memory Game',         cat:'games',         bg:'linear-gradient(145deg,#7c3aed,#6d28d9)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="18" height="18" rx="3" fill="rgba(255,255,255,.15)" stroke="white" stroke-width="1.8"/><rect x="26" y="4" width="18" height="18" rx="3" fill="white" opacity=".85"/><rect x="4" y="26" width="18" height="18" rx="3" fill="white" opacity=".85"/><rect x="26" y="26" width="18" height="18" rx="3" fill="rgba(255,255,255,.15)" stroke="white" stroke-width="1.8"/></svg>` },
  { id:'game2048',       name:'2048',                cat:'games',         bg:'linear-gradient(145deg,#f97316,#ea580c)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="40" height="40" rx="6" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><text x="24" y="32" text-anchor="middle" font-size="18" fill="white" font-weight="800">2048</text></svg>` },
  { id:'minesweeper',    name:'Minesweeper',         cat:'games',         bg:'linear-gradient(145deg,#6b7280,#4b5563)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="40" height="40" rx="4" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><circle cx="24" cy="24" r="8" fill="white" opacity=".8"/><circle cx="24" cy="24" r="3" fill="rgba(0,0,0,.5)"/><line x1="24" y1="12" x2="24" y2="16" stroke="white" stroke-width="2"/><line x1="24" y1="32" x2="24" y2="36" stroke="white" stroke-width="2"/><line x1="12" y1="24" x2="16" y2="24" stroke="white" stroke-width="2"/><line x1="32" y1="24" x2="36" y2="24" stroke="white" stroke-width="2"/></svg>` },
  { id:'wordle',         name:'Wordle',              cat:'games',         bg:'linear-gradient(145deg,#538d4e,#3a6b35)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="18" height="18" rx="3" fill="#538d4e"/><rect x="26" y="4" width="18" height="18" rx="3" fill="#b59f3b"/><rect x="4" y="26" width="18" height="18" rx="3" fill="#3a3a3c"/><rect x="26" y="26" width="18" height="18" rx="3" fill="rgba(255,255,255,.15)" stroke="white" stroke-width="1.8"/></svg>` },
  // ── New apps pack ──
  { id:'aichat',        name:'AI Chat',              cat:'internet',      bg:'linear-gradient(145deg,#5e81f4,#c77dff)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="8" width="34" height="24" rx="6" fill="rgba(255,255,255,.15)" stroke="white" stroke-width="1.8"/><path d="M10 32l4 8 6-8" fill="white" opacity=".7"/><circle cx="14" cy="20" r="2.5" fill="white"/><circle cx="24" cy="20" r="2.5" fill="white"/><circle cx="34" cy="20" r="2.5" fill="white"/></svg>` },
  { id:'piano',         name:'Piano',                cat:'media',         bg:'linear-gradient(145deg,#1e1e2e,#2a2a4a)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="10" width="40" height="28" rx="4" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><rect x="8" y="10" width="6" height="17" rx="1" fill="white" opacity=".9"/><rect x="17" y="10" width="6" height="17" rx="1" fill="white" opacity=".9"/><rect x="26" y="10" width="6" height="17" rx="1" fill="white" opacity=".9"/><rect x="35" y="10" width="6" height="17" rx="1" fill="white" opacity=".9"/><rect x="13" y="10" width="5" height="12" rx="1" fill="#1e1e2e"/><rect x="22" y="10" width="5" height="12" rx="1" fill="#1e1e2e"/><rect x="31" y="10" width="5" height="12" rx="1" fill="#1e1e2e"/></svg>` },
  { id:'chess',         name:'Chess',                cat:'games',         bg:'linear-gradient(145deg,#b5865a,#8b5e3c)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="36" width="40" height="6" rx="2" fill="white" opacity=".8"/><path d="M16 36V24M16 24c0-4 4-6 4-10M12 14h8" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M32 36V28l4-10h-8l4 10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id:'sudoku',        name:'Sudoku',               cat:'games',         bg:'linear-gradient(145deg,#0f4c75,#1b6ca8)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="40" height="40" rx="4" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><line x1="4" y1="17" x2="44" y2="17" stroke="white" stroke-width="1" opacity=".4"/><line x1="4" y1="31" x2="44" y2="31" stroke="white" stroke-width="1" opacity=".4"/><line x1="17" y1="4" x2="17" y2="44" stroke="white" stroke-width="1" opacity=".4"/><line x1="31" y1="4" x2="31" y2="44" stroke="white" stroke-width="1" opacity=".4"/><line x1="4" y1="17" x2="44" y2="17" stroke="white" stroke-width="2.5" opacity=".8"/><line x1="4" y1="31" x2="44" y2="31" stroke="white" stroke-width="2.5" opacity=".8"/><line x1="17" y1="4" x2="17" y2="44" stroke="white" stroke-width="2.5" opacity=".8"/><line x1="31" y1="4" x2="31" y2="44" stroke="white" stroke-width="2.5" opacity=".8"/></svg>` },
  { id:'stocktracker',  name:'Stock Tracker',        cat:'internet',      bg:'linear-gradient(145deg,#16a34a,#166534)', icon:`<svg viewBox="0 0 48 48" fill="none"><polyline points="4,38 12,28 20,32 30,16 38,22 44,10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="44" cy="10" r="3" fill="#6bcb77"/></svg>` },
  { id:'vmdocker',      name:'Docker / VM',          cat:'dev',           bg:'linear-gradient(145deg,#0db7ed,#0a94c7)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="6" y="18" width="10" height="10" rx="2" fill="white" opacity=".9"/><rect x="19" y="18" width="10" height="10" rx="2" fill="white" opacity=".9"/><rect x="32" y="18" width="10" height="10" rx="2" fill="white" opacity=".9"/><rect x="19" y="6" width="10" height="10" rx="2" fill="white" opacity=".7"/><path d="M4 30c0 6 8 12 20 12s20-6 20-12" stroke="white" stroke-width="2" fill="none" opacity=".6"/></svg>` },
  { id:'vault',         name:'Password Vault',       cat:'system',        bg:'linear-gradient(145deg,#7c2d12,#991b1b)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="6" y="16" width="36" height="26" rx="5" fill="rgba(255,255,255,.12)" stroke="white" stroke-width="2"/><path d="M16 16V12a8 8 0 0116 0v4" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="24" cy="30" r="5" stroke="white" stroke-width="2"/><line x1="24" y1="35" x2="24" y2="38" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>` },
  { id:'ebook',         name:'E-Book Reader',        cat:'media',         bg:'linear-gradient(145deg,#92400e,#b45309)', icon:`<svg viewBox="0 0 48 48" fill="none"><path d="M8 8h20a4 4 0 014 4v28a4 4 0 01-4 4H8a4 4 0 01-4-4V12a4 4 0 014-4z" fill="rgba(255,255,255,.12)" stroke="white" stroke-width="1.8"/><path d="M32 8h8a4 4 0 014 4v28a4 4 0 01-4 4h-8" fill="rgba(255,255,255,.06)" stroke="white" stroke-width="1.5" opacity=".6"/><line x1="10" y1="18" x2="26" y2="18" stroke="white" stroke-width="2" opacity=".7" stroke-linecap="round"/><line x1="10" y1="24" x2="26" y2="24" stroke="white" stroke-width="2" opacity=".7" stroke-linecap="round"/><line x1="10" y1="30" x2="20" y2="30" stroke="white" stroke-width="2" opacity=".7" stroke-linecap="round"/></svg>` },
  { id:'photoeditor',   name:'Photo Editor',         cat:'creative',      bg:'linear-gradient(145deg,#be185d,#9d174d)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="8" width="40" height="32" rx="4" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.8"/><circle cx="16" cy="20" r="5" fill="none" stroke="white" stroke-width="2"/><path d="M4 36l10-12 8 8 6-6 16 10" fill="rgba(255,255,255,.3)" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="36" cy="12" r="4" fill="#ffd93d"/></svg>` },
  { id:'database',      name:'Database',             cat:'dev',           bg:'linear-gradient(145deg,#0f4c75,#0a2540)', icon:`<svg viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="12" rx="18" ry="7" fill="rgba(255,255,255,.15)" stroke="white" stroke-width="1.8"/><path d="M6 12v12c0 3.87 8.06 7 18 7s18-3.13 18-7V12" stroke="white" stroke-width="1.8" fill="none"/><path d="M6 24v12c0 3.87 8.06 7 18 7s18-3.13 18-7V24" stroke="white" stroke-width="1.8" fill="none"/></svg>` },
  { id:'jwt',           name:'JWT Tool',              cat:'dev',           bg:'linear-gradient(145deg,#f97316,#c2410c)', icon:`<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="8" width="40" height="32" rx="5" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5"/><text x="24" y="31" text-anchor="middle" font-size="14" fill="white" font-weight="800" font-family="monospace">JWT</text></svg>` },
];

// ─── Global State ─────────────────────────────────────
const openWindows = {};
let zCounter     = 100;
let dragTarget   = null, dragOffX = 0, dragOffY = 0;
let overviewOpen = false;

const DEFAULT_PINNED = ['files','terminal','browser','editor','code','postman','youtube','music','camera','paint','github','sysmon','settings'];
const LS_PINNED    = 'arcos_pinned_apps';
const LS_DOCK      = 'arcos_dock_order';
const LS_ACCENT    = 'arcos_accent';
const LS_WALLPAPER = 'arcos_wallpaper';

let pinnedApps = [];
let dockOrder  = [];

function loadStorage() {
  try {
    const p = localStorage.getItem(LS_PINNED);
    pinnedApps = p ? JSON.parse(p) : [...DEFAULT_PINNED];
    const d = localStorage.getItem(LS_DOCK);
    dockOrder  = d ? JSON.parse(d) : [...pinnedApps];
    const accent = localStorage.getItem(LS_ACCENT);
    if (accent) document.documentElement.style.setProperty('--accent', accent);
    const wp = localStorage.getItem(LS_WALLPAPER);
    if (wp) applyWallpaperStyle(wp);
  } catch (e) { pinnedApps = [...DEFAULT_PINNED]; dockOrder = [...DEFAULT_PINNED]; }
}

function savePinned() {
  localStorage.setItem(LS_PINNED, JSON.stringify(pinnedApps));
  localStorage.setItem(LS_DOCK,   JSON.stringify(dockOrder));
}

function unpinApp(id) {
  pinnedApps = pinnedApps.filter(x=>x!==id);
  dockOrder  = dockOrder.filter(x=>x!==id);
  savePinned(); buildDock();
  // Re-render app grid so pin icon updates immediately
  const q = document.getElementById('overview-search')?.value || '';
  if (document.getElementById('app-grid')) renderAppGrid(q);
  showNotif('📌', 'Unpinned', (APP_DEFS.find(a=>a.id===id)?.name||id) + ' removed from dock');
}

function pinApp(id) {
  if (!pinnedApps.includes(id)) {
    pinnedApps.push(id); dockOrder.push(id);
    savePinned(); buildDock();
    const q = document.getElementById('overview-search')?.value || '';
    if (document.getElementById('app-grid')) renderAppGrid(q);
    showNotif('📌', 'Pinned', (APP_DEFS.find(a=>a.id===id)?.name||id) + ' added to dock');
  }
}

// ─── Clock ───────────────────────────────────────────
function startClock() {
  function tick() {
    const n = new Date();
    const txt = n.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}) + '  ' +
                n.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
    ['clock-display','clock-right'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=txt;});
  }
  tick(); setInterval(tick, 1000);
}

// ─── Dock Builder ─────────────────────────────────────
function buildDock() {
  const dock = document.getElementById('dock'); if (!dock) return;
  dock.innerHTML = '';
  dockOrder.forEach(id => {
    const app = APP_DEFS.find(a=>a.id===id); if (!app) return;
    const div = document.createElement('div');
    div.className = 'dock-icon'; div.id = `dock-${id}`;
    div.title = app.name; div.draggable = true; div.dataset.id = id;
    div.style.background = app.bg;
    div.innerHTML = app.icon.replace(/width="[^"]*"/g,'width="30"').replace(/height="[^"]*"/g,'height="30"');
    div.onclick = () => openApp(id);
    div.oncontextmenu = e => { e.preventDefault(); e.stopPropagation(); showDockCtx(id, e); };
    div.ondragstart = e => { e.dataTransfer.setData('dockId', id); div.style.opacity='.4'; div.style.transform='scale(.85)'; };
    div.ondragend   = () => { div.style.opacity='1'; div.style.transform=''; };
    div.ondragover  = e => { e.preventDefault(); div.style.background='rgba(94,129,244,.3)'; };
    div.ondragleave = () => { div.style.background = app.bg; };
    div.ondrop      = e => {
      e.preventDefault(); div.style.background = app.bg;
      const fromId = e.dataTransfer.getData('dockId');
      if (!fromId||fromId===id) return;
      const fi=dockOrder.indexOf(fromId), ti=dockOrder.indexOf(id);
      if(fi<0||ti<0) return;
      dockOrder.splice(fi,1); dockOrder.splice(ti,0,fromId);
      savePinned(); buildDock();
    };
    dock.appendChild(div);
    if (openWindows[id]) div.classList.add('active');
  });
  const sep = document.createElement('div'); sep.className='dock-sep'; dock.appendChild(sep);
  const all = document.createElement('div');
  all.className='dock-icon'; all.title='All Apps';
  all.style.cssText='background:var(--card);border:1px solid var(--border);color:var(--text)';
  all.innerHTML=`<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="8" height="8" rx="2" opacity=".7"/><rect x="14" y="2" width="8" height="8" rx="2" opacity=".7"/><rect x="2" y="14" width="8" height="8" rx="2" opacity=".7"/><rect x="14" y="14" width="8" height="8" rx="2" opacity=".7"/></svg>`;
  all.onclick = toggleOverview; dock.appendChild(all);
}

function showDockCtx(id, e) {
  hideDockCtx();
  const app = APP_DEFS.find(a=>a.id===id); if(!app) return;
  const isPinned = pinnedApps.includes(id);
  const menu = document.createElement('div'); menu.id='dock-ctx';
  menu.style.cssText=`position:fixed;left:${Math.min(e.clientX,window.innerWidth-180)}px;top:${e.clientY-110}px;background:rgba(18,18,32,.97);border:1px solid var(--border);border-radius:12px;padding:5px;min-width:170px;z-index:99999;box-shadow:0 20px 60px rgba(0,0,0,.7);backdrop-filter:blur(24px)`;
  menu.innerHTML=`
    <div style="padding:7px 12px;font-size:12px;color:var(--text-dim);border-bottom:1px solid var(--border);font-weight:700;margin-bottom:3px">${app.name}</div>
    <div class="ctx-item" onclick="openApp('${id}');hideDockCtx()">▶ Open</div>
    <div class="ctx-item" onclick="${isPinned?`unpinApp('${id}')`:`pinApp('${id}')`};hideDockCtx()">${isPinned?'📌 Unpin from Dock':'📌 Pin to Dock'}</div>
    ${openWindows[id]?`<div class="ctx-item" onclick="closeApp('${id}');hideDockCtx()">✕ Close Window</div>`:''}`;
  document.body.appendChild(menu);
  setTimeout(()=>document.addEventListener('click',hideDockCtx,{once:true}),10);
}
function hideDockCtx() { document.getElementById('dock-ctx')?.remove(); }

// ─── Overview / App Grid ──────────────────────────────
const CAT_LABELS = {all:'All',productivity:'Productivity',dev:'Development',media:'Media',creative:'Creative',internet:'Internet',system:'System',games:'Games'};
let overviewCat = 'all';

function buildAppGrid() {
  const catBar = document.getElementById('app-cat-bar');
  if (catBar) {
    catBar.innerHTML = Object.entries(CAT_LABELS).map(([k,v])=>
      `<button class="cat-btn${k===overviewCat?' active':''}" onclick="setOverviewCat('${k}')">${v}</button>`
    ).join('');
  }
  renderAppGrid('');
}

function setOverviewCat(cat) {
  overviewCat = cat;
  document.querySelectorAll('.cat-btn').forEach(b=>b.classList.toggle('active',b.textContent===CAT_LABELS[cat]));
  renderAppGrid(document.getElementById('overview-search')?.value||'');
}

// ─── Paginated App Grid ───────────────────────────────
const APPS_PER_PAGE = 20; // 5 cols × 4 rows (comfortable, centered)
let currentPage = 0;
let currentPageApps = [];

function renderAppGrid(q) {
  const isSearch = q && q.trim().length > 0;
  const pagesWrap = document.getElementById('overview-pages-wrap');
  const singleGrid = document.getElementById('app-grid');
  const pagesEl    = document.getElementById('app-grid-pages');
  const dotsEl     = document.getElementById('overview-page-dots');
  const arrowL     = document.getElementById('page-arrow-left');
  const arrowR     = document.getElementById('page-arrow-right');

  const apps = APP_DEFS.filter(a =>
    (overviewCat === 'all' || a.cat === overviewCat) &&
    (!q || a.name.toLowerCase().includes(q.toLowerCase()) || a.cat.includes(q.toLowerCase()))
  );

  if (isSearch) {
    if (pagesWrap) pagesWrap.style.display = 'none';
    if (singleGrid) {
      singleGrid.style.display = 'flex';
      singleGrid.style.flexWrap = 'wrap';
      singleGrid.style.justifyContent = 'center';
      singleGrid.style.gap = '14px';
      singleGrid.style.overflowY = 'auto';
      singleGrid.style.maxHeight = 'calc(100vh - 240px)';
      singleGrid.style.padding = '0 40px';
      singleGrid.innerHTML = renderIconsHtml(apps);
    }
    return;
  }

  // Paginated mode
  if (pagesWrap) pagesWrap.style.display = 'flex';
  if (singleGrid) singleGrid.style.display = 'none';
  if (!pagesEl) return;

  currentPageApps = apps;
  const totalPages = Math.max(1, Math.ceil(apps.length / APPS_PER_PAGE));
  currentPage = Math.min(currentPage, totalPages - 1);

  // Build pages
  pagesEl.innerHTML = '';
  // Each page = 100vw wide for the slide
  for (let p = 0; p < totalPages; p++) {
    const page = document.createElement('div');
    page.className = 'app-grid-page';
    const slice = apps.slice(p * APPS_PER_PAGE, (p + 1) * APPS_PER_PAGE);
    page.innerHTML = renderIconsHtml(slice);
    pagesEl.appendChild(page);
  }

  // Update dots
  if (dotsEl) {
    dotsEl.innerHTML = Array.from({length:totalPages}, (_,i) =>
      `<div class="page-dot${i===currentPage?' active':''}" onclick="goToPage(${i})"></div>`
    ).join('');
  }

  // Show/hide arrows
  if (arrowL) arrowL.style.display = totalPages > 1 ? 'flex' : 'none';
  if (arrowR) arrowR.style.display = totalPages > 1 ? 'flex' : 'none';

  goToPage(currentPage, false);
}

function renderIconsHtml(apps) {
  return apps.map(a => {
    const isPinned = pinnedApps.includes(a.id);
    return `<div class="app-icon" data-app="${a.id}"
      onclick="openApp('${a.id}');closeOverview()"
      oncontextmenu="showAppCtx('${a.id}',event)">
      <div class="app-icon-img" style="background:${a.bg}">${a.icon}</div>
      <div class="app-icon-label">${a.name}</div>
      <div class="app-pin-btn${isPinned?' pinned':''}"
        onclick="event.stopPropagation();${isPinned?`unpinApp('${a.id}');`:`pinApp('${a.id}');`}renderAppGrid(document.getElementById('overview-search')?.value||'')"
        title="${isPinned?'Unpin from dock':'Pin to dock'}"
        style="${isPinned?'opacity:1;background:rgba(94,129,244,.7);':''}"
      >${isPinned?'📌':'＋'}</div>
    </div>`;
  }).join('');
}

function goToPage(n, animate = true) {
  const pagesEl = document.getElementById('app-grid-pages');
  if (!pagesEl) return;
  const totalPages = pagesEl.children.length;
  currentPage = Math.max(0, Math.min(n, totalPages - 1));
  pagesEl.style.transition = animate ? 'transform .38s cubic-bezier(.4,0,.2,1)' : 'none';
  pagesEl.style.transform = `translateX(calc(-${currentPage} * 100vw))`;
  document.querySelectorAll('.page-dot').forEach((d,i) => d.classList.toggle('active', i === currentPage));
  const arrowL = document.getElementById('page-arrow-left');
  const arrowR = document.getElementById('page-arrow-right');
  if (arrowL) arrowL.style.opacity = currentPage === 0 ? '0.3' : '1';
  if (arrowR) arrowR.style.opacity = currentPage === totalPages - 1 ? '0.3' : '1';
}

function overviewPageStep(dir) {
  goToPage(currentPage + dir);
}

// Swipe gesture support for overview
let _swipeStartX = 0;
document.addEventListener('touchstart', e => {
  if (document.getElementById('overview')?.classList.contains('active'))
    _swipeStartX = e.touches[0].clientX;
});
document.addEventListener('touchend', e => {
  if (!document.getElementById('overview')?.classList.contains('active')) return;
  const dx = e.changedTouches[0].clientX - _swipeStartX;
  if (Math.abs(dx) > 60) overviewPageStep(dx < 0 ? 1 : -1);
});

// Arrow key navigation in overview
document.addEventListener('keydown', e => {
  if (!document.getElementById('overview')?.classList.contains('active')) return;
  if (e.key === 'ArrowRight') overviewPageStep(1);
  if (e.key === 'ArrowLeft')  overviewPageStep(-1);
});

function filterApps(q) { renderAppGrid(q); }


function showAppCtx(id, ev) {
  ev.preventDefault(); hideDockCtx();
  const app=APP_DEFS.find(a=>a.id===id); if(!app) return;
  const isPinned=pinnedApps.includes(id);
  const menu=document.createElement('div'); menu.id='dock-ctx';
  menu.style.cssText=`position:fixed;left:${Math.min(ev.clientX,window.innerWidth-170)}px;top:${ev.clientY}px;background:rgba(18,18,32,.97);border:1px solid var(--border);border-radius:12px;padding:5px;min-width:165px;z-index:99999;box-shadow:0 20px 60px rgba(0,0,0,.7);backdrop-filter:blur(24px)`;
  menu.innerHTML=`
    <div class="ctx-item" onclick="openApp('${id}');closeOverview();hideDockCtx()">▶ Open</div>
    <div class="ctx-item" onclick="${isPinned?`unpinApp('${id}')`:`pinApp('${id}')`};hideDockCtx()">${isPinned?'📌 Unpin':'📌 Pin to Dock'}</div>`;
  document.body.appendChild(menu);
  setTimeout(()=>document.addEventListener('click',hideDockCtx,{once:true}),10);
}

function toggleOverview() {
  overviewOpen=!overviewOpen;
  document.getElementById('overview').classList.toggle('active',overviewOpen);
  if(overviewOpen){
    currentPage = 0;
    overviewCat = 'all';
    const searchEl = document.getElementById('overview-search');
    if (searchEl) searchEl.value = '';
    buildAppGrid();
    setTimeout(()=>searchEl?.focus(),80);
  }
}
function closeOverview() { overviewOpen=false; document.getElementById('overview').classList.remove('active'); }

// ─── Alt+Tab ──────────────────────────────────────────
let altTabActive=false, altTabIdx=0;
function showAltTab() {
  const ids = Object.keys(openWindows); if(ids.length<1) return;
  altTabActive=true; altTabIdx=(altTabIdx+1)%ids.length;
  let sw=document.getElementById('alttab-sw');
  if(!sw){sw=document.createElement('div');sw.id='alttab-sw';sw.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(14,14,28,.97);backdrop-filter:blur(30px);border:1px solid var(--border);border-radius:16px;padding:16px 20px;display:flex;gap:12px;z-index:999999;box-shadow:0 20px 60px rgba(0,0,0,.8)';document.body.appendChild(sw);}
  sw.innerHTML=ids.map((id,i)=>{
    const app=APP_DEFS.find(a=>a.id===id);
    return `<div onclick="focusWindow('${id}');closeAltTab()" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px;border-radius:10px;cursor:pointer;border:2px solid ${i===altTabIdx?'var(--accent)':'transparent'};transition:border .15s">
      <div style="width:48px;height:48px;border-radius:12px;background:${app?.bg||'var(--card)'};display:flex;align-items:center;justify-content:center">${(app?.icon||'').replace(/width="[^"]*"/g,'width="30"').replace(/height="[^"]*"/g,'height="30"')}</div>
      <div style="font-size:10px;color:var(--text-dim);white-space:nowrap">${app?.name||id}</div>
    </div>`;
  }).join('');
  setTimeout(()=>{ const all=document.getElementById('alttab-sw'); if(all)all.querySelectorAll('div')[altTabIdx]?.focus(); },10);
}
function closeAltTab() { altTabActive=false; document.getElementById('alttab-sw')?.remove(); altTabIdx=0; }

// ─── Wallpapers ───────────────────────────────────────
const WALLPAPERS = {
  default:   'radial-gradient(ellipse 90% 70% at 20% 60%,rgba(94,129,244,.25) 0,transparent 55%),radial-gradient(ellipse 70% 60% at 80% 10%,rgba(199,125,255,.2) 0,transparent 50%),radial-gradient(ellipse 60% 50% at 50% 90%,rgba(72,207,173,.15) 0,transparent 45%),linear-gradient(155deg,#05050f 0%,#0b0b1e 30%,#10112a 60%,#080f22 100%)',
  aurora:    'linear-gradient(170deg,#020810 0%,#04122a 25%,#062818 45%,#0e1f3a 65%,#180830 85%,#05050f 100%)',
  synthwave: 'linear-gradient(180deg,#050010 0%,#120025 35%,#2a0050 60%,#1a0035 80%,#050010 100%)',
  cyberpunk: 'linear-gradient(145deg,#060012 0%,#130820 30%,#1e0a35 55%,#0d1225 80%,#060012 100%)',
  ocean:     'linear-gradient(160deg,#010b18 0%,#012a4a 35%,#01497c 65%,#023e8a 100%)',
  midnight:  'linear-gradient(150deg,#000000 0%,#0a0a1a 40%,#0f0f2e 70%,#050510 100%)',
  forest:    'linear-gradient(160deg,#020a02 0%,#0b200b 35%,#1a3a1a 65%,#0d280d 100%)',
  sunset:    'linear-gradient(160deg,#080010 0%,#1f002e 30%,#4a0030 55%,#8b1a1a 75%,#200010 100%)',
};

function applyWallpaperStyle(key) {
  const wp = WALLPAPERS[key]||WALLPAPERS.default;
  const el = document.getElementById('wallpaper'); if(!el) return;
  el.style.background = wp;
  el.classList.remove('has-photo');
  // Clear photo layer
  const layer = document.getElementById('wallpaper-photo');
  if (layer) { layer.classList.remove('loaded'); setTimeout(()=>{ layer.style.backgroundImage=''; },900); }
  localStorage.setItem('arcos_wallpaper', key);
  try { localStorage.removeItem('arcos_wallpaper_photo'); } catch {}
}
