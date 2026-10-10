// After the credits: peace in the Vale, until a dolphin comes racing into the bay with
// sharks on his tail. Gus fights them off (for real, not in a movie), the dolphin says
// his name is Flipper, and he brings terrible news: MECHA APEXUS. To be continued...
//
// The flow: the `rescue` movie, then Billabong Bay (a one-screen beach built here) for the
// shark fight, then Flipper's news, then the `mecha` movie, then home to the village.

import { TILE } from './config.js';
import { dist, dirTo } from './util.js';
import { T } from './tiles.js';
import { Entity, Dolphin, HomePuggle, moveEntity } from './entities.js';
import { drawSprite } from './pixelart.js';
import { drawText } from './font.js';
import { audio } from './audio.js';
import { talk } from './endgame.js';
import { LM } from './worldgen.js';

export const LAGOON_ID = 'lagoon';
// two waves: three sharks chasing Flipper in, then three more that hear the commotion
const WAVES = [[[6, 3], [18, 3], [12, 6]], [[2, 2], [22, 2], [8, 5], [16, 5]]];

// Start the whole thing (straight after the credits).
export function startEpilogue(g) {
  g.playMovie('rescue', () => {
    g.loadArea(LAGOON_ID);
    g.mode = 'play';
    g.setBanner('SAVE THE DOLPHIN!', 'Beat the sharks! Fight them from the shallows.', '#7ad4ff');
    g.save();
  });
}

// ---------------------------------------------------------------- BILLABONG BAY
// '~' deep water  ':' shallows  '.' sand  'C' cliff  'P' palm
const MAP = [
  '~~~~~~~~~~~~~~~~~~~~~~~~~',
  'C~~~~~~~~~~~~~~~~~~~~~~~C',
  'C~~~~~~~~~~~~~~~~~~~~~~~C',
  'CC~~~~~~~~~~~~~~~~~~~~~CC',
  'C~~~~~~~~~~~~~~~~~~~~~~~C',
  'C~~~~~~~~~~~~~~~~~~~~~~~C',
  'C~~~~~~~~~~~~~~~~~~~~~~~C',
  'C:~~~~~~~~~~~~~~~~~~~~~:C',
  'C::::~~~~~~~~~~~~~~~::::C',
  'P:::::::::::::::::::::::P',
  'P.....::::......::::....P',
  'P.......................P',
  'P.......................P',
  'PP.....................PP',
  'PPPPPPPPPPPPPPPPPPPPPPPPP',
];
const CH = { '~': T.DEEP, ':': T.SHALLOW, '.': T.SAND, 'C': T.CLIFF, 'P': T.PALM };

export function buildLagoon() {
  const w = MAP[0].length, h = MAP.length;
  const tiles = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) tiles[y * w + x] = CH[MAP[y][x]] ?? T.SAND;
  const inB = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  const room = { rx: 0, ry: 0, letter: 'L', spawns: [], killall: false, plates: [], eyes: [], gdoors: [] };
  const at = (tx, ty) => [tx * TILE + 8, ty * TILE + 8];
  const props = [
    { kind: 'custom', make: () => new Fisher('dad', ...at(2, 10)) },
    { kind: 'custom', make: () => new Fisher('mum', ...at(5, 10)) },
    { kind: 'custom', make: () => new Flipper(...at(12, 4)) },
    ...[[17, 11], [19, 12], [21, 11], [18, 13], [22, 13], [20, 10]].map(([x, y], i) =>
      ({ kind: 'custom', make: () => new HomePuggle('puggle_' + (i * 9), ...at(x, y)) })),
  ];
  return {
    id: LAGOON_ID, type: 'dungeon', theme: 'ow', name: 'Billabong Bay', music: 'water',
    w, h, tiles, rooms: { '0,0': room }, bossRoom: null,
    get: (x, y) => inB(x, y) ? tiles[y * w + x] : T.CLIFF,
    set: (x, y, t) => { if (inB(x, y)) tiles[y * w + x] = t; },
    regionAt: () => -1,
    spawners: [], props, puzzles: [], links: [], unbuilt: [],
    noFamily: true, noWarp: true,       // Mum and Dad are busy fishing; and no leaving mid-rescue
    playerStart: { x: 12 * TILE + 8, y: 12 * TILE + 8 },
    roomAt: () => room,
    phase: 'fight', wave: 0, t: 0, cheerT: 5,
    onEnter: (g) => { audio.music('sharks'); sharkWave(g); },
    update: updateBay,
  };
}

