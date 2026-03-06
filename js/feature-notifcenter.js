/* ═══════════════════════════════════════
   ArcOS — Notification Center
   Click bell icon · Full history
═══════════════════════════════════════ */

const notifHistory = [];
let notifCenterOpen = false;

// Override showNotif to also log to history
const _ncOrigShowNotif = window.showNotif;
window.showNotif = function(icon, title, msg) {
  if (_ncOrigShowNotif) _ncOrigShowNotif(icon, title, msg);
  notifHistory.unshift({ icon, title, msg, time: new Date(), id: Date.now() });
  if (notifHistory.length > 50) notifHistory.pop();
  updateNotifBadge();
  if (notifCenterOpen) renderNotifCenter();
};

function buildNotifCenter() {
  if (document.getElementById('notif-center')) return;

  // Bell button in topbar right
  const topbarRight = document.getElementById('topbar-right');
  if (topbarRight) {
    const bell = document.createElement('div');
    bell.id = 'notif-bell';
    bell.className = 'tray-icon';
    bell.title = 'Notification Center';
    bell.style.cssText = 'position:relative;cursor:pointer';
    bell.onclick = toggleNotifCenter;
    bell.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
      <div id="notif-badge" style="display:none;position:absolute;top:-2px;right:-2px;width:8px;height:8px;border-radius:50%;background:#ff6b6b;border:1.5px solid var(--bg)"></div>
    `;
    topbarRight.insertBefore(bell, topbarRight.firstChild);
  }

  // Panel
  const panel = document.createElement('div');
  panel.id = 'notif-center';
  panel.style.cssText = `
    position:fixed;top:36px;right:0;width:340px;height:calc(100vh - 36px);
    background:rgba(10,10,22,.97);border-left:1px solid var(--border);
    z-index:99990;display:none;flex-direction:column;
    backdrop-filter:blur(32px);
    transform:translateX(100%);transition:transform .28s cubic-bezier(.4,0,.2,1);
    box-shadow:-8px 0 40px rgba(0,0,0,.5);
  `;
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border)">
      <span style="font-weight:700;font-size:15px">Notifications</span>
      <div style="display:flex;gap:8px">
        <button onclick="clearNotifHistory()" style="background:none;border:none;color:var(--text-dim);font-size:12px;cursor:pointer;font-family:inherit;padding:4px 8px;border-radius:6px" onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--text-dim)'">Clear all</button>
        <button onclick="toggleNotifCenter()" style="background:none;border:none;color:var(--text-dim);font-size:18px;cursor:pointer;line-height:1">×</button>
      </div>
    </div>
    <div style="display:flex;gap:0;border-bottom:1px solid var(--border)">
      <button class="nc-tab active" onclick="ncTab('notifs',this)" style="flex:1;padding:8px;background:none;border:none;border-bottom:2px solid var(--accent);color:var(--accent);font-size:12px;cursor:pointer;font-family:inherit;font-weight:600">Notifications</button>
      <button class="nc-tab" onclick="ncTab('dnd',this)" style="flex:1;padding:8px;background:none;border:none;border-bottom:2px solid transparent;color:var(--text-dim);font-size:12px;cursor:pointer;font-family:inherit">Focus</button>
    </div>
    <div id="nc-notifs" style="flex:1;overflow-y:auto;padding:10px 0"></div>
    <div id="nc-dnd" style="flex:1;overflow-y:auto;padding:16px;display:none">
      <div style="font-weight:700;margin-bottom:12px">Focus Mode</div>
      ${['Do Not Disturb','Work Mode','Gaming Mode','Sleep Mode'].map(m=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:13px">${m}</span>
          <div class="toggle" onclick="this.classList.toggle('on')"></div>
        </div>`).join('')}
      <div style="margin-top:16px;font-size:12px;color:var(--text-dim)">Quiet hours: 11PM – 7AM</div>
    </div>
  `;
  document.body.appendChild(panel);
}

function toggleNotifCenter() {
  buildNotifCenter();
  const panel = document.getElementById('notif-center');
  if (!panel) return;
  notifCenterOpen = !notifCenterOpen;
  panel.style.display = 'flex';
  requestAnimationFrame(() => {
    panel.style.transform = notifCenterOpen ? 'translateX(0)' : 'translateX(100%)';
  });
  if (!notifCenterOpen) setTimeout(() => { panel.style.display = 'none'; }, 300);
  else renderNotifCenter();
  updateNotifBadge();
}

function renderNotifCenter() {
  const el = document.getElementById('nc-notifs'); if (!el) return;
  if (!notifHistory.length) {
    el.innerHTML = `<div style="padding:40px 20px;text-align:center;color:var(--text-dim);font-size:13px">
      <div style="font-size:36px;margin-bottom:10px">🔔</div>All clear! No notifications.
    </div>`;
    return;
  }
  el.innerHTML = notifHistory.map(n => `
    <div style="display:flex;gap:10px;padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.04);transition:background .12s" onmouseover="this.style.background='rgba(255,255,255,.03)'" onmouseout="this.style.background=''">
      <div style="font-size:20px;flex-shrink:0;padding-top:1px">${n.icon}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:13px">${n.title}</div>
        <div style="font-size:12px;color:var(--text-dim);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n.msg}</div>
        <div style="font-size:10px;color:rgba(255,255,255,.25);margin-top:3px">${n.time.toLocaleTimeString()}</div>
      </div>
      <button onclick="dismissNotif(${n.id})" style="background:none;border:none;color:rgba(255,255,255,.2);font-size:15px;cursor:pointer;flex-shrink:0;align-self:flex-start;line-height:1" onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='rgba(255,255,255,.2)'">×</button>
    </div>`).join('');
}

function dismissNotif(id) {
  const idx = notifHistory.findIndex(n => n.id === id);
  if (idx > -1) notifHistory.splice(idx, 1);
  renderNotifCenter();
  updateNotifBadge();
}

function clearNotifHistory() {
  notifHistory.length = 0;
  renderNotifCenter();
  updateNotifBadge();
}

function updateNotifBadge() {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  badge.style.display = notifHistory.length > 0 && !notifCenterOpen ? 'block' : 'none';
}

function ncTab(tab, btn) {
  document.querySelectorAll('.nc-tab').forEach(b => {
    b.style.borderBottomColor = 'transparent';
    b.style.color = 'var(--text-dim)';
    b.classList.remove('active');
  });
  btn.style.borderBottomColor = 'var(--accent)';
  btn.style.color = 'var(--accent)';
  btn.classList.add('active');
  document.getElementById('nc-notifs').style.display = tab === 'notifs' ? 'block' : 'none';
  document.getElementById('nc-dnd').style.display    = tab === 'dnd'    ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(buildNotifCenter, 2800);
});
