// Platypus Adventures — constants, balance tables, bindings, shop data.

export const VIEW_W = 400;          // internal resolution (pixels)
export const VIEW_H = 240;
export const TILE = 16;             // tile size in pixels
export const ROOM_W = 25;           // dungeon room size in tiles (one screen)
export const ROOM_H = 15;
export const WORLD_W = 200;         // the Vale itself, in tiles
export const WORLD_H = 200;
export const OCEAN_W = 36;          // the ocean all the way around it, in tiles
export const WORLD_SEED = 987614;   // deterministic overworld

// --- key bindings: physical key -> named action ---
export const KEYMAP = {
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  Space: 'sword', KeyJ: 'sword', KeyZ: 'sword',
  KeyK: 'bow', KeyX: 'bow',
  KeyL: 'shield', KeyC: 'shield', ShiftLeft: 'shield', ShiftRight: 'shield',
  KeyV: 'sprint', Semicolon: 'sprint',
  KeyQ: 'cycleL', KeyR: 'cycleR',
  KeyE: 'interact', Enter: 'interact',
  KeyT: 'teleport', KeyH: 'teleport',
  KeyM: 'map',
  Escape: 'pause', KeyP: 'pause',
  KeyO: 'mute',
  KeyF: 'power', KeyB: 'power',
  KeyG: 'powerNext', Tab: 'powerNext',
  Digit1: 'slot1', Digit2: 'slot2', Digit3: 'slot3',
  Digit4: 'slot4', Digit5: 'slot5', Digit6: 'slot6',
  // debug (only honored with ?debug=1)
  F1: 'dbgGear', F2: 'dbgWarp', F3: 'dbgHeal', F4: 'dbgRich', F5: 'dbgPuggles', F6: 'dbgKeepsakes', F9: 'dbgGod',
  F7: 'dbgCrystals', F8: 'dbgEndgame', F10: 'dbgPowers',
};

// --- player balance ---
export const PLAYER = {
  speed: 88,            // px/sec
  swimSpeed: 52,
  slowMult: 0.62,       // shallow water / mud
  baseHearts: 3,        // 1 heart = 2 hp
  maxHearts: 25,        // 3 base + 13 bought at the shrine (to 16) + 4 from the dungeons + 5 royal gems
  iframes: 0.9,         // seconds of invulnerability after a hit
  swordCooldown: 0.32,
  swordTime: 0.18,      // active slash window
  bowCooldown: 0.45,
  arrowSpeed: 250,
  arrowRange: 130,      // px before an arrow despawns
  baseAmmoCap: 30,
};

// --- sprint / stamina ---
// Gus can put on a burst of speed for as long as the stamina bar lasts. It refills on its
// own once he eases off; running it dry leaves him winded, unable to sprint until the bar
// is part-way back, so the bar is worth watching rather than mashing.
export const SPRINT = {
  mult: 1.55,          // speed multiplier while sprinting, on land and in water alike
  max: 3.2,            // seconds of sprint on a full bar
  regen: 0.7,          // bar-seconds recovered per second while not sprinting
  regenDelay: 0.6,     // pause before recovery starts once sprinting stops
  windedUntil: 0.35,   // an emptied bar must refill to this fraction before sprinting again
};

export const MAX_LEVEL = 6;   // every upgrade track tops out here

// sword damage by level (1-6), plus the God Sword at 7 -- found, never bought (see PUGGLES)
export const SWORD_DMG = [0, 1, 2, 3, 4, 6, 8, 20];
export const GOD_SWORD_LV = 7;

