// Player, projectiles, pickups, chests, props, push blocks.
import { TILE, PLAYER, SWORD_LOOK, SHIELD_LOOK, ARMOR_REDUCE, SHIELD_ARC, SHIELD_SLOW, BOW_COOLDOWN, BOW_POWER,
  ARROWS, BURN, FREEZE_TIME, CHAIN_TARGETS, BOMB_RADIUS, CRAYFISH_HEAL, DROPS, tierCoins } from './config.js';
import { clamp, aabb, dist, dirTo, DIRS } from './util.js';
import { T, props as tileProps } from './tiles.js';
import { drawSprite } from './pixelart.js';
import { input } from './input.js';
import { audio } from './audio.js';
import { buzz } from './touch.js';

let NEXT_ID = 1;

// swing arc start angle and sweep per facing, shared by the visuals and the spark burst
const SLASH_BASE = { right: -0.7, left: Math.PI + 0.7, down: Math.PI / 2 - 0.7, up: -Math.PI / 2 + 0.7 };
const SLASH_SWEEP = { right: 1.4, left: -1.4, down: 1.4, up: -1.4 };

export class Entity {
  constructor(x, y, w, h) {
    this.id = NEXT_ID++;
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.vx = 0; this.vy = 0;
    this.dead = false;
    this.solid = false;      // blocks the player
    this.team = 'neutral';
  }
  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  get bottom() { return this.y + this.h; }
  box() { return this; }
  update(g, dt) {}
  draw(g, ctx) {}
}

// Can this entity stand on tile id?
export function walkable(id, e) {
  const p = tileProps(id);
  if (e.fly) return !p.solid;
  if (p.solid || p.lava) return false;
  if (e.deepOnly) return !!p.deep;   // dolphins keep to water they can actually swim in
  if (p.deep) return !!(e.swims || e.aquatic);
  if (e.aquatic) return !!(p.deep || p.water);
  return true;
}

// Axis-separated tile + solid-entity collision. Returns {hitX, hitY, tileX, tileY}.
export function moveEntity(g, e, dx, dy) {
  const res = { hitX: false, hitY: false, bumpTile: null };
  const solids = e.isPlayer ? g.solidEnts : null;
  const tryAxis = (nx, ny, axis) => {
    const corners = [
      [nx + 1, ny + 1], [nx + e.w - 1, ny + 1],
      [nx + 1, ny + e.h - 1], [nx + e.w - 1, ny + e.h - 1],
    ];
    for (const [px, py] of corners) {
      const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
      const id = g.area.get(tx, ty);
      if (!walkable(id, e)) {
        res.bumpTile = { id, tx, ty };
        return false;
      }
    }
    if (solids) {
      const nb = { x: nx, y: ny, w: e.w, h: e.h };
      for (const s of solids) {
        if (!s.dead && s.solid && aabb(nb, s.box())) { res.bumpEnt = s; return false; }
      }
    }
    return true;
  };
  if (dx !== 0) {
    if (tryAxis(e.x + dx, e.y, 'x')) e.x += dx;
    else {
      res.hitX = true;
      // corner assist: slide vertically toward a nearby opening (doorways).
      // Snapshot the real bump so probe calls don't overwrite it.
      if (e.isPlayer && dy === 0) {
        const realBump = res.bumpTile;
        for (const off of [3, -3, 6, -6, 9, -9]) {
          if (tryAxis(e.x + dx, e.y + off, 'x')) { e.y += Math.sign(off) * Math.min(1.4, Math.abs(dx) + 0.5); break; }
        }
        res.bumpTile = realBump;
      }
    }
  }
  if (dy !== 0) {
    if (tryAxis(e.x, e.y + dy, 'y')) e.y += dy;
    else {
      res.hitY = true;
      if (e.isPlayer && dx === 0) {
        const realBump = res.bumpTile;
        for (const off of [3, -3, 6, -6, 9, -9]) {
          if (tryAxis(e.x + off, e.y + dy, 'y')) { e.x += Math.sign(off) * Math.min(1.4, Math.abs(dy) + 0.5); break; }
        }
        res.bumpTile = realBump;
      }
    }
  }
  return res;
}

export function tileAt(g, px, py) {
  return g.area.get(Math.floor(px / TILE), Math.floor(py / TILE));
}

