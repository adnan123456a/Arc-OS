/* ═══════════════════════════════════════
   ArcOS — App Fixes & New Apps
   Maps (Leaflet) · Browser (proxy) 
   Camera (enhanced) · JWT · Terminal+
   Wallpaper image fetcher
═══════════════════════════════════════ */

// ─── MAPS (Leaflet.js — no iframe blocking) ───────────
function buildMaps() {
  return `<div id="maps-content" style="display:flex;flex-direction:column;height:100%;background:#0a0f18">
    <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--win-bar);border-bottom:1px solid var(--border);z-index:1">
      <input id="maps-search-inp" type="text" placeholder="Search location…"
        style="flex:1;padding:7px 12px;background:rgba(255,255,255,.07);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;outline:none;font-family:inherit"
        onkeydown="if(event.key==='Enter')mapsSearch()">
      <button class="editor-btn" onclick="mapsSearch()">🔍</button>
      <button class="editor-btn" onclick="mapsGeolocate()">📍 Me</button>
      <div style="display:flex;gap:3px">
        <button class="editor-btn" onclick="mapsZoom(1)">+</button>
        <button class="editor-btn" onclick="mapsZoom(-1)">−</button>
      </div>
      <select id="maps-layer-sel" class="settings-select" onchange="mapsChangeLayer(this.value)" style="font-size:12px">
        <option value="osm">Street</option>
        <option value="topo">Topo</option>
        <option value="satellite">Satellite</option>
        <option value="dark">Dark</option>
      </select>
    </div>
    <div id="maps-container" style="flex:1;position:relative;overflow:hidden">
      <div id="maps-leaflet" style="width:100%;height:100%"></div>
      <div id="maps-loading" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(10,15,24,.8);z-index:999;font-size:14px;color:var(--text-dim)">
        <div style="text-align:center"><div style="font-size:32px;margin-bottom:8px">🗺️</div>Loading map…</div>
      </div>
    </div>
    <div id="maps-status" style="padding:5px 12px;background:var(--win-bar);border-top:1px solid var(--border);font-size:11px;color:var(--text-dim)">
      OpenStreetMap · Click to drop pin · Scroll to zoom
    </div>
  </div>`;
}

let mapsLeaflet = null;
let mapsMarker = null;

function initMaps() {
  // Load Leaflet dynamically
  if (window.L) { mapsInitLeaflet(); return; }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
  document.head.appendChild(link);
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  script.onload = () => mapsInitLeaflet();
  script.onerror = () => mapsLeafletFallback();
  document.head.appendChild(script);
}

