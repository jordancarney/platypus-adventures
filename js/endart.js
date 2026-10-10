// Art for the endgame past Apexus: God Armor, Mum and Dad, goo zombies, god crystals, the
// jail cages, the magic altar, Xenomantis and her Star Hive.
//
// ASCII defs follow pixelart.js's palette conventions and are merged into its DEFS. The
// rest is built in buildEndSprites(), which pixelart.js calls once its own sprites exist:
// Mum and Dad reuse Gus's poses in their own coats, every zombie is a palette swap of the
// creature it used to be, and the two big pieces (Xenomantis, the Hive) are painted in code
// and outlined automatically, since they're too big to hand-letter comfortably.

export const END_DEFS = {};
const D = END_DEFS;

// ---------- GOD ARMOR ----------
// Same 16x16 grid as Gus (and Mum and Dad, who share his poses): a starry crown, flared
// gold pauldrons with white wingtips, and a cream breastplate set with a purple gem.
D.armor7 = { colors: { g: '#ffd84a', w: '#ffffff', h: '#fff6c8', p: '#c88aff', c: '#7ad4ff' }, shade: { m: ['g', -0.3], k: ['h', -0.25] }, map: [
  '....G.GwG.G.....',
  '....gGgpgGgg....',
  '....gggggggg....',
  '................',
  '................',
  '................',
  '................',
  '..wgggGGgggggggw',
  '.w.gwhhhhhhwmg.w',
  '....gwhpPhwhm...',
  '....ggwhPhkmm...',
  '....mgwhhhkmm...',
  '.....mgcgcgm....',
  '................',
  '................',
  '................',
]};

// ---------- MUM AND DAD: accessories over Gus's head ----------
// Dad ties a red headband round his crown, the knot and tails trailing behind; Mum wears a
// purple bow on top. Both sit on rows 0-3 of the shared 16x16 grid.
// Overlays are bottom-anchored like every sprite, so they're padded out to the full 16 rows.
const PAD = (rows) => [...rows, ...Array(16 - rows.length).fill('................')];
D.dad_band = { colors: { r: '#d8483a', k: '#a02a2a' }, map: PAD([
  '................',
  '................',
  '.Rrkrrrrrrr.....',
  'r.r.............',
])};
D.mum_bow = { colors: { p: '#b05ad8', k: '#7a2a9a' }, map: PAD([
  '....pPpkpPp.....',
  '.....pp.pp......',
])};

// ---------- PICKUPS & PROPS ----------
// a god crystal: half alien green, half purple, so it never reads as a diamond
D.godcrystal = { colors: { h: '#e8ffd0', g: '#7ae85a', p: '#a85ae0', d: '#3a2058' }, map: [
  '...h...',
  '..hgp..',
  '.hggpp.',
  'hgggppp',
  'dggpppd',
  '.dgppd.',
  '..dpd..',
  '...d...',
]};
// Apexus's jail: iron bars round an open middle, so whoever's inside shows through
const CAGE_BARS = 'b..b..b..b..b..b..b';
D.cage = { colors: { k: '#221c2a', i: '#5a5466', b: '#8a84a0', l: '#f0c83a' }, map: [
  '..kkkkkkkkkkkkkkk..',
  '.kIIIIIIIIIIIIIIIk.',
  'kiiiiiiiiiiiiiiiiik',
  CAGE_BARS, CAGE_BARS, CAGE_BARS, CAGE_BARS, CAGE_BARS, CAGE_BARS,
  'b..b..b..lL.b..b..b',
  'b..b..b..ll.b..b..b',
  CAGE_BARS, CAGE_BARS, CAGE_BARS, CAGE_BARS, CAGE_BARS, CAGE_BARS, CAGE_BARS,
  'iiiiiiiiiiiiiiiiiii',
  'kkkkkkkkkkkkkkkkkkk',
]};
// ...and the same cage with its door bars wrenched out and bent aside
const OPEN_BARS = 'b..b...........b..b';
D.cage_open = { colors: { k: '#221c2a', i: '#5a5466', b: '#8a84a0' }, map: [
  '..kkkkkkkkkkkkkkk..',
  '.kIIIIIIIIIIIIIIIk.',
  'kiiiiiiiiiiiiiiiiik',
  'b..b..b.......b..b.',
  'b..b...b.....b...b.',
  'b..b....b...b....b.',
  OPEN_BARS, OPEN_BARS, OPEN_BARS, OPEN_BARS, OPEN_BARS, OPEN_BARS, OPEN_BARS, OPEN_BARS,
  OPEN_BARS, OPEN_BARS, OPEN_BARS, OPEN_BARS,
  'iiiiiiiiiiiiiiiiiii',
  'kkkkkkkkkkkkkkkkkkk',
]};
// the magic altar: a carved alien slab with glowing runes (its crystal floats above, drawn live)
D.altar = { colors: { d: '#1e1828', s: '#5a4a72', g: '#8aff6a' }, shade: { k: ['s', -0.35] }, map: [
  '..dddddddddddddd..',
  '.dSSSSSSSSSSSSSSd.',
  '.dssgssssssssgssd.',
  '.dkkkkkkkkkkkkkkd.',
  '...dssssssssssd...',
  '...dsgsssssgssd...',
  '...dsssssGssssd...',
  '...dsgsssssgssd...',
  '...dssssssssssd...',
  '..dssssssssssssd..',
  '.dSSSSSSSSSSSSSSd.',
  '.dkkkkkkkkkkkkkkd.',
  '..dddddddddddddd..',
]};

