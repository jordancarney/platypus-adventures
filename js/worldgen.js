// Deterministic overworld builder: 200x200 tiles, 5 elemental regions around a central hub.
import { WORLD_W as W, WORLD_H as H, WORLD_SEED, TILE } from './config.js';
import { rng, irand, choose, clamp, dist } from './util.js';
import { T, isSolid, props } from './tiles.js';
import { HOUSES } from './houses.js';

// GOO is the Goo Lands, a separate area past the Great Chasm (endgame.js), never part of the Vale
export const REGION = { MARSH: 0, FIRE: 1, WATER: 2, AIR: 3, EARTH: 4, CONFLUENCE: 5, VILLAGE: 6, GOO: 7 };
export const REGION_KEYS = ['marsh', 'fire', 'water', 'air', 'earth', 'confluence', 'village', 'goo'];

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
  // houses (roof top rows + wall bottom rows). Each front wall gets a window at either end
  // and a door wherever houses.js says that house's door is; the shop hangs its signboard.
  const house = (hx, hy, id, shop = false) => {
    for (let x = hx; x < hx + 4; x++) { set(x, hy, T.ROOF); set(x, hy + 1, T.ROOF); set(x, hy + 2, T.WALL); }
    set(hx, hy + 2, shop ? T.SHOPWALL : T.WINDOW); set(hx + 3, hy + 2, T.WINDOW);
    set(...HOUSES[id].door, T.HDOOR);
  };
  house(92, 104, 'pip'); house(105, 104, 'shop', true); house(92, 113, 'tully'); house(104, 113, 'marlo');

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
    // Wombeau keeps shop indoors now (houses.js); his board stands where he used to
    { kind: 'sign', tx: 104, ty: 107, text: "WOMBEAU'S TRADING POST.|Upgrades, arrows and snacks. Come on in!" },
    { kind: 'sign', tx: 91, ty: 107, text: "PIP & DOT'S HOUSE.|Please knock. Dot will answer. Dot answers EVERYTHING." },
    { kind: 'sign', tx: 96, ty: 116, text: "TULLY'S CURIO HUT.|Curious things and curiouser stories." },
    { kind: 'sign', tx: 108, ty: 116, text: "MARLO'S HOUSE.|Gone fishing. (Not really. Come in!)" },
    ...['pip', 'shop', 'tully', 'marlo'].map(id => ({ kind: 'house', id, tx: HOUSES[id].door[0], ty: HOUSES[id].door[1] })),
    // Keep landmarks out of the house footprints (x92-95 / x104-108 at y104-106 and y113-115).
    // Sprites are bottom-anchored, so a roof on the tile *below* visually swallows them.
    { kind: 'shrine', tx: 97, ty: 112 },
    { kind: 'chest', tx: 102, ty: 112, id: 'ow_bow', contents: { bow: 1 }, msg: 'You got the RANGER BOW!|Press K / X to shoot arrows.|Q / R swaps arrow types.' },
    { kind: 'npc', tx: 95, ty: 108, sprite: 'villager', name: 'Pip', dialog: 'pip' },
    { kind: 'npc', tx: 106, ty: 111, sprite: 'villager', name: 'Marlo', dialog: 'marlo', quest: 'marlo_ring' },
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

  // --- side quest: Barnaby, cornered by predators out in the marsh. No door, no ward --
  // just a villager who needs the pack cleared before he'll stop cowering. ---
  const BARNABY_SPOT = [65, 96];
  blob(...BARNABY_SPOT, 4, (x, y) => { if (reg(x, y) === REGION.MARSH) set(x, y, T.GRASS); });
  propList.push({ kind: 'npc', tx: BARNABY_SPOT[0], ty: BARNABY_SPOT[1], sprite: 'villager',
    name: 'Barnaby', dialog: 'barnaby', quest: 'barnaby_rescue' });
  puzzles.push({
    id: 'barnaby_rescue', kind: 'killall', quest: 'barnaby_rescue', doors: [], ground: T.GRASS,
    trigger: BARNABY_SPOT, spawns: [[61, 93], [69, 93], [65, 100]], types: ['rakali', 'rakali', 'adder'], armed: false,
  });

  // --- side quest: Fenwick, out at the map's northeast edge in the Cinderscale Wastes --
  // the same cornered-villager setup as Barnaby, but TEN Fire-tier predators deep, not
  // three marsh ones. Reaching him at all means crossing hostile ground alone. ---
  const FENWICK_SPOT = [188, 14];
  blob(...FENWICK_SPOT, 8, (x, y) => { if (reg(x, y) === REGION.FIRE) set(x, y, T.ASH); });
  propList.push({ kind: 'npc', tx: FENWICK_SPOT[0], ty: FENWICK_SPOT[1], sprite: 'villager',
    name: 'Fenwick', dialog: 'fenwick', quest: 'fenwick_rescue' });
  puzzles.push({
    id: 'fenwick_rescue', kind: 'killall', quest: 'fenwick_rescue', doors: [], ground: T.ASH,
    trigger: FENWICK_SPOT,
    spawns: [[184, 11], [192, 11], [184, 17], [192, 17], [188, 9], [188, 19], [182, 14], [194, 14], [185, 10], [191, 18]],
    types: ['snapjaw', 'emberfox', 'mgoanna', 'snapjaw', 'emberfox', 'mgoanna', 'snapjaw', 'emberfox', 'mgoanna', 'emberfox'],
    armed: false,
  });

  // --- side quest: Yuma, at the northwest edge in the Skyreach Bluffs. Her grandmother's
  // wind chime blew out toward the cliff edge and is sealed under rockfall -- same bomb
  // arrow as Marlo's ring, but far more remote, with a nest of talons and an owl guarding
  // the rockfall itself: getting the chime open safely means clearing them first. ---
  const YUMA_SPOT = [14, 10];
  blob(...YUMA_SPOT, 4, (x, y) => { if (reg(x, y) === REGION.AIR) set(x, y, T.PATH); });
  propList.push({ kind: 'npc', tx: YUMA_SPOT[0], ty: YUMA_SPOT[1], sprite: 'villager',
    name: 'Yuma', dialog: 'yuma', quest: 'yuma_chime' });
  const YUMA_ITEM_SPOT = [8, 8];
  blob(...YUMA_ITEM_SPOT, 6, (x, y) => { if (reg(x, y) === REGION.AIR) set(x, y, T.PATH); });
  puzzles.push({
    id: 'yuma_guard', kind: 'killall', doors: [], ground: T.PATH,
    trigger: YUMA_ITEM_SPOT, spawns: [[5, 5], [11, 5], [8, 12]], types: ['talon', 'owl', 'talon'], armed: false,
    armToast: 'The nest wakes!',
    solvedBanner: { title: 'THE NEST CLEARS!', sub: 'The talons scatter on the wind.', color: '#e8f0ff' },
  });

  // --- friendly dolphins: snapped to genuine deep water near each wish spot, since the
  // lagoon and river are generated with noise and a hardcoded tile may land on sand ---
  const DOLPHINS = [
    [162, 168, 'Bindi'], [172, 174, 'Splash'], [158, 180, 'Echo'],
    [168, 164, 'Nari'], [131, 120, 'Coorong'], [120, 90, 'Bubbles', 'bubbles_shell'],
  ];
  DOLPHINS.forEach(([nx, ny, name, quest], i) => {
    let best = null, bestD = Infinity;
    for (let y = ny - 12; y <= ny + 12; y++) for (let x = nx - 12; x <= nx + 12; x++) {
      if (!inB(x, y) || get(x, y) !== T.DEEP) continue;
      const d = dist(x, y, nx, ny);
      if (d < bestD) { bestD = d; best = [x, y]; }
    }
    if (best) propList.push({ kind: 'dolphin', tx: best[0], ty: best[1], name, line: i, quest });
  });

  // --- side quest items: fetch trinkets. Bubbles' shell washed well north of her own
  // pond, up the river toward the Confluence, so finding it actually means a swim rather
  // than just a step off the porch; Marlo's ring is sealed under rubble in the Earth reaches. ---
  {
    let best = null, bestD = Infinity;
    for (let y = 46; y <= 78; y++) for (let x = 116; x <= 150; x++) {
      if (!inB(x, y) || get(x, y) !== T.DEEP) continue;
      const d = dist(x, y, 132, 58);
      if (d < bestD) { bestD = d; best = [x, y]; }
    }
    if (best) propList.push({ kind: 'trinket', tx: best[0], ty: best[1],
      id: 'sqitem_bubbles_shell', sprite: 'shell', quest: 'bubbles_shell' });
  }
  {
    const [rx, ry] = [50, 145];
    blob(rx, ry, 1.6, (x, y) => { if (reg(x, y) === REGION.EARTH) set(x, y, T.DARKGRASS); });
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]])
      set(rx + dx, ry + dy, T.CRACKROCK);
    propList.push({ kind: 'trinket', tx: rx, ty: ry, id: 'sqitem_marlo_ring', sprite: 'ring', quest: 'marlo_ring' });
  }
  {
    const [cx2, cy2] = YUMA_ITEM_SPOT;
    blob(cx2, cy2, 1.6, (x, y) => { if (reg(x, y) === REGION.AIR) set(x, y, T.PATH); });
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]])
      set(cx2 + dx, cy2 + dy, T.CRACKROCK);
    propList.push({ kind: 'trinket', tx: cx2, ty: cy2, id: 'sqitem_yuma_chime', sprite: 'chime', quest: 'yuma_chime' });
  }

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

  // --- puggles: fifty baby platypuses hidden across the Vale. Some sit in plain sight in
  // out-of-the-way corners, some hide under tall grass, reeds, cracked rock or crystal,
  // some paddle out in deep water, and some only come out once a small puzzle is solved
  // (see DESIGN.md). Built last, from fixed shapes with no rng draws, so nothing generated
  // above shifts. The number in each id is a save key: never renumber, only add.
  const GROUND = [T.GRASS, T.ASH, T.SAND, T.PATH, T.DARKGRASS, T.STORMGRASS, T.GRASS];
  const groundAt = (x, y) => GROUND[reg(x, y)];
  const CLEARABLE = new Set([T.TREE, T.PINE, T.PALM, T.ROCK, T.BASALT, T.MESA, T.CRACKROCK, T.CRYSTAL,
    T.STORMROCK, T.DEADTREE, T.TALLGRASS, T.MUD, T.THORNS]);
  const RING8 = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  const disc = (cx, cy, rad, fn) => {
    const R = Math.ceil(rad);
    for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++)
      if (inB(x, y) && dist(x, y, cx, cy) <= rad) fn(x, y);
  };
  const clearAround = (cx, cy, rad) =>
    disc(cx, cy, rad, (x, y) => { if (CLEARABLE.has(get(x, y))) set(x, y, groundAt(x, y)); });
  const openGround = (x, y) => { const t = get(x, y), p = props(t); return !p.solid && !p.water && !p.deep && !p.lava && t !== T.PATH && t !== T.BRIDGE; };
  const puggle = (n, tx, ty, extra = {}) => propList.push({ kind: 'puggle', id: 'puggle_' + n, tx, ty, ...extra });
  const nearest = (nx, ny, ok) => {
    let best = null, bestD = Infinity;
    for (let y = ny - 12; y <= ny + 12; y++) for (let x = nx - 12; x <= nx + 12; x++) {
      if (!inB(x, y) || !ok(get(x, y))) continue;
      const d = dist(x, y, nx, ny);
      if (d < bestD) { bestD = d; best = [x, y]; }
    }
    return best;
  };

  // The hiding-spot shapes below take an optional `put` for what gets hidden -- a puggle by
  // default, or a keepsake (see the end of this section).
  // plain sight, if you go looking: a pocket of `wall` open on one side
  const nook = (n, cx, cy, [ox, oy], wall, floor = null, put = puggle) => {
    clearAround(cx, cy, 2.5);
    for (const [dx, dy] of RING8) if (!((ox && dx === ox) || (oy && dy === oy))) set(cx + dx, cy + dy, wall);
    if (floor !== null) set(cx, cy, floor);
    put(n, cx, cy);
  };
  const glade = (n, cx, cy) => { clearAround(cx, cy, 1.5); puggle(n, cx, cy); };
  // under a lone tuft of tall grass -- the odd one out wherever grass doesn't grow
  const tuft = (n, x, y, put = puggle) => { set(x, y, T.TALLGRASS); put(n, x, y); };
  // under one tuft of a whole patch
  const patch = (n, cx, cy, [px, py], put = puggle) => {
    clearAround(cx, cy, 2.2);
    disc(cx, cy, 2.2, (x, y) => { if (openGround(x, y)) set(x, y, T.TALLGRASS); });
    tuft(n, cx + px, cy + py, put);
  };
  // a ring of flowers around a single tuft
  const flowerRing = (n, cx, cy) => {
    clearAround(cx, cy, 2.6);
    disc(cx, cy, 2.3, (x, y) => { if (dist(x, y, cx, cy) >= 1.5 && openGround(x, y)) set(x, y, T.FLOWER); });
    disc(cx, cy, 1.2, (x, y) => set(x, y, T.GRASS));
    tuft(n, cx, cy);
  };
  // among the reeds at a pond's edge
  const reeds = (n, nx, ny, put = puggle) => {
    const at = nearest(nx, ny, t => t === T.SHALLOW || t === T.REED);
    if (!at) return;
    set(at[0], at[1], T.REED);
    put(n, at[0], at[1]);
  };
  // curled up under a cracked boulder or a crystal -- a bomb arrow's job
  const boulder = (n, x, y, rock = T.CRACKROCK, put = puggle) => { clearAround(x, y, 1.5); set(x, y, rock); put(n, x, y); };
  // in plain view but sealed in by cracked rock
  const walled = (n, cx, cy, put = puggle) => {
    clearAround(cx, cy, 2.6);
    for (const [dx, dy] of RING8) set(cx + dx, cy + dy, T.CRACKROCK);
    put(n, cx, cy);
  };
  // paddling in deep water, snapped to a genuine deep tile (water edges are noisy)
  const swimmer = (n, nx, ny, put = puggle) => { const at = nearest(nx, ny, t => t === T.DEEP); if (at) put(n, at[0], at[1]); };
  // a speck of island out in deep water, one palm for shade
  const islet = (n, cx, cy, put = puggle) => {
    disc(cx, cy, 1.2, (x, y) => set(x, y, T.SAND));
    set(cx + 1, cy - 1, T.PALM);
    put(n, cx, cy);
  };

  // --- puzzle puggles: each is a `puzzles` entry with a `puggle` field instead of doors,
  // and the puggle stays hidden until its puzzle is solved ---
  const puzzlePuggle = (n, pop, cfg) => {
    const id = 'puggle_' + n;
    puzzles.push({ id, doors: [], ground: T.GRASS, puggle: id, ...cfg });
    puggle(n, pop[0], pop[1], { puzzle: id });
  };
  // push the stone(s) into the hollow(s)
  const stones = (n, pairs, pop, [cx, cy, rad], pz = puzzlePuggle) => {
    clearAround(cx, cy, rad);
    const plates = [], blocks = [];
    for (const [[px, py], [bx, by]] of pairs) {
      set(px, py, T.PLATE); plates.push([px, py]);
      propList.push({ kind: 'block', tx: bx, ty: by }); blocks.push([bx, by]);
    }
    pz(n, pop, { kind: 'blocks', plates, blocks });
  };
  // strike the eye(s) with an arrow or a sword beam; more than one must all be lit in time
  const eyes = (n, list, pop, limit, [cx, cy, rad]) => {
    clearAround(cx, cy, rad);
    list.forEach(([x, y]) => set(x, y, T.EYE));
    puzzlePuggle(n, pop, list.length > 1
      ? { kind: 'timed', eyes: list, limit, resetToast: 'The eyes close. Try again, quicker!' }
      : { kind: 'sequence', eyes: list, order: [0], step: 0 });
  };
  // a pack of predators standing guard; clear them and the puggle comes out
  const nest = (n, [tx, ty], types, pz = puzzlePuggle, armToast = 'Predators are guarding a puggle!') => {
    clearAround(tx, ty, 4);
    const spawns = [[-3, -2], [3, -2], [0, 3], [-3, 2], [3, 2]].slice(0, types.length).map(([dx, dy]) => [tx + dx, ty + dy]);
    pz(n, [tx, ty], { kind: 'killall', trigger: [tx, ty], spawns, types, armed: false, armToast });
  };
  // a dash: step on the plate, then reach the glowing ring before time runs out
  const race = (n, start, goal, limit, sign) => {
    const [sx, sy] = start, [gx, gy] = goal;
    const len = Math.max(Math.abs(gx - sx), Math.abs(gy - sy));
    for (let i = 0; i <= len; i++) clearAround(sx + Math.sign(gx - sx) * i, sy + Math.sign(gy - sy) * i, 1.5);
    set(sx, sy, T.PLATE);
    propList.push({ kind: 'sign', tx: sign[0], ty: sign[1],
      text: 'PUGGLE DASH!|Step on the plate, then race to the glowing ring before the time runs out. Sprint!' });
    puzzlePuggle(n, goal, { kind: 'race', start, goal, limit });
  };

  // Mama Pearl's meadow, just outside the village's south gate on the burrow road. Her
  // cottage (stamped at the end of this section) sits in it, and every puggle found comes
  // home to play inside.
  const MEADOW = [95, 122];
  clearAround(...MEADOW, 4.5);
  disc(...MEADOW, 4.5, (x, y) => { if (openGround(x, y)) set(x, y, (x * 7 + y * 3) % 5 === 0 ? T.FLOWER : T.GRASS); });
  propList.push({ kind: 'sign', tx: 99, ty: 124, text: "PUGGLE MEADOW.|Mama Pearl's cottage. Every puggle Gus finds comes home to play inside!" });

  // Village and the burrow: three easy ones to learn the ropes
  puggle(0, 97, 153);                                // right beside Gus's burrow
  tuft(1, 93, 103);                                  // behind the northwest cottage
  puggle(2, 125, 111);                               // squeezed behind the Crucible, by the river

  // Willow Marsh
  patch(3, 78, 134, [1, 1]);
  flowerRing(4, 116, 138);
  reeds(5, 74, 90);
  swimmer(6, 118, 91);
  swimmer(7, 131, 78);
  nook(8, 162, 100, [1, 0], T.TREE);
  boulder(9, 112, 75);
  stones(10, [[[82, 72], [82, 74]]], [84, 72], [82, 73, 3]);
  race(11, [103, 96], [103, 66], 4.5, [104, 96]);
  nest(12, [82, 146], ['rakali', 'adder', 'rakali']);
  nook(13, 40, 112, [-1, 0], T.TREE);
  patch(14, 142, 122, [-1, 0]);

  // Cinderscale Wastes
  tuft(15, 144, 52);
  boulder(16, 192, 52);
  walled(17, 140, 9);
  eyes(18, [[182, 74], [186, 74], [190, 74]], [186, 77], 4, [186, 76, 5]);
  nest(19, [168, 70], ['snapjaw', 'emberfox', 'mgoanna']);
  {
    // an island in the middle of a lava lake, reached by a one-plank bridge
    const [lx, ly] = [160, 18];
    disc(lx, ly, 1.2, (x, y) => set(x, y, T.ASH));
    for (let y = ly + 2; get(lx, y) === T.LAVA; y++) set(lx, y, T.BRIDGE);
    puggle(20, lx, ly);
  }
  nook(21, 196, 40, [-1, 0], T.BASALT);
  swimmer(22, 130, 40);

  // Mistfall Lagoon
  swimmer(23, 180, 168);
  swimmer(24, 160, 187);
  swimmer(25, 132, 150);
  islet(26, 152, 166);
  tuft(27, 190, 128);
  boulder(28, 192, 192);
  stones(29, [[[122, 182], [124, 182]]], [122, 180], [123, 182, 3]);
  race(30, [142, 145], [170, 145], 4.2, [142, 144]);

  // Skyreach Bluffs
  {
    // an eye set in the face of a lone mesa, visible only from the south
    for (let y = 11; y <= 13; y++) for (let x = 48; x <= 52; x++) set(x, y, T.MESA);
    eyes(31, [[50, 13]], [50, 16], 0, [50, 16, 2.5]);
  }
  eyes(32, [[56, 46], [60, 42], [64, 46]], [60, 48], 4, [60, 45, 5]);
  boulder(33, 40, 50);
  walled(34, 66, 8);
  nook(35, 6, 52, [1, 0], T.MESA);
  tuft(36, 30, 64);
  nest(37, [14, 44], ['talon', 'owl', 'talon']);
  nook(38, 20, 78, [0, 1], T.MESA);

  // Rootdeep Forest
  patch(39, 62, 160, [-1, 1]);
  patch(40, 14, 124, [1, -1]);
  nook(41, 56, 186, [0, -1], T.PINE, T.TALLGRASS);
  boulder(42, 78, 192, T.CRYSTAL);
  stones(43, [[[20, 146], [20, 148]], [[24, 146], [24, 148]]], [22, 145], [22, 147, 4]);
  nest(44, [78, 176], ['dingo', 'dingo', 'wildcat']);
  glade(45, 5, 194);
  glade(46, 13, 172);

  // The Confluence, past the Great Gate
  set(84, 20, T.STORMGRASS);                         // a clear heart inside the thorns
  puggle(47, 84, 20);
  eyes(48, [[106, 36], [114, 36]], [110, 39], 3.5, [110, 38, 5]);
  boulder(49, 80, 42);

  // --- keepsakes: one-of-a-kind curios for the shelves of Gus's Burrow (KEEPSAKES in
  // config.js). Same hiding shapes as the puggles, one per spot, never two alike in a
  // region. The trophy and the drawing aren't placed: they're won, not found. Ids are save
  // keys, so a spot can move but an id can't change.
  const keep = (id, tx, ty, extra = {}) => propList.push({ kind: 'keepsake', id, tx, ty, ...extra });
  const puzzleKeep = (id, pop, cfg) => {
    puzzles.push({ id, doors: [], ground: T.GRASS, keepsake: id, ...cfg });
    keep(id, pop[0], pop[1], { puzzle: id });
  };
  reeds('ks_lure', 84, 124, keep);                               // the village pond's reeds
  patch('ks_stone', 44, 97, [-1, 1], keep);                      // west marsh, tall grass
  nook('ks_boomerang', 4, 98, [1, 0], T.TREE, null, keep);       // a tree ring at the west edge
  swimmer('ks_bottle', 128, 126, keep);                          // the river, above the bridge
  nook('ks_egg', 193, 63, [-1, 0], T.BASALT, null, keep);        // Cinderscale, far east
  walled('ks_opal', 158, 6, keep);                               // Cinderscale, north edge
  boulder('ks_arrowhead', 176, 82, T.CRACKROCK, keep);           // Cinderscale, south
  islet('ks_pearl', 170, 160, keep);                             // out in the lagoon
  nook('ks_seaglass', 190, 150, [-1, 0], T.PALM, null, keep);    // a palm grove on the east beach
  stones('ks_compass', [[[186, 135], [186, 137]]], [188, 135], [186, 136, 3], puzzleKeep);
  nook('ks_kite', 44, 72, [0, 1], T.MESA, null, keep);           // south bluffs
  walled('ks_meteor', 8, 32, keep);                              // west bluffs
  nest('ks_feather', [68, 56], ['talon', 'owl', 'talon'], puzzleKeep, 'Predators are guarding something shiny!');
  patch('ks_mushroom', 7, 158, [0, 1], keep);                    // Rootdeep, far west
  boulder('ks_amber', 30, 190, T.CRYSTAL, keep);                 // Rootdeep, south
  nook('ks_fossil', 64, 180, [1, 0], T.PINE, null, keep);        // Rootdeep, southeast
  set(110, 10, T.STORMGRASS);                                    // the heart of a thorn patch
  keep('ks_coin', 110, 10);
  boulder('ks_thunder', 120, 41, T.CRACKROCK, keep);             // just inside the Great Gate

  // --- buildings drawn as one big sprite over a solid footprint, each with a front door in
  // its bottom row: Gus's burrow in the start glade, Mama Pearl's cottage in her meadow ---
  const building = (id, sprite, x0, y0, w, h, extra = {}) => {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(x, y, T.BUILDING);
    const [dx, dy] = HOUSES[id].door;
    set(dx, dy, T.HDOOR);
    propList.push({ kind: 'building', sprite, tx: x0, ty: y0, w, h, ...extra });
    propList.push({ kind: 'house', id, tx: dx, ty: dy });
  };
  for (let x = 101; x <= 107; x++) if (CLEARABLE.has(get(x, 147))) set(x, 147, T.GRASS);
  disc(104, 152, 2.2, (x, y) => { if (CLEARABLE.has(get(x, y))) set(x, y, T.GRASS); });   // front yard
  building('gus', 'burrow_ext', 102, 148, 5, 3, { smoke: true });
  building('mama', 'cottage_ext', 93, 120, 5, 3, { marker: 'mama' });

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
    dist(x, y, ...BARNABY_SPOT) < 10 ||
    dist(x, y, ...FENWICK_SPOT) < 14 ||
    dist(x, y, ...YUMA_ITEM_SPOT) < 10 ||
    dist(x, y, ...MEADOW) < 8 ||
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
