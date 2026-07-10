# Generator Benchmark Suite

`src/generators/__benchmarks__/benchmark.js` (run via `npm run bench` from `src/`)
measures empirical time complexity for all seven generators, rather than relying
on reading the source to guess it. It checks two things:

1. **Grid-size scaling** — time to evaluate an N x N sample grid over the fixed
   600x600 canvas, for N = 25, 50, 100, 200, 400.
2. **Parameter sweeps** — at a fixed grid size, how time scales with the one
   parameter each generator's own logic suggests should drive its per-pixel cost
   (Perlin octaves, Voronoi's `numCells`, Sierpinski's `depth`, Islamic's `segments`).

## Methodology

Every generator here is a pure `(x, y, params) => number` function evaluated once
per sample point, so the obvious prediction is O(pixel count) — one unit of work
per pixel, no more. The grid-size sweep exists to confirm that's actually true
(no generator secretly does more per-pixel work as the canvas fills up), and the
parameter sweeps exist to find the constant hiding inside "one unit of work,"
which turns out to differ by orders of magnitude and, in one case, isn't even the
shape you'd expect from reading the code.

**Timing.** A single pass over a small grid can complete in well under a
millisecond, at which point `performance.now()`'s resolution and fixed loop/call
overhead dominate the signal. Each measurement first runs one calibration pass to
estimate cost-per-pass, then repeats the full pass enough times to accumulate
~8ms of wall-clock time before dividing back down — this keeps relative
measurement noise roughly constant whether a single pass takes 0.02ms or 20ms,
rather than requiring one fixed repeat count that's wrong at one end of the
range. The reported figure is the median of 7 such trials.

**Reported exponent.** Grid-size results are fit as time ~ pixels^k (k=1.0
expected: no per-pixel behaviour beyond a constant). Parameter sweeps are fit as
time ~ param^k. This single-exponent log-log fit assumes a pure power law with no
additive constant — see the Voronoi section below for why that assumption
under-reports the true complexity class when a fixed per-pixel overhead is
present alongside the parameter-dependent cost.

## Grid-size scaling

All seven generators come out at approximately k=1.0 against pixel count:

| Generator | k (vs pixel count) |
|---|---|
| noise | 0.78–0.98 across repeated runs |
| grid | 0.85–1.01 |
| wave | 1.00–1.01 |
| voronoi | 0.97–1.01 |
| recursive | 0.90–0.98 |
| escher | 1.01–1.03 |
| islamic | 0.98 (single run so far — added when the generator was built, not yet repeated like the other six) |

This confirms none of the seven do asymptotically more than O(1) work per pixel
as the canvas is sampled at higher resolution — the increasing constant factors
seen in the parameter sweeps below are exactly that: constants, not a resolution
dependency. `islamic`'s O(1)-per-pixel result here is worth noting alongside
`grid`'s: both were open questions in `docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`
about whether their per-shape/per-tile arithmetic secretly cost more than the
other generators, and both measure the same as everything else at this stage —
the parameter sweeps below are where `islamic` actually turns out to behave more
like `voronoi` than like `grid`.

## Parameter sweeps

### Noise: octaves — confirms the obvious prediction

`noise.js` sums `octaves` layers in its fBm loop, so cost should be linear in
octaves. Measured exponent: **0.93**, doubling ratios settling around 2-3x per
octave doubling. Matches expectations directly.

### Voronoi: numCells — confirms O(numCells), but only visible at scale

`voronoi.js`'s nearest-seed search is a brute-force scan over all seed points —
textbook O(numCells) per pixel, with no spatial index. At the numCells range the
UI actually exposes (5–80, `patternRegistry.js`), the measured exponent is a
misleading **0.70**. Extending the sweep to 1280 and 5120 cells reveals why: the
per-doubling growth ratio climbs from ~1.15x at numCells=10→20 up to **3.17x and
3.88x** at 1280→5120 (theoretical maximum for a 4x parameter step is 4x). The true
relationship is closer to *affine* — `time ≈ a + b·numCells` — where `a` (fixed
per-pixel overhead: cache lookup, tone-array indexing) is comparable to `b·numCells`
at small numCells and negligible at large ones. A single log-log exponent fit
assumes a pure power law and under-reports k whenever a non-negligible additive
constant is present; the doubling-ratio trend is the more honest read here.

**Implication for the application**: at the registry's actual numCells ceiling
(80), this cost is small and dominated by the fixed overhead, not the search — no
change needed. If a future generator or "user-composed" workflow (see README's
Future Work) exposed much higher cell counts, this naive O(n) search is the first
thing that would need a spatial index (grid buckets or a k-d tree) to keep
rendering interactive.

### Islamic: segments — the same shape as Voronoi's numCells, for the same reason

`islamic.js` calls the exact same `distanceField.js` `nearestPoint` brute-force
search voronoi.js does (`docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`'s composition
table calls this out directly — `islamic.js` reuses the primitive unmodified,
differing only in how the point set is generated), so the same O(n) cost profile
was expected, and the measurement confirms it: at the registry's actual segments
range (4–16), the exponent looks like a misleadingly low **0.35**, but the
per-doubling growth ratio climbs from 1.18x at segments=4→8 up to **1.59x** at
64→128 (theoretical maximum for a doubling is 2x) — the same affine
(`time ≈ a + b·segments`) shape Voronoi showed, for the same reason: a fixed
per-pixel overhead (grid tile lookup, cache lookup, the `sineWave`/tone-band
step) that's comparable to the search cost at small segment counts and
increasingly negligible as segments grows.

**Implication for the application**: at the registry's ceiling (16 segments),
this is dominated by fixed overhead, not the search — no change needed, same
conclusion as Voronoi. Confirms `nearestPoint`, not the specific generator
calling it, is what determines this cost shape; a future spatial-index
optimisation to `distanceField.js` would benefit both generators identically
rather than needing a separate fix per generator.

### Recursive: depth — the counter-intuitive one

Reading `recursive.js` (`mode: "sierpinski"`, this benchmark's representative
params) suggests O(depth) per pixel: it repeats `depth` times via
`lib/repeat.js`, doing O(1) work per level. The benchmark says otherwise — the
growth ratio *shrinks* as depth increases (1.30x at depth 2→4, down to **1.10x**
at depth 24→48), the opposite of Voronoi's pattern.

The reason is in the algorithm, not the measurement: `sierpinski` mode's step
function has an early exit —

```js
if (mode === "sierpinski" && gx === mid && gy === mid) {
   return { stop: true, value: -1 };
}
```

— and for `subdivisions = 3`, roughly 1/9 of remaining pixel-paths hit this exit
at *each* level before ever reaching the next one. So the expected work per pixel
is not `depth` levels of guaranteed work; it's a geometric series (each
additional level of depth only does work for the ~8/9 fraction of paths that
survived every prior level) that **converges to a constant** as depth grows,
rather than growing without bound. Doubling `depth` from 24 to 48 barely moves
the runtime because almost every pixel-path has already terminated by depth 24.
(`mode: "grid"` has no early exit at all — every path runs the full `depth`
iterations — so this specific counter-intuitive result is `sierpinski`-only;
worth a follow-up sweep if `grid` mode's cost profile becomes relevant.)

**Implication for the application**: unlike octaves (Perlin) or numCells
(Voronoi), which are genuine linear cost drivers a user should expect to trade
off against render time, `depth` for the recursive/fractal generators is nearly
free to increase past a certain point — the UI's `depth` slider (`map: [1, 6]`,
`patternRegistry.js`) never approaches the range where this would matter, but if
that range were ever extended, performance would not be the limiting concern
(visual density/legibility would be).

## Reproducing

```
cd src
npm run bench
```

Raw per-run data is written to `src/generators/__benchmarks__/results.json`.
