/* ═══════════════════════════════════════
   ArcOS — Paint App
   Full canvas drawing with tools, layers, filters
═══════════════════════════════════════ */

let paintCtx    = null;
let paintCanvas = null;
let isPainting  = false;
let paintTool   = 'brush';
let paintColor  = '#5e81f4';
let paintSize   = 8;
let paintOpacity = 1;
let paintFill   = false;
let paintStartX = 0, paintStartY = 0;
let paintSnapshot = null;   // for shape preview
let paintHistory  = [];     // undo stack
let paintRedo     = [];     // redo stack
const PAINT_MAX_HISTORY = 30;

// ─── BUILD ─────────────────────────────────────────────
function buildPaint() {
  const tools = [
    { id:'brush',    icon:'🖌️', title:'Brush'     },
    { id:'pencil',   icon:'✏️', title:'Pencil'    },
    { id:'eraser',   icon:'⬜', title:'Eraser'    },
    { id:'fill',     icon:'🪣', title:'Fill'      },
    { id:'eyedrop',  icon:'💉', title:'Eyedropper'},
    { id:'line',     icon:'╱',  title:'Line'      },
    { id:'rect',     icon:'▭',  title:'Rectangle' },
    { id:'circle',   icon:'○',  title:'Ellipse'   },
    { id:'text',     icon:'T',  title:'Text'      },
  ];

  const palette = [
    '#000000','#ffffff','#ff6b6b','#ffd93d','#6bcb77','#5e81f4',
    '#c77dff','#48cfad','#fd79a8','#ff9f43','#a29bfe','#74b9ff',
    '#636e72','#b2bec3','#e17055','#00b894',
  ];

  return `<div id="paint-content">
    <!-- Toolbar -->
    <div id="paint-toolbar">
      <!-- Tools -->
      ${tools.map(t => `<button class="paint-tool-btn${t.id==='brush'?' active':''}" id="pt-${t.id}" title="${t.title}" onclick="setPaintTool('${t.id}')">${t.icon}</button>`).join('')}
      <div class="paint-sep"></div>

      <!-- Size -->
      <label style="font-size:11px;color:var(--text-dim)">Size</label>
      <input id="paint-size" type="range" min="1" max="60" value="8"
        style="width:70px;accent-color:var(--accent)"
        oninput="paintSize=this.value;document.getElementById('paint-size-val').textContent=this.value">
      <span id="paint-size-val" style="font-size:11px;color:var(--text-dim);min-width:18px">8</span>
      <div class="paint-sep"></div>

      <!-- Opacity -->
      <label style="font-size:11px;color:var(--text-dim)">Opacity</label>
      <input id="paint-opacity" type="range" min="5" max="100" value="100"
        style="width:60px;accent-color:var(--accent)"
        oninput="paintOpacity=this.value/100">
      <div class="paint-sep"></div>

      <!-- Color picker -->
      <input type="color" id="paint-color-picker" value="#5e81f4"
        oninput="setPaintColor(this.value)" title="Pick color">
      <div id="paint-cur-color" style="width:24px;height:24px;border-radius:6px;border:2px solid var(--border);background:#5e81f4;flex-shrink:0"></div>
      <div class="paint-sep"></div>

      <!-- Actions -->
      <button class="editor-btn" onclick="paintUndo()"  title="Undo Ctrl+Z">↩ Undo</button>
      <button class="editor-btn" onclick="paintRedo2()" title="Redo Ctrl+Y">↪ Redo</button>
      <button class="editor-btn" onclick="paintClear()" style="color:var(--red)">🗑 Clear</button>
      <button class="editor-btn" onclick="paintSave()">⬇️ Save PNG</button>
      <button class="editor-btn" onclick="paintOpenImg()">📂 Open</button>
      <input type="file" id="paint-file-input" accept="image/*" style="display:none" onchange="paintLoadImg(this)">
      <div class="paint-sep"></div>

      <!-- Filters -->
      <select id="paint-filter" class="settings-select" onchange="applyPaintFilter(this.value)">
        <option value="none">No Filter</option>
        <option value="grayscale">Grayscale</option>
        <option value="invert">Invert</option>
        <option value="sepia">Sepia</option>
        <option value="blur">Blur</option>
        <option value="sharpen">Sharpen</option>
        <option value="emboss">Emboss</option>
      </select>

      <!-- Canvas size -->
      <select class="settings-select" onchange="resizePaintCanvas(this.value)">
        <option value="800x600">800×600</option>
        <option value="1280x720">1280×720</option>
        <option value="600x600">600×600</option>
        <option value="400x400">400×400</option>
      </select>
    </div>

    <!-- Palette row -->
    <div style="display:flex;align-items:center;gap:4px;padding:5px 12px;background:rgba(0,0,0,.2);border-bottom:1px solid var(--border);flex-wrap:wrap;">
      ${palette.map(c => `<div onclick="setPaintColor('${c}')" title="${c}" style="width:18px;height:18px;border-radius:4px;background:${c};cursor:pointer;border:2px solid transparent;transition:transform .1s,border-color .1s" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform=''"></div>`).join('')}
      <span id="paint-coords" style="margin-left:auto;font-size:11px;color:var(--text-dim);font-family:'Source Code Pro',monospace">0, 0</span>
    </div>

    <!-- Canvas area -->
    <div id="paint-canvas-wrap">
      <canvas id="paint-canvas" width="800" height="540"></canvas>
    </div>

    <!-- Status bar -->
    <div style="display:flex;gap:16px;padding:4px 12px;background:var(--win-bar);border-top:1px solid var(--border);font-size:11px;color:var(--text-dim);align-items:center;">
      <span id="paint-tool-label">🖌️ Brush</span>
      <span id="paint-canvas-size">800 × 540</span>
      <span>History: <span id="paint-hist-count">0</span></span>
    </div>
  </div>`;
}

// ─── INIT ──────────────────────────────────────────────
function initPaint() {
  setTimeout(() => {
    paintCanvas = document.getElementById('paint-canvas');
    if (!paintCanvas) return;
    paintCtx = paintCanvas.getContext('2d');

    // White background
    paintCtx.fillStyle = '#ffffff';
    paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
    paintSaveHistory();

    // Events
    paintCanvas.addEventListener('mousedown',  paintStart);
    paintCanvas.addEventListener('mousemove',  paintMove);
    paintCanvas.addEventListener('mouseup',    paintEnd);
    paintCanvas.addEventListener('mouseleave', paintEnd);
    paintCanvas.addEventListener('mousemove',  paintUpdateCoords);

    // Touch support
    paintCanvas.addEventListener('touchstart', e => { e.preventDefault(); paintStart(e.touches[0]); }, { passive:false });
    paintCanvas.addEventListener('touchmove',  e => { e.preventDefault(); paintMove(e.touches[0]);  }, { passive:false });
    paintCanvas.addEventListener('touchend',   paintEnd);

    // Keyboard shortcuts
    document.addEventListener('keydown', paintKeyShortcut);
  }, 80);
}

// ─── TOOL SETUP ────────────────────────────────────────
function setPaintTool(tool) {
  paintTool = tool;
  document.querySelectorAll('.paint-tool-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`pt-${tool}`)?.classList.add('active');

  const labels = { brush:'🖌️ Brush', pencil:'✏️ Pencil', eraser:'⬜ Eraser', fill:'🪣 Fill Bucket',
                   eyedrop:'💉 Eyedropper', line:'╱ Line', rect:'▭ Rectangle', circle:'○ Ellipse', text:'T Text' };
  const lbl = document.getElementById('paint-tool-label');
  if (lbl) lbl.textContent = labels[tool] || tool;

  if (paintCanvas) paintCanvas.style.cursor = tool === 'eyedrop' ? 'crosshair' : tool === 'eraser' ? 'cell' : 'crosshair';
}

function setPaintColor(c) {
  paintColor = c;
  const cp  = document.getElementById('paint-color-picker');
  const cur = document.getElementById('paint-cur-color');
  if (cp)  cp.value = c;
  if (cur) cur.style.background = c;
}

// ─── CANVAS EVENTS ─────────────────────────────────────
function getCanvasPos(e) {
  const rect = paintCanvas.getBoundingClientRect();
  const scaleX = paintCanvas.width  / rect.width;
  const scaleY = paintCanvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY,
  };
}

function paintStart(e) {
  if (!paintCtx) return;
  const { x, y } = getCanvasPos(e);
  isPainting  = true;
  paintStartX = x; paintStartY = y;

  if (paintTool === 'fill') {
    paintFloodFill(Math.round(x), Math.round(y));
    isPainting = false;
    return;
  }
  if (paintTool === 'eyedrop') {
    const px = paintCtx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
    const hex = '#' + [px[0],px[1],px[2]].map(v => v.toString(16).padStart(2,'0')).join('');
    setPaintColor(hex);
    isPainting = false;
    return;
  }
  if (paintTool === 'text') {
    const text = prompt('Enter text:');
    if (text) {
      paintCtx.globalAlpha = paintOpacity;
      paintCtx.fillStyle   = paintColor;
      paintCtx.font        = `${Math.max(12, paintSize * 2)}px Cantarell, sans-serif`;
      paintCtx.fillText(text, x, y);
      paintCtx.globalAlpha = 1;
      paintSaveHistory();
    }
    isPainting = false;
    return;
  }

  // Snapshot for shape preview
  if (['line','rect','circle'].includes(paintTool)) {
    paintSnapshot = paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
  }

  paintCtx.beginPath();
  paintCtx.moveTo(x, y);
}

function paintMove(e) {
  if (!isPainting || !paintCtx) return;
  const { x, y } = getCanvasPos(e);

  if (['line','rect','circle'].includes(paintTool)) {
    // Restore snapshot then draw preview
    paintCtx.putImageData(paintSnapshot, 0, 0);
    paintCtx.globalAlpha   = paintOpacity;
    paintCtx.strokeStyle   = paintColor;
    paintCtx.lineWidth     = paintSize;
    paintCtx.lineCap       = 'round';
    paintCtx.lineJoin      = 'round';

    paintCtx.beginPath();
    if (paintTool === 'line') {
      paintCtx.moveTo(paintStartX, paintStartY);
      paintCtx.lineTo(x, y);
      paintCtx.stroke();
    } else if (paintTool === 'rect') {
      paintCtx.strokeRect(paintStartX, paintStartY, x - paintStartX, y - paintStartY);
    } else if (paintTool === 'circle') {
      const rx = Math.abs(x - paintStartX) / 2;
      const ry = Math.abs(y - paintStartY) / 2;
      const cx = paintStartX + (x - paintStartX) / 2;
      const cy = paintStartY + (y - paintStartY) / 2;
      paintCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      paintCtx.stroke();
    }
    paintCtx.globalAlpha = 1;
    return;
  }

  paintCtx.globalAlpha   = paintOpacity;
  paintCtx.lineWidth     = paintTool === 'eraser' ? paintSize * 2 : paintSize;
  paintCtx.lineCap       = 'round';
  paintCtx.lineJoin      = 'round';
  paintCtx.strokeStyle   = paintTool === 'eraser' ? '#ffffff' : paintColor;

  if (paintTool === 'pencil') {
    paintCtx.globalAlpha = Math.min(1, paintOpacity);
    paintCtx.lineWidth   = Math.max(1, paintSize / 3);
  }

  paintCtx.lineTo(x, y);
  paintCtx.stroke();
  paintCtx.beginPath();
  paintCtx.moveTo(x, y);
  paintCtx.globalAlpha = 1;
}

function paintEnd() {
  if (!isPainting) return;
  isPainting = false;
  paintSnapshot = null;
  paintCtx?.beginPath();
  paintSaveHistory();
}

function paintUpdateCoords(e) {
  const coords = document.getElementById('paint-coords');
  if (!coords || !paintCanvas) return;
  const { x, y } = getCanvasPos(e);
  coords.textContent = `${Math.round(x)}, ${Math.round(y)}`;
}

// ─── FLOOD FILL ────────────────────────────────────────
function paintFloodFill(startX, startY) {
  const imgData = paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
  const data    = imgData.data;
  const w       = paintCanvas.width;
  const h       = paintCanvas.height;

  const idx  = (startY * w + startX) * 4;
  const tr   = data[idx], tg = data[idx+1], tb = data[idx+2], ta = data[idx+3];

  const fc   = hexToRgb(paintColor);
  if (!fc) return;
  if (tr === fc.r && tg === fc.g && tb === fc.b) return;

  const stack = [[startX, startY]];
  const visited = new Uint8Array(w * h);

  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
    const i = cy * w + cx;
    if (visited[i]) continue;
    visited[i] = 1;
    const di = i * 4;
    if (Math.abs(data[di]-tr)>30 || Math.abs(data[di+1]-tg)>30 || Math.abs(data[di+2]-tb)>30) continue;
    data[di] = fc.r; data[di+1] = fc.g; data[di+2] = fc.b; data[di+3] = 255;
    stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
  }
  paintCtx.putImageData(imgData, 0, 0);
  paintSaveHistory();
}

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r:parseInt(r[1],16), g:parseInt(r[2],16), b:parseInt(r[3],16) } : null;
}

// ─── HISTORY ───────────────────────────────────────────
function paintSaveHistory() {
  if (!paintCtx) return;
  paintHistory.push(paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height));
  if (paintHistory.length > PAINT_MAX_HISTORY) paintHistory.shift();
  paintRedo = [];
  const lbl = document.getElementById('paint-hist-count');
  if (lbl) lbl.textContent = paintHistory.length;
}

function paintUndo() {
  if (paintHistory.length < 2) return;
  paintRedo.push(paintHistory.pop());
  paintCtx.putImageData(paintHistory[paintHistory.length - 1], 0, 0);
  const lbl = document.getElementById('paint-hist-count');
  if (lbl) lbl.textContent = paintHistory.length;
}

function paintRedo2() {
  if (!paintRedo.length) return;
  const state = paintRedo.pop();
  paintHistory.push(state);
  paintCtx.putImageData(state, 0, 0);
}

// ─── FILTERS ───────────────────────────────────────────
function applyPaintFilter(filter) {
  if (!paintCtx || filter === 'none') return;
  const w = paintCanvas.width, h = paintCanvas.height;
  const imgData = paintCtx.getImageData(0, 0, w, h);
  const d = imgData.data;

  if (filter === 'grayscale') {
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
      d[i] = d[i+1] = d[i+2] = gray;
    }
  } else if (filter === 'invert') {
    for (let i = 0; i < d.length; i += 4) { d[i]=255-d[i]; d[i+1]=255-d[i+1]; d[i+2]=255-d[i+2]; }
  } else if (filter === 'sepia') {
    for (let i = 0; i < d.length; i += 4) {
      const r=d[i],g=d[i+1],b=d[i+2];
      d[i]   = Math.min(255, r*0.393+g*0.769+b*0.189);
      d[i+1] = Math.min(255, r*0.349+g*0.686+b*0.168);
      d[i+2] = Math.min(255, r*0.272+g*0.534+b*0.131);
    }
  } else if (filter === 'blur' || filter === 'sharpen' || filter === 'emboss') {
    const kernels = {
      blur:    [ 1/9,1/9,1/9, 1/9,1/9,1/9, 1/9,1/9,1/9 ],
      sharpen: [ 0,-1,0, -1,5,-1, 0,-1,0 ],
      emboss:  [ -2,-1,0, -1,1,1, 0,1,2 ],
    };
    const kernel = kernels[filter];
    const src = new Uint8ClampedArray(d);
    for (let y = 1; y < h-1; y++) {
      for (let x = 1; x < w-1; x++) {
        const i = (y*w+x)*4;
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++)
            for (let kx = -1; kx <= 1; kx++)
              sum += src[((y+ky)*w+(x+kx))*4+c] * kernel[(ky+1)*3+(kx+1)];
          d[i+c] = Math.min(255, Math.max(0, sum + (filter==='emboss'?128:0)));
        }
      }
    }
  }

  paintCtx.putImageData(imgData, 0, 0);
  paintSaveHistory();
  // Reset select
  document.getElementById('paint-filter').value = 'none';
  showNotif('🎨', 'Filter Applied', filter);
}

// ─── CANVAS OPS ────────────────────────────────────────
function paintClear() {
  if (!paintCtx) return;
  paintCtx.fillStyle = '#ffffff';
  paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
  paintSaveHistory();
}

function paintSave() {
  if (!paintCanvas) return;
  const a = document.createElement('a');
  a.download = 'arcos-paint-' + Date.now() + '.png';
  a.href = paintCanvas.toDataURL('image/png');
  a.click();
  showNotif('⬇️', 'Saved', 'Image downloaded as PNG');
}

function paintOpenImg() { document.getElementById('paint-file-input')?.click(); }

function paintLoadImg(input) {
  const f = input.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = e => {
    const img = new Image();
    img.onload = () => {
      paintCtx.drawImage(img, 0, 0, paintCanvas.width, paintCanvas.height);
      paintSaveHistory();
      showNotif('🖼️', 'Image Loaded', f.name);
    };
    img.src = e.target.result;
  };
  r.readAsDataURL(f);
}

function resizePaintCanvas(val) {
  if (!paintCanvas || !paintCtx) return;
  const [nw, nh] = val.split('x').map(Number);
  const snapshot = paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
  paintCanvas.width  = nw;
  paintCanvas.height = nh;
  paintCtx.fillStyle = '#ffffff';
  paintCtx.fillRect(0, 0, nw, nh);
  paintCtx.putImageData(snapshot, 0, 0);
  const lbl = document.getElementById('paint-canvas-size');
  if (lbl) lbl.textContent = `${nw} × ${nh}`;
  paintSaveHistory();
}

// ─── KEYBOARD SHORTCUTS ────────────────────────────────
function paintKeyShortcut(e) {
  if (!openWindows['paint']) return;
  if (e.ctrlKey && e.key === 'z') { e.preventDefault(); paintUndo(); }
  if (e.ctrlKey && e.key === 'y') { e.preventDefault(); paintRedo2(); }
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); paintSave(); }
  // Tool shortcuts
  if (!e.ctrlKey && !e.altKey) {
    const map = { b:'brush', p:'pencil', e:'eraser', f:'fill', l:'line', r:'rect', c:'circle', i:'eyedrop', t:'text' };
    if (map[e.key]) setPaintTool(map[e.key]);
  }
}
