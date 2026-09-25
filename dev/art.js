// Isolated visual workshop: no game loop, audio, save reads or save writes.
import { buildSprites, sprites, drawSprite, frameName } from '../js/pixelart.js';
import { T, THEMES, buildTileAtlas, drawTileTo } from '../js/tiles.js';

buildSprites();
const cards = [];
function card(group, name, armor = 0) {
  const box = document.createElement('div'); box.className = 'card';
  const canvas = document.createElement('canvas'); canvas.width = 40; canvas.height = 40;
  const label = document.createElement('span'); label.textContent = armor ? `Armor ${armor}` : name.replaceAll('_', ' ');
  box.append(canvas, label); document.getElementById(group).append(box);
  cards.push({ ctx: canvas.getContext('2d'), name, armor });
}
['gus_idle', 'gus_walk1', 'gus_swim'].forEach(n => card('hero', n));
for (let n = 1; n <= 6; n++) card('hero', 'gus_idle', n);
['rakali', 'adder', 'snapjaw', 'emberfox', 'mgoanna', 'kooka', 'volteel', 'cod', 'snapshell', 'talon', 'owl', 'dingo', 'wildcat', 'python', 'tazzy', 'gknight', 'boss_scorchjaw', 'boss_murkmaw', 'boss_galestrike', 'boss_kinggoanna', 'boss_apexus'].forEach(n => card('enemies', n));
for (const prefix of ['sword', 'bow', 'shield']) for (let n = 1; n <= 6; n++) card('items', prefix + n);
card('items', 'sword7');   // the God Sword
['coin', 'diamond', 'chest', 'chest_open', 'pot', 'bomb', 'key', 'crayfish', 'arrow_regular', 'arrow_fire', 'arrow_ice', 'arrow_lightning', 'arrow_bomb', 'arrow_light', 'statue', 'elder', 'wombat', 'dolphin', 'mama', 'puggle', 'puggle_cream', 'puggle_choc'].forEach(n => card('items', n));
const vale = document.getElementById('vale').getContext('2d');
const dungeon = document.getElementById('dungeon').getContext('2d');
const atlasCtx = document.getElementById('tiles').getContext('2d');
const animate = document.getElementById('animate'), theme = document.getElementById('theme');
const ow = Array.from({ length: 9 }, (_, y) => Array.from({ length: 15 }, (_, x) => {
  if (y === 0 || (x === 0 && y < 7) || (y === 1 && x % 3 === 1)) return T.TREE;
  if (x >= 10 && y > 1) return y === 5 ? T.BRIDGE : x === 10 || y === 2 ? T.SHALLOW : T.DEEP;
  if (y === 5 || (x === 5 && y > 4)) return T.PATH;
  if (x === 2 && y === 3) return T.ROCK;
  if ((x + y * 3) % 11 === 1) return T.TALLGRASS;
  if ((x * 7 + y) % 13 === 2) return T.FLOWER;
  return T.GRASS;
}));
function scene(ctx, themeName, map, t) {
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < 9; y++) for (let x = 0; x < 15; x++) drawTileTo(ctx, themeName, map[y][x], x * 16, y * 16, t,
    [map[y - 1]?.[x], map[y]?.[x + 1], map[y + 1]?.[x], map[y]?.[x - 1]]);
}
function render(ms) {
  const t = animate.checked ? ms / 1000 : 0;
  for (const { ctx, name, armor } of cards) {
    ctx.clearRect(0, 0, 40, 40); ctx.imageSmoothingEnabled = false;
    ctx.save();
    // Bosses fit the same card without clipping their wings.
    const fit = Math.min(1, 36 / sprites[name].w, 34 / sprites[name].h);
    ctx.translate(20, 34); ctx.scale(fit, fit);
    const pose = name === 'gus_walk1' && Math.floor(t * 7) % 2 ? 'gus_walk2' : frameName(name, t * 5);
    drawSprite(ctx, pose, 0, 0);
    if (armor) drawSprite(ctx, 'armor' + armor, 0, 0);
    ctx.restore();
  }
  scene(vale, 'ow', ow, t);
  drawSprite(vale, Math.floor(t * 7) % 2 ? 'gus_walk1' : 'gus_walk2', 89, 85);
  drawSprite(vale, 'chest', 49, 77); drawSprite(vale, frameName('rakali', t * 6), 135, 120, { flip: true });
  drawSprite(vale, frameName('kooka', t * 5), 140, 48);
  drawSprite(vale, frameName('cod', t * 3), 204, 126);
  const th = theme.value;
  const dm = Array.from({ length: 9 }, (_, y) => Array.from({ length: 15 }, (_, x) =>
    x === 0 || y < 2 || x === 14 || y === 8 ? T.DWALL : x > 9 && y > 3 ? (th === 'fire' ? T.DLAVA : T.DWATER) : T.DFLOOR));
  dm[1][7] = T.DOOR_BOSS; dm[1][3] = dm[1][11] = T.TORCH; dm[6][3] = T.DDECOR; dm[3][3] = T.PLATE;
  scene(dungeon, th, dm, t);
  drawSprite(dungeon, 'gus_idle', 90, 88); drawSprite(dungeon, 'armor3', 90, 88);
  drawSprite(dungeon, 'shield3', 99, 85); drawSprite(dungeon, frameName('gknight', t * 5), 134, 65, { flip: true });
  drawSprite(dungeon, 'pot', 30, 55); drawSprite(dungeon, 'chest', 135, 115);
  atlasCtx.clearRect(0, 0, 512, 128); atlasCtx.imageSmoothingEnabled = false;
  Object.values(T).forEach((id, i) => {
    const x = (i % 16) * 32, y = Math.floor(i / 16) * 40;
    atlasCtx.save(); atlasCtx.translate(x, y); atlasCtx.scale(2, 2);
    drawTileTo(atlasCtx, th, id, 0, 0, t); atlasCtx.restore();
  });
  requestAnimationFrame(render);
}
// Catch undefined palette keys (renderMap paints these magenta), empty sprites and bad atlases.
const errors = [];
function check(canvas, name) {
  const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
  let painted = false;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3]) painted = true;
    if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 255 && data[i + 3]) { errors.push(`${name}: missing palette color`); break; }
  }
  if (!painted) errors.push(`${name}: empty`);
}
for (const [name, sprite] of Object.entries(sprites)) check(sprite.canvas, name);
for (const th of Object.keys(THEMES)) for (const frames of buildTileAtlas(th).variants) for (const frame of frames) for (const [id, tile] of frame) check(tile, `${th}/${id}`);
for (const name of ['gus_idle', 'gus_walk1', 'gus_walk2']) if (sprites[name].w !== 16 || sprites[name].h !== 16) errors.push(`${name}: armor registration`);
document.getElementById('checks').textContent = errors.length ? errors.join(' · ') : `${Object.keys(sprites).length} sprites · ${Object.keys(THEMES).length} tile themes · 4 spatial variants · All palette and armor-grid checks passed.`;
if (errors.length) console.error(errors);
requestAnimationFrame(render);