// Per-level sword visuals. Purely cosmetic — reach and damage are unchanged, so upgrading
// reads as a visible glow-up without shifting the hitbox out from under the player.
// `trail` layers are drawn as a lagging fan behind the blade, brightest first.
export const SWORD_LOOK = [
  null,
  { name: 'Rusty Blade', len: 14, w: 2, edge: '#b09878', core: '#7a6248', dark: '#40301f',
    guard: '#5a4632', grip: '#3a2a1a', trail: ['#c8c0a8'], trailAlpha: 0.4, glow: null, spark: null, sparkN: 0 },
  { name: 'Bronze Sword', len: 16, w: 3, edge: '#f0c078', core: '#c08840', dark: '#6a4418',
    guard: '#8a5a2a', grip: '#4a3418', trail: ['#f0c078', '#c08840'], trailAlpha: 0.5, glow: null, spark: '#f0c078', sparkN: 2 },
  { name: 'River Steel', len: 17, w: 3, edge: '#eaf4ff', core: '#a8c8e8', dark: '#46647e',
    guard: '#6a7280', grip: '#2a3a4a', trail: ['#eaf4ff', '#bfe8f2', '#7ad4ff'], trailAlpha: 0.6, glow: '#7ad4ff', spark: '#bfe8f2', sparkN: 4 },
  { name: 'Basalt Edge', len: 18, w: 4, edge: '#ffb060', core: '#4a4a58', dark: '#17171e',
    guard: '#5a3a2a', grip: '#2a1a12', trail: ['#ffc890', '#ff8a3a', '#c8501a'], trailAlpha: 0.7, glow: '#ff8a3a', spark: '#ff8a3a', sparkN: 7 },
  { name: 'Guardian Blade', len: 20, w: 4, edge: '#fffbe0', core: '#f0e08a', dark: '#a8801a',
    guard: '#f0c83a', grip: '#8a6a1a', trail: ['#ffffff', '#fff6c8', '#f0c83a', '#f0a03a'], trailAlpha: 0.85, glow: '#fff6c8', spark: '#fff6c8', sparkN: 11 },
  { name: 'Riverlight Fang', len: 22, w: 4, edge: '#ffffff', core: '#bff4ff', dark: '#3a8fb0',
    guard: '#7ad4ff', grip: '#2a6a8a', trail: ['#ffffff', '#ddfaff', '#7ad4ff', '#3aa8e0', '#2a6a8a'], trailAlpha: 0.95, glow: '#bff4ff', spark: '#ddfaff', sparkN: 15 },
  { name: 'God Sword', len: 24, w: 4, edge: '#ffffff', core: '#fff3b0', dark: '#5a3a8a',
    guard: '#ffd84a', grip: '#4a2a6a', trail: ['#ffffff', '#fff6c8', '#ffd84a', '#ff9ad0', '#c88aff', '#7ad4ff'], trailAlpha: 1, glow: '#fffbe0', spark: '#fff6c8', sparkN: 18 },
];

// The God Sword's full-health beam (Zelda style): one on screen at a time, same damage as
// a slash, and it strikes eye switches like an arrow does.
export const GOD_BEAM = { speed: 300, range: 240 };
// flat damage reduction by armor tier (0-6, plus God Armor at 7); incoming damage is never
// reduced below 1
export const ARMOR_REDUCE = [0, 1, 2, 3, 4, 5, 6, 12];
// God Armor: forged at the magic altar in the Goo Lands from god crystals, never bought
export const GOD_ARMOR_LV = 7;

// Per-level shield visuals. Sprite grows with the tier and the aura telegraphs the
// mechanic: Lv4 is widest (wide arc), Lv5+ glow (no slow / double reflect).
export const SHIELD_LOOK = [
  null,
  { name: 'Bark Shield', sprite: 'shield1', glow: null, aura: 0, spark: '#c8b48a' },
  { name: 'Iron Shield', sprite: 'shield2', glow: null, aura: 0, spark: '#c8ccd4' },
  { name: 'Mirror Shield', sprite: 'shield3', glow: '#dfefff', aura: 0.16, spark: '#ffffff' },
  { name: 'Tide Bulwark', sprite: 'shield4', glow: '#5fc3c8', aura: 0.24, spark: '#8ff0f4' },
  { name: 'Storm Wall', sprite: 'shield5', glow: '#7ad4ff', aura: 0.32, spark: '#bff4ff' },
  { name: 'Aegis of Vale', sprite: 'shield6', glow: '#fff6c8', aura: 0.42, spark: '#ffffff' },
];

