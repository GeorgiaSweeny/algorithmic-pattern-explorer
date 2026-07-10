# Generator Workflows

This document is the bridge between the node library (`docs/nodes/`), the
primitive library (`src/generators/lib/`), and the seven generators actually
registered in `src/patternRegistry.js`. For each generator it states the
linear node sequence the ReactFlow workflow view (`docs/UI_DESIGN.md`) should
render, cross-checked against what the generator's source code actually
computes — not the aspirational description in `README.md` or
`docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`.

Each workflow follows `docs/UI_DESIGN.md`'s rules: primarily linear, nodes
hidden (not shown as no-ops) when the current parameter values don't need
them, one node per meaningful conceptual stage. Every node named below has an
entry in `docs/nodes/`; a **Gap** callout marks anywhere the code needs
something the node library doesn't yet cleanly provide.

Read this alongside `docs/GENERATOR_CONTRACT.md` (the `lib/` ↔ node mapping
table) and `docs/ALGORITHMIC_COMPOSITION_RESEARCH.md` (the combinator-vocabulary
analysis of the same seven generators, one level more abstract than this
document's node-by-node view).

---

## 1. Perlin / Ridge Noise (`noise.js`)

```
Workspace → Seed → Noise → Colour Mapping → Render
```

- **Seed** initialises the Perlin permutation table (`rng.js` underlies
  `patternSystems/noiseLib/perlinNoise.js`).
- **Noise** is one node covering the whole fBm octave loop — `mode: standard`
  vs `mode: ridge` is a parameter on this node (see `docs/nodes/core/noise.md`),
  not two different nodes, since the ridge fold is one extra line over the
  same loop.
- 5 steps total. No conditional nodes — both registry entries (`perlin-noise`,
  `ridge-noise`) use every stage.

**Gap, now closed**: the fBm octave loop used to live inline in `noise.js`,
not as a separate `lib/` primitive the way every other generator's stages did.
Extracted as `lib/fold.js` (`foldOctaves`) — the ridge fold (`mode: ridge`)
stays inline in `noise.js` since it's one line applied *after* the fold
completes, not part of the fold itself. `noise.js` now calls `foldOctaves`
directly; `noise.property.test.js` passes unchanged (behaviour-preserving),
and `lib.fold.test.js` tests the fold combinator independently of Perlin
noise entirely.

---

## 2. Voronoi Diagrams (`voronoi.js`)

```
Workspace → Seed → Seed Points → Distance Field → Colour Mapping → Render
```

- **Seed Points** (`lib/seedPoints.js`) scatters `numCells` points with the
  shared xorshift RNG.
- **Distance Field** (`lib/distanceField.js`, `nearestPoint`) finds the
  nearest seed point per pixel.
- **Colour Mapping** (`lib/colourMapping.js`, `toneSet`) turns `index %
  tones.length` into an output tone.
- 6 steps. No conditional nodes.

No gaps — every stage is already its own `lib/` module. This was originally
the cleanest full decomposition among the six pre-existing generators; all
seven are now fully decomposed (see the gap-summary table at the end of this
document), but Voronoi's is still the simplest to read end-to-end.

---

## 3. Escher-Inspired Tessellations (`escher.js`)

```
Workspace → Base Geometry (tile size) → Edge Deformation → Colour Mapping → Render
```

- **Base Geometry** here is just `tileSize` — `escher.js` has no separate
  shape-type choice (Type I translation tessellation always starts from a
  square tile; see the file's own header comment).
- **Edge Deformation** (`lib/edgeDeformation.js`, `bump`) is applied
  cross-forked: the *y*-position drives the horizontal edge warp (`dx`) and
  the *x*-position drives the vertical edge warp (`dy`) — the one cross-fork
  composition pattern across all seven generators
  (`docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`). This is a single node in the
  workflow view even though it's evaluated twice internally; the fork isn't
  something a learner needs a second node to see, the Documentation Panel
  text for Edge Deformation is where it's explained.
- 5 steps.

**Gap, now closed**: `docs/nodes/pattern/base-tile.md` used to exist as a
*separate* node from `docs/nodes/core/base-geometry.md`, both claiming to be
"Used By: Escher Tessellations" and both describing "the starting shape a
tessellation builds from" — `escher.js` only actually needs one concept here
(`tileSize`). Retired `pattern/base-tile.md`; `core/base-geometry.md` now
states Escher's case explicitly (a single square tile sized by Cell Size, no
Shape Type choice) instead of leaving it implicit. Base Tile's one
unabsorbed parameter (Aspect Ratio) wasn't migrated — `escher.js` never read
it, so it wasn't describing anything real.

---

## 4. Recursive / Fractal (`recursive.js`) — two distinct modes

```
"sierpinski" mode: Workspace → Base Geometry (unit square) → Subdivide ×depth (with exclusion) → Colour Mapping → Render
"grid" mode:       Workspace → Base Geometry (unit square) → Subdivide ×depth (with parity)    → Colour Mapping → Render
```

- **Subdivide** (`lib/subdivide.js`, `subdivideCell`) is applied `depth`
  times either way, each level remapping into `[0,1)` for the next level —
  see `docs/nodes/pattern/subdivide.md` (Repeat/Power, not a fixed-arity
  compose — `docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`). What differs between
  modes is what each level's step does with its cell coordinates once
  computed, not the repetition mechanism itself:
  - **`sierpinski`**: a level whose cell is the centre cell stops the repeat
    immediately (a hole, Sierpinski Carpet's defining feature). Reaching
    `depth` levels without ever landing on the centre fills the pixel.
  - **`grid`**: no early exit — every level's `(gx + gy)` parity accumulates
    into a running total (mod 2), and the *final* parity, after all `depth`
    levels, picks the colour. This is still self-similar the same way
    `sierpinski` is (`recursive.property.test.js` proves the exact
    composition: the value at depth *d* equals the value at depth *d − 1* on
    the remapped point, sign-flipped iff the top level's own cell parity was
    odd) — it just never removes area, so the result is a fractal
    checkerboard rather than a carpet with holes. This is genuinely
    different from `grid.js`'s flat tiling (`docs/nodes/computation/lattice-index.md`):
    a plain tiling's colour only depends on one level's cell, `recursive.js`'s
    `grid` mode depends on every level's cell.
- The stepping-through-algorithm view (`docs/UI_DESIGN.md`) shows this as
  `depth` repeated Subdivide steps, each one level deeper, rather than one
  node evaluated once — the recursion *is* the thing being taught here, in
  both modes.
- 4 conceptual stages, `depth`-many Subdivide instances at runtime, for
  either mode.

**Gap, now closed**: `recursive.js`'s `mode` param used to be read but have
no effect — both registry entries (`sierpinski`, `recursive-grid`) produced
identical patterns, which would have meant the same five-node graph shown
twice under different names. Resolved by giving `grid` mode a genuinely
different step function (parity accumulation instead of centre-cell
exclusion) rather than a different name for the same computation — see
above. `recursive.property.test.js` now separately covers both modes,
including a mode-composition test for `grid` and a divergence test
confirming `sierpinski` produces a hole where `grid` produces a real colour
at the same point.

**Gap, now closed**: the recursion itself (`_recurse` in `recursive.js`) used
to be hand-rolled, not built from a generic `repeat` `lib/` primitive.
Extracted as `lib/repeat.js` (`repeat`) — `recursive.js` now calls it
directly, with each mode supplying its own step function. `lib.repeat.test.js`
tests the repeat combinator independently of Subdivide entirely.

---

## 5. Grid Tessellations (`grid.js`)

```
Workspace → Base Geometry (shape) → Lattice Index → Colour Mapping → Render
```

**5 steps, identical for every shape** (square, triangle, hexagon, brick,
diamond) — resolved from what used to be the most significant gap in this
document.

**Gap, now closed.** `docs/UI_DESIGN.md` used to document Grid Tessellation
(triangle) as an 8-step `Workspace → Base Geometry → Rotate → Translate →
Repeat X → Repeat Y → Colour Mapping → Render` sequence, conditionally
shortened per shape. But `grid.js` never called anything resembling Rotate,
Translate, Repeat X or Repeat Y for any shape — each shape function computed
a discrete cell index directly from closed-form coordinate arithmetic
(oblique coordinates for triangle, cube coordinates for hexagon, a
running-bond offset for brick, a 45°-rotated frame for diamond), with no
intermediate geometry a Rotate or Translate node could meaningfully show.

This was the same question as `docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`'s
open question 1 (whether the per-shape arithmetic reduces to `partition.js`),
approached from the workflow-legibility side instead of the composition-theory
side — and working through the actual math answers both at once: **no, it
isn't Partition in disguise** (Partition searches a finite point set; a
tiling has no finite point set to search — the resolution below computes each
cell directly), **and it isn't Rotate+Translate+Repeat either** (triangle and
hexagon's coordinate changes are shears, which the Rotate node — rotation
about a pivot, preserving angles and lengths — doesn't represent; forcing
them through Rotate would misrepresent the maths to a learner). The honest
resolution was a new, distinct node:

