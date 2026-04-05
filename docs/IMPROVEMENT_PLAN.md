# ForIra - Hindi Learning App: Improvement & Bug Fix Plan

> A fun Hindi learning app built for Ira, covering alphabet, barakhadi, vocabulary quizzes, and games.

---

## Project Overview

| Property | Detail |
|---|---|
| Framework | React Native + Expo (SDK 53) |
| Navigation | expo-router (file-based, tabs + stack) |
| Audio | expo-av |
| Animations | lottie-react-native, react-native-reanimated |
| Language | TypeScript (with some .js files remaining) |
| Target | Children learning Hindi |

---

## Current Feature Status

| Feature | Tab | Status |
|---|---|---|
| Learn Vowels & Matras | Learn | Working |
| Learn Consonants | Learn | Working |
| Learn Vowels | Learn | Working |
| Barakhadi Browser | Learn | Working (TTS fallback added for missing MP3s) |
| Trace Letters | Learn | Working |
| Days of the Week | Learn | Working |
| Unicorn Color Quiz | Quiz | Working |
| Fruit Quiz | Quiz | Working |
| Number Quiz | Quiz | Working |
| Pet Animals Quiz | Quiz | Working |
| Wild Animals Quiz | Quiz | Working |
| Shapes Quiz | Quiz | Working |
| Listen & Choose Quiz | Quiz | Working |
| Match Pairs Quiz | Quiz | Working |
| Days of Week Quiz | Quiz | Working |
| Match Games (5 variants) | Game | Working |
| Memory Flip Game | Game | Working |
| Matra Game | Game | Working |
| Word Builder | Game | **✅ Implemented (2026-04-05)** |
| Quick Tap | Game | **✅ Implemented (2026-04-05)** |

---

## Bug Fixes (Priority Order)

### P1 — Critical (Fix First)

#### BUG-001: Audio Memory Leaks — ✅ DONE (2026-04-05)
- **File:** `app/screens/UnicornFruitQuizScreen.tsx`
- **Fix applied:** Replaced state-based `Audio.Sound` management with `useRef` so the cleanup
  `useEffect` always holds the current sound object (fixes the stale closure bug). Added proper
  `mounted` flag to handle unmount-before-load-completes race condition.
- **Pattern:** Use `useRef<Audio.Sound | null>(null)` for all sound objects; null refs in cleanup.

#### BUG-002: Stale Sound Reference in Quiz Screens
- **File:** `app/screens/UnicornNumberQuizScreen.tsx` (line ~63), similar pattern in other quiz screens
- **Problem:** `useEffect` dependency arrays are missing sound-related variables, causing stale closure references. The wrong audio may play after rapid navigation.
- **Fix:** Audit all `useEffect` hooks that play sounds. Add sound-related state variables to dependency arrays or use `useCallback` with proper deps.
- **Status:** Partially addressed in UnicornFruitQuizScreen via BUG-001 fix. Remaining screens to audit.

#### BUG-003: Missing Barakhadi Sounds — ✅ DONE (2026-04-05)
- **File:** `app/screens/BarakhadiScreen.tsx`
- **Fix applied:** Integrated `react-native-tts` (already in package.json) as fallback when no MP3
  exists for a syllable. TTS uses Hindi locale (`hi-IN`), rate 0.4, pitch 1.1. Tiles without a
  recorded MP3 show a dashed border + "TTS" badge so the gap is visually clear.
- **Note:** MP3s still only cover क, ख, ग, घ, ङ. Incrementally adding MP3s for remaining 31
  consonants will automatically replace TTS without any code change (the `hasBarakhadiSound` check
  handles the switch).

#### BUG-004: Inconsistent Router Path Formats — ✅ DONE (2026-04-05)
- **Files fixed:** `app/(tabs)/Learn.tsx`, `app/(tabs)/Quiz.tsx`
- **Fix applied:** All `router.push('../screens/…')` calls changed to `router.push('/screens/…')`
  (absolute paths). `app/(tabs)/Game.tsx` was already using absolute paths.

