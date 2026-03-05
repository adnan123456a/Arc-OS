/* ═══════════════════════════════════════
   ArcOS — System Apps: 2048, Minesweeper, Wordle
═══════════════════════════════════════ */

// ─── 2048 ──────────────────────────────────────────────
let t2Board = [], t2Score = 0, t2Best = 0, t2Over = false;
const T2_COLORS = {
  0:'rgba(255,255,255,.04)', 2:'#eee4da', 4:'#ede0c8', 8:'#f2b179',
  16:'#f59563', 32:'#f67c5f', 64:'#f65e3b', 128:'#edcf72',
  256:'#edcc61', 512:'#edc850', 1024:'#edc53f', 2048:'#edc22e',
};

function build2048() {
  return `<div id="game2048-wrap">
    <div style="display:flex;align-items:center;gap:16px;width:280px">
      <div style="font-size:22px;font-weight:800;color:var(--accent)">2048</div>
      <div style="margin-left:auto;display:flex;gap:10px">
        <div style="background:var(--card);border-radius:6px;padding:6px 12px;text-align:center">
          <div style="font-size:10px;color:var(--text-dim);font-weight:700">SCORE</div>
          <div id="t2-score" style="font-size:16px;font-weight:800">0</div>
        </div>
        <div style="background:var(--card);border-radius:6px;padding:6px 12px;text-align:center">
          <div style="font-size:10px;color:var(--text-dim);font-weight:700">BEST</div>
          <div id="t2-best" style="font-size:16px;font-weight:800">0</div>
        </div>
      </div>
    </div>
    <div style="font-size:12px;color:var(--text-dim)">Use arrow keys or swipe to merge tiles</div>
    <div id="game2048-grid"></div>
    <div style="display:flex;gap:8px">
      <button class="game-btn" onclick="init2048()">↺ New Game</button>
      <span id="t2-msg" style="font-size:13px;font-weight:700;align-self:center"></span>
    </div>
  </div>`;
}

function init2048() {
  t2Board = Array.from({length:4}, () => Array(4).fill(0));
  t2Score = 0; t2Over = false;
  t2Spawn(); t2Spawn();
  t2Render();
  document.getElementById('t2-msg').textContent = '';
  document.addEventListener('keydown', t2Key);
}

function t2Spawn() {
  const empties = [];
  t2Board.forEach((row, r) => row.forEach((v, c) => { if (!v) empties.push([r,c]); }));
  if (!empties.length) return;
  const [r,c] = empties[Math.floor(Math.random()*empties.length)];
  t2Board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function t2Render() {
  const grid = document.getElementById('game2048-grid'); if (!grid) return;
  grid.innerHTML = '';
  t2Board.forEach(row => row.forEach(val => {
    const cell = document.createElement('div');
    cell.className = 't2048-cell';
    cell.style.background = T2_COLORS[Math.min(val, 2048)] || '#3c3a32';
    cell.style.color = val <= 4 ? '#776e65' : '#f9f6f2';
    cell.style.fontSize = val >= 1000 ? '16px' : val >= 100 ? '20px' : '26px';
    if (val) cell.textContent = val;
    grid.appendChild(cell);
  }));
  document.getElementById('t2-score').textContent = t2Score;
  if (t2Score > t2Best) { t2Best = t2Score; document.getElementById('t2-best').textContent = t2Best; }
}

function t2Slide(row) {
  const nums = row.filter(v => v);
  const merged = [];
  let i = 0, gained = 0;
  while (i < nums.length) {
    if (i+1 < nums.length && nums[i] === nums[i+1]) {
      merged.push(nums[i]*2); gained += nums[i]*2; i += 2;
    } else { merged.push(nums[i]); i++; }
  }
  t2Score += gained;
  while (merged.length < 4) merged.push(0);
  return merged;
}

function t2Move(dir) {
  let moved = false;
  const prev = JSON.stringify(t2Board);
  if (dir === 'left')  t2Board = t2Board.map(r => t2Slide(r));
  if (dir === 'right') t2Board = t2Board.map(r => t2Slide([...r].reverse()).reverse());
  if (dir === 'up' || dir === 'down') {
    for (let c = 0; c < 4; c++) {
      let col = t2Board.map(r => r[c]);
      if (dir === 'down') col.reverse();
      col = t2Slide(col);
      if (dir === 'down') col.reverse();
      t2Board.forEach((r, ri) => r[c] = col[ri]);
    }
  }
  if (JSON.stringify(t2Board) !== prev) { moved = true; t2Spawn(); }
  t2Render();
  if (t2Board.flat().includes(2048)) {
    document.getElementById('t2-msg').style.color = 'var(--green)';
    document.getElementById('t2-msg').textContent = '🎉 You win!';
  } else if (!t2CanMove()) {
    document.getElementById('t2-msg').style.color = 'var(--red)';
    document.getElementById('t2-msg').textContent = '💀 Game Over';
    t2Over = true;
  }
}

function t2CanMove() {
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    if (!t2Board[r][c]) return true;
    if (c < 3 && t2Board[r][c] === t2Board[r][c+1]) return true;
    if (r < 3 && t2Board[r][c] === t2Board[r+1][c]) return true;
  }
  return false;
}

