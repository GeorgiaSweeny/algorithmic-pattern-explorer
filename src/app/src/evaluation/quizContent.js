import { REGISTRY } from "../../../patternRegistry.js";

/*
========================================
COMPUTATIONAL-THINKING QUIZ CONTENT
========================================
* The instrument for docs/plan-checklist.md's "Aug 11-12: Lightweight
* evaluation" deliverable and docs/MOSCOW_PRIORITIES.md §5's evaluation
* row — the *instrument*, not a completed study (see
* EvaluationOverlay.jsx's own header comment for the full scope note).
*
* Methodology: a single question bank, administered twice (once before
* exploring the app, once after) — a single-group pre/post design, the
* standard, simplest valid design for measuring a within-subject learning
* gain on one instrument, rather than two separately-authored equivalent
* forms (which would need their own difficulty-equivalence justification
* this project has no capacity to establish). Citable directly in the
* dissertation methodology section.
*
* Questions cover the nine computational-thinking concepts named as this
* project's own Educational Objectives (README.md, PROJECT_SPECIFICATION.md):
* Randomness, Iteration, Transformation, Symmetry, Rule-based generation,
* Parameterisation, Emergence, Procedural modelling, Computational
* creativity — plus two bonus questions on this app's own specific
* vocabulary (node = computational stage; hybrid = stochastic +
* deterministic composition), useful for a "did the interface's own
* terminology land" secondary read, not required for the CT-concept score.
*
* Four further questions (concept tags "Sequence of operations" and "Stage
* role") cover two of PROJECT_SPECIFICATION.md's Success Criteria the nine
* named concepts don't, on their own, actually test: "understand the
* sequence of computational operations within each algorithm" and "explain
* the role of individual computational stages" — the original nine ask
* learners to define a concept in the abstract, not to read an actual
* pipeline. Grounded in docs/nodes/WORKFLOWS.md's verified stage sequences
* (Perlin Noise, Grid Tessellation, Wave/Rings), not invented workflows.
*
* Distractor design: every question has exactly 5 options, built to one
* fixed structure rather than picked freely — 1 correct, 1 clearly-wrong
* option an average person can eliminate immediately, 1 "near-miss" a
* plausible misconception would pick (the one doing the real
* discriminating work), and 2 mid-plausibility options that are neither a
* giveaway nor a trap. Chance alone is 20% (vs 25% at 4 options), and the
* near-miss keeps a confident-but-wrong guesser from coasting on
* elimination — the calibration this project has capacity for without a
* full item-response-theory pass.
*
* ----------------------------------------------------------------------
* STUDY 2 ADDITIONS — image-bearing item types
* ----------------------------------------------------------------------
* The items above are all `type: "mc"` (the implicit default — omitted on
* every existing entry so Study 1's own data format needs no migration).
* Every item below sets an explicit `type` and adds fields QuizForm
* (EvaluationOverlay.jsx) reads to render an image alongside/instead of
* plain text. Images are never pre-rendered files: `entryId` + `overrides`
* (or `startOverrides`/`paramsBefore`/`paramsAfter`/each candidate's own
* `overrides`) name a real `patternRegistry.js` entry and a partial params
* override, resolved live by `quizPatterns.js` and rendered by the app's
* own `PatternCanvas` (`QuizPatternImage.jsx`) — see docs/evaluation/
* study2-quiz-implementation-plan.md for the full rationale.
*
* - "cause" — two renders of the same generator (`paramsBefore`/
*   `paramsAfter`), one real parameter changed between them; text options
*   name the possible causes, same 1-correct-plus-distractors shape as
*   `type: "mc"`, scored identically (a single `correctIndex`).
* - "predict" — one starting render (`startOverrides`) plus a stated
*   change (`changeDescription`), then `candidates[]` — each a real render
*   of a different, plausible parameter change — select the one matching
*   the stated change. Scored the same way: `correctIndex` into
*   `candidates`.
* - "concept-match" — `candidates[]` drawn from *different* generators;
*   pick which pattern best demonstrates the named concept (`concept`/
*   `prompt`). Same single-`correctIndex` scoring.
* - "spectrum" — one render; place it on the stochastic <-> deterministic
*   scale already surfaced elsewhere in the app (`SpectrumBar.jsx`'s
*   `SPECTRUM_LABELS`, reused here verbatim as `SPECTRUM_OPTIONS` so the
*   quiz's five bins are the exact same categories the app itself shows,
*   not a second taxonomy) — `correctIndex` is that entry's own
*   `patternRegistry.js` `spectrum` value binned the same way
*   `describeSpectrum()` does.
* - "node-select" — one target render plus `nodeOptions[]` (a mix of real
*   nodes from that generator's own workflow and plausible intruders from
*   a *different* generator's workflow); multi-select which nodes are
*   required. Scored differently from every type above — see
*   `evaluationStorage.js`'s `recordQuizPass()` for the exact-match +
*   partial-credit path `correctNodeSet` drives.
*/

