# Voronoi

## Summary

Scatters seed points across the canvas, then colours every other point according to whichever seed is nearest.

---

## Purpose

Shows how a handful of scattered points can partition an entire plane into regions, purely by asking "which point is closest?" at every location — no cell boundaries are ever explicitly drawn or calculated; they emerge automatically from the nearest-point rule itself.

---

## Computational Thinking Concepts

* Spatial reasoning
* Emergence
* Abstraction

---

## Mathematical Principle

A Voronoi diagram is the canonical construction from computational geometry for partitioning a plane by nearest feature: given a set of seed points, every other point in the plane belongs to whichever seed is closest to it, and the boundary between two neighbouring regions is exactly the set of points equidistant from both. Steven Worley's cellular texture basis function establishes this technique as a graphics primitive in its own right, distinct from its purely mathematical treatment; Craig Kaplan demonstrates the same underlying structure used for ornamental and decorative pattern design rather than purely scientific or computational-geometry purposes, which is closer to how this project uses it.

The construction needs no separate cell-boundary calculation at all: a "cell" is simply the set of points for which one particular seed is the nearest, so testing "which seed is nearest to this pixel?" and colouring accordingly produces the full mosaic automatically, one pixel at a time. This is the same underlying question a territory map answers when it colours the land nearer to one town than to any other — no council ever draws the boundary directly, it falls out of the "nearest town" rule on its own.

This generator's own hybrid extension (see `voronoi-islamic.md`) reuses this exact nearest-seed test to decide cell membership for its Islamic star medallions, without ever constructing an explicit cell polygon either.

---

## Parameters

### Number of Cells

How many seed points are scattered — more points produce smaller, more numerous cells.

### Seed

Controls the specific scatter of points; the same seed always produces the identical layout.

---

## Visualisation

A dashed scatter of four or five dots next to a solid version of the same dots with cell boundaries drawn between them — the territory-map idea made visual, emphasising that the boundaries emerge from the points rather than being drawn separately.

---

## Try Exploring...

Increase the number of cells and watch the average cell size shrink accordingly — the same nearest-seed rule at every point count, just with more competition for each pixel.

---

## Used By

* Voronoi Cells

---

## Related Generators

* Noise (the opposite end of the same procedural-noise family — deliberately continuous rather than discontinuous)
* Grid (a different, closed-form way of answering "which cell is this point in?")
* Voronoi-Seeded Islamic Tiling (a hybrid that reuses this generator's own cell-membership test as the basis for a star-pattern construction)
