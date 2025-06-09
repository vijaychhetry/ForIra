// QuizScreen.tsx
// This file implements a Hindi alphabet quiz for letters अ to अः.
// The quiz randomly generates questions of two types:
// 1. Shows an image and asks the user to select the correct letter from options.
// 2. Shows a letter and asks the user to select the correct image from options.
// The user's score and a 🦄 unicorn reward are displayed for each correct answer. 
// Feedback is shown for correct and wrong answers.

import LottieView from '@/components/LottieWrapper';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Dimensions, Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import confettiAnimation from '../../assets/animations/congrats.json';
import { hindiLetters as letters } from '../constants/hindiLetters';
import { playSoundAsync } from '../helpers/audioHelpers';

function generateQuestions() {
  const imageToLetter = letters.slice(0, 6).map((item) => {
    const options = [item.letter];
    while (options.length < 4) {
      const random = letters[Math.floor(Math.random() * letters.length)].letter;
      if (!options.includes(random)) options.push(random);
    }
    options.sort(() => Math.random() - 0.5);
    return {
      type: 'image-to-letter',
      image: item.image,
      answer: item.letter,
      options,
      question: 'Which letter is shown in the image?',
    };
  });

  const letterToImage = letters.slice(6).map((item) => {
    const options = [item];
    while (options.length < 4) {
      const random = letters[Math.floor(Math.random() * letters.length)];
      if (!options.find(o => o.letter === random.letter)) options.push(random);
    }
    options.sort(() => Math.random() - 0.5);
    return {
      type: 'letter-to-image',
      letter: item.letter,
      answer: item.image,
      options: options.map(o => o.image),
      question: `Select the image for letter "${item.letter}"`,
    };
  });

  return [...imageToLetter, ...letterToImage];
}

const questions = generateQuestions();

