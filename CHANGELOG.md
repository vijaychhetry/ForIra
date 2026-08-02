# Changelog

## 2nd standard level-up: reading progression, mascot, avatar shop, stories

This sprint set out to add a Read tab with progressive Hindi word/sentence
reading, an animated SVG mascot with confetti feedback, and a cosmetic avatar
reward system on top of the existing Learn/Quiz/Game tabs. The Read tab and
its navigation, the full ten-level matra word reading system (learn + practice
phases, star ratings, sequential unlocking, coin rewards, AsyncStorage-backed
progress), a story reader with page-by-page karaoke highlighting and
comprehension quizzes, an avatar customization shop, and a rebuilt drag-and-drop
Word Builder game were all completed and verified. The animated mascot and
confetti components were built, but the floating streak badge that was meant
to surface the mascot on every tab was not. Sentence reading's karaoke text
component was built, but the dedicated sentence-reading screen behind the
Read tab's tile was not, so that tile currently falls through to the app's
not-found page instead of a working screen. Both gaps are additive follow-up
work rather than architectural rework, since the components they depend on
already exist.

#### Sprint cost analysis
Calibration: defaults   Cycles: estimated 1.5, actual 2

| Role       | Est tokens | Act tokens |   D%   | Est USD  | Act USD  |
|------------|------------|------------|-------|----------|----------|
| doer       |     38,700 |    197,361 | +410% |   $0.698 |   $3.337 |
| reviewer   |     15,480 |     26,727 |  +73% |   $0.283 |   $0.586 |
| overhead   |      7,150 |    188,505 | +2536% |   $0.121 |   $2.015 |
| TOTAL      |     61,330 |    412,593 | +573% |   $1.101 |   $5.938 |
True-cost estimate (output x 4x): $4.403

Outliers (>200% variance): doer, overhead
Calibration failures (>500%): overhead

### Delivered

- Read tab added as the 2nd tab (Learn, Read, Quiz, Game), with tiles for
  Matra Words, Sentence Reading, and Stories.
- Ten matra word reading levels with learn phase (navigable word cards, matra
  highlighting, text-to-speech) and practice phase (audio-prompted 4-choice
  quiz), star ratings, sequential unlocking, and coin rewards.
- Story list and story reader screens with page-by-page karaoke-highlighted
  text and end-of-story comprehension quizzes, gated by star-based unlocks.
- Avatar customization shop: category browsing, coin-based purchases,
  equip/unequip, live mascot preview.
- Animated SVG mascot with four mood-based animation states, and a confetti
  particle-burst component.
- Shared AsyncStorage-backed progress hooks (`useProgress`, `useCoins`,
  `useStreak`) underlying levels, stories, coins, streak, and avatar state.
- Word Builder game rewritten as a drag-and-drop letter-tile game drawing its
  word pool from the matra level data.
- Static verification scripts for Read tab navigation/tile routing and for
  the end-to-end matra level reading flow, both passing in full.

### Carried forward / not yet complete

- Floating streak-count mascot badge on all tabs (and its tap-through to the
  avatar screen) is not built.
- The dedicated sentence-reading screen (karaoke-highlighted sentences with a
  comprehension question, gated by matra-level and sentence-group progress)
  is not built; sentence content data is also not yet added. The Read tab's
  Sentence Reading tile currently routes to the app's not-found page.
- Full Barakhadi coverage (all consonants) and other pre-existing stub
  completions noted in the design spec remain open for a future sprint.

See `docs/features/reading-progression.md` for the durable architecture and
trade-offs behind this work.
