# 🦆 Platypus Adventures — The Legend of Gus

An open-world action-adventure in the spirit of classic Zelda, starring **Gus the Platypus**.
Pure vanilla JavaScript + HTML5 Canvas. No dependencies, no build step — every sprite and
sound is generated in code.

**Play:** cross the Vale, conquer the four elemental dungeons in any order, collect the
Key Shards, open the Great Gate, and defeat **Apexus, the Primal Chimera**.

## Run locally

Any static file server works (ES modules can't load from `file://`):

```bash
python3 -m http.server 8642
```

Then open http://localhost:8642 — or use `npx serve`, VS Code Live Server, etc.

## Deploy to GitHub Pages

The repo root is the site — no build step:

1. Push to GitHub.
2. Repo **Settings → Pages → Source**: deploy from branch, `main`, `/ (root)`.
3. Your game is live at `https://<user>.github.io/<repo>/`.

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
- **Map / Pause**: the two small buttons at the top.
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
- Save at the village statue (it also fully heals you). Progress auto-saves at key moments.

## Dev cheats

Open with `?debug=1`:
F1 = full gear · F2 = warp between landmarks · F3 = heal · F4 = +500 coins/+50 diamonds · G = god mode

## Project layout

See [DESIGN.md](DESIGN.md) for the full game design document and file map.
# platyplus-adventures
