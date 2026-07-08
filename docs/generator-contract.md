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
