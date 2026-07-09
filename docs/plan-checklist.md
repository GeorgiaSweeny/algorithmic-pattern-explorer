# MVP Plan Checklist

Scope: selected ideas #2 (compositional hybrid generators), #3 (SE rigor: contract,
property tests, benchmarks), and #4 (pre/during/post learning-outcomes experiment).
Schedule: Jul 8 - Aug 12, with a revision block for exams.

## Constraints

- **Exams:** Jul 27 and Jul 31 (fixed university dates), with two weeks of
  revision required before the first. Jul 13-31 is reserved for revision; no
  project work is scheduled in that window — this boundary doesn't move even
  when the rest of the schedule shifts. Working days are therefore Jul 10-12
  (3 days) and Aug 2-12 (11 days).
- **Schedule shifted back one day** (originally Jul 9 start / Aug 11 finish).
  Since the revision block start (Jul 13) is fixed, the pre-exam window absorbed
  the day as a compression (4 days → 3 days) rather than a plain shift; the
  post-exam window, unconstrained by another fixed date, shifted uniformly.
  Total working time available dropped from 15 to 14 days as a result.
- **ReactFlow:** the node graph has always been the intended implementation of the
  node workflow interface. It is now scheduled explicitly, alongside turning the
  website mockup into a working functional page for the core algorithms.
- **Total working time available:** 14 days, against a scope originally planned
  across five weeks. See Priorities below for what yields first if time runs short.

## Done (Jul 8-9)

MVP generators and SE rigor:

- [x] 6 generators implemented (`noise`, `grid`, `wave`, `voronoi`, `recursive`,
      `escher`) — `src/generators/`
- [x] `patternRegistry.js` formalized into an explicit generator contract (pure
      `(x, y, params) => [-1, 1]` interface; determinism, range, totality) —
      `docs/GENERATOR_CONTRACT.md`
- [x] Generic conformance test suite run against every registry entry —
      `src/generators/__tests__/contract.generic.test.js`
- [x] Per-generator property tests (fast-check) for all 6 generators
- [x] All tests passing (64 tests / 7 files, `npx vitest run` in `src/`)

Node-model alignment (supports the ReactFlow implementation below):

- [x] Shared `src/generators/lib/` primitives extracted, one module per documented
      node (`rng`, `seedPoints`, `distanceField`, `partition`, `colourMapping`,
      `edgeDeformation`, `subdivide`) — `docs/GENERATOR_CONTRACT.md`
- [x] `voronoi.js`, `grid.js`, `escher.js` composed from `lib/` primitives; fixed
      `escher.js` silently ignoring its registered `tones` param
- [x] `recursive.js`, `wave.js` composed from `lib/` primitives (`subdivideCell`,
      `distanceToPoint`)
- [x] Missing node docs backfilled: `docs/nodes/core/noise.md` (fBm + ridge-mode),
      `docs/nodes/pattern/subdivide.md` (new)

Outstanding from this phase (not blocking, tracked for later):

- [ ] `noise.js` internals (fBm loop, ridge fold) decomposed into `lib/` primitives
- [ ] `recursive.js`'s `mode` param (`"sierpinski"` vs `"grid"`) is read but has no
      effect — both registry entries produce identical output; needs a decision on
      intended behaviour before it becomes a node graph choice

## Jul 10: Islamic geometric pattern generator (1 day)

- [ ] Implementation on top of the `lib/` primitives
- [ ] Property tests + registry entry, matching the other 6 generators

## Jul 11-12: ReactFlow nodes + functional page (start)

- [ ] Begin implementing the ReactFlow node graph, using the `lib/` primitives and
      `docs/nodes/` docs as the source of node types/params
- [ ] Begin turning the website mockup into a working page for the core (non-hybrid)
      algorithms
- [ ] Continues into Aug 2-6
- Compressed from 3 to 2 days by the one-day schedule shift (see Constraints) —
      the fixed Jul 13 revision start absorbed the delay.

## Jul 13-31: Revision block

- Exams: Jul 27, Jul 31.
- No project work scheduled.

## Aug 2-6: ReactFlow nodes + functional page (complete)

- [ ] Node graph covers all 7 core generators (6 existing + Islamic)
- [ ] Functional page: select a generator, view its node graph, adjust params, see
      the canvas update — MVP interaction loop; documentation/education polish is
      out of scope for this block
- [ ] Highest overrun risk in the plan: first working build of the interactive
      frontend against the node model, not a refactor of existing code

## Aug 7-9: Compositional/hybrid generators

- [ ] Perlin-perturbed recursive subdivision (noise controls Sierpinski-carpet split
      threshold — stochastic/deterministic hybrid)
- [ ] Voronoi-seeded tessellation (random partition drives Escher tile placement)
- [ ] Noise/reaction-diffusion-driven Islamic pattern (field output selects symmetry
      group or construction-circle parameters)
- [ ] Property tests for whichever hybrids get built
- [ ] Entropy/structure metrics measured as composition parameters vary (secondary
      RQ empirical content)

## Aug 10: Benchmark suite extension (1 day)

- [x] Runtime/complexity measured for all generators as grid size scales —
      `src/generators/__benchmarks__/benchmark.js`, `results.json`
- [x] Parameter sweeps (octaves, numCells, depth) analyzed and written up —
      `docs/benchmark-results.md`
- [ ] Re-run/extend once the Aug 7-9 hybrid generators exist

## Aug 11-12: Lightweight evaluation

- [ ] Computational-thinking quiz instrument drafted (pre/during/post, single-group)
- [ ] In-app concept-check prompts during use
- [ ] Pre/post score comparison + write-up

## Priorities if time runs short

In order of what to cut or defer first:

1. **Evaluation data collection.** Two days is enough to build the quiz/prompt
   infrastructure, not to recruit participants and collect a real pre/post sample.
   Deliverable for Aug 12 is the instrument built and working; data collection runs
   alongside dissertation write-up.
2. **Entropy/structure metrics** for the hybrids — separable from having the
   hybrids exist and work.
3. **Islamic-pattern-driven hybrid** — the other two hybrids do not depend on it.
4. **Functional page polish** — ship the MVP interaction loop (select generator,
   view graph, adjust params, canvas updates) without full documentation/education
   UI; treat that polish as post-Aug-12 work.
