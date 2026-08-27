# Noise

## Summary

Builds an organic, cloud-like texture out of smoothly blended randomness, layered at increasing detail and decreasing strength.

---

## Purpose

Demonstrates that "random" and "smoothly varying random" are genuinely different things, and that the second is what makes procedural textures look natural rather than like static. This generator sits at the fully stochastic end of the project's spectrum — every other generator either builds on the same layering idea (the two hybrids) or sits further toward the deterministic end.

---

## Computational Thinking Concepts

* Randomness
* Emergence
* Parameterisation

---

## Mathematical Principle

Perlin noise interpolates pseudo-random gradient values into a smooth, continuous field — unlike pure random noise, neighbouring points produce similar values, so the result looks like a smoothly varying surface rather than static. Ken Perlin's original 1985 construction is the primary source for this technique; Perlin's own 2002 "Improving Noise" revision corrects visible axis-aligned directional artefacts present in the original by restricting gradient vectors to a different fixed small set and using a smoother interpolant, and is the version this generator actually implements.

A single layer of noise looks like an irregular sine wave: a fairly consistent amplitude within a narrow band of frequencies, but without a sine wave's perfect periodicity. Summing several layers ("octaves") of this noise, each at higher frequency and lower amplitude than the last, is called **fractal Brownian motion (fBm)** — a standard technique documented in implementation-level detail by NVIDIA's *GPU Gems* series, and covered generally, alongside sibling noise families such as cellular/Worley noise, by Lagae et al.'s widely-cited survey of procedural noise functions:

```
sum = 0, amplitude = 1, frequency = 1
for i in 0..octaves:
    sum += amplitude * noise2D(x * scale * frequency, y * scale * frequency)
    amplitude *= persistence   // shrinks each octave's contribution
    frequency *= lacunarity    // raises each octave's frequency
value = sum / (sum of all amplitudes used)   // renormalised back into [-1, 1]
```

Because each octave is the same noise function rescaled, the result is self-similar: zooming into a small region of a high-octave field looks statistically like the whole field, the same way a coastline looks similarly jagged at any zoom level.

Gradient noise built this way is smooth and differentiable by construction, unlike a Voronoi partition's deliberately hard cell-boundary discontinuities (see `voronoi.md`) — the two generators sit at opposite ends of the same procedural-noise family for exactly that reason, chosen here for what they're each good at rather than being interchangeable techniques.

### Ridge mode

"Ridge" is not a different noise algorithm — it is a post-transform of the same fBm value (`raw`, still in `[-1, 1]`) that turns smooth troughs and peaks into sharp creases: `value = 1 - 2 * abs(raw)`. Every zero-crossing of the underlying noise becomes a sharp peak instead, producing a mountain-ridge-like network rather than rolling hills.

---

## Parameters

### Mode

`standard` (plain fBm, smooth rolling texture) or `ridge` (the same field folded through `1 - 2|value|` to produce sharp ridgelines instead).

### Scale / Frequency

Controls the overall scale of the noise field.

### Octaves

How many layers of detail are summed together.

### Persistence

Controls how much each successive octave contributes relative to the last.

### Lacunarity

Controls how much the frequency increases between octaves.

---

## Visualisation

Several overlapping dashed wavy lines at different scales collapsing into one solid, denser wavy line — visualising octave layering without needing an actual rendered noise field.

---

## Try Exploring...

Increase the number of octaves while reducing persistence, then switch Mode to `ridge` with the same values and compare the two outputs directly — the ridge network traces exactly where the standard field crosses zero.

---

## Used By

* Perlin Noise (`mode: standard`)
* Ridge Noise (`mode: ridge`)

---

## Related Generators

* Voronoi (the opposite end of the same procedural-noise family — deliberately discontinuous rather than smooth)
* Perlin Sierpinski (a hybrid that uses this generator's own noise field to perturb a fractal subdivision)
