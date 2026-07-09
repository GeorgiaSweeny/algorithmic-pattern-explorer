# Seed

## Summary

Initialises the pseudo-random number generator used by stochastic algorithms.

---

## Purpose

The Seed node controls the sequence of random values produced during algorithm execution.

Although the generated values appear random, using the same seed always produces the same sequence. This demonstrates that many procedural systems are deterministic despite appearing unpredictable.

---

## Computational Thinking Concepts

* Randomness
* Determinism
* Reproducibility

---

## Mathematical Principle

Pseudo-random number generators produce repeatable sequences from an initial seed value.

---

## Inputs

None.

---

## Outputs

A deterministic random sequence.

---

## Parameters

### Seed Value

Initial value used by the random number generator.

---

## Visualisation

Changing the seed updates the generated pattern while reusing the same value recreates previous results.

---

## Try Changing...

Use several different seed values, then return to an earlier one and observe that the pattern is reproduced exactly.

---

## Used By

* Perlin Noise
* Voronoi Diagrams

---

## Related Nodes

* Noise
* Seed Points
