# Partition

## Summary

Divides space into distinct regions based on spatial rules such as nearest point or distance threshold.

---

## Purpose

The Partition node assigns every position in space to a region based on defined criteria. This is the foundation of Voronoi-like structures.

---

## Computational Thinking Concepts

- Classification
- Spatial Reasoning
- Pattern Formation

---

## Mathematical Principle

Each spatial coordinate is assigned to a region based on a minimisation rule (e.g. nearest seed point).

---

## Inputs

- Distance field or seed points

---

## Outputs

Discrete region map

---

## Parameters

### Partition Method

Nearest point, threshold, or clustering.

### Resolution

Controls precision of region boundaries.

---

## Visualisation

Regions appear progressively forming bounded cells.

---

## Try Changing...

Increase resolution and observe sharper boundaries.

---

## Used By

- Voronoi system
- Cellular structures

---

## Related Nodes

- Distance Field
- Seed Points
