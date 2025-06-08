// QuizScreen.tsx
// This file implements a Hindi alphabet quiz for letters अ to अः.
// The quiz randomly generates questions of two types:
// 1. Shows an image and asks the user to select the correct letter from options.
// 2. Shows a letter and asks the user to select the correct image from options.
// The user's score and a 🦄 unicorn reward are displayed for each correct answer. 
// Feedback is shown for correct and wrong answers.

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native'; // Make sure you have lottie-react-native installed
import { useRef, useState } from 'react';
import { Animated, Button, Easing, Image, TouchableOpacity, View } from 'react-native';
import confettiAnimation from '../../assets/animations/congrats.json'; // Place your animation here
import { hindiLetters as letters } from '../constants/hindiLetters';
import { quizScreenStyles as styles } from './QuizScreen.styles';

// Generate quiz questions: some ask for letter given image, some ask for image given letter
function generateQuestions() {
  // 1. Show image, ask for letter (first 6)
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

  // 2. Show letter, ask for image (next 6)
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

const questions = generateQuestions(); // <-- Add parentheses to call the function

export default function QuizScreen() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [reward, setReward] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
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
      try {
        const { sound } = await Audio.Sound.createAsync(letterObj.sound);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } catch (e) {
        // Optionally handle error
      }
    }
  };

  // Helper to get position of the pressed tile
  const tileRefs = useRef<(View | null)[]>([]);

  const handleOption = async (idx: number) => {
    setSelected(idx);
    let isCorrect = false;
    if (
      (q.type === 'image-to-letter' && q.options[idx] === q.answer) ||
      (q.type === 'letter-to-image' && q.options[idx] === q.answer)
    ) {
      // Get tile position for both question types
      tileRefs.current[idx]?.measure((fx, fy, width, height, px, py) => {
        setFlyUnicorn({ x: px, y: py });
        flyAnim.setValue({ x: px, y: py });
        // Animate to top reward row (adjust x/y as needed for your layout)
        Animated.timing(flyAnim, {
          toValue: { x: 180, y: 60 },
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }).start(() => {
          setReward(r => [...r, '🦄']);
          setFlyUnicorn(null);
        });
      });
      setScore(score + 1);
      setFeedback('Correct! 🦄');
      isCorrect = true;
      await playLetterSound();
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
    <ThemedView style={styles.container}>
      {/* Flying unicorn animation */}
      {flyUnicorn && (
        <Animated.View
          style={{
            position: 'absolute',
            left: flyAnim.x,
            top: flyAnim.y,
            zIndex: 10,
          }}
        >
          <ThemedText style={{ fontSize: 32 }}>🦄</ThemedText>
        </Animated.View>
      )}
      <View style={styles.rewardRow}>
        {reward.map((r, i) => (
          <ThemedText key={i} style={styles.reward}>{r}</ThemedText>
        ))}
      </View>
      {!showResult ? (
        <View>
          <ThemedText type="title" style={styles.question}>
            {q.question}
          </ThemedText>
          {q.type === 'image-to-letter' && (
            <Image source={q.image} style={styles.quizImage} />
          )}
          {q.type === 'image-to-letter' && (
            <View style={styles.optionsGrid}>
              {q.options.map((opt, idx) => (
                <TouchableOpacity
                  key={opt}
                  ref={ref => (tileRefs.current[idx] = ref)}
                  style={[
                    styles.optionTile,
                    selected === idx && {
                      backgroundColor: q.options[idx] === q.answer ? '#c8e6c9' : '#ffcdd2',
                      borderColor: q.options[idx] === q.answer ? '#4caf50' : '#f44336',
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleOption(idx)}
                  disabled={selected !== null}
                >
                  <ThemedText style={styles.optionText}>{opt}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {q.type === 'letter-to-image' && (
            <View style={styles.imageOptionsRow}>
              {q.options.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  ref={ref => (tileRefs.current[idx] = ref)}
                  onPress={() => handleOption(idx)}
                  disabled={selected !== null}
                  style={[
                    styles.imageOption,
                    selected === idx && {
                      borderColor:
                        q.options[idx] === q.answer ? '#4caf50' : '#f44336',
                      borderWidth: 3,
                    },
                  ]}
                >
                  <Image source={img} style={styles.quizImageSmall} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {feedback && (
            <ThemedText
              style={{
                color: feedback.startsWith('Correct') ? '#4caf50' : '#f44336',
                textAlign: 'center',
                marginVertical: 8,
                fontSize: 18,
              }}
            >
              {feedback}
            </ThemedText>
          )}
          <View style={{ marginTop: 16 }}>
            <Button
              title={current === questions.length - 1 ? 'Finish' : 'Next'}
              onPress={handleNext}
              disabled={selected === null}
            />
          </View>
        </View>
      ) : (
        <View style={{ alignItems: 'center' }}>
          {showCongrats && (
            <LottieView
              source={confettiAnimation}
              autoPlay
              loop={false}
              style={{ width: 200, height: 200, marginBottom: 16 }}
            />
          )}
          <ThemedText type="title">🎉 Congratulations! 🎉</ThemedText>
          <ThemedText style={styles.score}>
            Your score: {score} / {questions.length}
          </ThemedText>
          <View style={styles.rewardRow}>
            {reward.map((r, i) => (
              <ThemedText key={i} style={styles.reward}>{r}</ThemedText>
            ))}
          </View>
          <Button title="Restart Quiz" onPress={handleRestart} />
        </View>
      )}
    </ThemedView>
  );
}