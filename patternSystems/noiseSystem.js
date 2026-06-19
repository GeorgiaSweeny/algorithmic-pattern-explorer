/*
========================================
NOISE-BASED PATTERN SYSTEM
========================================
* Generates raw noise values
* noiseSystem owns:
   scale
   octaves
   noise algorithm
   pixel generation
-----------------------------------------
*/

import { CANVAS } from "../config.js";
import { Perlin } from "./noiseLib/perlinNoise.js";
import { grayscale } from "../render.js";

export class NoiseSystem {
   constructor() {
      this.algorithm = "perlin"; //TODO: refactor to select from library
      this.scale = 0.01;
      //this.octaves = 1;

      this.perlin = new Perlin(1337);
      //this.simplex = new Simplex();
      //this.value = new Value();
   }

   //TODO: refactor to select from library
   sample(x, y) {
      const nx = x * this.scale;
      const ny = y * this.scale;

      switch (this.algorithm) {
         case "perlin":
            return this.perlin.noise2D(nx, ny);
         //TODO
         /*
         case "simplex":
            return this.simplex.noise(nx, ny);
         case "value":
            return this.value.noise(nx, ny);
         default:
            return 0;
         */
      }
   }

   randomize() {
   this.perlin.reseed(Date.now());
   }
}

export const noiseSystem = new NoiseSystem();
