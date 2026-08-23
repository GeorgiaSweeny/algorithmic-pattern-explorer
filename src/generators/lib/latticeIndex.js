/*
========================================
LATTICE INDEX
========================================
* Maps to the "Lattice Index" computation node (docs/nodes/computation/lattice-index.md):
* assigns a discrete colour-class index to a position within a regular,
* infinitely repeating tiling, using shape-specific coordinate arithmetic.
*
* This is NOT the same concept as Partition (lib/partition.js): Partition
* answers "which of these finitely many seed points is nearest" by search;
* a plane tiling has no finite point set to search against, so each shape
* here computes its cell index directly from closed-form coordinate math —
* an oblique basis change for triangle, cube coordinates for hexagon, a
* running-bond row offset for brick, a 45-degree-rotated frame for diamond.
* Only square needs neither: composition-research open question 1 asked
* whether this reduces to Partition; having actually worked through each
* shape's math, the answer is no — it's a genuinely distinct concept, not a
* Distance Field/Partition in disguise, and not reducible to Rotate +
* Translate + Repeat either (triangle/hexagon's basis changes are shears,
* which those nodes don't represent — Rotate specifically preserves angles
* and lengths, a shear doesn't). Given its own primitive home here instead
* of staying bespoke arithmetic inline in grid.js.
*/

// (col+row) mod n — proper n-colouring, no two orthogonal neighbours share a value.
export function squareIndex(x, y, size, numShades) {
   return _mod(Math.floor(x / size) + Math.floor(y / size), numShades);
}

// Equilateral triangle grid via oblique coordinates.
// sf + tf < 1 → up-pointing (▲); otherwise down-pointing (▽).
// Up/down triangles are never mutually adjacent (bipartite), but each is also
// adjacent to up/down triangles in neighbouring oblique cells: U(si,ti) touches
// D(si,ti), D(si-1,ti), D(si,ti-1) — three neighbours, at (si+ti) deltas of
// -1, -2, -2 from U's own (si+ti). Colouring both by (si+ti) mod numShades,
// offset by a constant between up/down, satisfies all three simultaneously for
// any numShades >= 3 (those deltas are never ≡ 0 mod n for n >= 3 — verified
// for n = 3, 4, 5, not just assumed by extending the n = 3 formula) — unlike
// banding by ti (or si) alone, this varies across both axes. numShades = 2 is
// the one case that formula can't cover (a delta of -2 collides mod 2), so it
// keeps its own simpler up/down split.
export function triangleIndex(x, y, size, numShades) {
   const t  = (2 / Math.sqrt(3)) * y / size;
   const s  = (x / size) - t / 2;
   const si = Math.floor(s), ti = Math.floor(t);
   const up = (s - si) + (t - ti) < 1;

   return numShades >= 3
      ? _mod(si + ti + (up ? 0 : -1), numShades)
      : (up ? 0 : 1);
}

// Brick units are 2:1 (width:height), rows offset by half a brick width —
// a running-bond pattern, not a square grid. Each brick touches 2 neighbours
// per side row (not 1, as in a plain square grid), so plain (col+row) mod n
// puts same-tone bricks in contact. Doubling the column resolution — fineCol,
// which increases by exactly 1 between any two touching bricks regardless of
// which row-offset direction is crossed — restores a proper n-colouring for
// any numShades >= 3 (verified for n = 3, 4, 5 by brute-force adjacency, not
// just the original n = 3 case). numShades = 2 keeps the simpler (col+row)
// mod 2 split — fineCol mod 2 doesn't hold at that modulus (two bricks a
// fineCol delta of 2 apart, e.g. same-row neighbours, would collide).
export function brickIndex(x, y, size, numShades) {
   const bw    = size * 2;
   const bh    = size;
   const row   = Math.floor(y / bh);
   const shift = (row % 2) * (bw / 2);
   const col   = Math.floor((x + shift) / bw);

   if (numShades >= 3) {
      const fineCol = 2 * col - (row % 2);
      return _mod(fineCol, numShades);
   }
   return _mod(col + row, 2);
}

// Rotate the coordinate frame 45° before applying the square grid.
export function diamondIndex(x, y, size, numShades) {
   const u = (x + y) / Math.SQRT2;
   const v = (x - y) / Math.SQRT2;
   return _mod(Math.floor(u / size) + Math.floor(v / size), numShades);
}

// Pointy-top hexagons via cube coordinates + rounding.
// Hex 2-tone: (q+r) mod 2 (the one modulus (2q+r) can't cover — a neighbour
// delta of 2 collides mod 2). Hex n-tone (n >= 3): (2q+r) mod n — the
// standard proper 3-colouring, generalised: the six neighbour deltas in
// (2q+r) are {±1, ±2}, none ≡ 0 mod n for any n >= 3 (verified for n = 3, 4,
// 5, not just assumed), so the same formula stays a proper colouring at
// every declared tones count, not just 3.
export function hexagonIndex(x, y, size, numShades) {
   const [qi, ri] = _hexCell(x, y, size);
   return numShades >= 3
      ? _mod(2 * qi + ri, numShades)
      : _mod(qi + ri, 2);
}

// Centre (centroid) of the hexagon cell (x, y) falls in — the inverse of
// _hexCell's axial-to-pixel transform. Shares the same rounding as
// hexagonIndex so "which cell" and "where is its centre" always agree;
// used by islamic.js to place a rosette at each hex tile's own centroid,
// the same way squareIndex's floor(x / size) implies a square tile centred
// at ((col + 0.5) * size, (row + 0.5) * size).
export function hexagonCentroid(x, y, size) {
   const [qi, ri] = _hexCell(x, y, size);
   return [size * Math.sqrt(3) * (qi + ri / 2), size * 1.5 * ri];
}

// Shared cube-coordinate rounding: which axial cell (qi, ri) does (x, y)
// fall in, for a pointy-top hex grid of circumradius `size`.
function _hexCell(x, y, size) {
   const q = (Math.sqrt(3) / 3 * x - y / 3) / size;
   const r = (2 / 3 * y) / size;
   const s = -q - r;

   let qi = Math.round(q), ri = Math.round(r), si = Math.round(s);
   const qd = Math.abs(qi - q), rd = Math.abs(ri - r), sd = Math.abs(si - s);
   if      (qd > rd && qd > sd) qi = -ri - si;
   else if (rd > sd)             ri = -qi - si;

   return [qi, ri];
}

function _mod(n, m) { return ((n % m) + m) % m; }
