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
  maxHearts: 12,
  iframes: 0.9,         // seconds of invulnerability after a hit
  swordCooldown: 0.32,
  swordTime: 0.18,      // active slash window
  bowCooldown: 0.45,
  arrowSpeed: 250,
  arrowRange: 130,      // px before an arrow despawns
  baseAmmoCap: 30,
};

// sword damage by level (1-5)
export const SWORD_DMG = [0, 1, 2, 3, 4, 6];

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
];
// flat damage reduction by armor tier (0-3); incoming damage is never reduced below 1
export const ARMOR_REDUCE = [0, 1, 2, 3];
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

// --- drops ---
export const DROPS = {
  coinChance: 0.72, coinMin: 1, coinMax: 3,
  crayfishChance: 0.14, arrowChance: 0.22, diamondChance: 0.035,
};
export const CRAYFISH_HEAL = 4; // hp (2 hearts)

// --- shop catalog (Wombeau's) ---
// Each entry: id, label, desc, price (coins), and availability/apply handled in game.js
export const SHOP_ITEMS = [
  { id: 'sword2', label: 'Bronze Sword',   price: 100,  desc: 'Sword damage up. (Lv 2)' },
  { id: 'sword3', label: 'River Steel',    price: 250,  desc: 'Sword damage up. (Lv 3)' },
  { id: 'sword4', label: 'Basalt Edge',    price: 600,  desc: 'Sword damage up. (Lv 4)' },
  { id: 'sword5', label: 'Guardian Blade', price: 1200, desc: 'The legend itself. (Lv 5)' },
  { id: 'armor1', label: 'Reed Vest',      price: 80,   desc: 'Reduces damage by 1.' },
  { id: 'armor2', label: 'Scale Mail',     price: 300,  desc: 'Reduces damage by 2.' },
  { id: 'armor3', label: 'Basalt Plate',   price: 800,  desc: 'Reduces damage by 3.' },
  { id: 'shield2', label: 'Iron Shield',   price: 120,  desc: 'Shield also blocks projectiles.' },
  { id: 'shield3', label: 'Mirror Shield', price: 400,  desc: 'Shield reflects projectiles.' },
  { id: 'bow2',   label: 'Hardwood Bow',   price: 150,  desc: 'Faster firing.' },
  { id: 'bow3',   label: 'Stormwood Bow',  price: 450,  desc: 'Arrows fly faster and farther.' },
  { id: 'quiver1', label: 'Big Quiver',    price: 80,   desc: 'Carry 50 arrows.' },
  { id: 'quiver2', label: 'Huge Quiver',   price: 250,  desc: 'Carry 80 arrows.' },
  { id: 'ammo',   label: '10 Arrows',      price: 15,   desc: 'A bundle of arrows.' },
  { id: 'cray',   label: 'Crayfish Snack', price: 25,   desc: 'Heals 2 hearts on the spot.' },
  // per-type arrow upgrades appear once the type is owned
  { id: 'up_regular2', label: 'Arrows Lv2',    price: 40,  desc: 'Regular arrows hit harder.' },
  { id: 'up_regular3', label: 'Arrows Lv3',    price: 120, desc: 'Regular arrows hit harder.' },
  { id: 'up_fire2', label: 'Fire Arrows Lv2',  price: 60,  desc: 'Hotter flames.' },
  { id: 'up_fire3', label: 'Fire Arrows Lv3',  price: 180, desc: 'Hottest flames.' },
  { id: 'up_ice2', label: 'Ice Arrows Lv2',    price: 60,  desc: 'Deeper freeze.' },
  { id: 'up_ice3', label: 'Ice Arrows Lv3',    price: 180, desc: 'Deepest freeze.' },
  { id: 'up_lightning2', label: 'Lightning Lv2', price: 60,  desc: 'Stronger storms.' },
  { id: 'up_lightning3', label: 'Lightning Lv3', price: 180, desc: 'Strongest storms.' },
  { id: 'up_bomb2', label: 'Bomb Arrows Lv2',  price: 60,  desc: 'Bigger booms.' },
  { id: 'up_bomb3', label: 'Bomb Arrows Lv3',  price: 180, desc: 'Biggest booms.' },
  { id: 'up_light2', label: 'Light Arrows Lv2', price: 100, desc: 'Brighter radiance.' },
  { id: 'up_light3', label: 'Light Arrows Lv3', price: 300, desc: 'Blinding radiance.' },
];

// Heart Vessel prices in diamonds, one per purchase (9 total → 12 hearts)
export const VESSEL_COSTS = [4, 6, 8, 10, 12, 14, 16, 18, 20];

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

export const DEBUG = new URLSearchParams(location.search).has('debug');
