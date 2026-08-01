// Tile ids, properties, and a procedurally painted tile atlas (2 frames for animation).
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
const atlases = {}; // theme -> { frames: [Map(id->canvas), Map(id->canvas)] }

function paintTile(g, id, frame, theme) {
  const S = TILE;
  const r = rng(id * 7919 + frame * 131 + 5);
  const fill = (c) => { g.fillStyle = c; g.fillRect(0, 0, S, S); };
  const px = (x, y, c, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const speckle = (n, c, sz = 1) => { for (let i = 0; i < n; i++) px(Math.floor(r() * S), Math.floor(r() * S), c, sz, sz); };
  const th = THEMES[theme];

  switch (id) {
    case T.GRASS: fill('#4f8f3c'); speckle(10, '#58a044'); speckle(5, '#447c32'); break;
    case T.GRASS2: fill('#4f8f3c'); speckle(8, '#58a044'); speckle(7, '#447c32'); px(4, 6, '#447c32', 2, 1); px(10, 11, '#447c32', 2, 1); break;
    case T.TALLGRASS: fill('#4f8f3c');
      for (let i = 0; i < 5; i++) { const x = 1 + i * 3; px(x, 4 + (i % 2) * 2, '#2f6a24', 2, 12 - (i % 2) * 2); px(x, 3 + (i % 2) * 2, '#58a044', 2, 2); }
      break;
    case T.FLOWER: fill('#4f8f3c'); speckle(8, '#58a044'); px(3, 3, '#f0e04a', 2, 2); px(10, 9, '#f08ac0', 2, 2); px(6, 12, '#f0f0f0', 2, 2); break;
    case T.PATH: fill('#c2a86c'); speckle(8, '#d4bc80'); speckle(6, '#a89058'); break;
    case T.SAND: fill('#e0cc8a'); speckle(10, '#f0dc9c'); speckle(5, '#c8b070'); break;
    case T.SHALLOW: fill('#4a9ad0'); speckle(6, '#6ab4e4');
      px(frame ? 2 : 6, 4, '#a8dcf4', 4, 1); px(frame ? 9 : 5, 11, '#a8dcf4', 4, 1); break;
    case T.DEEP: fill('#2a6aa8'); speckle(4, '#3a7ab8');
      px(frame ? 4 : 8, 6, '#5a9ad0', 3, 1); px(frame ? 10 : 2, 12, '#5a9ad0', 3, 1); break;
    case T.MUD: fill('#6a5636'); speckle(9, '#7a6642'); speckle(5, '#584428'); break;
    case T.ASH: fill('#6a5a52'); speckle(9, '#7a6a62'); speckle(6, '#584a44'); if (frame) speckle(2, '#ff8a3a'); break;
    case T.DARKGRASS: fill('#3a6e30'); speckle(9, '#447c38'); speckle(6, '#2c5824'); break;
    case T.STORMGRASS: fill('#3c5244'); speckle(8, '#465e4e'); speckle(6, '#2e4236'); break;

    case T.TREE: fill('#4f8f3c');
      px(6, 10, '#6a4a24', 4, 6); px(2, 1, '#2c6a28', 12, 10); px(3, 0, '#2c6a28', 10, 12);
      px(4, 2, '#3f8a36', 8, 4); px(5, 3, '#54a844', 5, 2); break;
    case T.PINE: fill('#3a6e30');
      px(7, 12, '#5a3c1e', 3, 4); px(5, 8, '#1e4a20', 7, 4); px(3, 5, '#26582a', 11, 4); px(6, 1, '#2f6a34', 5, 5); px(7, 0, '#3a7a3e', 3, 3); break;
    case T.PALM: fill('#e0cc8a');
      px(7, 6, '#8a6a3a', 3, 10); px(2, 2, '#3f8a36', 5, 3); px(9, 2, '#3f8a36', 5, 3);
      px(5, 0, '#54a844', 6, 3); px(1, 4, '#2c6a28', 4, 2); px(11, 4, '#2c6a28', 4, 2); break;
    case T.ROCK: fill('#4f8f3c'); px(2, 4, '#8a8278', 12, 10); px(3, 3, '#9a928a', 10, 3); px(4, 5, '#b0a89c', 5, 2); px(2, 12, '#5a544c', 12, 2); break;
    case T.BASALT: fill('#6a5a52'); px(1, 3, '#4a3c38', 14, 11); px(2, 2, '#5a4a44', 12, 3); px(3, 4, '#6a5852', 5, 2); px(1, 12, '#38302c', 14, 2); if (frame) px(5, 7, '#ff6a3a', 2, 1); break;
    case T.CLIFF: fill('#7a6a58'); px(0, 0, '#8a7a66', 16, 4); px(0, 4, '#6a5a48', 16, 1); speckle(6, '#5a4c3c'); px(0, 13, '#584a3a', 16, 3); break;
    case T.MESA: fill('#a8683a'); px(0, 0, '#c07a44', 16, 4); px(0, 4, '#8a5530', 16, 1); px(0, 8, '#985d34', 16, 1); speckle(5, '#7a4a28'); px(0, 13, '#6a4224', 16, 3); break;
    case T.FENCE: fill('#4f8f3c'); px(1, 4, '#8a6a3a', 2, 10); px(13, 4, '#8a6a3a', 2, 10); px(0, 6, '#a0764a', 16, 2); px(0, 10, '#a0764a', 16, 2); break;
    case T.WALL: fill('#b09a78'); speckle(6, '#c0aa88');
      px(0, 0, '#8a7a5e', 16, 1); px(0, 5, '#8a7a5e', 16, 1); px(0, 10, '#8a7a5e', 16, 1); px(0, 15, '#8a7a5e', 16, 1);
      px(4, 1, '#8a7a5e', 1, 4); px(11, 6, '#8a7a5e', 1, 4); px(7, 11, '#8a7a5e', 1, 4); break;
    case T.ROOF: fill('#a8503a'); px(0, 0, '#c05a40', 16, 2); px(0, 4, '#903f2c', 16, 1); px(0, 9, '#903f2c', 16, 1); px(0, 14, '#903f2c', 16, 2); break;
    case T.CRACKROCK: fill('#4f8f3c'); px(2, 3, '#8a8278', 12, 11); px(3, 2, '#9a928a', 10, 3);
      px(7, 4, '#3a342c', 1, 4); px(6, 8, '#3a342c', 1, 3); px(8, 8, '#3a342c', 2, 1); px(5, 11, '#3a342c', 1, 2); break;
    case T.CRYSTAL: fill('#3a3020'); px(3, 6, '#6ae0f0', 4, 7); px(4, 4, '#a8f0fa', 2, 4); px(9, 8, '#4ac0d8', 4, 5); px(10, 5, '#8ae8f4', 2, 4); px(2, 13, '#5a544c', 12, 2); break;
    case T.STORMROCK: fill('#3c5244'); px(2, 3, '#5a626c', 12, 11); px(3, 2, '#6a727c', 10, 3); if (frame) px(5, 5, '#c8f0ff', 2, 2); px(2, 12, '#454c54', 12, 2); break;
    case T.DEADTREE: fill('#3c5244'); px(7, 8, '#4a3c34', 3, 8); px(4, 3, '#4a3c34', 2, 6); px(10, 2, '#4a3c34', 2, 7); px(6, 5, '#4a3c34', 5, 2); break;

    case T.LAVA: fill(frame ? '#e05a1e' : '#d04a16'); speckle(6, '#f08a2a'); speckle(4, frame ? '#ffc84a' : '#f0a03a', 2); break;
    case T.BRIDGE: fill('#8a6a3a'); px(0, 0, '#6a4e28', 16, 1); px(0, 15, '#6a4e28', 16, 1);
      px(0, 4, '#a0764a', 16, 1); px(0, 8, '#a0764a', 16, 1); px(0, 12, '#a0764a', 16, 1); px(2, 0, '#5a3e1e', 1, 16); px(13, 0, '#5a3e1e', 1, 16); break;
    case T.REED: fill('#4a9ad0'); for (let i = 0; i < 4; i++) px(2 + i * 4, 3 + (i % 2) * 3, '#3f8a36', 2, 13 - (i % 2) * 3); break;
    case T.THORNS: fill('#3a6e30'); for (let i = 0; i < 3; i++) { px(1 + i * 5, 6, '#6a3a5a', 3, 8); px(2 + i * 5, 3, '#8a4a72', 1, 4); } break;

    // ---- dungeon tiles (theme-colored) ----
    case T.DFLOOR: fill(th.floor); speckle(6, th.floor2); if ((frame + id) % 2) px(4, 4, th.floor2, 2, 2); break;
    case T.DWALL: fill(th.wall); px(0, 0, th.wallTop, 16, 5); px(0, 5, '#000000', 16, 1);
      px(3, 7, th.wallTop, 2, 2); px(10, 10, th.wallTop, 2, 2); px(0, 14, '#00000055', 16, 2); break;
    case T.DOOR_OPEN: fill(th.floor); px(0, 0, th.wall, 3, 16); px(13, 0, th.wall, 3, 16); px(3, 0, '#101010', 2, 16); px(11, 0, '#101010', 2, 16); break;
    case T.DOOR_LOCKED: fill(th.wall); px(2, 2, '#5a4a2a', 12, 14); px(3, 3, '#7a6438', 10, 12);
      px(7, 7, '#f0c83a', 3, 3); px(8, 10, '#f0c83a', 1, 3); break;
    case T.DOOR_BOSS: fill(th.wall); px(2, 2, '#3a2430', 12, 14); px(3, 3, '#54344a', 10, 12);
      px(6, 5, '#f0ead8', 2, 5); px(9, 5, '#f0ead8', 2, 5); px(7, 10, '#f0ead8', 3, 3); break;
    case T.DOOR_SHUT: fill(th.wall); px(2, 2, '#444a52', 12, 14); px(3, 3, '#5a626c', 10, 12); px(4, 7, '#444a52', 8, 2); break;
    case T.DCRACK: fill(th.wall); px(0, 0, th.wallTop, 16, 5); px(0, 5, '#000000', 16, 1);
      px(7, 6, '#181818', 1, 5); px(6, 10, '#181818', 1, 3); px(8, 9, '#181818', 2, 1); px(9, 12, '#181818', 1, 2); break;
    case T.DWATER: fill('#1e4a6a'); px(frame ? 3 : 7, 5, '#3a7aa8', 4, 1); px(frame ? 9 : 4, 11, '#3a7aa8', 4, 1); break;
    case T.DLAVA: fill(frame ? '#e05a1e' : '#d04a16'); speckle(5, '#f08a2a'); speckle(3, '#ffc84a', 2); break;
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
  const frames = [new Map(), new Map()];
  for (let f = 0; f < 2; f++) {
    for (const id of Object.values(T)) {
      const c = document.createElement('canvas');
      c.width = TILE; c.height = TILE;
      paintTile(c.getContext('2d'), id, f, theme);
      frames[f].set(id, c);
    }
  }
  atlases[theme] = { frames };
  return atlases[theme];
}

const ANIMATED = new Set([T.SHALLOW, T.DEEP, T.LAVA, T.DLAVA, T.DWATER, T.TORCH, T.SPIKES, T.GUST, T.ASH, T.BASALT, T.STORMROCK]);

export function drawTileTo(ctx, theme, id, x, y, time) {
  const atlas = atlases[theme] || buildTileAtlas(theme);
  const f = ANIMATED.has(id) ? (Math.floor(time * 2.5) % 2) : 0;
  const c = atlas.frames[f].get(id);
  if (c) ctx.drawImage(c, x, y);
}

export const isSolid = (id) => !!(P[id] && P[id].solid);
export const props = (id) => P[id] || {};
