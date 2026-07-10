# Algorithmic Composition as the Primary Research Contribution

## Status and scope

This document reframes the emphasis of the dissertation's two halves. The
**algorithmic composition question below is the primary computer-science research
contribution.** The educational interface (node graph, documentation panel,
evaluation study) is **secondary**: a demonstration and evaluation vehicle that
shows the compositional structure identified here is not just internally
correct, but externally legible to a learner. It is a means of showing the
algorithms work and are understandable — not the research contribution itself.

This is a deliberate change from `README.md` / `docs/PROJECT_SPECIFICATION.md`,
which currently frame the project the other way round (educational value as the
primary research question, algorithms as the vehicle). Those documents haven't
been edited yet — this file exists first so the reframing can be checked before
it's carried back into the project's primary framing documents.

**Supervisor scoping note** (direct guidance, recorded verbatim because it's the
boundary condition for everything below): the project should draw on
combinator-style thinking about function composition — supervisor referenced
Marshall Lochbaum's BQN tutorial on combinators
(https://mlochbaum.github.io/BQN/tutorial/combinator.html) — **at a high level**,
without going deep into formal grammar or language design. This project is not
designing a language. Combinators are used here purely as an **analytical
vocabulary for describing composition patterns that already exist** in the
codebase, not as a feature implemented for end users, and not as a parser, type
system, or grammar with production rules. The existing design philosophy
(`docs/PROJECT_SPECIFICATION.md`: "the system should not function as a visual
programming language... users cannot construct arbitrary node graphs") is
unaffected by this document.

---

## Research questions

**Primary**: Can a small, fixed vocabulary of composition patterns — borrowed
from combinator-style function composition (atop/compose, fork, constant-bind,
and, where the base vocabulary doesn't fit, fold and repeat) — describe how a
broad spectrum of generative pattern algorithms (stochastic → deterministic) is
actually built from a minimal library of reusable primitives? Where the minimal
vocabulary doesn't fit a generator, what does that gap reveal about the
primitive library's completeness?

**Secondary**: How do hybrid/composed generators (e.g. a Perlin-perturbed
subdivision threshold, a Voronoi-seeded tessellation — see `README.md`'s
Generative Spectrum future work) extend or stress this compositional model? Do
they require genuinely new composition patterns, or do they recombine the
patterns already found in the seven base generators? `islamic.js`'s
`star-lines` mode is early evidence for the latter — see its composition-table
entry below, which recombines `voronoi.js`'s and `wave.js`'s existing patterns
rather than needing a new one, though it's a variant of an already-planned
base generator rather than one of the Aug 7-9 hybrids this question is really
aimed at.

**Demonstration/evaluation (secondary, supports the above)**: Does the
educational node-graph interface make the compositional structure identified
above visible and understandable to a novice learner? This is the role of the
pre/during/post evaluation study — it tests whether the demonstration succeeds,
not whether the underlying compositional claim is true (that's established by
the analysis and testing below, independent of any user study).

---

## The primitive library (`src/generators/lib/`)

Documented in `docs/GENERATOR_CONTRACT.md`. Twelve pure functions, each
corresponding to one conceptual node in `docs/nodes/`:

| Primitive | Signature | Role |
|---|---|---|
| `rng.js` (`xorshift32`, `xorshift32Unit`) | `(seed) => next()` | deterministic PRNG, shared by every stochastic generator |
| `seedPoints.js` (`generateSeedPoints`) | `(numPoints, seed) => Float32Array` | a point cloud from a seed — ignores per-pixel input entirely |
| `distanceField.js` (`nearestPoint`, `distanceToPoint`) | `(x, y, points\|px,py) => {index, distSq}\|number` | nearest-feature search / single-point distance |
| `partition.js` (`partitionIndex`) | `(x, y, points, numRegions) => int` | `nearestPoint` folded into a bounded region index |
| `colourMapping.js` (`toneSet`) | `(tones) => number[]` | discrete index → output tone |
| `edgeDeformation.js` (`bump`) | `(t, type) => number` | periodic boundary displacement |
| `subdivide.js` (`subdivideCell`) | `(x, y, n) => {gx, gy, x, y}` | one level of an n×n cell subdivision |
| `waveform.js` (`sineWave`) | `(value, frequency, phase) => number` | periodic fold of a scalar field — closes the gap where `wave.js`'s plain-sine mode had no corresponding primitive; also used by `islamic.js` |
| `constructionCircle.js` (`constructionCircle`, `radialDivisions`) | `(cx, cy, radius) => circle`; `(circle, segments) => Float32Array` | deterministic counterpart to `seedPoints.js` — places points at fixed angles instead of scattering them with an RNG |
| `fold.js` (`foldOctaves`) | `(sample, octaves, {persistence, lacunarity}) => number` | the Fold/reduce combinator itself, generalised out of `noise.js`'s fBm loop — tested independently in `lib.fold.test.js` |
| `repeat.js` (`repeat`) | `(step, n, initialValue) => {stopped, value}` | the Repeat/power combinator itself, generalised out of `recursive.js`'s recursion — tested independently in `lib.repeat.test.js` |
| `latticeIndex.js` (`squareIndex`, `triangleIndex`, `hexagonIndex`, `brickIndex`, `diamondIndex`) | `(x, y, tileSize, numShades) => int` | closed-form cell index for one of five regular tilings — the answer to open question 1 below (not a `partition.js` in disguise) |

## Combinator vocabulary used below

Kept deliberately small — three patterns from the BQN tutorial's six, plus two
patterns the seven generators turned out to need that aren't in that base set:

- **Atop / compose** — output of one primitive feeds directly into the next:
  `f(g(x))`.
- **Constant-bind** — a primitive's argument is fixed ahead of time and reused
  across every per-pixel call, rather than derived from `(x, y)` each time
  (BQN's "Constant" combinator, or a curried partial application).
- **Fork** — `(x, y)` (or a value derived from it) feeds two primitives whose
  outputs are then combined by a third function.
- **Fold / reduce** *(not in the base six — needed anyway, see `noise.js`)* — a
  primitive applied repeatedly to a running accumulator, each time with a
  transformed input (BQN has fold as a primitive operator, "´", separate from
  the six named combinators in the tutorial). Extracted as its own tested
  primitive, `lib/fold.js` (`foldOctaves`).
- **Repeat / power** *(also not in the base six — needed for `recursive.js`)* —
  a primitive applied to its own output some fixed number of times. Also
  precedented in the same language family (Dyalog APL's Power operator, `⍣`).
  Extracted as its own tested primitive, `lib/repeat.js` (`repeat`).

## Composition table: how each generator is actually built

| Generator | Pattern | Structure |
|---|---|---|
| `voronoi.js` | Constant-bind → Atop chain | `seedPoints(numCells, seed)` computed once (ignores `x,y`, cached), then per-pixel: `toneSet(tones)[nearestPoint(x, y, points).index % n]` — a straight compose chain over a constant-bound argument. |
| `wave.js` (rings) | Constant-bind → Atop | `distanceToPoint(x, y, CANVAS.WIDTH/2, CANVAS.HEIGHT/2)` fixes the second point ahead of time, then composes with `sineWave` (`waveform.js`). |
| `wave.js` (wave mode) | Atop | `sineWave(y, frequency)` — was a bare `Math.sin` leaf with no corresponding primitive; now built from `waveform.js`, so no generator in this table is an undecomposed leaf any more. |
| `escher.js` | Cross-fork → Atop | `y` feeds `bump(normY)` to get `dx`; `x` feeds `bump(normX)` to get `dy` — each axis's *displacement* is driven by the *other* axis's position, then `(x-dx, y-dy)` are combined into a tile index and passed through `toneSet`. Structurally different from voronoi/wave: two forked branches recombine before the final compose, and the forking is cross-wired (not the same input duplicated to both branches). |
| `recursive.js` | Repeat/power | `subdivideCell` applied to its own remapped output, `depth` times, with an early-exit test at each level, now built directly from `lib/repeat.js` (`repeat`) rather than a hand-rolled `_recurse` function. Doesn't fit atop, fork, or constant-bind — needed the fifth pattern. |
| `grid.js` | Atop, over a sixth primitive | `latticeIndex.js`'s per-shape function (`squareIndex`, `triangleIndex`, `hexagonIndex`, `brickIndex`, `diamondIndex`) computed from `(x, y, tileSize)`, then composed with `toneSet` — structurally Atop, same as Voronoi/Wave, but over a primitive that isn't `nearestPoint`, `distanceToPoint` or `sineWave`. Resolves open question 1 below: the per-shape arithmetic is fully decomposed now, but into a new primitive family, not a reuse of `partition.js`. |
| `noise.js` | Fold/reduce | The fBm octave loop (`src/generators/noise.js`) sums `octaves` transformed calls to `Perlin.noise2D` with increasing frequency and decreasing amplitude — a fold, not a fixed-arity compose. Now built directly from `lib/fold.js` (`foldOctaves`); the fold structure is exactly why a plain atop/fork vocabulary doesn't fit it, and is why it's the one pattern that needed a dedicated primitive rather than reusing an existing one. |
| `islamic.js` (`rosette`) | Constant-bind → Atop chain | Same shape as `voronoi.js`: `radialDivisions(constructionCircle(...), segments)` computed once per (segments, radius) pair (constant-bound, cached), then per-pixel `nearestPoint(lx, ly, points)` folded into `toneSet`. The only difference from Voronoi is the point source — `radialDivisions` (deterministic, angular) instead of `generateSeedPoints` (stochastic, RNG-scattered) — everything downstream of the point set is the *identical* composition. Direct evidence for the primary RQ: one small primitive (`nearestPoint`) already proven reusable across a stochastic and a deterministic generator. |
| `islamic.js` (`star-lines`) | Constant-bind → Atop, recombining two existing patterns | Identical to `rosette` up to `nearestPoint`, then additionally composes with `sineWave` — the exact `Distance Field → Waveform` atop chain `wave.js`'s `rings` mode already uses, just fed by a multi-point Distance Field instead of a single fixed point. A hybrid in the sense of secondary-RQ interest (§ below), but notably it needed **no new composition pattern** — it recombines two patterns already established by `voronoi.js` and `wave.js`. |

**Reading across the table**: five generators (`voronoi`, `wave`, `escher`,
`islamic`, `grid`) now fit "compose, optionally with one constant-bound
input, optionally with a fork" — a genuinely small, reusable set for the
*pattern*, even though `grid.js` needed a *primitive* (`latticeIndex.js`)
none of the others share. That's worth being precise about: the small
vocabulary claim is about how primitives compose (Atop/fork/constant-bind),
not a claim that every generator draws from the same handful of primitives —
`grid.js` is now full evidence for the former and a genuine counterexample to
a stronger version of the latter. `islamic.js` joins without requiring a new
pattern *or* a new primitive, just a different point-generating node feeding
the same `Distance Field` — a stronger result than `grid.js`'s. Two
(`recursive`, `noise`) needed patterns outside that set entirely (repeat,
fold) — both of which are standard, named operators in the array-language
tradition this vocabulary is drawn from, not ad hoc inventions. All seven
generators are now fully decomposed into `lib/` primitives; none remain
partially decomposed.

---

## Open questions / next steps

1. **Resolved**: `grid.js`'s per-shape arithmetic is **not** a `partition.js`
   in disguise. `partition.js` answers "which of these finitely many seed
   points is nearest" by search; a plane tiling has no finite point set to
   search against, so there was never a `points` array for it to search — the
   question was really "does this reduce to a nearest-point search over
   *some* point set," and having worked through the actual math for all five
   shapes (triangle's oblique coordinates, hexagon's cube coordinates and
   lattice rounding, brick's running-bond offset, diamond's rotated frame),
   none of them are naturally expressed that way; they're closed-form
   coordinate-space changes, not searches. This is the "irreducibly bespoke"
   outcome flagged as possible when this question was first raised — but
   "bespoke" turned out to mean "a fifth reusable primitive," not "stays
   inline arithmetic": extracted as `lib/latticeIndex.js`, one function per
   shape, each independently pure and testable (`grid.property.test.js`
   passes unchanged against the refactor). `grid.js` is now `Atop` — `toneSet`
   composed with a `latticeIndex.js` call — the same composition *pattern* as
   Voronoi/Wave, just over a primitive that isn't shared with them. See
   `docs/nodes/computation/lattice-index.md` and
   `docs/nodes/WORKFLOWS.md` §5 for the full account, including why this also
   ruled out Rotate/Translate/Repeat as the decomposition (a shear isn't a
   rotation).
2. **Resolved**: `fold` and `repeat` are now first-class `lib/` primitives —
   `lib/fold.js` (`foldOctaves`) and `lib/repeat.js` (`repeat`) — so `noise.js`
   and `recursive.js` are decomposed the same way as the other five. Both are
   tested generically and independently of either generator
   (`lib.fold.test.js`, `lib.repeat.test.js`); `noise.property.test.js` and
   `recursive.property.test.js` were left unchanged and pass unmodified,
   confirming the refactor is behaviour-preserving rather than a rewrite.
   `grid.js` (question 1 above) remains the one generator not fully
   decomposed into `lib/` primitives.
3. **Compositional correctness**: given `docs/GENERATOR_CONTRACT.md`'s existing
   per-primitive and per-generator contracts, does composing two
   contract-satisfying primitives with `atop` or `fork` automatically produce a
   contract-satisfying result? This is a small, provable claim (not a language
   design exercise) that would directly extend the existing property-based test
   suite rather than requiring new infrastructure.
4. **Hybrid generators** (secondary RQ): when a genuinely new generator is built
   — e.g. Perlin noise perturbing `recursive.js`'s subdivision threshold — which
   pattern does the "perturbation" wiring need? A plausible guess is another
   fork (noise value and cell coordinates both feed the depth/threshold
   decision), but this should be checked against the real implementation once
   built, not assumed.

## Relationship to existing infrastructure

- `docs/GENERATOR_CONTRACT.md` — the per-generator and per-primitive contracts
  this analysis sits on top of.
- `src/generators/__tests__/` — the property-based test suite; open question 3
  above is a natural extension of it.
- `docs/benchmark-results.md` — already produced one piece of evidence relevant
  here: `distanceField.js`'s `nearestPoint` (used by both `voronoi.js` and,
  transitively, `partition.js`) is the one primitive whose empirical cost scales
  with a parameter (`numCells`) rather than staying O(1) per pixel. Now that
  open question 1 is resolved (`grid.js` uses `latticeIndex.js`, not
  `partition.js`), this doesn't apply to `grid.js` — its closed-form per-shape
  arithmetic stays O(1) regardless of tile density, unlike a nearest-point
  search would have been. Worth re-running the benchmark suite to confirm
  this empirically rather than just asserting it from the algorithm's shape.
- `docs/nodes/` — the educational node documentation the secondary,
  demonstration-layer work (node graph UI) is built from; this document's
  composition table is a more formal restatement of relationships that
  documentation already describes informally.
