# Nodes Specification

## Overview

The Algorithmic Pattern Explorer represents procedural algorithms as a collection of reusable educational nodes. Rather than exposing implementation details or source code, each node represents a meaningful conceptual operation within an algorithm.

Nodes are designed to teach computational thinking by allowing learners to inspect individual stages of an algorithm, modify parameters, and observe how each operation contributes to the final generated pattern.

The same node may appear across multiple algorithms, encouraging learners to recognise common computational ideas despite differences in the resulting visual output.

---

# Design Principles

Every node should:

* Represent **one** conceptual computational operation.
* Teach a single computational thinking concept or closely related set of concepts.
* Abstract away implementation details and source code.
* Be reusable across multiple algorithms where appropriate.
* Expose only educationally meaningful parameters.
* Provide immediate visual feedback when modified.
* Clearly communicate its purpose within the overall algorithm.

If a node combines multiple unrelated concepts or parameter groups, it should be decomposed into smaller reusable nodes.

The node graph is **not** intended to represent the application's internal implementation. Instead, it provides a simplified educational representation of the algorithm.

---

# Standard Documentation Template

Every node should follow the same documentation structure.

```markdown
# Node Name

## Summary

A short one-sentence description of the operation.

---

## Purpose

Explain why this operation exists within the algorithm and what it contributes to the final pattern.

---

## Computational Thinking Concepts

- Transformation
- Iteration
- Randomness
- Parameterisation
- Symmetry
- Emergence
- Decomposition
- Pattern Recognition

(Select only those that apply.)

---

## Mathematical Principle

Provide a concise explanation of the underlying mathematical or computational idea where appropriate.

---

## Inputs

Describe the data entering the node.

---

## Outputs

Describe the data produced by the node.

---

## Parameters

List each editable parameter together with a brief explanation.

---

## Visualisation

Describe the visual example or animation used to demonstrate the operation.

---

## Try Changing...

Suggest one or two parameter changes for learners to explore.

---

## Used By

List generators that use this node.

---

## Related Nodes

List conceptually related nodes.
```

---

# Node Taxonomy

Nodes are organised according to their role within the computational pipeline rather than their implementation.

## Educational

Supports understanding of algorithm execution.

Nodes:

* Preview

---

## Environment

Defines the computational workspace in which the algorithm operates.

Nodes:

* Workspace

---

## Initialisation

Creates or initialises the data required before computation begins.

Nodes:

* Seed
* Base Geometry
* Grid
* Seed Points
* Construction Circle

---

## Computation

Performs algorithm-specific calculations.

Nodes:

* Noise
* Distance Field
* Partition

---

## Transformation

Modifies existing geometry without changing the overall algorithm structure.

Nodes:

* Rotate
* Translate
* Scale
* Mirror
* Offset

---

## Pattern Construction

Builds increasingly complex structures from simple computational operations.

Nodes:

* Repeat
* Tile
* Subdivide

---

## Presentation

Controls how computational results are represented visually.

Nodes:

* Colour Mapping
* Stroke

---

## Output

Produces the final visual result.

Nodes:

* Render

---

# Core Reusable Nodes

The following nodes form the foundation of the reusable node library.

## Preview

### Purpose

Displays the intermediate result produced after the current computational stage, allowing learners to inspect the algorithm as it executes.

### Computational Thinking Concepts

* Algorithm Tracing
* Sequential Reasoning

### Typical Parameters

None

### Suggested Animation

Step forwards and backwards through the workflow while the canvas updates to show each intermediate state.

---

## Workspace

### Purpose

Defines the computational space in which the algorithm operates by establishing its coordinate system and dimensions. This is distinct from the canvas — the viewport through which the learner views the workspace, like a camera looking into a scene.

### Computational Thinking Concepts

* Abstraction
* Problem Definition
* Spatial Reasoning

### Typical Parameters

* Width
* Height

### Suggested Animation

The workspace expands to reveal the available computational area.

---

## Seed

### Purpose

Initialises the pseudo-random number generator used by stochastic algorithms. Reusing the same seed demonstrates deterministic randomness by producing identical outputs.

### Computational Thinking Concepts

* Randomness
* Determinism
* Reproducibility

### Typical Parameters

* Seed Value

### Suggested Animation

Changing the seed produces a different pattern, while reusing the same seed recreates the previous result.

---

## Base Geometry

### Purpose

Creates the initial geometric object or structure from which the algorithm begins.

Different algorithms may implement this node as a grid, construction circle, seed points or another suitable starting structure.

### Computational Thinking Concepts

* Initialisation
* Abstraction

### Typical Parameters

* Shape Type
* Radius
* Cell Size
* Initial Scale

### Suggested Animation

The initial geometric structure appears before any transformations are applied.

---

# Computational Thinking Mapping

Every node should explicitly identify the computational thinking concepts it demonstrates.

| Concept              | Typical Nodes                    |
| -------------------- | -------------------------------- |
| Abstraction          | Workspace, Base Geometry         |
| Algorithmic Thinking | Repeat, Tile, Render             |
| Decomposition        | Subdivide                        |
| Pattern Recognition  | Repeat, Tile                     |
| Transformation       | Rotate, Translate, Scale, Mirror |
| Parameterisation     | Rotate, Scale, Noise             |
| Iteration            | Repeat                           |
| Randomness           | Seed, Seed Points, Noise         |
| Determinism          | Seed                             |
| Spatial Reasoning    | Workspace, Grid                  |
| Symmetry             | Rotate, Mirror                   |
| Emergence            | Noise, Repeat, Partition         |

This mapping provides a consistent educational framework across the application and reinforces the relationship between computational operations and the computational thinking concepts they illustrate.

---

# Extending the Library

New nodes should be added only when they introduce a distinct computational concept that cannot be adequately represented by an existing node.

Whenever possible, algorithms should reuse existing nodes to reinforce transferable computational thinking concepts across different pattern generators. Algorithm-specific nodes (such as **Construction Circle** or **Distance Field**) should be introduced only when they represent concepts unique to a particular procedural technique.
