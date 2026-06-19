/*
========================================
TESSELATED PATTERN SYSTEM
========================================
* Dispatches to a tesselation algorithm
* Params:
   tileSize  — cell size in pixels
-----------------------------------------
*/

import { GridTesselation } from "./tesselationLib/gridTesselation.js";

export class TesselatedSystem {
   constructor() {
      this.algorithm = "grid";

      this.params = {
         tileShape: 
         tileSize: 40,
      };

      this.grid = new GridTesselation();
   }

   sample(x, y) {
      switch (this.algorithm) {
         case "grid":
            return this.grid.sample(x, y, this.params.tileSize);
         default:
            return 0;
      }
   }
}

export const tesselatedSystem = new TesselatedSystem();
