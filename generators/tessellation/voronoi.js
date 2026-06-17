/*
========================================
VORONOI GENERATOR
========================================
*/
import { CANVAS }      from "../../core/config.js";
import { xorshift32 }  from "../../core/rng.js";

// Seeds are deterministic per (numCells, seed, canvas size). Cache avoids regenerating every pixel.
const _cache = new Map();

function generateSeeds(numCells, seed) {
   const n     = Math.max(2, Math.round(numCells));
   const state = { s: (seed >>> 0) || 1 };
   const seeds = new Float32Array(n * 2);
   for (let i = 0; i < n; i++) {
      seeds[i * 2]     = xorshift32(state) * CANVAS.WIDTH;
      seeds[i * 2 + 1] = xorshift32(state) * CANVAS.HEIGHT;
   }
   return seeds;
}

export function voronoi(x, y, params) {
   const { numCells = 20, seed = 1337 } = params;
   const key = `${numCells}|${seed}|${CANVAS.WIDTH}|${CANVAS.HEIGHT}`;
   if (!_cache.has(key)) _cache.set(key, generateSeeds(numCells, seed));
   const seeds = _cache.get(key);

   let minDist = Infinity, nearest = 0;
   for (let i = 0; i < seeds.length; i += 2) {
      const dx = x - seeds[i], dy = y - seeds[i + 1];
      const d  = dx * dx + dy * dy;
      if (d < minDist) { minDist = d; nearest = i; }
   }

   return (nearest / 2) % 2 === 0 ? 1 : -1;
}
