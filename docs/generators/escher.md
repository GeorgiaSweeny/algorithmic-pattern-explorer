# Escher-Inspired Tessellation

## Summary

Deforms a regular tiling's straight edges into a matching wavy or jagged boundary, so neighbouring tiles interlock like jigsaw pieces.

---

## Purpose

Shows how a small, local change — bending one tile's edges — can turn a plain repeating grid into the interlocking figurative tessellations popularised by M.C. Escher, without needing to design a whole new tiling from scratch. The deformation is applied consistently everywhere, so tiles that were plain squares before still fit together perfectly afterward.

---

## Computational Thinking Concepts

* Transformation
* Rule-based generation
* Symmetry

---

## Mathematical Principle

Craig Kaplan's doctoral dissertation on computer-generated Islamic star patterns and Escher-style tessellation provides a rigorous computational treatment of this construction, including the symmetry-group reasoning this generator relies on implicitly; Doris Schattschneider's standard reference on Escher's own working methods documents the different, largely manual and trial-and-error process the real M.C. Escher actually used to design his interlocking tiles by hand. These represent two different traditions answering two different questions — Kaplan formalises a repeatable, automatable construction rule; Schattschneider documents an artist's own iterative design process — and this generator deliberately follows Kaplan's route, since it needs a parametrised rule rather than a hand-tuned tile.

The construction itself: each axis's edge displacement is driven by the *other* axis's position — the vertical edge's wiggle is a function of the horizontal position, and vice versa — then the same displacement is mirrored on the opposite edge of each tile. Because the deformation is periodic and exactly antisymmetric across the tile grid, every tile's bulge on one edge matches its neighbour's matching notch on the shared edge, so the tiles still interlock with no gaps despite their new, irregular boundary.

A related, more specific piece of prior art is Kaplan and Salesin's "Escherization" algorithm, which automatically deforms a tile toward a *chosen target figure* (a bird, a fish) via optimisation over a large search space of valid tilings. This generator does not target any specific figure at all — it applies one fixed periodic deformation rule everywhere, trading the ability to aim at a particular recognisable shape for a construction cheap enough to compute per pixel in real time.

---

## Parameters

### Tile Size

Controls how large each tile is before deformation.

### Deformation Type / Amount

Controls the shape and strength of the edge displacement applied to each tile boundary.

---

## Visualisation

A dashed plain square tile next to a solid tile with one wavy edge, matched by an identical (mirrored) wavy cut on the opposite edge — showing that the two edges match, not just "a wiggly square."

---

## Try Exploring...

Increase the deformation amount and watch how the bulge on one tile's edge always matches an identical notch on its neighbour — the tiles never develop a gap, no matter how strong the deformation gets.

---

## Used By

* Escher-Inspired Tessellation

---

## Related Generators

* Grid (the plain, undeformed tiling this generator's construction builds on)
