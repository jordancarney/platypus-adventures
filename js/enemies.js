// Enemy AI archetypes, the bestiary, minibosses, and the five dungeon bosses.
import { tierHp, tierDmg, BURN } from './config.js';
import { clamp, dist, dirTo } from './util.js';
import { Entity, moveEntity, spawnDrops, EnemyShot } from './entities.js';
import { drawSprite } from './pixelart.js';
import { audio } from './audio.js';

// ---------------------------------------------------------------- helpers
function approach(g, e, tx, ty, spd, dt) {
  const [dx, dy] = dirTo(e.cx, e.cy, tx, ty);
  e.vx = dx * spd; e.vy = dy * spd;
  return moveEntity(g, e, e.vx * dt, e.vy * dt);
}
function keepInRoom(e) {
  if (!e.roomBounds) return;
  const b = e.roomBounds;
  e.x = clamp(e.x, b.x + 4, b.x + b.w - e.w - 4);
  e.y = clamp(e.y, b.y + 4, b.y + b.h - e.h - 4);
}
function shootAt(g, e, tx, ty, kind, dmg, speed = 110, spread = 0) {
  let [dx, dy] = dirTo(e.cx, e.cy, tx, ty);
  if (spread) {
    const a = Math.atan2(dy, dx) + spread;
    dx = Math.cos(a); dy = Math.sin(a);
  }
  g.spawn(new EnemyShot(e.cx, e.cy - 4, dx * speed, dy * speed, kind, dmg));
}