// Shield behaviour per level. Lower arc = wider block cone; slow = movement multiplier
// while blocking; reflect = damage multiplier on bounced projectiles (0 = can't reflect).
export const SHIELD_ARC = [1, 0.3, 0.3, 0.3, 0.05, 0.05, -0.15];
export const SHIELD_SLOW = [1, 0.5, 0.5, 0.55, 0.65, 1, 1];
export const SHIELD_REFLECT = [0, 0, 0, 1, 1, 1.5, 2];
// Bow: firing cooldown multiplier and arrow speed/range multiplier per level.
export const BOW_COOLDOWN = [1, 1, 0.85, 0.72, 0.62, 0.54, 0.46];
export const BOW_POWER = [1, 1, 1.12, 1.25, 1.4, 1.55, 1.75];
// shield: level 1 blocks melee/contact from the front; 2+ blocks projectiles; 3 reflects them

// --- arrow types ---
export const ARROW_TYPES = ['regular', 'fire', 'ice', 'lightning', 'bomb', 'light'];
export const ARROWS = {
  regular:   { name: 'Arrows',           cost: 1, dmg: lv => lv,           color: '#c8b48a' },
  fire:      { name: 'Fire Arrows',      cost: 1, dmg: lv => lv + 1,       color: '#ff7a30' }, // + burn
  ice:       { name: 'Ice Arrows',       cost: 1, dmg: lv => lv,           color: '#7ad4ff' }, // + freeze
  lightning: { name: 'Lightning Arrows', cost: 1, dmg: lv => lv + 1,       color: '#ffe95c' }, // + chain
  bomb:      { name: 'Bomb Arrows',      cost: 2, dmg: lv => lv * 2 + 1,   color: '#9aa0a8' }, // + AoE, cracks
  light:     { name: 'Light Arrows',     cost: 3, dmg: lv => lv * 3 + 2,   color: '#fff6c8' }, // + pierce, boss-bane
};
export const BURN = { dmg: 1, ticks: 3, interval: 0.55 };
export const FREEZE_TIME = 1.6;
export const CHAIN_TARGETS = 2;
export const BOMB_RADIUS = 30;

// --- difficulty scaling: tier = dungeons completed (0-4+) ---
export const tierHp = (hp, tier) => Math.max(1, Math.round(hp * (1 + 0.38 * tier)));
export const tierDmg = (dmg, tier) => dmg + Math.floor(tier / 2);
export const tierCoins = (c, tier) => c + tier;

// --- warp home ---
// Held, not tapped, so it can't fire by accident mid-fight. Works from dungeons too.
export const TELEPORT = {
  hold: 1.6,          // seconds of holding before it fires
  dest: [100 + 36, 112 + 36],   // Billabong Village plaza, in tiles (past the ocean margin)
  cancelBlipAfter: 0.3,
};

// --- drops ---
export const DROPS = {
  coinChance: 0.72, coinMin: 1, coinMax: 3,
  crayfishChance: 0.14, arrowChance: 0.22, diamondChance: 0.035,
};
export const CRAYFISH_HEAL = 4; // hp (2 hearts)

