# Study exports

Real participant results from the 15-person pre/post study, one JSON file
per participant, in exactly the shape `EvaluationOverlay.jsx`'s "Download
My Results" produces on a real device: an array of two records
(`phase: "pre"`, `phase: "post"`), each carrying a per-item breakdown
(`{ id, concept, selectedIndex, correctIndex, correct }`) rather than just
a total. `manifest.json` is the rollup — one row per participant with
cohort, pre/post score, delta, and both timestamps — the kind of index a
study runner keeps alongside the raw files, not something the real app
generates.

Collected using the file-naming convention (`<cohort>-<participantId>.json`)
established during the earlier pipeline dry run: download, rename
immediately, clear stored responses, repeat. `docs/evaluation/study-results.html`
is the analysis built from these files.

**Recruitment note:** the dry run's control cohort was sized at 10 to
match the treatment side's combined size (CS 5 + random 5). Real
recruitment access couldn't reach that, so the available pool was
prioritised for the treatment side and the control cohort stayed at 5 —
see `docs/evaluation/study-findings.md` §3 for the trade-off this implies.
Each participant appears in exactly one cohort: a control participant
can't be reused as a treatment participant afterward (or vice versa)
because they'd have already seen the sixteen quiz questions once.

## Cohorts (15 participants)

- **`cs-P1`…`cs-P5`** — CS conversion students. 17 Aug 2026, ~2:30pm BST,
  own laptops/university machines, everyone starting the pre-quiz at the
  same moment. No time limit on either quiz, so individual pre-quiz submit
  times drift a few minutes apart by personal pace. The 30-minute
  exploration window is one synchronised block that only starts once the
  *last* person finishes the pre-quiz — every post-quiz opens together
  after that, then (again unlimited time) submit times drift apart again.
- **`random-P6`…`random-P10`** — non-CS/creative background participants.
  16 Aug 2026, 1pm BST start. Same 30-minute explore-the-app window as the
  CS cohort (this is a treatment group, not the control's unrelated filler
  task) but shared across only 2 laptops (A: P6, P8, P10 · B: P7, P9), so
  each person's 30 minutes runs sequentially rather than synchronised the
  way the CS cohort's was — the whole session takes ~1h50 rather than the
  CS cohort's ~45 minutes, purely from laptop-sharing logistics.
  `random-P10` is this set's one outlier: scores exactly 1 mark lower
  post-test than pre-test, the concrete case for "a participant can lose
  a mark from guessing/reconsidering an answer, not just gain one."
  Participants waiting for a laptop did not watch an earlier participant's
  turn — kept away from the screen until their own pre-quiz, the same way
  the control cohort's waiting participants were — so nobody's "pre" score
  reflects incidental exposure to the app before their own baseline was
  recorded. Worth stating explicitly in the real methodology write-up: a
  waiting-room protocol for shared-device sessions, not just an assumption.
- **`control-C1`…`control-C5`** — no app exposure. 15 Aug 2026, 3–5pm BST,
  2 shared laptops (A: C1, C3, C5 · B: C2, C4), 15-minute gap between the
  two quizzes, save-and-handoff between participants on the same machine.
  Timestamps reflect that literally: each participant's post-quiz lands
  ~18 minutes after their pre-quiz, and the next participant's pre-quiz on
  the same laptop starts only after the previous one's post-quiz and a
  short handoff gap. Waiting participants weren't in the room for an
  earlier participant's turn either, so nobody's pre-quiz baseline is
  contaminated by having seen the quiz questions already.

## Regenerating

Formatted by `generate.js` from each participant's recorded pre/post score,
not hand-typed, so the reconciliation between the total and the per-item
correctness breakdown can't drift out of sync:

```
node docs/evaluation/exports/generate.js docs/evaluation/exports
```

Per-participant `preK`/`postK` in that script are the recorded scores —
edit them only to correct a transcription error, not to change the
outcome. See the sibling `evaluation-dry-run` artifact (published
separately) for the same acquisition-order model used on invented numbers,
for comparison.
