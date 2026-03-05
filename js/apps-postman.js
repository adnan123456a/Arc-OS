/* ═══════════════════════════════════════
   ArcOS — API Tester (Postman-like)
═══════════════════════════════════════ */

let pmHistory  = [];
let pmEnvVars  = {};

function buildPostman() {
  return `<div id="postman-content">
    <div id="postman-env-wrap">
      <span style="font-size:11px;color:var(--text-dim)">Env vars:</span>
      <input id="postman-env-input" type="text" placeholder='{"base_url":"https://api.example.com"}' title="JSON environment variables">
      <button onclick="pmSaveEnv()" style="background:var(--card);border:1px solid var(--border);color:var(--text);padding:4px 10px;border-radius:5px;cursor:pointer;font-size:11px;font-family:inherit;">Save Env</button>
    </div>
    <div id="postman-top">
      <select id="postman-method" onchange="pmMethodColor(this)">
        <option>GET</option><option>POST</option><option>PUT</option>
        <option>DELETE</option><option>PATCH</option><option>HEAD</option><option>OPTIONS</option>
      </select>
      <input id="postman-url" type="text" placeholder="https://api.example.com/endpoint  (supports {{variables}})" value="https://jsonplaceholder.typicode.com/posts/1">
      <button id="postman-send" onclick="pmSend()">▶ Send</button>
    </div>

    <div id="postman-tabs">
      <div class="pm-tab active" onclick="pmTab('headers',this)">Headers</div>
      <div class="pm-tab" onclick="pmTab('params',this)">Query Params</div>
      <div class="pm-tab" onclick="pmTab('body',this)">Body</div>
      <div class="pm-tab" onclick="pmTab('auth',this)">Auth</div>
      <div class="pm-tab" onclick="pmTab('curl',this)">cURL</div>
    </div>

    <div id="postman-body">
      <!-- LEFT: request config -->
      <div id="postman-left">

        <div id="pm-section-headers" class="pm-section active">
          <div class="pm-section-label">REQUEST HEADERS</div>
          <div id="pm-headers-list" class="pm-kv-list"></div>
          <button class="pm-add-row" onclick="pmAddKv('headers')">+ Add Header</button>
        </div>

        <div id="pm-section-params" class="pm-section">
          <div class="pm-section-label">QUERY PARAMETERS</div>
          <div id="pm-params-list" class="pm-kv-list"></div>
          <button class="pm-add-row" onclick="pmAddKv('params')">+ Add Parameter</button>
        </div>

        <div id="pm-section-body" class="pm-section">
          <div class="pm-section-label" style="display:flex;align-items:center;gap:8px;">
            BODY
            <select id="pm-body-type" class="settings-select" onchange="pmBodyTypeChange(this.value)">
              <option value="json">JSON</option>
              <option value="form">Form Data</option>
              <option value="raw">Raw Text</option>
              <option value="none">None</option>
            </select>
          </div>
          <textarea id="postman-body-editor" placeholder='{"key": "value"}'></textarea>
        </div>

        <div id="pm-section-auth" class="pm-section">
          <div class="pm-section-label">AUTHORIZATION</div>
          <div style="padding:12px 14px;display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <label style="font-size:12px;color:var(--text-dim);width:80px">Type</label>
              <select id="pm-auth-type" class="settings-select" onchange="pmAuthTypeChange(this.value)">
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="apikey">API Key</option>
              </select>
            </div>
            <div id="pm-auth-fields"></div>
          </div>
        </div>

        <div id="pm-section-curl" class="pm-section">
          <div class="pm-section-label" style="display:flex;align-items:center;justify-content:space-between;">
            CURL COMMAND
            <button onclick="pmCopyCurl()" style="background:var(--card);border:1px solid var(--border);color:var(--text);padding:3px 10px;border-radius:5px;cursor:pointer;font-size:11px;font-family:inherit;">📋 Copy</button>
          </div>
          <textarea id="pm-curl-output" readonly style="flex:1;padding:14px;background:#09090f;border:none;color:#a8ff78;font-family:'Source Code Pro',monospace;font-size:12px;resize:none;outline:none;line-height:1.7;" placeholder="Send a request to generate the cURL command…"></textarea>
        </div>
      </div>

      <!-- RIGHT: history + response -->
      <div id="postman-right">
        <div id="postman-history">
          <div style="padding:6px 10px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);font-weight:700;border-bottom:1px solid var(--border);">History</div>
          <div id="postman-history-list"></div>
          <button onclick="pmClearHistory()" style="background:none;border:none;border-top:1px solid var(--border);color:var(--text-dim);padding:6px;font-size:11px;cursor:pointer;font-family:inherit;width:100%;">Clear</button>
        </div>

        <div id="postman-response">
          <div class="pm-section-label">RESPONSE</div>
          <div id="postman-res-meta">
            <span id="postman-status">—</span>
            <span id="pm-res-time" style="color:var(--text-dim)">—</span>
            <span id="pm-res-size" style="color:var(--text-dim)">—</span>
            <button onclick="pmCopyResponse()" style="margin-left:auto;background:var(--card);border:1px solid var(--border);color:var(--text);padding:3px 10px;border-radius:5px;cursor:pointer;font-size:11px;font-family:inherit;">📋 Copy</button>
          </div>
          <div style="display:flex;background:rgba(0,0,0,.15);border-bottom:1px solid var(--border);padding:0 8px;">
            <div class="pm-tab active" onclick="pmResTab('body',this)">Body</div>
            <div class="pm-tab" onclick="pmResTab('resheaders',this)">Headers</div>
          </div>
          <div id="pm-res-body-wrap" style="flex:1;display:flex;flex-direction:column;min-height:0;">
            <div id="postman-res-body">Send a request to see the response here.</div>
          </div>
          <div id="pm-res-resheaders-wrap" style="display:none;flex:1;flex-direction:column;min-height:0;">
            <div id="postman-res-headers" style="flex:1;padding:14px;background:#0b0b16;font-family:'Source Code Pro',monospace;font-size:12px;overflow-y:auto;color:var(--text-dim);white-space:pre-wrap;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function initPostman() {
  pmAddKv('headers');
  pmMethodColor(document.getElementById('postman-method'));
}

// ── Method colour ──
function pmMethodColor(sel) {
  if (!sel) return;
  const colors = { GET:'#48cfad', POST:'#ffd93d', PUT:'#5e81f4', DELETE:'#ff6b6b', PATCH:'#c77dff', HEAD:'#aaa', OPTIONS:'#aaa' };
  sel.style.color = colors[sel.value] || '#aaa';
}

// ── Tab switching ──
function pmTab(name, btn) {
  document.querySelectorAll('#postman-tabs .pm-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#postman-left .pm-section').forEach(s => s.classList.remove('active'));
  btn?.classList.add('active');
  document.getElementById(`pm-section-${name}`)?.classList.add('active');
  if (name === 'curl') pmGenerateCurl();
}

function pmResTab(name, btn) {
  document.querySelectorAll('#postman-response .pm-tab').forEach(t => t.classList.remove('active'));
  btn?.classList.add('active');
  document.getElementById('pm-res-body-wrap').style.display       = name === 'body'       ? 'flex' : 'none';
  document.getElementById('pm-res-resheaders-wrap').style.display = name === 'resheaders' ? 'flex' : 'none';
}

// ── KV rows ──
function pmAddKv(type) {
  const list = document.getElementById(`pm-${type}-list`); if (!list) return;
  const row  = document.createElement('div'); row.className = 'pm-kv-row';
  const ph   = type === 'headers' ? ['Content-Type','application/json'] : ['key','value'];
  row.innerHTML = `
    <input class="pm-kv-key" type="text" placeholder="${ph[0]}">
    <input class="pm-kv-val" type="text" placeholder="${ph[1]}">
    <button class="pm-kv-del" onclick="this.parentElement.remove()">×</button>`;
  list.appendChild(row);
}

function pmGetKvPairs(type) {
  const result = {};
  document.querySelectorAll(`#pm-${type}-list .pm-kv-row`).forEach(row => {
    const k = row.querySelector('.pm-kv-key')?.value?.trim();
    const v = row.querySelector('.pm-kv-val')?.value?.trim();
    if (k) result[k] = v || '';
  });
  return result;
}

