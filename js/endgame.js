// The endgame past Apexus: Mum and Dad in Apexus's jail, the bridge they finish across the
// Great Chasm, the Goo Lands beyond (goo zombies, god crystals, the magic altar), and the
// road to Xenomantis's Star Hive.
//
// game.js keeps the plumbing (areas, modes, combat); the story beats, the Goo Lands map and
// the family's own entities live here. Everything takes the Game as `g`.

import { TILE, PLAYER, WORLD_SEED, FAMILY, CRYSTAL_GOAL, GOD_ARMOR_LV, CRAYFISH_HEAL } from './config.js';
import { rng, dist, dirTo, clamp, DIRS } from './util.js';
import { T, isSolid, props as tileProps } from './tiles.js';
import { Entity, moveEntity, walkable, tileAt, Arrow, Pickup, drawQuestMarker } from './entities.js';
import { drawSprite, sprites } from './pixelart.js';
import { audio } from './audio.js';

// ---------------------------------------------------------------- MUM AND DAD
// Freed from Apexus's jail, they follow Gus everywhere but indoors and pitch in on every
// fight: Dad up close with his sword, Mum from range with her bow (and a crayfish for Gus
// when his hearts run low). Friends, so nothing can hurt them and enemies ignore them.
export class Guardian extends Entity {
  constructor(who, x, y) {
    super(x - 5, y - 4, 10, 8);
    this.team = 'friend';
    this.who = who;
    this.name = who === 'dad' ? 'Dad' : 'Mum';
    this.swims = true;
    this.flip = false;
    this.animT = Math.random();
    this.moving = false;
    this.cd = 0.6 + Math.random() * 0.4;
    this.attackT = 0;          // Dad's swing
    this.bowT = 0;             // Mum's draw
    this.aim = 0;
    this.goal = null;          // a spot to walk to in a scene; overrides following and fighting
    this.hammering = false;    // building the bridge
    this.stuckT = 0;
    this.crayT = 6;
    this.swimming = false;
    this.path = null;          // tile centers to walk through, from findPath
    this.pathT = 0;
  }
  hurt() { /* nothing in the Vale can hurt a River Guardian twice */ }

  update(g, dt) {
    const p = g.player, st = g.state;
    this.cd = Math.max(0, this.cd - dt);
    this.attackT = Math.max(0, this.attackT - dt);
    this.bowT = Math.max(0, this.bowT - dt);
    this.swimming = !!tileProps(tileAt(g, this.cx, this.cy)).deep;
    this.moving = false;

    if (this.goal) {
      if (dist(this.cx, this.cy, this.goal.x, this.goal.y) > 3) this.walkTo(g, this.goal.x, this.goal.y, 70, dt);
      else if (this.goal.face) this.flip = this.goal.face < 0;
      this.animT += dt * (this.moving ? 1 : 0.4);
      return;
    }

    // Gus went on ahead (another room, or just far): catch up in a blink
    const room = g.area.type === 'dungeon' && g.curRoom ? g.roomBoundsPx(g.curRoom) : null;
    const dP = dist(this.cx, this.cy, p.cx, p.cy);
    if (dP > 260 || (room && !inBounds(this, room))) { this.catchUp(g); return; }

    if (this.who === 'mum') this.watchHearts(g, dt);

    const foe = this.pickFoe(g, room);
    if (foe) this.fight(g, foe, dt);
    else this.follow(g, dt);
    this.animT += dt * (this.moving ? 1 : 0.4);
  }

