// HUD, title screen, dialogs, shop, shrine, map, pause, banners, death, credits.
import { VIEW_W, VIEW_H, ARROW_TYPES, ARROWS, UPGRADE_TRACKS, CONSUMABLES, MAX_LEVEL,
  ARROW_UP_BASE, ARROW_UP_STEP, ARROW_UP_DESC, VESSEL_COSTS, REGION_NAMES, TELEPORT } from './config.js';
import { clamp } from './util.js';
import { drawSprite } from './pixelart.js';
import { drawText, textWidth } from './font.js';
import { REGION_KEYS } from './worldgen.js';
import { T } from './tiles.js';
import { touch, STICK, PAD_BUTTONS, TOP_BUTTONS } from './touch.js';
import { VERSION } from './version.js';

const ARROW_SHORT = { regular: 'Plain', fire: 'Fire', ice: 'Ice', lightning: 'Bolt', bomb: 'Bomb', light: 'Light' };

// Legacy `size` values map onto integer bitmap-font scales so glyphs stay pixel-crisp.
const scaleFor = (size) => size <= 11 ? 1 : size <= 18 ? 2 : size <= 30 ? 3 : 4;

function text(ctx, str, x, y, { size = 8, color = '#f0ead8', align = 'left', shadow = true, alpha = 1 } = {}) {
  drawText(ctx, str, x, y, { scale: scaleFor(size), color, align, shadow, alpha });
}
export { text };

function panel(ctx, x, y, w, h, alpha = 0.86) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#101418';
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#c8b48a';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  ctx.restore();
}

// ---------------------------------------------------------------- HUD
export function drawHUD(g, ctx) {
  const st = g.state;
  // hearts
  const hearts = st.maxHp / 2;
  for (let i = 0; i < hearts; i++) {
    const hx = 6 + (i % 10) * 9, hy = 6 + Math.floor(i / 10) * 8;
    ctx.save();
    ctx.globalAlpha = 0.28;
    drawSprite(ctx, 'heart', hx + 3, hy + 6);
    ctx.restore();
    const hpHere = st.hp - i * 2;
    if (hpHere >= 2) drawSprite(ctx, 'heart', hx + 3, hy + 6);
    else if (hpHere === 1) {
      ctx.save();
      // heart sprite is 7px wide starting at hx-1; clip to its left half
      ctx.beginPath(); ctx.rect(hx - 1, hy - 1, 3.5, 8); ctx.clip();
      drawSprite(ctx, 'heart', hx + 3, hy + 6);
      ctx.restore();
    }
  }
  // coins & diamonds — laid out left to right so big counts can't collide
  const row2 = 6 + Math.ceil(hearts / 10) * 8 + 2;
  drawSprite(ctx, 'coin', 10, row2 + 7);
  text(ctx, String(st.coins), 17, row2, { color: '#f0c83a' });
  const dx = 17 + textWidth(String(st.coins), 1) + 11;
  drawSprite(ctx, 'diamond', dx, row2 + 7);
  text(ctx, String(st.diamonds), dx + 7, row2, { color: '#7ae0f0' });
  // shards
  if (st.shards > 0 && !st.flags.nexus_done) {
    const sx = dx + 7 + textWidth(String(st.diamonds), 1) + 12;
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.globalAlpha = i < st.shards ? 1 : 0.13;
      drawSprite(ctx, 'shard', sx + i * 8, row2 + 8);
      ctx.restore();
    }
  }
  // arrow selector
  if (st.bow > 0) {
    const info = ARROWS[st.arrowSel];
    const owned = st.arrows.types[st.arrowSel];
    panel(ctx, VIEW_W - 74, 4, 70, 24, 0.6);
    // Axis-aligned arrow on the top row: a rotated one both blurs and reaches
    // diagonally down into the name text below.
    const ix = VIEW_W - 71, iy = 11;
    ctx.fillStyle = '#8a6a3a'; ctx.fillRect(ix + 2, iy - 1, 7, 2);   // shaft
    ctx.fillStyle = info.color; ctx.fillRect(ix + 8, iy - 2, 3, 4);  // head
    ctx.fillStyle = '#c8ccd4';                                       // fletching
    ctx.fillRect(ix, iy - 3, 2, 2);
    ctx.fillRect(ix, iy + 1, 2, 2);
    text(ctx, `x${st.arrows.ammo}`, VIEW_W - 56, 7, { size: 8 });
    // short labels keep the widest name inside the panel at the bitmap font's 6px advance
    text(ctx, ARROW_SHORT[st.arrowSel] + ' L' + (owned ? owned.level : 1), VIEW_W - 70, 17, { size: 7, color: info.color });
    text(ctx, 'Q/R', VIEW_W - 72, 30, { size: 7, alpha: 0.7 });
  }
  // dungeon keys
  if (g.area.type === 'dungeon') {
    const keys = st.keys[g.area.id] || 0;
    let kx = VIEW_W - 70;
    for (let i = 0; i < keys; i++) { drawSprite(ctx, 'key', kx, 46); kx += 10; }
    if (st.fangs[g.area.id]) drawSprite(ctx, 'bigfang', VIEW_W - 14, 48);
  }
  // boss bar
  if (g.bossActive && !g.bossActive.dead) {
    const b = g.bossActive;
    const w = 180;
    panel(ctx, VIEW_W / 2 - w / 2 - 4, VIEW_H - 26, w + 8, 20, 0.7);
    text(ctx, b.name.toUpperCase(), VIEW_W / 2, VIEW_H - 24, { size: 7, align: 'center', color: '#ff9aa8' });
    ctx.fillStyle = '#3a0a12';
    ctx.fillRect(VIEW_W / 2 - w / 2, VIEW_H - 14, w, 5);
    ctx.fillStyle = '#e04a5a';
    ctx.fillRect(VIEW_W / 2 - w / 2, VIEW_H - 14, w * clamp(b.hp / b.maxHp, 0, 1), 5);
  }
  if (g.arena) drawArenaHUD(g, ctx);
  drawToasts(g, ctx);
  drawRegionToast(g, ctx);
  if (g.state.god) text(ctx, 'GOD', VIEW_W - 30, VIEW_H - 12, { color: '#f0c83a', size: 7 });
}