- Extracted every shape's index arithmetic into
  `src/generators/lib/latticeIndex.js` (`squareIndex`, `triangleIndex`,
  `hexagonIndex`, `brickIndex`, `diamondIndex`) — `grid.js` now composes
  these instead of holding the arithmetic inline. `grid.property.test.js`
  passes unchanged (behaviour-preserving).
- Added the **Lattice Index** node
  (`docs/nodes/computation/lattice-index.md`): "assigns a discrete
  colour-class index to a position within a regular, infinitely repeating
  tiling" — genuinely one node, since every shape's computation has the same
  shape (position → coordinate change → index), even though the coordinate
  change itself differs per shape.
- Updated `docs/UI_DESIGN.md`'s worked example (both "Algorithm Workflow" and
  "Stepping Through Algorithms") to the accurate 4-step sequence above, with
  no more per-shape conditional Rotate/Translate nodes.

This was the plan's highest-flagged overrun risk for the Aug 2–6 ReactFlow
block (`docs/plan-checklist.md`) — resolved before that block starts, not
discovered mid-build.

---

## 6. Wave / Concentric Rings (`wave.js`)

```
"wave" mode:  Workspace → Waveform → Colour Mapping → Render
"rings" mode: Workspace → Distance Field → Waveform → Colour Mapping → Render
```