// --- shop catalog (Wombeau's) ---
// Every gear track runs to MAX_LEVEL. The catalog is generated from these tracks rather
// than hand-listed: getShopList() only ever surfaces the next step of each track, so the
// visible shop stays short even though the full catalog is ~60 entries.
// `start` is the level the track becomes purchasable at (gear you must own first).
export const UPGRADE_TRACKS = [
  { key: 'sword', start: 1, steps: [
    { lv: 2, name: 'Bronze Sword',    price: 100,  desc: 'Sword damage up.' },
    { lv: 3, name: 'River Steel',     price: 250,  desc: 'Sword damage up.' },
    { lv: 4, name: 'Basalt Edge',     price: 600,  desc: 'Sword damage up.' },
    { lv: 5, name: 'Guardian Blade',  price: 1200, desc: 'A legend reforged.' },
    { lv: 6, name: 'Riverlight Fang', price: 2400, desc: 'The apex blade.' },
  ] },
  { key: 'armor', start: 0, steps: [
    { lv: 1, name: 'Reed Vest',      price: 80,   desc: 'Reduces damage by 1.' },
    { lv: 2, name: 'Scale Mail',     price: 300,  desc: 'Reduces damage by 2.' },
    { lv: 3, name: 'Basalt Plate',   price: 800,  desc: 'Reduces damage by 3.' },
    { lv: 4, name: 'Tideplate',      price: 1500, desc: 'Reduces damage by 4.' },
    { lv: 5, name: 'Stormweave',     price: 2600, desc: 'Reduces damage by 5.' },
    { lv: 6, name: 'Guardian Aegis', price: 4200, desc: 'Reduces damage by 6.' },
  ] },
  { key: 'shield', start: 1, steps: [
    { lv: 2, name: 'Iron Shield',   price: 120,  desc: 'Also blocks projectiles.' },
    { lv: 3, name: 'Mirror Shield', price: 400,  desc: 'Reflects projectiles.' },
    { lv: 4, name: 'Tide Bulwark',  price: 900,  desc: 'Much wider block arc.' },
    { lv: 5, name: 'Storm Wall',    price: 1700, desc: 'Move at full speed blocking.' },
    { lv: 6, name: 'Aegis of Vale', price: 3000, desc: 'Reflects for double damage.' },
  ] },
  { key: 'bow', start: 1, steps: [
    { lv: 2, name: 'Hardwood Bow',   price: 150,  desc: 'Faster firing.' },
    { lv: 3, name: 'Stormwood Bow',  price: 450,  desc: 'Faster, farther arrows.' },
    { lv: 4, name: 'Silverlimb Bow', price: 950,  desc: 'Faster, farther arrows.' },
    { lv: 5, name: 'Galewind Bow',   price: 1800, desc: 'Faster, farther arrows.' },
    { lv: 6, name: 'Riverlight Bow', price: 3200, desc: 'The apex bow.' },
  ] },
  { key: 'quiver', start: 0, steps: [
    { lv: 1, name: 'Big Quiver',     price: 80,   desc: 'Carry 45 arrows.' },
    { lv: 2, name: 'Huge Quiver',    price: 250,  desc: 'Carry 60 arrows.' },
    { lv: 3, name: 'Vast Quiver',    price: 550,  desc: 'Carry 80 arrows.' },
    { lv: 4, name: 'Grand Quiver',   price: 1000, desc: 'Carry 100 arrows.' },
    { lv: 5, name: 'Great Quiver',   price: 1700, desc: 'Carry 125 arrows.' },
    { lv: 6, name: 'Endless Quiver', price: 2800, desc: 'Carry 150 arrows.' },
  ] },
];
// arrow capacity by quiver level (0-6)
export const AMMO_CAPS = [30, 45, 60, 80, 100, 125, 150];

// Per-type arrow upgrade pricing: base cost for Lv2, scaled up each level.
export const ARROW_UP_BASE = { regular: 40, fire: 60, ice: 60, lightning: 60, bomb: 60, light: 100 };
export const ARROW_UP_STEP = [0, 0, 1, 3, 6, 10, 16];   // multiplier of the base per level
export const ARROW_UP_DESC = {
  regular: 'Sharper arrows.', fire: 'Hotter flames.', ice: 'Deeper freeze.',
  lightning: 'Stronger storms.', bomb: 'Bigger booms.', light: 'Brighter radiance.',
};

export const CONSUMABLES = [
  { id: 'ammo', label: '10 Arrows', price: 15, desc: 'A bundle of arrows.' },
  { id: 'cray', label: 'Crayfish Snack', price: 25, desc: 'Heals 2 hearts on the spot.' },
];

