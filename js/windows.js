/* ═══════════════════════════════════════
   ArcOS — Window Management
═══════════════════════════════════════ */

function openApp(id) {
  if (openWindows[id]) { focusWindow(id); return; }
  const app = APP_DEFS.find(a => a.id === id);
  const win = document.createElement('div');
  win.className = 'window'; win.id = `win-${id}`;
  const [w, h, x, y] = getDefaultSize(id);
  win.style.cssText = `width:${w}px;height:${h}px;left:${x}px;top:${y}px;z-index:${++zCounter}`;
  win.innerHTML = `
    <div class="window-bar" onmousedown="startDrag(event,'${id}')">
      <button class="win-btn win-close" onclick="closeApp('${id}')"></button>
      <button class="win-btn win-min"   onclick="minimizeWin('${id}')"></button>
      <button class="win-btn win-max"   onclick="maximizeWin('${id}')"></button>
      <div class="win-title">
        ${app ? `<div style="width:16px;height:16px;border-radius:4px;display:flex;align-items:center;justify-content:center;background:${app.bg};flex-shrink:0">${app.icon.replace(/width="[^"]*"/g,'width="12"').replace(/height="[^"]*"/g,'height="12"')}</div>` : ''}
        <span>${app ? app.name : id}</span>
      </div>
    </div>
    <div class="window-content" id="wc-${id}">${buildContent(id)}</div>`;
  document.body.appendChild(win);
  openWindows[id] = win;
  addResize(win);
  document.getElementById(`dock-${id}`)?.classList.add('active');
  afterOpen(id);
  if (id === 'terminal') setTimeout(() => document.getElementById('term-input')?.focus(), 120);
  if (id === 'files')    setTimeout(() => renderFiles(), 80);
}

function getDefaultSize(id) {
  const sz = {
    terminal:[700,440], editor:[680,480], code:[860,560], browser:[900,560],
    files:[740,480], camera:[640,500], music:[340,510], imgviewer:[600,440],
    calculator:[280,440], clock:[360,440], sysmon:[700,460], settings:[720,500],
    github:[660,480], snake:[420,480], tetris:[460,510], memory:[420,490],
    youtube:[920,580], postman:[940,580], paint:[780,540], jsonformat:[760,480],
    markdown:[820,520], sticky:[220,180], game2048:[360,480], minesweeper:[380,460],
    wordle:[440,560],
  };
  const [w, h] = sz[id] || [600, 420];
  const x = Math.max(60, Math.random() * (window.innerWidth - w - 100) + 50);
  const y = Math.max(44, Math.random() * (window.innerHeight - h - 120) + 44);
  return [w, h, Math.round(x), Math.round(y)];
}

function buildContent(id) {
  const map = {
    terminal:    buildTerminal,
    editor:      buildEditor,
    code:        buildCode,
    browser:     () => typeof buildBrowser === 'function' ? buildBrowser() : '<div>Browser</div>',
    files:       buildFiles,
    camera:      () => typeof buildCamera === 'function' ? buildCamera() : '<div>Camera</div>',
    music:       buildMusic,
    imgviewer:   buildImgViewer,
    calculator:  buildCalculator,
    clock:       buildClock,
    sysmon:      buildSysMon,
    settings:    buildSettings,
    github:      buildGithub,
    snake:       buildSnake,
    tetris:      buildTetris,
    memory:      buildMemory,
    youtube:     buildYoutube,
    postman:     buildPostman,
    paint:       buildPaint,
    jsonformat:  buildJsonFormat,
    markdown:    buildMarkdown,
    sticky:      buildSticky,
    game2048:    build2048,
    minesweeper: buildMinesweeper,
    wordle:      buildWordle,
    maps:        () => typeof buildMaps    === 'function' ? buildMaps()    : '<div style="padding:20px">Maps loading…</div>',
    jwt:         () => typeof buildJwt     === 'function' ? buildJwt()     : '<div style="padding:20px">JWT loading…</div>',
  };
  return map[id] ? map[id]() : `<div style="padding:20px;color:var(--text-dim)">App not found: ${id}</div>`;
}

