# PatterKnitter

PatternKnitter is a domain-specific language (DSL) and multi-output compiler system for knitting patterns. It enables users to write knitting instructions in a structured language (KnitLang v1) and automatically generate:

- Written knitting instructions  
- SVG knitting charts  
- 2D fabric visualisations  
- Optional 3D garment texture mapping (stretch goal)

The system treats knitting patterns as structured programs compiled from a single source of truth into multiple consistent representations.

---

## Project Motivation

Knitting and programming share a long conceptual history based on rule-driven systems for constructing complex outputs from symbolic instructions. Historical systems such as the Jacquard loom demonstrate early forms of programmable textile design.

Despite this, modern digital knitting tools often separate written instructions, chart representations, and visual previews into independent systems. This separation can introduce inconsistencies and increases the cognitive overhead of pattern design and modification.

PatternKnitter explores whether a domain-specific language approach can unify these representations within a single compiler-style system.

---

## Core Concept

PatternKnitter introduces KnitLang v1, a domain-specific language for knitting patterns.

Example:

```text
PATTERN "Scarf - Garter Stitch"

BODY:

ROW 1-40: K ALL

FINISH:
CAST OFF
```

This single source is compiled into multiple outputs:

- Human-readable instructions
- SVG knitting chart
- 2D product simulation (texture map?)
- Optional 3D texture mapping

## System Architecture

The system follows a compiler-style pipeline:
```
KnitLang Source Code
        |
        v
      Parser
        |
        v
       AST
        |
        +----------------------+
        |          |           |
        v          v           v
 Instructions   SVG Charts   Fabric Preview
```
All outputs are generated from a shared abstract syntax tree (AST), ensuring consistency across representations.

## Repository Structure
```
patternknitter/
│
├── packages/
│   ├── core/              # DSL parser, AST, compiler logic
│   ├── renderer-svg/      # SVG knitting chart generator
│   ├── renderer-fabric/   # 2D fabric visualisation engine
│   └── types/             # Shared TypeScript AST definitions
│
├── apps/
│   └── web/              # React-based editor and preview interface
│
├── examples/             # Reference knitting patterns
├── docs/                 # DSL specification and design documentation
└── README.md
```
## KnitLang v1 Syntax

KnitLang is a row-based DSL designed to reflect traditional knitting notation while remaining structurally unambiguous.

### Example
```
PATTERN "Scarf"

BODY:

ROW 1-40: K ALL

FINISH:
CAST OFF
```

### Supported constructs
- ROW definitions (ROW X, ROW X-Y)
- Stitch types (K, P)
- Shorthand operations (K ALL, P ALL)
- Repetition blocks (REPEAT N:)
- Inline repetition ((K P) REPEAT N)
- Finish operations (CAST OFF)

## Features
## DSL Compiler
- Parses KnitLang into an abstract syntax tree (AST)
- Validates syntax and structure
- Produces deterministic intermediate representation

### Instruction Generator
- Converts AST into human-readable knitting instructions
- Preserves row structure and repetition logic
### SVG Chart Generator
- Produces scalable knitting charts
- Suitable for digital use and printing
### Fabric Visualisation
- Generates 2D stitch-level representations of knitted fabric
- Provides preview of final textile structure
### Optional 3D Visualisation
- Applies generated fabric textures to pre-modelled garments
- Supports scarf, blanket, hat, and jumper models

## Evaluation Strategy

The system is evaluated using four reference patterns:

- Garter stitch scarf *(knit only)*
- stocking stitch Blanket *(knit & purl)*
- simple Beanie hat
- Simple stocking stitch jumper

Each pattern is encoded in KnitLang and compared against original human-written patterns in terms of:

- Instructional equivalence
- Chart accuracy
- Structural consistency

Qualitative feedback is collected from a local knitting group with mixed experience levels to assess usability and interpretability.

## Technologies
- TypeScript / JavaScript
- React (frontend application)
- SVG (chart rendering)
- HTML5 Canvas (fabric simulation)
- Optional Three.js? (3D visualisation)

## Project Status

MSc dissertation project in active development.

Target milestones:

- Core DSL and compiler: mid-August
- Full evaluation and dissertation: mid-September

## Academic Context

This project is informed by research in:

- Domain-specific language design
- Compiler architecture
- Human-computer interaction
- Textile computation systems (e.g. Jacquard loom)
- Visual representation of procedural systems

## Current Todos

- [ ] Set up monorepo root (package.json, tsconfig.base.json)

- [ ] Build packages/types (AST + PatternDocument interfaces)

- [ ] Build packages/core — lexer

- [ ] Build packages/core — parser

- [ ] Build packages/core — validator

- [ ] Build packages/core — compiler (AST → PatternDocument)

- [ ] Build packages/core — instruction generator


