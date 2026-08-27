# Study 1 participants — informal post-session notes

Casual, jotted-down observations from Study 1 participants after their
session, not part of the structured pre/post quiz instrument itself (that
data lives in `docs/evaluation/exports/` and is analysed in
`docs/evaluation/study-findings.md`). Recorded here on the same principle
already used for the earlier knitting-community focus group (dissertation
§3.4): informal feedback that shaped the interface is reported honestly
rather than omitted because it falls outside the formal instrument.

Five notes, each checked against the actual current app code (not assumed
from memory) so this document states what's really still a gap versus
already addressed, the same discipline applied to the educator-consultation
write-up.

---

## 1. "Node panel too small — if moved under the main canvas it would make it easier to follow, and to link directly to what's affecting the pattern when playing with params."

**Checked against the code**: the node graph (`.algorithm-workflow` in
`App.jsx`/`App.css`) is *already* positioned directly beneath the main
Pattern Canvas, in the same column — this isn't a positioning gap, the
layout the participant is asking for already exists. The real issue is
sizing: `.algorithm-workflow` is fixed at `flex: 0 0 320px` regardless of
window height, so on a shorter or smaller window it reads as visually
cramped relative to the canvas above it, which is what likely read as "too
small" rather than "wrong place."

This is also a concrete instance of Cognitive Dimensions' *Closeness of
Mapping* (already the evaluation lens in §6.6) and Mayer's **spatial
contiguity principle** (place related visual and textual elements near each
other so the relationship between them doesn't have to be inferred) — worth
adding as a citable source alongside Mayer's other principles already
identified in `App-UX-Quickwins.md`. The panel being cramped works against
exactly the spatial relationship (parameter change → node graph → canvas
output) the layout is trying to make visible.

**Fix (quick win)**: give `.algorithm-workflow` a proportional rather than
fixed height (e.g. `flex: 1 1 40%` with a sensible `min-height`, or a
user-draggable divider if time allows) so it scales with the available
column height instead of being capped at a constant.

## 2. "Would be nice to have a tutorial/walkthrough on how to use the app — maybe with the option to skip it, like Word or other creative software."

This independently confirms an ask already raised in the original 5-educator
consultation (`inital-educator-stakeholder-consulation-summary.md` §3.5,
"Guided Onboarding" — tutorials for first-time users, tooltips, guided
prompts — logged there as a Should-have, not yet built). Worth stating
explicitly in the write-up that this is now corroborated by an actual
end-user, not only by educators anticipating learner needs beforehand —
triangulation between stakeholder expectation and real participant
experience is stronger evidence than either alone.

**Not a quick win.** A skippable first-run walkthrough is a real feature:
UI state to track "seen/dismissed," step content, and a skip affordance
consistent with the pattern the participant names (Word, creative software
onboarding flows). Flag for future work, not a pre-Study-2 fix.

## 3. "Would like to see information about the pattern in the documentation panel (or a new/existing panel) — like how the documentation panel currently updates per node — and would like visuals there, not just words."

**Checked against the code**: confirmed gap. `DocumentationPanel.jsx`
renders *only* a "select a node" placeholder when no node is selected —
there is no generator/pattern-level documentation at all, only per-node
documentation. Everything explains one computational stage; nothing explains
what the pattern as a whole is or where it comes from.

The "visuals, not just words" part is a direct match for Mayer's
**multimedia principle** (people learn better from words and pictures
together than from words alone) — the same principle the existing per-node
`NodeIllustration` diagrams already apply at the node level
(`nodeIllustrations.jsx`; `DocumentationPanel.jsx`'s own header comment
explains why these are abstract diagrams rather than a render of the current
pattern). The natural fix reuses that same visual language one level up.

**Not a quick win as a full feature** (needs one overview + one illustrative
diagram authored per generator, nine in total), but the UI plumbing is
cheap: the doc panel's existing empty state (`!selectedNode`) is exactly
where a generator-level overview slots in, reusing components (`SpectrumBar`
is already shown per-node) rather than needing new ones. Reasonable to
scope as "one paragraph + one diagram per generator" rather than a bigger
system, if there's time before Study 2; otherwise, future work.

## 4. "Like that the mini canvas always shows the final output, and the main canvas acting as a preview for the selected node's stage is nice, but not completely apparent — I thought the image was changing because of a parameter change, when it was actually because I'd selected a different node."

**Checked against the code**: both canvases exist as described (`App.jsx`'s
"Render Preview" panel, left column, always final output; the main
"Pattern Canvas" panel, right column, shows the selected node's stage
output). But their headings don't distinguish this: "Render Preview" states
what it is, while "Pattern Canvas" is a generic label that doesn't state
*which* stage is currently showing or why the image just changed.

This is a real, checkable Nielsen heuristic gap: *visibility of system
status* — the interface changed state (which stage is displayed) without
telling the user what changed or why.

**Fix (quick win)**: make the main canvas's own subtitle state its cause
dynamically, e.g. "Showing: Seed stage output" when a node is selected vs.
"Showing: Final Render" when none is — reusing the node title already
available in `selectedNode.data`, no new data needed, just a conditional
heading next to the existing `canvas-size-info` line.

## 5. "Would like the layout to stay in proportion — canvases never cropped or squished needing to scroll, regardless of fullscreen or window size. The zoom feature is good for examining patterns."

**Checked against the code**: confirmed gap, and a real one. `App.css` has
**zero `@media` queries** — no responsive breakpoints anywhere. The layout
grid is fixed at `320px 340px 1fr`, and `.layout-panel` (including the
canvas column) falls back to `overflow-y: auto`, so a short or narrow window
produces exactly the internal scrolling the participant is describing,
rather than the panels scaling down together.

**Partially a quick win, partially not.** Fully "never crops, never
scrolls, at any window size" is a real responsive-design task (fluid column
widths, breakpoint-based stacking on narrow viewports) — not a one-line fix,
flag as its own follow-up item rather than folding it into the quick-wins
list as-is. A cheaper partial fix that is a quick win: replace the fixed
`320px 340px` column widths with `clamp()`-based flexible widths (e.g.
`clamp(240px, 20vw, 320px)`) so panels shrink proportionally on smaller
windows instead of forcing the canvas column into overflow — doesn't fully
solve the ask, but measurably reduces how often the scroll case is hit
before Study 2, without a full redesign.

---

## Cross-reference

Items 1 and 4 above are quick, targeted CSS/JSX fixes in the same spirit as
`App-UX-Quickwins.md`'s existing list (dependency-arrow, focus-visible,
contrast, aria-label, colour-key) — worth adding to that document as
items 7-8 before Study 2 runs. Items 2 and 3 are real features, correctly
scoped as future work rather than pre-Study-2 fixes, the same distinction
already drawn for tiered documentation and the algorithm comparison view.
Item 5 sits in between: a full fix is out of scope for a quick pass, but a
partial, cheap mitigation exists and is worth doing now.
