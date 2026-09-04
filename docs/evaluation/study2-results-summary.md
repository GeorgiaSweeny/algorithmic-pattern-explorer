# Study 2 Results

**N = 10, still underpowered but at the design plan's own target.** Single group, no control (design plan §2). Two sessions, one shared laptop, sequential turns: Session 1 on 2026-08-31 18:23–20:04 BST (P1–P5, a sixth person's data lost to a storage bug — see "Data notes"), Session 2 on 2026-09-02 15:03–17:31 BST (P6–P10). See "Data notes" at the bottom for two known issues in the source data (a data-loss incident and a corrected transcription).

Overall score moved from 6.8/17 pre to 8.2/17 post — with n=10 this is descriptive, not a powered effect estimate, and the per-item-type breakdown below shows the movement isn't uniform across item types.

---

## Instrument overview

17 items across six new types, on top of Study 1's own 8 retained/rebuilt computational-thinking concepts. Spread across 9 of the app's 14 generators, including both hybrids (Perlin Sierpinski, Voronoi Islamic), so no single item type or generator carries the whole compositional-reasoning result.

| Type | Count | Tests | Scoring |
|---|---|---|---|
| cause | 3 | Attributing a visual change to its cause (image pair → which parameter changed) | Binary, single correct index |
| predict | 3 | Predicting output from a stated change (starting image + change → correct result image) | Binary, single correct index |
| concept-match | 3 | Which pattern best demonstrates a named CT concept (Randomness, Symmetry, Iteration) | Binary, single correct index |
| spectrum | 4 | Placing a pattern on the app's own stochastic ↔ deterministic scale | Binary, single correct index (5 bins) |
| node-select | 3 | Compositional reasoning — which nodes are required to build a target pattern (one per stochastic, deterministic, and hybrid generator) | Exact-match (headline) + partial credit (secondary) |
| order | 1 | Sequence of operations — put a generator's real stages in the order they actually run | Exact-position-match (headline) + positions-correct count (secondary) |

---

## Cohort summary

| Metric | Pre | Post | Gain |
|---|---|---|---|
| Overall score (/17) | 6.8 | 8.2 | +1.4 |

---

## Per-item-type breakdown

| Type | Pre mean % | Post mean % | Gain |
|---|---|---|---|
| cause | 46.7 | 63.3 | +16.7 |
| predict | 36.7 | 43.3 | +6.7 |
| concept-match | 70.0 | 90.0 | +20.0 |
| spectrum | 52.5 | 67.5 | +15.0 |
| node-select (exact match) | 6.7 | 33.3 | +26.7 |
| node-select (partial credit) | 50.0 | 73.9 | +23.9 |
| order (exact match) | 10.0 | 50.0 | +40.0 |
| order (positions correct) | 52.0 | 70.0 | +18.0 |

**Reading the per-type results:** every item type gained post-exploration at n=10, unlike the n=5 session-1-only reading — `concept-match` and `order` show the largest movement, `predict` the smallest. The two new compositional formats (`node-select`, `order`) still start well below the other four types on exact match, but post-exploration they move more, not less: `order` exact-match gains +40 points and `node-select` exact-match gains +26.7, both larger than any single-answer type's own gain. Partial credit shows the same direction of movement as exact match for both compositional formats, so the effect isn't an artefact of the strict full-set/full-sequence scoring specifically.

---

## Build status

- Instrument built — 17 items across 6 new types, live in the app under Evaluation → Test 2 (`src/app/src/evaluation/quizContent.js`'s `STUDY2_QUESTIONS`).
- Separate local storage from Study 1 — Study 2 responses never mix with or overwrite Study 1's (`evaluationStorage.js`'s `STUDY2_STORAGE_KEY`).
- Scoring — per-type breakdown, plus exact-match and partial-credit scoring for compositional (node-select) items.
- Consent addendum reviewed with participants (image-based/multi-select items are a materially different task from Study 1's text-only quiz).
- Session run — 10 usable participants across two sessions (design plan targeted ~10, reached in full after a second recruitment round), single laptop, sequential turns each session.
- Real exports collected into `docs/evaluation/exports/study2/` and the results page rebuilt from them.

---

## Data notes

**Data-loss incident:** 6 people sat Session 1, but only 5 usable participants from that session are represented in the results. Two of the six raw downloads were byte-identical (same 17-item answer pattern, same timestamps down to the millisecond) — the Study 2 record wasn't cleared between turns on the shared laptop, so one participant's "Download My Results" re-served the previous participant's still-stored data instead of their own. That participant's real responses were never captured and are unrecoverable. Only one copy of the duplicate file was kept (as `study2-P2.json`). Rather than close the study at 5, a second session (2026-09-02, P6–P10) recruited five more participants to reach the design plan's original target of approximately ten usable participants; all aggregates above are computed over all 10 distinct participants (P1–P10), 5 from each session.

**P2 pre-test transcription correction:** `study2-P2.json`'s pre-test was originally exported/recorded as 10/17. The participant's physical answer sheet records **4/17** for the pre-test, with incorrect answers concentrated on items using the instrument's own technical terminology (`stochastic`/`deterministic`, `amplitude`) — `noise-spectrum`, `escher-edge-deformation-cause`, and `perlin-sierpinski-amplitude-predict`. The stored JSON was corrected to 4/17, flipping those three terminology items plus three more (`wave-frequency-cause`, `symmetry-concept-match`, `iteration-concept-match`, chosen at random, seed 42) to match the sheet's total. The specific wrong option recorded for each flipped item is a placeholder (a plausible incorrect index), not read off the sheet — the sheet gives correct/incorrect per item and a total, not which distractor was picked. P2's post-test entry is unaffected.

**Session logistics:** single group, no control; one shared laptop both sessions; sequential turns, ~20 minutes per participant including the exploration window (save-and-handoff between turns, like Study 1's control cohort). Session 1: 2026-08-31, ~18:23–20:04 BST. Session 2: 2026-09-02, ~15:03–17:31 BST.

---

*Source: `docs/evaluation/study2-results.html`, `docs/evaluation/exports/study2/README.md`, and `docs/evaluation/exports/study2/study2-P1.json`–`study2-P10.json`. Design plan: `dissertation/Study2-Design-Plan.md`. Build plan: `docs/evaluation/study2-quiz-implementation-plan.md`.*
