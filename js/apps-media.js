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
// ╔══════════════════════════════════════════════════════╗
// ║  TO ADD YOUR OWN SONGS — edit the `src` field below ║
// ║  Paste any direct MP3/audio URL (must end in .mp3   ║
// ║  or be a direct stream link, not a webpage link).   ║
// ║  Cover art: any image URL (square looks best).      ║
// ║  Example sources: archive.org, pixabay.com/music,   ║
// ║  freemusicarchive.org, soundcloud (direct link)     ║
// ╚══════════════════════════════════════════════════════╝
const musicTracks = [  {
    title:  'Winter 4 ever',
    artist: 'Baby Jane',
    cover:  'https://i.ytimg.com/vi/J3DfTc-nQ6U/0.jpg',
    src:    'songs/Baby Jane - winter 4ever (Official Audio) - Baby Jane.mp3',
    color:  ['#48cfad','#3dbda7'],
  },
  {
    title:  'Love Story',
    artist: 'Taylor Swift',
    cover:  'https://i.ytimg.com/vi/8xg3vE8Ie_E/0.jpg',
    src:    'songs/Taylor Swift - Love Story - Taylor Swift.mp3',
    color:  ['#5e81f4','#c77dff'],
  },

  {
    title:  ' Starry Eyed',
    artist: 'Baby Jane',
    cover:  'https://i.ytimg.com/vi/A7AiISHcA8A/0.jpg',
    src:    'songs/Baby Jane - Starry Eyed (Official Video) - Baby Jane.mp3',
    color:  ['#ff6b6b','#f06595'],
  },
];

let musicIdx = 0, musicPlaying = false, musicProgress = 0;
let _currentAudio = null;

function buildMusic() {
  const t = musicTracks[0];
  return `<div id="music-content">
    <!-- Album art -->
    <div id="music-art" style="background:linear-gradient(135deg,${t.color[0]},${t.color[1]})">
      <img id="music-art-img" src="${t.cover}" style="width:100%;height:100%;object-fit:cover;border-radius:18px" onerror="this.style.display='none'">
    </div>

    <!-- Track info -->
    <div style="text-align:center;width:100%">
      <div id="music-title" style="font-size:18px;font-weight:800;margin-bottom:3px">${t.title}</div>
      <div id="music-artist" style="color:var(--text-dim);font-size:13px">${t.artist}</div>
    </div>

    <!-- Seek bar -->
    <div style="display:flex;align-items:center;gap:10px;width:100%;max-width:300px">
      <span id="music-cur" style="font-size:11px;color:var(--text-dim);min-width:34px">0:00</span>
      <input id="music-seek" type="range" min="0" max="100" value="0" style="flex:1;accent-color:var(--accent);cursor:pointer" oninput="musicSeek(this.value)">
      <span id="music-dur" style="font-size:11px;color:var(--text-dim);min-width:34px;text-align:right">0:00</span>
    </div>

    <!-- Controls -->
    <div style="display:flex;align-items:center;gap:16px">
      <button class="music-btn" onclick="musicPrev()" title="Previous">⏮</button>
      <button class="music-btn" id="music-shuffle-btn" onclick="musicToggleShuffle()" title="Shuffle" style="font-size:18px;opacity:.5">🔀</button>
      <button class="music-btn play-btn" id="music-play" onclick="toggleMusic()">▶</button>
      <button class="music-btn" id="music-repeat-btn" onclick="musicToggleRepeat()" title="Repeat" style="font-size:18px;opacity:.5">🔁</button>
      <button class="music-btn" onclick="musicNext()" title="Next">⏭</button>
    </div>

    <!-- Volume -->
    <div style="display:flex;align-items:center;gap:8px;width:100%;max-width:300px">
      <span style="font-size:14px">🔈</span>
      <input type="range" min="0" max="100" value="80" id="music-vol" style="flex:1;accent-color:var(--accent);cursor:pointer" oninput="musicSetVol(this.value)">
      <span style="font-size:14px">🔊</span>
    </div>

    <!-- File upload -->
    <div style="width:100%;max-width:300px">
      <input type="file" id="music-file-input" accept="audio/*" multiple style="display:none" onchange="loadMusicFile(this)">
      <button onclick="document.getElementById('music-file-input').click()"
        style="width:100%;background:var(--card);border:1px dashed var(--border);color:var(--text-dim);padding:8px;border-radius:10px;cursor:pointer;font-size:12px;font-family:inherit;transition:all .15s"
        onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
        📂 Add MP3 / Audio File
      </button>
    </div>

    <!-- Playlist -->
    <div class="music-list" id="music-list" style="width:100%;max-width:300px;flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:2px">
      ${musicTracks.map((t, i) => `
        <div class="music-track${i===0?' active':''}" onclick="playTrack(${i})" id="mtrack-${i}">
          <div style="width:38px;height:38px;border-radius:8px;flex-shrink:0;overflow:hidden;background:linear-gradient(135deg,${t.color[0]},${t.color[1]})">
            <img src="${t.cover}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.title}</div>
            <div style="font-size:10px;color:var(--text-dim)">${t.artist}</div>
          </div>
          <span id="mtrack-dur-${i}" style="font-size:11px;color:var(--text-dim);flex-shrink:0">—:——</span>
        </div>`).join('')}
    </div>
  </div>`;
}

let _musicShuffle = false, _musicRepeat = false;

function initMusic() {
  // Pre-load duration for each track
  musicTracks.forEach((t, i) => {
    if (t.src) {
      const a = new Audio();
      a.preload = 'metadata';
      a.src = t.src;
      a.onloadedmetadata = () => {
        t._duration = a.duration;
        const el = document.getElementById(`mtrack-dur-${i}`);
        if (el) el.textContent = fmtTime(a.duration);
        if (i === 0) { const d = document.getElementById('music-dur'); if (d) d.textContent = fmtTime(a.duration); }
      };
    }
  });
}

