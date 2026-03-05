/* ═══════════════════════════════════════
   ArcOS — Media Apps: Camera, Music, YouTube, Image Viewer
═══════════════════════════════════════ */

// ─── CAMERA ──────────────────────────────────────────────
let cameraStream = null;
function buildCamera() {
  return `<div id="camera-content">
    <div id="camera-preview">
      <video id="camera-video" autoplay muted playsinline></video>
      <canvas id="camera-canvas" style="display:none"></canvas>
      <div id="camera-overlay" style="position:absolute;inset:0;pointer-events:none;transition:background .1s"></div>
    </div>
    <div style="padding:8px 12px;background:var(--win-bar);border-top:1px solid var(--border)">
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <span style="font-size:11px;color:var(--text-dim);align-self:center">Filter: </span>
        ${['Normal','B&W','Sepia','Vivid','Invert','Blur','Pop'].map((f,i) =>
          `<button class="filter-btn${i===0?' active':''}" onclick="setCamFilter(['none','grayscale(100%)','sepia(80%)','hue-rotate(90deg)','invert(80%)','blur(2px)','contrast(150%) saturate(150%)'][${i}],this)">${f}</button>`
        ).join('')}
      </div>
    </div>
    <div id="camera-controls">
      <div style="display:flex;gap:6px">
        <button class="cam-btn active" onclick="toggleMirror()">🪞 Mirror</button>
        <button class="cam-btn" onclick="resetCamFilters()">Reset</button>
      </div>
      <button id="camera-shutter" onclick="takePhoto()"></button>
      <div id="camera-photos"></div>
    </div>
  </div>`;
}
function initCamera() {
  navigator.mediaDevices?.getUserMedia({ video:true, audio:false })
    .then(s => { cameraStream = s; const v = document.getElementById('camera-video'); if (v) v.srcObject = s; })
    .catch(() => showNotif('📷', 'Camera', 'Camera access denied'));
}
function stopCamera() { cameraStream?.getTracks().forEach(t => t.stop()); }
function setCamFilter(f, btn) {
  const v = document.getElementById('camera-video'); if (v) v.style.filter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
}
function resetCamFilters() {
  const v = document.getElementById('camera-video'); if (v) v.style.filter = 'none';
  document.querySelectorAll('.filter-btn')[0]?.classList.add('active');
  document.querySelectorAll('.filter-btn').forEach((b, i) => { if (i !== 0) b.classList.remove('active'); });
}
function toggleMirror() {
  const v = document.getElementById('camera-video');
  if (v) v.style.transform = v.style.transform.includes('scaleX(-1)') ? '' : 'scaleX(-1)';
}
function takePhoto() {
  const v = document.getElementById('camera-video');
  const canvas = document.createElement('canvas');
  if (!v || !v.videoWidth) { showNotif('📷', 'Camera', 'No camera feed'); return; }
  canvas.width = v.videoWidth; canvas.height = v.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.filter = v.style.filter || 'none';
  if (v.style.transform.includes('scaleX(-1)')) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
  ctx.drawImage(v, 0, 0);
  const url = canvas.toDataURL('image/png');
  const photos = document.getElementById('camera-photos');
  if (photos) {
    const img = document.createElement('img');
    img.className = 'cam-thumb'; img.src = url; img.title = 'Click to download';
    img.onclick = () => { const a = document.createElement('a'); a.href = url; a.download = 'photo_' + Date.now() + '.png'; a.click(); };
    photos.appendChild(img);
  }
  const ov = document.getElementById('camera-overlay');
  if (ov) { ov.style.background = 'rgba(255,255,255,.9)'; setTimeout(() => ov.style.background = 'transparent', 100); }
  showNotif('📷', 'Photo taken', 'Click thumbnail to download');
}

// ─── MUSIC PLAYER ──────────────────────────────────────
const musicTracks = [
  { title:'Cosmic Journey', artist:'ArcOS Sounds', emoji:'🌌', hue:240 },
  { title:'Neon Pulse',     artist:'Synthwave',    emoji:'💜', hue:280 },
  { title:'Digital Rain',  artist:'Chill Bits',   emoji:'💚', hue:160 },
  { title:'Orbit',         artist:'Space Audio',  emoji:'🔵', hue:200 },
  { title:'Terminal Beat', artist:'Hacker Vibes', emoji:'🟡', hue:45  },
];
let musicIdx = 0, musicPlaying = false, musicProgress = 0, musicTimer = null;
let audioCtx = null;