// ---------- THE EPILOGUE ----------
// A reef shark, side on: steel-blue back, tall dorsal fin, gill slits, a mean little eye and
// a grin full of teeth. map2 flicks the tail; shark_bite drops the jaw wide open.
const SHARK_COLORS = { b: '#5d7286', l: '#e8eef4', e: '#1a1020', w: '#ffffff', r: '#b02838' };
const SHARK_SHADE = { d: ['b', -0.62], s: ['b', -0.3] };
D.shark = { colors: SHARK_COLORS, shade: SHARK_SHADE, map: [
  '..............dd............',
  '.............dBd............',
  '............dBbd............',
  'dd.........dBbbd............',
  'dBd.......dbbbbbdddddd......',
  '.dBd....ddbbBBBbbbbbbbddd...',
  '..dbd.ddbbbbbbbbbbbbbbddbdd.',
  '..dbbdbbbbbbbbbbbsbsbbbdewbd',
  '..dbbbbbbbbbbbbbbsbsbbbbbbbd',
  '..dbdlllllllllllllllllldwdwd',
  '.dBd.dllllllllldbbdlllllddd.',
  'dBd...dddddddddbsbdddddd....',
  'dd.............ddd..........',
], map2: [
  '..............dd............',
  '.............dBd............',
  '............dBbd............',
  '...........dBbbd............',
  'dd........dbbbbbdddddd......',
  'dBdd....ddbbBBBbbbbbbbddd...',
  '.dbbd.ddbbbbbbbbbbbbbbddbdd.',
  '..dbbdbbbbbbbbbbbsbsbbbdewbd',
  '..dbbbbbbbbbbbbbbsbsbbbbbbbd',
  '.dbdllllllllllllllllllldwdwd',
  'dBd..dllllllllldbbdlllllddd.',
  'dd....dddddddddbsbdddddd....',
  '...............ddd..........',
]};
D.shark_bite = { colors: SHARK_COLORS, shade: SHARK_SHADE, map: [
  '..............dd............',
  '.............dBd............',
  '............dBbd............',
  'dd.........dBbbd............',
  'dBd.......dbbbbbdddddd......',
  '.dBd....ddbbBBBbbbbbbbddd...',
  '..dbd.ddbbbbbbbbbbbbbbddbdd.',
  '..dbbdbbbbbbbbbbbsbsbbbdewbd',
  '..dbbbbbbbbbbbbbbsbsbbbbbbbd',
  '..dbdllllllllllllllllldwdwdd',
  '.dBd.dllllllllldbbdllrrrrrd.',
  'dBd...dddddddddbsbddldwdwdwd',
  'dd.............ddd...ddddddd',
]};

