# Evaluation instrument: design decisions from the mock dry run

Before running the real pre/post study, a simulated dataset was built and
analysed — first as `evaluationStorage.js`/`quizContent.js` unit tests, then
as a dashboard (`evaluation-dry-run.html`, this folder — open it in a
browser to view/screenshot) walking through the full recording-and-analysis
pipeline against invented scores. That exercise surfaced concrete problems
with the instrument as originally built, each fixed in the actual code
before any real participant sees it. This document records what changed and
why, for direct reuse in the dissertation's methodology section.

**The dashboard's numbers are fabricated — a pipeline test, not a
finding.** Cite this document and the pipeline-validation practice it
describes; never cite the dashboard's specific figures as results.

---

## 1. Added a control group

**Before:** single-group pre/post only — every participant explored the app
between quizzes, with nothing to separate "the app taught this" from
"answering the same questions twice teaches the test."

**After:** a third cohort (5 participants) takes the same pre/post quiz but
spends the between-quiz interval reading or watching something unrelated on
their own phone — no app exposure. Their gain is the empirical estimate of
pure test-retest/practice effect; subtracting it from a treatment cohort's
gain (only when the two cohorts share a comparable pre-test baseline —
see §7) is the closest this design gets to a causal estimate of the app's
effect, while still being purely descriptive at this sample size.

## 2. Scores hidden until download

**Before:** `EvaluationOverlay.jsx` displayed "score N / 16" immediately
after both the pre- and post-quiz.

**After:** the summary screen confirms the quiz was recorded but never
shows the score. Results are visible only in the JSON downloaded at the end
of the whole session.

**Why:** a visible pre-quiz score lets a participant infer which answers
were wrong and go looking for the right ones before the post-quiz, or
deliberately re-pick post-quiz answers just to watch the number move —
either way contaminating the within-subject comparison the instrument
exists to measure.

## 3. Per-item correctness logged, not just the total

**Before:** `recordQuizPass` stored `{ phase, score, total, answers }`,
`answers` being raw selected-option indices with no correctness or concept
tag attached — reconstructing per-concept results meant re-joining against
`quizContent.js` by hand.

**After:** each record stores `items: [{ id, concept, selectedIndex,
correctIndex, correct }]` per question, so a per-concept pre/post
comparison is computable directly from the exported JSON.

**Why:** a flat total score can hide a concept that moved a lot and one
that didn't move at all — the per-concept view is the more defensible part
of the write-up, and it's only possible because this data exists in the
export at all.

## 4. Five-option distractors, not four

**Before:** 4 options per question (25% chance baseline), picked without a
consistent design rule.

**After:** every question has exactly 5 options in a fixed structure — 1
correct, 1 an average person eliminates immediately, 1 "near-miss" (a
plausible misconception, e.g. answering the 8-fold-symmetry question with
90° — the natural mistake of dividing by 4 instead of 8), and 2
mid-plausibility distractors that are neither giveaways nor traps. Chance
alone drops to 20%. `quizContent.test.js` now asserts exactly 5 unique
options per question so this can't silently regress.

**Why:** calibrates the instrument between "too easy to guess" and "too
hard to discriminate real understanding from confident wrongness" — the
near-miss option is what actually does the discriminating.

## 5. Four questions added for pipeline understanding

**Before:** 12 questions covered the project's 9 named computational-thinking
concepts one-for-one, but two of `PROJECT_SPECIFICATION.md`'s stated Success
Criteria weren't actually tested: "understand the sequence of computational
operations within each algorithm" and "explain the role of individual
computational stages." The original items test whether a learner can define
a concept in the abstract, not whether they can read an actual pipeline.

**After:** 4 more items (`workflow-sequence`, `seed-stage-role`,
`lattice-index-role`, `rings-mode-stage`), grounded in the verified stage
sequences in `docs/nodes/WORKFLOWS.md` (Perlin Noise, Grid Tessellation,
Wave/Rings) rather than invented workflows. 16 questions total.

## 6. Waiting-room protocol for shared-device sessions

Where multiple participants share a laptop (the control cohort, and the
random-participant cohort in the mock scenario), participants waiting their
turn do not watch an earlier participant's session. For the app-exploring
cohort this prevents incidental exposure to the app before their own
pre-quiz baseline; for the control cohort it prevents incidental exposure
to the quiz questions themselves. This is a procedural rule, not a code
change — state it explicitly in the real study's methods section rather
than leaving it as an unstated assumption about how shared-device sessions
were run.

## 7. Net-effect comparisons require a matched baseline

Building the mock dashboard's "net effect" figure surfaced a rule that
wasn't obvious in advance: subtracting a control cohort's gain from a
treatment cohort's gain only isolates the app's effect when the two cohorts
start from a comparable pre-test mean. A cohort with a structurally
different baseline for an unrelated reason (e.g. CS students' prior
programming knowledge) can't be net-effected against the control the same
way — the difference in their gains reflects prior knowledge, not app
exposure. Report a net-effect estimate only between cohorts with
similar pre-test means, and state that limit explicitly.

## 8. How to analyse the real results