---

### P2 — Important (Fix Soon)

#### BUG-005: No Error Handling for Missing Audio/Image Assets — ✅ DONE (2026-04-05)
- **File:** `app/helpers/audioHelpers.ts`
- **Fix applied:** `console.warn` now fires (with error detail) when audio playback fails, instead
  of silently swallowing the exception.

#### BUG-006: Quiz Data Regenerated on Every Render — ✅ DONE (2026-04-05)
- **File:** `app/screens/UnicornFruitQuizScreen.tsx`
- **Fix applied:** Shuffled options wrapped in `useMemo` keyed on `currentQuestion`. Also removed
  the redundant `generateOptions` calls inside `handleAnswer` — `useMemo` reacts to state change
  automatically.
- **Status:** Applied to UnicornFruitQuizScreen. Other quiz screens should be updated using the
  same pattern as they are touched.

#### BUG-007: `any` Types Weakening Type Safety — ✅ DONE (2026-04-05)
- **Files fixed:** `app/(tabs)/Game.tsx`, `app/(tabs)/Learn.tsx`, `app/(tabs)/Quiz.tsx`
- **Fix applied:** Replaced `router: any` with `type Router = ReturnType<typeof useRouter>` and
  typed the tiles array with an explicit interface instead of inline `any`.

---

### P3 — Nice to Have (Polish)

#### BUG-008: No Loading Indicator During Audio Fetch
- Some sounds take a moment to load. The button gives no feedback, causing children to tap repeatedly and queue multiple sounds.
- **Fix:** Disable play button and show a spinner while `Audio.Sound.createAsync()` is loading.
- **Status:** Pending.

#### BUG-009: Inconsistent `.js` and `.tsx` File Extensions
- Some screens are `.js` (e.g., `LearnScreen.js`) and others are `.tsx`. This is inconsistent and prevents TypeScript checking on the `.js` files.
- **Fix:** Gradually rename `.js` screens to `.tsx` and add proper type annotations as they are edited.
- **Status:** Pending.

---

## New Features (Roadmap)

### FEATURE-001: Word Builder Game — ✅ IMPLEMENTED (2026-04-05)
- **File:** `app/screens/WordBuilderScreen.tsx`
- **Implemented:** Player sees an emoji + English hint for a Hindi word, then taps shuffled letter
  tiles in the correct order to build the word. Correct answer plays a celebration animation + sound;
  wrong answer shakes the card + plays wrong sound and resets the slots. 10 words total; score
  shown throughout. Tap a filled slot to remove a letter.
- **Data:** 10 simple 2-letter Hindi words defined inline in the screen.
- **Uses:** `SoundManager` (REFACTOR-002).

### FEATURE-002: Quick Tap Game — ✅ IMPLEMENTED (2026-04-05)
- **File:** `app/screens/QuickTapScreen.tsx`
- **Implemented:** A target Hindi letter is shown; player must tap it from a 2×2 grid of options
  before the timer runs out. 10 rounds; timer shortens by 150 ms per consecutive correct answer
  (floor: 1200 ms). Colour-coded timer bar (green → orange → red). 3-second get-ready countdown.
  Final result screen with emoji rating. Uses letters from `hindiConsonants` + `hindiVowels`.
- **Uses:** `SoundManager` (REFACTOR-002).

### FEATURE-003: Progress Tracking & Achievements
- **Priority:** Medium
- **Description:** Save learning progress locally so Ira can see what she has learned and earn badges.
- **Implementation:**
  - Use `@react-native-async-storage/async-storage` to persist:
    - Letters/words seen in Learn mode
    - Quiz best scores
    - Game high scores
  - Add a simple "Progress" screen or badge display on the home tabs
- **Badges ideas:** "Vowel Master", "Consonant Champion", "Barakhadi Explorer", "Quiz Unicorn"
- **Status:** Pending.

