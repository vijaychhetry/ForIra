import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Tts from 'react-native-tts';

import { matraLevels, MatraWord } from '../constants/readingContent';
import { useProgress } from '../hooks/useProgress';
import { useCoins } from '../hooks/useCoins';
import { StarRating } from '../../components/StarRating';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COINS_PER_STAR = 5;
const MIN_PRACTICE_QUESTIONS = 5;

// --- Accuracy thresholds for star rating ---
function computeStars(accuracy: number): number {
  if (accuracy >= 90) return 3;
  if (accuracy >= 70) return 2;
  if (accuracy >= 50) return 1;
  return 0;
}

// --- Generate 4-choice options for a practice question ---
function generateOptions(
  correctWord: MatraWord,
  allWords: MatraWord[],
): MatraWord[] {
  const options: MatraWord[] = [correctWord];
  const pool = allWords.filter((w) => w.word !== correctWord.word);

  // Shuffle pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  for (const w of pool) {
    if (options.length >= 4) break;
    options.push(w);
  }

  // Pad with duplicates from allWords if fewer than 4 unique words available
  let idx = 0;
  while (options.length < 4) {
    const candidate = allWords[idx % allWords.length];
    if (!options.find((o) => o.word === candidate.word)) {
      options.push(candidate);
    }
    idx++;
    if (idx > allWords.length * 2) break; // safety
  }

  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return options;
}

// --- Build a shuffled list of practice questions ---
function buildPracticeQuestions(words: MatraWord[], minCount: number) {
  const questions: MatraWord[] = [];
  // Use all words at least once
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  questions.push(...shuffled);
  // Fill remaining with random picks to meet minimum
  while (questions.length < minCount) {
    questions.push(words[Math.floor(Math.random() * words.length)]);
  }
  return questions;
}

// =========================================================================
// Highlighted word text -- matra characters rendered in orange
// =========================================================================
function HighlightedWord({
  word,
  matraIndices,
}: {
  word: string;
  matraIndices: number[];
}) {
  const chars = Array.from(word);
  return (
    <Text style={styles.wordText}>
      {chars.map((ch, i) => (
        <Text
          key={i}
          style={matraIndices.includes(i) ? styles.matraHighlight : undefined}
        >
          {ch}
        </Text>
      ))}
    </Text>
  );
}

// =========================================================================
// Learn Card
// =========================================================================
function LearnCard({
  word,
  index,
  total,
}: {
  word: MatraWord;
  index: number;
  total: number;
}) {
  const speak = useCallback(() => {
    Tts.stop();
    Tts.speak(word.word);
  }, [word.word]);

  return (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(200)}
      style={styles.card}
    >
      <Text style={styles.cardCounter}>
        {index + 1} / {total}
      </Text>

      <Pressable onPress={speak} style={styles.cardBody}>
        <HighlightedWord word={word.word} matraIndices={word.matraIndices} />
        <Text style={styles.meaningText}>{word.meaning}</Text>
        <Text style={styles.tapHint}>Tap to hear</Text>
      </Pressable>
    </Animated.View>
  );
}

// =========================================================================
// Practice Option Button with feedback animation
// =========================================================================
function OptionButton({
  word,
  onPress,
  feedbackState,
}: {
  word: MatraWord;
  onPress: () => void;
  feedbackState: 'none' | 'correct' | 'wrong' | 'reveal';
}) {
  const shakeX = useSharedValue(0);
  const bgColor = useSharedValue('rgba(255,255,255,1)');

  useEffect(() => {
    if (feedbackState === 'correct') {
      bgColor.value = withTiming('rgba(76,175,80,0.35)', { duration: 200 });
    } else if (feedbackState === 'wrong') {
      bgColor.value = withTiming('rgba(244,67,54,0.35)', { duration: 150 });
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    } else if (feedbackState === 'reveal') {
      bgColor.value = withTiming('rgba(76,175,80,0.25)', { duration: 200 });
    } else {
      bgColor.value = withTiming('rgba(255,255,255,1)', { duration: 100 });
      shakeX.value = 0;
    }
  }, [feedbackState, bgColor, shakeX]);

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: bgColor.value,
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <Animated.View style={[styles.optionBtn, animStyle]}>
      <Pressable
        onPress={onPress}
        disabled={feedbackState !== 'none'}
        style={styles.optionPressable}
      >
        <Text style={styles.optionText}>{word.word}</Text>
      </Pressable>
    </Animated.View>
  );
}

