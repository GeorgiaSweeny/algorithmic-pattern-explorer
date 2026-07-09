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
patterns already found in the six base generators?

**Demonstration/evaluation (secondary, supports the above)**: Does the
educational node-graph interface make the compositional structure identified
above visible and understandable to a novice learner? This is the role of the
pre/during/post evaluation study — it tests whether the demonstration succeeds,
not whether the underlying compositional claim is true (that's established by
the analysis and testing below, independent of any user study).

---

## The primitive library (`src/generators/lib/`)

Already built and documented in `docs/GENERATOR_CONTRACT.md`. Seven pure
functions, each corresponding to one conceptual node in `docs/nodes/`:

| Primitive | Signature | Role |
|---|---|---|
| `rng.js` (`xorshift32`, `xorshift32Unit`) | `(seed) => next()` | deterministic PRNG, shared by every stochastic generator |
| `seedPoints.js` (`generateSeedPoints`) | `(numPoints, seed) => Float32Array` | a point cloud from a seed — ignores per-pixel input entirely |
| `distanceField.js` (`nearestPoint`, `distanceToPoint`) | `(x, y, points\|px,py) => {index, distSq}\|number` | nearest-feature search / single-point distance |
| `partition.js` (`partitionIndex`) | `(x, y, points, numRegions) => int` | `nearestPoint` folded into a bounded region index |
| `colourMapping.js` (`toneSet`) | `(tones) => number[]` | discrete index → output tone |
| `edgeDeformation.js` (`bump`) | `(t, type) => number` | periodic boundary displacement |
| `subdivide.js` (`subdivideCell`) | `(x, y, n) => {gx, gy, x, y}` | one level of an n×n cell subdivision |

## Combinator vocabulary used below

Kept deliberately small — three patterns from the BQN tutorial's six, plus two
patterns the six generators turned out to need that aren't in that base set:

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
  the six named combinators in the tutorial).
- **Repeat / power** *(also not in the base six — needed for `recursive.js`)* —
  a primitive applied to its own output some fixed number of times. Also
  precedented in the same language family (Dyalog APL's Power operator, `⍣`).

## Composition table: how each generator is actually built

| Generator | Pattern | Structure |
|---|---|---|
| `voronoi.js` | Constant-bind → Atop chain | `seedPoints(numCells, seed)` computed once (ignores `x,y`, cached), then per-pixel: `toneSet(tones)[nearestPoint(x, y, points).index % n]` — a straight compose chain over a constant-bound argument. |
| `wave.js` (rings) | Constant-bind → Atop | `distanceToPoint(x, y, CANVAS.WIDTH/2, CANVAS.HEIGHT/2)` fixes the second point ahead of time, then composes with `Math.sin`. |
| `wave.js` (wave mode) | Leaf | `Math.sin(y * frequency)` — no primitive composition, a base case. |
| `escher.js` | Cross-fork → Atop | `y` feeds `bump(normY)` to get `dx`; `x` feeds `bump(normX)` to get `dy` — each axis's *displacement* is driven by the *other* axis's position, then `(x-dx, y-dy)` are combined into a tile index and passed through `toneSet`. Structurally different from voronoi/wave: two forked branches recombine before the final compose, and the forking is cross-wired (not the same input duplicated to both branches). |
| `recursive.js` | Repeat/power | `subdivideCell` applied to its own remapped output, `depth` times, with an early-exit test at each level. Doesn't fit atop, fork, or constant-bind — needed the fifth pattern. |
| `grid.js` | Atop (partial) | Only the final `toneSet` stage is a shared primitive; each shape's index computation (`_square`, `_triangle`, `_hexagon`, `_brick`, `_diamond`) is bespoke inline arithmetic, not yet decomposed into `lib/` primitives. Open question below. |
| `noise.js` | Fold/reduce | The fBm octave loop (`src/generators/noise.js`) sums `octaves` transformed calls to `Perlin.noise2D` with increasing frequency and decreasing amplitude — a fold, not a fixed-arity compose. Not yet decomposed into a `lib/` primitive (flagged as a TODO in `docs/GENERATOR_CONTRACT.md`); the fold structure is exactly why a plain atop/fork vocabulary doesn't fit it. |

**Reading across the table**: three generators (`voronoi`, `wave`-rings,
`escher`) fit "compose, optionally with one constant-bound input, optionally
with a fork" — a genuinely small, reusable set. Two (`recursive`, `noise`)
needed patterns outside that set (repeat, fold) — both of which are standard,
named operators in the array-language tradition this vocabulary is drawn from,
not ad hoc inventions. One (`grid.js`) is only partially decomposed, so it's
currently the weakest evidence either way.

---

## Open questions / next steps

1. **Is `grid.js`'s per-shape arithmetic actually a "Partition" primitive in
   disguise?** Each shape function computes a discrete cell index from `(x, y,
   tileSize)`, structurally similar to what `partition.js` already does for
   Voronoi (nearest-feature → bounded index). If the five shape functions can be
   re-expressed as calls to `partition.js` (or a sibling primitive), `grid.js`
   moves from "partial atop" to full evidence for the minimal vocabulary. If they
   can't (e.g. the triangle/hex/brick lattice math doesn't reduce to a
   nearest-point search), that's itself a finding: some tiling logic is
   irreducibly bespoke.
2. **Should `fold` and `repeat` become first-class `lib/` primitives** (e.g. a
   generic `foldOctaves(fn, octaves, ...)` and `repeat(fn, n, ...)`), so
   `noise.js` and `recursive.js` are decomposed like the other four? This would
   let the property-based test suite (`src/generators/__tests__/`) test the fold
   and repeat combinators' correctness once, generically, rather than only
   through each generator's own behaviour.
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
  with a parameter (`numCells`) rather than staying O(1) per pixel — worth
  keeping in mind if `partition.js` ends up reused by `grid.js` per open
  question 1.
- `docs/nodes/` — the educational node documentation the secondary,
  demonstration-layer work (node graph UI) is built from; this document's
  composition table is a more formal restatement of relationships that
  documentation already describes informally.