// ---------- BUILD ----------
const FAMILY = {
  dad: { b: '#6e4630', l: '#d0a468', t: '#4e3040', m: '#388c86', f: '#b07a3a' },
  mum: { b: '#a8744e', l: '#f0d0a0', t: '#7a5260', m: '#d8708e', f: '#c8925a' },
};
// Every regular creature that can crawl out of the goo, by sprite name.
export const ZOMBIE_SPRITES = ['rakali', 'adder', 'snapjaw', 'emberfox', 'mgoanna', 'kooka', 'volteel', 'cod',
  'snapshell', 'talon', 'owl', 'dingo', 'wildcat', 'python', 'tazzy', 'gknight'];

export function buildEndSprites(sprites, { DEFS, VARIANTS, renderMap, mix }) {
  // Mum and Dad: Gus's own four poses in their coats, plus a standing one with the headband
  // or bow already on, for when they're an NPC at home
  for (const [who, coat] of Object.entries(FAMILY)) {
    for (const pose of ['idle', 'walk1', 'walk2', 'swim']) {
      const base = DEFS['gus_' + pose];
      sprites[`${who}_${pose}`] = renderMap(base.map, { ...base.colors, ...coat }, 1, base.shade);
    }
    const idle = sprites[who + '_idle'], acc = renderMap(D[who === 'dad' ? 'dad_band' : 'mum_bow'].map,
      D[who === 'dad' ? 'dad_band' : 'mum_bow'].colors, 1, null);
    const c = document.createElement('canvas');
    c.width = idle.w; c.height = idle.h;
    c.getContext('2d').drawImage(idle.canvas, 0, 0);
    c.getContext('2d').drawImage(acc.canvas, 0, 0);
    sprites[who + '_home'] = { canvas: c, w: c.width, h: c.height };
  }
  // Zombies: the creature's own palette soured toward rot-green, eyes lit up acid yellow
  for (const name of ZOMBIE_SPRITES) {
    const v = VARIANTS[name] || { base: name };
    const base = DEFS[v.base];
    const colors = { ...base.colors, ...(v.colors || {}) };
    const z = {};
    for (const [k, c] of Object.entries(colors)) z[k] = k === 'e' ? '#e4ff4a' : mix(c, '#5f8f3f', 0.55);
    sprites[name + '_z'] = renderMap(base.map, z, v.scale || 1, base.shade);
    if (base.map2) sprites[name + '_z_2'] = renderMap(base.map2, z, v.scale || 1, base.shade);
  }
  // Mecha Apexus: Apexus rebuilt as a towering war machine (the epilogue's cliffhanger)
  sprites.mecha_apexus = buildMecha(false);
  sprites.mecha_apexus_2 = buildMecha(true);
  sprites.boss_xeno = buildMantis(false);
  sprites.boss_xeno_2 = buildMantis(true);
  sprites.hive_ext = buildHive();
}

// ---------- the code-painted pieces ----------
function painter(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const P = (x, y, col, ww = 1, hh = 1) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), ww, hh); };
  const ellipse = (cx, cy, rx, ry, col) => {
    for (let y = Math.floor(-ry); y <= ry; y++) for (let x = Math.floor(-rx); x <= rx; x++)
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) P(cx + x, cy + y, col);
  };
  const line = (x0, y0, x1, y1, col, th = 1) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) {
      const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
      P(x - Math.floor(th / 2), y - Math.floor(th / 2), col, th, th);
    }
  };
  // a filled horizontal span per row, from a left and right edge function
  const rows = (y0, y1, left, right, col) => {
    for (let y = y0; y <= y1; y++) { const a = Math.round(left(y)), b = Math.round(right(y)); if (b >= a) P(a, y, col, b - a + 1, 1); }
  };
  return { c, g, P, ellipse, line, rows };
}
// Ring every opaque shape with a dark outline, the way the hand-lettered sprites are drawn.
function outline(g, w, h, col) {
  const img = g.getImageData(0, 0, w, h), d = img.data;
  const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  const edge = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) edge.push([x, y]);
  g.fillStyle = col;
  for (const [x, y] of edge) g.fillRect(x, y, 1, 1);
}
function scaled(src, s) {
  const c = document.createElement('canvas');
  c.width = src.width * s; c.height = src.height * s;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(src, 0, 0, c.width, c.height);
  return { canvas: c, w: c.width, h: c.height };
}

