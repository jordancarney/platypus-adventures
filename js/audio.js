// WebAudio: synthesized sound effects + a little chiptune band (lead, bass, chords, drums). No assets.

let ctx = null, master = null, musicGain = null, sfxGain = null, echoIn = null, echoDelay = null;
let muted = false, current = null, timer = null;

function ensureCtx() {
  if (ctx) return true;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.55; sfxGain.connect(master);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.32; musicGain.connect(master);
    // the music's echo: a delay feeding back on itself through a lowpass, so repeats darken
    echoIn = ctx.createGain(); echoIn.gain.value = 0;
    echoDelay = ctx.createDelay(1);
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    const dark = ctx.createBiquadFilter(); dark.type = 'lowpass'; dark.frequency.value = 2400;
    echoIn.connect(echoDelay); echoDelay.connect(dark); dark.connect(fb); fb.connect(echoDelay); dark.connect(musicGain);
  } catch { return false; }
  return true;
}

// --- primitive voices ---
function tone({ f = 440, f2 = null, dur = 0.1, type = 'square', vol = 0.5, at = 0, decay = true }) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + at;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0);
  if (f2 !== null) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  if (decay) g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  else g.gain.setValueAtTime(0.001, t0 + dur);
  o.connect(g); g.connect(sfxGain);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

function noise({ dur = 0.15, vol = 0.4, at = 0, low = false }) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + at;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  let node = src;
  if (low) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700; src.connect(f); node = f; }
  node.connect(g); g.connect(sfxGain);
  src.start(t0);
}

