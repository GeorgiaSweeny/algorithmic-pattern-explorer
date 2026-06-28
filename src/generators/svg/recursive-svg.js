/*
========================================
RECURSIVE / FRACTAL — SVG RENDERER
========================================
Enumerates all black cells by walking the same recursive subdivision tree
as recursive.js. At each level the centre cell (gx === mid, gy === mid) is
black; all others recurse to depth-1. depth=0 is always white.

Element count for Sierpinski (sub=3):
  depth 1 → 1 rect   depth 4 → 585 rects
  depth 2 → 9        depth 5 → 4,681
  depth 3 → 73       depth 6 → 37,449  (large but valid SVG)
*/

export function recursiveSvg(width, height, params) {
   const { depth = 4, subdivisions: sub = 3 } = params;

   const rects = [];
   _enumerate(0, 0, width, height, depth, sub, rects);

   const rectEls = rects.map(
      ([x, y, w, h]) => `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="#000"/>`
   );

   return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#fff"/>${rectEls.join("")}</svg>`;
}

// Recursively finds all black cells and pushes their [x, y, w, h] to `out`.
function _enumerate(x, y, w, h, depth, sub, out) {
   if (depth === 0) return;   // white leaf

   const mid   = Math.floor(sub / 2);
   const cellW = w / sub;
   const cellH = h / sub;

   for (let gy = 0; gy < sub; gy++) {
      for (let gx = 0; gx < sub; gx++) {
         const cx = x + gx * cellW;
         const cy = y + gy * cellH;
         if (gx === mid && gy === mid) {
            out.push([cx, cy, cellW, cellH]);
         } else {
            _enumerate(cx, cy, cellW, cellH, depth - 1, sub, out);
         }
      }
   }
}

function r(n) { return Math.round(n * 100) / 100; }
