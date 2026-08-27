# Grid

## Summary

Repeats one simple shape across the whole canvas with no gaps or overlaps, the same idea behind bathroom tiles or a chessboard.

---

## Purpose

Shows the simplest possible version of "which repeating cell is this point in?" — a question that comes up again in more complex forms throughout the project (Voronoi's nearest-seed search, Islamic geometry's radial cells). Here the answer is a closed-form coordinate calculation rather than a search, since a regular tiling has no finite set of points to search against.

---

## Computational Thinking Concepts

* Rule-based generation
* Parameterisation
* Spatial reasoning

---

## Mathematical Principle

Tiling the plane with a repeating shape — square, triangle, hexagon, brick, or diamond — is common, general geometry: the same principle behind physical floor tiles, honeycomb structure, or a chessboard, not a claim attributed to any one source. What differs between shapes is the coordinate arithmetic used to answer "which repeating cell does this point fall in?":

- **Square** divides the canvas into equal square cells directly from `x`/`y` divided by tile size.
- **Triangle** uses oblique (non-perpendicular) coordinates, since a triangular grid's natural axes aren't at right angles to each other.
- **Hexagon** uses cube coordinates, a standard representation for hexagonal grids, then rounds to the nearest valid hexagon centre.
- **Brick** offsets alternating rows by half a tile width (a "running bond" pattern, the same layout used in real brickwork).
- **Diamond** uses a coordinate frame rotated 45 degrees from square's.

Each shape's arithmetic is a genuine coordinate-space change, not a disguised search over a list of points and not a rotation/translation/repeat of a simpler shape — a triangular or hexagonal grid's coordinate change is a shear, which a simple rotation doesn't represent, so each shape gets its own dedicated calculation rather than being forced through one shared geometric operation that doesn't actually fit.

---

## Parameters

### Shape

`square`, `triangle`, `hexagon`, `brick`, or `diamond` — selects which coordinate arithmetic is used.

### Tile Size

Controls how large each repeating cell is.

---

## Visualisation

A dashed single shape (e.g. one square) next to a solid small grid of several repeated copies of that same shape — "one shape, repeated with no gaps" as the visual claim.

---

## Try Exploring...

Switch between shapes and notice that the workflow itself — the sequence of stages — never changes length or order; only the coordinate arithmetic inside one stage differs.

---

## Used By

* Square Grid (`shape: square`)
* Hex Grid (`shape: hexagon`)
* Triangle Grid (`shape: triangle`)
* Brick Grid (`shape: brick`)
* Diamond Grid (`shape: diamond`)

---

## Related Generators

* Voronoi (a different way of answering "which cell is this point in?" — nearest-point search instead of closed-form arithmetic)
* Islamic Geometric Rosette (uses a regular grid of tiles as one of its two possible cell sources, alongside Voronoi's irregular one)