// Heart Vessel prices in diamonds, one per purchase. 13 vessels take Gus from his starting
// 3 hearts up to 16; the final 4 are earned, one per Key Shard (see HEART_PER_SHARD).
export const VESSEL_COSTS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36];
export const HEART_PER_SHARD = 1;     // bonus hearts per elemental dungeon cleared

export const REGION_NAMES = {
  marsh: 'Willow Marsh', village: 'Billabong Village',
  fire: 'Cinderscale Wastes', water: 'Mistfall Lagoon',
  air: 'Skyreach Bluffs', earth: 'Rootdeep Forest',
  confluence: 'The Confluence', goo: 'The Goo Lands', ocean: 'The Great Ocean',
  kingdom: 'Castle Mirri', meadows: 'Molehill Meadows', hills: 'Hopscotch Hills', ridge: 'Rumble Ridge',
  lake: 'Mirror Lake', woods: 'The Royal Woods',
};

export const DUNGEON_NAMES = {
  fire: 'The Molten Maw', water: 'The Sunken Grotto',
  air: 'The Tempest Spire', earth: 'The Rootdeep Barrow',
  nexus: 'The Nexus of Fangs', hive: 'The Star Hive',
};

// Side quests: entirely optional, but required to 100% a file. `giver` is the NPC/dolphin
// name that carries the dialogue and hands out the reward. Fetch quests gate on an item
// flag set when its trinket is picked up in the world; rescue quests gate on a kill-all
// encounter (see the `puzzles` entries with a `quest` field) and complete automatically.
export const SIDE_QUESTS = {
  bubbles_shell: {
    id: 'bubbles_shell', name: "Bubbles' Lost Shell", giver: 'Bubbles', kind: 'fetch',
    itemId: 'sqitem_bubbles_shell', reward: { coins: 40, diamonds: 2 },
    offer: "Psst, Gus! I dropped my favorite shell somewhere up the river, north of here. Could you swim up and find it for me?",
    active: "Still haven't found my shell? It's up the river, north of here somewhere.",
    turnIn: 'You found it! Oh, thank you, thank you, Gus!',
    done: "Thanks again for finding my shell. You're the best!",
  },
  barnaby_rescue: {
    id: 'barnaby_rescue', name: 'A Friend in Trouble', giver: 'Barnaby', kind: 'rescue',
    reward: { coins: 60, diamonds: 3 },
    trouble: "Help! They won't let me pass -- watch yourself, Gus!",
    done: "Thanks again for chasing those things off. I won't forget it, Gus.",
  },
  marlo_ring: {
    id: 'marlo_ring', name: "Marlo's Ring", giver: 'Marlo', kind: 'fetch',
    itemId: 'sqitem_marlo_ring', reward: { coins: 50, diamonds: 3 },
    offer: "I lost my dad's ring out past the forest, buried under some old rubble. A good arrow could probably crack it open. Would you look?",
    active: "Any luck finding that ring? It's under rubble out past the forest.",
    turnIn: "My dad's ring! I can't believe it -- thank you so much, Gus.",
    done: "Couldn't have gotten that ring back without you, Gus.",
  },
  // The next two live out at the map's far edges and hit harder than the others: a bigger,
  // meaner ambush for the rescue, and a fetch buried deep in hostile, heavily-patrolled ground.
  fenwick_rescue: {
    id: 'fenwick_rescue', name: "Fenwick's Peril", giver: 'Fenwick', kind: 'rescue',
    reward: { coins: 120, diamonds: 5 },
    trouble: "They've got me boxed in against the rocks -- TEN of them, Gus! I don't like our odds!",
    done: "Ten of them and you didn't even flinch. Remind me never to owe you money.",
  },
  yuma_chime: {
    id: 'yuma_chime', name: "Yuma's Wind Chime", giver: 'Yuma', kind: 'fetch',
    itemId: 'sqitem_yuma_chime', reward: { coins: 100, diamonds: 5 },
    offer: "The wind carried my grandmother's chime clean off the bluff, out toward the very edge of the sky. It's sealed under rockfall now, and the talons nest right on top of it -- a blasting arrow's your only way in, if you can clear them first. Would you brave it?",
    active: "Any sign of my chime out past the cliffs? Mind the talons -- they nest right on top of it.",
    turnIn: "My grandmother's chime! I never thought I'd hear it sing again. Thank you, Gus.",
    done: "Listen -- that's her chime on the wind again. All thanks to you.",
  },
};