// The app's own stochastic <-> deterministic bins (SpectrumBar.jsx's
// SPECTRUM_LABELS, values only) — shared verbatim rather than
// re-declared, so a "spectrum" item's options can never drift out of
// sync with what the Documentation Panel's own spectrum bar shows.
export const SPECTRUM_OPTIONS = [
   "Predominantly stochastic",
   "Mostly stochastic",
   "Hybrid",
   "Mostly deterministic",
   "Highly deterministic",
];

// Bin thresholds mirror SpectrumBar.jsx's own SPECTRUM_LABELS exactly
// (max value per bin, in the same order as SPECTRUM_OPTIONS above).
const SPECTRUM_BIN_MAX = [0.2, 0.4, 0.6, 0.8, 1.01];

function spectrumCorrectIndex(spectrumValue) {
   return SPECTRUM_BIN_MAX.findIndex((max) => spectrumValue < max);
}

function spectrumValue(entryId) {
   return REGISTRY.find((e) => e.id === entryId).spectrum;
}

// Study 1's own 16-item instrument, unchanged — kept as its own export
// (rather than folded into Study 2's below) because the two are separate
// instruments given to separate cohorts (dissertation/Study2-Design-Plan.md
// §1: Study 2 is diagnostic depth on the mechanism, not a re-run of Study
// 1's own effect measurement) — App.jsx's "Test" menu item uses this array;
// "Test 2" uses STUDY2_QUESTIONS below.
export const STUDY1_QUESTIONS = [
   {
      id: "randomness",
      concept: "Randomness",
      prompt: "Two runs of a stochastic pattern generator use the exact same seed value. What happens?",
      options: [
         "No pattern is produced at all",
         "The identical pattern both times",
         "A completely different pattern each time",
         "A similar but not identical pattern",
         "The same pattern, but reflected horizontally",
      ],
      correctIndex: 1,
   },
   {
      id: "iteration",
      concept: "Iteration",
      prompt: "A fractal pattern like a Sierpinski carpet is built by...",
      options: [
         "Drawing the whole shape in one step",
         "Applying a different subdivision rule at each smaller scale",
         "Applying the same subdivision rule repeatedly, at a smaller scale each time",
         "Randomly placing triangles until it looks right",
         "Tracing a single continuous line without lifting the pen",
      ],
      correctIndex: 2,
   },
   {
      id: "transformation",
      concept: "Transformation",
      prompt: "In a tessellation generator, an \"edge deformation\" step...",
      options: [
         "Changes which colour a tile is filled with",
         "Modifies a tile's boundary shape so it interlocks with its neighbour",
         "Deletes a tile from the pattern",
         "Changes a tile's size while keeping its shape exactly the same",
         "Rotates the entire canvas by a fixed angle",
      ],
      correctIndex: 1,
   },
   {
      id: "symmetry",
      concept: "Symmetry",
      prompt: "A pattern with 8-fold rotational symmetry looks unchanged after being rotated by...",
      options: ["8 degrees", "45 degrees", "90 degrees", "60 degrees", "180 degrees"],
      correctIndex: 1,
   },
   {
      id: "rule-based-generation",
      concept: "Rule-based generation",
      prompt: "A procedural pattern generator produces its output by...",
      options: [
         "Displaying a pre-made image file",
         "Applying a fixed set of computational rules to compute the image",
         "Applying a set of computational rules that are chosen randomly at each run",
         "Selecting one of several pre-designed templates",
         "Letting the user draw freehand",
      ],
      correctIndex: 1,
   },
   {
      id: "parameterisation",
      concept: "Parameterisation",
      prompt: "Increasing a generator's \"frequency\" parameter typically affects...",
      options: [
         "Which colours are used",
         "How tightly the pattern repeats across the canvas",
         "Whether the pattern is symmetric at all",
         "How large the overall canvas is",
         "The exported file format",
      ],
      correctIndex: 1,
   },
   {
      id: "emergence",
      concept: "Emergence",
      prompt: "In Perlin noise, complex, organic-looking patterns emerge from...",
      options: [
         "A single random pixel value",
         "Many simple, smoothly-varying random samples combined together",
         "A single complex mathematical formula solved exactly",
         "A hand-drawn texture file",
         "A lookup table of photographs",
      ],
      correctIndex: 1,
   },
   {
      id: "procedural-modelling",
      concept: "Procedural modelling",
      prompt: "The main advantage of a procedural (rule-based) model over a single fixed image is that it can...",
      options: [
         "Only ever be viewed once",
         "Be regenerated at any size or parameter setting from the same rules",
         "Be resized without loss of quality, the same as a vector image",
         "Never be changed once created",
         "Only work for three-dimensional shapes",
      ],
      correctIndex: 1,
   },
   {
      id: "computational-creativity",
      concept: "Computational creativity",
      prompt: "A computer following fixed rules to produce a visually novel pattern is an example of...",
      options: [
         "Computational creativity",
         "Pure random chance",
         "Plagiarism",
         "Manual design",
         "An unintended bug in the program",
      ],
      correctIndex: 0,
   },
   {
      id: "stochastic-vs-deterministic",
      concept: "Randomness",
      prompt: "A generator is described as \"deterministic\" if...",
      options: [
         "It always produces a different result",
         "The same input parameters always produce exactly the same output",
         "It uses a random number generator internally",
         "It runs faster than a stochastic generator",
         "It cannot be automatically tested",
      ],
      correctIndex: 1,
   },
   {
      id: "node-concept",
      concept: "Rule-based generation",
      prompt: "In this application, a \"node\" in the algorithm workflow represents...",
      options: [
         "A single line of source code",
         "A meaningful computational stage within the algorithm",
         "A colour value",
         "A user-adjustable setting, like a slider",
         "An error message",
      ],
      correctIndex: 1,
   },
   {
      id: "hybrid-concept",
      concept: "Emergence",
      prompt: "A \"hybrid\" generator in this application combines...",
      options: [
         "Two unrelated applications",
         "A stochastic and a deterministic technique in one pipeline",
         "Two different randomness techniques in one pipeline",
         "Two different programming languages",
         "User accounts from two different systems",
      ],
      correctIndex: 1,
   },
   {
      id: "workflow-sequence",
      concept: "Sequence of operations",
      prompt: "In this application's Perlin Noise workflow, what is the correct order of stages?",
      options: [
         "Noise → Seed → Colour Mapping → Render",
         "Seed → Noise → Colour Mapping → Render",
         "Colour Mapping → Seed → Noise → Render",
         "Seed → Colour Mapping → Noise → Render",
         "Seed → Noise → Render → Colour Mapping",
      ],
      correctIndex: 1,
   },
   {
      id: "seed-stage-role",
      concept: "Stage role",
      prompt: "In the Perlin Noise workflow, what does the Seed stage actually do?",
      options: [
         "Chooses the final colour palette",
         "Initialises the pseudo-random permutation table the noise function samples from",
         "Generates the random noise values used by the pattern",
         "Smooths the finished image",
         "Counts how many octaves to render",
      ],
      correctIndex: 1,
   },
   {
      id: "lattice-index-role",
      concept: "Stage role",
      prompt: "In the Grid Tessellation workflow, the Lattice Index stage's job is to...",
      options: [
         "Assign each position a discrete colour-class index within the repeating tiling",
         "Pick which colours are used",
         "Rotate the whole canvas by a fixed angle",
         "Determine the overall size of each tile",
         "Export the final image file",
      ],
      correctIndex: 0,
   },
   {
      id: "rings-mode-stage",
      concept: "Parameterisation",
      prompt: "Switching the Wave generator from \"wave\" mode to \"rings\" mode adds which stage to its workflow?",
      options: [
         "Edge Deformation",
         "Distance Field",
         "Lattice Index",
         "Base Geometry",
         "Seed",
      ],
      correctIndex: 1,
   },
];

