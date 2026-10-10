// The game's movies. `intro`: Mum and Dad, the River Guardians, take on Xenomantis when she
// falls out of the stars, lose, and end up in Apexus's jail -- which is where Gus comes in.
// After the credits, `rescue` (peace in the Vale, until a dolphin cries for help) leads into
// the shark fight, and `mecha` (the world under attack, TO BE CONTINUED) closes the game.
//
// Each scene is a little timeline: a duration, a caption, timed `events` (sounds, shakes)
// and a draw(ctx, t) that animates purely from the scene's clock. E (or a tap) skips to the
// next scene, Esc skips the lot. Everything is drawn in screen space, no game world needed.

import { VIEW_W, VIEW_H } from './config.js';
import { drawSprite, frameName } from './pixelart.js';
import { drawPuggle, puggleLook } from './entities.js';
import { MECHA_ART } from './endart.js';
import { drawText, wrapText } from './font.js';
import { touch } from './touch.js';
import { audio } from './audio.js';
import { clamp, lerp } from './util.js';

const GROUND_Y = 168;          // where everyone stands
const CAPTION_Y = 194;

// a sprite at an integer zoom, bottom-centred on (x, by) like drawSprite
function big(ctx, name, x, by, s = 2, opts = {}) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(by));
  ctx.scale(s, s);
  drawSprite(ctx, name, 0, 0, opts);
  ctx.restore();
}
function guardian(ctx, who, x, by, t, { walking = false, flip = false, goo = 0 } = {}) {
  const pose = walking ? (Math.floor(t * 8) % 2 ? 'walk1' : 'walk2') : 'idle';
  big(ctx, `${who}_${pose}`, x, by, 2, { flip });
  big(ctx, who === 'dad' ? 'dad_band' : 'mum_bow', x, by, 2, { flip });
  if (goo > 0) {
    // stuck fast in alien goo
    ctx.save();
    ctx.globalAlpha = Math.min(1, goo) * 0.85;
    ctx.fillStyle = '#4fa83a';
    ctx.beginPath(); ctx.ellipse(x, by - 14, 15, 17, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#9aff6a';
    ctx.fillRect(Math.round(x) - 8, Math.round(by) - 26, 4, 3);
    ctx.fillRect(Math.round(x) + 3, Math.round(by) - 12, 3, 2);
    ctx.restore();
  }
}

// ---- backdrops
function sky(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  g.addColorStop(0, top); g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}
function stars(ctx, time, n = 40) {
  for (let i = 0; i < n; i++) {
    ctx.globalAlpha = 0.35 + 0.35 * Math.sin(time * 2 + i * 1.7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect((i * 97) % VIEW_W, (i * 41) % 120, 1, 1);
  }
  ctx.globalAlpha = 1;
}
function hills(ctx, y, color, amp, freq, phase) {
  ctx.fillStyle = color;
  for (let x = 0; x < VIEW_W; x += 2) {
    const h = y - amp * (0.5 + 0.5 * Math.sin(x * freq + phase)) - amp * 0.3 * Math.sin(x * freq * 2.7 + phase);
    ctx.fillRect(x, Math.round(h), 2, VIEW_H - Math.round(h));
  }
}
function ground(ctx, color, edge) {
  ctx.fillStyle = color; ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = edge; ctx.fillRect(0, GROUND_Y, VIEW_W, 2);
}
function vale(ctx, time, gooTint = 0) {
  sky(ctx, '#0c1428', gooTint ? '#2a3a2a' : '#26405a');
  stars(ctx, time);
  hills(ctx, 140, '#1c2c38', 22, 0.018, 1);
  hills(ctx, 156, '#203a30', 14, 0.03, 4);
  ground(ctx, '#2c4a34', '#3f6a48');
  if (gooTint) {
    ctx.save(); ctx.globalAlpha = gooTint * 0.18; ctx.fillStyle = '#4fa83a';
    ctx.fillRect(0, 0, VIEW_W, GROUND_Y); ctx.restore();
  }
}
function gooPuddle(ctx, x, y, w, time) {
  ctx.fillStyle = '#3c8a2c';
  ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.28, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#9aff6a';
  ctx.fillRect(Math.round(x - w / 3 + Math.sin(time * 3 + x) * 3), Math.round(y - 1), 2, 2);
}
function jail(ctx) {
  ctx.fillStyle = '#2c2038'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  for (let y = 0; y < GROUND_Y; y += 12) for (let x = (y / 12) % 2 ? -12 : 0; x < VIEW_W; x += 24) {
    ctx.fillStyle = '#3a2a4e'; ctx.fillRect(x + 1, y + 1, 22, 10);
    ctx.fillStyle = '#4a3462'; ctx.fillRect(x + 1, y + 1, 22, 2);
  }
  ctx.fillStyle = '#1c1426'; ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = '#664a86'; ctx.fillRect(0, GROUND_Y, VIEW_W, 2);
  // torches
  for (const x of [40, 360]) {
    ctx.fillStyle = '#8a6a3a'; ctx.fillRect(x, 70, 3, 12);
    ctx.fillStyle = '#ff8a3a'; ctx.fillRect(x - 2, 62, 7, 8);
    ctx.fillStyle = '#ffd84a'; ctx.fillRect(x, 64, 3, 4);
  }
}

// ---- the opening
const INTRO = [
  {
    dur: 6.5, music: 'title',
    caption: 'Long ago, two brave River Guardians kept Billabong Vale safe: Gus\'s MUM and DAD.',
    draw(ctx, t, time) {
      vale(ctx, time);
      // the river along the bottom
      ctx.fillStyle = '#315e80'; ctx.fillRect(0, 178, VIEW_W, 10);
      ctx.fillStyle = '#518aa4'; for (let x = (time * 20) % 30; x < VIEW_W; x += 30) ctx.fillRect(x, 181, 8, 1);
      const x = lerp(40, 190, clamp(t / 4.5, 0, 1));
      const walking = t < 4.5;
      guardian(ctx, 'dad', x, GROUND_Y, time, { walking });
      guardian(ctx, 'mum', x + 34, GROUND_Y, time + 0.3, { walking });
    },
  },
  {
    dur: 5.5, music: 'confluence',
    caption: 'Then one night, something fell out of the stars...',
    events: [[2.4, () => { audio.sfx('boom'); }]],
    draw(ctx, t, time) {
      vale(ctx, time, clamp((t - 2.4) / 2, 0, 1));
      // the falling star: a green fireball with a long tail, landing behind the far hills
      const k = clamp(t / 2.4, 0, 1);
      if (k < 1) {
        const mx = lerp(-20, 300, k), my = lerp(10, 132, k);
        for (let i = 0; i < 14; i++) {
          ctx.globalAlpha = (1 - i / 14) * 0.8;
          ctx.fillStyle = i < 3 ? '#e0ffc8' : '#8aff6a';
          ctx.fillRect(Math.round(mx - i * 9), Math.round(my - i * 3.4), 5 - Math.floor(i / 4), 5 - Math.floor(i / 4));
        }
        ctx.globalAlpha = 1;
      } else {
        // the crash: a flash, then a green glow rising off the crater
        const a = t - 2.4;
        ctx.save();
        ctx.globalAlpha = clamp(0.8 - a * 0.6, 0, 0.8);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        ctx.globalAlpha = 0.35 + 0.1 * Math.sin(time * 6);
        ctx.fillStyle = '#8aff6a';
        ctx.beginPath(); ctx.arc(300, 140, 26 + a * 6, 0, 7); ctx.fill();
        ctx.restore();
        hills(ctx, 156, '#203a30', 14, 0.03, 4);
        ground(ctx, '#2c4a34', '#3f6a48');
      }
      guardian(ctx, 'dad', 110, GROUND_Y, time, { flip: false });
      guardian(ctx, 'mum', 140, GROUND_Y, time, { flip: false });
    },
  },
  {
    dur: 6, music: 'xeno',
    caption: 'XENOMANTIS! A giant alien bug, leaving sticky alien GOO everywhere it crawled.',
    events: [[0.5, () => audio.sfx('roar')], [2.2, () => audio.sfx('roar')]],
    draw(ctx, t, time) {
      vale(ctx, time, 1);
      gooPuddle(ctx, 70, 176, 22, time); gooPuddle(ctx, 230, 182, 30, time); gooPuddle(ctx, 350, 176, 18, time);
      const rise = clamp(t / 1.6, 0, 1);
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, VIEW_W, GROUND_Y + 4); ctx.clip();
      big(ctx, frameName('boss_xeno', time * 6), 230, GROUND_Y + 4 + (1 - rise) * 100, 2, { flip: true });
      ctx.restore();
      if (t > 2) {
        const a = clamp((t - 2) * 2, 0, 1);
        drawText(ctx, 'XENOMANTIS', VIEW_W / 2, 18, { scale: 3, align: 'center', color: '#9aff6a', alpha: a });
      }
    },
  },
  {
    dur: 7, music: 'xeno',
    caption: 'Mum and Dad fought bravely... but the alien was just too strong.',
    events: [[0.9, () => audio.sfx('arrow')], [1.3, () => audio.sfx('slash')], [1.5, () => audio.sfx('hit')], [1.7, () => audio.sfx('arrow')],
      [2.0, () => audio.sfx('slash')], [3.0, () => audio.sfx('roar')], [3.2, () => audio.sfx('hurt')], [4.2, () => audio.sfx('splash')]],
    draw(ctx, t, time) {
      vale(ctx, time, 1);
      gooPuddle(ctx, 300, 180, 26, time);
      const hit = t > 1.3 && t < 1.45 || t > 2 && t < 2.15;
      big(ctx, t > 2.8 && t < 3.3 ? 'boss_xeno_2' : frameName('boss_xeno', time * 6), 300, GROUND_Y + 4, 2, { flip: true, flash: hit });
      // Dad charges in and slashes, then the scythe sends them both flying
      let dadX = 110, mumX = 70;
      if (t > 0.5 && t < 3.2) dadX = lerp(110, 215, clamp((t - 0.5) / 0.7, 0, 1));
      if (t >= 3.2) { const k = clamp((t - 3.2) / 0.6, 0, 1); dadX = lerp(215, 120, k); mumX = lerp(70, 50, k); }
      const tumble = t >= 3.2 && t < 3.8;
      guardian(ctx, 'dad', dadX, GROUND_Y - (tumble ? Math.sin((t - 3.2) / 0.6 * Math.PI) * 24 : 0), time,
        { walking: t > 0.5 && t < 1.2, goo: clamp((t - 4.4) / 0.6, 0, 1) });
      guardian(ctx, 'mum', mumX, GROUND_Y - (tumble ? Math.sin((t - 3.2) / 0.6 * Math.PI) * 14 : 0), time,
        { goo: clamp((t - 4.6) / 0.6, 0, 1) });
      // Mum's arrows
      for (const at of [0.9, 1.7, 2.4]) {
        const k = (t - at) / 0.45;
        if (k < 0 || k > 1) continue;
        ctx.fillStyle = '#c8b48a';
        ctx.fillRect(Math.round(lerp(mumX + 10, 280, k)), Math.round(GROUND_Y - 24 - k * 6), 8, 2);
      }
      if (hit) {
        ctx.fillStyle = '#fff6c8';
        for (let i = 0; i < 6; i++) ctx.fillRect(250 + (i * 37) % 30, 110 + (i * 23) % 40, 2, 2);
      }
      if (t > 3 && t < 3.4) { ctx.fillStyle = '#ffffff55'; ctx.fillRect(0, 0, VIEW_W, GROUND_Y); }
      // goo globs flying back at them
      for (const [at, tx] of [[3.9, 120], [4.1, 50]]) {
        const k = (t - at) / 0.5;
        if (k < 0 || k > 1) continue;
        ctx.fillStyle = '#8aff6a';
        ctx.beginPath(); ctx.arc(lerp(270, tx, k), GROUND_Y - 40 - Math.sin(k * Math.PI) * 40, 5, 0, 7); ctx.fill();
      }
    },
  },
  {
    dur: 6, music: 'nexus',
    caption: 'It gave them to its servant, APEXUS the Chimera, who carried them away...',
    events: [[0.6, () => audio.sfx('roar')], [2.4, () => audio.sfx('arrow')]],
    draw(ctx, t, time) {
      vale(ctx, time, 1);
      gooPuddle(ctx, 300, 180, 26, time);
      // swoop down from the left, scoop them up, and away to the top right
      let ax, ay;
      if (t < 2.4) { const k = clamp(t / 2.4, 0, 1); ax = lerp(-60, 100, k); ay = lerp(20, 140, Math.sin(k * Math.PI / 2)); }
      else { const k = clamp((t - 2.4) / 2.6, 0, 1); ax = lerp(100, 460, k); ay = lerp(140, -40, k); }
      const carried = t >= 2.4;
      if (!carried) {
        guardian(ctx, 'dad', 120, GROUND_Y, time, { goo: 1 });
        guardian(ctx, 'mum', 50, GROUND_Y, time, { goo: 1 });
      } else {
        guardian(ctx, 'dad', ax + 14, ay + 46, time, { goo: 1 });
        guardian(ctx, 'mum', ax - 14, ay + 46, time, { goo: 1 });
      }
      drawSprite(ctx, frameName('boss_apexus', time * 6), ax, ay + 20, {});
    },
  },
  {
    dur: 6, music: 'nexus',
    caption: '...and locked them in cages, deep in the Nexus of Fangs.',
    events: [[0.3, () => { audio.sfx('door'); }], [1.1, () => audio.sfx('roar')]],
    draw(ctx, t, time) {
      jail(ctx);
      for (const [who, x] of [['dad', 130], ['mum', 270]]) {
        guardian(ctx, who, x, GROUND_Y - 4, time, { flip: x > 200 });
        big(ctx, 'cage', x, GROUND_Y + 2, 2);
      }
      const bob = Math.sin(time * 3) * 3;
      drawSprite(ctx, frameName('boss_apexus', time * 5), 200, GROUND_Y + 10 + bob, {});
      if (t > 1.1 && t < 2.6) drawText(ctx, 'HA HA HA!', 200, 70 + bob, { scale: 2, align: 'center', color: '#c88aff' });
    },
  },
  {
    dur: 6, music: 'nexus',
    caption: 'Apexus sealed the Nexus with four Key Shards, guarded by his ELEMENTAL FANGS.',
    events: [[0.8, () => audio.sfx('shard')]],
    draw(ctx, t, time) {
      ctx.fillStyle = '#0a0e12'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      stars(ctx, time, 60);
      const k = clamp((t - 0.8) / 2.2, 0, 1);
      const shards = [['#ff8a3a', -1, -1], ['#7ad4ff', 1, 1], ['#e8f0ff', -1, 1], ['#a8d84a', 1, -1]];
      for (const [col, sx, sy] of shards) {
        const x = 200 + sx * k * 150, y = 100 + sy * k * 60;
        ctx.save(); ctx.globalAlpha = 0.4; ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(x, y - 4, 9, 0, 7); ctx.fill(); ctx.restore();
        big(ctx, 'shard', x, y + 4, 2, { tint: col });
      }
      drawSprite(ctx, frameName('boss_apexus', time * 5), 200, 130 + Math.sin(time * 3) * 3, {});
    },
  },
  {
    dur: 7, music: 'home',
    caption: 'Now only one River Guardian is left to save them: a little platypus named... GUS!',
    events: [[4.4, () => audio.sfx('fanfare')]],
    draw(ctx, t, time) {
      // dawn over Gus's burrow
      sky(ctx, '#3a4a7a', '#f0a868');
      ctx.fillStyle = '#ffd88a';
      ctx.beginPath(); ctx.arc(320, 150 - clamp(t / 6, 0, 1) * 30, 20, 0, 7); ctx.fill();
      hills(ctx, 150, '#3a5a48', 16, 0.02, 2);
      ground(ctx, '#4a7a4c', '#6a9a5c');
      drawSprite(ctx, 'burrow_ext', 120, GROUND_Y + 2, {});
      const x = lerp(140, 230, clamp((t - 1) / 2.5, 0, 1));
      const walking = t > 1 && t < 3.5;
      big(ctx, walking ? (Math.floor(time * 8) % 2 ? 'gus_walk1' : 'gus_walk2') : 'gus_idle', x, GROUND_Y, 2);
      if (t > 4.4) drawText(ctx, 'GUS', x, 100, { scale: 2, align: 'center', color: '#f0c83a', alpha: clamp((t - 4.4) * 2, 0, 1) });
    },
  },
];

// ---- after the credits: peace, then a cry for help
// a sunny bank on the billabong: water along the back, grass in front
function billabong(ctx, time) {
  sky(ctx, '#6ab4e0', '#d4eef8');
  ctx.fillStyle = '#fff6c8';
  ctx.beginPath(); ctx.arc(330, 34, 14, 0, 7); ctx.fill();
  hills(ctx, 112, '#5a9a6a', 12, 0.02, 3);
  ctx.fillStyle = '#3f86a8'; ctx.fillRect(0, 112, VIEW_W, 40);
  ctx.fillStyle = '#7ac4dc';
  for (let i = 0; i < 14; i++) ctx.fillRect(Math.round((i * 53 + time * 14) % VIEW_W), 118 + (i * 7) % 28, 8, 1);
  ground(ctx, '#4a8a4c', '#6aaa5c');
  ctx.fillStyle = '#3a6a3c'; ctx.fillRect(0, 152, VIEW_W, 16);
  ctx.fillStyle = '#4a8a4c'; ctx.fillRect(0, 152, VIEW_W, 3);
}
// Mum or Dad at the water's edge with a rod out over it, bobber bobbing
function fisher(ctx, who, x, by, time, look = 0) {
  const tipX = x + (look ? -22 : 22), tipY = by - 46;
  ctx.strokeStyle = '#8a5a34'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + (look ? -6 : 6), by - 14); ctx.lineTo(tipX, tipY); ctx.stroke();
  const bob = Math.sin(time * 3 + x) * 1.5;
  ctx.strokeStyle = '#e8e8e8'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(tipX + (look ? -6 : 6), 132 + bob); ctx.stroke();
  ctx.fillStyle = '#e04a3a'; ctx.fillRect(Math.round(tipX + (look ? -7 : 5)), Math.round(130 + bob), 3, 2);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(tipX + (look ? -7 : 5)), Math.round(132 + bob), 3, 1);
  guardian(ctx, who, x, by, time, { flip: !!look });
}
function sharkFin(ctx, x, y) {
  ctx.fillStyle = '#5a6a7a';
  for (let i = 0; i < 7; i++) ctx.fillRect(Math.round(x - 4 + i * 0.5), Math.round(y - i), Math.max(1, 8 - i), 1);
  ctx.fillStyle = '#bfe8f2'; ctx.fillRect(Math.round(x - 6), Math.round(y + 1), 12, 1);
}