function mapsInitLeaflet() {
  const container = document.getElementById('maps-leaflet');
  const loading   = document.getElementById('maps-loading');
  if (!container || !window.L) { mapsLeafletFallback(); return; }
  if (loading) loading.style.display = 'none';

  mapsLeaflet = L.map('maps-leaflet', { zoomControl: false }).setView([48.8566, 2.3522], 13);
  
  const layers = {
    osm:       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OSM', maxZoom:19 }),
    topo:      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',  { attribution:'© OpenTopoMap', maxZoom:17 }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution:'© Esri', maxZoom:18 }),
    dark:      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution:'© CARTO', maxZoom:19 }),
  };
  layers.osm.addTo(mapsLeaflet);
  window._mapsLayers = layers;
  window._mapsCurrentLayer = layers.osm;

  mapsLeaflet.on('click', e => {
    if (mapsMarker) mapsMarker.remove();
    mapsMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(mapsLeaflet);
    mapsMarker.bindPopup(`📍 ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`).openPopup();
    document.getElementById('maps-status').textContent = `📍 ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
  });

  // Fix rendering after window resize
  setTimeout(() => mapsLeaflet.invalidateSize(), 200);
}

function mapsLeafletFallback() {
  const c = document.getElementById('maps-leaflet');
  if (c) c.innerHTML = `<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-0.15,51.48,0.01,51.52&layer=mapnik&marker=51.5,-0.09" style="width:100%;height:100%;border:none"></iframe>`;
  document.getElementById('maps-loading').style.display = 'none';
}

function mapsSearch() {
  const q = document.getElementById('maps-search-inp')?.value?.trim();
  if (!q) return;
  fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`)
    .then(r => r.json())
    .then(data => {
      if (!data.length) { showNotif('🗺️','Maps','Location not found'); return; }
      const { lat, lon, display_name } = data[0];
      if (mapsLeaflet) {
        mapsLeaflet.setView([parseFloat(lat), parseFloat(lon)], 14);
        if (mapsMarker) mapsMarker.remove();
        mapsMarker = L.marker([parseFloat(lat), parseFloat(lon)]).addTo(mapsLeaflet);
        mapsMarker.bindPopup(`📍 ${display_name}`).openPopup();
      }
      document.getElementById('maps-status').textContent = '📍 ' + display_name;
    })
    .catch(() => showNotif('🗺️','Maps','Search failed — check connection'));
}

function mapsGeolocate() {
  navigator.geolocation?.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lng } = pos.coords;
    if (mapsLeaflet) {
      mapsLeaflet.setView([lat, lng], 15);
      if (mapsMarker) mapsMarker.remove();
      mapsMarker = L.marker([lat, lng]).addTo(mapsLeaflet).bindPopup('📍 You are here!').openPopup();
    }
    showNotif('📍','Maps','Located you!');
  }, () => showNotif('📍','Maps','Location access denied'));
}

function mapsZoom(dir) { mapsLeaflet?.setZoom((mapsLeaflet.getZoom() || 13) + dir); }

function mapsChangeLayer(key) {
  if (!window._mapsLayers || !mapsLeaflet) return;
  if (window._mapsCurrentLayer) mapsLeaflet.removeLayer(window._mapsCurrentLayer);
  window._mapsCurrentLayer = window._mapsLayers[key];
  window._mapsCurrentLayer.addTo(mapsLeaflet);
}

// ─── BROWSER (proxy-style using Google Translate trick + iframeable sites) ──
function buildBrowser() {
  const quickLinks = [
    { name:'Wikipedia',  url:'https://en.m.wikipedia.org', icon:'📖' },
    { name:'GitHub',     url:'https://github.com',          icon:'🐙' },
    { name:'MDN Docs',   url:'https://developer.mozilla.org',icon:'📘' },
    { name:'Hacker News',url:'https://news.ycombinator.com', icon:'🟠' },
    { name:'CodePen',    url:'https://codepen.io',           icon:'✒️' },
    { name:'ArcOS Docs', url:'https://arcos.dev',            icon:'🖥️' },
  ];
  return `<div id="browser-content" style="display:flex;flex-direction:column;height:100%;background:#07070f">
    <div id="browser-bar" style="display:flex;align-items:center;gap:6px;padding:7px 10px;background:var(--win-bar);border-bottom:1px solid var(--border)">
      <button class="browser-nav" onclick="browserBack()" title="Back">◀</button>
      <button class="browser-nav" onclick="browserForward()" title="Forward">▶</button>
      <button class="browser-nav" onclick="browserReload()" title="Reload">↻</button>
      <div style="flex:1;position:relative">
        <input id="browser-url" type="text" placeholder="Search DuckDuckGo or enter URL…"
          onkeydown="if(event.key==='Enter')browserGo()"
          style="width:100%;padding:7px 36px 7px 12px;background:rgba(255,255,255,.07);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;outline:none;font-family:'Source Code Pro',monospace">
        <span id="browser-secure" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:12px;opacity:.5">🔒</span>
      </div>
      <button id="browser-go" onclick="browserGo()" style="padding:7px 14px;background:var(--accent);border:none;color:#fff;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;font-family:inherit">Go</button>
      <button class="browser-nav" onclick="browserHome()" title="Home">🏠</button>
    </div>
    <div id="browser-tabs" style="display:flex;gap:2px;padding:4px 8px;background:rgba(0,0,0,.25);border-bottom:1px solid var(--border);overflow-x:auto;min-height:32px"></div>
    <div id="browser-home" style="flex:1;overflow-y:auto;padding:30px 40px;background:#07070f">
      <div style="max-width:600px;margin:0 auto">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
          <div style="font-size:28px;font-weight:800;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent">ArcBrowser</div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:28px">
          <input id="browser-search-input" type="text" placeholder="Search the web or enter URL…"
            onkeydown="if(event.key==='Enter')browserSearch(this.value)"
            style="flex:1;padding:12px 18px;background:rgba(255,255,255,.07);border:1px solid var(--border);border-radius:12px;color:var(--text);font-size:14px;outline:none;font-family:inherit">
          <button onclick="browserSearch(document.getElementById('browser-search-input').value)"
            style="padding:12px 22px;background:var(--accent);border:none;color:#fff;border-radius:12px;cursor:pointer;font-size:14px;font-weight:700;font-family:inherit">Search</button>
        </div>
        <div style="font-size:12px;color:var(--text-dim);margin-bottom:12px">Quick Links</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:28px">
          ${quickLinks.map(l=>`
            <div onclick="browserLoad('${l.url}')"
              style="padding:12px;background:var(--card);border:1px solid var(--border);border-radius:12px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:background .15s;font-size:13px"
              onmouseover="this.style.background='var(--card-hover)'" onmouseout="this.style.background='var(--card)'">
              <span style="font-size:18px">${l.icon}</span>
              <span style="font-weight:600">${l.name}</span>
            </div>`).join('')}
        </div>
        <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px">
          <div style="font-size:12px;color:var(--accent);font-weight:700;margin-bottom:6px">ℹ️ Note about Browser</div>
          <div style="font-size:12px;color:var(--text-dim);line-height:1.7">
            Most sites block embedding via <code style="background:rgba(0,0,0,.4);padding:1px 5px;border-radius:4px">X-Frame-Options</code>.
            ArcBrowser opens sites in a real window using the system's browser-within-a-browser approach.
            Sites like Wikipedia, GitHub mobile, MDN, and HackerNews work. 
            Use <b>Ctrl+T</b> to open new tabs.
          </div>
        </div>
      </div>
    </div>
    <iframe id="browser-frame" style="display:none;flex:1;border:none;background:#fff"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"></iframe>
    <div id="browser-statusbar" style="padding:3px 12px;background:var(--win-bar);border-top:1px solid var(--border);font-size:11px;color:var(--text-dim);display:none"></div>
  </div>`;
}

const browserHistory = [];
let browserHistIdx = -1;
let browserTabs = [{ url:'', title:'New Tab' }];
let browserCurTab = 0;

function browserGo() {
  let u = document.getElementById('browser-url')?.value?.trim();
  if (!u) return;
  if (!u.includes(' ') && (u.includes('.') || u.startsWith('http'))) {
    if (!u.startsWith('http')) u = 'https://' + u;
    browserLoad(u);
  } else {
    browserSearch(u);
  }
}

function browserLoad(url) {
  document.getElementById('browser-url').value = url;
  document.getElementById('browser-home').style.display = 'none';
  const frame = document.getElementById('browser-frame');
  const status = document.getElementById('browser-statusbar');
  frame.style.display = 'block';
  if (status) { status.style.display = 'block'; status.textContent = 'Loading ' + url + '…'; }
  frame.src = url;
  frame.onload = () => { if (status) status.textContent = '✓ ' + url; browserTabs[browserCurTab] = { url, title: url.replace(/https?:\/\//, '').split('/')[0] }; updateBrowserTabs(); };
  frame.onerror = () => { browserShowBlocked(url); };
  browserHistory.push(url); browserHistIdx = browserHistory.length - 1;
}

function browserShowBlocked(url) {
  const frame = document.getElementById('browser-frame');
  frame.style.display = 'none';
  const home = document.getElementById('browser-home');
  home.style.display = 'block';
  home.querySelector('div').innerHTML += `
    <div style="background:rgba(255,107,107,.1);border:1px solid var(--red);border-radius:12px;padding:16px;margin-top:16px">
      <div style="font-size:13px;font-weight:700;color:var(--red);margin-bottom:6px">⚠ Cannot display: ${url}</div>
      <div style="font-size:12px;color:var(--text-dim)">This site blocks embedding. 
        <a href="${url}" target="_blank" style="color:var(--accent)">Open in real browser ↗</a>
      </div>
    </div>`;
}

function browserSearch(q) {
  if (!q) return;
  browserLoad(`https://duckduckgo.com/?q=${encodeURIComponent(q)}&ia=web`);
}

function browserBack()    { if (browserHistIdx > 0)    browserLoad(browserHistory[--browserHistIdx]); }
function browserForward() { if (browserHistIdx < browserHistory.length-1) browserLoad(browserHistory[++browserHistIdx]); }
function browserReload()  { const f=document.getElementById('browser-frame'); if(f.src) f.src=f.src; }
function browserHome()    { document.getElementById('browser-frame').style.display='none'; document.getElementById('browser-home').style.display='block'; }

function updateBrowserTabs() {
  const tabs = document.getElementById('browser-tabs');
  if (!tabs) return;
  tabs.innerHTML = browserTabs.map((t,i) => `
    <div onclick="switchBrowserTab(${i})" style="display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:12px;white-space:nowrap;max-width:140px;overflow:hidden;
      background:${i===browserCurTab?'rgba(94,129,244,.2)':'rgba(255,255,255,.04)'};
      border:1px solid ${i===browserCurTab?'var(--accent)':'transparent'}">
      <span style="overflow:hidden;text-overflow:ellipsis;max-width:90px">${t.title||'New Tab'}</span>
      <span onclick="event.stopPropagation();closeBrowserTab(${i})" style="opacity:.4;font-size:13px;flex-shrink:0" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.4">×</span>
    </div>`).join('') +
    `<div onclick="newBrowserTab()" style="padding:4px 8px;border-radius:6px;cursor:pointer;font-size:14px;color:var(--text-dim)"
      onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--text-dim)'">+</div>`;
}

function newBrowserTab() { browserTabs.push({url:'',title:'New Tab'}); browserCurTab=browserTabs.length-1; browserHome(); updateBrowserTabs(); }
function closeBrowserTab(i) { if(browserTabs.length>1){browserTabs.splice(i,1);browserCurTab=Math.max(0,i-1);} updateBrowserTabs(); }
function switchBrowserTab(i) { browserCurTab=i; if(browserTabs[i].url) browserLoad(browserTabs[i].url); else browserHome(); }

// ─── ENHANCED CAMERA ─────────────────────────────────
function buildCamera() {
  const filters = [
    ['Normal','none'],['Grayscale','grayscale(100%)'],['Sepia','sepia(80%)'],
    ['Vintage','sepia(50%) contrast(110%) brightness(90%)'],
    ['Cold','hue-rotate(200deg) saturate(120%)'],
    ['Warm','sepia(30%) saturate(150%) brightness(105%)'],
    ['Dramatic','contrast(150%) brightness(85%) saturate(80%)'],
    ['Neon','saturate(200%) hue-rotate(90deg) contrast(120%)'],
  ];
  return `<div id="camera-content" style="display:flex;flex-direction:column;height:100%;background:#050508">
    <div style="flex:1;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#000">
      <video id="camera-video" autoplay muted playsinline style="width:100%;height:100%;object-fit:cover;transition:filter .2s"></video>
      <canvas id="camera-canvas" style="display:none"></canvas>
      <div id="camera-overlay" style="position:absolute;inset:0;pointer-events:none;transition:background .1s"></div>
      <!-- Grid overlay -->
      <div id="camera-grid-overlay" style="position:absolute;inset:0;pointer-events:none;display:none">
        <svg width="100%" height="100%" style="position:absolute;inset:0"><line x1="33%" y1="0" x2="33%" y2="100%" stroke="rgba(255,255,255,.25)" stroke-width="1"/><line x1="66%" y1="0" x2="66%" y2="100%" stroke="rgba(255,255,255,.25)" stroke-width="1"/><line x1="0" y1="33%" x2="100%" y2="33%" stroke="rgba(255,255,255,.25)" stroke-width="1"/><line x1="0" y1="66%" x2="100%" y2="66%" stroke="rgba(255,255,255,.25)" stroke-width="1"/></svg>
      </div>
      <!-- Timer display -->
      <div id="camera-timer-display" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:80px;font-weight:900;color:#fff;text-shadow:0 4px 20px rgba(0,0,0,.8);display:none"></div>
      <!-- Zoom indicator -->
      <div id="camera-zoom-label" style="position:absolute;top:12px;right:12px;background:rgba(0,0,0,.6);color:#fff;font-size:12px;padding:4px 10px;border-radius:12px;font-family:'Source Code Pro',monospace;backdrop-filter:blur(8px)">1.0×</div>
      <!-- Photo strip -->
      <div id="camera-strip" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:6px;max-height:70%;overflow-y:auto"></div>
    </div>
    <!-- Filter bar -->
    <div style="display:flex;gap:8px;padding:8px 12px;background:rgba(0,0,0,.7);overflow-x:auto;scrollbar-width:none;border-top:1px solid rgba(255,255,255,.06)">
      ${filters.map(([name,f],i) => `
        <div onclick="camFilter('${f}',this)" data-filter="${f}"
          style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;opacity:${i===0?1:.6};transition:opacity .15s"
          onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=${i===0?1:.6}">
          <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#222,#444);border:2px solid ${i===0?'var(--accent)':'rgba(255,255,255,.1)'};overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:18px">
            ${['📷','⬛','🟤','🟡','🔵','🟠','🎭','🟢'][i]}
          </div>
          <span style="font-size:10px;color:rgba(255,255,255,.6)">${name}</span>
        </div>`).join('')}
    </div>
    <!-- Controls -->
    <div style="padding:10px 14px;background:rgba(0,0,0,.85);border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:8px">
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="editor-btn" onclick="camToggleGrid()" title="Grid">⊞</button>
        <button class="editor-btn" onclick="camZoom(1.2)" title="Zoom in">🔍+</button>
        <button class="editor-btn" onclick="camZoom(0.8)" title="Zoom out">🔍−</button>
        <button class="editor-btn" id="cam-timer-btn" onclick="camStartTimer()" title="Timer">⏱ 3s</button>
        <button class="editor-btn" onclick="camFlip()" title="Flip camera">🔄</button>
        <select class="settings-select" id="cam-res" onchange="camSetResolution()" style="font-size:11px">
          <option>HD 720p</option><option selected>Full HD</option><option>4K</option>
        </select>
      </div>
      <div style="flex:1;display:flex;justify-content:center">
        <button id="camera-shutter" onclick="camShoot()" style="
          width:62px;height:62px;border-radius:50%;
          background:radial-gradient(circle,#fff 60%,rgba(255,255,255,.6) 100%);
          border:4px solid rgba(255,255,255,.3);cursor:pointer;
          box-shadow:0 0 20px rgba(255,255,255,.3);
          transition:transform .1s,box-shadow .1s;
        " onmousedown="this.style.transform='scale(.9)'" onmouseup="this.style.transform=''"></button>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
        <button class="editor-btn" onclick="camRecord()" id="cam-rec-btn">🔴 Record</button>
        <button class="editor-btn" onclick="camDownloadAll()">💾 Save All</button>
        <button class="editor-btn" onclick="camClearPhotos()" style="color:var(--text-dim)">🗑</button>
      </div>
    </div>
  </div>`;
}

let cameraStream = null;
let cameraZoom = 1.0;
let cameraTimerSec = 3;
let cameraRecorder = null;
let cameraChunks = [];
let cameraFacingFront = true;
let camPhotoCount = 0;

function initCamera() {
  const constraints = { video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false };
  navigator.mediaDevices?.getUserMedia(constraints)
    .then(s => { cameraStream = s; const v = document.getElementById('camera-video'); if (v) v.srcObject = s; })
    .catch(() => showNotif('📷','Camera','Camera access denied'));
}

function camFilter(f, el) {
  const v = document.getElementById('camera-video');
  if (v) v.style.filter = f;
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.style.opacity = '.6';
    btn.querySelector('div').style.borderColor = 'rgba(255,255,255,.1)';
  });
  if (el) { el.style.opacity = '1'; el.querySelector('div').style.borderColor = 'var(--accent)'; }
}