const CHEERS = [
  ['Dad', 'Go get \'em, son!'], ['Mum', 'Careful, sweetheart!'], ['Dad', 'Wade in where it\'s shallow!'],
  ['Mum', 'You can do it, Gus!'], ['Dad', 'That\'s my boy!'],
];

function sharkWave(g) {
  const A = g.area;
  for (const [x, y] of WAVES[A.wave]) {
    g.spawnEnemy('shark', x * TILE + 8, y * TILE + 8, { roomBounds: g.roomBoundsPx(A.rooms['0,0']), noElite: true });
    g.burst(x * TILE + 8, y * TILE + 8, '#bfe8f2', 10);
  }
  A.wave++;
}

function updateBay(g, dt) {
  const A = g.area;
  A.t += dt;
  if (A.phase === 'fight') {
    if ((A.cheerT -= dt) <= 0) {
      A.cheerT = 7;
      const [who, line] = CHEERS[Math.floor(Math.random() * CHEERS.length)];
      g.toast(`${who}: ${line}`);
    }
    if (g.enemies().length) return;
    if (A.wave < WAVES.length) {
      sharkWave(g);
      audio.sfx('roar');
      g.toast('Uh oh -- MORE sharks!');
      return;
    }
    A.phase = 'won'; A.t = 0;
    audio.sfx('shard');
    audio.music('village');
    g.toast('The sharks swam away!');
    for (const e of g.ents) if (e.isFlipper) e.panic = false;
  } else if (A.phase === 'won' && A.t > 1.6) {
    A.phase = 'talk';
    talk(g, [
      ['Flipper', 'Phew... you saved me! THANK YOU! My name is FLIPPER!'],
      ['Flipper', 'Those sharks chased me all the way across the Big Blue Sea. But I had to get here -- I came to warn you!'],
      ['Dad', 'Warn us? About what, Flipper?'],
      ['Flipper', 'The whole world is under attack! A giant metal monster with glowing red eyes is smashing everything in its way...'],
      ['Flipper', 'They call it... MECHA APEXUS!'],
      ['Mum', 'Mecha... APEXUS?! But Gus already beat Apexus!'],
      ['Dad', "Looks like he's back. Bigger, and made of METAL."],
    ], () => g.playMovie('mecha', () => finishEpilogue(g)));
  }
}

function finishEpilogue(g) {
  g.state.flags.epilogue_done = true;
  g.loadArea('overworld', { x: LM.plaza[0] * TILE + 8, y: LM.plaza[1] * TILE + 8 });
  g.mode = 'play';
  g.toast('The Vale is peaceful... for now.');
  g.save();
}