// Wave counter / countdown for the Crucible. Sits top-centre, clear of the touch buttons.
function drawArenaHUD(g, ctx) {
  const A = g.arena;
  const cx = VIEW_W / 2;
  if (A.phase === 'idle') {
    text(ctx, 'RING THE GONG TO BEGIN', cx, 34, { size: 8, align: 'center', color: '#f0c83a' });
    const best = g.state.arenaBest || 0;
    if (best) text(ctx, `Best: wave ${best}`, cx, 46, { size: 7, align: 'center', alpha: 0.85 });
    return;
  }
  text(ctx, 'WAVE ' + A.wave, cx, 32, { size: 12, align: 'center', color: '#f0c83a' });
  if (A.phase === 'countdown') {
    text(ctx, 'GET READY', cx, 50, { size: 8, align: 'center',
      alpha: 0.5 + 0.5 * Math.sin(g.time * 10), color: '#ff9aa8' });
  } else if (A.phase === 'fight') {
    const left = g.enemies().length + A.pending.length;
    text(ctx, left + (left === 1 ? ' enemy left' : ' enemies left'), cx, 50,
      { size: 8, align: 'center', color: '#e8e0d0' });
  } else if (A.phase === 'breather') {
    text(ctx, 'Next wave in ' + Math.max(1, Math.ceil(A.t)), cx, 50, { size: 8, align: 'center', color: '#a8d8c0' });
    text(ctx, 'Gong to rush it  ·  stairs to cash out', cx, 62, { size: 7, align: 'center', alpha: 0.8 });
  }
}

function drawToasts(g, ctx) {
  let y = VIEW_H - 34;
  for (const t of g.toasts.slice(0, 3)) {
    const w = textWidth(t.text, 1) + 14;
    ctx.save();
    ctx.globalAlpha = Math.min(1, t.t * 2) * 0.85;
    ctx.fillStyle = '#101418';
    ctx.fillRect(VIEW_W / 2 - w / 2, y, w, 12);
    ctx.restore();
    text(ctx, t.text, VIEW_W / 2, y + 2, { size: 8, align: 'center', alpha: Math.min(1, t.t * 2) });
    y -= 14;
  }
}

function drawRegionToast(g, ctx) {
  if (!g.regionToast) return;
  const rt = g.regionToast;
  const a = clamp(Math.min(rt.t, 3 - rt.t) * 1.4, 0, 1);
  text(ctx, rt.text, VIEW_W / 2, 34, { size: 12, align: 'center', color: '#fff6c8', alpha: a });
}

// ---------------------------------------------------------------- TITLE
export function drawTitle(g, ctx) {
  // sky
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  grad.addColorStop(0, '#12283e');
  grad.addColorStop(0.6, '#2a5a74');
  grad.addColorStop(1, '#3f7a5a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // stars
  for (let i = 0; i < 40; i++) {
    const sx = (i * 97) % VIEW_W, sy = (i * 41) % 110;
    ctx.globalAlpha = 0.3 + 0.3 * Math.sin(g.time * 2 + i);
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx, sy, 1, 1);
  }
  ctx.globalAlpha = 1;
  // ground strip
  ctx.fillStyle = '#2c4a34';
  ctx.fillRect(0, VIEW_H - 44, VIEW_W, 44);
  ctx.fillStyle = '#1e3626';
  ctx.fillRect(0, VIEW_H - 44, VIEW_W, 3);

  text(ctx, 'PLATYPUS', VIEW_W / 2, 34, { size: 34, align: 'center', color: '#f0c83a' });
  text(ctx, 'ADVENTURES', VIEW_W / 2, 66, { size: 26, align: 'center', color: '#f0ead8' });
  text(ctx, '~ The Legend of Gus ~', VIEW_W / 2, 94, { size: 9, align: 'center', color: '#a8d8c0' });

  // big Gus, standing on the grass line below the menu
  ctx.save();
  ctx.translate(VIEW_W / 2, VIEW_H - 44 + Math.sin(g.time * 2.4) * 2);
  ctx.scale(3, 3);
  drawSprite(ctx, 'gus_idle', 0, 0, { flip: Math.sin(g.time * 0.7) < 0 });
  ctx.restore();

  text(ctx, touch.enabled ? '- TAP TO START -' : '- PRESS E TO START -', VIEW_W / 2, 114,
    { size: 9, align: 'center', color: '#f0c83a', alpha: 0.6 + 0.4 * Math.sin(g.time * 3.5) });
  // build stamp: lets anyone confirm at a glance which version a device is running
  text(ctx, 'v' + VERSION, VIEW_W - 4, 4, { size: 7, align: 'right', alpha: 0.55 });
  if (touch.enabled) {
    text(ctx, 'Drag the left side to move', VIEW_W / 2, VIEW_H - 22, { size: 7, align: 'center', alpha: 0.85 });
    text(ctx, 'Buttons on the right to fight', VIEW_W / 2, VIEW_H - 13, { size: 7, align: 'center', alpha: 0.85 });
  } else {
    text(ctx, 'Move: WASD/Arrows   Sword: SPACE/J   Bow: K   Shield: L/Shift', VIEW_W / 2, VIEW_H - 22, { size: 7, align: 'center', alpha: 0.85 });
    text(ctx, 'Interact: E   Swap arrows: Q/R   Map: M   Pause: Esc', VIEW_W / 2, VIEW_H - 13, { size: 7, align: 'center', alpha: 0.85 });
  }
}

// ---------------------------------------------------------------- FILE SELECT
// Each card is a full loadout at a glance: Gus wearing his armor, gear levels,
// every arrow type he owns, purse, hearts and quest progress.
const DUNGEON_PIPS = [
  ['fire', '#ff7a30'], ['water', '#7ad4ff'], ['air', '#e8f0ff'], ['earth', '#a8d84a'],
];

