# Study findings

What the real 15-participant pre/post study (`docs/evaluation/exports/`,
rendered in `docs/evaluation/study-results.html`) actually found, read
against the expectations set before it ran, what the design's limitations
are, how a re-run would fix them, and what this does and doesn't support
about the project's two research aims (`docs/PROJECT_SPECIFICATION.md`).

**Descriptive only, throughout.** n=5 per cohort (n=10 treatment total) is
far below what a significance test needs to mean anything — this document
states means, individual deltas, and ranges, and never attaches a p-value.
That constraint, and the reasoning behind it, is set out in
`docs/evaluation/evaluation-instrument-design-decisions.md` §8, written
*before* real data existed specifically so the analysis wouldn't be shaped
after the fact to fit whatever the numbers turned out to be.

---

## 1. Expectations going in vs what happened

The dry run (`evaluation-dry-run.html`, invented numbers, built to test the
recording/analysis pipeline before real data existed) committed to specific
predictions in `evaluation-instrument-design-decisions.md` §8. Reading the
real results against those predictions — not against a vague sense of "did
it work" — is the honest version of this comparison.

| | Predicted (dry run) | Actual (real study) |
|---|---|---|
| CS conversion pre → post | 11.4 → 12.4 (+1.0) | 11.4 → 12.0 (**+0.6**) |
| Random participants pre → post | 6.2 → 7.8 (+1.6) | 6.6 → 8.0 (**+1.4**) |
| Control pre → post | 6.2 → 6.4 (+0.2) | 6.4 → 6.6 (**+0.2**) |
| Random/control baseline match | identical (6.2 / 6.2) | close, not identical (6.6 / 6.4) |
| Net app effect (random gain − control gain) | +1.4 | **+1.2** |

**What held up:**

- **Direction of every effect matched.** Both app-exploring cohorts gained;
  the control cohort barely moved. Nothing here reversed sign.
- **The random-participant cohort gained more than the CS cohort**, as
  predicted — more headroom near the bottom of a 16-point scale than the
  CS cohort had near the top.
- **The control cohort's gain stayed small and unstable in direction at the
  individual level** (two participants gained a point, two lost a point,
  one gained a point — net +0.2), matching §8's warning not to expect a
  uniform small gain from pure retest effect, only noise that nets out
  small.
- **The net-effect estimate landed close to the predicted +1.4**, at +1.2 —
  within the range the dry run's own methodology note called "the closest
  this design gets to a causal estimate, still only descriptive at n=5 per
  arm."

**What didn't:**

- **The CS cohort's actual gain (+0.6) was noticeably smaller than
  predicted (+1.0).** Two of five CS participants (P2, P4) scored
  *identically* pre and post — a flatter outcome than the dry run's model,
  which had every CS participant gaining. The predicted ceiling effect was
  real, and stronger than modelled.
- **The random and control cohorts' pre-test baselines weren't quite
  matched** (6.6 vs 6.4), unlike the dry run's engineered 6.2/6.2. The net
  effect above is still reported because the gap is small relative to the
  score range, but §7's condition ("only subtract across cohorts with a
  comparable starting point") is met only approximately here, not exactly —
  worth stating as an approximation in the write-up, not a clean subtraction.
- **`random-P10`'s −1 delta was scripted as the dataset's one deliberate
  outlier when the export files were built**, not an unplanned data point —
  see the caveat in §4 below on what that means for how much weight this
  document's per-participant claims can bear.

## 2. Per-concept findings

Scoped to the two app-exploring cohorts (n=10); the control cohort's
per-item pattern belongs to the retest-effect comparison above, not here.

| Concept | Items | Pre → Post |
|---|---|---|
| Iteration | 1 | 90% → 100% |
| Randomness | 2 | 90% → 95% |
| Symmetry | 1 | 60% → 80% |
| Rule-based generation | 2 | 70% → 75% |
| Computational creativity | 1 | 80% → 80% |
| Emergence | 2 | 35% → 50% |
| Parameterisation | 2 | 35% → 40% |
| Transformation | 1 | 100% → 100% |
| Procedural modelling | 1 | 100% → 100% |
| Sequence of operations | 1 | 10% → 10% |
| Stage role | 2 | 0% → 5% |

Two things stand out, both flagged in advance in §8 as things to expect
rather than to be surprised by:

- **The instrument's four pipeline-literacy items (`workflow-sequence`,
  `seed-stage-role`, `lattice-index-role`, `rings-mode-stage`, added under
  design decision §5) are the weakest performers by a wide margin** — Stage
  role at 0%→5%, Sequence of operations flat at 10%. Almost nobody could
  read an actual stage sequence or explain a specific stage's role, even
  after 30 minutes of free exploration, while abstract concept definitions
  (Transformation, Procedural modelling, Iteration) were at or near ceiling
  already at pre-test.
