# Subdivide

## Summary

Divides a region into a smaller grid of cells and recurses into one, building
self-similar structure one level at a time.

---

## Purpose

The Subdivide node applies the same grid-division rule repeatedly, feeding each
level's output back in as the next level's input. This recursive reapplication is
what produces fractal, self-similar structures such as the Sierpinski carpet — each
level looks like the level above it, just at a smaller scale.

---

## Computational Thinking Concepts

- Decomposition
- Iteration
- Recursion
- Pattern Recognition

---

## Mathematical Principle

A region in `[0, 1) x [0, 1)` is divided into an `n x n` grid. The cell a point falls
into is `(floor(x*n), floor(y*n))`; the point's position remapped back into
`[0, 1) x [0, 1)` for the next level is `((x*n) mod 1, (y*n) mod 1)`. Applying this
same step `depth` times, and testing each level's cell against some rule (e.g. "is
this the centre cell?"), is what produces a self-similar structure: because every
level runs the identical rule on remapped `[0, 1)` coordinates, any non-excluded
sub-cell at depth *d* looks exactly like the whole pattern at depth *d - 1*.

---

## Inputs

A point in `[0, 1) x [0, 1)`, a subdivision count, and a remaining recursion depth.

---

## Outputs

Whether the point's cell is excluded at this level (e.g. the Sierpinski "hole"), and
— if not excluded — the point remapped for the next level's Subdivide.

---

## Parameters

### Subdivisions

How many cells each axis is divided into per level (`n` above).

### Depth

How many times the division is reapplied before stopping.

---

## Visualisation

Each level's grid division briefly highlights before zooming into the next cell.

---

## Try Changing...

Increase Depth to see finer self-similar detail; change Subdivisions to see how the
excluded-cell rule changes shape (e.g. 3 divisions removing the centre cell gives a
Sierpinski carpet).

---

## Used By

- Sierpinski Carpet
- Recursive Grid

---

## Related Nodes

- Grid
- Repeat