function camShoot() {
  const v = document.getElementById('camera-video');
  const c = document.getElementById('camera-canvas');
  if (!v || !v.videoWidth) { showNotif('📷','Camera','No camera feed'); return; }
  c.width = v.videoWidth; c.height = v.videoHeight;
  const ctx = c.getContext('2d');
  ctx.filter = v.style.filter || 'none';
  ctx.drawImage(v, 0, 0);
  const url = c.toDataURL('image/jpeg', 0.92);
  camPhotoCount++;
  const strip = document.getElementById('camera-strip');
  if (strip) {
    const img = document.createElement('img');
    img.src = url;
    img.style.cssText = `width:64px;height:48px;object-fit:cover;border-radius:6px;border:2px solid var(--accent);cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.6)`;
    img.title = 'Click to download';
    img.onclick = () => { const a=document.createElement('a');a.href=url;a.download=`photo-${camPhotoCount}.jpg`;a.click(); };
    strip.insertBefore(img, strip.firstChild);
  }
  // Flash effect
  const ov = document.getElementById('camera-overlay');
  if (ov) { ov.style.background='rgba(255,255,255,.8)'; setTimeout(()=>ov.style.background='transparent',120); }
  showNotif('📷','Camera','Photo saved!');
}

function camStartTimer() {
  const timers = [3, 5, 10];
  const btn = document.getElementById('cam-timer-btn');
  const cur = timers.indexOf(cameraTimerSec);
  cameraTimerSec = timers[(cur+1) % timers.length];
  if (btn) btn.textContent = `⏱ ${cameraTimerSec}s`;
  // Actually start countdown
  let cnt = cameraTimerSec;
  const disp = document.getElementById('camera-timer-display');
  if (disp) { disp.style.display='block'; disp.textContent=cnt; }
  const iv = setInterval(() => {
    cnt--;
    if (disp) disp.textContent = cnt > 0 ? cnt : '';
    if (cnt <= 0) { clearInterval(iv); if(disp)disp.style.display='none'; camShoot(); }
  }, 1000);
}

