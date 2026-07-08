# Project Specification

## Algorithmic Pattern Explorer

### Purpose

Algorithmic Pattern Explorer is an educational web application developed as part of an MSc dissertation investigating how interactive visualisation can support the learning of computational thinking through generative pattern creation.

The project aims to transform procedural generation from an opaque implementation into an inspectable learning experience. Rather than allowing users to construct their own procedural systems, the application presents carefully designed representations of existing generative algorithms that can be explored, manipulated and understood through an interactive visual interface.

The application is inspired by the procedural workflow philosophy of Houdini while intentionally avoiding the complexity of professional node-based authoring tools. The emphasis is educational rather than creative, enabling learners to understand how computational processes produce visual outcomes.

---

# Research Aim

To investigate how interactive visualisation of procedural algorithms can improve understanding of computational thinking concepts through direct exploration of generative pattern creation.

---

# Educational Objectives

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

# Educational Contribution

The primary contribution of this project is the development of an interactive environment for exploring procedural algorithms as educational artefacts rather than creative tools.

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

This inspection capability forms the primary educational contribution of the project.

---

# Pattern Generators

The project includes four predefined procedural generators representing increasing levels of algorithmic constraint.

## Perlin Noise

Focus:

* controlled randomness
* interpolation
* continuous fields
* procedural variation

---

## Voronoi Diagrams

Focus:

* spatial partitioning
* distance relationships
* deterministic construction from random inputs

---

## Escher-Inspired Tessellations

Focus:

* geometric transformation
* repetition
* symmetry
* tiling

---

## Islamic Geometric Patterns

Focus:

* mathematical construction
* radial symmetry
* rule-based geometry
* deterministic procedural generation

Together these generators demonstrate a progression from stochastic to deterministic computational systems.

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

The application shall:

- implement four predefined procedural generators
- present each generator as a visual computational workflow
- allow node selection
- display educational documentation for every node
- support parameter manipulation
- update the rendered pattern in real time
- allow users to inspect intermediate algorithm stages
- export generated patterns where supported

---

# Non-Functional Requirements

The application should:

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

The project will be considered successful if users can:

- understand the sequence of computational operations within each algorithm
- explain the role of individual computational stages
- recognise relationships between parameter changes and visual outcomes
- identify computational thinking concepts demonstrated by each algorithm
- distinguish stochastic and deterministic approaches to procedural generation

Ultimately, the application should help learners understand not only what a procedural algorithm produces, but how and why it produces those results.
