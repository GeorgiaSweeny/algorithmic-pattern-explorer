# Project Specification

## Algorithmic Pattern Explorer

### Purpose

Algorithmic Pattern Explorer is an MSc dissertation project with two halves of
unequal weight. The **primary research contribution is algorithmic**: it
investigates whether a small, fixed vocabulary of composition patterns —
drawn from combinator-style function composition — can describe how a
spectrum of generative pattern algorithms (stochastic → deterministic) is
built from a minimal library of reusable primitives. See
[`docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`](ALGORITHMIC_COMPOSITION_RESEARCH.md)
for the full framing, the primitive library, and the composition analysis
against the current generators.

The **educational web application is secondary**: a demonstration and
evaluation vehicle showing that this compositional structure is not only
internally correct (verified by the property-based test suite in
`src/generators/__tests__/`, against the contract in
[`docs/GENERATOR_CONTRACT.md`](GENERATOR_CONTRACT.md)) but also externally
legible — that a learner can actually see how a generator's output is built
from its computational stages, rather than treating each algorithm as an
opaque function from parameters to pattern. The remainder of this document,
from Design Philosophy onward, specifies that secondary, demonstration layer.

Rather than allowing users to construct their own procedural systems, the application presents carefully designed representations of existing generative algorithms that can be explored, manipulated and understood through an interactive visual interface.

The application is inspired by the procedural workflow philosophy of Houdini while intentionally avoiding the complexity of professional node-based authoring tools. The emphasis of the demonstration layer is educational rather than creative, enabling learners to understand how computational processes produce visual outcomes.

---

# Research Aim

**Primary**: to investigate whether a small, fixed vocabulary of composition
patterns can describe how a spectrum of generative pattern algorithms is built
from a minimal library of reusable primitives, and what any gaps in that
vocabulary reveal about the primitive library's completeness. See
[`docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`](ALGORITHMIC_COMPOSITION_RESEARCH.md).

**Secondary (demonstration)**: to investigate how interactive visualisation of
procedural algorithms can improve understanding of computational thinking
concepts through direct exploration of generative pattern creation — i.e.
whether the demonstration layer specified below succeeds at making the
primary research's findings legible to a learner, not whether those findings
are themselves true.

---

# Educational Objectives

These objectives belong to the secondary, demonstration layer (see Purpose
above) — they describe what the interface aims to make visible, not the
project's primary research claim.

The application is designed to support learning of fundamental computational thinking concepts including:

- Iteration
- Transformation
- Randomness
- Symmetry
- Parameterisation
- Rule-based generation
- Emergence
- Procedural modelling
- Computational creativity

These concepts should be communicated through interaction with procedural algorithms rather than through traditional programming exercises.

---

# Demonstration-Layer Contribution

The contribution of this secondary layer is the development of an interactive environment for exploring procedural algorithms as educational artefacts rather than creative tools — demonstrating the primary, algorithmic research contribution (`docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`), not standing as the project's contribution in its own right.

Instead of treating procedural generation as a hidden implementation detail, the application makes computational processes visible through synchronised workflow visualisation, contextual documentation and real-time pattern rendering. By exposing intermediate algorithm states and allowing learners to manipulate meaningful parameters, the system aims to support deeper understanding of computational thinking concepts through direct exploration.

This educational focus differentiates the application from professional procedural modelling software while preserving the key principle of inspectable procedural workflows.

---

# Design Philosophy

The system should not function as a visual programming language.

Users cannot construct arbitrary node graphs or create new procedural algorithms.

Instead, each implemented pattern generator exposes a predefined computational workflow represented as a simplified sequence of educational nodes.

Each node represents a meaningful conceptual stage within the algorithm rather than an individual software function or implementation detail.

The interface therefore acts as an algorithm explorer rather than an algorithm authoring environment.

---

# Design Principles

The interface is guided by the following principles.

## Educational Clarity

Interface components should prioritise conceptual understanding over technical completeness.

Only information that contributes to learning should be presented.

## Immediate Feedback

User interaction should produce immediate visual responses wherever possible, allowing learners to associate computational changes with visual outcomes.

## Progressive Disclosure

Complexity should be introduced gradually.

Only the information required for the current stage of exploration should be visible.

## Consistency

Interaction patterns, terminology and visual language should remain consistent across all procedural generators to reduce unnecessary cognitive load.

## Inspectability

Every computational stage should be observable independently, allowing learners to understand how individual operations contribute to the final generated pattern.

---

# Educational Design Requirements

The interface is intended to support exploratory learning through direct interaction with procedural algorithms.

To achieve this, the application should:

