# IRA Hindi App — 2nd Standard Level-Up Design

## Overview

Ira is now in 2nd standard. The app currently teaches individual Hindi letters (vowels, consonants), matras, barakhadi (5 consonants), weekdays, and has themed quizzes and games. The core gap is **word and sentence reading practice** — the bridge from knowing letters to reading Hindi. This design adds a progressive reading system, curated stories, native animations, and an avatar reward system to keep her engaged.

## Goals

- Enable Ira to read Hindi words with matras, progressing from simple 2-letter words to full sentences
- Provide short, engaging Hindi stories with word-by-word reading support
- Add animated visual feedback (SVG mascot, confetti, transitions) using react-native-reanimated + SVG
- Motivate continued practice with an avatar customization reward system
- Complete existing stubs (Word Builder, full Barakhadi)

## Non-Goals

- Online features, user accounts, cloud sync, leaderboards
- Hindi typing/keyboard input
- Fully animated story scenes (Phase 2)
- AI-generated or dynamic content

---

## 1. Navigation & Tab Structure

### Current

3 tabs: Learn | Quiz | Game, plus an unused index home screen.

### Proposed

4 tabs:

| Tab | Icon | Purpose |
|-----|------|---------|
| Learn | `book` | Letters, Barakhadi, Weekdays (existing) |
| Read | `newspaper` | Word reading, sentence practice, stories (NEW) |
| Quiz | `help-circle` | All quizzes (existing) |
| Game | `game-controller` | All games (existing) |

The existing `index.tsx` home screen is replaced by the Read tab as the default landing tab. The tab layout in `app/(tabs)/_layout.tsx` gains a 4th entry. Read is placed second (after Learn) to reflect the learning progression: letters → words → quizzes → games.

A floating mascot badge appears in the top-right corner of all tabs, showing current streak count. Tapping it opens the Avatar screen.

---

## 2. Read Tab — Word Reading Progression

The Read tab displays tiles (same `tabTileStyles` pattern as other tabs) for three sub-sections:

### 2.1 Matra Word Levels

10 progressive levels, each focused on one matra. Levels unlock sequentially (80%+ accuracy on practice to unlock next).

| Level | Matra | Example Words |
|-------|-------|---------------|
| 1 | आ (ा) | काम, नाम, दाल, माल, राम, हाथ, चाय, बात |
| 2 | इ (ि) | दिन, किला, मिला, गिर, बिल, चिड़िया, तिल, हिल |
| 3 | ई (ी) | नदी, मछली, गली, पानी, रोटी, चीनी, बीज, सीता |
| 4 | उ (ु) | गुम, सुन, कुल, तुम, गुलाब, मुर्गा, पुल, बुक |
| 5 | ऊ (ू) | फूल, धूल, सूरज, झूला, चूहा, दूध, भूल, पूरा |
| 6 | ए (े) | पेड़, मेला, खेल, रेल, देश, शेर, केला, बेटा |
| 7 | ऐ (ै) | पैर, कैसा, बैल, तैरना, भैंस, मैदान, हैरान, वैसा |
| 8 | ओ (ो) | बोल, रोटी, गोल, मोर, तोता, सोना, खोल, धोबी |
| 9 | औ (ौ) | मौसम, कौन, चौक, फौज, दौड़, सौ, नौकर, कौआ |
| 10 | Mixed | Words combining multiple matras from all levels |

Each level has 8-10 words.

### 2.1.1 Level Screen Flow

**Learn Phase:**
- Full-screen card showing the word in large text
- The matra portion highlighted in a distinct color (e.g., the ा in काम highlighted orange)
- Related picture/illustration below the word
- Audio plays automatically on card appear; tap to replay
- Swipe left/right to navigate words
- Animated mascot visible in corner, does a small bounce on each new word

**Practice Phase (unlocks after viewing all words):**
- Audio plays a word → 4 word choices displayed as large tappable cards
- Tap correct → green flash + mascot happy jump + "+1" floating text
- Tap wrong → red shake + mascot sympathetic tilt + correct answer highlighted
- Minimum 5 questions, drawn randomly from the level's word set

**Completion:**
- Star rating: 0-3 stars based on accuracy (0-49% = 0, 50-69% = 1, 70-89% = 2, 90-100% = 3)
- Reanimated star fill animation + confetti burst on 2+ stars
- 80%+ accuracy (2+ stars) unlocks next level
- Coins earned: 5 per star
- Can replay any completed level for more stars

### 2.2 Sentence Reading

Unlocks after completing Matra Level 5.

**Content:** 20+ simple Hindi sentences, grouped by difficulty:

