/* ═══════════════════════════════════════
   ArcOS — New Apps v3
   Spreadsheet · Maps · Hex Editor
   Network Scanner · Process Inspector
   Arduino IDE · Translator
   Color Picker · Unit Converter
   Password Generator · Archive Manager
   Audio Visualizer
═══════════════════════════════════════ */

// ─── SPREADSHEET ───────────────────────────────────────
function buildSpreadsheet() {
  const cols = 'ABCDEFGHIJKLMNOP'.split('');
  const rows = 30;
  return `<div id="spreadsheet-content">
    <div class="sheet-toolbar">
      <button class="editor-btn" onclick="sheetAddRow()">+ Row</button>
      <button class="editor-btn" onclick="sheetAddCol()">+ Col</button>
      <button class="editor-btn" onclick="sheetCalc()">∑ Calc</button>
      <button class="editor-btn" onclick="sheetExport()">⬇ Export CSV</button>
      <input id="sheet-formula-bar" type="text" placeholder="Formula bar — select a cell" style="flex:1;padding:5px 10px;background:rgba(255,255,255,.07);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;font-family:'Source Code Pro',monospace;outline:none;" oninput="sheetFormulaInput(this.value)">
    </div>
    <div class="sheet-wrap">
      <table class="sheet-table" id="sheet-table">
        <thead><tr>
          <th style="min-width:36px"></th>
          ${cols.map(c=>`<th>${c}</th>`).join('')}
        </tr></thead>
        <tbody id="sheet-body">
          ${Array.from({length:rows},(_,r)=>`<tr>
            <td class="sheet-row-hdr">${r+1}</td>
            ${cols.map(c=>`<td><input class="sheet-cell" id="cell-${c}${r+1}" data-cell="${c}${r+1}" onclick="sheetSelectCell('${c}${r+1}')" onblur="sheetCalc()" placeholder=""></td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}
let sheetActive = null;
function sheetSelectCell(id) {
  sheetActive = id;
  const fb = document.getElementById('sheet-formula-bar');
  const cell = document.getElementById('cell-'+id);
  if (fb && cell) fb.value = cell.dataset.formula || cell.value;
}
function sheetFormulaInput(v) {
  if (!sheetActive) return;
  const cell = document.getElementById('cell-'+sheetActive);
  if (cell) { cell.dataset.formula = v; cell.value = v; }
}
function sheetCalc() {
  document.querySelectorAll('.sheet-cell').forEach(cell => {
    const f = cell.dataset.formula || cell.value;
    if (f && f.startsWith('=')) {
      try {
        const expr = f.slice(1).replace(/([A-Z])(\d+)/g, (_,c,r) => {
          const ref = document.getElementById(`cell-${c}${r}`);
          return ref ? (parseFloat(ref.value)||0) : 0;
        });
        cell.value = Function('"use strict";return('+expr+')')();
      } catch { cell.value = '#ERR'; }
    }
  });
}
function sheetExport() {
  const rows = document.querySelectorAll('#sheet-body tr');
  const csv = Array.from(rows).map(r =>
    Array.from(r.querySelectorAll('.sheet-cell')).map(c => c.value).join(',')
  ).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'arcos-sheet.csv'; a.click();
  showNotif('⬇️','Exported','Spreadsheet saved as CSV');
}
function sheetAddRow() {
  const tbody = document.getElementById('sheet-body'); if (!tbody) return;
  const cols = 'ABCDEFGHIJKLMNOP'.split('');
  const rowNum = tbody.querySelectorAll('tr').length + 1;
  const tr = document.createElement('tr');
  tr.innerHTML = `<td class="sheet-row-hdr">${rowNum}</td>${cols.map(c=>`<td><input class="sheet-cell" id="cell-${c}${rowNum}" data-cell="${c}${rowNum}" onclick="sheetSelectCell('${c}${rowNum}')" onblur="sheetCalc()"></td>`).join('')}`;
  tbody.appendChild(tr);
}
function sheetAddCol() { showNotif('📊','Spreadsheet','Column add: reload with wider sheet'); }

// ─── MAPS ──────────────────────────────────────────────
function buildMaps() {
  return `<div id="maps-content">
    <div id="maps-search-bar">
      <span style="font-size:18px">🗺️</span>
      <input id="maps-input" type="text" placeholder="Search location…" onkeydown="if(event.key==='Enter')mapsSearch()">
      <button class="editor-btn" onclick="mapsSearch()">Search</button>
      <button class="editor-btn" onclick="mapsGo('satellite')">🛰 Satellite</button>
      <button class="editor-btn" onclick="mapsGo('street')">🗺 Street</button>
    </div>
    <iframe id="maps-frame"
      src="https://www.openstreetmap.org/export/embed.html?bbox=-0.15,51.48,0.01,51.52&layer=mapnik"
      style="flex:1;border:none;width:100%"
      allowfullscreen>
    </iframe>
  </div>`;
}
function mapsSearch() {
  const q = document.getElementById('maps-input')?.value?.trim(); if (!q) return;
  const frame = document.getElementById('maps-frame'); if (!frame) return;
  frame.src = `https://www.openstreetmap.org/search?query=${encodeURIComponent(q)}#map=12`;
  showNotif('🗺️','Maps','Searching: ' + q);
}
function mapsGo(type) {
  const frame = document.getElementById('maps-frame'); if (!frame) return;
  if (type === 'satellite') frame.src = 'https://www.openstreetmap.org/export/embed.html?bbox=-0.15,51.48,0.01,51.52&layer=hot';
  else frame.src = 'https://www.openstreetmap.org/export/embed.html?bbox=-0.15,51.48,0.01,51.52&layer=mapnik';
}

// ─── HEX EDITOR ────────────────────────────────────────
function buildHexeditor() {
  const sample = 'Hello ArcOS! This is a hex editor simulation.\nYou can load any file to inspect its raw bytes.\nHexadecimal values are shown alongside ASCII.';
  return `<div id="hexed-content">
    <div class="hexed-toolbar">
      <button class="editor-btn" onclick="hexLoadFile()">📂 Open File</button>
      <button class="editor-btn" onclick="hexLoadSample()">📄 Sample</button>
      <input type="file" id="hex-file-input" style="display:none" onchange="hexFileChosen(this)">
      <span id="hex-file-info" style="font-size:11px;color:var(--text-dim);font-family:'Source Code Pro',monospace">No file loaded</span>
    </div>
    <div id="hexed-body">
      <div id="hexed-offset"></div>
      <div id="hexed-hex"></div>
      <div id="hexed-ascii"></div>
    </div>
  </div>`;
}
function hexLoadFile() { document.getElementById('hex-file-input')?.click(); }
function hexLoadSample() {
  const sample = 'Hello, ArcOS! Hex Editor v1.0\x00\x01\x02\x03\nBinary data example: \xFF\xFE\xAA\xBB\xCC\xDD\xEE\nEnd of sample data.';
  hexRender(new TextEncoder().encode(sample), 'sample.bin');
}
function hexFileChosen(inp) {
  const f = inp.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = e => hexRender(new Uint8Array(e.target.result), f.name);
  r.readAsArrayBuffer(f);
}
function hexRender(bytes, name) {
  document.getElementById('hex-file-info').textContent = name + ' — ' + bytes.length + ' bytes';
  const maxBytes = Math.min(bytes.length, 512);
  let offsets='', hexStr='', asciiStr='';
  for (let i = 0; i < maxBytes; i += 16) {
    offsets += i.toString(16).padStart(8,'0').toUpperCase() + '\n';
    const row = bytes.slice(i, i+16);
    hexStr += Array.from(row).map(b=>b.toString(16).padStart(2,'0').toUpperCase()).join(' ').padEnd(47,' ') + '\n';
    asciiStr += Array.from(row).map(b=>(b>=32&&b<127)?String.fromCharCode(b):'.').join('') + '\n';
  }
  document.getElementById('hexed-offset').textContent = offsets;
  document.getElementById('hexed-hex').textContent = hexStr;
  document.getElementById('hexed-ascii').textContent = asciiStr;
}

// ─── NETWORK SCANNER ───────────────────────────────────
let netScanInterval = null;
function buildNetscanner() {
  return `<div id="netscanner-content">
    <div class="net-scan-header">
      <button class="editor-btn" onclick="startNetScan()">▶ Scan Network</button>
      <button class="editor-btn" onclick="stopNetScan()">⏹ Stop</button>
      <select id="net-scan-mode" class="settings-select">
        <option value="local">Local Network (192.168.x.x)</option>
        <option value="public">Common Public IPs</option>
        <option value="ports">Port Scanner</option>
      </select>
      <span id="net-scan-status" style="font-size:12px;color:var(--text-dim);font-family:'Source Code Pro',monospace"></span>
    </div>
    <div id="net-results" style="display:flex;flex-direction:column;gap:6px;overflow-y:auto;flex:1"></div>
  </div>`;
}
const NET_FAKE_HOSTS = [
  {ip:'192.168.1.1',   host:'router.local',          ports:'80, 443, 22',   ms:1},
  {ip:'192.168.1.10',  host:'desktop.local',          ports:'3000, 8080',    ms:4},
  {ip:'192.168.1.15',  host:'laptop.local',           ports:'22, 5900',      ms:6},
  {ip:'192.168.1.20',  host:'phone.local',            ports:'—',             ms:12},
  {ip:'192.168.1.42',  host:'printer.local',          ports:'9100, 631',     ms:18},
  {ip:'192.168.1.100', host:'nas.local',              ports:'445, 2049',     ms:8},
  {ip:'192.168.1.200', host:'raspberry.local',        ports:'22, 80, 8080',  ms:14},
  {ip:'192.168.1.254', host:'gateway.local',          ports:'80, 443',       ms:2},
  {ip:'10.0.0.1',      host:'vpn-gateway.local',      ports:'1194, 443',     ms:22},
  {ip:'172.16.0.5',    host:'dev-server.local',       ports:'22, 3306, 6379',ms:35},
];
function startNetScan() {
  stopNetScan();
  const res = document.getElementById('net-results'); if (!res) return;
  res.innerHTML = '';
  const st = document.getElementById('net-scan-status');
  if (st) st.textContent = '⚡ Scanning…';
  let i = 0;
  netScanInterval = setInterval(() => {
    if (i >= NET_FAKE_HOSTS.length) { stopNetScan(); if(st) st.textContent = `✓ Found ${NET_FAKE_HOSTS.length} hosts`; return; }
    const h = NET_FAKE_HOSTS[i++];
    const isUp = Math.random() > 0.15;
    const div = document.createElement('div');
    div.className = 'net-result';
    div.innerHTML = `<div class="net-dot" style="background:${isUp?'#6bcb77':'#ff6b6b'}"></div>
      <span class="net-ip">${h.ip}</span>
      <span class="net-host">${h.host}</span>
      <span class="net-ports">Ports: ${h.ports}</span>
      <span class="net-latency">${h.ms}ms</span>
      <span style="font-size:10px;color:${isUp?'#6bcb77':'#ff6b6b'}">${isUp?'UP':'DOWN'}</span>`;
    res.appendChild(div);
    res.scrollTop = res.scrollHeight;
  }, 320);
}
function stopNetScan() { clearInterval(netScanInterval); netScanInterval = null; }

// ─── PROCESS INSPECTOR ─────────────────────────────────
let procInterval = null;
const FAKE_PROCS = [
  {pid:1,    name:'init',          cpu:.0,  mem:.1,  status:'S', cmd:'/sbin/init'},
  {pid:42,   name:'kernel',        cpu:.0,  mem:.4,  status:'S', cmd:'[kernel]'},
  {pid:103,  name:'arcgui',        cpu:1.2, mem:8.4, status:'R', cmd:'arcgui --desktop'},
  {pid:204,  name:'arcd',          cpu:.3,  mem:2.1, status:'S', cmd:'arcd --daemon'},
  {pid:301,  name:'WebContent',    cpu:3.8, mem:18.2,status:'R', cmd:'WebContent G2'},
  {pid:412,  name:'arcterm',       cpu:.6,  mem:3.2, status:'R', cmd:'arcterm --new'},
  {pid:503,  name:'arc-notif',     cpu:.1,  mem:1.2, status:'S', cmd:'arc-notification-daemon'},
  {pid:614,  name:'pulseaudio',    cpu:.4,  mem:2.8, status:'S', cmd:'pulseaudio --start'},
  {pid:722,  name:'dbus-daemon',   cpu:.0,  mem:.9,  status:'S', cmd:'dbus-daemon --session'},
  {pid:830,  name:'NetworkMgr',    cpu:.2,  mem:1.7, status:'S', cmd:'NetworkManager'},
  {pid:944,  name:'python3',       cpu:2.1, mem:6.3, status:'R', cmd:'python3 script.py'},
  {pid:1012, name:'node',          cpu:4.2, mem:12.1,status:'R', cmd:'node server.js'},
  {pid:1144, name:'postgres',      cpu:.8,  mem:22.4,status:'S', cmd:'postgres -D /data'},
  {pid:1256, name:'arc-panel',     cpu:.3,  mem:4.1, status:'S', cmd:'arc-panel'},
  {pid:1380, name:'arc-files',     cpu:.9,  mem:5.2, status:'R', cmd:'arc-files --daemon'},
  {pid:1490, name:'arc-wm',        cpu:1.1, mem:6.8, status:'R', cmd:'arc-wm --replace'},
];
function buildProcessinspect() {
  return `<div id="proc-content">
    <div class="proc-toolbar">
      <span style="font-size:13px;font-weight:700">Processes</span>
      <input id="proc-search" type="text" placeholder="Filter processes…" oninput="procFilter(this.value)">
      <span id="proc-count" style="font-size:12px;color:var(--text-dim)"></span>
      <button class="editor-btn" onclick="procRefresh()">↺ Refresh</button>
    </div>
    <div id="proc-table-wrap">
      <table id="proc-table">
        <thead><tr>
          <th>PID</th><th>Name</th><th>CPU %</th><th>Mem %</th><th>Status</th><th>Command</th><th>Action</th>
        </tr></thead>
        <tbody id="proc-body"></tbody>
      </table>
    </div>
  </div>`;
}
function initProcessinspect() { procRender(FAKE_PROCS); }
function procRender(procs) {
  const body = document.getElementById('proc-body'); if (!body) return;
  const cnt  = document.getElementById('proc-count');
  if (cnt) cnt.textContent = procs.length + ' processes';
  body.innerHTML = procs.map(p => {
    const cpuColor = p.cpu > 3 ? 'var(--red)' : p.cpu > 1 ? 'var(--yellow)' : 'var(--text-dim)';
    return `<tr>
      <td>${p.pid}</td>
      <td style="color:var(--text);font-weight:600">${p.name}</td>
      <td style="color:${cpuColor}">${p.cpu.toFixed(1)}</td>
      <td>${p.mem.toFixed(1)}</td>
      <td><span style="color:${p.status==='R'?'var(--green)':'var(--text-dim)'}">${p.status}</span></td>
      <td style="color:var(--text-dim);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${p.cmd}">${p.cmd}</td>
      <td><button class="proc-kill" onclick="procKill(${p.pid},'${p.name}')">Kill</button></td>
    </tr>`;
  }).join('');
}
let procData = [...FAKE_PROCS];
function procKill(pid, name) {
  procData = procData.filter(p => p.pid !== pid);
  procRender(procData);
  showNotif('⚡','Process Killed',`${name} (PID ${pid}) terminated`);
}
function procFilter(q) {
  procRender(procData.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || String(p.pid).includes(q)));
}
function procRefresh() {
  procData = FAKE_PROCS.map(p => ({...p, cpu: Math.max(0, p.cpu + (Math.random()-.5)*.5), mem: Math.max(0, p.mem + (Math.random()-.5)*.3)}));
  procRender(procData);
}

// ─── ARDUINO IDE ───────────────────────────────────────
const ARD_SAMPLE = `/*
 * ArcOS Arduino Blink Example
 * Blinks the built-in LED on pin 13
 */

#define LED_PIN 13
#define DELAY_MS 1000

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("ArcOS Arduino IDE Ready!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED ON");
  delay(DELAY_MS);

  digitalWrite(LED_PIN, LOW);
  Serial.println("LED OFF");
  delay(DELAY_MS);
}`;

function buildArduino() {
  return `<div id="arduino-content">
    <div class="ard-toolbar">
      <button class="editor-btn" style="background:rgba(0,135,138,.3);border-color:rgba(0,135,138,.5);color:#00d4d8" onclick="ardVerify()">✓ Verify</button>
      <button class="editor-btn" style="background:rgba(0,135,138,.4);border-color:rgba(0,135,138,.6);color:#00d4d8" onclick="ardUpload()">→ Upload</button>
      <button class="editor-btn" onclick="ardSerial()">📡 Serial Monitor</button>
      <select class="settings-select" id="ard-board">
        <option>Arduino Uno</option>
        <option>Arduino Nano</option>
        <option>Arduino Mega</option>
        <option>ESP32</option>
        <option>ESP8266</option>
        <option>Raspberry Pi Pico</option>
      </select>
      <select class="settings-select">
        <option>/dev/ttyUSB0</option>
        <option>/dev/ttyACM0</option>
        <option>COM3</option>
        <option>COM4</option>
      </select>
      <button class="editor-btn" onclick="ardNewFile()">📄 New</button>
      <button class="editor-btn" onclick="ardSave()">💾 Save</button>
    </div>
    <textarea id="ard-code" spellcheck="false">${ARD_SAMPLE}</textarea>
    <div id="ard-serial">
      <span style="color:rgba(0,212,216,.6)">Serial Monitor — </span><span style="color:#a8ff78">ArcOS Arduino IDE v1.0.0 ready.</span>\n
    </div>
  </div>`;
}
function ardVerify() {
  const code = document.getElementById('ard-code')?.value || '';
  const out = document.getElementById('ard-serial');
  if (!out) return;
  out.innerHTML += `<span style="color:var(--yellow)">⚙ Verifying sketch…</span>\n`;
  setTimeout(() => {
    if (code.includes('void setup') && code.includes('void loop')) {
      out.innerHTML += `<span style="color:var(--green)">✓ Sketch uses ${Math.floor(Math.random()*2000+1000)} bytes (${Math.floor(Math.random()*5+3)}% of program storage space).</span>\n`;
      out.innerHTML += `<span style="color:var(--green)">✓ Global variables use ${Math.floor(Math.random()*100+50)} bytes of dynamic memory.</span>\n`;
      showNotif('✓','Arduino','Sketch verified successfully');
    } else {
      out.innerHTML += `<span style="color:var(--red)">✗ Error: sketch must have setup() and loop() functions.</span>\n`;
    }
    out.scrollTop = out.scrollHeight;
  }, 800);
}
function ardUpload() {
  const out = document.getElementById('ard-serial');
  const board = document.getElementById('ard-board')?.value;
  if (!out) return;
  out.innerHTML += `<span style="color:var(--accent)">→ Uploading to ${board}…</span>\n`;
  let prog = 0;
  const iv = setInterval(() => {
    prog += Math.floor(Math.random()*15+5);
    if (prog >= 100) {
      clearInterval(iv);
      out.innerHTML += `<span style="color:var(--green)">✓ Upload complete! Device restarting…</span>\n`;
      showNotif('✓','Arduino','Upload complete!');
    } else {
      out.innerHTML += `<span style="color:var(--text-dim)">  Writing ${prog}%…</span>\n`;
    }
    out.scrollTop = out.scrollHeight;
  }, 200);
}
function ardSerial() {
  const out = document.getElementById('ard-serial');
  if (!out) return;
  out.innerHTML += `<span style="color:var(--accent3)">--- Serial Monitor opened at 9600 baud ---</span>\n`;
  let tick = 0;
  const iv = setInterval(() => {
    if (!document.getElementById('ard-serial')) { clearInterval(iv); return; }
    out.innerHTML += `<span style="color:#a8ff78">LED ${tick%2===0?'ON':'OFF'}</span>\n`;
    tick++; if (tick > 8) clearInterval(iv);
    out.scrollTop = out.scrollHeight;
  }, 1000);
}
function ardNewFile() {
  const ta = document.getElementById('ard-code');
  if (ta) ta.value = 'void setup() {\n  // put your setup code here\n}\n\nvoid loop() {\n  // put your main code here\n}\n';
}
function ardSave() { showNotif('💾','Arduino','Sketch saved to ~/Documents/sketch.ino'); }

// ─── TRANSLATOR ─────────────────────────────────────────
const TRANS_PHRASES = {
  hello:         { es:'Hola', fr:'Bonjour', de:'Hallo', it:'Ciao', pt:'Olá', ja:'こんにちは', zh:'你好', ar:'مرحبا' },
  'how are you': { es:'¿Cómo estás?', fr:'Comment ça va?', de:'Wie geht es dir?', it:'Come stai?', pt:'Como você está?', ja:'お元気ですか？', zh:'你好吗？', ar:'كيف حالك؟' },
  'thank you':   { es:'Gracias', fr:'Merci', de:'Danke', it:'Grazie', pt:'Obrigado', ja:'ありがとう', zh:'谢谢', ar:'شكرا' },
  goodbye:       { es:'Adiós', fr:'Au revoir', de:'Auf Wiedersehen', it:'Arrivederci', pt:'Adeus', ja:'さようなら', zh:'再见', ar:'وداعا' },
  yes:           { es:'Sí', fr:'Oui', de:'Ja', it:'Sì', pt:'Sim', ja:'はい', zh:'是', ar:'نعم' },
  no:            { es:'No', fr:'Non', de:'Nein', it:'No', pt:'Não', ja:'いいえ', zh:'不', ar:'لا' },
  'i love you':  { es:'Te quiero', fr:'Je t\'aime', de:'Ich liebe dich', it:'Ti amo', pt:'Eu te amo', ja:'愛してる', zh:'我爱你', ar:'أحبك' },
  'good morning':{ es:'Buenos días', fr:'Bonjour', de:'Guten Morgen', it:'Buongiorno', pt:'Bom dia', ja:'おはようございます', zh:'早上好', ar:'صباح الخير' },
  'good night':  { es:'Buenas noches', fr:'Bonne nuit', de:'Gute Nacht', it:'Buonanotte', pt:'Boa noite', ja:'おやすみなさい', zh:'晚安', ar:'تصبح على خير' },
  water:         { es:'Agua', fr:'Eau', de:'Wasser', it:'Acqua', pt:'Água', ja:'水', zh:'水', ar:'ماء' },
  arcos:         { es:'ArcOS — Sistema Linux', fr:'ArcOS — Système Linux', de:'ArcOS — Linux-System', it:'ArcOS — Sistema Linux', pt:'ArcOS — Sistema Linux', ja:'ArcOS — Linuxシステム', zh:'ArcOS — Linux系统', ar:'ArcOS — نظام لينكس' },
};
function buildTranslator() {
  const langs = ['Spanish','French','German','Italian','Portuguese','Japanese','Chinese','Arabic'];
  return `<div id="translator-content">
    <div class="trans-toolbar">
      <span style="font-weight:700;font-size:14px">🌐 Translator</span>
      <span style="color:var(--text-dim);font-size:12px">English</span>
      <span style="font-size:16px;opacity:.5">→</span>
      <select class="trans-lang-sel" id="trans-lang">${langs.map(l=>`<option>${l}</option>`).join('')}</select>
      <button class="editor-btn" onclick="transSwap()">⇄ Swap</button>
      <button class="editor-btn" onclick="transClear()">Clear</button>
    </div>
    <div id="trans-body">
      <textarea id="trans-input" placeholder="Type English text to translate…" oninput="transTranslate()"></textarea>
      <div id="trans-output" style="padding:16px;background:rgba(0,0,0,.2);color:var(--accent3);font-size:14px;line-height:1.7;overflow-y:auto;flex:1">Translation will appear here…</div>
    </div>
  </div>`;
}
function transTranslate() {
  const text = document.getElementById('trans-input')?.value?.trim().toLowerCase();
  const lang = document.getElementById('trans-lang')?.value?.toLowerCase();
  const out  = document.getElementById('trans-output');
  if (!out) return;
  if (!text) { out.textContent = 'Translation will appear here…'; return; }
  const langMap = { spanish:'es', french:'fr', german:'de', italian:'it', portuguese:'pt', japanese:'ja', chinese:'zh', arabic:'ar' };
  const code = langMap[lang] || 'es';
  const words = text.split(/\s+/);
  const translated = words.map(word => {
    const clean = word.replace(/[^a-z\s]/gi,'');
    for (const [phrase, trans] of Object.entries(TRANS_PHRASES)) {
      if (clean === phrase && trans[code]) return trans[code];
    }
    return word;
  }).join(' ');
  const fullPhrase = TRANS_PHRASES[text]?.[code];
  out.textContent = fullPhrase || translated + (translated === text ? ' (try: hello, goodbye, thank you…)' : '');
}
function transClear() {
  const inp = document.getElementById('trans-input');
  const out = document.getElementById('trans-output');
  if (inp) inp.value = '';
  if (out) out.textContent = 'Translation will appear here…';
}
function transSwap() { showNotif('🌐','Translator','Auto-detect coming soon'); }

// ─── COLOR PICKER ──────────────────────────────────────
let cpR=94, cpG=129, cpB=244;
function buildColorpicker() {
  const palette = ['#ff6b6b','#ffd93d','#6bcb77','#5e81f4','#c77dff','#48cfad','#fd79a8','#ff9f43','#74b9ff','#a29bfe','#ffffff','#000000','#ff4757','#2ed573','#1e90ff','#ffa502','#eccc68','#ff6348'];
  return `<div id="colorpicker-content">
    <div class="cp-swatch" id="cp-swatch" style="background:rgb(94,129,244)"></div>
    <div class="cp-row">
      <label class="cp-label">R</label>
      <input class="cp-slider" type="range" min="0" max="255" value="94" id="cp-r" oninput="cpUpdate()">
      <span class="cp-val" id="cp-rv">94</span>
    </div>
    <div class="cp-row">
      <label class="cp-label">G</label>
      <input class="cp-slider" type="range" min="0" max="255" value="129" id="cp-g" oninput="cpUpdate()">
      <span class="cp-val" id="cp-gv">129</span>
    </div>
    <div class="cp-row">
      <label class="cp-label">B</label>
      <input class="cp-slider" type="range" min="0" max="255" value="244" id="cp-b" oninput="cpUpdate()">
      <span class="cp-val" id="cp-bv">244</span>
    </div>
    <div class="cp-row">
      <label class="cp-label">Alpha</label>
      <input class="cp-slider" type="range" min="0" max="100" value="100" id="cp-a" oninput="cpUpdate()">
      <span class="cp-val" id="cp-av">100%</span>
    </div>
    <input type="color" value="#5e81f4" id="cp-native" oninput="cpFromNative(this.value)" style="width:100%;max-width:360px;height:40px;border:none;border-radius:8px;cursor:pointer;background:none">
    <div id="cp-hex" style="width:100%;max-width:360px;padding:10px;background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:9px;font-family:'Source Code Pro',monospace;font-size:16px;color:var(--text);text-align:center;font-weight:700;letter-spacing:2px;cursor:pointer" onclick="cpCopy()" title="Click to copy">#5E81F4</div>
    <div style="font-size:11px;color:var(--text-dim)">Click hex to copy · Drag sliders to adjust</div>
    <div style="display:flex;flex-direction:column;gap:6px;width:100%;max-width:360px">
      <div id="cp-rgb-val" style="font-size:12px;color:var(--text-dim);font-family:'Source Code Pro',monospace">rgb(94, 129, 244)</div>
      <div id="cp-hsl-val" style="font-size:12px;color:var(--text-dim);font-family:'Source Code Pro',monospace">hsl(224, 87%, 66%)</div>
    </div>
    <div class="cp-palette">${palette.map(c=>`<div class="cp-color" style="background:${c}" onclick="cpFromHex('${c}')" title="${c}"></div>`).join('')}</div>
  </div>`;
}
function cpUpdate() {
  cpR=parseInt(document.getElementById('cp-r')?.value||0);
  cpG=parseInt(document.getElementById('cp-g')?.value||0);
  cpB=parseInt(document.getElementById('cp-b')?.value||0);
  const a=parseInt(document.getElementById('cp-a')?.value||100)/100;
  const hex='#'+[cpR,cpG,cpB].map(v=>v.toString(16).padStart(2,'0').toUpperCase()).join('');
  const sw=document.getElementById('cp-swatch'); if(sw) sw.style.background=`rgba(${cpR},${cpG},${cpB},${a})`;
  const hx=document.getElementById('cp-hex'); if(hx) hx.textContent=hex;
  document.getElementById('cp-rv').textContent=cpR;
  document.getElementById('cp-gv').textContent=cpG;
  document.getElementById('cp-bv').textContent=cpB;
  document.getElementById('cp-av').textContent=Math.round(a*100)+'%';
  const hsl=rgbToHsl(cpR,cpG,cpB);
  document.getElementById('cp-rgb-val').textContent=`rgb(${cpR}, ${cpG}, ${cpB})`;
  document.getElementById('cp-hsl-val').textContent=`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
  const native=document.getElementById('cp-native'); if(native) native.value=hex;
}
function cpFromHex(hex) {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  document.getElementById('cp-r').value=r; document.getElementById('cp-g').value=g; document.getElementById('cp-b').value=b;
  cpUpdate();
}
function cpFromNative(hex) { cpFromHex(hex); }
function cpCopy() {
  const hex=document.getElementById('cp-hex')?.textContent;
  navigator.clipboard?.writeText(hex);
  showNotif('🎨','Copied',hex+' copied to clipboard');
}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h,s,l=(max+min)/2;if(max===min){h=s=0;}else{const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}h/=6;}return[Math.round(h*360),Math.round(s*100),Math.round(l*100)];}

// ─── UNIT CONVERTER ────────────────────────────────────
const UC_CATS = {
  Length: {
    units:['Meter','Kilometer','Mile','Foot','Inch','Yard','Centimeter','Millimeter'],
    base:{Meter:1,Kilometer:1000,Mile:1609.34,Foot:.3048,Inch:.0254,Yard:.9144,Centimeter:.01,Millimeter:.001}
  },
  Weight: {
    units:['Kilogram','Gram','Pound','Ounce','Tonne','Milligram'],
    base:{Kilogram:1,Gram:.001,Pound:.453592,Ounce:.0283495,Tonne:1000,Milligram:.000001}
  },
  Temperature: { units:['Celsius','Fahrenheit','Kelvin'], base:null },
  Speed: {
    units:['m/s','km/h','mph','knot','ft/s'],
    base:{'m/s':1,'km/h':.277778,'mph':.44704,'knot':.514444,'ft/s':.3048}
  },
  Volume: {
    units:['Liter','Milliliter','Gallon','Cup','Pint','Fluid Oz'],
    base:{Liter:1,Milliliter:.001,Gallon:3.78541,Cup:.236588,Pint:.473176,'Fluid Oz':.0295735}
  },
  Area: {
    units:['m²','km²','Acre','Hectare','ft²','mile²'],
    base:{'m²':1,'km²':1e6,Acre:4046.86,Hectare:10000,'ft²':.092903,'mile²':2589988}
  },
  Data: {
    units:['Byte','KB','MB','GB','TB','Bit'],
    base:{Byte:1,KB:1024,MB:1048576,GB:1073741824,TB:1099511627776,Bit:.125}
  },
};
let ucCat = 'Length';
function buildUnitconvert() {
  return `<div id="unitconvert-content">
    <div class="uc-tabs" id="uc-tabs">
      ${Object.keys(UC_CATS).map(c=>`<button class="uc-tab${c===ucCat?' active':''}" onclick="ucSetCat('${c}')">${c}</button>`).join('')}
    </div>
    <div class="uc-card">
      <div class="uc-input-row">
        <input class="uc-num" id="uc-from-val" type="number" value="1" oninput="ucConvert()">
        <select class="uc-unit" id="uc-from-unit" onchange="ucConvert()"></select>
      </div>
      <div style="text-align:center;font-size:20px;opacity:.4">↕</div>
      <div class="uc-input-row">
        <input class="uc-num" id="uc-to-val" type="number" readonly style="opacity:.8">
        <select class="uc-unit" id="uc-to-unit" onchange="ucConvert()"></select>
      </div>
    </div>
    <div class="uc-result" id="uc-result">—</div>
    <div id="uc-table" style="display:flex;flex-direction:column;gap:4px"></div>
  </div>`;
}
function ucSetCat(cat) {
  ucCat = cat;
  document.querySelectorAll('.uc-tab').forEach(b=>b.classList.toggle('active',b.textContent===cat));
  ucPopulate(); ucConvert();
}
function ucPopulate() {
  const cat = UC_CATS[ucCat];
  const fromSel=document.getElementById('uc-from-unit');
  const toSel=document.getElementById('uc-to-unit');
  if (!fromSel||!toSel) return;
  fromSel.innerHTML = toSel.innerHTML = cat.units.map((u,i)=>`<option${i===0?' selected':''}>${u}</option>`).join('');
  if (cat.units[1]) toSel.selectedIndex=1;
}
function ucConvert() {
  const cat=UC_CATS[ucCat];
  const fromVal=parseFloat(document.getElementById('uc-from-val')?.value)||0;
  const fromUnit=document.getElementById('uc-from-unit')?.value;
  const toUnit=document.getElementById('uc-to-unit')?.value;
  const toValEl=document.getElementById('uc-to-val');
  const resEl=document.getElementById('uc-result');
  let result;
  if (ucCat==='Temperature') {
    if (fromUnit==='Celsius'&&toUnit==='Fahrenheit') result=fromVal*9/5+32;
    else if (fromUnit==='Fahrenheit'&&toUnit==='Celsius') result=(fromVal-32)*5/9;
    else if (fromUnit==='Celsius'&&toUnit==='Kelvin') result=fromVal+273.15;
    else if (fromUnit==='Kelvin'&&toUnit==='Celsius') result=fromVal-273.15;
    else if (fromUnit==='Fahrenheit'&&toUnit==='Kelvin') result=(fromVal-32)*5/9+273.15;
    else if (fromUnit==='Kelvin'&&toUnit==='Fahrenheit') result=(fromVal-273.15)*9/5+32;
    else result=fromVal;
  } else {
    const base=cat.base;
    result = fromVal * base[fromUnit] / base[toUnit];
  }
  const fmt = result > 1e10 || (result < 1e-4 && result !== 0) ? result.toExponential(4) : parseFloat(result.toFixed(8));
  if (toValEl) toValEl.value = fmt;
  if (resEl) resEl.textContent = `${fromVal} ${fromUnit} = ${fmt} ${toUnit}`;
  // Table of all units
  const tbl=document.getElementById('uc-table'); if(!tbl) return;
  if (cat.base) {
    tbl.innerHTML = cat.units.filter(u=>u!==fromUnit).map(u=>{
      const v=fromVal*cat.base[fromUnit]/cat.base[u];
      return `<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 8px;background:var(--card);border-radius:6px;font-family:'Source Code Pro',monospace"><span style="color:var(--text-dim)">${u}</span><span style="color:var(--text)">${parseFloat(v.toFixed(6))}</span></div>`;
    }).join('');
  }
}
function initUnitconvert() { setTimeout(()=>{ ucPopulate(); ucConvert(); }, 80); }