// --- sound effects ---
const SFX = {
  slash:  () => { noise({ dur: 0.08, vol: 0.25 }); tone({ f: 700, f2: 250, dur: 0.09, type: 'sawtooth', vol: 0.22 }); },
  hit:    () => tone({ f: 320, f2: 90, dur: 0.1, type: 'square', vol: 0.4 }),
  thud:   () => { tone({ f: 140, f2: 70, dur: 0.09, type: 'square', vol: 0.4 }); noise({ dur: 0.05, vol: 0.2, low: true }); },
  hurt:   () => { tone({ f: 200, f2: 60, dur: 0.25, type: 'sawtooth', vol: 0.45 }); noise({ dur: 0.12, vol: 0.25 }); },
  poof:   () => { noise({ dur: 0.22, vol: 0.35, low: true }); tone({ f: 500, f2: 100, dur: 0.2, type: 'triangle', vol: 0.3 }); },
  coin:   () => { tone({ f: 990, dur: 0.06, type: 'square', vol: 0.25 }); tone({ f: 1320, dur: 0.16, type: 'square', vol: 0.25, at: 0.06 }); },
  gem:    () => { tone({ f: 1180, dur: 0.07, type: 'triangle', vol: 0.35 }); tone({ f: 1570, dur: 0.09, type: 'triangle', vol: 0.35, at: 0.07 }); tone({ f: 2100, dur: 0.2, type: 'triangle', vol: 0.3, at: 0.15 }); },
  cray:   () => { tone({ f: 520, dur: 0.07, type: 'square', vol: 0.3 }); tone({ f: 660, dur: 0.07, type: 'square', vol: 0.3, at: 0.08 }); tone({ f: 780, dur: 0.14, type: 'square', vol: 0.3, at: 0.16 }); },
  arrow:  () => { noise({ dur: 0.07, vol: 0.18 }); tone({ f: 900, f2: 1400, dur: 0.08, type: 'square', vol: 0.14 }); },
  boom:   () => { noise({ dur: 0.45, vol: 0.6, low: true }); tone({ f: 120, f2: 35, dur: 0.4, type: 'sawtooth', vol: 0.5 }); },
  splash: () => { noise({ dur: 0.25, vol: 0.3, low: true }); tone({ f: 400, f2: 900, dur: 0.15, type: 'sine', vol: 0.18 }); },
  zap:    () => { tone({ f: 1600, f2: 300, dur: 0.12, type: 'sawtooth', vol: 0.3 }); tone({ f: 2200, f2: 500, dur: 0.1, type: 'square', vol: 0.18, at: 0.02 }); },
  freeze: () => { tone({ f: 1900, f2: 2600, dur: 0.18, type: 'triangle', vol: 0.3 }); tone({ f: 1420, dur: 0.1, type: 'triangle', vol: 0.2, at: 0.1 }); },
  burn:   () => noise({ dur: 0.2, vol: 0.25 }),
  // a chest: the lid creaks, then a treasure fanfare climbs and rings out in harmony
  chest:  () => {
    tone({ f: 140, f2: 260, dur: 0.18, type: 'triangle', vol: 0.25 }); noise({ dur: 0.1, vol: 0.12, low: true });
    [392, 440, 494, 523, 587, 659, 740, 784].forEach((f, i) => tone({ f, dur: 0.07, type: 'square', vol: 0.2, at: 0.16 + i * 0.055 }));
    for (const [f, v] of [[1047, 0.3], [784, 0.2], [659, 0.18]]) tone({ f, dur: 0.6, type: 'square', vol: v, at: 0.62 });
    [2093, 2637, 3136, 2637].forEach((f, i) => tone({ f, dur: 0.12, type: 'triangle', vol: 0.12, at: 0.68 + i * 0.09 }));
  },
  key:    () => { tone({ f: 880, dur: 0.08, type: 'triangle', vol: 0.35 }); tone({ f: 1175, dur: 0.18, type: 'triangle', vol: 0.35, at: 0.09 }); },
  door:   () => { tone({ f: 190, f2: 90, dur: 0.2, type: 'square', vol: 0.35 }); noise({ dur: 0.18, vol: 0.2, low: true }); },
  switch: () => { tone({ f: 620, dur: 0.06, type: 'square', vol: 0.3 }); tone({ f: 930, dur: 0.1, type: 'square', vol: 0.3, at: 0.06 }); },
  roar:   () => { tone({ f: 90, f2: 45, dur: 0.7, type: 'sawtooth', vol: 0.55 }); noise({ dur: 0.6, vol: 0.4, low: true }); },
  heart:  () => { tone({ f: 660, dur: 0.1, type: 'triangle', vol: 0.4 }); tone({ f: 880, dur: 0.1, type: 'triangle', vol: 0.4, at: 0.1 }); tone({ f: 1320, dur: 0.3, type: 'triangle', vol: 0.4, at: 0.2 }); },
  blip:   () => tone({ f: 1000, dur: 0.03, type: 'square', vol: 0.12 }),
  buy:    () => { tone({ f: 784, dur: 0.07, type: 'square', vol: 0.3 }); tone({ f: 1047, dur: 0.14, type: 'square', vol: 0.3, at: 0.08 }); },
  denied: () => { tone({ f: 220, dur: 0.09, type: 'square', vol: 0.3 }); tone({ f: 165, dur: 0.18, type: 'square', vol: 0.3, at: 0.1 }); },
  save:   () => { tone({ f: 587, dur: 0.08, type: 'triangle', vol: 0.35 }); tone({ f: 880, dur: 0.2, type: 'triangle', vol: 0.35, at: 0.09 }); },
  shard:  () => { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone({ f, dur: 0.16, type: 'square', vol: 0.3, at: i * 0.09 })); },
  warp:   () => { noise({ dur: 0.5, vol: 0.3 }); [440, 660, 990, 1480, 2100].forEach((f, i) => tone({ f, f2: f * 1.6, dur: 0.2, type: 'triangle', vol: 0.3, at: i * 0.06 })); },
  warpIn: () => { [2100, 1480, 990, 660].forEach((f, i) => tone({ f, f2: f * 0.7, dur: 0.14, type: 'triangle', vol: 0.26, at: i * 0.05 })); noise({ dur: 0.3, vol: 0.18 }); },
  warpOff:() => tone({ f: 420, f2: 150, dur: 0.16, type: 'triangle', vol: 0.22 }),
  winded: () => { noise({ dur: 0.2, vol: 0.2, low: true }); tone({ f: 320, f2: 170, dur: 0.18, type: 'triangle', vol: 0.16 }); },
  fanfare:() => { [392, 392, 392, 523, 659, 784].forEach((f, i) => tone({ f, dur: i === 5 ? 0.4 : 0.11, type: 'square', vol: 0.32, at: i * 0.11 })); },
  // a puggle's squeak: a quick bright chirp up and down (peep is the quiet hint version)
  peep:   () => tone({ f: 1700, f2: 2300, dur: 0.07, type: 'sine', vol: 0.14 }),
  // a puggle found: two happy squeaks, then a bouncy little "you did it!" tune
  puggle: () => { tone({ f: 1400, f2: 2100, dur: 0.08, type: 'sine', vol: 0.3 }); tone({ f: 1900, f2: 2600, dur: 0.1, type: 'sine', vol: 0.28, at: 0.1 });
    [[784, 0.22], [988, 0.3], [1175, 0.38], [988, 0.46], [1175, 0.54], [1568, 0.62]].forEach(([f, at]) => tone({ f, dur: 0.08, type: 'square', vol: 0.2, at }));
    tone({ f: 1568, dur: 0.4, type: 'triangle', vol: 0.25, at: 0.7 }); tone({ f: 1976, dur: 0.4, type: 'triangle', vol: 0.18, at: 0.7 });
    tone({ f: 2400, f2: 3200, dur: 0.1, type: 'sine', vol: 0.2, at: 1.05 }); },
  beam:   () => { tone({ f: 700, f2: 1800, dur: 0.16, type: 'sawtooth', vol: 0.16 }); tone({ f: 1400, f2: 2800, dur: 0.2, type: 'triangle', vol: 0.2, at: 0.02 }); },
  stairs: () => { [700, 560, 450, 360].forEach((f, i) => tone({ f, dur: 0.09, type: 'triangle', vol: 0.3, at: i * 0.07 })); },
  // a front door: a soft creak and a wooden bump
  house:  () => { tone({ f: 260, f2: 340, dur: 0.16, type: 'triangle', vol: 0.18 }); tone({ f: 120, f2: 80, dur: 0.1, type: 'square', vol: 0.2, at: 0.14 }); },
  // item get: a bright rising fanfare that holds its last note
  // the powers
  dig:    () => { noise({ dur: 0.1, vol: 0.25, low: true }); tone({ f: 180, f2: 110, dur: 0.08, type: 'square', vol: 0.2 }); },
  jump:   () => tone({ f: 260, f2: 720, dur: 0.16, type: 'square', vol: 0.22 }),
  land:   () => { tone({ f: 160, f2: 80, dur: 0.06, type: 'triangle', vol: 0.25 }); noise({ dur: 0.05, vol: 0.12, low: true }); },
  dash:   () => { noise({ dur: 0.18, vol: 0.3 }); tone({ f: 300, f2: 1200, dur: 0.14, type: 'sawtooth', vol: 0.14 }); },
  // alien goo: a wet, bubbling glorp
  goo:    () => { tone({ f: 180, f2: 420, dur: 0.12, type: 'sine', vol: 0.3 }); tone({ f: 240, f2: 120, dur: 0.16, type: 'triangle', vol: 0.22, at: 0.1 }); noise({ dur: 0.12, vol: 0.12, low: true }); },
  // a mallet on a plank
  hammer: () => { tone({ f: 260, f2: 140, dur: 0.06, type: 'square', vol: 0.32 }); noise({ dur: 0.05, vol: 0.25, low: true }); },
  // a god crystal: a short alien chime
  crystal:() => { tone({ f: 1320, f2: 1760, dur: 0.06, type: 'triangle', vol: 0.18 }); tone({ f: 990, dur: 0.08, type: 'sine', vol: 0.12, at: 0.05 }); },
  keepsake: () => { [523, 659, 784, 1047].forEach((f, i) => tone({ f, dur: 0.12, type: 'square', vol: 0.28, at: i * 0.1 }));
    tone({ f: 1319, dur: 0.5, type: 'triangle', vol: 0.32, at: 0.42 }); tone({ f: 1568, dur: 0.5, type: 'triangle', vol: 0.2, at: 0.42 }); },
};

