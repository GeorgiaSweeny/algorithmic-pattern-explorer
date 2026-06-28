/*
========================================
SKETCH (P5 CANVAS)
========================================
*/
import { CANVAS }                              from "./config.js";
import { createPattern }                       from "./patternGen.js";
import { initUI, getActiveGenName, getActiveBinder } from "./ui.js";

function setup() {
   pixelDensity(1);
   createCanvas(CANVAS.WIDTH, CANVAS.HEIGHT).parent("canvas-container");
   initUI(() => redraw());
}

function draw() {
   clear();
   createPattern(getActiveGenName(), getActiveBinder().resolve());
   noLoop();
}

window.setup = setup;
window.draw  = draw;