- present information progressively to minimise cognitive load
- maintain synchronisation between the workflow, documentation and pattern canvas
- provide immediate visual feedback following user interaction
- expose only computational operations that contribute to conceptual understanding
- allow learners to inspect intermediate algorithm states without requiring knowledge of implementation details
- encourage experimentation through safe, reversible parameter modification
- communicate computational thinking concepts using visual representations rather than textual explanation alone
- maintain consistent interaction patterns across all implemented generators

These requirements are intended to promote understanding of computational processes rather than mastery of software functionality.

---

# Core Interface

The application consists of three synchronised views.

## 1. Algorithm Workflow

A simplified node graph representing the computational stages of a single algorithm.

The workflow should:

* remain primarily linear
* expose only meaningful algorithmic stages
* avoid unnecessary implementation complexity
* support node selection
* support parameter editing
* support stepping through execution from beginning to end

The workflow should represent the conceptual structure of the algorithm rather than the internal source code.

---

## 2. Documentation Panel

Selecting a node displays educational documentation describing that computational stage.

Each node should provide:

* operation name
* plain-language explanation
* purpose within the algorithm
* computational thinking concepts demonstrated
* parameter descriptions
* visual examples where appropriate
* optional short animations when movement improves understanding

Documentation should prioritise conceptual understanding over mathematical formalism.

---

## 3. Pattern Canvas

The canvas visualises the current state of the algorithm.

It should support:

* real-time rendering
* intermediate algorithm states
* final generated output
* updates following parameter changes
* optional overlays where educationally useful

The canvas should update as users move through the algorithm, allowing learners to observe how each computational stage contributes to the final pattern.

---

# Algorithm Exploration

The application should allow users to inspect procedural generation step by step.

Learners should be able to:

* select any computational stage
* observe the intermediate pattern at that stage
* modify exposed parameters
* immediately observe changes
* compare intermediate and final outputs
* understand how local changes influence global behaviour

