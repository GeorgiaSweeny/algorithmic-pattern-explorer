# Generator Contract

Every entry in `GENERATORS` (`src/generators/index.js`) must satisfy this contract.
It exists so generators can be tested, benchmarked, and composed uniformly regardless
of the algorithm each one implements.

## Interface

```
generator(x: number, y: number, params: object) => number
```

* **Pure function of `(x, y, params)`.** Any internal cache (e.g. the Perlin permutation
  table in `noise.js`, the seed table in `voronoi.js`) must be keyed so that it never
  leaks state between distinct `params`. Calling the generator twice with identical
  arguments must return a bitwise-identical result.
* **Domain.** `x` and `y` are pixel coordinates in `[0, CANVAS.WIDTH] × [0, CANVAS.HEIGHT]`
  (`src/config.js`). Generators normalise internally if they need unit-square coordinates
  (see `recursive.js`).
* **Range.** The return value is always a finite number in `[-1, 1]`, for every point in
  the domain and every parameter combination declared in the generator's `REGISTRY`
  entries (`src/patternRegistry.js`) — including the extremes of each param's `map` range.
* **Total.** No parameter combination declared in the registry may throw, return `NaN`,
  or return `±Infinity`.

## Registration

* A generator is registered once in `GENERATORS` under a key.
* Every `REGISTRY` entry references that key via its `generator` field, and its `params[]`
  must be a valid input to the function (unknown/extra keys are ignored safely; declared
  keys are all read).

## Verification

The generic properties above (range, determinism, totality) are checked mechanically for
every `REGISTRY` entry in `src/generators/__tests__/contract.generic.test.js` — adding a
new pattern to the registry automatically gets these checks for free.

Algorithm-specific invariants (e.g. Voronoi partition exactness, Sierpinski self-similarity,
Perlin continuity) live in one property test file per generator, alongside the generic suite.

A separate check, `src/generators/__tests__/registry.params-consistency.test.js`, guards a
failure mode outside this contract: a `REGISTRY` entry declaring a param (and so exposing a
UI control for it) that the generator actually rendering that pattern never reads. It resolves
each entry's real render path — `GENERATORS[generator]` for `nativeFormat: "raster"`,
`SVG_GENERATORS[generator]` for `"vector"` — and asserts every declared param name appears in
that function's source. It caught a live bug: `recursive-svg.js` never reads `mode`, so
`recursive-grid` and `sierpinski` render identically as vector patterns despite declaring
different `mode` values; that bug is still open (`recursive-svg.js` not yet fixed).

## Shared primitives (`src/generators/lib/`)

A generator satisfies the interface above by composing smaller pure functions, each
corresponding to exactly one node documented in `docs/nodes/`:

| `lib/` module          | Node (`docs/nodes/`)      | Used by                      |
|-------------------------|----------------------------|-------------------------------|
| `rng.js`                | Seed                       | `noise.js` (via `Perlin`), `voronoi.js` |
| `fold.js` (`foldOctaves`) | Noise (`docs/nodes/core/noise.md`) | `noise.js` |
| `seedPoints.js`         | Seed Points                 | `voronoi.js`                  |
| `distanceField.js`      | Distance Field              | `voronoi.js` (`nearestPoint`), `wave.js` (`distanceToPoint`), `islamic.js` (`nearestPoint`) |
| `partition.js`          | Partition                    | (available; not yet consumed — `grid.js` was checked against it and found to need `latticeIndex.js` instead, see `docs/ALGORITHMIC_COMPOSITION_RESEARCH.md` open question 1) |
| `colourMapping.js`      | Colour Mapping               | `grid.js`, `voronoi.js`, `escher.js`, `islamic.js` (`rosette` mode) |
| `edgeDeformation.js`    | Edge Deformation             | `escher.js`                   |
| `subdivide.js`          | Subdivide (`docs/nodes/pattern/subdivide.md`) | `recursive.js` |
| `repeat.js`             | Subdivide's recursive reapplication (`docs/nodes/pattern/subdivide.md`) | `recursive.js` |
| `waveform.js`           | Waveform (`docs/nodes/computation/waveform.md`) | `wave.js` (both modes), `islamic.js` (`star-lines` mode) |
| `latticeIndex.js`       | Lattice Index (`docs/nodes/computation/lattice-index.md`) | `grid.js` (all five shapes) |
| `constructionCircle.js` | Construction Circle + Radial Divisions (`docs/nodes/generation/construction-circle.md`, `docs/nodes/pattern/radial-divisions.md`) | `islamic.js` |

This exists so the node graph (ReactFlow) can wrap each `lib/` function as one node
type directly, instead of a fresh implementation per node. A generator file (e.g.
`voronoi.js`) is then just one particular composition of these nodes — the same
composition the node graph should reproduce.

`noise.js`'s fBm octave loop and `recursive.js`'s recursion are now decomposed the
same way: `fold.js` (`foldOctaves`) and `repeat.js` (`repeat`) are the generic
fold/repeat combinators named in `docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`,
tested independently of either generator in
`src/generators/__tests__/lib.fold.test.js` and `lib.repeat.test.js`. Both
`fold.js` and `repeat.js` back an *existing* node (Noise, Subdivide) rather than
introducing a new one — the workflow view a learner sees is unchanged; what
changed is that those nodes' documented behaviour is now backed by tested,
reusable code instead of logic inlined in one generator file.