// ---------------------------------------------------------------- PLAYER
export class Player extends Entity {
  constructor(x, y) {
    super(x - 5, y - 4, 10, 8);
    this.team = 'player';
    this.isPlayer = true;
    this.swims = true;
    this.facing = 'down';
    this.flip = false;          // sprite faces right by default
    this.iframes = 0;
    this.swordCd = 0; this.bowCd = 0;
    this.attackT = 0;           // >0 while slashing
    this.slashId = 0;           // increments per swing so each slash hits once
    this.blocking = false;
    this.swimming = false;
    this.animT = 0;
    this.moving = false;
    this.hazardT = 0;
    this.knockx = 0; this.knocky = 0;
  }

  get slashBox() {
    if (this.attackT <= 0) return null;
    const R = 17, W = 22;
    switch (this.facing) {
      case 'right': return { x: this.x + this.w, y: this.cy - W / 2 - 4, w: R, h: W };
      case 'left': return { x: this.x - R, y: this.cy - W / 2 - 4, w: R, h: W };
      case 'up': return { x: this.cx - W / 2, y: this.y - R - 6, w: W, h: R + 4 };
      case 'down': return { x: this.cx - W / 2, y: this.y + this.h - 2, w: W, h: R };
    }
  }

  update(g, dt) {
    const st = g.state;
    this.iframes = Math.max(0, this.iframes - dt);
    this.swordCd = Math.max(0, this.swordCd - dt);
    this.bowCd = Math.max(0, this.bowCd - dt);
    this.attackT = Math.max(0, this.attackT - dt);
    this.blockFlash = Math.max(0, (this.blockFlash || 0) - dt);

    // knockback decay
    this.knockx *= Math.pow(0.0001, dt); this.knocky *= Math.pow(0.0001, dt);
    if (Math.abs(this.knockx) < 4) this.knockx = 0;
    if (Math.abs(this.knocky) < 4) this.knocky = 0;

    const centerTile = tileAt(g, this.cx, this.cy);
    const tp = tileProps(centerTile);
    this.swimming = !!tp.deep;

    // shield
    this.blocking = st.shield > 0 && input.down('shield') && !this.swimming && this.attackT <= 0;

    // movement
    let [ax, ay] = input.axis();
    this.moving = !!(ax || ay);
    if (this.moving) {
      if (Math.abs(ax) > Math.abs(ay)) this.facing = ax > 0 ? 'right' : 'left';
      else if (ay) this.facing = ay > 0 ? 'down' : 'up';
      if (ax) this.flip = ax < 0;
    }
    let speed = this.swimming ? PLAYER.swimSpeed : PLAYER.speed;
    if (tp.slow) speed *= PLAYER.slowMult;
    if (this.blocking) speed *= SHIELD_SLOW[clamp(st.shield, 0, 6)];
    if (this.attackT > 0) speed *= 0.4;

    let dx = ax * speed * dt + this.knockx * dt;
    let dy = ay * speed * dt + this.knocky * dt;
    // gust tiles push south
    if (centerTile === T.GUST) dy += 55 * dt;

    const res = moveEntity(g, this, dx, dy);
    if (res.bumpTile) g.onPlayerBumpTile(res.bumpTile);
    if (res.bumpEnt && res.bumpEnt.onBump) res.bumpEnt.onBump(g, this, ax, ay);

    // hazard tiles
    if (tp.dmg || tp.lava) {
      this.hurt(g, 1, this.cx, this.cy + 10, true);
    }

    // actions
    if (!this.swimming) {
      if (input.pressed('sword') && st.sword > 0 && this.swordCd <= 0) {
        this.attackT = PLAYER.swordTime;
        this.swordCd = PLAYER.swordCooldown;
        this.slashId++;
        audio.sfx('slash');
        this.emitSlashSparks(g);
      }
      if (input.pressed('bow') && st.bow > 0 && this.bowCd <= 0) this.shoot(g);
    }

    // arrow type cycling
    if (input.pressed('cycleL')) g.cycleArrow(-1);
    if (input.pressed('cycleR')) g.cycleArrow(1);
    for (let i = 1; i <= 6; i++) if (input.pressed('slot' + i)) g.selectArrowSlot(i - 1);

    this.animT += dt * (this.moving ? 1 : 0.4);
  }

  // Sparks are thrown along the swing arc; higher tiers throw more of them.
  emitSlashSparks(g) {
    const look = SWORD_LOOK[clamp(g.state.sword, 1, 5)];
    if (!look.spark || !look.sparkN) return;
    const base = SLASH_BASE[this.facing], sweep = SLASH_SWEEP[this.facing];
    for (let i = 0; i < look.sparkN; i++) {
      const a = base + sweep * (i / look.sparkN) + (Math.random() - 0.5) * 0.3;
      const r = look.len * (0.55 + Math.random() * 0.5);
      g.addParticle(
        this.cx + Math.cos(a) * r, this.cy - 3 + Math.sin(a) * r,
        look.spark, 0.2 + Math.random() * 0.25,
        Math.cos(a) * 55, Math.sin(a) * 55, Math.random() < 0.35 ? 2 : 1,
      );
    }
  }

