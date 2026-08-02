import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Tts from 'react-native-tts';

import { matraLevels } from '../constants/readingContent';
import { useProgress } from '../hooks/useProgress';
import { useCoins } from '../hooks/useCoins';
import { Confetti, ConfettiHandle } from '../../components/Confetti';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WORDS_PER_ROUND = 5;
const COINS_PER_WORD = 5;
const TILE_GAP = 10;
const ROW_GAP = 44;
const MAX_TILE_SIZE = 58;
const CONTAINER_PADDING = 24;
/** How close (in px, vertically) a tile must be dropped to the slot row to count as "placed". */
const DROP_Y_TOLERANCE = 60;

interface RoundWord {
  word: string;
  meaning: string;
}

interface TileState {
  trayIndex: number;
  char: string;
  assignedSlot: number | null;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Splits a word into its constituent letters/matras (Unicode-aware). */
function splitLetters(word: string): string[] {
  return Array.from(word);
}

function buildRound(pool: RoundWord[]): RoundWord[] {
  if (pool.length === 0) return [];
  const shuffledPool = shuffle(pool);
  const round: RoundWord[] = [];
  let i = 0;
  while (round.length < WORDS_PER_ROUND) {
    round.push(shuffledPool[i % shuffledPool.length]);
    i += 1;
    if (i > WORDS_PER_ROUND * 4) break; // safety
  }
  return round;
}

interface DraggableTileProps {
  char: string;
  tileSize: number;
  homeX: number;
  homeY: number;
  assignedSlot: number | null;
  disabled: boolean;
  shakeSignal: number;
  getSlotXY: (slot: number) => { x: number; y: number };
  onDragEnd: (absX: number, absY: number) => void;
}

function DraggableTile({
  char,
  tileSize,
  homeX,
  homeY,
  assignedSlot,
  disabled,
  shakeSignal,
  getSlotXY,
  onDragEnd,
}: DraggableTileProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const shakeX = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Snap to the resting position for the current assignment (tray or a slot).
  useEffect(() => {
    const target = assignedSlot != null ? getSlotXY(assignedSlot) : { x: homeX, y: homeY };
    translateX.value = withSpring(target.x - homeX, { damping: 14, stiffness: 160 });
    translateY.value = withSpring(target.y - homeY, { damping: 14, stiffness: 160 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedSlot, homeX, homeY]);

  useEffect(() => {
    if (shakeSignal > 0) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shakeSignal]);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      scale.value = withTiming(1.12, { duration: 100 });
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd((e) => {
      scale.value = withTiming(1, { duration: 100 });
      const absX = homeX + startX.value + e.translationX;
      const absY = homeY + startY.value + e.translationY;
      onDragEnd(absX, absY);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value + shakeX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.tile,
          {
            left: homeX,
            top: homeY,
            width: tileSize,
            height: tileSize,
          },
          animatedStyle,
        ]}
      >
        <Text style={[styles.tileText, { fontSize: tileSize * 0.42 }]}>{char}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

export default function WordBuilderScreen() {
  const router = useRouter();
  const { levels } = useProgress();
  const { addCoins } = useCoins();
  const confettiRef = useRef<ConfettiHandle>(null);

  const wordPool = useMemo<RoundWord[]>(() => {
    const completedLevelIds = Object.entries(levels)
      .filter(([, progress]) => progress.completed)
      .map(([id]) => id);

    const words: RoundWord[] = [];
    for (const level of matraLevels) {
      if (completedLevelIds.includes(level.id)) {
        for (const w of level.words) {
          words.push({ word: w.word, meaning: w.meaning });
        }
      }
    }
    return words;
  }, [levels]);

  const [round, setRound] = useState<RoundWord[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [tiles, setTiles] = useState<TileState[]>([]);
  const [shakeSignal, setShakeSignal] = useState(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'complete'>('playing');
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const checkingRef = useRef(false);

  useEffect(() => {
    Tts.setDefaultLanguage('hi-IN').catch(() => {});
    Tts.setDefaultRate(0.45).catch(() => {});
  }, []);

  useEffect(() => {
    setRound(buildRound(wordPool));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordPool.length]);

  const currentWord = round[roundIndex];

  const letters = useMemo(
    () => (currentWord ? splitLetters(currentWord.word) : []),
    [currentWord],
  );

  const scrambled = useMemo(() => {
    if (letters.length === 0) return [];
    let attempt = shuffle(letters.map((char, i) => ({ char, trayIndex: i })));
    // Avoid the trivial "already correct" shuffle when possible.
    let guard = 0;
    while (
      letters.length > 1 &&
      attempt.every((t, i) => t.char === letters[i]) &&
      guard < 5
    ) {
      attempt = shuffle(letters.map((char, i) => ({ char, trayIndex: i })));
      guard += 1;
    }
    return attempt;
  }, [letters]);

  useEffect(() => {
    if (scrambled.length > 0) {
      setTiles(scrambled.map((t) => ({ trayIndex: t.trayIndex, char: t.char, assignedSlot: null })));
      setStatus('playing');
      checkingRef.current = false;
    }
  }, [scrambled]);

  // --- Layout math ---
  const availableWidth = SCREEN_WIDTH - CONTAINER_PADDING * 2;
  const tileCount = Math.max(letters.length, 1);
  const tileSize = Math.min(
    MAX_TILE_SIZE,
    Math.max(28, Math.floor((availableWidth - (tileCount - 1) * TILE_GAP) / tileCount)),
  );
  const rowWidth = tileCount * tileSize + (tileCount - 1) * TILE_GAP;
  const rowStartX = Math.max(0, (availableWidth - rowWidth) / 2);
  const slotY = 0;
  const trayY = tileSize + ROW_GAP;
  const playAreaHeight = trayY + tileSize + 20;

  const getSlotXY = useCallback(
    (slot: number) => ({ x: rowStartX + slot * (tileSize + TILE_GAP), y: slotY }),
    [rowStartX, tileSize],
  );

  const getTrayXY = useCallback(
    (trayIdx: number) => ({ x: rowStartX + trayIdx * (tileSize + TILE_GAP), y: trayY }),
    [rowStartX, tileSize, trayY],
  );

  const speakWord = () => {
    if (!currentWord) return;
    Tts.stop();
    Tts.speak(currentWord.word);
  };

  const finishRound = useCallback(() => {
    setStatus('complete');
    addCoins(WORDS_PER_ROUND * COINS_PER_WORD).catch(() => {});
  }, [addCoins]);

  const advanceWord = useCallback(() => {
    setWordsCompleted((c) => c + 1);
    if (roundIndex + 1 < round.length) {
      setRoundIndex((i) => i + 1);
    } else {
      finishRound();
    }
  }, [roundIndex, round.length, finishRound]);

  // Check completion whenever tile assignment changes.
  useEffect(() => {
    if (tiles.length === 0 || checkingRef.current) return;
    const allPlaced = tiles.every((t) => t.assignedSlot !== null);
    if (!allPlaced) return;

    checkingRef.current = true;
    const answer = Array.from({ length: tiles.length }, (_, slot) => {
      return tiles.find((t) => t.assignedSlot === slot)?.char ?? '';
    }).join('');

    const timeout = setTimeout(() => {
      if (currentWord && answer === currentWord.word) {
        setStatus('correct');
        confettiRef.current?.burst();
        setTimeout(() => {
          advanceWord();
        }, 1100);
      } else {
        setShakeSignal((s) => s + 1);
        setTimeout(() => {
          setTiles((prev) => prev.map((t) => ({ ...t, assignedSlot: null })));
          checkingRef.current = false;
        }, 500);
      }
    }, 250);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles]);

  const handleDragEnd = useCallback(
    (trayIndex: number, absX: number, absY: number) => {
      if (status !== 'playing') return;
      const centerX = absX + tileSize / 2;
      const centerY = absY + tileSize / 2;
      const droppedOnSlotRow = Math.abs(centerY - slotY - tileSize / 2) < DROP_Y_TOLERANCE;

      setTiles((prev) => {
        const next = [...prev];
        const draggedIdx = next.findIndex((t) => t.trayIndex === trayIndex);
        if (draggedIdx === -1) return prev;

        if (!droppedOnSlotRow) {
          next[draggedIdx] = { ...next[draggedIdx], assignedSlot: null };
          return next;
        }

        let nearestSlot = 0;
        let minDist = Infinity;
        for (let s = 0; s < letters.length; s++) {
          const slotCenterX = getSlotXY(s).x + tileSize / 2;
          const dist = Math.abs(slotCenterX - centerX);
          if (dist < minDist) {
            minDist = dist;
            nearestSlot = s;
          }
        }

        const draggedPrevSlot = next[draggedIdx].assignedSlot;
        const occupyingIdx = next.findIndex(
          (t) => t.assignedSlot === nearestSlot && t.trayIndex !== trayIndex,
        );
        if (occupyingIdx !== -1) {
          next[occupyingIdx] = { ...next[occupyingIdx], assignedSlot: draggedPrevSlot };
        }
        next[draggedIdx] = { ...next[draggedIdx], assignedSlot: nearestSlot };
        return next;
      });
    },
    [status, tileSize, letters.length, getSlotXY],
  );

  const handlePlayAgain = () => {
    setRound(buildRound(wordPool));
    setRoundIndex(0);
    setWordsCompleted(0);
  };

  if (wordPool.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBack}>
            <Ionicons name="chevron-back" size={22} color="#1976d2" />
          </Pressable>
          <Text style={styles.headerTitle}>Word Builder</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔤</Text>
          <Text style={styles.emptyText}>
            Complete a Matra Words level first to unlock Word Builder words!
          </Text>
          <Pressable
            onPress={() => router.push('/screens/MatraLevelListScreen')}
            style={styles.emptyBtn}
          >
            <Text style={styles.emptyBtnText}>Go to Matra Words</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'complete') {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>🏆</Text>
          <Text style={styles.resultTitle}>Round Complete!</Text>
          <Text style={styles.resultSubtitle}>{wordsCompleted} words built</Text>
          <Text style={styles.resultCoins}>+{WORDS_PER_ROUND * COINS_PER_WORD} coins earned</Text>

          <View style={styles.resultActions}>
            <Pressable onPress={handlePlayAgain} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Play Again</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Done</Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Confetti ref={confettiRef} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={22} color="#1976d2" />
        </Pressable>
        <Text style={styles.headerTitle}>Word Builder</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.progressText}>
        Word {roundIndex + 1} / {round.length}
      </Text>

      <Animated.View entering={FadeIn} key={`prompt-${roundIndex}`} style={styles.promptArea}>
        <Text style={styles.meaningText}>{currentWord?.meaning}</Text>
        <Pressable onPress={speakWord} style={styles.speakerBtn}>
          <Ionicons name="volume-high" size={26} color="#fff" />
        </Pressable>
      </Animated.View>

      <View style={[styles.playArea, { height: playAreaHeight }]}>
        {/* Empty slot outlines */}
        {letters.map((_, slot) => {
          const pos = getSlotXY(slot);
          return (
            <View
              key={`slot-${slot}`}
              style={[
                styles.slot,
                { left: pos.x, top: pos.y, width: tileSize, height: tileSize },
              ]}
            />
          );
        })}

        {tiles.map((tile) => {
          const home = getTrayXY(tile.trayIndex);
          return (
            <DraggableTile
              key={`${roundIndex}-${tile.trayIndex}`}
              char={tile.char}
              tileSize={tileSize}
              homeX={home.x}
              homeY={home.y}
              assignedSlot={tile.assignedSlot}
              disabled={status !== 'playing'}
              shakeSignal={shakeSignal}
              getSlotXY={getSlotXY}
              onDragEnd={(absX, absY) => handleDragEnd(tile.trayIndex, absX, absY)}
            />
          );
        })}
      </View>

      {status === 'correct' && (
        <Animated.Text entering={FadeIn} style={styles.correctBanner}>
          Correct! +{COINS_PER_WORD} coins 🎉
        </Animated.Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
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
  progressText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  promptArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  meaningText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  speakerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  playArea: {
    marginHorizontal: CONTAINER_PADDING,
    position: 'relative',
  },
  slot: {
    position: 'absolute',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#c5cae9',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(197,202,233,0.15)',
  },
  tile: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: '#ff9800',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  tileText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  correctBanner: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#4caf50',
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 17,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1976d2',
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
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
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  resultCoins: {
    fontSize: 18,
    color: '#ff9800',
    fontWeight: '600',
    marginBottom: 32,
  },
  resultActions: {
    flexDirection: 'row',
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
