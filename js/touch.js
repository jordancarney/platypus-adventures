// Touch controls: floating thumbstick + action buttons + menu taps.
//
// Feel notes:
//  - The stick has a *dynamic* origin: wherever the thumb lands in the left zone becomes
//    center, so there's no fixed pad to hunt for and drift never fights you.
//  - Sword auto-repeats while held (still cooldown-gated). Mashing glass is miserable.
//  - Buttons are tracked per pointer id, so sliding off still counts as held, and you can
//    move + slash + block with three fingers at once.
//  - Hit radii are padded well beyond the drawn circle; fingers are bigger than pixels.

import { VIEW_W, VIEW_H } from './config.js';

export const STICK = { hx: 46, hy: 182, r: 26, knob: 11, max: 21, dead: 2.5 };

export const PAD_BUTTONS = [
  { action: 'sword', x: 356, y: 202, r: 21, icon: 'sword', repeat: true },
  { action: 'bow', x: 320, y: 168, r: 16, icon: 'bow' },
  { action: 'shield', x: 374, y: 156, r: 16, icon: 'shield' },
  { action: 'interact', x: 300, y: 198, r: 14, icon: 'E' },
  { action: 'cycleR', x: 378, y: 118, r: 12, icon: 'arrow' },
];

// Spaced 40px apart so the padded hit zones (r + HIT_PAD = 18) can't overlap.
// Away from the thumb-rest zones on purpose: these are deliberate presses, not combat.
export const TOP_BUTTONS = [
  { action: 'teleport', x: 144, y: 13, r: 11, icon: 'warp' },
  { action: 'map', x: 184, y: 13, r: 11, icon: 'M' },
  { action: 'pause', x: 224, y: 13, r: 11, icon: 'pause' },
];

const HIT_PAD = 7;          // extra forgiveness around each button
const TAP_SLOP = 12;        // movement that still counts as a tap
const TAP_TIME = 600;       // ms a tap may last

const held = new Set();
const pressedNow = new Set();
const repeatable = new Set(PAD_BUTTONS.filter(b => b.repeat).map(b => b.action));
const pointers = new Map(); // pointerId -> { kind, action?, sx, sy, t0, moved }
const taps = [];

let canvas = null;
let enabled = false;        // are the on-screen controls showing?
let padActive = false;      // is gameplay (vs a menu) on screen?
let stick = { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 };

function toInternal(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return [
    (clientX - r.left) / r.width * VIEW_W,
    (clientY - r.top) / r.height * VIEW_H,
  ];
}

const hitButton = (list, x, y) =>
  list.find(b => Math.hypot(x - b.x, y - b.y) <= b.r + HIT_PAD);

// lower-left region drives the stick
const inStickZone = (x, y) => x < VIEW_W * 0.46 && y > VIEW_H * 0.34;

function press(action) {
  if (!held.has(action)) pressedNow.add(action);
  held.add(action);
}

const releaseStick = () => { stick = { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 }; };

// Undo whatever a pointer was driving. Used on release and when evicting a stale record.
function releasePointer(id, rec) {
  if (!rec) return;
  if (rec.kind === 'button') held.delete(rec.action);
  else if (rec.kind === 'stick' && stick.id === id) releaseStick();
}

// Drop every in-flight touch. iOS never sends pointerup if a system gesture, notification
// or app switch steals the touch, which otherwise leaves the stick jammed on.
function releaseAll() {
  for (const [id, rec] of pointers) releasePointer(id, rec);
  pointers.clear();
  held.clear();
  pressedNow.clear();
  releaseStick();
}

function onDown(e) {
  if (!canvas) return;
  const touchLike = e.pointerType === 'touch' || e.pointerType === 'pen';
  if (touchLike) enabled = true;
  // A recycled pointerId means we missed that pointer's release; let go of it first,
  // otherwise its stick/button stays held for the rest of the session.
  if (pointers.has(e.pointerId)) {
    releasePointer(e.pointerId, pointers.get(e.pointerId));
    pointers.delete(e.pointerId);
  }
  const [x, y] = toInternal(e.clientX, e.clientY);
  const rec = { sx: e.clientX, sy: e.clientY, t0: performance.now(), moved: false, kind: 'tap' };

  // Only real touches drive the pad. A mouse click must stay a plain tap (for menus) —
  // otherwise clicking the lower-left of the canvas on desktop grabs an INVISIBLE stick,
  // and a click-drag whose release lands outside the window leaves Gus walking forever.
  if (padActive && touchLike) {
    const top = hitButton(TOP_BUTTONS, x, y);
    const btn = top || hitButton(PAD_BUTTONS, x, y);
    if (btn) {
      rec.kind = 'button';
      rec.action = btn.action;
      press(btn.action);
      buzz(8);
    } else if (inStickZone(x, y)) {
      // Latest touch in the zone always wins the stick. iPadOS can steal a touch with NO
      // event at all (edge swipes, notification pulls) — if the old owner blocked new
      // grabs, the stick jammed until an app switch, and re-grabbing (the natural fix a
      // player reaches for) did nothing. Stealing also costs little in normal play: a
      // stray second finger just re-centers the stick where it landed.
      if (stick.active) releaseStick();
      rec.kind = 'stick';
      stick = { active: true, id: e.pointerId, ox: x, oy: y, dx: 0, dy: 0 };
    }
  }
  pointers.set(e.pointerId, rec);
}

