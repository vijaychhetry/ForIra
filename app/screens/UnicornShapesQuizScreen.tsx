import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const shapes = [
  { id: 1, value: 'Circle', hi: 'वृत्त', emoji: '⭕', sound: require('../../assets/sounds/Shapes/01_Circle.mp3') },
  { id: 2, value: 'Square', hi: 'वर्ग', emoji: '⬛', sound: require('../../assets/sounds/Shapes/02_Square.mp3') },
  { id: 3, value: 'Triangle', hi: 'त्रिभुज', emoji: '🔺', sound: require('../../assets/sounds/Shapes/03_Triangle.mp3') },
  { id: 4, value: 'Rectangle', hi: 'आयत', emoji: '📱', sound: require('../../assets/sounds/Shapes/04_Rectangle.mp3') },
  { id: 5, value: 'Star', hi: 'तारा', emoji: '⭐', sound: require('../../assets/sounds/Shapes/05_Star.mp3') },
  { id: 6, value: 'Heart', hi: 'दिल', emoji: '❤️', sound: require('../../assets/sounds/Shapes/06_Heart.mp3') },
  { id: 7, value: 'Diamond', hi: 'हीरा', emoji: '💎', sound: require('../../assets/sounds/Shapes/07_Diamond.mp3') },
  { id: 8, value: 'Oval', hi: 'अंडाकार', emoji: '🥚', sound: require('../../assets/sounds/Shapes/08_Oval.mp3') },
  { id: 9, value: 'Pentagon', hi: 'पंचभुज', emoji: '⬡', sound: require('../../assets/sounds/Shapes/09_Pentagon.mp3') },
  { id: 10, value: 'Hexagon', hi: 'षट्भुज', emoji: '⬢', sound: require('../../assets/sounds/Shapes/10_Hexagon.mp3') },
];

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

export default function UnicornShapesQuizScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [correctSound, setCorrectSound] = useState<Audio.Sound | null>(null);
  const [wrongSound, setWrongSound] = useState<Audio.Sound | null>(null);
  const [questionSound, setQuestionSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    generateOptions(currentQuestion);
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
  }, []);

  useEffect(() => {
    if (currentQuestion < shapes.length) {
      playQuestionSound();
    }
  }, [currentQuestion]);

  const generateOptions = (questionIdx: number) => {
    const currentShape = shapes[questionIdx];
    const otherShapes = shapes.filter(s => s.id !== currentShape.id);
    const shuffledOthers = shuffle(otherShapes).slice(0, 3);
    const allOptions = shuffle([currentShape, ...shuffledOthers]);
    if (!allOptions.some(opt => opt.id === currentShape.id)) {
      allOptions[0] = currentShape;
    }
    setOptions(allOptions.map(s => s.hi));
  };

  const playQuestionSound = async () => {
    try {
      if (questionSound) {
        await questionSound.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(shapes[currentQuestion].sound);
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
    const isCorrect = selectedOption === shapes[currentQuestion].hi;

    if (isCorrect) {
      await playSound(correctSound);
      setScore(score + 1);
    } else {
      await playSound(wrongSound);
    }

    if (currentQuestion < shapes.length - 1) {
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
        <Text style={styles.score}>Your Score: {score}/{shapes.length}</Text>
        <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
          <Text style={styles.restartBtnText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🦄 Shapes Quiz</Text>
      <Text style={styles.progress}>Question {currentQuestion + 1} of {shapes.length}</Text>
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