// Platypus Adventures — constants, balance tables, bindings, shop data.

export const VIEW_W = 400;          // internal resolution (pixels)
export const VIEW_H = 240;
export const TILE = 16;             // tile size in pixels
export const ROOM_W = 25;           // dungeon room size in tiles (one screen)
export const ROOM_H = 15;
export const WORLD_W = 200;         // overworld size in tiles
export const WORLD_H = 200;
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
  KeyQ: 'cycleL', KeyR: 'cycleR',
  KeyE: 'interact', Enter: 'interact',
  KeyT: 'teleport', KeyH: 'teleport',
  KeyM: 'map',
  Escape: 'pause', KeyP: 'pause',
  KeyO: 'mute',
  Digit1: 'slot1', Digit2: 'slot2', Digit3: 'slot3',
  Digit4: 'slot4', Digit5: 'slot5', Digit6: 'slot6',
  // debug (only honored with ?debug=1)
  F1: 'dbgGear', F2: 'dbgWarp', F3: 'dbgHeal', F4: 'dbgRich', KeyG: 'dbgGod',
};

// --- player balance ---
export const PLAYER = {
  speed: 88,            // px/sec
  swimSpeed: 52,
  slowMult: 0.62,       // shallow water / mud
  baseHearts: 3,        // 1 heart = 2 hp
  maxHearts: 20,        // 3 base + 13 bought at the shrine (to 16) + 4 from the dungeons
  iframes: 0.9,         // seconds of invulnerability after a hit
  swordCooldown: 0.32,
  swordTime: 0.18,      // active slash window
  bowCooldown: 0.45,
  arrowSpeed: 250,
  arrowRange: 130,      // px before an arrow despawns
  baseAmmoCap: 30,
};

export const MAX_LEVEL = 6;   // every upgrade track tops out here

// sword damage by level (1-6)
export const SWORD_DMG = [0, 1, 2, 3, 4, 6, 8];

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
];
// flat damage reduction by armor tier (0-6); incoming damage is never reduced below 1
export const ARMOR_REDUCE = [0, 1, 2, 3, 4, 5, 6];

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
  dest: [100, 112],   // Billabong Village plaza, in tiles
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
  confluence: 'The Confluence',
};

export const DUNGEON_NAMES = {
  fire: 'The Molten Maw', water: 'The Sunken Grotto',
  air: 'The Tempest Spire', earth: 'The Rootdeep Barrow',
  nexus: 'The Nexus of Fangs',
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

export const DEBUG = new URLSearchParams(location.search).has('debug');