  // the nearest enemy close to both of them, that isn't hiding
  pickFoe(g, room) {
    const p = g.player;
    let best = null, bestD = Infinity;
    for (const e of g.enemies()) {
      if (e.hidden || e.submerged || e.riseT > 0) continue;
      if (room && !inBounds(e, room)) continue;
      const d = dist(this.cx, this.cy, e.cx, e.cy);
      if (d > 130 || dist(p.cx, p.cy, e.cx, e.cy) > 170) continue;
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  fight(g, foe, dt) {
    const mul = (g.state.flags.god_armor ? FAMILY.armorMul : 1) * (foe.isBoss ? FAMILY.bossMul : 1);
    this.flip = foe.cx < this.cx;
    if (this.who === 'dad') {
      // in close: measured to the foe's edge, so he can reach the big ones
      const gap = Math.hypot(Math.max(foe.x - this.cx, 0, this.cx - foe.x - foe.w), Math.max(foe.y - this.cy, 0, this.cy - foe.y - foe.h));
      if (gap > 9) this.walkTo(g, foe.cx, foe.cy, PLAYER.speed * 1.05, dt);
      else if (this.cd <= 0 && !this.swimming) {
        this.cd = FAMILY.dadCd;
        this.attackT = 0.18;
        this.aim = Math.atan2(foe.cy - this.cy, foe.cx - this.cx);
        audio.sfx('slash');
        foe.hurt(g, Math.round(FAMILY.dadDmg * mul), this.cx, this.cy);
      }
    } else {
      // keeps her distance and looses arrows (Light Arrows, once she's in God Armor)
      const d = dist(this.cx, this.cy, foe.cx, foe.cy);
      if (d < 50) this.walkTo(g, this.cx * 2 - foe.cx, this.cy * 2 - foe.cy, PLAYER.speed * 0.9, dt);
      else if (d > 110) this.walkTo(g, foe.cx, foe.cy, PLAYER.speed, dt);
      if (this.cd <= 0 && d < 150 && !this.swimming) {
        this.cd = FAMILY.mumCd;
        this.bowT = 0.22;
        const [dx, dy] = dirTo(this.cx, this.cy - 4, foe.cx, foe.cy - 2);
        this.aim = Math.atan2(dy, dx);
        const armored = g.state.flags.god_armor;
        const a = new Arrow(this.cx + dx * 8, this.cy - 4 + dy * 8, dx, dy, armored ? 'light' : 'regular',
          armored ? 1 : FAMILY.mumLevel, PLAYER.arrowSpeed, 170);
        a.friendly = true;
        a.dmgMul = foe.isBoss ? FAMILY.bossMul : 1;
        g.spawn(a);
        audio.sfx('arrow');
      }
    }
  }

  // a step behind Gus, Dad on one side and Mum on the other
  follow(g, dt) {
    const p = g.player;
    const [fx, fy] = DIRS[p.facing] || [0, 1];
    const side = this.who === 'dad' ? -1 : 1;
    const tx = p.cx - fx * 18 + -fy * side * 14, ty = p.cy - fy * 16 + fx * side * 10;
    const d = dist(this.cx, this.cy, tx, ty);
    if (d > 8) this.walkTo(g, tx, ty, Math.min(PLAYER.speed * 1.5, 40 + d * 3), dt);
    else { this.stuckT = 0; this.flip = p.cx < this.cx; }
  }

  // Breadth-first over the tiles around them (or the current dungeon room) to the target's
  // tile, so they find their way round walls and through doorways instead of grinding into
  // corners. Returns the tile centers to walk through, or null if it's out of reach.
  findPath(g, gx, gy) {
    const sx = Math.floor(this.cx / TILE), sy = Math.floor(this.cy / TILE);
    if (sx === gx && sy === gy) return [];
    const R = 18, size = R * 2 + 1, x0 = sx - R, y0 = sy - R;
    if (Math.abs(gx - sx) > R || Math.abs(gy - sy) > R) return null;
    const room = g.area.type === 'dungeon' && g.curRoom ? g.roomBoundsPx(g.curRoom) : null;
    const prev = new Int32Array(size * size).fill(-1);
    const start = (sy - y0) * size + (sx - x0);
    prev[start] = start;
    const q = [start];
    for (let qi = 0; qi < q.length; qi++) {
      const cur = q[qi], cx = cur % size, cy = (cur - cx) / size;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        const n = ny * size + nx;
        if (prev[n] !== -1) continue;
        const tx = nx + x0, ty = ny + y0;
        if (room && !inBounds({ cx: tx * TILE + 8, cy: ty * TILE + 8 }, room)) continue;
        if (!walkable(g.area.get(tx, ty), this)) continue;
        prev[n] = cur;
        if (tx === gx && ty === gy) {
          const out = [];
          for (let k = n; k !== start; k = prev[k]) out.unshift([(k % size + x0) * TILE + 8, (Math.floor(k / size) + y0) * TILE + 8]);
          return out;
        }
        q.push(n);
      }
    }
    return null;
  }

  walkTo(g, tx, ty, spd, dt) {
    // steer by the path when there is one; the last leg goes straight to the exact spot
    this.pathT -= dt;
    if (this.pathT <= 0) { this.pathT = 0.35; this.path = this.findPath(g, Math.floor(tx / TILE), Math.floor(ty / TILE)); }
    if (this.path && this.path.length > 1) {
      if (dist(this.cx, this.cy, this.path[0][0], this.path[0][1]) < 4) this.path.shift();
      if (this.path.length > 1) [tx, ty] = this.path[0];
    }
    const [dx, dy] = dirTo(this.cx, this.cy, tx, ty);
    const before = dist(this.cx, this.cy, tx, ty);
    const r = moveEntity(g, this, dx * spd * dt, dy * spd * dt);
    // slide along whatever's in the way rather than grinding into it
    if (r.hitX && !r.hitY && Math.abs(dy) < 0.3) moveEntity(g, this, 0, (dy >= 0 ? 1 : -1) * spd * dt);
    if (r.hitY && !r.hitX && Math.abs(dx) < 0.3) moveEntity(g, this, (dx >= 0 ? 1 : -1) * spd * dt, 0);
    this.moving = true;
    if (Math.abs(dx) > 0.2) this.flip = dx < 0;
    // wedged on a tree or a wall for too long: give up and pop back beside Gus
    const after = dist(this.cx, this.cy, tx, ty);
    if (after > before - spd * dt * 0.25) this.stuckT += dt; else this.stuckT = Math.max(0, this.stuckT - dt);
    if (this.stuckT > 1.2 && !this.goal && dist(this.cx, this.cy, g.player.cx, g.player.cy) > 40) this.catchUp(g);
  }

  // Pop in next to Gus, on the nearest open tile behind him.
  catchUp(g) {
    const p = g.player;
    const spot = openSpotNear(g, p.cx + (this.who === 'dad' ? -14 : 14), p.cy + 6, this);
    if (!spot) return;
    this.x = spot.x - this.w / 2; this.y = spot.y - this.h / 2;
    this.stuckT = 0;
    g.burst(this.cx, this.cy - 4, this.who === 'dad' ? '#d8483a' : '#b05ad8', 6);
  }

  // Mum's crayfish: when Gus is down to his last few hearts she tosses him a snack
  watchHearts(g, dt) {
    const st = g.state;
    this.crayT -= dt;
    if (this.crayT > 0 || st.hp <= 0 || st.hp > st.maxHp * 0.35 || st.hp + CRAYFISH_HEAL > st.maxHp + 2) return;
    this.crayT = FAMILY.crayCd;
    const p = g.player;
    g.spawn(new Pickup((this.cx + p.cx) / 2, (this.cy + p.cy) / 2, 'crayfish'));
    g.toast('Mum tossed you a crayfish!');
    audio.sfx('cray');
  }

  draw(g, ctx) {
    const cx = this.cx, by = this.bottom + 3;
    const pose = this.swimming ? 'swim' : this.moving ? (Math.floor(this.animT * 8) % 2 ? 'walk1' : 'walk2') : 'idle';
    if (!this.swimming) {
      ctx.fillStyle = '#25324155';
      ctx.fillRect(Math.round(cx) - 5, Math.round(by) - 2, 10, 2);
    }
    drawSprite(ctx, `${this.who}_${pose}`, cx, by, { flip: this.flip });
    if (!this.swimming) {
      if (g.state.flags.god_armor) drawSprite(ctx, 'armor7', cx, by, { flip: this.flip });
      else drawSprite(ctx, this.who === 'dad' ? 'dad_band' : 'mum_bow', cx, by, { flip: this.flip });
    }
    const weapon = g.state.flags.god_armor ? 7 : 5;
    if (this.attackT > 0) {
      // Dad's swing: his blade sweeping through a short arc toward the foe
      const prog = 1 - this.attackT / 0.18;
      ctx.save();
      ctx.translate(Math.round(cx), Math.round(this.cy - 3));
      ctx.rotate(this.aim - 0.8 + prog * 1.6);
      ctx.drawImage(sprites['sword' + weapon].canvas, 0, -4);
      ctx.restore();
    }
    if (this.bowT > 0) {
      ctx.save();
      ctx.translate(Math.round(cx + Math.cos(this.aim) * 8), Math.round(this.cy - 3 + Math.sin(this.aim) * 7));
      ctx.rotate(this.aim);
      ctx.drawImage(sprites['bow' + Math.min(weapon, 6)].canvas, -4, -6);
      ctx.restore();
    }
    if (this.hammering) {
      // a mallet, rising and falling
      const up = Math.floor(g.time * 6 + (this.who === 'dad' ? 0 : 0.5)) % 2 === 0;
      const hx = cx + (this.flip ? -8 : 8), hy = this.cy - (up ? 10 : 4);
      ctx.fillStyle = '#8a5a34'; ctx.fillRect(Math.round(hx), Math.round(hy), 1, 6);
      ctx.fillStyle = '#5a5466'; ctx.fillRect(Math.round(hx) - 2, Math.round(hy) - 1, 5, 3);
    }
  }
}

const inBounds = (e, b) => e.cx >= b.x && e.cx < b.x + b.w && e.cy >= b.y && e.cy < b.y + b.h;

// The nearest tile (rings outward) that `e` can stand on, near a pixel point.
function openSpotNear(g, x, y, e) {
  const tx0 = Math.floor(x / TILE), ty0 = Math.floor(y / TILE);
  const room = g.area.type === 'dungeon' && g.curRoom ? g.roomBoundsPx(g.curRoom) : null;
  for (let r = 0; r <= 6; r++) {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const tx = tx0 + dx, ty = ty0 + dy;
      const px = tx * TILE + 8, py = ty * TILE + 8;
      if (room && !inBounds({ cx: px, cy: py }, room)) continue;
      const id = g.area.get(tx, ty);
      if (!walkable(id, e) || tileProps(id).deep || id === T.STAIRS || id === T.PASSAGE || id === T.HDOOR) continue;
      return { x: px, y: py };
    }
  }
  return null;
}

