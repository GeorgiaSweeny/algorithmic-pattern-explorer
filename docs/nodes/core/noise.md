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

Perlin noise interpolates pseudo-random gradient values to create smooth continuous
functions. A single layer of Perlin noise looks like a somewhat irregular sine wave: it
has a fairly consistent amplitude and stays within a narrow band of frequencies, but
lacks the sine wave's perfect periodicity.

Summing several layers ("octaves") of this noise, each at a higher frequency and lower
amplitude than the last, is called **fractal Brownian motion (fBm)**. Each octave adds
finer detail on top of the coarser shape the previous octaves already laid down —
octave *i* is sampled at `frequency * lacunarity^i` and contributes at
`amplitude * persistence^i`:

```
sum = 0, amplitude = 1, frequency = 1
for i in 0..octaves:
    sum += amplitude * noise2D(x * scale * frequency, y * scale * frequency)
    amplitude *= persistence   // shrinks each octave's contribution
    frequency *= lacunarity    // raises each octave's frequency
value = sum / (sum of all amplitudes used)   // renormalised back into [-1, 1]
```

Because each octave is the same noise function just rescaled, the result is
self-similar: zooming into a small region of a high-octave field looks statistically
like the whole field, the same way a coastline looks similarly jagged at any zoom
level. This is the same construction as adding sine waves of increasing frequency and
decreasing amplitude to build up a complex waveform (see *frequency modulation* /
*additive synthesis*) — fBm is that idea applied to noise instead of pure tones. (Ken
Musgrave's fBm/multifractal work, and Patricio Gonzalez Vivo & Jen Lowe's *The Book of
Shaders* chapter on fBm, are the standard references for this construction.)

### Ridge mode

"Ridge" is not a different noise algorithm — it is a **post-transform of the same fBm
value** (`raw`, still in `[-1, 1]`) that turns smooth troughs and peaks into sharp
creases:

```
value = 1 - 2 * abs(raw)
```

Taking `abs(raw)` folds every negative dip upward, so every zero-crossing of the
underlying noise becomes a sharp valley (this partial step alone — summing
`abs(noise)` across octaves instead of `noise` — is usually called "turbulence").
`1 - 2 * abs(raw)` then flips that fold upside down and rescales it back into
`[-1, 1]`, so the valleys become ridges instead: sharp peaks sit exactly where the raw
fBm crossed zero, which is why the result looks like a mountain-ridge network rather
than rolling hills. This is the single-fold member of the family Musgrave's terrain
literature and *The Book of Shaders* describe (their fuller version additionally
offsets and squares the folded value — `n = offset - abs(n); n = n * n` — to sharpen
the crease further; this implementation stops at the single fold).

`standard` and `ridge` therefore share every parameter and every octave loop —
`mode` only decides whether that last line is applied.

---

## Inputs

Workspace coordinates.

---

## Outputs

A continuous scalar field.

---

## Parameters

### Mode

`standard` (plain fBm) or `ridge` (fBm folded through `1 - 2|raw|` to produce sharp
ridgelines instead of smooth hills — see Mathematical Principle above).

### Frequency / Scale

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

Increase the number of octaves while reducing persistence. Then switch Mode to
`ridge` with the same octave/persistence/lacunarity values and compare the two
outputs directly — the ridge network traces exactly where the standard field crosses
zero.

---

## Used By

* Perlin Noise (`mode: standard`)
* Ridge Noise (`mode: ridge`)

---

## Related Nodes

* Seed
* Colour Mapping
