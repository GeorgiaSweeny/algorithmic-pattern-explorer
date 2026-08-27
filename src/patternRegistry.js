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

// Shared `tones` + `colour1`..`colour5` param block for every vector
// generator whose renderer reads discrete tone-indexed colours via
// lib/colourMapping.js's `toneSet`/`svgFillsFor` (voronoi, grid, escher,
// islamic) — added so every such pattern exposes the full 2-5 tone range
// and per-tone colour pickers the same way islamic-rosette originally
// did, rather than each entry hand-copying (and drifting from) the same
// six-param block. `colourN` only shown once `tones` declares that many;
// defaults are a monotonic white-to-black ramp (islamic-svg.js's
// DEFAULT_COLOURS, now lib/colourMapping.js's, shared by every SVG
// renderer this feeds) so every tones count still renders greyscale
// until a user picks otherwise — see docs/ISLAMIC_PATTERN_CONSTRUCTION.md.
function tonesAndColourParams(defaultTones = "2") {
   return [
      { param: "tones", control: "select", label: "Tones",
        options: ["2", "3", "4", "5"], value: defaultTones },
      { param: "colour1", control: "color", label: "Colour 1", value: "#ffffff" },
      { param: "colour2", control: "color", label: "Colour 2", value: "#bfbfbf" },
      { param: "colour3", control: "color", label: "Colour 3", value: "#808080",
        visibleIf: (p) => Number(p.tones) >= 3 },
      { param: "colour4", control: "color", label: "Colour 4", value: "#404040",
        visibleIf: (p) => Number(p.tones) >= 4 },
      { param: "colour5", control: "color", label: "Colour 5", value: "#000000",
        visibleIf: (p) => Number(p.tones) >= 5 },
   ];
}

// colour1 (light/background, value = +1) + colour2 (dark/primary,
// value = -1) — for every pattern whose output is inherently two-valued
// or a continuous gradient rather than a 2-5 declared `tones` count
// (which uses tonesAndColourParams() above instead): raster patterns
// with no SVG renderer to read colour1..colour5 (Perlin/Ridge Noise,
// Perlin Sierpinski, Voronoi Islamic — read by render.js's mapColour,
// a 2-stop linear interpolation shared by every raster pattern, see its
// own header comment for why one gradient primitive covers both
// continuous and discrete/binary output), and vector patterns whose
// underlying generator has no `tones` concept at all (Wave Stripes,
// Concentric Rings — a continuous sine value; Sierpinski Carpet,
// Recursive Grid — a binary filled/empty test), read directly by each
// pattern's own SVG renderer.
function twoColourParams() {
   return [
      { param: "colour1", control: "color", label: "Colour 1 (light)", value: "#ffffff" },
      { param: "colour2", control: "color", label: "Colour 2 (dark)",  value: "#000000" },
   ];
}