const RESCUE = [
  {
    dur: 7.5, music: 'village',
    caption: 'Back home in Billabong Vale, everything was peaceful again. Mum and Dad went fishing, and Gus played with the puggles.',
    draw(ctx, t, time) {
      billabong(ctx, time);
      fisher(ctx, 'dad', 60, GROUND_Y - 2, time);
      fisher(ctx, 'mum', 104, GROUND_Y - 2, time + 1);
      // Gus and five puggles playing chase round in a circle
      const gx = 250 + Math.cos(time * 1.6) * 34, gy = GROUND_Y - 2 + Math.sin(time * 1.6) * 6;
      for (let i = 0; i < 5; i++) {
        const a = time * 1.6 - 0.9 - i * 0.75;
        const hop = Math.abs(Math.sin(time * 7 + i)) * 4;
        ctx.save();
        ctx.translate(Math.round(250 + Math.cos(a) * 34), Math.round(GROUND_Y - 2 + Math.sin(a) * 6 - hop));
        ctx.scale(2, 2);
        drawPuggle(ctx, puggleLook('puggle_' + (i * 7)), 0, 0, { flip: Math.sin(a) > 0, waddle: hop > 2 });
        ctx.restore();
      }
      big(ctx, Math.floor(time * 8) % 2 ? 'gus_walk1' : 'gus_walk2', gx, gy - Math.abs(Math.sin(time * 6)) * 3, 2,
        { flip: Math.sin(time * 1.6) > 0 });
    },
  },
  {
    dur: 6.5, music: 'sharks',
    caption: 'Then Gus heard someone panicking out in the water...',
    events: [[0.6, () => audio.sfx('splash')], [2.2, () => audio.sfx('splash')], [3.8, () => audio.sfx('splash')]],
    draw(ctx, t, time) {
      billabong(ctx, time);
      fisher(ctx, 'dad', 60, GROUND_Y - 2, time);
      fisher(ctx, 'mum', 104, GROUND_Y - 2, time + 1);
      // a dolphin leaping for its life, shark fins circling
      const k = (time * 0.9) % 1;
      const dx = 300 + Math.sin(time * 0.8) * 40;
      big(ctx, 'dolphin', dx, 136 - Math.sin(k * Math.PI) * 26, 2, { flip: Math.cos(time * 0.8) < 0, angle: (k - 0.5) * 0.8 });
      for (let i = 0; i < 3; i++) {
        const a = time * 2 + i * 2.1;
        sharkFin(ctx, dx + Math.cos(a) * 46, 136 + Math.sin(a) * 8);
      }
      const wob = Math.sin(time * 18) * 1.5;
      drawText(ctx, 'HELP! HELP!', dx + wob, 70, { scale: 2, align: 'center', color: '#ffffff' });
      // Gus freezes, then runs for the water
      const run = clamp((t - 2.6) / 2.5, 0, 1);
      const gx = lerp(230, 290, run);
      big(ctx, run > 0 && run < 1 ? (Math.floor(time * 10) % 2 ? 'gus_walk1' : 'gus_walk2') : 'gus_idle', gx, GROUND_Y - 2, 2);
      if (t > 0.8 && t < 2.6) drawText(ctx, '!', gx, GROUND_Y - 50, { scale: 2, align: 'center', color: '#f0c83a' });
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.translate(150 + i * 14, GROUND_Y - 2);
        drawPuggle(ctx, puggleLook('puggle_' + (i * 7)), 0, 0, { flip: true });
        ctx.restore();
      }
    },
  },
];

