/* ═══════════════════════════════════════
   ArcOS — Terminal
═══════════════════════════════════════ */

let termHistory = [], termHistIdx = -1;

function buildTerminal() {
  return `<div id="terminal-content" onclick="document.getElementById('term-input')?.focus()">
    <div id="term-output"></div>
    <div id="term-input-row">
      <span id="term-prompt">arcuser@arcos:~$ </span>
      <input id="term-input" type="text" autocomplete="off" spellcheck="false"
        onkeydown="termKey(event)">
    </div>
  </div>`;
}

function initTerminal() {
  setTimeout(() => {
    addLine('<span style="color:#5e81f4;font-weight:700">╔══════════════════════════════════╗</span>');
    addLine('<span style="color:#5e81f4;font-weight:700">║     Welcome to ArcOS Terminal    ║</span>');
    addLine('<span style="color:#5e81f4;font-weight:700">╚══════════════════════════════════╝</span>');
    addLine('<span style="color:#48cfad">Type <b style="color:#ffd93d">help</b> for commands, <b style="color:#ffd93d">neofetch</b> for system info</span>');
    addLine('');
    scrollTerminal();
  }, 80);
}

function termKey(e) {
  const inp = document.getElementById('term-input'); if (!inp) return;
  if (e.key === 'Enter') {
    const cmd = inp.value.trim();
    if (cmd) { termHistory.unshift(cmd); termHistIdx = -1; }
    inp.value = ''; runCmd(cmd);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (termHistIdx < termHistory.length - 1) { termHistIdx++; inp.value = termHistory[termHistIdx]; }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (termHistIdx > 0) { termHistIdx--; inp.value = termHistory[termHistIdx]; }
    else { termHistIdx = -1; inp.value = ''; }
  } else if (e.key === 'Tab') {
    e.preventDefault(); tabComplete(inp);
  }
}

function tabComplete(inp) {
  const v = inp.value;
  const commands = ['ls','cd','cat','echo','pwd','mkdir','rm','touch','clear','help','whoami','date','uname','ps','history','man','grep','head','tail','wc','neofetch','write','open','apps'];
  const match = commands.filter(c => c.startsWith(v));
  if (match.length === 1) inp.value = match[0] + ' ';
  else if (match.length > 1) addLine(match.join('  '), 'info');
}