function t2Key(e) {
  if (!openWindows['game2048'] || t2Over) return;
  const map = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down' };
  if (map[e.key]) { e.preventDefault(); t2Move(map[e.key]); }
}

// ─── MINESWEEPER ───────────────────────────────────────
let minesBoard = [], minesRevealed = [], minesFlagged = [];
let minesRows = 9, minesCols = 9, mineCount = 10;
let minesStarted = false, minesOver = false, minesTimer = null, minesSeconds = 0;

function buildMinesweeper() {
  return `<div id="mines-wrap">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px">
      <select id="mines-diff" class="settings-select" onchange="setMinesDiff(this.value)">
        <option value="easy">Easy 9×9 (10)</option>
        <option value="medium">Medium 16×16 (40)</option>
        <option value="hard">Hard 16×30 (99)</option>
      </select>
      <span>💣 <span id="mines-count">10</span></span>
      <span>⏱ <span id="mines-time">0</span>s</span>
      <button class="game-btn" onclick="initMinesweeper()">↺ Reset</button>
    </div>
    <div id="mines-msg" style="font-size:14px;font-weight:700;min-height:20px"></div>
    <div id="mines-grid"></div>
    <div style="font-size:11px;color:var(--text-dim)">Left-click to reveal · Right-click to flag 🚩</div>
  </div>`;
}

function setMinesDiff(d) {
  if (d==='easy')   { minesRows=9;  minesCols=9;  mineCount=10; }
  if (d==='medium') { minesRows=16; minesCols=16; mineCount=40; }
  if (d==='hard')   { minesRows=16; minesCols=30; mineCount=99; }
  initMinesweeper();
}

function initMinesweeper() {
  clearInterval(minesTimer); minesSeconds=0; minesStarted=false; minesOver=false;
  document.getElementById('mines-time').textContent = '0';
  document.getElementById('mines-msg').textContent  = '';
  document.getElementById('mines-count').textContent = mineCount;
  minesBoard    = Array.from({length:minesRows}, () => Array(minesCols).fill(0));
  minesRevealed = Array.from({length:minesRows}, () => Array(minesCols).fill(false));
  minesFlagged  = Array.from({length:minesRows}, () => Array(minesCols).fill(false));
  renderMinesGrid();
}

function minesPlaceBombs(safeR, safeC) {
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random()*minesRows);
    const c = Math.floor(Math.random()*minesCols);
    if (minesBoard[r][c] === -1) continue;
    if (Math.abs(r-safeR)<=1 && Math.abs(c-safeC)<=1) continue;
    minesBoard[r][c] = -1; placed++;
  }
  // Count neighbours
  for (let r=0;r<minesRows;r++) for (let c=0;c<minesCols;c++) {
    if (minesBoard[r][c]===-1) continue;
    let n=0;
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
      const nr=r+dr,nc=c+dc;
      if (nr>=0&&nr<minesRows&&nc>=0&&nc<minesCols&&minesBoard[nr][nc]===-1) n++;
    }
    minesBoard[r][c]=n;
  }
}