// Mecha Apexus, face on: Apexus's horned head rebuilt in gunmetal with a burning visor,
// a reactor blazing in an armored chest, spiked shoulder plates with a cannon on each, claw
// arms hanging to the ground, and a spiked mace of a tail curling up over one shoulder.
// Painted at 76x60 and doubled. `hot` is the second frame: reactor, eyes and cannons flare.
export const MECHA_ART = { w: 152, h: 120, eyes: [[64, 30], [88, 30]], core: [76, 68], guns: [[10, 18], [142, 18]] };
function buildMecha(hot) {
  const W = 76, H = 60;
  const { c, g, P, ellipse, line, rows } = painter(W, H);
  const ST = '#5a6270', STL = '#8a94a4', STH = '#c8d0dc', STD = '#3a404c', RED = '#d02a2a';
  const GLOW = hot ? '#fff0a0' : '#ffa040', CORE = hot ? '#ff6a2a' : '#e03a2a';
  // the tail: up from behind the right hip, over the shoulder, ending in a spiked mace
  for (let i = 0; i <= 14; i++) ellipse(58 + Math.sin(i / 14 * 2.2) * 12, 44 - i * 2.6, 2.4, 2.4, i % 2 ? ST : STL);
  ellipse(66, 6, 4, 4, STD); ellipse(66, 6, 3, 3, ST);
  for (const [dx, dy] of [[0, -6], [5, -3], [6, 2], [-5, -3], [-1, 6]]) line(66, 6, 66 + dx, 6 + dy, STH);
  // legs, planted wide, with three-toed steel feet
  for (const lx of [24, 52]) {
    rows(44, 56, () => lx - 6, () => lx + 6, ST);
    rows(44, 56, () => lx - 6, () => lx - 4, STL);
    rows(56, 59, () => lx - 9, () => lx + 9, STD);
    for (const tx of [-8, 0, 8]) P(lx + tx - 1, 58, STH, 3, 2);
    P(lx - 5, 49, RED, 11, 2);
  }
  // the torso: a broad armored block tapering to the waist
  rows(20, 46, y => 16 + (y - 20) * 0.25, y => 60 - (y - 20) * 0.25, ST);
  rows(20, 23, y => 17, y => 59, STL);
  rows(24, 46, y => 16 + (y - 20) * 0.25, y => 18 + (y - 20) * 0.25, STL);
  for (const y of [30, 38]) rows(y, y, y2 => 18 + (y2 - 20) * 0.25, y2 => 58 - (y2 - 20) * 0.25, STD);
  // red war-stripes down the chest, and rivets
  line(22, 24, 30, 34, RED, 2); line(54, 24, 46, 34, RED, 2);
  for (const [x, y] of [[20, 26], [56, 26], [21, 42], [55, 42], [28, 44], [48, 44]]) P(x, y, STH);
  // the reactor
  ellipse(38, 34, 6, 6, STD);
  ellipse(38, 34, 5, 5, CORE);
  ellipse(38, 34, 3, 3, GLOW);
  P(37, 32, '#ffffff', 2, 2);
  // shoulders: great spiked pauldrons, each carrying a cannon pointing up and out
  for (const [sx, dir] of [[12, -1], [64, 1]]) {
    ellipse(sx, 24, 9, 7, ST);
    rows(19, 21, () => sx - 7, () => sx + 7, STL);
    for (const k of [-6, 0, 6]) line(sx + k, 18, sx + k + dir * 2, 12, STH);
    // the cannon barrel
    line(sx + dir * 2, 18, sx + dir * 7, 9, STD, 3);
    line(sx + dir * 2, 17, sx + dir * 7, 8, STL, 1);
    ellipse(sx + dir * 7, 9, 2, 2, hot ? GLOW : RED);
    P(sx - 6, 26, RED, 12, 1);
  }
  // claw arms hanging down beside the torso
  for (const [ax, dir] of [[8, -1], [68, 1]]) {
    rows(30, 46, () => ax - 3, () => ax + 3, ST);
    rows(30, 46, () => ax - 3, () => ax - 2, STL);
    P(ax - 3, 36, RED, 7, 1);
    for (const k of [-3, 0, 3]) line(ax + k, 46, ax + k + dir, 52, STH, 2);
  }
  // the head: horned, armored, with a burning visor and a jaw full of steel teeth
  rows(6, 20, y => 28 - (y - 6) * 0.15, y => 48 + (y - 6) * 0.15, ST);
  rows(6, 8, () => 29, () => 47, STL);
  line(28, 8, 14, 0, STL, 3); line(48, 8, 62, 0, STL, 3);     // the horns
  line(28, 8, 14, 0, STH, 1); line(48, 8, 62, 0, STH, 1);
  rows(13, 16, () => 29, () => 47, STD);                       // the visor slit
  for (const ex of [32, 44]) { P(ex - 2, 14, hot ? GLOW : '#ff2a2a', 5, 2); P(ex - 1, 13, '#ff2a2a', 3, 1); }
  rows(17, 20, () => 30, () => 46, STD);                       // the jaw
  for (let x = 31; x <= 45; x += 2) P(x, 17, STH, 1, 2);
  outline(g, W, H, '#14161c');
  return scaled(c, 2);
}

