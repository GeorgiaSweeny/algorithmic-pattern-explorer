# KnitLang v1 — Domain-Specific Language Specification

**PatternKnitter Project**
**Version:** 1.0
**Date:** June 2026

---

## 1. Overview

KnitLang is a domain-specific language (DSL) for describing hand-knitting patterns in a structured, human-readable format. It is the core academic contribution of the PatternKnitter system.

A KnitLang source file (`.pknit`) encodes a complete knitting pattern: its physical dimensions, yarn and gauge metadata, colour palette, and a row-by-row stitch definition. The KnitLang compiler pipeline parses this source into an abstract syntax tree (AST), validates it for correctness, compiles it to a runtime grid representation (`PatternDocument`), and generates plain-English knitting instructions.

KnitLang is intentionally constrained to colour-based stranded knitting (fair isle style) and simple stitch-type patterns, reflecting the fixed assumptions of the system: stocking stitch construction, DK or equivalent weight yarns, and standard tension.

---

## 2. Design Goals

| Goal | Rationale |
|---|---|
| Human-readable and writable | Knitters should be able to author or read `.pknit` files without understanding compilers |
| Domain-accurate | Notation maps to real knitting conventions (bottom-up row numbering, repeat markers, knitting mode) |
| Statically validatable | Errors such as missing rows, stitch count mismatches, and undefined colours are caught at compile time |
| Minimal but extensible | v1 covers the core pattern types; the grammar is designed to admit future extensions (multi-size, length-based termination) without breaking changes |

---

## 3. Stitch Types

KnitLang v1 defines three stitch types:

| Token | Name | Description |
|---|---|---|
| `K` | Knit | The knit stitch — worked from the front |
| `P` | Purl | The purl stitch — worked from the back |
| `SL` | Slip | Pass stitch from left to right needle without working it; used for selvedge edges and certain stitch patterns |

The combination of K and P determines the stitch texture of the fabric:

- **Garter stitch** — knit every row on both sides (`K` throughout, `mode: flat`)
- **Stocking stitch** — knit on right side, purl on wrong side
- **Ribbing** — alternating groups of K and P stitches (e.g. K2P2)

---

## 4. Syntax

### 4.1 Pattern block

Every `.pknit` file contains exactly one `pattern` block:

```
pattern <name> {
  dimensions: <width> x <height>
  gauge:      { stitches: <n>, rows: <n> }
  mode:       flat | round

  palette { ... }

  row <range>: [<sequence>]
  ...
}
```

- `<name>` — kebab-case identifier (e.g. `scarf-garter`, `fair-isle-motif`)
- `dimensions` — width in stitches × height in rows
- `gauge` — stitches and rows per 10 cm; used by the compiler to calculate physical dimensions
- `mode` — `flat` for back-and-forth knitting; `round` for circular/in-the-round

### 4.2 Palette block

Declares the named colours available to stitch definitions:

```
palette {
  <id>: #<hex> "<display name>"
  ...
}
```

- `<id>` — camelCase or lowercase identifier (e.g. `bg`, `main`, `yarn`)
- `<hex>` — six-digit CSS hex colour
- `<display name>` — human-readable label used in generated instructions and chart legend

A palette may contain one or more entries. If more than one entry is declared, all stitches must carry an explicit colour annotation (see §4.4).

### 4.3 Row definitions

Rows are numbered bottom-up (row 1 = cast-on edge), matching standard knitting convention.

```
row <N>:        [<sequence>]   // single row
row <N>..<M>:   [<sequence>]   // inclusive range — all rows identical
```

Every row from 1 to `height` must be covered by exactly one definition. Gaps and overlaps are compile-time errors.

### 4.4 Stitch sequences

A sequence is a comma-separated list of runs and groups enclosed in `[...]`:

```
[<item>, <item>, ...]
```

**Run** — one or more stitches of the same type and colour:

```
K * <count>           // knit, no colour annotation (single-palette patterns)
K(<colour>) * <count> // knit, explicit colour
P * <count>           // purl
SL * <count>          // slip — colour annotation not permitted
```

**Group repeat** — a sub-sequence repeated N times:

```
(<item>, <item>, ...) * <count>
```

### 4.5 Comments

```
// This is a single-line comment
```

---

## 5. Validation Rules

