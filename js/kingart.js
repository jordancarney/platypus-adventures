// Art for the Platypus Kingdom: the five power items, the grapple's hook, and (built in
// code) the folk of Castle Mirri. Same ASCII conventions as pixelart.js: '.' is clear, an
// UPPERCASE letter is the lit version of its lowercase color.

export const KING_DEFS = {};
const D = KING_DEFS;

// ---------- the five powers ----------
D.pw_shovel = { colors: { d: '#2a2018', w: '#a8744a', s: '#9aa4b4', g: '#e0b060' }, map: [
  '...dddd...',
  '...dWwd...',
  '....dd....',
  '....dwd...',
  '....dwd...',
  '....dwd...',
  '...dggd...',
  '..dsSSsd..',
  '..dsSssd..',
  '..dsssd...',
  '...dsd....',
  '....d.....',
]};
D.pw_jump = { colors: { d: '#1e2430', r: '#4a8ad8', y: '#f0c83a', s: '#5a5048', w: '#ffffff' }, map: [
  '..dddd....',
  '..dRRd....',
  '..dRrd....',
  '..drrd....',
  '..drrdddd.',
  '.drRrrrrwd',
  '.dddddddd.',
  '..dysyd...',
  '..dsysd...',
  '..dysyd...',
  '.ddddddd..',
]};
D.pw_dash = { colors: { d: '#3a1a10', o: '#ff8a3a', y: '#ffe0a0' }, map: [
  '.......ddd',
  '.....ddoOd',
  '...ddoooOd',
  'y.doooooOd',
  '.dooooooOd',
  'doooooooOd',
  '.ddoooooOd',
  'y..ddddddd',
]};
D.pw_dive = { colors: { d: '#3a2410', y: '#d8a040', g: '#4ab0d8', w: '#e8fbff' }, map: [
  '...dddd...',
  '..dYYyyd..',
  '.dyddddyd.',
  'dydggwgdyd',
  'dydgGggdyd',
  'dydgggGdyd',
  '.dyddddyd.',
  '..dyyyyd..',
  '.dYyyyyyd.',
  '.dddddddd.',
]};
D.pw_hook = { colors: { d: '#1e2026', s: '#a8b0bc', g: '#ffd84a' }, map: [
  '...dd...',
  '..dgGd..',
  '..dggd..',
  '...dd...',
  '...dsd..',
  '...dsd..',
  'd..dsd.d',
  'sd.dsd.s',
  'dSsssssd',
  '.dsssSd.',
  '..dddd..',
]};
// the hook's head in flight, pointing right (drawn rotated to its heading)
D.hookhead = { colors: { d: '#1e2026', s: '#c8d0dc' }, map: [
  '.dd...',
  'dssd..',
  '.dsssd',
  'dssd..',
  '.dd...',
]};

// a secret book: a fat purple tome with a gold clasp and a star on the cover
D.secretbook = { colors: { d: '#2a1030', p: '#8a3ab0', g: '#f0c83a', w: '#f2e2b8' }, map: [
  '.dddddddd.',
  'dpPPppppgd',
  'dpPpgppwgd',
  'dpgggppwgd',
  'dppgpppwgd',
  'dpppppgwgd',
  'dppppppwgd',
  '.dddddddd.',
]};

// the puggles' ball for fetch: red with a white stripe
D.ball = { colors: { d: '#5a1018', r: '#e0303a', w: '#ffffff' }, map: [
  '.ddd.',
  'dRrrd',
  'dwwwd',
  'drrrd',
  '.ddd.',
]};

// ---------- painted in code: Castle Mirri, its folk and furniture ----------
function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const P = (x, y, col, ww = 1, hh = 1) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), ww, hh); };
  return { c, g, P };
}
const done = (c) => ({ canvas: c, w: c.width, h: c.height });