// ---------------------------------------------------------------- behaviors
const BEHAVIORS = {
  wander(g, e, dt) {
    e.t1 -= dt;
    if (e.t1 <= 0) { e.t1 = 1 + Math.random() * 1.5; e.dir = Math.random() * Math.PI * 2; if (Math.random() < 0.3) e.dir = null; }
    if (e.dir !== null && e.dir !== undefined) {
      e.vx = Math.cos(e.dir) * e.spd * 0.5; e.vy = Math.sin(e.dir) * e.spd * 0.5;
      const r = moveEntity(g, e, e.vx * dt, e.vy * dt);
      if (r.hitX || r.hitY) e.t1 = 0;
    } else { e.vx = e.vy = 0; }
  },
  chase(g, e, dt) {
    const p = g.player, d = dist(e.cx, e.cy, p.cx, p.cy);
    if (d < e.aggro) approach(g, e, p.cx, p.cy, e.spd, dt);
    else BEHAVIORS.wander(g, e, dt);
  },
  lunge(g, e, dt) {
    const p = g.player, d = dist(e.cx, e.cy, p.cx, p.cy);
    if (e.state === 'telegraph') {
      e.t1 -= dt;
      if (e.t1 <= 0) {
        e.state = 'dash'; e.t1 = 0.45;
        [e.dashX, e.dashY] = dirTo(e.cx, e.cy, p.cx, p.cy);
        audio.sfx('slash');
      }
    } else if (e.state === 'dash') {
      e.t1 -= dt;
      e.vx = e.dashX * e.spd * 3.2; e.vy = e.dashY * e.spd * 3.2;
      moveEntity(g, e, e.vx * dt, e.vy * dt);
      if (e.t1 <= 0) { e.state = 'cool'; e.t1 = 1.1; }
    } else if (e.state === 'cool') {
      e.t1 -= dt; e.vx = e.vy = 0;
      if (e.t1 <= 0) e.state = null;
    } else if (d < 70) { e.state = 'telegraph'; e.t1 = 0.4; e.vx = e.vy = 0; }
    else BEHAVIORS.wander(g, e, dt);
    // miniboss python: summon adders at half hp
    if (e.mbSummon && e.hp < e.maxHp / 2) {
      e.mbSummon = false;
      for (let i = 0; i < 2; i++) g.spawnEnemy('adder', e.cx + (i ? 20 : -20), e.cy, { roomBounds: e.roomBounds });
    }
  },
  charge(g, e, dt) {
    const p = g.player, d = dist(e.cx, e.cy, p.cx, p.cy);
    if (e.state === 'telegraph') {
      e.t1 -= dt; e.vx = e.vy = 0;
      if (e.t1 <= 0) {
        e.state = 'dash'; e.t1 = 1.0;
        [e.dashX, e.dashY] = dirTo(e.cx, e.cy, p.cx, p.cy);
      }
    } else if (e.state === 'dash') {
      e.t1 -= dt;
      const r = moveEntity(g, e, e.dashX * e.spd * 3 * dt, e.dashY * e.spd * 3 * dt);
      e.vx = e.dashX; // facing
      if (r.hitX || r.hitY) { e.state = 'stun'; e.t1 = 0.9; g.shake(2, 0.15); audio.sfx('thud'); }
      else if (e.t1 <= 0) { e.state = 'cool'; e.t1 = 0.8; }
    } else if (e.state === 'stun' || e.state === 'cool') {
      e.t1 -= dt; e.vx = e.vy = 0;
      if (e.t1 <= 0) e.state = null;
    } else if (d < e.aggro) { e.state = 'telegraph'; e.t1 = 0.55; }
    else BEHAVIORS.wander(g, e, dt);
  },
  shooter(g, e, dt) {
    const p = g.player, d = dist(e.cx, e.cy, p.cx, p.cy);
    e.t1 -= dt;
    if (d < e.aggro) {
      if (d < 55) approach(g, e, e.cx * 2 - p.cx, e.cy * 2 - p.cy, e.spd, dt);       // back away
      else if (d > 105) approach(g, e, p.cx, p.cy, e.spd * 0.8, dt);
      else { // strafe
        const a = Math.atan2(e.cy - p.cy, e.cx - p.cx) + (e.strafeDir || 1) * 0.9;
        const r = approach(g, e, p.cx + Math.cos(a) * 80, p.cy + Math.sin(a) * 80, e.spd * 0.6, dt);
        if (r.hitX || r.hitY) e.strafeDir = -(e.strafeDir || 1);
      }
      if (e.t1 <= 0) {
        e.t1 = e.mb ? 1.6 : 2.1;
        const n = e.mb ? 3 : 1;
        for (let i = 0; i < n; i++) shootAt(g, e, p.cx, p.cy, 'fireball', e.pdmg, 110, (i - (n - 1) / 2) * 0.25);
        audio.sfx('burn');
      }
    } else BEHAVIORS.wander(g, e, dt);
  },
  flyer(g, e, dt) {
    const p = g.player;
    if (dist(e.cx, e.cy, p.cx, p.cy) > e.aggro) { BEHAVIORS.wander(g, e, dt); return; }
    e.t1 -= dt;
    const tx = p.cx + Math.sin(g.time * 1.3 + e.id) * 30, ty = p.cy - 40;
    approach(g, e, tx, ty, e.spd, dt);
    if (e.t1 <= 0 && Math.abs(e.cx - p.cx) < 26 && e.cy < p.cy) {
      e.t1 = 2.6;
      g.spawn(new EnemyShot(e.cx, e.cy, 0, 30, 'bomblet', e.pdmg));
    }
  },
  swoop(g, e, dt) {
    const p = g.player;
    if (e.state !== 'dive' && dist(e.cx, e.cy, p.cx, p.cy) > e.aggro) { BEHAVIORS.wander(g, e, dt); e.hidden = false; return; }
    if (e.state === 'dive') {
      e.t1 -= dt;
      moveEntity(g, e, e.dashX * e.spd * 2.6 * dt, e.dashY * e.spd * 2.6 * dt);
      if (e.t1 <= 0) { e.state = null; e.t1 = 2.2 + Math.random(); }
    } else {
      e.t1 -= dt;
      e.circ = (e.circ || 0) + dt * 1.6;
      const rad = 62;
      approach(g, e, p.cx + Math.cos(e.circ) * rad, p.cy + Math.sin(e.circ) * rad * 0.7 - 20, e.spd, dt);
      if (e.t1 <= 0 && dist(e.cx, e.cy, p.cx, p.cy) < 110) {
        e.state = 'dive'; e.t1 = 0.62;
        [e.dashX, e.dashY] = dirTo(e.cx, e.cy, p.cx, p.cy);
        if (e.mb) for (let i = -1; i <= 1; i++) shootAt(g, e, p.cx, p.cy, 'feather', e.pdmg, 130, i * 0.35);
        audio.sfx('arrow');
      }
      // owls fade between swoops
      e.hidden = e.vanish && e.t1 > 0.7;
    }
  },
  aquatic(g, e, dt) {
    const p = g.player, d = dist(e.cx, e.cy, p.cx, p.cy);
    e.t1 -= dt;
    if (d < e.aggro) {
      approach(g, e, p.cx, p.cy, e.spd, dt);
      if (e.t1 <= 0 && d < 110) {
        e.t1 = e.mb ? 1.5 : 2.3;
        const n = e.mb ? 3 : 1;
        for (let i = 0; i < n; i++) shootAt(g, e, p.cx, p.cy, 'zap', e.pdmg, 120, (i - (n - 1) / 2) * 0.3);
        audio.sfx('zap');
      }
    } else BEHAVIORS.wander(g, e, dt);
  },
  lurker(g, e, dt) {
    const p = g.player;
    if (e.state !== 'up' && dist(e.cx, e.cy, p.cx, p.cy) > e.aggro) { e.submerged = true; BEHAVIORS.wander(g, e, dt); return; }
    e.t1 -= dt;
    if (e.state === 'up') {
      e.vx = e.vy = 0;
      if (e.t1 <= 0) { e.state = null; e.t1 = 2 + Math.random(); }
    } else {
      e.submerged = true;
      approach(g, e, p.cx, p.cy, e.spd, dt);
      if (e.t1 <= 0 && dist(e.cx, e.cy, p.cx, p.cy) < 90) {
        e.state = 'up'; e.t1 = 1.4; e.submerged = false;
        shootAt(g, e, p.cx, p.cy, 'spit', e.pdmg, 105);
        audio.sfx('splash');
        g.burst(e.cx, e.cy, '#7ad4ff', 5);
      }
    }
    e.submerged = e.state !== 'up';
  },
  tank(g, e, dt) {
    const p = g.player, d = dist(e.cx, e.cy, p.cx, p.cy);
    if (d < e.aggro) approach(g, e, p.cx, p.cy, e.spd, dt);
    else { e.vx = e.vy = 0; }
  },
  pack(g, e, dt) {
    const p = g.player, d = dist(e.cx, e.cy, p.cx, p.cy);
    if (d < e.aggro) {
      if (!e.howled) {
        e.howled = true;
        audio.sfx('roar');
        for (let i = 0; i < 1 + (g.tier() > 1 ? 1 : 0); i++)
          g.spawnEnemy('dingo', e.cx + 30 * (i ? 1 : -1), e.cy - 20, { noHowl: true, roomBounds: e.roomBounds });
      }
      // loose flanking: offset target per enemy id
      const a = (e.id % 6) / 6 * Math.PI * 2;
      approach(g, e, p.cx + Math.cos(a) * 18, p.cy + Math.sin(a) * 18, e.spd, dt);
    } else BEHAVIORS.wander(g, e, dt);
  },
  stealth(g, e, dt) {
    const p = g.player, d = dist(e.cx, e.cy, p.cx, p.cy);
    if (e.state === 'pounce') {
      e.t1 -= dt;
      moveEntity(g, e, e.dashX * e.spd * 2.8 * dt, e.dashY * e.spd * 2.8 * dt);
      if (e.t1 <= 0) { e.state = 'seen'; e.t1 = 2.2; }
    } else if (e.state === 'seen') {
      e.t1 -= dt; e.hidden = false;
      BEHAVIORS.chase(g, e, dt);
      if (e.t1 <= 0) e.state = null;
    } else {
      e.hidden = true;
      BEHAVIORS.wander(g, e, dt);
      if (d < 55) {
        e.state = 'pounce'; e.t1 = 0.5; e.hidden = false;
        [e.dashX, e.dashY] = dirTo(e.cx, e.cy, p.cx, p.cy);
        audio.sfx('slash');
      }
    }
  },
  spinner(g, e, dt) {
    const p = g.player, d = dist(e.cx, e.cy, p.cx, p.cy);
    if (e.state === 'spin') {
      e.t1 -= dt;
      const r = moveEntity(g, e, e.dashX * e.spd * 2.4 * dt, e.dashY * e.spd * 2.4 * dt);
      if (r.hitX) e.dashX *= -1;
      if (r.hitY) e.dashY *= -1;
      e.spinA = (e.spinA || 0) + dt * 20;
      if (e.t1 <= 0) { e.state = 'dizzy'; e.t1 = 1.2; }
    } else if (e.state === 'dizzy') {
      e.t1 -= dt; e.vx = e.vy = 0;
      if (e.t1 <= 0) e.state = null;
    } else if (d < e.aggro) {
      e.t1 = (e.t1 || 0.6) - dt; e.vx = e.vy = 0;
      if (e.t1 <= 0) {
        e.state = 'spin'; e.t1 = 2.2;
        [e.dashX, e.dashY] = dirTo(e.cx, e.cy, p.cx, p.cy);
        audio.sfx('roar');
      }
    } else BEHAVIORS.wander(g, e, dt);
  },
  duelist(g, e, dt) {
    const p = g.player, d = dist(e.cx, e.cy, p.cx, p.cy);
    if (e.state === 'strike') {
      e.t1 -= dt; e.vx = e.vy = 0;
      if (e.t1 <= 0) {
        e.state = 'recover'; e.t1 = 0.8;
        if (dist(e.cx, e.cy, p.cx, p.cy) < 30) p.hurt(g, e.dmg, e.cx, e.cy);
        audio.sfx('slash');
      }
    } else if (e.state === 'recover') {
      e.t1 -= dt;
      if (e.t1 <= 0) e.state = null;
    } else if (d < e.aggro) {
      if (d > 26) approach(g, e, p.cx, p.cy, e.spd, dt);
      else { e.state = 'strike'; e.t1 = 0.35; }
    } else BEHAVIORS.wander(g, e, dt);
  },
};

