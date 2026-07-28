// localStorage persistence across three save slots.
const PREFIX = 'platypus_adventures_save_v2_slot';
const LEGACY_KEY = 'platypus_adventures_save_v1';

export const SLOTS = 3;
const key = (i) => PREFIX + i;

export function saveSlot(i, state) {
  try { localStorage.setItem(key(i), JSON.stringify(state)); } catch { /* private mode etc. */ }
}
export function loadSlot(i) {
  try {
    const s = localStorage.getItem(key(i));
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}
export function clearSlot(i) { try { localStorage.removeItem(key(i)); } catch {} }

export function listSlots() {
  return Array.from({ length: SLOTS }, (_, i) => loadSlot(i));
}

// Carry a pre-slots single save forward into File 1 so nobody loses a run.
export function migrateLegacySave() {
  try {
    const old = localStorage.getItem(LEGACY_KEY);
    if (old && !localStorage.getItem(key(0))) localStorage.setItem(key(0), old);
    if (old) localStorage.removeItem(LEGACY_KEY);
  } catch {}
}