// Puggles: baby platypuses hidden across the overworld (placed in worldgen.js). Finding
// every one earns the God Sword. The count here must match what worldgen places.
export const PUGGLE_TOTAL = 50;

// Keepsakes: one-of-a-kind curios hidden around the Vale (placed in worldgen.js), each shown
// off on its own stand in Gus's Burrow once found. The id is a save key: never rename one.
// `region` feeds Tully's hints; `how` is how it's hidden, for his clues and the design doc.
// Two aren't in the world at all: the trophy is won in the Crucible and Mama Pearl gives
// the drawing once enough puggles are home.
export const KEEPSAKES = [
  { id: 'ks_lure', name: 'Lucky Fishing Lure', sprite: 'ks_lure', region: 'village',
    desc: "Dad's lucky lure! Bright red feathers, a little chewed. Every fish in the Vale knew this one.",
    hint: "Your dad's old fishing lure snagged in the reeds of the village pond, just outside the west fence. Try cutting through the reeds." },
  { id: 'ks_stone', name: 'Wishing Stone', sprite: 'ks_stone', region: 'marsh',
    desc: 'A smooth river stone with a hole worn right through it. Peek through the hole and make a wish!',
    hint: 'A wishing stone is hiding in a patch of tall grass, out west of the village in Willow Marsh.' },
  { id: 'ks_boomerang', name: 'Old Boomerang', sprite: 'ks_boomerang', region: 'marsh',
    desc: 'Carved from river red gum and painted with dots. Throw it and it always comes back -- unlike Gus\'s socks.',
    hint: 'Somebody threw a boomerang so far it never came back! It landed in a ring of trees at the far west edge of the marsh.' },
  { id: 'ks_bottle', name: 'Message in a Bottle', sprite: 'ks_bottle', region: 'marsh',
    desc: "The note inside says: 'Whoever finds this -- be brave, be kind, and eat more crayfish.'",
    hint: "A bottle is bobbing in the big river east of the village, just upstream of the bridge. You'll have to swim for it." },
  { id: 'ks_egg', name: 'Ember Egg', sprite: 'ks_egg', region: 'fire',
    desc: "A speckled egg that's still warm after all these years. Will it ever hatch? Nobody knows!",
    hint: 'An ember egg sits in a nook of black basalt near the far east edge of the Cinderscale Wastes.' },
  { id: 'ks_opal', name: 'Fire Opal', sprite: 'ks_opal', region: 'fire',
    desc: 'It flickers with every color of a campfire. Opals are the rarest gems in all of Billabong Vale.',
    hint: 'A fire opal is sealed inside a ring of cracked rock, way up at the north edge of the Cinderscale Wastes. Bring a bomb arrow!' },
  { id: 'ks_arrowhead', name: 'Obsidian Arrowhead', sprite: 'ks_arrowhead', region: 'fire',
    desc: 'Glassy black and still razor sharp, chipped out by a River Guardian long, long ago.',
    hint: 'An old arrowhead is buried under a cracked boulder in the south of the Cinderscale Wastes. A bomb arrow would crack it.' },
  { id: 'ks_pearl', name: 'Moon Pearl', sprite: 'ks_pearl', region: 'water',
    desc: "A pink pearl as big as Gus's eye, from a lagoon clam that was VERY sleepy.",
    hint: "There's a pearl on a tiny island out in Mistfall Lagoon, just one palm tree for company. Swim out north of the Grotto." },
  { id: 'ks_seaglass', name: 'Sea Glass', sprite: 'ks_seaglass', region: 'water',
    desc: 'Frosty green and blue glass, tumbled smooth by a hundred years of waves.',
    hint: 'Sea glass washed up in a little grove of palms on the east beach of Mistfall Lagoon.' },
  { id: 'ks_compass', name: 'Brass Compass', sprite: 'ks_compass', region: 'water',
    desc: 'Its needle always points toward home. Very handy for a Guardian who loves to wander.',
    hint: 'A compass is hidden on the northeast beach of the lagoon -- push the old stone onto its mark and it will turn up.' },
  { id: 'ks_kite', name: 'Red Kite', sprite: 'ks_kite', region: 'air',
    desc: "Snagged on the bluffs by a gust. The string is long gone, but it still wants to fly.",
    hint: 'A red kite is caught in a pocket of mesa rock on the south side of the Skyreach Bluffs.' },
  { id: 'ks_meteor', name: 'Star Stone', sprite: 'ks_meteor', region: 'air',
    desc: 'A lump of iron that fell out of the sky. At night it hums, very quietly, to itself.',
    hint: 'A star fell on the Skyreach Bluffs, near the west edge, and got sealed in by cracked rock. Bring a bomb arrow!' },
  { id: 'ks_feather', name: 'Golden Feather', sprite: 'ks_feather', region: 'air',
    desc: 'Dropped by a storm eagle. It shimmers like the sunrise over the bluffs.',
    hint: 'A golden feather is guarded by a nest of talons and an owl, down on the south bluffs. Clear them out and it will be yours.' },
  { id: 'ks_mushroom', name: 'Glow Mushroom', sprite: 'ks_mushroom', region: 'earth',
    desc: 'It glows a soft green in the dark. The perfect night light for a cozy burrow.',
    hint: 'A glow mushroom is growing in tall grass near the far west edge of Rootdeep Forest.' },
  { id: 'ks_amber', name: 'Amber Drop', sprite: 'ks_amber', region: 'earth',
    desc: 'Golden tree sap that hardened ages ago -- with a teeny ancient beetle still inside!',
    hint: 'A drop of amber is locked inside a crystal deep in the south of Rootdeep Forest. A big BOOM would free it.' },
  { id: 'ks_fossil', name: 'Spiral Fossil', sprite: 'ks_fossil', region: 'earth',
    desc: 'The swirly shell of a sea creature from back when the whole Vale was ocean.',
    hint: 'A fossil is tucked into a nook of pine trees in the southeast of Rootdeep Forest.' },
  { id: 'ks_coin', name: 'Ancient Guardian Coin', sprite: 'ks_coin', region: 'confluence',
    desc: 'Stamped with a platypus wearing a crown. Worth more than every Platycoin in the Vale put together.',
    hint: 'An ancient coin fell into a thorn patch in the northeast of the Confluence. Ouch! Mind the prickles.' },
  { id: 'ks_thunder', name: 'Thunder Egg', sprite: 'ks_thunder', region: 'confluence',
    desc: 'A plain gray rock on the outside, and full of sparkly purple crystals on the inside.',
    hint: 'A thunder egg is under a cracked boulder just inside the Great Gate, off to the east.' },
  { id: 'ks_trophy', name: 'Crucible Trophy', sprite: 'ks_trophy', region: 'arena',
    desc: 'For surviving ten whole waves in the Crucible. Gus polishes it every single morning.',
    hint: 'The Crucible gives a shiny trophy to anyone who clears ten waves. Good luck!' },
  { id: 'ks_drawing', name: 'Puggle Drawing', sprite: 'ks_drawing', region: 'mama',
    desc: 'A crayon picture from the puggles: Gus, very big, with a VERY big sword. Signed with lots of tiny footprints.',
    hint: "Mama Pearl's puggles are drawing Gus a picture. I hear they'll give it to him once 25 of them are home." },
];
export const KEEPSAKE_TOTAL = KEEPSAKES.length;
export const KEEPSAKE_BY_ID = Object.fromEntries(KEEPSAKES.map(k => [k.id, k]));
export const KEEPSAKE_ARENA_WAVE = 10;     // clearing this wave in the Crucible wins the trophy
export const KEEPSAKE_PUGGLES = 25;        // puggles home before Mama hands over the drawing

