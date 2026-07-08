/*
========================================
SEED POINTS
========================================
* Maps to the "Seed Points" generation node (docs/nodes/seed-points.md): produces a
* set of 2D positions from a Seed, used as anchors by downstream computation
* (Distance Field, Partition). Currently used by Voronoi; any future generator that
* needs a random point cloud (e.g. a Voronoi-seeded hybrid) draws from here too.
*/
import { xorshift32Unit } from "./rng.js";
import { CANVAS } from "../../config.js";

// Uniform distribution over the canvas. Returns a flat [x0, y0, x1, y1, ...] array.
export function generateSeedPoints(numPoints, seed) {
   const n = Math.max(2, Math.round(numPoints));
   const random = xorshift32Unit(seed);
   const points = new Float32Array(n * 2);
   for (let i = 0; i < n; i++) {
      points[i * 2]     = random() * CANVAS.WIDTH;
      points[i * 2 + 1] = random() * CANVAS.HEIGHT;
   }
   return points;
}
