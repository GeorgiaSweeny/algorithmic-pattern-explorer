# Recursive / Fractal

## Summary

Builds a fractal by splitting a shape into smaller pieces, then applying that exact same rule to each piece again, at a smaller and smaller scale.

---

## Purpose

Shows self-similarity directly: a structure built from one simple rule, repeated at every scale, that looks statistically like itself when you zoom into any smaller region of it. This is the same idea `noise.md`'s layered octaves rely on, applied here to shape subdivision instead of randomness.

---

## Computational Thinking Concepts

* Iteration
* Emergence
* Rule-based generation

---

## Mathematical Principle

Wacław Sierpiński's original 1916 construction describes the carpet this generator's `sierpinski` mode implements: repeatedly divide a square into a 3×3 grid of smaller squares and remove the centre one, then apply the identical rule to each of the eight remaining squares, at every level of recursion. Benoit Mandelbrot's later work coined the term "fractal" and formalised self-similar structure as a subject of study in its own right, including the closed-form prediction this generator's own automated tests check directly: after `depth` levels of subdivision, the fraction of the original area still filled in is exactly `((n²-1)/n²)^depth`.

Both of this generator's modes repeat the identical subdivision step the same number of times (`depth`); what differs is what each level *does* with its own cell once computed:

- **`sierpinski` mode** stops immediately, leaving a hole, whenever a level's cell happens to be the centre one. Reaching the full `depth` without ever landing on a centre cell fills the pixel instead — the carpet's defining "holes at every scale" feature.
- **`grid` mode** never stops early. Instead, every level's cell parity accumulates into a running total, and only the *final* accumulated parity, after all `depth` levels, decides the colour — still genuinely self-similar in the same way the carpet is, just without ever removing area, producing a fractal checkerboard instead of a carpet with holes.

This is a meaningfully different construction from the plain `grid` generator's own flat tiling (see `grid.md`): a plain tiling's colour depends only on which single cell a point falls into, while this generator's `grid` mode depends on *every* level's cell along the way, all the way down.

---

## Parameters

### Mode

`sierpinski` (removes each level's centre cell, producing a carpet with self-similar holes) or `grid` (keeps every cell, colouring by accumulated parity across all levels instead).

### Depth

How many levels of subdivision are applied — higher values produce finer, more detailed self-similarity.

---

## Visualisation

Three nested dashed squares, the smallest one with its centre removed and shown solid — the "a hole at every scale" idea captured in one static image.

---

## Try Exploring...

Increase Depth by one level at a time and watch each new level add a finer layer of the same hole pattern inside every square that survived the previous level.

---

## Used By

* Sierpinski (`mode: sierpinski`)
* Recursive Grid (`mode: grid`)

---

## Related Generators

* Noise (self-similarity from layered randomness rather than layered subdivision)
* Perlin Sierpinski (a hybrid that perturbs this generator's own `sierpinski` mode with Perlin noise)