// --- music ---
// Every track is a few looping lanes stepped in 8th notes. Each lane loops at its own length,
// so a one-bar drum groove can run under an eight-bar tune.
//   bass, lead  semitones above the root; '.' rests, '-' holds the note before it, '|' marks
//               bars (8 steps each, checked, so a typo can't knock a whole song off the beat)
//   chords      one chord every `chordLen` steps (default a bar): '0m' minor on the root,
//               '8M' major 8 semitones up; also d dim, a aug, s sus4. Played as a soft
//               `pad` and/or an `arp`.
//   drums       a string per drum, one character a step: k kick, s snare, h hat, t toms.
//               'x' hit, 'r' a quick double, '+' two hats, 'o' open hat, 'h'/'l' high/low
//               tom; `c: 32` crashes a cymbal every 32 steps.
// Optional: lo (lead octave), ao (arp octave), bassType, padType, echo (on the lead), dv
// (drum volume).
const N = null, H = '-';
const TRACKS = {
  // ---- out in the world
  // the title screen: a heroic march
  title: { bpm: 92, root: 130.81, type: 'square', pad: true, echo: 0.2,
    bass: '0 . 7 . 5 . 7 . | 0 . 7 . 9 . 7 . | 5 . 0 . 7 . 2 . | 0 . 7 . 0 . 7 .',
    lead: '12 - 16 19 24 - 19 16 | 12 - 16 19 21 19 16 12 | 17 - 21 24 26 - 24 - | 28 - 24 - 19 - 16 -',
    chords: '0M 5M 0M 9m 5M 7M 0M 0M', chordLen: 4,
    drums: { k: 'x...x...', s: '..x...x.', h: '.x.x.x.x', c: 32 } },
  village: { bpm: 108, root: 130.81, type: 'square', arp: true,
    bass: '0 . 0 . 5 . 5 . | 7 . 7 . 5 . 5 . | 9 . 4 . 5 . 0 . | 7 . 2 . 7 . 11 .',
    lead: '12 16 19 16 17 - 16 14 | 12 16 19 23 24 - 19 - | 21 - 19 21 24 - 21 - | 19 - 23 - 26 - 23 19',
    chords: '0M 5M 0M 5M 9m 5M 7M 7M', chordLen: 4,
    drums: { k: 'x...x...', s: '..x...x.', h: '.x.x.x.x' } },
  marsh: { bpm: 100, root: 116.54, type: 'triangle', pad: true, echo: 0.3,
    bass: '0 - - 7 - - 5 - | 0 - - 7 - - 10 - | 8 - - 3 - - 8 - | 10 - - 5 - - 7 -',
    lead: '12 - 15 - 19 17 15 - | 12 - 15 19 22 - 19 15 | 20 - 24 - 27 - 24 22 | 22 - 17 - 14 - 11 -',
    chords: '0m 0m 0m 0m 8M 8M 10M 7M', chordLen: 4,
    drums: { k: 'x.....x.|x.......', s: '........|....x...', h: '..x...x.' } },
  fire: { bpm: 132, root: 110.0, type: 'sawtooth', pad: true, arp: true,
    bass: '0 0 . 0 3 . 0 . | 5 5 . 5 3 . 1 . | 8 8 . 8 3 . 8 . | 7 7 . 7 11 . 7 .',
    lead: '12 . 12 15 17 15 12 - | 15 . 15 17 20 17 15 12 | 20 . 20 24 27 - 24 20 | 19 . 19 23 26 23 19 11',
    chords: '0m 5m 8M 7M',
    drums: { k: 'x..x.x..', s: '..x...x.', h: 'xxxxxxxx', c: 32 } },
  water: { bpm: 96, root: 123.47, type: 'triangle', pad: true, echo: 0.35,
    bass: '0 - 7 - 10 - 7 - | 5 - 12 - 10 - 7 - | 8 - 3 - 8 - 12 - | 7 - 2 - 7 - 11 -',
    lead: '15 - 19 22 - 19 15 - | 17 - 22 24 - 22 19 - | 20 - 24 - 27 - 24 22 | 26 - 23 - 19 - 14 -',
    chords: '0m 5s 8M 7M',
    drums: { k: 'x.....x.', s: '....x...', h: '..x...x.' } },
  air: { bpm: 120, root: 146.83, type: 'triangle', arp: true, echo: 0.3,
    bass: '0 - - - 7 - - - | 9 - - - 5 - - - | 5 - - - 7 - - - | 0 - - - 0 - 7 -',
    lead: '12 16 19 24 19 16 12 16 | 21 17 14 21 19 16 12 - | 17 - 21 24 26 - 23 19 | 24 - 21 19 16 - 14 -',
    chords: '0M 0M 4m 0M 5M 7M 0M 0M', chordLen: 4,
    drums: { k: 'x.......', s: '....x...', h: 'x.x.x.x.' } },
  earth: { bpm: 88, root: 98.0, type: 'square', pad: true,
    bass: '0 . 0 . 3 . 3 . | 5 . 5 . 3 . 2 . | 8 . 8 . 3 . 3 . | 7 . 7 . 2 . 7 .',
    lead: '12 - - 15 14 - 12 - | 17 - - 15 14 12 - - | 20 - - - 19 - 15 - | 19 - - 14 - - 11 -',
    chords: '0m 0m 5m 0m 8M 8M 7M 7M', chordLen: 4,
    drums: { k: 'x..x....', s: '....x...', h: 'x...x...', t: '......hl' } },
  confluence: { bpm: 80, root: 103.83, type: 'sawtooth', pad: true, echo: 0.35,
    bass: '0 . 1 . 0 . 6 . | 0 . 1 . 8 . 6 . | 1 . 2 . 1 . 7 . | 1 . 2 . 9 . 7 .',
    lead: '12 - 13 - 18 - 13 12 | . 13 - 12 20 - 18 13 | 13 - 14 - 19 - 14 13 | . 14 - 13 21 - 19 14',
    chords: '0d 0d 1d 1d',
    drums: { k: 'x.......', h: '....x...', t: '........|......ll' } },
  // indoors: slow and cozy, a music-box lead over a lazy bass
  home: { bpm: 84, root: 146.83, type: 'triangle', pad: true, echo: 0.25, dv: 0.5,
    bass: '0 - - - 5 - - - | 7 - - - 5 - 4 - | 9 - - - 4 - - - | 5 - - - 7 - - -',
    lead: '16 - 19 - 21 - 19 16 | 14 - 16 - 12 - - - | 21 - 24 - 21 - 16 - | 17 - 21 - 19 - 14 -',
    chords: '0M 5M 7M 5M 9m 9m 5M 7M', chordLen: 4,
    drums: { k: 'x.......', h: '..x...x.' } },
  // the Goo Lands: scary. A heartbeat and a ticking clock under a creepy music box, the
  // chords sliding a half step up and back like something breathing.
  goo: { bpm: 72, root: 82.41, type: 'triangle', lo: 1, pad: true, bassType: 'sawtooth', echo: 0.45, dv: 0.8,
    bass: '0 - - - - - - - | 0 - - - - - - - | 1 - - - - - - - | 1 - - - - - - - | 0 - - - - - - - | 0 - - - - - - - | 6 - - - - - - - | 3 - - - - - - -',
    lead: '19 - 24 - 23 - 19 - | 18 - - - . . . . | 20 - 25 - 24 - 20 - | 19 - - - . . . . | 24 . . 23 . . 22 . | 21 . . 20 . . 19 - | 18 - 21 - 24 - 21 - | 23 - 19 - 15 - 11 -',
    chords: '0m 0m 1m 1m 0m 0m 6d 3a',
    drums: { k: 'r...r...', h: 'x.x.x.x.' } },
  // the Platypus Kingdom: a bright royal march
  kingdom: { bpm: 104, root: 146.83, type: 'square', pad: true, echo: 0.2,
    bass: '0 . 7 . 0 . 7 . | 5 . 0 . 5 . 0 . | 7 . 2 . 7 . 2 . | 0 . 7 . 0 . 7 . | 9 . 4 . 9 . 4 . | 5 . 0 . 5 . 0 . | 2 . 9 . 2 . 9 . | 7 . 2 . 7 . 11 .',
    lead: '12 - 16 19 24 - - - | 21 - 19 17 19 - 21 - | 23 - 21 19 16 - 19 - | 24 - - - 19 - - - | 21 - 23 24 26 - 24 - | 26 - 24 - 21 - 19 - | 18 - 21 - 26 - 21 - | 26 - 23 - 19 - 23 -',
    chords: '0M 5M 7M 0M 9m 5M 2M 7M',
    drums: { k: 'x...x...', s: '..x...x.|..x...x.|..x...x.|..x.x.rr', h: 'x.x.x.x.', c: 32 } },
  // the throne room: slow and stately
  castle: { bpm: 80, root: 98.0, type: 'triangle', lo: 1, pad: true, echo: 0.3, dv: 0.4,
    bass: '0 - - - 7 - - - | 5 - - - 12 - - - | 7 - - - 2 - - - | 0 - - - 7 - - - | 9 - - - 4 - - - | 5 - - - 0 - - - | 7 - - - 2 - - - | 7 - - - 11 - - -',
    lead: '12 - - 16 19 - - - | 17 - 16 - 12 - 9 - | 19 - 23 - 26 - 23 - | 24 - - - 19 - - - | 21 - 19 - 16 - 12 - | 17 - 21 - 24 - 21 - | 26 - 24 - 23 - 21 - | 19 - - - 11 - 14 -',
    chords: '0M 5M 7M 0M 9m 5M 7M 7M',
    drums: { h: '..x...x.' } },
  // the open sea: slow rolling waves in threes, a dreamy lead floating over them
  ocean: { bpm: 76, root: 110.0, type: 'triangle', lo: 1, pad: true, arp: true, echo: 0.4, dv: 0.5,
    bass: '0 - - 7 - - 12 - | 5 - - 9 - - 12 - | -3 - - 4 - - 9 - | 7 - - 11 - - 14 - | 0 - - 7 - - 12 - | 5 - - 9 - - 12 - | 2 - - 9 - - 14 - | 7 - - 11 - - 14 -',
    lead: '16 - - 14 - - 12 - | 9 - - 12 - - 17 - | 16 - - - - - 12 - | 11 - - 14 - - 7 - | 19 - - 16 - - 12 - | 21 - - 17 - - 14 - | 14 - - 17 - - 21 - | 19 - - - 11 - 14 -',
    chords: '0M 5M 9m 7M 0M 5M 2m 7M',
    drums: { k: 'x.......', h: '...o....' } },
  victory: { bpm: 104, root: 130.81, type: 'square', pad: true,
    bass: '0 . 5 . 7 . 5 . | 0 . 5 . 9 7 5 7',
    lead: '12 16 19 24 . 19 24 - | 26 24 21 19 16 19 24 -',
    chords: '0M 0M 5M 0M', chordLen: 4,
    drums: { k: 'x...x...', s: '..x...x.', h: 'x.x.x.x.', c: 16 } },

  // ---- dungeons
  dungeon: { bpm: 112, root: 110.0, type: 'square', pad: true, echo: 0.3,
    bass: '0 . . 0 1 . . 1 | 0 . . 0 6 . 5 . | 8 . . 8 3 . . 3 | 7 . . 7 2 . . 2',
    lead: '12 - 15 - 13 - 12 - | 15 - 18 - 17 - 13 - | 20 - 19 - 20 - 24 - | 23 - 19 - 14 - 11 -',
    chords: '0m 1M 0d 1M 8M 8M 7M 7M', chordLen: 4,
    drums: { k: 'x..x....', s: '....x...', h: '..x...x.' } },
  nexus: { bpm: 124, root: 92.5, type: 'sawtooth', pad: true,
    bass: '0 0 . 0 1 1 . 1 | 3 3 . 3 1 . 6 . | 8 8 . 8 3 . 8 . | 7 7 . 7 2 . 7 .',
    lead: '12 - 13 15 - 13 12 - | 15 13 12 18 17 15 13 12 | 20 . 24 . 27 - 24 20 | 19 . 23 . 26 - 23 11',
    chords: '0m 1M 3m 1M 8M 8M 7M 7M', chordLen: 4,
    drums: { k: 'x.x.x.x.', s: '..x...x.', h: 'xxxxxxxx', c: 32 } },
  // the Star Hive's staircase: scary, and it keeps climbing a half step at a time
  hive: { bpm: 84, root: 87.31, type: 'sawtooth', pad: true, bassType: 'sawtooth', echo: 0.4,
    bass: '0 - - - 1 - - - | 3 - - - 6 - 5 - | 1 - - - 2 - - - | 4 - - - 7 - 6 -',
    lead: '12 - 13 - 15 - 13 - | 17 - 18 - 20 - 18 - | 13 - 14 - 16 - 14 - | 18 - 19 - 21 - 19 -',
    chords: '0m 3d 1m 4d',
    drums: { k: 'r...r...', h: '....x...', t: '........|......ll' } },

  // ---- fights. Big, loud and long: every main boss has its own theme.
  // minibosses, the Crucible and the movies
  boss: { bpm: 148, root: 87.31, type: 'sawtooth', lo: 1, pad: true, padType: 'sawtooth', bassType: 'sawtooth',
    bass: '0 0 3 0 0 0 5 0 | 0 0 3 0 6 5 3 1 | 8 8 3 8 8 8 3 8 | 7 7 2 7 7 7 11 7',
    lead: '12 - - 12 15 13 12 - | 12 - 17 15 13 - 12 - | 20 - - 20 24 22 20 - | 19 - - 19 23 - 19 11',
    chords: '0m 0m 8M 7M',
    drums: { k: 'x.x.x.x.', s: '..x...x.|..x...x.|..x...x.|..x.x.rr', h: '++++++++', c: 32 } },
  // Scorchjaw: a galloping fanfare in D minor
  boss_fire: { bpm: 160, root: 73.42, type: 'sawtooth', lo: 1, pad: true, padType: 'sawtooth', bassType: 'sawtooth',
    bass: '0 12 0 12 0 12 0 12 | 0 12 0 12 0 12 0 12 | -4 8 -4 8 -4 8 -4 8 | -2 10 -2 10 -2 10 -2 10 | 0 12 0 12 0 12 0 12 | 5 17 5 17 5 17 5 17 | -4 8 -4 8 -4 8 -4 8 | -5 7 -5 7 -5 7 -5 7',
    lead: '12 - 15 - 19 - 24 - | 22 24 22 19 - - 15 17 | 20 - - 17 20 - 24 - | 22 - - 19 22 - 26 - | 27 - 26 24 - 22 24 - | 29 - 27 - 24 - 20 - | 20 - 24 - 27 - 26 - | 26 - 23 - 19 - 11 -',
    chords: '0m 0m 8M 10M 0m 5m 8M 7M',
    drums: { k: 'x.x.x.x.', s: '..x...x.|..x...x.|..x...x.|..x.x.rr', h: '++++++++', c: 64 } },
  // Murkmaw: heavy waves rolling in threes, C minor
  boss_water: { bpm: 140, root: 65.41, type: 'square', lo: 1, pad: true, padType: 'sawtooth', bassType: 'sawtooth',
    bass: '0 - - 12 - - 0 12 | 8 - - 20 - - 8 20 | 5 - - 17 - - 5 17 | 7 - - 19 - - 7 19 | 0 - - 12 - - 0 12 | 8 - - 20 - - 8 20 | 3 - - 15 - - 3 15 | 7 - - 19 - - 7 11',
    lead: '19 - - 15 - - 12 - | 20 - - 24 - - 27 - | 29 - - 27 - - 24 - | 26 - - 23 - - 19 - | 24 - 26 27 - 26 24 - | 27 - - 24 - - 20 - | 22 - - 27 - - 31 - | 31 - 29 - 26 - 23 -',
    chords: '0m 8M 5m 7M 0m 8M 3M 7M',
    drums: { k: 'x..x..x.', s: '....x...', h: 'x.x.x.x.', t: '........|........|........|.....hhl', c: 64 } },
  // Galestrike: soaring over a storm of arpeggios, A minor
  boss_air: { bpm: 168, root: 110.0, type: 'square', pad: true, arp: true, ao: 1, bassType: 'sawtooth', echo: 0.25,
    bass: '0 0 0 12 0 0 0 12 | -4 -4 -4 8 -4 -4 -4 8 | 3 3 3 15 3 3 3 15 | -2 -2 -2 10 -2 -2 -2 10 | 0 0 0 12 0 0 0 12 | -4 -4 -4 8 -4 -4 -4 8 | -2 -2 -2 10 -2 -2 -2 10 | -5 -5 -5 7 -5 -5 -5 7',
    lead: '24 - - - 19 - 22 24 | 20 - - - 24 - 27 - | 27 - - 26 27 - 31 - | 29 - - - 26 - 22 - | 24 - 26 - 27 - 29 - | 31 - - - 29 - 27 - | 26 - 27 - 29 - 31 - | 31 - - - 26 - 23 -',
    chords: '0m 8M 3M 10M 0m 8M 10M 7M',
    drums: { k: 'x...x...', s: '..x...x.|..x...x.|..x...x.|..x.rrrr', h: 'xxxxxxxx', c: 64 } },
  // King Goanna: stomping drums, G minor
  boss_earth: { bpm: 124, root: 98.0, type: 'square', pad: true, padType: 'sawtooth', bassType: 'sawtooth',
    bass: '0 . 0 . 0 0 0 12 | 0 . 0 . 0 0 0 12 | -4 . -4 . -4 -4 -4 8 | -5 . -5 . -5 -5 -5 7 | 0 . 0 . 0 0 0 12 | 5 . 5 . 5 5 5 17 | -4 . -4 . -4 -4 -4 8 | -5 . -5 . -5 -5 7 11',
    lead: '12 - - 15 - - 19 - | 24 - - 22 - - 19 - | 20 - - 24 - - 27 - | 26 - - 23 - - 19 - | 27 - - 26 - - 24 - | 29 - - 27 - - 24 - | 27 - 24 - 20 - 24 - | 26 - 23 - 19 - 11 -',
    chords: '0m 0m 8M 7M 0m 5m 8M 7M',
    drums: { k: 'x...x...', s: '....x...', t: 'l.l.hhl.', h: 'x.x.x.x.', c: 64 } },
  // Apexus (and Mecha Apexus): the biggest of them all, E minor, sixteen bars
  boss_apexus: { bpm: 150, root: 82.41, type: 'sawtooth', lo: 1, pad: true, padType: 'sawtooth', bassType: 'sawtooth',
    bass: '0 12 0 12 0 12 0 12 | -4 8 -4 8 -4 8 -4 8 | 3 15 3 15 3 15 3 15 | -2 10 -2 10 -2 10 -2 10 | 0 12 0 12 0 12 0 12 | -4 8 -4 8 -4 8 -4 8 | 5 17 5 17 5 17 5 17 | -5 7 -5 7 -5 7 -5 7 | ' +
          '-4 8 -4 8 -4 8 -4 8 | -2 10 -2 10 -2 10 -2 10 | 0 12 0 12 0 12 0 12 | 0 12 0 12 0 12 0 12 | -4 8 -4 8 -4 8 -4 8 | -2 10 -2 10 -2 10 -2 10 | -5 7 -5 7 -5 7 -5 7 | -5 7 -5 7 -5 7 -5 7',
    lead: '12 - 15 19 24 - - - | 24 - 20 - 15 - 20 - | 22 - 19 - 15 - 19 22 | 26 - - - 22 - 17 - | 19 - 24 - 27 - 26 24 | 27 - - - 24 - 20 - | 24 - - 20 17 - 20 - | 26 - 23 - 19 - 11 - | ' +
          '27 - 24 - 20 - 24 - | 26 - 22 - 17 - 22 - | 24 - - - 19 - - - | 15 - 17 - 19 - 22 - | 24 - - - 27 - - - | 26 - - - 22 - 26 - | 23 - - - 26 - - - | 23 - 19 - 14 - 11 -',
    chords: '0m 8M 3M 10M 0m 8M 5m 7M 8M 10M 0m 0m 8M 10M 7M 7M',
    drums: { k: 'x.x.x.x.', s: '..x...x.|..x...x.|..x...x.|..x...x.|..x...x.|..x...x.|..x...x.|..x.rrrr', h: 'xxxxxxxx', c: 64 } },
  // Xenomantis: the fastest, nastiest loop in the game
  xeno: { bpm: 164, root: 82.41, type: 'sawtooth', lo: 1, pad: true, padType: 'sawtooth', bassType: 'sawtooth',
    bass: '0 0 6 0 0 0 5 0 | 0 0 6 0 7 6 5 1 | 8 8 2 8 8 8 3 8 | 7 7 1 7 7 7 6 1',
    lead: '12 - 18 17 12 - 13 - | 12 - 19 18 17 - 13 12 | 20 - 20 24 23 - 20 - | 19 - 19 23 26 - 23 11',
    chords: '0d 1M 8M 7M',
    drums: { k: 'xxxxxxxx', s: '..x...x.', h: 'x.x.x.x.', c: 32 } },
  // the shark fight: the sharks' two notes creeping in under it all, E minor
  sharks: { bpm: 152, root: 82.41, type: 'square', lo: 1, pad: true, padType: 'sawtooth', bassType: 'sawtooth', echo: 0.25,
    bass: '0 1 0 1 0 1 0 1 | 0 1 0 1 0 1 0 1 | -4 8 -4 8 -4 8 -4 8 | -2 10 -2 10 -2 10 -2 10 | 0 1 0 1 0 1 0 1 | 0 1 0 1 0 1 0 1 | -4 8 -4 8 -2 10 -2 10 | -5 7 -5 7 -5 7 -5 7',
    lead: '12 - - 15 19 - 17 15 | 14 15 14 12 - - . . | 20 - - 19 20 - 24 - | 22 - - 20 19 - 17 - | 12 - - 15 19 - 24 - | 26 - 24 - 22 - 19 - | 20 - 24 - 22 - 26 - | 23 - - - 19 - - -',
    chords: '0m 0m 0m 0m 8M 8M 10M 10M 0m 0m 0m 0m 8M 10M 7M 7M', chordLen: 4,
    drums: { k: 'x..x..x.', s: '....x...|....x...|..x...x.|..x...x.|..x...x.|..x...x.|..x...x.|..x.rrrr', h: 'xxxxxxxx', c: 64 } },
};

