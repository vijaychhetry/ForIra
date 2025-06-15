import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const numbers = [
  { id: 1, value: 'One', hi: 'एक', emoji: '1️⃣', sound: require('../../assets/sounds/Numbers/01_One.mp3') },
  { id: 2, value: 'Two', hi: 'दो', emoji: '2️⃣', sound: require('../../assets/sounds/Numbers/02_Two.mp3') },
  { id: 3, value: 'Three', hi: 'तीन', emoji: '3️⃣', sound: require('../../assets/sounds/Numbers/03_Three.mp3') },
  { id: 4, value: 'Four', hi: 'चार', emoji: '4️⃣', sound: require('../../assets/sounds/Numbers/04_Four.mp3') },
  { id: 5, value: 'Five', hi: 'पांच', emoji: '5️⃣', sound: require('../../assets/sounds/Numbers/05_Five.mp3') },
  { id: 6, value: 'Six', hi: 'छह', emoji: '6️⃣', sound: require('../../assets/sounds/Numbers/06_Six.mp3') },
  { id: 7, value: 'Seven', hi: 'सात', emoji: '7️⃣', sound: require('../../assets/sounds/Numbers/07_Seven.mp3') },
  { id: 8, value: 'Eight', hi: 'आठ', emoji: '8️⃣', sound: require('../../assets/sounds/Numbers/08_Eight.mp3') },
  { id: 9, value: 'Nine', hi: 'नौ', emoji: '9️⃣', sound: require('../../assets/sounds/Numbers/09_Nine.mp3') },
  { id: 10, value: 'Ten', hi: 'दस', emoji: '🔟', sound: require('../../assets/sounds/Numbers/10_Ten.mp3') },
];

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

export default function UnicornNumbersQuizScreen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [options, setOptions] = useState<{ id: number; value: string; emoji: string }[]>([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [correctSound, setCorrectSound] = useState<Audio.Sound | null>(null);
  const [wrongSound, setWrongSound] = useState<Audio.Sound | null>(null);
  const [questionSound, setQuestionSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    // Load sounds when component mounts
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

    // Cleanup sounds when component unmounts
    return () => {
      correctSound?.unloadAsync();
      wrongSound?.unloadAsync();
      questionSound?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    // Play question sound when current question changes
    const playQuestionSound = async () => {
      if (questionSound) {
        await questionSound.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(numbers[currentQuestionIndex].sound);
      setQuestionSound(sound);
      await sound.playAsync();
    };

    playQuestionSound();
  }, [currentQuestionIndex]);

  const generateOptions = () => {
    const currentNumber = numbers[currentQuestionIndex];
    const otherNumbers = numbers.filter(n => n.id !== currentNumber.id);
    const randomOptions = shuffle(otherNumbers).slice(0, 3);
    const allOptions = shuffle([currentNumber, ...randomOptions]);
    return allOptions.map(option => ({
      id: option.id,
      value: option.hi,
      emoji: option.emoji
    }));
  };

  useEffect(() => {
    setOptions(generateOptions());
  }, [currentQuestionIndex]);

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

  const handleAnswer = (selectedOption: { id: number; value: string; emoji: string }) => {
    const currentNumber = numbers[currentQuestionIndex];
    if (selectedOption.id === currentNumber.id) {
      playSound(correctSound);
      setScore(score + 1);
    } else {
      playSound(wrongSound);
    }

    if (currentQuestionIndex < numbers.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
  };

  if (showResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Numbers Quiz</Text>
        <Text style={styles.resultText}>Your Score: {score}/{numbers.length}</Text>
        <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
          <Text style={styles.restartButtonText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Numbers Quiz</Text>
      <Text style={styles.score}>Score: {score}</Text>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Listen and select the correct number</Text>
        <TouchableOpacity style={styles.soundButton} onPress={() => playSound(questionSound)}>
          <Text style={styles.soundButtonText}>🔊 Play Sound</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionButton}
            onPress={() => handleAnswer(option)}
          >
            <Text style={styles.optionText}>{option.value}</Text>
            <Text style={styles.optionEmoji}>{option.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
    padding: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 20,
  },
  score: {
    fontSize: 24,
    color: '#43a047',
    marginBottom: 20,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  questionText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 15,
  },
  soundButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
  },
  soundButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    width: '45%',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 5,
  },
  optionEmoji: {
    fontSize: 24,
  },
  resultText: {
    fontSize: 24,
    color: '#333',
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: '#43a047',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 