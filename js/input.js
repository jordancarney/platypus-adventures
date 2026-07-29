// Keyboard + touch state mapped to named actions. Either source can drive any action.
import { KEYMAP } from './config.js';
import { touch } from './touch.js';

const held = new Set();
const pressedNow = new Set();   // edge-triggered, cleared each frame
const clearHeld = () => held.clear();

export const input = {
  init() {
    addEventListener('keydown', (e) => {
      // Cmd/Ctrl combos are browser/OS shortcuts: never handle or preventDefault them
      // (Cmd+R must still refresh). Worse, macOS SWALLOWS the keyup of any key released
      // while Cmd is held — so the moment Cmd goes down, flush everything we think is
      // held, or a walking key can stay stuck down forever.
      if (e.metaKey || e.ctrlKey) { clearHeld(); return; }
      if (e.altKey) return;
      const action = KEYMAP[e.code];
      if (!action) return;
      e.preventDefault();
      touch.hide();               // real keyboard in use: put the thumb controls away
      if (!held.has(action)) pressedNow.add(action);
      held.add(action);
    });
    addEventListener('keyup', (e) => {
      // Releasing Cmd/Ctrl: any keyups that happened during the combo were swallowed.
      if (e.code === 'MetaLeft' || e.code === 'MetaRight' ||
          e.code === 'ControlLeft' || e.code === 'ControlRight') clearHeld();
      const action = KEYMAP[e.code];
      if (!action) return;
      e.preventDefault();
      held.delete(action);
    });
    // Focus loss of any flavour means we may never see the matching keyups.
    addEventListener('blur', clearHeld);
    addEventListener('pagehide', clearHeld);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearHeld(); });
  },

  down: (action) => held.has(action) || touch.down(action),
  pressed: (action) => pressedNow.has(action) || touch.pressed(action),

  // movement vector, normalized; keyboard wins if both are active
  axis() {
    let x = (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0);
    let y = (held.has('down') ? 1 : 0) - (held.has('up') ? 1 : 0);
    if (x && y) { const s = Math.SQRT1_2; x *= s; y *= s; }
    if (x || y) return [x, y];
    return touch.axis();
  },

  endFrame() { pressedNow.clear(); touch.endFrame(); },
};