// ---------------------------------------------------------------- bestiary
export const ENEMY_TYPES = {
  rakali:    { sprite: 'rakali', w: 12, h: 8, hp: 2, dmg: 1, spd: 55, behavior: 'chase', aggro: 85, name: 'Rakali Rogue' },
  adder:     { sprite: 'adder', w: 12, h: 9, hp: 2, dmg: 1, spd: 42, behavior: 'lunge', aggro: 80, name: 'Marsh Adder' },
  snapjaw:   { sprite: 'snapjaw', w: 15, h: 9, hp: 5, dmg: 2, spd: 46, behavior: 'charge', aggro: 95, name: 'Snapjaw Whelp' },
  emberfox:  { sprite: 'emberfox', w: 13, h: 9, hp: 3, dmg: 1, spd: 62, behavior: 'shooter', aggro: 130, pdmg: 2, name: 'Emberfox' },
  mgoanna:   { sprite: 'mgoanna', w: 15, h: 8, hp: 7, dmg: 2, spd: 38, behavior: 'charge', aggro: 90, name: 'Magma Goanna' },
  kooka:     { sprite: 'kooka', w: 13, h: 9, hp: 3, dmg: 1, spd: 58, behavior: 'flyer', fly: true, aggro: 150, pdmg: 2, name: 'Kooka Bomber' },
  volteel:   { sprite: 'volteel', w: 12, h: 9, hp: 3, dmg: 1, spd: 52, behavior: 'aquatic', aquatic: true, aggro: 120, pdmg: 2, name: 'Volt Eel' },
  cod:       { sprite: 'cod', w: 15, h: 9, hp: 5, dmg: 2, spd: 48, behavior: 'lurker', aquatic: true, aggro: 170, pdmg: 2, name: 'Gulper Cod' },
  snapshell: { sprite: 'snapshell', w: 14, h: 9, hp: 8, dmg: 2, spd: 22, behavior: 'tank', aggro: 90, name: 'Snapshell' },
  talon:     { sprite: 'talon', w: 13, h: 9, hp: 3, dmg: 2, spd: 72, behavior: 'swoop', fly: true, aggro: 160, name: 'Storm Talon' },
  owl:       { sprite: 'owl', w: 13, h: 9, hp: 4, dmg: 2, spd: 66, behavior: 'swoop', fly: true, vanish: true, aggro: 160, name: 'Shadow Owl' },
  dingo:     { sprite: 'dingo', w: 13, h: 9, hp: 4, dmg: 2, spd: 62, behavior: 'pack', aggro: 95, name: 'Dingo Raider' },
  wildcat:   { sprite: 'wildcat', w: 13, h: 9, hp: 4, dmg: 2, spd: 66, behavior: 'stealth', aggro: 90, name: 'Wildcat Stalker' },
  python:    { sprite: 'python', w: 13, h: 9, hp: 5, dmg: 2, spd: 40, behavior: 'lunge', aggro: 85, name: 'Bramble Python' },
  tazzy:     { sprite: 'tazzy', w: 11, h: 9, hp: 5, dmg: 2, spd: 52, behavior: 'spinner', aggro: 95, name: 'Tazzy Whirl' },
  gknight:   { sprite: 'gknight', w: 12, h: 11, hp: 8, dmg: 3, spd: 46, behavior: 'duelist', shielded: true, aggro: 110, name: 'Goanna Knight' },
  // minibosses
  mini_fox:    { sprite: 'mini_fox', w: 24, h: 14, hp: 24, dmg: 2, spd: 66, behavior: 'shooter', mb: true, aggro: 999, pdmg: 2, name: 'Ember Matron' },
  mini_eel:    { sprite: 'mini_eel', w: 22, h: 14, hp: 24, dmg: 2, spd: 56, behavior: 'aquatic', mb: true, aquatic: true, aggro: 999, pdmg: 2, name: 'Eel Matron' },
  mini_owl:    { sprite: 'mini_owl', w: 24, h: 14, hp: 24, dmg: 2, spd: 68, behavior: 'swoop', mb: true, fly: true, vanish: true, aggro: 999, name: 'Owl Sage' },
  mini_python: { sprite: 'mini_python', w: 24, h: 14, hp: 26, dmg: 3, spd: 44, behavior: 'lunge', mb: true, aggro: 999, name: 'Python Elder' },
};