// Turn the readable strings into lanes once, up front.
function seq(src) {
  const out = [];
  for (const bar of src.split('|')) {
    const toks = bar.trim().split(/\s+/).filter(Boolean);
    if (toks.length !== 8) console.warn(`music: a bar with ${toks.length} steps: "${bar.trim()}"`);
    for (const t of toks) out.push(t === '.' ? N : t === H ? H : +t);
  }
  return out;
}
const CHORD = { m: [0, 3, 7], M: [0, 4, 7], d: [0, 3, 6], a: [0, 4, 8], s: [0, 5, 7] };
for (const tr of Object.values(TRACKS)) {
  tr.bass = seq(tr.bass); tr.lead = seq(tr.lead);
  if (tr.chords) tr.chords = tr.chords.split(/\s+/).map(c => { const [, r, q] = c.match(/^(-?\d+)([mMdas])$/); return CHORD[q].map(s => s + +r); });
  for (const k in tr.drums) if (typeof tr.drums[k] === 'string') tr.drums[k] = tr.drums[k].replace(/\|/g, '');
}

// ---- the instruments
const BASS = {
  triangle: { type: 'triangle', vol: 0.3 },
  sawtooth: { type: 'sawtooth', vol: 0.2, cutoff: 700 },
};
const PAD = {
  triangle: { type: 'triangle', vol: 0.045, attack: 0.08 },
  sawtooth: { type: 'sawtooth', vol: 0.028, attack: 0.1, cutoff: 1500, detune: [-9, 9] },
};

