# Lattice Index

## Summary

Assigns a discrete colour-class index to a position within a regular, infinitely repeating tiling.

---

## Purpose

A tiling of the plane (square, triangle, hexagon, brick or diamond) has no
finite set of "seed" points to search, so it can't be built from Distance
Field/Partition the way Voronoi is. Instead, each tiling shape has its own
closed-form coordinate arithmetic that maps any position directly to which
tile it falls in, and which colour class that tile belongs to. Lattice Index
is that arithmetic, named as its own computational stage.

---

## Computational Thinking Concepts

- Spatial Reasoning
- Pattern Recognition
- Abstraction

---

## Mathematical Principle

Each shape re-expresses `(x, y)` in a coordinate system suited to its own
lattice before assigning an index:

- **Square**: `(x, y)` divided directly by tile size.
- **Diamond**: the same square lattice, but in a frame rotated 45°.
- **Triangle**: an oblique (non-orthogonal) coordinate system, since a
  triangular lattice isn't axis-aligned.
- **Hexagon**: cube coordinates (three axes at 120° with a `q + r + s = 0`
  constraint) with rounding to the nearest lattice cell.
- **Brick**: a running-bond offset — alternating rows are shifted by half a
  brick width before dividing into columns.

In every case the index is then reduced (usually by a small modulus) so that
no two adjacent tiles share a colour — a proper colouring of the tiling's
adjacency graph, not an arbitrary banding. Square and diamond's plain
`(col + row) mod n` colouring is proper for any tone count `n`; hexagon,
triangle and brick each need their own base formula (see the source for the
per-shape derivation) but that formula, once found, also generalises to any
`n >= 3` — only `n = 2` needs a distinct, simpler fallback for those three
shapes (added 2026-08-21 when every registry pattern's tones range was
extended to 2-5, matching Islamic Rosette's own range; verified by
brute-force adjacency check for n = 3, 4, 5 before generalising, not just
extended by assumption from the original n = 3 case).

---

## Inputs

A position, a tile size, and the number of colour classes (tones) to use.

---

## Outputs

A discrete integer index, one per colour class.

---

## Parameters

### Shape Type

Which of the five supported lattices to compute an index for (this comes
from the Base Geometry node upstream; Lattice Index itself has no separate
shape choice of its own).

---

## Visualisation

The tiling resolves from an undivided plane into its coloured cells.

---

## Try Changing...

Compare Square against Diamond — the same underlying square lattice, just
computed in a 45°-rotated coordinate frame — to see how a coordinate change
alone can produce a visually distinct pattern from the same rule.

---

## Used By

- Grid Tessellations (all five shapes)

---

## Related Nodes

- Base Geometry
- Colour Mapping
- Partition *(a related but distinct concept — Partition searches a finite
  point set; Lattice Index computes a cell directly from closed-form
  coordinate arithmetic over an infinite tiling. See
  `docs/ALGORITHMIC_COMPOSITION_RESEARCH.md` open question 1.)*