function renderMinesGrid() {
  const grid = document.getElementById('mines-grid'); if (!grid) return;
  grid.style.gridTemplateColumns = `repeat(${minesCols},28px)`;
  grid.innerHTML = '';
  for (let r=0;r<minesRows;r++) for (let c=0;c<minesCols;c++) {
    const cell = document.createElement('div');
    cell.className = 'mine-cell';
    cell.dataset.r = r; cell.dataset.c = c;
    if (minesRevealed[r][c]) {
      cell.classList.add('revealed');
      const v = minesBoard[r][c];
      if (v===-1) { cell.textContent='💣'; cell.classList.add('boom'); }
      else if (v>0) {
        cell.textContent=v;
        const nColors=['','#1976d2','#388e3c','#d32f2f','#7b1fa2','#ff6f00','#0097a7','#000','#757575'];
        cell.style.color = nColors[v]||'#000';
      }
    } else if (minesFlagged[r][c]) {
      cell.textContent='🚩'; cell.classList.add('flagged');
    }
    cell.onclick = () => minesClick(r, c);
    cell.oncontextmenu = e => { e.preventDefault(); minesFlag(r,c); };
    grid.appendChild(cell);
  }
}

function minesClick(r,c) {
  if (minesOver||minesRevealed[r][c]||minesFlagged[r][c]) return;
  if (!minesStarted) {
    minesStarted=true;
    minesPlaceBombs(r,c);
    minesTimer=setInterval(()=>{minesSeconds++;document.getElementById('mines-time').textContent=minesSeconds;},1000);
  }
  if (minesBoard[r][c]===-1) {
    // Game over – reveal all
    for(let i=0;i<minesRows;i++) for(let j=0;j<minesCols;j++) if(minesBoard[i][j]===-1) minesRevealed[i][j]=true;
    clearInterval(minesTimer); minesOver=true;
    const msg=document.getElementById('mines-msg'); if(msg){msg.style.color='var(--red)';msg.textContent='💥 Boom! Game Over';}
    renderMinesGrid(); return;
  }
  minesReveal(r,c);
  renderMinesGrid();
  if (minesCheckWin()) {
    clearInterval(minesTimer); minesOver=true;
    const msg=document.getElementById('mines-msg'); if(msg){msg.style.color='var(--green)';msg.textContent='🎉 You win! '+minesSeconds+'s';}
    showNotif('💣','Minesweeper','You won in '+minesSeconds+'s!');
  }
}

function minesReveal(r,c) {
  if (r<0||r>=minesRows||c<0||c>=minesCols||minesRevealed[r][c]||minesFlagged[r][c]) return;
  minesRevealed[r][c]=true;
  if (minesBoard[r][c]===0) for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) minesReveal(r+dr,c+dc);
}

function minesFlag(r,c) {
  if (minesRevealed[r][c]||minesOver) return;
  minesFlagged[r][c]=!minesFlagged[r][c];
  const flagged=minesFlagged.flat().filter(Boolean).length;
  document.getElementById('mines-count').textContent=mineCount-flagged;
  renderMinesGrid();
}

function minesCheckWin() {
  for(let r=0;r<minesRows;r++) for(let c=0;c<minesCols;c++) if(minesBoard[r][c]!==-1&&!minesRevealed[r][c]) return false;
  return true;
}

