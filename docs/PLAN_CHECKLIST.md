# MVP Plan Checklist

Tracks the 5-week plan (Jul 8 - Aug 11) scoped against selected ideas #2 (compositional
hybrid generators), #3 (SE rigor: contract, property tests, benchmarks), and #4 (real
pre/during/post learning-outcomes experiment).

## Week 1-2 (Jul 8-21): MVP generators as the SE-rigor work

- [x] 4+ MVP generators implemented (`noise`, `grid`, `wave`, `voronoi`, `recursive`,
      `escher` — 6 total, exceeds the original 4) — `src/generators/`
- [x] `patternRegistry.js` formalized into an explicit generator contract (pure
      `(x, y, params) => [-1, 1]` interface; determinism, range, totality) —
      `docs/generator-contract.md`
- [x] Generic conformance test suite run against every registry entry —
      `src/generators/__tests__/contract.generic.test.js`
- [x] Per-generator property tests (fast-check) for all 6 generators —
      `src/generators/__tests__/{noise,grid,wave,voronoi,recursive,escher}.property.test.js`
- [x] All tests passing (64 tests / 7 files, `npx vitest run` in `src/`)

## Week 3 (Jul 22-28): compositional/hybrid generators

- [ ] Perlin-perturbed recursive subdivision (noise controls Sierpinski-carpet split
      threshold — stochastic <-> deterministic hybrid)
- [ ] Voronoi-seeded tessellation (random partition drives Escher tile placement)
- [ ] Property tests for both hybrids
- [ ] Entropy/structure metrics measured as composition parameters vary (secondary RQ
      empirical content)

## Week 4 (Jul 29-Aug 4): benchmark suite

- [x] Runtime/complexity measured for all generators as grid size scales —
      `src/generators/__benchmarks__/benchmark.js`, `results.json`
- [x] Parameter sweeps (octaves, numCells, depth) analyzed and written up —
      `docs/benchmark-results.md`
- [ ] Re-run/extend once the two hybrid generators from Week 3 exist

## Week 5 (Aug 5-11): lightweight evaluation

- [ ] Computational-thinking quiz instrument drafted (pre/during/post, single-group)
- [ ] In-app concept-check prompts during use
- [ ] Pre/post score comparison and write-up
