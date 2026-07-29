# Platypus Adventures — Design Document

A top-down open-world action adventure in the spirit of Legend of Zelda and Cat Quest.
You play **Gus the Platypus**, last of the River Guardians, on a quest to reclaim the four
Elemental Key Shards and stop **Apexus, the Primal Chimera** at the Confluence.

## Story

The rivers of Billabong Vale once flowed with the River's Light. Then the **Elemental
Fangs** — ancient predators of platypus-kind, twisted and empowered by shattered elemental
relics — rose from the four corners of the Vale. Each guards a shard of the Confluence Key.
Gus takes up his rusty sword to win back the shards, unlock the Confluence, and face the
Primal Chimera.

## Player: Gus

- Always rendered **standing upright** (Cat Quest style) on a top-down world.
- Moves 8-directionally; attacks aim in the 4 cardinal directions (last direction pressed).
- Can swim in deep water (he's a platypus!) at reduced speed; can't attack while swimming.
- **Sword** (from the start): arc slash, levels 1–5, upgraded at the shop.
- **Shield** (from Elder Mirri): hold to block frontal hits; upgrades widen block/deflect projectiles.
- **Bow** (chest in Billabong Village): fires the selected arrow type; uses one shared ammo pool.
- **Armor**: 3 purchasable tiers, reduces damage, visually tints Gus.
- **Health**: starts at 3 hearts (1 heart = 2 HP), grows via Heart Vessels bought with diamonds. Max 12.

### Arrow types (each has its own level 1–3, upgraded at the shop)

| Type      | Source                     | Effect                                  | Ammo cost |
|-----------|----------------------------|------------------------------------------|-----------|
| Regular   | with the bow               | plain damage                             | 1         |
| Fire      | Molten Maw (Fire dungeon)  | burn damage over time                    | 1         |
| Ice       | Sunken Grotto (Water)      | freezes enemies briefly                  | 1         |
| Lightning | Tempest Spire (Air)        | chains to nearby enemies                 | 1         |
| Bomb      | Rootdeep Barrow (Earth)    | AoE blast, breaks cracked walls/rocks    | 2         |
| Light     | Nexus of Fangs (Final)     | strongest; pierces; every enemy is weak to it | 3    |

## Controls

Touch is a first-class input, not a fallback: on-screen controls fade in on first touch and
retire when a key is pressed. Movement uses a floating thumbstick (origin = wherever the thumb
lands in the lower-left), the sword auto-repeats while held, and every menu is tappable.
See `js/touch.js` for layout constants and `README.md` for the player-facing summary.

| Action            | Keys                  |
|-------------------|-----------------------|
| Move              | WASD / Arrow keys     |
| Sword             | Space / J / Z         |
| Bow               | K / X                 |
| Shield (hold)     | L / C / Shift         |
| Cycle arrow type  | Q / R  (or 1–6 direct)|
| Interact / Talk   | E / Enter             |
| World map         | M                     |
| Pause             | Esc / P               |
| Mute audio        | O                     |

## Currencies & pickups

- **Platycoins** — dropped often by enemies, cut grass, pots, chests. Buy sword/shield/bow/armor/arrow
  upgrades, ammo, and snacks at Wombeau's shop.
- **Diamonds** — rare drops, boss rewards, secret chests. Spent at the Diamond Shrine for Heart Vessels
  (cost rises each purchase).
- **Crayfish** — Gus's favorite food; dropped by enemies, heals 2 hearts on pickup.
- **Arrows** — ammo drops; capacity upgradable (30 → 50 → 80).

## World layout (200×200 tiles)

```
  NW  Skyreach Bluffs (AIR)  |  N  The Confluence (FINAL, gated)  |  NE  Cinderscale Wastes (FIRE)
  ---------------------------+------------------------------------+---------------------------
  W   scrub plains           |  C  Willow Marsh + BILLABONG VILLAGE |  E  riverlands
  ---------------------------+------------------------------------+---------------------------
  SW  Rootdeep Forest (EARTH)|  S  Gus's Burrow (start)            |  SE  Mistfall Lagoon (WATER)
```

- **Billabong Village** (hub): Elder Mirri (story, gives shield), Wombeau the Wombat (shop),
  Diamond Shrine (heart vessels), save statue, bow chest, villagers with hints.
- The **Confluence Gate** north of the village opens only with all 4 Key Shards.
- Regions have their own palettes, ambient particles, music, and enemy tables.

## Enemies (glow-ups of real platypus predators)

| Enemy            | Real predator     | Region        | Behavior                       |
|------------------|-------------------|---------------|--------------------------------|
| Rakali Rogue     | water rat         | Marsh (early) | scurrying chaser               |
| Marsh Adder      | snake             | Marsh         | wander + lunge                 |
| Snapjaw Whelp    | crocodile         | Fire          | telegraphed charge             |
| Emberfox         | red fox           | Fire          | fireball shooter, keeps range  |
| Magma Goanna     | goanna            | Fire          | tanky charger                  |
| Kooka Bomber     | kookaburra        | Fire/Air      | flying, drops bombs            |
| Volt Eel         | eel               | Water         | water-bound, electric zaps     |
| Gulper Cod       | Murray cod        | Water         | submerges, surfacing chomp     |
| Snapshell        | snapping turtle   | Water         | slow, heavily armored          |
| Storm Talon      | wedge-tailed eagle| Air           | circling dive-bomber           |
| Shadow Owl       | owl               | Air/Final     | swoops, briefly vanishes       |
| Dingo Raider     | dingo             | Earth         | hunts in packs                 |
| Wildcat Stalker  | feral cat         | Earth         | stealth pounce                 |
| Bramble Python   | carpet python     | Earth         | coiled lunge                   |
| Tazzy Whirl      | Tasmanian devil   | Earth/Final   | spinning dervish               |
| Goanna Knight    | goanna            | Final/late    | sword-and-shield duelist       |

Elite (palette-swapped, stronger) variants appear as the difficulty tier rises.

### Difficulty scaling

`tier = number of dungeons completed (0–4)`. Enemy HP/damage/coin drops scale with tier,
so the four element dungeons can be tackled in **any order** and stay challenging.

## Dungeons

Room-based (each room = one 25×15-tile screen, camera locks per room, Zelda 1 style).
Small keys, floor plates, eye switches, kill-all rooms, push blocks, a **Big Fang** (boss key),
a miniboss, an elemental arrow chest, and a boss guarding the **Key Shard**.

1. **Molten Maw** (Fire, NE) — lava channels, flame jets. Boss: **Scorchjaw, Croc-Dragon** —
   charge attacks, fire-breath sweeps; stunned when he charges a wall.
2. **Sunken Grotto** (Water, SE) — swim channels, whirlpools. Boss: **Murkmaw the Gulper
   Leviathan** — circles the pool, spits, leaps; only vulnerable surfaced.
3. **Tempest Spire** (Air, NW) — wind gust corridors. Boss: **Galestrike the Storm Eagle** —
   feather barrages, gust pushes, dive-bombs; stunned after a dive.
4. **Rootdeep Barrow** (Earth, SW) — push-block puzzles, burrowers. Boss: **King Goanna the
   Earthshaker** — shockwave stomps, boulder tosses, burrow charges.
5. **Nexus of Fangs** (Final, N) — all four elements combined; Light Arrows found mid-dungeon.
   Boss: **Apexus, the Primal Chimera** — five phases (fire/water/air/earth/apex), weak to Light.

## Economy (baseline prices)

- Sword L2–L5: 100 / 250 / 600 / 1200 coins
- Armor T1–T3: 80 / 300 / 800 coins
- Shield L2–L3: 120 / 400 coins · Bow L2–L3: 150 / 450 coins
- Arrow levels (per type) L2/L3: regular 40/120, elemental 60/180
- Ammo capacity: 80 / 250 coins · Crayfish snack: 25 · 10 arrows: 15
- Heart Vessels: 4, 6, 8, 10, 12, 14, 16, 18, 20 diamonds (9 vessels → 12 hearts max)

## Tech

- Vanilla JS ES modules, HTML5 Canvas 2D, zero dependencies, no build step.
- Internal resolution 400×240 (16px tiles), integer-scaled with `image-rendering: pixelated`.
- All art generated in code: ASCII pixel maps for creatures/items, procedural tile atlas.
- WebAudio-synthesized SFX and looping chiptune tracks per region.
- Save: `localStorage` (autosave on transitions + statue).
- Deploys as static files from repo root → GitHub Pages ready.

### Dev/debug

Open with `?debug=1` for cheats: F1 = unlock all gear, F2 = warp between dungeons,
F3 = full heal, F4 = +500 coins/+50 diamonds, G = god mode.

## File map

| File | Purpose |
|------|---------|
| `index.html`, `style.css` | shell, canvas scaling |
| `js/config.js` | constants, balance tables, key bindings, shop data |
| `js/util.js` | seeded RNG, math, AABB helpers |
| `js/input.js` | keyboard + touch state → named actions |
| `js/touch.js` | thumbstick, action buttons, menu taps, haptics |
| `js/font.js` | 5x7 bitmap font (canvas fillText blurs when upscaled) |
| `js/version.js` | build version constant — bump on every deploy |
| `js/updates.js` | polls version.js, self-refreshes stale sessions |
| `js/audio.js` | WebAudio SFX synth + music sequencer |
| `js/pixelart.js` | ASCII pixel-map sprite atlas |
| `js/tiles.js` | tile ids, defs, procedural tile atlas |
| `js/worldgen.js` | seeded overworld builder (regions, village, roads, spawners, props) |
| `js/dungeons.js` | 5 dungeons authored as ASCII rooms + parser |
| `js/entities.js` | player, projectiles, pickups, chests, NPCs, blocks |
| `js/enemies.js` | enemy AI archetypes, types, minibosses, bosses |
| `js/save.js` | localStorage save/load |
| `js/ui.js` | HUD, title, dialogs, shop, map, pause, death, victory |
| `js/game.js` | game orchestration: modes, camera, spawning, combat, transitions |
| `js/main.js` | boot + fixed-timestep loop |
