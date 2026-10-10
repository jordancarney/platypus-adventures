// Playing with the puggles. Talk to any puggle to PET it (it does a happy hop and hearts
// float up) or ask it to COME ALONG: one buddy at a time follows Gus everywhere, and gives
// a little squeak when another puggle is hiding nearby. At Mama Pearl's cottage, Mama
// starts a game of FETCH (throw the ball with E, the puggles race for it and bring it back)
// or TAG (catch every puggle before the time runs out).

import { dist, dirTo, aabb, clamp, DIRS } from './util.js';
import { Entity, moveEntity, drawPuggle, puggleLook, Puggle, Pickup } from './entities.js';
import { drawSprite } from './pixelart.js';
import { audio } from './audio.js';

const NAMES = ['Pip-squeak', 'Bubbles', 'Nibbles', 'Paddles', 'Dot', 'Biscuit', 'Splish', 'Peanut', 'Wiggles', 'Muddy',
  'Sprout', 'Pebble', 'Noodle', 'Puddle', 'Button'];
export const puggleName = (id) => NAMES[(parseInt(String(id).split('_')[1], 10) || 0) % NAMES.length];

// ---------------------------------------------------------------- talking to a puggle
export function puggleChat(g, pg) {
  if (g.puggleGame) return;                        // mid-game: no stopping for a chat!
  const st = g.state, id = pg.pid, name = puggleName(id);
  const isBuddy = st.buddy === id;
  const choices = [{ label: 'Pet', fn: () => pet(g, pg) }];
  if (isBuddy) choices.push({ label: 'Go home', fn: () => sendHome(g, pg) });
  else if (id && st.puggles[id]) choices.push({ label: 'Come with me!', fn: () => adopt(g, pg) });
  choices.push({ label: 'Bye!', fn: () => {} });
  g.openDialog(name, isBuddy ? `${name} wiggles happily. Where to next, Gus?` : `${name} looks up at you and squeaks!`, null, choices);
}

export function pet(g, pg) {
  pg.happyT = 1.8;
  pg.vz = 70;
  audio.sfx('peep');
  setTimeout(() => audio.sfx('heart'), 120);
  g.toast(['Squee!', 'Happy wiggles!', 'Purrr... (puggles purr?)', 'It loves you!', 'Tummy rub!'][Math.floor(Math.random() * 5)]);
}

function adopt(g, pg) {
  const st = g.state;
  // the old buddy goes back to Mama's; this one hops along with Gus
  for (const e of g.ents) if (e instanceof Buddy) e.dead = true;
  st.buddy = pg.pid;
  if (pg.isBrood) pg.dead = true;
  g.spawn(new Buddy(pg.pid, pg.cx, pg.cy));
  audio.sfx('puggle');
  g.toast(`${puggleName(pg.pid)} is coming with you!`);
  g.save();
}
function sendHome(g, pg) {
  g.state.buddy = null;
  pg.dead = true;
  g.burst(pg.cx, pg.cy - 4, '#f2d29c', 10);
  audio.sfx('warpOff');
  g.toast(`${puggleName(pg.pid)} scampers home to Mama Pearl.`);
  g.save();
}

// ---------------------------------------------------------------- the buddy
// One puggle tagging along behind Gus. It never gets hurt, hops to keep up, pops back
// beside him if it falls too far behind, and sniffs out other puggles.
export class Buddy extends Entity {
  constructor(id, x, y) {
    super(x - 5, y - 4, 10, 8);
    this.pid = id;
    this.look = puggleLook(id);
    this.z = 0; this.vz = 0;
    this.flip = false;
    this.happyT = 0;
    this.sniffT = 2;
    this.sniffed = new Set();
    this.shy = 10;
    this.isBuddy = true;
  }
  interact(g) { puggleChat(g, this); }
  update(g, dt) {
    hop(this, dt);
    this.happyT = Math.max(0, this.happyT - dt);
    if (this.happyT > 0 && Math.random() < dt * 6) g.addParticle(this.cx, this.y - 6, '#ff8ab8', 0.7, (Math.random() - 0.5) * 10, -20, 2);
    const p = g.player;
    const room = g.area.type === 'dungeon' && g.curRoom ? g.roomBoundsPx(g.curRoom) : null;
    const d = dist(this.cx, this.cy, p.cx, p.cy);
    if (d > 220 || (room && !(this.cx >= room.x && this.cx < room.x + room.w && this.cy >= room.y && this.cy < room.y + room.h))) {
      this.x = p.cx - 5 - (p.flip ? -10 : 10); this.y = p.cy - 4;
      return;
    }
    // trot along a little behind him
    const [fx, fy] = DIRS[p.facing] || [0, 1];
    const tx = p.cx - fx * 16, ty = p.cy - fy * 12 + 4;
    const dd = dist(this.cx, this.cy, tx, ty);
    if (dd > 6) {
      const [ux, uy] = dirTo(this.cx, this.cy, tx, ty);
      const spd = Math.min(140, 30 + dd * 3);
      const was = this.swims; this.swims = true;
      const r = moveEntity(g, this, ux * spd * dt, uy * spd * dt);
      this.swims = was;
      if ((r.hitX || r.hitY) && dd > 40) { this.x = tx - 5; this.y = ty - 4; }
      this.flip = ux < 0;
      if (this.z <= 0 && Math.random() < dt * 4) this.vz = 50;
    } else this.flip = p.cx < this.cx;
    // a sniff now and then: is another puggle hiding close by?
    if ((this.sniffT -= dt) <= 0) {
      this.sniffT = 1.5;
      for (const e of g.ents) {
        if (!(e instanceof Puggle) || e.dead || this.sniffed.has(e.pid) || dist(e.cx, e.cy, this.cx, this.cy) > 90) continue;
        this.sniffed.add(e.pid);
        this.happyT = 1; this.vz = 80;
        audio.sfx('peep');
        g.toast(`${puggleName(this.pid)} sniffs... another puggle is hiding nearby!`);
        break;
      }
    }
  }
  draw(g, ctx) {
    ctx.fillStyle = '#25324144';
    ctx.fillRect(Math.round(this.cx) - 3, Math.round(this.bottom), 6, 1);
    drawPuggle(ctx, this.look, this.cx, this.bottom + 1 - this.z, { flip: this.flip, waddle: this.z > 0 });
  }
}
function hop(e, dt) {
  if (e.z > 0 || e.vz > 0) {
    e.z += e.vz * dt; e.vz -= 300 * dt;
    if (e.z <= 0) { e.z = 0; e.vz = 0; }
  }
}

