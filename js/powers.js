// Gus's five powers, one from each of the Platypus Kingdom's dungeons, and the things in the
// world they work on.
//   shovel  dig up the ground in front of him: sometimes there's something down there
//   jump    hop over pits, holes and low walls
//   dash    a burst of speed that smashes rubble and shrugs off every hit
//   dive    sink under deep water: out of harm's way, under rock arches, onto secret spots
//   hook    throw the grapple: it bites into a gold-ringed post and zips him across
//
// The Player calls powerMotion() before walking (a jump, a dash, a zip or a dig moves Gus
// himself) and usePower() when F is pressed. Everything takes the Game as `g`.

import { TILE, POWER, POWERS, POWER_INFO, SWORD_DMG } from './config.js';
import { dist, dirTo, aabb, DIRS } from './util.js';
import { T, props as tileProps } from './tiles.js';
import { Entity, moveEntity, walkable, Pickup } from './entities.js';
import { drawSprite } from './pixelart.js';
import { audio } from './audio.js';

export const hasPower = (st, id) => !!(st.powers && st.powers[id]);

// The next power Gus owns after the selected one (G / the HUD box).
export function nextPower(g) {
  const st = g.state, owned = POWERS.filter(id => hasPower(st, id));
  if (!owned.length) return;
  st.powerSel = owned[(owned.indexOf(st.powerSel) + 1) % owned.length];
  audio.sfx('blip');
  g.toast(POWER_INFO[st.powerSel].name + '!');
}

// Handed a new power from a dungeon's big chest.
export function grantPower(g, id) {
  const st = g.state;
  st.powers = st.powers || {};
  st.powers[id] = true;
  st.powerSel = id;
  const info = POWER_INFO[id];
  g.setBanner(info.item + '!', info.how, info.color, null, info.sprite);
}

// ---------------------------------------------------------------- the motion of a power
// Returns true while a power is moving Gus (or rooting him to the spot), so walking,
// fighting and hazards all wait for it.
export function powerMotion(g, p, dt) {
  p.powerCd = Math.max(0, (p.powerCd || 0) - dt);
  if (p.diving) updateDive(g, p, dt);
  if (p.jump) return updateJump(g, p, dt);
  if (p.dash) return updateDash(g, p, dt);
  if (p.zip) return updateZip(g, p, dt);
  if (p.dig) return updateDig(g, p, dt);
  if (p.hook && !p.hook.dead) { p.moving = false; return true; }
  return false;
}

// F. (ax, ay) is where the stick is pointing, if anywhere.
export function usePower(g, p, ax, ay) {
  const st = g.state;
  if (p.powerCd > 0 || p.jump || p.dash || p.zip || p.dig || (p.hook && !p.hook.dead)) return;
  // in deep water, F is always the dive
  if (p.swimming) {
    if (hasPower(st, 'dive')) toggleDive(g, p);
    else if (st.powerSel) g.toast("You can't do that while swimming!");
    return;
  }
  const id = st.powerSel;
  if (!id || !hasPower(st, id)) return;
  const dir = ax || ay ? [ax, ay] : DIRS[p.facing];
  switch (id) {
    case 'shovel': p.dig = { t: POWER.digTime }; audio.sfx('dig'); break;
    case 'jump': startJump(g, p, dir); break;
    case 'dash': startDash(g, p, dir); break;
    case 'dive': g.toast('Jump into deep water first, then press F to dive!'); break;
    case 'hook': throwHook(g, p); break;
  }
}

// Can `e` stand where it is, feet on the ground?
function canStand(g, e) {
  const was = e.airborne;
  e.airborne = false;
  const ok = [[e.x + 1, e.y + 1], [e.x + e.w - 1, e.y + 1], [e.x + 1, e.y + e.h - 1], [e.x + e.w - 1, e.y + e.h - 1]]
    .every(([x, y]) => walkable(g.area.get(Math.floor(x / TILE), Math.floor(y / TILE)), e));
  e.airborne = was;
  return ok;
}