export class Enemy extends Entity {
  constructor(type, x, y, tier, opts = {}) {
    const d = ENEMY_TYPES[type];
    super(x - d.w / 2, y - d.h / 2, d.w, d.h);
    Object.assign(this, {
      team: 'enemy', type, sprite: d.sprite, name: d.name,
      hp: tierHp(d.hp, tier), maxHp: tierHp(d.hp, tier),
      dmg: tierDmg(d.dmg, tier), pdmg: tierDmg(d.pdmg || d.dmg, tier),
      spd: d.spd, behavior: d.behavior, aggro: d.aggro,
      fly: d.fly, aquatic: d.aquatic, vanish: d.vanish, mb: d.mb, shielded: d.shielded,
      elite: false, tier,
      t1: Math.random(), state: null, flashT: 0, burnT: 0, burnTick: 0, frozenT: 0,
      kx: 0, ky: 0, hidden: false, submerged: false, lastSlashId: -1,
      isMiniboss: !!opts.miniboss || d.mb, isBoss: false,
      roomBounds: opts.roomBounds || null, howled: !!opts.noHowl,
    });
    if (this.behavior === 'lunge' && this.mb) this.mbSummon = true;
    if (opts.elite) this.makeElite();
  }
  makeElite() {
    this.elite = true;
    this.sprite = this.sprite + '_e';
    this.hp = Math.round(this.hp * 1.7); this.maxHp = this.hp;
    this.dmg += 1; this.pdmg += 1;
    this.spd *= 1.12;
  }
  update(g, dt) {
    this.flashT = Math.max(0, this.flashT - dt);
    // status effects
    if (this.frozenT > 0) { this.frozenT -= dt; this.vx = this.vy = 0; return; }
    if (this.burnT > 0) {
      this.burnT -= dt; this.burnTick -= dt;
      if (Math.random() < 0.25) g.addParticle(this.cx, this.cy - 6, '#ff8a3a', 0.3);
      if (this.burnTick <= 0) { this.burnTick = BURN.interval; this.hurt(g, BURN.dmg, this.cx, this.cy, true); if (this.dead) return; }
    }
    // knockback
    if (this.kx || this.ky) {
      moveEntity(g, this, this.kx * dt, this.ky * dt);
      this.kx *= Math.pow(0.0001, dt); this.ky *= Math.pow(0.0001, dt);
      if (Math.abs(this.kx) < 6 && Math.abs(this.ky) < 6) { this.kx = this.ky = 0; }
      keepInRoom(this);
      return;
    }
    BEHAVIORS[this.behavior](g, this, dt);
    keepInRoom(this);
  }
  hurt(g, dmg, sx, sy, silent = false) {
    if (this.dead) return;
    // goanna knights block frontal hits while not striking
    if (this.shielded && !this.state && !silent) {
      const [tx] = dirTo(this.cx, this.cy, sx, sy);
      const facing = (this.vx || 1) >= 0 ? 1 : -1;
      if (Math.sign(tx || 1) === facing && Math.random() < 0.6) {
        audio.sfx('thud');
        g.burst(sx, sy, '#c8ccd4', 3);
        return;
      }
    }
    this.hp -= dmg;
    this.flashT = 0.12;
    if (!silent) {
      const [kx, ky] = dirTo(sx, sy, this.cx, this.cy);
      const kb = this.isBoss ? 0 : this.behavior === 'tank' ? 40 : 130;
      this.kx = kx * kb; this.ky = ky * kb;
      audio.sfx('hit');
    }
    if (this.hp <= 0) this.die(g);
  }
  die(g) {
    if (this.dead) return;
    this.dead = true;
    audio.sfx('poof');
    g.burst(this.cx, this.cy - 4, '#e8e0d0', 10);
    g.burst(this.cx, this.cy - 4, '#a8a098', 6);
    spawnDrops(g, this.cx, this.cy, g.tier(), (this.elite ? 1 : 0) + (this.isMiniboss ? 3 : 0));
    g.onEnemyDeath(this);
  }
  draw(g, ctx) {
    if (this.hidden && !this.frozenT) {
      ctx.save(); ctx.globalAlpha = 0.13;
      drawSprite(ctx, this.sprite, this.cx, this.bottom + 2, { flip: this.vx < 0 });
      ctx.restore();
      return;
    }
    if (this.submerged) {
      ctx.save(); ctx.globalAlpha = 0.4; ctx.fillStyle = '#0c2a3a';
      ctx.beginPath(); ctx.ellipse(this.cx, this.cy + 2, 9, 5, 0, 0, 7); ctx.fill();
      ctx.restore();
      return;
    }
    const bob = this.fly ? Math.sin(g.time * 6 + this.id) * 2 - 6 : 0;
    const squash = this.fly ? 0 : (Math.sin(g.time * 9 + this.id) + 1) / 2 * (Math.abs(this.vx) + Math.abs(this.vy) > 5 ? 1 : 0.2);
    const opts = { flip: this.vx < 0, squash, flash: this.flashT > 0, angle: this.spinA || 0 };
    if (this.frozenT > 0) opts.tint = '#7ad4ff';
    if (this.state === 'telegraph') opts.flash = Math.floor(g.time * 10) % 2 === 0;
    drawSprite(ctx, this.sprite, this.cx, this.bottom + 2 + bob, opts);
    if (this.frozenT > 0) {
      ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#bfe8f2';
      ctx.fillRect(this.x - 2, this.y - 10, this.w + 4, this.h + 12);
      ctx.restore();
    }
    // shadow for fliers
    if (this.fly) {
      ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(this.cx, this.bottom + 3, 5, 2, 0, 0, 7); ctx.fill();
      ctx.restore();
    }
    // miniboss health pips
    if (this.isMiniboss && this.hp < this.maxHp) {
      ctx.fillStyle = '#200a0a';
      ctx.fillRect(this.cx - 12, this.y - 16, 24, 3);
      ctx.fillStyle = '#e04a5a';
      ctx.fillRect(this.cx - 12, this.y - 16, 24 * (this.hp / this.maxHp), 3);
    }
  }
}

