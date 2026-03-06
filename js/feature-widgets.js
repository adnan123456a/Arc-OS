/* ═══════════════════════════════════════
   ArcOS — Desktop Widgets
   Draggable · Clock · Weather · Stats · Notes
═══════════════════════════════════════ */

const WIDGETS = {};
let widgetZCounter = 500;

function createWidget(type) {
  const id = type + '-widget-' + Date.now();
  const el = document.createElement('div');
  el.id = id;
  el.className = 'desktop-widget';
  el.style.cssText = `
    position:fixed;z-index:${++widgetZCounter};
    background:rgba(12,12,28,.85);
    border:1px solid rgba(255,255,255,.1);
    border-radius:16px;
    backdrop-filter:blur(24px);
    box-shadow:0 8px 32px rgba(0,0,0,.5);
    user-select:none;
    animation:fadeIn .25s ease;
  `;

  let content = '';
  let initFn = null;

  if (type === 'clock') {
    el.style.cssText += 'width:180px;padding:16px 20px;top:100px;right:80px;text-align:center;';
    content = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:10px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px">Clock</span>
        <button onclick="removeWidget('${id}')" style="background:none;border:none;color:rgba(255,255,255,.2);cursor:pointer;font-size:14px;line-height:1">×</button>
      </div>
      <div id="${id}-time" style="font-size:38px;font-weight:200;color:#fff;font-family:'Nunito',sans-serif;letter-spacing:-1px;line-height:1"></div>
      <div id="${id}-date" style="font-size:11px;color:rgba(255,255,255,.4);margin-top:6px"></div>
    `;
    initFn = () => {
      const tick = () => {
        const n = new Date();
        const tel = document.getElementById(id+'-time');
        const del = document.getElementById(id+'-date');
        if (!tel) return clearInterval(iv);
        tel.textContent = n.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
        del.textContent = n.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
      };
      tick();
      const iv = setInterval(tick, 1000);
    };
  }

  else if (type === 'weather') {
    el.style.cssText += 'width:200px;padding:16px;top:100px;right:280px;';
    const conditions = ['☀️ Sunny','🌤 Partly Cloudy','⛅ Cloudy','🌧 Rainy','⛈ Stormy','🌨 Snowy'];
    const cond = conditions[Math.floor(Math.random() * conditions.length)];
    const temp = Math.floor(Math.random() * 30 + 5);
    content = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:10px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px">Weather</span>
        <button onclick="removeWidget('${id}')" style="background:none;border:none;color:rgba(255,255,255,.2);cursor:pointer;font-size:14px;line-height:1">×</button>
      </div>
      <div style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:4px">ArcOS City</div>
      <div style="font-size:42px;font-weight:200;color:#fff;font-family:'Nunito',sans-serif">${temp}°</div>
      <div style="font-size:14px;color:rgba(255,255,255,.7);margin:4px 0">${cond}</div>
      <div style="display:flex;gap:12px;margin-top:10px;font-size:11px;color:rgba(255,255,255,.4)">
        <span>💧 65%</span><span>💨 12km/h</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:10px;border-top:1px solid rgba(255,255,255,.07);padding-top:10px">
        ${['Mon','Tue','Wed','Thu','Fri'].map((d,i)=>`
          <div style="text-align:center;font-size:10px">
            <div style="color:rgba(255,255,255,.4)">${d}</div>
            <div style="font-size:14px;margin:2px 0">${['☀️','🌤','⛅','🌧','☀️'][i]}</div>
            <div style="color:rgba(255,255,255,.6)">${temp+Math.floor(Math.random()*6-3)}°</div>
          </div>`).join('')}
      </div>
    `;
  }

  else if (type === 'stats') {
    el.style.cssText += 'width:200px;padding:14px 16px;top:350px;right:80px;';
    content = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:10px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px">System</span>
        <button onclick="removeWidget('${id}')" style="background:none;border:none;color:rgba(255,255,255,.2);cursor:pointer;font-size:14px;line-height:1">×</button>
      </div>
      ${[['CPU','#5e81f4'],['RAM','#c77dff'],['Disk','#48cfad'],['GPU','#ffd93d']].map(([label,color])=>`
        <div style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
            <span style="color:rgba(255,255,255,.5)">${label}</span>
            <span id="${id}-${label.toLowerCase()}" style="color:${color};font-family:'Source Code Pro',monospace">—%</span>
          </div>
          <div style="height:4px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden">
            <div id="${id}-${label.toLowerCase()}-bar" style="height:100%;background:${color};border-radius:2px;transition:width .8s ease;width:0%"></div>
          </div>
        </div>`).join('')}
    `;
    initFn = () => {
      const tick = () => {
        if (!document.getElementById(id)) return clearInterval(iv);
        [['cpu',45,90],['ram',30,70],['disk',20,45],['gpu',10,80]].forEach(([label,min,max])=>{
          const v = Math.floor(Math.random()*(max-min)+min);
          const el1=document.getElementById(id+'-'+label);
          const el2=document.getElementById(id+'-'+label+'-bar');
          if(el1)el1.textContent=v+'%';
          if(el2)el2.style.width=v+'%';
        });
      };
      tick(); const iv = setInterval(tick, 2000);
    };
  }

  else if (type === 'notes') {
    el.style.cssText += 'width:200px;padding:12px;top:350px;right:300px;';
    const colors = ['#ffd93d','#ff6b6b','#6bcb77','#74b9ff'];
    const bg = colors[Math.floor(Math.random()*colors.length)];
    el.style.background = bg;
    el.style.border = 'none';
    content = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:11px;font-weight:700;color:rgba(0,0,0,.4)">Quick Note</span>
        <button onclick="removeWidget('${id}')" style="background:none;border:none;color:rgba(0,0,0,.3);cursor:pointer;font-size:16px;line-height:1">×</button>
      </div>
      <textarea placeholder="Type note…" style="width:100%;height:100px;background:transparent;border:none;color:rgba(0,0,0,.7);font-family:'Nunito',sans-serif;font-size:13px;resize:none;outline:none;line-height:1.5"></textarea>
    `;
  }

  else if (type === 'calendar') {
    el.style.cssText += 'width:220px;padding:14px;top:60px;left:80px;';
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    let calHtml = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center">`;
    calHtml += dayNames.map(d=>`<div style="font-size:9px;color:rgba(255,255,255,.3);padding:2px">${d}</div>`).join('');
    for(let i=0;i<firstDay;i++) calHtml += '<div></div>';
    for(let d=1;d<=daysInMonth;d++) {
      const isToday = d===now.getDate();
      calHtml += `<div style="font-size:11px;padding:3px;border-radius:50%;${isToday?'background:var(--accent);color:#fff;font-weight:700':'color:rgba(255,255,255,.6)'}">${d}</div>`;
    }
    calHtml += '</div>';
    content = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:13px;font-weight:700">${now.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</span>
        <button onclick="removeWidget('${id}')" style="background:none;border:none;color:rgba(255,255,255,.2);cursor:pointer;font-size:14px;line-height:1">×</button>
      </div>
      ${calHtml}
    `;
  }

  el.innerHTML = content;
  document.body.appendChild(el);
  WIDGETS[id] = el;
  widgetDraggable(el);
  if (initFn) setTimeout(initFn, 50);
  return id;
}

function widgetDraggable(el) {
  let ox, oy;
  el.addEventListener('mousedown', e => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    el.style.zIndex = ++widgetZCounter;
    ox = e.clientX - el.offsetLeft;
    oy = e.clientY - el.offsetTop;
    const mm = e2 => { el.style.left = (e2.clientX-ox)+'px'; el.style.top = (e2.clientY-oy)+'px'; el.style.right='auto'; };
    const mu = () => { document.removeEventListener('mousemove',mm); document.removeEventListener('mouseup',mu); };
    document.addEventListener('mousemove',mm);
    document.addEventListener('mouseup',mu);
    e.preventDefault();
  });
}

function removeWidget(id) {
  document.getElementById(id)?.remove();
  delete WIDGETS[id];
}

function buildWidgetMenu() {
  if (document.getElementById('widget-menu-btn')) return;
  const btn = document.createElement('div');
  btn.id = 'widget-menu-btn';
  btn.title = 'Add Desktop Widget';
  btn.style.cssText = `
    position:fixed;bottom:14px;left:16px;z-index:9991;
    width:36px;height:36px;border-radius:10px;
    background:rgba(12,12,28,.88);border:1px solid var(--border);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;font-size:18px;
    backdrop-filter:blur(16px);
    transition:all .15s;
    box-shadow:0 4px 16px rgba(0,0,0,.4);
  `;
  btn.textContent = '📌';
  btn.onmouseover = () => btn.style.background = 'rgba(94,129,244,.3)';
  btn.onmouseout  = () => btn.style.background = 'rgba(12,12,28,.88)';
  btn.onclick     = showWidgetPicker;
  document.body.appendChild(btn);
}

function showWidgetPicker() {
  let picker = document.getElementById('widget-picker');
  if (picker) { picker.remove(); return; }
  picker = document.createElement('div');
  picker.id = 'widget-picker';
  picker.style.cssText = `
    position:fixed;bottom:60px;left:16px;z-index:99992;
    background:rgba(12,12,28,.97);border:1px solid var(--border);border-radius:14px;
    padding:8px;min-width:180px;
    box-shadow:0 16px 50px rgba(0,0,0,.7);
    backdrop-filter:blur(24px);
  `;
  const widgets = [
    ['clock','🕐 Clock'],['weather','🌤 Weather'],
    ['stats','📊 System Stats'],['notes','📝 Quick Note'],['calendar','📅 Calendar'],
  ];
  picker.innerHTML = widgets.map(([type,label])=>`
    <div onclick="createWidget('${type}');document.getElementById('widget-picker').remove()" style="padding:9px 13px;border-radius:8px;cursor:pointer;font-size:13px;transition:background .1s" onmouseover="this.style.background='rgba(255,255,255,.07)'" onmouseout="this.style.background=''">
      ${label}
    </div>`).join('') + `
    <div style="height:1px;background:var(--border);margin:4px 0"></div>
    <div onclick="Object.keys(WIDGETS).forEach(id=>removeWidget(id));document.getElementById('widget-picker').remove()" style="padding:9px 13px;border-radius:8px;cursor:pointer;font-size:13px;color:var(--text-dim)" onmouseover="this.style.background='rgba(255,255,255,.07)'" onmouseout="this.style.background=''">
      🗑 Remove All
    </div>`;
  document.body.appendChild(picker);
  setTimeout(() => document.addEventListener('click', function off(e) {
    if (!picker.contains(e.target) && e.target.id !== 'widget-menu-btn') { picker.remove(); document.removeEventListener('click',off); }
  }), 10);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    buildWidgetMenu();
    createWidget('clock');
    createWidget('stats');
  }, 3000);
});