// Mum and Dad come along into every area but the houses (once they're free).
export function spawnFamily(g) {
  if (!g.state.flags.parents_free || g.area.type === 'house' || g.area.noFamily) return;
  for (const who of ['dad', 'mum']) {
    const gd = new Guardian(who, g.player.cx, g.player.cy);
    const spot = openSpotNear(g, g.player.cx + (who === 'dad' ? -14 : 14), g.player.cy + 8, gd);
    if (spot) { gd.x = spot.x - gd.w / 2; gd.y = spot.y - gd.h / 2; }
    g.ents.push(gd);
  }
}
// after a room slide, bring them through the door with Gus
export function regroupFamily(g) {
  for (const e of g.ents) if (e instanceof Guardian && !e.goal) e.catchUp(g);
}

// ---------------------------------------------------------------- JAIL CAGE
// Apexus's cages, one for Mum and one for Dad. A slash or a press of E breaks the lock.
export class Cage extends Entity {
  constructor(def) {
    super(def.tx * TILE, def.ty * TILE + 2, 16, 14);
    this.solid = true;
    this.who = def.who;
    this.opened = false;
  }
  interact(g) { if (!this.opened) freeParent(g, this); }
  onSlash(g) { if (!this.opened) freeParent(g, this); }
  draw(g, ctx) {
    const by = this.bottom + 1;
    if (!this.opened) {
      // whoever's inside sways and peers out between the bars
      const bob = Math.round(Math.sin(g.time * 2 + this.id) * 0.6);
      drawSprite(ctx, this.who + '_idle', this.cx, by - 2 + bob, { flip: g.player && g.player.cx < this.cx });
      drawSprite(ctx, this.who === 'dad' ? 'dad_band' : 'mum_bow', this.cx, by - 2 + bob, { flip: g.player && g.player.cx < this.cx });
    }
    drawSprite(ctx, this.opened ? 'cage_open' : 'cage', this.cx, by + 2);
    if (!this.opened) drawQuestMarker(ctx, this.cx, this.y - 20, 'urgent', g.time, this.id);
  }
}