function buildMusic() {
  return `<div id="music-content">
    <div id="music-art" style="background:linear-gradient(135deg,hsl(240,70%,55%),hsl(280,70%,65%))">🌌</div>
    <div id="music-title" style="font-size:17px;font-weight:700;text-align:center">Cosmic Journey</div>
    <div id="music-artist" style="color:var(--text-dim);font-size:13px">ArcOS Sounds</div>
    <div style="font-size:11px;color:var(--text-dim);text-align:center;background:rgba(94,129,244,.1);border:1px solid rgba(94,129,244,.2);border-radius:8px;padding:6px 12px;max-width:280px">
      🎵 Generative ambient music — synthesized tones.<br>Drag & drop an MP3 to play real audio.
    </div>
    <div style="display:flex;align-items:center;gap:8px;width:100%;max-width:280px">
      <span id="music-cur" style="font-size:11px;color:var(--text-dim)">0:00</span>
      <input id="music-seek" type="range" min="0" max="100" value="0" oninput="musicSeek(this.value)">
      <span id="music-dur" style="font-size:11px;color:var(--text-dim)">3:00</span>
    </div>
    <div id="music-controls" style="display:flex;align-items:center;gap:12px">
      <button class="music-btn" onclick="musicPrev()">⏮</button>
      <button class="music-btn" onclick="musicShuffle()">🔀</button>
      <button class="music-btn play-btn" id="music-play" onclick="toggleMusic()">▶</button>
      <button class="music-btn" onclick="musicRepeat()">🔁</button>
      <button class="music-btn" onclick="musicNext()">⏭</button>
    </div>
    <div style="width:100%;max-width:280px">
      <input type="file" id="music-file-input" accept="audio/*" multiple style="display:none" onchange="loadMusicFile(this)">
      <button onclick="document.getElementById('music-file-input').click()" style="width:100%;background:var(--card);border:1px dashed var(--border);color:var(--text-dim);padding:7px;border-radius:8px;cursor:pointer;font-size:12px;font-family:inherit">📂 Open MP3 / Audio File</button>
    </div>
    <div class="music-list" id="music-list" style="width:100%;max-width:280px;max-height:130px;overflow-y:auto">
      ${musicTracks.map((t, i) => `<div class="music-track${i===0?' active':''}" onclick="playTrack(${i})"><span style="font-size:16px">${t.emoji}</span>${t.title}<span style="margin-left:auto;color:var(--text-dim);font-size:11px">3:00</span></div>`).join('')}
    </div>
  </div>`;
}
function initMusic() {}
function toggleMusic() {
  musicPlaying = !musicPlaying;
  const art = document.getElementById('music-art');
  const btn = document.getElementById('music-play');
  if (art) art.classList.toggle('playing', musicPlaying);
  if (btn) btn.textContent = musicPlaying ? '⏸' : '▶';
  if (musicPlaying) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    stopAudio();
    const track = musicTracks[musicIdx];
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220 + track.hue, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.07, audioCtx.currentTime);
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440 + track.hue / 2, audioCtx.currentTime);
    gain2.gain.setValueAtTime(0.03, audioCtx.currentTime);
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 0.5; lfoGain.gain.value = 30;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency); lfo.start();
    osc2.connect(gain2); gain2.connect(audioCtx.destination); osc2.start();
    osc.connect(gain); gain.connect(audioCtx.destination); osc.start();
    window._audioNodes = [osc, osc2, lfo];
    musicTimer = setInterval(() => {
      musicProgress = Math.min(100, musicProgress + 100 / 180);
      const sk = document.getElementById('music-seek'); if (sk) sk.value = musicProgress;
      const cur = Math.floor(musicProgress / 100 * 180);
      const cc = document.getElementById('music-cur');
      if (cc) cc.textContent = Math.floor(cur / 60) + ':' + String(cur % 60).padStart(2, '0');
      if (musicProgress >= 100) musicNext();
    }, 1000);
  } else { stopAudio(); clearInterval(musicTimer); }
}
function stopAudio() {
  if (window._audioNodes) window._audioNodes.forEach(n => { try { n.stop(); } catch (e) {} });
  window._audioNodes = [];
}
function musicSeek(v) { musicProgress = Number(v); }
function musicNext() { musicProgress = 0; musicIdx = (musicIdx + 1) % musicTracks.length; loadTrack(); if (musicPlaying) { stopAudio(); clearInterval(musicTimer); musicPlaying = false; toggleMusic(); } }
function musicPrev() { musicProgress = 0; musicIdx = (musicIdx - 1 + musicTracks.length) % musicTracks.length; loadTrack(); }
function playTrack(i) { musicIdx = i; musicProgress = 0; loadTrack(); if (!musicPlaying) toggleMusic(); }
function musicShuffle() { musicIdx = Math.floor(Math.random() * musicTracks.length); loadTrack(); }
function musicRepeat() { musicProgress = 0; }
function loadTrack() {
  const t = musicTracks[musicIdx];
  const art = document.getElementById('music-art');
  const tl  = document.getElementById('music-title');
  const al  = document.getElementById('music-artist');
  if (art) { art.style.background = `linear-gradient(135deg,hsl(${t.hue},70%,45%),hsl(${t.hue+50},70%,60%))`; art.textContent = t.emoji; }
  if (tl) tl.textContent = t.title;
  if (al) al.textContent = t.artist;
  document.querySelectorAll('.music-track').forEach((el, i) => el.classList.toggle('active', i === musicIdx));
}
function loadMusicFile(input) {
  const files = Array.from(input.files); if (!files.length) return;
  files.forEach(file => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    const idx = musicTracks.push({ title:file.name.replace(/\.[^.]+$/, ''), artist:'Local File', emoji:'🎵', hue:Math.floor(Math.random()*360), _audio:audio }) - 1;
    const list = document.getElementById('music-list');
    if (list) {
      const div = document.createElement('div');
      div.className = 'music-track';
      div.innerHTML = `<span style="font-size:16px">🎵</span>${musicTracks[idx].title}<span style="margin-left:auto;color:var(--text-dim);font-size:11px">MP3</span>`;
      div.onclick = () => playLocalTrack(idx);
      list.appendChild(div);
    }
  });
  showNotif('🎵', 'Music Loaded', files.length + ' file(s) added');
}
function playLocalTrack(idx) {
  stopAudio(); if (musicTimer) clearInterval(musicTimer);
  const t = musicTracks[idx]; if (!t._audio) return;
  musicIdx = idx; loadTrack();
  const btn = document.getElementById('music-play');
  const art = document.getElementById('music-art');
  musicPlaying = true; if (btn) btn.textContent = '⏸'; if (art) art.classList.add('playing');
  t._audio.play();
  t._audio.ontimeupdate = () => {
    if (!t._audio.duration) return;
    const p = (t._audio.currentTime / t._audio.duration) * 100;
    musicProgress = p;
    const sk = document.getElementById('music-seek'); if (sk) sk.value = p;
    const cur = Math.floor(t._audio.currentTime);
    const cc = document.getElementById('music-cur'); if (cc) cc.textContent = Math.floor(cur/60) + ':' + String(cur%60).padStart(2,'0');
  };
  t._audio.onended = () => musicNext();
}

