/*
========================================
WAVE GENERATOR
========================================
* "rings" mode composes a Distance Field (distance to the workspace centre — see
* src/generators/lib/distanceField.js) with a sine wave; "wave" mode is the sine
* wave alone, with no distance computation to decompose further.
*/

import { CANVAS } from "../config.js";
import { distanceToPoint } from "./lib/distanceField.js";

export function wave(x, y, params) {
   const { frequency = 0.05, mode = "wave" } = params;

   if (mode === "rings") {
      const radius = distanceToPoint(x, y, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2);
      return Math.sin(radius * frequency);
   }

   return Math.sin(y * frequency);
}