// The folk: Gus's own build in their own colors, with a hat (or a helmet and a spear) on
// top. `look` overrides his palette; `dress` paints on extras, given the pixel helper and
// where his 16x16 frame landed in the canvas.
const FOLK = {
  guard:        { look: { b: '#8a5a3a', l: '#d8b088', m: '#c0283a' }, armor: 'armor3', pad: [4, 6, 4, 0], dress: (P, ox, oy) => {
    // a steel helmet with a red plume, and a spear held upright
    P(ox + 4, oy - 1, '#5a5a6a', 7, 3); P(ox + 5, oy - 2, '#8a8aa0', 5, 2); P(ox + 6, oy - 2, '#c8c8d8', 2, 1);
    P(ox + 7, oy - 5, '#e03040', 2, 3); P(ox + 8, oy - 6, '#ff6a7a', 1, 2);
    P(ox + 17, oy - 5, '#7a5230', 1, 21); P(ox + 16, oy - 6, '#c8ccd4', 3, 1); P(ox + 17, oy - 8, '#e8ecf4', 1, 3);
  } },
  queen:        { base: 'elder', pad: [0, 5, 0, 0], dress: (P, ox, oy) => {
    // a golden crown with a ruby in front
    P(ox + 5, oy - 2, '#f0c83a', 5, 2); P(ox + 5, oy - 4, '#f0c83a', 1, 2); P(ox + 7, oy - 4, '#f0c83a', 1, 2); P(ox + 9, oy - 4, '#f0c83a', 1, 2);
    P(ox + 7, oy - 2, '#e0303a'); P(ox + 5, oy - 4, '#fff0a0'); P(ox + 9, oy - 4, '#fff0a0');
  } },
  cit_farmer:   { look: { b: '#9a6a40', m: '#4a8a3a' }, pad: [3, 3, 3, 0], dress: (P, ox, oy) => {
    P(ox + 1, oy, '#d8b048', 13, 1); P(ox + 4, oy - 2, '#e8c860', 7, 2); P(ox + 4, oy - 1, '#a88030', 7, 1); } },
  cit_fisher:   { look: { b: '#7a5a42', m: '#3a8ab0' }, pad: [0, 3, 0, 0], dress: (P, ox, oy) => {
    P(ox + 4, oy - 1, '#2a5a8a', 7, 2); P(ox + 10, oy, '#2a5a8a', 3, 1); } },
  cit_woodcutter: { look: { b: '#8a5a32', m: '#c0402a' }, pad: [0, 3, 0, 0], dress: (P, ox, oy) => {
    P(ox + 4, oy - 2, '#c0402a', 7, 3); P(ox + 7, oy - 3, '#ffffff', 1, 1); } },
  cit_kid:      { look: { b: '#b07a4a', l: '#e8c8a0', m: '#f0c83a' } },
  cit_baker:    { look: { b: '#a87048', m: '#f0f0f0' }, pad: [0, 6, 0, 0], dress: (P, ox, oy) => {
    P(ox + 4, oy - 5, '#f8f8f8', 7, 6); P(ox + 3, oy - 6, '#ffffff', 9, 2); P(ox + 4, oy, '#d8d8d8', 7, 1); } },
  cit_chef:     { look: { b: '#9a6440', m: '#f0f0f0' }, pad: [0, 6, 0, 0], dress: (P, ox, oy) => {
    P(ox + 4, oy - 5, '#f8f8f8', 7, 6); P(ox + 3, oy - 6, '#ffffff', 9, 2); P(ox + 4, oy, '#d8d8d8', 7, 1); } },
  cit_gardener: { look: { b: '#8a6a44', m: '#6ab048' }, pad: [2, 3, 2, 0], dress: (P, ox, oy) => {
    P(ox + 2, oy, '#4a8a3a', 11, 1); P(ox + 4, oy - 2, '#6ab048', 7, 2); P(ox + 9, oy - 3, '#ff8ab8', 2, 2); } },
  cit_knight:   { look: { b: '#8a6040', m: '#3a6ab0' }, armor: 'armor2', pad: [0, 3, 0, 0], dress: (P, ox, oy) => {
    P(ox + 4, oy - 1, '#6a7a8a', 7, 3); P(ox + 5, oy - 2, '#9aa8b8', 5, 1); } },
  cit_minstrel: { look: { b: '#9a6a48', m: '#8a3ab0' }, pad: [0, 4, 0, 0], dress: (P, ox, oy) => {
    P(ox + 4, oy - 1, '#8a3ab0', 7, 2); P(ox + 3, oy - 1, '#6a2a90', 1, 1); P(ox + 9, oy - 4, '#f0c83a', 1, 3); P(ox + 10, oy - 4, '#f0c83a', 1, 1); } },
  cit_elder:    { look: { b: '#8a8078', l: '#c8c0b0', m: '#6a5a7a' } },
  cit_librarian: { look: { b: '#8a6a50', m: '#6a3a8a' }, pad: [0, 0, 0, 0], dress: (P, ox, oy) => {
    P(ox + 9, oy + 3, '#2a2030', 4, 1); P(ox + 9, oy + 4, '#2a2030', 1, 1); P(ox + 12, oy + 4, '#2a2030', 1, 1); } },
  cit_jester:   { look: { b: '#a0704a', m: '#e04a8a' }, pad: [3, 5, 3, 0], dress: (P, ox, oy) => {
    P(ox + 4, oy - 2, '#e04a8a', 4, 3); P(ox + 8, oy - 2, '#4a8ae0', 3, 3);
    P(ox + 2, oy - 4, '#e04a8a', 3, 2); P(ox + 11, oy - 4, '#4a8ae0', 3, 2);
    P(ox + 1, oy - 5, '#f0c83a', 2, 2); P(ox + 13, oy - 5, '#f0c83a', 2, 2); } },
};

