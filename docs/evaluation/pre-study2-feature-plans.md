# Feature plans: onboarding walkthrough, pattern-level documentation, responsive layout

Implementation plans for the three items flagged as "not a quick win" in
`docs/evaluation/study1-participant-post-session-notes.md` and
`dissertation/App-UX-Quickwins.md`. Each is scoped, sequenced, and estimated
separately so a decision can be made about which (if any) fit before Study 2
runs versus after.

All three follow the project's existing architectural constraints: no new
dependencies (the app currently has exactly three runtime dependencies —
`@xyflow/react`, `react`, `react-dom` — and no state-management or UI-kit
library; adding one for a single feature would be a heavier change than the
feature itself), no server/account (everything client-side, `localStorage`
for any persistence, the same pattern `evaluationStorage.js` already uses),
and content authored per generator where relevant, matching how `nodeDocs.js`
is already structured one entry per node type.

---

## 1. Guided onboarding walkthrough (skippable, first-run) — ✅ Done (2026-08-26)

Implemented as planned: `Onboarding.jsx` + `Onboarding.css`, structurally
mirroring `EvaluationOverlay.jsx` (own component, own CSS, no new
dependency), five fixed steps (dropped the optional sixth "try a parameter"
step per the earlier recommendation to keep it UI-orientation only), a
CSS spotlight (oversized `box-shadow`) highlighting the real DOM element per
step via `getBoundingClientRect()`, Skip/Back/Next always visible, dismissal
persisted to `localStorage` the same way `evaluationStorage.js` does, and a
"Replay Tutorial" menu button. One bug found and fixed during Playwright
verification: the initial above/below callout placement logic could push
the callout off-screen for a target (the doc panel) taller than the
viewport itself — fixed by always computing a single clamped `top` value
rather than choosing between `top`/`bottom` positioning. Verified: correct
step sequence, Back navigation, Skip persists across reload, Replay
Tutorial re-triggers from step 1, all 202 existing tests still pass, zero
console errors. Original plan below, kept for reference.

**Ask**: a tutorial on first use, skippable like Word or creative-software
onboarding (participant note #2; independently corroborates the original
5-educator consultation's "Guided Onboarding" ask, §3.5 of
`inital-educator-stakeholder-consulation-summary.md`).

### Design approach
Build as a new full-screen overlay component, structurally identical to
`EvaluationOverlay.jsx`'s existing pattern (own component, own CSS file,
mounted conditionally from `App.jsx`) rather than a third-party tour library
— keeps the dependency count at zero and reuses a pattern already proven in
this codebase.

A **fixed sequence of 4-6 steps**, each pointing at one real UI region in
order:
1. Generator Selection (left column) — "pick an algorithm here"
2. Render Preview (mini canvas) — "this always shows the final result"
3. Documentation Panel — "explanations appear here when you select a node"
4. Pattern Canvas + step-through — "this shows one stage at a time; step
   through the pipeline below it"
5. Node graph — "each box is one computational stage; the graph shows how
   they connect"
6. (optional) Parameter controls — "try changing a value here"

Each step is a small positioned callout (not a full modal blocking
everything — should let the highlighted region still be visible, ideally
with a dimmed overlay everywhere else) with "Next," "Back," and "Skip
tutorial" always visible — the skippability the participant specifically
asked for, modelled explicitly on the named examples (Word, creative
software: skip is never hidden behind multiple clicks).

### Technical plan
- New `Onboarding.jsx` + `Onboarding.css`, mounted in `App.jsx` alongside
  the existing `EvaluationOverlay` conditional render.
- State: `localStorage` key (e.g. `onboarding-dismissed`), checked once on
  mount — same read/write pattern as `evaluationStorage.js`. If absent, show
  step 1 automatically on first load; if present, don't.
- A "Replay tutorial" entry in the existing menu bar (`App.jsx`'s
  `menu-bar`) so a participant (or Study 2 facilitator) can re-trigger it
  on demand — cheap to add given the menu bar already exists.
