// QuizScreen2.tsx
// This file implements a Hindi alphabet quiz for letters अ to अः.
// The quiz randomly generates questions of two types based on audio:
// 1. Plays audio and asks the user to select the correct letter from options.
// 2. Plays audio and asks the user to select the correct image from options.
// The user's score and a ❤️ heart reward are displayed for each correct answer. 
// Feedback is shown for correct and wrong answers.

// import LottieView from '@/components/LottieWrapper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRef, useState } from 'react';
import { Animated, Button, Image, TouchableOpacity, View } from 'react-native';
import { hindiLetters as letters } from '../constants/hindiLetters';
import { playSoundAsync } from '../helpers/audioHelpers';
import { quiz2Styles } from './QuizScreen2.styles'; // <-- Import styles from separate file

function generateQuestions() {
  const audioToLetter = letters.slice(0, 6).map((item) => {
    const options = [item.letter];
    while (options.length < 4) {
      const random = letters[Math.floor(Math.random() * letters.length)].letter;
      if (!options.includes(random)) options.push(random);
    }
    options.sort(() => Math.random() - 0.5);
    return {
      type: 'audio-to-letter',
      sound: item.sound,
      answer: item.letter,
      options,
      question: 'Listen and select the correct letter:',
    };
  });

  const audioToImage = letters.slice(6).map((item) => {
    const options = [item];
    while (options.length < 4) {
      const random = letters[Math.floor(Math.random() * letters.length)];
      if (!options.find(o => o.letter === random.letter)) options.push(random);
    }
    options.sort(() => Math.random() - 0.5);
    return {
      type: 'audio-to-image',
      sound: item.sound,
      answer: item.image,
      options: options.map(o => o.image),
      question: 'Listen and select the correct image:',
      letter: item.letter,
    };
  });

  return [...audioToLetter, ...audioToImage];
}

const questions = generateQuestions();

export default function QuizScreen2() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [reward, setReward] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  // For flying heart animation
  const [flyHeart, setFlyHeart] = useState<{ x: number, y: number } | null>(null);
  const flyAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const q = questions[current];

  // Play the audio for the question
  const playQuestionAudio = async () => {
    await playSoundAsync(q.sound);
  };

  const handleOption = async (idx: number) => {
    setSelected(idx);
    if (
      (q.type === 'audio-to-letter' && q.options[idx] === q.answer) ||
      (q.type === 'audio-to-image' && q.options[idx] === q.answer)
    ) {
      setReward(r => [...r, '❤️']);
      setScore(score + 1);
      setFeedback('Correct! ❤️');
      await playSoundAsync(q.sound);
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
      setTimeout(() => {
        const nextQ = questions[current + 1];
        if (nextQ && nextQ.sound) {
          playSoundAsync(nextQ.sound);
        }
      }, 2000); // <-- 2 second delay
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setReward([]);
    setFeedback(null);
  };

  // Helper to chunk options into rows of 2 for 2x2 grid
  function chunkOptions<T>(arr: T[]) {
    return [arr.slice(0, 2), arr.slice(2, 4)];
  }

  return (
    <ThemedView style={quiz2Styles.container}>
      {/* Reward row at top */}
      <View style={quiz2Styles.rewardRow}>
        {reward.map((r, i) => (
          <ThemedText key={i} style={quiz2Styles.reward}>{r}</ThemedText>
        ))}
      </View>
      {!showResult ? (
        <View style={quiz2Styles.quizBlock}>
          <ThemedText type="title" style={quiz2Styles.question}>
            {q.question}
          </ThemedText>
          <Button title="🔊 Play Audio" onPress={playQuestionAudio} />
          {q.type === 'audio-to-letter' && (
            <View style={quiz2Styles.optionsGrid2x2}>
              {chunkOptions(q.options).map((row, rowIdx) => (
                <View key={rowIdx} style={quiz2Styles.optionsRow}>
                  {row.map((opt, idx) => {
                    const globalIdx = rowIdx * 2 + idx;
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[
                          quiz2Styles.optionTile2x2,
                          selected === globalIdx && {
                            backgroundColor: q.options[globalIdx] === q.answer ? '#c8e6c9' : '#ffcdd2',
                            borderColor: q.options[globalIdx] === q.answer ? '#4caf50' : '#f44336',
                            borderWidth: 2,
                          },
                        ]}
                        onPress={() => handleOption(globalIdx)}
                        disabled={selected !== null}
                        activeOpacity={0.85}
                      >
                        <ThemedText style={quiz2Styles.optionText2x2}>{opt}</ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          )}
          {q.type === 'audio-to-image' && (
            <View style={quiz2Styles.optionsGrid2x2}>
              {chunkOptions(q.options).map((row, rowIdx) => (
                <View key={rowIdx} style={quiz2Styles.optionsRow}>
                  {row.map((img, idx) => {
                    const globalIdx = rowIdx * 2 + idx;
                    return (
                      <TouchableOpacity
                        key={globalIdx}
                        onPress={() => handleOption(globalIdx)}
                        disabled={selected !== null}
                        style={[
                          quiz2Styles.optionTile2x2,
                          { padding: 0 },
                          selected === globalIdx && {
                            borderColor:
                              q.options[globalIdx] === q.answer ? '#4caf50' : '#f44336',
                            borderWidth: 3,
                          },
                        ]}
                        activeOpacity={0.85}
                      >
                        <Image source={img} style={quiz2Styles.tileImage2x2} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
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
          <View style={quiz2Styles.nav}>
            <TouchableOpacity
              style={[
                quiz2Styles.navBtn,
                { backgroundColor: selected === null ? '#bdbdbd' : '#1976d2' },
              ]}
              onPress={handleNext}
              disabled={selected === null}
              activeOpacity={0.85}
            >
              <ThemedText style={quiz2Styles.navBtnText}>
                {current === questions.length - 1 ? 'Finish' : 'Next ▶'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={quiz2Styles.resultBlock}>
          <ThemedText type="title">🎉 Congratulations! 🎉</ThemedText>
          <ThemedText style={quiz2Styles.score}>
            Your score: {score} / {questions.length}
          </ThemedText>
          <View style={quiz2Styles.rewardRow}>
            {reward.map((r, i) => (
              <ThemedText key={i} style={quiz2Styles.reward}>{r}</ThemedText>
            ))}
          </View>
          <TouchableOpacity style={quiz2Styles.navBtn} onPress={handleRestart}>
            <ThemedText style={quiz2Styles.navBtnText}>Restart Quiz</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}