// QuickTapScreen.tsx
// A Hindi letter appears as the target. Tap the matching letter from a 2×2 grid
// before the timer runs out. 10 rounds; timer shortens on each correct answer.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { hindiConsonants, hindiVowels } from '../constants/hindiLetters';
import { SoundManager } from '../helpers/SoundManager';

const TOTAL_ROUNDS = 10;
const INITIAL_TIME = 3000; // ms
const TIME_REDUCTION = 150; // ms faster per correct answer
const MIN_TIME = 1200; // ms floor

// Combine vowels + consonants as the letter pool
const ALL_LETTERS = [
  ...hindiVowels.map(v => ({ letter: v.letter, sound: v.sound })),
  ...hindiConsonants.map(c => ({ letter: c.letter, sound: c.sound })),
];

function pickRandom<T>(arr: T[], count: number, exclude?: T[]): T[] {
  const pool = exclude ? arr.filter(x => !exclude.includes(x)) : arr;
  const shuffled = pool.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

type LetterItem = { letter: string; sound: any };
type RoundData = { target: LetterItem; options: LetterItem[] };

function buildRound(consecutiveCorrect: number): RoundData {
  const [target] = pickRandom(ALL_LETTERS, 1);
  const decoys = pickRandom(ALL_LETTERS, 3, [target]);
  const options = [target, ...decoys].sort(() => Math.random() - 0.5);
  return { target, options };
}

export default function QuickTapScreen() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [roundData, setRoundData] = useState<RoundData>(() => buildRound(0));
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'feedback' | 'result'>('countdown');
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [selected, setSelected] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutDuration = useRef(INITIAL_TIME);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pre-load SFX
  useEffect(() => {
    SoundManager.preload(require('../../assets/sounds/game/correct.mp3'), 'correct');
    SoundManager.preload(require('../../assets/sounds/game/wrong.mp3'), 'wrong');
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      SoundManager.unload('correct');
      SoundManager.unload('wrong');
    };
  }, []);

  // Countdown before game starts
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown === 0) {
      setPhase('playing');
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Timer bar while playing
  useEffect(() => {
    if (phase !== 'playing') return;

    setTimeLeft(timeoutDuration.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round]);

  const handleTimeout = useCallback(() => {
    setLastResult('timeout');
    setPhase('feedback');
    SoundManager.play(require('../../assets/sounds/game/wrong.mp3'), 'wrong');
    setConsecutiveCorrect(0);
    setTimeout(nextRound, 1200);
  }, []);

  const handleTap = (item: LetterItem) => {
    if (phase !== 'playing') return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelected(item.letter);
    const isCorrect = item.letter === roundData.target.letter;

    if (isCorrect) {
      setLastResult('correct');
      setScore(s => s + 1);
      setConsecutiveCorrect(c => {
        const next = c + 1;
        timeoutDuration.current = Math.max(MIN_TIME, INITIAL_TIME - next * TIME_REDUCTION);
        return next;
      });
      SoundManager.play(require('../../assets/sounds/game/correct.mp3'), 'correct');
      pulseTile();
    } else {
      setLastResult('wrong');
      setConsecutiveCorrect(0);
      timeoutDuration.current = INITIAL_TIME;
      SoundManager.play(require('../../assets/sounds/game/wrong.mp3'), 'wrong');
    }

    setPhase('feedback');
    setTimeout(nextRound, 1000);
  };

  const pulseTile = () => {
    pulseAnim.setValue(1);
    Animated.sequence([
      Animated.spring(pulseAnim, { toValue: 1.25, useNativeDriver: true }),
      Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const nextRound = useCallback(() => {
    const nextRoundNum = round + 1;
    if (nextRoundNum >= TOTAL_ROUNDS) {
      setPhase('result');
      return;
    }
    setRound(nextRoundNum);
    setRoundData(buildRound(consecutiveCorrect));
    setSelected(null);
    setLastResult(null);
    setPhase('playing');
  }, [round, consecutiveCorrect]);

  const restart = () => {
    setRound(0);
    setScore(0);
    setConsecutiveCorrect(0);
    timeoutDuration.current = INITIAL_TIME;
    setRoundData(buildRound(0));
    setSelected(null);
    setLastResult(null);
    setCountdown(3);
    setPhase('countdown');
  };

  // --- Countdown screen ---
  if (phase === 'countdown') {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.heading}>⚡ Quick Tap</Text>
        <Text style={styles.countdownLabel}>Get Ready!</Text>
        <Text style={styles.countdownNumber}>{countdown === 0 ? 'Go!' : countdown}</Text>
        <Text style={styles.rulesText}>
          Tap the letter shown at the top before time runs out!{'\n'}
          {TOTAL_ROUNDS} rounds • faster on each correct tap
        </Text>
      </View>
    );
  }

  // --- Result screen ---
  if (phase === 'result') {
    const percent = Math.round((score / TOTAL_ROUNDS) * 100);
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.heading}>⚡ Quick Tap</Text>
        <Text style={styles.resultEmoji}>
          {percent >= 80 ? '🏆' : percent >= 50 ? '🌟' : '💪'}
        </Text>
        <Text style={styles.resultScore}>{score} / {TOTAL_ROUNDS}</Text>
        <Text style={styles.resultLabel}>
          {percent >= 80 ? 'Amazing speed!' : percent >= 50 ? 'Good job!' : 'Keep practising!'}
        </Text>
        <TouchableOpacity style={styles.btn} onPress={restart}>
          <Text style={styles.btnText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const timerFraction = timeLeft / timeoutDuration.current;
  const timerColor = timerFraction > 0.5 ? '#43a047' : timerFraction > 0.25 ? '#fb8c00' : '#e53935';

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.headerRow}>
        <Text style={styles.roundLabel}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
        <Text style={styles.scoreLabel}>Score: {score}</Text>
      </View>

      {/* Timer bar */}
      <View style={styles.timerBarTrack}>
        <Animated.View
          style={[
            styles.timerBarFill,
            { width: `${timerFraction * 100}%`, backgroundColor: timerColor },
          ]}
        />
      </View>

      {/* Target letter */}
      <View style={styles.targetContainer}>
        <Text style={styles.targetLabel}>Tap this letter:</Text>
        <Animated.View style={[styles.targetCard, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.targetLetter}>{roundData.target.letter}</Text>
        </Animated.View>
      </View>

      {/* Feedback banner */}
      {phase === 'feedback' && lastResult && (
        <Text style={[
          styles.feedbackBanner,
          lastResult === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong,
        ]}>
          {lastResult === 'correct' ? 'सही! ✅' : lastResult === 'timeout' ? 'Time up! ⏰' : 'गलत! ❌'}
        </Text>
      )}

      {/* Option grid (2×2) */}
      <View style={styles.optionsGrid}>
        {roundData.options.map((item) => {
          const isSelected = selected === item.letter;
          const isTarget = item.letter === roundData.target.letter;
          let tileStyle = styles.optionTile;
          if (phase === 'feedback') {
            if (isTarget) tileStyle = { ...tileStyle, ...styles.tileCorrect } as any;
            else if (isSelected) tileStyle = { ...tileStyle, ...styles.tileWrong } as any;
          }
          return (
            <TouchableOpacity
              key={item.letter}
              style={tileStyle}
              onPress={() => handleTap(item)}
              disabled={phase !== 'playing'}
              activeOpacity={0.75}
            >
              <Text style={styles.optionLetter}>{item.letter}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fce4ec',
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: '#fce4ec',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  roundLabel: { fontSize: 16, color: '#555' },
  scoreLabel: { fontSize: 16, fontWeight: 'bold', color: '#e91e63' },
  timerBarTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 24,
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  targetContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  targetLabel: {
    fontSize: 18,
    color: '#888',
    marginBottom: 10,
  },
  targetCard: {
    width: 110,
    height: 110,
    backgroundColor: '#fff',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    borderWidth: 3,
    borderColor: '#e91e63',
  },
  targetLetter: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  feedbackBanner: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  feedbackCorrect: { color: '#43a047' },
  feedbackWrong:   { color: '#e53935' },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  optionTile: {
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    borderWidth: 2,
    borderColor: '#f48fb1',
  },
  tileCorrect: {
    borderColor: '#43a047',
    backgroundColor: '#e8f5e9',
  },
  tileWrong: {
    borderColor: '#e53935',
    backgroundColor: '#ffebee',
  },
  optionLetter: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#333',
  },
  countdownLabel: {
    fontSize: 26,
    color: '#555',
    marginBottom: 12,
  },
  countdownNumber: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 24,
  },
  rulesText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    lineHeight: 24,
  },
  resultEmoji: { fontSize: 64, marginBottom: 10 },
  resultScore: { fontSize: 48, fontWeight: 'bold', color: '#e91e63', marginBottom: 8 },
  resultLabel: { fontSize: 22, color: '#555', marginBottom: 32 },
  btn: {
    backgroundColor: '#e91e63',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 24,
    elevation: 2,
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
