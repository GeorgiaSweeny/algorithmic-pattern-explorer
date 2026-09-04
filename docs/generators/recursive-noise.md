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

A specific, checkable boundary makes this hybrid's claim falsifiable rather than just asserted: with every level's amplitude at `0`, the noise offset is exactly zero at every level, and the result is verified to be byte-for-byte identical to the plain Sierpinski generator's own output — not merely similar. Each level's amplitude, scale and octaves are independent of every other level's own — there is no shared value and no automatic ramp between levels — so raising, say, level 3's amplitude, or coarsening level 3's own noise texture, only warps level 3's own subdivision test, leaving levels 1, 2, 4 and beyond exactly as they were. Only the seed is shared across every level. That independence is also what the workflow view's node graph shows directly: each level's Noise node carries its own amplitude, scale and octaves controls, not values shared across every repeat.

---

## Parameters

### Depth

How many levels of subdivision are applied, same as the plain Recursive generator.

### Amplitude (per level)

How strongly a given level's point is nudged by the noise field before that level's subdivision test runs — one independent amplitude per level (up to 6, matching the maximum Depth), each its own free control with no effect on any other level. With every level's amplitude at `0`, this generator is provably identical to the plain Sierpinski generator.

### Scale / Octaves (per level)

The underlying noise field's own coarseness/detail controls — one independent scale and octaves per level, same as Amplitude, so each level's warp can have its own texture as well as its own strength, with no effect on any other level.

---

## Visualisation

Reuses the plain Recursive generator's nested-squares diagram, but with each square's edge drawn slightly wavy rather than perfectly straight — the visual difference between the two related diagrams is itself the point being taught.

---

## Try Exploring...

Set every level's Amplitude to 0 and compare directly against the plain Sierpinski generator at the same Depth — the two outputs are identical. Then raise one level's Amplitude at a time and watch only that level's own square edges begin to warp, while every other level stays exactly as it was.

---

## Used By

* Perlin Sierpinski

---

## Related Generators

* Recursive / Fractal (this hybrid's subdivision construction, at `amplitude = 0`)
* Noise (this hybrid's source of the warping offset)