function drawFileCard(g, ctx, r, st, selected) {
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = selected ? '#1d2732' : '#141920';
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.restore();
  ctx.strokeStyle = selected ? '#f0c83a' : '#454d58';
  ctx.lineWidth = 1;
  ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);

  const label = 'FILE ' + (r.i + 1);
  const labelCol = selected ? '#f0c83a' : '#f0ead8';

  if (!st) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.translate(r.x + 26, r.y + 50);
    ctx.scale(2, 2);
    drawSprite(ctx, 'gus_idle', 0, 0, {});
    ctx.restore();
    text(ctx, label, r.x + 48, r.y + 12, { size: 8, color: labelCol });
    text(ctx, 'Empty - start a new adventure', r.x + 48, r.y + 28, { size: 8, color: '#6f7884' });
    return;
  }

  // Gus wearing whatever armor this file has
  ctx.save();
  ctx.translate(r.x + 26, r.y + 51);
  ctx.scale(2, 2);
  drawSprite(ctx, 'gus_idle', 0, 0, {});
  if (st.armor > 0) drawSprite(ctx, 'armor' + st.armor, 0, 0, {});
  ctx.restore();

  // ---- row 1: name, hearts, purse
  text(ctx, label, r.x + 48, r.y + 5, { size: 8, color: labelCol });
  const hearts = Math.round((st.maxHp || 6) / 2);
  drawSprite(ctx, 'heart', r.x + 96, r.y + 12);
  text(ctx, 'x' + hearts, r.x + 102, r.y + 5, { size: 8, color: '#ff9aa8' });
  drawSprite(ctx, 'coin', r.x + 142, r.y + 12);
  text(ctx, String(st.coins || 0), r.x + 149, r.y + 5, { size: 8, color: '#f0c83a' });
  drawSprite(ctx, 'diamond', r.x + 206, r.y + 12);
  text(ctx, String(st.diamonds || 0), r.x + 214, r.y + 5, { size: 8, color: '#7ae0f0' });

  // key shards earned
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.globalAlpha = i < (st.shards || 0) ? 1 : 0.16;
    drawSprite(ctx, 'shard', r.x + 268 + i * 9, r.y + 14);
    ctx.restore();
  }
  // sits on the gear row, clear of the erase button in the top-right corner
  if (st.flags && st.flags.nexus_done) text(ctx, 'CLEARED', r.x + 296, r.y + 21, { size: 7, color: '#c88aff' });

  // ---- row 2: gear levels
  let gx = r.x + 48;
  for (const [name, lv] of [['Sword', st.sword], ['Shield', st.shield], ['Bow', st.bow], ['Armor', st.armor]]) {
    const on = (lv || 0) > 0;
    text(ctx, name + ' ' + (on ? 'L' + lv : '-'), gx, r.y + 21, { size: 7, color: on ? '#d8e0c8' : '#5a626c' });
    gx += textWidth(name + ' L0', 1) + 12;
  }

  // ---- row 3: arrow types owned, with levels, plus ammo and dungeons cleared
  let ax = r.x + 48;
  for (const t of ARROW_TYPES) {
    const o = st.arrows && st.arrows.types && st.arrows.types[t];
    const owned = !!(o && o.owned);
    ctx.save();
    ctx.globalAlpha = owned ? 1 : 0.16;
    ctx.fillStyle = ARROWS[t].color;
    ctx.fillRect(ax, r.y + 35, 6, 6);
    ctx.restore();
    if (owned && o.level > 1) {
      text(ctx, String(o.level), ax + 7, r.y + 35, { size: 7, color: '#d8e0c8', shadow: false });
      ax += 15;
    } else ax += 10;
  }
  if (st.bow > 0) text(ctx, 'x' + (st.arrows ? st.arrows.ammo || 0 : 0), ax + 4, r.y + 35, { size: 7, color: '#c8b48a' });

  // dungeons cleared
  const done = st.dungeonsDone || {};
  DUNGEON_PIPS.forEach(([id, col], i) => {
    ctx.save();
    ctx.globalAlpha = done[id] ? 1 : 0.16;
    ctx.fillStyle = col;
    ctx.fillRect(r.x + 268 + i * 9, r.y + 35, 7, 7);
    ctx.restore();
  });

  // erase affordance
  const er = fileEraseRects()[r.i];
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = '#a05a5a';
  ctx.strokeRect(er.x + 0.5, er.y + 0.5, er.w - 1, er.h - 1);
  ctx.restore();
  text(ctx, 'X', er.x + er.w / 2, er.y + 5, { size: 8, align: 'center', color: '#e0a0a0' });
}

