// Overlay menus (pause, settings). Icon-first: the pause menu is a grid of icon tiles, settings is a list of icon rows
// with visual controls. A caption shows the label of the focused item. WASD / arrows move, Space / Enter choose,
// Z / Esc close; touch taps work too. Menus stack (settings opens over pause).
import { $, el } from './dom.js';
import { sfx } from '../audio/sfx.js';

const stack = [];
export const isOpen = () => stack.length > 0;

export const icon = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

/** spec: { layout:'grid'|'list', cols?, items:[{ icon:svgInner|()=>svgInner, label:str|()=>str, kind:'button'|'switch'|'bar'|'dots',
 *          act(), on()->bool, n, at()->index, set(i), step(dir), danger? }], onClose? } */
export function openMenu(spec) { stack.push({ spec, sel: 0 }); draw(); sfx.confirm(); }
export function closeMenu() {
  const top = stack.pop(); if (!top) return;
  if (top.spec.onClose) top.spec.onClose();
  draw(); sfx.back();
}
export function closeAll() { while (stack.length) { const t = stack.pop(); if (t.spec.onClose) t.spec.onClose(); } draw(); }

const val = (v, ...a) => typeof v === 'function' ? v(...a) : v;

function control(it, i, host, top) {
  if (it.kind === 'switch') { const s = el('sw' + (it.on() ? ' on' : ''), host); el('knob', s); }
  else if (it.kind === 'bar' || it.kind === 'dots') {
    const box = el(it.kind, host), at = it.at();
    for (let k = 0; k < it.n; k++) {
      const seg = el('seg' + (it.kind === 'bar' ? (k < at ? ' on' : '') : (k === at ? ' on' : '')), box);
      seg.dataset.i = k;
      seg.onpointerdown = e => { e.stopPropagation(); top.sel = i; it.set(it.kind === 'bar' ? (k + 1 === at ? k : k + 1) : k); sfx.pick(); draw(); };
    }
  }
}

function draw() {
  let root = $('menu'); if (!root) { root = el('', $('screen')); root.id = 'menu'; }
  const top = stack[stack.length - 1];
  root.classList.toggle('on', !!top);
  document.documentElement.classList.toggle('menu-open', !!top);
  root.innerHTML = '';
  if (!top) return;
  root.onpointerdown = e => { if (e.target === root) closeMenu(); e.stopPropagation(); };
  const grid = top.spec.layout === 'grid';
  const card = el('card ' + (grid ? 'grid' : 'list'), root); card.setAttribute('role', 'menu');
  const body = el(grid ? 'tiles' : 'rows', card);
  if (grid) body.style.setProperty('--cols', top.spec.cols || 3);
  top.spec.items.forEach((it, i) => {
    const row = el((grid ? 'tile' : 'row') + (i === top.sel ? ' sel' : '') + (it.danger ? ' danger' : '') + ' ' + (it.kind || 'button'), body);
    row.setAttribute('role', 'menuitem'); row.dataset.label = val(it.label); row.setAttribute('aria-label', val(it.label));
    el('ico', row).innerHTML = icon(val(it.icon));
    if (!grid) control(it, i, row, top);
    row.onpointerdown = e => { e.stopPropagation(); top.sel = i; if (!e.target.classList.contains('seg')) activate(); };
  });
  const cur = top.spec.items[top.sel];
  el('cap', card).textContent = cur ? val(cur.label) : '';
}

function adjust(d) {
  const top = stack[stack.length - 1]; if (!top) return;
  const it = top.spec.items[top.sel];
  if (it.step) { it.step(d); sfx.pick(); draw(); }
  else if (it.kind === 'switch' && it.act) { it.act(); sfx.pick(); draw(); }
}
function activate() {
  const top = stack[stack.length - 1]; if (!top) return;
  const it = top.spec.items[top.sel];
  if (it.act) { sfx.confirm(); it.act(); } else if (it.step) { it.step(1); sfx.pick(); }
  if (stack[stack.length - 1] === top) draw();
}

/** dr/dc = -1|0|1 (up/down, left/right) */
export function menuDir(dr, dc) {
  const top = stack[stack.length - 1]; if (!top) return;
  const n = top.spec.items.length;
  if (top.spec.layout === 'grid') {
    const cols = top.spec.cols || 3;
    if (dc) top.sel = (top.sel + dc + n) % n;
    else if (dr) {
      let s = top.sel + dr * cols;
      if (s < 0) { s = top.sel; while (s + cols < n) s += cols; }
      else if (s >= n) s = top.sel % cols;
      top.sel = s;
    }
    sfx.pick(); draw();
  } else if (dr) { top.sel = (top.sel + dr + n) % n; sfx.pick(); draw(); }
  else if (dc) adjust(dc);
}
export const menuActivate = activate;