// ─── PASSWORD GENERATOR ────────────────────────────────
let pgLength=16, pgUpper=true, pgLower=true, pgNums=true, pgSymbols=true, pgExclude='';
function buildPassgen() {
  return `<div id="passgen-content">
    <div style="font-size:13px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:1px">Password Generator</div>
    <div id="pg-output" onclick="pgCopy()" title="Click to copy" style="cursor:pointer">Click Generate</div>
    <div class="pg-strength" style="width:100%;max-width:430px"><div class="pg-strength-fill" id="pg-sfill" style="width:0%;background:#ff6b6b"></div></div>
    <div id="pg-slabel" class="pg-strength-label" style="font-size:12px;color:var(--text-dim)">—</div>
    <div class="pg-row">
      <span class="pg-label">Length</span>
      <input type="range" min="4" max="64" value="16" id="pg-len" style="flex:1;accent-color:var(--accent);cursor:pointer" oninput="pgLength=parseInt(this.value);document.getElementById('pg-lval').textContent=this.value;pgGenerate()">
      <span class="pg-val" id="pg-lval" style="font-size:13px;font-family:'Source Code Pro',monospace;color:var(--accent);min-width:28px;text-align:right">16</span>
    </div>
    <div class="pg-row"><span class="pg-label">Uppercase (A-Z)</span><input type="checkbox" class="pg-check" checked onchange="pgUpper=this.checked;pgGenerate()"></div>
    <div class="pg-row"><span class="pg-label">Lowercase (a-z)</span><input type="checkbox" class="pg-check" checked onchange="pgLower=this.checked;pgGenerate()"></div>
    <div class="pg-row"><span class="pg-label">Numbers (0-9)</span><input type="checkbox" class="pg-check" checked onchange="pgNums=this.checked;pgGenerate()"></div>
    <div class="pg-row"><span class="pg-label">Symbols (!@#$…)</span><input type="checkbox" class="pg-check" checked onchange="pgSymbols=this.checked;pgGenerate()"></div>
    <div class="pg-row">
      <span class="pg-label">Exclude chars</span>
      <input type="text" id="pg-excl" placeholder="e.g. 0Ol1I" style="flex:1;padding:5px 10px;background:rgba(255,255,255,.07);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:'Source Code Pro',monospace;font-size:13px;outline:none" oninput="pgExclude=this.value;pgGenerate()">
    </div>
    <div style="display:flex;gap:8px">
      <button class="editor-btn" onclick="pgGenerate()" style="background:var(--accent);border-color:var(--accent);color:#fff;font-weight:700;padding:8px 20px">🔑 Generate</button>
      <button class="editor-btn" onclick="pgCopy()">📋 Copy</button>
      <button class="editor-btn" onclick="pgHistory()">📜 History</button>
    </div>
    <div id="pg-hist" style="width:100%;max-width:430px;display:none;flex-direction:column;gap:4px;max-height:140px;overflow-y:auto"></div>
  </div>`;
}
let pgHistArr = [];
function pgGenerate() {
  let chars = '';
  if (pgUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (pgLower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (pgNums)  chars += '0123456789';
  if (pgSymbols) chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';
  pgExclude.split('').forEach(c => { chars = chars.split(c).join(''); });
  if (!chars) { document.getElementById('pg-output').textContent = '⚠ Enable at least one charset'; return; }
  let pass = '';
  const arr = new Uint32Array(pgLength);
  window.crypto.getRandomValues(arr);
  for (let i = 0; i < pgLength; i++) pass += chars[arr[i] % chars.length];
  document.getElementById('pg-output').textContent = pass;
  pgStrength(pass);
  if (!pgHistArr.includes(pass)) { pgHistArr.unshift(pass); if (pgHistArr.length > 10) pgHistArr.pop(); }
}
function pgStrength(pass) {
  let score=0;
  if (pass.length >= 8) score++; if (pass.length >= 12) score++; if (pass.length >= 20) score++;
  if (/[A-Z]/.test(pass)) score++; if (/[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++; if (/[^A-Za-z0-9]/.test(pass)) score++;
  const levels=[{label:'Very Weak',color:'#ff4757',pct:14},{label:'Weak',color:'#ff6b6b',pct:28},{label:'Fair',color:'#ffd93d',pct:43},{label:'Good',color:'#f9ca24',pct:57},{label:'Strong',color:'#6bcb77',pct:71},{label:'Very Strong',color:'#48cfad',pct:85},{label:'Excellent',color:'#00d4d8',pct:100}];
  const lvl=levels[Math.min(score,6)];
  const fill=document.getElementById('pg-sfill');
  const lbl=document.getElementById('pg-slabel');
  if(fill){fill.style.width=lvl.pct+'%';fill.style.background=lvl.color;}
  if(lbl){lbl.style.color=lvl.color;lbl.textContent=lvl.label;}
}
function pgCopy() {
  const pass=document.getElementById('pg-output')?.textContent;
  if (pass && pass !== 'Click Generate') { navigator.clipboard?.writeText(pass); showNotif('🔑','Copied','Password copied to clipboard'); }
}
function pgHistory() {
  const hist=document.getElementById('pg-hist');
  if (!hist) return;
  const shown = hist.style.display === 'flex';
  hist.style.display = shown ? 'none' : 'flex';
  if (!shown) hist.innerHTML = pgHistArr.map(p=>`<div style="font-size:11px;font-family:'Source Code Pro',monospace;padding:5px 8px;background:var(--card);border-radius:6px;cursor:pointer;color:var(--text-dim)" onclick="navigator.clipboard?.writeText('${p}');showNotif('📋','Copied','Password copied')">${p}</div>`).join('');
}
function initPassgen() { setTimeout(pgGenerate, 80); }

// ─── ARCHIVE MANAGER ───────────────────────────────────
const ARC_FILES = [
  {name:'project-backup.tar.gz', size:'4.2 MB', type:'.tar.gz', items:24},
  {name:'photos-2024.zip',        size:'128 MB', type:'.zip',    items:312},
  {name:'arcos-src.tar.bz2',      size:'18.6 MB',type:'.tar.bz2',items:841},
  {name:'documents.7z',           size:'2.1 MB', type:'.7z',     items:87},
  {name:'node_modules.zip',       size:'342 MB', type:'.zip',    items:12847},
  {name:'database-dump.tar.gz',   size:'56 MB',  type:'.tar.gz', items:1},
  {name:'config-backup.zip',      size:'48 KB',  type:'.zip',    items:12},
  {name:'arcos-themes.tar.xz',    size:'3.8 MB', type:'.tar.xz', items:156},
];
function buildArchivemanager() {
  return `<div id="archive-content">
    <div class="arc-toolbar">
      <button class="editor-btn" onclick="arcOpen()">📂 Open Archive</button>
      <button class="editor-btn" onclick="arcCreate()">+ New Archive</button>
      <button class="editor-btn" onclick="arcExtract()">📤 Extract All</button>
      <input type="file" id="arc-file-input" accept=".zip,.tar,.gz,.bz2,.7z,.xz" style="display:none" onchange="arcFileLoad(this)">
      <span id="arc-info" style="font-size:11px;color:var(--text-dim);margin-left:auto"></span>
    </div>
    <div id="arc-list">
      ${ARC_FILES.map(f=>`
        <div class="arc-item" ondblclick="arcExtractFile('${f.name}')">
          <span style="font-size:20px">${f.type.includes('zip')?'📦':'🗜️'}</span>
          <span class="arc-name">${f.name}</span>
          <span class="arc-badge">${f.type}</span>
          <span style="font-size:11px;color:var(--text-dim)">${f.items} files</span>
          <span class="arc-size">${f.size}</span>
        </div>`).join('')}
    </div>
  </div>`;
}
function arcOpen() { document.getElementById('arc-file-input')?.click(); }
function arcFileLoad(inp) {
  const f=inp.files[0]; if(!f) return;
  showNotif('🗜️','Archive Opened',f.name+' ('+Math.round(f.size/1024)+'KB)');
  document.getElementById('arc-info').textContent = 'Loaded: '+f.name;
}
function arcCreate() {
  const name = prompt('Archive name (e.g. backup.zip):','arcos-backup.zip');
  if (!name) return;
  const list=document.getElementById('arc-list');
  if (list) {
    const div=document.createElement('div'); div.className='arc-item';
    div.innerHTML=`<span style="font-size:20px">📦</span><span class="arc-name">${name}</span><span class="arc-badge">.zip</span><span style="font-size:11px;color:var(--text-dim)">0 files</span><span class="arc-size">0 B</span>`;
    list.prepend(div);
  }
  showNotif('📦','Archive Created',name);
}
function arcExtract()           { showNotif('📤','Extracted','All archives extracted to ~/Downloads/'); }
function arcExtractFile(name)   { showNotif('📤','Extracted',name+' extracted to ~/Downloads/'); }

// ─── AUDIO VISUALIZER ──────────────────────────────────
let vizCtx=null, vizCanvas=null, vizAnimId=null, vizAudio=null, vizAnalyser=null, vizSource=null, vizMode='bars';
function buildVisualizer() {
  return `<div id="visualizer-content">
    <canvas id="viz-canvas" width="640" height="320"></canvas>
    <div class="viz-controls">
      <button class="editor-btn" onclick="vizStart()">▶ Start</button>
      <button class="editor-btn" onclick="vizStop()">⏹ Stop</button>
      <button class="editor-btn" onclick="vizLoadFile()">🎵 Load File</button>
      <input type="file" id="viz-file" accept="audio/*" style="display:none" onchange="vizFileChosen(this)">
      <select class="settings-select" onchange="vizMode=this.value">
        <option value="bars">Bar Chart</option>
        <option value="wave">Waveform</option>
        <option value="circle">Circular</option>
        <option value="dots">Dots</option>
      </select>
      <select class="settings-select" id="viz-color-sel">
        <option value="accent">Accent Blue</option>
        <option value="rainbow">Rainbow</option>
        <option value="fire">Fire</option>
        <option value="neon">Neon Green</option>
      </select>
    </div>
    <div style="font-size:11px;color:var(--text-dim)">Load an audio file or click Start for demo mode</div>
  </div>`;
}
function initVisualizer() {
  setTimeout(()=>{
    vizCanvas=document.getElementById('viz-canvas');
    if(!vizCanvas) return;
    vizCtx=vizCanvas.getContext('2d');
    vizDrawIdle();
  },80);
}
function vizDrawIdle() {
  if(!vizCtx||!vizCanvas) return;
  vizCtx.fillStyle='#09090f'; vizCtx.fillRect(0,0,vizCanvas.width,vizCanvas.height);
  vizCtx.fillStyle='rgba(94,129,244,.3)';
  vizCtx.font='14px Cantarell'; vizCtx.textAlign='center';
  vizCtx.fillText('Click ▶ Start for demo visualizer or load an audio file',vizCanvas.width/2,vizCanvas.height/2);
}
function vizStart() {
  if(vizAnimId) cancelAnimationFrame(vizAnimId);
  const demoData=new Array(128).fill(0).map((_,i)=>Math.sin(i*.1)*64+64);
  let tick=0;
  function draw() {
    if(!vizCtx||!vizCanvas) return;
    const w=vizCanvas.width,h=vizCanvas.height;
    vizCtx.fillStyle='rgba(9,9,15,.4)'; vizCtx.fillRect(0,0,w,h);
    const data=demoData.map((_,i)=>Math.abs(Math.sin(tick*.02+i*.12)*100+Math.random()*30));
    tick++;
    const colorSel=document.getElementById('viz-color-sel')?.value||'accent';
    if(vizMode==='bars'){
      const bw=w/data.length;
      data.forEach((v,i)=>{
        const bh=v/128*h;
        if(colorSel==='rainbow') vizCtx.fillStyle=`hsl(${i/data.length*360},80%,60%)`;
        else if(colorSel==='fire') vizCtx.fillStyle=`hsl(${v/128*60},90%,60%)`;
        else if(colorSel==='neon') vizCtx.fillStyle=`rgba(0,255,100,${v/128})`;
        else vizCtx.fillStyle=`rgba(94,129,244,${0.4+v/256})`;
        vizCtx.fillRect(i*bw,h-bh,bw-1,bh);
      });
    } else if(vizMode==='wave'){
      vizCtx.beginPath(); vizCtx.strokeStyle='#5e81f4'; vizCtx.lineWidth=2;
      data.forEach((v,i)=>{const x=i/data.length*w,y=h/2+(v-64)/128*h*.7;i===0?vizCtx.moveTo(x,y):vizCtx.lineTo(x,y);});
      vizCtx.stroke();
    } else if(vizMode==='circle'){
      const cx=w/2,cy=h/2,r=Math.min(w,h)*.25;
      data.slice(0,64).forEach((v,i)=>{
        const a=i/64*Math.PI*2,ext=v/128*r;
        vizCtx.beginPath(); vizCtx.strokeStyle=`hsl(${i*5.6},80%,60%)`; vizCtx.lineWidth=2;
        vizCtx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
        vizCtx.lineTo(cx+Math.cos(a)*(r+ext),cy+Math.sin(a)*(r+ext));
        vizCtx.stroke();
      });
    } else if(vizMode==='dots'){
      data.forEach((v,i)=>{
        const x=i/data.length*w+7,y=h-v/128*h;
        vizCtx.beginPath();
        vizCtx.arc(x,y,3+v/64,0,Math.PI*2);
        vizCtx.fillStyle=`hsla(${i*2.8},80%,60%,.8)`;
        vizCtx.fill();
      });
    }
    vizAnimId=requestAnimationFrame(draw);
  }
  draw();
}
function vizStop() { if(vizAnimId) cancelAnimationFrame(vizAnimId); vizAnimId=null; vizDrawIdle(); }
function vizLoadFile() { document.getElementById('viz-file')?.click(); }
function vizFileChosen(inp) {
  const f=inp.files[0]; if(!f) return;
  if(!vizAudio) vizAudio=new(window.AudioContext||window.webkitAudioContext)();
  const reader=new FileReader();
  reader.onload=e=>{
    vizAudio.decodeAudioData(e.target.result,buf=>{
      if(vizSource) vizSource.stop();
      vizSource=vizAudio.createBufferSource(); vizSource.buffer=buf;
      vizAnalyser=vizAudio.createAnalyser(); vizAnalyser.fftSize=256;
      vizSource.connect(vizAnalyser); vizAnalyser.connect(vizAudio.destination);
      vizSource.start();
      const bufLen=vizAnalyser.frequencyBinCount, dataArr=new Uint8Array(bufLen);
      if(vizAnimId) cancelAnimationFrame(vizAnimId);
      function realDraw(){
        vizAnalyser.getByteFrequencyData(dataArr);
        const w=vizCanvas.width,h=vizCanvas.height;
        vizCtx.fillStyle='rgba(9,9,15,.5)'; vizCtx.fillRect(0,0,w,h);
        const bw=w/bufLen;
        dataArr.forEach((v,i)=>{const bh=v/255*h;vizCtx.fillStyle=`hsl(${i*1.4},80%,60%)`;vizCtx.fillRect(i*bw,h-bh,bw-1,bh);});
        vizAnimId=requestAnimationFrame(realDraw);
      }
      realDraw();
      showNotif('🎵','Visualizer',f.name+' playing');
    });
  };
  reader.readAsArrayBuffer(f);
}

// ─── HOOK INTO WINDOWS ─────────────────────────────────
// Patch windows.js buildContent + afterOpen + getDefaultSize
const _origBuildContent = window.buildContent;
window.buildContent = function(id) {
  const newMap = {
    spreadsheet:    buildSpreadsheet,
    maps:           buildMaps,
    hexeditor:      buildHexeditor,
    netscanner:     buildNetscanner,
    processinspect: buildProcessinspect,
    arduino:        buildArduino,
    translator:     buildTranslator,
    colorpicker:    buildColorpicker,
    unitconvert:    buildUnitconvert,
    passgen:        buildPassgen,
    archivemanager: buildArchivemanager,
    visualizer:     buildVisualizer,
  };
  if (newMap[id]) return newMap[id]();
  return _origBuildContent ? _origBuildContent(id) : `<div style="padding:20px;color:var(--text-dim)">App not found: ${id}</div>`;
};

const _origAfterOpen = window.afterOpen;
window.afterOpen = function(id) {
  if (_origAfterOpen) _origAfterOpen(id);
  if (id==='processinspect') initProcessinspect();
  if (id==='unitconvert')    initUnitconvert();
  if (id==='passgen')        initPassgen();
  if (id==='visualizer')     initVisualizer();
  if (id==='hexeditor')      setTimeout(hexLoadSample,80);
};

const _origGetSize = window.getDefaultSize;
window.getDefaultSize = function(id) {
  const extra = {
    spreadsheet:    [900,540], maps:[820,560], hexeditor:[760,480],
    netscanner:     [640,500], processinspect:[780,520],
    arduino:        [740,520], translator:[720,440],
    colorpicker:    [400,580], unitconvert:[460,560],
    passgen:        [480,580], archivemanager:[620,480],
    visualizer:     [700,480],
  };
  if (extra[id]) {
    const [w,h]=extra[id];
    const x=Math.max(60,Math.random()*(window.innerWidth-w-100)+50);
    const y=Math.max(44,Math.random()*(window.innerHeight-h-120)+44);
    return [w,h,Math.round(x),Math.round(y)];
  }
  return _origGetSize ? _origGetSize(id) : [600,420,120,80];
};