export default function QuizScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [reward, setReward] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [muted, setMuted] = useState(false);
  const [flyUnicorn, setFlyUnicorn] = useState<{ x: number, y: number } | null>(null);
  const flyAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const q = questions[current];

  // Play audio for the correct letter
  const playLetterSound = async () => {
    let letterObj;
    if (q.type === 'image-to-letter') {
      letterObj = letters.find(l => l.letter === q.answer);
    } else if (q.type === 'letter-to-image') {
      letterObj = letters.find(l => l.letter === q.letter);
    }
    if (letterObj && letterObj.sound) {
      await playSoundAsync(letterObj.sound);
    }
  };

  const handleOption = async (idx: number) => {
    setSelected(idx);
    let isCorrect = false;
    if (
      (q.type === 'image-to-letter' && q.options[idx] === q.answer) ||
      (q.type === 'letter-to-image' && q.options[idx] === q.answer)
    ) {
      setReward(r => [...r, '🦄']);
      setScore(score + 1);
      setFeedback('Correct! 🦄');
      isCorrect = true;
      if (!muted) await playLetterSound();
    } else {
      setReward(reward.slice(0, -1));
      setFeedback('Wrong! Try next.');
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setFeedback(null);
    } else {
      setShowResult(true);
      setShowCongrats(true);
      setTimeout(() => setShowCongrats(false), 3000); // Hide animation after 3s
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setReward([]);
    setFeedback(null);
    setShowCongrats(false);
  };

  return (
    <View style={quizStyles.container}>
      {/* Reward row at top */}
      <View style={quizStyles.rewardRow}>
        {reward.map((r, i) => (
          <ThemedText key={i} style={quizStyles.reward}>{r}</ThemedText>
        ))}
      </View>
      {!showResult ? (
        <View style={quizStyles.quizBlock}>
          <ThemedText type="title" style={quizStyles.question}>
            {q.question}
          </ThemedText>
          {q.type === 'image-to-letter' && (
            <Image source={q.image} style={quizStyles.quizImage} />
          )}
          {q.type === 'image-to-letter' && (
            <View style={quizStyles.optionsGrid}>
              {q.options.map((opt, idx) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    quizStyles.optionTile,
                    selected === idx && {
                      backgroundColor: q.options[idx] === q.answer ? '#c8e6c9' : '#ffcdd2',
                      borderColor: q.options[idx] === q.answer ? '#4caf50' : '#f44336',
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleOption(idx)}
                  disabled={selected !== null}
                  activeOpacity={0.85}
                >
                  <Text style={quizStyles.optionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {q.type === 'letter-to-image' && (
            <View style={quizStyles.imageOptionsRow}>
              {q.options.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleOption(idx)}
                  disabled={selected !== null}
                  style={[
                    quizStyles.imageOption,
                    selected === idx && {
                      borderColor:
                        q.options[idx] === q.answer ? '#4caf50' : '#f44336',
                      borderWidth: 3,
                    },
                  ]}
                  activeOpacity={0.85}
                >
                  <Image source={img} style={quizStyles.quizImageSmall} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {feedback && (
            <Text
              style={{
                color: feedback.startsWith('Correct') ? '#4caf50' : '#f44336',
                textAlign: 'center',
                marginVertical: 8,
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              {feedback}
            </Text>
          )}
          <View style={quizStyles.nav}>
            <Pressable
              style={({ pressed }) => [
                quizStyles.navBtn,
                { backgroundColor: pressed ? '#e3e3e3' : '#1976d2' },
              ]}
              onPress={handleNext}
              disabled={selected === null}
            >
              <Text style={quizStyles.navBtnText}>
                {current === questions.length - 1 ? 'Finish' : 'Next ▶'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          {Platform.OS !== 'web' && showCongrats && (
            <LottieView
              source={confettiAnimation}
              autoPlay
              loop={false}
              style={{ width: 200, height: 200, marginBottom: 16 }}
            />
          )}
          <ThemedText type="title">🎉 Congratulations! 🎉</ThemedText>
          <ThemedText style={quizStyles.score}>
            Your score: {score} / {questions.length}
          </ThemedText>
          <View style={quizStyles.rewardRow}>
            {reward.map((r, i) => (
              <ThemedText key={i} style={quizStyles.reward}>{r}</ThemedText>
            ))}
          </View>
          <View style={quizStyles.nav}>
            <Pressable
              style={({ pressed }) => [
                quizStyles.navBtn,
                { backgroundColor: pressed ? '#e3e3e3' : '#1976d2' },
              ]}
              onPress={handleRestart}
            >
              <Text style={quizStyles.navBtnText}>Restart Quiz</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                quizStyles.navBtn,
                { backgroundColor: pressed ? '#e3e3e3' : '#ff9800' },
              ]}
              onPress={() => router.push('/(tabs)/quiz/QuizScreen2')}
            >
              <Text style={quizStyles.navBtnText}>Try Match Quiz</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get('window');
const TILE_WIDTH = width * 0.85;

const quizStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    minHeight: height,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 0, // Changed from 10 to 0 to reduce space below reward
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 20,
  },
  reward: {
    fontSize: 20,
    marginHorizontal: 2,
  },
  quizBlock: {
    alignItems: 'center',
    marginTop: 0,
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start', // Changed from 'center' to 'flex-start'
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
    marginTop: 10, // Add a small margin above the question
    textAlign: 'center',
  },
  quizImage: {
    width: 180,
    height: 180,
    marginBottom: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1976d2',
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 18,
  },
  optionTile: {
    minWidth: 80,
    minHeight: 80,
    backgroundColor: '#fff',
    borderRadius: 18,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  optionText: {
    fontSize: 36,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  imageOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 18,
  },
  imageOption: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 18,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  quizImageSmall: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1976d2',
    backgroundColor: '#fff',
  },
  nav: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtn: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 30,
    backgroundColor: '#1976d2',
    elevation: 2,
    minWidth: 120,
    alignItems: 'center',
  },
  navBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  score: {
    fontSize: 28,
    marginTop: 8,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
});