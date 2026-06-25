/*
========================================
WAVE GENERATOR
========================================
*/

import { CANVAS } from "../config.js";

export function wave(x, y, params) {
   const { frequency = 0.05, mode = "wave" } = params;

   if (mode === "rings") {
      const dx = x - CANVAS.WIDTH  / 2;
      const dy = y - CANVAS.HEIGHT / 2;
      return Math.sin(Math.sqrt(dx * dx + dy * dy) * frequency);
   }

   return Math.sin(y * frequency);
}