export function drawFiles(g, ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  grad.addColorStop(0, '#101c2c');
  grad.addColorStop(1, '#20303a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  text(ctx, 'SELECT A FILE', VIEW_W / 2, 12, { size: 12, align: 'center', color: '#f0c83a' });
  fileCardRects().forEach(r => drawFileCard(g, ctx, r, g.slots[r.i], g.menuSel === r.i));

  const hint = touch.enabled
    ? 'Tap a file to pick it, tap again to play   ·   X erases'
    : 'W/S: choose   E: play   Q: erase   Esc: back';
  text(ctx, hint, VIEW_W / 2, VIEW_H - 12, { size: 7, align: 'center', alpha: 0.85 });

  if (g.fileErase !== null) {
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#080b0e';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.restore();
    panel(ctx, 96, 92, VIEW_W - 192, 84);
    text(ctx, 'ERASE FILE ' + (g.fileErase + 1) + '?', VIEW_W / 2, 102, { size: 10, align: 'center', color: '#e04a5a' });
    text(ctx, 'This cannot be undone.', VIEW_W / 2, 120, { size: 8, align: 'center' });
    const r = eraseConfirmRects();
    drawTapButton(ctx, r.yes, 'ERASE', '#e04a5a');
    drawTapButton(ctx, r.no, 'KEEP', '#a8d8c0');
    if (!touch.enabled) text(ctx, 'E: erase   Esc: keep', VIEW_W / 2, 168, { size: 7, align: 'center', alpha: 0.8 });
  }
}

// ---------------------------------------------------------------- INTRO
export const INTRO_PAGES = [
  'Long ago, the rivers of BILLABONG VALE\nflowed bright with the River\'s Light,\nand platypus folk fished in peace.',
  'Then the ELEMENTAL FANGS rose --\nancient predators twisted by shattered\nrelics of Fire, Water, Air and Earth.\n\nThey seized the four Key Shards and\nsealed the sacred Confluence.',
  'Now the last River Guardian must take\nup his father\'s rusty sword...\n\nA platypus named GUS.',
];
export function drawIntro(g, ctx) {
  ctx.fillStyle = '#0a0e12';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const page = INTRO_PAGES[g.introPage] || '';
  const lines = page.split('\n');
  lines.forEach((l, i) => text(ctx, l, VIEW_W / 2, 60 + i * 13, { size: 9, align: 'center', color: '#d8e0e8' }));
  text(ctx, touch.enabled ? '- TAP -' : '- E -', VIEW_W / 2, VIEW_H - 30, { size: 8, align: 'center', alpha: 0.6 + 0.4 * Math.sin(g.time * 4) });
}

// ---------------------------------------------------------------- DIALOG
export function drawDialog(g, ctx) {
  const d = g.dialog;
  if (!d) return;
  const h = 58;
  panel(ctx, 8, VIEW_H - h - 6, VIEW_W - 16, h);
  if (d.name) {
    ctx.fillStyle = '#c8b48a';
    ctx.fillRect(16, VIEW_H - h - 11, d.name.length * 6 + 10, 11);
    text(ctx, d.name, 21, VIEW_H - h - 9, { size: 8, color: '#101418', shadow: false });
  }
  const lines = d.pages[d.page] || [];
  let shown = d.chars;
  lines.forEach((l, i) => {
    const take = clamp(Math.floor(shown), 0, l.length);
    shown -= l.length;
    text(ctx, l.slice(0, take), 18, VIEW_H - h + 4 + i * 12, { size: 9 });
  });
  if (d.done) text(ctx, 'E', VIEW_W - 24, VIEW_H - 16, { size: 8, alpha: 0.6 + 0.4 * Math.sin(g.time * 5), color: '#f0c83a' });
}

// ---------------------------------------------------------------- SHOP
// Only the next step of each track is ever offered, so the list stays short.
// Ids are `track:level` / `arrow:type:level`, parsed back out by buyShopItem.
export const arrowUpPrice = (type, lv) => Math.round(ARROW_UP_BASE[type] * ARROW_UP_STEP[lv]);

export function getShopList(g) {
  const st = g.state;
  const out = [];
  for (const tr of UPGRADE_TRACKS) {
    const cur = tr.key === 'quiver' ? (st.quiver || 0) : st[tr.key];
    if (cur < tr.start) continue;                    // gear not owned yet
    if (tr.key === 'quiver' && !st.bow) continue;    // no quiver before a bow
    const next = tr.steps.find(s => s.lv === cur + 1);
    if (!next) continue;                             // maxed
    out.push({
      id: `${tr.key}:${next.lv}`, label: next.name, price: next.price,
      desc: `${next.desc} (Lv ${next.lv} of ${MAX_LEVEL})`,
    });
  }
  // one arrow upgrade per owned type
  for (const type of ARROW_TYPES) {
    const o = st.arrows.types[type];
    if (!o || !o.owned || o.level >= MAX_LEVEL) continue;
    const lv = o.level + 1;
    out.push({
      id: `arrow:${type}:${lv}`,
      label: `${ARROWS[type].name.replace(' Arrows', '')} Lv${lv}`,
      price: arrowUpPrice(type, lv),
      desc: `${ARROW_UP_DESC[type]} (Lv ${lv} of ${MAX_LEVEL})`,
    });
  }
  for (const c of CONSUMABLES) {
    if (c.id === 'ammo' && !st.bow) continue;
    out.push(c);
  }
  return out;
}

export function drawShop(g, ctx) {
  const list = getShopList(g);
  panel(ctx, 12, 12, VIEW_W - 24, VIEW_H - 24);
  text(ctx, "WOMBEAU'S TRADING POST", VIEW_W / 2, 18, { size: 10, align: 'center', color: '#f0c83a' });
  drawSprite(ctx, 'coin', 30, 40);
  text(ctx, String(g.state.coins), 38, 33, { size: 9, color: '#f0c83a' });
  drawSprite(ctx, 'wombat', VIEW_W - 40, 52);

  const startY = 48, rowH = 13, maxRows = 10;
  g.shopScroll = clamp(g.shopScroll, Math.max(0, g.shopSel - maxRows + 1), Math.min(g.shopSel, Math.max(0, list.length - 1)));
  const first = g.shopScroll;
  list.slice(first, first + maxRows).forEach((item, i) => {
    const idx = first + i;
    const sel = idx === g.shopSel;
    const afford = g.state.coins >= item.price;
    if (sel) { ctx.fillStyle = 'rgba(240,200,58,0.16)'; ctx.fillRect(20, startY + i * rowH - 1, 236, rowH); }
    text(ctx, (sel ? '>' : ' ') + item.label, 22, startY + i * rowH, { size: 8, color: sel ? '#f0c83a' : afford ? '#f0ead8' : '#8a8278' });
    text(ctx, String(item.price), 252, startY + i * rowH, { size: 8, align: 'right', color: afford ? '#f0c83a' : '#a05a4a' });
  });
  if (list.length === 0) text(ctx, 'All sold out! You have everything.', VIEW_W / 2, 100, { size: 9, align: 'center' });
  const cur = list[g.shopSel];
  if (cur) {
    // description sits in its own column right of the prices
    const descLines = cur.desc.match(/.{1,19}(\s|$)/g) || [cur.desc];
    descLines.forEach((l, i) => text(ctx, l.trim(), 264, 80 + i * 10, { size: 7, color: '#a8d8c0' }));
  }
  if (touch.enabled) {
    const r = shopRects(g, list);
    if (cur) drawTapButton(ctx, r.buy, 'BUY');
    drawTapButton(ctx, r.close, 'X', '#e0a0a0');
    text(ctx, 'Tap an item, then BUY', VIEW_W / 2, VIEW_H - 24, { size: 7, align: 'center', alpha: 0.8 });
  } else {
    text(ctx, 'E: buy   Esc: leave', VIEW_W / 2, VIEW_H - 24, { size: 7, align: 'center', alpha: 0.8 });
  }
}

// ---------------------------------------------------------------- SHRINE
export function drawShrine(g, ctx) {
  const st = g.state;
  panel(ctx, 70, 56, VIEW_W - 140, 120);
  text(ctx, 'DIAMOND SHRINE', VIEW_W / 2, 64, { size: 10, align: 'center', color: '#7ae0f0' });
  drawSprite(ctx, 'shrine', VIEW_W / 2, 104);
  if (st.vessels >= VESSEL_COSTS.length) {
    text(ctx, 'The shrine has given all it can.', VIEW_W / 2, 112, { size: 8, align: 'center' });
    text(ctx, 'The last hearts lie in the dungeons.', VIEW_W / 2, 124, { size: 7, align: 'center', color: '#a8d8c0' });
    if (touch.enabled) drawTapButton(ctx, shrineRects().close, 'X', '#e0a0a0');
  } else {
    const cost = VESSEL_COSTS[st.vessels];
    text(ctx, `Offer ${cost} diamonds for +1 heart?`, VIEW_W / 2, 112, { size: 8, align: 'center' });
    text(ctx, `(You carry ${st.diamonds})  ·  ${VESSEL_COSTS.length - st.vessels} left here`,
      VIEW_W / 2, 124, { size: 7, align: 'center', color: '#7ae0f0' });
    if (touch.enabled) {
      const r = shrineRects();
      drawTapButton(ctx, r.offer, 'OFFER', '#7ae0f0');
      drawTapButton(ctx, r.close, 'X', '#e0a0a0');
    } else {
      text(ctx, 'E: offer   Esc: not today', VIEW_W / 2, 148, { size: 7, align: 'center', alpha: 0.8 });
    }
  }
}

// ---------------------------------------------------------------- MAP
const MAP_COLORS = {};
function tileMapColor(id) {
  if (id in MAP_COLORS) return MAP_COLORS[id];
  let c = '#4f8f3c';
  if ([T.SHALLOW, T.DEEP, T.REED].includes(id)) c = '#2a6aa8';
  else if (id === T.LAVA) c = '#e05a1e';
  else if ([T.SAND, T.PALM].includes(id)) c = '#e0cc8a';
  else if ([T.ASH, T.BASALT, T.CRACKROCK].includes(id)) c = '#6a5a52';
  else if ([T.PATH, T.BRIDGE].includes(id)) c = '#c2a86c';
  else if ([T.TREE, T.TALLGRASS].includes(id)) c = '#3a7a30';
  else if ([T.PINE, T.DARKGRASS, T.MUD, T.CRYSTAL, T.THORNS].includes(id)) c = '#2c5824';
  else if ([T.CLIFF, T.ROCK, T.MESA].includes(id)) c = '#7a6a58';
  else if ([T.STORMGRASS, T.STORMROCK, T.DEADTREE].includes(id)) c = '#3c5244';
  else if ([T.FENCE, T.WALL, T.ROOF].includes(id)) c = '#a8503a';
  MAP_COLORS[id] = c;
  return c;
}

export function buildMinimap(area) {
  const c = document.createElement('canvas');
  c.width = area.w / 2; c.height = area.h / 2;
  const g2 = c.getContext('2d');
  for (let y = 0; y < area.h; y += 2) {
    for (let x = 0; x < area.w; x += 2) {
      g2.fillStyle = tileMapColor(area.get(x, y));
      g2.fillRect(x / 2, y / 2, 1, 1);
    }
  }
  return c;
}

export function drawMap(g, ctx) {
  panel(ctx, 8, 8, VIEW_W - 16, VIEW_H - 16, 0.94);
  if (g.area.type === 'overworld' && g.minimap) {
    const mx = 24, my = 28, scale = 1.85;
    text(ctx, 'BILLABONG VALE', mx + 92, 14, { size: 9, align: 'center', color: '#f0c83a' });
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(g.minimap, mx, my, 100 * scale, 100 * scale);
    ctx.restore();
    const pt = (tx, ty) => [mx + tx / 2 * scale, my + ty / 2 * scale];
    const marks = [
      [100, 110, '#f0c83a', 'Village'],
      [172, 26, g.state.dungeonsDone.fire ? '#8a8278' : '#ff7a30', 'Fire'],
      [168, 176, g.state.dungeonsDone.water ? '#8a8278' : '#7ad4ff', 'Water'],
      [26, 24, g.state.dungeonsDone.air ? '#8a8278' : '#e8f0ff', 'Air'],
      [30, 172, g.state.dungeonsDone.earth ? '#8a8278' : '#a8d84a', 'Earth'],
      [100, 14, g.state.flags.nexus_done ? '#8a8278' : '#c88aff', 'Nexus'],
    ];
    for (const [tx, ty, color] of marks) {
      const [px, py] = pt(tx, ty);
      ctx.fillStyle = color;
      ctx.fillRect(px - 2, py - 2, 5, 5);
      ctx.strokeStyle = '#101418';
      ctx.strokeRect(px - 2.5, py - 2.5, 6, 6);
    }
    if (Math.floor(g.time * 3) % 2 === 0) {
      const [px, py] = pt(g.player.cx / 16, g.player.cy / 16);
      ctx.fillStyle = '#fff';
      ctx.fillRect(px - 1.5, py - 1.5, 4, 4);
    }
    // legend
    const lx = mx + 100 * scale + 14;
    text(ctx, 'QUEST', lx, 30, { size: 8, color: '#f0c83a' });
    const q = [
      ['Fire Shard', g.state.dungeonsDone.fire], ['Water Shard', g.state.dungeonsDone.water],
      ['Air Shard', g.state.dungeonsDone.air], ['Earth Shard', g.state.dungeonsDone.earth],
      ['Open the Gate', g.state.flags.gate_open], ['Defeat Apexus', g.state.flags.nexus_done],
    ];
    q.forEach(([label, done], i) => {
      text(ctx, (done ? '[x] ' : '[ ] ') + label, lx, 44 + i * 12, { size: 7, color: done ? '#8a8278' : '#f0ead8' });
    });
  } else if (g.area.isArena) {
    text(ctx, 'THE CRUCIBLE', VIEW_W / 2, 20, { size: 12, align: 'center', color: '#f0c83a' });
    const A = g.arena || { wave: 0 };
    const rows = [
      ['Current wave', String(A.wave || '-')],
      ['Your best', String(g.state.arenaBest || 0)],
      ['Coins next clear', String(15 + (A.wave + 1) * 8)],
      ['Diamonds', 'every 5th wave'],
    ];
    rows.forEach(([a, b], i) => {
      text(ctx, a, 110, 60 + i * 16, { size: 8, color: '#a8d8c0' });
      text(ctx, b, 240, 60 + i * 16, { size: 8 });
    });
    text(ctx, 'Take the stairs to keep your winnings.', VIEW_W / 2, 140, { size: 7, align: 'center', alpha: 0.85 });
  } else if (g.area.type === 'dungeon') {
    text(ctx, g.area.name.toUpperCase(), VIEW_W / 2, 16, { size: 10, align: 'center', color: '#f0c83a' });
    const keys = Object.keys(g.area.rooms);
    const rxs = keys.map(k => Number(k.split(',')[0])), rys = keys.map(k => Number(k.split(',')[1]));
    const minx = Math.min(...rxs), miny = Math.min(...rys);
    const cell = 34;
    const ox = VIEW_W / 2 - (Math.max(...rxs) - minx + 1) * cell / 2, oy = 44;
    for (const k of keys) {
      const [rx, ry] = k.split(',').map(Number);
      const room = g.area.rooms[k];
      const visited = g.visitedRooms.has(k);
      const x = ox + (rx - minx) * cell, y = oy + (ry - miny) * cell;
      ctx.fillStyle = visited ? '#3a4a5a' : '#1a2028';
      ctx.fillRect(x, y, cell - 3, cell - 3);
      ctx.strokeStyle = '#c8b48a55';
      ctx.strokeRect(x + 0.5, y + 0.5, cell - 4, cell - 4);
      if (k === g.area.bossRoom && (visited || g.state.fangs[g.area.id]))
        text(ctx, 'B', x + cell / 2 - 2, y + cell / 2 - 6, { size: 9, color: '#e04a5a' });
      if (g.curRoom && room === g.curRoom && Math.floor(g.time * 3) % 2 === 0) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + cell / 2 - 4, y + cell / 2 - 4, 5, 5);
      }
    }
    text(ctx, `Small keys: ${g.state.keys[g.area.id] || 0}   Big Fang: ${g.state.fangs[g.area.id] ? 'yes' : 'no'}`, VIEW_W / 2, VIEW_H - 36, { size: 8, align: 'center' });
  }
  if (touch.enabled) {
    drawTapButton(ctx, CLOSE_BTN, 'X', '#e0a0a0');
    text(ctx, 'Tap anywhere to close', VIEW_W / 2, VIEW_H - 22, { size: 7, align: 'center', alpha: 0.8 });
  } else {
    text(ctx, 'M / Esc: close', VIEW_W / 2, VIEW_H - 22, { size: 7, align: 'center', alpha: 0.8 });
  }
}