function fmtTime(s) {
  if (!s || isNaN(s)) return '—:——';
  return Math.floor(s/60) + ':' + String(Math.floor(s%60)).padStart(2,'0');
}

function toggleMusic() {
  if (_currentAudio && !_currentAudio.paused) {
    _currentAudio.pause();
    musicPlaying = false;
  } else {
    if (!_currentAudio || _currentAudio.ended) {
      _loadAndPlay(musicIdx);
      return;
    }
    _currentAudio.play().catch(() => _loadAndPlay(musicIdx));
    musicPlaying = true;
  }
  const btn = document.getElementById('music-play');
  if (btn) btn.innerHTML = musicPlaying ? '⏸' : '▶';
}

function _loadAndPlay(idx) {
  if (_currentAudio) { _currentAudio.pause(); _currentAudio.src = ''; }
  const t = musicTracks[idx];
  if (!t) return;
  _currentAudio = new Audio(t.src || t._url || '');
  _currentAudio.volume = (document.getElementById('music-vol')?.value || 80) / 100;
  _currentAudio.play().then(() => {
    musicPlaying = true;
    const btn = document.getElementById('music-play');
    if (btn) btn.innerHTML = '⏸';
  }).catch(err => {
    showNotif('🎵','Music','Could not load audio — try adding your own MP3');
    musicPlaying = false;
  });
  _currentAudio.ontimeupdate = () => {
    if (!_currentAudio.duration) return;
    const p = (_currentAudio.currentTime / _currentAudio.duration) * 100;
    const sk = document.getElementById('music-seek');
    const cc = document.getElementById('music-cur');
    const cd = document.getElementById('music-dur');
    if (sk) sk.value = p;
    if (cc) cc.textContent = fmtTime(_currentAudio.currentTime);
    if (cd) cd.textContent = fmtTime(_currentAudio.duration);
  };
  _currentAudio.onended = () => {
    if (_musicRepeat) { _currentAudio.currentTime=0; _currentAudio.play(); return; }
    if (_musicShuffle) { musicIdx = Math.floor(Math.random()*musicTracks.length); }
    else { musicIdx = (musicIdx+1) % musicTracks.length; }
    _loadAndPlay(musicIdx);
  };
  loadTrack(idx);
}

function musicSeek(v) {
  if (_currentAudio) _currentAudio.currentTime = (_currentAudio.duration || 0) * v / 100;
}
function musicSetVol(v) { if (_currentAudio) _currentAudio.volume = v/100; }
function musicNext() {
  musicIdx = _musicShuffle ? Math.floor(Math.random()*musicTracks.length) : (musicIdx+1) % musicTracks.length;
  _loadAndPlay(musicIdx);
}
function musicPrev() {
  if (_currentAudio && _currentAudio.currentTime > 3) { _currentAudio.currentTime=0; return; }
  musicIdx = (musicIdx-1+musicTracks.length) % musicTracks.length;
  _loadAndPlay(musicIdx);
}
function playTrack(i) { musicIdx=i; _loadAndPlay(i); }
function musicToggleShuffle() {
  _musicShuffle = !_musicShuffle;
  const btn = document.getElementById('music-shuffle-btn');
  if (btn) btn.style.opacity = _musicShuffle ? '1' : '.5';
}
function musicToggleRepeat() {
  _musicRepeat = !_musicRepeat;
  const btn = document.getElementById('music-repeat-btn');
  if (btn) btn.style.opacity = _musicRepeat ? '1' : '.5';
}
function loadTrack(idx) {
  const t = musicTracks[idx ?? musicIdx];
  if (!t) return;
  const art   = document.getElementById('music-art');
  const artImg= document.getElementById('music-art-img');
  const tl    = document.getElementById('music-title');
  const al    = document.getElementById('music-artist');
  if (art)    art.style.background = `linear-gradient(135deg,${t.color[0]},${t.color[1]})`;
  if (artImg) { artImg.src = t.cover; artImg.style.display='block'; }
  if (tl)     tl.textContent = t.title;
  if (al)     al.textContent = t.artist;
  document.querySelectorAll('.music-track').forEach((el,i) => el.classList.toggle('active', i===(idx??musicIdx)));
}
function loadMusicFile(input) {
  const files = Array.from(input.files); if (!files.length) return;
  files.forEach(file => {
    const url = URL.createObjectURL(file);
    const cover = 'https://picsum.photos/seed/' + Math.random().toFixed(4).slice(2) + '/300/300';
    const col = ['#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0'), '#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')];
    const idx = musicTracks.push({ title:file.name.replace(/\.[^.]+$/,''), artist:'Local File', cover, src:url, _url:url, color:col }) - 1;
    const list = document.getElementById('music-list');
    if (list) {
      const div = document.createElement('div');
      div.className = 'music-track';
      div.id = `mtrack-${idx}`;
      div.innerHTML = `<div style="width:38px;height:38px;border-radius:8px;background:linear-gradient(135deg,${col[0]},${col[1]});flex-shrink:0"></div><div style="flex:1;min-width:0"><div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${musicTracks[idx].title}</div><div style="font-size:10px;color:var(--text-dim)">Local</div></div><span style="font-size:11px;color:var(--text-dim)">MP3</span>`;
      div.onclick = () => playTrack(idx);
      list.appendChild(div);
    }
  });
  showNotif('🎵','Music',files.length + ' track(s) added');
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
