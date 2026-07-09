/*
========================================
DISTANCE FIELD
========================================
* Maps to the "Distance Field" computation node (docs/nodes/computation/distance-field.md):
* the minimum Euclidean distance from a point to a set of features, and which
* feature was nearest. Partition builds on this directly.
*/

// Brute-force nearest-point search (O(points.length) per query — see
// docs/benchmark-results.md for the measured cost as numCells scales).
export function nearestPoint(x, y, points) {
   let minDistSq = Infinity, nearestIndex = 0;
   for (let i = 0; i < points.length; i += 2) {
      const dx = x - points[i], dy = y - points[i + 1];
      const distSq = dx * dx + dy * dy;
      if (distSq < minDistSq) { minDistSq = distSq; nearestIndex = i / 2; }
   }
   return { index: nearestIndex, distSq: minDistSq };
}

// The single-feature case of a Distance Field: Euclidean distance from (x, y) to one
// fixed point (e.g. the workspace centre for a concentric-rings pattern).
export function distanceToPoint(x, y, px, py) {
   const dx = x - px, dy = y - py;
   return Math.sqrt(dx * dx + dy * dy);
}