// ---------------------------------------------------------------- PAUSE
export function drawPause(g, ctx) {
  panel(ctx, 96, 44, VIEW_W - 192, 150);
  text(ctx, 'PAUSED', VIEW_W / 2, 52, { size: 12, align: 'center', color: '#f0c83a' });
  if (g.pausePage === 'controls') {
    const rows = [
      ['Move', 'WASD / Arrows'], ['Sword', 'Space / J / Z'], ['Bow', 'K / X'],
      ['Shield (hold)', 'L / C / Shift'], ['Swap arrow', 'Q / R or 1-6'],
      ['Interact', 'E / Enter'], ['Warp home', 'T / H (hold)'],
      ['Map', 'M'], ['Mute', 'O'],
    ];
    rows.forEach(([a, b], i) => {
      text(ctx, a, 110, 72 + i * 12, { size: 7, color: '#a8d8c0' });
      text(ctx, b, 196, 72 + i * 12, { size: 7 });
    });
    text(ctx, 'Esc: back', VIEW_W / 2, 180, { size: 7, align: 'center', alpha: 0.8 });
    return;
  }
  const opts = ['Resume', 'Controls', `Sound: ${g.muted ? 'OFF' : 'ON'}`, 'Save & Quit'];
  opts.forEach((o, i) => {
    const sel = g.menuSel === i;
    text(ctx, (sel ? '> ' : '  ') + o, VIEW_W / 2 - 40, 80 + i * 16, { size: 9, color: sel ? '#f0c83a' : '#f0ead8' });
  });
}

