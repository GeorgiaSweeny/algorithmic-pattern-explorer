# Noise

## Summary

Generates smooth, continuous random values across space.

---

## Purpose

The Noise node produces controlled randomness. Unlike purely random values, neighbouring positions produce similar outputs, allowing natural-looking patterns to emerge.

---

## Computational Thinking Concepts

* Randomness
* Emergence
* Parameterisation

---

## Mathematical Principle

Perlin noise interpolates pseudo-random gradient values to create smooth continuous functions.

---

## Inputs

Workspace coordinates.

---

## Outputs

A continuous scalar field.

---

## Parameters

### Frequency

Controls the scale of the noise.

### Octaves

Adds additional layers of detail.

### Persistence

Controls the contribution of successive octaves.

### Lacunarity

Controls how frequency changes between octaves.

---

## Visualisation

Animate the scalar field updating as parameters change.

---

## Try Changing...

Increase the number of octaves while reducing persistence.

---

## Used By

* Perlin Noise

---

## Related Nodes

* Seed
* Colour Mapping
