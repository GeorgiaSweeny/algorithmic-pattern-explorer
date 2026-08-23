# Colour Mapping

## Summary

Converts computational values into colours.

---

## Purpose

The Colour Mapping node transforms numerical outputs into meaningful visual representations.

Rather than changing the underlying computation, this stage controls how data is communicated visually.

---

## Computational Thinking Concepts

* Representation
* Abstraction

---

## Mathematical Principle

Numerical values are mapped onto a colour scale using interpolation or thresholding.

---

## Inputs

Scalar values or geometry.

---

## Outputs

Coloured pattern.

---

## Parameters

### Palette

Colour scheme used for rendering.

### Gradient

Colour interpolation method.

### Threshold

Maps values into discrete colour bands.

---

## Visualisation

The pattern gradually transitions from greyscale to colour.

---

## Try Changing...

Compare continuous gradients with discrete threshold colouring.

---

## Implementation note (added 2026-08-21, extended same day)

Two concrete forms of this node exist, covering every pattern in the
registry — not just the discrete, tone-count-based one:

- **Discrete, `tones` + `colour1`..`colour5`** (`lib/colourMapping.js`'s
  `toneSet`/`svgFillsFor`): every vector-format pattern that draws
  discrete tone-indexed shapes — Voronoi Diagrams, all five Grid
  Tessellation shapes, Escher Type I, Islamic Rosette. `tones` (2-5)
  picks how many discrete colour classes exist; `colourN` is an
  independently user-editable colour for each class, defaulting to a
  monotonic white-to-black ramp so every pattern stays greyscale until a
  user picks otherwise. Originally built for Islamic Rosette only, then
  extended to every other tone-based pattern
  (`patternRegistry.js`'s shared `tonesAndColourParams()` helper).
- **Continuous/binary, `colour1` + `colour2`** (`render.js`'s
  `mapColour`, `lib/colourMapping.js`'s `mixHex`): every pattern with no
  `tones` concept at all — either a genuinely continuous scalar (Perlin/
  Ridge Noise, Wave Stripes, Concentric Rings) or a binary filled/empty
  test (Sierpinski Carpet, Recursive Grid, Perlin Sierpinski), plus
  Voronoi Islamic's raster tone bands, which this same 2-stop linear
  interpolation also covers sensibly. `colour1` (light/background,
  value = +1) and `colour2` (dark/primary, value = -1) interpolate
  linearly between the two — for a `nativeFormat: "raster"` pattern this
  is read by the shared raster render pipeline (`PatternCanvas.jsx`,
  `patternGen.js`, `export.js`), not the generator function itself, the
  same "Colour Mapping is a separate stage from the generator's own
  math" split the discrete form above already embodies for vector
  patterns — see `render.js`'s `mapColour` header comment. At the
  default colours (white/black) this is pixel-identical to the original
  `grayscale()` function it generalises, so no pattern's default
  appearance changed.

Before this second form existed, four raster-only patterns (Perlin
Noise, Ridge Noise, Perlin Sierpinski, Voronoi Islamic) had a Colour
Mapping node in their graph with zero attached params — selectable but
empty, since nothing in the registry routed to it. Closing that gap
(along with the same gap for Wave/Recursive's SVG renderers, which had
hardcoded grey/white/black rather than any editable colour at all) is
what motivated building the continuous form, rather than only extending
the discrete one to patterns it doesn't actually fit.

## Used By

* Perlin Noise, Ridge Noise (continuous form)
* Voronoi Diagrams, Grid Tessellations (all five shapes), Escher Type I,
  Islamic Rosette (discrete form)
* Wave Stripes, Concentric Rings, Sierpinski Carpet, Recursive Grid,
  Perlin Sierpinski, Voronoi Islamic (continuous form)

---

## Related Nodes

* Noise
* Render

---

# Stroke

## Summary

Controls the appearance of rendered geometry.

---

## Purpose

The Stroke node defines how outlines are drawn, allowing the visual style of a pattern to be adjusted without changing the underlying geometry.

---

## Computational Thinking Concepts

* Representation

---

## Mathematical Principle

Rendering attributes modify graphical primitives without affecting computational structure.

---

## Inputs

Geometry.

---

## Outputs

Styled geometry.

---

## Parameters

### Stroke Width

Line thickness.

### Opacity

Transparency.

### Line Style

Solid, dashed or dotted.

---

## Visualisation

Stroke properties update in real time.

---

## Try Changing...

Increase the stroke width while leaving the geometry unchanged.

---

## Used By

All generators.

---

## Related Nodes

* Colour Mapping
* Render
