# ForIra
Learning and Fun

An Expo React Native app for teaching Hindi (letters, matras, words, and now
reading progression) with playful animation and light gamification.

## App structure

Four tabs: **Learn** (letters, barakhadi, weekdays), **Read** (word and
sentence reading progression, stories), **Quiz**, and **Game**.

### Read tab

- **Matra word levels** -- ten progressive levels, each built around one matra
  (vowel sign), with a learn phase (browsable word cards with audio and matra
  highlighting) and a practice phase (audio-prompted multiple-choice quiz).
  Levels unlock sequentially as accuracy targets are met, and completions earn
  stars and coins.
- **Stories** -- a list of short illustrated stories with page-by-page,
  word-by-word ("karaoke") read-along highlighting and a comprehension quiz at
  the end.
- **Sentence reading** -- planned; the entry tile exists but the reading
  screen behind it is not yet built (see `docs/features/reading-progression.md`).

### Rewards & avatar

Coins earned from reading activities can be spent in a cosmetic avatar shop
(hats, glasses, wings, backgrounds) -- purely cosmetic, no gameplay effect. An
animated SVG mascot reacts to correct/incorrect answers and level completions,
with confetti bursts on strong results. A dedicated Word Builder game has
drag-and-drop letter tiles to assemble words drawn from the matra level word
lists.

See `docs/features/reading-progression.md` for the architecture behind the
Read tab, the shared progress storage model, and known trade-offs/limitations.
