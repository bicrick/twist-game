// Real-device diagnostics: open the game with ?debug=1 and screenshot the little panel. Only loaded on demand.
import * as settings from '../state/settings.js';

export function initDebug() {
  const box = document.createElement('div');
  box.id = 'dbg'; box.style.cssText = 'position:fixed;left:6px;top:6px;z-index:999;padding:6px 8px;border-radius:8px;background:rgba(0,0,0,.72);color:#9fe;font:11px/1.35 ui-monospace,Menlo,monospace;white-space:pre;pointer-events:none;max-width:70vw';
  document.body.appendChild(box);
  const probe = document.createElement('div');      // reads the safe-area insets (notch / home bar)
  probe.style.cssText = 'position:fixed;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(probe);
  let frames = 0, fps = 0, worst = 0, last = performance.now(), t0 = last;
  const tick = t => { frames++; worst = Math.max(worst, t - last); last = t; if (t - t0 >= 1000) { fps = Math.round(frames * 1000 / (t - t0)); frames = 0; t0 = t; setTimeout(() => { worst = 0; }, 1000); } requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  const mq = q => matchMedia(q).matches;
  setInterval(async () => {
    const cs = getComputedStyle(probe), vv = window.visualViewport, sw = 'serviceWorker' in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 'n/a';
    const mem = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB' : 'n/a';
    box.textContent =
      `build ${window.__BUILD__}\n` +
      `fps ${fps}  worst frame ${Math.round(worst)}ms  heap ${mem}\n` +
      `viewport ${innerWidth}x${innerHeight} @${devicePixelRatio}x  visual ${vv ? vv.width.toFixed(0) + 'x' + vv.height.toFixed(0) + ' scale ' + vv.scale.toFixed(2) : 'n/a'}\n` +
      `pointer ${mq('(pointer: coarse)') ? 'coarse(touch)' : 'fine'} hover ${mq('(hover: hover)')} maxTouch ${navigator.maxTouchPoints}\n` +
      `pad ${document.documentElement.classList.contains('with-pad')}  orientation ${screen.orientation ? screen.orientation.type : (innerWidth > innerHeight ? 'landscape' : 'portrait')}\n` +
      `safe-area t${cs.paddingTop} r${cs.paddingRight} b${cs.paddingBottom} l${cs.paddingLeft}\n` +
      `standalone ${mq('(display-mode: standalone)') || navigator.standalone === true}  sw ${sw}  online ${navigator.onLine}\n` +
      `gesture ${navigator.userActivation ? navigator.userActivation.hasBeenActive : 'n/a'}  sound ${settings.get('sound')} vol ${settings.get('volume')} ${settings.get('style')}\n` +
      `reduceMotion ${settings.get('reduceMotion')} (os ${mq('(prefers-reduced-motion: reduce)')})  ${navigator.userAgent.replace(/\(.*?\)/, '').slice(0, 60)}`;
  }, 500);
}
