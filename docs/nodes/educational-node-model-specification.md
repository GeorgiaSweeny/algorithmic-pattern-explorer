# Educational Node Model Specification

## Overview

The Algorithmic Pattern Explorer represents procedural algorithms as compositions of reusable educational nodes. Each node models a single computational operation that contributes to the generation of a visual pattern while simultaneously introducing one or more computational thinking concepts.

Unlike a visual programming language, the node graph does not expose implementation details or arbitrary programming constructs. Instead, it presents a curated educational abstraction of an algorithm, allowing learners to understand *how* procedural systems are constructed without requiring knowledge of source code.

This document defines the conceptual model used by the node library, including node metadata, educational classification, and relationships between algorithms and reusable computational concepts.

---

# Design Philosophy

The node system is designed around three principles.

## 1. Nodes represent concepts, not code

A node should represent a meaningful computational operation rather than a function, method or implementation detail.

For example:

* ✓ Rotate
* ✓ Repeat
* ✓ Noise
* ✓ Partition

Rather than:

* ✗ for-loop
* ✗ calculateVertex()
* ✗ updateBuffer()

The educational model intentionally abstracts implementation into concepts that are transferable across multiple algorithms.

---

## 2. One node, one idea

Each node should communicate a single computational concept.

If a node requires multiple unrelated explanations or exposes unrelated parameter groups, it should be decomposed into smaller nodes.

For example:

Instead of

```
Generate
- Width
- Height
- Seed
- Resolution
```

the system becomes

```
Workspace
↓

Seed
↓

Base Geometry
```

This separation makes each stage easier to understand while reinforcing decomposition as a computational thinking strategy.

---

## 3. Algorithms are compositions of reusable concepts

Nodes do not belong to algorithms.

Instead, algorithms reference nodes.

For example:

```
Islamic Pattern

Workspace

↓

Construction Circle

↓

Rotate

↓

Repeat

↓

Mirror

↓

Render
```

while

```
Escher

Workspace

↓

Base Geometry

↓

Rotate

↓

Repeat

↓

Render
```

Both algorithms reuse the same computational concepts despite producing different visual outcomes.

This reinforces transferable computational thinking.

---

# Node Metadata Model

Every node contains a consistent set of metadata.

## Identity

```yaml
id:
title:
summary:
```

Provides a unique identifier and display information.

---

## Educational Classification

```yaml
category:
tier:
difficulty:
```

### Category

Groups nodes according to their computational role.

Suggested categories:

* Educational
* Environment
* Initialisation
* Computation
* Transformation
* Pattern Construction
* Presentation
* Output

Categories are organisational only and do not affect behaviour.

---

### Educational Tier

The tier indicates when a learner should typically encounter a concept.

Possible values:

```
Core
Intermediate
Advanced
```

Core nodes represent concepts suitable for beginners.

Examples:

* Workspace
* Rotate
* Repeat
* Scale
* Mirror
* Render

Intermediate nodes introduce more specialised computational ideas.

Examples:

* Noise
* Grid
* Colour Mapping
* Seed Points

Advanced nodes represent concepts requiring greater mathematical or computational understanding.

Examples:

* Distance Field
* Partition
* Interpolation
* Gradient Field

Educational tiers are intended to support progressive learning rather than indicate implementation complexity.

---

### Difficulty

Difficulty provides a finer-grained progression than educational tier.

Suggested scale:

```
1 Beginner

2 Elementary

3 Intermediate

4 Advanced

5 Expert
```

Difficulty may be used to filter nodes, recommend learning pathways or evaluate algorithm complexity.

---

# Computational Thinking Metadata

Every node explicitly identifies the computational thinking concepts it demonstrates.

Possible values include:

* Abstraction
* Decomposition
* Pattern Recognition
* Algorithmic Thinking
* Transformation
* Iteration
* Parameterisation
* Randomness
* Determinism
* Symmetry
* Emergence
* Spatial Reasoning
* Representation

Multiple concepts may be associated with a single node.

---

# Reuse Metadata

Each node maintains references describing where it is used.

```yaml
usedBy:
```

Example

```
Rotate

usedBy

- Escher
- Islamic Geometry
```

This enables learners to recognise common computational ideas across different procedural systems.

---

# Relationships

Nodes may also reference related concepts.

```
relatedNodes
```

Example

```
Rotate

related

Mirror

Translate

Scale
```

This supports exploratory learning within the documentation system.

---

# Suggested Database Model

```yaml
id:
title:
summary:

category:
tier:
difficulty:

concepts:

inputs:
outputs:

parameters:

visualisation:

relatedNodes:

usedBy:
```

This structure maps directly to JSON documents or relational database tables.

---

# Educational Progression

Educational tiers enable the application to present increasingly sophisticated algorithms.

Example progression

## Beginner

Workspace

↓

Base Geometry

↓

Rotate

↓

Repeat

↓

Render

Learners encounter only fundamental computational concepts.

---

## Intermediate

Workspace

↓

Seed

↓

Grid

↓

Noise

↓

Colour Mapping

↓

Render

Introduces randomness, parameterisation and continuous functions.

---

## Advanced

Workspace

↓

Seed

↓

Seed Points

↓

Distance Field

↓

Partition

↓

Render

Introduces computational geometry and spatial analysis.

---

# Future Learning Pathways

Because every node contains educational metadata, the application can generate guided learning experiences automatically.

Examples include:

* Beginner mode
* Intermediate mode
* Advanced mode
* Transformation-focused lessons
* Randomness-focused lessons
* Geometry-focused lessons

Algorithms may also be ranked according to the cumulative difficulty of their constituent nodes.

---

# Educational Benefits

Representing algorithms as reusable educational concepts provides several advantages.

Learners are encouraged to recognise common computational ideas across multiple procedural systems rather than viewing each algorithm as an isolated technique.

The separation of concepts into reusable nodes reinforces decomposition and abstraction, allowing complex algorithms to be understood as compositions of simpler operations.

Progressive educational tiers allow learners to encounter increasingly sophisticated computational ideas without becoming overwhelmed.

Consistent node documentation provides a common vocabulary across all generators, improving transfer of knowledge between different procedural techniques.

---

# Evaluation Opportunities

This model enables several forms of evaluation within the dissertation.

## Educational Progression

Do learners demonstrate improved understanding when algorithms are introduced according to educational tier?

---

## Transfer of Knowledge

Can learners recognise that computational concepts such as rotation, repetition or symmetry appear across multiple algorithms?

---

## Algorithm Decomposition

Does exposing algorithms as reusable conceptual stages improve understanding compared with presenting only the final generated pattern?

---

## Parameter Exploration

Do learners develop stronger intuition about computational behaviour by modifying parameters at individual stages rather than changing global settings?

---

## Visual Explanations

Do animations and interactive visualisations improve comprehension of computational operations compared with text alone?

---

# Future Extensions

The proposed metadata model is intentionally extensible.

Additional metadata could support:

* estimated learning time
* prerequisite nodes
* assessment activities
* quizzes
* learning objectives
* curriculum alignment
* accessibility information

Because algorithms reference reusable nodes rather than owning them, new generators can be added without modifying the existing educational framework. This supports the long-term scalability of both the application and its underlying educational model.