Read against the specific dry-run numbers in `evaluation-dry-run.html`
(seeded random draw: CS 11.4→12.4, random participants 6.2→7.8, control
6.2→6.4), not as abstract advice:

- **Report descriptive statistics only — no significance test.** n=5 per
  cohort (n=10 treatment total) is far below what a paired t-test or
  Wilcoxon needs to mean anything. State means, individual deltas, and
  ranges; don't attach a p-value to this sample size even if software will
  happily produce one.
- **Expect and name the ceiling effect in the CS cohort.** In the dry run
  the CS mean moves +1.0 — real movement, but less than the random
  cohort's +1.6, because there's less headroom left near the top of the
  scale. A smaller CS gain isn't evidence the app works less well for that
  group; it's evidence they had less room to demonstrate a gain on this
  instrument.
- **The random-participant cohort's mean gain is the more informative
  number, but watch its spread, not just its mean.** In the dry run gains
  range from +1 to +3, all positive — that every participant gained
  something is a property of that particular draw, not a guarantee. A real
  run could easily include a participant who loses ground. Report whatever
  spread actually shows up rather than expecting a uniformly positive
  cohort as the default outcome.
- **Don't assume the control group drifts upward — model it as noise, not
  a small gain.** With no intervention and no feedback, most items should
  land the same both times (confident answers repeat); the only real
  movement is on items a participant was genuinely unsure of, where
  re-guessing or reconsidering an answer is close to an independent draw
  and can go either way. In the dry run the control deltas are a mix of
  flat and ±1 (mean +0.2), not a uniform gain. If a real control group
  comes back uniformly positive, that itself is worth a second look — some
  scatter in both directions is the expected signature of pure retest
  noise.
- **Only subtract the control baseline from the cohort it's matched to.**
  A control group's mean gain is only directly comparable to a treatment
  cohort's when both start at the same pre-test mean — net effect ≈
  treatment gain minus control gain, only under that condition. It is not
  comparable to a cohort with a structurally different baseline (e.g. the
  CS cohort's prior knowledge); don't subtract across cohorts with
  different baselines and call it a net effect (see §7 above).
- **Treat "which concept gained the most" as noisy at this sample size,
  not a stable finding.** A flat total score can hide a concept that moved
  a lot and one that didn't move at all — genuinely useful to pull apart.
  But which concept looks like the biggest mover changed between two runs
  of the same mock model: one draw had Symmetry/Emergence/Parameterisation
  leading, another had Computational creativity and Sequence of operations
  leading instead. At n=10, one or two participants' answers on a
  one-or-two-item concept can flip the ranking entirely — pull the
  per-concept breakdown, but hold any claim about which concepts the app
  teaches best a lot more loosely than the total-score claim.

## 9. Evaluation menu restructured; the quiz itself renamed to "Test"

**Before:** a single "Evaluation" button in the menu bar opened the pre/post
quiz directly, and the quiz overlay's own heading read "Evaluation" too —
the umbrella name and the specific instrument were the same word.

**After:** "Evaluation" is now a dropdown with three items:

- **Test** — the actual pre/post quiz a participant takes (what the button
  used to open directly; `EvaluationOverlay.jsx`'s intro heading is now
  "Test" to match).
- **Dry Run** — opens `evaluation-dry-run.html` in a new tab.
- **Study Results** — opens `study-results.html` in a new tab; now populated
  with the real 15-participant study's results, in the same visual shape
  the dry run uses.

Both pages are canonical in this folder (`docs/evaluation/`) and served to
the running app from `src/app/public/evaluation/` — Vite serves anything in
`public/` as a static file, so the menu's links resolve whether the app is
running via the dev server or a production build. The two copies are kept
in sync by hand; each file's own header comment says so.

Component/file names (`EvaluationOverlay.jsx`, `evaluationStorage.js`)
weren't renamed — only the user-facing label and heading text changed, to
keep the diff to what's actually visible to a participant or examiner.

## 10. The quiz overlay blurs the app behind it

**Before:** `.eval-overlay` dimmed the app behind the quiz panel with a
semi-transparent dark background (`rgba(17, 24, 39, 0.6)`) — legible enough
that a participant could still make out the canvas and workflow behind it
while answering.

**After:** added `backdrop-filter: blur(8px)` (with the `-webkit-` prefix
for Safari) to the same overlay. The app is now genuinely illegible behind
the quiz, not just darkened — a participant can't glance at whatever
pattern or workflow was on screen for a hint while answering a question
about it.

---

## Using this in the dissertation

- **Methodology chapter:** describe this as validating the recording and
  analysis pipeline against simulated data *before* real data collection —
  a legitimate pre-registration-style practice, and the honest source of
  the design decisions above (found through the dry run, not designed
  perfectly from the start).
- **Figures:** `evaluation-dry-run.html` in this folder can be opened in a
  browser and screenshotted for a methodology-chapter figure, captioned
  clearly as simulated/dry-run data — never presented alongside or styled
  like the real Results chapter's figures.
- **Once real data exists:** the same dashboard's `participantMeta` array
  (or a version driven directly by the real exported JSON records) is the
  template for the actual Results chapter's charts — same stat tiles, slope
  chart, per-concept breakdown, net-effect calculation, real numbers.
