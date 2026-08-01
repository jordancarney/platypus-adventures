// The Crucible — a wave arena just outside Billabong Village.
//
// Built as a single-room area that reports `type: 'dungeon'` so it inherits the existing
// room camera lock, stairs exit and save plumbing; `isArena` flags the wave logic in game.js.

import { ROOM_W, ROOM_H, TILE } from './config.js';
import { T } from './tiles.js';

export const ARENA_ID = 'arena';

// 25x15, one screen. '#' wall  '.' sand  ',' decor  'S' exit stairs
const MAP = [
  '#########################',
  '#,,,,,,,,,,,,,,,,,,,,,,,#',
  '#,.....................,#',
  '#,...##.........##.....,#',
  '#,...##.........##.....,#',
  '#,.....................,#',
  '#,.....................,#',
  '#,.........,,,.........,#',
  '#,.....................,#',
  '#,.....................,#',
  '#,...##.........##.....,#',
  '#,...##.........##.....,#',
  '#,.....................,#',
  '#,..........S..........,#',
  '#########################',
];

// Where fighters appear, in room tiles. Kept clear of the pillars and the exit.
export const PADS = [
  [3, 2], [21, 2], [3, 12], [21, 12],
  [12, 2], [3, 7], [21, 7], [8, 5], [16, 5], [8, 9], [16, 9],
];
export const CENTER_PAD = [12, 6];

const GONG = [12, 11];
const START = [12, 12];

// Roster unlocks as the waves climb. No aquatic types — there's no water in here.
const ROSTER = [
  { from: 1, types: ['rakali', 'adder'] },
  { from: 4, types: ['snapjaw', 'dingo', 'wildcat'] },
  { from: 8, types: ['emberfox', 'talon', 'python', 'tazzy'] },
  { from: 13, types: ['mgoanna', 'owl', 'snapshell', 'kooka'] },
  { from: 18, types: ['gknight'] },
];
const MINIBOSSES = ['mini_fox', 'mini_python', 'mini_owl', 'mini_eel'];

export const rosterFor = (wave) =>
  ROSTER.filter(r => wave >= r.from).flatMap(r => r.types);

export const minibossFor = (wave) => MINIBOSSES[(Math.floor(wave / 5) - 1) % MINIBOSSES.length];

export const isMinibossWave = (wave) => wave % 5 === 0;
export const fighterCount = (wave) => Math.min(8, 2 + Math.floor(wave / 2));
export const eliteChance = (wave) => Math.min(0.5, Math.max(0, (wave - 3) * 0.05));
// Enemy stats scale on wave, but never drop below the player's story progress.
export const waveTier = (wave, storyTier) => Math.max(storyTier, Math.min(6, Math.floor(wave / 3)));

export const waveCoins = (wave) => 15 + wave * 8;
export const waveDiamonds = (wave) => (isMinibossWave(wave) ? 1 + Math.floor(wave / 10) : 0);
export const HEAL_EVERY = 3;      // a crayfish drops every N waves
export const BREATHER = 6;        // seconds between waves
export const COUNTDOWN = 2.2;     // "get ready" beat before fighters land

export function buildArena() {
  const w = ROOM_W, h = ROOM_H;
  const tiles = new Uint8Array(w * h).fill(T.DFLOOR);
  const idx = (x, y) => y * w + x;
  const inB = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  const CH = { '#': T.DWALL, '.': T.DFLOOR, ',': T.DDECOR, 'S': T.STAIRS };

  let exitStairs = null;
  for (let y = 0; y < h; y++) {
    const row = MAP[y] || '';
    for (let x = 0; x < w; x++) {
      const t = CH[row[x]] ?? T.DFLOOR;
      tiles[idx(x, y)] = t;
      if (t === T.STAIRS) exitStairs = { tx: x, ty: y };
    }
  }

  const room = { rx: 0, ry: 0, letter: 'A', spawns: [], killall: false, plates: [], eyes: [], gdoors: [] };

  return {
    id: ARENA_ID, type: 'dungeon', isArena: true,
    theme: 'arena', name: 'The Crucible', music: 'boss',
    w, h, tiles,
    rooms: { '0,0': room }, bossRoom: null,
    get: (x, y) => inB(x, y) ? tiles[idx(x, y)] : T.DWALL,
    set: (x, y, t) => { if (inB(x, y)) tiles[idx(x, y)] = t; },
    regionAt: () => -1,
    spawners: [],
    props: [{ kind: 'gong', tx: GONG[0], ty: GONG[1] }],
    playerStart: { x: START[0] * TILE + 8, y: START[1] * TILE + 8 },
    exitStairs,
    roomAt: () => room,
  };
}
