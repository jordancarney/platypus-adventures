// Boot + fixed-timestep game loop.
import { VIEW_W, VIEW_H, DEBUG } from './config.js';
import { buildSprites } from './pixelart.js';
import { buildFont } from './font.js';
import { buildTileAtlas } from './tiles.js';
import { input } from './input.js';
import { audio } from './audio.js';
import { touch } from './touch.js';
import { migrateLegacySave } from './save.js';
import { Game } from './game.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;
const ctx = canvas.getContext('2d');

buildSprites();
buildFont();
buildTileAtlas('ow');
input.init();
audio.init();
touch.init(canvas);
migrateLegacySave();

const game = new Game(ctx);
if (DEBUG) window.__game = game; // inspect internals from the console with ?debug=1

// Fill the window as much as the 5:3 view allows, letterboxing only the short axis.
// Subtracts the safe-area padding on body so notches never clip the canvas.
function resize() {
  const cs = getComputedStyle(document.body);
  const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
  const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
  const vw = (document.documentElement.clientWidth || innerWidth) - padX;
  const vh = (document.documentElement.clientHeight || innerHeight) - padY;
  const scale = Math.min(vw / VIEW_W, vh / VIEW_H);
  canvas.style.width = Math.max(VIEW_W / 2, Math.floor(VIEW_W * scale)) + 'px';
  canvas.style.height = Math.max(VIEW_H / 2, Math.floor(VIEW_H * scale)) + 'px';
}
addEventListener('resize', resize);
addEventListener('orientationchange', resize);
addEventListener('load', resize);
if (window.visualViewport) visualViewport.addEventListener('resize', resize);
// Catches anything the events miss: first layout, mobile chrome sliding away, rotation.
if (window.ResizeObserver) new ResizeObserver(resize).observe(document.documentElement);
resize();

const STEP = 1 / 60;
let last = performance.now(), acc = 0;
function frame(now) {
  requestAnimationFrame(frame);
  acc += Math.min(0.1, (now - last) / 1000);
  last = now;
  while (acc >= STEP) {
    game.update(STEP);
    input.endFrame();
    acc -= STEP;
  }
  game.draw();
}
requestAnimationFrame(frame);