Group A (3-4 word sentences):
- राम घर जाता है।
- सीता फूल तोड़ती है।
- बिल्ली दूध पीती है।
- मोर नाचता है।
- कुत्ता भौंकता है।

Group B (5-6 word sentences, unlocks after completing Group A):
- राम और सीता खेलते हैं।
- माँ ने खाना बनाया।
- बच्चे बगीचे में खेलते हैं।
- गाय हरी घास खाती है।
- सूरज सुबह निकलता है।

**Screen flow:**
1. Sentence displayed with each word as a distinct tappable block
2. Tap any word → word highlights, audio speaks it, brief meaning shown below
3. Tap speaker icon → full sentence spoken with karaoke-style word-by-word highlighting (color interpolation via Reanimated)
4. After listening, a comprehension question appears: e.g., "कौन घर जाता है?" with 3 choices (राम / सीता / बिल्ली)
5. Correct answer → coins + mascot celebration
6. Progress through all sentences in a group to unlock the next group

### 2.3 Stories

Presented as a tile list showing story covers (title + small illustration + difficulty indicator).

**Phase 1 (this build): 5-6 curated short stories**

Each story is 4-8 sentences, using vocabulary from the matra levels. Examples:

1. **प्यासा कौआ** (The Thirsty Crow) — classic, simple vocabulary
2. **शेर और चूहा** (The Lion and the Mouse) — Panchtantra
3. **लालची कुत्ता** (The Greedy Dog) — moral story
4. **चतुर खरगोश** (The Clever Rabbit) — Panchtantra
5. **सच्चे दोस्त** (True Friends) — friendship theme

**Story screen:**
- One page at a time (1-2 sentences per page)
- Large text with word-by-word karaoke highlight synced to audio
- An illustration per page (static image or simple SVG scene)
- Swipe to next page, or auto-advance after audio finishes
- After the story: 2-3 comprehension questions (multiple choice)
- Completing a story earns 15 coins + a "story badge"

**Audio:** Pre-generated MP3s via Python TTS scripts for story narrations (one file per page). Individual word taps use device TTS as fallback.

**Story unlock progression:**
- Story 1: Available after Matra Level 2 (इ की मात्रा)
- Story 2: After Matra Level 4 (उ की मात्रा)
- Story 3: After Matra Level 6 (ए की मात्रा)
- Stories 4-5: After Sentence Reading Group A
- Story 6: After Sentence Reading Group B

**Phase 2 (future):** Animated story scenes using Reanimated — characters move across screen, objects animate on tap, parallax backgrounds, sound effects.

---

## 3. Animated Mascot & Avatar System

### 3.1 Mascot Design

An SVG unicorn character, tying into the existing unicorn quiz theme. Built with `react-native-svg` paths, animated with `react-native-reanimated`.

**SVG structure:** Head, body, horn, mane, tail, eyes, mouth — each as a separate SVG group so they can be animated independently.

**Animation behaviors:**

| State | Animation | Implementation |
|-------|-----------|----------------|
| Idle | Gentle floating up/down + slow breathing (scale) | `withRepeat(withSequence(withTiming(up), withTiming(down)))` |
| Correct answer | Happy jump + sparkle particles | `withSpring` vertical translate + opacity bursts |
| Wrong answer | Sympathetic head tilt + encouraging nudge | `withTiming` rotation on head group |
| Level complete | Dance (side-to-side sway) + confetti | Sequence of translate/rotate + particle system |
| Streak milestone | Special spin + rainbow horn glow | `withRepeat` full rotation + color interpolation |

### 3.2 Confetti System

20-30 SVG circle/rect particles animated with shared values:
- Random initial positions across top of screen
- Gravity (increasing translateY over time)
- Random horizontal drift
- Random colors from a cheerful palette
- Fade out as they reach bottom
- Duration: ~2 seconds

### 3.3 Avatar Customization Screen

Accessed by tapping the mascot badge (top-right corner on all tabs).

**Screen layout:**
- Large preview of the unicorn with current accessories at top
- Category tabs below: Hat | Glasses | Wings | Background
- Grid of items per category, each showing coin cost
- Owned items have a checkmark; equipped items have a gold border
- Coin balance displayed prominently

**Initial items (3-4 per category):**

| Category | Items | Cost |
|----------|-------|------|
| Hat | Crown, Flower, Bow, Party Hat | 20, 15, 10, 25 |
| Glasses | Star glasses, Heart glasses, Round glasses | 15, 15, 10 |
| Wings | Rainbow, Sparkle, Butterfly, Cloud | 30, 25, 20, 20 |
| Background | Garden, Space, Ocean, Rainbow | 20, 25, 20, 15 |

