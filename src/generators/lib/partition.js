/*
========================================
PARTITION
========================================
* Maps to the "Partition" computation node (docs/nodes/computation/partition.md): assigns every
* position in space to a discrete region, built on top of a Distance Field's
* nearest-feature result.
*/
import { nearestPoint } from "./distanceField.js";

// Nearest-point partitioning (Voronoi regions), folded into numRegions bands.
export function partitionIndex(x, y, points, numRegions) {
   return nearestPoint(x, y, points).index % numRegions;
}