// Okabe & Ito's (2008) colorblind-safe qualitative palette, paired here
// with a pale background rather than used as hue-only pairs — each
// colourway keeps a strong *lightness* gap (not just a hue difference)
// between colour1 and colour2, so every image stays distinguishable under
// protanopia, deuteranopia, and tritanopia even before the pattern itself
// is read. Applied identically to *every* image within one question (both
// sides of a "cause" pair, every "predict" candidate) so a colour
// difference can never masquerade as the causal change a question is
// actually testing — colour here is variety across questions, never the
// signal within one. Different questions get different colourways purely
// so the quiz isn't all default grey/white.
const COLORWAYS = {
   amber:  { colour1: "#FDF6E3", colour2: "#E69F00" },
   teal:   { colour1: "#FDF6E3", colour2: "#009E73" },
   blue:   { colour1: "#FDF6E3", colour2: "#0072B2" },
   purple: { colour1: "#FDF6E3", colour2: "#CC79A7" },
   dark:   { colour1: "#F0E442", colour2: "#111111" },
};

// 4-tone extensions of two colourways above, for the one "predict"
// distractor per item that deliberately also changes the tone count
// (testing whether a participant notices *that* change, not colour
// perception) — colour3/colour4 stay inside the same Okabe-Ito set so the
// extra tones stay colorblind-distinguishable too.
const FOUR_TONE_TEAL = { colour1: "#FDF6E3", colour2: "#009E73", colour3: "#E69F00", colour4: "#111111" };
const FOUR_TONE_PURPLE = { colour1: "#FDF6E3", colour2: "#CC79A7", colour3: "#0072B2", colour4: "#111111" };

