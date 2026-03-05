/* ═══════════════════════════════════════
   ArcOS — Editors: Text Editor, Code Editor, Browser
═══════════════════════════════════════ */

// ─── TEXT EDITOR ───────────────────────────────────────
function buildEditor() {
  return `<div id="editor-content">
    <div id="editor-toolbar">
      <button class="editor-btn" onclick="editorNew()">⬜ New</button>
      <button class="editor-btn" onclick="editorSave()">💾 Save</button>
      <button class="editor-btn" onclick="editorSaveLocal()">⬇️ Download</button>
      <input id="editor-filename" type="text" value="untitled.txt" placeholder="filename.txt">
      <select id="editor-theme" class="settings-select" onchange="updateEditorTheme(this.value)">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
        <option value="solarized">Solarized</option>
        <option value="monokai">Monokai</option>
      </select>
    </div>
    <textarea id="text-area" spellcheck="true" placeholder="Start typing…" oninput="updateEditorStatus()"></textarea>
    <div id="editor-status">
      <span id="ed-lines">Lines: 1</span>
      <span id="ed-words">Words: 0</span>
      <span id="ed-chars">Chars: 0</span>
      <span id="ed-saved" style="margin-left:auto;color:var(--text-dim)">● Unsaved</span>
    </div>
  </div>`;
}

function updateEditorStatus() {
  const ta = document.getElementById('text-area'); if (!ta) return;
  const v = ta.value;
  document.getElementById('ed-lines').textContent = 'Lines: ' + v.split('\n').length;
  document.getElementById('ed-words').textContent = 'Words: ' + v.trim().split(/\s+/).filter(Boolean).length;
  document.getElementById('ed-chars').textContent = 'Chars: ' + v.length;
  const saved = document.getElementById('ed-saved');
  if (saved) { saved.style.color = 'var(--yellow)'; saved.textContent = '● Unsaved'; }
}
function editorNew() {
  const ta = document.getElementById('text-area'); if (ta) ta.value = '';
  document.getElementById('editor-filename').value = 'untitled.txt';
}
function editorSave() {
  const fn = document.getElementById('editor-filename').value;
  const c = document.getElementById('text-area').value;
  const d = getCurrentDir();
  if (!d.children) d.children = {};
  d.children[fn] = { name:fn, icon:'📝', type:'file', content:c };
  const saved = document.getElementById('ed-saved');
  if (saved) { saved.style.color = 'var(--green)'; saved.textContent = '✓ Saved'; }
  showNotif('💾', 'Saved', fn);
}
function editorSaveLocal() {
  const fn = document.getElementById('editor-filename').value;
  const c = document.getElementById('text-area').value;
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(c);
  a.download = fn; a.click();
  showNotif('⬇️', 'Downloaded', fn);
}
function updateEditorTheme(t) {
  const ta = document.getElementById('text-area'); if (!ta) return;
  const themes = {
    dark:      { bg:'#0b0b16', color:'#e8e8f0' },
    light:     { bg:'#f0f0f8', color:'#1a1a2e' },
    solarized: { bg:'#002b36', color:'#839496' },
    monokai:   { bg:'#272822', color:'#f8f8f2' },
  };
  const s = themes[t] || themes.dark;
  ta.style.background = s.bg; ta.style.color = s.color;
}

