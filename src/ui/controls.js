// On-screen gamepad: a D-pad plus A / B / Start / Select, GBA-emulator style.
// Pure input: turns presses into the same intents as the keyboard (see input.js).
//   D-pad = move (hold to repeat, slide to change direction)   A = undo   B = back   Start = restart   Select = mute
import { $, el } from './dom.js';

const ARROW = '<svg viewBox="0 0 24 24"><path d="M12 6 5 17h14z" fill="currentColor"/></svg>';
const ROT = { up: 0, right: 90, down: 180, left: 270 };
const DIR = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
// light haptic tick, only once the page has had a real tap (browsers block it before that)
const buzz = () => { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(8); };
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
      h.gesture(); buzz(); fn();
      if (repeat) t = setTimeout(() => { t = setInterval(fn, 150); }, 380);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => node.addEventListener(ev, stop));
  }

  // A flat cross: the pressed arm slides straight in under the centre. A single surface reads the thumb position,
  // so sliding between arms switches direction without lifting, like a real D-pad.
  const dpad = el('dpad', pad), cross = el('cross', dpad);
  for (const d of Object.keys(DIR)) {
    const arm = el('arm ' + d, cross); arm.innerHTML = ARROW; arm.firstChild.style.transform = `rotate(${ROT[d]}deg)`;
  }
  el('center', cross).appendChild(el('dimple'));
  let cur = null, timer = 0, active = false;
  const hold = fn => { clearTimeout(timer); clearInterval(timer); timer = setTimeout(() => { timer = setInterval(fn, 150); }, 380); };
  const setDir = d => {
    if (d === cur) return;
    cur = d; clearTimeout(timer); clearInterval(timer);
    if (d) dpad.dataset.dir = d; else delete dpad.dataset.dir;
    if (!d) return;
    buzz();
    const fire = () => h.dir(...DIR[d]); fire(); hold(fire);
  };
  const dirAt = e => {
    const r = dpad.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < r.width * .08) return cur;           // dead centre: keep what we had
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  };
  dpad.addEventListener('pointerdown', e => { e.preventDefault(); active = true; try { dpad.setPointerCapture(e.pointerId); } catch (err) {} h.gesture(); setDir(dirAt(e)); });
  dpad.addEventListener('pointermove', e => { if (active) setDir(dirAt(e)); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => dpad.addEventListener(ev, () => { active = false; setDir(null); }));
  const abs = el('abs', pad);
  const btn = (cls, label, aria, fn, parent) => { const b = document.createElement('button'); b.className = cls; b.textContent = label; b.setAttribute('aria-label', aria); parent.appendChild(b); press(b, fn); return b; };
  btn('b bb', 'B', 'back', () => h.back(), abs);
  btn('b a', 'A', 'undo', () => h.undo(), abs);
  const mid = el('mid', pad);
  [['SELECT', 'mute', () => h.mute()], ['START', 'restart', () => h.restart()]].forEach(([label, aria, fn]) => {
    const s = el('s', mid); btn('', '', aria, fn, s); s.appendChild(document.createTextNode(label));
  });
}
