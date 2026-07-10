/*
========================================
PATTERN REGISTRY
========================================
* Semantic recipes only. Each entry declares:
*   generator  — key into GENERATORS (pure math function)
*   params[]   — parameter schema:
*       { param, archetype, value, map }        → archetype slider
*       { param, control, label, options, value } → raw control
*       { param, value }                         → fixed, no UI
*
* Generators own math. Patterns own meaning.
*
* STATIC — this object is never mutated at runtime.
* Live parameter state is owned by PatternBinder (one instance per active pattern).
-----------------------------------------
*/

export const REGISTRY = [

   // ── Noise — predominantly stochastic ──────────────────────────────────────

   {
      id:           "perlin-noise",
      name:         "Perlin Noise",
      category:     "Noise",
      generator:    "noise",
      spectrum:     0.10,
      nativeFormat: "raster",
      params: [
         { param: "mode",        value: "standard" },
         { param: "scale",       archetype: "Density",    value: 0.01, map: [0.001, 0.05] },
         { param: "octaves",     archetype: "Detail",     value: 1,    map: [1, 8] },
         { param: "lacunarity",  archetype: "Complexity", value: 2.0,  map: [1.0, 4.0] },
         { param: "persistence", archetype: "Threshold",  value: 0.5,  map: [0.1, 0.9] },
         { param: "seed",        archetype: "Seed",       value: 1337 },
      ],
      actions: [{ label: "Randomize Seed", method: "randomize" }],
   },

   {
      id:           "ridge-noise",
      name:         "Ridge Noise",
      category:     "Noise",
      generator:    "noise",
      spectrum:     0.15,
      nativeFormat: "raster",
      params: [
         { param: "mode",        value: "ridge" },
         { param: "scale",       archetype: "Density",    value: 0.01, map: [0.001, 0.05] },
         { param: "octaves",     archetype: "Detail",     value: 4,    map: [1, 8] },
         { param: "lacunarity",  archetype: "Complexity", value: 2.0,  map: [1.0, 4.0] },
         { param: "persistence", archetype: "Threshold",  value: 0.5,  map: [0.1, 0.9] },
         { param: "seed",        archetype: "Seed",       value: 1337 },
      ],
      actions: [{ label: "Randomize Seed", method: "randomize" }],
   },

   // ── Hybrid — stochastic input, deterministic construction ─────────────────

   {
      id:           "voronoi-cells",
      name:         "Voronoi Cells",
      category:     "Voronoi",
      generator:    "voronoi",
      spectrum:     0.45,
      nativeFormat: "vector",
      params: [
         { param: "numCells", archetype: "Density", value: 20, map: [5, 80] },
         { param: "tones",    control: "select", label: "Tones",
           options: ["2", "3"], value: "2" },
         { param: "seed",     archetype: "Seed",    value: 1337 },
      ],
      actions: [{ label: "Randomize Seed", method: "randomize" }],
   },

   // ── Wave — mostly deterministic ───────────────────────────────────────────

   {
      id:           "wave-stripes",
      name:         "Wave Stripes",
      category:     "Wave",
      generator:    "wave",
      spectrum:     0.75,
      nativeFormat: "vector",
      params: [
         { param: "mode",      value: "wave" },
         { param: "frequency", archetype: "Density", value: 0.05, map: [0.005, 0.15] },
      ],
   },

   {
      id:           "concentric-rings",
      name:         "Concentric Rings",
      category:     "Wave",
      generator:    "wave",
      spectrum:     0.75,
      nativeFormat: "vector",
      params: [
         { param: "mode",      value: "rings" },
         { param: "frequency", archetype: "Density", value: 0.05, map: [0.005, 0.15] },
      ],
   },

   // ── Fractal — highly deterministic ────────────────────────────────────────

   {
      id:           "sierpinski",
      name:         "Sierpinski Carpet",
      category:     "Fractal",
      generator:    "recursive",
      spectrum:     0.95,
      nativeFormat: "vector",
      params: [
         { param: "mode",         value: "sierpinski" },
         { param: "subdivisions", value: 3 },
         { param: "depth",        archetype: "Complexity", value: 4, map: [1, 6] },
      ],
   },

   {
      id:           "recursive-grid",
      name:         "Recursive Grid",
      category:     "Fractal",
      generator:    "recursive",
      spectrum:     0.90,
      nativeFormat: "vector",
      params: [
         { param: "mode",         value: "grid" },
         { param: "depth",        archetype: "Complexity", value: 3, map: [1, 6] },
         { param: "subdivisions", archetype: "Detail",     value: 4, map: [2, 9] },
      ],
   },

   // ── Tiles — highly deterministic ──────────────────────────────────────────

   {
      id:           "square-grid",
      name:         "Square Grid",
      category:     "Tiles",
      generator:    "grid",
      spectrum:     0.95,
      nativeFormat: "vector",
      params: [
         { param: "shape",    value: "square" },
         { param: "tones",    control: "select", label: "Tones",
           options: ["2", "3"], value: "2" },
         { param: "tileSize", archetype: "Size", value: 40, map: [10, 120] },
      ],
   },

   {
      id:           "hex-grid",
      name:         "Hex Grid",
      category:     "Tiles",
      generator:    "grid",
      spectrum:     0.95,
      nativeFormat: "vector",
      params: [
         { param: "shape",    value: "hexagon" },
         { param: "tones",    control: "select", label: "Tones",
           options: ["2", "3"], value: "2" },
         { param: "tileSize", archetype: "Size", value: 30, map: [10, 120] },
      ],
   },

   {
      id:           "triangle-grid",
      name:         "Triangle Grid",
      category:     "Tiles",
      generator:    "grid",
      spectrum:     0.95,
      nativeFormat: "vector",
      params: [
         { param: "shape",    value: "triangle" },
         { param: "tones",    control: "select", label: "Tones",
           options: ["2", "3"], value: "2" },
         { param: "tileSize", archetype: "Size", value: 40, map: [10, 120] },
      ],
   },

   {
      id:           "brick-grid",
      name:         "Brick",
      category:     "Tiles",
      generator:    "grid",
      spectrum:     0.95,
      nativeFormat: "vector",
      params: [
         { param: "shape",    value: "brick" },
         { param: "tones",    control: "select", label: "Tones",
           options: ["2", "3"], value: "2" },
         { param: "tileSize", archetype: "Size", value: 40, map: [10, 120] },
      ],
   },

   {
      id:           "diamond-grid",
      name:         "Diamond",
      category:     "Tiles",
      generator:    "grid",
      spectrum:     0.95,
      nativeFormat: "vector",
      params: [
         { param: "shape",    value: "diamond" },
         { param: "tones",    control: "select", label: "Tones",
           options: ["2", "3"], value: "2" },
         { param: "tileSize", archetype: "Size", value: 40, map: [10, 120] },
      ],
   },

   // ── Islamic Geometric Patterns — deterministic radial symmetry ────────────
   // Distance to a deterministic ring of construction points (Construction
   // Circle + Radial Divisions), reusing Voronoi's nearest-point search with a
   // fixed angular point set instead of a random one — see src/generators/islamic.js.

   {
      id:           "islamic-rosette",
      name:         "Islamic Rosette",
      category:     "Islamic",
      generator:    "islamic",
      spectrum:     0.95,
      nativeFormat: "vector",
      params: [
         { param: "mode",      value: "rosette" },
         { param: "tones",     control: "select", label: "Tones",
           options: ["2", "3"], value: "2" },
         { param: "tileSize",  archetype: "Size",       value: 100, map: [40, 200] },
         { param: "segments",  archetype: "Complexity", value: 8,   map: [4, 16]   },
         { param: "frequency", archetype: "Detail",     value: 0.15, map: [0.05, 0.4] },
      ],
   },

   {
      id:           "islamic-star-lines",
      name:         "Islamic Star Lines",
      category:     "Islamic",
      generator:    "islamic",
      spectrum:     0.95,
      nativeFormat: "vector",
      params: [
         { param: "mode",      value: "star-lines" },
         { param: "tileSize",  archetype: "Size",       value: 100, map: [40, 200] },
         { param: "segments",  archetype: "Complexity", value: 8,   map: [4, 16]   },
         { param: "frequency", archetype: "Density",    value: 0.2, map: [0.05, 0.5] },
      ],
   },

   // ── Escher Type I — translation tessellation ──────────────────────────────
   // A single tile shape repeated across the plane by pure X/Y translation.
   // Opposite edges are congruent so tiles interlock with no rotation or reflection.

   {
      id:           "escher-translation",
      name:         "Translation (Type I)",
      category:     "Escher",
      generator:    "escher",
      spectrum:     0.95,
      nativeFormat: "vector",
      params: [
         { param: "baseShape", control: "select", label: "Base Polygon",
           options: ["square", "hexagon"], value: "square" },
         { param: "bumpType",  control: "select", label: "Edge Shape",
           options: ["wave", "zigzag", "notch"], value: "wave" },
         { param: "tones",     control: "select", label: "Tones",
           options: ["2", "3"], value: "2" },
         { param: "tileSize",  archetype: "Size",       value: 60, map: [20, 120] },
         { param: "bumpAmp",   archetype: "Complexity", value: 3,  map: [2, 25]  },
      ],
   },

];
