// Double-tap zoom is a browser default. touch-action: none does not stop it on real
// iOS Safari (and it also blocks pinch). The viewport stays scalable on purpose —
// user-scalable=no / maximum-scale=1 was the Lighthouse a11y failure — so this
// cancels only the second tap. The move already ran on pointerdown: a single tap,
// a hold-to-repeat, and a slide between directions are left alone. A two-finger
// pinch is left alone too.

const WINDOW_MS = 300;

export function blockDoubleTapZoom(target = document) {
  let last = 0;
  let pinch = false;
  target.addEventListener('touchstart', e => {
    if (e.touches.length > 1) pinch = true;
  }, { capture: true, passive: true });
  target.addEventListener('touchend', e => {
    if (pinch) {
      if (e.touches.length === 0) pinch = false;
      return;
    }
    const now = Date.now();
    if (last && now - last <= WINDOW_MS && e.cancelable) e.preventDefault();
    last = now;
  }, { capture: true, passive: false });
  target.addEventListener('touchcancel', () => { pinch = false; last = 0; }, { capture: true, passive: true });
  // Safari (2024–2025) still zooms unless dblclick is cancelled, even when touch-action is set.
  target.addEventListener('dblclick', e => { if (e.cancelable) e.preventDefault(); }, { capture: true });
}