// ---------------------------------------------------------------- TOUCH CONTROLS
// Circles are rasterized span-by-span instead of via arc(), so edges stay hard when the
// 400x240 view is scaled up — same reason the font is a bitmap.
function pixelDisc(ctx, cx, cy, r) {
  cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
  for (let dy = -r; dy <= r; dy++) {
    const dx = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy)));
    ctx.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1);
  }
}
function pixelRing(ctx, cx, cy, r, thick) {
  cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
  const ri = Math.max(0, r - thick);
  for (let dy = -r; dy <= r; dy++) {
    const ox = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy)));
    if (Math.abs(dy) <= ri) {
      const ix = Math.floor(Math.sqrt(Math.max(0, ri * ri - dy * dy)));
      ctx.fillRect(cx - ox, cy + dy, ox - ix, 1);
      ctx.fillRect(cx + ix + 1, cy + dy, ox - ix, 1);
    } else {
      ctx.fillRect(cx - ox, cy + dy, ox * 2 + 1, 1);
    }
  }
}

function buttonIcon(ctx, icon, cx, cy, color) {
  cx = Math.round(cx); cy = Math.round(cy);
  ctx.fillStyle = color;
  switch (icon) {
    case 'sword':                                   // blade on the diagonal, hilt lower-left
      for (let i = 0; i < 9; i++) ctx.fillRect(cx - 5 + i, cy + 3 - i, 2, 2);
      ctx.fillRect(cx - 8, cy + 1, 6, 2);           // crossguard
      ctx.fillRect(cx - 8, cy + 4, 3, 2);           // grip
      break;
    case 'bow': {                                   // limb bows toward the target, arrow nocked
      for (let i = -6; i <= 6; i++) {
        const bulge = Math.round((1 - Math.abs(i) / 6) * 3);
        ctx.fillRect(cx + 1 + bulge, cy + i, 2, 1);
      }
      ctx.fillRect(cx - 2, cy - 6, 1, 13);          // string
      ctx.fillRect(cx - 5, cy - 1, 9, 2);           // shaft
      ctx.fillRect(cx + 4, cy - 2, 2, 4);           // head
      break;
    }
    case 'shield':                                  // tapered heater shield
      ctx.fillRect(cx - 5, cy - 6, 11, 6);
      ctx.fillRect(cx - 4, cy, 9, 2);
      ctx.fillRect(cx - 3, cy + 2, 7, 2);
      ctx.fillRect(cx - 2, cy + 4, 5, 1);
      ctx.fillRect(cx - 1, cy + 5, 3, 1);
      break;
    case 'arrow':                                   // fletched arrow, tinted per type
      ctx.fillRect(cx - 6, cy - 1, 9, 2);
      ctx.fillRect(cx + 3, cy - 3, 2, 6);
      ctx.fillRect(cx + 5, cy - 1, 2, 2);
      ctx.fillRect(cx - 6, cy - 3, 2, 2);
      ctx.fillRect(cx - 6, cy + 2, 2, 2);
      break;
    case 'pause':
      ctx.fillRect(cx - 4, cy - 5, 3, 10);
      ctx.fillRect(cx + 1, cy - 5, 3, 10);
      break;
    case 'warp':                                    // portal: broken rings around a core
      for (const [rr, phase] of [[6, 0], [3, 0.45]]) {
        for (let i = 0; i < 8; i++) {
          if (i % 2) continue;
          const a = (i / 8) * Math.PI * 2 + phase;
          ctx.fillRect(cx + Math.round(Math.cos(a) * rr) - 1, cy + Math.round(Math.sin(a) * rr) - 1, 2, 2);
        }
      }
      ctx.fillRect(cx - 1, cy - 1, 2, 2);
      break;
    default:                                        // a letter
      drawText(ctx, icon, cx, cy - 3, { scale: 1, color, align: 'center', shadow: false });
  }
}