function afterOpen(id) {
  if (id === 'clock')       startClockWidget();
  if (id === 'sysmon')      startSysMon();
  if (id === 'camera')      setTimeout(() => typeof initCamera === 'function' && initCamera(), 80);
  if (id === 'snake')       initSnake();
  if (id === 'tetris')      initTetris();
  if (id === 'memory')      initMemory();
  if (id === 'music')       initMusic();
  if (id === 'code')        initCode();
  if (id === 'browser')     setTimeout(() => typeof updateBrowserTabs === 'function' && updateBrowserTabs(), 80);
  if (id === 'terminal')    initTerminal();
  if (id === 'youtube')     initYoutube();
  if (id === 'paint')       initPaint();
  if (id === 'markdown')    initMarkdown();
  if (id === 'game2048')    init2048();
  if (id === 'minesweeper') initMinesweeper();
  if (id === 'wordle')      initWordle();
  if (id === 'postman')     initPostman();
  if (id === 'maps')        setTimeout(() => typeof initMaps === 'function' && initMaps(), 120);
}

function closeApp(id) {
  openWindows[id]?.remove();
  delete openWindows[id];
  document.getElementById(`dock-${id}`)?.classList.remove('active');
  if (id === 'snake')  snakeRunning  = false;
  if (id === 'tetris') tetrisRunning = false;
  if (id === 'camera') stopCamera();
}

function focusWindow(id) {
  const w = openWindows[id]; if (!w) return;
  w.style.zIndex = ++zCounter;
  if (w.style.display === 'none') w.style.display = 'flex';
}

function minimizeWin(id) {
  const w = openWindows[id]; if (w) w.style.display = 'none';
}

function maximizeWin(id) {
  const w = openWindows[id]; if (!w) return;
  if (w.dataset.maximized) {
    Object.assign(w.style, JSON.parse(w.dataset.prevStyle));
    delete w.dataset.maximized;
  } else {
    w.dataset.prevStyle = JSON.stringify({ width:w.style.width, height:w.style.height, left:w.style.left, top:w.style.top });
    Object.assign(w.style, { width:'100vw', height:'calc(100vh - 36px)', left:'0', top:'36px' });
    w.dataset.maximized = '1';
  }
}

function startDrag(e, id) {
  if (e.target.classList.contains('win-btn')) return;
  const w = openWindows[id]; if (!w) return;
  focusWindow(id);
  dragTarget = w;
  const r = w.getBoundingClientRect();
  dragOffX = e.clientX - r.left;
  dragOffY = e.clientY - r.top;
  e.preventDefault();
}

function onMouseMove(e) {
  if (!dragTarget) return;
  dragTarget.style.left = (e.clientX - dragOffX) + 'px';
  dragTarget.style.top = Math.max(36, e.clientY - dragOffY) + 'px';
}

function addResize(win) {
  const h = document.createElement('div');
  h.style.cssText = 'position:absolute;bottom:0;right:0;width:14px;height:14px;cursor:se-resize;z-index:1;';
  let rsx, rsy, rw, rh;
  h.onmousedown = e => {
    rsx = e.clientX; rsy = e.clientY; rw = win.offsetWidth; rh = win.offsetHeight;
    function rm(e) { win.style.width = Math.max(300, rw + e.clientX - rsx) + 'px'; win.style.height = Math.max(200, rh + e.clientY - rsy) + 'px'; }
    function ru() { document.removeEventListener('mousemove', rm); document.removeEventListener('mouseup', ru); }
    document.addEventListener('mousemove', rm); document.addEventListener('mouseup', ru);
    e.stopPropagation(); e.preventDefault();
  };
  win.appendChild(h);
}
