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
  const commands = [
    'ls','cd','cat','echo','pwd','mkdir','rm','rmdir','touch','clear','help',
    'whoami','date','uname','ps','history','man','grep','head','tail','wc',
    'neofetch','write','open','apps','curl','ping','ifconfig','netstat',
    'top','kill','killall','sleep','cal','uptime','df','du','free',
    'hostname','env','export','which','alias','unalias','chmod','chown',
    'find','sort','uniq','cut','awk','sed','tr','base64','md5','sha256',
    'zip','unzip','tar','wget','ssh','scp','git','npm','node','python',
    'java','gcc','make','vim','nano','code','calc','weather','matrix',
    'cowsay','fortune','sl','yes','banner','figlet','lolcat','hack',
    'sudo','su','passwd','useradd','userdel','groups','id',
  ];
  const match = commands.filter(c => c.startsWith(v));
  if (match.length === 1) inp.value = match[0] + ' ';
  else if (match.length > 1) { addLine(match.join('  '), 'info'); }
}

function runCmd(cmd) {
  const pathStr = cwd.length > 1 ? '/' + cwd.slice(1).join('/') : '';
  const prompt = `<span style="color:#5e81f4">arcuser@arcos</span><span style="color:#aaa">:</span><span style="color:#48cfad">~${pathStr}</span><span style="color:#e8e8f0">$ </span>`;
  addLine(prompt + (cmd ? escapeHtml(cmd) : ''));
  if (!cmd) return;
  const parts = cmd.trim().split(/\s+/);
  const base  = parts[0];
  const pipe  = cmd.includes('|');

  const cmds = {
    help: () => {
      addLine(`<span style="color:#5e81f4;font-weight:700">╔═══════════════════════════════════════╗</span>`);
      addLine(`<span style="color:#5e81f4;font-weight:700">║        ArcOS Shell v2.1               ║</span>`);
      addLine(`<span style="color:#5e81f4;font-weight:700">╚═══════════════════════════════════════╝</span>`);
      const cats = [
        ['File System',['ls [dir]','cd <dir>','cat <file>','mkdir <dir>','rmdir <dir>','rm <file>','touch <file>','cp <src> <dst>','mv <src> <dst>','find <pat>','tree','du','df']],
        ['Text',['echo <text>','grep <pat> <file>','head <file>','tail <file>','wc <file>','sort <file>','uniq','cut','sed','awk','tr','base64']],
        ['System',['pwd','whoami','date','uname -a','uptime','ps','top','kill <pid>','killall <name>','free','df -h','hostname','env','id','groups','history','clear']],
        ['Network',['ifconfig','ping <host>','netstat','curl <url>','wget <url>','ssh <host>','scp']],
        ['Dev',['git status','git log','npm install','node <file>','python <file>','gcc <file>','make']],
        ['Fun',['neofetch','matrix','cowsay <msg>','fortune','sl','yes <text>','lolcat','hack','banner <text>','figlet <text>','weather']],
        ['Apps',['open <app>','apps','code <file>','vim <file>','nano <file>','calc <expr>']],
      ];
      cats.forEach(([cat, list]) => {
        addLine(`<span style="color:#ffd93d;font-weight:700">  ${cat}</span>`);
        addLine('    ' + list.map(c=>`<span style="color:#48cfad">${c}</span>`).join('  '));
      });
    },
    apps: () => {
      addLine('─── Installed Applications ─────────────────', 'info');
      const bycat = {};
      APP_DEFS.forEach(a => { if (!bycat[a.cat]) bycat[a.cat]=[]; bycat[a.cat].push(a); });
      Object.entries(bycat).forEach(([cat, list]) => {
        addLine(`<span style="color:#ffd93d">  ${cat}</span>`);
        list.forEach(a => addLine(`    <span style="color:#48cfad">${a.id.padEnd(16)}</span><span style="color:#aaa">${a.name}</span>`));
      });
    },
    open: () => {
      const appId = parts[1];
      if (!appId) { addLine('Usage: open <appid>  (run "apps" to list)', 'err'); return; }
      const found = APP_DEFS.find(a => a.id === appId);
      if (!found) { addLine(`open: '${appId}': not found — run 'apps' to list`, 'err'); return; }
      openApp(appId);
      addLine(`<span style="color:#48cfad">Launched</span> ${found.name}`, 'info');
    },
    ls: () => {
      const dir = getCurrentDir();
      const entries = Object.values(dir.children || {});
      if (!entries.length) { addLine('<span style="color:#aaa">(empty)</span>'); return; }
      const cols = entries.map(f => f.type==='dir'
        ? `<span style="color:#5e81f4;font-weight:700">${f.name}/</span>`
        : `<span style="color:#e0e0e0">${f.name}</span>`);
      addLine(cols.join('  '));
    },
    tree: () => {
      const print = (dir, prefix='') => {
        Object.values(dir.children||{}).forEach((f,i,arr) => {
          const last = i===arr.length-1;
          addLine(prefix + (last?'└── ':'├── ') + (f.type==='dir'?`<span style="color:#5e81f4">${f.name}/</span>`:`<span style="color:#e0e0e0">${f.name}</span>`));
          if (f.type==='dir') print(f, prefix+(last?'    ':'│   '));
        });
      };
      addLine('<span style="color:#48cfad">.</span>');
      print(getCurrentDir());
    },
    pwd:     () => addLine('/' + cwd.join('/')),
    whoami:  () => addLine(currentUser),
    hostname:() => addLine('arcos-desktop'),
    date:    () => addLine(new Date().toLocaleString() + ' ' + Intl.DateTimeFormat().resolvedOptions().timeZone),
    clear:   () => { document.getElementById('term-output').innerHTML = ''; },
    history: () => termHistory.forEach((h, i) => addLine(`<span style="color:#aaa;min-width:4ch;display:inline-block">${termHistory.length - i}</span>  ${escapeHtml(h)}`)),
    echo:    () => addLine(parts.slice(1).join(' ')),
    id:      () => addLine('uid=1000(arcuser) gid=1000(arcuser) groups=1000(arcuser),4(adm),27(sudo)'),
    groups:  () => addLine('arcuser sudo adm admin wheel plugdev'),
    env:     () => { ['HOME=/home/arcuser','USER=arcuser','SHELL=/bin/arcsh','TERM=xterm-256color','LANG=en_US.UTF-8','PATH=/usr/bin:/bin:/usr/local/bin','EDITOR=vim','DISPLAY=:0'].forEach(e=>addLine(e)); },
    uptime:  () => { const s=Math.floor(performance.now()/1000); addLine(` ${new Date().toLocaleTimeString()}  up ${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}min,  1 user,  load average: 0.12, 0.08, 0.05`); },
    free:    () => {
      addLine('              total        used        free      shared  buff/cache   available', 'info');
      addLine('Mem:          16384        4221       10112         256        2051       11802');
      addLine('Swap:          2048           0        2048');
    },
    df:      () => {
      addLine('Filesystem      Size  Used Avail Use% Mounted on', 'info');
      addLine('/dev/sda1       128G   42G   82G  34% /');
      addLine('tmpfs           8.0G  1.2G  6.8G  15% /tmp');
      addLine('/dev/sdb1       500G  210G  290G  42% /home');
    },
    du:      () => { const f=parts[1]||'.'; addLine(`4.0K\t${f}`); },
    'uname': () => {
      const flag = parts[1];
      if (flag==='-a') addLine('ArcOS arcos-desktop 6.2.0-arcos #1 SMP x86_64 GNU/Linux');
      else if (flag==='-r') addLine('6.2.0-arcos');
      else if (flag==='-s') addLine('ArcOS');
      else addLine('ArcOS');
    },
    neofetch: () => {
      addLine(`<pre style="color:#5e81f4;font-size:12px;line-height:1.6">   ██████╗   <span style="color:#e8e8f0;font-weight:700">arcuser</span><span style="color:#aaa">@</span><span style="color:#e8e8f0;font-weight:700">arcos</span>
  ██╔══██╗  <span style="color:#aaa">─────────────────────────────</span>
  ███████║  <span style="color:#5e81f4;font-weight:700">OS</span>: ArcOS 6.2.0-arcos x86_64
  ██╔══██║  <span style="color:#5e81f4;font-weight:700">Kernel</span>: 6.2.0-arcos-SMP
  ██║  ██║  <span style="color:#5e81f4;font-weight:700">Shell</span>: arcsh 2.1.0
  ╚═╝  ╚═╝  <span style="color:#5e81f4;font-weight:700">WM</span>: ArcGNOME 44.2 (X11)
            <span style="color:#5e81f4;font-weight:700">Terminal</span>: ArcTerm 1.0
            <span style="color:#5e81f4;font-weight:700">Apps</span>: ${APP_DEFS.length} installed
            <span style="color:#5e81f4;font-weight:700">CPU</span>: Browser Engine v8 (∞) @ ∞GHz
            <span style="color:#5e81f4;font-weight:700">Memory</span>: ${Math.round(performance.now()/100)}MB / Unlimited™
            <span style="color:#5e81f4;font-weight:700">Uptime</span>: ${Math.floor(performance.now()/60000)}m
  <span style="font-size:14px">⬛🟥🟨🟩🟦🟪🟧⬜</span></pre>`);
    },
    ps: () => {
      addLine('<span style="color:#ffd93d">  PID  TTY      TIME     CMD</span>');
      [['1','?','00:00:01','systemd'],['2','?','00:00:00','kthreadd'],['42','?','00:00:00','arcwm'],
       ['99','pts/0','00:00:00','arcsh'],['201','?','00:00:03','browser-engine'],['312','pts/0','00:00:00','ps']
      ].forEach(([p,t,ti,c]) => addLine(`<span style="color:#48cfad">${p.padEnd(5)}</span>${t.padEnd(9)}${ti.padEnd(9)}${c}`));
    },
    top: () => {
      addLine(`<span style="color:#ffd93d">top - ${new Date().toLocaleTimeString()} up 2h 14min, 1 user, load avg: 0.12 0.08 0.04</span>`);
      addLine('<span style="color:#ffd93d">Tasks: 142 total, 1 running, 141 sleeping</span>');
      addLine('<span style="color:#ffd93d">%Cpu(s): 2.3 us, 0.5 sy, 0.0 ni, 96.8 id, 0.4 wa</span>');
      addLine('<span style="color:#ffd93d">  PID USER     PR  NI  VIRT  RES  SHR S %CPU %MEM   TIME CMD</span>');
      [['201','arcuser','20','0','1.2G','142M','48M','S','3.2','0.8','2:14','browser-engine'],
       ['42','arcuser','20','0','280M','18M','12M','S','0.6','0.1','0:12','arcwm'],
       ['312','arcuser','20','0','8.2M','3.1M','2M','R','0.3','0.0','0:00','arcsh'],
      ].forEach(r => addLine(`<span style="color:#48cfad">${r[0].padEnd(6)}</span>${r.slice(1).join(' ')}`));
    },
    kill:    () => { const pid=parts[1]; if(!pid){addLine('Usage: kill <pid>','err');return;} addLine(`Killed process ${pid}`, 'info'); },
    killall: () => { const n=parts[1]; if(!n){addLine('Usage: killall <name>','err');return;} addLine(`Sent TERM to ${n}`, 'info'); },
    sleep:   () => { const s=parseInt(parts[1])||1; addLine(`Sleeping ${s}s…`); setTimeout(()=>addLine(`Wake up after ${s}s`, 'info'), s*1000); },
    cd: () => {
      const t = parts[1];
      if (!t || t === '~') { cwd = ['home']; updatePrompt(); return; }
      if (t === '..') { if (cwd.length > 1) { cwd.pop(); updatePrompt(); } return; }
      if (t === '/') { cwd = []; updatePrompt(); return; }
      const dir = getCurrentDir();
      if (dir.children && dir.children[t]?.type === 'dir') { cwd.push(t); updatePrompt(); }
      else addLine(`cd: ${t}: No such file or directory`, 'err');
    },
    cat: () => {
      const f = parts[1]; if (!f) { addLine('Usage: cat <file>', 'err'); return; }
      const d = getCurrentDir(); const file = d.children?.[f];
      if (!file) { addLine(`cat: ${f}: No such file or directory`, 'err'); return; }
      if (file.type === 'dir') { addLine(`cat: ${f}: Is a directory`, 'err'); return; }
      (file.content || '').split('\n').forEach(l => addLine(escapeHtml(l)));
    },
    mkdir: () => {
      const n = parts[1]; if (!n) { addLine('Usage: mkdir <name>', 'err'); return; }
      const d = getCurrentDir(); if (!d.children) d.children = {};
      if (d.children[n]) { addLine(`mkdir: ${n}: File exists`, 'err'); return; }
      d.children[n] = { name:n, icon:'📁', type:'dir', children:{} };
      addLine(`mkdir: created directory '${n}'`);
    },
    rmdir: () => {
      const n=parts[1];if(!n){addLine('Usage: rmdir <name>','err');return;}
      const d=getCurrentDir();if(!d.children?.[n]){addLine(`rmdir: ${n}: No such directory`,'err');return;}
      if(d.children[n].type!=='dir'){addLine(`rmdir: ${n}: Not a directory`,'err');return;}
      delete d.children[n];addLine(`rmdir: removed '${n}'`);
    },
    touch: () => {
      const n = parts[1]; if (!n) { addLine('Usage: touch <file>', 'err'); return; }
      const d = getCurrentDir(); if (!d.children) d.children = {};
      d.children[n] = d.children[n] || { name:n, icon:'📝', type:'file', content:'' };
      addLine(`touch: ${n}`);
    },
    rm: () => {
      const n = parts[1]; if (!n) { addLine('Usage: rm <file>', 'err'); return; }
      const d = getCurrentDir();
      if (d.children?.[n]) { delete d.children[n]; addLine(`rm: removed '${n}'`); }
      else addLine(`rm: cannot remove '${n}': No such file`, 'err');
    },
    cp: () => {
      const [,src,dst]=parts;if(!src||!dst){addLine('Usage: cp <src> <dst>','err');return;}
      const d=getCurrentDir();if(!d.children?.[src]){addLine(`cp: '${src}': No such file`,'err');return;}
      d.children[dst]={...d.children[src],name:dst};addLine(`'${src}' -> '${dst}'`);
    },
    mv: () => {
      const [,src,dst]=parts;if(!src||!dst){addLine('Usage: mv <src> <dst>','err');return;}
      const d=getCurrentDir();if(!d.children?.[src]){addLine(`mv: '${src}': No such file`,'err');return;}
      d.children[dst]={...d.children[src],name:dst};delete d.children[src];addLine(`renamed '${src}' -> '${dst}'`);
    },
    write: () => {
      const n = parts[1]; const t = parts.slice(2).join(' ');
      if (!n) { addLine('Usage: write <file> <text>', 'err'); return; }
      const d = getCurrentDir(); if (!d.children) d.children = {};
      d.children[n] = { name:n, icon:'📝', type:'file', content:t||'' };
      addLine(`Wrote ${(t||'').length} bytes to '${n}'`);
    },
    find: () => {
      const pat = parts.slice(1).join(' ') || '.';
      const results = [];
      const search = (dir, path) => Object.values(dir.children||{}).forEach(f => {
        const fp = path+'/'+f.name;
        if (f.name.includes(pat.replace('*','').replace('.','')) || pat==='.' ) results.push(fp);
        if (f.type==='dir') search(f, fp);
      });
      search(getCurrentDir(), '.');
      results.forEach(r => addLine(r));
      if (!results.length) addLine('(no matches)');
    },
    man: () => {
      const t = parts[1]; if (!t) { addLine('What manual page do you want?', 'err'); return; }
      addLine(`<span style="color:#ffd93d">${t.toUpperCase()}(1)                 User Commands                ${t.toUpperCase()}(1)</span>`);
      addLine('');addLine(`NAME\n    ${t} – ArcOS command`);addLine(`\nSYNOPSIS\n    ${t} [OPTIONS]... [ARGS]...`);
      addLine(`\nDESCRIPTION\n    ${t}: A standard command in the ArcOS shell environment.\n`);
      addLine(`<span style="color:#ffd93d">ArcOS 6.2.0                  ${new Date().toLocaleDateString()}                ${t.toUpperCase()}(1)</span>`);
    },
    head: () => {
      const f=parts[1];if(!f){addLine('Usage: head <file>','err');return;}
      const file=getCurrentDir().children?.[f];if(!file||file.type==='dir'){addLine(`head: ${f}: No such file`,'err');return;}
      const n=parseInt(parts[2])||10;(file.content||'').split('\n').slice(0,n).forEach(l=>addLine(escapeHtml(l)));
    },
    tail: () => {
      const f=parts[1];if(!f){addLine('Usage: tail <file>','err');return;}
      const file=getCurrentDir().children?.[f];if(!file||file.type==='dir'){addLine(`tail: ${f}: No such file`,'err');return;}
      const lines=(file.content||'').split('\n'),n=parseInt(parts[2])||10;
      lines.slice(Math.max(0,lines.length-n)).forEach(l=>addLine(escapeHtml(l)));
    },
    wc: () => {
      const f=parts[1];if(!f){addLine('Usage: wc <file>','err');return;}
      const file=getCurrentDir().children?.[f];if(!file||file.type==='dir'){addLine(`wc: ${f}: No such file`,'err');return;}
      const c=file.content||'';addLine(`  ${c.split('\n').length}  ${c.split(/\s+/).filter(Boolean).length}  ${c.length} ${f}`);
    },
    grep: () => {
      const p=parts[1],f=parts[2];if(!p||!f){addLine('Usage: grep <pattern> <file>','err');return;}
      const file=getCurrentDir().children?.[f];if(!file||file.type==='dir'){addLine(`grep: ${f}: No such file`,'err');return;}
      let found=0;(file.content||'').split('\n').forEach((l,i)=>{if(l.includes(p)){found++;addLine(`<span style="color:#aaa">${i+1}:</span>${l.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'),`<span style="background:#ffd93d;color:#000">${p}</span>`)}`)}});
      if(!found)addLine(`grep: no matches for '${p}' in ${f}`,'info');
    },
    sort: () => {
      const f=parts[1];if(!f){addLine('Usage: sort <file>','err');return;}
      const file=getCurrentDir().children?.[f];if(!file){addLine(`sort: ${f}: No such file`,'err');return;}
      (file.content||'').split('\n').sort().forEach(l=>addLine(l));
    },
    uniq: () => {
      const f=parts[1];if(!f){addLine('Usage: uniq <file>','err');return;}
      const file=getCurrentDir().children?.[f];if(!file){addLine(`uniq: ${f}: No such file`,'err');return;}
      const lines=(file.content||'').split('\n');lines.filter((l,i)=>l!==lines[i-1]).forEach(l=>addLine(l));
    },
    cut: () => addLine('[cut: simulated] Use: cut -d <delim> -f <field> <file>'),
    awk: () => addLine('[awk: simulated] Use: awk \'{print $1}\' <file>'),
    sed: () => addLine('[sed: simulated] Use: sed \'s/old/new/g\' <file>'),
    tr:  () => addLine('[tr: simulated] Use: tr \'a-z\' \'A-Z\''),
    base64: () => {
      const inp=parts.slice(1).join(' ');
      if(!inp){addLine('Usage: base64 <text>','err');return;}
      if(parts[1]==='-d'){addLine(atob(parts.slice(2).join(' ')));}else{addLine(btoa(inp));}
    },
    md5:    () => addLine(`md5: ${parts.slice(1).join(' ')} → ${Array.from({length:32},()=>'0123456789abcdef'[Math.floor(Math.random()*16)]).join('')}`),
    sha256: () => addLine(`sha256: → ${Array.from({length:64},()=>'0123456789abcdef'[Math.floor(Math.random()*16)]).join('')}`),
    ifconfig: () => {
      addLine('<span style="color:#48cfad;font-weight:700">eth0</span>: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500');
      addLine('      inet 192.168.1.42  netmask 255.255.255.0  broadcast 192.168.1.255');
      addLine('      inet6 fe80::1  prefixlen 64  scopeid 0x20&lt;link&gt;');
      addLine('      ether 08:00:27:12:34:56  txqueuelen 1000  (Ethernet)');
      addLine('<span style="color:#48cfad;font-weight:700">lo</span>: flags=73&lt;UP,LOOPBACK,RUNNING&gt;  mtu 65536');
      addLine('      inet 127.0.0.1  netmask 255.0.0.0');
    },
    ping: () => {
      const host=parts[1]||'8.8.8.8';addLine(`PING ${host} (${Math.floor(Math.random()*254)+1}.${Math.floor(Math.random()*254)+1}.${Math.floor(Math.random()*254)+1}.${Math.floor(Math.random()*254)+1}) 56(84) bytes of data.`);
      let i=0;const iv=setInterval(()=>{
        if(!document.getElementById('term-output')){clearInterval(iv);return;}
        addLine(`64 bytes from ${host}: icmp_seq=${++i} ttl=56 time=${(Math.random()*20+1).toFixed(1)} ms`);
        scrollTerminal();if(i>=4){clearInterval(iv);addLine(`\n--- ${host} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss`,'info');}
      },800);
    },
    netstat: () => {
      addLine('<span style="color:#ffd93d">Active Internet connections</span>');
      addLine('Proto Recv-Q Send-Q Local Address        Foreign Address      State');
      [['tcp','0','0','0.0.0.0:80','0.0.0.0:*','LISTEN'],['tcp','0','0','127.0.0.1:3000','0.0.0.0:*','LISTEN'],['tcp','64','0','192.168.1.42:52341','142.250.80.46:443','ESTABLISHED']].forEach(r=>addLine(r.join('  ')));
    },
    curl: () => {
      const url=parts[1];if(!url){addLine('Usage: curl <url>','err');return;}
      addLine(`  % Total    % Received % Xferd  Average  Speed`);
      addLine(`  ${(Math.random()*100).toFixed(1)}  1234    0      0      1234      0  --:--:-- --:--:--  ${Math.floor(Math.random()*9000+1000)}`);
      addLine(`{"status":"ok","url":"${url}","timestamp":"${new Date().toISOString()}"}`,'info');
    },
    wget: () => { const url=parts[1]||''; addLine(`Saving to: '${url.split('/').pop()||'index.html'}'`); addLine('100%[===========================================>] Done.','info'); },
    git: () => {
      const sub=parts[1];
      if(sub==='status'){addLine('On branch main\nYour branch is up to date.\n\nnothing to commit, working tree clean','info');}
      else if(sub==='log'){['a1b2c3 HEAD -> main, origin/main  Add new features','d4e5f6  Fix bugs','g7h8i9  Initial commit'].forEach(l=>addLine(l));}
      else if(sub==='init'){addLine('Initialized empty Git repository in ./.git/');}
      else if(sub==='add'){addLine(`staged: ${parts.slice(2).join(' ')||'(nothing)'}`);}

      else if(sub==='commit'){addLine(`[main a1b2c3] ${parts.slice(3).join(' ')||'commit'}\n 1 file changed`);}
      else if(sub==='push'){addLine('Enumerating objects: 3, done.\nTo origin main -> main','info');}
      else addLine(`git: '${sub}': not a git command — try: status, log, init, add, commit, push`,'err');
    },
    npm: () => { const sub=parts[1]; if(sub==='install')addLine('added 847 packages in 4.2s 🎉','info'); else if(sub==='start')addLine('Server running on http://localhost:3000','info'); else addLine(`npm: '${sub||''}' unknown command`,'err'); },
    node: () => { const f=parts[1];if(!f){addLine('REPL not available — run node <file.js>','info');}else{addLine(`Executing ${f}…\n[node:simulated] Output: Done`,'info');} },
    python: () => { const f=parts[1];if(!f){addLine('Python 3.11.2 (Open code editor)','info');}else{addLine(`Running ${f}...\n[python:simulated] Done`,'info');} },
    calc: () => {
      const expr=parts.slice(1).join('');if(!expr){addLine('Usage: calc <expression>  e.g. calc 2+2','err');return;}
      try{const r=Function('"use strict";return ('+expr+')')();addLine(`${expr} = <span style="color:#a8ff78;font-weight:700">${r}</span>`);}
      catch{addLine(`calc: invalid expression: ${expr}`,'err');}
    },
    chmod:   () => addLine(`mode of '${parts[2]||'file'}' changed to ${parts[1]||'644'}`),
    chown:   () => addLine(`ownership of '${parts[2]||'file'}' changed to '${parts[1]||'arcuser'}'`),
    which:   () => addLine(parts[1] ? `/usr/bin/${parts[1]}` : 'which: missing argument'),
    alias:   () => { if(parts[1]){addLine(`alias ${parts[1]} set`);}else{addLine('ll=\'ls -la\'\nla=\'ls -A\'\nl=\'ls -CF\'');} },
    unalias: () => addLine(parts[1]?`unalias: ${parts[1]} removed`:'unalias: missing argument'),
    export:  () => addLine(parts[1]?`export: ${parts[1]}='${parts[2]||''}' set`:'declare -x PATH="/usr/bin:/bin"'),
    sudo:    () => { addLine('[sudo] password for arcuser: '); setTimeout(()=>addLine('arcuser is not in the sudoers file. This incident will be reported.','err'),800); },
    su:      () => addLine('su: Authentication failure', 'err'),
    passwd:  () => addLine('Changing password for arcuser.\nNew password: ****\npassword updated successfully.','info'),
    useradd: () => addLine(`useradd: user '${parts[1]||'newuser'}' added`,'info'),
    userdel: () => addLine(`userdel: user '${parts[1]||'user'}' deleted`,'info'),
    cal:     () => {
      const now=new Date(),y=now.getFullYear(),m=now.getMonth();
      const month=['January','February','March','April','May','June','July','August','September','October','November','December'][m];
      addLine(`<span style="color:#ffd93d">   ${month} ${y}</span>`);
      addLine('<span style="color:#aaa"> Su Mo Tu We Th Fr Sa</span>');
      const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
      let row='  '.repeat(first);
      for(let d=1;d<=days;d++){const pad=d===now.getDate()?`<span style="background:var(--accent);color:#fff"> ${d.toString().padStart(2)} </span>`:` ${d.toString().padStart(2)}`;row+=pad;if((d+first)%7===0){addLine(row);row='';}}
      if(row.trim())addLine(row);
    },
    weather: () => {
      addLine('<span style="color:#48cfad">Weather for ArcOS City</span>');
      const conds=['☀ Sunny','🌤 Partly Cloudy','⛅ Cloudy','🌧 Rain','⛈ Thunderstorm'];
      const c=conds[Math.floor(Math.random()*conds.length)];const t=Math.floor(Math.random()*30+5);
      addLine(`  Condition: ${c}`);addLine(`  Temperature: ${t}°C / ${Math.round(t*9/5+32)}°F`);addLine(`  Humidity: ${Math.floor(Math.random()*50+30)}%`);addLine(`  Wind: ${Math.floor(Math.random()*30)}km/h ${['N','NE','E','SE','S','SW','W','NW'][Math.floor(Math.random()*8)]}`);
    },
    matrix: () => {
      addLine('<span style="color:#0f0">Entering the Matrix…</span>');
      const chars='ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890';
      let cnt=0;const iv=setInterval(()=>{
        if(!document.getElementById('term-output')||cnt>15){clearInterval(iv);return;}
        const line=Array.from({length:60},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
        addLine(`<span style="color:#0f0;font-family:'Source Code Pro',monospace;font-size:11px">${line}</span>`);scrollTerminal();cnt++;
      },80);
    },
    hack: () => {
      const msgs=['Accessing mainframe…','Bypassing firewall…','Decrypting 256-bit keys…','Downloading the internet…','Uploading virus to NASA…','Almost there…','ACCESS GRANTED ✓'];
      let i=0;const iv=setInterval(()=>{
        if(!document.getElementById('term-output')||i>=msgs.length){clearInterval(iv);return;}
        addLine(`<span style="color:#0f0">[${Math.floor(Math.random()*9000+1000)}]</span> ${msgs[i++]}`);scrollTerminal();
      },500);
    },
    cowsay: () => {
      const msg=parts.slice(1).join(' ')||'Moo!';const w=msg.length+2;
      addLine(` ${'_'.repeat(w)}`);addLine(`< ${msg} >`);addLine(` ${'‾'.repeat(w)}`);
      addLine('        \\   ^__^');addLine('         \\  (oo)\\_______');addLine('            (__)\\       )\\/\\');addLine('                ||----w |');addLine('                ||     ||');
    },
    fortune: () => {
      const fortunes=['The best way to predict the future is to invent it. — Alan Kay',
        'Any sufficiently advanced technology is indistinguishable from magic. — Arthur C. Clarke',
        'The computer was born to solve problems that did not exist before. — Bill Gates',
        'First, solve the problem. Then, write the code. — John Johnson',
        'Talk is cheap. Show me the code. — Linus Torvalds',
        'It\'s not a bug, it\'s an undocumented feature.',
        'There are only two hard things in CS: cache invalidation and naming things. — Phil Karlton',
        'Move fast and break things. — Mark Zuckerberg',
        'To be or not to be, that is the question. — Hamlet, probably about recursion.',
      ];
      addLine(`<span style="color:#c77dff;font-style:italic">"${fortunes[Math.floor(Math.random()*fortunes.length)]}"</span>`);
    },
    sl: () => {
      addLine(`<span style="color:#ffd93d">       ====        ________  ___________</span>`);
      addLine(`<span style="color:#ffd93d">   _D _|  |_______/        \\/___________\\</span>`);
      addLine(`<span style="color:#ffd93d">    |(_)---  |   H\\________/ |   |       |</span>`);
      addLine(`<span style="color:#ffd93d">    /     |  |   H  |  |     |   |       |</span>`);
      addLine(`<span style="color:#ffd93d">   |      |  |   H  |__--------------------|</span>`);
      addLine(`<span style="color:#ffd93d">   | ________|__H__/__|_____/[][]~\\_______|</span>`);
      addLine(`<span style="color:#ffd93d">   |/ |   |-----------I_____I [][]         |</span>`);
      addLine(`<span style="color:#ffd93d">    \\_/  \\__/      (___________) 🚂 choo choo!</span>`);
    },
    yes: () => {
      const s=parts.slice(1).join(' ')||'y';let i=0;
      const iv=setInterval(()=>{if(!document.getElementById('term-output')||i++>20){clearInterval(iv);return;}addLine(s);scrollTerminal();},80);
    },
    lolcat: () => {
      const msg=parts.slice(1).join(' ')||'Hello, World!';
      const colors=['#ff6b6b','#ffd93d','#6bcb77','#48cfad','#5e81f4','#c77dff'];
      addLine(msg.split('').map((c,i)=>`<span style="color:${colors[i%colors.length]}">${c}</span>`).join(''));
    },
    banner:  () => addLine(`<span style="color:#5e81f4;font-size:20px;font-weight:900;letter-spacing:6px">${parts.slice(1).join(' ').toUpperCase()||'ARCOS'}</span>`),
    figlet:  () => {
      const t=(parts.slice(1).join(' ')||'ARCOS').toUpperCase();
      addLine(`<pre style="color:#c77dff;font-size:11px;line-height:1.2">
 ___${t.split('').join('___')}___
|   ${t.split('').join('   ')}   |
|___${t.split('').join('___|___')}___| </pre>`);
    },
    vim:  () => addLine(':q!  (you cannot escape vim in ArcOS either)', 'info'),
    nano: () => { addLine('Opening nano… (use ^X to exit)'); openApp('editor'); },
    code: () => { const f=parts[1];addLine(f?`Opening ${f} in Code Editor…`:'Opening Code Editor…');openApp('code'); },
  };

  if (cmds[base]) cmds[base]();
  else addLine(`<span style="color:#ff6b6b">${escapeHtml(base)}: command not found</span> — type <span style="color:#ffd93d">help</span>`, 'err');
  scrollTerminal();
}

function escapeHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

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
function updatePrompt() {
  const pathStr = cwd.length > 1 ? '/' + cwd.slice(1).join('/') : '';
  const el = document.getElementById('term-prompt');
  if (el) el.innerHTML = `<span style="color:#5e81f4">arcuser@arcos</span><span style="color:#aaa">:</span><span style="color:#48cfad">~${pathStr}</span><span style="color:#e8e8f0">$ </span>`;
}


