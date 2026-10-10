// The Platypus Kingdom: an island across the sea, south of the Vale, reached over the Royal
// Bridge from the beach below Gus's burrow. Castle Mirri stands in the middle (guards at
// every gate, platypus folk in the courtyard, Elder Mirri on her throne inside), with five
// regions round it, each hiding one of the five power dungeons:
//
//   Molehill Meadows (west)   the Mole Mines         SHOVEL   open to anyone
//   Hopscotch Hills (NW)      Hopscotch Heights      JUMP     a heap of dirt in the way: dig
//   Rumble Ridge (NE)         the Rumble Ruins       DASH     a plateau ringed by a chasm: jump
//   Mirror Lake (east)        the Drowned Halls      DIVE     rubble walls it in: dash
//   Mirror Lake (middle)      the Skyhook Spire      HOOK     an island ringed by rock: dive under
//
// Built from a fixed seed like the Vale, so it's the same every time.

import { TILE, WORLD_SEED } from './config.js';
import { rng, dist, dirTo, clamp } from './util.js';
import { T, isSolid, props as tileProps } from './tiles.js';
import { Entity, moveEntity, walkable, drawQuestMarker } from './entities.js';
import { drawSprite } from './pixelart.js';
import { REGION, LM } from './worldgen.js';

export const KINGDOM_ID = 'kingdom';
export const KW = 150, KH = 120;
export const KLM = {
  arrive: [75, 4],          // where the Royal Bridge comes ashore
  castle: [75, 47],         // the middle of the courtyard
  keepDoor: [74, 40],       // the keep's front door (into the throne room)
  statue: [75, 49],
  mine: [22, 64],           // the five dungeons' stairs
  heights: [24, 17],
  ruins: [128, 19],
  halls: [99, 86],
  spire: [124, 96],
};
// Castle Mirri's curtain wall, in tiles (inclusive), and its four gates
const CX0 = 58, CX1 = 92, CY0 = 28, CY1 = 62;

const regionOf = (x, y) => {
  if (x >= CX0 - 6 && x <= CX1 + 6 && y >= CY0 - 6 && y <= CY1 + 8) return REGION.KINGDOM;
  if (x >= 66 && x <= 84 && y < CY0) return REGION.KINGDOM;
  if (x < 52) return y < 40 ? REGION.HILLS : REGION.MEADOWS;
  if (x >= 100 && y < 52) return REGION.RIDGE;
  if (x >= 84 && y >= 52) return REGION.LAKE;
  if (y < 30) return REGION.RIDGE;
  return REGION.WOODS;
};

