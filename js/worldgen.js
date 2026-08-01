// Deterministic overworld builder: 200x200 tiles, 5 elemental regions around a central hub.
import { WORLD_W as W, WORLD_H as H, WORLD_SEED, TILE } from './config.js';
import { rng, irand, choose, clamp, dist } from './util.js';
import { T, isSolid, props } from './tiles.js';

export const REGION = { MARSH: 0, FIRE: 1, WATER: 2, AIR: 3, EARTH: 4, CONFLUENCE: 5, VILLAGE: 6 };
export const REGION_KEYS = ['marsh', 'fire', 'water', 'air', 'earth', 'confluence', 'village'];

// landmark tile coordinates
export const LM = {
  start: [100, 152],           // Gus's burrow
  village: [100, 110],         // plaza center
  statue: [100, 109],
  fireGate: [172, 26],         // dungeon stair tiles
  waterGate: [168, 176],
  airGate: [26, 24],
  earthGate: [30, 172],
  nexusGate: [100, 14],
  gate: [100, 44],             // confluence gate
  arenaGate: [118, 110],       // The Crucible, just outside the village's east gate
};

export function buildOverworld() {
  const r = rng(WORLD_SEED);
  const tiles = new Uint8Array(W * H).fill(T.GRASS);
  const region = new Uint8Array(W * H).fill(REGION.MARSH);
  const idx = (x, y) => y * W + x;
  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const get = (x, y) => inB(x, y) ? tiles[idx(x, y)] : T.CLIFF;
  const set = (x, y, t) => { if (inB(x, y)) tiles[idx(x, y)] = t; };
  const reg = (x, y) => inB(x, y) ? region[idx(x, y)] : REGION.MARSH;

  // --- region masks ---
  const R_RAD = 92;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const n = (r() - 0.5) * 8;
    if (x >= 76 && x <= 124 && y <= 46) region[idx(x, y)] = REGION.CONFLUENCE;
    else if (dist(x, y, W, 0) + n < R_RAD) region[idx(x, y)] = REGION.FIRE;
    else if (dist(x, y, W, H) + n < R_RAD) region[idx(x, y)] = REGION.WATER;
    else if (dist(x, y, 0, 0) + n < R_RAD) region[idx(x, y)] = REGION.AIR;
    else if (dist(x, y, 0, H) + n < R_RAD) region[idx(x, y)] = REGION.EARTH;
  }
  for (let y = 101; y <= 119; y++) for (let x = 89; x <= 111; x++) region[idx(x, y)] = REGION.VILLAGE;

  // --- base ground per region ---
  const rBase = rng(WORLD_SEED + 1);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const q = rBase();
    switch (region[idx(x, y)]) {
      case REGION.MARSH: case REGION.VILLAGE:
        set(x, y, q < 0.06 ? T.FLOWER : q < 0.4 ? T.GRASS2 : T.GRASS); break;
      case REGION.FIRE: set(x, y, T.ASH); break;
      case REGION.WATER: set(x, y, T.SAND); break;
      case REGION.AIR: set(x, y, T.PATH); break;
      case REGION.EARTH: set(x, y, q < 0.5 ? T.DARKGRASS : T.DARKGRASS); break;
      case REGION.CONFLUENCE: set(x, y, T.STORMGRASS); break;
    }
  }

  const blob = (cx, cy, rad, fn) => {
    for (let y = Math.floor(cy - rad - 2); y <= cy + rad + 2; y++)
      for (let x = Math.floor(cx - rad - 2); x <= cx + rad + 2; x++)
        if (inB(x, y) && dist(x, y, cx, cy) + (r() - 0.5) * 2.4 < rad) fn(x, y);
  };

  // --- water bodies ---
  // main river: from confluence south-east into the lagoon
  let rx = 118, ry2 = 20;
  while (ry2 < 158) {
    const wdt = 2;
    for (let dx = -wdt; dx <= wdt; dx++) {
      const t = Math.abs(dx) === wdt ? T.SHALLOW : T.DEEP;
      if (inB(rx + dx, ry2)) set(rx + dx, ry2, t);
    }
    ry2++;
    if (r() < 0.4) rx += irand(r, -1, 1);
    rx = clamp(rx, 126, 146);
  }
  // lagoon (SE)
  blob(164, 172, 17, (x, y) => set(x, y, T.DEEP));
  blob(164, 172, 19, (x, y) => { if (get(x, y) !== T.DEEP) set(x, y, T.SHALLOW); });
  // island with the water dungeon
  blob(168, 176, 5, (x, y) => set(x, y, T.SAND));
  // village pond + marsh ponds
  blob(86, 122, 4, (x, y) => set(x, y, T.SHALLOW));
  blob(120, 90, 5, (x, y) => set(x, y, T.SHALLOW));
  blob(120, 90, 3, (x, y) => set(x, y, T.DEEP));
  blob(70, 90, 4, (x, y) => set(x, y, T.SHALLOW));
  // fire region lava pools
  for (const [lx, ly, lr] of [[150, 40, 5], [176, 48, 4], [160, 18, 6], [188, 30, 4], [142, 22, 3]])
    blob(lx, ly, lr, (x, y) => { if (reg(x, y) === REGION.FIRE) set(x, y, T.LAVA); });
  // confluence moat thorns
  for (const [tx, ty, tr] of [[84, 20, 4], [116, 28, 4], [92, 36, 3], [110, 10, 3]])
    blob(tx, ty, tr, (x, y) => { if (reg(x, y) === REGION.CONFLUENCE) set(x, y, T.THORNS); });

  // --- scatter solids & decor per region ---
  const rS = rng(WORLD_SEED + 2);
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    const t = get(x, y), rg = reg(x, y), q = rS();
    if (t !== T.GRASS && t !== T.GRASS2 && t !== T.ASH && t !== T.SAND && t !== T.PATH && t !== T.DARKGRASS && t !== T.STORMGRASS) continue;
    if (rg === REGION.VILLAGE) continue;
    switch (rg) {
      case REGION.MARSH:
        if (q < 0.045) set(x, y, T.TREE);
        else if (q < 0.10) set(x, y, T.TALLGRASS);
        else if (q < 0.108) set(x, y, T.ROCK);
        break;
      case REGION.FIRE:
        if (q < 0.05) set(x, y, T.BASALT);
        else if (q < 0.056) set(x, y, T.CRACKROCK);
        break;
      case REGION.WATER:
        if (q < 0.03) set(x, y, T.PALM);
        else if (q < 0.04) set(x, y, T.ROCK);
        break;
      case REGION.AIR:
        if (q < 0.05) set(x, y, T.MESA);
        else if (q < 0.056) set(x, y, T.ROCK);
        break;
      case REGION.EARTH:
        if (q < 0.11) set(x, y, T.PINE);
        else if (q < 0.125) set(x, y, T.TALLGRASS);
        else if (q < 0.131) set(x, y, T.CRYSTAL);
        else if (q < 0.14) set(x, y, T.MUD);
        break;
      case REGION.CONFLUENCE:
        if (q < 0.05) set(x, y, T.DEADTREE);
        else if (q < 0.075) set(x, y, T.STORMROCK);
        break;
    }
  }
  // reeds at water edges in marsh
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    if (get(x, y) === T.SHALLOW && reg(x, y) === REGION.MARSH && rS() < 0.18) set(x, y, T.REED);
  }

  // --- roads (carve after scatter so they stay clear) ---
  const carve = (x0, y0, x1, y1) => {
    let x = x0, y = y0;
    const step = (nx, ny) => {
      for (let dy = 0; dy <= 1; dy++) for (let dx = 0; dx <= 1; dx++) {
        const cx = nx + dx, cy = ny + dy;
        if (!inB(cx, cy)) continue;
        const cur = get(cx, cy);
        const p = props(cur);
        if (p.deep || p.water || cur === T.REED) set(cx, cy, T.BRIDGE);
        else if (cur === T.LAVA) set(cx, cy, T.BRIDGE);
        else set(cx, cy, T.PATH);
      }
    };
    while (x !== x1 || y !== y1) {
      step(x, y);
      const dx = Math.sign(x1 - x), dy = Math.sign(y1 - y);
      if (dx && dy) { if (r() < 0.5) x += dx; else y += dy; }
      else if (dx) x += dx; else y += dy;
    }
    step(x1, y1);
  };
  carve(100, 150, 100, 120);            // burrow -> village south gate
  carve(100, 101, 100, 46);             // village -> confluence gate
  carve(100, 44, 100, 17);              // gate -> nexus stairs
  carve(111, 108, 150, 60);             // village -> fire approach (via river bridge)
  carve(150, 60, 172, 31);
  carve(111, 114, 152, 160);            // village -> lagoon shore
  carve(89, 108, 44, 60);               // village -> air approach
  carve(44, 60, 26, 37);
  carve(89, 114, 48, 152);              // village -> earth approach
  carve(48, 152, 34, 170);

  // --- village ---
  for (let y = 102; y <= 118; y++) for (let x = 90; x <= 110; x++) {
    if (isSolid(get(x, y))) set(x, y, T.GRASS);
  }
  for (let y = 106; y <= 114; y++) for (let x = 94; x <= 106; x++) set(x, y, T.PATH);
  // fence ring with gaps at the four road exits
  for (let x = 90; x <= 110; x++) {
    if (Math.abs(x - 100) > 1) { set(x, 102, T.FENCE); set(x, 118, T.FENCE); }
    else { set(x, 102, T.PATH); set(x, 118, T.PATH); }
  }
  for (let y = 102; y <= 118; y++) {
    if (Math.abs(y - 110) > 1) { set(90, y, T.FENCE); set(110, y, T.FENCE); }
    else { set(90, y, T.PATH); set(110, y, T.PATH); }
  }
  // houses (roof top rows + wall bottom rows)
  const house = (hx, hy) => {
    for (let x = hx; x < hx + 4; x++) { set(x, hy, T.ROOF); set(x, hy + 1, T.ROOF); set(x, hy + 2, T.WALL); }
  };
  house(92, 104); house(105, 104); house(92, 113); house(104, 113);

  // --- The Crucible: a stone colosseum a short walk out the east gate ---
  {
    const [ax, ay] = LM.arenaGate;
    blob(ax, ay, 5.4, (x, y) => set(x, y, T.SAND));           // sandy floor
    for (let a = 0; a < 96; a++) {                            // stone stands ringing it
      const ang = (a / 96) * Math.PI * 2;
      for (const rr of [5.6, 6.4]) {
        const x = Math.round(ax + Math.cos(ang) * rr), y = Math.round(ay + Math.sin(ang) * rr);
        // leave a gate on the west side, facing the village
        if (Math.cos(ang) < -0.72) continue;
        if (inB(x, y)) set(x, y, T.WALL);
      }
    }
    for (let dy = -1; dy <= 1; dy++) set(ax - 6, ay + dy, T.SAND);   // entry tunnel
    for (let dy = -1; dy <= 1; dy++) set(ax - 5, ay + dy, T.SAND);
    set(ax, ay, T.STAIRS);
  }

  // --- dungeon entrances ---
  const clearing = (cx, cy, rad, ground, ring) => {
    blob(cx, cy, rad, (x, y) => set(x, y, ground));
    blob(cx, cy, rad + 1.6, (x, y) => { if (dist(x, y, cx, cy) > rad - 0.5 && get(x, y) === ground) return; });
    // ring of solids just outside the clearing (with a gap toward the road, carved after)
    for (let a = 0; a < 40; a++) {
      const ang = (a / 40) * Math.PI * 2;
      const x = Math.round(cx + Math.cos(ang) * (rad + 1)), y = Math.round(cy + Math.sin(ang) * (rad + 1));
      if (inB(x, y) && get(x, y) !== T.PATH && get(x, y) !== T.BRIDGE) set(x, y, ring);
    }
  };
  clearing(...LM.fireGate, 4, T.ASH, T.BASALT);
  clearing(...LM.airGate, 4, T.PATH, T.MESA);
  clearing(...LM.earthGate, 4, T.DARKGRASS, T.PINE);
  // water dungeon sits on the island; nexus inside the confluence
  clearing(...LM.nexusGate, 4, T.STORMGRASS, T.STORMROCK);
  // re-carve final approaches so rings have gaps
  carve(172, 31, ...LM.fireGate);
  carve(26, 37, ...LM.airGate);
  carve(34, 170, ...LM.earthGate);
  carve(100, 17, ...LM.nexusGate);
  for (const key of ['fireGate', 'waterGate', 'airGate', 'earthGate', 'nexusGate']) {
    const [x, y] = LM[key];
    set(x, y, T.STAIRS);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]])
      if (isSolid(get(x + dx, y + dy)) || props(get(x + dx, y + dy)).deep) set(x + dx, y + dy, key === 'waterGate' ? T.SAND : key === 'fireGate' ? T.ASH : key === 'nexusGate' ? T.STORMGRASS : key === 'airGate' ? T.PATH : T.DARKGRASS);
  }

  // --- confluence wall + gate gap ---
  for (let x = 76; x <= 124; x++) for (let y = 44; y <= 45; y++) {
    if (Math.abs(x - 100) > 1) set(x, y, T.CLIFF);
    else set(x, y, T.PATH);
  }
  for (let y = 0; y <= 45; y++) { set(76, y, T.CLIFF); set(77, y, T.CLIFF); set(123, y, T.CLIFF); set(124, y, T.CLIFF); }

  // --- burrow glade (start) ---
  blob(...LM.start, 4, (x, y) => set(x, y, T.GRASS));
  for (let a = 0; a < 30; a++) {
    const ang = (a / 30) * Math.PI * 2;
    const x = Math.round(LM.start[0] + Math.cos(ang) * 5), y = Math.round(LM.start[1] + Math.sin(ang) * 5);
    if (inB(x, y) && get(x, y) !== T.PATH) set(x, y, r() < 0.7 ? T.TREE : T.TALLGRASS);
  }
  carve(100, 148, 100, 146); // ensure exit north

  // --- map border ---
  for (let x = 0; x < W; x++) for (let d = 0; d < 2; d++) { set(x, d, T.CLIFF); set(x, H - 1 - d, T.CLIFF); }
  for (let y = 0; y < H; y++) for (let d = 0; d < 2; d++) { set(d, y, T.CLIFF); set(W - 1 - d, y, T.CLIFF); }

  // --- props ---
  const propList = [
    { kind: 'chest', tx: 100, ty: 150, id: 'ow_sword', contents: { sword: 1 }, msg: "You found Dad's old SWORD!|Press SPACE / J to slash.|Cut tall grass for goodies." },
    { kind: 'sign', tx: 102, ty: 151, text: "Gus's Burrow.|The path north leads to Billabong Village." },
    { kind: 'sign', tx: 102, ty: 120, text: 'Billabong Village.|All are welcome (predators excepted).' },
    { kind: 'statue', tx: 100, ty: 108, id: 'statue' },
    { kind: 'npc', tx: 97, ty: 108, sprite: 'elder', name: 'Elder Mirri', dialog: 'elder' },
    { kind: 'npc', tx: 104, ty: 107, sprite: 'wombat', name: 'Wombeau', dialog: 'shop' },
    // Keep landmarks out of the house footprints (x92-95 / x104-108 at y104-106 and y113-115).
    // Sprites are bottom-anchored, so a roof on the tile *below* visually swallows them.
    { kind: 'shrine', tx: 97, ty: 112 },
    { kind: 'chest', tx: 102, ty: 112, id: 'ow_bow', contents: { bow: 1 }, msg: 'You got the RANGER BOW!|Press K / X to shoot arrows.|Q / R swaps arrow types.' },
    { kind: 'npc', tx: 95, ty: 108, sprite: 'villager', name: 'Pip', dialog: 'pip' },
    { kind: 'npc', tx: 106, ty: 111, sprite: 'villager', name: 'Marlo', dialog: 'marlo' },
    { kind: 'sign', tx: 100, ty: 100, text: 'N: The Confluence.|Sealed by the Great Gate. Four Key Shards required.' },
    { kind: 'sign', tx: 112, ty: 109, text: 'E, then N: Cinderscale Wastes.|Home of the Molten Maw. Bring courage.' },
    { kind: 'sign', tx: 112, ty: 113, text: 'SE: Mistfall Lagoon.|The Sunken Grotto lies on the island. Platypuses can swim!' },
    { kind: 'sign', tx: 88, ty: 109, text: 'W, then N: Skyreach Bluffs.|The Tempest Spire pierces the clouds.' },
    { kind: 'sign', tx: 88, ty: 113, text: 'SW: Rootdeep Forest.|The Barrow swallows the unwary.' },
    { kind: 'dungeon', tx: LM.arenaGate[0], ty: LM.arenaGate[1], id: 'arena' },
    // on the arena sand, clear of the two directional signs by the east gate
    { kind: 'sign', tx: 115, ty: 107, text: 'THE CRUCIBLE.|Survive the waves. Coin and diamonds|to those still standing.' },
    // sits in the wall opening itself (rows 44-45), not floating north of it
    { kind: 'gate', tx: 100, ty: 44, id: 'gate' },
    { kind: 'dungeon', tx: LM.fireGate[0], ty: LM.fireGate[1], id: 'fire' },
    { kind: 'dungeon', tx: LM.waterGate[0], ty: LM.waterGate[1], id: 'water' },
    { kind: 'dungeon', tx: LM.airGate[0], ty: LM.airGate[1], id: 'air' },
    { kind: 'dungeon', tx: LM.earthGate[0], ty: LM.earthGate[1], id: 'earth' },
    { kind: 'dungeon', tx: LM.nexusGate[0], ty: LM.nexusGate[1], id: 'nexus' },
    { kind: 'sign', tx: 174, ty: 29, text: 'The Molten Maw.|Turn back, soft-billed one.' },
    { kind: 'sign', tx: 166, ty: 179, text: 'The Sunken Grotto.|The Leviathan hungers.' },
    { kind: 'sign', tx: 28, ty: 27, text: 'The Tempest Spire.|The winds bow to Galestrike.' },
    { kind: 'sign', tx: 32, ty: 175, text: 'The Rootdeep Barrow.|The King Below is listening.' },
  ];
  // --- warded approaches: a sealed ring around each elemental dungeon with one gated
  // doorway, and a puzzle courtyard on the road outside it. The ring is what actually
  // gates; the courtyard is just where the puzzle lives.
  const puzzles = [];
  const ward = (cfg) => {
    const [cx, cy] = cfg.gate, R = 7;
    const [fx, fy] = cfg.dir;              // points from the dungeon out toward the road
    const [rx, ry] = [-fy, fx];            // perpendicular
    const at = (fwd, side) => [cx + fx * fwd + rx * side, cy + fy * fwd + ry * side];

    // clear the interior so the walk from doorway to stairs is open
    blob(cx, cy, R - 1, (x, y) => { if (isSolid(get(x, y)) || props(get(x, y)).deep) set(x, y, cfg.ground); });
    // two-tile-thick ring, with a gap left where the doorway goes
    const openAng = Math.atan2(fy, fx);
    for (let a = 0; a < 320; a++) {
      const ang = (a / 320) * Math.PI * 2;
      const off = Math.abs(((ang - openAng + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (off < 0.24) continue;
      for (const rr of [R, R + 1]) {
        const x = Math.round(cx + Math.cos(ang) * rr), y = Math.round(cy + Math.sin(ang) * rr);
        if (inB(x, y)) set(x, y, cfg.wall);
      }
    }
    // doorway: sealed until the puzzle is solved
    const doors = [];
    for (let side = -1; side <= 1; side++) {
      for (const d of [R, R + 1]) {
        const [x, y] = at(d, side);
        set(x, y, T.DOOR_SHUT);
        doors.push([x, y]);
      }
    }
    // approach lane and courtyard floor
    for (let d = R + 2; d <= R + 10; d++) for (let side = -2; side <= 2; side++) {
      const [x, y] = at(d, side);
      if (inB(x, y)) set(x, y, cfg.ground);
    }
    const els = cfg.build(at, cfg);
    puzzles.push({ id: cfg.id, kind: cfg.kind, doors, ground: cfg.ground, limit: cfg.limit, ...els });
  };

  ward({
    id: 'fire', gate: LM.fireGate, dir: [0, 1], ground: T.ASH, wall: T.BASALT, kind: 'timed', limit: 6,
    build: (at) => {
      const eyes = [[10, -3], [12, 0], [10, 3]].map(([f, s]) => at(f, s));
      eyes.forEach(([x, y]) => set(x, y, T.EYE));
      propList.push({ kind: 'sign', tx: at(13, -3)[0], ty: at(13, -3)[1],
        text: 'THE EMBER LOCKS.|Three eyes, one breath. Light them all|before the first burns out.' });
      return { eyes };
    },
  });
  ward({
    id: 'air', gate: LM.airGate, dir: [0, 1], ground: T.PATH, wall: T.MESA, kind: 'sequence',
    build: (at) => {
      // ordered left-to-right on the ground, but the sign names the order to shoot
      const eyes = [[10, -3], [10, -1], [10, 1], [10, 3]].map(([f, s]) => at(f, s));
      eyes.forEach(([x, y]) => set(x, y, T.EYE));
      propList.push({ kind: 'sign', tx: at(13, -4)[0], ty: at(13, -4)[1],
        text: 'THE WINDWARD SEALS.|The gale reads right to left,|then the two it skipped. 4-2-3-1.' });
      return { eyes, order: [3, 1, 2, 0], step: 0 };
    },
  });
  ward({
    id: 'earth', gate: LM.earthGate, dir: [1, 0], ground: T.DARKGRASS, wall: T.PINE, kind: 'blocks',
    build: (at) => {
      const plates = [[9, -2], [9, 2]].map(([f, s]) => at(f, s));
      plates.forEach(([x, y]) => set(x, y, T.PLATE));
      const blocks = [[12, -2], [12, 2]].map(([f, s]) => at(f, s));
      blocks.forEach(([x, y]) => propList.push({ kind: 'block', tx: x, ty: y }));
      propList.push({ kind: 'sign', tx: at(13, 0)[0], ty: at(13, 0)[1],
        text: 'THE ROOT WARDENS.|The old stones must sit on the old|marks. Push them home.' });
      return { plates, blocks };
    },
  });
  ward({
    id: 'water', gate: LM.waterGate, dir: [-1, 0], ground: T.SAND, wall: T.ROCK, kind: 'killall',
    build: (at) => {
      const spawns = [[10, -3], [11, 0], [10, 3], [13, -1]].map(([f, s]) => at(f, s));
      propList.push({ kind: 'sign', tx: at(9, 3)[0], ty: at(9, 3)[1],
        text: 'THE TIDE WARDENS.|Guardians wake for those who|would pass. Best them all.' });
      return { spawns, types: ['snapshell', 'rakali', 'snapshell', 'adder'], armed: false, trigger: at(11, 0) };
    },
  });

  // --- friendly dolphins: snapped to genuine deep water near each wish spot, since the
  // lagoon and river are generated with noise and a hardcoded tile may land on sand ---
  const DOLPHINS = [
    [162, 168, 'Bindi'], [172, 174, 'Splash'], [158, 180, 'Echo'],
    [168, 164, 'Nari'], [131, 120, 'Coorong'], [120, 90, 'Bubbles'],
  ];
  DOLPHINS.forEach(([nx, ny, name], i) => {
    let best = null, bestD = Infinity;
    for (let y = ny - 12; y <= ny + 12; y++) for (let x = nx - 12; x <= nx + 12; x++) {
      if (!inB(x, y) || get(x, y) !== T.DEEP) continue;
      const d = dist(x, y, nx, ny);
      if (d < bestD) { bestD = d; best = [x, y]; }
    }
    if (best) propList.push({ kind: 'dolphin', tx: best[0], ty: best[1], name, line: i });
  });

  // scattered treasure chests (some walled behind cracked rocks = bomb arrows)
  const chestSpots = [
    [70, 60, { coins: 60 }, false], [130, 130, { coins: 80 }, false], [58, 120, { ammo: 15 }, false],
    [150, 100, { diamonds: 2 }, false], [60, 30, { coins: 120 }, true], [176, 60, { diamonds: 3 }, true],
    [40, 140, { coins: 100 }, true], [150, 190, { diamonds: 3 }, true], [104, 8, { diamonds: 4 }, false],
    [20, 100, { coins: 90 }, false], [180, 110, { ammo: 20 }, false], [96, 70, { coins: 50 }, false],
  ];
  chestSpots.forEach(([cx, cy, contents, walled], i) => {
    blob(cx, cy, 1.6, (x, y) => set(x, y, reg(cx, cy) === REGION.FIRE ? T.ASH : reg(cx, cy) === REGION.WATER ? T.SAND : reg(cx, cy) === REGION.AIR ? T.PATH : reg(cx, cy) === REGION.CONFLUENCE ? T.STORMGRASS : T.GRASS));
    if (walled) {
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]])
        set(cx + dx, cy + dy, T.CRACKROCK);
    }
    propList.push({ kind: 'chest', tx: cx, ty: cy, id: 'owc' + i, contents });
  });

  // --- enemy spawners ---
  const rSp = rng(WORLD_SEED + 3);
  const spawners = [];
  const TABLES = {
    [REGION.MARSH]: ['rakali', 'rakali', 'adder'],
    [REGION.FIRE]: ['snapjaw', 'emberfox', 'mgoanna', 'kooka'],
    [REGION.WATER]: ['snapshell', 'snapshell', 'kooka'],
    [REGION.AIR]: ['talon', 'talon', 'owl', 'kooka'],
    [REGION.EARTH]: ['dingo', 'wildcat', 'python', 'tazzy'],
    [REGION.CONFLUENCE]: ['gknight', 'owl', 'tazzy'],
  };
  const COUNTS = { [REGION.MARSH]: 30, [REGION.FIRE]: 40, [REGION.WATER]: 26, [REGION.AIR]: 38, [REGION.EARTH]: 40, [REGION.CONFLUENCE]: 20 };
  const tooClose = (x, y) =>
    (Math.abs(x - 100) < 16 && Math.abs(y - 110) < 12) ||        // village
    dist(x, y, ...LM.start) < 15 ||
    // keep wandering enemies out of the puzzle courtyards and the arena grounds
    ['fireGate', 'waterGate', 'airGate', 'earthGate', 'nexusGate'].some(k => dist(x, y, ...LM[k]) < 19) ||
    dist(x, y, ...LM.arenaGate) < 9 ||
    spawners.some(s => dist(x, y, s.tx, s.ty) < 4);
  for (const [rgKey, count] of Object.entries(COUNTS)) {
    const rgId = Number(rgKey);
    let placed = 0, tries = 0;
    while (placed < count && tries++ < 4000) {
      const x = irand(rSp, 3, W - 4), y = irand(rSp, 3, H - 4);
      if (reg(x, y) !== rgId || tooClose(x, y)) continue;
      const t = get(x, y), p = props(t);
      if (isSolid(t) || p.lava || p.dmg || t === T.PATH || t === T.BRIDGE || t === T.STAIRS) continue;
      if (p.deep || p.water) continue;
      spawners.push({ tx: x, ty: y, x: x * TILE + 8, y: y * TILE + 8, type: choose(rSp, TABLES[rgId]) });
      placed++;
    }
  }
  // aquatic spawners in the lagoon and river
  let placedW = 0, triesW = 0;
  while (placedW < 14 && triesW++ < 3000) {
    const x = irand(rSp, 3, W - 4), y = irand(rSp, 3, H - 4);
    const t = get(x, y);
    if (t !== T.DEEP || tooClose(x, y)) continue;
    spawners.push({ tx: x, ty: y, x: x * TILE + 8, y: y * TILE + 8, type: choose(rSp, ['volteel', 'cod']) });
    placedW++;
  }

  return {
    id: 'overworld', type: 'overworld', theme: 'ow',
    w: W, h: H, tiles, region,
    get, set, regionAt: reg,
    spawners, props: propList, puzzles,
    playerStart: { x: LM.start[0] * TILE + 8, y: (LM.start[1] + 2) * TILE + 8 },
  };
}
