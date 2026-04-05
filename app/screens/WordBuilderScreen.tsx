// WordBuilderScreen.tsx
// Player is shown an emoji + English hint for a Hindi word.
// Shuffled letter tiles appear at the bottom.
// Tap letters in the correct order to build the word.
// Celebration animation plays on success.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SoundManager } from '../helpers/SoundManager';

// Simple Hindi words: each letter entry is a single grapheme cluster that will
// appear on one tile. Keep words short (2-3 letters) so tiles fit on screen.
const WORD_LIST = [
  { word: 'आम',   letters: ['आ', 'म'],       emoji: '🥭', hint: 'Mango' },
  { word: 'नल',   letters: ['न', 'ल'],       emoji: '🚰', hint: 'Tap' },
  { word: 'जग',   letters: ['ज', 'ग'],       emoji: '🫙', hint: 'Jug' },
  { word: 'फल',   letters: ['फ', 'ल'],       emoji: '🍎', hint: 'Fruit' },
  { word: 'घर',   letters: ['घ', 'र'],       emoji: '🏠', hint: 'House' },
  { word: 'कप',   letters: ['क', 'प'],       emoji: '☕', hint: 'Cup' },
  { word: 'बस',   letters: ['ब', 'स'],       emoji: '🚌', hint: 'Bus' },
  { word: 'पल',   letters: ['प', 'ल'],       emoji: '⏱️', hint: 'Moment' },
  { word: 'धन',   letters: ['ध', 'न'],       emoji: '💰', hint: 'Wealth' },
  { word: 'मन',   letters: ['म', 'न'],       emoji: '💭', hint: 'Mind' },
];

// Extra decoy letters to mix into the tile pool
const DECOYS = ['ट', 'च', 'य', 'श', 'ह', 'भ', 'व', 'ड', 'त', 'ख', 'ग', 'ज', 'र', 'ल', 'न'];

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

function pickDecoys(exclude: string[], count: number): string[] {
  return shuffle(DECOYS.filter(d => !exclude.includes(d))).slice(0, count);
}

type Tile = { letter: string; id: number };