// One note: a gain envelope over one or more (detuned) oscillators, through an optional
// lowpass, optionally into the echo. Long notes get a little vibrato.
function note(t0, dur, f, { type = 'square', vol = 0.1, attack = 0.005, cutoff = 0, detune = [0], echo = false, vib = false }) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(vol * 0.6, t0 + Math.max(attack + 0.02, dur));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.06);
  let out = g;
  if (cutoff) { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cutoff; g.connect(lp); out = lp; }
  out.connect(musicGain);
  if (echo) out.connect(echoIn);
  let lfo = null;
  if (vib && dur > 0.3) {
    lfo = ctx.createOscillator(); lfo.frequency.value = 5.5;
    const depth = ctx.createGain(); depth.gain.value = 12;   // cents
    lfo.connect(depth);
    lfo.depth = depth;
    lfo.start(t0 + 0.15); lfo.stop(t0 + dur + 0.08);
  }
  for (const cents of detune) {
    const o = ctx.createOscillator();
    o.type = type; o.frequency.value = f; o.detune.value = cents;
    if (lfo) lfo.depth.connect(o.detune);
    o.connect(g); o.start(t0); o.stop(t0 + dur + 0.08);
  }
}

let noiseBuf = null;
function hiss(t0, dur, vol, hp) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource(); src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f); f.connect(g); g.connect(musicGain);
  src.start(t0, Math.random() * 0.5); src.stop(t0 + dur + 0.02);
}
function thump(t0, f1, f2, dur, vol, type = 'sine') {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f1, t0); o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(musicGain); o.start(t0); o.stop(t0 + dur + 0.02);
}
const DRUM = {
  kick:  (t, v) => thump(t, 150, 42, 0.16, 0.6 * v),
  snare: (t, v) => { hiss(t, 0.14, 0.2 * v, 1400); thump(t, 230, 150, 0.07, 0.14 * v, 'triangle'); },
  hat:   (t, v) => hiss(t, 0.035, 0.05 * v, 7000),
  open:  (t, v) => hiss(t, 0.2, 0.05 * v, 6000),
  tomHi: (t, v) => thump(t, 240, 150, 0.2, 0.34 * v),
  tomLo: (t, v) => thump(t, 150, 90, 0.26, 0.4 * v),
  crash: (t, v) => hiss(t, 1.1, 0.1 * v, 3500),
};