export function buildKingdom() {
  const W = KW, H = KH;
  const r = rng(WORLD_SEED + 4242);
  const tiles = new Uint8Array(W * H).fill(T.GRASS);
  const region = new Uint8Array(W * H);
  const idx = (x, y) => y * W + x;
  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const get = (x, y) => inB(x, y) ? tiles[idx(x, y)] : T.OCEAN;
  const set = (x, y, t) => { if (inB(x, y)) tiles[idx(x, y)] = t; };
  const disc = (cx, cy, rad, fn) => {
    for (let y = Math.floor(cy - rad); y <= cy + rad; y++) for (let x = Math.floor(cx - rad); x <= cx + rad; x++)
      if (inB(x, y) && dist(x, y, cx, cy) <= rad) fn(x, y);
  };
  const ring = (cx, cy, r0, r1, fn) => {
    for (let y = Math.floor(cy - r1 - 1); y <= cy + r1 + 1; y++) for (let x = Math.floor(cx - r1 - 1); x <= cx + r1 + 1; x++) {
      const d = dist(x, y, cx, cy);
      if (inB(x, y) && d > r0 && d <= r1) fn(x, y);
    }
  };
  const fill = (x0, y0, x1, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, t); };

  // ---- ground and scenery, region by region
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const rg = regionOf(x, y), q = r();
    region[idx(x, y)] = rg;
    let t = T.GRASS;
    switch (rg) {
      case REGION.KINGDOM: t = q < 0.05 ? T.FLOWER : q < 0.4 ? T.GRASS2 : T.GRASS; break;
      case REGION.MEADOWS: t = q < 0.1 ? T.FLOWER : q < 0.13 ? T.TREE : q < 0.2 ? T.TALLGRASS : q < 0.5 ? T.GRASS2 : T.GRASS; break;
      case REGION.HILLS: t = q < 0.06 ? T.MESA : q < 0.08 ? T.ROCK : q < 0.12 ? T.TALLGRASS : q < 0.5 ? T.GRASS2 : T.GRASS; break;
      case REGION.RIDGE: t = q < 0.07 ? T.ROCK : q < 0.09 ? T.CLIFF : T.PATH; break;
      case REGION.LAKE: t = q < 0.03 ? T.TREE : q < 0.06 ? T.TALLGRASS : q < 0.4 ? T.GRASS2 : T.GRASS; break;
      case REGION.WOODS: t = q < 0.14 ? T.PINE : q < 0.2 ? T.TREE : q < 0.26 ? T.TALLGRASS : T.DARKGRASS; break;
    }
    set(x, y, t);
  }
  // farm rows in the meadows: tilled earth in neat stripes
  for (const [fx, fy] of [[8, 44], [30, 80], [12, 92]]) {
    for (let y = fy; y < fy + 8; y++) for (let x = fx; x < fx + 12; x++) set(x, y, y % 2 ? T.GRASS : T.MUD);
  }

  // ---- Mirror Lake, with the Skyhook Spire's island in the middle of it
  const [lx, ly] = [122, 94];
  disc(lx, ly, 19, (x, y) => set(x, y, T.SHALLOW));
  disc(lx, ly, 17, (x, y) => set(x, y, T.DEEP));
  // a ring of rock standing up out of the water all round the island, with two rock arches
  // to dive under (west and north)
  const [sx, sy] = KLM.spire;
  ring(sx, sy, 6.2, 7.6, (x, y) => set(x, y, T.ROCK));
  for (const [ax, ay] of [[sx - 7, sy], [sx - 7, sy + 1], [sx, sy - 7], [sx + 1, sy - 7]]) set(ax, ay, T.UNDERPASS);
  // the arches have to be the only way through: clear any rock touching them diagonally
  disc(sx, sy, 6.2, (x, y) => set(x, y, T.DEEP));
  disc(sx, sy, 3.6, (x, y) => set(x, y, T.SAND));
  set(sx + 2, sy - 2, T.PALM); set(sx - 2, sy + 2, T.PALM);

  // ---- the sea all round the island kingdom
  const wob = Array.from({ length: 40 }, () => r());
  const coast = (i) => { const a = (i / 7) % 40, i0 = Math.floor(a), f = a - i0; return wob[i0] * (1 - f) + wob[(i0 + 1) % 40] * f; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.min(x, y, W - 1 - x, H - 1 - y);
    const along = d === y || d === H - 1 - y ? x : y + 300;
    const sea = 4 + Math.round(coast(along) * 3);
    if (d < sea - 2) { set(x, y, T.OCEAN); region[idx(x, y)] = REGION.OCEAN; }
    else if (d < sea) set(x, y, T.SHALLOW);
    else if (d < sea + 2 && !isSolid(get(x, y))) set(x, y, T.SAND);
  }

  // ---- roads: carved after the scenery, so they stay clear
  const carve = (x0, y0, x1, y1, t = T.PATH) => {
    let x = x0, y = y0;
    const step = () => {
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const cur = get(x + dx, y + dy), p = tileProps(cur);
        set(x + dx, y + dy, p.deep || p.water ? T.BRIDGE : t);
      }
    };
    while (x !== x1 || y !== y1) {
      step();
      const dx = Math.sign(x1 - x), dy = Math.sign(y1 - y);
      if (dx && dy) { if (r() < 0.5) x += dx; else y += dy; } else if (dx) x += dx; else y += dy;
    }
    step();
  };
  carve(74, 0, 74, CY0);                   // the Royal Bridge's landing to the north gate
  carve(40, 46, 33, 30); carve(33, 30, 24, 27);             // -> Hopscotch Heights' dirt heap
  carve(CX0, 45, 40, 46); carve(40, 46, 23, 60);            // west gate -> the Mole Mines
  carve(CX1, 45, 108, 40); carve(108, 40, 117, 24);         // east gate -> Rumble Ridge's chasm
  carve(74, CY1, 74, 74); carve(74, 74, 88, 86); carve(88, 86, 91, 86);   // south gate -> the Drowned Halls' rubble
  carve(74, 74, 60, 100);                                   // -> the Royal Woods
  // the bridge itself, running out to sea off the north shore (and the way back to the Vale)
  const links = [];
  for (let y = 0; y < 8; y++) for (const x of [74, 75]) if (tileProps(get(x, y)).deep || tileProps(get(x, y)).water) set(x, y, T.BRIDGE);
  for (const x of [74, 75]) {
    set(x, 0, T.PASSAGE);
    links.push({ tx: x, ty: 0, to: 'overworld', at: { x: LM.royalBridge[0] * TILE + 8, y: (LM.royalBridge[1] - 2) * TILE + 8 } });
  }

  // ---- Castle Mirri: a curtain wall with a tower at each corner and a gate on each side,
  // a courtyard of lawns and flagstones, and the keep in the middle
  fill(CX0, CY0, CX1, CY1, T.GRASS);
  for (let y = CY0; y <= CY1; y++) for (let x = CX0; x <= CX1; x++) {
    const edge = x <= CX0 + 1 || x >= CX1 - 1 || y <= CY0 + 1 || y >= CY1 - 1;
    if (edge) set(x, y, y === CY0 + 1 && x > CX0 + 1 && x < CX1 - 1 ? T.CWALL : T.CTOP);
  }
  // the inner face of the walls on the south and the sides shows from the courtyard too
  for (let x = CX0 + 2; x <= CX1 - 2; x++) set(x, CY1 - 1, T.CWALL);
  for (const [tx, ty] of [[CX0 - 1, CY0 - 1], [CX1 - 2, CY0 - 1], [CX0 - 1, CY1 - 2], [CX1 - 2, CY1 - 2]]) fill(tx, ty, tx + 3, ty + 3, T.CTOP);
  // gates: the walls open three tiles wide, flagstones through
  for (let d = -1; d <= 1; d++) {
    for (const y of [CY0, CY0 + 1, CY1 - 1, CY1]) set(75 + d - 1, y, T.CFLOOR);
    for (const x of [CX0, CX0 + 1, CX1 - 1, CX1]) set(x, 45 + d, T.CFLOOR);
  }
  // courtyard paths in a cross, a ring round the keep, flower beds in the corners
  fill(73, CY0 + 2, 75, CY1 - 2, T.CFLOOR);
  fill(CX0 + 2, 44, CX1 - 2, 46, T.CFLOOR);
  fill(66, 41, 84, 51, T.CFLOOR);
  for (const [fx, fy] of [[62, 33], [84, 33], [62, 55], [84, 55]]) disc(fx, fy, 2.5, (x, y) => set(x, y, (x + y) % 3 ? T.FLOWER : T.GRASS2));
  // the keep: one big building sprite over a solid footprint, front door in its bottom row
  const KEEP = { x: 67, y: 34, w: 15, h: 7 };
  fill(KEEP.x, KEEP.y, KEEP.x + KEEP.w - 1, KEEP.y + KEEP.h - 1, T.BUILDING);
  set(...KLM.keepDoor, T.HDOOR);

  // ---- the five dungeons
  const clearing = (cx, cy, rad, ground) => disc(cx, cy, rad, (x, y) => set(x, y, ground));
  // the Mole Mines: an open dell among the farms
  clearing(...KLM.mine, 4, T.GRASS);
  ring(...KLM.mine, 4.2, 5.4, (x, y) => { if (get(x, y) !== T.PATH) set(x, y, T.TREE); });
  carve(23, 60, 22, 64);
  // Hopscotch Heights: ringed by mesas, the only way in heaped high with dirt
  clearing(...KLM.heights, 5, T.GRASS2);
  ring(...KLM.heights, 5.2, 7.4, (x, y) => set(x, y, T.MESA));
  // a heap of dirt three tiles deep filling the one gap in the mesas, on the south side
  for (let y = 22; y <= 25; y++) for (let x = 23; x <= 25; x++) set(x, y, y === 25 ? T.PATH : T.DIRTPILE);
  // the Rumble Ruins: a plateau with a chasm all the way round it, two tiles wide
  clearing(...KLM.ruins, 5.6, T.PATH);
  ring(...KLM.ruins, 5.6, 7.6, (x, y) => set(x, y, T.PIT));
  disc(...KLM.ruins, 1.2, (x, y) => set(x, y, T.PATH));
  // the Drowned Halls: on the lake's west shore, walled in by rock, rubble in the gap
  clearing(...KLM.halls, 4, T.SAND);
  ring(...KLM.halls, 4.2, 6, (x, y) => set(x, y, T.CLIFF));
  // rubble three tiles deep filling the gap on the west side
  for (let y = 85; y <= 87; y++) for (let x = 93; x <= 95; x++) set(x, y, T.RUBBLE);
  set(...KLM.mine, T.STAIRS); set(...KLM.heights, T.STAIRS); set(...KLM.ruins, T.STAIRS);
  set(...KLM.halls, T.STAIRS); set(...KLM.spire, T.STAIRS);

  // ---- little secrets for the powers
  // a chest on a ledge in the middle of a deep pit, two grapple posts to get there and back
  fill(100, 25, 114, 35, T.PIT);
  fill(109, 28, 113, 32, T.PATH);
  set(110, 30, T.POST);
  set(101, 30, T.POST); fill(98, 29, 100, 31, T.PATH);
  // an islet in the meadows with a chasm round it: one good jump
  disc(16, 82, 3.6, (x, y) => set(x, y, T.PIT));
  disc(16, 82, 1.5, (x, y) => set(x, y, T.GRASS));
  // a nook in the woods behind a wall of rubble
  ring(44, 104, 1.5, 2.6, (x, y) => set(x, y, T.PINE));
  disc(44, 104, 1.5, (x, y) => set(x, y, T.DARKGRASS));
  set(44, 102, T.RUBBLE); set(44, 101, T.RUBBLE);
  disc(44, 99, 1.5, (x, y) => set(x, y, T.DARKGRASS));
  // a hamlet clearing in the Royal Woods
  clearing(60, 102, 6, T.GRASS);

  // ---- props
  const props = [
    { kind: 'sign', tx: 77, ty: 7, text: 'THE PLATYPUS KINGDOM!|Castle Mirri is straight ahead. Elder Mirri will be so happy to see you!' },
    { kind: 'sign', tx: 72, ty: 25, text: 'CASTLE MIRRI.|Home of Elder Mirri. Wipe your feet, please.' },
    { kind: 'house', id: 'castle', tx: KLM.keepDoor[0], ty: KLM.keepDoor[1] },
    { kind: 'building', sprite: 'castle_keep', tx: KEEP.x, ty: KEEP.y, w: KEEP.w, h: KEEP.h, flags: true },
    { kind: 'statue', tx: KLM.statue[0], ty: KLM.statue[1] + 3, id: 'king_statue' },
    { kind: 'sign', tx: 42, ty: 44, text: 'W: THE MOLE MINES.  NW: HOPSCOTCH HEIGHTS.|(Somebody has piled a big heap of dirt on the Heights road.)' },
    { kind: 'sign', tx: 108, ty: 43, text: 'NE: THE RUMBLE RUINS.|Mind the chasm! Only a good JUMP gets you across.' },
    { kind: 'sign', tx: 77, ty: 72, text: 'SE: THE DROWNED HALLS, on the shore of Mirror Lake.|S: The Royal Woods.' },
    { kind: 'sign', tx: 25, ty: 68, text: 'THE MOLE MINES.|Something down there has been digging and digging...' },
    { kind: 'sign', tx: 34, ty: 27, text: 'HOPSCOTCH HEIGHTS.|Up past the dirt. Bring a shovel!' },
    { kind: 'sign', tx: 115, ty: 25, text: 'THE RUMBLE RUINS.|Across the chasm. Jump for it!' },
    { kind: 'sign', tx: 90, ty: 88, text: 'THE DROWNED HALLS.|Walled in by rubble. Something FAST could smash through.' },
    { kind: 'sign', tx: 104, ty: 78, text: 'MIRROR LAKE.|They say the Skyhook Spire stands on an island in the middle, behind a ring of rock. The rock has arches... under the water.' },
    { kind: 'dungeon', tx: KLM.mine[0], ty: KLM.mine[1], id: 'mine' },
    { kind: 'dungeon', tx: KLM.heights[0], ty: KLM.heights[1], id: 'heights' },
    { kind: 'dungeon', tx: KLM.ruins[0], ty: KLM.ruins[1], id: 'ruins' },
    { kind: 'dungeon', tx: KLM.halls[0], ty: KLM.halls[1], id: 'halls' },
    { kind: 'dungeon', tx: KLM.spire[0], ty: KLM.spire[1], id: 'spire' },
    // power secrets
    { kind: 'chest', tx: 112, ty: 30, id: 'kc_hook', contents: { diamonds: 4, coins: 60 } },
    { kind: 'chest', tx: 16, ty: 82, id: 'kc_jump', contents: { diamonds: 3, coins: 40 } },
    { kind: 'chest', tx: 44, ty: 104, id: 'kc_dash', contents: { diamonds: 3, coins: 50 } },
    { kind: 'divespot', id: 'kdive_1', tx: 112, ty: 88, contents: { diamonds: 3 } },
    { kind: 'divespot', id: 'kdive_2', tx: 132, ty: 104, contents: { coins: 80, diamonds: 1 } },
    { kind: 'suncray', tx: 104, ty: 94 }, { kind: 'suncray', tx: 138, ty: 92 },
    // secret books
    { kind: 'book', id: 'bk_mole', tx: 36, ty: 52 },
    { kind: 'book', id: 'bk_lake', tx: 102, ty: 76 },
    { kind: 'xmark', book: 'bk_mole', tx: 10, ty: 56 },
    // folk out and about
    { kind: 'citizen', sprite: 'cit_farmer', name: 'Farmer Fernsby', tx: 18, ty: 47, roam: 3, lines: [
      'Moles keep digging up my carrots! Something BIG lives down in the Mole Mines.',
      "If you ever get a shovel, try digging anywhere. You never know what's down there!" ] },
    { kind: 'citizen', sprite: 'cit_fisher', name: 'Old Gil', tx: 100, ty: 80, roam: 2, lines: [
      'Mirror Lake is so still you can see yourself in it. Fish see themselves too. They hate it.',
      'Sometimes things glitter on the bottom of the lake. You would have to dive to reach them.' ] },
    { kind: 'citizen', sprite: 'cit_woodcutter', name: 'Barkley', tx: 58, ty: 100, roam: 4, lines: [
      'Welcome to Puddleton, the littlest village in the Royal Woods!',
      "There's a nook in the woods just west of here with rubble in the way. A dash could smash it." ] },
    { kind: 'citizen', sprite: 'cit_kid', name: 'Tadpole', tx: 63, ty: 104, roam: 5, lines: [
      "Wanna know a secret? There's a treasure chest in the ridge on a ledge in the middle of a big hole!",
      'You need a GRAPPLE HOOK to get it. I tried with a fishing rod. It did not work.' ] },
  ];

  // Castle Mirri's guards and folk: guards at every gate, two on patrol, folk in the courtyard
  const guardLines = [
    ['Halt! Oh, it is you, Gus! Go right in.', 'Elder Mirri is in the throne room, straight through the big doors.'],
    ['I guard this gate day and night. Mostly night. Okay, mostly day.'],
    ['Stand tall! ...Sorry, I always say that. Hello!'],
    ['No predators get past ME. Well, a duck did once. But it was a very fast duck.'],
  ];
  const guard = (tx, ty, i, roam = 0, path = null) => props.push({ kind: 'citizen', sprite: 'guard', name: 'Royal Guard', tx, ty, roam, path, lines: guardLines[i % guardLines.length] });
  guard(72, CY0 - 1, 0); guard(76, CY0 - 1, 1);
  guard(72, CY1 + 1, 2); guard(76, CY1 + 1, 3);
  guard(CX0 - 1, 43, 1); guard(CX0 - 1, 47, 2);
  guard(CX1 + 1, 43, 3); guard(CX1 + 1, 47, 0);
  guard(64, 44, 2, 0, [[64, 44], [86, 44]]);
  guard(86, 52, 3, 0, [[86, 52], [64, 52]]);
  const folk = [
    ['cit_baker', 'Baker Bun', 64, 38, ['Fresh crayfish buns! ...I ate them all. Come back tomorrow.']],
    ['cit_gardener', 'Gardener Moss', 85, 57, ['Every flower in this courtyard was planted by me. Except that one. That one just showed up.']],
    ['cit_kid', 'Pebbles', 70, 54, ['Tag, you\'re it! ...Hey, come back!', 'When I grow up I want to be a Royal Guard. Or a puggle.']],
    ['cit_knight', 'Sir Paddington', 80, 46, ['I am training to be a knight! Watch my sword moves. Hyah! Hyah! ...Oops, dropped it.']],
    ['cit_minstrel', 'Lyra the Bard', 67, 47, ['La la la! A song for the hero: "Gus, Gus, he never makes a fuss..." Still working on it.']],
    ['cit_elder', 'Grandpa Webb', 83, 38, ['In my day we didn\'t HAVE powers. We had to jump over things with our own two feet!',
      'Five dungeons, five treasures. Find them all, and Elder Mirri will make you a ROYAL KNIGHT!']],
  ];
  for (const [sprite, name, tx, ty, lines] of folk) props.push({ kind: 'citizen', sprite, name, tx, ty, roam: 3, lines });

  // ---- monsters: none in or near the castle, a handful in every other region
  const rs = rng(WORLD_SEED + 4343);
  const spawners = [];
  const TABLE = {
    [REGION.MEADOWS]: ['rakali', 'adder', 'dingo'],
    [REGION.HILLS]: ['talon', 'kooka', 'owl'],
    [REGION.RIDGE]: ['snapjaw', 'mgoanna', 'gknight'],
    [REGION.LAKE]: ['snapshell', 'kooka', 'rakali'],
    [REGION.WOODS]: ['dingo', 'wildcat', 'python', 'tazzy'],
  };
  const quiet = [KLM.mine, KLM.heights, KLM.ruins, KLM.halls, [60, 102], [16, 82], [112, 30], [44, 104]];
  for (const [rgKey, types] of Object.entries(TABLE)) {
    let placed = 0;
    for (let tries = 0; placed < 12 && tries < 3000; tries++) {
      const x = 6 + Math.floor(rs() * (W - 12)), y = 6 + Math.floor(rs() * (H - 12));
      if (region[idx(x, y)] !== Number(rgKey)) continue;
      const t = get(x, y), p = tileProps(t);
      if (isSolid(t) || p.water || p.deep || p.pit || t === T.PATH || t === T.BRIDGE || t === T.STAIRS) continue;
      if (quiet.some(([qx, qy]) => dist(x, y, qx, qy) < 10) || spawners.some(s => dist(x, y, s.tx, s.ty) < 5)) continue;
      spawners.push({ tx: x, ty: y, x: x * TILE + 8, y: y * TILE + 8, type: types[Math.floor(rs() * types.length)] });
      placed++;
    }
  }

  return {
    id: KINGDOM_ID, type: 'overworld', theme: 'ow', name: 'The Platypus Kingdom',
    w: W, h: H, tiles, region, get, set, regionAt: (x, y) => inB(x, y) ? region[idx(x, y)] : REGION.OCEAN,
    spawners, props, puzzles: [], links,
    buried: { '10,56': { diamonds: 5, coins: 120 } },
    playerStart: { x: KLM.arrive[0] * TILE + 16, y: (KLM.arrive[1] + 2) * TILE + 8 },
  };
}