// ---------------------------------------------------------------- BOSSES
const BOSS_DEFS = {
  boss_scorchjaw: { sprite: 'boss_scorchjaw', w: 30, h: 18, hp: 55, dmg: 3, spd: 50, name: 'Scorchjaw' },
  boss_murkmaw: { sprite: 'boss_murkmaw', w: 30, h: 16, hp: 60, dmg: 3, spd: 55, aquatic: true, name: 'Murkmaw' },
  boss_galestrike: { sprite: 'boss_galestrike', w: 30, h: 18, hp: 50, dmg: 3, spd: 75, fly: true, name: 'Galestrike' },
  boss_kinggoanna: { sprite: 'boss_kinggoanna', w: 26, h: 22, hp: 65, dmg: 3, spd: 45, name: 'King Goanna' },
  boss_apexus: { sprite: 'boss_apexus', w: 44, h: 26, hp: 150, dmg: 4, spd: 60, name: 'Apexus' },
};

export class Boss extends Entity {
  constructor(type, x, y, tier, roomBounds) {
    const d = BOSS_DEFS[type];
    super(x - d.w / 2, y - d.h / 2, d.w, d.h);
    Object.assign(this, {
      team: 'enemy', type, sprite: d.sprite, name: d.name,
      hp: tierHp(d.hp, tier), maxHp: tierHp(d.hp, tier),
      dmg: tierDmg(d.dmg, tier), pdmg: tierDmg(2, tier),
      spd: d.spd, fly: d.fly, aquatic: d.aquatic,
      isBoss: true, tier, roomBounds,
      state: 'idle', t1: 1.2, phase: 0, flashT: 0, burnT: 0, burnTick: 0, frozenT: 0,
      kx: 0, ky: 0, lastSlashId: -1, submerged: false, stunned: 0, summoned: {},
      spinA: 0, hidden: false,
    });
  }
  hurt(g, dmg, sx, sy, silent = false) {
    if (this.dead) return;
    if (this.submerged) dmg = Math.max(1, Math.floor(dmg / 2));
    if (this.type === 'boss_galestrike' && this.stunned <= 0 && this.state !== 'dived') dmg = Math.max(1, Math.floor(dmg / 2));
    if (this.stunned > 0) dmg *= 2;
    this.hp -= dmg;
    this.flashT = 0.12;
    if (!silent) audio.sfx('hit');
    if (this.hp <= 0) this.die(g);
  }
  die(g) {
    if (this.dead) return;
    this.dead = true;
    audio.sfx('roar');
    for (let i = 0; i < 5; i++)
      setTimeout(() => { if (g.mode === 'play' || g.mode === 'banner') { g.burst(this.cx + (Math.random() - 0.5) * 40, this.cy - 10 + (Math.random() - 0.5) * 24, '#fff', 12); audio.sfx('boom'); } }, i * 180);
    g.shake(6, 0.8);
    g.onBossDeath(this);
  }
  update(g, dt) {
    this.flashT = Math.max(0, this.flashT - dt);
    if (this.frozenT > 0) { this.frozenT -= dt * 2.5; return; }  // bosses shrug off freeze quickly
    if (this.burnT > 0) {
      this.burnT -= dt; this.burnTick -= dt;
      if (this.burnTick <= 0) { this.burnTick = BURN.interval; this.hurt(g, BURN.dmg, this.cx, this.cy, true); if (this.dead) return; }
    }
    if (this.stunned > 0) { this.stunned -= dt; return; }
    const fn = this['ai_' + this.type.slice(5)];
    if (fn) fn.call(this, g, dt);
    keepInRoom(this);
  }

