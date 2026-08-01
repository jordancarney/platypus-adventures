// Game orchestration: modes, areas, camera, spawning, combat, triggers, economy.
import { VIEW_W, VIEW_H, TILE, SWORD_DMG, ARROWS, ARROW_TYPES, VESSEL_COSTS, HEART_PER_SHARD,
  CRAYFISH_HEAL, AMMO_CAPS, MAX_LEVEL, SHIELD_REFLECT, PLAYER, TELEPORT, DEBUG } from './config.js';
import { clamp, dist, aabb, lerp } from './util.js';
import { T, drawTileTo, buildTileAtlas } from './tiles.js';
import { buildOverworld, REGION, LM } from './worldgen.js';
import { buildDungeon } from './dungeons.js';
import * as arena from './arena.js';
import { Player, Arrow, Pickup, Chest, Pot, PushBlock, Prop, Dolphin, DOLPHIN_LINES, moveEntity } from './entities.js';
import { makeEnemy } from './enemies.js';
import { saveSlot, loadSlot, clearSlot, listSlots, SLOTS } from './save.js';
import { input } from './input.js';
import { audio } from './audio.js';
import { touch } from './touch.js';
import * as ui from './ui.js';

const REGION_MUSIC = ['marsh', 'fire', 'water', 'air', 'earth', 'confluence', 'village'];
const GATE_KEYS = { fire: 'fireGate', water: 'waterGate', air: 'airGate', earth: 'earthGate', nexus: 'nexusGate', arena: 'arenaGate' };