// Bring the buddy along into a new area (or Mama's, where it skips the brood).
export function spawnBuddy(g) {
  const id = g.state.buddy;
  if (!id || g.area.noFamily) return;
  g.ents.push(new Buddy(id, g.player.cx - 12, g.player.cy + 4));
}

// ---------------------------------------------------------------- games at Mama's
export function mamaGames(g) {
  const home = g.ents.filter(e => e.isBrood && !e.dead);
  if (!home.length) return null;
  return [
    { label: 'Play fetch!', fn: () => startFetch(g) },
    { label: 'Play tag!', fn: () => startTag(g, home) },
    { label: 'Bye, Mama!', fn: () => {} },
  ];
}

function startFetch(g) {
  for (const e of g.ents) if (e instanceof Ball) e.dead = true;
  const ball = g.spawn(new Ball(g.player.cx, g.player.cy));
  ball.state = 'held';
  g.puggleGame = { kind: 'fetch', ball, fetches: 0 };
  g.toast('Press E to throw the ball!');
  audio.sfx('blip');
}
function startTag(g, home) {
  const time = clamp(10 + home.length * 1.5, 15, 60);
  g.puggleGame = { kind: 'tag', t: time, total: home.length, caught: 0 };
  for (const pg of home) pg.tagged = false;
  g.toast('Tag! Catch every puggle!');
  audio.sfx('fanfare');
}

// While a game's on, E is for the ball rather than for talking. Returns true if it used E.
export function puggleGameInput(g) {
  const G = g.puggleGame;
  if (!G || G.kind !== 'fetch' || G.ball.state !== 'held') return false;
  const p = g.player, [dx, dy] = DIRS[p.facing];
  G.ball.state = 'fly';
  G.ball.x = p.cx - 3 + dx * 8; G.ball.y = p.cy - 3 + dy * 8;
  G.ball.vx = dx * 190; G.ball.vy = dy * 190;
  G.ball.z = 6; G.ball.vz = 60;
  audio.sfx('arrow');
  return true;
}

export function updatePuggleGame(g, dt) {
  const G = g.puggleGame;
  if (!G) return;
  if (G.kind === 'tag') {
    G.t -= dt;
    const p = g.player;
    for (const pg of g.ents) {
      if (!pg.isBrood || pg.dead || pg.tagged) continue;
      if (aabb(p.box(), pg.box())) {
        pg.tagged = true; pg.happyT = 1.2; pg.vz = 80;
        G.caught++;
        audio.sfx('peep');
        g.burst(pg.cx, pg.cy - 4, '#ffe95c', 6);
      }
    }
    if (G.caught >= G.total) {
      g.puggleGame = null;
      audio.sfx('fanfare');
      const coins = 5 + G.total * 2;
      g.state.coins += coins;
      g.setBanner('YOU CAUGHT THEM ALL!', `The puggles giggle and give you ${coins} coins!`, '#f2d29c');
      if (Math.random() < 0.5) g.spawn(new Pickup(p.cx, p.cy, 'diamond'));
    } else if (G.t <= 0) {
      g.puggleGame = null;
      audio.sfx('winded');
      g.state.coins += G.caught;
      g.toast(`Time's up! You tagged ${G.caught} of ${G.total}. (+${G.caught} coins)`);
    }
    if (!g.puggleGame) for (const pg of g.ents) if (pg.isBrood) pg.tagged = false;
  }
}