// Touches are implicitly captured by the element they land on, and WebKit fires
// lostpointercapture on abnormal teardown even in some cases where pointerup never
// arrives. No tap synthesis here: coordinates may be 0,0 and this is not a click.
function onLost(e) {
  if (stick.active && stick.id === e.pointerId) releaseStick();
  const rec = pointers.get(e.pointerId);
  if (!rec) return;
  pointers.delete(e.pointerId);
  if (rec.kind === 'button') held.delete(rec.action);
}

function onMove(e) {
  const rec = pointers.get(e.pointerId);
  if (!rec) return;
  if (Math.hypot(e.clientX - rec.sx, e.clientY - rec.sy) > TAP_SLOP) rec.moved = true;
  if (rec.kind === 'stick' && stick.active && stick.id === e.pointerId) {
    const [x, y] = toInternal(e.clientX, e.clientY);
    let dx = x - stick.ox, dy = y - stick.oy;
    const d = Math.hypot(dx, dy);
    if (d > STICK.max) { dx = dx / d * STICK.max; dy = dy / d * STICK.max; }
    stick.dx = dx; stick.dy = dy;
  }
}

function onUp(e) {
  // Release the stick on id match no matter what, before any early return: a release must
  // never be able to leave it running.
  if (stick.active && stick.id === e.pointerId) releaseStick();
  const rec = pointers.get(e.pointerId);
  if (!rec) return;
  pointers.delete(e.pointerId);
  if (rec.kind === 'button') {
    held.delete(rec.action);
  } else if (rec.kind === 'tap' && !rec.moved && performance.now() - rec.t0 < TAP_TIME) {
    const [x, y] = toInternal(e.clientX, e.clientY);
    taps.push({ x, y });
  }
}

// Last line of defence, run every frame: if the pointer driving the stick (or a button) is
// no longer tracked, whatever it was holding is stale — let go.
function reconcile() {
  if (stick.active && !pointers.has(stick.id)) releaseStick();
  if (held.size) {
    const live = new Set();
    for (const rec of pointers.values()) if (rec.kind === 'button') live.add(rec.action);
    for (const action of [...held]) if (!live.has(action)) held.delete(action);
  }
  // Sweep tap records whose release we never saw. Past TAP_TIME they can't become a tap
  // anyway, and a mouse released outside the window would otherwise linger forever.
  const now = performance.now();
  for (const [id, rec] of pointers) {
    if (rec.kind === 'tap' && now - rec.t0 > 5000) pointers.delete(id);
  }
}

export function buzz(ms) {
  if (enabled && navigator.vibrate) { try { navigator.vibrate(ms); } catch {} }
}

export const touch = {
  init(cnv) {
    canvas = cnv;
    addEventListener('pointerdown', onDown, { passive: false });
    addEventListener('pointermove', onMove, { passive: false });
    addEventListener('pointerup', onUp, { passive: false });
    addEventListener('pointercancel', onUp, { passive: false });
    addEventListener('lostpointercapture', onLost);   // bubbles up from wherever the touch landed
    // A touch interrupted by an app switch, notification or the home-bar gesture never
    // gets a pointerup, so drop everything when we lose the foreground.
    addEventListener('blur', releaseAll);
    addEventListener('pagehide', releaseAll);
    document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
    // long-press menus and selection get in the way of a game
    addEventListener('contextmenu', (e) => { if (enabled) e.preventDefault(); });
  },

  // Gameplay on screen => stick/buttons live. Menus => every pointer is a tap.
  setPadActive(v) {
    if (padActive === v) return;
    padActive = v;
    if (!v) {
      held.clear();
      releaseStick();
      for (const [id, rec] of pointers) if (rec.kind !== 'tap') pointers.delete(id);
    }
  },

  down: (action) => held.has(action),
  pressed: (action) =>
    pressedNow.has(action) || (repeatable.has(action) && held.has(action)),

  axis() {
    if (!stick.active) return [0, 0];
    const d = Math.hypot(stick.dx, stick.dy);
    if (d < STICK.dead) return [0, 0];
    // normalize to the stick's max throw so partial pushes still read as full input
    const m = Math.min(1, d / STICK.max);
    return [(stick.dx / d) * m, (stick.dy / d) * m];
  },

  takeTaps() {
    if (!taps.length) return [];
    const out = taps.slice();
    taps.length = 0;
    return out;
  },

  endFrame() { pressedNow.clear(); reconcile(); },

  get enabled() { return enabled; },
  get padActive() { return padActive; },
  get stickState() { return stick; },
  // a keyboard user on a touchscreen laptop shouldn't see thumb controls
  hide() { if (enabled) { enabled = false; releaseAll(); } },
};
