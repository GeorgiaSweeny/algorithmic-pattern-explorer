/*
========================================
GRID TESSELLATION GENERATOR
========================================
*/
// Pure grid tessellation. All shape logic lives here; no class state.
export function grid(x, y, params) {
   const { shape = "square", tileSize = 40 } = params;
   switch (shape) {
      case "square":   return _square(x, y, tileSize);
      case "triangle": return _triangle(x, y, tileSize);
      case "hexagon":  return _hexagon(x, y, tileSize);
      case "brick":    return _brick(x, y, tileSize);
      case "diamond":  return _diamond(x, y, tileSize);
      default:         return 0;
   }
}

function _square(x, y, size) {
   return (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0 ? 1 : -1;
}

// Equilateral triangle grid via oblique coordinates.
// sf + tf < 1 → up-pointing (▲); otherwise down-pointing (▽).
function _triangle(x, y, size) {
   const t  = (2 / Math.sqrt(3)) * y / size;
   const s  = (x / size) - t / 2;
   const sf = s - Math.floor(s);
   const tf = t - Math.floor(t);
   return (sf + tf < 1) ? 1 : -1;
}

// Offset alternating rows by half a cell.
function _brick(x, y, size) {
   const row   = Math.floor(y / size);
   const shift = (row % 2) * (size / 2);
   const col   = Math.floor((x + shift) / size);
   return (col + row) % 2 === 0 ? 1 : -1;
}

// Rotate the coordinate frame 45° before applying the square grid.
function _diamond(x, y, size) {
   const u = (x + y) / Math.SQRT2;
   const v = (x - y) / Math.SQRT2;
   return (Math.floor(u / size) + Math.floor(v / size)) % 2 === 0 ? 1 : -1;
}

// Pointy-top hexagons via cube coordinates + rounding.
function _hexagon(x, y, size) {
   const q = (Math.sqrt(3) / 3 * x - y / 3) / size;
   const r = (2 / 3 * y) / size;
   const s = -q - r;

   let qi = Math.round(q), ri = Math.round(r), si = Math.round(s);
   const qd = Math.abs(qi - q), rd = Math.abs(ri - r), sd = Math.abs(si - s);
   if      (qd > rd && qd > sd) qi = -ri - si;
   else if (rd > sd)             ri = -qi - si;

   return (((qi + ri) % 2) + 2) % 2 === 0 ? 1 : -1;
}