// Study 2's own instrument — a separate, single-group pre/post quiz
// (dissertation/Study2-Design-Plan.md), diagnosing four gaps Study 1's
// text-only "mc" format couldn't: no test of compositional reasoning, no
// visual/interactive item, no triangulation between item formats, and a
// specific weak-item result ("sequence of operations"/"stage role") with
// no diagnostic power. See this file's own header comment above for what
// each `type` renders and how it's scored.
export const STUDY2_QUESTIONS = [

   // ── "cause" — image pair, which change produced Image 2? ──────────────

   {
      id: "wave-frequency-cause",
      concept: "Parameterisation",
      type: "cause",
      entryId: "wave-stripes",
      paramsBefore: { frequency: 0.02, ...COLORWAYS.amber },
      paramsAfter: { frequency: 0.12, ...COLORWAYS.amber },
      prompt: "Image 1 and Image 2 both show Wave Stripes. Image 2's stripes repeat much more tightly across the canvas. Which parameter change most likely caused this?",
      options: [
         "Frequency was increased",
         "The colour palette was changed",
         "The canvas was resized",
         "Frequency was decreased",
         "Mode was switched from \"wave\" to \"rings\"",
      ],
      correctIndex: 0,
   },
   {
      id: "noise-mode-cause",
      concept: "Transformation",
      type: "cause",
      entryId: "perlin-noise",
      paramsBefore: { mode: "standard", ...COLORWAYS.blue },
      paramsAfter: { mode: "ridge", ...COLORWAYS.blue },
      prompt: "Image 1 and Image 2 use the same Noise generator. Image 1's values fade smoothly; Image 2 shows sharp, vein-like ridges instead. Which change most likely caused this?",
      options: [
         "The Noise mode was switched from \"standard\" to \"ridge\"",
         "A different seed was used",
         "Octaves were increased",
         "Scale was decreased",
         "Persistence was increased",
      ],
      correctIndex: 0,
   },
   {
      id: "escher-edge-deformation-cause",
      concept: "Transformation",
      type: "cause",
      entryId: "escher-translation",
      paramsBefore: { bumpAmp: 3, ...COLORWAYS.blue },
      paramsAfter: { bumpAmp: 20, ...COLORWAYS.blue },
      prompt: "Image 1 and Image 2 both show the Escher Type I tessellation. Image 2's tile edges are far more jagged and pronounced. Which change most likely caused this?",
      options: [
         "Edge Deformation amplitude was increased",
         "Base Polygon was changed",
         "Tile Size was changed",
         "Edge Deformation amplitude was decreased",
         "Edge Shape was switched from \"wave\" to \"notch\"",
      ],
      correctIndex: 0,
   },

   // ── "predict" — starting image + stated change, select the real result ─

   {
      id: "grid-hexagon-predict",
      concept: "Transformation",
      type: "predict",
      entryId: "square-grid",
      startOverrides: { ...COLORWAYS.teal },
      prompt: "Image 1 shows the starting pattern below. Given the stated change, which of the following is the correct result?",
      changeDescription: "Base Geometry changed from square to hexagon. Nothing else changed.",
      candidates: [
         { overrides: { shape: "hexagon", ...COLORWAYS.teal } },
         { overrides: { shape: "hexagon", tones: "4", ...FOUR_TONE_TEAL } },
         { overrides: { shape: "hexagon", tileSize: 80, ...COLORWAYS.teal } },
         { overrides: { shape: "triangle", ...COLORWAYS.teal } },
         { overrides: { ...COLORWAYS.teal } },
      ],
      correctIndex: 0,
   },
   {
      id: "islamic-segments-predict",
      concept: "Parameterisation",
      type: "predict",
      entryId: "islamic-rosette",
      startOverrides: { ...COLORWAYS.purple },
      prompt: "Image 1 shows the starting pattern below. Given the stated change, which of the following is the correct result?",
      changeDescription: "Segments increased from 8 to 12. Nothing else changed.",
      candidates: [
         { overrides: { segments: 12, ...COLORWAYS.purple } },
         { overrides: { segments: 12, rotation: 45, ...COLORWAYS.purple } },
         { overrides: { segments: 12, tones: "4", ...FOUR_TONE_PURPLE } },
         { overrides: { segments: 4, ...COLORWAYS.purple } },
         { overrides: { ...COLORWAYS.purple } },
      ],
      correctIndex: 0,
   },
   {
      id: "perlin-sierpinski-amplitude-predict",
      concept: "Procedural modelling",
      type: "predict",
      entryId: "perlin-sierpinski",
      startOverrides: { amplitude: 0, ...COLORWAYS.purple },
      prompt: "Image 1 shows the starting pattern below. Given the stated change, which of the following is the correct result?",
      changeDescription: "Amplitude increased from 0 to 0.4. Nothing else changed.",
      candidates: [
         { overrides: { amplitude: 0.4, ...COLORWAYS.purple } },
         { overrides: { depth: 6, ...COLORWAYS.purple } },
         { overrides: { scale: 0.03, ...COLORWAYS.purple } },
         { overrides: { octaves: 6, ...COLORWAYS.purple } },
         { overrides: { amplitude: 0, ...COLORWAYS.purple } },
      ],
      correctIndex: 0,
   },

   // ── "concept-match" — which pattern best demonstrates this concept? ────

   {
      id: "randomness-concept-match",
      concept: "Randomness",
      type: "concept-match",
      prompt: "Which pattern below best demonstrates Randomness?",
      candidates: [
         { entryId: "perlin-noise", overrides: { ...COLORWAYS.dark } },
         { entryId: "square-grid", overrides: { ...COLORWAYS.blue } },
         { entryId: "islamic-rosette", overrides: { ...COLORWAYS.amber } },
         { entryId: "sierpinski", overrides: { ...COLORWAYS.teal } },
      ],
      correctIndex: 0,
   },
   {
      id: "symmetry-concept-match",
      concept: "Symmetry",
      type: "concept-match",
      prompt: "Which pattern below best demonstrates rotational Symmetry?",
      candidates: [
         { entryId: "islamic-rosette", overrides: { ...COLORWAYS.purple } },
         { entryId: "perlin-noise", overrides: { ...COLORWAYS.dark } },
         { entryId: "wave-stripes", overrides: { ...COLORWAYS.amber } },
         { entryId: "voronoi-cells", overrides: { ...COLORWAYS.blue } },
      ],
      correctIndex: 0,
   },
   {
      id: "iteration-concept-match",
      concept: "Iteration",
      type: "concept-match",
      prompt: "Which pattern below best demonstrates Iteration (the same rule applied repeatedly at a smaller scale)?",
      candidates: [
         { entryId: "sierpinski", overrides: { ...COLORWAYS.teal } },
         { entryId: "hex-grid", overrides: { ...COLORWAYS.purple } },
         { entryId: "perlin-noise", overrides: { ...COLORWAYS.dark } },
         { entryId: "voronoi-cells", overrides: { ...COLORWAYS.amber } },
      ],
      correctIndex: 0,
   },

   // ── "spectrum" — where does this pattern sit, stochastic <-> deterministic?

   {
      id: "noise-spectrum",
      concept: "Randomness",
      type: "spectrum",
      entryId: "perlin-noise",
      overrides: { ...COLORWAYS.dark },
      prompt: "Where does this pattern lie on the stochastic ↔ deterministic scale?",
      options: SPECTRUM_OPTIONS,
      correctIndex: spectrumCorrectIndex(spectrumValue("perlin-noise")),
   },
   {
      id: "grid-spectrum",
      concept: "Rule-based generation",
      type: "spectrum",
      entryId: "square-grid",
      overrides: { ...COLORWAYS.blue },
      prompt: "Where does this pattern lie on the stochastic ↔ deterministic scale?",
      options: SPECTRUM_OPTIONS,
      correctIndex: spectrumCorrectIndex(spectrumValue("square-grid")),
   },
   {
      id: "voronoi-spectrum",
      concept: "Emergence",
      type: "spectrum",
      entryId: "voronoi-cells",
      overrides: { ...COLORWAYS.teal },
      prompt: "This pattern starts from randomly scattered points, then applies a fixed distance-field rule to every pixel. Where does it lie on the stochastic ↔ deterministic scale?",
      options: SPECTRUM_OPTIONS,
      correctIndex: spectrumCorrectIndex(spectrumValue("voronoi-cells")),
   },
   {
      id: "voronoi-islamic-spectrum",
      concept: "Emergence",
      type: "spectrum",
      entryId: "voronoi-islamic",
      overrides: { ...COLORWAYS.amber },
      prompt: "This pattern seeds its cell centres randomly (like Voronoi), then builds a fixed rosette construction at each one (like Islamic Geometric Patterns). Where does it lie on the stochastic ↔ deterministic scale?",
      options: SPECTRUM_OPTIONS,
      correctIndex: spectrumCorrectIndex(spectrumValue("voronoi-islamic")),
   },

   // ── "node-select" — which nodes are required to build this pattern? ────

   {
      id: "voronoi-required-nodes",
      concept: "Stage role",
      type: "node-select",
      entryId: "voronoi-cells",
      overrides: { ...COLORWAYS.purple },
      prompt: "Which of the following nodes are actually required to build this pattern? Select all that apply.",
      nodeOptions: ["Seed", "Seed Points", "Distance Field", "Colour Mapping", "Edge Deformation", "Lattice Index"],
      correctNodeSet: ["Seed", "Seed Points", "Distance Field", "Colour Mapping"],
   },
   {
      id: "grid-required-nodes",
      concept: "Stage role",
      type: "node-select",
      entryId: "triangle-grid",
      overrides: { ...COLORWAYS.dark },
      prompt: "Which of the following nodes are actually required to build this pattern? Select all that apply.",
      nodeOptions: ["Base Geometry", "Lattice Index", "Colour Mapping", "Seed", "Distance Field", "Edge Deformation"],
      correctNodeSet: ["Base Geometry", "Lattice Index", "Colour Mapping"],
   },
   {
      id: "voronoi-islamic-required-nodes",
      concept: "Stage role",
      type: "node-select",
      entryId: "voronoi-islamic",
      overrides: { ...COLORWAYS.teal },
      prompt: "Which of the following nodes are actually required to build this hybrid pattern? Select all that apply.",
      nodeOptions: [
         "Seed", "Seed Points", "Construction Circle", "Radial Divisions",
         "Distance Field", "Colour Mapping", "Edge Deformation", "Lattice Index",
      ],
      correctNodeSet: ["Seed", "Seed Points", "Construction Circle", "Radial Divisions", "Distance Field", "Colour Mapping"],
   },

   // ── "order" — put this generator's real stages in the correct sequence ─

   {
      id: "islamic-sequence-order",
      concept: "Sequence of operations",
      type: "order",
      entryId: "islamic-rosette",
      overrides: { ...COLORWAYS.amber },
      prompt: "Put this pattern's real computational stages in the order they actually run, earliest first.",
      nodeSequence: ["Colour Mapping", "Radial Divisions", "Grid", "Distance Field", "Construction Circle"],
      correctSequence: ["Grid", "Construction Circle", "Radial Divisions", "Distance Field", "Colour Mapping"],
   },
];
