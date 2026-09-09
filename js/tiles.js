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
};

// ---------- tile properties ----------
// solid: blocks walking · deep: swimmable · lava/dmg: hurts · slow: speed penalty · cut: sword clears it
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
};

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
    case T.WALL: fill('#b09a78'); speckle(6, '#c0aa88');
      px(0, 0, '#8a7a5e', 16, 1); px(0, 5, '#8a7a5e', 16, 1); px(0, 10, '#8a7a5e', 16, 1); px(0, 15, '#8a7a5e', 16, 1);
      px(4, 1, '#8a7a5e', 1, 4); px(11, 6, '#8a7a5e', 1, 4); px(7, 11, '#8a7a5e', 1, 4); break;
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

const ANIMATED = new Set([T.SHALLOW, T.DEEP, T.LAVA, T.DLAVA, T.DWATER, T.TORCH, T.SPIKES, T.GUST, T.ASH, T.BASALT, T.STORMROCK]);

export function drawTileTo(ctx, theme, id, x, y, time, neighbors = null) {
  const atlas = atlases[theme] || buildTileAtlas(theme);
  const f = ANIMATED.has(id) ? (Math.floor(time * 2.5) % 2) : 0;
  const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
  const variant = ((tx * 73856093) ^ (ty * 19349663) ^ ((tx + ty) * 83492791)) >>> 0;
  const c = atlas.variants[(variant >>> 8) % 4][f].get(id);
  if (c) ctx.drawImage(c, x, y);
  if (neighbors) drawBanks(ctx, id, x, y, neighbors);

}

export const isSolid = (id) => !!(P[id] && P[id].solid);
export const props = (id) => P[id] || {};

// Draw inside the liquid tile, so banks cannot cover a neighbor or alter collisions.
// The caller supplies [north, east, south, west]; isolated atlas previews need none.
const WATER = new Set([T.SHALLOW, T.DEEP, T.DWATER, T.REED]);
const HOT = new Set([T.LAVA, T.DLAVA]);
function drawBanks(ctx, id, x, y, neighbors) {
  const water = WATER.has(id), hot = HOT.has(id);
  if (!water && !hot) return;
  neighbors.forEach((other, side) => {
    if (other == null || WATER.has(other) || HOT.has(other) || other === T.BRIDGE) return;
    ctx.fillStyle = hot ? '#743f48' : '#344f59';
    if (side === 0) ctx.fillRect(x, y, 16, 2);
    if (side === 1) ctx.fillRect(x + 14, y, 2, 16);
    if (side === 2) ctx.fillRect(x, y + 14, 16, 2);
    if (side === 3) ctx.fillRect(x, y, 2, 16);
    ctx.fillStyle = hot ? '#f2b16b' : '#8bb9ae';
    if (side === 0 || side === 2) {
      ctx.fillRect(x + 2, y + (side === 0 ? 2 : 13), 5, 1);
      ctx.fillRect(x + 10, y + (side === 0 ? 2 : 13), 4, 1);
    } else {
      ctx.fillRect(x + (side === 3 ? 2 : 13), y + 2, 1, 5);
      ctx.fillRect(x + (side === 3 ? 2 : 13), y + 10, 1, 4);
    }
  });
}
