# MoSCoW Priorities — Full Project Scope

This is the single consolidated priority table for everything scoped in the
project. It merges three sources that each carry a partial view of priority:

* [`README.md`](../README.md) — MVP feature list (no priority tags)
* [`docs/PROJECT_SPECIFICATION.md`](PROJECT_SPECIFICATION.md) — user/functional
  requirements and an explicit Out of Scope section
* [`docs/evaluation/educator-consultation-user-stories.md`](evaluation/educator-consultation-user-stories.md) —
  44 UX/pedagogy user stories already tagged Must/Should/Could/Future

Where the source docs disagreed on emphasis, priority here follows
[`docs/plan-checklist.md`](plan-checklist.md)'s "Priorities if time runs short"
ranking, since that's the one built under the actual 14-day time constraint.

Priority definitions used throughout:

* **Must** — required for either the primary (algorithmic) or secondary
  (demonstration) research contribution to stand on its own. Project fails
  without it.
* **Should** — materially strengthens the contribution; ship if the schedule
  allows.
* **Could** — adds value but the project is coherent without it; first to
  flex if time is short.
* **Won't (this project)** — explicitly out of scope per
  `PROJECT_SPECIFICATION.md`'s System Constraints / Out of Scope sections, or
  deferred to Future Work in `README.md`.

---

## 1. Pattern Generators (primary research contribution)

| Item | Priority | Notes |
|---|---|---|
| Perlin/Ridge Noise generator | Must | Implemented. Only fold/reduce composition example. |
| Voronoi Diagrams generator | Must | Implemented. Constant-bind → atop. |
| Escher-inspired Tessellations generator | Must | Implemented. Only cross-fork example. |
| Recursive/Fractal (Sierpinski) generator | Must | Implemented. Repeat/power composition. |
| Islamic Geometric Patterns generator | Must | In progress — 5th core spectrum position, distinct deterministic mechanism from recursive. |
| Wave/Concentric Rings generator | Should | Implemented. Pedagogical scaffolding for Voronoi's pattern; not a distinct spectrum/composition position. |
| Grid Tessellations generator | Should | Implemented. Compositional status unresolved (open question in `ALGORITHMIC_COMPOSITION_RESEARCH.md`). |
| Generator contract (`GENERATOR_CONTRACT.md`) | Must | Verified by automated property-based tests, not manual inspection (non-functional requirement). |
| Property-based test suite, all 7 generators | Must | Primary contribution's success criterion is defensible, test-backed composition analysis. |
| `lib/` primitive decomposition per generator | Must | Required so the composition analysis in `ALGORITHMIC_COMPOSITION_RESEARCH.md` is checkable against real code, not just claimed. |
| `noise.js` internals decomposed into `lib/` primitives | Could | Backlog; not blocking — noise.js still satisfies the contract without it. |
| `recursive.js` `mode` param behaviour decided | Could | Backlog; needed before it becomes a node-graph choice, not before MVP. |

## 2. Compositional/Hybrid Generators (secondary research question)

| Item | Priority | Notes |
|---|---|---|
| Perlin-perturbed recursive subdivision hybrid | Should | Stochastic/deterministic hybrid; doesn't depend on the other two hybrids. |
| Voronoi-seeded tessellation hybrid | Should | Doesn't depend on the other two hybrids. |
| Property tests for built hybrids | Should | Same rigor bar as the core 7 generators. |
| Noise/reaction-diffusion-driven Islamic pattern hybrid | Could | Cut-order #3 per plan-checklist.md — other two hybrids don't depend on it. |
| Entropy/structure metrics across hybrid params | Could | Cut-order #2 — separable from the hybrids existing and working; secondary RQ's empirical content, not its precondition. |
| Benchmark suite extended to cover hybrids | Should | Re-run once hybrids exist; core-generator benchmarking is already Must/done. |

## 3. Algorithm Explorer / Demonstration Interface

| Item | Priority | Notes |
|---|---|---|
| ReactFlow node graph (all 7 core generators) | Must | Primary demonstration-layer deliverable — the node model *is* the thing being evaluated. |
| Functional page: select generator / view graph / adjust params / canvas updates | Must | MVP interaction loop per `PROJECT_SPECIFICATION.md` User Requirements. |
| Documentation panel per node (name, plain-language explanation, purpose, CT concepts, params) | Must | `PROJECT_SPECIFICATION.md` §Documentation Panel — required, not optional. |
| Real-time canvas rendering, immediate feedback on param change | Must | Core interaction principle; explicit functional requirement. |
| Inspect intermediate algorithm stages | Must | "Core contribution of the demonstration layer" per spec. |
| Reset parameters to default | Must | Explicit user requirement. |
| PNG export | Must | Explicit user requirement ("where supported"). |
| SVG export | Should | README MVP lists as "where supported" — secondary to PNG. |
| Documentation/education UI polish beyond MVP loop | Could | Explicitly deferred post-schedule-end in plan-checklist.md's cut order (#4, last to cut — but still not Must). |
| Optional short node-behaviour animations | Could | Spec marks these "optional" explicitly. |
| Visual overlays on canvas | Could | Spec marks these "optional where educationally useful." |