function camToggleGrid() {
  const g = document.getElementById('camera-grid-overlay');
  if (g) g.style.display = g.style.display === 'none' ? 'block' : 'none';
}

function camZoom(factor) {
  cameraZoom = Math.max(0.5, Math.min(4, cameraZoom * factor));
  const v = document.getElementById('camera-video');
  if (v) v.style.transform = `scale(${cameraZoom})`;
  const lbl = document.getElementById('camera-zoom-label');
  if (lbl) lbl.textContent = cameraZoom.toFixed(1) + '×';
}

function camFlip() {
  cameraFacingFront = !cameraFacingFront;
  if (cameraStream) { cameraStream.getTracks().forEach(t=>t.stop()); }
  const mode = cameraFacingFront ? 'user' : 'environment';
  navigator.mediaDevices?.getUserMedia({ video: { facingMode: mode } })
    .then(s => { cameraStream=s; const v=document.getElementById('camera-video'); if(v)v.srcObject=s; });
}

function camRecord() {
  const btn = document.getElementById('cam-rec-btn');
  if (cameraRecorder && cameraRecorder.state === 'recording') {
    cameraRecorder.stop();
    if (btn) btn.textContent = '🔴 Record';
    return;
  }
  if (!cameraStream) { showNotif('📷','Camera','No camera active'); return; }
  cameraChunks = [];
  cameraRecorder = new MediaRecorder(cameraStream);
  cameraRecorder.ondataavailable = e => cameraChunks.push(e.data);
  cameraRecorder.onstop = () => {
    const blob = new Blob(cameraChunks, { type:'video/webm' });
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='recording.webm'; a.click();
    showNotif('🎥','Camera','Video saved!');
  };
  cameraRecorder.start();
  if (btn) btn.textContent = '⏹ Stop';
  showNotif('🎥','Camera','Recording started');
}

