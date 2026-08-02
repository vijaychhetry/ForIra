# Reading Progression System

This document describes the durable architecture of the Hindi word/sentence/story
reading system that lives behind the Read tab, so future contributors understand
the data model and component patterns without having to reverse-engineer them.

## Tab structure

The app has four tabs: Learn, Read, Quiz, Game, in that order. Read sits second
(after Learn, before Quiz) to reflect the intended learning progression: letters
-> words -> quizzes -> games. The Read tab itself is a tile launcher (same
`tabTileStyles` pattern used by the other tabs) pointing at three sub-sections:
Matra Words, Sentence Reading, and Stories. A tile is allowed to exist before its
target screen does; in that case tapping it lands on the router's not-found page
rather than crashing, which is an acceptable intermediate state while a
sub-section is still being built out.

## Progress storage model

All reading/gamification progress (matra level stars, sentence group completion,
story completion, streak, coins, avatar loadout, owned shop items) is persisted
under a **single shared AsyncStorage key** rather than one key per feature. The
hooks (`useProgress`, `useCoins`, `useStreak`) all read/write through this shared
blob, merging their slice on top of whatever is already stored. This means:

- Any new feature that needs persisted state should extend the shared progress
  shape and merge its defaults on load (see the `loadProgressData` merge
  pattern), not introduce a new storage key.
- Because loads always merge onto `DEFAULT_PROGRESS_DATA`, old saved data missing
  newer fields (e.g. a fresh field added by a later feature) will not crash --
  it will just get the default for that field. This is what makes the schema
  additive-safe across app updates.

## Matra level progression

- Ten levels, each scoped to one matra (vowel sign), plus a final "mixed" review
  level. Level order is an explicit ordered id list (not inferred from array
  order), because unlock logic walks that list to find "the previous level."
- A level has a **learn phase** (browse all words, matra glyph highlighted,
  audio on tap/auto-play) and a **practice phase** (audio-prompted 4-choice
  quiz). Practice is unlocked only after the learn phase has been viewed.
- Star rating (0-3) is accuracy-banded: 0/50/70/90 percent thresholds.
- **Important non-obvious invariant:** the accuracy required to *unlock the next
  level* (80%) is higher than the accuracy required to earn 2 stars (70%). A
  child can therefore complete a level with 2 stars and still be locked out of
  the next one. This is intentional (it pushes toward mastery, not just a
  passing score) but is easy to mistake for a bug when reading the star
  thresholds in isolation -- the two thresholds are deliberately different
  constants and should stay that way unless the design changes.
- Coins are awarded per star (a fixed amount each), so total reward scales with
  quality of performance, not just completion.

## Animation & component patterns

All new animated UI uses `react-native-reanimated` + `react-native-svg`; no new
animation library was introduced (Lottie is kept only for pre-existing quiz
screens, for backward compatibility, not for new work). The conventions
established:

- **Mascot**: an SVG character built from independently-animatable groups
  (head, body, horn, mane, tail, eyes, mouth), driven by a `mood` prop with a
  small fixed set of states (idle, happy, sad, celebrate). Each mood maps to a
  distinct shared-value animation sequence (float, bounce+sparkle,
  tilt+droop, sway) rather than one generic "play animation" call. New moods
  should follow this same one-state-one-sequence pattern rather than
  parameterizing a single animation.
- **Confetti**: a fire-and-forget particle burst, triggered imperatively via a
  ref (`burst()`), not via a prop toggle. Each particle is an independent
  shared-value pair with randomized color/size/drift/delay/spin, computed once
  per burst. This ref-trigger pattern (rather than mounting/unmounting the
  component) is what lets it be layered over arbitrary screens without them
  needing to manage confetti lifecycle state.
- **Karaoke text**: word-by-word highlight is done via Reanimated color
  interpolation keyed to playback position/tap, with each word independently
  tappable for a spoken definition/replay. This same component is reused for
  both sentence-reading and story-page display -- it is not sentence-specific.
- **Star rating**: an animated fill (not a static icon swap), so earning stars
  reads as a rewarding event rather than a state change.

## Word Builder (drag-and-drop)

Word Builder pulls its word pool from the matra levels' word data (so content
stays in one place) rather than maintaining its own word list, and uses
`react-native-gesture-handler` tiles with Reanimated snap-back/snap-into-place
animations rather than a tap-to-select interaction. **Known limitation:** word
splitting for the drag tiles uses JavaScript's code-point iteration
(`Array.from(word)`), which is correct for simple consonant + independent-matra
sequences but does not guarantee correct segmentation for all Hindi grapheme
clusters (e.g. certain conjuncts). It works for the current curated word set;
if Word Builder's word pool is ever extended with more complex conjunct words,
this splitting logic needs to move to grapheme-cluster-aware segmentation
rather than raw code points.

## Avatar / rewards economy

Coins are earned through the reading features (per-star on level completion,
flat per-group/per-story rewards) and spent in a cosmetic-only shop (hats,
glasses, wings, backgrounds) with no gameplay effect. Ownership and equip state
are tracked as two separate concerns in the shared progress blob (`ownedItems`
list vs. per-category `avatar` loadout), which lets "owned but not equipped"
and "equipped" be independent states without needing a separate purchase
history.

## Content data conventions

Reading content (matra words, and eventually sentences/stories) lives in a
single constants file per content type, described with plain data structures
(id, display fields, and an explicit `unlockAfter` predecessor id) rather than
being derived from array position. Audio and imagery for this content is
currently backed by device text-to-speech and emoji placeholders; the data
shapes were designed so that swapping in pre-generated audio files and real
illustrations later is a data-only change (populating asset fields), not a
component rewrite.

## Known incomplete areas at time of writing

Two pieces of the original design were left unimplemented when this system was
last worked on, and the tiles/graph structure already reflect this so it is
easy to pick back up:

- A floating streak-count badge meant to appear on every tab (tap-through to
  the avatar/shop screen) was not built. The mascot component it depends on
  exists; the badge wrapper does not.
- A dedicated sentence-reading screen (karaoke-highlighted sentences with a
  comprehension question, gated behind matra-level and sentence-group
  progress) was not built, even though the underlying karaoke text component
  and the Read tab's tile pointing at it both exist. The tile currently routes
  to a non-existent screen and falls through to the app's not-found page
  rather than crashing.

Both gaps are self-contained: the reusable pieces they depend on (mascot,
karaoke text, progress hooks) are already in place, so completing them is
additive work rather than architectural rework.
