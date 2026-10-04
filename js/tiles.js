// Tile ids, properties, and cached pixel-art atlases: four spatial variants, two animation frames.
import { TILE } from './config.js';
import { rng } from './util.js';

// ---------- tile ids ----------
export const T = {
  // overworld ground
  GRASS: 0, GRASS2: 1, TALLGRASS: 2, FLOWER: 3, PATH: 4, SAND: 5,
  SHALLOW: 6, DEEP: 7, MUD: 8, ASH: 9, DARKGRASS: 10, STORMGRASS: 11,
  // overworld solids
  TREE: 12, PINE: 13, PALM: 14, ROCK: 15, BASALT: 16, CLIFF: 17, MESA: 18,
  FENCE: 19, WALL: 20, ROOF: 21, CRACKROCK: 22, CRYSTAL: 23, STORMROCK: 24, DEADTREE: 25,
  // special
  LAVA: 26, BRIDGE: 27, REED: 28, THORNS: 29,
  // dungeon
  DFLOOR: 30, DWALL: 31, DOOR_OPEN: 32, DOOR_LOCKED: 33, DOOR_BOSS: 34, DOOR_SHUT: 35,
  DCRACK: 36, DWATER: 37, DLAVA: 38, SPIKES: 39, PLATE: 40, PLATE_DOWN: 41,
  EYE: 42, EYE_ON: 43, STAIRS: 44, TORCH: 45, DDECOR: 46, GUST: 47,
  // house exteriors: a front door (walk into it to go inside) and a window, set in WALL
  HDOOR: 48, WINDOW: 49, SHOPWALL: 50,
  // the footprint under a building drawn as one big sprite (Gus's burrow, Mama's cottage)
  BUILDING: 51,
  // house interiors (theme-colored): floorboards, the back wall's two visible rows (with an
  // optional window), the timber wall tops seen from above, a bordered rug, and the doormat
  HFLOOR: 52, HWALL_UP: 53, HWALL: 54, HWIN: 55, HBEAM: 56, RUG: 57, EXIT: 58,
  // the endgame: the Great Chasm's bottomless pit, a bridge end that leads off to another
  // area, alien goo, the Goo Lands' ground and rocks, and the Star Hive's grand staircase
  PIT: 59, PASSAGE: 60, GOO: 61, XSOIL: 62, XSOIL2: 63, XROCK: 64, XSPIRE: 65, XPLANT: 66,
  XCLIFF: 67, STEPS: 68,
};

// ---------- tile properties ----------
// solid: blocks walking · deep: swimmable · lava/dmg: hurts · slow: speed penalty · cut: sword clears it
// pit: a drop only fliers (and arrows) can cross
const P = {};
const def = (id, props) => { P[id] = props; };
def(T.GRASS, {}); def(T.GRASS2, {}); def(T.TALLGRASS, { cut: true, slow: true }); def(T.FLOWER, {});
def(T.PATH, {}); def(T.SAND, {}); def(T.SHALLOW, { slow: true, water: true }); def(T.DEEP, { deep: true });
def(T.MUD, { slow: true }); def(T.ASH, {}); def(T.DARKGRASS, {}); def(T.STORMGRASS, {});
def(T.TREE, { solid: true }); def(T.PINE, { solid: true }); def(T.PALM, { solid: true });
def(T.ROCK, { solid: true }); def(T.BASALT, { solid: true }); def(T.CLIFF, { solid: true });
def(T.MESA, { solid: true }); def(T.FENCE, { solid: true }); def(T.WALL, { solid: true });
def(T.ROOF, { solid: true }); def(T.CRACKROCK, { solid: true, crack: true }); def(T.CRYSTAL, { solid: true, crack: true });
def(T.STORMROCK, { solid: true }); def(T.DEADTREE, { solid: true });
def(T.LAVA, { lava: true }); def(T.BRIDGE, {}); def(T.REED, { slow: true }); def(T.THORNS, { dmg: 1, slow: true });
def(T.DFLOOR, {}); def(T.DWALL, { solid: true });
def(T.DOOR_OPEN, {}); def(T.DOOR_LOCKED, { solid: true, locked: true });
def(T.DOOR_BOSS, { solid: true, bossdoor: true }); def(T.DOOR_SHUT, { solid: true });
def(T.DCRACK, { solid: true, crack: true }); def(T.DWATER, { deep: true }); def(T.DLAVA, { lava: true });
def(T.SPIKES, { dmg: 1 }); def(T.PLATE, {}); def(T.PLATE_DOWN, {});
def(T.EYE, { solid: true, eye: true }); def(T.EYE_ON, { solid: true });
def(T.STAIRS, {}); def(T.TORCH, { solid: true }); def(T.DDECOR, {}); def(T.GUST, {});
def(T.HDOOR, { door: true }); def(T.WINDOW, { solid: true }); def(T.SHOPWALL, { solid: true });
def(T.BUILDING, { solid: true });
def(T.HFLOOR, {}); def(T.HWALL_UP, { solid: true }); def(T.HWALL, { solid: true }); def(T.HWIN, { solid: true });
def(T.HBEAM, { solid: true }); def(T.RUG, {}); def(T.EXIT, {});
def(T.PIT, { pit: true }); def(T.PASSAGE, {}); def(T.GOO, { goo: true });
def(T.XSOIL, {}); def(T.XSOIL2, {}); def(T.XROCK, { solid: true }); def(T.XSPIRE, { solid: true });
def(T.XPLANT, {}); def(T.XCLIFF, { solid: true }); def(T.STEPS, {});

