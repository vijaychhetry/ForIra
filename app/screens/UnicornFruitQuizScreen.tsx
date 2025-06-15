import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
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
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [correctSound, setCorrectSound] = useState<Audio.Sound | null>(null);
  const [wrongSound, setWrongSound] = useState<Audio.Sound | null>(null);
  const [questionSound, setQuestionSound] = useState<Audio.Sound | null>(null);

  // Always generate options when question changes
  useEffect(() => {
    generateOptions(currentQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion]);

  useEffect(() => {
    const loadSounds = async () => {
      const { sound: correct } = await Audio.Sound.createAsync(
        require('../../assets/sounds/game/correct.mp3')
      );
      const { sound: wrong } = await Audio.Sound.createAsync(
        require('../../assets/sounds/game/wrong.mp3')
      );
      setCorrectSound(correct);
      setWrongSound(wrong);
    };

    loadSounds();

    return () => {
      correctSound?.unloadAsync();
      wrongSound?.unloadAsync();
      questionSound?.unloadAsync();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentQuestion < fruits.length) {
      playQuestionSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion]);

  // Always include correct answer in options
  const generateOptions = (questionIdx: number) => {
    const currentFruit = fruits[questionIdx];
    const otherFruits = fruits.filter(f => f.id !== currentFruit.id);
    const shuffledOthers = shuffle(otherFruits).slice(0, 3);
    const allOptions = shuffle([currentFruit, ...shuffledOthers]);
    // Ensure correct answer is present
    if (!allOptions.some(opt => opt.id === currentFruit.id)) {
      allOptions[0] = currentFruit;
    }
    setOptions(allOptions.map(f => f.hi));
  };

  const playQuestionSound = async () => {
    try {
      if (questionSound) {
        await questionSound.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(fruits[currentQuestion].sound);
      setQuestionSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing question sound:', error);
    }
  };

  const playSound = async (sound: Audio.Sound | null) => {
    try {
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const handleAnswer = async (selectedOption: string) => {
    const isCorrect = selectedOption === fruits[currentQuestion].hi;

    if (isCorrect) {
      await playSound(correctSound);
      setScore(score + 1);
    } else {
      await playSound(wrongSound);
    }

    if (currentQuestion < fruits.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(q => {
          const nextQ = q + 1;
          generateOptions(nextQ);
          return nextQ;
        });
      }, 1000);
    } else {
      setTimeout(() => {
        setShowResult(true);
      }, 1000);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    generateOptions(0);
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