// ---- the cliffhanger
function storm(ctx, time, t) {
  sky(ctx, '#140608', '#5a1a1a');
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = '#2a1014';
    ctx.beginPath(); ctx.ellipse((i * 83 + time * 6) % (VIEW_W + 80) - 40, 24 + (i % 3) * 14, 60, 12, 0, 0, 7); ctx.fill();
  }
  hills(ctx, 150, '#0e0608', 34, 0.024, 5);
  ground(ctx, '#0a0406', '#2a0a0e');
}
const MECHA = [
  {
    dur: 8, music: 'boss_apexus',
    caption: 'Far, far away, the whole world was under attack by... MECHA APEXUS!',
    events: [[0.8, () => audio.sfx('roar')], [2.6, () => audio.sfx('boom')], [4.4, () => audio.sfx('boom')], [5.2, () => audio.sfx('roar')]],
    draw(ctx, t, time) {
      storm(ctx, time, t);
      const rise = clamp(t / 3, 0, 1);
      const bob = Math.sin(time * 2) * 3;
      const top = 172 + (1 - rise) * 120 + bob - MECHA_ART.h, left = 200 - MECHA_ART.w / 2;
      const at = ([x, y]) => [left + x, top + y];
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, VIEW_W, 158); ctx.clip();
      // a red glow of menace behind him
      ctx.globalAlpha = 0.25 + 0.1 * Math.sin(time * 4);
      ctx.fillStyle = '#ff2a2a';
      ctx.beginPath(); ctx.ellipse(200, top + 60, 90, 70, 0, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
      big(ctx, frameName('mecha_apexus', time * 4), 200, top + MECHA_ART.h, 1);
      if (rise >= 1) {
        // the reactor throbs and the visor burns
        ctx.globalAlpha = 0.35 + 0.25 * Math.sin(time * 9);
        ctx.fillStyle = '#ffa040';
        const [cx, cy] = at(MECHA_ART.core);
        ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.fill();
        ctx.fillStyle = '#ff2a2a';
        for (const e of MECHA_ART.eyes) { const [ex, ey] = at(e); ctx.beginPath(); ctx.arc(ex, ey, 7, 0, 7); ctx.fill(); }
        ctx.globalAlpha = 1;
        // the shoulder cannons blast lasers into the sky, one then the other
        const k = (t - 3.4) % 1.2;
        if (t > 3.4 && k < 0.3) {
          const [gx, gy] = at(MECHA_ART.guns[Math.floor((t - 3.4) / 1.2) % 2]);
          const dir = gx < 200 ? -1 : 1;
          ctx.globalAlpha = 1 - k / 0.3;
          ctx.strokeStyle = '#ff4a3a'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + dir * 120, gy - 140); ctx.stroke();
          ctx.strokeStyle = '#fff0a0'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + dir * 120, gy - 140); ctx.stroke();
          ctx.globalAlpha = 1;
        }
        // sparks crackle off the armor
        ctx.fillStyle = '#fff0a0';
        for (let i = 0; i < 4; i++) {
          const ph = (time * 3 + i * 0.37) % 1;
          if (ph < 0.15) ctx.fillRect(Math.round(left + 20 + ((i * 53 + Math.floor(time * 3) * 31) % 110)), Math.round(top + 30 + ((i * 29) % 60)), 2, 2);
        }
      }
      ctx.restore();
      // lightning
      for (const at2 of [2.6, 4.4]) {
        if (t > at2 && t < at2 + 0.25) {
          ctx.fillStyle = '#ffffff99'; ctx.fillRect(0, 0, VIEW_W, CAPTION_Y - 6);
          ctx.fillStyle = '#ffffff';
          let lx = at2 === 2.6 ? 70 : 330, ly = 0;
          while (ly < 140) { const nx = lx + (Math.sin(ly * 7 + at2) * 14); ctx.fillRect(Math.round(Math.min(lx, nx)), ly, Math.abs(nx - lx) + 2, 12); lx = nx; ly += 12; }
        }
      }
      if (t > 3.4) drawText(ctx, 'MECHA APEXUS', VIEW_W / 2, 14, { scale: 3, align: 'center', color: '#ff4a3a', alpha: clamp((t - 3.4) * 2, 0, 1) });
    },
  },
  {
    dur: 8, music: 'title', caption: '',
    draw(ctx, t, time) {
      ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      stars(ctx, time, 50);
      const a = clamp((t - 0.6) / 1.4, 0, 1);
      drawText(ctx, 'TO BE', VIEW_W / 2, 46, { scale: 4, align: 'center', color: '#f0c83a', alpha: a });
      drawText(ctx, 'CONTINUED...', VIEW_W / 2, 82, { scale: 4, align: 'center', color: '#f0c83a', alpha: a });
      const a2 = clamp((t - 1.6) / 1.2, 0, 1);
      drawText(ctx, 'IN PLATYPUS ADVENTURES 2', VIEW_W / 2, 124, { scale: 2, align: 'center', color: '#ffffff', alpha: a2 });
      // the heroes, small, looking out at what's coming
      const k = clamp((t - 2.4) / 1, 0, 1);
      if (k > 0) {
        ctx.save();
        ctx.globalAlpha = k;
        big(ctx, 'gus_idle', 182, 196, 2, {});
        big(ctx, 'dolphin', 226, 194, 2, { flip: true });
        ctx.restore();
      }
    },
  },
];

