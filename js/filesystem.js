/* ═══════════════════════════════════════
   ArcOS — Virtual Filesystem
═══════════════════════════════════════ */

let currentUser = 'arcuser';
let cwd = ['home'];

const fileSystem = {
  home: { name:'Home', icon:'🏠', type:'dir', children: {
    Documents: { name:'Documents', icon:'📄', type:'dir', children: {
      'readme.txt':  { name:'readme.txt',  icon:'📝', type:'file', content:'Welcome to ArcOS!\n\nThis is a browser-based Linux desktop.\nType `help` in the terminal to get started.\n\nNew in this version:\n- API Tester (Postman-like)\n- Paint App\n- JSON Formatter\n- Markdown Previewer\n- New Games: 2048, Minesweeper, Wordle\n- Improved Code Editor with Python (Pyodide), HTML preview\n\nEnjoy exploring! 🐧' },
      'notes.txt':   { name:'notes.txt',   icon:'📝', type:'file', content:'My Notes\n--------\n\n- Try the API Tester!\n- Paint something cool\n- Play Wordle or 2048\n- Use the code editor with Python\n' },
      'api-tips.txt':{ name:'api-tips.txt',icon:'📝', type:'file', content:'API Tester Tips\n---------------\n\nPOST https://httpbin.org/post\nGET  https://api.github.com/users/octocat\nGET  https://jsonplaceholder.typicode.com/todos/1\n\nFree test APIs:\n- https://httpbin.org\n- https://jsonplaceholder.typicode.com\n- https://api.github.com\n' },
    }},
    Downloads: { name:'Downloads', icon:'⬇️', type:'dir', children: {} },
    Pictures:  { name:'Pictures',  icon:'🖼️', type:'dir', children: {} },
    Music:     { name:'Music',     icon:'🎵', type:'dir', children: {} },
    Desktop:   { name:'Desktop',   icon:'🖥️', type:'dir', children: {} },
  }},
  bin: { name:'bin', icon:'⚙️', type:'dir', children: {} },
  etc: { name:'etc', icon:'🔧', type:'dir', children: {} },
  tmp: { name:'tmp', icon:'🗑️', type:'dir', children: {} },
};

function getCurrentDir() {
  let d = fileSystem;
  for (const k of cwd) d = d[k] || d.children?.[k] || d;
  return d;
}

function updatePrompt() {
  const p = document.getElementById('term-prompt');
  if (p) p.textContent = `arcuser@arcos:~${cwd.length > 1 ? '/' + cwd.slice(1).join('/') : ''}$ `;
}
