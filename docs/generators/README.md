# Generator Documentation

This directory is the canonical, human-readable source of truth for
**generator-level** (pattern-level) documentation — one short conceptual
explanation per `generator` id in `patternRegistry.js`, distinct from the
per-node documentation in `docs/nodes/`. Where a node's doc explains one
computational stage in isolation, a generator's doc explains what the whole
pipeline is *for* and what real-world or historical thing it corresponds to
— the explanation a learner should see before they've selected any node at
all.

Once a generator's write-up is agreed here, it gets translated into
`GENERATOR_DOCS` in `src/app/src/nodeDocs.js` (or a sibling file), rendered
by `DocumentationPanel.jsx`'s currently-empty `!selectedNode` state
(`docs/evaluation/pre-study2-feature-plans.md` §2) — the schema should never
diverge from what's written here, the same rule `docs/nodes/README.md`
states for node docs.

Nine files, one per `generator` value (`patternRegistry.js`'s fourteen
registry entries collapse to nine distinct generators — `wave`, `noise`,
`grid`, and `recursive` each cover multiple registry entries/modes with one
shared write-up, since the underlying construction is identical):

- [wave.md](wave.md) — Wave Stripes, Concentric Rings
- [noise.md](noise.md) — Perlin Noise, Ridge Noise
- [grid.md](grid.md) — Square/Hex/Triangle/Brick/Diamond Grid
- [escher.md](escher.md) — Escher-Inspired Tessellation
- [voronoi.md](voronoi.md) — Voronoi Cells
- [islamic.md](islamic.md) — Islamic Geometric Rosette
- [recursive.md](recursive.md) — Sierpinski, Recursive Grid
- [voronoi-islamic.md](voronoi-islamic.md) — Voronoi-Seeded Islamic Tiling (hybrid)
- [recursive-noise.md](recursive-noise.md) — Perlin Sierpinski (hybrid)

## Grounding

Each file is checked against, in priority order: (1) this project's own
implementation docs (`docs/nodes/WORKFLOWS.md` and related), so the write-up
never contradicts what the code does; (2) the dissertation's Chapter 2
literature review, named inline where a generator has a dedicated academic
source (the same sources cited there — Perlin, Worley, Kaplan, Sierpiński,
etc.); (3) a general, common, textbook-level explanation where no dedicated
citation exists (grid tessellation specifically — regular tiling is
common-knowledge geometry, correctly left uncited in the dissertation too).

## Suggested diagrams

Each file's own **Visualisation** section names a diagram concept following
`nodeIllustrations.jsx`'s existing dashed-reference / solid-accent visual
language, so a new pattern-level illustration looks native next to the
existing node-level ones rather than a screenshot bolted on (see the open
decision in `docs/evaluation/pre-study2-feature-plans.md` §2 if a faster
screenshot-based first pass is preferred instead). The two hybrids'
diagrams are specified as recombinations of their two "parent" generators'
own diagrams, so building `voronoi.md` and `islamic.md`'s diagrams first
makes `voronoi-islamic.md`'s a small compositing step rather than new
artwork from nothing.

Suggested build order: `noise.md`, `voronoi.md`, `islamic.md`, `recursive.md`
first (the four with dedicated Ch.2 citations, most load-bearing for the
dissertation's own credibility), then `wave.md`/`grid.md`/`escher.md`, then
the two hybrids last since they depend on the others already existing.