function drawPadButton(ctx, b, pressed, iconColor = '#f0ead8') {
  ctx.save();
  ctx.globalAlpha = pressed ? 0.55 : 0.3;
  ctx.fillStyle = '#0d1116';
  pixelDisc(ctx, b.x, b.y, b.r);
  ctx.globalAlpha = pressed ? 0.95 : 0.6;
  ctx.fillStyle = '#c8b48a';
  pixelRing(ctx, b.x, b.y, b.r, 1);
  ctx.globalAlpha = pressed ? 1 : 0.8;
  buttonIcon(ctx, b.icon, b.x, b.y, iconColor);
  ctx.restore();
}

export function drawTouchControls(g, ctx) {
  if (!touch.enabled || !touch.padActive) return;
  const st = g.state;
  const s = touch.stickState;

  // thumbstick: parked at its home spot until a thumb claims it
  const bx = s.active ? s.ox : STICK.hx, by = s.active ? s.oy : STICK.hy;
  ctx.save();
  ctx.globalAlpha = s.active ? 0.34 : 0.2;
  ctx.fillStyle = '#0d1116';
  pixelDisc(ctx, bx, by, STICK.r);
  ctx.globalAlpha = s.active ? 0.7 : 0.42;
  ctx.fillStyle = '#c8b48a';
  pixelRing(ctx, bx, by, STICK.r, 1);
  ctx.globalAlpha = s.active ? 0.95 : 0.55;
  ctx.fillStyle = '#f0ead8';
  pixelDisc(ctx, bx + s.dx, by + s.dy, STICK.knob);
  ctx.restore();

  for (const b of PAD_BUTTONS) {
    // hide gear the player hasn't earned yet
    if (b.action === 'bow' && !st.bow) continue;
    if (b.action === 'shield' && !st.shield) continue;
    if (b.action === 'cycleR' && !st.bow) continue;
    // the swap button wears the selected arrow's colour, so type is readable at a glance
    const tint = b.action === 'cycleR' ? ARROWS[st.arrowSel].color : '#f0ead8';
    drawPadButton(ctx, b, touch.down(b.action), tint);
  }
  for (const b of TOP_BUTTONS) {
    drawPadButton(ctx, b, touch.down(b.action));
    // the warp button wears its own charge meter so the hold has visible progress
    if (b.action === 'teleport' && g.warpT > 0) {
      const p = clamp(g.warpT / TELEPORT.hold, 0, 1);
      ctx.save();
      ctx.strokeStyle = '#c8a0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 2, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

export function drawPortraitHint(g, ctx) {
  const a = clamp(Math.min(g.portraitHintT, 1), 0, 1) * 0.92;
  const msg = 'Rotate your device for a bigger view';
  const w = textWidth(msg, 1) + 16;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = '#101418';
  ctx.fillRect(VIEW_W / 2 - w / 2, 30, w, 14);
  ctx.strokeStyle = '#c8b48a';
  ctx.lineWidth = 1;
  ctx.strokeRect(VIEW_W / 2 - w / 2 + 0.5, 30.5, w - 1, 13);
  ctx.restore();
  text(ctx, msg, VIEW_W / 2, 34, { size: 8, align: 'center', alpha: a });
}

// ---------------------------------------------------------------- TAP TARGETS
// Rects the touch layer hit-tests; drawn by the matching screen above.
// Half-open on the far edge so stacked rows never both claim a boundary tap.
export const hitRect = (t, r) => t.x >= r.x && t.x < r.x + r.w && t.y >= r.y && t.y < r.y + r.h;

export const CLOSE_BTN = { x: 366, y: 14, w: 20, h: 20 };

export function fileCardRects() {
  return [0, 1, 2].map(i => ({ i, x: 18, y: 34 + i * 62, w: 364, h: 56 }));
}
export function fileEraseRects() {
  return fileCardRects().map(r => ({ i: r.i, x: r.x + r.w - 21, y: r.y + 4, w: 17, h: 17 }));
}
export const eraseConfirmRects = () => ({
  yes: { x: 118, y: 138, w: 76, h: 22 },
  no: { x: 206, y: 138, w: 76, h: 22 },
});
export function pauseOptionRects() {
  return [0, 1, 2, 3].map(i => ({ i, x: 100, y: 77 + i * 16, w: 200, h: 16 }));
}
export function shopRects(g, list) {
  const startY = 48, rowH = 13, maxRows = 10;
  const rows = list.slice(g.shopScroll, g.shopScroll + maxRows)
    .map((_, i) => ({ idx: g.shopScroll + i, x: 20, y: startY + i * rowH - 1, w: 236, h: rowH }));
  return { rows, buy: { x: 264, y: 150, w: 104, h: 24 }, close: CLOSE_BTN };
}
export const shrineRects = () => ({ offer: { x: 140, y: 138, w: 120, h: 24 }, close: CLOSE_BTN });

function drawTapButton(ctx, r, label, color = '#f0c83a') {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#1b2128';
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
  ctx.restore();
  text(ctx, label, r.x + r.w / 2, r.y + (r.h - 7) / 2, { size: 8, align: 'center', color });
}
export { drawTapButton };

// ---------------------------------------------------------------- BANNER / DEATH / VICTORY
export function drawBanner(g, ctx) {
  const b = g.banner;
  if (!b) return;
  const a = clamp(Math.min(b.t * 2, 1), 0, 1);
  ctx.save();
  ctx.globalAlpha = 0.55 * a;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, VIEW_H / 2 - 40, VIEW_W, 80);
  ctx.restore();
  text(ctx, b.title, VIEW_W / 2, VIEW_H / 2 - 24, { size: 14, align: 'center', color: b.color || '#f0c83a', alpha: a });
  if (b.sub) text(ctx, b.sub, VIEW_W / 2, VIEW_H / 2 + 2, { size: 8, align: 'center', alpha: a });
}

export function drawDead(g, ctx) {
  ctx.fillStyle = 'rgba(20,4,8,0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, 'GUS FAINTED...', VIEW_W / 2, 90, { size: 16, align: 'center', color: '#e04a5a' });
  text(ctx, 'A kind current carries him home.', VIEW_W / 2, 118, { size: 8, align: 'center' });
  text(ctx, touch.enabled ? '- TAP -' : '- E -', VIEW_W / 2, 150, { size: 9, align: 'center', alpha: 0.6 + 0.4 * Math.sin(g.time * 4) });
}

export const CREDITS = [
  'PLATYPUS ADVENTURES', '', 'The Vale is saved.',
  'The rivers run bright once more.', '',
  'GUS', 'River Guardian, crayfish enthusiast', '',
  'STARRING',
  'Elder Mirri - Wombeau the Wombat',
  'Pip & Marlo - The Elemental Fangs', '',
  'Scorchjaw the Croc-Dragon',
  'Murkmaw the Gulper Leviathan',
  'Galestrike the Storm Eagle',
  'King Goanna the Earthshaker',
  'and APEXUS, the Primal Chimera', '',
  'Every enemy is safe and sound.',
  'They have opened a smoothie stand.', '',
  'Thanks for playing!', '',
  'The Vale stays open --',
  'elites now roam for true heroes.', '',
  '~ THE END ~',
];
export function drawVictory(g, ctx) {
  ctx.fillStyle = '#0a0e12';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const y0 = VIEW_H - g.creditsY;
  CREDITS.forEach((l, i) => {
    const y = y0 + i * 16;
    if (y > -20 && y < VIEW_H + 10)
      text(ctx, l, VIEW_W / 2, y, { size: i === 0 ? 12 : 8, align: 'center', color: i === 0 ? '#f0c83a' : '#f0ead8' });
  });
  ctx.save();
  ctx.translate(VIEW_W / 2 + Math.sin(g.time) * 60, VIEW_H - 30);
  ctx.scale(2, 2);
  drawSprite(ctx, 'gus_walk1', 0, 0, { flip: Math.sin(g.time) > 0 });
  ctx.restore();
  if (g.creditsY > CREDITS.length * 16 + VIEW_H - 40)
    text(ctx, touch.enabled ? '- TAP -' : '- E -', VIEW_W / 2, VIEW_H - 14, { size: 8, align: 'center', alpha: 0.6 + 0.4 * Math.sin(g.time * 4) });
}

export function regionDisplayName(code) {
  return REGION_NAMES[REGION_KEYS[code]] || '';
}
