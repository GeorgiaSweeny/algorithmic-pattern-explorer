/*
========================================
SEED POINTS
========================================
* Maps to the "Seed Points" generation node (docs/nodes/generation/seed-points.md): produces a
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

// For each point in a flat [x0, y0, x1, y1, ...] set, the distance to its
// own nearest *other* point — a generic "how close is my nearest neighbour"
// query, not specific to any one generator's meaning (see
// docs/GENERATOR_CONTRACT.md's precedent of extracting anything reusable
// out of a single generator's file). Added for voronoiIslamic.js
// (docs/VORONOI_ISLAMIC_HYBRID_PLAN.md's design decision 3.2, "v2"): a
// Voronoi cell has no fixed size the way a Grid tile does, so a rosette
// seeded at that cell needs a per-cell radius estimate rather than one
// constant shared by every cell — this is that estimate's raw input.
// O(n^2) brute force, same cost class as generateSeedPoints's own n and
// distanceField.js's nearestPoint search; fine at the point counts these
// generators use (tens to low hundreds).
export function nearestNeighbourDistances(points) {
   const n = points.length / 2;
   const dist = new Float32Array(n);
   for (let i = 0; i < n; i++) {
      let minDistSq = Infinity;
      const xi = points[i * 2], yi = points[i * 2 + 1];
      for (let j = 0; j < n; j++) {
         if (j === i) continue;
         const dx = xi - points[j * 2], dy = yi - points[j * 2 + 1];
         const distSq = dx * dx + dy * dy;
         if (distSq < minDistSq) minDistSq = distSq;
      }
      dist[i] = Math.sqrt(minDistSq);
   }
   return dist;
}
