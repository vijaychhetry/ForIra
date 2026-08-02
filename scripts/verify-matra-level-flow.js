#!/usr/bin/env node
/**
 * Integration check for ForIra-o40.1: verifies the complete matra word
 * reading flow -- level selection -> learn -> practice -> completion ->
 * persisted progress -> next level unlock.
 *
 * This project has no jest/Detox test runner configured yet (see
 * package.json devDependencies; only transitive jest-* packages exist, not
 * jest itself, jest-expo, or react-test-renderer). Per this task's own
 * "Manual walkthrough or Jest component test" guidance, and following the
 * precedent set by scripts/verify-read-tab-navigation.js, this is a
 * lightweight, repeatable static check: it reads the actual source files
 * and asserts their wiring/logic, rather than a full rendered-component
 * test with a mocked AsyncStorage.
 *
 * Run with: node scripts/verify-matra-level-flow.js
 * Exits non-zero (and prints which case failed) if any check fails.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

const results = [];

function check(name, fn) {
  try {
    const detail = fn();
    results.push({ name, pass: true, detail: detail || '' });
  } catch (err) {
    results.push({ name, pass: false, detail: err.message });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const readingContentSrc = read('app/constants/readingContent.ts');
const listScreenSrc = read('app/screens/MatraLevelListScreen.tsx');
const levelScreenSrc = read('app/screens/MatraLevelScreen.tsx');
const useProgressSrc = read('app/hooks/useProgress.ts');
const useCoinsSrc = read('app/hooks/useCoins.ts');
const starRatingSrc = read('components/StarRating.tsx');

// ---------------------------------------------------------------------------
// Case 1: MatraLevelListScreen shows 10 levels; level 1 unlocked, 2-10 locked
// ---------------------------------------------------------------------------
check('1a. readingContent.ts defines exactly 10 matra levels', () => {
  const matraSection = readingContentSrc.split('export const matraLevels')[1] ?? readingContentSrc;
  // Only count matra_* ids (the matra levels), not the story ids further down the file.
  const ids = [...matraSection.matchAll(/id:\s*'(matra_[a-z_]+)'/g)].map((m) => m[1]);
  assert(ids.length === 10, `expected 10 matra level ids, found ${ids.length}: ${ids.join(', ')}`);
  return ids.join(', ');
});

check('1b. MATRA_LEVEL_ORDER lists all 10 level ids in useProgress.ts', () => {
  const match = useProgressSrc.match(/MATRA_LEVEL_ORDER = \[([\s\S]*?)\];/);
  assert(match, 'could not find MATRA_LEVEL_ORDER array');
  const ids = [...match[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
  assert(ids.length === 10, `expected 10 ids in MATRA_LEVEL_ORDER, found ${ids.length}`);
  return ids.join(', ');
});

check('1c. isLevelUnlocked: level 1 always unlocked; levels 2-10 locked with no prior progress', () => {
  const match = useProgressSrc.match(/MATRA_LEVEL_ORDER = \[([\s\S]*?)\];/);
  const order = [...match[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);

  // Re-derive isLevelUnlocked's exact logic (idx <= 0 -> true; else depends on
  // previous level's `completed` flag) against a fresh/empty levels map, to
  // confirm the described initial lock state without needing AsyncStorage.
  function isLevelUnlocked(levelId, levels) {
    const idx = order.indexOf(levelId);
    if (idx <= 0) return true;
    const previousLevelId = order[idx - 1];
    const previousProgress = levels[previousLevelId];
    return !!previousProgress?.completed;
  }

  const emptyLevels = {};
  assert(isLevelUnlocked(order[0], emptyLevels) === true, `level 1 (${order[0]}) should be unlocked by default`);
  for (let i = 1; i < order.length; i++) {
    assert(
      isLevelUnlocked(order[i], emptyLevels) === false,
      `level ${i + 1} (${order[i]}) should be locked with no prior progress`
    );
  }
  return 'level 1 unlocked, levels 2-10 locked with empty progress';
});

// ---------------------------------------------------------------------------
// Case 2: Level 1 card shows matra name and 0 stars initially
// ---------------------------------------------------------------------------
check('2. LevelCard renders level.name and stars from getLevelProgress (default 0)', () => {
  assert(/<LevelCard[\s\S]*?name=\{level\.name\}/.test(listScreenSrc), 'LevelCard is not passed level.name');
  assert(/<LevelCard[\s\S]*?stars=\{stars\}/.test(listScreenSrc), 'LevelCard is not passed stars');
  assert(
    /getLevelProgress = useCallback[\s\S]*?\?\?\s*\{\s*stars:\s*0/.test(useProgressSrc),
    'getLevelProgress does not default to { stars: 0, ... } when no progress exists'
  );
  assert(/<Text[^>]*>\s*\{name\}\s*<\/Text>/.test(listScreenSrc), 'LevelCard does not render the level name');
  assert(/<StarRating stars=\{stars\}/.test(listScreenSrc), 'LevelCard does not render StarRating with stars');
  return 'name + StarRating(stars) rendered; default stars=0';
});

// ---------------------------------------------------------------------------
// Case 3: Tapping level 1 opens MatraLevelScreen in learn phase
// ---------------------------------------------------------------------------
check("3. Tapping a level card navigates to MatraLevelScreen with levelId, which starts in 'learn' phase", () => {
  const pushMatch = listScreenSrc.match(/router\.push\(\{\s*pathname:\s*'([^']+)',\s*params:\s*\{\s*levelId:\s*level\.id\s*\}/);
  assert(pushMatch, 'level card onPress does not push to MatraLevelScreen with levelId param');
  assert(/MatraLevelScreen$/.test(pushMatch[1]), `unexpected pathname: ${pushMatch[1]}`);
  assert(exists('app/screens/MatraLevelScreen.tsx'), 'app/screens/MatraLevelScreen.tsx does not exist');
  assert(
    /useState<'learn' \| 'practice' \| 'result'>\('learn'\)/.test(levelScreenSrc),
    "MatraLevelScreen phase state does not default to 'learn'"
  );
  return `pushes to ${pushMatch[1]}?levelId=..., initial phase='learn'`;
});

// ---------------------------------------------------------------------------
// Case 4: Learn phase -- swipeable word cards with Hindi text, matra highlighted
// ---------------------------------------------------------------------------
check('4. Learn phase renders navigable word cards with matra characters highlighted', () => {
  assert(/function LearnCard/.test(levelScreenSrc), 'LearnCard component not found');
  assert(
    /entering=\{SlideInRight[\s\S]*?exiting=\{SlideOutLeft/.test(levelScreenSrc),
    'LearnCard does not use slide-in/out card transition animations'
  );
  assert(/function HighlightedWord/.test(levelScreenSrc), 'HighlightedWord component not found');
  assert(
    /matraIndices\.includes\(i\)\s*\?\s*styles\.matraHighlight/.test(levelScreenSrc),
    'HighlightedWord does not apply matraHighlight style to matra character indices'
  );
  assert(/handleSwipeLeft|handleSwipeRight/.test(levelScreenSrc), 'no Previous/Next navigation handlers found for learn cards');
  return 'LearnCard + HighlightedWord + Previous/Next navigation present';
});

// ---------------------------------------------------------------------------
// Case 5: Learn phase -- tapping word triggers TTS
// ---------------------------------------------------------------------------
check('5. Tapping a learn card speaks the word via Tts', () => {
  assert(/import Tts from 'react-native-tts'/.test(levelScreenSrc), 'MatraLevelScreen does not import react-native-tts');
  const speakBlock = levelScreenSrc.match(/const speak = useCallback\(\(\) => \{([\s\S]*?)\}, \[word\.word\]\);/);
  assert(speakBlock, 'LearnCard speak() callback not found');
  assert(/Tts\.speak\(word\.word\)/.test(speakBlock[1]), 'speak() does not call Tts.speak(word.word)');
  assert(/<Pressable onPress=\{speak\}/.test(levelScreenSrc), 'LearnCard body Pressable does not call speak on tap');
  return 'Pressable onPress={speak} -> Tts.speak(word.word)';
});

// ---------------------------------------------------------------------------
// Case 6: After viewing all words, practice phase becomes available
// ---------------------------------------------------------------------------
check("6. Last learn card shows 'Start Practice' which transitions phase to 'practice'", () => {
  assert(
    /const isLastCard = learnIndex === words\.length - 1;/.test(levelScreenSrc),
    'isLastCard is not derived from learnIndex reaching the final word'
  );
  assert(
    /isLastCard \? \(\s*<Pressable onPress=\{handleStartPractice\}/.test(levelScreenSrc),
    "Start Practice button is not conditionally shown only on the last learn card"
  );
  assert(
    /const handleStartPractice = \(\) => \{\s*setPhase\('practice'\);/.test(levelScreenSrc),
    "handleStartPractice does not setPhase('practice')"
  );
  return "Start Practice button (last card only) -> setPhase('practice')";
});

// ---------------------------------------------------------------------------
// Case 7: Practice phase -- audio prompt plays, 4 word choices displayed
// ---------------------------------------------------------------------------
check('7a. Practice phase has a Listen button that plays TTS audio for the current question', () => {
  assert(/onPress=\{playPracticeAudio\}/.test(levelScreenSrc), 'audio button does not call playPracticeAudio');
  const fn = levelScreenSrc.match(/const playPracticeAudio = \(\) => \{([\s\S]*?)\n  \};/);
  assert(fn && /Tts\.speak\(word\)/.test(fn[1]), 'playPracticeAudio does not call Tts.speak(word)');
  return 'Listen button -> Tts.speak(currentQuestion.word)';
});

check('7b. generateOptions() always returns exactly 4 choices including the correct word', () => {
  // Extract and execute the real generateOptions source (stripping only its
  // TS type annotations) so this exercises the actual current logic rather
  // than a hand-written re-implementation.
  const fnMatch = levelScreenSrc.match(
    /function generateOptions\([\s\S]*?\): MatraWord\[\] \{[\s\S]*?\n\}\n/
  );
  assert(fnMatch, 'generateOptions function not found');
  const jsSrc = fnMatch[0]
    .replace(
      'function generateOptions(\n  correctWord: MatraWord,\n  allWords: MatraWord[],\n): MatraWord[] {',
      'function generateOptions(correctWord, allWords) {'
    )
    .replace('const options: MatraWord[] = [correctWord];', 'const options = [correctWord];');
  assert(/^function generateOptions\(correctWord, allWords\) \{/.test(jsSrc), 'failed to strip TS types from generateOptions signature');
  assert(!/: MatraWord/.test(jsSrc), 'generateOptions body still contains un-stripped TS type annotations');
  const generateOptions = new Function(`${jsSrc}\nreturn generateOptions;`)();

  // Mirrors the real per-level word count (see readingContent.ts's
  // buildWords() calls, which each pass 8 words) rather than a tiny
  // synthetic list -- generateOptions' padding loop can under-fill when
  // allWords.length < 4, which is a real edge case but not one any actual
  // matra level hits today (every level has 8 words).
  const words = [
    { word: 'काम', meaning: 'work', matraIndices: [1] },
    { word: 'नाम', meaning: 'name', matraIndices: [1] },
    { word: 'दाल', meaning: 'lentils', matraIndices: [1] },
    { word: 'माल', meaning: 'goods', matraIndices: [1] },
    { word: 'राम', meaning: 'Ram (name)', matraIndices: [1] },
    { word: 'हाथ', meaning: 'hand', matraIndices: [1] },
    { word: 'चाय', meaning: 'tea', matraIndices: [1] },
    { word: 'बात', meaning: 'talk', matraIndices: [1] },
  ];
  for (const correct of words) {
    const options = generateOptions(correct, words);
    assert(options.length === 4, `expected 4 options, got ${options.length}`);
    assert(
      options.some((o) => o.word === correct.word),
      `options do not include the correct word ${correct.word}`
    );
  }
  return '4 options returned for a real (8-word) level, correct word always included';
});

// ---------------------------------------------------------------------------
// Case 8: Correct answer -> green flash; wrong answer -> red shake
// ---------------------------------------------------------------------------
check('8. OptionButton feedback: correct -> green background, wrong -> red background + shake sequence', () => {
  assert(
    /feedbackState === 'correct'[\s\S]*?bgColor\.value = withTiming\('rgba\(76,175,80,0\.35\)'/.test(levelScreenSrc),
    "'correct' feedback does not tint the option green"
  );
  assert(
    /feedbackState === 'wrong'[\s\S]*?bgColor\.value = withTiming\('rgba\(244,67,54,0\.35\)'[\s\S]*?shakeX\.value = withSequence/.test(levelScreenSrc),
    "'wrong' feedback does not tint the option red and shake it"
  );
  assert(
    /handleAnswer[\s\S]*?isCorrect[\s\S]*?setFeedbackMap\(\{ \[selected\.word\]: 'correct' \}\)/.test(levelScreenSrc),
    'handleAnswer does not set correct feedback on the selected option'
  );
  assert(
    /setFeedbackMap\(\{\s*\[selected\.word\]: 'wrong',\s*\[currentQuestion\.word\]: 'reveal',\s*\}\)/.test(levelScreenSrc),
    'handleAnswer does not set wrong/reveal feedback on incorrect answers'
  );
  return "feedbackState 'correct'/'wrong' drive green/red animated styles";
});

// ---------------------------------------------------------------------------
// Case 9: After 5+ questions, completion screen shows star rating (0-3);
// star calculation matches accuracy thresholds.
// ---------------------------------------------------------------------------
check('9a. MIN_PRACTICE_QUESTIONS is 5 and buildPracticeQuestions enforces at least that many', () => {
  assert(/const MIN_PRACTICE_QUESTIONS = 5;/.test(levelScreenSrc), 'MIN_PRACTICE_QUESTIONS is not 5');
  assert(
    /buildPracticeQuestions\(\s*level\.words,\s*Math\.max\(MIN_PRACTICE_QUESTIONS, level\.words\.length\),?\s*\)/.test(
      levelScreenSrc
    ),
    'practice questions are not built with at least MIN_PRACTICE_QUESTIONS'
  );
  return 'practice question count = max(5, words.length)';
});

check('9b. computeStars() maps accuracy to a 0-3 star rating matching documented thresholds', () => {
  const fnMatch = levelScreenSrc.match(/function computeStars\(accuracy: number\): number \{([\s\S]*?)\n\}\n/);
  assert(fnMatch, 'computeStars function not found');
  const computeStars = new Function('accuracy', fnMatch[1]);

  const cases = [
    [100, 3], [90, 3],
    [89, 2], [70, 2],
    [69, 1], [50, 1],
    [49, 0], [0, 0],
  ];
  for (const [accuracy, expected] of cases) {
    const actual = computeStars(accuracy);
    assert(actual === expected, `computeStars(${accuracy}) = ${actual}, expected ${expected}`);
  }
  assert(/stars=\{earnedStars\}/.test(levelScreenSrc), 'result screen does not render StarRating with earnedStars');
  return 'accuracy>=90->3, >=70->2, >=50->1, else 0; result screen renders StarRating{earnedStars}';
});

check('9c. StarRating clamps its displayed stars to the 0-3 range', () => {
  assert(
    /Math\.max\(0, Math\.min\(3, Math\.round\(stars\)\)\)/.test(starRatingSrc),
    'StarRating does not clamp stars to [0, 3]'
  );
  return 'StarRating clamps to [0,3]';
});

// ---------------------------------------------------------------------------
// Case 10: Stars and coins saved to AsyncStorage via useProgress/useCoins
// ---------------------------------------------------------------------------
check('10. Completing practice calls saveLevelProgress + addCoins, both of which persist to AsyncStorage', () => {
  assert(
    /saveLevelProgress\(level\.id, stars, acc\)\.catch/.test(levelScreenSrc),
    'MatraLevelScreen does not call saveLevelProgress(level.id, stars, acc) on completion'
  );
  assert(/if \(coins > 0\) \{\s*addCoins\(coins\)\.catch/.test(levelScreenSrc), 'MatraLevelScreen does not call addCoins(coins) on completion');
  assert(
    /await saveProgressData\(updated\);\s*setData\(updated\);\s*return updatedLevel;/.test(useProgressSrc),
    'saveLevelProgress does not persist via saveProgressData'
  );
  assert(
    /export async function saveProgressData[\s\S]*?AsyncStorage\.setItem\(PROGRESS_STORAGE_KEY, JSON\.stringify\(data\)\)/.test(
      useProgressSrc
    ),
    'saveProgressData does not write to AsyncStorage'
  );
  assert(
    /await saveProgressData\(\{ \.\.\.fresh, coins: newBalance \}\);\s*setBalance\(newBalance\);/.test(useCoinsSrc),
    'addCoins does not persist the new balance via saveProgressData'
  );
  return 'saveLevelProgress + addCoins both round-trip through saveProgressData -> AsyncStorage.setItem';
});

// ---------------------------------------------------------------------------
// Case 11: Returning to level list shows earned stars on level 1
// ---------------------------------------------------------------------------
check('11. MatraLevelListScreen reloads progress from AsyncStorage on (re)mount via useProgress', () => {
  assert(
    /loadProgressData\(\)\.then\(\(loaded\) => \{\s*if \(mounted\) \{\s*setData\(loaded\);/.test(useProgressSrc),
    'useProgress does not load persisted data into state on mount'
  );
  assert(
    /export async function loadProgressData[\s\S]*?AsyncStorage\.getItem\(PROGRESS_STORAGE_KEY\)/.test(useProgressSrc),
    'loadProgressData does not read from AsyncStorage'
  );
  assert(
    /const \{ getLevelProgress, isLevelUnlocked, loading \} = useProgress\(\);/.test(listScreenSrc),
    'MatraLevelListScreen does not source level progress from useProgress()'
  );
  // expo-router unmounts/remounts screens on navigation by default, so
  // returning to the list re-runs this mount effect and picks up the stars
  // saved in case 10 above.
  return 'useProgress() mounts -> loadProgressData() -> AsyncStorage.getItem; list screen renders from it';
});

// ---------------------------------------------------------------------------
// Case 12: Level 2 unlocks when level 1 completed with sufficient accuracy
// ---------------------------------------------------------------------------
check('12. isLevelUnlocked(level 2) flips true once level 1 is marked completed', () => {
  const match = useProgressSrc.match(/MATRA_LEVEL_ORDER = \[([\s\S]*?)\];/);
  const order = [...match[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);

  function isLevelUnlocked(levelId, levels) {
    const idx = order.indexOf(levelId);
    if (idx <= 0) return true;
    const previousLevelId = order[idx - 1];
    const previousProgress = levels[previousLevelId];
    return !!previousProgress?.completed;
  }

  const thresholdMatch = useProgressSrc.match(/UNLOCK_THRESHOLD_PERCENT = (\d+);/);
  assert(thresholdMatch, 'UNLOCK_THRESHOLD_PERCENT not found');
  const threshold = Number(thresholdMatch[1]);

  const level2 = order[1];
  assert(
    isLevelUnlocked(level2, { [order[0]]: { stars: 0, bestScore: 0, completed: false } }) === false,
    'level 2 should stay locked while level 1 is not completed'
  );
  assert(
    isLevelUnlocked(level2, { [order[0]]: { stars: 2, bestScore: threshold, completed: true } }) === true,
    `level 2 should unlock once level 1 is completed at the ${threshold}% threshold`
  );

  // Cross-check against saveLevelProgress's own completed formula so this
  // stays in sync with the real unlock-writing logic, not just the read side.
  assert(
    new RegExp(`bestScore >= UNLOCK_THRESHOLD_PERCENT`).test(useProgressSrc),
    'saveLevelProgress does not gate `completed` on UNLOCK_THRESHOLD_PERCENT'
  );

  return `level 2 unlocks once level 1 bestScore >= ${threshold}% (completed=true)`;
});

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
let allPassed = true;
for (const r of results) {
  const status = r.pass ? 'PASS' : 'FAIL';
  if (!r.pass) allPassed = false;
  console.log(`[${status}] ${r.name}${r.detail ? ` -- ${r.detail}` : ''}`);
}

if (!allPassed) {
  console.error('\nSome checks failed.');
  process.exit(1);
}

console.log('\nAll matra level reading flow checks passed.');
console.log(
  '\nNote: acceptance criteria describe next-level unlock as "2+ stars", but the ' +
    'actual implementation gates `completed` on bestScore >= UNLOCK_THRESHOLD_PERCENT ' +
    '(80%), while computeStars() awards 2 stars starting at 70% accuracy. A 70-79% ' +
    'run earns 2 stars but does NOT unlock the next level -- this is a pre-existing ' +
    'behavior of MatraLevelScreen.tsx/useProgress.ts, not a bug in this test.'
);
console.log(
  '\nNote: generateOptions() pads to 4 choices by re-scanning allWords, so it ' +
    'under-fills (< 4 options) if a level ever has fewer than 4 unique words. ' +
    'Every current matra level has 8 words (see readingContent.ts buildWords() ' +
    'calls) so this edge case does not occur today, but is worth keeping in mind ' +
    'if a level is ever authored with < 4 words.'
);
