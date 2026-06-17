/*
========================================
SAMPLE PATTERN — fair isle diamond motif
========================================
A 10-stitch × 8-row repeat tiled to fill
a 40 × 40 grid. Colour 0 = background,
colour 1 = contrast.

Swap in a different MOTIF here to change
the default loaded pattern.
*/

const W = 10;
const H = 8;

// 0 = background colour, 1 = contrast colour
const MOTIF = [
   [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
   [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
   [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
   [0, 1, 0, 0, 1, 1, 0, 0, 1, 0],
   [0, 1, 0, 0, 1, 1, 0, 0, 1, 0],
   [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
   [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
   [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
];

// Tile the motif to fill a 40 × 40 grid
export const SAMPLE_GRID = Array.from({ length: 40 }, (_, row) =>
   Array.from({ length: 40 }, (_, col) => MOTIF[row % H][col % W])
);