// Ordered simplest → most complex (docs/MOSCOW_PRIORITIES.md's open
// "core/intermediate/advanced difficulty ordering" item): categories run
// from the fewest/most-familiar workflow stages (Wave: one periodic
// function) up through recursion (Fractal) — see docs/nodes/WORKFLOWS.md's
// own section order, kept in sync with this file. The two Hybrid entries
// are deliberately separated out and listed last, after every
// single-concept pattern, since each one only makes sense once its own
// two ingredient generators (Noise+Fractal, Voronoi+Islamic) are already
// understood on their own — see App.jsx's groupByCategory, which renders
// Generator Selection in this exact array order.
export const REGISTRY = [

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
         ...twoColourParams(),
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
         ...twoColourParams(),
      ],
   },

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
         ...twoColourParams(),
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
         ...twoColourParams(),
         { param: "seed",        archetype: "Seed",       value: 1337 },
      ],
      actions: [{ label: "Randomize Seed", method: "randomize" }],
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
         ...tonesAndColourParams(),
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
         ...tonesAndColourParams(),
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
         ...tonesAndColourParams(),
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
         ...tonesAndColourParams(),
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
         ...tonesAndColourParams(),
         { param: "tileSize", archetype: "Size", value: 40, map: [10, 120] },
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
         ...tonesAndColourParams(),
         { param: "tileSize",  archetype: "Size",       value: 60, map: [20, 120] },
         { param: "bumpAmp",   archetype: "Complexity", value: 3,  map: [2, 25]  },
      ],
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
         ...tonesAndColourParams(),
         { param: "seed",     archetype: "Seed",    value: 1337 },
      ],
      actions: [{ label: "Randomize Seed", method: "randomize" }],
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
         { param: "tileShape", control: "select", label: "Tile Shape",
           options: ["square", "hexagon"], value: "square" },
         ...tonesAndColourParams(),
         { param: "tileSize",  archetype: "Size",       value: 100, map: [40, 200] },
         { param: "scale",     archetype: "Size",       value: 0.42, map: [0.2, 0.48] },
         { param: "segments",  archetype: "Complexity", value: 8,   map: [3, 16]   },
         { param: "frequency", archetype: "Detail",     value: 3,    map: [1, 6] },
         { param: "lineWidth", archetype: "Threshold",  value: 0.06, map: [0.01, 0.15] },
         // Snapped internally to 180/segments (see islamic.js's
         // snapRotation) — the slider itself stays a plain 0-360 degree
         // range so any two adjacent 180/segments positions are always
         // reachable regardless of segments, rather than a segments-
         // dependent max that would need recomputing per segments value.
         { param: "rotation",  archetype: "Rotation",   value: 0,   map: [0, 360] },
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
         // Fixed at 3 in the classic carpet, but recursive.js's construction
         // doesn't actually require that — recursive-grid (below) already
         // exposes the same param for its own mode, and sierpinski mode
         // handles any subdivisions >= 2 exactly as generically (see
         // recursive.js: `mid = Math.floor(subdivisions / 2)` isn't
         // special-cased to 3), so there's a real off-canonical variant
         // here worth letting a user explore rather than hiding it.
         { param: "subdivisions", archetype: "Detail", value: 3, map: [2, 6] },
         // firstOccurrenceOnly: this generator's node graph repeats one
         // Subdivide node per depth level (workflows.js's STEP_DEFS), so
         // `depth` would otherwise show as an editable slider on every one
         // of them — editing it from any of them changes the whole repeat
         // count, not just that step, which reads as broken rather than a
         // real per-node control. Shown only on the first occurrence;
         // subsequent ones get an explanatory note instead (WorkflowNode.jsx).
         { param: "depth",        archetype: "Complexity", value: 4, map: [1, 6], firstOccurrenceOnly: true },
         ...twoColourParams(),
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
         // See sierpinski's own `depth` entry above for why firstOccurrenceOnly.
         { param: "depth",        archetype: "Complexity", value: 3, map: [1, 6], firstOccurrenceOnly: true },
         { param: "subdivisions", archetype: "Detail",     value: 4, map: [2, 9] },
         ...twoColourParams(),
      ],
   },

   // ── Hybrid — stochastic/deterministic composition ─────────────────────────
   // A single generator whose `amplitude` param sweeps continuously from
   // fully deterministic (0, byte-identical to Sierpinski Carpet) toward
   // noise-dominated — see docs/ALGORITHMIC_COMPOSITION_RESEARCH.md's
   // secondary research question and recursiveNoise.js's header comment.
   // Listed after every single-concept pattern (see this file's own header
   // comment) since it only makes sense once Noise and Fractal are already
   // understood separately.

   {
      id:           "perlin-sierpinski",
      name:         "Perlin Sierpinski",
      category:     "Hybrid",
      generator:    "recursiveNoise",
      spectrum:     0.5,
      nativeFormat: "raster",
      params: [
         // See sierpinski's own `depth` entry (above, recursive.js) for why
         // firstOccurrenceOnly — same node-count-per-depth-level structure.
         { param: "depth",     archetype: "Complexity", value: 4,   map: [1, 6],   firstOccurrenceOnly: true },
         { param: "amplitude", archetype: "Randomness",  value: 0,   map: [0, 0.5] },
         // noise.js's own scale/octaves, passed straight through to the
         // same noise() calls — same params, same registry ranges as
         // noise.js's own entries, not a re-derived pair. Gives a second
         // axis (warp texture) independent of amplitude (warp strength).
         { param: "scale",     archetype: "Density",     value: 0.01, map: [0.001, 0.05] },
         { param: "octaves",   archetype: "Detail",      value: 2,    map: [1, 8] },
         ...twoColourParams(),
         { param: "seed",      archetype: "Seed",        value: 1337 },
      ],
      actions: [{ label: "Randomize Seed", method: "randomize" }],
   },

   // ── Hybrid — Voronoi-seeded Islamic tiling ─────────────────────────────────
   // Seed Points (stochastic) feeding straight into islamic.js's own
   // silhouette/banding pipeline (deterministic) — see
   // src/generators/voronoiIslamic.js and docs/VORONOI_ISLAMIC_HYBRID_PLAN.md.
   // Params are exactly islamic.js's construction params plus voronoi.js's
   // point-source params (numCells, seed) plus the shared raster
   // colour1/colour2 gradient (this hybrid is raster-only, so it uses
   // that convention rather than colour1..colour5 — see
   // twoColourParams() above). Listed last, after Voronoi Islamic's own
   // two ingredient patterns (Voronoi Cells, Islamic Rosette) — see this
   // file's own header comment.

   {
      id:           "voronoi-islamic",
      name:         "Voronoi Islamic",
      category:     "Hybrid",
      generator:    "voronoiIslamic",
      spectrum:     0.55,
      nativeFormat: "raster",
      params: [
         { param: "numCells",  archetype: "Density",    value: 15,   map: [5, 80]   },
         { param: "segments",  archetype: "Complexity", value: 7,    map: [3, 16]   },
         { param: "scale",     archetype: "Size",       value: 0.35, map: [0.2, 0.48] },
         { param: "frequency", archetype: "Detail",     value: 2,    map: [1, 6]    },
         { param: "lineWidth", archetype: "Threshold",  value: 0.05, map: [0.01, 0.15] },
         { param: "tones",     control: "select", label: "Tones",
           options: ["2", "3", "4", "5"], value: "2" },
         // Reused from islamic.js's own construction unchanged (see
         // voronoiIslamic.js's header comment, section 3.3: segments/
         // rotation/scale are held uniform across cells) — snapped
         // internally to 180/segments (islamic.js's snapRotation), same
         // 0-360 slider convention as islamic-rosette's own rotation.
         { param: "rotation",  archetype: "Rotation",   value: 0,   map: [0, 360] },
         // Opt-in, default 0 (exact uniform-construction baseline — see
         // voronoiIslamic.js's cellVariation): above 0, each cell's own
         // segments/rotation independently diverge from the base values
         // above, for a more organic, less repetitive result. Reuses the
         // "Randomness" archetype perlin-sierpinski's amplitude already
         // uses, not a new one.
         { param: "variation", archetype: "Randomness", value: 0,   map: [0, 1] },
         ...twoColourParams(),
         { param: "seed",      archetype: "Seed",       value: 1337 },
      ],
      actions: [{ label: "Randomize Seed", method: "randomize" }],
   },

];
