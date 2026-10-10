// Player, projectiles, pickups, chests, props, push blocks.
import { TILE, PLAYER, SWORD_LOOK, SWORD_DMG, SHIELD_LOOK, ARMOR_REDUCE, SHIELD_ARC, SHIELD_SLOW, BOW_COOLDOWN, BOW_POWER,
  ARROWS, BURN, FREEZE_TIME, CHAIN_TARGETS, BOMB_RADIUS, CRAYFISH_HEAL, DROPS, SPRINT, GOD_SWORD_LV, GOD_BEAM, KEEPSAKE_BY_ID, CRYSTAL_GOAL, GLOOM, tierCoins } from './config.js';
import { clamp, aabb, dist, dirTo, DIRS } from './util.js';
import { T, props as tileProps } from './tiles.js';
import { drawSprite, sprites, frameName, PUGGLE_ACCESSORIES } from './pixelart.js';
import { input } from './input.js';
import { audio } from './audio.js';
import { touch, buzz } from './touch.js';

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
  if (p.under) return !!e.diving;              // deep water under a rock arch: divers only
  // mid-jump (or mid-zip), sailing over holes, low walls and anything nasty underfoot
  if (e.airborne && (p.pit || p.low || p.lava || p.deep || p.water)) return true;
  if (e.fly) return !p.solid;
  if (p.solid || p.lava || p.pit) return false;
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
    this.swordCd = 0; this.bowCd = 0; this.bowPoseT = 0;
    this.attackT = 0;           // >0 while slashing
    this.slashId = 0;           // increments per swing so each slash hits once
    this.blocking = false;
    this.swimming = false;
    this.gloomWait = GLOOM.wait;
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
    this.bowPoseT = Math.max(0, this.bowPoseT - dt);
    this.attackT = Math.max(0, this.attackT - dt);
    this.blockFlash = Math.max(0, (this.blockFlash || 0) - dt);

    // knockback decay
    this.knockx *= Math.pow(0.0001, dt); this.knocky *= Math.pow(0.0001, dt);
    if (Math.abs(this.knockx) < 4) this.knockx = 0;
    if (Math.abs(this.knocky) < 4) this.knocky = 0;

    // a power on the go (a jump, a dash, a grapple zip, a dig) moves Gus itself
    if (g.powerMotion(this, dt)) return;

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
    if (tp.goo) speed *= GLOOM.slow;
    if (this.blocking) speed *= SHIELD_SLOW[clamp(st.shield, 0, 6)];
    if (this.attackT > 0) speed *= 0.4;
    if (this.updateSprint(g, dt, ax, ay)) speed *= SPRINT.mult;

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
    this.updateGloom(g, dt, tp.goo && !this.swimming);

    // actions
    if (!this.swimming) {
      if (input.pressed('sword') && st.sword > 0 && this.swordCd <= 0) {
        this.attackT = PLAYER.swordTime;
        this.swordCd = PLAYER.swordCooldown;
        this.slashId++;
        audio.sfx('slash');
        this.emitSlashSparks(g);
        // the God Sword throws a beam of light on every swing while Gus is at full health
        if (st.sword >= GOD_SWORD_LV && st.hp >= st.maxHp) this.fireBeam(g);
      }
      if (input.pressed('bow') && st.bow > 0 && this.bowCd <= 0) this.shoot(g);
    }
    if (input.pressed('power')) g.usePower(this, ax, ay);

    // arrow type cycling
    if (input.pressed('cycleL')) g.cycleArrow(-1);
    if (input.pressed('cycleR')) g.cycleArrow(1);
    for (let i = 1; i <= 6; i++) if (input.pressed('slot' + i)) g.selectArrowSlot(i - 1);

    // feet go faster on a sprint, so the bounce reads as running
    this.animT += dt * (this.moving ? (this.sprinting ? 1.7 : 1) : 0.4);

    // a faint glitter at his side while the God Sword's beam is ready to fly
    if (st.sword >= GOD_SWORD_LV && st.hp >= st.maxHp && !this.swimming && Math.random() < dt * 5) {
      g.addParticle(this.cx + (this.flip ? -6 : 6) + (Math.random() - 0.5) * 4, this.cy - 2,
        Math.random() < 0.5 ? '#fff6c8' : '#ffd84a', 0.45, 0, -14, 1);
    }
  }

  // Zelda rules: one beam on screen at a time, fired along the swing's facing.
  fireBeam(g) {
    if (g.ents.some(e => e instanceof SwordBeam && !e.dead)) return;
    const [dx, dy] = DIRS[this.facing];
    g.spawn(new SwordBeam(this.cx + dx * 10, this.cy - 3 + dy * 10, dx, dy, SWORD_DMG[g.state.sword]));
    audio.sfx('beam');
  }

  // Sprint is a hold on the keyboard. On touch a tap *latches* it, because the right thumb
  // can't keep a button down and still reach the sword; the latch drops when Gus stops or
  // the bar runs dry, and a second tap cancels it early. Returns whether he's sprinting.
  // Alien goo is gloom: every `tick` in it bites off a half heart for good (until he's out
  // of it a while), with dark bubbles clinging to him. Out of the goo, after a wait, the
  // broken hearts mend one half heart at a time.
  updateGloom(g, dt, inGoo) {
    const st = g.state;
    if (inGoo) {
      this.gooT = (this.gooT || 0) - dt;
      if (this.gooT <= 0 && !st.god) {
        this.gooT = GLOOM.tick;
        audio.sfx('goo');
        g.burst(this.cx, this.cy - 4, '#7a2a9a', 6);
        g.addGloom(1);
      }
      if (Math.random() < dt * 14) g.addParticle(this.cx + (Math.random() - 0.5) * 12, this.bottom - 2, Math.random() < 0.5 ? '#3a0a4a' : '#8aff6a', 0.5, 0, -18, 1);
      return;
    }
    this.gooT = 0;
    if (!st.gloom) return;
    if ((this.gloomWait -= dt) > 0) return;
    this.gloomWait = GLOOM.fade;
    st.gloom--;
    if (!st.gloom) { audio.sfx('heart'); g.toast('Your hearts are mended!'); }
  }
  updateSprint(g, dt, ax, ay) {
    const sp = g.sprint;
    if (touch.pressed('sprint')) sp.latch = !sp.latch;
    if (!this.moving || sp.bar <= 0) sp.latch = false;
    const want = this.moving && !this.blocking && (sp.latch || input.down('sprint'));
    const sprinting = want && !sp.winded && sp.bar > 0;
    if (sprinting) {
      sp.bar = Math.max(0, sp.bar - dt);
      sp.rest = SPRINT.regenDelay;
      if (sp.bar <= 0) { sp.winded = true; sp.latch = false; audio.sfx('winded'); }
      // dust (or spray) kicked up behind his feet
      if (Math.random() < dt * 16) {
        g.addParticle(this.cx - ax * 4 + (Math.random() - 0.5) * 5, this.bottom + 1 + (Math.random() - 0.5) * 2,
          this.swimming ? '#bfe8f2' : '#d8c8a0', 0.25 + Math.random() * 0.2,
          -ax * 22, -ay * 22 - 5, Math.random() < 0.4 ? 2 : 1);
      }
    } else {
      sp.rest = Math.max(0, sp.rest - dt);
      if (sp.rest <= 0) sp.bar = Math.min(SPRINT.max, sp.bar + SPRINT.regen * dt);
      if (sp.winded && sp.bar >= SPRINT.max * SPRINT.windedUntil) sp.winded = false;
    }
    this.sprinting = sprinting;
    return sprinting;
  }

  // Sparks are thrown along the swing arc; higher tiers throw more of them.
  emitSlashSparks(g) {
    const look = SWORD_LOOK[clamp(g.state.sword, 1, SWORD_LOOK.length - 1)];
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
    this.bowPoseT = 0.18;
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
    // dashing, zipping on the grapple or deep under the water: nothing can touch him
    if (this.dash || this.zip || this.diving) return false;
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
    if (g.drawPowerPose(this, ctx)) return;
    const cx = this.cx, ground = this.bottom + 3, by = ground - (this.z || 0);
    const st = g.state;
    let name = 'gus_idle';
    if (this.swimming && !this.airborne) name = 'gus_swim';
    else if (this.moving) name = Math.floor(this.animT * 8) % 2 ? 'gus_walk1' : 'gus_walk2';
    if (!this.swimming || this.airborne) {
      // the shadow stays on the ground while he's up in the air
      ctx.fillStyle = '#25324155';
      ctx.fillRect(Math.round(cx) - 5, Math.round(ground) - 2, 10, 2);
      ctx.fillRect(Math.round(cx) - 3, Math.round(ground), 6, 1);
    }
    // a dash leaves a streak of ghost-Gus behind him
    if (this.dash) {
      ctx.save(); ctx.globalAlpha = 0.3;
      drawSprite(ctx, name, cx - this.dash.dx * 8, by - this.dash.dy * 6, { flip: this.flip, tint: '#ffb84a' });
      ctx.restore();
    }
    drawSprite(ctx, name, cx, by, { flip: this.flip });
    g.drawDig(this, ctx, by);
    // worn armor is a real overlay on the same grid; skipped while swimming since the
    // swim sprite is a different pose
    if (st.armor > 0 && !this.swimming) drawSprite(ctx, 'armor' + st.armor, cx, by, { flip: this.flip });

    // shield: braced in front, with a tier aura and an impact flare when it eats a hit
    if (this.blocking) this.drawShield(ctx, SHIELD_LOOK[clamp(st.shield, 1, 6)], cx, by, g);
    if (this.bowPoseT > 0 && !this.swimming && !this.blocking && this.attackT <= 0) {
      const [fx, fy] = DIRS[this.facing];
      ctx.save();
      ctx.translate(Math.round(cx + fx * 9), Math.round(this.cy - 3 + fy * 8));
      ctx.rotate(Math.atan2(fy, fx));
      const bow = sprites['bow' + clamp(st.bow, 1, 6)];
      ctx.drawImage(bow.canvas, -4, -6);
      ctx.restore();
    }
    // the sword is only drawn while swinging
    if (this.attackT > 0) this.drawSlash(ctx, SWORD_LOOK[clamp(st.sword, 1, SWORD_LOOK.length - 1)], cx);
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
    // Small wrapped grip, metal crossguard and beveled blade share the item artwork.
    ctx.globalAlpha = 1;
    ctx.translate(Math.round(ox), Math.round(oy));
    ctx.rotate(ang);
    const blade = sprites['sword' + SWORD_LOOK.indexOf(look)];
    ctx.drawImage(blade.canvas, 0, -4);
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
    // Mum's arrows (`friendly`) glance off eye switches rather than tripping Gus's puzzles
    if (id === T.EYE) { if (!this.friendly) g.triggerEye(tx, ty); this.die(g, true); return; }
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
    if (this.dmgMul && e.isBoss) dmg = Math.max(1, Math.round(dmg * this.dmgMul));
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
    const arrow = sprites['arrow_' + this.type];
    ctx.drawImage(arrow.canvas, -6, -2);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- SWORD BEAM (God Sword)
// The blade itself flies out, trailing its rainbow, and bursts into four diagonal sparks
// when it lands -- the classic full-health sword beam.
export class SwordBeam extends Entity {
  constructor(x, y, dx, dy, dmg) {
    super(x - 5, y - 5, 10, 10);
    this.team = 'player';
    this.dx = dx; this.dy = dy;
    this.dmg = dmg;
    this.left = GOD_BEAM.range;
    this.age = 0;
    this.fly = true;
  }
  update(g, dt) {
    this.age += dt;
    const step = GOD_BEAM.speed * dt;
    this.x += this.dx * step; this.y += this.dy * step;
    this.left -= step;
    const tx = Math.floor(this.cx / TILE), ty = Math.floor(this.cy / TILE);
    const id = g.area.get(tx, ty);
    if (id === T.EYE) { g.triggerEye(tx, ty); this.die(g); return; }
    if (tileProps(id).solid || this.left <= 0) { this.die(g); return; }
    const trail = SWORD_LOOK[GOD_SWORD_LV].trail;
    g.addParticle(this.cx - this.dx * 8 + (Math.random() - 0.5) * 6, this.cy - this.dy * 8 + (Math.random() - 0.5) * 6,
      trail[Math.floor(Math.random() * trail.length)], 0.3, -this.dx * 30, -this.dy * 30, Math.random() < 0.4 ? 2 : 1);
  }
  onHitEnemy(g, e) {
    e.hurt(g, this.dmg, this.cx, this.cy);
    this.die(g);
  }
  die(g) {
    if (this.dead) return;
    this.dead = true;
    for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      for (let i = 0; i < 3; i++) {
        g.addParticle(this.cx, this.cy, i ? '#fff6c8' : '#ffffff', 0.4, sx * (60 + i * 30), sy * (60 + i * 30), 2);
      }
    }
  }
  draw(g, ctx) {
    const s = sprites['sword' + GOD_SWORD_LV];
    ctx.save();
    ctx.translate(Math.round(this.cx), Math.round(this.cy));
    ctx.rotate(Math.atan2(this.dy, this.dx));
    ctx.globalAlpha = 0.35 + 0.2 * Math.sin(this.age * 40);
    ctx.fillStyle = '#fff6c8';
    ctx.beginPath(); ctx.ellipse(0, 0, 15, 6, 0, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.drawImage(s.canvas, -Math.round(s.w / 2), -4);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- ENEMY SHOT
export class EnemyShot extends Entity {
  constructor(x, y, vx, vy, kind, dmg) {
    super(x - 3, y - 3, 6, 6);
    this.team = 'enemy';
    this.vx = vx; this.vy = vy;
    this.kind = kind;    // fireball | zap | feather | rock | spit | bomblet | goo
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
    if (this.kind === 'goo' && Math.random() < 0.3) g.addParticle(this.cx, this.cy, '#4fa83a', 0.3, 0, 12, 1);
  }
  color() {
    return { fireball: '#ff7a30', zap: '#ffe95c', feather: '#d8e0f0', rock: '#9a928a', spit: '#7ad4ff', bomblet: '#4a4a5a', goo: '#8aff6a' }[this.kind] || '#fff';
  }
  draw(g, ctx) {
    ctx.fillStyle = this.color();
    if (this.kind === 'feather') {
      ctx.save(); ctx.translate(this.cx, this.cy); ctx.rotate(Math.atan2(this.vy, this.vx));
      ctx.fillRect(-4, -1, 8, 2); ctx.restore();
    } else if (this.kind === 'bomblet') {
      drawSprite(ctx, 'bomb', this.cx, this.cy + 4);
    } else {
      ctx.beginPath(); ctx.arc(this.cx, this.cy, this.kind === 'rock' || this.kind === 'goo' ? 4 : 3, 0, 7); ctx.fill();
      if (this.kind === 'goo') {
        ctx.fillStyle = '#2e6e22';
        ctx.fillRect(this.cx - 1, this.cy + 1, 3, 2);
        ctx.fillStyle = '#e0ffb8';
        ctx.fillRect(this.cx - 2, this.cy - 2, 2, 2);
      }
      if (this.kind === 'fireball' || this.kind === 'zap') {
        ctx.fillStyle = '#fff8d0';
        ctx.fillRect(this.cx - 1, this.cy - 1, 2, 2);
      }
    }
  }
}

// ---------------------------------------------------------------- PICKUPS
const PICKUP_SPRITES = { coin: 'coin', diamond: 'diamond', crayfish: 'crayfish', arrows: 'arrows', shard: 'shard', crystal: 'godcrystal', suncray: 'suncray', royalgem: 'royalgem' };
export class Pickup extends Entity {
  constructor(x, y, kind, amount = 1) {
    super(x - 4, y - 4, 8, 8);
    this.kind = kind; this.amount = amount;
    this.vx = (Math.random() - 0.5) * 60;
    this.vy = -Math.random() * 40 - 20;
    this.z = 0; this.vz = 60 + Math.random() * 40;
    this.age = 0;
    // god crystals hang about longer: a zombie drops a whole handful at once
    this.life = kind === 'shard' || kind === 'suncray' || kind === 'royalgem' ? Infinity : kind === 'crystal' ? 30 : 14;
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
      if (d < (this.kind === 'crystal' ? 64 : 40)) {
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
        g.heal(CRAYFISH_HEAL);
        audio.sfx('cray');
        g.toast('Crayfish! Yum. +2 hearts');
        break;
      case 'arrows':
        st.arrows.ammo = Math.min(st.arrows.cap, st.arrows.ammo + this.amount);
        audio.sfx('blip');
        break;
      case 'shard': g.onShardCollected(); break;
      case 'royalgem': g.onRoyalGem(); break;
      case 'suncray': {
        const had = st.gloom > 0;
        st.gloom = 0;
        g.heal(4);
        audio.sfx('heart');
        g.toast(had ? 'A golden crayfish! The goo lets go of your hearts!' : 'A golden crayfish! Yum! +2 hearts');
        break;
      }
      case 'crystal': g.onCrystalCollected(this.amount); break;
    }
    g.burst(this.cx, this.cy, this.kind === 'diamond' ? '#6ae0f0' : this.kind === 'shard' ? '#fff' : this.kind === 'crystal' ? '#9aff6a' : '#f0c83a', 5);
  }
  draw(g, ctx) {
    const bob = Math.sin(g.time * 4 + this.id) * 1.5;
    if (this.kind === 'shard' || this.kind === 'suncray' || this.kind === 'royalgem') {
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.2 * Math.sin(g.time * 5);
      ctx.fillStyle = this.kind === 'suncray' ? '#ffe070' : this.kind === 'royalgem' ? '#ff9ad8' : '#fff';
      ctx.beginPath(); ctx.arc(this.cx, this.cy - 4 + bob, this.kind === 'suncray' ? 7 : 9, 0, 7); ctx.fill();
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
    this.openT = 1.2;
    g.state.flags[this.chestId] = true;
    audio.sfx('chest');
    g.burst(this.cx, this.y, '#fff2a0', 14);
    g.grantContents(this.contents, this.msg);
  }
  update(g, dt) {
    if (this.openT > 0) {
      this.openT -= dt;
      if (Math.random() < dt * 30) g.addParticle(this.cx + (Math.random() - 0.5) * 12, this.y + 2, Math.random() < 0.5 ? '#fff2a0' : '#f0c83a', 0.8, (Math.random() - 0.5) * 10, -40, 1);
    }
  }
  draw(g, ctx) {
    // just opened: a column of golden light pours up out of it
    if (this.openT > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.openT) * 0.35;
      ctx.fillStyle = '#fff2a0';
      ctx.fillRect(Math.round(this.cx) - 5, this.y - 26, 10, 28);
      ctx.globalAlpha *= 0.6;
      ctx.fillRect(Math.round(this.cx) - 8, this.y - 18, 16, 20);
      ctx.restore();
    }
    drawSprite(ctx, this.opened ? 'chest_open' : 'chest', this.cx, this.bottom + 1);
    if (!this.opened) {
      // a star of light winks across the gold now and then
      const k = (g.time * 0.6 + this.id * 0.31) % 1;
      if (k < 0.18) {
        const a = Math.sin(k / 0.18 * Math.PI), sx = Math.round(this.cx - 5 + k * 50), sy = this.y - 1;
        ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fffbe0';
        ctx.fillRect(sx, sy - 2, 1, 5); ctx.fillRect(sx - 2, sy, 5, 1);
        ctx.restore();
      }
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
    if (p.solid || p.deep || p.lava || p.dmg || p.pit) return;
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

// ---------------------------------------------------------------- QUEST MARKER
// A small bobbing "!" above anyone carrying a side quest -- yellow for a new offer, gold
// for a ready turn-in, red for "come help me right now" (rescue quests, mid-encounter).
const QUEST_MARKER_COLOR = { new: '#ffe066', ready: '#ffd23a', urgent: '#ff5a4a' };
export function drawQuestMarker(ctx, cx, topY, kind, time, seed = 0) {
  const color = QUEST_MARKER_COLOR[kind];
  if (!color) return;
  const y = topY + Math.sin(time * 4 + seed) * 1.5;
  ctx.save();
  ctx.fillStyle = '#101418';
  ctx.fillRect(cx - 3, y - 9, 6, 9);
  ctx.fillStyle = color;
  ctx.fillRect(cx - 2, y - 8, 4, 5);
  ctx.fillRect(cx - 2, y - 2, 4, 2);
  ctx.restore();
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
  constructor(x, y, name, line, questId) {
    super(x - 8, y - 4, 16, 8);
    this.team = 'friend';
    this.aquatic = true;
    this.deepOnly = true;     // confined to deep water by moveEntity
    this.solid = false;       // Gus can swim straight past a friend
    this.name = name || 'Dolphin';
    this.line = line || DOLPHIN_LINES[0];
    this.questId = questId || null;
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
    if (this.questId) g.dolphinQuestDialog(this);
    else g.openDialog(this.name, this.line);
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
    if (this.questId) {
      const marker = g.questMarker(this.questId);
      if (marker) drawQuestMarker(ctx, this.cx, y - 12, marker, g.time, this.id);
    }
  }
}

// ---------------------------------------------------------------- PUGGLE (collectible)
// A baby platypus hiding somewhere in the Vale. Walk into one to send it home to Mama.
// Hidden while its own tile still covers it (tall grass, reeds, cracked rock, crystal) or
// while the puzzle it belongs to is unsolved; it hops out the moment that changes.
const PUGGLE_COVER = new Set([T.TALLGRASS, T.REED, T.CRACKROCK, T.CRYSTAL]);

// Every puggle has its own look, fixed by its id: one of three coats, and either nothing or
// one accessory (a bow, a leaf hat, a stick sword...). Steps of 3 through 8 looks and of 1
// through 3 coats never line up, so neighbours in the id list never match.
const PUGGLE_COATS = ['puggle', 'puggle_cream', 'puggle_choc'];
const PUGGLE_LOOKS = [null, ...PUGGLE_ACCESSORIES];
export function puggleLook(id) {
  const n = parseInt(String(id).split('_')[1], 10) || 0;
  return { coat: PUGGLE_COATS[n % 3], acc: PUGGLE_LOOKS[(n * 3) % PUGGLE_LOOKS.length] };
}
export function drawPuggle(ctx, look, cx, by, { flip = false, waddle = false } = {}) {
  drawSprite(ctx, waddle ? look.coat + '_2' : look.coat, cx, by, { flip });
  if (look.acc) drawSprite(ctx, look.acc, cx, by, { flip });
}
export class Puggle extends Entity {
  constructor(def) {
    super(def.tx * TILE + 3, def.ty * TILE + 4, 10, 8);
    this.def = def;
    this.pid = def.id;
    this.look = puggleLook(def.id);
    this.hidden = null;     // settled on the first update, so a load never plays the pop
    this.z = 0; this.vz = 0;
    this.hopT = 1 + Math.random() * 2;
    this.hintT = Math.random() * 2;
    this.flip = false;
  }
  isHidden(g) {
    if (this.def.puzzle && !g.state.flags['puzzle_' + this.def.puzzle]) return true;
    return PUGGLE_COVER.has(g.area.get(Math.floor(this.cx / TILE), Math.floor(this.cy / TILE)));
  }
  update(g, dt) {
    const p = g.player;
    const d = dist(this.cx, this.cy, p.cx, p.cy);
    const hid = this.isHidden(g);
    if (this.hidden === null) this.hidden = hid;
    if (this.hidden && !hid) {                     // just uncovered: pop up and squeak
      this.vz = 95;
      audio.sfx('peep');
      g.burst(this.cx, this.cy - 4, '#fff6c8', 8);
    }
    this.hidden = hid;
    if (hid) {
      // a little glitter and the odd peep give away a covered puggle up close
      if (this.def.puzzle) return;
      this.hintT -= dt;
      if (d < 64 && this.hintT <= 0) {
        this.hintT = 1.1 + Math.random() * 1.4;
        for (let i = 0; i < 3; i++) {
          g.addParticle(this.cx + (Math.random() - 0.5) * 12, this.cy - 2 - Math.random() * 8, '#fff6c8', 0.6, 0, -10, 1);
        }
        if (d < 40 && Math.random() < 0.5) audio.sfx('peep');
      }
      return;
    }
    // idle: the odd hop, always turned to watch Gus
    if (this.z > 0 || this.vz > 0) {
      this.z += this.vz * dt; this.vz -= 300 * dt;
      if (this.z <= 0) { this.z = 0; this.vz = 0; }
    } else if ((this.hopT -= dt) <= 0) {
      this.hopT = 1.2 + Math.random() * 2.2;
      this.vz = 55;
    }
    this.flip = p.cx < this.cx;
    if (d < 13) g.collectPuggle(this);
  }
  draw(g, ctx) {
    if (this.hidden !== false) return;
    const tile = g.area.get(Math.floor(this.cx / TILE), Math.floor(this.cy / TILE));
    const by = this.bottom + 1 - this.z;
    if (tileProps(tile).deep) {
      // paddling: only head and shoulders above the surface, with a ripple ring
      const bob = Math.sin(g.time * 3 + this.id) * 1;
      ctx.save();
      ctx.beginPath(); ctx.rect(this.cx - 9, by - 16 + bob, 18, 12); ctx.clip();
      drawPuggle(ctx, this.look, this.cx, by + 2 + bob, { flip: this.flip });
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = '#bfe8f2';
      ctx.beginPath(); ctx.ellipse(this.cx, by - 5 + bob, 6 + Math.sin(g.time * 4) * 1, 2, 0, 0, 7); ctx.stroke();
      ctx.restore();
      return;
    }
    ctx.fillStyle = '#25324144';
    ctx.fillRect(Math.round(this.cx) - 3, Math.round(this.bottom), 6, 1);
    drawPuggle(ctx, this.look, this.cx, by, { flip: this.flip, waddle: this.z > 0 });
  }
}

// A puggle that's been found, playing in Mama Pearl's meadow. Purely for show: it hops
// about its spot and turns to watch Gus go by. One per puggle found, each in its own look.
export class HomePuggle extends Entity {
  constructor(id, x, y) {
    super(x - 5, y - 4, 10, 8);
    this.pid = id;
    this.look = puggleLook(id);
    this.z = 0; this.vz = 0;
    this.hopT = Math.random() * 2.5;
    this.flip = Math.random() < 0.5;
    this.happyT = 0;
    this.shy = 6;          // a chest or a sign right beside one still gets Gus's E first
  }
  interact(g) { g.puggleChat(this); }
  update(g, dt) {
    if (this.z > 0 || this.vz > 0) {
      this.z += this.vz * dt; this.vz -= 300 * dt;
      if (this.z <= 0) { this.z = 0; this.vz = 0; }
    } else if ((this.hopT -= dt) <= 0) {
      this.hopT = (this.happyT > 0 ? 0.15 : 0.8) + Math.random() * (this.happyT > 0 ? 0.3 : 2.6);
      this.vz = 40 + Math.random() * 30;
    }
    // petted: hearts float up while it bounces about
    this.happyT = Math.max(0, this.happyT - dt);
    if (this.happyT > 0 && Math.random() < dt * 6) g.addParticle(this.cx + (Math.random() - 0.5) * 6, this.y - 6, '#ff8ab8', 0.7, (Math.random() - 0.5) * 10, -20, 2);
    // a game of fetch or tag at Mama's
    if (this.isBrood && g.puggleGameStep(this, dt)) return;
    const p = g.player;
    if (dist(this.cx, this.cy, p.cx, p.cy) < 90) this.flip = p.cx < this.cx;
  }
  draw(g, ctx) {
    ctx.fillStyle = '#25324144';
    ctx.fillRect(Math.round(this.cx) - 3, Math.round(this.bottom), 6, 1);
    drawPuggle(ctx, this.look, this.cx, this.bottom + 1 - this.z, { flip: this.flip, waddle: this.z > 0 });
    // caught in tag: a little star over its head
    if (this.tagged) { ctx.fillStyle = '#ffe95c'; ctx.fillRect(Math.round(this.cx) - 1, Math.round(this.y - 10 - this.z), 3, 3); }
  }
}

// ---------------------------------------------------------------- KEEPSAKE (collectible)
// A one-of-a-kind curio for Gus's shelves. Hides the same ways a puggle does (under tall
// grass, reeds, cracked rock or crystal, or until its puzzle is solved); walk into it to
// pick it up. Gleams while out in the open so it reads as treasure, not scenery.
export class Keepsake extends Entity {
  constructor(def) {
    super(def.tx * TILE + 3, def.ty * TILE + 4, 10, 8);
    this.def = def;
    this.kid = def.id;
    this.info = KEEPSAKE_BY_ID[def.id];
    this.hidden = null;     // settled on the first update, so a load never plays the reveal
    this.hintT = Math.random() * 2;
  }
  isHidden(g) {
    if (this.def.puzzle && !g.state.flags['puzzle_' + this.def.puzzle]) return true;
    return PUGGLE_COVER.has(g.area.get(Math.floor(this.cx / TILE), Math.floor(this.cy / TILE)));
  }
  update(g, dt) {
    const p = g.player;
    const d = dist(this.cx, this.cy, p.cx, p.cy);
    const hid = this.isHidden(g);
    if (this.hidden === null) this.hidden = hid;
    if (this.hidden && !hid) { audio.sfx('switch'); g.burst(this.cx, this.cy - 4, '#ffd84a', 10); }
    this.hidden = hid;
    if (hid) {
      // a golden glint gives away a covered one up close (puzzle prizes stay secret)
      if (this.def.puzzle) return;
      this.hintT -= dt;
      if (d < 64 && this.hintT <= 0) {
        this.hintT = 1 + Math.random() * 1.3;
        for (let i = 0; i < 2; i++) g.addParticle(this.cx + (Math.random() - 0.5) * 10, this.cy - 3 - Math.random() * 6, '#ffd84a', 0.6, 0, -9, 1);
      }
      return;
    }
    if (Math.random() < dt * 2.5) g.addParticle(this.cx + (Math.random() - 0.5) * 10, this.cy - 4 - Math.random() * 8, '#fff6c8', 0.5, 0, -8, 1);
    if (d < 13) g.collectKeepsake(this);
  }
  draw(g, ctx) {
    if (this.hidden !== false || !this.info) return;
    const tile = g.area.get(Math.floor(this.cx / TILE), Math.floor(this.cy / TILE));
    const bob = Math.sin(g.time * 2.5 + this.id) * 1.5;
    if (tileProps(tile).deep) {
      // bobbing at the surface, only the top poking out, with a ripple ring
      ctx.save();
      ctx.beginPath(); ctx.rect(this.cx - 8, this.bottom - 16 + bob, 16, 12); ctx.clip();
      drawSprite(ctx, this.info.sprite, this.cx, this.bottom + 1 + bob);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = '#bfe8f2';
      ctx.beginPath(); ctx.ellipse(this.cx, this.bottom - 3 + bob, 6 + Math.sin(g.time * 4) * 1, 2, 0, 0, 7); ctx.stroke();
      ctx.restore();
      return;
    }
    ctx.fillStyle = '#25324144';
    ctx.fillRect(Math.round(this.cx) - 3, Math.round(this.bottom), 6, 1);
    drawSprite(ctx, this.info.sprite, this.cx, this.bottom - 1 + bob);
    // a four-point twinkle that comes and goes
    const tw = Math.sin(g.time * 3 + this.id * 1.7);
    if (tw > 0.55) {
      const sx = Math.round(this.cx + 4), sy = Math.round(this.bottom - 10 + bob);
      ctx.fillStyle = '#fff8d0';
      ctx.fillRect(sx, sy - 1, 1, 3); ctx.fillRect(sx - 1, sy, 3, 1);
    }
  }
}

// ---------------------------------------------------------------- HOUSE FURNITURE
// A piece of furniture from houses.js. Solid across its footprint, except `wall` pieces,
// which hang on the back wall (sorted behind Gus by their wall tile). Inspecting one reads
// its `text`, or hands off to game.js for `talk` pieces (the shop counter, Tully's map...).
export class Furniture extends Entity {
  constructor(def) {
    super(def.tx * TILE, def.ty * TILE, (def.w || 1) * TILE, (def.h || 1) * TILE);
    this.def = def;
    this.solid = !def.wall;
    if (def.text || def.talk) this.interact = (g) => g.inspectFurniture(this);
  }
  draw(g, ctx) {
    const d = this.def, by = this.bottom - (d.hang || 0);
    if (d.glow) {
      // warm light pooling around a fire or lamp, fading out at the edge, with a flicker
      const gx = this.cx, gy = by - (d.wall ? 6 : 14), r = d.wall ? 16 : 30;
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
      grad.addColorStop(0, d.glow);
      grad.addColorStop(1, d.glow + '00');
      ctx.save();
      ctx.globalAlpha = 0.16 + 0.04 * Math.sin(g.time * 7 + this.id) + 0.02 * Math.sin(g.time * 17);
      ctx.fillStyle = grad;
      ctx.fillRect(gx - r, gy - r, r * 2, r * 2);
      ctx.restore();
    }
    drawSprite(ctx, frameName(d.sprite, g.time * 5), this.cx, by);
  }
}

// One stand in Gus's keepsake gallery: the keepsake on top once found (a gentle bob and a
// glint), a little "?" card until then.
export class Pedestal extends Entity {
  constructor(def) {
    super(def.tx * TILE + 2, def.ty * TILE + 4, 12, 12);
    this.solid = true;
    this.kid = def.keepsake;
    this.info = KEEPSAKE_BY_ID[def.keepsake];
  }
  interact(g) { g.inspectKeepsake(this.kid); }
  draw(g, ctx) {
    drawSprite(ctx, 'pedestal', this.cx, this.bottom);
    const top = this.bottom - 9;
    if (!g.state.keepsakes[this.kid]) { drawSprite(ctx, 'emptycard', this.cx, top, { alpha: 0.8 }); return; }
    const bob = Math.round(Math.sin(g.time * 1.8 + this.id) * 1);
    drawSprite(ctx, this.info.sprite, this.cx, top - 1 + bob);
    if (Math.sin(g.time * 2.2 + this.id * 2.3) > 0.8) {
      ctx.fillStyle = '#fff8d0';
      const sx = Math.round(this.cx + 4), sy = top - 8 + bob;
      ctx.fillRect(sx, sy - 1, 1, 3); ctx.fillRect(sx - 1, sy, 3, 1);
    }
  }
}

// A building drawn as one big sprite over its solid footprint (Gus's burrow, Mama's
// cottage). Sorted by the footprint's bottom edge, so Gus walks behind the roof and in
// front of the door. Purely scenery: the door tile underneath does the entering.
export class Building extends Entity {
  constructor(def) {
    super(def.tx * TILE, def.ty * TILE, def.w * TILE, def.h * TILE);
    this.def = def;
    this.smokeT = 0;
  }
  update(g, dt) {
    // the Star Hive breathes out glowing spores
    if (this.def.spores && Math.random() < dt * 6) {
      g.addParticle(this.x + 16 + Math.random() * (this.w - 32), this.bottom - 20 - Math.random() * 70,
        Math.random() < 0.5 ? '#8aff6a' : '#c88aff', 1.6, (Math.random() - 0.5) * 10, -16, 1);
    }
    if (!this.def.smoke || (this.smokeT -= dt) > 0) return;
    this.smokeT = 0.35 + Math.random() * 0.3;
    // a lazy puff from the burrow's chimney pipe (at x 58 of its 80px sprite)
    g.addParticle(this.x + 58 + (Math.random() - 0.5) * 3, this.bottom - 55, '#d8d4cc', 1.4, 8 + Math.random() * 10, -70, 2);
  }
  draw(g, ctx) {
    drawSprite(ctx, this.def.sprite, this.cx, this.bottom);
    // Mama's "come meet me" marker floats over the roof ridge, where it shows from afar
    const marker = this.def.marker === 'mama' ? g.mamaMarker() : null;
    if (marker) drawQuestMarker(ctx, this.cx, this.bottom - sprites[this.def.sprite].h - 2, marker, g.time, this.id);
  }
}

// ---------------------------------------------------------------- PROPS (sign/npc/statue/shrine/gate/dungeon entrance)
const PROP_SPRITES = { sign: 'sign', statue: 'statue', shrine: 'shrine', gate: 'gate', gong: 'gong', altar: 'altar' };
export class Prop extends Entity {
  constructor(def) {
    const px = def.tx * TILE, py = def.ty * TILE;
    // the gate fills the full 3x2-tile gap in the Confluence wall
    if (def.kind === 'gate') super(px - 16, py, 48, 32);
    else if (def.kind === 'dungeon') super(px, py, 16, 16);
    else super(px + 2, py + 2, 12, 12);
    this.def = def;
    this.kind = def.kind;
    this.solid = this.kind !== 'dungeon' && this.kind !== 'trinket';
  }
  interact(g) { g.interactProp(this); }
  draw(g, ctx) {
    if (this.kind === 'dungeon') return; // stairs tile is the visual
    if (this.kind === 'npc') {
      const bob = this.def.sprite === 'wombat' ? 0 : Math.sin(g.time * 2 + this.id) * 0.8;
      const topY = this.bottom + 2 + bob;
      drawSprite(ctx, this.def.sprite, this.cx, topY, { flip: g.player && g.player.cx < this.cx });
      const marker = this.def.dialog === 'mama' ? g.mamaMarker()
        : this.def.quest ? g.questMarker(this.def.quest) : null;
      if (marker) drawQuestMarker(ctx, this.cx, topY - 18, marker, g.time, this.id);
      return;
    }
    if (this.kind === 'trinket') {
      if (g.state.flags[this.def.id]) return; // already collected
      const bob = Math.sin(g.time * 2 + this.id) * 1.2;
      drawSprite(ctx, this.def.sprite, this.cx, this.bottom + 1 + bob);
      return;
    }
    // the gate is masonry set into the wall, so it aligns to the tile grid exactly
    drawSprite(ctx, PROP_SPRITES[this.kind], this.cx, this.bottom + (this.kind === 'gate' ? 0 : 2));
    if (this.kind === 'altar') {
      // the god crystal hovering over the altar burns brighter the closer Gus is to the goal
      const full = g.state.flags.god_armor || (g.state.crystals || 0) >= CRYSTAL_GOAL;
      const bob = Math.sin(g.time * 2.4) * 2;
      ctx.save();
      ctx.globalAlpha = (full ? 0.45 : 0.22) + 0.12 * Math.sin(g.time * 5);
      ctx.fillStyle = '#9aff6a';
      ctx.beginPath(); ctx.arc(this.cx, this.y - 12 + bob, full ? 11 : 7, 0, 7); ctx.fill();
      ctx.restore();
      drawSprite(ctx, 'godcrystal', this.cx, this.y - 7 + bob);
    }
    if (this.kind === 'shrine') {
      ctx.save();
      ctx.globalAlpha = 0.4 + 0.2 * Math.sin(g.time * 3);
      ctx.fillStyle = '#6ae0f0';
      ctx.fillRect(this.cx - 1, this.y - 12 + Math.sin(g.time * 3) * 2, 2, 2);
      ctx.restore();
    }
  }
}
