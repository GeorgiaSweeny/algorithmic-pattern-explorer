/*
========================================
INDEX - GENERATOR LOOKUP TABLE
========================================
*/
import { grid }      from "./tessellation/grid.js";
import { wave }      from "./wave/wave.js";
import { recursive } from "./recursive/recursive.js";
import { voronoi }   from "./tessellation/voronoi.js";

// Registry: generator name (string) → pure function (x, y, params) → [-1, 1]
export const GENERATORS = { grid, wave, recursive, voronoi };
