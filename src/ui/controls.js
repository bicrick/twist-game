// On-screen gamepad: a D-pad plus A / B / Start / Select, GBA-emulator style.
// Pure input: turns presses into the same intents as the keyboard (see input.js).
//   D-pad = move (hold to repeat)   A = undo   B = back   Start = restart   Select = mute
import { $, el } from './dom.js';

const ARROW = '<svg viewBox="0 0 24 24"><path d="M12 6 5 17h14z" fill="currentColor"/></svg>';
const ROT = { up: 0, right: 90, down: 180, left: 270 };
const DIR = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const wantsPad = () => matchMedia('(pointer: coarse)').matches || innerWidth < 640 || /[?&]pad=1/.test(location.search);

export function initControls(h) {
  const root = document.documentElement, pad = $('pad');
  const sync = () => root.classList.toggle('with-pad', wantsPad());
  sync(); addEventListener('resize', sync); // keep first: the app's resize handler reads the new screen size

  function press(node, fn, repeat) {
    let t = 0;
    const stop = () => { clearTimeout(t); clearInterval(t); node.classList.remove('on'); };
    node.addEventListener('pointerdown', e => {
      e.preventDefault(); node.setPointerCapture(e.pointerId); node.classList.add('on');
      h.gesture(); navigator.vibrate && navigator.vibrate(8); fn();
      if (repeat) t = setTimeout(() => { t = setInterval(fn, 150); }, 380);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => node.addEventListener(ev, stop));
  }

  const dpad = el('dpad', pad);
  for (const d of Object.keys(DIR)) {
    const k = document.createElement('button'); k.className = 'k ' + d; k.setAttribute('aria-label', d);
    k.innerHTML = ARROW; k.firstChild.style.transform = `rotate(${ROT[d]}deg)`; dpad.appendChild(k);
    press(k, () => h.dir(...DIR[d]), true);
  }
  const abs = el('abs', pad);
  const btn = (cls, label, aria, fn, parent) => { const b = document.createElement('button'); b.className = cls; b.textContent = label; b.setAttribute('aria-label', aria); parent.appendChild(b); press(b, fn); return b; };
  btn('b bb', 'B', 'back', () => h.back(), abs);
  btn('b a', 'A', 'undo', () => h.undo(), abs);
  const mid = el('mid', pad);
  [['SELECT', 'mute', () => h.mute()], ['START', 'restart', () => h.restart()]].forEach(([label, aria, fn]) => {
    const s = el('s', mid); btn('', '', aria, fn, s); s.appendChild(document.createTextNode(label));
  });
}
