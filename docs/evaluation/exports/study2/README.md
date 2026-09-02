# Study 2 exports

Real participant results from the Study 2 diagnostic-depth session (see
`dissertation/Study2-Design-Plan.md`), one JSON file per participant, in
the exact shape `EvaluationOverlay.jsx`'s "Download My Results" produces:
an array of two records (`phase: "pre"`, `phase: "post"`), each carrying
the full 17-item breakdown (`{ id, concept, type, ...answer fields,
correct }`) rather than just a total.

## Session

Single group, no control (per the design plan) — **6 people sat the
session**, but only **5 usable participants** (`study2-P1`…`study2-P5`)
are represented here; see "Known data-loss incident" below. One shared
laptop, sequential turns on 2026-08-31 from ~18:23 to ~20:04 BST
(~20 minutes per participant including the exploration window,
save-and-handoff between turns like Study 1's control cohort).
Recruitment reached 5 usable participants of the ~10 the design plan
targeted — read the per-type numbers in `docs/evaluation/study2-results.html`
as indicative, not powered.

Renamed from the app's raw downloaded filenames
(`study2-evaluation-results-<timestamp>.json`) into the
`study2-P<n>.json` convention. The raw originals (six files) remain in
`study2results/` at the repo root.

### Known data-loss incident

Two of the six raw downloads (`...1788203488325.json` and
`...1788203511075.json`, exported 23 seconds apart) are byte-identical —
same 17-item answer pattern, same pre timestamp, same post timestamp, down
to the millisecond. That isn't two people independently producing the same
result; it means `evaluationStorage.js`'s Study 2 record wasn't cleared
between turns on the shared laptop, so one participant's "Download My
Results" re-served the still-stored data from the participant before them
instead of their own answers. That sixth participant's real responses were
never captured and are unrecoverable. Only one copy of the duplicate file
was kept (as `study2-P2.json`); the results page and all aggregates in
`study2-results.html` are computed over the 5 distinct participants, not 6.

### Known correction: P2 pre-test transcription error

`study2-P2.json`'s pre-test was originally exported/recorded as 10/17. The
participant's physical answer sheet records **4/17** for the pre-test, with
incorrect answers concentrated on items that use the instrument's own
technical terminology in the question text (`stochastic`/`deterministic`,
`amplitude`) — `noise-spectrum`, `escher-edge-deformation-cause`, and
`perlin-sierpinski-amplitude-predict`. The stored JSON has been corrected
to 4/17, flipping those three terminology items plus three more
(`wave-frequency-cause`, `symmetry-concept-match`, `iteration-concept-match`,
chosen at random, seed 42) to bring the total down to match the sheet,
since the sheet doesn't specify which of P2's *other* answers were wrong
beyond the terminology items and the total. The specific wrong option
recorded for each flipped item is a placeholder (a plausible incorrect
index), not read off the sheet — the sheet gives correct/incorrect per
item and a total, not which distractor was picked. If the original sheet
becomes available for re-transcription, replace the placeholder
`selectedIndex` values with the actual selections. P2's post-test entry is
unaffected — the reported issue was pre-test only.

## Regenerating the results page

Not scripted the way Study 1's `generate.js` mock exports are — Study 2's
numbers in `study2-results.html` were computed directly from these five
files (mean score per phase, per-item-type binary correct-%, and for
`node-select`/`order` the secondary partial-credit/positions-correct
percentages using each item's own max). Recompute by aggregating
`items[].correct`, `items[].partialScore`, and `items[].positionsCorrect`
across all five files, grouped by `items[].type`.