  shoot(g) {
    const st = g.state;
    const type = st.arrowSel;
    const info = ARROWS[type];
    const owned = st.arrows.types[type];
    if (!owned || !owned.owned) return;
    if (st.arrows.ammo < info.cost) { audio.sfx('denied'); return; }
    st.arrows.ammo -= info.cost;
    const bl = clamp(st.bow, 0, 6);
    this.bowCd = PLAYER.bowCooldown * BOW_COOLDOWN[bl];
    const [dx, dy] = DIRS[this.facing];
    const lvl = owned.level;
    const range = PLAYER.arrowRange * BOW_POWER[bl];
    const speed = PLAYER.arrowSpeed * BOW_POWER[bl];
    g.spawn(new Arrow(this.cx + dx * 8, this.cy - 4 + dy * 8, dx, dy, type, lvl, speed, range));
    audio.sfx('arrow');
  }

  // returns true if damage was actually taken
  hurt(g, dmg, sx, sy, isHazard = false) {
    if (this.iframes > 0 || g.state.god) return false;
    // shield block: attack must come from the front
    if (this.blocking && !isHazard) {
      const [fx, fy] = DIRS[this.facing];
      const [tx, ty] = dirTo(this.cx, this.cy, sx, sy);
      // better shields cover a wider arc
      if (fx * tx + fy * ty > SHIELD_ARC[clamp(g.state.shield, 0, 6)]) {
        audio.sfx('thud');
        this.onBlocked(g);
        const [kx, ky] = dirTo(sx, sy, this.cx, this.cy);
        this.knockx = kx * 90; this.knocky = ky * 90;
        this.iframes = 0.25;
        return false;
      }
    }
    const reduced = Math.max(1, dmg - ARMOR_REDUCE[g.state.armor]);
    g.state.hp -= reduced;
    this.iframes = PLAYER.iframes;
    const [kx, ky] = dirTo(sx, sy, this.cx, this.cy);
    this.knockx = kx * 150; this.knocky = ky * 150;
    audio.sfx('hurt');
    buzz(18);
    g.shake(4, 0.25);
    g.burst(this.cx, this.cy - 6, '#e04a5a', 8);
    if (g.state.hp <= 0) g.onPlayerDeath();
    return true;
  }

  draw(g, ctx) {
    if (this.iframes > 0 && Math.floor(g.time * 14) % 2 === 0 && g.state.hp > 0) return;
    const cx = this.cx, by = this.bottom + 3;
    const st = g.state;
    let name = 'gus_idle';
    if (this.swimming) name = 'gus_swim';
    else if (this.moving) name = Math.floor(this.animT * 8) % 2 ? 'gus_walk1' : 'gus_walk2';
    drawSprite(ctx, name, cx, by, { flip: this.flip });
    // worn armor is a real overlay on the same grid; skipped while swimming since the
    // swim sprite is a different pose
    if (st.armor > 0 && !this.swimming) drawSprite(ctx, 'armor' + st.armor, cx, by, { flip: this.flip });

    // shield: braced in front, with a tier aura and an impact flare when it eats a hit
    if (this.blocking) this.drawShield(ctx, SHIELD_LOOK[clamp(st.shield, 1, 6)], cx, by, g);
    // the sword is only drawn while swinging
    if (this.attackT > 0) this.drawSlash(ctx, SWORD_LOOK[clamp(st.sword, 1, 6)], cx);
  }