const MOVIES = { intro: INTRO, rescue: RESCUE, mecha: MECHA };

export function createCutscene(name) { return { name, i: 0, t: 0, fired: new Set(), started: false }; }

// Returns true once the movie is over.
export function updateCutscene(cs, dt, next, skip) {
  const scenes = MOVIES[cs.name];
  if (!cs.started) { cs.started = true; audio.music(scenes[0].music); }
  if (skip) return true;
  cs.t += dt;
  const sc = scenes[cs.i];
  for (const [at, fn] of sc.events || []) {
    if (cs.t >= at && !cs.fired.has(at)) { cs.fired.add(at); fn(); }
  }
  if (next || cs.t >= sc.dur) {
    if (next) audio.sfx('blip');
    cs.i++; cs.t = 0; cs.fired = new Set();
    if (cs.i >= scenes.length) return true;
    audio.music(scenes[cs.i].music);
  }
  return false;
}

export function drawCutscene(ctx, cs, time) {
  const scenes = MOVIES[cs.name];
  const sc = scenes[Math.min(cs.i, scenes.length - 1)];
  ctx.save();
  sc.draw(ctx, cs.t, time);
  ctx.restore();
  if (sc.caption) {
    // caption panel
    ctx.fillStyle = '#0a0e12';
    ctx.fillRect(0, CAPTION_Y - 6, VIEW_W, VIEW_H - CAPTION_Y + 6);
    ctx.fillStyle = '#c8b48a';
    ctx.fillRect(0, CAPTION_Y - 6, VIEW_W, 1);
    const lines = wrapText(sc.caption, VIEW_W - 40);
    const shown = Math.floor(cs.t * 45);
    let left = shown;
    lines.forEach((l, i) => {
      const take = clamp(left, 0, l.length);
      left -= l.length + 1;
      drawText(ctx, l.slice(0, take), 20, CAPTION_Y + i * 11, { color: '#f0ead8' });
    });
  }
  drawText(ctx, touch.enabled ? 'TAP: next' : 'E: next   Esc: skip', VIEW_W - 8, VIEW_H - 10,
    { align: 'right', alpha: 0.45 + 0.2 * Math.sin(time * 4), color: '#a8a090' });
  // fade in and out of each scene
  const fade = Math.max(0, 1 - cs.t / 0.4, 1 - (sc.dur - cs.t) / 0.4);
  if (fade > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(fade, 0, 1);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIEW_W, sc.caption ? CAPTION_Y - 6 : VIEW_H);
    ctx.restore();
  }
}
