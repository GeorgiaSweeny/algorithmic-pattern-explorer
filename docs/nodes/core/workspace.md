# Workspace

## Summary

Defines the computational space in which the algorithm operates.

---

## Purpose

The Workspace node establishes the area in which all subsequent computations occur. It defines the dimensions and coordinate system used throughout pattern generation.

The workspace is not the same as the canvas the learner sees on screen. The workspace is the algorithm's own coordinate space — the "world" that seed points, transformations and calculations exist within. The canvas is simply the window through which that world is viewed, much like a camera looking into a scene.

This distinction matters because the two do not have to match:

* If the workspace is **larger** than the canvas, the canvas shows a cropped view — only part of the workspace is visible at once.
* If the workspace is **smaller** than the canvas, the workspace only fills part of the canvas, leaving empty space around it.
* The two happen to be the same size in this application's current examples, which is why the distinction can be easy to miss.

---

## Computational Thinking Concepts

* Abstraction
* Problem Definition
* Spatial Reasoning

---

## Mathematical Principle

Algorithms operate within a coordinate system. Defining the workspace establishes the bounds and reference frame for all subsequent operations.

---

## Inputs

None.

---

## Outputs

An empty computational workspace.

---

## Parameters

### Width

The horizontal size of the workspace.

### Height

The vertical size of the workspace.

---

## Visualisation

Animate the workspace expanding from the centre to reveal the available computational area.

---

## Try Changing...

Increase the workspace dimensions and observe how more geometry can be generated.

---

## Used By

* Perlin Noise
* Voronoi Diagrams
* Escher Tessellations
* Islamic Geometric Patterns

---

## Related Nodes

* Base Geometry
* Grid
* Render
