/*
========================================
ESCHER TYPE I (TRANSLATION) TESSELLATION
========================================
* Tiles the plane by pure X/Y translation.
* Opposite edges are congruent deformations, so tiles interlock perfectly.
*
* Reference:
*   NGV Digital Creatives: Tessellate by Code Workshop Instructions
*   Escher x Nendo: Between Two Worlds, National Gallery of Victoria, 2018–19
*   https://www.ngv.vic.gov.au/wp-content/uploads/2019/01/
*     NGV-Digital-Creatives-Tessellate-by-Code-Workshop-Instructions.pdf
*
* Algorithm (pixel-by-pixel):
*   For pixel (x, y) with tile size S:
*     dx = bumpX( (y mod S) / S ) * amplitude   ← horizontal edge warp at this y
*     dy = bumpY( (x mod S) / S ) * amplitude   ← vertical edge warp at this x
*     col = floor( (x - dx) / S )
*     row = floor( (y - dy) / S )
*   Tile parity = (col + row) % 2 → black or white
*
* Correctness: the deformation is periodic with period S, so the right edge of
* any tile is exactly the left edge of its right neighbour (translated S in x).
* The amplitude must be < S/2 to prevent self-overlap; we clamp to 0.38*S.
*/

export function escher(x, y, params) {
   const { tileSize = 60, bumpAmp = 10, bumpType = "wave" } = params;

   const S = tileSize;
   const A = Math.min(bumpAmp, S * 0.38);

   const normY = (((y % S) + S) % S) / S;
   const normX = (((x % S) + S) % S) / S;

   const dx = A * _bump(normY, bumpType);
   const dy = A * _bump(normX, bumpType);

   const col = Math.floor((x - dx) / S);
   const row = Math.floor((y - dy) / S);

   return (((col + row) % 2) + 2) % 2 === 0 ? 1 : -1;
}

// All functions satisfy b(0) = b(1) = 0 so tile corners align with the SVG renderer.
function _bump(t, type) {
   switch (type) {
      case "wave":   return Math.sin(Math.PI * 2 * t);
      case "zigzag": return t < 0.25 ? 4 * t : t < 0.75 ? 2 - 4 * t : 4 * t - 4;
      case "notch":  return Math.tanh(8 * Math.sin(Math.PI * 2 * t));
      default:       return Math.sin(Math.PI * 2 * t);
   }
}