const hz = (tr, semi, oct) => tr.root * Math.pow(2, semi / 12 + oct);
// how many steps the note at i lasts: itself plus every hold after it
function held(lane, i) { let n = 1; while (i + n < lane.length && lane[i + n] === H) n++; return n; }

function playStep(tr, step, t0) {
  const beat = 60 / tr.bpm / 2, half = beat / 2;
  const melodic = (lane, oct, voice) => {
    const i = step % lane.length, v = lane[i];
    if (v !== N && v !== H) note(t0, held(lane, i) * beat * 0.92, hz(tr, v, oct), voice);
  };
  melodic(tr.bass, 0, BASS[tr.bassType || 'triangle']);
  melodic(tr.lead, tr.lo || 0, { type: tr.type, vol: 0.085, detune: [-6, 6], echo: true, vib: true });
  if (tr.chords) {
    const len = tr.chordLen || 8;
    const ch = tr.chords[Math.floor(step / len) % tr.chords.length];
    if (tr.pad && step % len === 0) for (const s of ch) note(t0, len * beat, hz(tr, s, 1), PAD[tr.padType || 'triangle']);
    if (tr.arp) note(t0, beat * 0.5, hz(tr, [ch[0], ch[1], ch[2], ch[0] + 12][step % 4], tr.ao ?? 2), { type: 'square', vol: 0.03 });
  }
  const d = tr.drums;
  if (!d) return;
  const v = tr.dv ?? 1;
  const at = (lane) => (lane ? lane[step % lane.length] : '.');
  const k = at(d.k), s = at(d.s), h = at(d.h), t = at(d.t);
  if (k === 'x') DRUM.kick(t0, v);
  else if (k === 'r') { DRUM.kick(t0, v); DRUM.kick(t0 + half, v * 0.75); }
  if (s === 'x') DRUM.snare(t0, v);
  else if (s === 'r') { DRUM.snare(t0, v * 0.7); DRUM.snare(t0 + half, v * 0.85); }
  if (h === 'x') DRUM.hat(t0, v);
  else if (h === '+') { DRUM.hat(t0, v); DRUM.hat(t0 + half, v * 0.6); }
  else if (h === 'o') DRUM.open(t0, v);
  if (t === 'h') DRUM.tomHi(t0, v);
  else if (t === 'l') DRUM.tomLo(t0, v);
  if (d.c && step % d.c === 0) DRUM.crash(t0, v);
}

