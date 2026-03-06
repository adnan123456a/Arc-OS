/* ═══════════════════════════════════════
   ArcOS — Lock Screen
   Ctrl+L · Password · Blur wallpaper
═══════════════════════════════════════ */

let lockScreenActive = false;

function buildLockScreen() {
  if (document.getElementById('lock-screen')) return;
  const el = document.createElement('div');
  el.id = 'lock-screen';
  el.style.cssText = `
    position:fixed;inset:0;z-index:9999999;
    display:none;flex-direction:column;
    align-items:center;justify-content:center;
    gap:20px;
    backdrop-filter:blur(40px) brightness(.6);
    background:rgba(4,4,18,.7);
    animation:fadeIn .4s ease;
  `;

  el.innerHTML = `
    <div id="lock-time" style="font-size:80px;font-weight:200;font-family:'Nunito',sans-serif;color:#fff;letter-spacing:-4px;line-height:1"></div>
    <div id="lock-date" style="font-size:18px;color:rgba(255,255,255,.6);font-weight:300;margin-top:-8px"></div>
    <div style="margin-top:20px;display:flex;flex-direction:column;align-items:center;gap:12px">
      <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#5e81f4,#c77dff);display:flex;align-items:center;justify-content:center;font-size:32px;box-shadow:0 8px 32px rgba(94,129,244,.4)">🧑</div>
      <div style="font-size:16px;font-weight:700;color:#fff">arcuser</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
      <input id="lock-input" type="password" placeholder="Password"
        style="padding:12px 20px;border-radius:30px;border:1.5px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font-size:15px;outline:none;text-align:center;width:240px;backdrop-filter:blur(20px);font-family:'Nunito',sans-serif;letter-spacing:2px"
        onkeydown="if(event.key==='Enter')lockTryUnlock()"
        oninput="document.getElementById('lock-err').textContent=''">
      <div id="lock-err" style="color:#ff6b6b;font-size:12px;height:16px"></div>
      <button onclick="lockTryUnlock()"
        style="padding:10px 32px;border-radius:30px;border:none;background:linear-gradient(135deg,#5e81f4,#c77dff);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;box-shadow:0 4px 20px rgba(94,129,244,.4)">
        Unlock →
      </button>
    </div>
    <div style="position:absolute;bottom:28px;font-size:11px;color:rgba(255,255,255,.25)">
      Default password: "arcos" · Change in Settings
    </div>
  `;
  document.body.appendChild(el);
  setInterval(lockUpdateClock, 1000);
  el.addEventListener('click', e => { if (e.target === el) document.getElementById('lock-input')?.focus(); });
}

function lockUpdateClock() {
  const el = document.getElementById('lock-time');
  const de = document.getElementById('lock-date');
  if (!el || !de) return;
  const n = new Date();
  el.textContent = n.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false });
  de.textContent = n.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
}

function showLockScreen() {
  buildLockScreen();
  const el = document.getElementById('lock-screen');
  if (!el) return;
  el.style.display = 'flex';
  lockScreenActive = true;
  lockUpdateClock();
  setTimeout(() => document.getElementById('lock-input')?.focus(), 100);
}

function lockTryUnlock() {
  const inp  = document.getElementById('lock-input');
  const err  = document.getElementById('lock-err');
  const pass = inp?.value || '';
  const stored = localStorage.getItem('arcos_lock_pass') || 'arcos';
  if (pass === stored) {
    const el = document.getElementById('lock-screen');
    if (el) {
      el.style.transition = 'opacity .3s';
      el.style.opacity = '0';
      setTimeout(() => { el.style.display = 'none'; el.style.opacity = '1'; lockScreenActive = false; }, 300);
    }
    if (inp) inp.value = '';
  } else {
    if (err) err.textContent = 'Incorrect password';
    if (inp) {
      inp.style.borderColor = '#ff6b6b';
      inp.style.animation = 'shake .3s ease';
      setTimeout(() => { inp.style.borderColor = 'rgba(255,255,255,.2)'; inp.style.animation = ''; inp.value = ''; }, 700);
    }
  }
}

// Ctrl+L to lock
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
    e.preventDefault();
    showLockScreen();
  }
});

// Add lock option to right-click desktop menu via patching
const _lockOrigCtxAction = window.ctxAction;
window.ctxAction = function(action) {
  if (action === 'lock') { showLockScreen(); return; }
  if (_lockOrigCtxAction) _lockOrigCtxAction(action);
};

// Expose globally
window.showLockScreen = showLockScreen;
