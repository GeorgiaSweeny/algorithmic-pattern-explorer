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
*/

export const QUIZ_QUESTIONS = [
   {
      id: "randomness",
      concept: "Randomness",
      prompt: "Two runs of a stochastic pattern generator use the exact same seed value. What happens?",
      options: [
         "A completely different pattern each time",
         "The identical pattern both times",
         "A similar but not identical pattern",
         "No pattern is produced",
      ],
      correctIndex: 1,
   },
   {
      id: "iteration",
      concept: "Iteration",
      prompt: "A fractal pattern like a Sierpinski carpet is built by...",
      options: [
         "Drawing the whole shape in one step",
         "Applying the same subdivision rule repeatedly, at a smaller scale each time",
         "Randomly placing triangles until it looks right",
         "Tracing a single continuous line",
      ],
      correctIndex: 1,
   },
   {
      id: "transformation",
      concept: "Transformation",
      prompt: "In a tessellation generator, an \"edge deformation\" step...",
      options: [
         "Changes which colour a tile is filled with",
         "Modifies a tile's boundary shape so it interlocks with its neighbour",
         "Deletes a tile from the pattern",
         "Rotates the entire canvas",
      ],
      correctIndex: 1,
   },
   {
      id: "symmetry",
      concept: "Symmetry",
      prompt: "A pattern with 8-fold rotational symmetry looks unchanged after being rotated by...",
      options: ["8 degrees", "45 degrees", "90 degrees", "180 degrees"],
      correctIndex: 1,
   },
   {
      id: "rule-based-generation",
      concept: "Rule-based generation",
      prompt: "A procedural pattern generator produces its output by...",
      options: [
         "Displaying a pre-made image file",
         "Applying a fixed set of computational rules to compute the image",
         "Letting the user draw freehand",
         "Randomly picking an image from a gallery",
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
         "Never be changed once created",
         "Be regenerated at any size or parameter setting from the same rules",
         "Only ever be viewed once",
         "Only work for three-dimensional shapes",
      ],
      correctIndex: 1,
   },
   {
      id: "computational-creativity",
      concept: "Computational creativity",
      prompt: "A computer following fixed rules to produce a visually novel pattern is an example of...",
      options: ["Computational creativity", "Plagiarism", "Pure random chance", "Manual design"],
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
         "Two different programming languages",
         "User accounts from two different systems",
      ],
      correctIndex: 1,
   },
];