This inspection capability forms the core contribution of the demonstration layer specifically (see Purpose above for how this relates to the project's overall primary, algorithmic contribution).

---

# Pattern Generators

The project includes five core predefined procedural generators representing
increasing levels of algorithmic constraint, plus two additional generators
that support the core set without adding a distinct spectrum position or
composition pattern of their own. See
[`README.md`](../README.md#generative-spectrum) for the full spectrum table and
[`docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`](ALGORITHMIC_COMPOSITION_RESEARCH.md)
for how each generator's composition is analysed.

## Perlin / Ridge Noise — *implemented*

Focus:

* controlled randomness
* interpolation
* continuous fields
* procedural variation

Composition: fold/reduce over increasing octaves — the only generator built
this way.

---

## Voronoi Diagrams — *implemented*

Focus:

* spatial partitioning
* distance relationships
* deterministic construction from random inputs

Composition: constant-bind (seed points, fixed per render) → atop (nearest-seed
search → colour mapping).

---

## Escher-Inspired Tessellations — *implemented*

Focus:

* geometric transformation
* repetition
* symmetry
* tiling

Composition: cross-fork (each axis's edge displacement is driven by the
*other* axis's position) → atop — the only generator requiring a fork.

---

## Recursive / Fractal (Sierpinski) — *implemented*

Focus:

* rule-based recursive subdivision
* self-similarity
* deterministic procedural generation

Composition: repeat/power (a subdivision primitive applied to its own
remapped output, a fixed number of times) — the only generator built this way,
and a genuinely different route to full determinism than Islamic Geometric
Patterns below (recursive subdivision vs. symmetry-group construction).

---

## Islamic Geometric Patterns — *in progress*

Focus:

* mathematical construction
* radial symmetry
* rule-based geometry
* deterministic procedural generation

Composition: expected to be distinct from the recursive generator's
repeat/power pattern (a different deterministic construction mechanism); to be
confirmed once implemented.

---

Together these five generators demonstrate a progression from stochastic to
deterministic computational systems, including two different mechanisms for
reaching full determinism.

## Additional generators

Two further generators — Wave / Concentric Rings and Grid Tessellations — are
also implemented, supporting the core five rather than adding a distinct
spectrum position or composition pattern:

* **Wave** (rings mode) uses the same constant-bind → atop pattern as Voronoi,
  against a single fixed point rather than a searched set of seed points — a
  simpler first appearance of that pattern, useful as pedagogical scaffolding.
* **Grid** is not yet cleanly decomposed into the shared primitive library
  (`src/generators/lib/`) — only its colour-mapping stage is a shared
  primitive, the five tiling shapes' index arithmetic is bespoke. Its
  compositional status is an open question (see
  [`docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`](ALGORITHMIC_COMPOSITION_RESEARCH.md)),
  not a simplification.

---

# Educational Node Design

Nodes represent conceptual computational operations rather than software implementation.

Typical operations may include:

* Generate
* Transform
* Rotate
* Reflect
* Repeat
* Offset
* Scale
* Subdivide
* Colour
* Render

Each node should expose only parameters that contribute to understanding the algorithm.

---

# Interaction Principles

The interface should encourage exploration through immediate visual feedback.

Users should be able to:

* modify parameters safely
* compare different configurations
* inspect intermediate stages
* reset algorithms
* export generated patterns

The interface should minimise cognitive load by exposing only educationally relevant controls.

---

# Relationship to Houdini

This project draws inspiration from Houdini's procedural workflow model but deliberately restricts functionality.

The application adopts:

* procedural pipelines
* parameterised operations
* non-destructive workflows
* inspection of intermediate states

The application intentionally excludes:

* arbitrary graph editing
* user-created algorithms
* scripting
* simulation networks
* general-purpose procedural modelling

The objective is not to recreate Houdini but to adapt its inspectable workflow philosophy into an educational environment.

---

# User Requirements

Users shall be able to:

- select one of the available procedural pattern generators
- navigate through an algorithm one computational stage at a time
- select any computational stage to inspect its role within the algorithm
- read educational explanations describing each stage in plain language
- modify exposed parameters without requiring programming knowledge
- observe immediate updates to the generated pattern following parameter changes
- compare intermediate algorithm states with the final generated output
- reset parameters to their default values
- export generated patterns as image files where supported

---

# Functional Requirements

The primary, algorithmic contribution shall:

- implement the five core procedural generators plus the two supporting generators, per the Pattern Generators section above
- decompose each generator, where its compositional status is resolved, from the shared primitive library (`src/generators/lib/`)
- satisfy the documented generator contract (`docs/GENERATOR_CONTRACT.md`), verified by an automated property-based test suite (`src/generators/__tests__/`)

The demonstration layer shall:

- present each generator as a visual computational workflow
- allow node selection
- display educational documentation for every node
- support parameter manipulation
- update the rendered pattern in real time
- allow users to inspect intermediate algorithm stages
- export generated patterns where supported

---

# Non-Functional Requirements

The primary, algorithmic contribution should:

- keep the composition vocabulary (`docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`) small and explicit, extending it only when a generator demonstrably doesn't fit
- keep every generator's contract verifiable by automated tests rather than manual inspection

The demonstration layer should:

- remain visually simple and approachable
- prioritise educational clarity over feature richness
- provide immediate feedback for user interaction
- maintain consistent interaction across all generators
- support future extension with additional procedural systems

---

# System Constraints

The scope of the application is intentionally restricted to maintain educational clarity.

The application shall not:

- allow users to construct new procedural algorithms
- support arbitrary node graph editing
- expose implementation-specific functions or source code
- include scripting or programming functionality
- provide simulation or physics-based procedural systems
- function as a general-purpose procedural modelling application
- expose parameters that do not contribute to the educational objectives

These constraints ensure the application remains focused on algorithm exploration rather than procedural content creation.

---

# Assumptions

The application assumes that users:

- possess basic computer literacy
- have no prior experience with procedural modelling software
- have little or no programming knowledge
- are interested in learning computational thinking through visual exploration
- are able to interpret simple diagrams and graphical interfaces

No prior knowledge of procedural generation, computer graphics or mathematics is assumed.

---

# Out of Scope

The following features are intentionally excluded from the project:

- creation of custom procedural algorithms
- user-defined node graphs
- scripting or code generation
- collaborative editing
- animation authoring
- three-dimensional procedural modelling
- procedural simulation systems
- user accounts or cloud synchronisation
- assessment, grading or progress tracking
- adaptive learning or intelligent tutoring functionality

Restricting the scope allows the application to focus on supporting conceptual understanding of predefined procedural algorithms.

---

# Educational Outcomes

Following exploration of the application, learners should be able to:

- describe the sequence of operations within a procedural algorithm
- explain the purpose of individual computational stages
- recognise how parameter changes influence algorithm behaviour
- identify computational thinking concepts demonstrated by each generator
- distinguish between stochastic and deterministic procedural systems
- explain how simple computational rules can produce complex visual outcomes
- relate procedural generation techniques to broader concepts in computational thinking

---

# Success Criteria

**Primary (algorithmic)**: the project will be considered successful if the
composition analysis (`docs/ALGORITHMIC_COMPOSITION_RESEARCH.md`) produces a
defensible account of which composition patterns describe the implemented
generators, where the vocabulary needed extension, and why — supported by the
automated generator contract and property-based test suite, not by user
testing.

**Secondary (demonstration)**: the project will be considered successful if
users can:

- understand the sequence of computational operations within each algorithm
- explain the role of individual computational stages
- recognise relationships between parameter changes and visual outcomes
- identify computational thinking concepts demonstrated by each algorithm
- distinguish stochastic and deterministic approaches to procedural generation

Ultimately, the application should help learners understand not only what a procedural algorithm produces, but how and why it produces those results — as a demonstration that the primary research's findings are legible, not as the research finding itself.