- **Waveform** (`lib/waveform.js`, `sineWave` — new, see below) applies
  `sin(value * frequency)` to either the raw *y* coordinate (`wave` mode) or
  a Distance Field output (`rings` mode, distance to the workspace centre).
- 4 steps (`wave`) or 5 steps (`rings`) — Distance Field is the one
  conditionally-visible node, present only in `rings` mode.

**Gap, now closed**: before this document, `wave.js`'s `Math.sin(...)` call
was a bare leaf with no corresponding node — `docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`
explicitly names `wave.js` (`wave` mode) as "no primitive composition, a base
case." That's a real hole in the node library: the workflow view had nowhere
to put the one computation `wave.js`'s simplest mode actually does. Added
`lib/waveform.js` (`sineWave`) and `docs/nodes/computation/waveform.md` to
close it, and refactored `wave.js` to call it instead of inlining `Math.sin`
(behaviour-preserving — same formula, existing property tests in
`wave.property.test.js` pass unchanged). This is also what `islamic.js`'s
`star-lines` mode reuses (§7) — one new node, immediately shared by two
generators, which is exactly the "small fixed vocabulary" the primary
research question is asking about.

---

## 7. Islamic Geometric Patterns (`islamic.js`) — new

```
"rosette" mode:    Workspace → Grid → Construction Circle → Radial Divisions → Distance Field → Colour Mapping → Render
"star-lines" mode: Workspace → Grid → Construction Circle → Radial Divisions → Distance Field → Waveform → Colour Mapping → Render
```