// ─── WORDLE ────────────────────────────────────────────
const WORDLE_WORDS = ['crane','slate','audio','stare','raise','arise','alert','alter','later','ratel','tears','rates','resat','tares','crate','trace','carte','cater','react','recta','great','grate','greet','steal','tales','least','stale','table','blast','stab','trail','snare','learn','earns','nears','solar','roads','dorsa','lards','drals','place','pleat','leapt','leaph','board','broad','brand','bland','bland','bland','plain','plait','plait'];
const WORDLE_VALID = new Set([...WORDLE_WORDS,'about','above','abuse','actor','acute','admit','adopt','adult','after','again','agent','agree','ahead','alarm','album','alert','algae','alien','align','alike','alley','allow','alone','along','aloud','alter','angel','anger','angle','angry','anime','ankle','annex','antic','anvil','apart','aping','apple','apply','aptly','arbor','ardor','arena','argue','arson','aside','asset','atone','attic','audio','audit','aural','avant','avoid','awake','award','aware','awful','azure','badge','badly','baker','basic','basis','basis','batch','bayou','beach','beard','beast','began','begin','being','below','bench','bible','birth','black','blade','blame','blank','blaze','bleed','bless','blind','block','blood','bloom','blown','blues','blunt','blurt','blush','bonus','boost','bound','boxer','brace','brave','bravo','brawn','break','breed','brief','bring','brisk','broke','brook','brown','brute','build','built','bunny','burst','buyer','cable','cache','camel','cameo','candy','cargo','carry','catch','cause','cease','chain','chair','chaos','charm','chart','chase','cheap','check','cheek','cheer','chess','chest','chief','child','china','choir','chord','civil','claim','clash','clasp','class','clean','clear','clerk','click','cliff','climb','cling','clock','clone','close','cloud','clown','clues','coach','coast','comic','comma','comet','coral','couch','cough','count','cover','craft','crash','crawl','crazy','crime','crisp','cross','crowd','cruel','crumb','crush','crust','cubic','curve','cycle','daddy','daily','dance','dared','dated','death','debut','decay','defer','delta','dense','depot','depth','derby','diary','digit','dirty','disco','disco','ditch','dodge','dogma','doing','doted','doubt','dough','dozer','draft','drama','drape','drawl','drawn','dread','dream','drenched','drink','drive','drown','druid','dryer','duchy','dumps','dunno','duped','dusky','dwarf','dwell','dying','eager','eagle','early','earth','eight','eject','elbow','elite','email','empty','ended','enter','entry','equal','error','essay','evoke','exact','exist','extra','fable','faint','fairy','faith','false','fancy','farce','fatal','fault','feast','feral','ferry','fever','fewer','field','fiend','fifth','fifty','fight','final','first','fixed','flame','flare','flash','flat','flair','flesh','flint','float','flood','floor','flora','flour','flown','fluff','fluke','flute','flyer','focus','foggy','foray','force','forge','forge','forty','forum','foyer','frail','frame','fraud','freed','fresh','friar','frond','front','frost','froze','fully','funny','futon','gamer','gauze','gauzy','ghost','giddy','given','gland','glare','glass','glaze','glean','gleam','glide','globe','gloom','glory','gloss','glove','glyph','going','grace','grade','grain','grail','greed','greet','grief','grill','grind','gripe','groan','groin','grope','gross','grout','graze','grown','gruel','guile','guise','gusto','gypsy','habit','hands','handy','happy','harsh','haunt','haven','havoc','heart','heavy','hedge','heist','helix','hence','hinge','hippo','hitch','hoard','hobby','holly','homer','honey','honor','hopeless','hotel','house','human','humor','humus','hyena','ideal','image','imply','inbox','infer','ingot','inner','input','inter','irony','itchy','ivory','japan','jelly','jewel','jiffy','joker','judge','juice','juicy','jumbo','karma','kayak','kazoo','knock','known','label','labor','lance','large','larva','laser','laugh','layer','leafy','lethal','level','lever','light','limit','liner','lingo','liver','logic','loose','lowly','lucid','lucky','lyric','magic','mambo','manly','manor','maple','march','marry','matte','maxim','mayor','mealy','medal','media','mercy','merge','merit','metal','minor','minus','mirth','miser','misty','mixer','model','moody','moral','motto','mould','mount','mourn','mouse','mouth','mucky','muddy','mused','mushy','musky','musty','nabob','naive','nasty','naval','nerve','never','night','nimble','night','noble','noise','nominal','north','noted','nymph','obese','occur','offal','offer','often','olive','on','optic','orbit','order','organ','other','outer','outdo','over','oxide','ozone','paint','pansy','paper','party','pasta','patch','pathways','pause','peach','pearl','pedal','penal','petal','pieta','piety','pilot','pinch','piney','pixel','pizza','plaid','plane','plank','plant','plaza','plead','plebe','plumb','plume','plunk','plush','pocket','poetry','point','poise','porch','posed','poser','potty','pouch','pouty','power','prawn','press','price','prick','pride','prime','print','probe','prone','proof','prose','proud','prove','prune','psalm','pubic','pudgy','pulse','punch','pupil','purge','purse','pygmy','query','quest','queue','quick','quiet','quota','quote','rabbi','rabid','rainy','rally','ranch','rapid','rascal','ratio','raven','realm','reign','relax','relay','repay','repel','rerun','reuse','rider','ridge','rifle','ripen','risen','risky','rivet','robot','rocky','rouge','rough','round','route','royal','rugby','ruler','runic','rupee','rusty','sadly','saint','salsa','salty','sandy','satay','scale','scamp','scant','scare','scary','scene','scent','scout','screw','sedan','sense','serum','seven','severed','shack','shade','shame','sharp','shawl','sheep','sheen','shelf','shell','shift','shine','shirt','shock','shoot','shore','short','shout','shove','shown','shrew','shrub','siege','sigma','silky','silly','since','sinew','siren','sixth','sixty','sizable','skate','skeletal','skied','skill','skimp','skivy','skull','slack','slash','slave','sleek','sleep','slice','slide','slime','sling','sloth','slunk','slurp','slyly','smart','smell','smile','smirk','smite','smoke','snack','snake','snare','snark','snide','sniff','snout','snuck','sooty','sorry','south','soupy','space','spade','spank','spare','spark','spawn','spear','speed','spend','spice','spine','spoke','spook','spoon','sport','spout','spree','sprig','spunk','squat','squid','staid','stain','stair','stake','stall','stamp','stand','stark','start','stash','stave','stays','stead','steam','steep','steer','stern','stick','stiff','still','sting','stock','stoic','stomp','stone','stood','store','stork','storm','story','stout','stove','straw','stray','strum','strut','stuck','study','stump','stung','stunt','style','suave','sugar','suite','sulky','sunny','super','swamp','swear','sweat','sweep','sweet','swept','swift','swirl','swoop','sword','synod','syrup','tabby','taboo','taint','tally','talon','tapir','taunt','tawny','taxed','thorn','those','threw','throw','thrum','thumb','thump','tiger','tight','tilde','timid','tipsy','tithe','today','token','total','touch','touchy','tough','towel','tower','toxic','toyed','tramp','trash','tread','treat','tremble','trend','trial','tribe','trick','tried','tripe','troll','trove','truck','truly','trump','trunk','truth','tuber','tulle','tuner','tunic','tuple','turbo','tutor','tweed','twice','twill','twine','twist','tying','typed','under','undue','unfit','unify','union','unlit','until','upper','upset','urban','utter','vague','valid','valor','value','vapor','vault','vaunt','venom','verge','verse','vicar','vigor','viral','virus','vital','vivid','vixen','vocal','vodka','voice','voila','voter','vying','wacky','wafer','waged','wager','waltz','wares','wrist','wrath','wrote','yacht','yearn','yield','young','youth','zebra','zilch','zonal']);

