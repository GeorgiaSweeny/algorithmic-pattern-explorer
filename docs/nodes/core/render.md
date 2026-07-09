# Render

## Summary

Converts the computational representation into the final visual output.

---

## Purpose

The Render node represents the final stage of every algorithm. It transforms the computed geometry or scalar values into an image that can be viewed, explored and exported.

Separating rendering from computation reinforces that generating data and displaying it are distinct computational processes. This is also where the workspace is presented onto the canvas — if the two differ in size, rendering is what determines whether the workspace appears cropped, letterboxed, or scaled to fit.

---

## Computational Thinking Concepts

* Representation
* Visualisation
* Abstraction

---

## Mathematical Principle

Rendering maps computational data structures to graphical primitives such as lines, polygons or pixels.

---

## Inputs

Generated geometry or scalar data.

---

## Outputs

Rendered pattern.

---

## Parameters

### Stroke Width

Width of rendered lines.

### Fill

Fill colour or gradient.

### Output Type

Raster or vector output.

---

## Visualisation

Construction geometry gradually resolves into the finished pattern.

---

## Try Changing...

Compare different rendering styles while leaving the underlying algorithm unchanged.

---

## Used By

All generators.

---

## Related Nodes

* Colour Mapping
* Workspace