// How a puggle at Mama's behaves while a game's on. Returns true if it took over.
export function puggleGameStep(g, pg, dt) {
  const G = g.puggleGame;
  if (!G) return false;
  const p = g.player;
  const run = (tx, ty, spd) => {
    const [ux, uy] = dirTo(pg.cx, pg.cy, tx, ty);
    const r = moveEntity(g, pg, ux * spd * dt, uy * spd * dt);
    if (Math.abs(ux) > 0.2) pg.flip = ux < 0;
    if (pg.z <= 0 && Math.random() < dt * 5) pg.vz = 45;
    return r;
  };
  if (G.kind === 'tag') {
    if (pg.tagged) { pg.flip = p.cx < pg.cx; return true; }
    // scamper away from Gus, wiggling side to side so they don't all bunch in a corner
    const d = dist(pg.cx, pg.cy, p.cx, p.cy);
    if (d < 70) {
      const wig = Math.sin(g.time * 3 + pg.id) * 40;
      const r = run(pg.cx * 2 - p.cx + wig, pg.cy * 2 - p.cy - wig, 46 + (pg.id % 5) * 4);
      if (r.hitX || r.hitY) run(pg.cx + (Math.random() - 0.5) * 60, pg.cy + (Math.random() - 0.5) * 60, 60);
    }
    return true;
  }
  if (G.kind === 'fetch') {
    const b = G.ball;
    if (b.state === 'held') return false;
    if (b.state === 'carried') {
      if (b.carrier !== pg) return false;
      // bring it back to Gus, then drop it at his feet
      run(p.cx, p.cy, 62);
      b.x = pg.cx - 3; b.y = pg.cy - 10;
      if (dist(pg.cx, pg.cy, p.cx, p.cy) < 16) {
        b.state = 'ground'; b.carrier = null; b.z = 0;
        b.x = (pg.cx + p.cx) / 2 - 3; b.y = (pg.cy + p.cy) / 2;
        pg.happyT = 1.5; pg.vz = 70;
        G.fetches++;
        audio.sfx('peep');
        if (G.fetches % 3 === 0) g.toast(`Good puggle, ${puggleName(pg.pid)}! (${G.fetches} fetches)`);
      }
      return true;
    }
    // everyone races for the ball
    run(b.cx, b.cy, 44 + (pg.id % 7) * 5);
    if (b.state === 'ground' && b.z <= 0 && aabb(pg.box(), b.box()) && b.cooldown <= 0) {
      b.state = 'carried'; b.carrier = pg;
      audio.sfx('blip');
    }
    return true;
  }
  return false;
}

// The ball for fetch: held over Gus's head, flying, bouncing, or in a puggle's mouth.
export class Ball extends Entity {
  constructor(x, y) {
    super(x - 3, y - 3, 6, 6);
    this.state = 'ground';
    this.vx = 0; this.vy = 0; this.z = 0; this.vz = 0;
    this.cooldown = 0;
  }
  update(g, dt) {
    const p = g.player;
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (!g.puggleGame || g.puggleGame.ball !== this) { this.dead = true; return; }
    if (this.state === 'held') { this.x = p.cx - 3; this.y = p.cy - 20; return; }
    if (this.state === 'fly') {
      const r = moveEntity(g, this, this.vx * dt, this.vy * dt);
      if (r.hitX) { this.vx *= -0.6; audio.sfx('blip'); }
      if (r.hitY) { this.vy *= -0.6; audio.sfx('blip'); }
      this.z += this.vz * dt; this.vz -= 260 * dt;
      if (this.z <= 0) { this.z = 0; this.vz = Math.abs(this.vz) > 30 ? -this.vz * 0.45 : 0; }
      this.vx *= Math.pow(0.25, dt); this.vy *= Math.pow(0.25, dt);
      if (Math.hypot(this.vx, this.vy) < 12 && this.z <= 0) { this.state = 'ground'; this.cooldown = 0.2; }
      return;
    }
    // lying there: Gus picks it up by walking over it
    if (this.state === 'ground' && aabb(p.box(), this.box())) { this.state = 'held'; audio.sfx('blip'); }
  }
  draw(g, ctx) {
    if (this.state !== 'held' && this.state !== 'carried') {
      ctx.fillStyle = '#25324155';
      ctx.fillRect(Math.round(this.cx) - 2, Math.round(this.bottom), 5, 1);
    }
    drawSprite(ctx, 'ball', this.cx, this.bottom - this.z);
  }
}

// The tag clock, up top while a game's on.
export function drawPuggleGame(g, ctx, text) {
  const G = g.puggleGame;
  if (!G || G.kind !== 'tag') return;
  text(ctx, `TAG!  ${G.caught} / ${G.total}   ${Math.ceil(G.t)}s`, 200, 30, { size: 9, align: 'center', color: G.t < 5 ? '#ff8a7a' : '#f2d29c' });
}