let wordleTarget='', wordleGuesses=[], wordleCurrent='', wordleOver=false;
const WORDLE_KEYBOARD_ROWS = [['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['ENTER','Z','X','C','V','B','N','M','⌫']];

function buildWordle() {
  return `<div id="wordle-wrap">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:4px">
      <div style="font-size:18px;font-weight:800;letter-spacing:4px">WORDLE</div>
      <button class="game-btn" onclick="initWordle()">↺ New</button>
      <span id="wordle-msg" style="font-size:12px;font-weight:700"></span>
    </div>
    <div id="wordle-grid">${Array(6).fill(0).map(()=>Array(5).fill(0).map(()=>'<div class="w-cell"></div>').join('')).join('')}</div>
    <div id="wordle-keyboard">
      ${WORDLE_KEYBOARD_ROWS.map(row=>`<div class="wk-row">${row.map(k=>`<button class="wk-key" id="wk-${k}" onclick="wordleKey('${k}')" style="${k==='ENTER'?'min-width:56px;font-size:11px':k==='⌫'?'min-width:44px':''}">${k}</button>`).join('')}</div>`).join('')}
    </div>
  </div>`;
}

function initWordle() {
  wordleTarget  = WORDLE_WORDS[Math.floor(Math.random()*WORDLE_WORDS.length)].toUpperCase();
  wordleGuesses = []; wordleCurrent = ''; wordleOver = false;
  document.getElementById('wordle-msg').textContent = '';
  // Reset grid
  document.querySelectorAll('.w-cell').forEach(c => { c.textContent=''; c.className='w-cell'; });
  // Reset keys
  document.querySelectorAll('.wk-key').forEach(k => k.className='wk-key');
  document.addEventListener('keydown', wordlePhysKey);
}

function wordlePhysKey(e) {
  if (!openWindows['wordle'] || wordleOver) return;
  if (e.key === 'Enter')      wordleKey('ENTER');
  else if (e.key === 'Backspace') wordleKey('⌫');
  else if (/^[a-zA-Z]$/.test(e.key)) wordleKey(e.key.toUpperCase());
}

function wordleKey(k) {
  if (wordleOver) return;
  const row = wordleGuesses.length;
  if (k === '⌫') {
    if (!wordleCurrent.length) return;
    wordleCurrent = wordleCurrent.slice(0,-1);
    wordleUpdateGrid(row);
    return;
  }
  if (k === 'ENTER') {
    if (wordleCurrent.length !== 5) { wordleShake(row); return; }
    if (!WORDLE_VALID.has(wordleCurrent.toLowerCase()) && !WORDLE_WORDS.includes(wordleCurrent.toLowerCase())) {
      const msg = document.getElementById('wordle-msg');
      if (msg) { msg.style.color='var(--yellow)'; msg.textContent='Not in word list'; setTimeout(()=>msg.textContent='',1500); }
      wordleShake(row); return;
    }
    wordleSubmit(row);
    return;
  }
  if (wordleCurrent.length >= 5) return;
  wordleCurrent += k;
  wordleUpdateGrid(row);
}

function wordleUpdateGrid(row) {
  const cells = document.querySelectorAll('.w-cell');
  for (let c = 0; c < 5; c++) {
    cells[row*5+c].textContent = wordleCurrent[c] || '';
  }
}

function wordleSubmit(row) {
  const guess = wordleCurrent;
  const target = wordleTarget;
  const cells  = document.querySelectorAll('.w-cell');
  const result = Array(5).fill('absent');
  const tChars = target.split('');
  const used   = Array(5).fill(false);

  // Correct first
  for (let i=0;i<5;i++) if (guess[i]===target[i]) { result[i]='correct'; used[i]=true; }
  // Present
  for (let i=0;i<5;i++) {
    if (result[i]==='correct') continue;
    const j = tChars.findIndex((c,idx) => c===guess[i] && !used[idx]);
    if (j>=0) { result[i]='present'; used[j]=true; }
  }

  // Animate
  result.forEach((r, i) => {
    setTimeout(() => {
      cells[row*5+i].className = `w-cell ${r}`;
      // Update keyboard
      const keyEl = document.getElementById(`wk-${guess[i]}`);
      if (keyEl) {
        const cur = keyEl.className;
        if (!cur.includes('correct') && (r==='correct' || !cur.includes('present'))) keyEl.className = `wk-key ${r}`;
      }
    }, i * 100);
  });

  wordleGuesses.push({ guess, result });
  wordleCurrent = '';

  setTimeout(() => {
    if (guess === target) {
      wordleOver = true;
      const msgs = ['Genius!','Magnificent!','Impressive!','Splendid!','Great!','Phew!'];
      const msg = document.getElementById('wordle-msg');
      if (msg) { msg.style.color='var(--green)'; msg.textContent=msgs[Math.min(wordleGuesses.length-1,5)]; }
      showNotif('🟩','Wordle',`You got it in ${wordleGuesses.length}!`);
    } else if (wordleGuesses.length >= 6) {
      wordleOver = true;
      const msg = document.getElementById('wordle-msg');
      if (msg) { msg.style.color='var(--red)'; msg.textContent=`The word was ${target}`; }
    }
  }, 600);
}

function wordleShake(row) {
  const cells = document.querySelectorAll('.w-cell');
  for (let c=0;c<5;c++) {
    const cell = cells[row*5+c];
    cell.style.animation='none';
    setTimeout(()=>{cell.style.animation='shake .3s ease';},10);
  }
}