### Design decision: scoped down from the reference research, on purpose

`docs/references/Maths to Magic and Visual Wizardry...pdf` (this project's
own prior R&D — a Houdini digital asset) builds Islamic geometric patterns
by: translating an initial shape off-centre (Rule 1), rotating and
boolean-duplicating it *n* times around a construction circle (Rules 2–4),
mapping the resulting motif onto a tessellated grid of tiles, and optionally
boolean-clipping the overlap at tile edges. That pipeline is built for an
*artist-facing authoring tool* — its whole point (per the paper's own aims)
is maximum controllable variety within a shape-grammar system.

That is not this project's brief. `docs/PROJECT_SPECIFICATION.md` and
`docs/UI_DESIGN.md` are explicit that this application "should not function
as a visual programming language" and users "cannot construct arbitrary node
graphs" — each generator is one fixed, curated workflow, not a shape-grammar
authoring surface. Reproducing the Houdini tool's boolean-CSG shape grammar
here would (a) not fit the `generator(x, y, params) => [-1, 1]` pure-function
contract every other generator satisfies — CSG boolean union is a
discrete-geometry operation, not a per-pixel scalar field — and (b) rebuild
exactly the "flexible authoring" surface the spec says this project
deliberately excludes.

**What was kept from the reference research**: the *mechanism*, read at the
right level of abstraction. "Rotate and boolean-union *n* copies of a shape
around a circle" and "place *n* points evenly around that circle and ask
which is nearest, per pixel" are the same underlying idea — *n*-fold
rotational symmetry constructed from a circle — expressed in two different
computational paradigms (CSG geometry vs. scalar distance field). The second
is exactly what this project's other generators already do (Voronoi is
`Distance Field` over scattered points), so `islamic.js` reuses that
mechanism with a **deterministic** point source instead of Voronoi's
stochastic one — see `src/generators/lib/constructionCircle.js`'s header
comment for the full argument. This is also a clean answer to the primary
research question: the same `Distance Field` node/primitive, unmodified,
now demonstrably serves both a stochastic generator (Voronoi) and a fully
deterministic one (Islamic) — differing only in which node feeds it points.

### Node-by-node

- **Grid**: locates which tile `(x, y)` falls in and that tile's centre —
  the same conceptual node `docs/nodes/core/grid.md` already lists Islamic
  Geometric Patterns under "Used By" for.