// --- the endgame: past Apexus, across the Great Chasm ---
// --- the five powers, one from each of the Platypus Kingdom's dungeons ---
// F uses the one selected (G swaps); in deep water F always dives.
export const POWERS = ['shovel', 'jump', 'dash', 'dive', 'hook'];
export const POWER_INFO = {
  shovel: { name: 'Shovel', item: 'THE SHOVEL', sprite: 'pw_shovel', color: '#e0b060',
    how: 'Press F to dig the ground in front of you. Sometimes there is treasure... and sometimes there is not!' },
  jump: { name: 'Jump', item: 'SPRING BOOTS', sprite: 'pw_jump', color: '#a8e0ff',
    how: 'Press F to JUMP over holes, gaps and low walls.' },
  dash: { name: 'Dash', item: 'DASH FLIPPERS', sprite: 'pw_dash', color: '#ffb84a',
    how: 'Press F to DASH! Smash through rubble and zoom right past danger.' },
  dive: { name: 'Dive', item: 'DIVING HELMET', sprite: 'pw_dive', color: '#6affd8',
    how: 'Press F in deep water to DIVE. Swim under rock arches and find secret things on the bottom!' },
  hook: { name: 'Hook', item: 'GRAPPLE HOOK', sprite: 'pw_hook', color: '#ffd84a',
    how: 'Press F to throw it. Hook a gold-ringed post and ZIP across!' },
};
export const POWER = {
  jumpTime: 0.46, jumpSpeed: 132, jumpHeight: 12,
  dashTime: 0.24, dashSpeed: 300, dashCd: 0.5,
  digTime: 0.32,
  breath: 4,                 // seconds Gus can stay under
  hookSpeed: 420, hookRange: 10 * 16, zipSpeed: 300,
};

