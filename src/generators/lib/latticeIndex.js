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
// D(si,ti), D(si-1,ti), D(si,ti-1). Colouring both by (si+ti) mod 3, offset by
// a constant between up/down, satisfies all three simultaneously — unlike
// banding by ti (or si) alone, this varies across both axes.
export function triangleIndex(x, y, size, numShades) {
   const t  = (2 / Math.sqrt(3)) * y / size;
   const s  = (x / size) - t / 2;
   const si = Math.floor(s), ti = Math.floor(t);
   const up = (s - si) + (t - ti) < 1;

   return numShades === 3
      ? _mod(si + ti + (up ? 0 : -1), 3)
      : (up ? 0 : 1);
}

// Brick units are 2:1 (width:height), rows offset by half a brick width —
// a running-bond pattern, not a square grid. Each brick touches 2 neighbours
// per side row (not 1, as in a plain square grid), so plain (col+row) mod 3
// puts same-tone bricks in contact. Doubling the column resolution — fineCol,
// which increases by exactly 1 between any two touching bricks regardless of
// which row-offset direction is crossed — restores a proper n-colouring.
export function brickIndex(x, y, size, numShades) {
   const bw    = size * 2;
   const bh    = size;
   const row   = Math.floor(y / bh);
   const shift = (row % 2) * (bw / 2);
   const col   = Math.floor((x + shift) / bw);

   if (numShades === 3) {
      const fineCol = 2 * col - (row % 2);
      return _mod(fineCol, 3);
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
// Hex 2-tone: (q+r) mod 2. Hex 3-tone: (2q+r) mod 3 — standard proper 3-colouring.
export function hexagonIndex(x, y, size, numShades) {
   const q = (Math.sqrt(3) / 3 * x - y / 3) / size;
   const r = (2 / 3 * y) / size;
   const s = -q - r;

   let qi = Math.round(q), ri = Math.round(r), si = Math.round(s);
   const qd = Math.abs(qi - q), rd = Math.abs(ri - r), sd = Math.abs(si - s);
   if      (qd > rd && qd > sd) qi = -ri - si;
   else if (rd > sd)             ri = -qi - si;

   return numShades === 3
      ? _mod(2 * qi + ri, 3)
      : _mod(qi + ri, 2);
}

function _mod(n, m) { return ((n % m) + m) % m; }
