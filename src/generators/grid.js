/*
========================================
GRID TESSELLATION GENERATOR
========================================
*/
// tones[0] = background (1), tones[last] = dark (-1), evenly spaced in between.
const TONES = {
   "2": [1, -1],
   "3": [1, 0, -1],
};

// Pure grid tessellation. All shape logic lives here; no class state.
export function grid(x, y, params) {
   const { shape = "square", tileSize = 40, tones = "2" } = params;
   const shades = TONES[tones] ?? TONES["2"];
   switch (shape) {
      case "square":   return _square(x, y, tileSize, shades);
      case "triangle": return _triangle(x, y, tileSize, shades);
      case "hexagon":  return _hexagon(x, y, tileSize, shades);
      case "brick":    return _brick(x, y, tileSize, shades);
      case "diamond":  return _diamond(x, y, tileSize, shades);
      default:         return 0;
   }
}

// (col+row) mod n — proper n-colouring, no two orthogonal neighbours share a value.
function _square(x, y, size, shades) {
   const idx = _mod(Math.floor(x / size) + Math.floor(y / size), shades.length);
   return shades[idx];
}

// Equilateral triangle grid via oblique coordinates.
// sf + tf < 1 → up-pointing (▲); otherwise down-pointing (▽).
// Up/down triangles are never mutually adjacent (bipartite), but each is also
// adjacent to up/down triangles in neighbouring oblique cells: U(si,ti) touches
// D(si,ti), D(si-1,ti), D(si,ti-1). Colouring both by (si+ti) mod 3, offset by
// a constant between up/down, satisfies all three simultaneously — unlike
// banding by ti (or si) alone, this varies across both axes.
function _triangle(x, y, size, shades) {
   const t  = (2 / Math.sqrt(3)) * y / size;
   const s  = (x / size) - t / 2;
   const si = Math.floor(s), ti = Math.floor(t);
   const up = (s - si) + (t - ti) < 1;

   const idx = shades.length === 3
      ? _mod(si + ti + (up ? 0 : -1), 3)
      : (up ? 0 : 1);
   return shades[idx];
}

// Brick units are 2:1 (width:height), rows offset by half a brick width —
// a running-bond pattern, not a square grid. Each brick touches 2 neighbours
// per side row (not 1, as in a plain square grid), so plain (col+row) mod 3
// puts same-tone bricks in contact. Doubling the column resolution — fineCol,
// which increases by exactly 1 between any two touching bricks regardless of
// which row-offset direction is crossed — restores a proper n-colouring.
function _brick(x, y, size, shades) {
   const bw    = size * 2;
   const bh    = size;
   const row   = Math.floor(y / bh);
   const shift = (row % 2) * (bw / 2);
   const col   = Math.floor((x + shift) / bw);

   if (shades.length === 3) {
      const fineCol = 2 * col - (row % 2);
      return shades[_mod(fineCol, 3)];
   }
   return shades[_mod(col + row, 2)];
}

// Rotate the coordinate frame 45° before applying the square grid.
function _diamond(x, y, size, shades) {
   const u = (x + y) / Math.SQRT2;
   const v = (x - y) / Math.SQRT2;
   const idx = _mod(Math.floor(u / size) + Math.floor(v / size), shades.length);
   return shades[idx];
}

// Pointy-top hexagons via cube coordinates + rounding.
// Hex 2-tone: (q+r) mod 2. Hex 3-tone: (2q+r) mod 3 — standard proper 3-colouring.
function _hexagon(x, y, size, shades) {
   const q = (Math.sqrt(3) / 3 * x - y / 3) / size;
   const r = (2 / 3 * y) / size;
   const s = -q - r;

   let qi = Math.round(q), ri = Math.round(r), si = Math.round(s);
   const qd = Math.abs(qi - q), rd = Math.abs(ri - r), sd = Math.abs(si - s);
   if      (qd > rd && qd > sd) qi = -ri - si;
   else if (rd > sd)             ri = -qi - si;

   const idx = shades.length === 3
      ? _mod(2 * qi + ri, 3)
      : _mod(qi + ri, 2);
   return shades[idx];
}

function _mod(n, m) { return ((n % m) + m) % m; }
