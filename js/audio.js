// WebAudio: synthesized sound effects + tiny chiptune music sequencer. No assets.

let ctx = null, master = null, musicGain = null, sfxGain = null;
let muted = false, current = null, timer = null;

function ensureCtx() {
  if (ctx) return true;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.55; sfxGain.connect(master);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.32; musicGain.connect(master);
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
  chest:  () => { tone({ f: 523, dur: 0.09, type: 'square', vol: 0.3 }); tone({ f: 659, dur: 0.09, type: 'square', vol: 0.3, at: 0.09 }); tone({ f: 784, dur: 0.09, type: 'square', vol: 0.3, at: 0.18 }); tone({ f: 1047, dur: 0.25, type: 'square', vol: 0.35, at: 0.27 }); },
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
  stairs: () => { [700, 560, 450, 360].forEach((f, i) => tone({ f, dur: 0.09, type: 'triangle', vol: 0.3, at: i * 0.07 })); },
};

// --- music: step-sequenced loops. Notes are semitones above the track root; null = rest. ---
const N = null;
const TRACKS = {
  title: { bpm: 92, root: 130.81, bass: [0,N,7,N, 5,N,7,N, 0,N,7,N, 9,N,7,N], lead: [12,N,16,19, 24,N,19,16, 12,N,16,19, 21,19,16,12], type: 'square' },
  village: { bpm: 108, root: 130.81, bass: [0,N,0,N, 5,N,5,N, 7,N,7,N, 5,N,5,N], lead: [12,16,19,16, 17,N,16,14, 12,16,19,23, 24,N,19,N], type: 'square' },
  marsh: { bpm: 100, root: 116.54, bass: [0,N,N,7, N,N,5,N, 0,N,N,7, N,N,10,N], lead: [12,N,15,N, 19,17,15,N, 12,N,15,19, 22,N,19,15], type: 'triangle' },
  fire: { bpm: 132, root: 110.0, bass: [0,0,N,0, 3,N,0,N, 5,5,N,5, 3,N,1,N], lead: [12,N,12,15, 17,15,12,N, 15,N,15,17, 20,17,15,12], type: 'sawtooth' },
  water: { bpm: 96, root: 123.47, bass: [0,N,7,N, 10,N,7,N, 5,N,12,N, 10,N,7,N], lead: [15,N,19,22, N,19,15,N, 17,N,22,24, N,22,19,N], type: 'triangle' },
  air: { bpm: 120, root: 146.83, bass: [0,N,N,N, 7,N,N,N, 9,N,N,N, 5,N,N,N], lead: [12,16,19,24, 19,16,12,16, 21,17,14,21, 19,16,12,N], type: 'triangle' },
  earth: { bpm: 88, root: 98.0, bass: [0,N,0,N, 3,N,3,N, 5,N,5,N, 3,N,2,N], lead: [12,N,N,15, 14,N,12,N, 17,N,N,15, 14,12,N,N], type: 'square' },
  confluence: { bpm: 80, root: 103.83, bass: [0,N,1,N, 0,N,6,N, 0,N,1,N, 8,N,6,N], lead: [12,N,13,N, 18,N,13,12, N,13,N,12, 20,18,13,N], type: 'sawtooth' },
  dungeon: { bpm: 112, root: 110.0, bass: [0,N,N,0, 1,N,N,1, 0,N,N,0, 6,N,5,N], lead: [12,N,15,N, 13,N,12,N, 15,N,18,N, 17,N,13,N], type: 'square' },
  nexus: { bpm: 124, root: 92.5, bass: [0,0,N,0, 1,1,N,1, 3,3,N,3, 1,N,6,N], lead: [12,N,13,15, N,13,12,N, 15,13,12,18, 17,15,13,12], type: 'sawtooth' },
  boss: { bpm: 148, root: 87.31, bass: [0,0,3,0, 0,0,5,0, 0,0,3,0, 6,5,3,1], lead: [12,N,N,12, 15,13,12,N, 12,N,17,15, 13,N,12,N], type: 'sawtooth' },
  victory: { bpm: 104, root: 130.81, bass: [0,N,5,N, 7,N,5,N, 0,N,5,N, 9,7,5,7], lead: [12,16,19,24, N,19,24,N, 26,24,21,19, 16,19,24,N], type: 'square' },
};

function playStep(track, step, t0) {
  const st = step % track.bass.length;
  const play = (semi, oct, vol, type, dur) => {
    if (semi === N) return;
    const f = track.root * Math.pow(2, (semi + oct * 12) / 12);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(musicGain);
    o.start(t0); o.stop(t0 + dur + 0.02);
  };
  const beat = 60 / track.bpm / 2; // 8th notes
  play(track.bass[st], 0, 0.32, 'triangle', beat * 0.95);
  play(track.lead[st], 0, 0.16, track.type, beat * 0.9);
  if (st % 4 === 0) { // soft percussive tick
    const len = Math.floor(ctx.sampleRate * 0.03);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain(); g.gain.value = 0.12;
    src.connect(g); g.connect(musicGain); src.start(t0);
  }
}

function startSequencer(name) {
  stopSequencer();
  const track = TRACKS[name];
  if (!track || !ctx) return;
  current = name;
  let step = 0;
  let nextTime = ctx.currentTime + 0.05;
  const stepDur = 60 / track.bpm / 2;
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
