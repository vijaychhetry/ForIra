import { Audio } from 'expo-av';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const fruits = [
  { id: 1, value: 'Apple', hi: 'सेब', emoji: '🍎', sound: require('../../assets/sounds/Fruits/01_Apple.mp3') },
  { id: 2, value: 'Banana', hi: 'केला', emoji: '🍌', sound: require('../../assets/sounds/Fruits/02_Banana.mp3') },
  { id: 3, value: 'Orange', hi: 'संतरा', emoji: '🍊', sound: require('../../assets/sounds/Fruits/03_Orange.mp3') },
  { id: 4, value: 'Mango', hi: 'आम', emoji: '🥭', sound: require('../../assets/sounds/Fruits/04_Mango.mp3') },
  { id: 5, value: 'Grapes', hi: 'अंगूर', emoji: '🍇', sound: require('../../assets/sounds/Fruits/05_Grapes.mp3') },
  { id: 6, value: 'Pineapple', hi: 'अनानास', emoji: '🍍', sound: require('../../assets/sounds/Fruits/06_Pineapple.mp3') },
  { id: 7, value: 'Watermelon', hi: 'तरबूज', emoji: '🍉', sound: require('../../assets/sounds/Fruits/07_Watermelon.mp3') },
  { id: 8, value: 'Pomegranate', hi: 'अनार', emoji: '🍐', sound: require('../../assets/sounds/Fruits/08_Pomegranate.mp3') },
  { id: 9, value: 'Guava', hi: 'अमरूद', emoji: '🍐', sound: require('../../assets/sounds/Fruits/09_Guava.mp3') },
  { id: 10, value: 'Papaya', hi: 'पपीता', emoji: '🥭', sound: require('../../assets/sounds/Fruits/10_Papaya.mp3') },
];

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

export default function UnicornFruitQuizScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // BUG-001 fix: use refs so cleanup always has the current sound object
  const correctSoundRef = useRef<Audio.Sound | null>(null);
  const wrongSoundRef = useRef<Audio.Sound | null>(null);
  const questionSoundRef = useRef<Audio.Sound | null>(null);

  // BUG-006 fix: generate options with useMemo so they don't re-shuffle on every render
  const options = useMemo(() => {
    const current = fruits[currentQuestion];
    const others = shuffle(fruits.filter(f => f.id !== current.id)).slice(0, 3);
    return shuffle([current, ...others]).map(f => f.hi);
  }, [currentQuestion]);

  // Load correct/wrong SFX once and clean up via refs
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { sound: correct } = await Audio.Sound.createAsync(
          require('../../assets/sounds/game/correct.mp3')
        );
        const { sound: wrong } = await Audio.Sound.createAsync(
          require('../../assets/sounds/game/wrong.mp3')
        );
        if (mounted) {
          correctSoundRef.current = correct;
          wrongSoundRef.current = wrong;
        } else {
          // Component unmounted before load finished — clean up immediately
          correct.unloadAsync().catch(() => {});
          wrong.unloadAsync().catch(() => {});
        }
      } catch (e) {
        console.warn('Failed to load SFX:', e);
      }
    };
    load();
    return () => {
      mounted = false;
      correctSoundRef.current?.unloadAsync().catch(() => {});
      wrongSoundRef.current?.unloadAsync().catch(() => {});
      questionSoundRef.current?.unloadAsync().catch(() => {});
      correctSoundRef.current = null;
      wrongSoundRef.current = null;
      questionSoundRef.current = null;
    };
  }, []);

  // Play question sound whenever currentQuestion changes
  useEffect(() => {
    if (currentQuestion < fruits.length) {
      playQuestionSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion]);

  const playQuestionSound = async () => {
    try {
      if (questionSoundRef.current) {
        await questionSoundRef.current.unloadAsync();
        questionSoundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(fruits[currentQuestion].sound);
      questionSoundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.warn('Error playing question sound:', e);
    }
  };

  const playSFX = async (soundRef: React.RefObject<Audio.Sound | null>) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch (e) {
      console.warn('Error playing SFX:', e);
    }
  };

  const handleAnswer = async (selectedOption: string) => {
    const isCorrect = selectedOption === fruits[currentQuestion].hi;

    if (isCorrect) {
      await playSFX(correctSoundRef);
      setScore(s => s + 1);
    } else {
      await playSFX(wrongSoundRef);
    }

    setTimeout(() => {
      if (currentQuestion < fruits.length - 1) {
        setCurrentQuestion(q => q + 1);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
  };

  if (showResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>🎉 Quiz Complete! 🎉</Text>
        <Text style={styles.score}>Your Score: {score}/{fruits.length}</Text>
        <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
          <Text style={styles.restartBtnText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🦄 Fruits Quiz</Text>
      <Text style={styles.progress}>Question {currentQuestion + 1} of {fruits.length}</Text>
      <Text style={styles.score}>Score: {score}</Text>

      <TouchableOpacity style={styles.soundButton} onPress={playQuestionSound}>
        <Text style={styles.soundButtonText}>🔊 Play Sound</Text>
      </TouchableOpacity>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleAnswer(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 20,
  },
  progress: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  soundButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 30,
    elevation: 2,
  },
  soundButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsContainer: {
    width: '100%',
    gap: 15,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
  restartBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    elevation: 2,
  },
  restartBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
