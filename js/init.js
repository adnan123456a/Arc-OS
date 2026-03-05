/* ═══════════════════════════════════════
   ArcOS — Init: Boot sequence & startup
═══════════════════════════════════════ */

window.addEventListener('DOMContentLoaded', () => {

  // ── Build app grid for overview ──
  buildAppGrid();

  // ── Start top-bar clock ──
  startClock();

  // ── Inject extra CSS keyframes ──
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%     {transform:translateX(-6px)}
      40%     {transform:translateX(6px)}
      60%     {transform:translateX(-4px)}
      80%     {transform:translateX(4px)}
    }
    .w-cell { transition: background .35s, border-color .35s; }

    /* Dock magnify neighbours */
    .dock-icon:hover + .dock-icon { transform: translateY(-6px) scale(1.08); }

    /* Smooth window open */
    .window { transition: box-shadow .2s; }
    .window:focus-within { box-shadow: 0 28px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(94,129,244,.25); }

    /* Scrollbar for overview */
    #overview { overflow-y: auto; }

    /* Pulse on notification */
    @keyframes notifPulse {
      0%   { box-shadow: 0 0 0 0 rgba(94,129,244,.5); }
      70%  { box-shadow: 0 0 0 10px rgba(94,129,244,0); }
      100% { box-shadow: 0 0 0 0 rgba(94,129,244,0); }
    }
    #notification.show { animation: notifPulse .6s ease; }
  `;
  document.head.appendChild(style);

  // ── Loader dismiss ──
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('fade');
      setTimeout(() => loader.remove(), 700);
    }

    // ── Welcome notification ──
    showNotif('🐧', 'Welcome to ArcOS 6.2', 'Click Activities or right-click desktop to get started!');

    // ── Auto-open terminal on first boot ──
    setTimeout(() => openApp('terminal'), 400);

  }, 2400);

  // ── Prevent accidental browser back on Backspace ──
  document.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });

  // ── Middle-click to close windows ──
  document.addEventListener('mousedown', e => {
    if (e.button === 1) {
      const win = e.target.closest('.window');
      if (win) { e.preventDefault(); closeApp(win.id.replace('win-', '')); }
    }
  });

  console.log(`
  ╔══════════════════════════════════════╗
  ║          ArcOS 6.2.0 Ready           ║
  ║  ${APP_DEFS.length} apps loaded · Browser Linux OS  ║
  ╚══════════════════════════════════════╝
  `);
});