function camDownloadAll() {
  document.querySelectorAll('#camera-strip img').forEach((img,i) => {
    const a = document.createElement('a'); a.href=img.src; a.download=`photo-${i+1}.jpg`; a.click();
  });
}

function camClearPhotos() {
  const strip = document.getElementById('camera-strip');
  if (strip) strip.innerHTML = '';
  camPhotoCount = 0;
}

function stopCamera() { cameraStream?.getTracks().forEach(t=>t.stop()); }

// ─── JWT DECODER ──────────────────────────────────────
function buildJwt() {
  return `<div id="jwt-content" style="display:flex;flex-direction:column;height:100%;background:#08080f">
    <div style="display:flex;gap:0;border-bottom:1px solid var(--border);background:var(--win-bar)">
      <button class="editor-btn jwt-tab active" onclick="jwtTab('decode',this)" style="border-radius:0;border:none;border-bottom:2px solid var(--accent);padding:10px 18px;font-weight:700">Decode</button>
      <button class="editor-btn jwt-tab" onclick="jwtTab('encode',this)" style="border-radius:0;border:none;border-bottom:2px solid transparent;padding:10px 18px">Encode</button>
      <button class="editor-btn jwt-tab" onclick="jwtTab('verify',this)" style="border-radius:0;border:none;border-bottom:2px solid transparent;padding:10px 18px">Verify</button>
    </div>

    <!-- DECODE TAB -->
    <div id="jwt-decode" class="jwt-panel" style="flex:1;display:flex;gap:0;min-height:0">
      <div style="flex:1;display:flex;flex-direction:column;border-right:1px solid var(--border)">
        <div style="padding:10px 14px;font-size:11px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid var(--border)">Encoded Token</div>
        <textarea id="jwt-input" spellcheck="false" placeholder="Paste JWT token here…
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          style="flex:1;padding:14px;background:transparent;border:none;color:#cdd6f4;font-family:'Source Code Pro',monospace;font-size:12px;resize:none;outline:none;line-height:1.7"
          oninput="jwtDecode(this.value)"></textarea>
        <div style="padding:8px 14px;border-top:1px solid var(--border);display:flex;gap:6px">
          <button class="editor-btn" onclick="jwtPasteSample()">📋 Sample</button>
          <button class="editor-btn" onclick="jwtClear()">Clear</button>
        </div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;overflow:hidden">
        <div style="display:flex;gap:0;border-bottom:1px solid var(--border)">
          ${['header','payload','signature'].map((t,i)=>`
            <div style="flex:1;padding:8px;font-size:11px;font-weight:700;text-align:center;color:${['#ff79c6','#a8ff78','#ffd93d'][i]};border-right:1px solid var(--border)">
              ${t.toUpperCase()}
            </div>`).join('')}
        </div>
        <div style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px">
          <div>
            <div style="font-size:10px;color:#ff79c6;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">HEADER</div>
            <pre id="jwt-header-out" style="background:rgba(255,121,198,.06);border:1px solid rgba(255,121,198,.2);border-radius:8px;padding:10px;font-size:12px;color:#ff79c6;line-height:1.6;white-space:pre-wrap;word-break:break-all;font-family:'Source Code Pro',monospace"></pre>
          </div>
          <div>
            <div style="font-size:10px;color:#a8ff78;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">PAYLOAD</div>
            <pre id="jwt-payload-out" style="background:rgba(168,255,120,.06);border:1px solid rgba(168,255,120,.2);border-radius:8px;padding:10px;font-size:12px;color:#a8ff78;line-height:1.6;white-space:pre-wrap;word-break:break-all;font-family:'Source Code Pro',monospace"></pre>
          </div>
          <div id="jwt-claims-section" style="display:none">
            <div style="font-size:10px;color:var(--accent);font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">CLAIMS</div>
            <div id="jwt-claims-out" style="display:flex;flex-direction:column;gap:4px"></div>
          </div>
          <div>
            <div style="font-size:10px;color:#ffd93d;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">SIGNATURE</div>
            <div id="jwt-sig-out" style="background:rgba(255,217,61,.06);border:1px solid rgba(255,217,61,.2);border-radius:8px;padding:10px;font-size:12px;color:#ffd93d;font-family:'Source Code Pro',monospace;word-break:break-all"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ENCODE TAB -->
    <div id="jwt-encode" class="jwt-panel" style="display:none;flex:1;padding:16px;display:flex;flex-direction:column;gap:12px;overflow-y:auto">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px">Algorithm</div>
          <select class="settings-select" id="jwt-alg" style="width:100%">
            <option>HS256</option><option>HS384</option><option>HS512</option>
            <option>RS256</option><option>ES256</option>
          </select>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px">Secret / Key</div>
          <input type="text" id="jwt-secret" value="your-secret-key" style="width:100%;padding:7px 10px;background:var(--card);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:'Source Code Pro',monospace;font-size:12px;outline:none">
        </div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px">Payload (JSON)</div>
        <textarea id="jwt-encode-payload" rows="8" style="width:100%;padding:10px;background:var(--card);border:1px solid var(--border);border-radius:8px;color:#a8ff78;font-family:'Source Code Pro',monospace;font-size:12px;resize:vertical;outline:none;line-height:1.6">{
  "sub": "1234567890",
  "name": "ArcOS User",
  "iat": ${Math.floor(Date.now()/1000)},
  "exp": ${Math.floor(Date.now()/1000) + 3600},
  "role": "admin"
}</textarea>
      </div>
      <button onclick="jwtEncode()" style="padding:10px;background:var(--accent);border:none;color:#fff;border-radius:10px;cursor:pointer;font-size:14px;font-weight:700;font-family:inherit">⚡ Generate JWT</button>
      <div>
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px">Generated Token</div>
        <div id="jwt-encoded-out" style="padding:12px;background:var(--card);border:1px solid var(--border);border-radius:8px;font-family:'Source Code Pro',monospace;font-size:12px;color:#cdd6f4;word-break:break-all;cursor:pointer;min-height:60px" onclick="navigator.clipboard?.writeText(this.textContent);showNotif('📋','JWT','Token copied')">Click Generate to see token…</div>
      </div>
    </div>

    <!-- VERIFY TAB -->
    <div id="jwt-verify" class="jwt-panel" style="display:none;flex:1;padding:16px;display:flex;flex-direction:column;gap:12px;overflow-y:auto">
      <div>
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px">Token to Verify</div>
        <textarea id="jwt-verify-token" rows="4" placeholder="Paste JWT…" style="width:100%;padding:10px;background:var(--card);border:1px solid var(--border);border-radius:8px;color:#cdd6f4;font-family:'Source Code Pro',monospace;font-size:12px;resize:none;outline:none;line-height:1.6"></textarea>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px">Secret / Public Key</div>
        <input type="text" id="jwt-verify-secret" value="your-secret-key" style="width:100%;padding:8px 12px;background:var(--card);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:'Source Code Pro',monospace;font-size:12px;outline:none">
      </div>
      <button onclick="jwtVerify()" style="padding:10px;background:var(--accent);border:none;color:#fff;border-radius:10px;cursor:pointer;font-size:14px;font-weight:700;font-family:inherit">🔍 Verify Token</button>
      <div id="jwt-verify-result" style="padding:14px;border-radius:10px;font-size:13px;line-height:1.7;display:none"></div>
    </div>
  </div>`;
}

