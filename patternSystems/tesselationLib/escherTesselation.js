/*
========================================
ESCHER TESSELATION ALGORITHM
========================================
For any shape to tessellate, the internal angles that meet at any 
given point (vertex) must sum to exactly \(360^{\circ }\). If the 
angles add up to less than \(360^{\circ }\), there will be a gap; 
if they add up to more, the shapes will overlap
*/

import { CANVAS } from "../config.js";
import { equilateralTriangle } from "../../utils/equilateraltriangle.js";

export class Escher {
   constructor() {

      this.init();
   }

   // natural tesselation of regular polygons:
   // 360 / n = internal angle
   // ia * n == 360

   //Initialize lattice grid
   initShape(n) {
      // intialize canvas centre point (centroid)
      let cx;
      let cy;

      cx = CANVAS.CENTROID[0];
      cy = CANVAS.CENTROID[1];

      let shape;
      shape = 0;

      switch (type) {
         case "square":
            let square;

            square = rectangle(x, y, width, width);
            shape = square;
            break;

         case "triangle":
            let equilateralTriangle;

            equilateralTriangle = equilateralTriangle(w, h);
            shape = equilateralTriangle;
            break;

         case "hexagon":
            let regularHexagon;

            regularHexagon = regularHexagon(w, h);
            shape = regularHexagon;
            break;
      }
      // change pivot to shape centroid
      // snap shape to centre of canvas
      // initalize tesselated grid

   }
}