All cosmetic, no gameplay advantage.

### 3.4 Progress & Data Model

Stored in AsyncStorage under key `ira_progress`:

```json
{
  "levels": {
    "matra_aa": { "stars": 3, "bestScore": 100, "completed": true },
    "matra_i": { "stars": 2, "bestScore": 85, "completed": true },
    "matra_ii": { "stars": 0, "bestScore": 0, "completed": false }
  },
  "sentences": {
    "groupA": { "completed": 3, "total": 5 },
    "groupB": { "completed": 0, "total": 5 }
  },
  "stories": {
    "thirsty_crow": { "read": true, "quizScore": 3 },
    "lion_and_mouse": { "read": false }
  },
  "streak": {
    "current": 5,
    "lastPlayedDate": "2026-08-02",
    "longest": 12
  },
  "coins": 150,
  "totalStars": 42,
  "avatar": {
    "hat": "crown",
    "glasses": null,
    "wings": "rainbow",
    "background": "garden"
  },
  "ownedItems": ["crown", "rainbow", "garden", "star_glasses"]
}
```

**Coin economy:**
- Complete a matra level: 5 coins per star (max 15 per level)
- Complete a sentence group: 10 coins
- Complete a story: 15 coins
- Daily streak bonus: 5 coins per day
- Items cost 10-30 coins (she should be able to buy her first item after 2-3 levels)

---

## 4. Animation Technical Strategy

All new animations use `react-native-reanimated` (v3.17, already installed) + `react-native-svg` (v15.11, already installed). No new animation libraries needed.

### Patterns Used

| Animation | Technique |
|-----------|-----------|
| Mascot idle float | `useSharedValue` + `withRepeat(withSequence(withTiming))` on `translateY` |
| Mascot reactions | `withSpring` / `withSequence` on translate, scale, rotation |
| Star rating fill | `withTiming` on SVG path `strokeDashoffset` |
| Confetti | 20-30 `useSharedValue` pairs (x,y) with `withTiming` + gravity curve |
| Word highlight karaoke | `useAnimatedStyle` color interpolation synced to audio position |
| Level unlock | `withSequence(withTiming(shake), withSpring(scale))` on lock icon |
| Page transitions | `Animated.FadeIn` / `SlideInRight` layout animations |
| Card swipe | `react-native-gesture-handler` pan gesture + Reanimated `withDecay` |

### Component Architecture

New shared components:
- `components/Mascot.tsx` — SVG unicorn with animation hooks, accepts `mood` prop
- `components/Confetti.tsx` — particle burst, trigger via ref
- `components/StarRating.tsx` — animated 3-star display
- `components/WordCard.tsx` — word display with matra highlighting + audio
- `components/KaraokeText.tsx` — sentence display with word-by-word highlight synced to audio
- `components/AvatarPreview.tsx` — unicorn with equipped accessories

Existing Lottie `congrats.json` stays for backward compatibility on existing quiz screens.

---

## 5. Content & Audio Strategy

### Hybrid Audio Approach

| Content Type | Audio Source | Format |
|-------------|-------------|--------|
| Story narrations | Pre-generated via Python scripts (Google TTS) | MP3 per page |
| Key vocabulary words (matra level words) | Pre-generated via Python scripts | MP3 per word |
| Sentence reading (full sentences) | Pre-generated | MP3 per sentence |
| Individual word taps (fallback) | `react-native-tts` (device TTS) | Runtime |
| Practice quiz word audio | `react-native-tts` | Runtime |

### Content Data Files

New constants file: `app/constants/readingContent.ts`

```typescript
// Structure (not actual content — content populated during implementation)
export const matraLevels = [
  {
    id: 'matra_aa',
    matra: 'ा',
    vowel: 'आ',
    name: 'आ की मात्रा',
    words: [
      { word: 'काम', meaning: 'work', image: require('...'), sound: require('...') },
      // 8-10 words per level
    ],
    unlockAfter: null, // first level is free
  },
  // ... 10 levels
];

export const sentences = [
  {
    group: 'A',
    sentences: [
      {
        text: 'राम घर जाता है।',
        words: ['राम', 'घर', 'जाता', 'है'],
        sound: require('...'),
        question: { text: 'कौन घर जाता है?', options: ['राम', 'सीता', 'मोहन'], answer: 0 },
      },
    ],
    unlockAfter: 'matra_uu', // after level 5
  },
];

export const stories = [
  {
    id: 'thirsty_crow',
    title: 'प्यासा कौआ',
    cover: require('...'),
    unlockAfter: 'matra_i', // after level 2
    pages: [
      {
        text: 'एक कौआ बहुत प्यासा था।',
        words: ['एक', 'कौआ', 'बहुत', 'प्यासा', 'था'],
        image: require('...'),
        audio: require('...'),
      },
    ],
    questions: [
      { text: 'कौन प्यासा था?', options: ['कौआ', 'शेर', 'चूहा'], answer: 0 },
    ],
  },
];
```

