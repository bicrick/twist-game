// The one place screens change. Old screen zooms/fades out, the new one is built while hidden,
// then fades/zooms in. Nothing is ever visible half-built, so nothing pops.
//   dir 'in'   diving deeper (hub -> world -> level): zoom from the chosen door
//   dir 'out'  going back: zoom out
//   dir 'fade' same screen rebuilt (restart, resize): quick cross-fade
//   first      initial load: only the fade-in
import { $ } from './dom.js';
import { placeTop } from './hud.js';

const OUT = { in: 220, out: 200, fade: 110 }, IN = { in: 320, out: 300, fade: 170 };
let busy = false, pending = null, idle = [];
export const isBusy = () => busy;
// run once no screen change is in flight (e.g. show a banner only after the new screen is up)
export const whenIdle = fn => { if (busy) idle.push(fn); else fn(); };

export function swap(build, { dir = 'fade', origin = null, first = false } = {}) {
  if (busy) { pending = [build, { dir: 'fade' }]; return; }
  busy = true;
  const st = $('stage'), scr = $('screen');
  const outScale = { in: 1.4, out: .8, fade: .985 }[dir], inScale = { in: .78, out: 1.3, fade: 1.015 }[dir];

  const reveal = () => {
    st.classList.add('building');                       // no transitions while it is constructed
    build(); placeTop();
    st.style.transition = 'none'; st.style.transformOrigin = '50% 50%';
    st.style.opacity = 0; st.style.transform = `scale(${inScale})`;
    void st.offsetWidth;
    st.style.transition = `transform ${IN[dir]}ms cubic-bezier(.2,.7,.2,1), opacity ${IN[dir]}ms ease`;
    st.style.opacity = 1; st.style.transform = 'scale(1)';
    scr.classList.remove('fading');
    requestAnimationFrame(() => requestAnimationFrame(() => st.classList.remove('building')));
    setTimeout(() => {
      st.style.transition = ''; st.style.transform = '';
      busy = false;
      idle.splice(0).forEach(f => f());
      if (pending) { const [b, o] = pending; pending = null; swap(b, o); }
    }, IN[dir] + 20);
  };

  if (first) { st.style.opacity = 0; scr.classList.add('fading'); requestAnimationFrame(reveal); return; }
  st.style.transformOrigin = origin ? `${origin[0]}px ${origin[1]}px` : '50% 50%';
  st.style.transition = `transform ${OUT[dir]}ms cubic-bezier(.5,0,.9,.6), opacity ${OUT[dir]}ms ease`;
  scr.classList.add('fading');
  st.style.opacity = 0; st.style.transform = `scale(${outScale})`;
  setTimeout(reveal, OUT[dir]);
}