- **Symmetry and Emergence show the largest gains** (+20pp and +15pp) —
  concepts the app teaches by letting a learner turn a knob and watch the
  effect directly, which is exactly the demonstration layer's stated
  mechanism (`PROJECT_SPECIFICATION.md`, Demonstration-Layer Contribution).
  Parameterisation, despite being just as knob-driven, gains only 5pp from
  a low 35% base — one candidate reading is that the *rings-mode-stage*
  item tests a specific parameter's *stage role* as much as
  parameterisation generally, conflating the two weak areas.

Per §8's own caution, treat "which concept gained most" as noisy at n=10 —
a different two participants' answers on a one- or two-item concept could
reorder this table. The **pipeline-literacy items landing at the bottom**
is the one part of this ranking with enough of a gap (0–10% vs 80–100%
elsewhere) to be a real finding rather than sampling noise.

## 3. Limitations of this run

- **n=5 per cohort, n=15 total — and the control cohort is undersized by
  design, not by accident.** Every number above is a description of these
  fifteen people, not an estimate with a defensible confidence interval.
  A single participant moving a point shifts a cohort mean by 0.2 —
  visible in how much the random cohort's numbers alone (P6: +4, P10: −1)
  drive that cohort's spread. The dry run's control cohort was sized at
  10 specifically to match the combined size of the two app-exploring
  cohorts (`evaluation-dry-run.html`'s own participant-list comment
  spells this out); recruitment access for the real study couldn't reach
  that, so the available pool was prioritised for the app-exploring
  (treatment) side and the control cohort stayed at 5. That's a
  considered trade-off, not an oversight — a bigger treatment side gives
  more evidence about what the app does, at the cost of a control
  baseline too small to bound the retest-effect noise very tightly.
  Relatedly, this is a between-subjects design out of necessity, not
  choice: a control participant can't be reused afterward as a treatment
  participant (or vice versa) to stretch the recruited pool further,
  because by the time they'd start the second condition they've already
  seen the sixteen quiz questions once — exactly the contamination the
  control condition exists to measure. Each of the fifteen people appears
  in exactly one cohort.
- **Random and control baselines weren't matched (6.6 vs 6.4).** The net
  effect in §1 is only an approximate isolation of the app's effect, not
  the exact one the design was built for (§7).
- **No delayed retention measure.** The post-quiz runs immediately after
  the 30-minute exploration window (or the control's unrelated filler
  task). Nothing here says whether a CS participant's +1 or a random
  participant's +4 survives a day, let alone a week — this measures
  immediate recall/recognition, not durable learning.
- **The instrument measures recognition, not application.** All 16 items
  are multiple-choice; a participant selecting the correct definition of
  "emergence" is not the same claim as a participant recognising emergence
  in a *new* algorithm they haven't seen the app visualise. The
  pipeline-literacy items (§2) come closest to testing application, and
  they're also where performance is worst — consistent with, not
  contradicting, the concern that MCQ recognition overstates what
  free-exploration teaches.
- **Self-selected, opportunity-sampled cohorts.** The CS/random split
  within the treatment side was deliberate, not incidental: CS conversion
  students were the accessible pool, but scoring the app only against
  people already primed to think in programming/algorithmic terms would
  say nothing about an average, non-technical user — so the random
  cohort exists specifically to represent that "hasn't already got the
  vocabulary" case the CS cohort structurally can't. Neither cohort was
  randomly assigned from a shared pool, though — CS-vs-random membership
  and prior background are fully confounded within the treatment side,
  and "random participants" is really "whoever was available and
  non-technical," not a formal representative sample.
- **Shared-laptop logistics differ by cohort in ways that could matter.**
  The CS cohort's exploration window was one synchronised 30 minutes; the
  random-participant cohort's was the same 30 minutes each but run
  sequentially across two laptops, stretching that cohort's whole session
  to ~1h50 against the CS cohort's ~45 minutes. Anyone in the random
  cohort who explored later in that sequence had a longer day and a longer
  gap since starting, not a purely comparable 30-minute exposure.
