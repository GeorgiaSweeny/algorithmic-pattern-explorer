# Seed Points

## Summary

Generates a set of spatial points used as the basis for procedural structures such as Voronoi diagrams.

---

## Purpose

The Seed Points node creates a distributed set of positions within the workspace. These points act as anchors for further computation such as partitioning, distance calculation, or region generation.

This node is fundamental to algorithms that rely on spatial sampling.

---

## Computational Thinking Concepts

- Randomness
- Sampling
- Spatial Reasoning

---

## Mathematical Principle

Points are generated using deterministic or stochastic sampling distributions within a bounded coordinate system.

---

## Inputs

Workspace.

---

## Outputs

A set of 2D points.

---

## Parameters

### Number of Points

Controls density of generated points.

### Distribution

Uniform, clustered, or Poisson-disc sampling.

### Seed

Controls reproducibility of point layout.

---

## Visualisation

Points appear progressively across the workspace.

---

## Try Changing...

Switch from uniform to Poisson distribution and observe clustering differences.

---

## Used By

- Voronoi Diagram system
- Distance Field computation

---

## Related Nodes

- Grid
- Noise
- Partition