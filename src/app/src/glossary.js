/*
========================================
GLOSSARY
========================================
* Key Terms glossary for the Documentation Library overlay, in three groups:
* CONCEPT_TERMS (one per CT-concept tagged in nodeDocs.js), CATEGORY_TERMS
* (one per NODE_LIBRARY `category` value), and PROPERTY_TERMS (the
* Stochastic <-> Deterministic spectrum). Definitions are written against
* this app's own domain, not generic CS-textbook phrasing.
*/

export const CONCEPT_TERMS = [
   {
      term: "Abstraction",
      definition:
         "Working with a simplified model of something rather than every one of its real-world details — e.g. treating the workspace as pure coordinates, ignoring that it will eventually be drawn as pixels on a screen.",
   },
   {
      term: "Problem Definition",
      definition:
         "Explicitly stating the space, inputs and constraints an algorithm operates within before writing any steps to solve it — the Workspace node exists because \"what world does this happen in\" has to be answered first.",
   },
   {
      term: "Spatial Reasoning",
      definition:
         "Thinking about position, distance and arrangement in space, and how a computation over coordinates translates into a visual layout.",
   },
   {
      term: "Randomness",
      definition:
         "Values drawn unpredictably from a distribution. In this app randomness is always pseudo-random (see Determinism) — it looks unpredictable but is produced by a deterministic formula.",
   },
   {
      term: "Determinism",
      definition:
         "The same inputs always produce the same output. A pseudo-random generator is deterministic: given the same seed, it produces the exact same sequence of \"random\" values every time.",
   },
   {
      term: "Reproducibility",
      definition:
         "Being able to recreate an exact prior result. Recording the seed used to generate a pattern is what makes that specific pattern reproducible later, by anyone, on any machine.",
   },
   {
      term: "Sampling",
      definition:
         "Taking a finite set of measurements or points from a continuous space — e.g. scattering seed points across the workspace rather than considering every possible position.",
   },
   {
      term: "Initialisation",
      definition:
         "Setting up the starting state an algorithm will build on — a base shape, a seed value, a grid — before any transformation is applied to it.",
   },
   {
      term: "Symmetry",
      definition:
         "A structure that looks the same after some transformation (rotation, reflection). Islamic geometric patterns are built from rotational symmetry around a construction circle's centre.",
   },
   {
      term: "Iteration",
      definition:
         "Repeating a step, often over a range or a set of items — e.g. dividing a circle into N equal segments applies the same angular step N times.",
   },
   {
      term: "Pattern Formation",
      definition:
         "How a repeated, simple rule produces a visually coherent, structured result once applied across a whole space, rather than only at one point.",
   },
   {
      term: "Emergence",
      definition:
         "Complex, coherent-looking behaviour that arises from simple underlying rules, with no single step of the algorithm \"deciding\" the overall shape directly — smooth noise fields are a small example of this.",
   },
   {
      term: "Parameterisation",
      definition:
         "Exposing the numbers that control an algorithm's behaviour (frequency, octaves, seed, tones) as named, adjustable inputs, rather than hard-coding them.",
   },
   {
      term: "Continuous Representation",
      definition:
         "Modelling a value as smoothly varying across space (a field), rather than as discrete steps — a distance field assigns every point in the plane its own value, not just a handful of sampled ones.",
   },
   {
      term: "Pattern Recognition",
      definition:
         "Identifying a regularity or repeating structure — e.g. recognising which grid cell a point falls into, or which colour class keeps neighbouring tiles distinct.",
   },
   {
      term: "Transformation",
      definition:
         "A function that takes some value or geometry and produces a changed version of it — folding a scalar through a sine function, or deforming a tile's edge.",
   },
   {
      term: "Decomposition",
      definition:
         "Breaking a problem into smaller, more manageable sub-problems — recursively dividing a region into a grid of smaller regions is decomposition applied repeatedly.",
   },
   {
      term: "Recursion",
      definition:
         "A process defined in terms of a smaller instance of itself. Subdividing a cell, then subdividing each of its children the same way, is recursion — each level reapplies the same rule to its own output.",
   },
   {
      term: "Constraint Satisfaction",
      definition:
         "Finding a solution that respects a set of rules simultaneously — e.g. deforming a tile's edges so it still tiles seamlessly with its neighbours, with no gaps or overlaps.",
   },
   {
      term: "Representation",
      definition:
         "The choice of how underlying data is shown or encoded — the same computed values could be represented as colours, heights, or line thicknesses; the computation and its representation are separate concerns.",
   },
   {
      term: "Visualisation",
      definition:
         "Turning computed data into an image a person can look at and interpret — the final, and only user-facing, stage of every algorithm in this app.",
   },
];

// Own group rather than folded into CONCEPT_TERMS — a per-PATTERN property
// (patternRegistry.js's `spectrum` field), not a per-node CT-concept tag.
export const PROPERTY_TERMS = [
   {
      term: "Stochastic ↔ Deterministic Spectrum",
      definition:
         "Every pattern sits somewhere on a 0-to-1 scale between fully random (stochastic) and fully rule-based (deterministic) — shown as the bar wherever a pattern is selected. It measures how much of the final image comes from a seed value feeding a pseudo-random process, versus fixed geometric or mathematical rules that produce the exact same result every time. Five named bands mark the scale: Predominantly stochastic (almost entirely randomness-driven, e.g. raw Perlin noise) — Mostly stochastic — Hybrid (a genuine mix of both, e.g. a randomly-seeded shape processed by fixed rules) — Mostly deterministic — Highly deterministic (almost entirely rule-driven, e.g. a Sierpinski subdivision, where randomness plays little to no role). A pattern's position on this scale is fixed by its generator, not something a parameter changes at runtime.",
   },
];

export const CATEGORY_TERMS = [
   {
      term: "Environment",
      definition:
         "Nodes that establish the space an algorithm computes within before any content is placed in it. Currently just Workspace — every workflow's first node.",
   },
   {
      term: "Initialisation",
      definition:
         "Nodes that set up an algorithm's starting state — a seed value, a scattering of points, a base shape, a grid — before any transformation runs on it (Seed, Seed Points, Base Geometry, Grid, Construction Circle).",
   },
   {
      term: "Computation",
      definition:
         "Nodes that derive new values or fields from what came before — noise, distances, lattice indices, waveforms — the stages that do an algorithm's actual mathematical work (Noise, Distance Field, Lattice Index, Waveform).",
   },
   {
      term: "Pattern",
      definition:
         "Nodes that describe how computed structure gets arranged or composed into the final pattern's layout — dividing, subdividing, deforming (Radial Divisions, Subdivide, Edge Deformation). Distinct from the Pattern Recognition/Pattern Formation Computational Thinking Concepts above, which describe ideas rather than a node grouping.",
   },
   {
      term: "Presentation",
      definition:
         "Nodes that decide how computed values are shown, without changing what was computed — currently just Colour Mapping, which turns numeric output into colour.",
   },
   {
      term: "Output",
      definition:
         "The node that converts the finished computational representation into a viewable, exportable image — currently just Render, always the last node in every workflow.",
   },
];