### FEATURE-004: Extend Barakhadi to All Consonants — ✅ DONE via TTS (2026-04-05)
- See BUG-003 above. TTS covers all consonants immediately. Incrementally add MP3 files as they
  are recorded — the code will prefer MP3 over TTS automatically.

### FEATURE-005: Streak & Daily Practice Reminder
- **Priority:** Low
- **Status:** Pending.

### FEATURE-006: Parental Dashboard
- **Priority:** Low
- **Status:** Pending.

### FEATURE-007: Dark Mode / Night Mode
- **Priority:** Low
- **Status:** Pending.

---

## Code Quality Improvements

### REFACTOR-001: Consolidate Duplicate Quiz Logic
- All 9 quiz screens share ~80% of the same logic (state, scoring, sound, navigation).
- **Plan:** Extract a `useQuiz(questions, options)` custom hook.
- **Status:** Pending.

### REFACTOR-002: Centralized Sound Manager — ✅ DONE (2026-04-05)
- **File:** `app/helpers/SoundManager.ts`
- **Implemented:** `SoundManager.play(source, cacheKey?)`, `preload`, `unload`, `unloadAll`, `stop`.
  - Stops any currently playing sound before starting a new one (prevents audio overlap).
  - Caches sounds by key so recurring SFX (correct/wrong) are not reloaded on every tap.
  - Auto-unloads one-shot sounds via `setOnPlaybackStatusUpdate`.
- **Used by:** `WordBuilderScreen`, `QuickTapScreen`.
- **Migration:** Other screens should migrate from direct `Audio.Sound` / `audioHelpers.ts` calls
  to `SoundManager.play()` as they are edited.

### REFACTOR-003: Shared Quiz Screen Component
- **Plan:** Create a generic `<QuizScreen categories={...} />` component.
- **Status:** Pending.

---

## Asset Gaps to Fill

| Category | Gap | Action |
|---|---|---|
| Barakhadi sounds | 31 of 36 consonants missing MP3s | TTS fallback in place; record MP3s incrementally |
| Word Builder data | 10 words inline in screen | Extend `hindiLetters.ts` as needed |
| Quick Tap data | Uses existing `hindiConsonants` + `hindiVowels` | Complete |
| Lottie animations | Limited celebration animations | Add 2-3 more celebration anims |

---

## Testing Checklist

Before each release, manually verify:

- [ ] All 12 vowels play correct audio in Learn Vowels screen
- [ ] All 36 consonants play correct audio in Learn Consonants screen
- [ ] Barakhadi screen plays sound (MP3 or TTS) for all combinations
- [ ] All 9 quizzes complete without crash
- [ ] Memory Flip game completes all 4 difficulty levels
- [ ] Matra Game plays and scores correctly
- [ ] Match Games work for all 5 categories
- [ ] Word Builder: all 10 words playable, correct/wrong feedback works
- [ ] Quick Tap: countdown, timer, scoring, and result screen all work
- [ ] Navigation back from every screen returns correctly
- [ ] App runs without console errors on fresh install
- [ ] Audio still works after device is muted and unmuted

---

## Suggested Work Order

1. ~~**BUG-001**~~ ✅ — Fixed audio memory leaks
2. ~~**BUG-004**~~ ✅ — Fixed router paths
3. ~~**BUG-003 + FEATURE-004**~~ ✅ — Barakhadi TTS fallback complete
4. ~~**FEATURE-001**~~ ✅ — Word Builder implemented
5. ~~**FEATURE-002**~~ ✅ — Quick Tap implemented
6. ~~**REFACTOR-002**~~ ✅ — SoundManager built
7. **FEATURE-003** — Add progress tracking (next priority)
8. **REFACTOR-001 + 003** — Clean up quiz duplication
9. **BUG-002, 008, 009** — Remaining bug fixes
10. **FEATURE-005, 006, 007** — Nice-to-have features

---

*Document created: 2026-04-05*
*Last updated: 2026-04-05 — Items 1–6 of work order completed*
*App version at time of review: based on commit d4f28d0 (Added Barakhadi)*