// ─── YOUTUBE ────────────────────────────────────────────
let ytApiKey = '';
function buildYoutube() {
  return `<div id="yt-content">
    <div id="yt-header">
      <svg width="28" height="20" viewBox="0 0 28 20"><rect width="28" height="20" rx="5" fill="#ff0000"/><polygon points="11,5 21,10 11,15" fill="white"/></svg>
      <span style="font-size:16px;font-weight:800;color:#fff;letter-spacing:-.5px">YouTube</span>
      <input id="yt-search-input" type="text" placeholder="🔍  Search YouTube…" onkeydown="if(event.key==='Enter')ytSearch(this.value)">
      <button id="yt-search-btn" onclick="ytSearch(document.getElementById('yt-search-input').value)">Search</button>
    </div>
    <div id="yt-api-key-row">
      <span style="font-size:11px;color:#666">YouTube API Key:</span>
      <input id="yt-api-key" type="password" placeholder="AIza… (optional — for full search)">
      <button id="yt-key-save" onclick="ytSaveKey()">Save Key</button>
    </div>
    <div id="yt-categories">
      ${['🔥 Trending','💻 Tech','🎵 Music','🎮 Gaming','📚 Education'].map((c,i) => `<button class="yt-cat-btn${i===0?' active':''}" onclick="ytLoadCategory('${c}',this)">${c}</button>`).join('')}
    </div>
    <div id="yt-body">
      <div id="yt-player-col">
        <div id="yt-iframe-wrap">
          <div id="yt-placeholder" style="text-align:center;color:#555;padding:30px">
            <div style="font-size:48px;margin-bottom:8px">▶</div>
            <div style="font-size:14px">Select a video to play</div>
          </div>
        </div>
        <div id="yt-video-info" style="display:none">
          <div id="yt-video-title"></div>
          <div id="yt-video-meta"></div>
        </div>
      </div>
      <div id="yt-results-col">
        <div id="yt-results-inner" style="padding:8px">
          <div style="font-size:11px;color:#666;margin-bottom:8px;padding:0 2px">SUGGESTED</div>
          <div id="yt-results-list"></div>
        </div>
      </div>
    </div>
  </div>`;
}
const YT_CURATED = [
  { id:'dQw4w9WgXcQ', title:'Rick Astley — Never Gonna Give You Up', channel:'Rick Astley', thumb:'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { id:'jNQXAC9IVRw', title:'Me at the zoo (first YouTube video)',     channel:'jawed',      thumb:'https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg' },
  { id:'9bZkp7q19f0', title:'PSY — GANGNAM STYLE',                    channel:'officialpsy', thumb:'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg' },
  { id:'kJQP7kiw5Fk', title:'Luis Fonsi — Despacito',                 channel:'LuisFonsiVEVO', thumb:'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg' },
  { id:'OPf0YbXqDm0', title:'Mark Ronson — Uptown Funk',              channel:'MarkRonsonVEVO', thumb:'https://img.youtube.com/vi/OPf0YbXqDm0/mqdefault.jpg' },
  { id:'JGwWNGJdvx8', title:'Ed Sheeran — Shape of You',              channel:'EdSheeranVEVO', thumb:'https://img.youtube.com/vi/JGwWNGJdvx8/mqdefault.jpg' },
  { id:'hT_nvWreIhg', title:'OneRepublic — Counting Stars',           channel:'OneRepublicVEVO', thumb:'https://img.youtube.com/vi/hT_nvWreIhg/mqdefault.jpg' },
];
function initYoutube() { showYtSuggested(YT_CURATED); }
function ytSaveKey() {
  const k = document.getElementById('yt-api-key').value.trim();
  if (k) { ytApiKey = k; showNotif('🔑', 'API Key Saved', 'YouTube search enabled!'); }
  else showNotif('⚠️', 'No Key', 'Please paste your API key');
}
function showYtSuggested(videos) {
  const list = document.getElementById('yt-results-list'); if (!list) return;
  list.innerHTML = videos.map(v =>
    `<div class="yt-result" onclick="ytPlay('${v.id}','${v.title.replace(/'/g,"\\'")}','${v.channel}')">
      <img class="yt-thumb" src="${v.thumb}" onerror="this.style.background='#333'" alt="">
      <div><div class="yt-result-title">${v.title}</div><div class="yt-result-ch">${v.channel}</div></div>
    </div>`
  ).join('');
}
function ytPlay(id, title, channel) {
  const wrap = document.getElementById('yt-iframe-wrap');
  const ph   = document.getElementById('yt-placeholder');
  const info = document.getElementById('yt-video-info');
  if (!wrap) return;
  if (ph) ph.style.display = 'none';
  const old = wrap.querySelector('iframe'); if (old) old.remove();
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
  iframe.style.cssText = 'width:100%;height:100%;border:none;min-height:200px;';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  wrap.appendChild(iframe);
  if (info) { info.style.display = 'block'; document.getElementById('yt-video-title').textContent = title; document.getElementById('yt-video-meta').textContent = channel; }
}
async function ytSearch(q) {
  if (!q) return;
  if (!ytApiKey) {
    const results = YT_CURATED.filter(v => v.title.toLowerCase().includes(q.toLowerCase()) || v.channel.toLowerCase().includes(q.toLowerCase()));
    showYtSuggested(results.length ? results : YT_CURATED);
    showNotif('🔑', 'Add API Key', 'Showing curated results. Add a YouTube Data API v3 key for full search.');
    return;
  }
  showNotif('🔍', 'Searching', 'Searching YouTube…');
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(q)}&type=video&key=${ytApiKey}`);
    const data = await res.json();
    if (data.error) { showNotif('⚠️', 'API Error', data.error.message.slice(0, 60)); return; }
    const videos = data.items.map(item => ({ id:item.id.videoId, title:item.snippet.title, channel:item.snippet.channelTitle, thumb:item.snippet.thumbnails.medium?.url || '' }));
    showYtSuggested(videos);
    showNotif('✅', 'Search Done', `${videos.length} results`);
  } catch (e) { showNotif('⚠️', 'Search Error', 'Check API key'); }
}
function ytLoadCategory(cat, btn) {
  document.querySelectorAll('.yt-cat-btn').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  showYtSuggested(YT_CURATED.slice(0, 5 + Math.floor(Math.random() * 3)));
}

// ─── IMAGE VIEWER ─────────────────────────────────────
let imgZoom = 1, imgRotDeg = 0, imgFlipX = false;
function buildImgViewer() {
  return `<div id="imgviewer-content">
    <div id="imgviewer-main">
      <div style="text-align:center;color:var(--text-dim);padding:24px">
        <div style="font-size:52px;margin-bottom:12px">🖼️</div>
        <div>Drop an image here or click Open</div>
        <input type="file" accept="image/*" id="img-file-input" style="display:none" onchange="loadImgFile(this)">
        <button onclick="document.getElementById('img-file-input').click()" style="margin-top:12px;background:var(--accent);border:none;color:#fff;padding:8px 20px;border-radius:8px;cursor:pointer;font-size:13px;font-family:inherit">Open Image</button>
      </div>
    </div>
    <div id="imgviewer-bar">
      <button class="viewer-btn" onclick="imgZoomIn()"   title="Zoom In">+</button>
      <button class="viewer-btn" onclick="imgZoomOut()"  title="Zoom Out">−</button>
      <button class="viewer-btn" onclick="imgReset()"    title="Reset">⊡</button>
      <button class="viewer-btn" onclick="imgRotate()"   title="Rotate">↻</button>
      <button class="viewer-btn" onclick="imgFlipImg()"  title="Flip">⇄</button>
      <span id="img-zoom-label" style="font-size:12px;color:var(--text-dim);margin:0 8px">100%</span>
    </div>
  </div>`;
}
function loadImgFile(input) {
  const f = input.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = e => {
    const m = document.getElementById('imgviewer-main'); if (!m) return;
    m.innerHTML = `<img id="imgviewer-img" src="${e.target.result}" style="max-width:100%;max-height:100%;object-fit:contain;transition:transform .2s">`;
    imgZoom = 1; imgRotDeg = 0; imgFlipX = false;
    document.getElementById('img-zoom-label').textContent = '100%';
  };
  r.readAsDataURL(f);
}
function updateImgTransform() {
  const img = document.getElementById('imgviewer-img'); if (!img) return;
  img.style.transform = `scale(${imgZoom}) rotate(${imgRotDeg}deg) scaleX(${imgFlipX ? -1 : 1})`;
  document.getElementById('img-zoom-label').textContent = Math.round(imgZoom * 100) + '%';
}
function imgZoomIn()  { imgZoom = Math.min(5, imgZoom + 0.25); updateImgTransform(); }
function imgZoomOut() { imgZoom = Math.max(0.2, imgZoom - 0.25); updateImgTransform(); }
function imgReset()   { imgZoom = 1; imgRotDeg = 0; imgFlipX = false; updateImgTransform(); }
function imgRotate()  { imgRotDeg = (imgRotDeg + 90) % 360; updateImgTransform(); }
function imgFlipImg() { imgFlipX = !imgFlipX; updateImgTransform(); }
