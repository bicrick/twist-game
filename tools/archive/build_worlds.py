import json,re
h=open('tools/index_before_worlds.html').read()
W=json.load(open('./worlds.json'))
W[0]['intro']="Walk off an edge and come back on the other side. Violet seams turn you — and anything you push — over."
W[1]['intro']="Mirror pads flip whatever steps onto them — you, or the thing you push."
W[0]['hue']=205; W[1]['hue']=335
data="const WORLDS = "+json.dumps(W,separators=(',',':'))+";\n"
h=re.sub(r"const LEVELS = .*?;\n",lambda m:data,h,count=1,flags=re.S)

css=r"""
.cell.pad::after { content: ''; position: absolute; inset: 11%; border-radius: 18%; background: color-mix(in srgb, var(--padc) 30%, transparent);
                   border: 3px solid color-mix(in srgb, var(--padc) 70%, transparent); display: flex; align-items: center; justify-content: center;
                   font: 800 calc(var(--cell) * .42)/1 system-ui; color: var(--padc); }
.cell.pad.x::after { content: '\2194'; } .cell.pad.y::after { content: '\2195'; }
.lvl.exit { background: rgba(0,0,0,.28); color: rgba(255,255,255,.9); font: 800 calc(var(--cell) * .42)/1 system-ui; }
.lvl.locked { filter: saturate(.25) brightness(.92); }
.lvl .lock { position: absolute; left: 50%; top: 54%; width: 30%; height: 24%; transform: translate(-50%, -50%); background: rgba(0,0,0,.55); border-radius: 18%; }
.lvl .lock::before { content: ''; position: absolute; left: 18%; right: 18%; top: -85%; height: 100%; border: calc(var(--cell) * .05) solid rgba(0,0,0,.55); border-bottom: 0; border-radius: 99px 99px 0 0; }
.lvl .wname { position: absolute; left: 0; right: 0; top: 24%; text-align: center; font: 800 calc(var(--cell) * .2)/1 system-ui; color: #fff; text-shadow: 0 1px 0 rgba(0,0,0,.25); }
.lvl .wcount { position: absolute; left: 0; right: 0; bottom: 14%; text-align: center; font: 700 calc(var(--cell) * .15)/1 system-ui; color: rgba(255,255,255,.9); }
.lvl.bump { animation: bump .25s ease; } @keyframes bump { 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
#banner { position: fixed; left: 50%; top: 12%; transform: translate(-50%, -12px); z-index: 40; text-align: center; pointer-events: none; opacity: 0;
          transition: opacity .5s ease, transform .5s ease; max-width: 80vw; }
#banner.on { opacity: 1; transform: translate(-50%, 0); }
#banner h1 { margin: 0; font: 800 44px/1 system-ui; color: rgba(0,0,0,.55); letter-spacing: 1px; }
#banner p { margin: 10px 0 0; font: 600 16px/1.35 system-ui; color: rgba(0,0,0,.5); }
"""
h=h.replace(".win #floor { animation",css+".win #floor { animation",1)
h=h.replace("--twist: #8b5cf6; }","--twist: #8b5cf6; --padc: #d6498f; }",1)
h=h.replace('<div id="stage"></div>','<div id="banner"></div>\n<div id="stage"></div>',1)

a=h.index("  const N = LEVELS.length")
b=h.index("  function theme(h)")
h=h[:a]+r"""  const COLS = 6;
  let mode = 'hub', wi = 0, li = 0, state = null, hist = [], prev = {}, locked = false;
  let rp = [4, 3], room = null, CELL = 64, done = {}, seen = {}, completed = null;
  try { done = JSON.parse(localStorage.getItem('twist-done2') || '{}'); seen = JSON.parse(localStorage.getItem('twist-seen') || '{}'); } catch (e) {}
  const save = () => { try { localStorage.setItem('twist-done2', JSON.stringify(done)); localStorage.setItem('twist-seen', JSON.stringify(seen)); } catch (e) {} };
  const key = (w, l) => w + ':' + l;
  const worldDone = w => WORLDS[w].levels.every((_, l) => done[key(w, l)]);
  const worldCount = w => WORLDS[w].levels.filter((_, l) => done[key(w, l)]).length;
  const open_ = w => w === 0 || worldDone(w - 1);
  const hueOf = () => WORLDS[wi].hue;
  let bannerT = 0;
  function banner(title, sub, ms) {
    const b = $('banner'); b.innerHTML = '<h1></h1><p></p>'; b.firstChild.textContent = title; b.lastChild.textContent = sub || '';
    void b.offsetWidth; b.classList.add('on'); clearTimeout(bannerT); bannerT = setTimeout(hideBanner, ms || 4200);
  }
  function hideBanner() { $('banner').classList.remove('on'); }

"""+h[b:]