export default function WordBuilderScreen() {
  const [wordIndex, setWordIndex] = useState(0);
  const [placed, setPlaced] = useState<(string | null)[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const currentWord = WORD_LIST[wordIndex];

  // Build shuffled tile pool for the current word
  const buildTiles = useCallback((word: typeof WORD_LIST[0]): Tile[] => {
    const decoys = pickDecoys(word.letters, 3);
    return shuffle([...word.letters, ...decoys]).map((letter, idx) => ({
      letter,
      id: idx,
    }));
  }, []);

  // Reset state for a new word
  useEffect(() => {
    setPlaced(new Array(currentWord.letters.length).fill(null));
    setTiles(buildTiles(currentWord));
    setFeedback('idle');
  }, [wordIndex, currentWord, buildTiles]);

  // Track which tile IDs have been used
  const usedTileIds = useMemo(() => {
    const used = new Set<number>();
    placed.forEach((letter, slotIdx) => {
      if (letter !== null) {
        // Find first unused tile with this letter
        const tile = tiles.find(t => t.letter === letter && !used.has(t.id));
        if (tile) used.add(tile.id);
      }
    });
    return used;
  }, [placed, tiles]);

  const handleTileTap = (tile: Tile) => {
    if (feedback !== 'idle') return;
    if (usedTileIds.has(tile.id)) return;

    // Place into the next empty slot
    const nextEmpty = placed.findIndex(p => p === null);
    if (nextEmpty === -1) return;

    const newPlaced = [...placed];
    newPlaced[nextEmpty] = tile.letter;
    setPlaced(newPlaced);

    // If all slots filled, check the answer
    if (newPlaced.every(p => p !== null)) {
      const built = newPlaced.join('');
      if (built === currentWord.word) {
        setFeedback('correct');
        setScore(s => s + 1);
        SoundManager.play(require('../../assets/sounds/game/correct.mp3'), 'correct');
        playCelebration();
        setTimeout(advanceWord, 1800);
      } else {
        setFeedback('wrong');
        SoundManager.play(require('../../assets/sounds/game/wrong.mp3'), 'wrong');
        playShake();
        setTimeout(() => {
          setPlaced(new Array(currentWord.letters.length).fill(null));
          setFeedback('idle');
        }, 900);
      }
    }
  };

  const handleSlotTap = (slotIdx: number) => {
    if (feedback !== 'idle') return;
    if (placed[slotIdx] === null) return;
    // Remove the letter from this slot
    const newPlaced = [...placed];
    newPlaced[slotIdx] = null;
    setPlaced(newPlaced);
  };

  const advanceWord = () => {
    if (wordIndex < WORD_LIST.length - 1) {
      setWordIndex(w => w + 1);
    } else {
      setShowResult(true);
    }
  };

  const playCelebration = () => {
    celebrateAnim.setValue(0);
    Animated.sequence([
      Animated.spring(celebrateAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(celebrateAnim, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  const playShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleRestart = () => {
    setWordIndex(0);
    setScore(0);
    setShowResult(false);
  };

  if (showResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>🎉 Well Done! 🎉</Text>
        <Text style={styles.resultScore}>
          {score} / {WORD_LIST.length} words correct
        </Text>
        <TouchableOpacity style={styles.btn} onPress={handleRestart}>
          <Text style={styles.btnText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const celebrateScale = celebrateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.4, 1],
  });

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <Text style={styles.heading}>🔤 Word Builder</Text>
      <Text style={styles.progress}>
        Word {wordIndex + 1} of {WORD_LIST.length}  •  Score: {score}
      </Text>

      {/* Word card */}
      <Animated.View
        style={[
          styles.wordCard,
          {
            transform: [
              { translateX: shakeAnim },
              { scale: celebrateScale },
            ],
            borderColor:
              feedback === 'correct' ? '#43a047' :
              feedback === 'wrong'   ? '#e53935' : '#ddd',
          },
        ]}
      >
        <Text style={styles.wordEmoji}>{currentWord.emoji}</Text>
        <Text style={styles.wordHint}>{currentWord.hint}</Text>

        {/* Answer slots */}
        <View style={styles.slots}>
          {placed.map((letter, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.slot,
                letter !== null && styles.slotFilled,
                feedback === 'correct' && styles.slotCorrect,
                feedback === 'wrong'   && letter !== null && styles.slotWrong,
              ]}
              onPress={() => handleSlotTap(idx)}
            >
              <Text style={styles.slotText}>{letter ?? ''}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {feedback === 'correct' && <Text style={styles.feedbackText}>सही! 🎉</Text>}
        {feedback === 'wrong'   && <Text style={[styles.feedbackText, styles.feedbackWrong]}>फिर कोशिश करो! ❌</Text>}
      </Animated.View>

      {/* Letter tiles */}
      <View style={styles.tilesArea}>
        {tiles.map((tile) => {
          const isUsed = usedTileIds.has(tile.id);
          return (
            <TouchableOpacity
              key={tile.id}
              style={[styles.tile, isUsed && styles.tileUsed]}
              onPress={() => handleTileTap(tile)}
              disabled={isUsed || feedback !== 'idle'}
            >
              <Text style={[styles.tileText, isUsed && styles.tileTextUsed]}>
                {tile.letter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.hint}>Tap a slot to remove a letter</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#fff8f0',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff8f0',
    padding: 20,
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: 6,
  },
  progress: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  wordCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    borderWidth: 2,
    marginBottom: 32,
  },
  wordEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  wordHint: {
    fontSize: 22,
    color: '#555',
    fontWeight: '600',
    marginBottom: 20,
  },
  slots: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  slot: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  slotFilled: {
    borderColor: '#ff9800',
    backgroundColor: '#fff3e0',
  },
  slotCorrect: {
    borderColor: '#43a047',
    backgroundColor: '#e8f5e9',
  },
  slotWrong: {
    borderColor: '#e53935',
    backgroundColor: '#ffebee',
  },
  slotText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#43a047',
    marginTop: 8,
  },
  feedbackWrong: {
    color: '#e53935',
  },
  tilesArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  tile: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: '#ff9800',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  tileUsed: {
    backgroundColor: '#e0e0e0',
    elevation: 0,
  },
  tileText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  tileTextUsed: {
    color: '#bbb',
  },
  hint: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 4,
  },
  resultScore: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 32,
  },
  btn: {
    backgroundColor: '#ff9800',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 24,
    elevation: 2,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