// ─── CODE EDITOR ───────────────────────────────────────
// Supported: JavaScript (eval), HTML (preview), Markdown (preview),
//            Python (Pyodide WASM), CSS (preview), Bash (simulated),
//            SQL (sql.js), TypeScript (shown note), JSON (validate)
const CODE_SAMPLES = {
  JavaScript: `// ArcOS Code Editor — JavaScript
// Press ▶ Run to execute

console.log("Hello from ArcOS! 🐧");

const nums = [1,2,3,4,5];
const sum = nums.reduce((a,b) => a+b, 0);
console.log("Sum:", sum);

// Fibonacci
function fib(n) {
  if(n<=1) return n;
  return fib(n-1)+fib(n-2);
}
for(let i=0;i<10;i++)
  console.log(\`fib(\${i}) = \${fib(i)}\`);`,

  Python: `# ArcOS Code Editor — Python (Pyodide)
# Press ▶ Run to execute Python in your browser!

print("Hello from Python! 🐍")

# List comprehension
squares = [x**2 for x in range(10)]
print("Squares:", squares)

# Dictionary
person = {"name": "ArcOS User", "os": "ArcOS 6.2"}
for k, v in person.items():
    print(f"  {k}: {v}")

# Fibonacci
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        print(a, end=" ")
        a, b = b, a+b

print("\\nFibonacci:")
fib(10)`,

  HTML: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: sans-serif;
      background: linear-gradient(135deg,#1a1a2e,#16213e);
      color: #e8e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 16px;
      padding: 32px;
      text-align: center;
    }
    h1 { color: #5e81f4; margin-bottom: 8px; }
    button {
      background: #5e81f4; border: none; color: #fff;
      padding: 10px 24px; border-radius: 8px;
      font-size: 15px; cursor: pointer; margin-top: 16px;
    }
    button:hover { filter: brightness(1.2); }
  </style>
</head>
<body>
  <div class="card">
    <h1>ArcOS HTML Preview 🚀</h1>
    <p>Edit the code and press Run to update!</p>
    <button onclick="this.textContent='Clicked! ✓'">Click Me</button>
  </div>
</body>
</html>`,

  CSS: `/* CSS Preview — pairs with HTML tab */
/* This will be injected into the HTML preview */
body {
  background: #1a1a2e;
  color: #e8e8f0;
  font-family: 'Cantarell', sans-serif;
}
h1 { color: #c77dff; }
p  { color: rgba(232,232,240,.6); }`,

  Bash: `#!/bin/bash
# ArcOS Bash Simulator
# Commands are routed through the ArcOS terminal

echo "Hello from Bash! 🐚"
echo "Current user: arcuser"
echo "OS: ArcOS 6.2.0"

for i in 1 2 3 4 5; do
  echo "Line $i"
done

# Note: runs in the ArcOS shell simulator`,

  SQL: `-- ArcOS SQL Editor (SQLite via sql.js)
-- Press ▶ Run to execute

CREATE TABLE IF NOT EXISTS users (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user'
);

INSERT INTO users (name, role) VALUES
  ('Alice',  'admin'),
  ('Bob',    'user'),
  ('Charlie','user');

SELECT * FROM users;

SELECT role, COUNT(*) as count
FROM users GROUP BY role;`,

  TypeScript: `// TypeScript — transpiled in browser
// Press ▶ Run

interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}! (\${user.email})\`;
}

const user: User = {
  id: 1,
  name: "ArcOS User",
  email: "user@arcos.os"
};

console.log(greetUser(user));

// Array with generics
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
console.log(first([10, 20, 30]));`,

  JSON: `{
  "name": "ArcOS",
  "version": "6.2.0",
  "features": [
    "Terminal",
    "Code Editor",
    "API Tester",
    "Paint",
    "Games"
  ],
  "settings": {
    "theme": "dark",
    "accent": "#5e81f4",
    "animations": true
  },
  "stats": {
    "apps": 24,
    "ram": "unlimited"
  }
}`,

  Markdown: `# ArcOS Markdown Editor

## Features

- **Live Preview** as you type
- *Italic*, **Bold**, ~~Strikethrough~~
- \`inline code\` and code blocks

## Code Example

\`\`\`javascript
console.log("Hello from ArcOS!");
\`\`\`

## Table

| App | Type | Status |
|-----|------|--------|
| Terminal | System | ✅ Running |
| Code Editor | Dev | ✅ Running |
| API Tester | Dev | ✅ Running |

> ArcOS — The browser Linux desktop

[Visit GitHub](https://github.com)`,
};

let pyodideReady = false, pyodideInstance = null;
let sqlReady = false, sqlDB = null;

function buildCode() {
  const langs = ['JavaScript','Python','HTML','CSS','Bash','SQL','TypeScript','JSON','Markdown'];
  return `<div id="code-content">
    <div id="code-toolbar">
      <select id="code-lang" class="settings-select" onchange="codeLangChanged(this.value)">
        ${langs.map(l => `<option>${l}</option>`).join('')}
      </select>
      <button class="editor-btn" onclick="newCodeFile()">New</button>
      <button class="editor-btn" onclick="downloadCode()">⬇️ Download</button>
      <button class="editor-btn" onclick="loadCodeSample()">📄 Sample</button>
      <button id="code-run" style="background:var(--green);border:none;color:#000;padding:5px 14px;border-radius:7px;cursor:pointer;font-size:12px;font-family:inherit;font-weight:700;" onclick="runCode()">▶ Run</button>
      <button id="code-preview-toggle" style="background:var(--card);border:1px solid var(--border);color:var(--text);padding:5px 14px;border-radius:7px;cursor:pointer;font-size:12px;font-family:inherit;" onclick="toggleCodePreview()">⊞ Preview</button>
      <select class="settings-select" onchange="document.getElementById('code-area').style.fontSize=this.value+'px'">
        <option value="11">11px</option><option value="13" selected>13px</option><option value="15">15px</option>
      </select>
    </div>
    <div id="code-area-wrap">
      <div id="line-nums">1</div>
      <textarea id="code-area" spellcheck="false" oninput="updateLineNums()" onkeydown="codeKeyDown(event)"></textarea>
      <iframe id="code-preview-pane" sandbox="allow-scripts allow-same-origin"></iframe>
    </div>
    <div id="code-output">
      <div style="color:var(--text-dim);font-size:11px;margin-bottom:5px;display:flex;justify-content:space-between;align-items:center;">
        <span>▶ Output</span>
        <span id="code-lang-badge" style="background:var(--accent);color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">JavaScript</span>
      </div>
      <div id="code-output-content"></div>
    </div>
  </div>`;
}

function initCode() {
  const ca = document.getElementById('code-area');
  if (ca) { ca.value = CODE_SAMPLES.JavaScript; updateLineNums(); }
}

function codeLangChanged(lang) {
  const badge = document.getElementById('code-lang-badge');
  if (badge) badge.textContent = lang;
  const preview = document.getElementById('code-preview-pane');
  if (['HTML','Markdown'].includes(lang)) {
    if (preview) preview.style.display = 'block';
  } else {
    if (preview) preview.style.display = 'none';
  }
}

function loadCodeSample() {
  const lang = document.getElementById('code-lang').value;
  const ca   = document.getElementById('code-area');
  if (ca && CODE_SAMPLES[lang]) { ca.value = CODE_SAMPLES[lang]; updateLineNums(); }
}

function toggleCodePreview() {
  const p = document.getElementById('code-preview-pane');
  if (!p) return;
  p.style.display = p.style.display === 'block' ? 'none' : 'block';
}

function updateLineNums() {
  const ca = document.getElementById('code-area');
  const ln = document.getElementById('line-nums');
  if (!ca || !ln) return;
  const n = ca.value.split('\n').length;
  ln.innerHTML = Array.from({ length: n }, (_, i) => i + 1).join('<br>');
}

function codeKeyDown(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const ca = e.target; const s = ca.selectionStart;
    ca.value = ca.value.slice(0, s) + '  ' + ca.value.slice(ca.selectionEnd);
    ca.selectionStart = ca.selectionEnd = s + 2;
    updateLineNums();
  }
}

async function runCode() {
  const ca  = document.getElementById('code-area');
  const out = document.getElementById('code-output-content');
  if (!ca || !out) return;
  const lang = document.getElementById('code-lang').value;
  const code = ca.value;
  out.style.color = '#a8ff78';
  out.textContent = 'Running…';

  // ── JavaScript ──
  if (lang === 'JavaScript') {
    const logs = [];
    const origLog = console.log;
    console.log = (...a) => { logs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)).join(' ')); origLog(...a); };
    try { eval(code); out.textContent = logs.join('\n') || '(no output)'; }
    catch (err) { out.style.color = 'var(--red)'; out.textContent = 'Error: ' + err.message; }
    finally { console.log = origLog; }
    return;
  }

  // ── HTML / CSS ──
  if (lang === 'HTML' || lang === 'CSS') {
    const iframe = document.getElementById('code-preview-pane');
    if (iframe) {
      iframe.style.display = 'block';
      const doc = lang === 'HTML' ? code : `<style>${code}</style><body style="background:#1a1a2e;color:#e8e8f0;padding:20px;font-family:sans-serif">CSS Preview applied</body>`;
      iframe.srcdoc = doc;
      out.textContent = `✓ ${lang} rendered in preview pane above`;
    }
    return;
  }

  // ── Markdown ──
  if (lang === 'Markdown') {
    const iframe = document.getElementById('code-preview-pane');
    if (iframe) {
      iframe.style.display = 'block';
      const rendered = simpleMarkdown(code);
      iframe.srcdoc = `<!DOCTYPE html><html><head><style>body{font-family:sans-serif;background:#13131f;color:#e8e8f0;padding:24px;line-height:1.7;}h1,h2,h3{color:#5e81f4;margin-bottom:8px;}code{background:rgba(255,255,255,.1);padding:2px 6px;border-radius:4px;font-family:monospace;}pre{background:rgba(0,0,0,.4);padding:12px;border-radius:8px;overflow-x:auto;}blockquote{border-left:3px solid #5e81f4;padding-left:12px;color:rgba(232,232,240,.6);}a{color:#c77dff;}table{border-collapse:collapse;width:100%;}td,th{border:1px solid rgba(255,255,255,.1);padding:6px 12px;}</style></head><body>${rendered}</body></html>`;
      out.textContent = '✓ Markdown rendered in preview pane';
    }
    return;
  }

  // ── Python via Pyodide ──
  if (lang === 'Python') {
    if (!pyodideInstance) {
      out.textContent = '⏳ Loading Python runtime (Pyodide)… first run may take a moment.';
      try {
        if (typeof loadPyodide === 'undefined') {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
          document.head.appendChild(s);
          await new Promise((res, rej) => { s.onload = res; s.onerror = () => rej(new Error('Failed to load Pyodide')); });
        }
        out.textContent = '⏳ Initializing Python…';
        pyodideInstance = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/' });
        pyodideReady = true;
        out.textContent = '✓ Python ready!';
      } catch (e) {
        out.style.color = 'var(--red)';
        out.textContent = 'Could not load Pyodide: ' + e.message + '\n\nNote: Pyodide requires a network connection (~10MB download on first use).';
        return;
      }
    }
    try {
      let captured = '';
      pyodideInstance.globals.set('_arc_output', []);
      const wrappedCode = `
import sys
from io import StringIO
_buf = StringIO()
sys.stdout = _buf
try:
${code.split('\n').map(l => '    ' + l).join('\n')}
finally:
    sys.stdout = sys.__stdout__
_arc_output = _buf.getvalue()
`;
      await pyodideInstance.runPythonAsync(wrappedCode);
      captured = pyodideInstance.globals.get('_arc_output') || '';
      out.style.color = '#a8ff78';
      out.textContent = captured || '(no output)';
    } catch (e) {
      out.style.color = 'var(--red)';
      out.textContent = 'Python Error:\n' + e.message;
    }
    return;
  }

  // ── SQL via sql.js ──
  if (lang === 'SQL') {
    if (!sqlDB) {
      out.textContent = '⏳ Loading SQLite (sql.js)…';
      try {
        if (typeof initSqlJs === 'undefined') {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js';
          document.head.appendChild(s);
          await new Promise((res, rej) => { s.onload = res; s.onerror = () => rej(new Error('Failed to load sql.js')); });
        }
        const SQL = await initSqlJs({ locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}` });
        sqlDB = new SQL.Database();
        sqlReady = true;
      } catch (e) {
        out.style.color = 'var(--red)';
        out.textContent = 'Could not load sql.js: ' + e.message;
        return;
      }
    }
    try {
      const results = sqlDB.exec(code);
      if (!results.length) { out.textContent = '✓ Query executed (no rows returned)'; return; }
      let txt = '';
      results.forEach(res => {
        txt += res.columns.join(' | ') + '\n';
        txt += res.columns.map(c => '-'.repeat(c.length + 2)).join('-') + '\n';
        res.values.forEach(row => { txt += row.join(' | ') + '\n'; });
        txt += `\n(${res.values.length} row${res.values.length !== 1 ? 's' : ''})\n\n`;
      });
      out.style.color = '#a8ff78'; out.textContent = txt;
    } catch (e) {
      out.style.color = 'var(--red)'; out.textContent = 'SQL Error: ' + e.message;
    }
    return;
  }

  // ── TypeScript ──
  if (lang === 'TypeScript') {
    if (typeof ts === 'undefined') {
      out.textContent = '⏳ Loading TypeScript compiler…';
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/typescript/5.3.3/typescript.min.js';
      document.head.appendChild(s);
      await new Promise((res, rej) => { s.onload = res; s.onerror = () => rej(new Error('Failed to load TypeScript')); });
    }
    try {
      const jsCode = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.None, target: ts.ScriptTarget.ES2020 } }).outputText;
      const logs = [];
      const origLog = console.log;
      console.log = (...a) => { logs.push(a.map(x => String(x)).join(' ')); origLog(...a); };
      try { eval(jsCode); out.style.color = '#a8ff78'; out.textContent = logs.join('\n') || '(no output)'; }
      catch (err) { out.style.color = 'var(--red)'; out.textContent = 'Runtime Error: ' + err.message; }
      finally { console.log = origLog; }
    } catch (e) {
      out.style.color = 'var(--red)'; out.textContent = 'TypeScript Error: ' + e.message;
    }
    return;
  }

  // ── Bash (simulated) ──
  if (lang === 'Bash') {
    const lines = code.split('\n');
    const results = [];
    lines.forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      if (line.startsWith('echo ')) results.push(line.slice(5).replace(/['"]/g, ''));
      else if (line === 'ls') results.push(Object.keys(getCurrentDir().children || {}).join('  ') || '(empty)');
      else if (line === 'pwd') results.push('/' + cwd.join('/'));
      else if (line === 'whoami') results.push(currentUser);
      else if (line === 'date') results.push(new Date().toString());
      else if (line.startsWith('for ') || line.startsWith('do') || line.startsWith('done')) results.push('(bash loop simulated)');
      else results.push(`[bash] ${line}`);
    });
    out.style.color = '#a8ff78'; out.textContent = results.join('\n') || '(no output)';
    return;
  }

  // ── JSON ──
  if (lang === 'JSON') {
    try {
      const parsed = JSON.parse(code);
      out.style.color = '#a8ff78';
      out.textContent = '✓ Valid JSON\n\n' + JSON.stringify(parsed, null, 2);
    } catch (e) {
      out.style.color = 'var(--red)';
      out.textContent = '✗ Invalid JSON: ' + e.message;
    }
    return;
  }

  out.style.color = 'var(--yellow)';
  out.textContent = `${lang} support: use the Run button above for JS/Python/HTML/SQL/TypeScript/Bash/JSON.`;
}

// Very simple markdown → HTML converter
function simpleMarkdown(md) {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hbupoli])/gm, '')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
}

function newCodeFile()  { const ca = document.getElementById('code-area'); if (ca) { ca.value = ''; updateLineNums(); } }
function downloadCode() {
  const ca   = document.getElementById('code-area');
  const lang = document.getElementById('code-lang').value;
  const exts = { JavaScript:'js', Python:'py', HTML:'html', CSS:'css', Bash:'sh', SQL:'sql', TypeScript:'ts', JSON:'json', Markdown:'md' };
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(ca.value);
  a.download = 'code.' + (exts[lang] || 'txt');
  a.click();
}

// ─── BROWSER ────────────────────────────────────────────
function buildBrowser() {
  return `<div id="browser-content">
    <div id="browser-bar">
      <button class="browser-nav" title="Back">◀</button>
      <button class="browser-nav" title="Forward">▶</button>
      <button class="browser-nav" title="Refresh" onclick="document.getElementById('browser-frame')?.contentWindow.location.reload()">↻</button>
      <input id="browser-url" type="text" placeholder="Search DuckDuckGo or enter URL…" onkeydown="if(event.key==='Enter')browserGo()">
      <button id="browser-go" onclick="browserGo()">Go</button>
    </div>
    <div id="browser-home">
      <div style="font-size:48px;margin-bottom:4px">🦆</div>
      <div style="font-size:22px;font-weight:700;margin-bottom:4px">ArcOS Browser</div>
      <div style="color:var(--text-dim);font-size:13px;margin-bottom:16px">Powered by DuckDuckGo</div>
      <div style="display:flex;gap:8px;width:100%;max-width:500px">
        <input id="browser-search-input" type="text" placeholder="Search the web…"
          onkeydown="if(event.key==='Enter')browserSearch(this.value)"
          style="flex:1;padding:10px 16px;background:rgba(255,255,255,.08);border:1px solid var(--border);border-radius:24px;color:var(--text);font-size:14px;font-family:inherit;outline:none;">
        <button onclick="browserSearch(document.getElementById('browser-search-input').value)"
          style="background:var(--accent);border:none;color:#fff;padding:10px 20px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:600">Search</button>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:12px">
        <a style="padding:6px 14px;background:var(--card);border:1px solid var(--border);border-radius:20px;color:var(--text-dim);cursor:pointer;font-size:12px;text-decoration:none" href="#" onclick="loadUrl('https://github.com')">🐙 GitHub</a>
        <a style="padding:6px 14px;background:var(--card);border:1px solid var(--border);border-radius:20px;color:var(--text-dim);cursor:pointer;font-size:12px;text-decoration:none" href="#" onclick="loadUrl('https://news.ycombinator.com')">📰 Hacker News</a>
        <a style="padding:6px 14px;background:var(--card);border:1px solid var(--border);border-radius:20px;color:var(--text-dim);cursor:pointer;font-size:12px;text-decoration:none" href="#" onclick="loadUrl('https://developer.mozilla.org')">📚 MDN</a>
        <a style="padding:6px 14px;background:var(--card);border:1px solid var(--border);border-radius:20px;color:var(--text-dim);cursor:pointer;font-size:12px;text-decoration:none" href="#" onclick="loadUrl('https://jsonplaceholder.typicode.com')">🧪 JSON API</a>
      </div>
    </div>
    <iframe id="browser-frame" style="display:none;flex:1;border:none;background:#fff" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
  </div>`;
}
function initBrowser() {}
function browserGo() {
  const u = document.getElementById('browser-url').value.trim(); if (!u) return;
  if (u.includes(' ') || !u.includes('.')) { browserSearch(u); return; }
  loadUrl(u.startsWith('http') ? u : 'https://' + u);
}
function browserSearch(q) {
  if (!q) return;
  loadUrl('https://duckduckgo.com/?q=' + encodeURIComponent(q));
  document.getElementById('browser-url').value = 'https://duckduckgo.com/?q=' + encodeURIComponent(q);
}
function loadUrl(url) {
  const f = document.getElementById('browser-frame');
  const h = document.getElementById('browser-home');
  if (!f || !h) return;
  f.src = url;
  f.style.cssText = 'flex:1;border:none;background:#fff;display:block';
  h.style.display = 'none';
  document.getElementById('browser-url').value = url;
  showNotif('🌐', 'Browser', 'Loading…');
}