h=h.replace("      if (walls.has(k)) { i.style.background = 'rgba(0,0,0,.6)'; i.style.borderRadius = '38%'; }",
"      if (walls.has(k)) { i.style.background = 'rgba(0,0,0,.6)'; i.style.borderRadius = '38%'; }\n      else if (pads.has(k) && !blocks.has(k) && k !== def.player[0] + ',' + def.player[1]) { i.style.background = 'var(--padc)'; i.style.opacity = '.55'; i.style.transform = 'scale(.6)'; i.style.borderRadius = '20%'; }")
h=h.replace("const tg = new Set(def.targets.map(b => b[0] + ',' + b[1]));","const tg = new Set(def.targets.map(b => b[0] + ',' + b[1])), pads = new Set((def.pads || []).map(p => p[0] + ',' + p[1]));")

a=h.index("  // ---------- hub ----------")
b=h.index("  let worlds = [];")
rooms=r"""  // ---------- rooms (hub of worlds, and one room of levels per world) ----------
  function buildRoom(spec) {
    room = spec; theme(spec.hue);
    CELL = fit(spec.W, spec.H);
    const st = $('stage'); st.innerHTML = ''; st.classList.remove('win'); st.style.margin = '';
    st.style.setProperty('--cell', CELL + 'px');
    const floor = el('', st); floor.id = 'floor';
    floor.style.gridTemplateColumns = `repeat(${spec.W}, ${CELL}px)`; floor.style.gridAutoRows = CELL + 'px';
    for (let i = 0; i < spec.W * spec.H; i++) el('cell', floor);
    const size = Math.round(CELL * .86), off = (CELL - size) / 2;
    spec.boxes.forEach(bx => {
      const b = el('lvl' + (bx.cls ? ' ' + bx.cls : ''), floor); bx.node = b;
      b.style.width = b.style.height = size + 'px';
      b.style.left = bx.c * CELL + off + 'px'; b.style.top = bx.r * CELL + off + 'px';
      if (bx.color) b.style.background = bx.color;
      bx.fill(b, size);
    });
    const p = piece('player', floor, Math.round(CELL * .76)); orient(p, { fx: 0, fy: 0 });
    p.style.transition = 'left .1s ease, top .1s ease';
    st.place = () => { p.style.left = rp[1] * CELL + CELL * .12 + 'px'; p.style.top = rp[0] * CELL + CELL * .12 + 'px'; };
    st.place();
    $('dots').innerHTML = ''; $('chip').textContent = spec.chip || ''; $('hint').textContent = spec.hint;
  }
  function drawHub() {
    mode = 'hub';
    const boxes = WORLDS.map((w, i) => ({
      r: 2, c: 2 + 2 * i, cls: open_(i) ? '' : 'locked', color: `hsl(${w.hue} 45% 60%)`,
      fill(b) { const n = el('wname', b); n.textContent = w.name; const k = el('wcount', b); k.textContent = worldCount(i) + '/' + w.levels.length; if (!open_(i)) el('lock', b); },
      act() { if (open_(i)) showWorld(i, null); else { this.node.classList.remove('bump'); void this.node.offsetWidth; this.node.classList.add('bump'); banner('Locked', 'Finish ' + WORLDS[i - 1].name + ' first', 2200); } }
    }));
    buildRoom({ W: 7, H: 5, hue: null, boxes, chip: '', hint: 'WASD move  ·  walk into a world to enter it' });
  }
  function drawWorld() {
    mode = 'world';
    const w = WORLDS[wi], n = w.levels.length, rows = Math.ceil(n / COLS), H = 2 * rows + 1;
    const boxes = w.levels.map((d, l) => ({
      r: 1 + 2 * Math.floor(l / COLS), c: 1 + 2 * (l % COLS), color: `hsl(${w.hue} 45% 58%)`,
      fill(b, size) { b.appendChild(preview(d, size)); const k = el('num', b); k.textContent = l + 1; if (done[key(wi, l)]) { const t = el('tick', b); t.textContent = '✓'; } },
      act() { enter(wi, l); }
    }));
    boxes.push({ r: H - 1, c: 0, cls: 'exit', fill(b) { b.textContent = '←'; }, act() { showHub(wi); } });
    buildRoom({ W: 2 * COLS + 1, H, hue: w.hue, boxes, chip: w.name, hint: 'WASD move  ·  walk into a level to enter it  ·  arrow box = back' });
  }
  function showHub(from) {
    rp = from === null || from === undefined ? [4, 3] : [3, 2 + 2 * from]; drawHub();
  }
  function showWorld(w, from) {
    wi = w;
    const H = 2 * Math.ceil(WORLDS[w].levels.length / COLS) + 1;
    rp = from === null || from === undefined ? [H - 1, 2] : [2 + 2 * Math.floor(from / COLS), 1 + 2 * (from % COLS)];
    drawWorld();
    if (!seen[w]) { seen[w] = 1; save(); banner(WORLDS[w].name, WORLDS[w].intro, 6500); }
  }
  function roomMove(dr, dc) {
    const r = rp[0] + dr, c = rp[1] + dc;
    if (r < 0 || c < 0 || r >= room.H || c >= room.W) return;
    const bx = room.boxes.find(b => b.r === r && b.c === c);
    if (bx) { bx.act(); return; }
    rp = [r, c]; $('stage').place();
  }

  // ---------- level ----------
  function enter(w, l) {
    mode = 'level'; wi = w; li = l; state = parseLevel(WORLDS[w].levels[l]); hist = []; dirs.length = 0; prev = {}; locked = false;
    hideBanner(); buildLevel();
  }
"""
h=h[:a]+rooms+h[b:]
h=h.replace("const L = state.L; theme(hueOf(li));","const L = state.L; theme(hueOf());")
h=h.replace("$('chip').textContent = li + 1;","$('chip').textContent = WORLDS[wi].name + ' ' + (li + 1);")
h=h.replace("""      const wall = L.walls.has(r + ',' + c), d = el('cell' + (wall ? ' wall' : ''), root);""","""      const wall = L.walls.has(r + ',' + c), pd = L.pads.get(r + ',' + c), d = el('cell' + (wall ? ' wall' : '') + (pd ? ' pad ' + pd : ''), root);""")
a=h.index("  function act(ns) {")
b=h.index("  window.addEventListener('resize'")
tail=r"""  function act(ns) {
    if (!ns) return;
    hist.push(state); dirs.push(curDir); state = ns; update();
    if (isWin(state)) {
      locked = true;
      const was = worldDone(wi); done[key(wi, li)] = true; save();
      completed = !was && worldDone(wi) ? wi : null;
      $('stage').classList.add('win');
      setTimeout(finish, 1100);
    }
  }
  function finish() {
    locked = false;
    if (completed !== null) {
      const w = completed; completed = null; showHub(w);
      const nx = WORLDS[w + 1];
      banner(WORLDS[w].name + ' complete', nx ? nx.name + ' is unlocked' : 'That is every world, for now', 5000);
    } else showWorld(wi, li);
  }

  document.addEventListener('keydown', e => {
    const dirs_ = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
                    w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1] };
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (dirs_[k]) { e.preventDefault(); if (locked) return; if (mode !== 'level') roomMove(...dirs_[k]); else { curDir = dirs_[k]; act(step(state, ...dirs_[k])); } }
    else if (mode === 'level' && !locked) {
      if (k === 'z' && hist.length) { const d = dirs.pop(); curDir = [-d[0], -d[1]]; state = hist.pop(); update(); }
      else if (k === 'r') enter(wi, li);
      else if (k === 'Escape' || k === 'm') showWorld(wi, li);
    } else if (mode === 'world' && (k === 'Escape' || k === 'm')) showHub(wi);
  });
"""
h=h[:a]+tail+h[b:]
a=h.index("  window.addEventListener('resize'")
h=h[:a]+r"""  window.addEventListener('resize', () => { if (mode === 'hub') drawHub(); else if (mode === 'world') drawWorld(); else buildLevel(); });
  window.__set = f => { state = f(state); update(); };
  window.__enter = enter; window.__hub = () => showHub(null); window.__world = w => showWorld(w, null);
  window.__done = () => done;
  showHub(null);
}
</script>
"""
open('index.html','w').write(h)
js=h.split('<script>')[1].split('</script>')[0]
open('./ui_check.js','w').write(js)