// Down a hole: back to where he jumped from, a heart the poorer.
function fall(g, p, [x, y]) {
  g.burst(p.cx, p.cy, '#2a2030', 10);
  audio.sfx('poof');
  p.x = x; p.y = y;
  p.hurt(g, 2, p.cx, p.cy, true);
  g.toast('Whoops! Down the hole!');
}

// ---------------------------------------------------------------- jump
function startJump(g, p, [dx, dy]) {
  p.jump = { t: 0, vx: dx * POWER.jumpSpeed, vy: dy * POWER.jumpSpeed, from: [p.x, p.y], extra: 0 };
  p.airborne = true;
  audio.sfx('jump');
  g.burst(p.cx, p.bottom, '#d8c8a0', 4);
}
function updateJump(g, p, dt) {
  const J = p.jump;
  J.t += dt;
  const k = Math.min(1, J.t / POWER.jumpTime);
  p.z = Math.sin(Math.PI * k) * POWER.jumpHeight;
  moveEntity(g, p, J.vx * dt, J.vy * dt);
  p.moving = true;
  p.animT += dt;
  if (k < 1) return true;
  // coming down over a gap just too wide: sail on a moment longer before giving up
  if (!canStand(g, p) && J.extra < 0.22) { J.extra += dt; p.z = 2; return true; }
  p.jump = null; p.airborne = false; p.z = 0;
  if (!canStand(g, p)) fall(g, p, J.from);
  else { g.burst(p.cx, p.bottom, '#d8c8a0', 4); audio.sfx('land'); }
  return false;
}

// ---------------------------------------------------------------- dash
function startDash(g, p, [dx, dy]) {
  const d = Math.hypot(dx, dy) || 1;
  p.dash = { t: POWER.dashTime, dx: dx / d, dy: dy / d, hit: new Set() };
  p.powerCd = POWER.dashCd;
  audio.sfx('dash');
}
function updateDash(g, p, dt) {
  const D = p.dash;
  D.t -= dt;
  const r = moveEntity(g, p, D.dx * POWER.dashSpeed * dt, D.dy * POWER.dashSpeed * dt);
  p.moving = true;
  p.animT += dt * 2;
  g.addParticle(p.cx - D.dx * 6, p.cy - 2, '#ffe0a0', 0.25, -D.dx * 30, -D.dy * 30, 2);
  if (r.hitX || r.hitY) {
    // smash any rubble just ahead; anything else stops him short
    let smashed = false;
    const ax = p.cx + D.dx * (p.w / 2 + 4), ay = p.cy + D.dy * (p.h / 2 + 4);
    for (const [ox, oy] of [[0, 0], [-D.dy * 5, D.dx * 5], [D.dy * 5, -D.dx * 5]]) {
      const tx = Math.floor((ax + ox) / TILE), ty = Math.floor((ay + oy) / TILE);
      if (tileProps(g.area.get(tx, ty)).rubble) { g.breakTile(tx, ty, true); g.persistBreak(tx, ty); smashed = true; }
    }
    if (smashed) { audio.sfx('boom'); g.shake(3, 0.2); }
    else { D.t = 0; g.shake(2, 0.12); audio.sfx('thud'); }
  }
  // ram anything in the way
  for (const e of g.enemies()) {
    if (D.hit.has(e) || e.submerged || e.hidden || !aabb(p.box(), e.box())) continue;
    D.hit.add(e);
    if (e.onDash) e.onDash(g, p);
    else e.hurt(g, Math.max(2, SWORD_DMG[g.state.sword] || 0), p.cx, p.cy);
  }
  if (D.t <= 0) p.dash = null;
  return true;
}

// ---------------------------------------------------------------- dig
const SOFT = new Set([T.GRASS, T.GRASS2, T.FLOWER, T.SAND, T.DARKGRASS, T.ASH, T.MUD, T.PATH, T.STORMGRASS,
  T.XSOIL, T.XSOIL2, T.DFLOOR, T.DDECOR]);