// ── Auth ──
function pmAuthTypeChange(type) {
  const fields = document.getElementById('pm-auth-fields'); if (!fields) return;
  const input  = (id, label, type2, ph) =>
    `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <label style="font-size:12px;color:var(--text-dim);width:80px">${label}</label>
      <input id="${id}" class="pm-kv-val" style="flex:1" type="${type2}" placeholder="${ph}">
    </div>`;
  if (type === 'none')   fields.innerHTML = '';
  else if (type === 'bearer') fields.innerHTML = input('pm-bearer-token','Token','password','eyJhbGciOi…');
  else if (type === 'basic')  fields.innerHTML = input('pm-basic-user','Username','text','username') + input('pm-basic-pass','Password','password','password');
  else if (type === 'apikey') fields.innerHTML =
    input('pm-apikey-name','Key Name','text','X-API-Key') +
    input('pm-apikey-val','Value','password','your-api-key') +
    `<div style="display:flex;align-items:center;gap:8px;">
       <label style="font-size:12px;color:var(--text-dim);width:80px">Add to</label>
       <select id="pm-apikey-in" class="settings-select"><option value="header">Header</option><option value="query">Query Param</option></select>
     </div>`;
}

// ── Body type ──
function pmBodyTypeChange(type) {
  const editor = document.getElementById('postman-body-editor'); if (!editor) return;
  editor.style.display = type === 'none' ? 'none' : 'block';
  if (type === 'json') editor.placeholder = '{\n  "key": "value"\n}';
  else if (type === 'form') editor.placeholder = 'key1=value1&key2=value2';
  else editor.placeholder = 'Raw text body…';
}

