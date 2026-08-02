import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import Tts from 'react-native-tts';

import { stories, StoryQuestion } from '../constants/readingContent';
import { useProgress } from '../hooks/useProgress';
import { useCoins } from '../hooks/useCoins';
import { KaraokeText } from '../../components/KaraokeText';
import { Confetti, ConfettiHandle } from '../../components/Confetti';

const STORY_COMPLETE_COINS = 15;
/** Rough per-word highlight duration while "reading aloud" a page (placeholder pacing). */
const WORD_HIGHLIGHT_MS = 550;

/** Illustration placeholder background colors, cycled per page. */
const ILLUSTRATION_COLORS = ['#e3f2fd', '#fce4ec', '#e8f5e9', '#fff3e0', '#f3e5f5'];

export default function StoryScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const router = useRouter();
  const { saveStoryProgress } = useProgress();
  const { addCoins } = useCoins();
  const confettiRef = useRef<ConfettiHandle>(null);

  const story = useMemo(() => stories.find((s) => s.id === storyId), [storyId]);

  const [phase, setPhase] = useState<'reading' | 'questions' | 'result'>('reading');
  const [pageIndex, setPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const playTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Question phase state
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [coinsAwarded, setCoinsAwarded] = useState(0);

  useEffect(() => {
    Tts.setDefaultLanguage('hi-IN').catch(() => {});
    Tts.setDefaultRate(0.45).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
      Tts.stop();
    };
  }, []);

  const stopPlayback = useCallback(() => {
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
    Tts.stop();
    setIsPlaying(false);
    setActiveWordIndex(-1);
  }, []);

  const playPage = useCallback(() => {
    if (!story) return;
    const page = story.pages[pageIndex];
    if (!page) return;

    stopPlayback();
    setIsPlaying(true);

    let i = 0;
    const speakNext = () => {
      if (i >= page.words.length) {
        setIsPlaying(false);
        setActiveWordIndex(-1);
        return;
      }
      setActiveWordIndex(i);
      try {
        Tts.speak(page.words[i]);
      } catch {
        // TTS unavailable -- still advance the highlight so reading can continue visually.
      }
      i += 1;
      playTimeoutRef.current = setTimeout(speakNext, WORD_HIGHLIGHT_MS);
    };
    speakNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story, pageIndex]);

  // Stop any in-flight playback when the page changes.
  useEffect(() => {
    stopPlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  if (!story) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Story not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const totalPages = story.pages.length;
  const isLastPage = pageIndex === totalPages - 1;

  const handleNextPage = () => {
    if (isLastPage) {
      stopPlayback();
      setPhase('questions');
      setQuestionIndex(0);
      setSelectedIndex(null);
      setCorrectCount(0);
    } else {
      setPageIndex((p) => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageIndex > 0) {
      setPageIndex((p) => p - 1);
    }
  };

  const handleAnswer = (question: StoryQuestion, optionIndex: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(optionIndex);

    const isCorrect = optionIndex === question.correctIndex;
    const nextCorrectCount = isCorrect ? correctCount + 1 : correctCount;

    setTimeout(() => {
      const nextIdx = questionIndex + 1;
      if (nextIdx < story.questions.length) {
        setCorrectCount(nextCorrectCount);
        setQuestionIndex(nextIdx);
        setSelectedIndex(null);
      } else {
        const total = story.questions.length;
        const scorePercent = total > 0 ? Math.round((nextCorrectCount / total) * 100) : 100;
        setCorrectCount(nextCorrectCount);
        setCoinsAwarded(STORY_COMPLETE_COINS);
        setPhase('result');

        saveStoryProgress(story.id, scorePercent).catch(() => {});
        addCoins(STORY_COMPLETE_COINS).catch(() => {});
        confettiRef.current?.burst();
      }
    }, 900);
  };

  // ---------- READING PHASE ----------
  if (phase === 'reading') {
    const page = story.pages[pageIndex];
    const illustrationColor = ILLUSTRATION_COLORS[pageIndex % ILLUSTRATION_COLORS.length];

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBack}>
            <Ionicons name="chevron-back" size={22} color="#1976d2" />
          </Pressable>
          <Text style={styles.headerTitle}>{story.title}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.pageCounter}>
          Page {pageIndex + 1} / {totalPages}
        </Text>

        <Animated.View
          key={`page-${pageIndex}`}
          entering={SlideInRight.duration(250)}
          exiting={SlideOutLeft.duration(200)}
          style={[styles.illustration, { backgroundColor: illustrationColor }]}
        >
          <Text style={styles.illustrationEmoji}>{story.emoji}</Text>
        </Animated.View>

        <View style={styles.textArea}>
          <KaraokeText
            words={page.words}
            isPlaying={isPlaying}
            activeWordIndex={activeWordIndex}
          />
        </View>

        <Pressable onPress={playPage} style={styles.speakerBtn}>
          <Ionicons name="volume-high" size={28} color="#fff" />
        </Pressable>

        <View style={styles.navRow}>
          <Pressable
            onPress={handlePrevPage}
            disabled={pageIndex === 0}
            style={[styles.navBtn, pageIndex === 0 && styles.navBtnDisabled]}
          >
            <Text style={styles.navBtnText}>Previous</Text>
          </Pressable>

          <Pressable onPress={handleNextPage} style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>{isLastPage ? 'Questions' : 'Next'}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- QUESTIONS PHASE ----------
  if (phase === 'questions') {
    const question = story.questions[questionIndex];

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{story.title}</Text>
        </View>

        <View style={styles.phaseLabel}>
          <Animated.Text entering={FadeIn} style={styles.phaseLabelText}>
            Comprehension
          </Animated.Text>
          <Text style={styles.progressText}>
            {questionIndex + 1} / {story.questions.length}
          </Text>
        </View>

        <View style={styles.questionArea}>
          <Text style={styles.questionText}>{question.question}</Text>

          {question.options.map((option, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrectOption = idx === question.correctIndex;
            const showFeedback = selectedIndex !== null;

            let optionStyle = styles.optionBtn;
            if (showFeedback && isCorrectOption) {
              optionStyle = styles.optionBtnCorrect;
            } else if (showFeedback && isSelected && !isCorrectOption) {
              optionStyle = styles.optionBtnWrong;
            }

            return (
              <Pressable
                key={idx}
                onPress={() => handleAnswer(question, idx)}
                disabled={selectedIndex !== null}
                style={[styles.optionBtnBase, optionStyle]}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    );
  }

  // ---------- RESULT PHASE ----------
  return (
    <SafeAreaView style={styles.container}>
      <Confetti ref={confettiRef} />
      <Animated.View entering={FadeInDown.duration(400)} style={styles.resultContainer}>
        <Text style={styles.resultEmoji}>🎉</Text>
        <Text style={styles.resultTitle}>Story Complete!</Text>
        <Text style={styles.resultScore}>
          {correctCount} / {story.questions.length} correct
        </Text>
        <Text style={styles.resultCoins}>+{coinsAwarded} coins earned</Text>

        <Pressable onPress={() => router.back()} style={styles.doneBtn}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerBack: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 34,
  },
  pageCounter: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  illustration: {
    marginHorizontal: 32,
    height: 160,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationEmoji: {
    fontSize: 72,
  },
  textArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerBtn: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
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
  nextBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: '#ff9800',
    borderRadius: 10,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // --- Questions ---
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
  questionArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionBtnBase: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  optionBtn: {},
  optionBtnCorrect: {
    backgroundColor: 'rgba(76,175,80,0.3)',
  },
  optionBtnWrong: {
    backgroundColor: 'rgba(244,67,54,0.3)',
  },
  optionText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },

  // --- Result ---
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  resultScore: {
    fontSize: 18,
    color: '#555',
    marginBottom: 8,
  },
  resultCoins: {
    fontSize: 18,
    color: '#ff9800',
    fontWeight: '600',
    marginBottom: 32,
  },
  doneBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: '#4caf50',
    borderRadius: 12,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
