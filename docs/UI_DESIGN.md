# User Interface Design

## Overview

The user interface is designed to make procedural algorithms inspectable rather than opaque. Instead of presenting users with only a final generated pattern, the application exposes the conceptual stages of each algorithm through a simplified visual workflow.

The interface combines three synchronised views, each representing a different perspective of the same computational process:

* **Algorithm Workflow** — the structure of the algorithm
* **Documentation Panel** — explanations of each computational stage
* **Pattern Canvas** — the visual output produced by the algorithm

Together, these views support exploration of computational thinking concepts through direct interaction with procedural systems.

---

# Design Objectives

The interface has been designed around the following principles:

* Reduce cognitive load through simplified workflows
* Encourage exploration through immediate visual feedback
* Reveal intermediate stages of procedural generation
* Connect computational concepts to visual outcomes
* Prioritise understanding over feature richness
* Maintain consistency across all implemented generators

Unlike professional procedural modelling software, the interface deliberately restricts functionality to maintain focus on learning.

---

# Interface Layout

The application consists of three primary regions.

```text
┌───────────────────────────────────────────────────────────────┐
│                         MENU BAR                              │
├──────────────┬───────────────────────────┬────────────────────┤
|Generator     │                           │                    │
|Selection     │                           │                    │
├──────────────┤                           │                    │ 
│              │                           │                    │
│ Visual       │                           │                    │
│ Algorithm    │ Documentation             │ Pattern            │
│ Workflow     │ Panel                     │ Canvas             │
│ (NODES)      │ (visuals & text)          │                    │
│              │                           │                    │
├──────────────┴───────────────────────────┴────────────────────┤
│              Status & Selected Param/Node Controls            │
└───────────────────────────────────────────────────────────────┘
```

Each panel remains visible throughout interaction, allowing users to continuously relate algorithm structure, conceptual explanation and visual output.

---

# Algorithm Workflow

The workflow provides a simplified visual representation of each procedural algorithm.

Each node corresponds to a meaningful conceptual operation rather than an individual implementation function.

Example:

```text
Generate
    │
    ▼
Transform
    │
    ▼
Repeat
    │
    ▼
Render
```

The graph should remain primarily linear, with branching introduced only where it contributes meaningfully to understanding.

The objective is to communicate algorithm structure without overwhelming learners with unnecessary implementation details.

---

# Node Interaction

Nodes serve as the primary method of navigating the algorithm.

Selecting a node should:

* highlight the current computational stage
* update the documentation panel
* display the corresponding intermediate pattern state
* expose editable parameters where appropriate

Nodes are not editable.

Users cannot:

* create nodes
* delete nodes
* reconnect workflows
* modify algorithm structure

The workflow represents predefined algorithms whose structure has been intentionally curated for educational purposes.

---

# Stepping Through Algorithms

A central feature of the application is the ability to inspect procedural generation incrementally.

Users should be able to move forwards and backwards through the workflow.

Example:

```text
Step 1

Generate Grid

↓

Step 2

Rotate

↓

Step 3

Reflect

↓

Step 4

Repeat

↓

Step 5

Render
```

At each step, the pattern canvas displays the intermediate output produced by that stage of the algorithm.

This allows learners to observe how simple computational operations accumulate to produce complex visual structures.

---

# Documentation Panel

Selecting a workflow node displays educational information describing that operation.

Each node should present consistent documentation including:

* operation name
* conceptual explanation
* purpose within the algorithm
* computational thinking concepts
* editable parameters
* visual examples
* optional animations where movement aids understanding

Documentation should use clear language suitable for learners with limited programming experience.

Mathematical notation should be introduced only where it improves conceptual understanding.

---

# Parameter Editing

Many workflow nodes expose parameters that influence algorithm behaviour.

Examples include:

* rotation angle
* repetition count
* scale
* randomness
* spacing
* symmetry order

Changing a parameter should immediately update the generated pattern.

Parameter controls should remain constrained to meaningful values, preventing invalid procedural states.

The objective is to encourage experimentation while maintaining a coherent learning experience.

---

# Pattern Canvas

The pattern canvas provides visual feedback for every interaction.

It should support:

* real-time rendering
* intermediate algorithm states
* final generated patterns
* zooming and panning where appropriate
* SVG and PNG export

The canvas should always reflect the currently selected computational stage.

Rather than functioning purely as a drawing surface, the canvas acts as a visual explanation of algorithm execution.

---

# Synchronised Interaction

The three interface regions remain synchronised throughout interaction.

For example:

```text
User selects "Rotate"

        │

        ▼

Workflow
(highlights Rotate)

        │

        ▼

Documentation
(explains rotation)

        │

        ▼

Canvas
(shows rotated geometry)
```

Similarly, modifying a parameter updates:

* parameter controls
* rendered pattern
* intermediate algorithm states

This synchronisation reinforces the relationship between computational operations and visual outcomes.

---

# Educational Interaction Model

The application follows an inspect–modify–observe learning cycle.

```text
Select Node
      │
      ▼
Understand Operation
      │
      ▼
Modify Parameter
      │
      ▼
Observe Result
      │
      ▼
Continue Through Workflow
```

This cycle encourages learners to actively investigate how computational rules influence pattern generation.

---

# Relationship to Houdini

The interface is inspired by Houdini's procedural workflow model, particularly its ability to inspect intermediate stages of a procedural network.

However, the interface intentionally omits features associated with professional procedural modelling software.

Included concepts:

* parameterised operations
* non-destructive workflows
* inspection of intermediate results

Excluded concepts:

* arbitrary graph editing
* scripting
* custom node creation
* simulation networks
* procedural authoring

The interface therefore functions as an educational algorithm explorer rather than a procedural modelling environment.

---

# TODO: Planned Wireframes

Figures to be included as implementation progresses.

* Figure 1 — Early interface concept sketch
* Figure 2 — Overall application layout
* Figure 3 — Workflow interaction sequence
* Figure 4 — Documentation panel layout
* Figure 5 — Parameter editing interface
* Figure 6 — Pattern canvas interaction
* Figure 7 — Example workflow for Perlin Noise
* Figure 8 — Example workflow for Islamic Geometric Patterns

These figures document the evolution of the interface throughout the design process and provide visual justification for key interaction decisions.
