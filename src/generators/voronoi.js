/*
========================================
VORONOI GENERATOR
========================================
*/

import { CANVAS } from "../config.js";

// Seeds are deterministic per (numCells, seed) pair. Cache avoids regenerating every pixel.
const _cache = new Map();

function generateSeeds(numCells, seed) {
   const n = Math.max(2, Math.round(numCells));
   let s = (seed >>> 0) || 1;
   const rng = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff; };
   const seeds = new Float32Array(n * 2);
   for (let i = 0; i < n; i++) {
      seeds[i * 2]     = rng() * CANVAS.WIDTH;
      seeds[i * 2 + 1] = rng() * CANVAS.HEIGHT;
   }
   return seeds;
}

// tones[0] = background (1), tones[last] = dark (-1), evenly spaced in between.
const TONES = {
   "2": [1, -1],
   "3": [1, 0, -1],
};

export function voronoi(x, y, params) {
   const { numCells = 20, seed = 1337, tones = "2" } = params;
   const key = `${numCells}|${seed}`;
   if (!_cache.has(key)) _cache.set(key, generateSeeds(numCells, seed));
   const seeds = _cache.get(key);
   const shades = TONES[tones] ?? TONES["2"];

   let minDist = Infinity, nearest = 0;
   for (let i = 0; i < seeds.length; i += 2) {
      const dx = x - seeds[i], dy = y - seeds[i + 1];
      const d  = dx * dx + dy * dy;
      if (d < minDist) { minDist = d; nearest = i; }
   }

   const idx = (nearest / 2) % shades.length;
   return shades[idx];
}
