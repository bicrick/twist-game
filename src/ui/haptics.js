// Haptics. The switch is offered only where a call can actually move a motor.
// Measured on this machine (Chrome 157, Linux, no vibrator): navigator.vibrate is a
// function and, after a trusted click, vibrate(0|40|200) all return true. The return
// value is not a hardware check. WebKit never shipped vibrate (every iOS browser).
// Firefox removed it in 129. Blink drives a vibrator on Android.
import * as settings from '../state/settings.js';

const TICK = 40;
let refused = false;

export function offerHaptics({ vibrate, ua = '', mobile, platform = '' } = {}) {
  if (typeof vibrate !== 'function') return false;
  if (/iPhone|iPad|iPod/i.test(ua)) return false;
  if (/Android/i.test(ua) || /Android/i.test(platform)) return true;
  if (mobile === false) return false;
  return false;
}

export function offered() {
  if (refused || typeof navigator === 'undefined') return false;
  const uad = navigator.userAgentData;
  return offerHaptics({
    vibrate: navigator.vibrate,
    ua: navigator.userAgent || '',
    mobile: uad ? uad.mobile : undefined,
    platform: uad && uad.platform ? uad.platform : '',
  });
}

export function pulse() {
  if (!offered() || !settings.get('haptics')) return false;
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return false;
  let ok = false;
  try { ok = navigator.vibrate(TICK); } catch (e) { ok = false; }
  // A refusal during the gesture means this Android webview has no motor / no permission.
  if (ok === false && navigator.userActivation && navigator.userActivation.isActive) refused = true;
  return !!ok;
}

export function silence() {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try { navigator.vibrate(0); } catch (e) {}
}