The compiler enforces the following at compile time:

1. **Row coverage** — every row from 1 to `height` is defined exactly once; no gaps, no overlaps
2. **Stitch count** — every row, after fully resolving repeats, must sum to exactly `width`
3. **Colour references** — every colour identifier used in a stitch sequence must exist in the palette
4. **Colour annotation** — if the palette declares more than one colour, every non-SL stitch must carry an explicit colour annotation
5. **SL colour restriction** — slip stitches (`SL`) may not carry a colour annotation

Violations produce descriptive compile-time errors, for example:

```
Error [row 6]: stitch count mismatch — expected 24, got 25
Error [row 12]: undefined colour 'accent' — not declared in palette
Error [row 1..10]: overlaps with row 8 defined on line 14
```

---

## 6. Abstract Syntax Tree

The parser produces a `PatternAST`. All subsequent compiler stages operate on this structure.

```typescript
type StitchType = "K" | "P" | "SL"

interface PatternAST {
  name:       string
  dimensions: { width: number; height: number }
  gauge:      { stitches: number; rows: number }  // per 10 cm
  mode:       "flat" | "round"
  palette:    PaletteEntry[]
  rows:       RowDefinition[]
}

interface PaletteEntry {
  id:   string   // e.g. "bg"
  hex:  string   // e.g. "#F5F0E8"
  name: string   // e.g. "Cream"
}

interface RowDefinition {
  range:    RowRange
  sequence: SequenceNode
}

type RowRange =
  | { kind: "single"; row: number }
  | { kind: "range";  from: number; to: number }

type SequenceNode =
  | { kind: "run";   stitch: StitchType; colour: string | null; count: number }
  | { kind: "group"; items: SequenceNode[]; times: number }
  | { kind: "row";   items: SequenceNode[] }
```

---

## 7. Compiler Pipeline

```
.pknit source
    │
    ▼
  Lexer          tokenises source text into a flat token stream
    │
    ▼
  Parser         consumes token stream, produces PatternAST
    │
    ▼
  Validator      checks coverage, stitch counts, colour references
    │
    ▼
  Compiler       resolves AST → PatternDocument (runtime grid)
    │
    ▼
  Generator      PatternDocument → plain-English written instructions
```

The `PatternDocument` produced by the compiler is the single runtime representation consumed by both the renderer (SVG chart) and the web editor.

---

## 8. Instruction Generator Output

The generator produces human-readable knitting instructions from the compiled `PatternDocument`. Output includes:

- Cast-on instruction with stitch count
- Per-row (or per-range) knitting instructions using standard abbreviations
- Repeat notation where a group repeat was used in the source
- Bind-off instruction
- Calculated finished dimensions (derived from `dimensions` and `gauge`)

---

## 9. Example — `scarf-garter.pknit`

A real-world beginner scarf pattern encoded in KnitLang. Based on a standard garter stitch scarf using Stylecraft ReCreate Chunky yarn.

```
pattern scarf-garter {
  dimensions: 24 x 324
  gauge:      { stitches: 13, rows: 20 }
  mode:       flat

  palette {
    yarn: #7A6652 "Stylecraft ReCreate Chunky"
  }

  row 1..324: [SL * 1, K * 23]
}
```

**Compiler output — written instructions:**

```
Cast on 24 sts.

Row 1 (repeat for all 324 rows):
  Slip 1 st, knit to end.  [24 sts]

Bind off all sts. Weave in ends.

Finished dimensions (approx.): 18 cm × 162 cm
```

This example validates the core pipeline: the lexer tokenises a minimal source, the parser constructs an AST with a single palette entry and a single ranged row definition, the validator confirms stitch counts and coverage, the compiler expands the range to a full 324-row grid, and the generator produces correct beginner-level instructions.

---

## 10. Known Limitations and Future Work

| Limitation | Planned extension |
|---|---|
| Row count must be specified explicitly | `length` property (e.g. `length: 162cm`) — compiler resolves to rows using gauge |
| Single size per file | Multi-size notation: `dimensions: 24[18, 12] x 324` |
| No cable or lace stitches | Additional stitch tokens in a future `StitchType` extension |
| No garment shaping | `increase` / `decrease` directives for shaped pieces |
| Colour colourwork only (no intarsia) | Intarsia region blocks as a named extension |