// Xenomantis: a giant alien praying mantis, facing right. A long striped abdomen with its
// wings folded over it, a neck rearing up to a triangle head with two huge glowing eyes,
// folded scythe arms out front, and four long spindly legs. Painted at 40x28 and doubled
// like the other bosses; the legs and antennae go on after the outline so they stay thin.
// `buzz` is the second frame: wings up and humming, scythes thrown forward to strike.
function buildMantis(buzz) {
  const W = 40, H = 28;
  const { c, g, P, ellipse, line, rows } = painter(W, H);
  const B = '#4a9a5a', BH = '#7ac87a', BS = '#2e6a40', BELLY = '#a8e08a';
  const PL = '#7a3aa8', PLH = '#a86ad8';
  const BLADE = '#e8f0c8', BLADE_D = '#9aa878';
  const EYE = '#ff4a9a', EYE_H = '#ffd0e8', EYE_D = '#b02a6a';
  const WING = 'rgba(190,240,240,0.6)', WING_V = 'rgba(120,200,210,0.9)';

  // abdomen: a long teardrop, tipped up slightly toward the thorax, with purple bands
  ellipse(11, 17, 10, 4, B);
  rows(14, 15, () => 3, () => 18, BH);
  rows(19, 20, () => 4, () => 17, BELLY);
  for (const x of [4, 8, 12, 16]) for (let y = 13; y <= 21; y++) {
    const dx = (x - 11) / 10, dy = (y - 17) / 4;
    if (dx * dx + dy * dy <= 0.8) P(x, y, PL);
  }
  for (const x of [4, 8, 12, 16]) P(x, 14, PLH);
  // thorax, and the long neck rearing up to the head
  ellipse(22, 17, 3, 3, B);
  for (let i = 0; i <= 10; i++) ellipse(22 + i * 0.6, 15 - i * 0.9, 1.6, 1.6, B);
  line(22, 14, 27, 6, BH);
  P(23, 12, PL); P(25, 9, PL);
  // head: wide across the eyes, narrowing to the mandibles
  rows(3, 10, y => 27 + (y - 3) * 0.55, y => 36 - (y - 3) * 0.55, B);
  rows(4, 5, () => 29, () => 34, BH);
  ellipse(27, 4, 2, 2.5, EYE); ellipse(36, 4, 2, 2.5, EYE);
  P(26, 3, EYE_H); P(35, 3, EYE_H); P(28, 6, EYE_D); P(37, 6, EYE_D);
  P(31, 9, '#d8a03a', 2, 1); P(31, 10, '#a8701a', 2, 1);         // mandibles
  // the scythe arms: a thick spiny foreleg, its blade folded back along it (or flung forward)
  if (buzz) {
    line(25, 11, 33, 4, B, 2);
    line(34, 4, 39, 12, BLADE, 2); line(35, 4, 39, 11, BLADE_D);
  } else {
    line(25, 11, 34, 17, B, 2);
    line(34, 17, 29, 12, BLADE, 2); line(34, 18, 30, 13, BLADE_D);
  }
  // wings: folded flat along the back, or up and blurred mid-buzz (drawn over the body)
  if (buzz) {
    ellipse(10, 8, 10, 3, WING); ellipse(13, 5, 9, 3, WING);
    line(20, 12, 2, 7, WING_V); line(21, 11, 5, 3, WING_V);
  } else {
    ellipse(12, 13, 11, 2.5, WING);
    line(22, 13, 2, 13, WING_V);
  }
  outline(g, W, H, '#14101c');
  // legs and antennae, thin and dark, after the outline
  const LEG = '#5a9a6a', LEG_H = '#9ad89a';
  for (const [x0, y0, kx, ky, x1] of [[16, 20, 13, 16, 11], [14, 20, 9, 16, 4], [21, 19, 17, 15, 15], [22, 19, 26, 15, 29]]) {
    line(x0, y0, kx, ky, LEG); line(kx, ky, x1, H - 1, LEG);
    P(kx, ky, LEG_H);
  }
  line(30, 3, 26, 0, LEG); line(33, 3, 38, 0, LEG);
  return scaled(c, 2);
}

