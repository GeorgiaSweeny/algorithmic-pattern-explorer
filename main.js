/*
========================================
MAIN — P5 ENTRY POINT
========================================
*/
import { CANVAS }                                          from "./core/config.js";
import { createPattern }                                   from "./runtime/patternExecutor.js";
import { initUI, getActiveLoader } from "./ui/ui.js";

function setup() {
   pixelDensity(1);
   createCanvas(CANVAS.WIDTH, CANVAS.HEIGHT).parent("canvas-container");
   initUI(
      () => redraw(),
      (w, h) => { CANVAS.WIDTH = w; CANVAS.HEIGHT = h; resizeCanvas(w, h); redraw(); },
   );

}

function draw() {
   clear();
   const loader = getActiveLoader();
   createPattern(loader.pattern, loader.resolve());
   noLoop();
}

window.setup = setup;
window.draw  = draw;
