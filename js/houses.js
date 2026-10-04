// House interiors: single-room areas Gus walks into through a front door in the overworld.
//
// Each is authored as an ASCII map plus a list of furniture, and built into an area with
// `type: 'house'`. The room is smaller than the screen, so the camera centers it and the
// rest of the view stays dark. Stepping onto the doormat ('X') walks back out the door.
//
// Map legend: '#' wall top (sides and front)   '^' back wall, upper   'w' back wall window
//   '=' back wall, lower   '.' floorboards   'r' rug   'X' doormat (the way out)
//
// Furniture: { sprite, tx, ty, w, h } in room tiles, solid across its w x h footprint. Tall
// pieces stand on their footprint and rise up over the wall behind them. `wall: true` hangs
// a piece on the back wall instead (not solid; `hang` lifts it off the tile's bottom edge).
// `text` is what Gus reads when he inspects it; `talk` hands the inspect to game.js
// (the shop counter, Tully's map, the keepsake plaque).

import { TILE, KEEPSAKES } from './config.js';
import { T } from './tiles.js';

const CH = { '#': T.HBEAM, '^': T.HWALL_UP, 'w': T.HWIN, '=': T.HWALL, '.': T.HFLOOR, 'r': T.RUG, 'X': T.EXIT };

// Where each house's front door is in the overworld (the HDOOR tile Gus walks into).
// worldgen.js stamps the doors from these, so the two can never disagree.
export const HOUSES = {
  gus: {
    name: "Gus's Burrow", theme: 'burrow', door: [104, 150],
    wake: [2, 4],   // a new game starts here, beside the bed
    map: [
      '#^^^^^^^^^^^^^^^^^^^^^#',
      '#=====================#',
      '#...........rrrrrrrrrr#',
      '#...........rrrrrrrrrr#',
      '#...........rrrrrrrrrr#',
      '#.rrrrrr....rrrrrrrrrr#',
      '#.rrrrrr....rrrrrrrrrr#',
      '#.rrrrrr....rrrrrrrrrr#',
      '#...........rrrrrrrrrr#',
      '#.....................#',
      '#.....................#',
      '###########X###########',
    ],
    furniture: (st) => [
      { sprite: 'bed', tx: 1, ty: 2, h: 2,
        text: "Gus's bed, still warm. Mum sewed the quilt -- every patch is a different river fish." },
      { sprite: 'portrait', tx: 2, ty: 1, wall: true, hang: 7,
        text: 'A picture of Mum and Dad, the River Guardians, by the billabong. The tiny bundle in Mum\'s arms is baby Gus!' },
      { sprite: 'heightchart', tx: 4, ty: 1, wall: true, hang: 2,
        text: "Height marks on the wall: 'GUS, age 3'... 'GUS, age 5'... 'GUS, age 7'. And way up high, one mark that just says 'DAD'." },
      { sprite: 'fireplace', tx: 5, ty: 2, w: 2, glow: '#ff9a3a',
        text: "A crackling fire. Crayfish never taste better than when they're toasted right here." },
      { sprite: 'clock', tx: 7, ty: 1, wall: true, hang: 8,
        text: "Tick... tock... It's always crayfish o'clock somewhere." },
      { sprite: 'swordrack', tx: 8, ty: 1, wall: true, hang: 8,
        text: st.sword > 0
          ? "Dad's sword rack. It's empty now -- the sword is off on an adventure with Gus!"
          : "Dad's sword rack, empty. Dad always kept his old sword in the chest by the front door..." },
      { sprite: 'bookshelf', tx: 9, ty: 2, w: 2,
        text: "Gus's books: 'Crayfish and How to Catch Them', 'Swim Like a Champion', 'Great Guardians of the Vale', and a very worn-out comic called 'Captain Bill'." },
      { sprite: 'basket', tx: 4, ty: 3,
        text: st.flags.parents_free
          ? "Mum's knitting basket. She's already started on a brand-new scarf for Gus -- in alien-goo green."
          : "Mum's knitting basket. There's still some teal yarn left -- the very same yarn as Gus's scarf." },
      { sprite: 'armchair', tx: 7, ty: 3,
        text: st.flags.parents_free
          ? "Dad's old armchair. After all this time, the Dad-shaped dent finally has its Dad back."
          : "Dad's old armchair. It still has a Dad-shaped dent in it." },
      { sprite: 'table', tx: 3, ty: 6, w: 2,
        text: 'Breakfast: three crayfish, a snail salad and a big mug of pond tea. Gus left in a hurry!' },
      { sprite: 'stool', tx: 2, ty: 6 },
      { sprite: 'stool', tx: 5, ty: 6 },
      { sprite: 'rod', tx: 1, ty: 9,
        text: "Gus's fishing rod. Once the Vale is safe again, he's going to catch the biggest fish EVER." },
      { sprite: 'plant', tx: 10, ty: 10, text: 'A potted river fern. Gus waters it every Tuesday.' },
      { sprite: 'plant', tx: 12, ty: 10, text: 'Another river fern. This one gets watered on Thursdays.' },
      { sprite: 'lamp', tx: 11, ty: 1, wall: true, hang: 10, glow: '#ffd88a' },
      { sprite: 'lamp', tx: 18, ty: 1, wall: true, hang: 10, glow: '#ffd88a' },
      { sprite: 'plaque', tx: 12, ty: 1, wall: true, hang: 9, talk: 'plaque' },
    ],
    // the keepsake gallery: twenty stands in rows on the big rug, lanes between them
    pedestals: () => KEEPSAKES.map((k, i) => ({ keepsake: k.id, tx: 13 + (i % 5) * 2, ty: 2 + Math.floor(i / 5) * 2 })),
    // once they're rescued, Mum and Dad are home whenever Gus is
    npcs: (st) => st.flags.parents_free ? [
      { sprite: 'dad_home', name: 'Dad', dialog: 'dad', tx: 8, ty: 4 },
      { sprite: 'mum_home', name: 'Mum', dialog: 'mum', tx: 5, ty: 4 },
    ] : [],
  },

  mama: {
    name: "Mama Pearl's Cottage", theme: 'cottage', door: [95, 122],
    brood: [10, 7],   // found puggles play in a spiral around this tile
    map: [
      '#^^^w^^^^^w^^^^^w^^^#',
      '#===================#',
      '#...................#',
      '#...................#',
      '#...................#',
      '#...rrrrrrrrrrrrr...#',
      '#...rrrrrrrrrrrrr...#',
      '#...rrrrrrrrrrrrr...#',
      '#...rrrrrrrrrrrrr...#',
      '#...rrrrrrrrrrrrr...#',
      '#...................#',
      '##########X##########',
    ],
    furniture: () => [
      { sprite: 'crib', tx: 1, ty: 2, text: 'A tiny crib. Nobody ever sleeps in it -- the puggles all pile into ONE bed instead.' },
      { sprite: 'crib', tx: 2, ty: 2, text: "Another tiny crib, full of stuffed crayfish toys." },
      { sprite: 'puggleportrait', tx: 7, ty: 1, wall: true, hang: 7,
        text: 'A family portrait: Mama Pearl and a WHOLE lot of puggles. The painter gave up counting halfway through.' },
      { sprite: 'rocker', tx: 12, ty: 3, text: "Mama's rocking chair. It creaks a lullaby all on its own." },
      { sprite: 'growthchart', tx: 13, ty: 1, wall: true, hang: 2,
        text: 'A growth chart covered in fifty teeny-tiny pencil marks. They all say about the same height.' },
      { sprite: 'toybox', tx: 15, ty: 2, text: 'A toy box stuffed with wooden fish, bouncy balls and one very chewed stick sword.' },
      { sprite: 'bookshelf', tx: 17, ty: 2, w: 2,
        text: "Bedtime stories: 'The Very Hungry Crayfish', 'Goodnight Billabong' and 'Where the Wild Puggles Are'." },
      { sprite: 'lowtable', tx: 1, ty: 7, w: 2,
        text: 'Lunchtime! A row of tiny bowls of mashed worms, and every bowl has a name painted on it.' },
      { sprite: 'plant', tx: 9, ty: 10, text: 'A pot of daisies. Several have been nibbled.' },
      { sprite: 'plant', tx: 11, ty: 10, text: 'A pot of daisies, safe for now.' },
    ],
    npcs: [{ sprite: 'mama', name: 'Mama Pearl', dialog: 'mama', tx: 10, ty: 3 }],
  },

  shop: {
    name: "Wombeau's Trading Post", theme: 'shop', music: 'village', door: [106, 106],
    map: [
      '#^^w^^^^^^^^w^^#',
      '#==============#',
      '#..............#',
      '#..............#',
      '#..............#',
      '#..............#',
      '#...rrrrrrrr...#',
      '#...rrrrrrrr...#',
      '#..............#',
      '#######X########',
    ],
    furniture: () => [
      { sprite: 'jarshelf', tx: 5, ty: 1, wall: true, hang: 6,
        text: 'Jars of pickled worms, dried crayfish and something labelled "DO NOT OPEN".' },
      { sprite: 'weaponrack', tx: 8, ty: 1, wall: true, hang: 6,
        text: "Swords and bows polished to a shine. Wombeau won't let anyone touch them until they've paid." },
      { sprite: 'jarshelf', tx: 11, ty: 1, wall: true, hang: 6,
        text: 'More jars. One of them blinked. Probably just the light.' },
      { sprite: 'counter', tx: 5, ty: 4, w: 5, talk: 'shop' },
      { sprite: 'barrel', tx: 1, ty: 2, text: 'A barrel of arrows, sorted by size, color and "vibe".' },
      { sprite: 'barrel', tx: 1, ty: 3, text: 'A barrel of apples. There is a bite out of every single one.' },
      { sprite: 'crate', tx: 14, ty: 2, text: 'A crate stamped "FRAGILE". It rattles.' },
      { sprite: 'crate', tx: 14, ty: 3, text: 'A crate stamped "THIS WAY UP". It is upside down.' },
      { sprite: 'armorstand', tx: 2, ty: 6, text: 'Armor on display. Wombeau says it is "very slimming".' },
      { sprite: 'tank', tx: 12, ty: 6, w: 2, text: 'A tank of live crayfish. Gus is trying VERY hard not to drool.' },
    ],
    npcs: [{ sprite: 'wombat', name: 'Wombeau', dialog: 'shop', tx: 7, ty: 3 }],
  },

  pip: {
    name: "Pip's House", theme: 'home', door: [93, 106],
    map: [
      '#^^w^^^^^w^^#',
      '#===========#',
      '#...........#',
      '#...........#',
      '#...rrrrr...#',
      '#...rrrrr...#',
      '#...........#',
      '#...........#',
      '######X######',
    ],
    furniture: () => [
      { sprite: 'bunkbed', tx: 1, ty: 2, h: 2, text: 'A bunk bed. Pip gets the top bunk. Dot says that is "SO unfair".' },
      { sprite: 'kidart', tx: 5, ty: 1, wall: true, hang: 7,
        text: 'A crayon drawing of a dolphin. Or maybe a sausage with fins. It is signed "PIP".' },
      { sprite: 'fishbowl', tx: 4, ty: 2, text: 'A goldfish named Captain. He does not seem impressed by Gus.' },
      { sprite: 'pebbleshelf', tx: 7, ty: 2, w: 2,
        text: "Pip's rock collection: thirty-seven pebbles that all look exactly the same. Pip says they are all VERY different." },
      { sprite: 'toybox', tx: 11, ty: 2, text: 'A toy chest. A wooden boat, a spinning top and half a kite.' },
      { sprite: 'plant', tx: 11, ty: 7, text: 'A cactus. Pip named it Hugs.' },
    ],
    npcs: [{ sprite: 'dot', name: 'Dot', dialog: 'dot', tx: 8, ty: 5 }],
  },

  tully: {
    name: "Tully's Curio Hut", theme: 'curio', door: [93, 115],
    map: [
      '#^^^w^^^w^^^#',
      '#===========#',
      '#...........#',
      '#...........#',
      '#...rrrrr...#',
      '#...rrrrr...#',
      '#...........#',
      '#...........#',
      '######X######',
    ],
    furniture: () => [
      { sprite: 'cabinet', tx: 1, ty: 2, w: 2,
        text: 'A cabinet of curios: a bottled cloud, a left-handed spoon and a shell that hums sea shanties.' },
      { sprite: 'valemap', tx: 6, ty: 1, wall: true, hang: 5, talk: 'map' },
      { sprite: 'cabinet', tx: 10, ty: 2, w: 2,
        text: 'More curios: a rock shaped exactly like a crayfish, and a crayfish shaped exactly like a rock.' },
      { sprite: 'crochead', tx: 3, ty: 1, wall: true, hang: 8,
        text: 'A stuffed croc head. Tully swears it was like that when he found it.' },
      { sprite: 'telescope', tx: 9, ty: 5, text: 'A brass telescope. Tully uses it to spot curios from miles away. And to spy on the neighbors.' },
      { sprite: 'books', tx: 1, ty: 6, text: "Stacks of books: 'Curious Things of the Vale', volumes one through forty-two." },
      { sprite: 'plant', tx: 11, ty: 7, text: 'A carnivorous plant. It snapped at Gus!' },
    ],
    npcs: [{ sprite: 'tully', name: 'Tully', dialog: 'tully', tx: 6, ty: 3 }],
  },

  marlo: {
    name: "Marlo's House", theme: 'marlo', door: [105, 115],
    map: [
      '#^^w^^^^^w^^#',
      '#===========#',
      '#...........#',
      '#...........#',
      '#....rrrr...#',
      '#....rrrr...#',
      '#...........#',
      '#...........#',
      '######X######',
    ],
    furniture: (st) => {
      const ringHome = st.quests && st.quests.marlo_ring === 'done';
      return [
        { sprite: 'bed', tx: 1, ty: 2, h: 2, text: "Marlo's bed. The blanket has little anchors on it." },
        { sprite: 'portrait2', tx: 4, ty: 1, wall: true, hang: 7,
          text: "Marlo's dad, the best fisherman in Billabong -- wearing his shiny gold ring." },
        { sprite: 'mountedfish', tx: 6, ty: 1, wall: true, hang: 7,
          text: 'THE BIG ONE. Marlo caught it on his very first try, and he tells everybody about it.' },
        { sprite: ringHome ? 'ringbox_full' : 'ringbox', tx: 5, ty: 2,
          text: ringHome
            ? "Dad's ring, safe in its box where it belongs. Marlo polishes it every night."
            : 'An empty ring box. Marlo keeps looking at it and sighing.' },
        { sprite: 'net', tx: 8, ty: 1, wall: true, hang: 5, text: 'A fishing net with a very Gus-sized hole in it.' },
        { sprite: 'stove', tx: 10, ty: 2, w: 2, glow: '#ff8a3a', text: 'A pot of fish soup bubbling away. It smells amazing.' },
        { sprite: 'table', tx: 5, ty: 4, w: 2, text: 'Two plates, two cups, and a tackle box full of shiny lures.' },
        { sprite: 'plant', tx: 1, ty: 7, text: 'A pot of sea lavender, a gift from Marlo\'s grandma.' },
      ];
    },
  },
};

