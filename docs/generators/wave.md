# Wave

## Summary

Folds a straight measurement — position or distance — through a repeating sine curve to produce stripes or rings.

---

## Purpose

Shows how a value that increases forever (a coordinate, a distance) can be turned into one that cycles smoothly and predictably, just by passing it through a periodic function. This is the simplest generator in the spectrum: one measurement, one fold, one output — everything more complex in this project builds on the same idea of measuring something, then applying a rule to the measurement.

---

## Computational Thinking Concepts

* Transformation
* Parameterisation
* Rule-based generation

---

## Mathematical Principle

A sine wave is defined by `sin(value * frequency)` — as `value` increases, the output cycles smoothly and repeatedly between -1 and 1, at a rate controlled by `frequency`. This generator applies that fold to one of two different measurements, producing two visually different results from the exact same underlying operation:

- **`wave` mode** applies the fold directly to the vertical coordinate, `y`. Since `y` increases steadily down the canvas, the result is horizontal stripes, evenly spaced according to `frequency`.
- **`rings` mode** applies the fold to *distance from the canvas centre* instead of raw position. Since distance increases outward in every direction equally, the result is concentric rings rather than straight stripes.

No new mathematics is needed to get from one mode to the other — only the measurement being folded changes, not the fold itself. This is the same underlying idea used in wave interference and signal processing generally: a periodic function turns any monotonically increasing quantity into a repeating pattern.

---

## Parameters

### Mode

`wave` (folds vertical position, producing stripes) or `rings` (folds distance from centre, producing rings).

### Frequency

How tightly the pattern repeats. Higher values pack more stripes or rings into the same space; lower values stretch each repetition out.

---

## Visualisation

A dashed straight line (representing the raw, ever-increasing measurement) feeding into a solid zigzag/sine curve (the folded, repeating output) — the same "input shape → operation → output shape" visual language already used for the Waveform node, one level more zoomed out to represent the whole generator rather than one stage.

---

## Try Exploring...

Switch from `wave` to `rings` mode and watch the same `frequency` value produce straight stripes in one mode and concentric circles in the other — the fold itself never changed, only what's being measured.

---

## Used By

* Wave Stripes (`mode: wave`)
* Concentric Rings (`mode: rings`)

---

## Related Generators

* Noise (also builds on a folded/layered mathematical function, but of randomness rather than plain position)
