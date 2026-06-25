/*
========================================
GRID TESSELLATION — SVG RENDERER
========================================
Generates a standalone SVG string for each tessellation shape.
Mirrors the math in generators/grid.js but emits vector primitives
instead of per-pixel scalar values.

API:  gridSvg(width, height, params) → SVG string
*/

const SQ3 = Math.sqrt(3);

export function gridSvg(width, height, params) {
   const { shape = "square", tileSize: s = 40 } = params;

   const parts = [];

   switch (shape) {
      case "square":   _square(parts, width, height, s);   break;
      case "brick":    _brick(parts, width, height, s);    break;
      case "hexagon":  _hexagon(parts, width, height, s);  break;
      case "triangle": _triangle(parts, width, height, s); break;
      case "diamond":  _diamond(parts, width, height, s);  break;
   }

   return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" overflow="hidden">${parts.join("")}</svg>`;
}

// ── Square ────────────────────────────────────────────────────────────────────
// (col + row) % 2 === 0 → white, else black

function _square(parts, W, H, s) {
   const cols = Math.ceil(W / s) + 1;
   const rows = Math.ceil(H / s) + 1;
   for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
         if ((col + row) % 2 === 0) continue;   // white is background fill
         parts.push(_rect(col * s, row * s, s, s, "#000"));
      }
   }
   parts.unshift(_rect(0, 0, W, H, "#fff"));    // background
}

// ── Brick ─────────────────────────────────────────────────────────────────────
// Mirrors _brick in grid.js: row offset shifts x by size/2 on odd rows.
// col = floor((x + shift) / size), parity = (col + row) % 2

function _brick(parts, W, H, s) {
   const rows = Math.ceil(H / s) + 1;
   parts.push(_rect(0, 0, W, H, "#fff"));
   for (let row = 0; row < rows; row++) {
      const shift = (row % 2) * (s / 2);
      const colStart = -1;
      const colEnd   = Math.ceil((W + shift) / s) + 1;
      for (let col = colStart; col < colEnd; col++) {
         if ((col + row) % 2 === 0) continue;
         parts.push(_rect(col * s - shift, row * s, s, s, "#000"));
      }
   }
}

// ── Diamond ───────────────────────────────────────────────────────────────────
// Mirrors _diamond: rotated square grid. u=(x+y)/√2, v=(x-y)/√2.
// Cell (qu,qv) center in pixel space:
//   x_c = (qu + qv + 1) * s / √2
//   y_c = (qu - qv)     * s / √2
// Diamond corners: (x_c ± s/√2, y_c) and (x_c, y_c ± s/√2)

function _diamond(parts, W, H, s) {
   const half = s / SQ3 * SQ3;      // s/√2 * √2 simplifies, but let's be explicit
   const h    = s / Math.SQRT2;     // half-diagonal length
   const n    = Math.ceil((W + H) / s) + 2;

   parts.push(_rect(0, 0, W, H, "#fff"));

   for (let qu = -n; qu <= n; qu++) {
      for (let qv = -n; qv <= n; qv++) {
         if ((qu + qv) % 2 === 0) continue;   // white cells skipped
         const cx = (qu + qv + 1) * s / Math.SQRT2;
         const cy = (qu - qv)     * s / Math.SQRT2;
         // rough cull — skip if center is more than one full diagonal outside
         if (cx < -h * 2 || cx > W + h * 2 || cy < -h * 2 || cy > H + h * 2) continue;
         parts.push(_poly([cx, cy - h, cx + h, cy, cx, cy + h, cx - h, cy], "#000"));
      }
   }
}

// ── Hexagon ───────────────────────────────────────────────────────────────────
// Pointy-top hexagons in axial coordinates (q, r).
// Pixel center: x = s*(√3*q + √3/2*r),  y = s*(3/2*r)
// Parity: ((qi+ri)%2+2)%2 === 0 → white, else black

function _hexagon(parts, W, H, s) {
   const rMax = Math.ceil(H / (1.5 * s)) + 2;
   const qMax = Math.ceil(W / (SQ3 * s)) + 2;

   parts.push(_rect(0, 0, W, H, "#fff"));

   for (let r = -2; r <= rMax; r++) {
      for (let q = -qMax; q <= qMax; q++) {
         if (((q + r) % 2 + 2) % 2 === 0) continue;
         const cx = s * (SQ3 * q + SQ3 / 2 * r);
         const cy = s * (1.5 * r);
         if (cx < -s * 2 || cx > W + s * 2 || cy < -s * 2 || cy > H + s * 2) continue;
         parts.push(_hexPoly(cx, cy, s));
      }
   }
}

function _hexPoly(cx, cy, s) {
   const pts = [];
   for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (Math.PI / 3) * i;   // 30° start for pointy-top
      pts.push(cx + s * Math.cos(a), cy + s * Math.sin(a));
   }
   return _poly(pts, "#000");
}

// ── Triangle ──────────────────────────────────────────────────────────────────
// Oblique coordinate system: t = 2y/(√3*s),  os = x/s - t/2
// Each oblique cell (os_i, ot_i) contains two triangles:
//   up   (sf+tf < 1): white  → corners at (os,ot), (os+1,ot), (os,ot+1)
//   down (sf+tf ≥ 1): black  → corners at (os+1,ot), (os+1,ot+1), (os,ot+1)
// Oblique → pixel:  x = os*s + ot*s/2,  y = ot*s*√3/2

function _triangle(parts, W, H, s) {
   const otMax = Math.ceil(2 * H / (SQ3 * s)) + 2;
   const osMax = Math.ceil(W / s) + otMax + 2;

   parts.push(_rect(0, 0, W, H, "#fff"));   // white = up-triangle color

   // Only emit down (black) triangles — white is the background.
   for (let ot = -1; ot <= otMax; ot++) {
      for (let os = -otMax - 1; os <= osMax; os++) {
         // down-triangle corners in oblique: (os+1,ot), (os+1,ot+1), (os,ot+1)
         const pts = [
            _triPx(os + 1, ot,     s),
            _triPx(os + 1, ot + 1, s),
            _triPx(os,     ot + 1, s),
         ];
         const xs = pts.map(p => p[0]);
         const ys = pts.map(p => p[1]);
         const midX = (xs[0] + xs[1] + xs[2]) / 3;
         const midY = (ys[0] + ys[1] + ys[2]) / 3;
         if (midX < -s || midX > W + s || midY < -s || midY > H + s) continue;
         parts.push(_poly(pts.flat(), "#000"));
      }
   }
}

function _triPx(os, ot, s) {
   return [os * s + ot * s / 2, ot * s * SQ3 / 2];
}

// ── SVG primitives ────────────────────────────────────────────────────────────

function _rect(x, y, w, h, fill) {
   return `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="${fill}"/>`;
}

function _poly(coords, fill) {
   const pts = [];
   for (let i = 0; i < coords.length; i += 2) {
      pts.push(`${r(coords[i])},${r(coords[i + 1])}`);
   }
   return `<polygon points="${pts.join(" ")}" fill="${fill}"/>`;
}

function r(n) { return Math.round(n * 100) / 100; }