// ---------------------------------------------------------------- the folk of the Kingdom
// Somebody who ambles about near home (or walks a guard's beat), stops to face Gus when he
// comes close, and has a few things to say. Each E gives the next line.
export class Citizen extends Entity {
  constructor(def) {
    super(def.tx * TILE + 3, def.ty * TILE + 4, 10, 8);
    this.def = def;
    this.home = [this.cx, this.cy];
    this.solid = true;
    this.goal = null;
    this.waitT = Math.random() * 2;
    this.line = 0;
    this.flip = Math.random() < 0.5;
    this.moving = false;
    this.animT = 0;
    this.leg = 0;
  }
  interact(g) {
    const lines = this.def.lines;
    g.openDialog(this.def.name, lines[this.line % lines.length]);
    this.line++;
  }
  update(g, dt) {
    const p = g.player;
    this.moving = false;
    if (dist(this.cx, this.cy, p.cx, p.cy) < 28) { this.flip = p.cx < this.cx; return; }
    const path = this.def.path;
    if (path) {
      // a guard on his beat, back and forth
      const [tx, ty] = path[this.leg].map(v => v * TILE + 8);
      if (dist(this.cx, this.cy, tx, ty) < 3) { this.leg = (this.leg + 1) % path.length; this.waitT = 1.2; }
      if ((this.waitT -= dt) > 0) return;
      this.step(g, tx, ty, 26, dt);
      return;
    }
    if (!this.def.roam) return;
    if ((this.waitT -= dt) > 0) return;
    if (!this.goal) {
      const a = Math.random() * Math.PI * 2, rr = Math.random() * this.def.roam * TILE;
      this.goal = [this.home[0] + Math.cos(a) * rr, this.home[1] + Math.sin(a) * rr];
    }
    if (dist(this.cx, this.cy, ...this.goal) < 3 || !this.step(g, ...this.goal, 22, dt)) {
      this.goal = null;
      this.waitT = 1 + Math.random() * 3;
    }
  }
  // returns false if it walked into something
  step(g, tx, ty, spd, dt) {
    const [ux, uy] = dirTo(this.cx, this.cy, tx, ty);
    const r = moveEntity(g, this, ux * spd * dt, uy * spd * dt);
    if (Math.abs(ux) > 0.2) this.flip = ux < 0;
    this.moving = true;
    this.animT += dt;
    return !(r.hitX && r.hitY);
  }
  draw(g, ctx) {
    ctx.fillStyle = '#25324155';
    ctx.fillRect(Math.round(this.cx) - 5, Math.round(this.bottom + 1), 10, 2);
    const bob = this.moving ? (Math.floor(this.animT * 8) % 2) : Math.sin(g.time * 2 + this.id) * 0.6;
    drawSprite(ctx, this.def.sprite, this.cx, this.bottom + 3 - bob, { flip: this.flip });
  }
}
