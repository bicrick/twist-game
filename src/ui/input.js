// Keyboard + touch (swipe) input -> intents. Keys never invert.
const DIRS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1], w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1] };

// handlers: { dir(dr,dc), undo(), redo(), restart(), back(), menu(), mute(), confirm(), gesture() }
export function bindInput(h) {
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    h.gesture();
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (DIRS[k]) { e.preventDefault(); h.dir(...DIRS[k]); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); h.confirm(); }
    else if (k === 'z') h.undo();
    else if (k === 'y') h.redo();
    else if (k === 'r') h.restart();
    else if (k === 'Escape') h.back();
    else if (k === 'Tab' || k === 'p') { e.preventDefault(); h.menu(); }
    else if (k === 'n') h.mute();
  });
  // swipe anywhere on the screen = move (off when the on-screen pad is showing). A tap does nothing.
  const padOn = () => document.documentElement.classList.contains('with-pad');
  let t0 = null;
  // Capture so a control that stops the bubble (title Settings, menu rows) still unlocks audio.
  addEventListener('pointerdown', e => { h.gesture(); if (e.pointerType !== 'mouse' && !padOn()) t0 = [e.clientX, e.clientY]; }, true);
  // Some iOS webviews only unlock audio on touchend, and they scroll/rubber-band unless the move is cancelled.
  addEventListener('touchend', () => h.gesture(), { passive: true, capture: true });
  addEventListener('touchmove', e => {
    if (e.touches.length > 1) return; // pinch-zoom stays available; the viewport is scalable on purpose
    if (e.target.closest && e.target.closest('#menu .card')) return;
    if (e.cancelable) e.preventDefault();
  }, { passive: false, capture: true });
  addEventListener('pointerup', e => {
    if (!t0) return;
    const dx = e.clientX - t0[0], dy = e.clientY - t0[1]; t0 = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) h.dir(0, dx > 0 ? 1 : -1); else h.dir(dy > 0 ? 1 : -1, 0);
  });
}