### Asset Generation

Extend existing Python TTS scripts to generate:
- `assets/sounds/words/` — one MP3 per matra-level word (~80 files)
- `assets/sounds/sentences/` — one MP3 per sentence (~20 files)
- `assets/sounds/stories/` — one MP3 per story page (~30 files)

New images needed:
- `assets/images/words/` — simple illustrations for matra words (can use emoji or simple SVGs initially)
- `assets/images/stories/` — one illustration per story page
- `assets/images/avatar/` — SVG accessory pieces

---

## 6. Existing Feature Improvements

### 6.1 Complete Barakhadi

Currently only 5 consonants (क ख ग घ ङ). Expand `barakhadi` array in `hindiLetters.ts` to cover all 36 consonants. The screen already handles dynamic consonant selection via horizontal scroll — just needs data.

### 6.2 Implement Word Builder

Replace the "Coming soon" stub in `WordBuilderScreen.tsx` with a real game:
- Show a target word (with picture + audio)
- Display scrambled individual letters/matras as draggable tiles
- Drag letters into correct order to build the word
- Uses `react-native-gesture-handler` for drag + Reanimated for snap animations
- Pulls words from the matra levels data

---

## 7. File Structure (New Files)

```
app/
  (tabs)/
    Read.tsx                          # New Read tab
    _layout.tsx                       # Updated: 4 tabs
  screens/
    MatraLevelScreen.tsx              # Matra word learn + practice
    SentenceReadingScreen.tsx         # Sentence reading with karaoke
    StoryListScreen.tsx               # Story selection grid
    StoryScreen.tsx                   # Individual story reader
    AvatarScreen.tsx                  # Avatar customization
  constants/
    readingContent.ts                 # Matra words, sentences, stories data
    avatarItems.ts                    # Avatar shop items and costs
  hooks/
    useProgress.ts                    # AsyncStorage read/write for progress
    useCoins.ts                       # Coin balance management
    useStreak.ts                      # Daily streak tracking
components/
  Mascot.tsx                          # SVG unicorn with animations
  Confetti.tsx                        # Particle confetti burst
  StarRating.tsx                      # Animated star display
  WordCard.tsx                        # Word with matra highlight + audio
  KaraokeText.tsx                     # Word-by-word sentence highlight
  AvatarPreview.tsx                   # Unicorn with equipped items
  MascotBadge.tsx                     # Floating corner badge (streak + tap to avatar)
assets/
  images/words/                       # Word illustrations
  images/stories/                     # Story page illustrations
  images/avatar/                      # SVG accessory pieces
  sounds/words/                       # Pre-generated word audio
  sounds/sentences/                   # Pre-generated sentence audio
  sounds/stories/                     # Pre-generated story narration audio
```

---

## 8. Implementation Phases

### Phase 1a: Core Reading (highest priority)
- Read tab + navigation update
- `readingContent.ts` data for all 10 matra levels
- `MatraLevelScreen` (learn + practice flow)
- Progress hooks (`useProgress`, `useCoins`, `useStreak`)
- Basic star rating animation
- Audio: device TTS for all words initially

### Phase 1b: Mascot & Rewards
- `Mascot.tsx` SVG + idle animation
- Mascot reactions (correct/wrong/complete)
- `Confetti.tsx` particle system
- `MascotBadge.tsx` floating badge on all tabs
- `AvatarScreen.tsx` with shop

### Phase 1c: Sentence Reading
- `SentenceReadingScreen.tsx`
- `KaraokeText.tsx` component
- Sentence content data
- Comprehension questions

### Phase 1d: Stories
- `StoryListScreen.tsx` + `StoryScreen.tsx`
- Story content (text + comprehension questions)
- Word-by-word highlight + audio sync
- Story illustrations (placeholder SVGs or simple images initially)
- Pre-generate story audio via Python scripts

### Phase 1e: Existing Improvements
- Complete Barakhadi (all 36 consonants)
- Implement WordBuilder with drag-and-drop
- Pre-generate word audio files via Python scripts

### Phase 2 (Future)
- Animated story scenes with Reanimated (characters moving, objects animating)
- More stories
- More avatar items
- Expanded sentence library
- Monthly content packs