  // --- Scorchjaw: charge, wall-crash stun, fire breath ---
  ai_scorchjaw(g, dt) {
    const p = g.player;
    this.t1 -= dt;
    if (this.state === 'idle') {
      approach(g, this, p.cx, p.cy, this.spd * 0.7, dt);
      if (this.t1 <= 0) { this.state = Math.random() < 0.55 ? 'tele' : 'breath'; this.t1 = this.state === 'tele' ? 0.7 : 0; this.bcount = 0; }
    } else if (this.state === 'tele') {
      this.vx = p.cx - this.cx;
      if (this.t1 <= 0) { this.state = 'charge'; this.t1 = 1.4; [this.dashX, this.dashY] = dirTo(this.cx, this.cy, p.cx, p.cy); audio.sfx('roar'); }
    } else if (this.state === 'charge') {
      const r = moveEntity(g, this, this.dashX * this.spd * 3.4 * dt, this.dashY * this.spd * 3.4 * dt);
      if (r.hitX || r.hitY) { this.stunned = 1.5; this.state = 'idle'; this.t1 = 1.6; g.shake(5, 0.3); audio.sfx('boom'); }
      else if (this.t1 <= 0) { this.state = 'idle'; this.t1 = 1.2; }
    } else if (this.state === 'breath') {
      this.vx = p.cx - this.cx; this.vy = 0;
      if (this.t1 <= 0) {
        this.t1 = 0.5; this.bcount++;
        for (let i = -2; i <= 2; i++) shootAt(g, this, p.cx, p.cy, 'fireball', this.pdmg, 120, i * 0.22);
        audio.sfx('burn');
        if (this.bcount >= 3) {
          if (this.hp < this.maxHp / 2) for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.spawn(new EnemyShot(this.cx, this.cy, Math.cos(a) * 90, Math.sin(a) * 90, 'fireball', this.pdmg)); }
          this.state = 'idle'; this.t1 = 1.5;
        }
      }
    }
  }

  // --- Murkmaw: circles submerged, surfaces to spit, leaps ---
  ai_murkmaw(g, dt) {
    const p = g.player;
    this.t1 -= dt;
    if (this.state === 'idle') {
      this.submerged = true;
      this.circ = (this.circ || 0) + dt * 1.1;
      const b = this.roomBounds;
      approach(g, this, b.x + b.w / 2 + Math.cos(this.circ) * 70, b.y + b.h / 2 - 20 + Math.sin(this.circ) * 30, this.spd, dt);
      if (this.t1 <= 0) { this.state = 'surface'; this.t1 = 2.2; this.submerged = false; audio.sfx('splash'); g.burst(this.cx, this.cy, '#7ad4ff', 10); this.scount = 0; }
    } else if (this.state === 'surface') {
      this.vx = p.cx - this.cx; this.vy = 0;
      this.scount = (this.scount || 0) - dt;
      if (this.scount <= 0) { this.scount = 0.55; for (let i = -1; i <= 1; i++) shootAt(g, this, p.cx, p.cy, 'spit', this.pdmg, 115, i * 0.3); audio.sfx('splash'); }
      if (this.t1 <= 0) { this.state = 'leap'; this.t1 = 0.8; this.leapFrom = [this.cx, this.cy]; audio.sfx('roar'); this.submerged = true; }
    } else if (this.state === 'leap') {
      const b = this.roomBounds;
      approach(g, this, b.x + 60 + Math.random() * (b.w - 120), b.y + 40, this.spd * 2.4, dt);
      if (this.t1 <= 0) {
        this.state = 'idle'; this.t1 = 2.4;
        for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; g.spawn(new EnemyShot(this.cx, this.cy, Math.cos(a) * 80, Math.sin(a) * 80, 'spit', this.pdmg)); }
        g.shake(4, 0.3); audio.sfx('boom');
      }
    }
    // summon eels at 60% and 30%
    for (const frac of [0.6, 0.3]) {
      if (this.hp < this.maxHp * frac && !this.summoned['eel' + frac]) {
        this.summoned['eel' + frac] = true;
        g.spawnEnemy('volteel', this.cx + 30, this.cy, { roomBounds: this.roomBounds });
      }
    }
  }

  // --- Galestrike: feather rain, gusts, dive-crash ---
  ai_galestrike(g, dt) {
    const p = g.player;
    this.t1 -= dt;
    if (this.state === 'idle') {
      this.circ = (this.circ || 0) + dt * 1.4;
      const b = this.roomBounds;
      approach(g, this, b.x + b.w / 2 + Math.cos(this.circ) * 90, b.y + 46 + Math.sin(this.circ * 1.7) * 16, this.spd, dt);
      this.fcount = (this.fcount || 0) - dt;
      if (this.fcount <= 0) { this.fcount = 0.8; shootAt(g, this, p.cx, p.cy, 'feather', this.pdmg, 125); }
      if (this.t1 <= 0) { this.state = Math.random() < 0.5 ? 'gust' : 'divetele'; this.t1 = this.state === 'gust' ? 2 : 0.8; if (this.state === 'gust') audio.sfx('roar'); }
    } else if (this.state === 'gust') {
      g.wind = { x: Math.sign(p.cx - this.cx) * -70, y: 45 };
      this.vx = p.cx - this.cx;
      if (this.t1 <= 0) { g.wind = null; this.state = 'idle'; this.t1 = 2.2; }
    } else if (this.state === 'divetele') {
      this.diveTarget = [p.cx, p.cy];
      if (this.t1 <= 0) { this.state = 'dive'; this.t1 = 0.7; [this.dashX, this.dashY] = dirTo(this.cx, this.cy, ...this.diveTarget); audio.sfx('arrow'); }
    } else if (this.state === 'dive') {
      moveEntity(g, this, this.dashX * this.spd * 3 * dt, this.dashY * this.spd * 3 * dt);
      if (this.t1 <= 0) { this.state = 'dived'; this.stunned = 1.6; g.shake(4, 0.3); audio.sfx('thud'); this.t1 = 0; }
    } else if (this.state === 'dived') {
      this.state = 'idle'; this.t1 = 2.4;
    }
  }

  // --- King Goanna: shockwave stomps, boulders, burrow charge ---
  ai_kinggoanna(g, dt) {
    const p = g.player;
    this.t1 -= dt;
    if (this.state === 'idle') {
      approach(g, this, p.cx, p.cy, this.spd * 0.75, dt);
      if (this.t1 <= 0) {
        const roll = Math.random();
        this.state = roll < 0.4 ? 'stomp' : roll < 0.7 ? 'boulder' : 'burrow';
        this.t1 = this.state === 'stomp' ? 0.7 : this.state === 'boulder' ? 0.5 : 0.6;
        this.bcount = 0;
      }
    } else if (this.state === 'stomp') {
      this.vx = this.vy = 0;
      if (this.t1 <= 0) {
        g.shockwave(this.cx, this.cy, 110, this.dmg);
        g.shake(6, 0.4); audio.sfx('boom');
        this.state = 'idle'; this.t1 = 1.6;
      }
    } else if (this.state === 'boulder') {
      if (this.t1 <= 0) {
        this.t1 = 0.5; this.bcount++;
        shootAt(g, this, p.cx + (Math.random() - 0.5) * 30, p.cy + (Math.random() - 0.5) * 30, 'rock', this.pdmg, 100);
        audio.sfx('thud');
        if (this.bcount >= 3) { this.state = 'idle'; this.t1 = 1.4; }
      }
    } else if (this.state === 'burrow') {
      this.submerged = true;
      approach(g, this, p.cx, p.cy, this.spd * 1.8, dt);
      if (this.t1 <= 0 || dist(this.cx, this.cy, p.cx, p.cy) < 16) {
        this.submerged = false;
        g.shockwave(this.cx, this.cy, 55, this.dmg);
        g.shake(5, 0.3); audio.sfx('boom');
        this.state = 'idle'; this.t1 = 1.8;
      }
    }
  }

  // --- Apexus: cycles all four elements, then goes apex ---
  ai_apexus(g, dt) {
    const p = g.player;
    this.t1 -= dt;
    const frac = this.hp / this.maxHp;
    const apex = frac < 0.28;
    if (!this.elemT || this.t1 <= -900) this.elemT = 0;
    this.elemT = (this.elemT || 0) + dt;
    if (this.elemT > (apex ? 4 : 7)) { this.elemT = 0; this.phase = (this.phase + 1) % 4; audio.sfx('roar'); }
    const speedMul = apex ? 1.35 : 1;
    // always drifts toward the player
    approach(g, this, p.cx, p.cy, this.spd * 0.55 * speedMul, dt);
    if (this.t1 > 0) return;
    switch (this.phase) {
      case 0: // fire: fan + ring
        this.t1 = apex ? 1.1 : 1.7;
        for (let i = -2; i <= 2; i++) shootAt(g, this, p.cx, p.cy, 'fireball', this.pdmg, 115, i * 0.25);
        break;
      case 1: // water: spiral spit
        this.t1 = apex ? 0.9 : 1.4;
        this.spiral = (this.spiral || 0) + 0.9;
        for (let i = 0; i < 6; i++) { const a = this.spiral + i / 6 * Math.PI * 2; g.spawn(new EnemyShot(this.cx, this.cy, Math.cos(a) * 85, Math.sin(a) * 85, 'spit', this.pdmg)); }
        break;
      case 2: // air: feathers + gust pulse
        this.t1 = apex ? 1.0 : 1.5;
        for (let i = -1; i <= 1; i++) shootAt(g, this, p.cx, p.cy, 'feather', this.pdmg, 135, i * 0.3);
        g.wind = { x: Math.sign(p.cx - this.cx) * -55, y: 30 };
        setTimeout(() => { if (g.bossActive === this) g.wind = null; }, 900);
        break;
      case 3: // earth: shockwave + rocks
        this.t1 = apex ? 1.6 : 2.2;
        g.shockwave(this.cx, this.cy, 90, this.dmg);
        g.shake(5, 0.3); audio.sfx('boom');
        shootAt(g, this, p.cx, p.cy, 'rock', this.pdmg, 95);
        break;
    }
  }

  draw(g, ctx) {
    if (this.submerged) {
      ctx.save(); ctx.globalAlpha = 0.45; ctx.fillStyle = this.type === 'boss_kinggoanna' ? '#3a3020' : '#0c2a3a';
      ctx.beginPath(); ctx.ellipse(this.cx, this.cy + 4, 16, 7, 0, 0, 7); ctx.fill();
      ctx.restore();
      return;
    }
    const bob = this.fly && this.stunned <= 0 ? Math.sin(g.time * 5) * 3 - 10 : 0;
    const opts = {
      flip: this.vx < 0, flash: this.flashT > 0 || (this.state === 'tele' || this.state === 'divetele') && Math.floor(g.time * 10) % 2 === 0,
    };
    if (this.frozenT > 0) opts.tint = '#7ad4ff';
    if (this.stunned > 0) opts.squash = 0.6;
    // apexus glows with its current element
    if (this.type === 'boss_apexus') {
      const colors = ['#ff8a3a', '#7ad4ff', '#e8f0ff', '#a8d84a'];
      ctx.save();
      ctx.globalAlpha = 0.28 + 0.1 * Math.sin(g.time * 6);
      ctx.fillStyle = colors[this.phase];
      ctx.beginPath(); ctx.arc(this.cx, this.cy - 8, 34, 0, 7); ctx.fill();
      ctx.restore();
    }
    drawSprite(ctx, this.sprite, this.cx, this.bottom + 4 + bob, opts);
    if (this.fly) {
      ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(this.cx, this.bottom + 4, 12, 4, 0, 0, 7); ctx.fill();
      ctx.restore();
    }
  }
}

export function makeEnemy(type, x, y, tier, opts = {}) {
  if (BOSS_DEFS[type]) return new Boss(type, x, y, tier, opts.roomBounds);
  return new Enemy(type, x, y, tier, opts);
}