const diggable = (id) => SOFT.has(id) || tileProps(id).dig || tileProps(id).heap;
function updateDig(g, p, dt) {
  p.dig.t -= dt;
  p.moving = false;
  if (Math.random() < dt * 30) {
    const [fx, fy] = DIRS[p.facing];
    g.addParticle(p.cx + fx * 10, p.cy + fy * 8, Math.random() < 0.5 ? '#7a5234' : '#a8744a', 0.4, (Math.random() - 0.5) * 50, -40, 2);
  }
  if (p.dig.t <= 0) { p.dig = null; digAt(g, p); }
  return true;
}
// the tile in front of him, or failing that the one he's standing on
function digSpot(g, p) {
  const [fx, fy] = DIRS[p.facing];
  const front = [Math.floor((p.cx + fx * 12) / TILE), Math.floor((p.cy + fy * 12) / TILE)];
  const under = [Math.floor(p.cx / TILE), Math.floor(p.cy / TILE)];
  for (const [tx, ty] of [front, under]) if (diggable(g.area.get(tx, ty))) return [tx, ty];
  return front;
}
function digAt(g, p) {
  const st = g.state;
  const [tx, ty] = digSpot(g, p);
  const id = g.area.get(tx, ty), pr = tileProps(id);
  const x = tx * TILE + 8, y = ty * TILE + 8;
  // a boss burrowing right under the spot gets dug up
  const boss = g.bossActive;
  if (boss && boss.onDug && boss.submerged && dist(boss.cx, boss.cy, x, y) < 26) { boss.onDug(g); return; }
  if (id === T.DUG) { g.toast('Already dug here!'); return; }
  if (!diggable(id)) { audio.sfx('thud'); g.toast(pr.solid ? 'Too hard to dig!' : "Can't dig here."); return; }
  g.burst(x, y, '#7a5234', 8);
  if (pr.heap) {
    // a whole heap of dirt shovelled out of the way
    g.breakTile(tx, ty, true);
    g.persistBreak(tx, ty);
    audio.sfx('poof');
    return;
  }
  g.area.set(tx, ty, T.DUG);
  audio.sfx('dig');
  // something buried right here on purpose (a dungeon mound, a treasure spot)?
  const key = tx + ',' + ty;
  const buried = g.area.buried && g.area.buried[key];
  if (buried !== undefined) {
    st.flags[`dug_${g.area.id}_${tx}_${ty}`] = true;
    if (buried && buried.enemy) { g.spawnEnemy(buried.enemy, x, y, {}); g.toast('Uh oh! Something was down there!'); }
    else if (buried) { audio.sfx('chest'); g.burst(x, y - 6, '#ffe95c', 10); g.grantContents(buried, null); }
    else g.toast('Nothing here...');
    return;
  }
  // otherwise, it's luck of the dig
  const r = Math.random();
  if (r < 0.42) g.toast(['Nothing here...', 'Just dirt.', 'A worm waves hello. That is all.', 'Nope!'][Math.floor(Math.random() * 4)]);
  else if (r < 0.70) g.spawn(new Pickup(x, y, 'coin', 1 + Math.floor(Math.random() * 4)));
  else if (r < 0.78 && st.bow) g.spawn(new Pickup(x, y, 'arrows', 4));
  else if (r < 0.86 && st.hp < g.hpCap()) g.spawn(new Pickup(x, y, 'crayfish'));
  else if (r < 0.91) { g.spawn(new Pickup(x, y, 'diamond')); g.toast('A diamond!'); }
  else if (r < 0.96) g.spawn(new Pickup(x, y, 'coin', 8 + Math.floor(Math.random() * 8)));
  else {
    // ...and sometimes something grumpy was sleeping down there
    g.spawnEnemy(Math.random() < 0.5 ? 'rakali' : 'adder', x, y, {});
    g.toast('Uh oh! Something was down there!');
  }
}

