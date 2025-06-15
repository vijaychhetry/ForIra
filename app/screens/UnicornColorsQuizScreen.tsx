import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const colors = [
  { id: 1, value: 'Red', hi: 'लाल', emoji: '🔴', sound: require('../../assets/sounds/Colors/01_Red.mp3') },
  { id: 2, value: 'Blue', hi: 'नीला', emoji: '🔵', sound: require('../../assets/sounds/Colors/02_Blue.mp3') },
  { id: 3, value: 'Green', hi: 'हरा', emoji: '🟢', sound: require('../../assets/sounds/Colors/03_Green.mp3') },
  { id: 4, value: 'Yellow', hi: 'पीला', emoji: '🟡', sound: require('../../assets/sounds/Colors/04_Yellow.mp3') },
  { id: 5, value: 'Purple', hi: 'बैंगनी', emoji: '🟣', sound: require('../../assets/sounds/Colors/05_Purple.mp3') },
  { id: 6, value: 'Orange', hi: 'नारंगी', emoji: '🟠', sound: require('../../assets/sounds/Colors/06_Orange.mp3') },
  { id: 7, value: 'Pink', hi: 'गुलाबी', emoji: '💗', sound: require('../../assets/sounds/Colors/07_Pink.mp3') },
  { id: 8, value: 'Brown', hi: 'भूरा', emoji: '🟤', sound: require('../../assets/sounds/Colors/08_Brown.mp3') },
  { id: 9, value: 'Black', hi: 'काला', emoji: '⚫', sound: require('../../assets/sounds/Colors/09_Black.mp3') },
  { id: 10, value: 'White', hi: 'सफेद', emoji: '⚪', sound: require('../../assets/sounds/Colors/10_White.mp3') },
];

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

export default function UnicornColorsQuizScreen() {
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
    if (currentQuestion < colors.length) {
      playQuestionSound();
    }
  }, [currentQuestion]);

  const generateOptions = (questionIdx: number) => {
    const currentColor = colors[questionIdx];
    const otherColors = colors.filter(c => c.id !== currentColor.id);
    const shuffledOthers = shuffle(otherColors).slice(0, 3);
    const allOptions = shuffle([currentColor, ...shuffledOthers]);
    if (!allOptions.some(opt => opt.id === currentColor.id)) {
      allOptions[0] = currentColor;
    }
    setOptions(allOptions.map(c => c.hi));
  };

  const playQuestionSound = async () => {
    try {
      if (questionSound) {
        await questionSound.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(colors[currentQuestion].sound);
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
    const isCorrect = selectedOption === colors[currentQuestion].hi;

    if (isCorrect) {
      await playSound(correctSound);
      setScore(score + 1);
    } else {
      await playSound(wrongSound);
    }

    if (currentQuestion < colors.length - 1) {
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
        <Text style={styles.score}>Your Score: {score}/{colors.length}</Text>
        <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
          <Text style={styles.restartBtnText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🦄 Colors Quiz</Text>
      <Text style={styles.progress}>Question {currentQuestion + 1} of {colors.length}</Text>
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