/*
========================================
PATTERN EXECUTOR
========================================
* Pixel-level evaluation pipeline.
* Receives a pattern object and a resolved params snapshot.
* Derives the generator from pattern.generator — executor has no
* independent knowledge of generator identity.
*
* Contract:
*   createPattern(pattern, params)
*   pattern.generator → GENERATORS key
*   params            → plain object from PatternLoader.resolve()
-----------------------------------------
*/

import { CANVAS }     from "../core/config.js";
import { GENERATORS } from "../generators/index.js";

export function createPattern(pattern, params) {
   const fn     = GENERATORS[pattern.generator];
   const width  = CANVAS.WIDTH;
   const height = CANVAS.HEIGHT;

   loadPixels();

   // Single Uint32 write per pixel (ABGR little-endian) instead of 4 byte writes.
   const buf32 = new Uint32Array(pixels.buffer);

   for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
         const c = ((fn(x, y, params) + 1) * 127.5) | 0;
         buf32[x + y * width] = (255 << 24) | (c << 16) | (c << 8) | c;
      }
   }

   updatePixels();
}
