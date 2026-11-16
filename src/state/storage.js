// localStorage, then sessionStorage, then a page-memory map.
// In-app webviews (and Safari private mode) sometimes throw on localStorage; the game still runs.
const memory = new Map();
const mem = {
  getItem: k => (memory.has(k) ? memory.get(k) : null),
  setItem: (k, v) => { memory.set(k, String(v)); },
  removeItem: k => { memory.delete(k); },
};

function usable(store) {
  if (!store) return false;
  const k = '__twist_probe';
  store.setItem(k, '1');
  store.removeItem(k);
  return true;
}

function pick() {
  try { if (usable(localStorage)) return localStorage; } catch (e) {}
  try { if (usable(sessionStorage)) return sessionStorage; } catch (e) {}
  return mem;
}

const box = pick();
export const getItem = k => { try { return box.getItem(k); } catch (e) { return null; } };
export const setItem = (k, v) => { try { box.setItem(k, String(v)); } catch (e) {} };
export const removeItem = k => { try { box.removeItem(k); } catch (e) {} };
