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
- **Sword** (from the start): arc slash, levels 1–6, upgraded at the shop. Finding all 50
  puggles earns the **God Sword** (level 7, see [Puggles](#puggles-and-the-god-sword)).
- **Shield** (from Elder Mirri): hold to block frontal hits; upgrades widen block/deflect projectiles.
- **Bow** (chest in Billabong Village): fires the selected arrow type; uses one shared ammo pool.
- **Armor**: levels 1–6, reduces damage, visually tints Gus.
- **Sprint** (hold V / `;`, or the `>>` touch button): 1.55x speed on land or in water for as
  long as the stamina bar lasts (3.2 s). The bar refills on its own after a short pause; run
  it dry and Gus is *winded* -- no sprinting until it climbs back past a third. The bar only
  appears in the HUD while it's below full. Tuning lives in `SPRINT` (config.js); the bar
  itself lives on the Game object, not the Player, so an area load is never a free refill.
- **Health**: starts at 3 hearts (1 heart = 2 HP), grows via Heart Vessels bought with diamonds,
  plus one per Key Shard. Max 20 (see [Economy](#economy-baseline-prices)).

Every upgrade track tops out at **Lv 6** (`MAX_LEVEL` in [js/config.js](js/config.js)) — see
[Upgrades](#upgrades--every-track-runs-to-lv-6) for the full table.

### Arrow types (each has its own level 1–6, upgraded at the shop)

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
lands in the lower-left), the sword auto-repeats while held, and every menu is tappable. Warp
home must be *held*, with a ring filling as it charges, so it can't fire by accident. Sprint
is the opposite: on touch a *tap latches it on* (the right thumb can't hold a button and still
reach the sword), dropping when Gus stops or runs dry, with a second tap to cancel; the button
wears the stamina bar as a ring. On a keyboard it's a plain hold.

Bindings live in `KEYMAP` ([js/config.js](js/config.js)) and reach players through the Controls
page in the pause menu ([js/ui.js](js/ui.js) `drawPause`), which lists them by hand — keep the
two in step when adding an action. Touch layout constants are in [js/touch.js](js/touch.js).

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

- **Billabong Village** (hub): Elder Mirri (story, gives shield), Wombeau the Wombat (shop,
  indoors), Diamond Shrine (heart vessels), save statue, bow chest, villagers with hints. All
  four cottages can be entered (see [Houses](#houses)).
- **Gus's Burrow** (start): a grassy mound with a round door in the glade south of the
  village. A new game begins inside it.
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

### Friends

Dolphins (6, in deep water) are `team: 'friend'` rather than `'enemy'`, which makes them
untargetable *by construction* — every combat path already filters on `team === 'enemy'`,
so no special-casing was needed in the sword, arrow or blast code. `hurt()` is additionally
a no-op so nothing can injure them even if a future code path reaches for it, and they deal
no contact damage. A `deepOnly` movement flag keeps them out of the shallows. They wander,
breach with a splash, escort Gus while he swims, and talk when you press interact.

### Difficulty scaling

`tier = number of dungeons completed (0–4)`. Enemy HP/damage/coin drops scale with tier,
so the four element dungeons can be tackled in **any order** and stay challenging.

## Dungeons

Room-based (each room = one 25×15-tile screen, camera locks per room, Zelda 1 style).
Small keys, floor plates, eye switches, kill-all rooms, push blocks, a **Big Fang** (boss key),
a miniboss, an elemental arrow chest, and a boss guarding the **Key Shard**. Picking up the
shard shows the KEY SHARD banner and then warps Gus straight back to the Billabong Village
plaza (the same `warpHome()` as the held warp button, with its effects), rather than leaving
him at the dungeon door -- the shop, shrine and every other dungeon's road start there.

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

## Upgrades — every track runs to Lv 6

The shop catalog is generated from `UPGRADE_TRACKS` rather than hand-listed (~60 entries),
and `getShopList()` only ever offers the *next* step of each track, so the visible shop
stays at 3-13 rows. A full kit is 57 purchases / 46,760 coins.

| Track | What each level buys |
|---|---|
| Sword | damage 1/2/3/4/6/8 |
| Armor | damage reduction 1-6 (a hit never drops below 1) |
| Shield | 2 blocks projectiles · 3 reflects · 4 wide arc · 5 no slow · 6 double reflect |
| Bow | cooldown 0.45s→0.21s, range 130→228, arrow speed 250→438 |
| Quiver | capacity 30/45/60/80/100/125/150 |
| Arrows | each of the 6 types levels 1-6 independently |

Armor is a visible overlay at every tier: Reed Vest, Scale Mail, Basalt Plate, Tideplate,
Stormweave, Guardian Aegis. Sword tier 6 (Riverlight Fang) adds a fifth trail layer.

Shields have their own sprite per tier (Bark, Iron, Mirror, Tide Bulwark, Storm Wall, Aegis
of Vale), growing 6x7 -> 10x12, and the silhouette telegraphs the mechanic — Lv4 is visibly
the widest because it's the wide-arc shield. Lv3+ carry a faint pulsing aura, and every
blocked hit fires a flare and expanding ring via `Player.onBlocked()` (shared by the melee
and projectile block paths so both read identically). The aura is kept deliberately dim: it
is on screen the whole time block is held, so it must not wash Gus out.

## Economy (baseline prices)

Gear prices come from `UPGRADE_TRACKS` in [js/config.js](js/config.js); arrow prices are
computed, not listed, as `ARROW_UP_BASE[type] × ARROW_UP_STEP[lv]`. Where this table and the
code disagree, the code wins.

| Track | Levels | Coins per step |
|---|---|---|
| Sword | 2–6 | 100 / 250 / 600 / 1200 / 2400 |
| Armor | 1–6 | 80 / 300 / 800 / 1500 / 2600 / 4200 |
| Shield | 2–6 | 120 / 400 / 900 / 1700 / 3000 |
| Bow | 2–6 | 150 / 450 / 950 / 1800 / 3200 |
| Quiver | 1–6 | 80 / 250 / 550 / 1000 / 1700 / 2800 |
| Arrows — regular | 2–6 | 40 / 120 / 240 / 400 / 640 |
| Arrows — fire/ice/lightning/bomb | 2–6 | 60 / 180 / 360 / 600 / 960 |
| Arrows — light | 2–6 | 100 / 300 / 600 / 1000 / 1600 |

- Consumables: crayfish snack 25 coins · 10 arrows 15 coins
- Heart Vessels: 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36 diamonds
  (13 vessels, 228 diamonds total → 16 hearts; +1 heart per Key Shard → 20 max)

## Ward puzzles (dungeon approaches)

Each elemental dungeon sits inside a two-tile-thick ring wall with a single gated doorway,
so the puzzle genuinely gates rather than being walk-aroundable. The puzzle itself lives in
a courtyard on the road just outside; the ring is the lock. Solved wards persist in
`state.flags.puzzle_<id>` and reopen on area load.

Every puzzle is solvable with **only the starting kit** (sword, shield, bow, regular arrows),
because the dungeons can be tackled in any order — none may require another dungeon's reward.
Two of the four (Root Wardens, Tide Wardens) need no bow at all, so a player who skipped the
village bow chest still has a way in.

| Dungeon | Ward | Mechanic |
|---|---|---|
| Fire | The Ember Locks | light 3 eyes within 6s or they all go dark |
| Air | The Windward Seals | shoot 4 eyes in the order the sign gives; a mistake resets |
| Earth | The Root Wardens | push 2 stone blocks onto 2 floor plates |
| Water | The Tide Wardens | 4 guardians wake on entry; beat them all |

## Side quests

Entirely optional -- the game is beatable without touching any of them -- but required to
100% a file. Defined in `SIDE_QUESTS` (config.js), keyed by id, with a `giver` (the NPC or
dolphin name that carries the dialogue and the reward) and a `kind`:

- **Fetch** (`bubbles_shell`, `marlo_ring`, `yuma_chime`): new → active → ready → done.
  Talking to the giver while `new` starts it; the reward item is a `trinket` prop hidden in
  the world that sets an item flag on pickup; talking again while `ready` pays out and
  completes it.
- **Rescue** (`barnaby_rescue`, `fenwick_rescue`): no offer step -- the NPC is already in
  trouble when found. Reuses the ward system's kill-all mechanic (a `puzzles` entry with a
  `quest` field instead of doors): approaching arms an ambush, and clearing every spawned
  enemy completes the quest and pays out automatically, no return trip needed.

Every quest giver shows a bobbing marker above their head so a quest is never missed:
yellow "!" for a new offer, gold for a ready turn-in, red for "help me now" (rescue,
mid-encounter). Fetch quests show nothing while the item is still out in the world, since
the point is finding it. The map's minimap plots a pink dot per giver (never per hidden
item, or it'd spoil the fetch) that fades to grey once done, plus a SIDE QUESTS checklist
next to the main QUEST list.

Fenwick and Yuma sit out at the map's far NE/NW corners and hit harder than the rest.
Fenwick's ambush is ten Fire-tier predators at once (vs. Barnaby's three marsh ones) --
the biggest single fight outside a dungeon. Yuma's fetch stacks two layers: the rockfall
still needs a bomb arrow like Marlo's, but a 3-strong nest of talons/an owl also has to be
fought off first. That guard fight is its own `puzzles` entry (`yuma_guard`) -- kill-all
like the rescues, but with no `quest` field, so clearing it doesn't complete the quest by
itself; it just clears the guards, via an optional `armToast`/`solvedBanner` override on the
puzzle so the flavor text doesn't say "THE WARD OPENS!" for a fight that isn't a ward.

Trinkets and chests sealed behind cracked rock are only interactable once at least one
cardinal-adjacent tile is open (`propReachable` in game.js) -- the flat pixel-radius interact
check alone was reachable through a single-tile wall by hugging it, letting players loot
walled items without ever bombing them open.

| Quest | Giver | Reward |
|---|---|---|
| Bubbles' Lost Shell | Bubbles (village pond dolphin) | 40 coins, 2 diamonds |
| A Friend in Trouble | Barnaby (marsh, cornered by predators) | 60 coins, 3 diamonds |
| Marlo's Ring | Marlo (village) | 50 coins, 3 diamonds |
| Fenwick's Peril | Fenwick (NE edge, Cinderscale Wastes) | 120 coins, 5 diamonds |
| Yuma's Wind Chime | Yuma (NW edge, Skyreach Bluffs) | 100 coins, 5 diamonds |

## Puggles and the God Sword

Fifty **puggles** (baby platypuses) are hidden around the overworld, Korok-style. Walking
into one sends it home to **Mama Pearl**, whose cottage stands in the Puggle Meadow just
outside the village's south gate on the burrow road. Every puggle found so far plays inside
(`HomePuggle`, laid out on a sunflower spiral around the middle of her rug so all fifty still
read as a crowd), and a "!" floats over the cottage roof until Gus has met her.
The map shows `PUGGLES n / 50`, puts a small dot where each found one was (like BotW's seed
markers, so blank stretches show where to look), and the file-select card shows the count.
Talking to Mama gives a hint: the region with the most puggles still out there. With 25 home,
she hands Gus the puggles' drawing of him (a [keepsake](#keepsakes)).

Each puggle has its own look, fixed by its id (`puggleLook` in entities.js): one of three
coats (tan, cream, chocolate) and either nothing or one accessory overlay -- a bow, leaf hat,
flower, stick sword, Gus's scarf, crown or sunglasses. Overlays share the puggle's padded
15x12 grid in pixelart.js so they register on both animation frames.

Placement lives at the end of `buildOverworld` (worldgen.js), built from fixed shapes with no
rng draws so nothing generated above it moves. **The number in each `puggle_N` id is a save
key: never renumber, only add** (and bump `PUGGLE_TOTAL` in config.js to match).

| Where | How it hides |
|---|---|
| Plain sight | tucked into a pocket of trees/mesa/basalt, a lava-lake island on a one-plank bridge, a lagoon islet, behind the Crucible, a thorn patch's heart |
| Under cover | tall grass or reeds (cut them), cracked rock or crystal (bomb arrow), or sealed in by a ring of cracked rock |
| Swimming | out in deep water: the lagoon, the river, the marsh pond |
| Puzzle | hidden until solved (below) |

A covered puggle glitters and gives the odd peep when Gus is close; puzzle puggles don't.
Uncovering one makes it hop out with a squeak.

**Puzzles** are ordinary `puzzles` entries with a `puggle` field instead of doors -- solving
one frees the puggle rather than opening a ward. Thirteen in all, every one solvable with the
starting kit except where the region itself needs more (the Confluence):

| Kind | Count | Mechanic |
|---|---|---|
| Stones (`blocks`) | 3 | push the stone(s) onto the plate(s) |
| Eyes (`sequence`/`timed`) | 4 | strike one eye in a mesa face, or light 2-3 eyes within a few seconds |
| Nest (`killall`) | 4 | a pack of the region's predators guards it |
| Puggle Dash (`race`) | 2 | step on the plate, reach the glowing ring in time; walking fails, sprinting makes it |

Solved puzzles stay solved on reload: eyes stay lit, stones sit on their plates, and the dash
plate stays pressed (this also applies to the ward puzzles).

**The God Sword** (`GOD_SWORD_LV` = 7) is granted the moment the fiftieth puggle is found:
20 damage a slash (Riverlight Fang is 8), a rainbow trail, and -- Zelda style -- while Gus is
at full health every swing also throws a **sword beam** (`SwordBeam`, `GOD_BEAM` in config):
one on screen at a time, same damage as the slash, bursts into four diagonal sparks, and
strikes eye switches like an arrow. A faint glitter at Gus's side means the beam is ready. It
is never sold: the shop's sword track ends at 6.

## Houses

Six buildings can be entered by walking into their front door (an `HDOOR` tile). Each interior
is a single-room area of `type: 'house'`, authored in [js/houses.js](js/houses.js) as an ASCII map
plus a furniture list. Rooms are smaller than the screen, so the camera centers them with dark
all round; stepping onto the doormat (`EXIT`) walks back out, in front of the same door.

| House | Where | Inside |
|---|---|---|
| Gus's Burrow | start glade (a mound with a round teal door) | his bed, Mum's knitting basket, Dad's armchair and empty sword rack, a family portrait, height marks on the wall, the fireplace, and the **keepsake gallery**: 20 stands |
| Mama Pearl's Cottage | Puggle Meadow, outside the south gate | Mama and every puggle found so far, cribs, a toy box, fifty tiny lunch bowls |
| Wombeau's Trading Post | village, northeast | the shop (talk to Wombeau or the counter), weapon rack, a crayfish tank |
| Pip & Dot's House | village, northwest | Pip's little sister Dot, a goldfish named Captain, thirty-seven identical pebbles |
| Tully's Curio Hut | village, southwest | Tully the echidna, who trades keepsake rumors; his wall map opens the world map |
| Marlo's House | village, southeast | a portrait of Marlo's dad; the ring box shows the ring once Marlo's quest is done |

- Village houses are tiles (`HDOOR`, `WINDOW`, `SHOPWALL` set into the `WALL` row); the burrow
  and the cottage are one big painted sprite (`Building`) over a solid `BUILDING` footprint, so
  Gus walks behind the roof and in front of the door.
- Furniture (`Furniture` in entities.js) is solid across its footprint; tall pieces rise over
  the back wall. `wall: true` pieces hang on the back wall instead. Inspecting one reads its
  `text`, or hands off by `talk` (shop counter, Tully's map, the gallery plaque).
- Interior tiles (floorboards, a two-row back wall, wall tops, rugs, doormat) are colored by
  per-house themes in `THEMES` (tiles.js); `drawInteriorEdges` adds wall shadows, lit wall
  lips and rug borders.
- The map works indoors too: it shows the Vale, with Gus's dot on the door he came in by.
  Houses play the `home` track (the shop keeps the village tune).
- A save made standing where a building now stands is nudged to the nearest open tile on
  load (`unstickPlayer`).

## Keepsakes

Twenty one-of-a-kind curios (`KEEPSAKES` in config.js). Walking into one plays an item-get
fanfare, Gus holds it up over his head, and it appears on its own stand in the gallery of his
burrow, where inspecting it reads its description. Empty stands show a "?" card. The map
counts them (`KEEPSAKES n / 20`) and dots each one found.

Eighteen are hidden in the overworld with the same shapes as the puggles (worldgen.js passes
a `keep` placer instead of `puggle`), and two are won:

| Keepsake | Where | How |
|---|---|---|
| Lucky Fishing Lure | village pond | in the reeds (cut them) |
| Wishing Stone | west marsh | tall grass patch |
| Old Boomerang | marsh, far west edge | nook in a ring of trees |
| Message in a Bottle | river, above the lagoon-road bridge | swim to it |
| Ember Egg | Cinderscale, far east | basalt nook |
| Fire Opal | Cinderscale, north edge | sealed in cracked rock |
| Obsidian Arrowhead | Cinderscale, south | under a cracked boulder |
| Moon Pearl | Mistfall Lagoon | a tiny island with one palm |
| Sea Glass | lagoon, east beach | palm grove nook |
| Brass Compass | lagoon, northeast beach | push the stone onto its mark |
| Red Kite | Skyreach, south | mesa nook |
| Star Stone | Skyreach, west edge | sealed in cracked rock |
| Golden Feather | Skyreach, south | guarded by a nest (talon, owl, talon) |
| Glow Mushroom | Rootdeep, far west | tall grass patch |
| Amber Drop | Rootdeep, south | inside a crystal (bomb arrow) |
| Spiral Fossil | Rootdeep, southeast | pine nook |
| Ancient Guardian Coin | Confluence, northeast | the heart of a thorn patch |
| Thunder Egg | Confluence, east of the Great Gate | under a cracked boulder |
| Crucible Trophy | the Crucible | clear wave 10 (`KEEPSAKE_ARENA_WAVE`) |
| Puggle Drawing | Mama Pearl | talk to her with 25 puggles home (`KEEPSAKE_PUGGLES`) |

Puzzle keepsakes are ordinary `puzzles` entries with a `keepsake` field, like the puggle
puzzles. **Tully** (Tully's Curio Hut) gives one rumor per chat, cycling through every
keepsake still missing; each has its own `hint` in config.js. Ids are save keys: never rename
one, and never reuse one for a different curio.

## The Crucible (wave arena)

A colosseum on the sand just outside the village's east gate — a coin/diamond sink-filler
that gives the shop and shrine economies somewhere to draw from once the overworld is farmed.

- Ring the gong to start at wave 1. Fighters land on telegraphed pads, never on top of you.
- Wave N: `min(8, 2 + N/2)` fighters, roster widening at waves 4/8/13/18, elite chance
  `(N-3) * 5%` capped at 50%, and a miniboss every 5th wave.
- Enemy tier is `max(story tier, min(6, N/3))`, so the arena scales past story progress.
- Rewards on clear: `15 + N*8` coins, plus `1 + N/10` diamonds on miniboss waves. A crayfish
  drops every 3rd wave. Winnings bank immediately, so dying never costs them.
- Six-second breather between waves: take the stairs to cash out, or ring the gong to rush
  the next one. Best wave persists per save file.

## Tech

- Vanilla JS ES modules, HTML5 Canvas 2D, zero dependencies, no build step.
- Internal resolution 400×240 (16px tiles), integer-scaled with `image-rendering: pixelated`.
- All art generated in code: ASCII pixel maps for creatures/items, procedural tile atlas.
  Maps use a small palette convention ([js/pixelart.js](js/pixelart.js)): an uppercase
  letter is the auto-derived highlight of its lowercase key, and a def's `shade` table
  derives darker tones (`s: ['b', -0.3]`) *after* a palette variant's overrides, so an
  elite recolor only swaps the base tones and every highlight, shadow and outline follows.
  Creatures carry an optional `map2` second pose (leg stride, wing downstroke, tail wag,
  tongue flick) built as `<name>_2` for every variant; `frameName()` picks the frame.
- WebAudio-synthesized SFX and looping chiptune tracks per region.
- Save: `localStorage` (autosave on transitions + statue).
- Deploys as static files from repo root → GitHub Pages ready.

### Dev/debug

Open with `?debug=1` for cheats: F1 = unlock all gear, F2 = warp between dungeons,
F3 = full heal, F4 = +500 coins/+50 diamonds, F5 = find all puggles but one (again for the
last, which grants the God Sword), F6 = find every keepsake (again to clear them), G = god mode.

## File map

| File | Purpose |
|------|---------|
| `index.html`, `style.css` | shell, canvas scaling |
| `js/config.js` | constants, balance tables, key bindings, shop data |
| `js/util.js` | seeded RNG, math, AABB helpers |
| `js/input.js` | keyboard + touch state → named actions |
| `js/touch.js` | thumbstick, action buttons, menu taps, haptics |
| `js/font.js` | 5x7 bitmap font (canvas fillText blurs when upscaled) |
| `js/arena.js` | The Crucible: wave arena layout, roster and reward curves |
| `js/version.js` | build version constant — bump on every deploy |
| `js/updates.js` | polls version.js, self-refreshes stale sessions |
| `js/audio.js` | WebAudio SFX synth + music sequencer |
| `js/pixelart.js` | ASCII pixel-map sprite atlas |
| `js/houseart.js` | furniture, keepsake and housemate art, plus the painted burrow and cottage |
| `js/tiles.js` | tile ids, defs, procedural tile atlas |
| `js/worldgen.js` | seeded overworld builder (regions, village, roads, spawners, props) |
| `js/dungeons.js` | 5 dungeons authored as ASCII rooms + parser |
| `js/houses.js` | the six house interiors (ASCII rooms + furniture) and where their doors are |
| `js/entities.js` | player, projectiles, pickups, chests, NPCs, blocks, keepsakes, furniture |
| `js/enemies.js` | enemy AI archetypes, types, minibosses, bosses |
| `js/save.js` | localStorage save/load |
| `js/ui.js` | HUD, title, dialogs, shop, map, pause, death, victory |
| `js/game.js` | game orchestration: modes, camera, spawning, combat, transitions |
| `js/main.js` | boot + fixed-timestep loop |
