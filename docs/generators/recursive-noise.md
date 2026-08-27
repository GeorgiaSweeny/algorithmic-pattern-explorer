# Perlin Sierpinski (hybrid)

## Summary

Perturbs a Sierpinski fractal's construction with Perlin noise, nudging each level's split point by a smooth random offset.

---

## Purpose

Tests whether the recursive-subdivision generator's own rule-based construction and the noise generator's own randomness can be combined directly, without either one losing what makes it work — a genuinely different kind of combination from the Voronoi-Islamic hybrid, since here the randomness is woven *into* every step of the recursion rather than only choosing the recursion's starting cells.

---

## Computational Thinking Concepts

* Composition
* Randomness
* Iteration

---

## Mathematical Principle

This hybrid builds on two generators already documented separately (see `recursive.md` and `noise.md`). At every level of the Sierpinski subdivision, the point currently being tested is first nudged by a smooth random offset sampled from a Perlin noise field, and only *then* is the next level's centre-cell test applied to the nudged point rather than the original one. This means the noise doesn't just distort the final image after the fact — it changes which cells the recursion itself decides are "centre" cells at every level, so the fractal's own holes end up gently warped rather than perfectly straight-edged.

A specific, checkable boundary makes this hybrid's claim falsifiable rather than just asserted: at `amplitude = 0`, the noise offset is exactly zero at every level, and the result is verified to be byte-for-byte identical to the plain Sierpinski generator's own output — not merely similar. Only once `amplitude` rises above zero does the warping actually begin, and the strength of that warp is deliberately ramped up gradually across levels (lightest at the first level, strongest at the last) rather than applied identically everywhere, so that early, coarse structure and later, fine structure both end up visibly affected rather than the warp only showing up in one part of the fractal.

---

## Parameters

### Depth

How many levels of subdivision are applied, same as the plain Recursive generator.

### Amplitude

How strongly each level's point is nudged by the noise field before that level's subdivision test runs. At `0`, this generator is provably identical to the plain Sierpinski generator.

### Scale / Octaves

The underlying noise field's own coarseness/detail controls, passed straight through from the Noise generator's own parameters.

---

## Visualisation

Reuses the plain Recursive generator's nested-squares diagram, but with each square's edge drawn slightly wavy rather than perfectly straight — the visual difference between the two related diagrams is itself the point being taught.

---

## Try Exploring...

Set Amplitude to 0 and compare directly against the plain Sierpinski generator at the same Depth — the two outputs are identical. Then raise Amplitude gradually and watch the fractal's straight edges begin to warp.

---

## Used By

* Perlin Sierpinski

---

## Related Generators

* Recursive / Fractal (this hybrid's subdivision construction, at `amplitude = 0`)
* Noise (this hybrid's source of the warping offset)