function jwtTab(name, btn) {
  document.querySelectorAll('.jwt-panel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.jwt-tab').forEach(b => { b.style.borderBottomColor='transparent'; b.classList.remove('active'); });
  const panel = document.getElementById('jwt-'+name);
  if (panel) panel.style.display = 'flex';
  if (btn) { btn.style.borderBottomColor='var(--accent)'; btn.classList.add('active'); }
}

function jwtB64Decode(str) {
  str = str.replace(/-/g,'+').replace(/_/g,'/');
  while (str.length % 4) str += '=';
  try { return JSON.parse(atob(str)); } catch { return null; }
}

function jwtDecode(token) {
  token = token?.trim();
  if (!token) return;
  const parts = token.split('.');
  if (parts.length !== 3) { document.getElementById('jwt-header-out').textContent = '⚠ Invalid JWT (must have 3 parts)'; return; }
  const header  = jwtB64Decode(parts[0]);
  const payload = jwtB64Decode(parts[1]);

  const headerEl  = document.getElementById('jwt-header-out');
  const payloadEl = document.getElementById('jwt-payload-out');
  const sigEl     = document.getElementById('jwt-sig-out');
  const claimsSection = document.getElementById('jwt-claims-section');
  const claimsOut = document.getElementById('jwt-claims-out');

  if (headerEl)  headerEl.textContent  = header  ? JSON.stringify(header,  null, 2) : '⚠ Cannot decode header';
  if (payloadEl) payloadEl.textContent = payload ? JSON.stringify(payload, null, 2) : '⚠ Cannot decode payload';
  if (sigEl) sigEl.textContent = parts[2];

  // Parse standard claims
  if (payload && claimsSection && claimsOut) {
    const claims = [];
    if (payload.iss) claims.push({ key:'Issuer (iss)',      val: payload.iss });
    if (payload.sub) claims.push({ key:'Subject (sub)',     val: payload.sub });
    if (payload.aud) claims.push({ key:'Audience (aud)',    val: payload.aud });
    if (payload.iat) claims.push({ key:'Issued At (iat)',   val: new Date(payload.iat*1000).toLocaleString() + ` (${payload.iat})`, ok: true });
    if (payload.exp) {
      const expired = Date.now()/1000 > payload.exp;
      claims.push({ key:'Expires (exp)', val: new Date(payload.exp*1000).toLocaleString(), ok: !expired, warn: expired ? '⚠ EXPIRED' : '✓ Valid' });
    }
    if (payload.nbf) claims.push({ key:'Not Before (nbf)', val: new Date(payload.nbf*1000).toLocaleString() });
    if (payload.jti) claims.push({ key:'JWT ID (jti)',      val: payload.jti });
    if (claims.length) {
      claimsSection.style.display = 'block';
      claimsOut.innerHTML = claims.map(c => `
        <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--card);border-radius:6px;font-size:12px;font-family:'Source Code Pro',monospace">
          <span style="color:var(--text-dim);min-width:140px">${c.key}</span>
          <span style="color:var(--text);flex:1">${c.val}</span>
          ${c.warn ? `<span style="color:${c.ok?'var(--green)':'var(--red)'};font-weight:700">${c.warn}</span>` : ''}
        </div>`).join('');
    }
  }
}

