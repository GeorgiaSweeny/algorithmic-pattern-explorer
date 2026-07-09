# User Interface Design

## Overview

The user interface is designed to make procedural algorithms inspectable rather than opaque. Instead of presenting users with only a final generated pattern, the application exposes the conceptual stages of each algorithm through a simplified visual workflow.

The interface combines three synchronised views, each representing a different perspective of the same computational process:

* **Algorithm Workflow** — the structure of the algorithm
* **Documentation Panel** — explanations of each computational stage
* **Pattern Canvas** — the visual output produced by the algorithm

Together, these views support exploration of computational thinking concepts through direct interaction with procedural systems.

---

# Changes from Original Design

This document has been updated against the working implementation in
`src/ui-layout-mockup.html` / `.css`. The changes recorded below were made to
**improve clarity and simplify the layout** — not to change the interface's
underlying design objectives.

* **Parameter editing moved out of the Documentation Panel entirely**, into an
  expandable control panel that opens directly beneath the selected node in
  the Algorithm Workflow column. The Documentation Panel is now purely
  explanatory (text, concepts, a visual example) with no interactive controls
  of its own — a cleaner separation between *understanding* a stage
  (Documentation Panel) and *adjusting* it (inline node controls). See
  Documentation Panel and Parameter Editing below.
* **Parameters are now distinguished as free-exploration vs. fixed-by-geometry.**
  Some node values (e.g. a tile size or repeat count) are sliders the learner
  can freely explore; others (e.g. a rotation angle or lattice offset) are
  mathematically required by the shape being tessellated and are shown
  read-only, with a note explaining *why* they're fixed rather than a free
  choice. This directly serves the "understand why" objective rather than
  presenting every value as equally adjustable.
* **Workflow nodes are now conditionally visible.** A node only appears in the
  workflow if the current algorithm actually needs it — e.g. Rotate and
  Translate are hidden entirely for shapes that tile the plane without them
  (square, hexagon), and shown only for shapes that require them (triangle,
  diamond, brick). Showing a fixed step sequence regardless of relevance
  would misrepresent what the algorithm is actually doing.
* **The canvas now distinguishes the algorithm's workspace from the viewport.**
  A `Workspace` node was added representing the coordinate space the
  algorithm computes in, distinct from the canvas the learner views it
  through; the canvas overlays a workspace-boundary box (except during
  Render, where the output should read cleanly) and labels both the canvas
  and workspace dimensions.
* **Export moved from a canvas-level feature to a Render-node control.** Export
  actions (SVG/PNG) now live inline under the Render node specifically,
  rather than as separate, canvas-level buttons — tying the export action to
  the conceptual final stage of the workflow instead of treating it as a
  generic canvas toolbar feature.

The Interface Layout section below already matches this structure (Generator
Selection stacked above Algorithm Workflow in the same left column); the
sections after it have been updated to reflect the points above.

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

Example (Grid Tessellation, triangle shape — see `src/ui-layout-mockup.html`):

```text
Workspace
    │
    ▼
Base Geometry
    │
    ▼
Rotate           ← shown only for shapes that need it (e.g. triangle, diamond)
    │
    ▼
Translate        ← shown only for shapes that need it (e.g. triangle, brick)
    │
    ▼
Repeat X
    │
    ▼
Repeat Y
    │
    ▼
Colour Mapping
    │
    ▼
Render
```

For a shape that doesn't need them (e.g. square, hexagon), Rotate and
Translate are omitted from the workflow entirely rather than shown as
no-op steps — the workflow always reflects what the current algorithm is
actually doing, not a fixed template.

The graph should remain primarily linear, with branching introduced only where it contributes meaningfully to understanding.

The objective is to communicate algorithm structure without overwhelming learners with unnecessary implementation details.

---

# Node Interaction

Nodes serve as the primary method of navigating the algorithm.

Selecting a node should:

* highlight the current computational stage
* update the documentation panel
* display the corresponding intermediate pattern state
* open an expandable parameter control panel directly beneath the node, where the node has editable parameters

That control panel — not the documentation panel — is where a node's
parameters are actually edited (see Parameter Editing below). Only one
node's controls are open at a time.

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

Example (Grid Tessellation, triangle shape):

```text
Step 1 of 8 — Workspace

↓

Step 2 of 8 — Base Geometry

↓

Step 3 of 8 — Rotate

↓

Step 4 of 8 — Translate

↓

Step 5 of 8 — Repeat X

↓

Step 6 of 8 — Repeat Y

↓

Step 7 of 8 — Colour Mapping

↓

Step 8 of 8 — Render
```

The step count adjusts to the current algorithm — a shape that doesn't need
Rotate/Translate steps through 6 stages instead of 8, per Algorithm Workflow
above. Navigation is available both via Prev/Next controls and by selecting
a node directly.

At each step, the pattern canvas displays the intermediate output produced by that stage of the algorithm.

This allows learners to observe how simple computational operations accumulate to produce complex visual structures.

---

# Documentation Panel

Selecting a workflow node displays educational information describing that operation.

Each node should present consistent documentation including:

* operation name
* a visual example
* conceptual explanation
* purpose within the algorithm
* computational thinking concepts

Editable parameters live in the workflow column, not here (see Node
Interaction and Parameter Editing) — this panel is explanatory only, so a
learner can read what a stage does and why without it being mixed together
with the controls for adjusting it. Optional animations, mentioned in the
original design, are deferred; the visual example is currently a static
placeholder.

Documentation should use clear language suitable for learners with limited programming experience.

Mathematical notation should be introduced only where it improves conceptual understanding.

---

# Parameter Editing

Many workflow nodes expose parameters that influence algorithm behaviour.
Selecting a node opens its parameter controls in an expandable panel directly
beneath it in the Algorithm Workflow column (see Node Interaction above) —
only one node's controls are open at a time, and they close when another node
is selected.

Parameters fall into two kinds, both surfaced by the same control panel:

* **Free to explore** — values the learner can freely adjust, e.g. tile size, repeat count, colour threshold, workspace dimensions.
* **Fixed by geometry** — values that are mathematically required for the algorithm to produce a valid result, e.g. a shape's rotation angle or translation offset. These are shown read-only, with a short note explaining *why* the value is fixed rather than a free choice — the point being to teach that some computational decisions follow necessarily from earlier ones, not that every value is equally negotiable.

Changing a free parameter should immediately update the generated pattern.

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
* a workspace-boundary overlay, distinguishing the algorithm's own coordinate space (the Workspace node) from the canvas viewport it's viewed through, with both dimensions labelled — hidden only during Render, where the output should read cleanly
* SVG and PNG export, available as controls under the Render node specifically (see Parameter Editing), not as separate canvas-level buttons

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