// Alien goo works like gloom: wading through it is slow, and every bite it takes (and every
// goo blob that hits) leaves that half heart broken. Broken hearts can't be healed until Gus
// has been out of the goo for `wait` seconds; then they mend one half heart every `fade`.
export const GLOOM = { slow: 0.45, tick: 0.8, wait: 3, fade: 0.5 };

// Every enemy in the Goo Lands has crawled out of alien goo: a zombie, far tougher than the
// one it used to be, and worth a handful of god crystals. Enough crystals forge God Armor.
export const CRYSTAL_GOAL = 300;
export const ZOMBIE = {
  hpMul: 2.5, dmgMul: 2, dmgAdd: 2, spdMul: 1.1,
  crystals: 5,          // god crystals dropped by each zombie
  respawn: 8,           // seconds before a goo pool burps up another one
};
// Xenomantis: three-quarters of three times Apexus's health (Apexus measured at the tier he's
// fought at). Her hits are tuned against God Armor, which takes 12 off each: a bump costs
// about four and a half hearts, a goo ball two. Fixed numbers, not tier-scaled.
const APEXUS_TIER = 4;
export const XENO = {
  hp: Math.round(0.75 * 3 * tierHp(150, APEXUS_TIER)),
  dmg: 21,
  pdmg: 16,
};
// Mum and Dad, once freed, follow Gus everywhere but indoors and pitch in on every fight.
// They can't be hurt. God Armor makes them hit harder too.
export const FAMILY = {
  dadDmg: 6, dadCd: 0.9,          // Dad's sword
  mumLevel: 4, mumCd: 1.3,        // Mum's arrows (an arrow's damage is its level)
  armorMul: 1.5,                  // damage multiplier once God Armor is forged
  bossMul: 0.35,                  // ...but a boss is Gus's to beat: they only chip at one
  crayCd: 22,                     // Mum tosses Gus a crayfish when he's low, this often
};

export const DEBUG = new URLSearchParams(location.search).has('debug');