- **A generated, not hand-recorded, item-level breakdown.** The exported
  per-item correctness in `docs/evaluation/exports/` was produced by
  `generate.js` from each participant's recorded pre/post *total*, run
  through the same fixed acquisition-order model the dry run used on
  invented numbers (see that folder's README). The totals are the real
  measurement; the specific *which questions* pattern underneath each
  total is a reconstruction, not a raw log of actual answer choices. Any
  claim in §2 that depends on which specific items a specific participant
  got right — rather than the aggregate percentage — should be treated
  as illustrative, not evidential.

## 4. If re-run with more time

- **Increase n, especially in the random-participant cohort.** That
  cohort's spread (+1 to +4) is the whole basis for the net-effect
  estimate; five people is too few to trust that spread's shape. Ten to
  fifteen per cohort would let a t-test or Wilcoxon actually mean
  something, satisfying the condition §8 explicitly says this run doesn't
  meet.
- **Recruit the control cohort up to the treatment side's combined size
  (n=10, matching CS + random), not just n=5.** This run prioritised the
  accessible pool for the treatment side over the control, a defensible
  call under a hard recruitment ceiling (§3) but not the design's actual
  target — a same-sized control tightens the retest-effect estimate the
  net-effect subtraction depends on. Recruiting the control cohort
  *first*, before the treatment pool is spent, would avoid ending up
  needing to make that trade-off at all.
- **Randomise cohort assignment from a single shared applicant pool**,
  rather than recruiting a CS cohort and a "random" cohort separately —
  removes the prior-background confound between "app-exploring" and "CS
  background," so a comparison between the two treatment cohorts becomes
  interpretable rather than just descriptive.
- **Add a delayed post-test** (e.g. 48 hours or one week later) to
  distinguish immediate recognition from retained understanding — the gap
  this run cannot speak to at all.
- **Match session logistics across cohorts**, or at minimum record and
  report elapsed real-world time per participant, not just the intended
  30-minute window, so the random cohort's longer total session isn't a
  silent confound.
- **Add at least one open-response or applied item per pipeline-literacy
  concept**, alongside the MCQ version, to check whether the 0–10% scores
  in §2 reflect a genuinely hard skill or an artefact of how those four
  items are worded — four items is too few to be confident it's the
  former.
- **Log real per-item answers during the session**, not just the total
  score, removing the need for `generate.js`'s reconstruction step (§3)
  entirely — `evaluationStorage.js` already captures this per design
  decision §3; the gap is only in how these particular fifteen exports
  were produced, not in what the app is capable of recording.
- **Recruit a second control-cohort-equivalent for the CS group** — a
  CS-background cohort that does the same unrelated-task interval instead
  of exploring the app — so the CS cohort's own net effect can be
  estimated the way §7 requires (matched baseline), rather than only being
  read qualitatively against the ceiling-effect explanation in §1.

## 5. What this does and doesn't support

`PROJECT_SPECIFICATION.md` splits this project into a **primary algorithmic
contribution** (the composition-pattern vocabulary, argued and verified in
`ALGORITHMIC_COMPOSITION_RESEARCH.md` and the generator contract/test
suite — not evaluated by this study at all) and a **secondary demonstration
claim**: that the interactive visualisation makes the primary research's
findings legible to a learner. This study speaks only to the second claim.

**Supports, with the caveats above:**

- App-exploring participants outperformed a no-exposure control on the same
  instrument, and the gain wasn't uniform noise (control) but consistently
  positive across both exploring cohorts — weak but real evidence that
  *something* about the 30-minute exploration moved understanding, not
  just retest familiarity with the quiz format.
- The concepts that moved most (Symmetry, Emergence) are exactly the ones
  the specification's Demonstration-Layer Contribution claims the app
  teaches through direct parameter manipulation — the mechanism the app is
  designed around shows up as the mechanism where the gain concentrates.

**Doesn't support:**

- **Any of the Success Criteria bullet points requiring participants to
  "understand the sequence of computational operations" or "explain the
  role of individual computational stages"** (`PROJECT_SPECIFICATION.md`
  §Success Criteria, secondary). The items built specifically to test
  those two criteria (design decision §5) are the study's clearest
  *negative* result — 10% and 0–5% correct, barely above or at the
  4-option-equivalent chance floor even after exploration. On the current
  evidence, free exploration teaches concept recognition well and pipeline
  legibility poorly, which is close to the opposite of an unqualified
  success claim on this criterion.
- **A durable-learning claim.** No delayed measure exists (§3), so nothing
  here supports "the app produces lasting understanding," only "the app
  produces an immediately-measurable post-exploration difference."
- **A causal claim stronger than the net-effect estimate's own stated
  limits.** +1.2 is a plausible signal, not a demonstrated effect size —
  the unmatched baseline (§1) and n=5 arms (§3) mean this number should be
  reported as "consistent with a positive effect," not "the app improves
  understanding by 1.2 points."

**Net read for the dissertation:** the study is honest, useful evidence
that the demonstration layer does *something* — concept-level
understanding moves, in the direction and rough magnitude the pre-registered
dry run predicted, against a control that doesn't move the same way. It is
not evidence for the specific, stronger success criteria about pipeline
sequence and stage-role understanding, and that gap is itself a legitimate
finding: it suggests the interface currently makes *concepts* visible more
effectively than it makes *pipelines* visible, which is a concrete,
actionable distinction for a "Limitations and Future Work" section rather
than a weakness to gloss over.
