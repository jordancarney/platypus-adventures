// Keyboard + touch state mapped to named actions. Either source can drive any action.
import { KEYMAP } from './config.js';
import { touch } from './touch.js';

const held = new Set();
const pressedNow = new Set();   // edge-triggered, cleared each frame

export const input = {
  init() {
    addEventListener('keydown', (e) => {
      const action = KEYMAP[e.code];
      if (!action) return;
      e.preventDefault();
      touch.hide();               // real keyboard in use: put the thumb controls away
      if (!held.has(action)) pressedNow.add(action);
      held.add(action);
    });
    addEventListener('keyup', (e) => {
      const action = KEYMAP[e.code];
      if (!action) return;
      e.preventDefault();
      held.delete(action);
    });
    addEventListener('blur', () => { held.clear(); });
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