export const HOUSE_IDS = Object.keys(HOUSES);

export function buildHouse(hid, state) {
  const H = HOUSES[hid];
  const h = H.map.length, w = Math.max(...H.map.map(r => r.length));
  const tiles = new Uint8Array(w * h).fill(T.HBEAM);
  const idx = (x, y) => y * w + x;
  const inB = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  let exit = null;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const t = CH[H.map[y][x]] ?? T.HBEAM;
    tiles[idx(x, y)] = t;
    if (t === T.EXIT) exit = [x, y];
  }

  const props = [];
  for (const f of H.furniture(state)) props.push({ kind: 'furniture', ...f });
  for (const p of H.pedestals ? H.pedestals() : []) props.push({ kind: 'pedestal', ...p });
  const npcs = typeof H.npcs === 'function' ? H.npcs(state) : H.npcs || [];
  for (const n of npcs) props.push({ kind: 'npc', ...n });

  // one room, so the dungeon room plumbing (camera, room lookups) has something to hold
  const room = { rx: 0, ry: 0, letter: 'H', spawns: [], killall: false, plates: [], eyes: [], gdoors: [] };
  return {
    id: 'house_' + hid, houseId: hid, type: 'house', door: H.door,
    theme: H.theme, name: H.name, music: H.music || 'home',
    w, h, tiles, rooms: { '0,0': room }, bossRoom: null,
    get: (x, y) => inB(x, y) ? tiles[idx(x, y)] : T.HBEAM,
    set: (x, y, t) => { if (inB(x, y)) tiles[idx(x, y)] = t; },
    regionAt: () => -1,
    spawners: [], props, puzzles: [],
    // walking in, Gus appears on the floor just inside the doormat
    playerStart: { x: exit[0] * TILE + 8, y: (exit[1] - 1) * TILE + 8 },
    brood: H.brood ? { x: H.brood[0] * TILE + 8, y: H.brood[1] * TILE + 8 } : null,
    roomAt: () => room,
  };
}
