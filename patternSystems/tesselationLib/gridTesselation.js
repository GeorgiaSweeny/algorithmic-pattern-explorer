/*
========================================
GRID TESSELATION
========================================
* Divides the canvas into a regular grid of square cells
* Returns -1 or 1 per pixel in a checkerboard arrangement
* tileSize is passed per-call from TesselatedSystem.params
-----------------------------------------
*/

export class GridTesselation {
   sample(x, y, tileShape, tileSize) {

      switch(tileShape){
         case "square":
            const cellX = Math.floor(x / tileSize);
            const cellY = Math.floor(y / tileSize);
            return (cellX + cellY) % 2 === 0 ? 1 : -1;

         case "triangle":
            const cellX = Math.floor(x / tileSize);
            const cellY = Math.floor(y / tileSize);
            return (cellX + cellY) % 2 === 0 ? 1 : -1;
      }
   }
}
