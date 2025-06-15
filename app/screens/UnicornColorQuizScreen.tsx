import { useEffect, useState } from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';
import { playSoundAsync } from '../helpers/audioHelpers';
import { unicornQuizStyles } from './UnicornColorQuizScreen.styles';

const colors = [
  { en: 'Red', hi: 'लाल', sound: require('../../assets/sounds/Colors/01_Red.mp3'), emoji: '🦄' },
  { en: 'Blue', hi: 'नीला', sound: require('../../assets/sounds/Colors/02_Blue.mp3'), emoji: '🦄' },
  { en: 'Green', hi: 'हरा', sound: require('../../assets/sounds/Colors/03_Green.mp3'), emoji: '🦄' },
  { en: 'Yellow', hi: 'पीला', sound: require('../../assets/sounds/Colors/04_Yellow.mp3'), emoji: '🦄' },
  { en: 'Purple', hi: 'बैंगनी', sound: require('../../assets/sounds/Colors/05_Purple.mp3'), emoji: '🦄' },
  { en: 'Pink', hi: 'गुलाबी', sound: require('../../assets/sounds/Colors/07_Pink.mp3'), emoji: '🦄' },
];

function generateQuestions() {
  return colors.map((color) => {
    const others = colors.filter(c => c.hi !== color.hi);
    const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [...shuffled, color].sort(() => 0.5 - Math.random());
    return {
      sound: color.sound,
      answer: color.hi,
      options,
      question: '🌈 सुनिए और सही रंग चुनिए:',
      emoji: color.emoji,
    };
  });
}

const questions = generateQuestions();

function chunkOptions<T>(arr: T[]) {
  return [arr.slice(0, 2), arr.slice(2, 4)];
}

export default function UnicornColorQuizScreen() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [reward, setReward] = useState<string[]>([]);

  const q = questions[current];

  useEffect(() => {
    playSoundAsync(q.sound);
  }, [current, showResult]);

  const handlePlay = async () => {
    await playSoundAsync(q.sound);
  };

  const handleOption = (idx: number) => {
    setSelected(idx);
    if (q.options[idx].hi === q.answer) {
      setScore(score + 1);
      setReward(r => [...r, '🦄']);
      setFeedback('सही! 🦄');
    } else {
      setReward(r => r.slice(0, -1));
      setFeedback('गलत! ❌');
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setFeedback(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setFeedback(null);
    setReward([]);
  };

  return (
    <View style={unicornQuizStyles.container}>
      <View style={unicornQuizStyles.rewardRow}>
        {reward.map((r, i) => (
          <Text key={i} style={unicornQuizStyles.reward}>{r}</Text>
        ))}
      </View>
      {!showResult ? (
        <View style={unicornQuizStyles.quizBlock}>
          <Text style={unicornQuizStyles.question}>{q.question}</Text>
          <Button title="🔊 Play Audio" onPress={handlePlay} />
          <View style={unicornQuizStyles.optionsGrid2x2}>
            {chunkOptions(q.options).map((row, rowIdx) => (
              <View key={rowIdx} style={unicornQuizStyles.optionsRow}>
                {row.map((opt, idx) => {
                  const globalIdx = rowIdx * 2 + idx;
                  return (
                    <TouchableOpacity
                      key={opt.en}
                      style={[
                        unicornQuizStyles.optionTile2x2,
                        selected === globalIdx && {
                          backgroundColor: opt.hi === q.answer ? '#e8f5e9' : '#ffebee',
                          borderColor: opt.hi === q.answer ? '#4caf50' : '#f44336',
                          borderWidth: 2,
                        },
                      ]}
                      onPress={() => handleOption(globalIdx)}
                      disabled={selected !== null}
                      activeOpacity={0.85}
                    >
                      <Text style={unicornQuizStyles.english}>{opt.en}</Text>
                      <TouchableOpacity
                        style={unicornQuizStyles.audioBtn}
                        onPress={() => playSoundAsync(opt.sound)}
                        disabled={selected !== null}
                      >
                        <Text style={unicornQuizStyles.audioIcon}>🔊</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
          {feedback && (
            <Text style={unicornQuizStyles.feedback}>
              {feedback}
            </Text>
          )}
          <View style={unicornQuizStyles.nav}>
            <TouchableOpacity
              style={[
                unicornQuizStyles.navBtn,
                { backgroundColor: selected === null ? '#bdbdbd' : '#9c27b0' },
              ]}
              onPress={handleNext}
              disabled={selected === null}
              activeOpacity={0.85}
            >
              <Text style={unicornQuizStyles.navBtnText}>
                {current === questions.length - 1 ? 'Finish' : 'Next ▶'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={unicornQuizStyles.resultBlock}>
          <Text style={unicornQuizStyles.heading}>🎉 Quiz Complete! 🎉</Text>
          <Text style={unicornQuizStyles.score}>
            Your score: {score} / {questions.length}
          </Text>
          <View style={unicornQuizStyles.rewardRow}>
            {reward.map((r, i) => (
              <Text key={i} style={unicornQuizStyles.reward}>{r}</Text>
            ))}
          </View>
          <TouchableOpacity style={unicornQuizStyles.navBtn} onPress={handleRestart}>
            <Text style={unicornQuizStyles.navBtnText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
} 