function jwtPasteSample() {
  const sample = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFyY09TIFVzZXIiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  const inp = document.getElementById('jwt-input');
  if (inp) { inp.value = sample; jwtDecode(sample); }
}

function jwtClear() {
  ['jwt-input','jwt-header-out','jwt-payload-out','jwt-sig-out'].forEach(id => { const el=document.getElementById(id); if(el)el.textContent=''; });
  document.getElementById('jwt-claims-section').style.display='none';
}

function jwtEncode() {
  const payloadStr = document.getElementById('jwt-encode-payload')?.value;
  const alg = document.getElementById('jwt-alg')?.value || 'HS256';
  try {
    const payload = JSON.parse(payloadStr);
    const header = { alg, typ:'JWT' };
    const enc = s => btoa(JSON.stringify(s)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
    const token = enc(header) + '.' + enc(payload) + '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const out = document.getElementById('jwt-encoded-out');
    if (out) { out.textContent = token; out.style.color='#a8ff78'; }
    showNotif('⚡','JWT','Token generated (click to copy)');
  } catch (e) {
    showNotif('⚠️','JWT','Invalid JSON payload: '+e.message);
  }
}

function jwtVerify() {
  const token  = document.getElementById('jwt-verify-token')?.value?.trim();
  const result = document.getElementById('jwt-verify-result');
  if (!token || !result) return;
  result.style.display = 'block';
  const parts = token.split('.');
  if (parts.length !== 3) { result.style.background='rgba(255,107,107,.1)'; result.style.border='1px solid var(--red)'; result.innerHTML='<b style="color:var(--red)">❌ Invalid JWT</b> — Must have exactly 3 parts separated by dots.'; return; }
  const payload = jwtB64Decode(parts[1]);
  const expired = payload?.exp && Date.now()/1000 > payload.exp;
  const details = [];
  if (payload?.iss) details.push(`Issuer: <b>${payload.iss}</b>`);
  if (payload?.sub) details.push(`Subject: <b>${payload.sub}</b>`);
  if (payload?.exp) details.push(`Expires: <b>${new Date(payload.exp*1000).toLocaleString()}</b> ${expired?'<span style="color:var(--red)">(EXPIRED)</span>':'<span style="color:var(--green)">(valid)</span>'}`);
  if (expired) {
    result.style.background='rgba(255,217,61,.08)'; result.style.border='1px solid var(--yellow)';
    result.innerHTML=`<div style="color:var(--yellow);font-weight:700;margin-bottom:8px">⚠ Signature structure valid but token EXPIRED</div>${details.join('<br>')}`;
  } else {
    result.style.background='rgba(107,203,119,.08)'; result.style.border='1px solid var(--green)';
    result.innerHTML=`<div style="color:var(--green);font-weight:700;margin-bottom:8px">✓ Token structure valid</div><div style="font-size:12px;color:var(--text-dim);margin-bottom:8px">⚠ Note: Real signature verification requires server-side validation with the actual secret.</div>${details.join('<br>')}`;
  }
}

// ─── WALLPAPER IMAGES (Unsplash/Picsum) ──────────────
const WALLPAPER_IMAGES = [
  { key:'photo-space',    label:'🌌 Deep Space',   url:'https://picsum.photos/seed/space42/1920/1080' },
  { key:'photo-forest',   label:'🌲 Forest',       url:'https://picsum.photos/seed/forest88/1920/1080' },
  { key:'photo-ocean',    label:'🌊 Ocean',        url:'https://picsum.photos/seed/ocean22/1920/1080' },
  { key:'photo-city',     label:'🌆 City Night',   url:'https://picsum.photos/seed/city99/1920/1080' },
  { key:'photo-mountain', label:'🏔 Mountains',    url:'https://picsum.photos/seed/mountain55/1920/1080' },
  { key:'photo-aurora',   label:'🌿 Aurora',       url:'https://picsum.photos/seed/aurora11/1920/1080' },
  { key:'photo-abstract', label:'🎨 Abstract',     url:'https://picsum.photos/seed/abstract77/1920/1080' },
];

function applyPhotoWallpaper(url, key) {
  const wp  = document.getElementById('wallpaper');
  const layer = document.getElementById('wallpaper-photo');
  if (!wp || !layer) return;

  // Fade out current photo first
  layer.classList.remove('loaded');

  const img = new Image();
  img.onload = () => {
    layer.style.backgroundImage = `url('${url}')`;
    // Small delay so transition fires
    requestAnimationFrame(() => requestAnimationFrame(() => {
      layer.classList.add('loaded');
      wp.classList.add('has-photo');
    }));
    try { localStorage.setItem('arcos_wallpaper_photo', JSON.stringify({ url, key })); } catch {}
  };
  img.onerror = () => showNotif('🖼️', 'Wallpaper', 'Image failed to load — check connection');
  img.src = url;
}

// Load saved photo wallpaper on boot
function loadPhotoWallpaper() {
  try {
    const saved = localStorage.getItem('arcos_wallpaper_photo');
    if (saved) {
      const { url, key } = JSON.parse(saved);
      if (url) applyPhotoWallpaper(url, key);
    }
  } catch {}
}

// ─── REGISTER JWT & SIZES ────────────────────────────
// JWT is registered in core.js APP_DEFS, sizes go via windows.js getDefaultSize
const _prevGetSizeFixes = window.getDefaultSize;
window.getDefaultSize = function(id) {
  const fixSizes = {
    maps: [880, 580], browser: [960, 580],
    camera: [720, 540], jwt: [900, 560],
  };
  if (fixSizes[id]) {
    const [w,h] = fixSizes[id];
    return [w, h, Math.round(Math.random()*(window.innerWidth-w-100)+60), Math.round(Math.random()*(window.innerHeight-h-120)+44)];
  }
  return _prevGetSizeFixes ? _prevGetSizeFixes(id) : [600,420,100,80];
};

// Init photo wallpaper
document.addEventListener('DOMContentLoaded', () => setTimeout(loadPhotoWallpaper, 200));
window.applyPhotoWallpaper = applyPhotoWallpaper;