// ---------------------------------------------------------------- FORCE FIELD
// Seals the Star Hive's door until the God Armor is forged.
export class Barrier extends Entity {
  constructor(def) {
    super(def.tx * TILE, def.ty * TILE, 16, 16);
    this.solid = true;
    this.cd = 0;
  }
  update(g, dt) { this.cd -= dt; }
  onBump(g) {
    if (this.cd > 0) return;
    this.cd = 2.2;
    audio.sfx('denied');
    g.toast('A force field! Forge the GOD ARMOR at the altar first.');
  }
  draw(g, ctx) {
    ctx.save();
    for (let y = 0; y < 16; y += 2) {
      ctx.globalAlpha = 0.35 + 0.25 * Math.sin(g.time * 6 + y * 0.7);
      ctx.fillStyle = y % 4 ? '#c88aff' : '#8aff6a';
      ctx.fillRect(this.x + 1, this.y + y, 14, 1);
    }
    ctx.globalAlpha = 0.18 + 0.1 * Math.sin(g.time * 3);
    ctx.fillStyle = '#e0ffd0';
    ctx.fillRect(this.x, this.y - 8, 16, 24);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- STORY BEATS
// Several speakers in a row: [[name, text], ...], then `done`.
export function talk(g, lines, done) {
  const [first, ...rest] = lines;
  if (!first) { if (done) done(); return; }
  g.openDialog(first[0], first[1], () => talk(g, rest, done));
}

export function freeParent(g, cage) {
  const st = g.state;
  cage.opened = true;
  st.flags['freed_' + cage.who] = true;
  audio.sfx('door');
  audio.sfx('chest');
  g.shake(3, 0.3);
  g.burst(cage.cx, cage.cy - 8, '#c8ccd4', 10);
  g.burst(cage.cx, cage.cy - 8, '#fff6c8', 8);
  const gd = new Guardian(cage.who, cage.cx, cage.bottom + 10);
  gd.goal = { x: cage.cx, y: cage.bottom + 10 };     // stays put until everyone's out
  g.ents.push(gd);
  const both = st.flags.freed_dad && st.flags.freed_mum;
  if (!both) {
    g.openDialog(gd.name, cage.who === 'dad'
      ? "Gus?! Is that really my boy? Look at you -- you beat APEXUS! Quick, get your mum out of that cage!"
      : "GUS! Oh, my brave, brave boy! You came for us! Hurry -- free your dad, he's right over there!");
    g.save();
    return;
  }
  st.flags.parents_free = true;
  g.save();
  talk(g, [
    ['Mum', "Our Gus... a real River Guardian! We're so proud of you, sweetheart."],
    ['Dad', "And you found my old sword! I knew you would. Now listen, son -- Apexus was never the real enemy."],
    ['Mum', "One night something fell out of the stars. A giant alien bug: XENOMANTIS. Everywhere it crawls, it leaves alien GOO behind."],
    ['Dad', "We fought it, but it was too strong. It trapped us in goo and gave us to Apexus to lock up down here."],
    ['Mum', "Before they caught us, we were building a bridge across the Great Chasm, to reach its nest. It's right through there."],
    ['Dad', "Let's finish that bridge -- together! Stand back, Gus. Mum and I have got this."],
  ], () => startBridge(g));
}

// The bridge scene: Mum and Dad walk out to the end of their half-built bridge and hammer
// the rest of it across the chasm, one plank row at a time. Gus watches.
export function startBridge(g) {
  const cols = {};
  for (const [x, y] of g.area.unbuilt || []) (cols[x] = cols[x] || []).push(y);
  const order = Object.keys(cols).map(Number).sort((a, b) => b - a).map(x => ({ x, ys: cols[x].sort((a, b) => a - b) }));
  if (!order.length) { finishBridge(g); return; }
  const fam = g.ents.filter(e => e instanceof Guardian);
  // Gus stands and watches (and doesn't freeze mid-swing)
  Object.assign(g.player, { attackT: 0, bowPoseT: 0, moving: false, blocking: false });
  g.scene = { kind: 'bridge', t: 0, phase: 'walk', order, i: 0, fam };
  g.mode = 'scene';
  aimFamily(g.scene, order[0].x + 1);
}
function aimFamily(sc, col) {
  const ys = sc.order[Math.min(sc.i, sc.order.length - 1)].ys;
  sc.fam.forEach((gd, k) => {
    gd.goal = { x: col * TILE + 8, y: (ys[k % ys.length]) * TILE + 8, face: -1 };
  });
}
export function updateScene(g, dt) {
  const sc = g.scene;
  if (!sc) { g.mode = 'play'; return; }
  sc.t += dt;
  for (const e of g.ents) if (!e.dead) e.update(g, dt);
  g.updateParticles(dt);
  g.ents = g.ents.filter(e => !e.dead);
  if (sc.kind !== 'bridge') return;
  if (sc.phase === 'walk') {
    const there = sc.fam.every(gd => dist(gd.cx, gd.cy, gd.goal.x, gd.goal.y) < 4);
    if (there || sc.t > 3) { sc.phase = 'build'; sc.t = 0.3; sc.fam.forEach(gd => { gd.hammering = true; }); }
  } else if (sc.phase === 'build') {
    if (sc.t < 0.45) return;
    sc.t = 0;
    const c = sc.order[sc.i];
    for (const y of c.ys) {
      g.area.set(c.x, y, T.BRIDGE);
      g.burst(c.x * TILE + 8, y * TILE + 8, '#c49e70', 6);
    }
    audio.sfx('hammer');
    g.shake(1, 0.1);
    sc.i++;
    if (sc.i >= sc.order.length) { sc.phase = 'done'; sc.t = 0; sc.fam.forEach(gd => { gd.hammering = false; }); return; }
    aimFamily(sc, c.x);
  } else if (sc.phase === 'done' && sc.t > 0.7) {
    sc.fam.forEach(gd => { gd.goal = null; });
    g.scene = null;
    g.mode = 'play';
    finishBridge(g);
  }
}
function finishBridge(g) {
  g.state.flags.bridge_built = true;
  g.save();
  audio.sfx('shard');
  g.setBanner('THE BRIDGE IS FINISHED!', 'Mum and Dad will fight by your side!', '#9aff6a', () => {
    talk(g, [
      ['Mum', "Across that bridge are the GOO LANDS. Creatures that touch the goo turn into ZOMBIES -- and they crawl right out of the goo puddles!"],
      ['Dad', "Zombies are tough, but every one we beat drops GOD CRYSTALS. Bring 300 to the magic altar in the middle of the Goo Lands."],
      ['Mum', "The altar will forge GOD ARMOR for all three of us. Then nothing can stop us from reaching Xenomantis's Star Hive!"],
      ['Dad', "We'll be right behind you, son. Let's go!"],
    ]);
  });
}

// ---------------------------------------------------------------- THE ALTAR
export function altarDialog(g) {
  const st = g.state, n = st.crystals || 0;
  if (st.flags.god_armor) {
    g.openDialog('Magic Altar', 'The altar hums happily. Your God Armor shines like a star!');
  } else if (n >= CRYSTAL_GOAL) {
    g.openDialog('Magic Altar', `The altar BLAZES with light! It drinks in ${CRYSTAL_GOAL} god crystals...`, () => craftGodArmor(g));
  } else {
    g.openDialog('Magic Altar', `The altar glows softly. Bring it ${CRYSTAL_GOAL} GOD CRYSTALS and it will forge GOD ARMOR.|You have ${n}. ${CRYSTAL_GOAL - n} more to go!|Beat the goo zombies -- each one drops a handful.`);
  }
}
export function craftGodArmor(g) {
  const st = g.state;
  st.crystals -= CRYSTAL_GOAL;
  st.armor = GOD_ARMOR_LV;
  st.flags.god_armor = true;
  audio.sfx('shard');
  g.shake(6, 0.7);
  for (const e of [g.player, ...g.ents.filter(e => e instanceof Guardian)]) {
    g.burst(e.cx, e.cy - 8, '#ffd84a', 16);
    g.burst(e.cx, e.cy - 8, '#fff6c8', 12);
  }
  // the Hive's force field falls with it
  for (const e of g.ents) if (e instanceof Barrier) { e.dead = true; g.burst(e.cx, e.cy, '#9aff6a', 20); }
  g.setBanner('GOD ARMOR!', 'Gus, Mum and Dad shine like stars! The Hive is open.', '#ffd84a');
  g.save();
}

// ---------------------------------------------------------------- THE GOO LANDS
// A smaller outdoor area past the Great Chasm: purple alien ground, crystal spires, goo
// pools that burp up zombies, the magic altar in the middle and the Star Hive to the north.
// Built from a fixed seed like the Vale, so it's the same every time.
export const GOO_W = 64, GOO_H = 48;
export const GOO_LM = {
  arrive: [54, 23],        // where the bridge from the Nexus lands
  statue: [52, 19],
  altar: [32, 27],
  hive: [29, 4],           // the Hive's 7x4 footprint, top-left
  hiveDoor: [32, 7],       // its door: stairs down into the Hive
};
// spots in the Nexus the bridge leads back to (the Guardian Bridge, next to the exit)
export const NEXUS_BRIDGE_END = { x: 2 * TILE + 8, y: 52 * TILE + 16 };
const GOO_POOLS = [
  [12, 10, 2.3], [22, 7, 1.8], [8, 20, 2.1], [19, 17, 1.9], [10, 31, 2.4], [18, 40, 2.1], [29, 39, 2.2],
  [41, 38, 1.9], [50, 40, 2.1], [46, 30, 2.0], [44, 13, 2.2], [52, 7, 2.0], [40, 20, 1.7], [24, 27, 1.7],
];
export const ZOMBIE_TYPES = ['rakali', 'adder', 'snapjaw', 'emberfox', 'mgoanna', 'kooka', 'snapshell',
  'talon', 'owl', 'dingo', 'wildcat', 'python', 'tazzy', 'gknight'];

export function buildGooLands(region) {
  const W = GOO_W, H = GOO_H;
  const r = rng(WORLD_SEED + 1701);
  const tiles = new Uint8Array(W * H).fill(T.XSOIL);
  const idx = (x, y) => y * W + x;
  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const get = (x, y) => inB(x, y) ? tiles[idx(x, y)] : T.XCLIFF;
  const set = (x, y, t) => { if (inB(x, y)) tiles[idx(x, y)] = t; };
  const disc = (cx, cy, rad, fn) => {
    for (let y = Math.floor(cy - rad); y <= cy + rad; y++) for (let x = Math.floor(cx - rad); x <= cx + rad; x++)
      if (inB(x, y) && dist(x, y, cx, cy) <= rad) fn(x, y);
  };

  // ground and scatter
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const q = r();
    set(x, y, q < 0.035 ? T.XROCK : q < 0.05 ? T.XSPIRE : q < 0.1 ? T.XPLANT : q < 0.22 ? T.XSOIL2 : T.XSOIL);
  }
  // the clearings everything important stands in
  const clear = (cx, cy, rad) => disc(cx, cy, rad, (x, y) => set(x, y, (x * 5 + y * 3) % 7 === 0 ? T.XSOIL2 : T.XSOIL));
  clear(...GOO_LM.arrive, 4.5);
  clear(...GOO_LM.altar, 5.5);
  clear(32, 10, 4);
  // glowing paths: bridge -> altar -> Hive door
  const path = (x0, y0, x1, y1) => {
    let x = x0, y = y0;
    while (x !== x1 || y !== y1) {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) set(x + dx, y + dy, dx === 0 && dy === 0 ? T.XSOIL2 : T.XSOIL);
      if (x !== x1) x += Math.sign(x1 - x); else y += Math.sign(y1 - y);
    }
  };
  // a ring of crystal spires around the altar's plaza (the paths below cut their way through)
  for (let a = 0; a < 16; a++) {
    if (a % 4 === 1) continue;                     // gaps to walk through
    const ang = a / 16 * Math.PI * 2;
    set(Math.round(GOO_LM.altar[0] + Math.cos(ang) * 6), Math.round(GOO_LM.altar[1] + Math.sin(ang) * 5), T.XSPIRE);
  }
  path(55, 23, 37, 23); path(37, 23, 37, 27); path(37, 27, 34, 27);
  path(32, 23, 32, 9);
  // goo pools, each one a zombie spawner
  const spawners = [];
  for (const [cx, cy, rad] of GOO_POOLS) {
    disc(cx, cy, rad + 1.2, (x, y) => { if (isSolid(get(x, y))) set(x, y, T.XSOIL); });
    disc(cx, cy, rad, (x, y) => set(x, y, T.GOO));
    spawners.push({ tx: cx, ty: cy, x: cx * TILE + 8, y: cy * TILE + 8, types: ZOMBIE_TYPES, respawn: true });
  }
  // borders: alien cliffs north, west and south; the Great Chasm along the east, the bridge across
  for (let x = 0; x < W; x++) for (let d = 0; d < 2; d++) { set(x, d, T.XCLIFF); set(x, H - 1 - d, T.XCLIFF); }
  for (let y = 0; y < H; y++) for (let d = 0; d < 2; d++) set(d, y, T.XCLIFF);
  for (let y = 0; y < H; y++) for (let x = 57; x < W; x++) set(x, y, T.PIT);
  const links = [];
  for (const y of [23, 24]) {
    for (let x = 57; x < W - 1; x++) set(x, y, T.BRIDGE);
    set(W - 1, y, T.PASSAGE);
    links.push({ tx: W - 1, ty: y, to: 'nexus', at: NEXUS_BRIDGE_END });
  }
  // the Hive: a solid mound with its door (stairs down) in the middle of its base
  const [hx, hy] = GOO_LM.hive;
  for (let y = hy; y < hy + 4; y++) for (let x = hx; x < hx + 7; x++) set(x, y, T.XROCK);
  set(...GOO_LM.hiveDoor, T.STAIRS);
  set(GOO_LM.hiveDoor[0], GOO_LM.hiveDoor[1] + 1, T.XSOIL2);

