# Study 2 exports

Real participant results from the Study 2 diagnostic-depth sessions (see
`dissertation/Study2-Design-Plan.md`), one JSON file per participant, in
the exact shape `EvaluationOverlay.jsx`'s "Download My Results" produces:
an array of two records (`phase: "pre"`, `phase: "post"`), each carrying
the full 17-item breakdown (`{ id, concept, type, ...answer fields,
correct }`) rather than just a total.

## Sessions

Single group, no control (per the design plan) — **11 people sat across
two sessions**, but only **10 usable participants** (`study2-P1`…`study2-P10`)
are represented here; see "Known data-loss incident" below. One shared
laptop, sequential turns:

- **Session 1**, 2026-08-31, ~18:23-20:04 BST — `study2-P1`…`study2-P5`
  (6 people sat this session; 1 usable response lost, see below).
- **Session 2**, 2026-09-02, ~15:03-17:31 BST — `study2-P6`…`study2-P10`.

~20 minutes per participant including the exploration window,
save-and-handoff between turns like Study 1's control cohort).
Recruitment reached the ~10 usable participants the design plan
targeted — read the per-type numbers in `docs/evaluation/study2-results.html`,
computed over all 10.

Renamed from the app's raw downloaded filenames
(`study2-evaluation-results-<timestamp>.json`) into the
`study2-P<n>.json` convention. The session 1 raw originals (six files)
remain in `study2results/` at the repo root.

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
`study2-results.html` are computed over the 10 distinct participants
(5 from session 1, not 6; plus 5 from session 2).

## Regenerating the results page

Not scripted the way Study 1's `generate.js` mock exports are — Study 2's
numbers in `study2-results.html` were computed directly from these ten
files (mean score per phase, per-item-type binary correct-%, and for
`node-select`/`order` the secondary partial-credit/positions-correct
percentages using each item's own max). Recompute by aggregating
`items[].correct`, `items[].partialScore`, and `items[].positionsCorrect`
across all ten files, grouped by `items[].type`.
