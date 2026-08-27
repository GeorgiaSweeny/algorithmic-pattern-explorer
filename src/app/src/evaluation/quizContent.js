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
*/

export const QUIZ_QUESTIONS = [
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