export function buildKingSprites(sprites, { DEFS, renderMap }) {
  for (const [name, f] of Object.entries(FOLK)) {
    const base = f.base ? sprites[f.base] : renderMap(DEFS.gus_idle.map, { ...DEFS.gus_idle.colors, ...(f.look || {}) }, 1, DEFS.gus_idle.shade);
    const [pl, pt, pr, pb] = f.pad || [0, 0, 0, 0];
    const { c, g, P } = canvas(base.w + pl + pr, base.h + pt + pb);
    g.drawImage(base.canvas, pl, pt);
    if (f.armor) g.drawImage(sprites[f.armor].canvas, pl, pt);
    if (f.dress) f.dress(P, pl, pt);
    sprites[name] = done(c);
  }
  sprites.throne = buildThrone();
  sprites.banner = buildBanner();
  sprites.castle_keep = buildKeep();
  buildGuardianSprites(sprites);
}

// a tall throne: gold frame, red velvet, a crest on top
function buildThrone() {
  const { c, P } = canvas(18, 28);
  P(1, 4, '#5a3a10', 16, 24); P(2, 5, '#f0c83a', 14, 22); P(4, 6, '#a01828', 10, 14); P(5, 7, '#c8283a', 8, 12);
  P(3, 19, '#f0c83a', 12, 2); P(3, 21, '#a01828', 12, 3); P(2, 24, '#b08a28', 14, 4);
  P(6, 0, '#5a3a10', 6, 5); P(7, 1, '#f0c83a', 4, 4); P(8, 2, '#e0303a', 2, 2);
  P(6, 9, '#ffffff22', 2, 8);
  return done(c);
}
// a long red banner with a gold platypus-bill emblem
function buildBanner() {
  const { c, P } = canvas(12, 22);
  P(0, 0, '#5a3a10', 12, 2); P(1, 2, '#a01828', 10, 16); P(2, 2, '#c8283a', 8, 15);
  P(4, 6, '#f0c83a', 4, 4); P(8, 7, '#f0c83a', 2, 2); P(5, 10, '#f0c83a', 2, 3);
  P(1, 18, '#a01828', 4, 2); P(7, 18, '#a01828', 4, 2); P(2, 20, '#a01828', 2, 1); P(8, 20, '#a01828', 2, 1);
  return done(c);
}
// Castle Mirri's keep: a great stone block with battlements, a tower at each end under a
// red cone roof with a pennant, glowing windows, and a big arched door in the middle.
// 15 tiles wide over a 7-tile-deep footprint; the towers rise well above it.
function buildKeep() {
  const W = 240, H = 160;
  const { c, P } = canvas(W, H);
  const ST = '#b8b2aa', STL = '#d0cac2', STD = '#8a847c', OUT = '#3a3640';
  // the main block
  P(20, 56, OUT, 200, 104); P(22, 58, ST, 196, 100);
  for (let y = 62; y < 158; y += 8) {
    P(22, y, STD, 196, 1);
    const o = (y / 8) % 2 ? 0 : 10;
    for (let x = 22 + o; x < 218; x += 20) P(x, y - 7, STD, 1, 7);
  }
  // battlements along the top
  for (let x = 22; x < 214; x += 16) { P(x, 46, OUT, 10, 12); P(x + 1, 47, STL, 8, 10); }
  P(22, 56, STL, 196, 2);
  // the towers
  for (const tx of [0, 192]) {
    P(tx, 30, OUT, 48, 130); P(tx + 2, 32, ST, 44, 126);
    for (let y = 40; y < 158; y += 8) P(tx + 2, y, STD, 44, 1);
    P(tx + 2, 32, STL, 4, 126);
    // cone roof
    for (let i = 0; i < 26; i++) P(tx + 24 - i, 6 + i, '#7a1a22', i * 2, 1);
    for (let i = 0; i < 26; i++) P(tx + 24 - i, 6 + i, '#c0303a', i, 1);
    P(tx, 30, '#5a1018', 48, 3);
    // pennant
    P(tx + 24, 0, '#5a3a10', 1, 8); P(tx + 25, 0, '#f0c83a', 8, 2); P(tx + 25, 2, '#f0c83a', 5, 2);
    // a lit window
    P(tx + 18, 70, OUT, 12, 18); P(tx + 20, 72, '#ffd870', 8, 14); P(tx + 23, 72, OUT, 2, 14);
    P(tx + 18, 110, OUT, 12, 18); P(tx + 20, 112, '#ffd870', 8, 14); P(tx + 23, 112, OUT, 2, 14);
  }
  // windows along the block
  for (const wx of [62, 88, 140, 166]) { P(wx, 72, OUT, 12, 20); P(wx + 2, 74, '#ffd870', 8, 16); P(wx + 2, 74, '#fff0b0', 3, 5); }
  // red banners either side of the door
  for (const bx of [90, 138]) { P(bx, 98, '#5a3a10', 12, 2); P(bx + 1, 100, '#c8283a', 10, 30); P(bx + 4, 108, '#f0c83a', 4, 4); }
  // the great arched door, centered over the door tile
  P(102, 106, OUT, 36, 54); P(104, 108, '#6a4428', 32, 52);
  for (let i = 0; i < 8; i++) P(104 + i * 4, 108, '#8a5a34', 3, 52);
  P(104, 108, OUT, 32, 4); P(118, 108, OUT, 4, 52);
  P(110, 132, '#f0c83a', 2, 4); P(128, 132, '#f0c83a', 2, 4);
  P(100, 104, STL, 40, 3);
  return done(c);
}

