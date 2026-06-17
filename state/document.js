/*
========================================
PATTERN DOCUMENT — single source of truth
========================================
Everything that modifies the pattern goes
through this object. The renderer reads it;
tools write to it; export reads it.

PatternDocument shape:
  id        — unique id
  name      — display name
  width     — stitches across
  height    — number of rows
  source    — how it was created
  palette   — array of { id, name, hex, symbol }
  grid      — 2D array [row][col] of palette ids (numbers)
  metadata  — gauge, yarn weight, needle size
*/

import { DEFAULT_PALETTE } from "../data/palettes.js";

export function createDocument(options = {}) {
   const width  = options.width  ?? 40;
   const height = options.height ?? 40;

   return {
      id:      options.id     ?? crypto.randomUUID(),
      name:    options.name   ?? "Untitled Pattern",
      width,
      height,
      source:  options.source ?? "blank",   // "blank" | "library" | "generated" | "uploaded"
      palette: options.palette ?? DEFAULT_PALETTE,
      grid:    options.grid   ?? makeGrid(width, height),
      metadata: {
         gauge:      { stitches: 20, rows: 28 },  // per 10 cm
         yarnWeight: "DK",
         needleSize: "4 mm",
      },
   };
}

// Returns a blank grid filled with colour id 0 (background colour).
function makeGrid(width, height) {
   return Array.from({ length: height }, () => new Array(width).fill(0));
}