// =========================================================================
// Main Component
// =========================================================================
export default function MatraLevelScreen() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const router = useRouter();
  const { saveLevelProgress } = useProgress();
  const { addCoins } = useCoins();

  // --- Level data ---
  const level = useMemo(
    () => matraLevels.find((l) => l.id === levelId),
    [levelId],
  );

  // --- Phase state ---
  const [phase, setPhase] = useState<'learn' | 'practice' | 'result'>('learn');

  // --- Learn state ---
  const [learnIndex, setLearnIndex] = useState(0);

  // --- Practice state ---
  const practiceQuestions = useRef<MatraWord[]>([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedbackMap, setFeedbackMap] = useState<
    Record<string, 'none' | 'correct' | 'wrong' | 'reveal'>
  >({});
  const [answered, setAnswered] = useState(false);

  // --- Result state ---
  const [earnedStars, setEarnedStars] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [coinsAwarded, setCoinsAwarded] = useState(0);

  // --- Options for current practice question ---
  const [options, setOptions] = useState<MatraWord[]>([]);

  // Initialize TTS
  useEffect(() => {
    Tts.setDefaultLanguage('hi-IN').catch(() => {});
    Tts.setDefaultRate(0.45).catch(() => {});
  }, []);

  // --- Build practice questions when entering practice phase ---
  useEffect(() => {
    if (phase === 'practice' && level) {
      const questions = buildPracticeQuestions(
        level.words,
        Math.max(MIN_PRACTICE_QUESTIONS, level.words.length),
      );
      practiceQuestions.current = questions;
      setPracticeIndex(0);
      setCorrectCount(0);
      setOptions(generateOptions(questions[0], level.words));
      setFeedbackMap({});
      setAnswered(false);
    }
  }, [phase, level]);

  // --- Fallback for missing level ---
  if (!level) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Level not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const words = level.words;

  // ======================= LEARN PHASE =======================
  const handleSwipeLeft = () => {
    if (learnIndex < words.length - 1) {
      setLearnIndex((i) => i + 1);
    }
  };

  const handleSwipeRight = () => {
    if (learnIndex > 0) {
      setLearnIndex((i) => i - 1);
    }
  };

  const handleStartPractice = () => {
    setPhase('practice');
  };

  // ======================= PRACTICE PHASE =======================
  const handleAnswer = (selected: MatraWord) => {
    if (answered) return;
    setAnswered(true);

    const currentQuestion = practiceQuestions.current[practiceIndex];
    const isCorrect = selected.word === currentQuestion.word;

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setFeedbackMap({ [selected.word]: 'correct' });
    } else {
      setFeedbackMap({
        [selected.word]: 'wrong',
        [currentQuestion.word]: 'reveal',
      });
    }

    // Auto-advance after delay
    setTimeout(() => {
      const nextIdx = practiceIndex + 1;
      if (nextIdx < practiceQuestions.current.length) {
        setPracticeIndex(nextIdx);
        const nextQ = practiceQuestions.current[nextIdx];
        setOptions(generateOptions(nextQ, level.words));
        setFeedbackMap({});
        setAnswered(false);
      } else {
        // Finished -- compute results
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
        const totalQ = practiceQuestions.current.length;
        const acc = Math.round((finalCorrect / totalQ) * 100);
        const stars = computeStars(acc);
        const coins = stars * COINS_PER_STAR;

        setAccuracy(acc);
        setEarnedStars(stars);
        setCoinsAwarded(coins);
        setPhase('result');

        // Save progress and award coins
        saveLevelProgress(level.id, stars, acc).catch(() => {});
        if (coins > 0) {
          addCoins(coins).catch(() => {});
        }
      }
    }, 1200);
  };

  // Play audio for current practice question
  const playPracticeAudio = () => {
    if (practiceQuestions.current.length > 0) {
      const word = practiceQuestions.current[practiceIndex]?.word;
      if (word) {
        Tts.stop();
        Tts.speak(word);
      }
    }
  };

  // ======================= RENDER =======================

  // ---------- LEARN PHASE ----------
  if (phase === 'learn') {
    const isLastCard = learnIndex === words.length - 1;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBack}>
            <Text style={styles.headerBackText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{level.name}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.phaseLabel}>
          <Animated.Text entering={FadeIn} style={styles.phaseLabelText}>
            Learn
          </Animated.Text>
        </View>

        <View style={styles.cardArea}>
          <LearnCard
            key={`learn-${learnIndex}`}
            word={words[learnIndex]}
            index={learnIndex}
            total={words.length}
          />
        </View>

        <View style={styles.navRow}>
          <Pressable
            onPress={handleSwipeRight}
            disabled={learnIndex === 0}
            style={[
              styles.navBtn,
              learnIndex === 0 && styles.navBtnDisabled,
            ]}
          >
            <Text style={styles.navBtnText}>Previous</Text>
          </Pressable>

          {isLastCard ? (
            <Pressable onPress={handleStartPractice} style={styles.practiceBtn}>
              <Text style={styles.practiceBtnText}>Start Practice</Text>
            </Pressable>
          ) : (
            <Pressable onPress={handleSwipeLeft} style={styles.navBtn}>
              <Text style={styles.navBtnText}>Next</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ---------- PRACTICE PHASE ----------
  if (phase === 'practice') {
    const totalQ = practiceQuestions.current.length;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBack}>
            <Text style={styles.headerBackText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{level.name}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.phaseLabel}>
          <Animated.Text entering={FadeIn} style={styles.phaseLabelText}>
            Practice
          </Animated.Text>
          <Text style={styles.progressText}>
            {practiceIndex + 1} / {totalQ}
          </Text>
        </View>

        <View style={styles.practiceArea}>
          <Pressable onPress={playPracticeAudio} style={styles.audioBtn}>
            <Text style={styles.audioBtnText}>Listen</Text>
          </Pressable>

          <Text style={styles.practiceInstruction}>
            Which word did you hear?
          </Text>

          <View style={styles.optionsGrid}>
            {options.map((opt) => (
              <OptionButton
                key={`${practiceIndex}-${opt.word}`}
                word={opt}
                onPress={() => handleAnswer(opt)}
                feedbackState={feedbackMap[opt.word] ?? 'none'}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- RESULT PHASE ----------
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Level Complete!</Text>

        <StarRating stars={earnedStars} size={56} />

        <Text style={styles.resultAccuracy}>Accuracy: {accuracy}%</Text>
        <Text style={styles.resultCoins}>
          +{coinsAwarded} coins earned
        </Text>

        <View style={styles.resultActions}>
          <Pressable
            onPress={() => {
              setPhase('learn');
              setLearnIndex(0);
            }}
            style={styles.retryBtn}
          >
            <Text style={styles.retryBtnText}>Try Again</Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

// =========================================================================
// Styles
// =========================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    color: '#c62828',
  },
  backBtn: {
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#1976d2',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerBack: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  headerBackText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 50,
  },

  // --- Phase label ---
  phaseLabel: {
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9c27b0',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  progressText: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },

  // --- Learn card ---
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: SCREEN_WIDTH - 64,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  cardCounter: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 16,
  },
  cardBody: {
    alignItems: 'center',
  },
  wordText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  matraHighlight: {
    color: '#ff9800',
  },
  meaningText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 12,
  },
  tapHint: {
    fontSize: 13,
    color: '#bbb',
    fontStyle: 'italic',
  },

  // --- Nav row ---
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  navBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  practiceBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: '#9c27b0',
    borderRadius: 10,
  },
  practiceBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // --- Practice ---
  practiceArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  audioBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  audioBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  practiceInstruction: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
    fontWeight: '500',
  },
  optionsGrid: {
    width: '100%',
    gap: 12,
  },
  optionBtn: {
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  optionPressable: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },

  // --- Result ---
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  resultAccuracy: {
    fontSize: 20,
    color: '#555',
    marginTop: 20,
    fontWeight: '600',
  },
  resultCoins: {
    fontSize: 18,
    color: '#ff9800',
    marginTop: 8,
    fontWeight: '600',
  },
  resultActions: {
    flexDirection: 'row',
    marginTop: 36,
    gap: 16,
  },
  retryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  doneBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#4caf50',
    borderRadius: 12,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
