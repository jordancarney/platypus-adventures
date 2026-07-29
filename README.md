# 🦆 Platypus Adventures — The Legend of Gus

### ▶ [Play it here](https://jordancarney.github.io/platypus-adventures/)

An open-world action-adventure in the spirit of classic Zelda, starring **Gus the Platypus**.
Pure vanilla JavaScript + HTML5 Canvas. No dependencies, no build step — every sprite, tile
and sound is generated in code.

Cross the Vale, conquer the four elemental dungeons in any order, collect the Key Shards,
open the Great Gate, and defeat **Apexus, the Primal Chimera**. Plays with keyboard on
desktop and touch controls on phones and tablets.

**Features**

- A 200×200-tile open world with six regions, each with its own palette, music and wildlife
- 5 room-based dungeons — Fire, Water, Air, Earth, and the combined Nexus of Fangs
- 16 enemy types (all real platypus predators, glowed up) plus 4 minibosses and 5 bosses
- Sword, shield, bow and 6 arrow types — fire, ice, lightning, bomb and light — all upgradable
- Visible gear: armor and sword tiers change how Gus and his swing actually look
- 3 save files, a shop, heart vessels, a world map, and a chiptune soundtrack

## Run locally

ES modules can't load from `file://`, so serve the folder. Use the included dev server —
it disables caching, which plain `http.server` does not (browsers will happily serve you
stale JS after an edit otherwise):

```bash
python3 dev_server.py 8642
```

Then open http://localhost:8642 — or use `npx serve`, VS Code Live Server, etc.

## Deploy to GitHub Pages

The repo root is the site — no build step, no dependencies:

1. Push to GitHub.
2. Repo **Settings → Pages → Source**: deploy from a branch, `main`, `/ (root)`.
3. Your game is live at `https://<user>.github.io/<repo>/`.

All asset paths are relative, so it works from a subpath like `/platypus-adventures/`
without configuration. The `.nojekyll` file tells Pages to publish the files as-is instead
of running them through Jekyll.

### Releasing an update

Bump `VERSION` in [js/version.js](js/version.js) as part of the deploy. Live sessions
poll that file with caching disabled (on load, every 10 minutes, and whenever the tab is
foregrounded) and reload themselves when it changes — immediately on the title screen,
or deferred until the player returns there. This is what rescues a phone/iPad tab that's
been open since before the deploy; without the bump, devices still update, but only after
their normal cache expiry and a manual reload. The running build is stamped in the corner
of the title screen.

## Controls

### Keyboard

| Action | Keys |
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
- **Platycoins** buy sword/shield/bow/armor/arrow upgrades at Wombeau's shop.
- **Diamonds** buy Heart Vessels at the village Diamond Shrine.
- **Crayfish** drop from enemies and heal 2 hearts — Gus's favorite food.
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

## Dev cheats

Open with `?debug=1`:
F1 = full gear · F2 = warp between landmarks · F3 = heal · F4 = +500 coins/+50 diamonds · G = god mode

## Project layout

See [DESIGN.md](DESIGN.md) for the full game design document and file map.