// The Star Hive: Xenomantis's nest, a stacked alien mound with glowing windows and a dark
// doorway in the middle of its base. 7 tiles wide, standing on a 7x4 footprint and rising
// well above it. The doorway lines up with the footprint's bottom-middle tile (the stairs).
function buildHive() {
  const W = 112, H = 112;
  const { c, g, P, ellipse, rows } = painter(W, H);
  const T1 = '#3a2a4a', T2 = '#4a3a5e', T3 = '#55436c', T4 = '#604c78', TOP = '#6a5482';
  const RIM = '#7a6494', GLOW = '#8aff6a', GLOW_H = '#e0ffc8';
  ellipse(56, 100, 55, 11, T1);
  ellipse(56, 84, 48, 20, T2);
  ellipse(56, 58, 37, 18, T3);
  ellipse(56, 36, 25, 14, T4);
  rows(4, 28, y => 56 - (y - 4) * 0.42, y => 56 + (y - 4) * 0.42, TOP);
  // tier lips: a lit edge along the top of each bulge
  for (const [cy, rx, ry] of [[84, 48, 20], [58, 37, 18], [36, 25, 14]]) {
    for (let x = -rx + 3; x <= rx - 3; x++) {
      const y = cy - Math.round(ry * Math.sqrt(1 - (x * x) / (rx * rx)));
      P(56 + x, y, RIM);
    }
  }
  // hex-cell texture, a few darker pocks per tier
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const body = g.getImageData(0, 0, W, H).data;
  for (let i = 0; i < 70; i++) {
    const x = 14 + Math.floor(rnd() * 84), y = 26 + Math.floor(rnd() * 80);
    if (body[(y * W + x) * 4 + 3]) P(x, y, '#2a1e38', 2, 1);
  }
  // glowing windows with goo dripping from them
  for (const [x, y] of [[30, 76], [82, 76], [40, 56], [72, 56], [56, 34], [20, 92], [92, 92]]) {
    ellipse(x, y, 3, 2, '#1a3a14'); ellipse(x, y, 2, 1, GLOW); P(x - 1, y - 1, GLOW_H);
    P(x, y + 2, GLOW, 1, 3 + (x % 4)); P(x, y + 5 + (x % 4), '#4fa83a');
  }
  // the beacon on top
  ellipse(56, 6, 3, 3, GLOW); P(55, 4, GLOW_H, 2, 2);
  // the doorway: an arch over the stairs tile (x 48-63), dark inside, green-rimmed
  rows(84, 111, y => y < 92 ? 56 - Math.sqrt(Math.max(0, 64 - (y - 92) * (y - 92))) : 48,
    y => y < 92 ? 55 + Math.sqrt(Math.max(0, 64 - (y - 92) * (y - 92))) : 63, '#4fa83a');
  rows(86, 111, y => y < 92 ? 57 - Math.sqrt(Math.max(0, 36 - (y - 92) * (y - 92))) : 50,
    y => y < 92 ? 54 + Math.sqrt(Math.max(0, 36 - (y - 92) * (y - 92))) : 61, '#0a0610');
  outline(g, W, H, '#140e1c');
  return { canvas: c, w: W, h: H };
}
