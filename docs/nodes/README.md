# Node Documentation

This directory is the canonical, human-readable source of truth for the node model. Each `.md` file defines one node's purpose, parameters, inputs/outputs, and educational intent. Once a node's definition is agreed here, it gets translated into the database schema — the schema should never diverge from what's written in these files.

See [node-model-specification.md](node-model-specification.md) for the overall design principles shared by every node.

## Category structure

Nodes are organised by **conceptual role**, not by which algorithm first introduced them. An algorithm is a particular composition of nodes — it does not own any of them.

- **`core/`** — Reusable computational concepts. General-purpose building blocks (transforms, sampling, colour, rendering) that apply across many algorithms: `workspace`, `seed`, `base-geometry`, `grid`, `rotate`, `translate`, `scale`, `mirror`, `repeat`, `noise`, `colour-mapping`, `render`.

- **`computation/`** — Spatial / numeric systems. Nodes that compute a field, mapping, or relationship over space or values: `distance-field`, `partition`, `interpolation`, `gradient-field`.

- **`generation/`** — Initial sampling structures. Nodes that produce the first set of points/geometry an algorithm builds on: `seed-points`, `construction-circle`.

- **`pattern/`** — Composition logic. Nodes that describe how generated/computed structures are arranged or composed into a final pattern: `radial-divisions`, `base-tile`, `edge-deformation`.

Algorithm-specific documentation (e.g. a particular tessellation) should describe itself as an *instance* composed of nodes from the categories above, not introduce new node categories of its own.