## 4. Educational / Pedagogical UX

Full detail lives in
[`educator-consultation-user-stories.md`](evaluation/educator-consultation-user-stories.md)
(44 stories); summarized here by theme so this table is a complete index.

| Item | Priority | Notes |
|---|---|---|
| Plain-language node documentation, no jargon required | Must | US-1.1, US-3.1 |
| Interface understandable with no programming background | Must | US-1.1 |
| Explorer Mode (step through existing algorithms, no building required) | Must | US-12.5 |
| Visual + interactive + written explanation per node (multi-modal) | Must | US-4.1, US-4.2, US-4.4 |
| Explicit learning objective shown per node/algorithm | Must | US-6.1 |
| Minimal initial interface, progressive disclosure | Must | US-9.1, US-9.2 |
| Tiered algorithm structure (core/intermediate/advanced) | Must | US-10.1 |
| Adapts explanation depth across learner age/experience | Should | US-1.2 |
| Conceptual (not just surface) explanation per node | Should | US-3.2 |
| Optional animation of node behaviour over time | Should | US-4.3 |
| Guided tutorial on first open | Should | US-5.1 |
| Tooltips/hover help on interface elements | Should | US-5.2 |
| Nodes mapped to CT concepts explicitly (decomposition, iteration, etc.) | Should | US-6.2 |
| Progression indicator ("what I've learned / what's next") | Should | US-6.3 |
| Incremental concept introduction | Should | US-10.2 |
| Recognise shared concepts recurring across algorithms | Should | US-11.1, US-11.2 |
| Technical/mathematical explanation depth (advanced learners) | Could | US-1.3, US-3.3 |
| Contextual "what to try next" prompts | Could | US-5.3 |
| Side-by-side comparison view across algorithms sharing a concept | Could | US-11.3 |
| View underlying source code for a node | Could | US-12.1 |
| Structured lesson/curriculum mode, educator-led sync sessions | Won't (this project) | US-2.2, US-2.3 — Future in source doc |
| Engagement/gamification (challenges, unlocks, achievements) | Won't (this project) | US-7.1–7.3 — Future in source doc |
| Assessment engine (ID animation, rebuild pattern, debug graph, match graph↔output) | Won't (this project) | US-8.1–8.5 — Future in source doc; also explicit Out of Scope ("assessment, grading, progress tracking") in `PROJECT_SPECIFICATION.md` |
| Sandbox Mode (create/save own patterns) | Won't (this project) | US-12.2 — Future in source doc |
| Builder Mode (construct custom node graphs) | Won't (this project) | US-12.3 — Future in source doc; also explicit System Constraint ("shall not allow users to construct new procedural algorithms") |
| Save/share created patterns | Won't (this project) | US-12.4 — depends on Sandbox Mode, itself Won't |

## 5. Evaluation (secondary RQ empirical validation)

| Item | Priority | Notes |
|---|---|---|
| Computational-thinking quiz instrument (pre/during/post) drafted | Must | The Aug-11/12 deliverable per plan-checklist.md is the instrument working, not a completed study. |
| In-app concept-check prompts during use | Must | Part of the same MVP evaluation deliverable. |
| Pre/post evaluation data collection + write-up | Must | Required for the secondary RQ's empirical validation — the project's Success Criteria (`PROJECT_SPECIFICATION.md`) require evidence users actually achieved the listed learning outcomes, not just that the instrument exists. Runs after the Aug 12 coding deadline, during the dissertation write-up period, targeting Aug 31 to leave a buffer before the Sep 7 submission deadline — later timing, not lower necessity. |

## 6. Explicitly Out of Scope (Won't Have, any horizon)

Verbatim from `PROJECT_SPECIFICATION.md` §System Constraints / §Out of Scope,
not project-managed as issues:

* User-defined/arbitrary node graph editing, scripting, or code generation
* Collaborative editing
* Animation authoring
* Three-dimensional procedural modelling or physics/simulation systems
* User accounts or cloud synchronisation
* Adaptive learning / intelligent tutoring
* General-purpose procedural modelling (i.e. becoming a visual programming language)

## 7. Future Work (beyond this dissertation, per README)

Speculative extensions explicitly framed as post-project in
`README.md`'s Future Work section — distinct from "Won't" above in that these
are natural next steps rather than deliberately excluded:

* Grammar-based user-authored generative workflows
* Interactive algorithm authoring (guided, constraint-validated)
* Guided learning pathways (tutorials, exercises, lesson plans)
* Additional generative systems: L-Systems, reaction–diffusion, cellular automata, agent-based systems

---

## Traceability to GitHub Project

The 18 issues tracked on the
[GitHub Project board](https://github.com/users/GeorgiaSweeny/projects/1)
cover the **currently scheduled slice** of this table (rows tagged Must/Should
within the Jul 10 – Aug 12 window from `plan-checklist.md`), tagged there with
a 6-value Priority field (High/Medium/Low/Possible/Future/Not Doing) rather
than 4-value MoSCoW, to also capture schedule risk. Rows marked Could above
that aren't yet issues (e.g. individual "Won't (this project)" and "Future
Work" rows) are deliberately not on the board — they're scope decisions, not
tasks.