// ---------- dungeon themes ----------
export const THEMES = {
  // 'ow' needs a palette too: the atlas eagerly paints every tile id, including dungeon tiles
  ow: { floor: '#3a3a42', floor2: '#44444e', wall: '#5a5a66', wallTop: '#747482', accent: '#c8b48a' },
  fire:  { floor: '#4a2c20', floor2: '#54332a', wall: '#7a3a24', wallTop: '#a05a3a', accent: '#ff8a3a' },
  water: { floor: '#1e3c4a', floor2: '#24465a', wall: '#2a5a74', wallTop: '#3f7a9a', accent: '#7ad4ff' },
  air:   { floor: '#3c4258', floor2: '#454c66', wall: '#5a6284', wallTop: '#7a84ac', accent: '#e8f0ff' },
  earth: { floor: '#3a3020', floor2: '#443826', wall: '#5a4a2e', wallTop: '#7a6642', accent: '#a8d84a' },
  nexus: { floor: '#2c2038', floor2: '#342644', wall: '#4a3462', wallTop: '#664a86', accent: '#c88aff' },
  arena: { floor: '#c2a86c', floor2: '#d4bc80', wall: '#8a7a5e', wallTop: '#b09a78', accent: '#f0c83a' },
  // the Goo Lands (an outdoor area: its pit lips borrow these) and Xenomantis's Star Hive
  goo:   { floor: '#2e2640', floor2: '#383050', wall: '#4a3a5e', wallTop: '#685482', accent: '#8aff6a' },
  hive:  { floor: '#1e2c26', floor2: '#283a30', wall: '#3a2848', wallTop: '#5a4270', accent: '#9aff5a' },
  // House interiors. `paper`/`paper2` and `pattern` dress the back wall, `trim` is the
  // wainscot and crown moulding, `beam` the wall tops seen from above, and `accent`/`rug2`
  // the rug and its border. Themes without these (the dungeons) fall back to their masonry.
  burrow:  { floor: '#9a7048', floor2: '#b08658', wall: '#7a5236', wallTop: '#94684a', accent: '#3f8c86',
    paper: '#80573a', paper2: '#6c4930', pattern: 'roots', trim: '#5a3a26', beam: '#4a3222', rug2: '#e8b860' },
  cottage: { floor: '#c89e70', floor2: '#dab282', wall: '#d8a0b4', wallTop: '#e8b8c8', accent: '#d8708e',
    paper: '#eab8c8', paper2: '#f8dce4', pattern: 'dots', trim: '#b8788c', beam: '#8a5a58', rug2: '#fff0f4' },
  shop:    { floor: '#7c5c3e', floor2: '#8e6c4a', wall: '#6a5238', wallTop: '#846848', accent: '#a8443a',
    paper: '#6e5640', paper2: '#5e4834', pattern: 'planks', trim: '#3e2e20', beam: '#34261a', rug2: '#f0c83a' },
  home:    { floor: '#a88258', floor2: '#ba9468', wall: '#7e9e7e', wallTop: '#98b898', accent: '#4e70a8',
    paper: '#8aae8a', paper2: '#9ec29c', pattern: 'stripes', trim: '#5a7458', beam: '#54402e', rug2: '#ece2c8' },
  curio:   { floor: '#76583e', floor2: '#886a4c', wall: '#3a4a6a', wallTop: '#4e5e80', accent: '#84385a',
    paper: '#3c4c6c', paper2: '#d8c48e', pattern: 'stars', trim: '#28304a', beam: '#2c2230', rug2: '#f0c83a' },
  marlo:   { floor: '#a47e54', floor2: '#b69066', wall: '#a8c0d0', wallTop: '#c0d4e0', accent: '#b8483a',
    paper: '#c4d6e0', paper2: '#a6bed0', pattern: 'stripes', trim: '#5e7e96', beam: '#46382a', rug2: '#f0ead8' },
};

