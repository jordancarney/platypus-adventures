# 🦆 Platypus Adventures — The Legend of Gus

### ▶ [Play it](https://jordancarney.github.io/platypus-adventures/)

A game my kid is making, inspired by classic Zelda and his love of platypuses. An open-world
action-adventure starring **Gus the Platypus**: cross the Vale, clear the elemental dungeons
in any order, and face **Apexus, the Primal Chimera**.

Plays with keyboard on desktop and touch on phones and tablets. The full control list is in
the pause menu, and touch controls appear on their own the first time you touch the screen.
Landscape is recommended, and it works nicely added to a home screen.

## Features

- A large open world of distinct regions, each with its own palette, music and wildlife
- Room-based elemental dungeons, tackled in any order, each sealed behind a ward puzzle
- A bestiary of real platypus predators, glowed up, plus minibosses and bosses
- Sword, shield, bow and elemental arrows, all upgradable at the village shop
- Visible gear: armor, sword and shield tiers change how Gus actually looks
- A wave arena, heart vessels, a world map, multiple save files, and a chiptune soundtrack
- Optional side quests -- fetch errands and a friend to rescue -- marked with a "!" and
  tracked on the map, for players chasing 100%

## Built with

Vanilla JavaScript ES modules and HTML5 Canvas. No dependencies, no build step, no asset
files — every sprite, tile and sound is generated in code.

## Run locally

ES modules can't load from `file://`, so serve the folder. Use the included dev server —
it disables caching, which plain `http.server` does not (browsers will happily serve you
stale JS after an edit otherwise):

```bash
python3 dev_server.py 8642
```

Then open http://localhost:8642 — or use `npx serve`, VS Code Live Server, etc.

Open with `?debug=1` for dev cheats; [DESIGN.md](DESIGN.md) lists them.

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

See [DESIGN.md](DESIGN.md) for the full design document — world, dungeons, bestiary, balance
tables, and the file map.