// ---------------------------------------------------------------- dive
function toggleDive(g, p) {
  if (p.diving) { surface(g, p); return; }
  p.diving = true;
  p.breath = POWER.breath;
  g.burst(p.cx, p.cy, '#bfe8f2', 8);
  audio.sfx('splash');
}
function surface(g, p) {
  p.diving = false;
  g.burst(p.cx, p.cy, '#bfe8f2', 8);
  audio.sfx('splash');
}
function updateDive(g, p, dt) {
  const tp = tileProps(g.area.get(Math.floor(p.cx / TILE), Math.floor(p.cy / TILE)));
  // out of the deep water (onto a bank, into the shallows): he's up whether he likes it or not
  if (!tp.deep) { p.diving = false; return; }
  p.breath -= dt;
  // under a rock arch there's no coming up, so he holds on until he's out the other side
  if (p.breath <= 0 && !tp.under) { surface(g, p); g.toast('Gasp! Out of breath.'); return; }
  if (Math.random() < dt * 6) g.addParticle(p.cx + (Math.random() - 0.5) * 6, p.cy - 2, '#d8f4ff', 0.6, 0, -16, 1);
  // a secret on the bottom, right under him
  for (const e of g.ents) if (e.isDiveSpot && !e.dead && aabb(p.box(), e.box())) e.collect(g);
}