- **Construction Circle** (new primitive, `lib/constructionCircle.js`):
  defines the centre (the tile centre) and radius (fixed at `0.42 ×
  tileSize` — geometry-constrained, not a free parameter, per
  `docs/UI_DESIGN.md`'s "fixed by geometry" parameter category, the same way
  Grid's shape-specific rotation angles are) that the pattern is built
  around. `docs/nodes/generation/construction-circle.md` already existed,
  written in anticipation of exactly this generator.
- **Radial Divisions** (same new module): divides that circle into
  `segments` equally spaced points — the *n* in *n*-fold symmetry.
  `docs/nodes/pattern/radial-divisions.md` also already existed for this.
- **Distance Field**: `nearestPoint` (unmodified — the same function
  Voronoi uses) finds the nearest of those `segments` points.
- **Waveform** (`star-lines` only): folds that distance through
  `sin(distance × frequency)`, producing concentric line work radiating from
  each construction point instead of a flat rosette fill — the same
  `Distance Field → Waveform` pattern `wave.js`'s `rings` mode already uses
  (§6), just fed by a multi-point Distance Field instead of a single-point
  one.
- **Colour Mapping** (`rosette` only): bands the raw distance into the
  declared tone set.
- 7 steps (`rosette`) or 8 steps (`star-lines`).

**No RNG anywhere** — `islamic.js` takes no `seed` parameter, which is
itself the point: it's the fifth spectrum position specifically because it
reaches full determinism by a mechanism distinct from Recursive/Fractal's
repeat-and-subdivide (`README.md`'s Generative Spectrum table). Verified by
property tests (`src/generators/__tests__/islamic.property.test.js`):
exact periodicity across tile boundaries, and *n*-fold rotational symmetry
about each tile centre, both checked directly rather than assumed from the
construction.

### Export representation

Both registry entries (`islamic-rosette`, `islamic-star-lines`) declare
`nativeFormat: "vector"` in `patternRegistry.js`, so `ui.js` routes them
through `SVG_GENERATORS` rather than the raster canvas — this was initially
a gap (no `islamic` entry in `src/generators/svg/index.js`, which would have
thrown at runtime the moment either pattern was selected, not just rendered
raster-only as first assumed). Closed with `src/generators/svg/islamic-svg.js`:
one tile's Voronoi cells (Sutherland-Hodgman clip, same technique
`voronoi-svg.js` uses, just against the deterministic construction points
instead of random seeds) and concentric rings are computed once and repeated
across the canvas via an SVG `<pattern>` (like `wave-svg.js`'s stripes) —
looping tiles in JS the way `grid-svg.js`/`escher-svg.js` do would have
multiplied per-point ring counts by tile count, an unnecessary blow-up.
Verified against the raster generator numerically (not just "renders
without error"): the SVG's band math and cell-clip geometry were extracted
and cross-checked against `islamic.js`'s actual output over 1000+ sample
points each, zero mismatches.

---

## Node-library gap summary

What actually needed adding or fixing to make the seven workflows above
representable, in the order this document surfaces them:

| Gap | Resolution |
|---|---|
| `wave.js`'s plain-sine leaf had no corresponding node | Added `Waveform` node + `lib/waveform.js`; `wave.js` refactored to use it |
| Islamic Geometric Patterns had no generator or workflow yet | Added `islamic.js` + `lib/constructionCircle.js` (Construction Circle, Radial Divisions — docs already existed) |
| `docs/nodes/core/mirror.md` and `docs/nodes/core/scale.md` were empty stub files; their content was accidentally all filed under `docs/nodes/core/translate.md` | Split back into one file per node, matching `docs/nodes/README.md`'s taxonomy |
| Grid's documented UI_DESIGN.md workflow (Rotate/Translate/Repeat X/Repeat Y) didn't match `grid.js`'s actual closed-form-arithmetic implementation | Added `Lattice Index` node + `lib/latticeIndex.js`; `grid.js` refactored to use it, `grid.property.test.js` passes unchanged; `docs/UI_DESIGN.md`'s worked example corrected to the real 5-step workflow |
| Base Geometry and Base Tile were two node docs covering the same "Escher's starting shape" concept | Retired `pattern/base-tile.md`; `core/base-geometry.md` now states Escher's case explicitly |
| Noise's fBm fold, and Recursive's recursion, weren't decomposed into standalone `lib/` primitives (fold/repeat as generic combinators) | Added `lib/fold.js` (`foldOctaves`) and `lib/repeat.js` (`repeat`); both generators refactored to use them, both existing property-test suites pass unchanged, both combinators additionally unit-tested independently |
| `recursive.js`'s `mode` param had no effect, so Sierpinski Carpet and Recursive Grid rendered identical workflows/output under different names | Gave `grid` mode its own step function (parity accumulation instead of centre-cell exclusion) — genuinely different output, proven self-similar the same way `sierpinski` is; see §4 |

Two new node types were needed in total across all seven generators —
**Waveform** (§6) and **Lattice Index** (§5) — both now added. Every other
stage across all seven generators maps onto a `docs/nodes/` entry that
already existed before this document was written.
