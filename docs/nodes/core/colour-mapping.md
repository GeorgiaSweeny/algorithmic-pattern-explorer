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

## Used By

* Perlin Noise
* Voronoi Diagrams

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
