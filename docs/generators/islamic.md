# Islamic Geometric Rosette

## Summary

Builds a star medallion by placing points evenly around a circle and connecting each one to another a fixed number of steps away.

---

## Purpose

Demonstrates that an elaborate-looking, richly decorative pattern can come from a small, fully deterministic geometric rule applied repeatedly — the same family of construction found throughout historic Islamic architecture and art, going back centuries before computers existed to draw it.

---

## Computational Thinking Concepts

* Rule-based generation
* Symmetry
* Procedural modelling

---

## Mathematical Principle

Craig Kaplan and David Salesin's work on computer-generated Islamic star patterns provides rigorous mathematical grounding for this family of construction; Jay Bonner and Craig Kaplan's book-length treatment of Islamic geometric patterns remains the strongest single source for construction methodology across this literature.

The construction: `n` points ("tips") are placed at even angles around a circle. Rather than connecting each point to its immediate neighbour, every point is connected to another a fixed number of steps ("skip") further around the circle — the classic `{n/skip}` star-polygon construction, the same idea behind a five-pointed pentagram (`n = 5`, `skip = 2`). This generator uses the standard "basic star" skip of 2 for any `n`. Where two of these connecting chords cross near the gap between adjacent tips, that crossing point becomes a "waist" point; the tips and waist points together trace one closed outline — the star's genuine silhouette, derived from real line-line intersections rather than approximated. For `n = 5`, the waist-to-tip radius ratio produced by this construction works out to exactly `1/φ²` (about 0.382) — the well-known golden-ratio proportion of a regular pentagram — falling out of the general formula rather than being tuned toward it, which is strong independent evidence the construction is geometrically genuine rather than merely plausible-looking.

This generator is a deliberately scoped-down reading of the construction *mechanism* (radial symmetry from a deterministic rule), not a reproduction of the full historical method, which more traditionally combines several overlapping circles and compass-and-straightedge steps, or — in this project's own undergraduate precedent — a translate/rotate/boolean-union pipeline over whole shapes. That whole-shape boolean approach has no natural expression in this project's own point-by-point computation model, which is why a chord self-intersection method was used instead: it reaches the same visual family of star-and-petal rosettes by a route that can be computed one point at a time.

---

## Parameters

### Segments

How many points (`n`) are placed around the circle, controlling the star's overall symmetry order.

### Rotation

Rotates the whole point ring, and therefore the star, around its centre.

### Scale

Controls how large the medallion is within its tile.

### Tone Count / Colours

Controls how many bands the star's outline is divided into for colouring.

---

## Visualisation

A dashed ring of evenly-spaced dots next to a solid star-polygon formed by connecting alternating points (a small pentagram-like shape) — the `{n/skip}` construction shown directly, not a generic star icon.

---

## Try Exploring...

Change Segments from 5 to 10 and watch the star's symmetry order change to match — the same connect-every-second-point rule at any point count.

---

## Used By

* Islamic Geometric Rosette

---

## Related Generators

* Grid (one of two possible regular cell sources this pattern's medallions can be placed onto)
* Voronoi-Seeded Islamic Tiling (a hybrid that places this generator's own medallion construction into Voronoi's irregular cells instead of a regular grid)