function runCmd(cmd) {
  const pathStr = cwd.length > 1 ? '/' + cwd.slice(1).join('/') : '';
  const prompt = `<span style="color:#5e81f4">arcuser@arcos</span><span style="color:#aaa">:</span><span style="color:#48cfad">~${pathStr}</span><span style="color:#e8e8f0">$</span> `;
  addLine(prompt + (cmd || ''));
  if (!cmd) return;
  const parts = cmd.trim().split(/\s+/);
  const base  = parts[0];

  const cmds = {
    help: () => {
      addLine('─── ArcOS Shell Commands ───', 'info');
      ['ls','cd <dir>','cat <file>','mkdir <n>','rm <n>','touch <n>','echo <text>',
       'pwd','clear','whoami','date','uname -a','ps','neofetch','history',
       'man <cmd>','head <file>','tail <file>','wc <file>',
       'grep <pat> <file>','write <file> <text>',
       'open <app>  — launch any app',
       'apps        — list all apps'
      ].forEach(c => addLine('  ' + c));
    },
    apps: () => {
      addLine('─── Installed Apps ───', 'info');
      APP_DEFS.forEach(a => addLine(`  <span style="color:#48cfad">${a.id.padEnd(14)}</span> ${a.name}`));
    },
    open: () => {
      const appId = parts[1];
      const found = APP_DEFS.find(a => a.id === appId);
      if (!found) { addLine(`open: '${appId}' not found — run 'apps' to list available apps`, 'err'); return; }
      openApp(appId);
      addLine(`Launched ${found.name}`, 'info');
    },
    ls: () => {
      const dir = getCurrentDir();
      const entries = Object.values(dir.children || {});
      if (!entries.length) { addLine('(empty)', 'info'); return; }
      addLine(entries.map(f => f.type === 'dir'
        ? `<span style="color:#5e81f4">${f.name}/</span>`
        : `<span style="color:#e0e0e0">${f.name}</span>`
      ).join('  '));
    },
    pwd:     () => addLine('/' + cwd.join('/')),
    whoami:  () => addLine(currentUser),
    date:    () => addLine(new Date().toString()),
    clear:   () => { document.getElementById('term-output').innerHTML = ''; },
    history: () => termHistory.forEach((h, i) => addLine(`${termHistory.length - i}  ${h}`)),
    echo:    () => addLine(parts.slice(1).join(' ')),
    'uname': () => addLine('ArcOS 6.2.0-arcos #1 SMP x86_64 GNU/Linux'),
    neofetch: () => {
      addLine(`<pre style="color:#5e81f4;font-size:12px;line-height:1.5">   .-.     <span style="color:#e8e8f0">arcuser<span style="color:#aaa">@</span>arcos</span>
  (o o)    <span style="color:#aaa">─────────────────────</span>
   |>|     <span style="color:#5e81f4">OS</span>: ArcOS 6.2.0
  /   \\    <span style="color:#5e81f4">Kernel</span>: 6.2.0-arcos-desktop
 (_\\_/_)   <span style="color:#5e81f4">Shell</span>: arcsh 2.1
           <span style="color:#5e81f4">WM</span>: ArcGNOME 44.2
           <span style="color:#5e81f4">Apps</span>: ${APP_DEFS.length} installed
           <span style="color:#5e81f4">CPU</span>: Browser Engine × ∞
           <span style="color:#5e81f4">Memory</span>: Unlimited RAM™</pre>`);
    },
    ps: () => {
      addLine('PID   TTY   TIME     CMD', 'info');
      [['1','?','00:00:01','init'],['42','?','00:00:00','arcwm'],['99','pts/0','00:00:00','arcsh'],['201','?','00:00:03','browser-engine']].forEach(([p,t,ti,c]) => addLine(`${p.padEnd(6)}${t.padEnd(6)}${ti.padEnd(9)}${c}`));
    },
    cd: () => {
      const t = parts[1];
      if (!t || t === '~') { cwd = ['home']; updatePrompt(); return; }
      if (t === '..') { if (cwd.length > 1) { cwd.pop(); updatePrompt(); } return; }
      const dir = getCurrentDir();
      if (dir.children && dir.children[t] && dir.children[t].type === 'dir') { cwd.push(t); updatePrompt(); }
      else addLine(`cd: ${t}: No such directory`, 'err');
    },
    cat: () => {
      const f = parts[1]; if (!f) { addLine('Usage: cat <file>', 'err'); return; }
      const d = getCurrentDir(); const file = d.children?.[f];
      if (!file) { addLine(`cat: ${f}: No such file`, 'err'); return; }
      if (file.type === 'dir') { addLine(`cat: ${f}: Is a directory`, 'err'); return; }
      (file.content || '(empty)').split('\n').forEach(l => addLine(l));
    },
    mkdir: () => {
      const n = parts[1]; if (!n) { addLine('Usage: mkdir <n>', 'err'); return; }
      const d = getCurrentDir(); if (!d.children) d.children = {};
      d.children[n] = { name:n, icon:'📁', type:'dir', children:{} };
      addLine(`mkdir: created '${n}'`, 'info');
    },
    touch: () => {
      const n = parts[1]; if (!n) { addLine('Usage: touch <n>', 'err'); return; }
      const d = getCurrentDir(); if (!d.children) d.children = {};
      d.children[n] = { name:n, icon:'📝', type:'file', content:'' };
      addLine(`touch: created '${n}'`, 'info');
    },
    rm: () => {
      const n = parts[1]; if (!n) { addLine('Usage: rm <n>', 'err'); return; }
      const d = getCurrentDir();
      if (d.children?.[n]) { delete d.children[n]; addLine(`rm: removed '${n}'`, 'info'); }
      else addLine(`rm: ${n}: No such file`, 'err');
    },
    write: () => {
      const n = parts[1]; const t = parts.slice(2).join(' ');
      if (!n || !t) { addLine('Usage: write <file> <text>', 'err'); return; }
      const d = getCurrentDir(); if (!d.children) d.children = {};
      d.children[n] = { name:n, icon:'📝', type:'file', content:t };
      addLine(`Wrote to '${n}'`, 'info');
    },
    man: () => {
      const t = parts[1]; if (!t) { addLine('What manual page?', 'err'); return; }
      addLine(`${t.toUpperCase()}(1)        ArcOS Manual        ${t.toUpperCase()}(1)`, 'info');
      addLine(`\nNAME\n    ${t} – command in ArcOS\n\nSYNOPSIS\n    ${t} [OPTIONS]... [ARGS]...\n\nDESCRIPTION\n    Simulated man page for ${t}.`);
    },
    head: () => {
      const f = parts[1]; if (!f) { addLine('Usage: head <file>', 'err'); return; }
      const file = getCurrentDir().children?.[f];
      if (!file || file.type === 'dir') { addLine(`head: ${f}: No such file`, 'err'); return; }
      (file.content || '').split('\n').slice(0, 10).forEach(l => addLine(l));
    },
    tail: () => {
      const f = parts[1]; if (!f) { addLine('Usage: tail <file>', 'err'); return; }
      const file = getCurrentDir().children?.[f];
      if (!file || file.type === 'dir') { addLine(`tail: ${f}: No such file`, 'err'); return; }
      const lines = (file.content || '').split('\n');
      lines.slice(Math.max(0, lines.length - 10)).forEach(l => addLine(l));
    },
    wc: () => {
      const f = parts[1]; if (!f) { addLine('Usage: wc <file>', 'err'); return; }
      const file = getCurrentDir().children?.[f];
      if (!file || file.type === 'dir') { addLine(`wc: ${f}: No such file`, 'err'); return; }
      const c = file.content || '';
      addLine(`  ${c.split('\n').length}  ${c.split(/\s+/).filter(Boolean).length}  ${c.length}  ${f}`);
    },
    grep: () => {
      const p = parts[1]; const f = parts[2];
      if (!p || !f) { addLine('Usage: grep <pat> <file>', 'err'); return; }
      const file = getCurrentDir().children?.[f];
      if (!file || file.type === 'dir') { addLine(`grep: ${f}: No such file`, 'err'); return; }
      (file.content || '').split('\n').forEach((l, i) => {
        if (l.includes(p)) addLine(`${i+1}:${l.replace(new RegExp(p,'g'), `<span style="background:#ffd93d;color:#000">${p}</span>`)}`);
      });
    },
  };

  if (cmds[base]) cmds[base]();
  else addLine(`${base}: command not found — type <b>help</b>`, 'err');
  scrollTerminal();
}

function addLine(html, cls = '') {
  const out = document.getElementById('term-output'); if (!out) return;
  const d = document.createElement('div');
  d.className = 'term-line' + (cls ? ' ' + cls : '');
  d.innerHTML = html;
  out.appendChild(d);
}
function scrollTerminal() {
  const t = document.getElementById('terminal-content');
  if (t) t.scrollTop = t.scrollHeight;
}
