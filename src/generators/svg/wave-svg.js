/*
========================================
WAVE — SVG RENDERER
========================================
Wave stripes:  SVG <linearGradient> tiled via <pattern> — one gradient tile
               per sine period, repeating across the canvas height.

Concentric rings: concentric filled circles drawn outside-in, one per pixel
                  of radius, colour sampled from sin(r·frequency). Visually
                  identical to the raster output.

Both match the grayscale mapping in render.js: c = (sin+1) × 127.5
*/

export function waveSvg(width, height, params) {
   const { mode = "wave", frequency = 0.05 } = params;
   return mode === "rings"
      ? _rings(width, height, frequency)
      : _stripes(width, height, frequency);
}

// ── Wave stripes ──────────────────────────────────────────────────────────────
// sin(y·f): at y=0, sin=0 → #7f7f7f. One period = 2π/f px tall.
// Gradient stops: gray → white → gray → black → gray over one period.

function _stripes(W, H, f) {
   const period = r(2 * Math.PI / f);

   const gradient = [
      `<linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">`,
      `<stop offset="0%"   stop-color="#7f7f7f"/>`,
      `<stop offset="25%"  stop-color="#ffffff"/>`,
      `<stop offset="50%"  stop-color="#7f7f7f"/>`,
      `<stop offset="75%"  stop-color="#000000"/>`,
      `<stop offset="100%" stop-color="#7f7f7f"/>`,
      `</linearGradient>`,
      `<pattern id="wp" x="0" y="0" width="${W}" height="${period}" patternUnits="userSpaceOnUse">`,
      `<rect width="${W}" height="${period}" fill="url(#wg)"/>`,
      `</pattern>`,
   ].join("");

   return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${gradient}</defs><rect width="${W}" height="${H}" fill="url(#wp)"/></svg>`;
}

// ── Concentric rings ──────────────────────────────────────────────────────────
// Draws filled circles outside-in. Each circle is coloured by sin(r·f).

function _rings(W, H, f) {
   const cx   = W / 2;
   const cy   = H / 2;
   const maxR = Math.ceil(Math.sqrt(cx * cx + cy * cy));

   const parts = [];
   for (let rad = maxR; rad >= 0; rad--) {
      const c   = Math.round((Math.sin(rad * f) + 1) * 127.5);
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${_gray(c)}"/>`);
   }

   return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="hidden">${parts.join("")}</svg>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _gray(c) {
   const h = c.toString(16).padStart(2, "0");
   return `#${h}${h}${h}`;
}

function r(n) { return Math.round(n * 100) / 100; }
