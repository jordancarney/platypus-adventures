// Math, RNG, geometry helpers.

// Deterministic 32-bit RNG (mulberry32)
export function rng(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const irand = (r, min, max) => min + Math.floor(r() * (max - min + 1));
export const choose = (r, arr) => arr[Math.floor(r() * arr.length)];

export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);

// normalized direction from a to b (unit vector)
export function dirTo(ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1;
  return [dx / d, dy / d];
}

// axis-aligned box overlap; boxes are {x, y, w, h} with x,y = top-left
export const aabb = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export const DIRS = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] };

// simple string hash for flag keys
export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
