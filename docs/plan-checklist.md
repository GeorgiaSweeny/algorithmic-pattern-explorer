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

- [x] `noise.js` internals (fBm loop) decomposed into `lib/` primitives —
      `lib/fold.js` (`foldOctaves`), also used to decompose `recursive.js`'s
      recursion (`lib/repeat.js`); both existing property-test suites pass
      unchanged, both combinators additionally unit-tested independently
      (`lib.fold.test.js`, `lib.repeat.test.js`). Ridge fold stays inline in
      `noise.js` — it's one line applied after the fold completes, not part
      of the fold loop itself.
- [x] `recursive.js`'s `mode` param (`"sierpinski"` vs `"grid"`) now behaves
      differently per mode — `grid` accumulates each Subdivide level's cell
      parity instead of `sierpinski`'s centre-cell exclusion, giving a
      self-similar checkerboard with no holes rather than a duplicate
      Sierpinski Carpet under a different name. `recursive.property.test.js`
      covers both modes, including a proof that `grid` composes correctly
      across depth levels. Full suite: 84/84 passing.

## Jul 10: Islamic geometric pattern generator (1 day)

- [x] Implementation on top of the `lib/` primitives — `src/generators/islamic.js`,
      composed from `lib/constructionCircle.js` (new: Construction Circle +
      Radial Divisions) and the existing `distanceField.js`/`colourMapping.js`;
      added `lib/waveform.js` (new: Waveform node) along the way, closing a gap
      where `wave.js`'s plain-sine mode had no corresponding node — see
      `docs/nodes/WORKFLOWS.md`
- [x] Property tests + registry entry, matching the other 6 generators —
      `src/generators/__tests__/islamic.property.test.js`, `islamic-rosette` /
      `islamic-star-lines` in `src/patternRegistry.js`.
- [x] Node workflow designed and cross-checked against the node library for all
      7 generators (not just Islamic) — `docs/nodes/WORKFLOWS.md`, including a
      gap analysis. Two gaps found and since closed: Wave's plain-sine mode had
      no corresponding node (added Waveform), and Grid's documented
      UI_DESIGN.md workflow (Rotate/Translate/Repeat X/Repeat Y) didn't match
      `grid.js`'s real implementation — resolved by adding the `Lattice Index`
      node + `lib/latticeIndex.js`, refactoring `grid.js` to use it, and
      correcting `docs/UI_DESIGN.md`'s worked example to the real 5-step
      workflow (same for every shape). Also decomposed `noise.js`'s fold and
      `recursive.js`'s repeat into generic, independently tested `lib/`
      primitives (`fold.js`, `repeat.js`) while auditing the library.
- [x] SVG (vector) export — `islamic-rosette`/`islamic-star-lines` declare
      `nativeFormat: "vector"` in `patternRegistry.js`, which would have thrown
      at runtime in `ui.js` (no guard against a missing `SVG_GENERATORS`
      entry) the first time either was selected. Added
      `src/generators/svg/islamic-svg.js`; verified against the raster
      generator numerically (band math and cell geometry cross-checked over
      1000+ points each, zero mismatches), not just "renders without
      throwing." Found during a follow-up stale-code audit, not part of the
      original day's scope. Full suite: 84/84 passing throughout.

## Jul 11-12: ReactFlow nodes + functional page (start)

- [x] ReactFlow node graph implemented for all 7 generators — `src/app/` (new
      `@xyflow/react` + Vite app), `src/app/src/workflows.js` builds each
      pattern's `{nodes, edges}` from `docs/nodes/WORKFLOWS.md`'s documented
      sequence and `patternRegistry.js`'s params, keyed off `NODE_LIBRARY`
      (one entry per `docs/nodes/` node type); `WorkflowNode.jsx` renders each
      node coloured by category with its param controls (slider/select/fixed,
      matching the registry's param shapes). Covered by `workflows.test.js`.
- [x] Registry/generator param-consistency guard added ahead of the wiring
      work below, so the live canvas render (once built) can't silently drive
      a control that no generator reads —
      `src/generators/__tests__/registry.params-consistency.test.js`, documented
      in `docs/GENERATOR_CONTRACT.md`. Caught a live bug: `recursive-svg.js`
      never reads `mode`, so `recursive-grid` and `sierpinski` render
      identically as vector patterns despite declaring different `mode`
      values — **bug still open**, tracked as 2 known-failing tests (not yet
      fixed; fix belongs with the Aug 2-6 wiring work since it's the vector
      generator path the canvas render will exercise). Committed Jul 13,
      technically inside the Jul 13-31 revision block (see Constraints) —
      small enough (one test file + a doc note) not to worth reshuffling the
      schedule over, but flagged here since the revision boundary is meant to
      be firm.
- [ ] Functional page not yet wired to a live canvas render — per `App.jsx`'s
      own inline note, dragging a param slider updates only that node's local
      state; it does not call back into a generator or redraw output. Turning
      the mockup into a working page for the core algorithms is still open.
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
- [ ] Fix `recursive-svg.js` ignoring `mode` (found Jul 13 by the registry
      param-consistency test, still open) — belongs here rather than as a
      standalone fix since it's on the vector-render path this block wires up
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

This ranks what to defer *out of the 14-day coding window* first — it is not
a statement that deferred items are optional overall. In particular,
evaluation data collection is a Must for the project as a whole (see
`docs/MOSCOW_PRIORITIES.md` §5); it's ranked first here only because its
natural execution window is after the coding deadline, not during it.

Dissertation submission deadline: Sep 7 (treating this as the firm date even
though the actual deadline may be later, to build in buffer).

In order of what to cut or defer first:

1. **Evaluation data collection.** Two days is enough to build the quiz/prompt
   infrastructure, not to recruit participants and collect a real pre/post sample.
   Deliverable for Aug 12 is the instrument built and working; data collection and
   write-up happen after Aug 12, during the dissertation write-up period, targeting
   Aug 31 to leave roughly a week before Sep 7 submission — deferred in time, not
   dropped in scope.
2. **Entropy/structure metrics** for the hybrids — separable from having the
   hybrids exist and work.
3. **Islamic-pattern-driven hybrid** — the other two hybrids do not depend on it.
4. **Functional page polish** — ship the MVP interaction loop (select generator,
   view graph, adjust params, canvas updates) without full documentation/education
   UI; treat that polish as post-Aug-12 work.