function startSequencer(name) {
  stopSequencer();
  const track = TRACKS[name];
  if (!track || !ctx) return;
  current = name;
  const stepDur = 60 / track.bpm / 2;
  // a dotted-8th echo, so the repeats land on the off-beats
  echoDelay.delayTime.setValueAtTime(stepDur * 1.5, ctx.currentTime);
  echoIn.gain.setValueAtTime(track.echo ?? 0.15, ctx.currentTime);
  let step = 0;
  let nextTime = ctx.currentTime + 0.05;
  timer = setInterval(() => {
    if (!ctx) return;
    while (nextTime < ctx.currentTime + 0.15) {
      if (!muted) playStep(track, step, nextTime);
      nextTime += stepDur;
      step++;
    }
  }, 40);
}
function stopSequencer() { if (timer) { clearInterval(timer); timer = null; } current = null; }

export const audio = {
  // call once; audio actually unlocks on the first key press
  init() {
    const unlock = () => { if (ensureCtx() && ctx.state === 'suspended') ctx.resume(); };
    addEventListener('keydown', unlock);
    addEventListener('pointerdown', unlock);
  },
  sfx(name) { if (!ctx || muted) return; (SFX[name] || SFX.blip)(); },
  // rising pitch as the warp charges, so the hold has audible progress
  chargeTone(prog) {
    if (!ctx || muted) return;
    tone({ f: 320 + prog * 900, f2: 380 + prog * 1000, dur: 0.13, type: 'triangle', vol: 0.16 });
  },
  music(name) { if (!ctx) { setTimeout(() => ctx && this.music(name), 300); return; } if (current !== name) startSequencer(name); },
  stopMusic: stopSequencer,
  toggleMute() { muted = !muted; return muted; },
  get muted() { return muted; },
};
