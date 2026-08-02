# 🦆 Platypus Adventures — The Legend of Gus

### ▶ [Play it](https://jordancarney.github.io/platypus-adventures/)

An open-world action-adventure in the spirit of classic Zelda, starring **Gus the Platypus**.
Pure vanilla JavaScript + HTML5 Canvas. No dependencies, no build step — every sprite, tile
and sound is generated in code.

Cross the Vale, conquer the four elemental dungeons in any order, collect the Key Shards,
open the Great Gate, and defeat **Apexus, the Primal Chimera**. Plays with keyboard on
desktop and touch controls on phones and tablets.

## Features

- A 200×200-tile open world with six regions, each with its own palette, music and wildlife
- 5 room-based dungeons — Fire, Water, Air, Earth, and the combined Nexus of Fangs
- 16 enemy types (all real platypus predators, glowed up) plus 4 minibosses and 5 bosses
- Sword, shield, bow and 6 arrow types — fire, ice, lightning, bomb and light — all upgradable
- Visible gear: armor and sword tiers change how Gus and his swing actually look
- 3 save files, a shop, heart vessels, a world map, and a chiptune soundtrack

## Controls

### Keyboard

| Action | Input |
|---|---|
| Move | WASD / Arrow keys |
| Sword | Space / J / Z |
| Bow | K / X |
| Shield (hold) | L / C / Shift |
| Swap arrow type | Q / R (or 1–6) |
| Interact / talk / open | E / Enter |
| Warp home (hold ~1.6s) | T / H |
| World map | M |
| Pause | Esc / P |
| Mute | O |

### Touch (iPhone / iPad / Android)

On-screen controls appear automatically the first time you touch the screen, and hide again
if you use a keyboard — so a touchscreen laptop gets whichever you're actually using.

- **Move**: drag anywhere on the lower-left. The stick centers wherever your thumb lands,
  so there's no fixed pad to aim for.
- **Sword**: bottom-right. *Hold* it to keep swinging at full speed — no mashing.
- **Bow / Shield / Interact / Swap arrows**: the surrounding buttons. Buttons for gear you
  haven't found yet stay hidden. The swap button is tinted with your current arrow's colour.
- **Warp home / Map / Pause**: the three small buttons at the top. The warp button must be
  *held* — a ring fills around it as it charges, so it can't fire by accident.
- Move, attack, and block all work at once (multi-touch).
- **Menus** are fully tappable: tap a shop row to select it, tap again (or **BUY**) to
  purchase, **X** to close. Tap anywhere to advance dialogue or dismiss the map.

Landscape is recommended — the game is a 5:3 view, so landscape fills the screen. Portrait
works too, just smaller. Add it to your home screen for a fullscreen, browser-chrome-free game.

## How to play

