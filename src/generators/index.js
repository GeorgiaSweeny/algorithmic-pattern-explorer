/*
========================================
INDEX - GENERATOR LOOKUP TABLE
========================================
*/
import { noise }     from "./noise.js";
import { grid }      from "./grid.js";
import { wave }      from "./wave.js";
import { voronoi }   from "./voronoi.js";
import { recursive } from "./recursive.js";
import { escher }    from "./escher.js";

// Registry: generator name (string) → pure function (x, y, params) → [-1, 1]
export const GENERATORS = { noise, grid, wave, voronoi, recursive, escher };
