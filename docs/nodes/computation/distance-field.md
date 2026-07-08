# Distance Field

## Summary

Computes a scalar field representing the distance from each point in space to a set of geometric features.

---

## Purpose

The Distance Field node transforms discrete geometric structures into continuous spatial data.

It is used to generate smooth transitions between regions and forms the basis of many advanced procedural techniques.

---

## Computational Thinking Concepts

- Spatial Reasoning
- Abstraction
- Continuous Representation

---

## Mathematical Principle

For each point in space, the minimum Euclidean distance to a set of target features is computed.

---

## Inputs

- Points or geometry

---

## Outputs

Scalar field (distance values)

---

## Parameters

### Distance Metric

Euclidean, Manhattan, or custom metric.

### Falloff

Controls smoothing of distance transitions.

---

## Visualisation

Heatmap representing proximity to nearest feature.

---

## Try Changing...

Switch between Euclidean and Manhattan distance and observe shape changes.

---

## Used By

- Voronoi diagrams
- Metaball-style systems
- Partitioning algorithms

---

## Related Nodes

- Partition
- Seed Points
- Noise