- **Gus can swim** — deep water is passable (but you can't fight while paddling).
- **Dolphins are friends.** Six of them live in the deep water — Bindi, Splash, Echo, Nari,
  Coorong and Bubbles. They breach, trail wakes, swim alongside Gus when he takes to the
  water, and have advice if you talk to them. They cannot be hurt by anything, and they
  never hurt you.
- **Platycoins** buy upgrades at Wombeau's shop. Sword, armor, shield, bow, quiver and each
  of the 6 arrow types all upgrade to **Lv 6** — 57 purchases for a full kit. The shop only
  ever shows the next step of each track, so the list stays short. Armor, sword **and shield**
  tiers all change how Gus actually looks — the shield grows from a small bark round to the
  radiant Aegis of Vale, glows from Lv3 up, and flares whenever it turns a hit away.
- **Diamonds** buy Heart Vessels at the village Diamond Shrine — 13 of them, taking Gus from
  3 hearts up to 16. The final **4 hearts can't be bought**: one is awarded by each elemental
  dungeon along with its Key Shard, for a maximum of 20.
- **The Crucible** is the colosseum just out the village's east gate. Ring the gong and fight
  endless waves for coin and diamonds — enemies get more numerous, tougher and shinier every
  wave, with a miniboss every 5th and a diamond payout to match. Clear a wave and you have six
  seconds to take the stairs and bank your winnings, or stay in for the next one. Your best
  wave is recorded. Dying ends the run, but everything you earned is already yours.
- **Crayfish** drop from enemies and heal 2 hearts — Gus's favorite food.
- Each elemental dungeon is sealed behind a **ward puzzle** in a courtyard on its approach —
  you can't sneak around them, the ring wall goes all the way round. Each is a different kind:
  the **Ember Locks** (light three eyes with arrows before the first burns out), the
  **Windward Seals** (shoot four eyes in the order the sign gives), the **Root Wardens**
  (push the old stones onto the old marks), and the **Tide Wardens** (beat the guardians that
  wake when you enter). Solve one and it stays open. Signs at each courtyard tell you the rule.
- Each elemental dungeon awards its **arrow type** (fire/ice/lightning/bomb) plus a **Key Shard**.
- **Light Arrows** (found in the final dungeon) are the strongest — every predator fears them.
- Enemies grow stronger with every dungeon you clear; shiny **elite** variants drop extra loot.
- **Lost, stuck, or nearly dead?** Hold **T** (or the warp button on touch) for about a second
  and a half to teleport back to Billabong Village — works from inside dungeons and even
  mid-boss-fight. Let go before it fills to cancel.
- Save at the village statue (it also fully heals you). Progress auto-saves at key moments.
- **Three save files.** The file-select screen shows each one's full loadout — Gus wearing his
  armor, gear levels, arrow types owned, coins, diamonds, hearts, shards and dungeons cleared —
  so you can tell them apart at a glance. `Q` (or the **X** button) erases a file.

## Run locally

ES modules can't load from `file://`, so serve the folder. Use the included dev server —
it disables caching, which plain `http.server` does not (browsers will happily serve you
stale JS after an edit otherwise):

```bash
python3 dev_server.py 8642
```

Then open http://localhost:8642 — or use `npx serve`, VS Code Live Server, etc.

### Dev cheats

Open with `?debug=1`:
F1 = full gear · F2 = warp between landmarks · F3 = heal · F4 = +500 coins/+50 diamonds · G = god mode

## Deploys

The repo root is the site — no build step, no dependencies:

1. Push to `main`.
2. Repo **Settings → Pages → Source**: deploy from a branch, `main`, `/ (root)`.
3. The game is live at https://jordancarney.github.io/platypus-adventures/.

Every push to `main` publishes automatically. All asset paths are relative, so it works
from a subpath like `/platypus-adventures/` without configuration. The `.nojekyll` file
tells Pages to publish the files as-is instead of running them through Jekyll.

### Releasing an update

**Bump `VERSION` in [js/version.js](js/version.js) as part of the deploy.** Live sessions
poll that file with caching disabled (on load, every 10 minutes, and whenever the tab is
foregrounded) and reload themselves when it changes — immediately on the title screen,
or deferred until the player returns there. This is what rescues a phone/iPad tab that's
been open since before the deploy; without the bump, devices still update, but only after
their normal cache expiry and a manual reload. The running build is stamped in the corner
of the title screen.

## Project layout

```
index.html       Canvas host + boot script tag
style.css        Page chrome around the canvas
dev_server.py    Local dev server with caching disabled
js/main.js       Boot + fixed-timestep game loop
js/game.js       Orchestration: modes, areas, camera, spawning, combat, economy
js/config.js     Constants, balance tables, bindings, shop data
js/worldgen.js   Deterministic 200×200 overworld, 5 regions around a central hub
js/dungeons.js   Five dungeons authored as ASCII rooms + parser
js/arena.js      The Crucible wave arena
js/enemies.js    Enemy AI archetypes, bestiary, minibosses, bosses
js/entities.js   Player, projectiles, pickups, chests, props, push blocks
js/pixelart.js   Character/item art as ASCII pixel maps, baked to offscreen canvases
js/tiles.js      Tile ids, properties, procedurally painted tile atlas
js/font.js       5×7 bitmap font (no antialiasing, so it stays crisp when scaled)
js/ui.js         HUD, title screen, dialogs, shop, shrine, map, pause, death, credits
js/input.js      Keyboard + touch state mapped to named actions
js/touch.js      Floating thumbstick + action buttons + menu taps
js/audio.js      Synthesized sound effects + chiptune sequencer (WebAudio, no assets)
js/save.js       localStorage persistence across three save slots
js/updates.js    Detects new deploys and refreshes stale sessions
js/version.js    Single source of truth for the build version — bump on every deploy
js/util.js       Math, RNG, geometry helpers
```

See [DESIGN.md](DESIGN.md) for the full game design document and file map.
