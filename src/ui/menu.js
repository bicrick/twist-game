// A small overlay menu (pause, settings...). Keyboard, mouse and the touch pad all drive it through the same
// intents: dir (up/down select, left/right adjust), activate, close. Menus stack (settings opens over pause).
import { $, el } from './dom.js';
import { sfx } from '../audio/sfx.js';

const stack = [];
export const isOpen = () => stack.length > 0;

/** spec: { title, items:[{label, kind:'button'|'toggle'|'choice'|'range', value()->text, act(), step(dir), danger?}], onClose? } */
export function openMenu(spec) {
  stack.push({ spec, sel: 0 }); draw(); sfx.confirm();
}
export function closeMenu() {
  const top = stack.pop(); if (!top) return;
  if (top.spec.onClose) top.spec.onClose();
  draw(); sfx.back();
}
export function closeAll() { while (stack.length) { const t = stack.pop(); if (t.spec.onClose) t.spec.onClose(); } draw(); }

function draw() {
  let root = $('menu'); if (!root) { root = el('', $('screen')); root.id = 'menu'; }
  const top = stack[stack.length - 1];
  root.classList.toggle('on', !!top);
  document.documentElement.classList.toggle('menu-open', !!top);
  if (!top) { root.innerHTML = ''; return; }
  root.innerHTML = '';
  root.onpointerdown = e => { if (e.target === root) closeMenu(); e.stopPropagation(); };
  const card = el('card', root); card.setAttribute('role', 'menu');
  el('h2', card).textContent = top.spec.title;
  top.spec.items.forEach((it, i) => {
    const row = el('row' + (i === top.sel ? ' sel' : '') + (it.danger ? ' danger' : '') + ' ' + (it.kind || 'button'), card);
    row.setAttribute('role', 'menuitem');
    el('lbl', row).textContent = it.label;
    if (it.kind && it.kind !== 'button') {
      const v = el('val', row);
      if (it.kind === 'choice' || it.kind === 'range') {
        const l = el('arr', v); l.textContent = '‹'; l.onpointerdown = e => { e.stopPropagation(); top.sel = i; adjust(-1); };
        el('txt', v).textContent = it.value();
        const r = el('arr', v); r.textContent = '›'; r.onpointerdown = e => { e.stopPropagation(); top.sel = i; adjust(1); };
      } else el('txt pill' + (it.on && it.on() ? ' on' : ''), v).textContent = it.value();
    }
    row.onpointerdown = e => { e.stopPropagation(); top.sel = i; if (!(e.target.classList && e.target.classList.contains('arr'))) activate(); };
  });
}
function adjust(d) { const top = stack[stack.length - 1]; if (!top) return; const it = top.spec.items[top.sel]; if (it.step) { it.step(d); sfx.pick(); draw(); } }
function activate() { const top = stack[stack.length - 1]; if (!top) return; const it = top.spec.items[top.sel]; if (it.act) { sfx.confirm(); it.act(); } else if (it.step) { it.step(1); sfx.pick(); } if (stack[stack.length - 1] === top) draw(); }

export function menuDir(dr, dc) {
  const top = stack[stack.length - 1]; if (!top) return;
  if (dr) { top.sel = (top.sel + dr + top.spec.items.length) % top.spec.items.length; sfx.pick(); draw(); }
  else if (dc) adjust(dc);
}
export const menuActivate = activate;
