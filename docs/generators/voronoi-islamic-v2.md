# Voronoi-Seeded Islamic Tiling (Improved) (hybrid)

## Summary

Islamic Rosette's own star construction, placed at each cell of an irregular Voronoi mosaic instead of a regular grid — with nothing else about that construction changed at all.

---

## Purpose

The original Voronoi-Seeded Islamic Tiling asked "does this construction generalise to an irregular cell source at all, and what's the least new geometry needed to make it look coherent" — and answered that by scaling each cell's medallion to that specific cell's own local spacing. This version asks a narrower, more literal question instead: what does the combination look like if *nothing* downstream of cell placement is adapted — if Voronoi's Seed Points simply takes over the one job Grid used to do, full stop.

---

## Computational Thinking Concepts

* Composition
* Spatial reasoning
* Decomposition

---

## Mathematical Principle

Islamic Rosette's own pipeline decomposes cleanly into two parts: a *cell lookup* (which region a pixel belongs to, and that region's own centre) and everything built from that centre outward (Construction Circle, Radial Divisions, the star polygon's self-intersecting silhouette, and its rings). Only the first part is Grid-specific. This hybrid swaps that one part for Voronoi's own nearest-seed lookup and reuses the second part completely unmodified — literally the same function calls, not a re-derivation of them.

Seed points are a plain, unconstrained scatter across the canvas (`Num Cells` points, a Poisson process — the same seed-point primitive Voronoi and Voronoi-Seeded Islamic Tiling both use), not laid out on any underlying grid. Because every cell uses the exact same fixed medallion radius (`Tile Size × Scale`, islamic.js's own formula, not adapted to each cell's own irregular spacing), and a Poisson process has no bound on how close two points can land or how large a gap can appear by chance, medallions from densely-packed cells can overlap and medallions in sparse regions can leave gaps — an honest, expected consequence of this being a genuinely natural Voronoi mosaic, not a bug to smooth over.

The rings themselves reuse Islamic Rosette's own **ring construction**, not the plainer one its raster preview function happens to use internally. Islamic Rosette always renders in the app via its SVG generator, which builds each ring as a *true perpendicular offset polygon* of the star silhouette: every edge is shifted along its own normal, and each vertex is rebuilt from where its two adjacent shifted edges intersect (mitered, with a bevel fallback past a limit). At two or more bands out, those independently-reconstructed edges start crossing each other — genuinely new, self-intersecting shapes, not just smaller copies of the same outline. This hybrid evaluates that identical ring geometry (`lib/polygonOffset.js`, shared with the SVG renderer) per pixel instead of stroking it as SVG, which is what lets its output be compared fairly against what Islamic Rosette itself actually looks like on screen.

---

## Parameters

### Num Cells

How many seed points are scattered across the canvas — how many medallions there roughly are, not how big any one of them is (that's `Tile Size`, below). More cells means more, closer-together medallions (denser overlap); fewer cells means larger gaps between them.

### Tile Size / Scale / Segments / Frequency / Line Width / Rotation

Exactly Islamic Rosette's own parameters, with exactly their own meanings — nothing about how they're used changes here. `Tile Size` keeps exactly its own role from Islamic Rosette: the medallion's own construction radius, via `Tile Size × Scale`.

### Random Rotation

Independent of `Rotation` above, not exclusive with it. Off: every medallion shares one rotation, exactly as in Islamic Rosette. On: each cell's medallion gets its own independently random rotation, deterministic from `Seed` and that cell's own point (an xorshift32 stream mixed with the cell's index, the same per-cell randomisation technique Voronoi-Seeded Islamic Tiling's own `Variation` uses) — so the same seed always reproduces the exact same per-cell rotations. If `Rotation`'s own `Flipped` is also on, that flip is added on top of each cell's own random rotation rather than replacing it: every medallion still gets an independently random orientation, just each one additionally flipped by the same fixed amount.

---

## Visualisation

The same Voronoi-mosaic-plus-one-star diagram as the original hybrid — the difference between the two is algorithmic (how the medallion's size responds to its cell), not something a single zoomed-out diagram of either version can show.

---

## Try Exploring...

Raise Num Cells and watch medallions pack in more densely, overlapping more often; lower it and watch gaps open up between them — both are an honest consequence of a fixed medallion size meeting an irregular, natural point scatter, not something this hybrid tries to hide.

At lower Segments values (where more than one ring band survives each way — this thins out quickly as Segments rises), look closely at the second and third rings out from each medallion's own edge — those aren't just smaller or larger copies of the same star, they're independently reconstructed offset polygons whose edges start overlapping each other, the same self-intersecting complexity Islamic Rosette's own rings show.

Turn on Random Rotation and compare against it off — every medallion now points its own way instead of sharing one shared orientation, which reads as a much less mechanically-repetitive mosaic. Then turn on Rotation's own Flipped as well and see that every medallion is still independently rotated, just all flipped together by the same amount on top.

---

## Used By

* Voronoi-Seeded Islamic Tiling (Improved)

---

## Related Generators

* Islamic Geometric Rosette (this hybrid's entire downstream construction, unmodified)
* Voronoi (this hybrid's cell source)
* Voronoi-Seeded Islamic Tiling (the earlier version of this same hybrid, which does adapt medallion size to each cell)