// Something sitting on the bottom of deep water: only a diving Gus can get it.
export class DiveSpot extends Entity {
  constructor(def) {
    super(def.tx * TILE + 3, def.ty * TILE + 3, 10, 10);
    this.def = def;
    this.isDiveSpot = true;
  }
  collect(g) {
    this.dead = true;
    g.state.flags[this.def.id] = true;
    g.burst(this.cx, this.cy, '#ffe95c', 12);
    audio.sfx('chest');
    g.grantContents(this.def.contents || { coins: 20 }, this.def.msg || null);
  }
  draw(g, ctx) {
    // a glint now and then through the water: something's down there
    const k = (g.time * 0.8 + this.id * 0.37) % 1;
    if (k > 0.35) return;
    ctx.save();
    ctx.globalAlpha = 0.9 * Math.sin(k / 0.35 * Math.PI);
    ctx.fillStyle = '#fff6c8';
    ctx.fillRect(Math.round(this.cx) - 1, Math.round(this.cy) - 1, 2, 2);
    ctx.fillRect(Math.round(this.cx) - 3, Math.round(this.cy), 6, 1);
    ctx.fillRect(Math.round(this.cx), Math.round(this.cy) - 3, 1, 6);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- grapple hook
function throwHook(g, p) {
  const [dx, dy] = DIRS[p.facing];
  p.hook = g.spawn(new Hook(p, dx, dy));
  p.powerCd = 0.3;
  audio.sfx('arrow');
}
function updateZip(g, p, dt) {
  const Z = p.zip;
  const d = dist(p.cx, p.cy, Z.x, Z.y);
  const step = POWER.zipSpeed * dt;
  p.airborne = true;
  p.moving = true;
  if (d <= step) {
    p.x = Z.x - p.w / 2; p.y = Z.y - p.h / 2;
    p.zip = null; p.airborne = false;
    if (!canStand(g, p)) fall(g, p, Z.from);
    else audio.sfx('land');
    return false;
  }
  const [ux, uy] = dirTo(p.cx, p.cy, Z.x, Z.y);
  p.x += ux * step; p.y += uy * step;
  if (Math.random() < 0.6) g.addParticle(p.cx, p.cy - 2, '#e8e0d0', 0.2, -ux * 20, -uy * 20, 1);
  return true;
}

// The hook flies out along Gus's facing, chain paying out behind it. It bites into a post
// (Gus zips to it), knocks an enemy back toward him, drags a pickup home, or clanks off
// anything else and reels in.
export class Hook extends Entity {
  constructor(p, dx, dy) {
    super(p.cx - 3, p.cy - 6, 6, 6);
    this.owner = p;
    this.dx = dx; this.dy = dy;
    this.dist = 0;
    this.back = false;
    this.fly = true;
  }
  update(g, dt) {
    const p = this.owner;
    if (this.back) {
      const [ux, uy] = dirTo(this.cx, this.cy, p.cx, p.cy - 3);
      this.x += ux * POWER.hookSpeed * 1.4 * dt; this.y += uy * POWER.hookSpeed * 1.4 * dt;
      if (this.carry && !this.carry.dead) { this.carry.x = this.x; this.carry.y = this.y; }
      if (dist(this.cx, this.cy, p.cx, p.cy - 3) < 8) this.dead = true;
      return;
    }
    const step = POWER.hookSpeed * dt;
    this.x += this.dx * step; this.y += this.dy * step;
    this.dist += step;
    const tx = Math.floor(this.cx / TILE), ty = Math.floor(this.cy / TILE);
    const tp = tileProps(g.area.get(tx, ty));
    if (tp.post) {
      // bite! zip to the tile in front of the post, on Gus's side of it
      this.dead = true;
      const x = tx * TILE + 8 - this.dx * TILE, y = ty * TILE + 8 - this.dy * TILE;
      p.zip = { x, y, from: [p.x, p.y] };
      audio.sfx('hammer');
      g.burst(tx * TILE + 8, ty * TILE + 8, '#ffd84a', 6);
      return;
    }
    if (tp.solid && !tp.low) { this.clank(g); return; }
    for (const e of g.ents) {
      if (e.dead || e === this) continue;
      if (e.team === 'enemy' && !e.isShot && !e.submerged && !e.hidden && aabb(this.box(), e.box())) {
        if (e.onHook) e.onHook(g, p);
        else {
          e.hurt(g, 1, this.cx, this.cy, true);
          const [kx, ky] = dirTo(e.cx, e.cy, p.cx, p.cy);
          if (!e.isBoss) { e.kx = kx * 160; e.ky = ky * 160; }
          audio.sfx('hit');
        }
        this.back = true;
        return;
      }
      if (e instanceof Pickup && aabb(this.box(), e.box())) { this.carry = e; this.back = true; return; }
    }
    if (this.dist >= POWER.hookRange) this.back = true;
  }
  clank(g) {
    this.back = true;
    audio.sfx('thud');
    g.burst(this.cx, this.cy, '#c8ccd4', 4);
  }
  draw(g, ctx) {
    const p = this.owner;
    // the chain, link by link
    const n = Math.max(1, Math.floor(dist(p.cx, p.cy - 3, this.cx, this.cy) / 4));
    ctx.fillStyle = '#8a8478';
    for (let i = 1; i < n; i++) {
      const k = i / n;
      ctx.fillRect(Math.round(p.cx + (this.cx - p.cx) * k), Math.round(p.cy - 3 + (this.cy - p.cy + 3) * k), 1, 1);
    }
    drawSprite(ctx, 'hookhead', this.cx, this.cy + 3, { angle: Math.atan2(this.dy, this.dx) });
  }
}

// What Gus looks like mid-power, drawn by the Player instead of (or over) his usual sprite.
// Returns true if it drew him.
export function drawPowerPose(g, p, ctx) {
  if (p.diving) {
    // under the surface: a dark shape gliding along, and a ring of bubbles for breath left
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#0c2a3a';
    ctx.beginPath(); ctx.ellipse(p.cx, p.cy + 1, 7, 4, 0, 0, 7); ctx.fill();
    ctx.restore();
    const n = Math.ceil(p.breath / POWER.breath * 5);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i < n ? '#d8f4ff' : '#d8f4ff33';
      ctx.fillRect(Math.round(p.cx - 9 + i * 4), Math.round(p.y - 12), 2, 2);
    }
    return true;
  }
  return false;
}
// The shovel in his hands while he digs.
export function drawDig(p, ctx, by) {
  if (!p.dig) return;
  const [fx, fy] = DIRS[p.facing];
  const k = 1 - p.dig.t / POWER.digTime;
  ctx.save();
  ctx.translate(Math.round(p.cx + fx * 7), Math.round(by - 6 + fy * 4));
  ctx.rotate((p.flip ? -1 : 1) * (0.9 - k * 1.4));
  drawSprite(ctx, 'pw_shovel', 0, 6);
  ctx.restore();
}