// ── Env vars ──
function pmResolveEnv(str) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => pmEnvVars[k] || `{{${k}}}`);
}
function pmSaveEnv() {
  try {
    pmEnvVars = JSON.parse(document.getElementById('postman-env-input')?.value || '{}');
    showNotif('⚙️', 'Env Vars', Object.keys(pmEnvVars).length + ' variables saved');
  } catch { showNotif('⚠️', 'Invalid JSON', 'Check your env var format'); }
}

// ── SEND ──
async function pmSend() {
  const methodEl = document.getElementById('postman-method');
  const urlEl    = document.getElementById('postman-url');
  if (!methodEl || !urlEl) return;

  const method   = methodEl.value;
  let   rawUrl   = pmResolveEnv(urlEl.value.trim());
  if (!rawUrl) { showNotif('⚠️', 'No URL', 'Enter a request URL'); return; }

  // Query params
  const qp = pmGetKvPairs('params');
  let url = rawUrl;
  if (Object.keys(qp).length) url += (url.includes('?') ? '&' : '?') + new URLSearchParams(qp).toString();

  // Headers
  const headers = pmGetKvPairs('headers');

  // Auth injection
  const authType = document.getElementById('pm-auth-type')?.value || 'none';
  if (authType === 'bearer') {
    const tok = document.getElementById('pm-bearer-token')?.value;
    if (tok) headers['Authorization'] = 'Bearer ' + tok;
  } else if (authType === 'basic') {
    const u = document.getElementById('pm-basic-user')?.value || '';
    const p = document.getElementById('pm-basic-pass')?.value || '';
    if (u) headers['Authorization'] = 'Basic ' + btoa(u + ':' + p);
  } else if (authType === 'apikey') {
    const kn = document.getElementById('pm-apikey-name')?.value || 'X-API-Key';
    const kv = document.getElementById('pm-apikey-val')?.value  || '';
    const ki = document.getElementById('pm-apikey-in')?.value   || 'header';
    if (ki === 'header') headers[kn] = kv;
    else url += (url.includes('?') ? '&' : '?') + kn + '=' + encodeURIComponent(kv);
  }

  // Body
  let body = undefined;
  const bodyType = document.getElementById('pm-body-type')?.value || 'none';
  const rawBody  = document.getElementById('postman-body-editor')?.value?.trim();
  if (!['GET','HEAD'].includes(method) && rawBody && bodyType !== 'none') {
    body = rawBody;
    if (bodyType === 'json' && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    if (bodyType === 'form' && !headers['Content-Type']) headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  // UI feedback
  const resBody    = document.getElementById('postman-res-body');
  const resStatus  = document.getElementById('postman-status');
  const resTime    = document.getElementById('pm-res-time');
  const resSize    = document.getElementById('pm-res-size');
  const resHeaders = document.getElementById('postman-res-headers');
  if (resBody)   { resBody.style.color = 'var(--text-dim)'; resBody.textContent = '⏳ Sending…'; }
  if (resStatus) resStatus.textContent = '…';

  const t0 = Date.now();

  try {
    const opts = { method, headers };
    if (body) opts.body = body;
    const res  = await fetch(url, opts);
    const ms   = Date.now() - t0;
    const text = await res.text();
    const bytes = new Blob([text]).size;

    // Status colour
    const sc = res.status;
    const statusColor = sc < 300 ? '#6bcb77' : sc < 400 ? '#ffd93d' : '#ff6b6b';
    if (resStatus) { resStatus.textContent = `${sc} ${res.statusText}`; resStatus.style.color = statusColor; }
    if (resTime)   resTime.textContent  = `${ms}ms`;
    if (resSize)   resSize.textContent  = bytes < 1024 ? `${bytes} B` : `${(bytes/1024).toFixed(1)} KB`;

    // Pretty-print JSON
    if (resBody) {
      try {
        const parsed = JSON.parse(text);
        resBody.style.color = '#a8ff78';
        resBody.textContent = JSON.stringify(parsed, null, 2);
      } catch {
        resBody.style.color = '#e8e8f0';
        resBody.textContent = text;
      }
    }

    // Response headers
    if (resHeaders) {
      let hdrTxt = '';
      res.headers.forEach((v, k) => { hdrTxt += `${k}: ${v}\n`; });
      resHeaders.textContent = hdrTxt || '(no headers exposed by browser)';
    }

    // History
    pmAddHistory(method, rawUrl, sc);
    pmGenerateCurl(url, method, headers, body);

  } catch (err) {
    if (resStatus) { resStatus.textContent = 'Error'; resStatus.style.color = '#ff6b6b'; }
    if (resBody)   { resBody.style.color = '#ff6b6b'; resBody.textContent = `Request failed:\n${err.message}\n\nNote: Some URLs block cross-origin requests (CORS).\nTry: https://jsonplaceholder.typicode.com/posts/1`; }
    if (resTime)   resTime.textContent = `${Date.now() - t0}ms`;
  }
}

// ── History ──
function pmAddHistory(method, url, status) {
  pmHistory.unshift({ method, url, status, time: new Date().toLocaleTimeString() });
  if (pmHistory.length > 30) pmHistory.pop();
  pmRenderHistory();
}
function pmRenderHistory() {
  const list = document.getElementById('postman-history-list'); if (!list) return;
  const colors = { GET:'#48cfad', POST:'#ffd93d', PUT:'#5e81f4', DELETE:'#ff6b6b', PATCH:'#c77dff' };
  list.innerHTML = pmHistory.map((h, i) => `
    <div class="pm-hist-item" onclick="pmLoadHistory(${i})">
      <span class="pm-hist-method" style="color:${colors[h.method]||'#aaa'}">${h.method}</span>
      <span class="pm-hist-url">${h.url.replace(/^https?:\/\//, '')}</span>
      <span style="font-size:10px;color:${h.status<300?'#6bcb77':h.status<400?'#ffd93d':'#ff6b6b'}">${h.status}</span>
    </div>`).join('');
}
function pmLoadHistory(i) {
  const h = pmHistory[i]; if (!h) return;
  const urlEl = document.getElementById('postman-url');
  const mEl   = document.getElementById('postman-method');
  if (urlEl) urlEl.value = h.url;
  if (mEl)   { mEl.value = h.method; pmMethodColor(mEl); }
}
function pmClearHistory() { pmHistory = []; pmRenderHistory(); }

// ── cURL generation ──
function pmGenerateCurl(url, method, headers, body) {
  const out = document.getElementById('pm-curl-output'); if (!out) return;
  const u = url || document.getElementById('postman-url')?.value || '';
  const m = method || document.getElementById('postman-method')?.value || 'GET';
  const h = headers || pmGetKvPairs('headers');
  const b = body    || document.getElementById('postman-body-editor')?.value?.trim();
  let curl = `curl -X ${m} '${u}'`;
  Object.entries(h).forEach(([k, v]) => { if (k) curl += ` \\\n  -H '${k}: ${v}'`; });
  if (b) curl += ` \\\n  -d '${b.replace(/'/g, "\\'")}'`;
  out.value = curl;
}
function pmCopyCurl()     { const o = document.getElementById('pm-curl-output'); if (o) { navigator.clipboard?.writeText(o.value); showNotif('📋','Copied','cURL command copied'); } }
function pmCopyResponse() { const o = document.getElementById('postman-res-body'); if (o) { navigator.clipboard?.writeText(o.textContent); showNotif('📋','Copied','Response copied'); } }
