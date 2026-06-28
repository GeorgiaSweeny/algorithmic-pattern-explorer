
/*
========================================
NOISE GENERATOR
========================================
*/
import { Perlin } from "../patternSystems/noiseLib/perlinNoise.js";

// Seed-keyed cache so we never rebuild the permutation table mid-frame.
const _perlinCache = new Map();
function getPerlin(seed) {
   if (!_perlinCache.has(seed)) _perlinCache.set(seed, new Perlin(seed));
   return _perlinCache.get(seed);
}

// fBm Perlin noise.
// mode "ridge" → sharp ridgelines via 1 - 2|raw|
export function noise(x, y, params) {
   const {
      scale       = 0.01,
      seed        = 1337,
      octaves     = 1,
      lacunarity  = 2.0,
      persistence = 0.5,
      mode        = "standard",
   } = params;

   const perlin = getPerlin(seed);

   let sum = 0, amplitude = 1, frequency = 1, normalization = 0;
   for (let i = 0; i < octaves; i++) {
      sum           += amplitude * perlin.noise2D(x * scale * frequency, y * scale * frequency);
      normalization += amplitude;
      amplitude     *= persistence;
      frequency     *= lacunarity;
   }

   const raw = sum / normalization;
   return mode === "ridge" ? 1 - 2 * Math.abs(raw) : raw;
}