- Positioning: simplest robust approach is a fixed step-index driving which
  CSS class/data-attribute is applied to the target element (e.g.
  `data-onboarding-highlight="node-graph"`), with the callout box positioned
  via a `getBoundingClientRect()` lookup on that element, recalculated on
  window resize — avoids needing a full popover-positioning library for six
  fixed targets.
- No content-authoring burden comparable to item 2 below — six steps,
  written once, is a bounded and small writing task compared to nine
  generators' worth of documentation.

### Effort estimate
Small-to-medium: the positioning/highlight logic is the only genuinely
fiddly part; content is six short strings. Realistic as a pre-Study-2 item
if time allows, more comfortably a same-week follow-up otherwise.

### Open decision for you
Tone/depth of the six steps — a purely UI-orientation tour ("here's where
things are") versus one that also plants a first concept ("try changing
Frequency and watch the rings"). The former is faster to write and lower
risk; the latter does more pedagogically but overlaps slightly with what
the Documentation Panel already explains once a node is selected. Recommend
the UI-orientation version for a first pass, since it's what was actually
asked for (comparison to Word/creative-software onboarding, which is
navigational, not conceptual).

---

## 2. Pattern-level documentation, with visuals — ✅ Done (2026-08-26)

Fully implemented, including all nine hand-drawn diagrams (not just
placeholders) — `docs/generators/*.md`'s content transcribed into
`GENERATOR_DOCS` (`nodeDocs.js`), nine new SVG diagrams added to
`nodeIllustrations.jsx` (`GeneratorIllustration`/`hasGeneratorIllustration`),
and `DocumentationPanel.jsx`'s empty state replaced with the generator
overview (Pattern name, spectrum bar, diagram, "What This Pattern Is", "Why
It's Here", CT concept tags).

**One real gap found and fixed during wiring, not just styling**: the
overview was originally unreachable in practice — `App.jsx` always kept
`selectedIndex` at `0`, so a node was *always* selected and
`DocumentationPanel`'s `!selectedNode` branch could never actually render.
Fixed by changing the sentinel to `-1` ("no node selected"), shown on first
load and on every new pattern selection, with Prev/Next and the status bar
updated to move into and out of that state correctly. This also fixes the
main canvas's default view: it now shows the Final Render before any node
is picked, consistent with the "Showing: Final Render" label added earlier.

One diagram (the `recursiveNoise` hybrid's "wobbly squares") needed a
second pass — the initial wobble amount (3-5px) was too subtle to read as
different from the plain `recursive` diagram at actual size; increased to
8-14px until the distinction was visually obvious in a screenshot check.
Verified: all 16 registry entries show a diagram with zero placeholders and
zero console errors; full 202-test suite passes unchanged.

**Ask**: information about the pattern as a whole (not just the selected
node), shown in the Documentation Panel or a new/existing panel, with visual
diagrams rather than only text (participant note #3).

**Content drafted**: `docs/generators/` (nine files, one per `generator` id,
plus a `README.md` index) is now the canonical source-of-truth write-up for
this — following the exact template `docs/nodes/`'s per-node docs already
use (Summary / Purpose / Computational Thinking Concepts / Mathematical
Principle / Parameters / Visualisation / Try Exploring / Used By / Related),
so it can be transcribed into code the same way a node doc becomes a
`NODE_DOCS` entry. Each write-up is grounded, in priority order, against
this project's own implementation docs, the dissertation's Ch.2 literature
review where a dedicated citation exists, and general common-knowledge
explanation where it doesn't (grid tessellation specifically). Diagram
concepts are specified per file, following `nodeIllustrations.jsx`'s
existing dashed/solid visual language, with the two hybrids' diagrams
deliberately specified as recombinations of their parent generators' own
diagrams rather than new artwork.

### Design approach
Extend `DocumentationPanel.jsx`'s existing empty state. Currently, when
`!selectedNode`, the panel shows only "Select a node… to see its
explanation." Replace that state with a **generator-level overview** —
`docs/generators/<id>.md`'s Summary/Purpose content, condensed to the same
length as the existing per-node "Learning Objective"/"Conceptual
Explanation" fields — plus **one illustrative diagram** per that file's own
Visualisation section, reusing the exact visual language
`nodeIllustrations.jsx` already established for nodes (dashed reference
shape next to a solid accent shape) so the new content looks native to the
panel rather than bolted on.

This directly answers the "visuals, not just words" part of the ask via
Mayer's multimedia principle (already the citable source identified in the
post-session notes), using a pattern this codebase already has working
code for, not a new illustration system.

### Technical plan
- New `GENERATOR_DOCS` map (parallel structure to `nodeDocs.js`'s
  `NODE_DOCS`), one entry per generator id, transcribed from
  `docs/generators/<id>.md`: `{ explanation: string, purpose: string,
  concepts: string[], illustrationKey: string }` — the same field shape
  `NODE_DOCS` already uses, not a new schema.
- New illustration components in `nodeIllustrations.jsx` (or a sibling file,
  `generatorIllustrations.jsx`, if keeping node-level and pattern-level
  diagrams visually distinct is preferred) — nine new small diagrams, one
  per generator, per each file's own Visualisation section, same dashed/
  solid visual language.
- `DocumentationPanel.jsx`'s `!selectedNode` branch renders this instead of
  the placeholder string, keyed off `entry.generator` (already passed in as
  a prop), reusing `SpectrumBar` the same way the per-node view already does.
- No change needed to node-level documentation, registry, or generator
  logic — purely additive to the panel and one new content map.

### Effort estimate
Content authoring (the original long pole) is now done — all nine
`docs/generators/*.md` write-ups exist. What's left is smaller: the
`GENERATOR_DOCS` transcription (mechanical, ~30 min per generator, same
shape as an existing `NODE_DOCS` entry), the `DocumentationPanel.jsx`
empty-state branch (small, additive), and the nine diagrams (the genuinely
remaining effort — see the open decision below). Realistic scoping: land
the transcription + panel UI first using placeholder/screenshot diagrams,
then swap in hand-drawn diagrams per `docs/generators/README.md`'s
suggested build order (noise, voronoi, islamic, recursive first) if time
allows, rather than blocking the whole feature on all nine diagrams at once.

### Open decision for you
Whether the nine diagrams need to be genuinely new drawings or can start as
simpler placeholders (e.g. a single representative screenshot per generator,
cropped/annotated) for a first pass, with hand-drawn abstract diagrams
matching `nodeIllustrations.jsx`'s style as a later refinement. A screenshot
first pass is much faster and still satisfies "visuals, not just words,"
even if it doesn't fully match the node-level diagrams' abstraction level.

---

## 3. Responsive layout (full fix) — ✅ Done (2026-08-26)

Implemented as planned: `clamp()`-based fluid side columns, one `@media
(max-width: 1024px)` breakpoint stacking `.app-layout` to a single column,
and `.algorithm-workflow` switched from a fixed `320px` height to
`flex: 1 1 240px` (folding in `App-UX-Quickwins.md` item 7 at the same time,
since it's the same class of fixed-dimension bug on the other axis).
Verified with Playwright screenshots at laptop (1366px), tablet landscape
(1080px), and tablet portrait (800px) — no horizontal overflow at any size,
node graph no longer capped at a cramped fixed height, all 202 existing
tests still pass. Original plan below, kept for reference.

**Ask**: layout stays in proportion at any window size — no cropped/squished
canvases needing to scroll (participant note #5). The quick partial
mitigation (`clamp()`-based column widths) is already in the quick-wins
list; this is the fuller fix beyond that.

**Scope constraint (from you)**: design consideration is limited to tablet
and laptop/monitor screens — phone widths are explicitly out of scope. And
within that: **laptop/PC is the core device this app will actually be used
on**; tablet is a secondary case that needs to work correctly, not a case
that needs equal design attention. Concretely, that sets a clear priority
order rather than treating both device classes as equally important:

| Device class | Representative widths | Treatment |
|---|---|---|
| Laptop | ~1280-1440px | Primary target — current layout already works; fluid-columns quick win gives slightly better spacing, nothing structural needed |
| External monitor | ~1920px+ | Same as laptop — more breathing room, no structural change |
| Tablet landscape | ~1024-1194px | Secondary — fluid columns likely enough on their own |
| Tablet portrait | ~768-834px (iPad-class) | Secondary, and the one case needing structural change — the fixed `320px + 340px` side columns (660px) alone are close to or exceed the entire viewport width here |

So the actual shape of the fix is: **one baseline layout (current 3-column
grid, just with fluid rather than fixed column widths) that already serves
laptop/monitor as the core case**, plus **one adapted layout for the tablet
range**, activated only where the baseline genuinely breaks (tablet
portrait, and to a lesser extent tablet landscape). This is a smaller task
than designing for every device class equally — most of the effort goes
into getting the one tablet-portrait adaptation right, not into redesigning
the primary laptop/monitor experience.

### Design approach
Two-part fix, in order of value for effort:

1. **Fluid columns** (the quick-win already logged): replace `320px 340px
   1fr` with `clamp()`-based widths. Covers laptop/monitor comfortably and
   softens tablet landscape; doesn't by itself fix tablet portrait.
2. **One breakpoint, targeted at the tablet-portrait/landscape boundary**
   (~1024px, not a generic mobile breakpoint) — below it, switch
   `.app-layout` from the 3-column grid to a single stacked column
   (`grid-template-columns: 1fr`, sections in document order). Because
   phone widths are out of scope, this is the *only* breakpoint needed —
   no intermediate phone-width tuning, no multi-tier breakpoint system.
3. **Height**, separately from width: `.algorithm-workflow`'s fixed
   `320px` height (already flagged as item 7 in `App-UX-Quickwins.md`) is
   the same class of bug and worth fixing alongside this, since a tablet
   held in portrait is exactly the case where fixed vertical space is also
   tightest.

### Technical plan
- One new `@media (max-width: 1024px)` block in `App.css` — the boundary
  between tablet landscape and tablet portrait, not a generic mobile
  breakpoint, since anything narrower than tablet portrait is explicitly
  out of scope.
- Below that breakpoint: `.app-layout { grid-template-columns: 1fr; }`,
  and `.layout-panel`'s `overflow-y: auto` can likely be relaxed once
  columns stack.
- Combine with item 7 from `App-UX-Quickwins.md` (`.algorithm-workflow`
  proportional height) so both axes are fixed together.
- Test matrix is now small and concrete, given the scope constraint: a
  laptop-sized window, an external-monitor-sized window, and a tablet in
  both orientations (physical device or browser dev-tools device emulation
  at the widths in the table above) — four checks, not an open-ended range
  of sizes.

### Effort estimate
Smaller than originally scoped, now that phone widths are excluded: one
breakpoint, one grid-column change, and a four-point test matrix — closer
to a focused couple-of-hours task than a multi-day responsive-design
effort. Still worth keeping separate from the same-hour quick-wins list
since it needs actual visual testing at each of the four sizes rather than
a one-line CSS change, but realistically foldable into the same pre-Study-2
pass as the quick wins rather than deferred as follow-up work.

---

## Suggested sequencing before Study 2

Given limited time before running the study, in priority order:

1. **Quick wins already logged** (`App-UX-Quickwins.md`, items 1-8) — do
   these regardless, they're small and several are directly implicated in
   Study 1's own quantitative findings (dependency legibility) or in these
   same participant notes (items 7-8).
2. **Responsive layout, fluid-columns-only piece** — cheap, meaningfully
   reduces how often Study 2 participants hit the cropping problem, even
   without full breakpoint stacking.
3. **Onboarding walkthrough** — worth doing before Study 2 specifically
   *because* it changes what Study 2 measures: a facilitator currently has
   to explain the interface verbally before a participant starts, which
   Study 1 doesn't document as controlled or scripted; a built-in tutorial
   makes that first-contact experience consistent across participants,
   which is itself a small methodological improvement worth having before
   running Study 2, not just a nice-to-have UI feature.
4. **Pattern-level documentation** and **full responsive breakpoint
   stacking** — both real value, both lower urgency for Study 2
   specifically (neither is measured by the new item types in
   `Study2-Design-Plan.md`, and neither is implicated in Study 1's own
   findings the way dependency-legibility and onboarding-consistency are).
   Reasonable to treat as post-Study-2 follow-up work.