// Blend two hex colors, and a shorthand that blends toward black (amt < 0) or a warm white
// (amt > 0). For deriving tile tones.
const rgbOf = (hex) => { const n = parseInt(hex.slice(1, 7), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
function mixHex(a, b, t) {
  const B = rgbOf(b);
  return '#' + rgbOf(a).map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
const shade = (hex, amt) => mixHex(hex, amt < 0 ? '#120c18' : '#fff4d8', Math.abs(amt));

// ---------- painting ----------
const atlases = {}; // theme -> { frames (default variant), variants: Array<[Map, Map]> }

function paintTile(g, id, frame, theme, variant = 0) {
  const S = TILE;
  const r = rng(id * 7919 + variant * 104729 + 5);
  const fill = (c) => { g.fillStyle = c; g.fillRect(0, 0, S, S); };
  const px = (x, y, c, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const speckle = (n, c, sz = 1) => { for (let i = 0; i < n; i++) px(Math.floor(r() * S), Math.floor(r() * S), c, sz, sz); };
  const th = THEMES[theme];

  // Cluster pixels into material shapes; keep walkable surfaces quieter than actors.
  const grass = (base = '#538564', light = '#66956c', dark = '#47765c') => {
    fill(base);
    for (let i = 0; i < 3; i++) {
      const x = 1 + Math.floor(r() * 13), y = 2 + Math.floor(r() * 12);
      px(x, y, dark, 3); px(x + 1, y - 1, light);
      if (i === 0) px(x, y - 2, light);
    }
  };
  const water = (base, shade, light) => {
    fill(base);
    for (let i = 0; i < 2; i++) {
      const x = (variant * 3 + i * 8 + frame * 2) % 11, y = 4 + i * 7;
      px(x, y + 1, shade, 5); px(x + 1, y, light, 3);
      px(x + 4, y - 1, light);
    }
  };
  const rock = (base, light, dark, ground) => {
    fill(ground);
    px(3, 13, '#29334266', 11, 2);
    px(4, 2, dark, 7, 1); px(2, 4, dark, 12, 9); px(3, 3, dark, 10, 11);
    px(4, 3, base, 7, 10); px(3, 5, base, 10, 6);
    px(5, 3, light, 5, 2); px(3, 5, light, 5, 2); px(4, 7, light, 2);
    px(10, 6, dark, 2, 6); px(6, 12, dark, 6);
    px(7 + variant % 3, 8, dark, 2);
  };
  const masonry = () => {
    fill(th.wall);
    px(0, 0, th.wallTop, 16, 3); px(0, 3, '#f6e1bc25', 16);
    px(0, 5, '#1f2434', 16); px(0, 6, '#1f243444', 16, 2);
    px(0, 11, '#1f243477', 16); px(0, 15, '#1f243499', 16);
    px(5, 7, '#1f243477', 1, 4); px(12, 12, '#1f243477', 1, 3);
    px(6, 7, th.wallTop, 5); px(1, 12, th.wallTop, 6);
  };
  // the village houses' coursed stone, shared by their doors and windows
  const plaster = () => {
    fill('#b09a78'); speckle(6, '#c0aa88');
    px(0, 0, '#8a7a5e', 16, 1); px(0, 5, '#8a7a5e', 16, 1); px(0, 10, '#8a7a5e', 16, 1); px(0, 15, '#8a7a5e', 16, 1);
    px(4, 1, '#8a7a5e', 1, 4); px(11, 6, '#8a7a5e', 1, 4); px(7, 11, '#8a7a5e', 1, 4);
  };
  // interiors: themes without house colors (the dungeons) borrow their masonry tones
  const trim = th.trim || shade(th.wall, -0.3), beam = th.beam || shade(th.wall, -0.45);
  const rug2 = th.rug2 || th.floor2;
  const floorboards = () => {
    const gap = shade(th.floor, -0.3);
    fill(th.floor);
    for (let y = 0; y < 16; y += 4) {
      px(0, y, th.floor2, 16);                                  // lit top edge of each board
      px(0, y + 3, gap, 16);                                    // the gap under it
      px((y * 3 + variant * 5 + (y >> 2) * 7) % 16, y, gap, 1, 3);   // staggered butt joint
    }
    if (variant === 3) px(9, 5, gap, 2);                        // a knot
  };
  // Back-wall patterns run on the wall's own y (upper row 0-15, lower row 16-31) so they
  // carry across the seam between the two rows; every period divides 16 so they tile sideways.
  const wallpaper = (yOff, y0, y1) => {
    const p = th.paper || th.wall, p2 = th.paper2 || th.wallTop;
    px(0, y0, p, 16, y1 - y0);
    for (let y = y0; y < y1; y++) {
      const Y = y + yOff;
      switch (th.pattern) {
        case 'stripes': px(2, y, p2, 2); px(10, y, p2, 2); break;
        case 'dots': if (Y % 6 === 1 || Y % 6 === 2) { const o = Math.floor(Y / 6) % 2 ? 5 : 1; px(o, y, p2, 2); px(o + 8, y, p2, 2); } break;
        case 'planks': px(0, y, p2); px(8, y, p2); px(1, y, shade(p, 0.1)); px(9, y, shade(p, 0.1)); break;
      }
    }
    if (th.pattern === 'stars') {
      // little four-point stars, each drawn whole or not at all so none spill onto the trim
      const dim = shade(p2, -0.45);
      for (const [sx, sy] of [[4, 5], [12, 12]]) {
        if (sy - 1 < y0 || sy + 1 >= y1) continue;
        px(sx, sy, p2); px(sx - 1, sy, dim); px(sx + 1, sy, dim); px(sx, sy - 1, dim); px(sx, sy + 1, dim);
      }
    }
    if (th.pattern === 'roots') {
      // packed earth: pebbles and a wandering rootlet
      for (let i = 0; i < 5; i++) px(Math.floor(r() * 15), y0 + Math.floor(r() * (y1 - y0 - 1)), p2, 2, 1);
      px(1 + variant * 3, y0 + 2, shade(p, 0.18), 2, 1);
      const rx = 3 + variant * 3;
      px(rx, y0, shade(p2, -0.2), 1, Math.min(4, y1 - y0)); px(rx + 1, y0 + 3, shade(p2, -0.2), 1, 2);
    }
  };

  switch (id) {
    case T.GRASS: case T.GRASS2: grass(); break;
    case T.TALLGRASS: grass();
      for (let i = 0; i < 4; i++) {
        const x = 1 + i * 4, y = 8 + (i % 2) * 4;
        px(x, y, '#315d50', 3, 3); px(x, y - 3, '#3d765b', 1, 4);
        px(x + 2, y - 5, '#8ba568', 1, 6); px(x + 1, y - 2, '#69945e', 1, 5);
      } break;
    case T.FLOWER: grass();
      for (const [x, y, c] of [[3, 5, '#eac76e'], [11, 11, '#dfa0ad']]) {
        px(x, y + 1, '#315d50', 1, 3); px(x - 1, y - 1, c, 3);
        px(x, y - 2, c, 1, 3); px(x, y - 1, '#fff0cb');
      } break;
    case T.PATH: fill('#b89e76');
      speckle(4, '#ae926e'); px(2 + variant, 5, '#d4b98c', 3); px(9, 12 - variant, '#937d65', 2); break;
    case T.SAND: fill('#dfc694');
      px(1 + variant, 4, '#eed8a7', 5); px(3 + variant, 5, '#cbb17f', 4);
      px(9 - variant, 12, '#eed8a7', 5); speckle(3, '#cbb17f'); break;
    case T.SHALLOW: water('#478f9c', '#3e8294', '#8cc2bd'); break;
    case T.DEEP: water('#315e80', '#2c5678', '#518aa4'); break;
    case T.MUD: fill('#706350'); px(2, 4, '#5c554b', 5, 2); px(3, 4, '#8a7960', 3); px(9, 11, '#5c554b', 4, 2); break;
    case T.ASH: fill('#665967'); speckle(5, '#716371'); px(3, 8, '#514956', 4); px(5, 9, '#514956', 2); px(11, 4, frame ? '#cc8559' : '#996858'); break;
    case T.DARKGRASS: grass('#3e6956', '#527e60', '#345948'); break;
    case T.STORMGRASS: grass('#414f5b', '#576775', '#38454f'); break;

    case T.TREE: grass();
      px(3, 13, '#293c4266', 11, 2); px(6, 9, '#493b3f', 4, 6);
      px(7, 10, '#9a7954', 1, 5); px(5, 15, '#493b3f', 7);
      // Stepped, overlapping leaf masses make a rounded canopy with a shaded skirt.
      px(4, 0, '#284e48', 7, 12); px(2, 2, '#284e48', 12, 8); px(1, 4, '#284e48', 14, 5);
      px(3, 2, '#3e7155', 9, 8); px(2, 4, '#3e7155', 12, 4);
      px(4, 1, '#648e60', 6, 4); px(2, 4, '#648e60', 5, 3);
      px(5, 1, '#91ac73', 4, 1); px(3, 4, '#91ac73', 2, 1);
      px(9, 6, '#527e58', 4, 3); px(5, 9, '#527e58', 3, 2);
      px(11, 3 + variant % 2, '#648e60', 2); break;
    case T.PINE: grass('#3e6956', '#527e60', '#345948');
      px(6, 12, '#433b3b', 4, 4); px(7, 12, '#a08660', 1, 3);
      px(2, 11, '#243f40', 12, 3); px(4, 7, '#243f40', 8, 6); px(6, 2, '#243f40', 4, 7);
      px(3, 10, '#376454', 10, 2); px(5, 6, '#46755c', 6, 3); px(7, 0, '#7f9c70', 2, 3);
      px(6, 3, '#638e6a', 4, 3); px(4, 9, '#638e6a', 4); px(6, 6, '#86a177', 2); break;
    case T.PALM: fill('#dfc694');
      px(7, 6, '#8a6a3a', 3, 10); px(2, 2, '#527e58', 5, 3); px(9, 2, '#527e58', 5, 3);
      px(5, 0, '#91ac73', 6, 3); px(1, 4, '#284e48', 4, 2); px(11, 4, '#284e48', 4, 2); break;
    case T.ROCK: rock('#85848b', '#b5afa5', '#505463', '#538564'); break;
    case T.BASALT: rock('#565363', '#827783', '#383b4d', '#665967');
      px(8, 8, frame ? '#e29864' : '#b9785b', 1, 3); px(9, 10, '#b9785b', 2); break;
    case T.CLIFF: fill('#7a6a58'); px(0, 0, '#8a7a66', 16, 4); px(0, 4, '#6a5a48', 16, 1); speckle(6, '#5a4c3c'); px(0, 13, '#584a3a', 16, 3); break;
    case T.MESA: fill('#a8683a'); px(0, 0, '#c07a44', 16, 4); px(0, 4, '#8a5530', 16, 1); px(0, 8, '#985d34', 16, 1); speckle(5, '#7a4a28'); px(0, 13, '#6a4224', 16, 3); break;
    case T.FENCE: fill('#538564'); px(1, 4, '#8a6a3a', 2, 10); px(13, 4, '#8a6a3a', 2, 10); px(0, 6, '#a0764a', 16, 2); px(0, 10, '#a0764a', 16, 2); break;
    case T.WALL: plaster(); break;
    case T.ROOF: fill('#9b574f');
      for (let y = 0; y < 16; y += 4) {
        px(0, y, '#bd7860', 16); px(0, y + 3, '#6c4148', 16);
        px((y % 8) + 3, y + 1, '#75454b', 1, 2);
      } break;
    case T.CRACKROCK: rock('#85848b', '#b5afa5', '#505463', '#538564');
      px(7, 4, '#292f40', 1, 4); px(6, 8, '#292f40', 1, 3); px(8, 8, '#292f40', 2); px(5, 11, '#292f40', 1, 2); break;
    case T.CRYSTAL: fill('#3a3020'); px(3, 6, '#6ae0f0', 4, 7); px(4, 4, '#a8f0fa', 2, 4); px(9, 8, '#4ac0d8', 4, 5); px(10, 5, '#8ae8f4', 2, 4); px(2, 13, '#5a544c', 12, 2); break;
    case T.STORMROCK: rock('#677389', '#a2b1bd', '#414d64', '#414f5b');
      px(8, 5, frame ? '#b6e0de' : '#82adae', 1, 4); px(7, 9, '#82adae', 1, 2); break;
    case T.DEADTREE: fill('#414f5b'); px(7, 8, '#4a3c34', 3, 8); px(4, 3, '#4a3c34', 2, 6); px(10, 2, '#4a3c34', 2, 7); px(6, 5, '#4a3c34', 5, 2); break;

    case T.LAVA: case T.DLAVA: fill('#b64d46');
      px(0, 3, '#ea8150', 16, 2); px(0, 12, '#ea8150', 16, 2);
      for (let i = 0; i < 3; i++) {
        const x = (i * 6 + variant + frame) % 14, y = 3 + (i % 2) * 8;
        px(x, y - 1, '#f4ba6b', 3, 2); px(x + 1, y, '#ffe3a1', 2);
        px(x, y + 4, '#813e48', 4, 2);
      } break;
    case T.BRIDGE: fill('#a17c55');
      for (let y = 0; y < 16; y += 4) {
        px(0, y, '#584650', 16); px(0, y + 1, '#c49e70', 16);
        px(5 + (y + variant) % 4, y + 2, '#8b694f', 4);
        px(2, y + 2, '#584650'); px(13, y + 2, '#584650');
      }
      px(0, 0, '#6c5350', 1, 16); px(15, 0, '#6c5350', 1, 16); break;
    case T.REED: water('#478f9c', '#3e8294', '#8cc2bd');
      for (let i = 0; i < 3; i++) {
        const x = 2 + i * 5, y = 3 + (i % 2) * 3;
        px(x, y, '#789266', 1, 12 - y); px(x - 1, y + 5, '#47725a', 1, 5);
        px(x, y, '#785743', 2, 3); px(x, y, '#b18b61');
      } break;
    // ---- the endgame ----
    case T.PIT: fill('#07050c');
      px(2 + variant * 3, 9, '#16101f'); px(11 - variant, 4, '#120d1a'); px(6, 13 - variant, '#16101f'); break;
    case T.PASSAGE:
      // the bridge running on off the edge into the dark
      fill('#a17c55');
      for (let y = 0; y < 16; y += 4) { px(0, y, '#584650', 16); px(0, y + 1, '#c49e70', 16); px(4 + (y + variant) % 5, y + 2, '#8b694f', 4); }
      px(0, 0, '#07050c99', 16, 16);
      px(3 + variant * 2, 5, frame ? '#c8f0ff' : '#7a9ab0'); px(10, 11 - variant, frame ? '#7a9ab0' : '#c8f0ff'); break;
    case T.GOO: {
      // toxic slime: water's moving ripples in a sickly lime, plus a fat bubble that swells
      // and pops, so a goo pool reads as liquid rather than a patch of lawn
      water('#7ccf2a', '#5aa81e', '#e4ff9a');
      const [bx, by] = frame ? [3 + variant * 2, 9] : [10 - variant, 3];
      px(bx, by, '#3f7a14', 4, 3); px(bx + 1, by - 1, '#3f7a14', 2, 1);
      px(bx + 1, by, '#f4ffd0', 2, 1); px(bx, by + 1, '#f4ffd0');
      px(13 - variant, 12, '#f4ffd0'); break;
    }
    case T.XSOIL: fill('#4a3e5a');
      speckle(4, '#55486a'); px(2 + variant, 6, '#3e3350', 4); px(10 - variant, 12, '#3e3350', 3); break;
    case T.XSOIL2: fill('#4a3e5a');
      speckle(3, '#55486a'); px(3 + variant * 2, 5, '#3e3350', 3);
      px(5 + variant, 10, '#7ae0c0'); px(12 - variant, 3, '#b07ae0'); break;
    case T.XROCK: rock('#6a5a7a', '#9a88b0', '#3e3250', '#4a3e5a');
      px(9, 5, '#7ae0c0', 1, 2); break;
    case T.XSPIRE: fill('#4a3e5a');
      px(3, 13, '#2a203666', 11, 2);
      px(6, 2, '#5a2a7a', 4, 12); px(7, 0, '#8a4ab0', 2, 3); px(7, 3, '#c88aff', 1, 9);
      px(2, 7, '#2a6a6a', 3, 7); px(3, 5, '#5ad0c0', 1, 4);
      px(11, 8, '#2a6a6a', 3, 6); px(12, 6, '#5ad0c0', 1, 4);
      px(7, 1, frame ? '#fff0ff' : '#e0b0ff'); px(3, 5, frame ? '#d0fff8' : '#8af0e0'); break;
    case T.XPLANT: fill('#4a3e5a'); speckle(3, '#55486a');
      for (const [x, h, c] of [[3, 7, '#ff7ad8'], [8, 10, '#7affd0'], [12, 6, '#ff7ad8']]) {
        px(x, 15 - h, '#3a6a4a', 1, h); px(x - 1, 14 - h, c, 3, 2); px(x, 14 - h, '#ffffff');
      } break;
    case T.XCLIFF: fill('#3a2e48'); px(0, 0, '#4e3e60', 16, 4); px(0, 4, '#2c2238', 16, 1);
      speckle(6, '#2c2238'); px(0, 13, '#261d30', 16, 3); px(5 + variant, 8, '#7ae0c0'); break;
    case T.STEPS: fill(th.floor);
      for (let y = 0; y < 16; y += 4) {
        px(0, y, th.floor2, 16, 3);                         // the tread, lit
        px(0, y + 3, shade(th.floor, -0.45), 16, 1);        // the riser's shadow
        px(0, y, shade(th.floor2, 0.15), 16, 1);            // the nosing
      }
      px(0, 0, shade(th.floor, -0.3), 1, 16); px(15, 0, shade(th.floor, -0.3), 1, 16); break;

    case T.THORNS: fill('#3e6956'); for (let i = 0; i < 3; i++) { px(1 + i * 5, 6, '#6a3a5a', 3, 8); px(2 + i * 5, 3, '#8a4a72', 1, 4); } break;

    // ---- dungeon tiles (theme-colored) ----
    case T.DFLOOR: fill(th.floor);
      // Worn flagstones: low-contrast joints and broken highlights, not a busy checker.
      px(0, 15, '#10192422', 16); px(15, 0, '#10192418', 1, 15);
      px(2, 1, th.floor2, 8 + variant * 2);
      if (variant === 1) { px(4, 12, '#18233133', 3); px(6, 13, '#18233133', 2); }
      if (variant === 2) px(3, 8, th.floor2, 2);
      break;
    case T.DWALL: masonry(); break;
    case T.DOOR_OPEN: fill(th.floor); px(0, 0, th.wall, 3, 16); px(13, 0, th.wall, 3, 16); px(3, 0, '#101010', 2, 16); px(11, 0, '#101010', 2, 16); break;
    case T.DOOR_LOCKED: fill(th.wall); px(2, 2, '#5a4a2a', 12, 14); px(3, 3, '#7a6438', 10, 12);
      px(7, 7, '#f0c83a', 3, 3); px(8, 10, '#f0c83a', 1, 3); break;
    case T.DOOR_BOSS: fill(th.wall); px(2, 2, '#3a2430', 12, 14); px(3, 3, '#54344a', 10, 12);
      px(6, 5, '#f0ead8', 2, 5); px(9, 5, '#f0ead8', 2, 5); px(7, 10, '#f0ead8', 3, 3); break;
    case T.DOOR_SHUT: fill(th.wall); px(2, 2, '#444a52', 12, 14); px(3, 3, '#5a626c', 10, 12); px(4, 7, '#444a52', 8, 2); break;
    case T.DCRACK: masonry();
      px(7, 6, '#202330', 1, 5); px(6, 10, '#202330', 1, 3); px(8, 9, '#202330', 2, 1); px(9, 12, '#202330', 1, 2); break;
    case T.DWATER: water('#294c68', '#24435f', '#53889c'); break;
    case T.SPIKES: fill(th.floor); for (let i = 0; i < 4; i++) { px(1 + i * 4, frame ? 6 : 8, '#c8ccd4', 2, frame ? 8 : 6); px(1 + i * 4, frame ? 4 : 6, '#e8ecf4', 2, 2); } break;
    case T.PLATE: fill(th.floor); px(3, 3, '#8a929c', 10, 10); px(4, 4, '#b0b8c4', 8, 8); px(6, 6, '#8a929c', 4, 4); break;
    case T.PLATE_DOWN: fill(th.floor); px(3, 3, '#5a626c', 10, 10); px(4, 4, '#78808c', 8, 8); break;
    case T.EYE: fill(th.wall); px(0, 0, th.wallTop, 16, 5); px(4, 6, '#e8e4d8', 8, 6); px(6, 7, '#8a2a2a', 4, 4); px(7, 8, '#111', 2, 2); break;
    case T.EYE_ON: fill(th.wall); px(0, 0, th.wallTop, 16, 5); px(4, 6, '#a8a49a', 8, 6); px(5, 8, '#111', 6, 2); break;
    case T.STAIRS: fill('#181818'); px(2, 2, '#4a4a4a', 12, 3); px(3, 5, '#3c3c3c', 10, 3); px(4, 8, '#2e2e2e', 8, 3); px(5, 11, '#222', 6, 3); break;
    case T.TORCH: fill(th.wall); px(0, 0, th.wallTop, 16, 5); px(7, 8, '#8a6a3a', 2, 6);
      px(6, 4, frame ? '#ffc84a' : '#ff8a3a', 4, 4); px(7, 3, frame ? '#fff0a0' : '#ffc84a', 2, 2); break;
    case T.DDECOR: fill(th.floor); px(4, 4, th.accent + '44', 8, 8); px(6, 6, th.accent + '66', 4, 4); break;
    case T.GUST: fill(th.floor); px(frame ? 2 : 6, 4, '#c8d8e8', 6, 1); px(frame ? 8 : 3, 9, '#c8d8e8', 5, 1); px(frame ? 4 : 9, 13, '#c8d8e8', 4, 1); break;

    // ---- house exteriors (set into the village's WALL rows) ----
    case T.HDOOR: plaster();
      px(3, 1, '#4a3222', 10, 15); px(4, 2, '#8a5a34', 8, 14);          // frame, door
      px(4, 2, '#a4703e', 8, 1); px(7, 3, '#6e4628', 1, 13);             // lintel light, plank seam
      px(10, 3, '#6e4628', 1, 13); px(5, 5, '#a4703e', 1, 8);
      px(10, 9, '#f0c83a'); px(10, 10, '#a07818');                      // knob
      px(2, 15, '#8a8070', 12, 1); break;                                // doorstep
    case T.WINDOW: plaster();
      px(3, 2, '#4a3222', 10, 9); px(4, 3, '#8ac4e0', 8, 7);             // frame, glass
      px(4, 3, '#d4f0fa', 3, 2); px(4, 5, '#d4f0fa', 1, 2);              // shine
      px(7, 3, '#4a3222', 2, 7); px(4, 6, '#4a3222', 8, 1);              // mullions
      px(2, 11, '#8a5a34', 12, 3); px(2, 11, '#a4703e', 12, 1);          // flower box
      for (let i = 0; i < 4; i++) px(3 + i * 3, 10, ['#e04a5a', '#ffe066', '#ff9ad0', '#f0f0f0'][(i + variant) % 4], 2, 1);
      break;
    case T.SHOPWALL: plaster();
      px(7, 0, '#4a3222', 2, 3); px(2, 2, '#4a3222', 12, 1);             // bracket
      px(3, 3, '#4a3222', 1, 2); px(12, 3, '#4a3222', 1, 2);             // chains
      px(1, 5, '#5a3a18', 14, 9); px(2, 6, '#b07838', 12, 7);            // signboard
      px(6, 7, '#815137', 4, 5); px(7, 7, '#f0c83a', 2, 5); px(6, 8, '#f0c83a', 4, 3);  // coin
      px(7, 8, '#fff0b5', 1, 2); break;
    case T.BUILDING: grass(); break;   // always under a building sprite

    // ---- house interiors ----
    case T.HFLOOR: floorboards(); break;
    case T.HWALL_UP:
      wallpaper(0, 4, 16);
      px(0, 0, shade(trim, -0.35), 16, 1); px(0, 1, trim, 16, 2); px(0, 3, shade(trim, 0.3), 16, 1);
      break;
    case T.HWALL:
      wallpaper(16, 0, 9);
      px(0, 9, shade(trim, 0.3), 16, 1); px(0, 10, trim, 16, 4);        // wainscot rail and panel
      px(3, 11, shade(trim, -0.25), 1, 2); px(11, 11, shade(trim, -0.25), 1, 2);
      px(0, 14, shade(trim, -0.3), 16, 2); break;                        // baseboard
    case T.HWIN:
      wallpaper(0, 4, 16);
      px(0, 0, shade(trim, -0.35), 16, 1); px(0, 1, trim, 16, 2); px(0, 3, shade(trim, 0.3), 16, 1);
      px(3, 4, shade(trim, -0.35), 10, 11); px(4, 5, '#8ac4e0', 8, 8);   // frame, glass
      px(4, 5, '#d4f0fa', 3, 2); px(4, 7, '#d4f0fa', 1, 2);              // shine
      px(7, 5, trim, 2, 8); px(4, 8, trim, 8, 1);                        // mullions
      px(1, 4, th.accent, 2, 10); px(13, 4, th.accent, 2, 10);           // curtains
      px(1, 4, shade(th.accent, 0.3), 1, 10); px(14, 4, shade(th.accent, -0.25), 1, 10);
      px(2, 14, shade(trim, 0.3), 12, 2); break;                         // sill
    case T.HBEAM: fill(beam);
      px(2 + variant, 4, shade(beam, 0.14), 5); px(9 - variant, 11, shade(beam, 0.14), 4);
      px(6, 8 + (variant & 1), shade(beam, -0.25), 3); break;
    case T.RUG: {
      // a small, quiet woven diamond (the border is drawn per-edge in drawTileTo)
      const motif = mixHex(th.accent, rug2, 0.35), weave = shade(th.accent, -0.12);
      fill(th.accent);
      for (let y = 1; y < 16; y += 3) px(0, y, weave, 16, 1);
      px(7, 5, motif, 2, 1); px(6, 6, motif, 1, 1); px(9, 6, motif, 1, 1); px(5, 7, motif, 1, 2); px(10, 7, motif, 1, 2);
      px(6, 9, motif, 1, 1); px(9, 9, motif, 1, 1); px(7, 10, motif, 2, 1);
      break;
    }
    case T.EXIT: floorboards();
      px(0, 0, beam, 1, 16); px(15, 0, beam, 1, 16);                     // door jambs
      px(2, 2, '#4a3222', 12, 12); px(3, 3, '#a8844c', 10, 10);          // coir mat
      px(3, 5, '#8e6c3a', 10, 1); px(3, 10, '#8e6c3a', 10, 1);
      px(6, 6, '#f0e2b8', 4, 1); px(7, 7, '#f0e2b8', 2, 1); break;       // "this way out" chevron
    default: fill('#ff00ff');
  }
}

export function buildTileAtlas(theme = 'ow') {
  if (atlases[theme]) return atlases[theme];
  const variants = Array.from({ length: 4 }, () => [new Map(), new Map()]);
  for (let v = 0; v < variants.length; v++) {
    for (const id of Object.values(T)) {
      for (let f = 0; f < 2; f++) {
        if (f && !ANIMATED.has(id)) {
          variants[v][f].set(id, variants[v][0].get(id));
          continue;
        }
        const c = document.createElement('canvas');
        c.width = TILE; c.height = TILE;
        paintTile(c.getContext('2d'), id, f, theme, v);
        variants[v][f].set(id, c);
      }
    }
  }
  atlases[theme] = { frames: variants[0], variants };
  return atlases[theme];
}

const ANIMATED = new Set([T.SHALLOW, T.DEEP, T.LAVA, T.DLAVA, T.DWATER, T.TORCH, T.SPIKES, T.GUST, T.ASH, T.BASALT, T.STORMROCK,
  T.GOO, T.XSPIRE, T.PASSAGE]);

export function drawTileTo(ctx, theme, id, x, y, time, neighbors = null) {
  const atlas = atlases[theme] || buildTileAtlas(theme);
  const f = ANIMATED.has(id) ? (Math.floor(time * 2.5) % 2) : 0;
  const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
  const variant = ((tx * 73856093) ^ (ty * 19349663) ^ ((tx + ty) * 83492791)) >>> 0;
  const c = atlas.variants[(variant >>> 8) % 4][f].get(id);
  if (c) ctx.drawImage(c, x, y);
  if (neighbors) {
    drawBanks(ctx, id, x, y, neighbors);
    drawInteriorEdges(ctx, theme, id, x, y, neighbors);
    if (id === T.PIT) drawPitLip(ctx, theme, x, y, neighbors);
  }
}

// The chasm's near wall: wherever solid ground (or a bridge) stops at a pit's north edge,
// a strip of rock face drops away into the dark, so the pit reads as deep, not just black.
const OVER_PIT = new Set([T.PIT, T.PASSAGE]);
function drawPitLip(ctx, theme, x, y, [n, e, s, w]) {
  const th = THEMES[theme] || THEMES.ow;
  if (!OVER_PIT.has(n)) {
    const under = n === T.BRIDGE;
    ctx.fillStyle = under ? '#3a2a24' : th.wall;
    ctx.fillRect(x, y, 16, under ? 2 : 5);
    ctx.fillStyle = under ? '#1a1214' : shade(th.wall, -0.4);
    ctx.fillRect(x, y + (under ? 2 : 5), 16, 2);
  }
  ctx.fillStyle = '#ffffff10';
  if (!OVER_PIT.has(w) && w !== T.BRIDGE) ctx.fillRect(x, y, 1, 16);
  if (!OVER_PIT.has(e) && e !== T.BRIDGE) ctx.fillRect(x + 15, y, 1, 16);
}

// Interior depth, drawn inside the tile like the banks: floor in the lee of a wall takes a
// soft shadow, wall tops get a lit lip where they meet the floor, and a rug is bound with a
// border (and fringe at its ends) wherever it stops.
const WALLISH = new Set([T.HWALL, T.HWALL_UP, T.HWIN, T.HBEAM]);
const FLOORISH = new Set([T.HFLOOR, T.RUG, T.EXIT]);
function drawInteriorEdges(ctx, theme, id, x, y, [n, e, s, w]) {
  if (id === T.HFLOOR || id === T.RUG) {
    ctx.fillStyle = '#10081844';
    if (WALLISH.has(n)) ctx.fillRect(x, y, 16, 3);
    if (WALLISH.has(w)) ctx.fillRect(x, y, 2, 16);
    if (WALLISH.has(e)) ctx.fillRect(x + 15, y, 1, 16);
  }
  if (id === T.HBEAM) {
    ctx.fillStyle = '#ffffff1c';
    if (FLOORISH.has(e)) ctx.fillRect(x + 14, y, 2, 16);
    if (FLOORISH.has(w)) ctx.fillRect(x, y, 2, 16);
    if (FLOORISH.has(n)) ctx.fillRect(x, y, 16, 2);
  }
  if (id === T.RUG) {
    const th = THEMES[theme] || THEMES.ow;
    const edge = th.rug2 || th.floor2, dark = shade(th.accent, -0.4);
    const sides = [n !== T.RUG, e !== T.RUG, s !== T.RUG, w !== T.RUG];
    ctx.fillStyle = dark;
    if (sides[0]) ctx.fillRect(x, y, 16, 1);
    if (sides[1]) ctx.fillRect(x + 15, y, 1, 16);
    if (sides[2]) ctx.fillRect(x, y + 15, 16, 1);
    if (sides[3]) ctx.fillRect(x, y, 1, 16);
    ctx.fillStyle = edge;
    if (sides[0]) ctx.fillRect(x + (sides[3] ? 1 : 0), y + 1, 16 - (sides[3] ? 1 : 0) - (sides[1] ? 1 : 0), 2);
    if (sides[2]) ctx.fillRect(x + (sides[3] ? 1 : 0), y + 13, 16 - (sides[3] ? 1 : 0) - (sides[1] ? 1 : 0), 2);
    if (sides[1]) ctx.fillRect(x + 13, y + 1, 2, 14);
    if (sides[3]) ctx.fillRect(x + 1, y + 1, 2, 14);
    // tassels off the short ends
    if (sides[0]) for (let i = 2; i < 15; i += 3) ctx.fillRect(x + i, y, 1, 1);
    if (sides[2]) for (let i = 2; i < 15; i += 3) ctx.fillRect(x + i, y + 15, 1, 1);
  }
}

export const isSolid = (id) => !!(P[id] && P[id].solid);
export const props = (id) => P[id] || {};

// Draw inside the liquid tile, so banks cannot cover a neighbor or alter collisions.
// The caller supplies [north, east, south, west]; isolated atlas previews need none.
const WATER = new Set([T.SHALLOW, T.DEEP, T.DWATER, T.REED]);
const HOT = new Set([T.LAVA, T.DLAVA]);
function drawBanks(ctx, id, x, y, neighbors) {
  const water = WATER.has(id), hot = HOT.has(id), goo = id === T.GOO;
  if (!water && !hot && !goo) return;
  neighbors.forEach((other, side) => {
    if (other == null || WATER.has(other) || HOT.has(other) || other === T.BRIDGE || other === T.GOO) return;
    ctx.fillStyle = goo ? '#1e3a14' : hot ? '#743f48' : '#344f59';
    if (side === 0) ctx.fillRect(x, y, 16, 2);
    if (side === 1) ctx.fillRect(x + 14, y, 2, 16);
    if (side === 2) ctx.fillRect(x, y + 14, 16, 2);
    if (side === 3) ctx.fillRect(x, y, 2, 16);
    ctx.fillStyle = goo ? '#c8ff8a' : hot ? '#f2b16b' : '#8bb9ae';
    if (side === 0 || side === 2) {
      ctx.fillRect(x + 2, y + (side === 0 ? 2 : 13), 5, 1);
      ctx.fillRect(x + 10, y + (side === 0 ? 2 : 13), 4, 1);
    } else {
      ctx.fillRect(x + (side === 3 ? 2 : 13), y + 2, 1, 5);
      ctx.fillRect(x + (side === 3 ? 2 : 13), y + 10, 1, 4);
    }
  });
}