export class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.mode = 'title';
    this.menuSel = 0;
    this.time = 0;
    this.state = null;
    this.area = null;
    this.player = null;
    this.ents = [];
    this.particles = [];
    this.effects = [];
    this.toasts = [];
    this.cam = { x: 0, y: 0 };
    this.shakeT = 0; this.shakeMag = 0;
    this.banner = null;
    this.dialog = null;
    this.wind = null;
    this.bossActive = null;
    this.visitCleared = {};
    this.visitedRooms = new Set();
    this.curRoom = null;
    this.regionCode = -99;
    this.regionToast = null;
    this.muted = false;
    this.introPage = 0;
    this.creditsY = 0;
    this.shopSel = 0; this.shopScroll = 0;
    this.pausePage = null;
    this.slide = null;
    this.bumpCd = 0;
    this.flash = 0;
    this.dungeonDoors = [];
    this.minimap = null;
    this.dbgWarp = 0;
    this.taps = [];
    this.portraitHintT = 0;
    this.wasPortrait = false;
    this.warpT = 0;         // seconds the warp-home button has been held
    this.slot = 0;          // which save file is in play
    this.slots = [];        // cached slot summaries for the file-select screen
    this.fileErase = null;  // slot index awaiting erase confirmation
  }

  // ------------------------------------------------ state
  defaultState() {
    const types = {};
    for (const t of ARROW_TYPES) types[t] = { owned: false, level: 1 };
    return {
      version: 1,
      maxHp: PLAYER.baseHearts * 2, hp: PLAYER.baseHearts * 2,
      coins: 0, diamonds: 0,
      sword: 0, shield: 0, bow: 0, armor: 0,
      arrows: { ammo: 0, cap: PLAYER.baseAmmoCap, types },
      arrowSel: 'regular', quiver: 0,
      shards: 0, vessels: 0, arenaBest: 0,
      dungeonsDone: {}, keys: {}, fangs: {}, flags: {},
      area: 'overworld', pos: null,
      god: false,
    };
  }
  tier() {
    const n = Object.keys(this.state.dungeonsDone).length;
    return clamp(n, 0, 4) + (this.state.flags.nexus_done ? 1 : 0);
  }
  save() {
    if (!this.state || !this.player) return;
    this.state.pos = { x: this.player.cx, y: this.player.cy };
    this.state.area = this.area ? this.area.id : 'overworld';
    saveSlot(this.slot, this.state);
  }
  refreshSlots() { this.slots = listSlots(); }

  newGame(slot = 0) {
    this.slot = clamp(slot, 0, SLOTS - 1);
    this.state = this.defaultState();
    this.introPage = 0;
    this.mode = 'intro';
  }
  continueGame(slot = 0) {
    const s = loadSlot(slot);
    if (!s) { this.newGame(slot); return; }
    this.slot = clamp(slot, 0, SLOTS - 1);
    const base = this.defaultState();
    this.state = Object.assign(base, s);
    this.state.arrows = Object.assign(this.defaultState().arrows, s.arrows || {});
    // saves from before the 6-level tracks: derive quiver level from the stored capacity
    if (s.quiver == null) this.state.quiver = Math.max(0, AMMO_CAPS.indexOf(this.state.arrows.cap));
    this.state.arrows.cap = AMMO_CAPS[clamp(this.state.quiver, 0, 6)];
    this.loadArea(this.state.area || 'overworld', this.state.pos);
    this.mode = 'play';
  }
  eraseSlot(slot) {
    clearSlot(slot);
    this.refreshSlots();
    audio.sfx('poof');
  }

  // ------------------------------------------------ areas
  loadArea(id, pos = null) {
    this.area = id === 'overworld' ? buildOverworld()
      : id === arena.ARENA_ID ? arena.buildArena()
        : buildDungeon(id, this.state.flags);
    buildTileAtlas(this.area.theme);
    // apply persistent cracked tiles
    for (const key of Object.keys(this.state.flags)) {
      if (!key.startsWith(`crack_${id}_`)) continue;
      const [, , tx, ty] = key.split('_');
      this.breakTile(Number(tx), Number(ty), false);
    }
    this.ents = [];
    this.particles = [];
    this.effects = [];
    this.bossActive = null;
    this.wind = null;
    this.visitCleared = {};
    this.visitedRooms = new Set();
    this.curRoom = null;
    this.slide = null;
    this.dungeonDoors = [];
    this.warpT = 0;
    this.arena = null;
    this.flash = 0.35;

    const start = pos || this.area.playerStart;
    this.player = new Player(start.x, start.y);

    for (const p of this.area.props) {
      switch (p.kind) {
        case 'chest': {
          const c = new Chest(p.tx, p.ty, p.id, p.contents, p.msg);
          if (this.state.flags[p.id]) c.opened = true;
          this.ents.push(c);
          break;
        }
        case 'pot': this.ents.push(new Pot(p.tx, p.ty)); break;
        case 'dolphin':
          this.ents.push(new Dolphin(p.tx * TILE + 8, p.ty * TILE + 8, p.name, DOLPHIN_LINES[p.line % DOLPHIN_LINES.length]));
          break;
        case 'block': this.ents.push(new PushBlock(p.tx, p.ty)); break;
        case 'gate': if (!this.state.flags.gate_open) this.ents.push(new Prop(p)); break;
        case 'dungeon': this.dungeonDoors.push(p); break;
        default: this.ents.push(new Prop(p));
      }
    }

    for (const sp of this.area.spawners) { sp.ent = null; sp.cd = 0; }

    // wards already solved stay open
    for (const p of this.area.puzzles || []) {
      if (this.puzzleSolved(p)) for (const [x, y] of p.doors) this.area.set(x, y, p.ground);
    }

    if (this.area.type === 'overworld') {
      this.minimap = ui.buildMinimap(this.area);
      this.regionCode = -99;
    } else {
      audio.music(this.area.music);
      this.curRoom = this.area.roomAt(this.player.cx, this.player.cy);
      if (this.curRoom) { this.visitedRooms.add(this.curRoom.rx + ',' + this.curRoom.ry); this.activateRoom(this.curRoom); }
    }
    // fresh run every visit; the record lives in the save
    this.arena = this.area.isArena
      ? { wave: 0, phase: 'idle', t: 0, tier: this.tier(), pending: [], lastReward: null }
      : null;
    this.snapCamera();
  }

  enterDungeon(id) {
    audio.sfx('stairs');
    this.save();
    this.loadArea(id);
    this.mode = 'play';
    const sub = this.area.isArena
      ? `Best: wave ${this.state.arenaBest || 0}. Ring the gong to begin.`
      : this.tierHint();
    this.setBanner(this.area.name.toUpperCase(), sub, this.area.isArena ? '#f0c83a' : '#c88aff');
    this.save();
  }
  exitDungeon() {
    audio.sfx('stairs');
    const gk = GATE_KEYS[this.area.id];
    const [tx, ty] = LM[gk];
    this.loadArea('overworld', { x: tx * TILE + 8, y: (ty + 1) * TILE + 12 });
    this.mode = 'play';
    this.save();
  }
  tierHint() {
    const t = clamp(this.tier(), 0, 4);
    return ['The predators stir...', 'The predators are wary of you.', 'The predators hunt in force!', 'The predators are furious!', 'The final trial awaits.'][t];
  }

  // ------------------------------------------------ dungeon rooms
  roomBoundsPx(room) {
    return { x: room.rx * 25 * TILE, y: room.ry * 15 * TILE, w: 25 * TILE, h: 15 * TILE };
  }
  activateRoom(room) {
    const rk = room.rx + ',' + room.ry;
    const cleared = this.visitCleared[rk];
    if (!cleared) {
      for (const s of room.spawns) {
        if (s.boss) {
          if (this.ents.some(e => e.isBoss && !e.dead)) continue; // boss already active (player retreated)
          if (!this.state.flags['boss_' + this.area.id]) {
            const b = makeEnemy(s.type, s.x, s.y, this.tier(), { roomBounds: this.roomBoundsPx(room) });
            this.ents.push(b);
            this.bossActive = b;
            audio.sfx('roar');
            audio.music('boss');
            this.setBanner(this.area.bossName || 'BOSS', '', '#ff9aa8');
          } else if (!this.state.dungeonsDone[this.area.id]) {
            this.ents.push(new Pickup(s.x, s.y, 'shard'));
          }
        } else if (s.miniboss) {
          const m = makeEnemy(s.type, s.x, s.y, this.tier(), { roomBounds: this.roomBoundsPx(room), miniboss: true });
          this.ents.push(m);
          this.toast(this.area.minibossName + ' blocks the way!');
        } else {
          this.spawnEnemy(s.type, s.x, s.y, { roomBounds: this.roomBoundsPx(room) });
        }
      }
      if (room.killall && !room.spawns.length) this.openRoomDoors(room);
    } else if (room.killall) {
      this.openRoomDoors(room);
    }
  }
  roomEnemies(room) {
    const b = this.roomBoundsPx(room);
    return this.ents.filter(e => e.team === 'enemy' && !e.isShot && !e.dead &&
      e.cx >= b.x && e.cx < b.x + b.w && e.cy >= b.y && e.cy < b.y + b.h);
  }
  openRoomDoors(room, silent = false) {
    if (room.opened) return;
    let any = false;
    for (const d of room.gdoors) {
      if (this.area.get(d.x, d.y) === T.DOOR_SHUT) { this.openDoorPair(d.x, d.y); any = true; }
    }
    room.opened = true;
    if (any && !silent) audio.sfx('door');
  }
  openDoorPair(x, y, persist = false) {
    const doorTiles = [T.DOOR_SHUT, T.DOOR_LOCKED, T.DOOR_BOSS, T.DCRACK];
    this.area.set(x, y, T.DOOR_OPEN);
    if (persist) this.state.flags[`door_${this.area.id}_${x}_${y}`] = true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (doorTiles.includes(this.area.get(x + dx, y + dy))) {
        this.area.set(x + dx, y + dy, T.DOOR_OPEN);
        if (persist) this.state.flags[`door_${this.area.id}_${x + dx}_${y + dy}`] = true;
      }
    }
  }
  triggerEye(tx, ty) {
    if (this.area.get(tx, ty) !== T.EYE) return;
    this.area.set(tx, ty, T.EYE_ON);
    audio.sfx('switch');
    this.burst(tx * TILE + 8, ty * TILE + 8, '#e04a5a', 6);
    // overworld ward puzzles own their own eyes
    const wp = (this.area.puzzles || []).find(p =>
      !this.state.flags['puzzle_' + p.id] && p.eyes &&
      p.eyes.some(([ex, ey]) => ex === tx && ey === ty));
    if (wp) { this.puzzleEyeHit(wp, tx, ty); return; }
    const room = this.area.roomAt ? this.area.roomAt(tx * TILE + 8, ty * TILE + 8) : null;
    if (!room) return;
    const allOn = room.eyes.every(e => this.area.get(e.x, e.y) === T.EYE_ON);
    if (allOn && room.eyes.length) this.openRoomDoors(room);
  }
  checkPlates() {
    const room = this.curRoom;
    if (!room || !room.plates.length || room.opened) return;
    let all = true;
    for (const pl of room.plates) {
      const rect = { x: pl.x * TILE + 2, y: pl.y * TILE + 2, w: 12, h: 12 };
      let covered = aabb(this.player.box(), rect);
      if (!covered) {
        for (const e of this.ents) {
          if (e instanceof PushBlock && !e.dead && aabb(e.box(), rect)) { covered = true; break; }
        }
      }
      this.area.set(pl.x, pl.y, covered ? T.PLATE_DOWN : T.PLATE);
      if (!covered) all = false;
    }
    if (all) { audio.sfx('switch'); this.openRoomDoors(room); }
  }

  onPlayerBumpTile(bump) {
    if (this.bumpCd > 0) return;
    const { id, tx, ty } = bump;
    const dgn = this.area.id;
    if (id === T.DOOR_LOCKED) {
      if ((this.state.keys[dgn] || 0) > 0) {
        this.state.keys[dgn]--;
        this.openDoorPair(tx, ty, true);
        audio.sfx('door');
        this.toast('The small key turns...');
        this.save();
      } else this.toast('Locked. A SMALL KEY would help.');
      this.bumpCd = 0.8;
    } else if (id === T.DOOR_BOSS) {
      if (this.state.fangs[dgn]) {
        this.openDoorPair(tx, ty, true);
        audio.sfx('roar');
        this.toast('The BIG FANG unseals the lair!');
        this.save();
      } else this.toast('Sealed shut. Only the BIG FANG opens it.');
      this.bumpCd = 0.8;
    } else if (id === T.DOOR_SHUT) {
      const HINTS = {
        timed: 'Sealed. Light every eye before the first fades.',
        sequence: 'Sealed. The eyes must be struck in the right order.',
        blocks: 'Sealed. The old stones belong on the old marks.',
        killall: 'Sealed. The wardens must be bested first.',
      };
      const p = (this.area.puzzles || []).find(q =>
        q.doors.some(([dx2, dy2]) => dx2 === tx && dy2 === ty));
      this.toast(p ? HINTS[p.kind] : 'Something in this room must open it...');
      this.bumpCd = 1.4;
    } else if (id === T.DCRACK || id === T.CRACKROCK || id === T.CRYSTAL) {
      this.toast('Cracked... a big BOOM could break it.');
      this.bumpCd = 1.4;
    }
  }

  // ------------------------------------------------ combat & effects
  spawn(e) { this.ents.push(e); return e; }
  spawnEnemy(type, x, y, opts = {}) {
    // the arena passes its own tier so waves can outscale story progress
    const t = opts.tier != null ? opts.tier : this.tier();
    if (!opts.miniboss && !opts.elite && t >= 2 && Math.random() < 0.13 + 0.12 * (t - 2)) opts.elite = true;
    const e = makeEnemy(type, x, y, t, opts);
    this.ents.push(e);
    return e;
  }
  enemies() { return this.ents.filter(e => e.team === 'enemy' && !e.isShot && !e.dead); }

  onEnemyDeath(e) {
    if (this.area.type === 'dungeon' && e.roomBounds && this.curRoom) {
      const room = this.curRoom;
      const rk = room.rx + ',' + room.ry;
      if (this.roomEnemies(room).length === 0) {
        this.visitCleared[rk] = true;
        if (room.killall) this.openRoomDoors(room);
      }
    }
  }
  onBossDeath(boss) {
    this.bossActive = null;
    this.state.flags['boss_' + this.area.id] = true;
    if (this.area.id === 'nexus') {
      this.setBanner('APEXUS IS VANQUISHED!', 'The River\'s Light returns...', '#fff6c8', () => {
        this.state.flags.nexus_done = true;
        this.creditsY = 0;
        this.mode = 'victory';
        audio.music('victory');
        this.save();
      });
    } else {
      audio.music(this.area.music);
      this.spawn(new Pickup(boss.cx, boss.cy, 'shard'));
      this.toast('The KEY SHARD appeared!');
      this.save();
    }
  }
  onShardCollected() {
    const st = this.state;
    st.shards++;
    st.dungeonsDone[this.area.id] = true;
    audio.sfx('shard');
    // each elemental dungeon permanently grows Gus's heart, on top of anything bought
    let gained = 0;
    if (!st.flags['heart_' + this.area.id]) {
      st.flags['heart_' + this.area.id] = true;
      gained = HEART_PER_SHARD;
      st.maxHp = Math.min(PLAYER.maxHearts * 2, st.maxHp + gained * 2);
      st.hp = st.maxHp;
      audio.sfx('heart');
    }
    const n = st.shards;
    const tail = n >= 4 ? 'The Great Gate awaits to the north!' : 'The predators of the Vale grow bolder...';
    this.setBanner(`KEY SHARD  ${n} / 4`,
      gained ? `+${gained} heart!  ${tail}` : tail, '#7ae0f0',
      () => this.exitDungeon());
    this.save();
  }
  onPlayerDeath() {
    this.state.hp = 0;
    audio.sfx('roar');
    this.mode = 'dead';
  }
  respawn() {
    this.state.hp = this.state.maxHp;
    // losing in the arena ends the run and puts you out front; winnings are already banked
    if (this.area.isArena) {
      const [tx, ty] = LM.arenaGate;
      this.loadArea('overworld', { x: tx * TILE + 8, y: (ty + 1) * TILE + 12 });
    } else if (this.area.type === 'dungeon') this.loadArea(this.area.id);
    else this.loadArea('overworld', { x: 100 * TILE + 8, y: 112 * TILE + 8 });
    this.mode = 'play';
    this.save();
  }

  explode(x, y, radius, dmg, fromPlayer) {
    audio.sfx('boom');
    this.shake(4, 0.3);
    this.burst(x, y, '#f0a03a', 14);
    this.burst(x, y, '#6a6a72', 10);
    if (fromPlayer) {
      for (const e of this.enemies()) if (dist(x, y, e.cx, e.cy) < radius + 8) e.hurt(this, dmg, x, y);
    } else if (dist(x, y, this.player.cx, this.player.cy) < radius + 4) {
      this.player.hurt(this, dmg, x, y);
    }
    // break cracked tiles
    const t0x = Math.floor((x - radius) / TILE), t1x = Math.floor((x + radius) / TILE);
    const t0y = Math.floor((y - radius) / TILE), t1y = Math.floor((y + radius) / TILE);
    for (let ty = t0y; ty <= t1y; ty++) for (let tx = t0x; tx <= t1x; tx++) {
      const id = this.area.get(tx, ty);
      if (id === T.DCRACK || id === T.CRACKROCK || id === T.CRYSTAL) {
        this.breakTile(tx, ty, true);
        this.state.flags[`crack_${this.area.id}_${tx}_${ty}`] = true;
      }
    }
  }
  breakTile(tx, ty, live) {
    const id = this.area.get(tx, ty);
    if (id !== T.DCRACK && id !== T.CRACKROCK && id !== T.CRYSTAL) return;
    let ground = T.GRASS;
    if (this.area.type === 'dungeon') ground = T.DFLOOR;
    else {
      const rg = this.area.regionAt(tx, ty);
      ground = [T.GRASS, T.ASH, T.SAND, T.PATH, T.DARKGRASS, T.STORMGRASS, T.GRASS][rg] ?? T.GRASS;
    }
    this.area.set(tx, ty, ground);
    if (live) {
      this.burst(tx * TILE + 8, ty * TILE + 8, '#8a8278', 8);
      if (id === T.CRYSTAL) {
        audio.sfx('gem');
        const n = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < n; i++) this.spawn(new Pickup(tx * TILE + 8, ty * TILE + 8, 'diamond'));
      }
    }
  }
  shockwave(x, y, maxR, dmg) {
    this.effects.push({ kind: 'ring', x, y, r: 10, maxR, dmg, hit: false });
  }
  cutTile(tx, ty) {
    const id = this.area.get(tx, ty);
    if (id === T.TALLGRASS || id === T.REED) {
      this.area.set(tx, ty, id === T.REED ? T.SHALLOW : T.GRASS);
      this.burst(tx * TILE + 8, ty * TILE + 8, '#58a044', 6);
      const r = Math.random();
      const cx = tx * TILE + 8, cy = ty * TILE + 8;
      if (r < 0.22) this.spawn(new Pickup(cx, cy, 'coin', 1));
      else if (r < 0.30) this.spawn(new Pickup(cx, cy, 'crayfish'));
      else if (r < 0.42 && this.state.bow) this.spawn(new Pickup(cx, cy, 'arrows', 2));
      else if (r < 0.435) this.spawn(new Pickup(cx, cy, 'diamond'));
    }
  }

  // particles
  addParticle(x, y, color, life = 0.5, vx = 0, vy = 0, size = 2) {
    if (this.particles.length > 250) return;
    this.particles.push({ x, y, color, life, maxLife: life, vx, vy, size });
  }
  burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 20 + Math.random() * 55;
      this.addParticle(x, y, color, 0.3 + Math.random() * 0.35, Math.cos(a) * s, Math.sin(a) * s, 1 + (Math.random() < 0.4 ? 1 : 0));
    }
  }
  zapLine(x1, y1, x2, y2) {
    const steps = 7;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.addParticle(lerp(x1, x2, t) + (Math.random() - 0.5) * 5, lerp(y1, y2, t) + (Math.random() - 0.5) * 5, '#ffe95c', 0.22, 0, 0, 2);
    }
  }
  shake(mag, t) { this.shakeMag = Math.max(this.shakeMag, mag); this.shakeT = Math.max(this.shakeT, t); }
  toast(text) {
    if (this.toasts[0] && this.toasts[0].text === text) { this.toasts[0].t = 2.4; return; }
    this.toasts.unshift({ text, t: 2.4 });
    if (this.toasts.length > 4) this.toasts.pop();
  }
  setBanner(title, sub, color, cb) {
    this.banner = { title, sub, color, t: 2.6, cb };
    this.mode = 'banner';
  }

  // ------------------------------------------------ dialog / npc / items
  openDialog(name, textStr, cb) {
    const lines = textStr.split('|');
    const pages = [];
    for (let i = 0; i < lines.length; i += 3) pages.push(lines.slice(i, i + 3));
    this.dialog = { name, pages, page: 0, chars: 0, done: false, cb };
    this.mode = 'dialog';
  }

  grantContents(contents, msg) {
    const st = this.state;
    const parts = [];
    if (contents.sword) { st.sword = Math.max(st.sword, 1); }
    if (contents.bow) {
      st.bow = Math.max(st.bow, 1);
      st.arrows.types.regular.owned = true;
      st.arrows.ammo = Math.min(st.arrows.cap, st.arrows.ammo + 20);
    }
    if (contents.key) {
      st.keys[this.area.id] = (st.keys[this.area.id] || 0) + contents.key;
      audio.sfx('key');
      parts.push('a SMALL KEY');
    }
    if (contents.bigfang) {
      st.fangs[this.area.id] = true;
      audio.sfx('key');
      this.setBanner('THE BIG FANG!', 'The boss lair can now be opened.', '#f0ead8');
    }
    if (contents.arrowType) {
      const t = contents.arrowType;
      st.arrows.types[t].owned = true;
      st.arrowSel = t;
      st.arrows.ammo = Math.min(st.arrows.cap, st.arrows.ammo + 15);
      const subs = {
        fire: 'Burns foes over time. Q/R to swap types.',
        ice: 'Freezes enemies solid for a moment.',
        lightning: 'Chains between nearby enemies!',
        bomb: 'Explodes! Breaks cracked rocks and walls.',
        light: 'The apex arrow. ALL predators fear it.',
      };
      this.setBanner(ARROWS[t].name.toUpperCase() + '!', subs[t] || '', ARROWS[t].color);
    }
    if (contents.coins) { st.coins += contents.coins; audio.sfx('coin'); parts.push(contents.coins + ' Platycoins'); }
    if (contents.diamonds) { st.diamonds += contents.diamonds; audio.sfx('gem'); parts.push(contents.diamonds + ' diamonds'); }
    if (contents.ammo) { st.arrows.ammo = Math.min(st.arrows.cap, st.arrows.ammo + contents.ammo); parts.push(contents.ammo + ' arrows'); }
    if (parts.length) this.toast('Found ' + parts.join(', ') + '!');
    if (msg) this.openDialog(null, msg);
    this.save();
  }

  interactProp(prop) {
    const d = prop.def;
    switch (prop.kind) {
      case 'sign': this.openDialog(null, d.text); break;
      case 'statue':
        this.state.hp = this.state.maxHp;
        audio.sfx('save');
        this.save();
        this.toast('Progress saved. Gus feels rested!');
        break;
      case 'shrine': this.mode = 'shrine'; break;
      case 'gate': {
        if (this.state.shards >= 4 && !this.state.flags.gate_open) {
          this.state.flags.gate_open = true;
          audio.sfx('shard');
          this.shake(5, 0.6);
          prop.dead = true;
          this.setBanner('THE GREAT GATE OPENS!', 'The Confluence lies ahead...', '#c88aff');
          this.save();
        } else if (!this.state.flags.gate_open) {
          this.openDialog(null, `The Great Gate is sealed by four locks.|Key Shards found: ${this.state.shards} of 4.|Seek the dungeons of Fire, Water, Air and Earth.`);
        }
        break;
      }
      case 'gong': {
        const A = this.arena;
        if (!A) break;
        if (A.phase === 'breather') { A.t = 0; break; }        // skip the breather, bring them on
        if (A.phase !== 'idle') break;                          // mid-fight: nothing to ring
        const best = this.state.arenaBest || 0;
        this.openDialog('The Crucible',
          `Fight wave after wave for coin and diamonds.|${best ? `Your best: wave ${best}.` : 'No record yet.'}|Leave down the stairs any time.`,
          () => this.arenaStartWave(1));
        break;
      }
      case 'npc': this.npcDialog(d); break;
    }
  }

  npcDialog(d) {
    const st = this.state;
    if (d.dialog === 'elder') {
      if (!st.flags.elder_met) {
        this.openDialog(d.name,
          "Gus! Thank the rivers you've come.|The Elemental Fangs hold the four Key Shards.|Without them the Confluence stays sealed...|Take my old SHIELD. Hold L or SHIFT to block.|The bow in that chest is yours too.|Wombeau sells upgrades. Go safely, Guardian.",
          () => {
            st.flags.elder_met = true;
            st.shield = Math.max(st.shield, 1);
            this.setBanner('SHIELD GET!', 'Hold L / C / Shift to block frontal attacks.', '#c8ccd4');
            this.save();
          });
      } else if (st.flags.nexus_done) {
        this.openDialog(d.name, 'The Vale sings your name, Guardian Gus.|Rest. Fish. Eat crayfish.|You have earned every bite.');
      } else if (st.shards >= 4) {
        this.openDialog(d.name, 'Four shards! The Great Gate will yield.|Beware, Apexus wears all four elements...|Light is the only thing it fears.');
      } else {
        this.openDialog(d.name, `Shards found: ${st.shards} of 4.|Fire lies northeast, Water southeast,|Air northwest, and Earth southwest.|Each dungeon hides an arrow of its element.`);
      }
    } else if (d.dialog === 'shop') {
      this.shopSel = 0; this.shopScroll = 0;
      this.mode = 'shop';
    } else if (d.dialog === 'pip') {
      this.openDialog(d.name, "Did you know platypuses can SWIM?|Deep water is no wall for you, Gus!|...but you can't fight while paddling.");
    } else if (d.dialog === 'marlo') {
      const t = this.tier();
      this.openDialog(d.name, t >= 2
        ? 'The predators grow stronger with every shard.|The shiny ELITE ones drop extra loot!'
        : 'Cut tall grass for coins and snacks.|Enemies drop CRAYFISH -- Gus loves those.|The statue saves your adventure.');
    }
  }

  buyShopItem(item) {
    const st = this.state;
    if (st.coins < item.price) { audio.sfx('denied'); this.toast('Not enough Platycoins!'); return; }
    st.coins -= item.price;
    const [kind, a, b] = item.id.split(':');
    if (kind === 'arrow') {
      st.arrows.types[a].level = Number(b);
    } else if (kind === 'quiver') {
      st.quiver = Number(a);
      st.arrows.cap = AMMO_CAPS[st.quiver];
    } else if (kind === 'ammo') {
      st.arrows.ammo = Math.min(st.arrows.cap, st.arrows.ammo + 10);
    } else if (kind === 'cray') {
      st.hp = Math.min(st.maxHp, st.hp + CRAYFISH_HEAL);
    } else {
      st[kind] = Number(a);      // sword / armor / shield / bow
    }
    audio.sfx('buy');
    this.toast('Bought ' + item.label + '!');
    this.save();
  }

  cycleArrow(dir) {
    const st = this.state;
    if (!st.bow) return;
    const owned = ARROW_TYPES.filter(t => st.arrows.types[t].owned);
    if (!owned.length) return;
    let i = owned.indexOf(st.arrowSel);
    i = (i + dir + owned.length) % owned.length;
    st.arrowSel = owned[i];
    audio.sfx('blip');
  }
  selectArrowSlot(i) {
    const t = ARROW_TYPES[i];
    if (t && this.state.arrows.types[t].owned) { this.state.arrowSel = t; audio.sfx('blip'); }
  }

  // ------------------------------------------------ update
  update(dt) {
    this.time += dt;
    for (const t of this.toasts) t.t -= dt;
    this.toasts = this.toasts.filter(t => t.t > 0);
    if (this.regionToast) { this.regionToast.t += dt; if (this.regionToast.t > 3) this.regionToast = null; }
    this.bumpCd = Math.max(0, this.bumpCd - dt);
    this.flash = Math.max(0, this.flash - dt);
    if (this.shakeT > 0) { this.shakeT -= dt; if (this.shakeT <= 0) this.shakeMag = 0; }

    // thumbstick + action buttons only live while the world is on screen
    touch.setPadActive(this.mode === 'play' || this.mode === 'roomslide');
    this.taps = touch.takeTaps();
    const anyTap = this.taps.length > 0;

    // nudge touch players toward landscape, where the 5:3 view fills the screen
    if (touch.enabled) {
      const portrait = innerHeight > innerWidth;
      if (portrait && !this.wasPortrait) this.portraitHintT = 5;
      this.wasPortrait = portrait;
      if (!portrait) this.portraitHintT = 0;
      this.portraitHintT = Math.max(0, this.portraitHintT - dt);
    }

    switch (this.mode) {
      case 'title': this.updateTitle(); break;
      case 'files': this.updateFiles(); break;
      case 'intro':
        if (input.pressed('interact') || input.pressed('sword') || anyTap) {
          this.introPage++;
          audio.sfx('blip');
          if (this.introPage >= ui.INTRO_PAGES.length) {
            this.loadArea('overworld');
            this.mode = 'play';
            audio.music('marsh');
            this.save();
          }
        }
        break;
      case 'play': this.updatePlay(dt); break;
      case 'roomslide': this.updateSlide(dt); break;
      case 'dialog': this.updateDialog(dt); break;
      case 'shop': this.updateShop(); break;
      case 'shrine': this.updateShrine(); break;
      case 'map':
        if (input.pressed('map') || input.pressed('pause') || input.pressed('interact') || anyTap) this.mode = 'play';
        break;
      case 'pause': this.updatePause(); break;
      case 'dead':
        if (input.pressed('interact') || input.pressed('sword') || anyTap) this.respawn();
        break;
      case 'banner':
        this.banner.t -= dt;
        this.updateParticles(dt);
        if (this.banner.t <= 0 || input.pressed('interact') || anyTap) {
          const cb = this.banner.cb;
          this.banner = null;
          this.mode = 'play';
          if (cb) cb();
        }
        break;
      case 'victory':
        this.creditsY += dt * 16;
        if (this.creditsY > ui.CREDITS.length * 16 + VIEW_H - 40 && (input.pressed('interact') || input.pressed('sword') || anyTap)) {
          this.loadArea('overworld', { x: 100 * TILE + 8, y: 112 * TILE + 8 });
          this.mode = 'play';
          this.save();
        }
        break;
    }
    if (input.pressed('mute')) { this.muted = audio.toggleMute(); this.toast(this.muted ? 'Sound off' : 'Sound on'); }
  }

  updateTitle() {
    audio.music('title');
    if (input.pressed('interact') || input.pressed('sword') || this.taps.length) {
      audio.sfx('blip');
      this.refreshSlots();
      this.menuSel = this.slots.findIndex(Boolean);
      if (this.menuSel < 0) this.menuSel = 0;
      this.fileErase = null;
      this.mode = 'files';
    }
  }

  updateFiles() {
    audio.music('title');
    // erase confirmation takes over the screen
    if (this.fileErase !== null) {
      for (const t of this.taps) {
        const r = ui.eraseConfirmRects();
        if (ui.hitRect(t, r.yes)) { this.eraseSlot(this.fileErase); this.fileErase = null; return; }
        if (ui.hitRect(t, r.no)) { this.fileErase = null; return; }
      }
      if (input.pressed('interact')) { this.eraseSlot(this.fileErase); this.fileErase = null; }
      else if (input.pressed('pause') || input.pressed('cycleL')) this.fileErase = null;
      return;
    }

    if (input.pressed('up')) { this.menuSel = (this.menuSel + SLOTS - 1) % SLOTS; audio.sfx('blip'); }
    if (input.pressed('down')) { this.menuSel = (this.menuSel + 1) % SLOTS; audio.sfx('blip'); }

    const start = (i) => {
      audio.sfx('fanfare');
      if (this.slots[i]) this.continueGame(i); else this.newGame(i);
    };

    for (const t of this.taps) {
      const era = ui.fileEraseRects().find(r => this.slots[r.i] && ui.hitRect(t, r));
      if (era) { this.menuSel = era.i; this.fileErase = era.i; audio.sfx('blip'); return; }
      const card = ui.fileCardRects().find(r => ui.hitRect(t, r));
      if (card) {
        // tapping a different file selects it; tapping the highlighted one plays it
        if (card.i !== this.menuSel) { this.menuSel = card.i; audio.sfx('blip'); }
        else start(card.i);
        return;
      }
    }
    if (input.pressed('interact') || input.pressed('sword')) start(this.menuSel);
    if (input.pressed('cycleL') && this.slots[this.menuSel]) { this.fileErase = this.menuSel; audio.sfx('blip'); }
    if (input.pressed('pause')) { this.mode = 'title'; this.menuSel = 0; }
  }

  updatePlay(dt) {
    const p = this.player;
    p.update(this, dt);
    if (this.wind) moveEntity(this, p, this.wind.x * dt, this.wind.y * dt);

    // solid entity cache
    this.solidEnts = this.ents.filter(e => e.solid && !e.dead);

    for (const e of this.ents) if (!e.dead) e.update(this, dt);

    this.resolveCombat(dt);
    this.updateEffects(dt);
    this.updateParticles(dt);
    this.ents = this.ents.filter(e => !e.dead);

    if (this.area.type === 'overworld') {
      this.updateSpawners(dt);
      this.updateRegion();
      this.updatePuzzles(dt);
      this.ambient(dt);
    } else {
      // room transitions
      const room = this.area.roomAt(p.cx, p.cy);
      if (room && room !== this.curRoom) this.startSlide(room);
      this.checkPlates();
    }

    // stairs
    const ptx = Math.floor(p.cx / TILE), pty = Math.floor(p.cy / TILE);
    if (this.area.get(ptx, pty) === T.STAIRS) {
      if (this.area.type === 'overworld') {
        const door = this.dungeonDoors.find(dd => dd.tx === ptx && dd.ty === pty);
        if (door) { this.enterDungeon(door.id); return; }
      } else {
        this.exitDungeon();
        return;
      }
    }

    // interact
    if (input.pressed('interact')) {
      const near = this.ents
        .filter(e => !e.dead && e.interact && dist(p.cx, p.cy, e.cx, e.cy) < 31)
        .sort((a, b) => dist(p.cx, p.cy, a.cx, a.cy) - dist(p.cx, p.cy, b.cx, b.cy))[0];
      if (near) near.interact(this);
    }

    this.updateArena(dt);
    this.updateWarp(dt);

    if (input.pressed('map')) { this.mode = 'map'; audio.sfx('blip'); }
    if (input.pressed('pause')) { this.mode = 'pause'; this.menuSel = 0; this.pausePage = null; audio.sfx('blip'); }
    this.updateCamera(dt);
    this.debugKeys();
  }

  // ------------------------------------------------ ward puzzles (overworld approaches)
  puzzleSolved(p) { return !!this.state.flags['puzzle_' + p.id]; }

  puzzleResetEyes(p, noisy) {
    for (const [x, y] of p.eyes) this.area.set(x, y, T.EYE);
    p.step = 0;
    p.timer = 0;
    if (noisy) { audio.sfx('denied'); this.toast('The seals go dark. Try again.'); }
  }

  puzzleEyeHit(p, tx, ty) {
    const i = p.eyes.findIndex(([x, y]) => x === tx && y === ty);
    if (p.kind === 'sequence') {
      if (i !== p.order[p.step || 0]) { this.puzzleResetEyes(p, true); return; }
      p.step = (p.step || 0) + 1;
      if (p.step >= p.order.length) this.solvePuzzle(p);
      else this.toast(`${p.step} of ${p.order.length}...`);
      return;
    }
    if (p.kind === 'timed') {
      if (!p.timer || p.timer <= 0) { p.timer = p.limit; this.toast(`Quick! ${p.limit} seconds!`); }
      if (p.eyes.every(([x, y]) => this.area.get(x, y) === T.EYE_ON)) this.solvePuzzle(p);
    }
  }

  puzzleCheckPlates(p) {
    let all = true;
    for (const [px, py] of p.plates) {
      const rect = { x: px * TILE + 2, y: py * TILE + 2, w: 12, h: 12 };
      let covered = false;
      for (const e of this.ents) {
        if (e instanceof PushBlock && !e.dead && aabb(e.box(), rect)) { covered = true; break; }
      }
      this.area.set(px, py, covered ? T.PLATE_DOWN : T.PLATE);
      if (!covered) all = false;
    }
    if (all) this.solvePuzzle(p);
  }

  solvePuzzle(p) {
    if (this.puzzleSolved(p)) return;
    this.state.flags['puzzle_' + p.id] = true;
    for (const [x, y] of p.doors) this.area.set(x, y, p.ground);
    audio.sfx('shard');
    this.shake(4, 0.4);
    for (const [x, y] of p.doors) this.burst(x * TILE + 8, y * TILE + 8, '#f0c83a', 8);
    this.setBanner('THE WARD OPENS!', 'The way ahead is clear.', '#f0c83a');
    this.save();
  }

  updatePuzzles(dt) {
    const list = this.area.puzzles;
    if (!list) return;
    for (const p of list) {
      if (this.puzzleSolved(p)) continue;
      if (p.kind === 'timed' && p.timer > 0) {
        p.timer -= dt;
        if (p.timer <= 0) this.puzzleResetEyes(p, true);
      } else if (p.kind === 'blocks') {
        this.puzzleCheckPlates(p);
      } else if (p.kind === 'killall') {
        if (!p.armed) {
          // guardians wake when Gus steps into the courtyard
          if (dist(this.player.cx, this.player.cy, p.trigger[0] * TILE + 8, p.trigger[1] * TILE + 8) < 70) {
            p.armed = true;
            audio.sfx('roar');
            this.toast('The wardens stir!');
            p.spawns.forEach(([x, y], i) => {
              const e = this.spawnEnemy(p.types[i % p.types.length], x * TILE + 8, y * TILE + 8, {});
              e.puzzleId = p.id;
            });
          }
        } else if (!this.ents.some(e => e.puzzleId === p.id && !e.dead)) {
          this.solvePuzzle(p);
        }
      }
    }
  }

  // ------------------------------------------------ the Crucible (wave arena)
  arenaPad(i) {
    const [tx, ty] = arena.PADS[i % arena.PADS.length];
    return { x: tx * TILE + 8, y: ty * TILE + 8 };
  }

  arenaStartWave(n) {
    const A = this.arena;
    A.wave = n;
    A.phase = 'countdown';
    A.t = arena.COUNTDOWN;
    A.tier = arena.waveTier(n, this.tier());
    A.lastReward = null;
    audio.sfx('roar');
  }

  arenaSpawnWave() {
    const A = this.arena;
    const bounds = this.roomBoundsPx(this.curRoom);
    const pool = arena.rosterFor(A.wave);
    const boss = arena.isMinibossWave(A.wave);
    const n = Math.max(1, arena.fighterCount(A.wave) - (boss ? 1 : 0));
    const chance = arena.eliteChance(A.wave);
    A.pending = [];
    for (let i = 0; i < n; i++) {
      const pad = this.arenaPad(i + A.wave);
      A.pending.push({
        ...pad, type: pool[Math.floor(Math.random() * pool.length)],
        elite: Math.random() < chance, t: 0.45 + i * 0.22, bounds,
      });
    }
    if (boss) {
      const [tx, ty] = arena.CENTER_PAD;
      A.pending.push({
        x: tx * TILE + 8, y: ty * TILE + 8, type: arena.minibossFor(A.wave),
        elite: false, miniboss: true, t: 0.9, bounds,
      });
    }
    A.phase = 'fight';
  }

  arenaWaveCleared() {
    const A = this.arena, st = this.state;
    const coins = arena.waveCoins(A.wave);
    const diamonds = arena.waveDiamonds(A.wave);
    st.coins += coins;
    st.diamonds += diamonds;
    st.arenaBest = Math.max(st.arenaBest || 0, A.wave);
    A.lastReward = { coins, diamonds };
    audio.sfx(diamonds ? 'shard' : 'fanfare');
    this.toast(`Wave ${A.wave} cleared!  +${coins} coins${diamonds ? `  +${diamonds} diamonds` : ''}`);
    if (A.wave % arena.HEAL_EVERY === 0) {
      this.spawn(new Pickup(this.player.cx + 20, this.player.cy, 'crayfish'));
    }
    A.phase = 'breather';
    A.t = arena.BREATHER;
    this.save();
  }

  updateArena(dt) {
    const A = this.arena;
    if (!A) return;
    A.t -= dt;

    // fighters land on a telegraphed pad rather than appearing on top of you
    for (const s of A.pending) {
      s.t -= dt;
      if (Math.random() < 0.6) {
        this.addParticle(s.x + (Math.random() - 0.5) * 16, s.y + (Math.random() - 0.5) * 16,
          '#f0c83a', 0.3, 0, -26);
      }
      if (s.t <= 0) {
        this.spawnEnemy(s.type, s.x, s.y,
          { tier: A.tier, elite: s.elite, miniboss: s.miniboss, roomBounds: s.bounds });
        this.burst(s.x, s.y, '#f0c83a', 8);
        s.done = true;
      }
    }
    if (A.pending.length) A.pending = A.pending.filter(s => !s.done);

    switch (A.phase) {
      case 'countdown':
        if (A.t <= 0) this.arenaSpawnWave();
        break;
      case 'fight':
        if (!A.pending.length && this.enemies().length === 0) this.arenaWaveCleared();
        break;
      case 'breather':
        if (A.t <= 0) this.arenaStartWave(A.wave + 1);
        break;
    }
  }

  // ------------------------------------------------ warp home
  updateWarp(dt) {
    if (input.down('teleport')) {
      const was = this.warpT;
      this.warpT = Math.min(TELEPORT.hold, this.warpT + dt);
      const p = this.warpT / TELEPORT.hold;
      // sparks spiral inward, faster and thicker as the charge builds
      const rate = 0.35 + p * 1.4;
      for (let i = 0; i < 3; i++) {
        if (Math.random() > rate / 3) continue;
        const a = Math.random() * Math.PI * 2;
        const r = 40 - p * 16;
        const sx = this.player.cx + Math.cos(a) * r;
        const sy = this.player.cy + Math.sin(a) * r * 0.62;
        const spd = 45 + p * 110;
        this.addParticle(sx, sy, Math.random() < 0.5 ? '#c8a0ff' : '#7ad4ff',
          0.3 + Math.random() * 0.2, -Math.cos(a) * spd, -Math.sin(a) * spd * 0.62,
          Math.random() < 0.35 ? 2 : 1);
      }
      // audible ladder: one rising note per fifth of the charge
      const step = TELEPORT.hold / 5;
      if (Math.floor(this.warpT / step) > Math.floor(was / step)) audio.chargeTone(p);
      if (this.warpT >= TELEPORT.hold) this.warpHome();
    } else if (this.warpT > 0) {
      if (this.warpT > TELEPORT.cancelBlipAfter) audio.sfx('warpOff');
      this.warpT = 0;
    }
  }

  warpHome() {
    this.warpT = 0;
    audio.sfx('warp');
    this.shake(5, 0.45);
    this.burst(this.player.cx, this.player.cy - 4, '#c8a0ff', 20);
    this.burst(this.player.cx, this.player.cy - 4, '#ffffff', 12);
    const [tx, ty] = TELEPORT.dest;
    this.loadArea('overworld', { x: tx * TILE + 8, y: ty * TILE + 8 });
    this.mode = 'play';
    audio.sfx('warpIn');
    this.burst(this.player.cx, this.player.cy - 4, '#c8a0ff', 22);
    this.burst(this.player.cx, this.player.cy - 4, '#7ad4ff', 14);
    this.toast('Warped home to Billabong Village!');
    this.save();
  }

  // Rune circle + light column under Gus while the warp charges (drawn in world space).
  drawWarpCharge(ctx) {
    const p = this.warpT / TELEPORT.hold;
    const px = Math.round(this.player.cx), py = Math.round(this.player.bottom + 2);
    ctx.save();
    // light column rising off him, with a hot core
    const h = 26 + 58 * p;
    const w = 5 + 16 * p;
    const grad = ctx.createLinearGradient(px, py - h, px, py);
    grad.addColorStop(0, 'rgba(200,160,255,0)');
    grad.addColorStop(1, 'rgba(200,160,255,0.8)');
    ctx.globalAlpha = 0.4 + 0.5 * p;
    ctx.fillStyle = grad;
    ctx.fillRect(px - w / 2, py - h, w, h);
    const core = ctx.createLinearGradient(px, py - h * 0.8, px, py);
    core.addColorStop(0, 'rgba(255,255,255,0)');
    core.addColorStop(1, 'rgba(240,230,255,0.9)');
    ctx.globalAlpha = 0.35 + 0.55 * p;
    ctx.fillStyle = core;
    ctx.fillRect(px - Math.max(1, w / 5), py - h * 0.8, Math.max(2, w / 2.5), h * 0.8);
    // three counter-rotating dashed rings that tighten and speed up as it fills
    for (let ring = 0; ring < 3; ring++) {
      const rad = (28 - ring * 8) * (1 - p * 0.4) + 5;
      const spin = this.time * (2 + p * 13) * (ring % 2 ? -1 : 1);
      ctx.globalAlpha = Math.min(1, 0.4 + 0.6 * p);
      ctx.strokeStyle = ring % 2 ? '#8ae0ff' : '#d8b0ff';
      ctx.lineWidth = ring === 0 ? 2 : 1;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = spin + (i / 10) * Math.PI * 2;
        const a2 = a + 0.32;
        ctx.moveTo(px + Math.cos(a) * rad, py + Math.sin(a) * rad * 0.42);
        ctx.lineTo(px + Math.cos(a2) * rad, py + Math.sin(a2) * rad * 0.42);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // Screen-space vignette that closes in as the warp charges.
  drawWarpVignette(ctx) {
    const p = clamp(this.warpT / TELEPORT.hold, 0, 1);
    const g2 = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * (0.62 - 0.3 * p),
      VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.95);
    g2.addColorStop(0, 'rgba(120,70,200,0)');
    g2.addColorStop(1, `rgba(120,70,200,${0.28 + 0.42 * p})`);
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  resolveCombat() {
    const p = this.player;
    const st = this.state;
    const slash = p.attackT > 0 ? p.slashBox : null;

    if (slash) {
      // cut grass under the slash
      const t0x = Math.floor(slash.x / TILE), t1x = Math.floor((slash.x + slash.w) / TILE);
      const t0y = Math.floor(slash.y / TILE), t1y = Math.floor((slash.y + slash.h) / TILE);
      for (let ty = t0y; ty <= t1y; ty++) for (let tx = t0x; tx <= t1x; tx++) this.cutTile(tx, ty);
    }

    for (const e of this.ents) {
      if (e.dead) continue;

      if (e.team === 'enemy' && !e.isShot) {
        // sword
        if (slash && e.lastSlashId !== p.slashId && aabb(slash, e.box())) {
          e.lastSlashId = p.slashId;
          e.hurt(this, SWORD_DMG[st.sword], p.cx, p.cy);
        }
        // contact damage
        if (!e.frozenT && !e.hidden && !e.submerged && e.dmg && aabb(p.box(), e.box())) {
          p.hurt(this, e.dmg, e.cx, e.cy);
        }
        continue;
      }

      if (e instanceof Arrow) {
        for (const en of this.ents) {
          if (e.dead) break;
          if (en.team === 'enemy' && !en.isShot && !en.dead && !en.submerged && aabb(e.box(), en.box())) e.onHitEnemy(this, en);
        }
        // arrows smash pots
        for (const en of this.ents) {
          if (e.dead) break;
          if (en instanceof Pot && !en.dead && aabb(e.box(), en.box())) { en.smash(this); e.dead = true; }
        }
        continue;
      }

      if (e.isShot) {
        if (e.reflected) {
          for (const en of this.enemies()) {
            if (aabb(e.box(), en.box())) { en.hurt(this, e.dmg, e.cx, e.cy); e.dead = true; break; }
          }
          continue;
        }
        // sword can swat projectiles
        if (slash && aabb(slash, e.box())) {
          this.burst(e.cx, e.cy, '#c8ccd4', 4);
          audio.sfx('thud');
          e.dead = true;
          continue;
        }
        if (aabb(e.box(), p.box())) {
          if (p.blocking && st.shield >= 2) {
            const [fx, fy] = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] }[p.facing];
            const dx = e.cx - p.cx, dy = e.cy - p.cy;
            if (fx * dx + fy * dy > 0) {
              audio.sfx('thud');
              p.onBlocked(this);
              if (st.shield >= 3) {
                e.reflected = true; e.vx *= -1.3; e.vy *= -1.3;
                e.dmg = Math.round(e.dmg * SHIELD_REFLECT[clamp(st.shield, 0, 6)]);
              } else e.dead = true;
              continue;
            }
          }
          p.hurt(this, e.dmg, e.cx, e.cy);
          e.dead = true;
        }
        continue;
      }

      // pot smashing with sword
      if (e instanceof Pot && slash && aabb(slash, e.box())) e.smash(this);
    }
  }

  updateEffects(dt) {
    const p = this.player;
    for (const fx of this.effects) {
      fx.r += 150 * dt;
      if (!fx.hit) {
        const d = dist(fx.x, fx.y, p.cx, p.cy);
        if (Math.abs(d - fx.r) < 9) { fx.hit = true; p.hurt(this, fx.dmg, fx.x, fx.y); }
      }
      if (fx.r >= fx.maxR) fx.dead = true;
    }
    this.effects = this.effects.filter(f => !f.dead);
  }
  updateParticles(dt) {
    for (const pa of this.particles) {
      pa.life -= dt;
      pa.x += pa.vx * dt; pa.y += pa.vy * dt;
      pa.vx *= 0.92; pa.vy *= 0.92;
    }
    this.particles = this.particles.filter(pa => pa.life > 0);
  }

  updateSpawners(dt) {
    const p = this.player;
    let active = 0;
    for (const sp of this.area.spawners) if (sp.ent && !sp.ent.dead) active++;
    for (const sp of this.area.spawners) {
      if (sp.ent && sp.ent.dead) { sp.ent = null; sp.cd = 24; }
      if (sp.ent) {
        if (dist(p.cx, p.cy, sp.ent.cx, sp.ent.cy) > 430) { sp.ent.dead = true; sp.ent = null; sp.cd = 2; }
        continue;
      }
      sp.cd -= dt;
      if (sp.cd > 0 || active >= 15) continue;
      const d = dist(p.cx, p.cy, sp.x, sp.y);
      if (d < 270 && d > 130) {
        sp.ent = this.spawnEnemy(sp.type, sp.x, sp.y, {});
        active++;
      }
    }
  }

  updateRegion() {
    const code = this.area.regionAt(Math.floor(this.player.cx / TILE), Math.floor(this.player.cy / TILE));
    if (code !== this.regionCode) {
      this.regionCode = code;
      const name = ui.regionDisplayName(code);
      if (name) this.regionToast = { text: name, t: 0 };
      audio.music(REGION_MUSIC[code] || 'marsh');
    }
  }

  ambient(dt) {
    // region ambience particles near the camera
    if (Math.random() > dt * 14) return;
    const x = this.cam.x + Math.random() * VIEW_W, y = this.cam.y + Math.random() * VIEW_H;
    switch (this.regionCode) {
      case REGION.FIRE: this.addParticle(x, y, '#ff8a3a', 1.2, (Math.random() - 0.5) * 8, -22, 1); break;
      case REGION.EARTH: this.addParticle(x, y, '#7aa04a', 1.6, 10 + Math.random() * 8, 14, 1); break;
      case REGION.AIR: this.addParticle(x, y, '#e8f0ff', 1.1, 26, 6, 1); break;
      case REGION.CONFLUENCE: this.addParticle(x, y, '#8aa8c8', 0.5, -12, 150, 1); break;
    }
  }

  // ------------------------------------------------ camera & slides
  snapCamera() {
    if (this.area.type === 'dungeon' && this.curRoom) {
      this.cam.x = this.curRoom.rx * VIEW_W;
      this.cam.y = this.curRoom.ry * VIEW_H;
    } else {
      this.cam.x = clamp(this.player.cx - VIEW_W / 2, 0, this.area.w * TILE - VIEW_W);
      this.cam.y = clamp(this.player.cy - VIEW_H / 2, 0, this.area.h * TILE - VIEW_H);
    }
  }
  updateCamera(dt) {
    if (this.area.type === 'dungeon') { this.snapCamera(); return; }
    const tx = clamp(this.player.cx - VIEW_W / 2, 0, this.area.w * TILE - VIEW_W);
    const ty = clamp(this.player.cy - VIEW_H / 2, 0, this.area.h * TILE - VIEW_H);
    this.cam.x = lerp(this.cam.x, tx, Math.min(1, dt * 8));
    this.cam.y = lerp(this.cam.y, ty, Math.min(1, dt * 8));
  }
  startSlide(room) {
    this.slide = {
      t: 0,
      fromX: this.curRoom.rx * VIEW_W, fromY: this.curRoom.ry * VIEW_H,
      toX: room.rx * VIEW_W, toY: room.ry * VIEW_H,
      room,
    };
    this.mode = 'roomslide';
  }
  updateSlide(dt) {
    const s = this.slide;
    s.t += dt / 0.45;
    this.cam.x = lerp(s.fromX, s.toX, Math.min(1, s.t));
    this.cam.y = lerp(s.fromY, s.toY, Math.min(1, s.t));
    if (s.t >= 1) {
      const old = this.curRoom;
      this.curRoom = s.room;
      this.visitedRooms.add(s.room.rx + ',' + s.room.ry);
      // clear leftover non-boss enemies from the previous room
      if (old) {
        const ob = this.roomBoundsPx(old);
        for (const e of this.ents) {
          if (e.team === 'enemy' && !e.isBoss && !e.dead &&
              e.cx >= ob.x && e.cx < ob.x + ob.w && e.cy >= ob.y && e.cy < ob.y + ob.h) e.dead = true;
        }
        this.ents = this.ents.filter(e => !e.dead);
      }
      this.slide = null;
      this.mode = 'play';
      // after mode is restored: activateRoom may itself switch mode (boss banner)
      this.activateRoom(s.room);
    }
  }

  // ------------------------------------------------ menu modes
  updateDialog(dt) {
    const d = this.dialog;
    if (!d) { this.mode = 'play'; return; }
    const total = (d.pages[d.page] || []).reduce((a, l) => a + l.length, 0);
    if (!d.done) {
      d.chars += dt * 55;
      if (Math.floor(d.chars) % 4 === 0 && d.chars < total) audio.sfx('blip');
      if (d.chars >= total) { d.chars = total; d.done = true; }
    }
    // tapping anywhere advances the conversation
    if (input.pressed('interact') || input.pressed('sword') || this.taps.length) {
      if (!d.done) { d.chars = total; d.done = true; return; }
      d.page++;
      if (d.page >= d.pages.length) {
        this.dialog = null;
        this.mode = 'play';
        if (d.cb) d.cb();
      } else { d.chars = 0; d.done = false; }
    }
  }
  updateShop() {
    const list = ui.getShopList(this);
    this.shopSel = clamp(this.shopSel, 0, Math.max(0, list.length - 1));
    if (input.pressed('up')) { this.shopSel = Math.max(0, this.shopSel - 1); audio.sfx('blip'); }
    if (input.pressed('down')) { this.shopSel = Math.min(list.length - 1, this.shopSel + 1); audio.sfx('blip'); }
    if (input.pressed('interact') && list[this.shopSel]) this.buyShopItem(list[this.shopSel]);
    for (const t of this.taps) {
      const r = ui.shopRects(this, list);
      if (ui.hitRect(t, r.close)) { this.mode = 'play'; this.save(); return; }
      if (ui.hitRect(t, r.buy) && list[this.shopSel]) { this.buyShopItem(list[this.shopSel]); continue; }
      const row = r.rows.find(rr => ui.hitRect(t, rr));
      if (row) {
        // tapping the highlighted row again buys it, so one finger can browse and purchase
        if (row.idx === this.shopSel) this.buyShopItem(list[this.shopSel]);
        else { this.shopSel = row.idx; audio.sfx('blip'); }
      }
    }
    if (input.pressed('pause') || input.pressed('map')) { this.mode = 'play'; this.save(); }
  }
  updateShrine() {
    const st = this.state;
    const offer = () => {
      if (st.vessels >= VESSEL_COSTS.length) { this.mode = 'play'; return; }
      const cost = VESSEL_COSTS[st.vessels];
      if (st.diamonds >= cost) {
        st.diamonds -= cost;
        st.vessels++;
        st.maxHp = Math.min(PLAYER.maxHearts * 2, st.maxHp + 2);
        st.hp = st.maxHp;
        audio.sfx('heart');
        this.setBanner('+1 HEART VESSEL!', `Gus's health grows to ${st.maxHp / 2} hearts.`, '#ff9aa8');
        this.save();
      } else { audio.sfx('denied'); this.toast('Not enough diamonds...'); }
    };
    if (input.pressed('interact')) offer();
    for (const t of this.taps) {
      const r = ui.shrineRects();
      if (ui.hitRect(t, r.close)) { this.mode = 'play'; return; }
      if (ui.hitRect(t, r.offer)) { offer(); return; }
    }
    if (input.pressed('pause') || input.pressed('map')) this.mode = 'play';
  }
  updatePause() {
    if (this.pausePage === 'controls') {
      if (input.pressed('pause') || input.pressed('interact') || this.taps.length) this.pausePage = null;
      return;
    }
    if (input.pressed('up')) { this.menuSel = (this.menuSel + 3) % 4; audio.sfx('blip'); }
    if (input.pressed('down')) { this.menuSel = (this.menuSel + 1) % 4; audio.sfx('blip'); }
    if (input.pressed('pause')) { this.mode = 'play'; return; }
    for (const t of this.taps) {
      const hit = ui.pauseOptionRects().find(r => ui.hitRect(t, r));
      if (hit) { this.menuSel = hit.i; audio.sfx('blip'); this.activatePauseOption(); return; }
    }
    if (input.pressed('interact')) this.activatePauseOption();
  }
  activatePauseOption() {
    switch (this.menuSel) {
      case 0: this.mode = 'play'; break;
      case 1: this.pausePage = 'controls'; break;
      case 2: this.muted = audio.toggleMute(); break;
      case 3:
        this.save();
        this.mode = 'title';
        this.menuSel = 0;
        audio.music('title');
        break;
    }
  }

  debugKeys() {
    if (!DEBUG) return;
    const st = this.state;
    if (input.pressed('dbgGear')) {
      st.sword = MAX_LEVEL; st.shield = MAX_LEVEL; st.bow = MAX_LEVEL; st.armor = MAX_LEVEL;
      for (const t of ARROW_TYPES) { st.arrows.types[t].owned = true; st.arrows.types[t].level = MAX_LEVEL; }
      st.quiver = MAX_LEVEL;
      st.arrows.cap = AMMO_CAPS[MAX_LEVEL]; st.arrows.ammo = st.arrows.cap;
      st.coins += 2000; st.diamonds += 60;
      this.toast('DEBUG: full gear');
    }
    if (input.pressed('dbgWarp')) {
      const spots = [[100, 112], LM.fireGate, LM.waterGate, LM.airGate, LM.earthGate, [100, 40], LM.nexusGate];
      const [tx, ty] = spots[this.dbgWarp % spots.length];
      this.dbgWarp++;
      if (this.area.type !== 'overworld') this.loadArea('overworld');
      this.player.x = tx * TILE + 2; this.player.y = (ty + 1) * TILE + 4;
      this.snapCamera();
      this.toast('DEBUG: warp ' + this.dbgWarp);
    }
    if (input.pressed('dbgHeal')) { st.hp = st.maxHp; this.toast('DEBUG: healed'); }
    if (input.pressed('dbgRich')) { st.coins += 500; st.diamonds += 50; this.toast('DEBUG: rich'); }
    if (input.pressed('dbgGod')) { st.god = !st.god; this.toast('DEBUG: god ' + (st.god ? 'ON' : 'OFF')); }
  }

  // ------------------------------------------------ draw
  draw() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0a0e12';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    if (this.mode === 'title') { ui.drawTitle(this, ctx); return; }
    if (this.mode === 'files') { ui.drawFiles(this, ctx); return; }
    if (this.mode === 'intro') { ui.drawIntro(this, ctx); return; }
    if (this.mode === 'victory') { ui.drawVictory(this, ctx); return; }
    if (!this.area) return;

    // camera with shake
    let cx = Math.round(this.cam.x), cy = Math.round(this.cam.y);
    if (this.shakeMag > 0) {
      cx += Math.round((Math.random() - 0.5) * 2 * this.shakeMag);
      cy += Math.round((Math.random() - 0.5) * 2 * this.shakeMag);
    }

    ctx.save();
    ctx.translate(-cx, -cy);

    // tiles
    const t0x = Math.max(0, Math.floor(cx / TILE)), t1x = Math.min(this.area.w - 1, Math.ceil((cx + VIEW_W) / TILE));
    const t0y = Math.max(0, Math.floor(cy / TILE)), t1y = Math.min(this.area.h - 1, Math.ceil((cy + VIEW_H) / TILE));
    for (let ty = t0y; ty <= t1y; ty++) {
      for (let tx = t0x; tx <= t1x; tx++) {
        drawTileTo(ctx, this.area.theme, this.area.get(tx, ty), tx * TILE, ty * TILE, this.time);
      }
    }

    // warp runes sit on the ground, so they go under everything
    if (this.warpT > 0 && this.player) this.drawWarpCharge(ctx);

    // entities y-sorted
    const drawList = [...this.ents, this.player].filter(e => e && !e.dead);
    drawList.sort((a, b) => (a.y + a.h) - (b.y + b.h));
    for (const e of drawList) e.draw(this, ctx);

    // effects
    for (const fx of this.effects) {
      ctx.save();
      ctx.globalAlpha = clamp(1 - fx.r / fx.maxR, 0, 1) * 0.8;
      ctx.strokeStyle = '#c8b48a';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(fx.x, fx.y, fx.r, 0, 7); ctx.stroke();
      ctx.restore();
    }

    // particles
    for (const pa of this.particles) {
      ctx.save();
      ctx.globalAlpha = clamp(pa.life / pa.maxLife, 0, 1);
      ctx.fillStyle = pa.color;
      ctx.fillRect(pa.x - pa.size / 2, pa.y - pa.size / 2, pa.size, pa.size);
      ctx.restore();
    }

    ctx.restore();

    // region tint / weather
    this.drawAtmosphere(ctx);
    if (this.warpT > 0) this.drawWarpVignette(ctx);

    // HUD & overlays — full-screen menus own the frame, so the HUD steps aside
    const MENU_MODES = ['shop', 'map', 'pause', 'shrine'];
    if (this.state && !MENU_MODES.includes(this.mode)) ui.drawHUD(this, ctx);
    if (this.mode === 'dialog') ui.drawDialog(this, ctx);
    if (this.mode === 'shop') ui.drawShop(this, ctx);
    if (this.mode === 'shrine') ui.drawShrine(this, ctx);
    if (this.mode === 'map') ui.drawMap(this, ctx);
    if (this.mode === 'pause') ui.drawPause(this, ctx);
    if (this.mode === 'dead') ui.drawDead(this, ctx);
    if (this.mode === 'banner') ui.drawBanner(this, ctx);

    ui.drawTouchControls(this, ctx);
    if (this.portraitHintT > 0) ui.drawPortraitHint(this, ctx);

    if (this.flash > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.flash * 3);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.restore();
    }
  }

  drawAtmosphere(ctx) {
    let tint = null;
    if (this.area.type === 'dungeon') {
      tint = { fire: 'rgba(255,90,30,0.06)', water: 'rgba(40,140,220,0.08)', air: 'rgba(200,220,255,0.05)', earth: 'rgba(90,140,40,0.05)', nexus: 'rgba(140,80,220,0.10)' }[this.area.theme];
    } else {
      switch (this.regionCode) {
        case REGION.FIRE: tint = 'rgba(255,100,40,0.07)'; break;
        case REGION.EARTH: tint = 'rgba(20,60,20,0.10)'; break;
        case REGION.AIR: tint = 'rgba(210,230,255,0.06)'; break;
        case REGION.WATER: tint = 'rgba(60,180,240,0.05)'; break;
        case REGION.CONFLUENCE: tint = 'rgba(30,30,70,0.22)'; break;
      }
    }
    if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, VIEW_W, VIEW_H); }
    // rain in the confluence
    if (this.area.type === 'overworld' && this.regionCode === REGION.CONFLUENCE) {
      ctx.save();
      ctx.strokeStyle = 'rgba(170,200,230,0.30)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 26; i++) {
        const rx = ((i * 67) + this.time * 30 * (1 + i % 3)) % VIEW_W;
        const ry = ((i * 97) + this.time * 300) % VIEW_H;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 2, ry + 7);
      }
      ctx.stroke();
      ctx.restore();
    }
  }
}