// ---------------------------------------------------------------- FLIPPER
// A dolphin in a panic: he darts away from whichever shark is closest, leaping and crying for
// help. Once they're gone he calms down and swims over to the shallows to talk to Gus.
class Flipper extends Dolphin {
  constructor(x, y) {
    super(x, y, 'Flipper', '');
    this.isFlipper = true;
    this.panic = true;
    this.dartT = 0;
  }
  update(g, dt) {
    this.bob += dt;
    // leaps, a lot more often while he's scared
    if (this.z > 0 || this.vz > 0) {
      this.z += this.vz * dt; this.vz -= 150 * dt;
      if (this.z <= 0) { this.z = 0; this.vz = 0; audio.sfx('splash'); g.burst(this.cx, this.cy, '#bfe8f2', 8); }
    } else if ((this.leapT -= dt) <= 0) {
      this.leapT = this.panic ? 1.4 + Math.random() * 1.6 : 6 + Math.random() * 5;
      this.vz = 72;
      g.burst(this.cx, this.cy, '#bfe8f2', 6);
    }
    let tx, ty, spd;
    if (this.panic) {
      const sharks = g.enemies();
      const near = sharks.sort((a, b) => dist(a.cx, a.cy, this.cx, this.cy) - dist(b.cx, b.cy, this.cx, this.cy))[0];
      if ((this.dartT -= dt) <= 0) { this.dartT = 0.6 + Math.random() * 0.6; this.dir = Math.random() * Math.PI * 2; }
      if (near && dist(near.cx, near.cy, this.cx, this.cy) < 60) {
        [tx, ty] = [this.cx * 2 - near.cx, this.cy * 2 - near.cy];
      } else {
        tx = this.cx + Math.cos(this.dir) * 40; ty = this.cy + Math.sin(this.dir) * 40;
      }
      // ...but never into a corner: he stays out in the open bay where Gus can see him
      tx = Math.max(4 * TILE, Math.min(20 * TILE, tx));
      ty = Math.max(2 * TILE, Math.min(6 * TILE, ty));
      spd = 74;
    } else {
      // calm again: as close to Gus as the deep water goes
      const p = g.player;
      tx = p.cx; ty = p.cy - 20;
      spd = dist(this.cx, this.cy, tx, ty) > 20 ? 46 : 0;
    }
    const [dx, dy] = dirTo(this.cx, this.cy, tx, ty);
    const r = moveEntity(g, this, dx * spd * dt, dy * spd * dt);
    if (r.hitX || r.hitY) this.dartT = 0;
    if (Math.abs(dx) > 0.15 && spd) this.flip = dx < 0;
    else if (!spd) this.flip = g.player.cx < this.cx;
  }
  interact(g) { g.openDialog('Flipper', this.panic ? 'HELP! HELP! SHARKS!' : 'Thanks again, Gus!'); }
  draw(g, ctx) {
    super.draw(g, ctx);
    if (this.panic && Math.floor(g.time * 4) % 2 === 0)
      drawText(ctx, 'HELP!', this.cx, this.bottom - 24 - this.z, { align: 'center', color: '#ffffff' });
  }
}

// ---------------------------------------------------------------- MUM AND DAD, FISHING
// Standing on the sand with their rods out over the water, cheering Gus on.
class Fisher extends Entity {
  constructor(who, x, y) {
    super(x - 5, y - 4, 10, 8);
    this.who = who;
    this.name = who === 'dad' ? 'Dad' : 'Mum';
    this.solid = true;
    this.team = 'friend';
  }
  interact(g) {
    g.openDialog(this.name, g.area.phase === 'fight'
      ? (this.who === 'dad' ? "Those sharks are after that poor dolphin! Go on, son -- we'll keep the puggles back." : 'Be careful, Gus! Fight them from the shallow water, where you can swing!')
      : (this.who === 'dad' ? "Not a single bite all day. I think that dolphin scared the fish away." : "What a brave boy. That dolphin is lucky you were here."));
  }
  draw(g, ctx) {
    const cx = this.cx, by = this.bottom + 3;
    ctx.fillStyle = '#25324155';
    ctx.fillRect(Math.round(cx) - 5, Math.round(by) - 2, 10, 2);
    drawSprite(ctx, this.who + '_home', cx, by, { flip: this.who === 'mum' });
    if (g.state.flags.god_armor) drawSprite(ctx, 'armor7', cx, by, { flip: this.who === 'mum' });
    // the rod, out over the shallows, and the line down to a bobbing float
    const s = this.who === 'mum' ? -1 : 1;
    const tipX = cx + s * 10, tipY = this.y - 18;
    ctx.strokeStyle = '#8a5a34'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx + s * 4, this.cy - 4); ctx.lineTo(tipX, tipY); ctx.stroke();
    const bob = Math.sin(g.time * 3 + this.id) * 1;
    ctx.strokeStyle = '#e8e8e8';
    ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(tipX + s * 3, this.y - 22 + bob); ctx.stroke();
    ctx.fillStyle = '#e04a3a'; ctx.fillRect(Math.round(tipX + s * 3 - 1), Math.round(this.y - 23 + bob), 3, 2);
  }
}
