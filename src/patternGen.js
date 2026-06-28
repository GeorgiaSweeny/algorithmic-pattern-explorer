/*
========================================
PATTERN GENERATOR
========================================
*/

import { CANVAS }     from "./config.js";
import { grayscale }  from "./render.js";
import { GENERATORS } from "./generators/index.js";

export function createPattern(genName, params) {
   const fn = GENERATORS[genName];

   loadPixels();

   for (let y = 0; y < CANVAS.HEIGHT; y++) {
      for (let x = 0; x < CANVAS.WIDTH; x++) {
         const value = fn(x, y, params);
         const { r, g, b, a } = grayscale(value);
         const idx = 4 * (x + y * CANVAS.WIDTH);
         pixels[idx]     = r;
         pixels[idx + 1] = g;
         pixels[idx + 2] = b;
         pixels[idx + 3] = a;
      }
   }

   updatePixels();
}
