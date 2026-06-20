# Interactive Algorithmic Pattern Generator (In Progress)

## Overview

This project is a web-based generative design application developed as part of a dissertation exploring algorithmic pattern formation across a **stochastic–deterministic continuum**.

The system implements multiple procedural pattern generators spanning different computational paradigms, from controlled randomness to fully rule-based geometric construction. The aim is to investigate how varying degrees of randomness and constraint influence visual structure, complexity, and emergent form.

The application provides an interactive environment where users can manipulate generator parameters in real time and export outputs for digital, analytical, or fabrication use.

---

### key concepts are:

- Algorithm-based
- Generative / Generator
- Interactive
- Pattern creation
- Parameter-driven exploration

## Research Context

This project is grounded in a comparative framework of generative systems positioned along a **stochastic–deterministic spectrum**:

- **Stochastic systems**: rely on randomness or probabilistic inputs to generate structure  
- **Deterministic systems**: rely on strict rules, symmetry, and geometric constraints  
- **Hybrid systems**: combine controlled randomness with structured rule application  

By situating multiple generative approaches within a unified interface, the project enables systematic comparison of how different algorithmic logics produce visual order, repetition, and complexity.

This framing supports investigation into how generative systems transition from noise-driven emergence to rule-constrained geometric construction.

---

## Implemented Pattern Generators

Each generator occupies a distinct position on the generative spectrum:

### Perlin Noise (Highly Stochastic)
Smooth gradient noise used to generate organic, cloud-like, or terrain-like textures.

- Based on interpolated gradient fields  
- Emphasises controlled randomness and emergent continuity  
- Represents continuous stochastic systems rather than discrete geometry  

---

### Voronoi Diagrams (Hybrid)
Cellular structures derived from spatial partitioning around seed points.

- Random seed generation combined with deterministic geometric partitioning  
- Produces organic, cellular, or “cracked” structures  
- Bridges stochastic input with rule-based spatial structure  

---

### Escher-style Tessellations (Structured Transformations)
Interlocking patterns based on symmetry-preserving transformations.

- Uses geometric transformations and repetition rules  
- Maintains structural constraints while allowing controlled variation  
- Demonstrates rule-driven emergent complexity  

---

### Islamic Geometric Patterns (Highly Deterministic)
Radial and polygonal constructions based on classical geometric and symmetry systems.

- Derived from crystallographic symmetry principles  
- Emphasises strict order, repetition, and mathematical precision  
- Represents highly constrained deterministic generative systems  

---

## Key Features

- Real-time parameter manipulation for each generator  
- Immediate visual feedback during pattern generation  
- Comparative exploration across different generative systems  
- Export functionality for:
  - PNG (raster output)
  - SVG (vector output for scaling, fabrication, CNC, laser cutting)

---

## Technical Overview

- Built as a web-based interactive application  
- Procedural generation implemented using modular algorithmic systems  
- Shared rendering environment ensures consistency across generators  
- Designed for extensibility to support additional generative models  

---

## Rendering Strategy and Output Representation

The system adopts a dual rendering strategy based on the mathematical structure of each generative model, distinguishing between vector-suitable and raster-suitable representations.

Rather than enforcing a single output format, each generator is paired with the representation that best preserves its underlying generative logic.

---

### Vector-based generation (SVG-first)

Most pattern generators are implemented as vector-native systems and exported primarily as SVG. This is based on their fundamentally geometric nature, where structure is defined through discrete shapes, transformations, and spatial relationships.

Vector representation is used where:

- geometry is explicitly defined (lines, polygons, paths)  
- transformations preserve mathematical structure  
- scalability without loss of fidelity is required  
- downstream fabrication use cases (e.g. laser cutting, CNC machining) are relevant  

This ensures that outputs remain faithful expressions of the underlying generative rules, preserving geometric fidelity and structural clarity.

Generators in this category include:

- Voronoi diagrams  
- Escher-style tessellations  
- Islamic geometric patterns  
- fractal-based systems (where applicable)  

---

### Raster-only generation (PNG)

Perlin noise is treated as a continuous stochastic field rather than a discrete geometric system. As such, it is implemented exclusively as a raster-based output.

This decision is motivated by:

- the continuous nature of noise functions over 2D space  
- the absence of meaningful geometric primitives to encode as vectors  
- the inefficiency and conceptual distortion of approximating noise fields as vector structures  

As a result, Perlin noise is exported only as PNG, preserving its continuous tonal variation and avoiding unnecessary computational overhead.

---

### Hybrid export strategy

Where applicable, systems support both SVG and PNG export via rasterization of vector outputs. This enables:

- preservation of mathematical structure in vector form  
- accessibility for digital and print workflows  
- compatibility with downstream creative and fabrication pipelines  

---

### Design rationale

This separation reflects a broader system design principle:

> The choice of output modality is determined by the mathematical structure of the generative system, rather than being treated as a uniform rendering constraint.

This ensures that each generator is expressed in the representation that most faithfully corresponds to its underlying generative model.

---

## Research Aim

The primary aim of this project is to explore:

> How do different generative logics—ranging from stochastic to deterministic—affect the emergence of visual structure, complexity, and perceived order within algorithmically generated patterns?

This is achieved through comparative implementation and interactive exploration of multiple algorithmic systems within a unified interface.

---

## Status

🚧 This project is currently in development as part of an ongoing dissertation.  
Features, algorithms, and interface design are subject to change.

---

## Future Work

- Additional pattern generators (e.g. reaction-diffusion, L-systems)  
- Quantitative analysis of pattern complexity and entropy  
- Improved parameter mapping and UI interaction design  
- Performance optimisation for high-resolution generation and export  
- Extended comparative evaluation framework  
- Optional interpretive / educational layer for algorithmic explanation and learning  

---

## Potential Extension: Interpretive / Educational Layer

An optional future direction for the system is the addition of an interpretive layer designed to improve algorithmic transparency and user understanding.

This layer would map generator parameters and outputs to explanatory visualisations or structured annotations, supporting exploratory learning of generative systems.

Potential applications include:

- visualising relationships between parameters and output behaviour  
- supporting intuitive understanding of algorithmic processes  
- improving interpretability of stochastic vs deterministic systems  
- bridging computational concepts with visual intuition  

This extension does not alter the core research focus but introduces a secondary direction aligned with computational literacy and interactive learning systems.