// ---------- the five guardians of the Kingdom's dungeons ----------
// Painted small with an outline, then doubled like the Vale's bosses. Each has a second
// frame (`_2`) for its idle wiggle.
function outline(g, w, h, col) {
  const img = g.getImageData(0, 0, w, h), d = img.data;
  const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  g.fillStyle = col;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) g.fillRect(x, y, 1, 1);
}
function doubled(c) {
  const out = document.createElement('canvas');
  out.width = c.width * 2; out.height = c.height * 2;
  const g = out.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(c, 0, 0, out.width, out.height);
  return done(out);
}
function blob(P, cx, cy, rx, ry, col) {
  for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if (x * x / (rx * rx) + y * y / (ry * ry) <= 1) P(cx + x, cy + y, col);
}

// THE MOLE KING: a fat velvet mole in a little gold crown, huge pink digging claws
function buildMoleKing(f) {
  const { c, g, P } = canvas(34, 24);
  blob(P, 17, 14, 14, 9, '#4a3a4a'); blob(P, 16, 12, 11, 6, '#6a586a');
  blob(P, 29, 15, 4, 3, '#ff9ab0'); P(32, 14, '#d86a80', 1, 2);                 // the snout
  P(25, 11, '#14101a', 2, 2);                                                    // a tiny eye
  for (const [cx, dy] of [[8, f], [22, -f]]) {                                   // big pink claws
    blob(P, cx, 21 + dy, 4, 2, '#ff9ab0');
    for (let i = 0; i < 4; i++) P(cx - 4 + i * 2, 23 + dy, '#f0e0e8', 1, 1);
  }
  P(13, 2, '#f0c83a', 9, 3); P(13, 0, '#f0c83a', 1, 2); P(17, 0, '#f0c83a', 1, 2); P(21, 0, '#f0c83a', 1, 2);
  P(17, 3, '#e03a4a', 1, 1);
  outline(g, 34, 24, '#14101a');
  return doubled(c);
}
// CROAKUS: an enormous green frog king, gold crown, pale belly, big bulging eyes
function buildCroakus(f) {
  const { c, g, P } = canvas(34, 24);
  blob(P, 17, 15, 15, 8 - f, '#3a8a3a'); blob(P, 17, 17, 10, 5 - f, '#d8e8a0');
  blob(P, 9, 8 + f, 4, 4, '#3a8a3a'); blob(P, 25, 8 + f, 4, 4, '#3a8a3a');     // eye bumps
  blob(P, 9, 8 + f, 2, 2, '#ffffff'); blob(P, 25, 8 + f, 2, 2, '#ffffff');
  P(9, 8 + f, '#14101a', 1, 2); P(25, 8 + f, '#14101a', 1, 2);
  P(8, 14, '#1a4a1a', 18, 1);                                                  // the wide mouth
  for (const x of [4, 28]) { blob(P, x, 21, 4, 2, '#2a6a2a'); }                // feet
  for (const [x, y] of [[12, 12], [21, 11], [17, 13]]) P(x, y, '#2a6a2a', 2, 1); // spots
  P(13, 1 + f, '#f0c83a', 9, 3); P(13, -1 + f, '#f0c83a', 1, 2); P(17, -1 + f, '#f0c83a', 1, 2); P(21, -1 + f, '#f0c83a', 1, 2);
  outline(g, 34, 24, '#0e2a10');
  return doubled(c);
}
// SPIKEBALL: an iron echidna, armor-plated back bristling with steel quills
function buildSpikeball(f) {
  const { c, g, P } = canvas(32, 22);
  blob(P, 15, 14, 12, 7, '#7a6a5a');                                            // body
  blob(P, 15, 11, 11, 6, '#5a6270');                                            // armored back
  for (let i = 0; i < 9; i++) {                                                 // quills
    const x = 6 + i * 2.2, h = 4 + (i % 2) * 2 + (i === 4 ? 2 : 0);
    P(x, 6 - h + 4 - f * (i % 2), '#c8d0dc', 1, h);
  }
  blob(P, 27, 16, 4, 3, '#9a8a7a'); P(30, 16, '#3a2a20', 2, 1);                 // snout
  P(25, 13, '#14101a', 2, 2); P(25, 13, '#ff4a4a');                             // a mean red eye
  for (const x of [8, 20]) P(x, 20, '#5a4a3a', 4, 2);
  outline(g, 32, 22, '#14101a');
  return doubled(c);
}
// KRAKENNA: a giant purple squid, two huge eyes, tentacles curling
function buildKraken(f) {
  const { c, g, P } = canvas(36, 22);
  blob(P, 18, 8, 12, 7, '#8a3ab0'); blob(P, 18, 6, 9, 4, '#b06ad8');
  blob(P, 13, 10, 3, 3, '#ffffff'); blob(P, 23, 10, 3, 3, '#ffffff');
  P(13, 10, '#14101a', 2, 2); P(23, 10, '#14101a', 2, 2);
  for (let i = 0; i < 6; i++) {                                                 // tentacles
    const x0 = 8 + i * 4;
    for (let k = 0; k < 7; k++) P(x0 + Math.round(Math.sin(k * 0.9 + i + f * 1.5) * 1.5), 14 + k, k % 3 ? '#8a3ab0' : '#d88ae8', 2, 1);
  }
  for (const [x, y] of [[16, 3], [21, 4], [11, 5]]) P(x, y, '#d88ae8', 1, 1);
  outline(g, 36, 22, '#1a0a24');
  return doubled(c);
}
// SKYSNATCH: a giant night bat, wings spread wide (up, then down), glowing red eyes
function buildBat(f) {
  const { c, g, P } = canvas(40, 22);
  blob(P, 20, 12, 6, 6, '#3a2a4a'); blob(P, 20, 13, 4, 4, '#5a4a6a');
  P(16, 4, '#3a2a4a', 2, 4); P(22, 4, '#3a2a4a', 2, 4);                         // ears
  P(17, 10, '#ff3a3a', 2, 2); P(21, 10, '#ff3a3a', 2, 2);                       // eyes
  P(18, 15, '#ffffff', 1, 2); P(21, 15, '#ffffff', 1, 2);                       // fangs
  for (const s of [-1, 1]) {
    for (let i = 0; i < 14; i++) {
      const x = 20 + s * (6 + i), y = f ? 10 + i * 0.5 : 10 - i * 0.4;
      P(x, y, '#2a1a3a', 1, 6 - Math.floor(i / 4));
    }
    for (let k = 0; k < 3; k++) P(20 + s * (9 + k * 4), f ? 16 + k * 2 : 12 + k, '#4a3a5a', 1, 3);
  }
  outline(g, 40, 22, '#0e0814');
  return doubled(c);
}
export function buildGuardianSprites(sprites) {
  for (const [name, fn] of [['boss_moleking', buildMoleKing], ['boss_croakus', buildCroakus], ['boss_spikeball', buildSpikeball],
    ['boss_kraken', buildKraken], ['boss_bat', buildBat]]) {
    sprites[name] = fn(0);
    sprites[name + '_2'] = fn(1);
  }
}

// a Royal Gem: a big pink-gold jewel, faceted
D.royalgem = { colors: { d: '#5a1040', p: '#ff6ac8', y: '#ffd84a', w: '#ffffff' }, map: [
  '..dddddd..',
  '.dyPPppyd.',
  'dyPwPpppyd',
  'dpPPpppppd',
  '.dpppppyd.',
  '..dpppyd..',
  '...dpyd...',
  '....dd....',
]};