  drawShield(ctx, look, cx, by, g) {
    const [fx, fy] = DIRS[this.facing];
    const sx = Math.round(cx + fx * 9), sy = Math.round(by - 4 + fy * 6);
    const hit = this.blockFlash > 0 ? this.blockFlash / 0.22 : 0;
    ctx.save();
    // standing aura on the later shields — deliberately faint, it sits on screen the whole
    // time you hold block and must not wash Gus out
    if (look.aura) {
      ctx.globalAlpha = look.aura * (0.34 + 0.12 * Math.sin(g.time * 6)) + hit * 0.14;
      ctx.fillStyle = look.glow;
      ctx.beginPath();
      ctx.arc(sx, sy - 5, 6 + look.aura * 7, 0, 7);
      ctx.fill();
    }
    ctx.restore();
    drawSprite(ctx, look.sprite, sx, sy, { flip: this.facing === 'left', flash: hit > 0.8 });
    // impact ring, expanding out from the boss of the shield
    if (hit > 0) {
      ctx.save();
      ctx.globalAlpha = hit * 0.7;
      ctx.strokeStyle = look.spark;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx, sy - 5, 4 + (1 - hit) * 9, 0, 7);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Called wherever a hit is turned away, so every block reads the same.
  onBlocked(g) {
    const look = SHIELD_LOOK[clamp(g.state.shield, 1, 6)];
    const [fx, fy] = DIRS[this.facing];
    this.blockFlash = 0.22;
    g.burst(this.cx + fx * 10, this.cy - 4 + fy * 6, look.spark, 7);
    buzz(10);
  }

  drawSlash(ctx, look, cx) {
    const prog = 1 - this.attackT / PLAYER.swordTime;
    const base = SLASH_BASE[this.facing], sweep = SLASH_SWEEP[this.facing];
    const ang = base + sweep * prog;
    const ox = cx, oy = this.cy - 3;
    const ccw = sweep < 0;

    ctx.save();
    // motion trail: a fan of arcs lagging the blade, brightest and longest on top
    look.trail.forEach((col, i) => {
      const t = i / look.trail.length;
      ctx.globalAlpha = look.trailAlpha * (1 - t * 0.6);
      ctx.strokeStyle = col;
      ctx.lineWidth = Math.max(1, look.w + 1 - i);
      ctx.beginPath();
      const from = base + sweep * Math.max(0, prog - 0.5 + t * 0.18);
      ctx.arc(ox, oy, Math.max(4, look.len - 2 - i * 2), from, ang, ccw);
      ctx.stroke();
    });
    // elemental bloom at the tip
    if (look.glow) {
      ctx.globalAlpha = 0.3 * (1 - prog * 0.35);
      ctx.fillStyle = look.glow;
      ctx.beginPath();
      ctx.arc(ox + Math.cos(ang) * look.len * 0.75, oy + Math.sin(ang) * look.len * 0.75, look.w + 3, 0, 7);
      ctx.fill();
    }
    // Blade only — no hilt. A crossguard and grip at the pivot sit inside Gus's body and
    // read as clutter, so the swing is just the arcing blade: full width at the base,
    // tapering to a hot tip.
    ctx.globalAlpha = 1;
    ctx.translate(Math.round(ox), Math.round(oy));
    ctx.rotate(ang);
    const L = look.len;
    const W = look.w, Wt = Math.max(1, W - 1);         // base and tip thickness
    const top = -(W >> 1), topT = -(Wt >> 1);
    const b0 = 5;                                      // starts clear of his body
    const knee = Math.round(b0 + (L - b0) * 0.6);      // where the taper begins
    // dark silhouette so the blade reads against any background
    ctx.fillStyle = look.dark;
    ctx.fillRect(b0 - 1, top - 1, knee - b0 + 2, W + 2);
    ctx.fillRect(knee, topT - 1, L - knee, Wt + 2);
    // metal core
    ctx.fillStyle = look.core;
    ctx.fillRect(b0, top, knee - b0 + 1, W);
    ctx.fillRect(knee, topT, L - knee - 1, Wt);
    // lit leading edge running the length of it
    ctx.fillStyle = look.edge;
    ctx.fillRect(b0, top, knee - b0 + 1, 1);
    ctx.fillRect(knee, topT, L - knee - 1, 1);
    // glinting point
    ctx.fillRect(L - 2, topT, 2, Math.max(1, Wt));
    ctx.restore();
  }
}

// ---------------------------------------------------------------- ARROW (player)
export class Arrow extends Entity {
  constructor(x, y, dx, dy, type, level, speed, range) {
    super(x - 3, y - 3, 6, 6);
    this.team = 'player';
    this.dx = dx; this.dy = dy;
    this.type = type; this.level = level;
    this.speed = speed;
    this.left = range;
    this.hitIds = new Set();
    this.fly = true;
  }
  update(g, dt) {
    const step = this.speed * dt;
    this.x += this.dx * step; this.y += this.dy * step;
    this.left -= step;
    // tile collision
    const tx = Math.floor(this.cx / TILE), ty = Math.floor(this.cy / TILE);
    const id = g.area.get(tx, ty);
    const p = tileProps(id);
    if (id === T.EYE) { g.triggerEye(tx, ty); this.die(g, true); return; }
    if (p.solid) { this.die(g, true); return; }
    if (this.left <= 0) { this.die(g, this.type === 'bomb'); return; }
    if (this.type === 'fire' && Math.random() < 0.3) g.addParticle(this.cx, this.cy, '#ff8a3a', 0.3);
    if (this.type === 'light' && Math.random() < 0.5) g.addParticle(this.cx, this.cy, '#fff6c8', 0.4);
  }
  die(g, impact) {
    if (this.dead) return;
    this.dead = true;
    if (this.type === 'bomb' && impact) g.explode(this.cx, this.cy, BOMB_RADIUS + this.level * 6, ARROWS.bomb.dmg(this.level), true);
    else if (impact) g.burst(this.cx, this.cy, ARROWS[this.type].color, 4);
  }
  // called by game when overlapping an enemy
  onHitEnemy(g, e) {
    if (this.hitIds.has(e.id)) return;
    this.hitIds.add(e.id);
    let dmg = ARROWS[this.type].dmg(this.level);
    if (this.type === 'light') { dmg = e.isBoss ? dmg * 2 : dmg; }
    e.hurt(g, dmg, this.cx, this.cy);
    if (this.type === 'fire') { e.burnT = BURN.ticks * BURN.interval; audio.sfx('burn'); }
    if (this.type === 'ice') { e.frozenT = FREEZE_TIME + this.level * 0.4; audio.sfx('freeze'); }
    if (this.type === 'lightning') {
      audio.sfx('zap');
      let n = 0;
      for (const o of g.enemies()) {
        if (o === e || o.dead || n >= CHAIN_TARGETS + this.level - 1) continue;
        if (dist(e.cx, e.cy, o.cx, o.cy) < 70) {
          o.hurt(g, Math.max(1, Math.ceil(dmg / 2)), e.cx, e.cy);
          g.zapLine(e.cx, e.cy - 6, o.cx, o.cy - 6);
          n++;
        }
      }
    }
    if (this.type === 'bomb') { this.die(g, true); return; }
    if (this.type !== 'light') this.dead = true; // light arrows pierce
  }
  draw(g, ctx) {
    ctx.save();
    ctx.translate(this.cx, this.cy);
    ctx.rotate(Math.atan2(this.dy, this.dx));
    ctx.fillStyle = '#8a6a3a';
    ctx.fillRect(-5, -1, 8, 2);
    ctx.fillStyle = ARROWS[this.type].color;
    ctx.fillRect(3, -2, 4, 4);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- ENEMY SHOT
export class EnemyShot extends Entity {
  constructor(x, y, vx, vy, kind, dmg) {
    super(x - 3, y - 3, 6, 6);
    this.team = 'enemy';
    this.vx = vx; this.vy = vy;
    this.kind = kind;    // fireball | zap | feather | rock | spit | bomblet
    this.isShot = true;
    this.dmg = dmg;
    this.life = kind === 'bomblet' ? 1.1 : 2.6;
    this.reflected = false;
    this.fly = true;
  }
  update(g, dt) {
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.life -= dt;
    if (this.kind === 'bomblet') { this.vy += 60 * dt; }
    const id = tileAt(g, this.cx, this.cy);
    if (tileProps(id).solid || this.life <= 0) {
      if (this.kind === 'bomblet') g.explode(this.cx, this.cy, 22, this.dmg, false);
      else g.burst(this.cx, this.cy, this.color(), 3);
      this.dead = true;
      return;
    }
    if (this.kind === 'fireball' && Math.random() < 0.4) g.addParticle(this.cx, this.cy, '#ff8a3a', 0.25);
  }
  color() {
    return { fireball: '#ff7a30', zap: '#ffe95c', feather: '#d8e0f0', rock: '#9a928a', spit: '#7ad4ff', bomblet: '#4a4a5a' }[this.kind] || '#fff';
  }
  draw(g, ctx) {
    ctx.fillStyle = this.color();
    if (this.kind === 'feather') {
      ctx.save(); ctx.translate(this.cx, this.cy); ctx.rotate(Math.atan2(this.vy, this.vx));
      ctx.fillRect(-4, -1, 8, 2); ctx.restore();
    } else if (this.kind === 'bomblet') {
      drawSprite(ctx, 'bomb', this.cx, this.cy + 4);
    } else {
      ctx.beginPath(); ctx.arc(this.cx, this.cy, this.kind === 'rock' ? 4 : 3, 0, 7); ctx.fill();
      if (this.kind === 'fireball' || this.kind === 'zap') {
        ctx.fillStyle = '#fff8d0';
        ctx.fillRect(this.cx - 1, this.cy - 1, 2, 2);
      }
    }
  }
}

// ---------------------------------------------------------------- PICKUPS
const PICKUP_SPRITES = { coin: 'coin', diamond: 'diamond', crayfish: 'crayfish', arrows: 'arrows', shard: 'shard' };
export class Pickup extends Entity {
  constructor(x, y, kind, amount = 1) {
    super(x - 4, y - 4, 8, 8);
    this.kind = kind; this.amount = amount;
    this.vx = (Math.random() - 0.5) * 60;
    this.vy = -Math.random() * 40 - 20;
    this.z = 0; this.vz = 60 + Math.random() * 40;
    this.age = 0;
    this.life = kind === 'shard' ? Infinity : 14;
  }
  update(g, dt) {
    this.age += dt; this.life -= dt;
    if (this.life <= 0) { this.dead = true; return; }
    // little toss animation
    if (this.age < 0.6) {
      this.x += this.vx * dt; this.y += this.vy * dt;
      this.vy += 160 * dt;
    } else {
      // magnet toward player
      const p = g.player;
      const d = dist(this.cx, this.cy, p.cx, p.cy);
      if (d < 40) {
        const [dx, dy] = dirTo(this.cx, this.cy, p.cx, p.cy);
        const pull = this.kind === 'shard' ? 0 : 140;
        this.x += dx * pull * dt; this.y += dy * pull * dt;
      }
      if (d < 12) this.collect(g);
    }
  }
  collect(g) {
    if (this.dead) return;
    this.dead = true;
    const st = g.state;
    switch (this.kind) {
      case 'coin': st.coins += this.amount; audio.sfx('coin'); break;
      case 'diamond': st.diamonds += this.amount; audio.sfx('gem'); break;
      case 'crayfish':
        st.hp = Math.min(st.maxHp, st.hp + CRAYFISH_HEAL);
        audio.sfx('cray');
        g.toast('Crayfish! Yum. +2 hearts');
        break;
      case 'arrows':
        st.arrows.ammo = Math.min(st.arrows.cap, st.arrows.ammo + this.amount);
        audio.sfx('blip');
        break;
      case 'shard': g.onShardCollected(); break;
    }
    g.burst(this.cx, this.cy, this.kind === 'diamond' ? '#6ae0f0' : this.kind === 'shard' ? '#fff' : '#f0c83a', 5);
  }
  draw(g, ctx) {
    const bob = Math.sin(g.time * 4 + this.id) * 1.5;
    if (this.kind === 'shard') {
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.2 * Math.sin(g.time * 5);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(this.cx, this.cy - 4 + bob, 9, 0, 7); ctx.fill();
      ctx.restore();
    }
    if (this.life < 3 && Math.floor(g.time * 8) % 2 === 0) return;
    drawSprite(ctx, PICKUP_SPRITES[this.kind], this.cx, this.bottom + bob);
  }
}

// standard enemy drop table
export function spawnDrops(g, x, y, tier, rich = 0) {
  const roll = Math.random();
  if (roll < DROPS.coinChance + rich * 0.15) {
    const n = 1 + Math.floor(Math.random() * (DROPS.coinMax + tierCoins(0, tier) + rich));
    for (let i = 0; i < n; i++) g.spawn(new Pickup(x, y, 'coin', 1));
  }
  if (Math.random() < DROPS.crayfishChance) g.spawn(new Pickup(x, y, 'crayfish'));
  if (Math.random() < DROPS.arrowChance) g.spawn(new Pickup(x, y, 'arrows', 3 + tier));
  if (Math.random() < DROPS.diamondChance + rich * 0.02) g.spawn(new Pickup(x, y, 'diamond', 1));
}

// ---------------------------------------------------------------- CHEST
export class Chest extends Entity {
  constructor(tx, ty, id, contents, msg) {
    super(tx * TILE + 1, ty * TILE + 4, 14, 11);
    this.solid = true;
    this.chestId = id;
    this.contents = contents;
    this.msg = msg;
    this.opened = false;
  }
  interact(g) {
    if (this.opened) { g.toast('Empty.'); return; }
    this.opened = true;
    g.state.flags[this.chestId] = true;
    audio.sfx('chest');
    g.grantContents(this.contents, this.msg);
  }
  draw(g, ctx) {
    drawSprite(ctx, this.opened ? 'chest_open' : 'chest', this.cx, this.bottom);
    if (!this.opened) {
      const tw = Math.sin(g.time * 3 + this.id) > 0.6;
      if (tw) { ctx.fillStyle = '#fff8d0'; ctx.fillRect(this.cx + 4, this.y - 2, 2, 2); }
    }
  }
}

// ---------------------------------------------------------------- POT
export class Pot extends Entity {
  constructor(tx, ty) {
    super(tx * TILE + 3, ty * TILE + 4, 10, 10);
    this.solid = true;
  }
  smash(g) {
    if (this.dead) return;
    this.dead = true;
    audio.sfx('poof');
    g.burst(this.cx, this.cy, '#b07848', 7);
    if (Math.random() < 0.5) g.spawn(new Pickup(this.cx, this.cy, 'coin', 1));
    else if (Math.random() < 0.3) g.spawn(new Pickup(this.cx, this.cy, 'crayfish'));
    else if (Math.random() < 0.5) g.spawn(new Pickup(this.cx, this.cy, 'arrows', 3));
  }
  draw(g, ctx) { drawSprite(ctx, 'pot', this.cx, this.bottom); }
}

// ---------------------------------------------------------------- PUSH BLOCK
export class PushBlock extends Entity {
  constructor(tx, ty) {
    super(tx * TILE, ty * TILE, 16, 16);
    this.solid = true;
    this.pushT = 0;
    this.sliding = null;
  }
  onBump(g, player, ax, ay) {
    if (this.sliding) return;
    this.pushT += 1 / 60;
    if (this.pushT < 0.18) return;
    this.pushT = 0;
    const dx = Math.abs(ax) > Math.abs(ay) ? Math.sign(ax) : 0;
    const dy = dx === 0 ? Math.sign(ay) : 0;
    if (!dx && !dy) return;
    const ntx = Math.floor(this.x / TILE) + dx, nty = Math.floor(this.y / TILE) + dy;
    const id = g.area.get(ntx, nty);
    const p = tileProps(id);
    if (p.solid || p.deep || p.lava || p.dmg) return;
    for (const s of g.solidEnts) if (s !== this && !s.dead && aabb({ x: ntx * TILE, y: nty * TILE, w: 16, h: 16 }, s.box())) return;
    this.sliding = { tx: ntx * TILE, ty: nty * TILE };
    audio.sfx('door');
  }
  update(g, dt) {
    if (this.sliding) {
      const s = this.sliding;
      const step = 70 * dt;
      this.x += clamp(s.tx - this.x, -step, step);
      this.y += clamp(s.ty - this.y, -step, step);
      if (Math.abs(this.x - s.tx) < 0.5 && Math.abs(this.y - s.ty) < 0.5) {
        this.x = s.tx; this.y = s.ty;
        this.sliding = null;
        g.checkPlates();
      }
    } else this.pushT = Math.max(0, this.pushT - dt * 0.5);
  }
  draw(g, ctx) { drawSprite(ctx, 'block', this.cx, this.bottom); }
}

// ---------------------------------------------------------------- DOLPHIN (friendly)
// team 'friend' rather than 'enemy', so every combat path in the game skips them by
// construction — swords, arrows and blasts all filter on team === 'enemy'. hurt() is a
// no-op too, so nothing can ever injure them even if a future code path reaches for it.
export const DOLPHIN_LINES = [
  "Click-click! Deep water is a road, not a wall. Paddle on through, Gus.",
  "Crocs upriver have been grumpy. Keep that shield up, little mate.",
  "We watched your dad swim these channels. You've got his kick.",
  "Eee-eee! Cracked rocks hate a good bang. Remember that.",
  "The lagoon hides more than fish. Dive where the water goes dark.",
  "Rest a while! The Vale keeps. We'll keep watch out here.",
];

export class Dolphin extends Entity {
  constructor(x, y, name, line) {
    super(x - 8, y - 4, 16, 8);
    this.team = 'friend';
    this.aquatic = true;
    this.deepOnly = true;     // confined to deep water by moveEntity
    this.solid = false;       // Gus can swim straight past a friend
    this.name = name || 'Dolphin';
    this.line = line || DOLPHIN_LINES[0];
    this.dir = Math.random() * Math.PI * 2;
    this.turnT = Math.random() * 2;
    this.leapT = 3 + Math.random() * 6;
    this.z = 0; this.vz = 0;  // height above the water while leaping
    this.flip = false;
    this.bob = Math.random() * 6;
  }

  hurt() { /* dolphins are friends: they cannot be injured */ }

  update(g, dt) {
    this.bob += dt;
    const p = g.player;
    const near = dist(this.cx, this.cy, p.cx, p.cy);

    // airborne arc
    if (this.z > 0 || this.vz > 0) {
      this.z += this.vz * dt;
      this.vz -= 150 * dt;
      if (this.z <= 0) {
        this.z = 0; this.vz = 0;
        audio.sfx('splash');
        g.burst(this.cx, this.cy, '#bfe8f2', 8);
      }
    } else {
      this.leapT -= dt;
      if (this.leapT <= 0) {
        this.leapT = 5 + Math.random() * 7;
        this.vz = 72;                       // ~17px arc — a visible breach, not a bob
        audio.sfx('splash');
        g.burst(this.cx, this.cy, '#bfe8f2', 6);
      }
    }

    // swim alongside Gus when he's in the water nearby, otherwise mill about
    let tx, ty;
    if (p.swimming && near < 110) {
      const a = Math.sin(this.bob * 0.8) * 1.2;
      tx = p.cx + Math.cos(a) * 26; ty = p.cy + Math.sin(a) * 20;
    } else {
      this.turnT -= dt;
      if (this.turnT <= 0) { this.turnT = 1.5 + Math.random() * 2.5; this.dir += (Math.random() - 0.5) * 2.2; }
      tx = this.cx + Math.cos(this.dir) * 40; ty = this.cy + Math.sin(this.dir) * 40;
    }
    const [dx, dy] = dirTo(this.cx, this.cy, tx, ty);
    const spd = (p.swimming && near < 110 ? 46 : 26) * (near < 22 ? 0.3 : 1);
    const res = moveEntity(g, this, dx * spd * dt, dy * spd * dt);
    if (res.hitX || res.hitY) this.dir += 2.2 + Math.random();   // bounced off the shore
    if (Math.abs(dx) > 0.15) this.flip = dx < 0;

    if (Math.random() < dt * 1.6) {
      g.addParticle(this.cx + (Math.random() - 0.5) * 12, this.cy + 3, '#bfe8f2', 0.4, 0, -8, 1);
    }
  }

  interact(g) {
    audio.sfx('cray');
    g.openDialog(this.name, this.line);
  }

  draw(g, ctx) {
    const y = this.bottom + 2 - this.z;
    // wake ring on the surface, hidden while airborne
    if (this.z < 2) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#bfe8f2';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(this.cx, this.bottom + 1, 9 + Math.sin(this.bob * 3) * 1.5, 3, 0, 0, 7);
      ctx.stroke();
      ctx.restore();
    }
    const rise = this.vz > 0 ? -0.35 : this.z > 0 ? 0.35 : 0;   // nose up, then down
    drawSprite(ctx, 'dolphin', this.cx, y, { flip: this.flip, angle: rise * (this.flip ? -1 : 1) });
  }
}

// ---------------------------------------------------------------- PROPS (sign/npc/statue/shrine/gate/dungeon entrance)
const PROP_SPRITES = { sign: 'sign', statue: 'statue', shrine: 'shrine', gate: 'gate', gong: 'gong' };
export class Prop extends Entity {
  constructor(def) {
    const px = def.tx * TILE, py = def.ty * TILE;
    // the gate fills the full 3x2-tile gap in the Confluence wall
    if (def.kind === 'gate') super(px - 16, py, 48, 32);
    else if (def.kind === 'dungeon') super(px, py, 16, 16);
    else super(px + 2, py + 2, 12, 12);
    this.def = def;
    this.kind = def.kind;
    this.solid = this.kind !== 'dungeon';
  }
  interact(g) { g.interactProp(this); }
  draw(g, ctx) {
    if (this.kind === 'dungeon') return; // stairs tile is the visual
    if (this.kind === 'npc') {
      const bob = this.def.sprite === 'wombat' ? 0 : Math.sin(g.time * 2 + this.id) * 0.8;
      drawSprite(ctx, this.def.sprite, this.cx, this.bottom + 2 + bob, { flip: g.player && g.player.cx < this.cx });
      return;
    }
    // the gate is masonry set into the wall, so it aligns to the tile grid exactly
    drawSprite(ctx, PROP_SPRITES[this.kind], this.cx, this.bottom + (this.kind === 'gate' ? 0 : 2));
    if (this.kind === 'shrine') {
      ctx.save();
      ctx.globalAlpha = 0.4 + 0.2 * Math.sin(g.time * 3);
      ctx.fillStyle = '#6ae0f0';
      ctx.fillRect(this.cx - 1, this.y - 12 + Math.sin(g.time * 3) * 2, 2, 2);
      ctx.restore();
    }
  }
}
