# Voronoi-Seeded Islamic Tiling (hybrid)

## Summary

Places an Islamic star medallion inside each cell of an irregular Voronoi mosaic, instead of a regular grid.

---

## Purpose

Directly tests whether a construction built for a *regular*, evenly-spaced arrangement of cells — the Islamic Geometric Rosette generator's own "one star per tile" idea — still works once the cells themselves stop being regular at all. This generator swaps out the cell source and keeps the star construction completely unmodified, isolating exactly what needs to change to make that combination work.

---

## Computational Thinking Concepts

* Composition
* Spatial reasoning
* Emergence

---

## Mathematical Principle

This hybrid combines two generators already documented separately (see `voronoi.md` and `islamic.md`) rather than inventing new geometry. Cell membership reuses Voronoi's own nearest-seed test directly — a Voronoi cell is, by definition, the set of points closer to its own seed than to any other, so the nearest-seed answer *is* the cell, with no separate cell-polygon construction needed, exactly as in the plain Voronoi generator. From there, every downstream step — placing the ring of points, building the star polygon's silhouette from chord self-intersections, and banding the result into colour — is the Islamic generator's own construction, reused without modification.

One genuine new piece of geometry was needed to make the combination work: Islamic geometric rosettes on a *regular* grid can safely use a medallion radius scaled to the fixed tile size, since every tile is identical. Voronoi cells vary in size, so a single canvas-wide radius either looks right on average and overflows in the smallest, densest cells, or is shrunk so conservatively that it wastes space in the largest ones. This is resolved by scaling each cell's medallion to that specific cell's own nearest-neighbour spacing, rather than to a shared constant — the one place this hybrid needed to introduce genuinely new geometry rather than just reusing its two parent constructions unchanged.

A later refinement adds a second, independent boundary test — a pixel sits exactly on its own cell's edge where it is equidistant from its two nearest seeds — combined with the star's own silhouette test, so the cells read as a connected tiling with visible boundaries between medallions, rather than a set of disconnected, independently-floating stars.

---

## Parameters

### Number of Cells

How many Voronoi seed points are scattered — more points produce smaller, more numerous star medallions.

### Segments / Scale

The same star-construction parameters as the plain Islamic generator, applied independently inside every cell.

### Variation

Optionally lets each cell's own star diverge slightly (a different segment count or rotation) rather than every medallion being visually identical, seeded deterministically per cell.

---

## Visualisation

A solid Voronoi cell mosaic (reusing the Voronoi generator's own diagram) with one small star motif (reusing the Islamic generator's own diagram) placed inside one cell — visually stating "the two constructions above, combined."

---

## Try Exploring...

Compare this generator side by side with the plain Islamic Geometric Rosette — the star construction inside any one cell is identical; only the cells' own shapes and sizes differ.

---

## Used By

* Voronoi-Seeded Islamic Tiling

---

## Related Generators

* Voronoi (this hybrid's cell source)
* Islamic Geometric Rosette (this hybrid's star construction)
