import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const numbers = [
  { id: 1, value: '1', hi: 'एक', emoji: '1️⃣', sound: require('../../assets/sounds/Numbers/01_One.mp3') },
  { id: 2, value: '2', hi: 'दो', emoji: '2️⃣', sound: require('../../assets/sounds/Numbers/02_Two.mp3') },
  { id: 3, value: '3', hi: 'तीन', emoji: '3️⃣', sound: require('../../assets/sounds/Numbers/03_Three.mp3') },
  { id: 4, value: '4', hi: 'चार', emoji: '4️⃣', sound: require('../../assets/sounds/Numbers/04_Four.mp3') },
  { id: 5, value: '5', hi: 'पांच', emoji: '5️⃣', sound: require('../../assets/sounds/Numbers/05_Five.mp3') },
  { id: 6, value: '6', hi: 'छह', emoji: '6️⃣', sound: require('../../assets/sounds/Numbers/06_Six.mp3') },
  { id: 7, value: '7', hi: 'सात', emoji: '7️⃣', sound: require('../../assets/sounds/Numbers/07_Seven.mp3') },
  { id: 8, value: '8', hi: 'आठ', emoji: '8️⃣', sound: require('../../assets/sounds/Numbers/08_Eight.mp3') },
  { id: 9, value: '9', hi: 'नौ', emoji: '9️⃣', sound: require('../../assets/sounds/Numbers/09_Nine.mp3') },
  { id: 10, value: '10', hi: 'दस', emoji: '🔟', sound: require('../../assets/sounds/Numbers/10_Ten.mp3') },
];

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

export default function UnicornNumberQuizScreen() {
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
    if (currentQuestion < numbers.length) {
      playQuestionSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion]);

  // Always include correct answer in options
  const generateOptions = (questionIdx: number) => {
    const currentNumber = numbers[questionIdx];
    const otherNumbers = numbers.filter(n => n.id !== currentNumber.id);
    const shuffledOthers = shuffle(otherNumbers).slice(0, 3);
    const allOptions = shuffle([currentNumber, ...shuffledOthers]);
    // Ensure correct answer is present
    if (!allOptions.some(opt => opt.value === currentNumber.value)) {
      allOptions[0] = currentNumber;
    }
    setOptions(allOptions.map(n => n.value));
  };

  const playQuestionSound = async () => {
    try {
      if (questionSound) {
        await questionSound.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(numbers[currentQuestion].sound);
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
    const isCorrect = selectedOption === numbers[currentQuestion].value;

    if (isCorrect) {
      await playSound(correctSound);
      setScore(score + 1);
    } else {
      await playSound(wrongSound);
    }

    if (currentQuestion < numbers.length - 1) {
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
        <Text style={styles.score}>Your Score: {score}/{numbers.length}</Text>
        <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
          <Text style={styles.restartBtnText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🦄 Number Quiz- Ira</Text>
      <Text style={styles.progress}>Question {currentQuestion + 1} of {numbers.length}</Text>
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
    color: '#ff9800',
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
    backgroundColor: '#ff9800',
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
    fontSize: 24,
    color: '#333',
  },
  restartBtn: {
    backgroundColor: '#ff9800',
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