  const [dx, dy] = GOO_LM.hiveDoor;
  const props = [
    { kind: 'statue', tx: GOO_LM.statue[0], ty: GOO_LM.statue[1], id: 'goo_statue' },
    { kind: 'sign', tx: 52, ty: 27, text: 'THE GOO LANDS.|Alien goo bubbles everywhere -- and creatures crawl out of it as ZOMBIES! Beat them for GOD CRYSTALS.' },
    { kind: 'altar', tx: GOO_LM.altar[0], ty: GOO_LM.altar[1] },
    { kind: 'sign', tx: 35, ty: 30, text: `THE MAGIC ALTAR.|Bring it ${CRYSTAL_GOAL} god crystals, and it forges armor fit for gods.` },
    { kind: 'sign', tx: 35, ty: 10, text: 'THE STAR HIVE.|Xenomantis waits at the top of a great staircase. Only God Armor can pass the force field.' },
    { kind: 'building', sprite: 'hive_ext', tx: hx, ty: hy, w: 7, h: 4, spores: true },
    { kind: 'dungeon', tx: dx, ty: dy, id: 'hive' },
    { kind: 'barrier', tx: dx, ty: dy },
  ];
  for (const p of props) if (p.kind !== 'building' && p.kind !== 'dungeon') {
    // nothing stands on a rock or spire
    if (isSolid(get(p.tx, p.ty)) && p.kind !== 'barrier') set(p.tx, p.ty, T.XSOIL);
  }

  return {
    id: 'goo', type: 'overworld', theme: 'goo', name: 'The Goo Lands', music: 'goo',
    w: W, h: H, tiles, get, set, regionAt: () => region,
    spawners, props, puzzles: [], links, zombies: true,
    playerStart: { x: GOO_LM.arrive[0] * TILE + 8, y: GOO_LM.arrive[1] * TILE + 16 },
  };
}
