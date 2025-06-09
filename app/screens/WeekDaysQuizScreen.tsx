import { useEffect, useState } from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';
import { playSoundAsync } from '../helpers/audioHelpers';
import { weekDaysQuizStyles } from './WeekDaysQuizScreen.styles';

const days = [
  { en: 'Monday', hi: 'सोमवार', sound: require('../../assets/sounds/WeekDays/01_Monday.mp3') },
  { en: 'Tuesday', hi: 'मंगलवार', sound: require('../../assets/sounds/WeekDays/02_Tuesday.mp3') },
  { en: 'Wednesday', hi: 'बुधवार', sound: require('../../assets/sounds/WeekDays/03_Wednesday.mp3') },
  { en: 'Thursday', hi: 'गुरुवार', sound: require('../../assets/sounds/WeekDays/04_Thursday.mp3') },
  { en: 'Friday', hi: 'शुक्रवार', sound: require('../../assets/sounds/WeekDays/05_Friday.mp3') },
  { en: 'Saturday', hi: 'शनिवार', sound: require('../../assets/sounds/WeekDays/06_Saturday.mp3') },
  { en: 'Sunday', hi: 'रविवार', sound: require('../../assets/sounds/WeekDays/07_Sunday.mp3') },
];

// Generate quiz questions: play audio, choose correct Hindi day from 4 options
function generateQuestions() {
  return days.map((day) => {
    // Pick 3 random other days for options
    const others = days.filter(d => d.hi !== day.hi);
    const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [...shuffled, day].sort(() => 0.5 - Math.random());
    return {
      sound: day.sound,
      answer: day.hi,
      options,
      question: 'सुनिए और सही दिन चुनिए:',
    };
  });
}

const questions = generateQuestions();

function chunkOptions<T>(arr: T[]) {
  return [arr.slice(0, 2), arr.slice(2, 4)];
}

export default function WeekDaysQuizScreen() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [reward, setReward] = useState<string[]>([]);

  const q = questions[current];

  // Play audio on screen load and when question changes
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
      setReward(r => [...r, '🦋']);
      setFeedback('सही! 🦋');
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
    <View style={weekDaysQuizStyles.container}>
      {/* Reward row at top */}
      <View style={weekDaysQuizStyles.rewardRow}>
        {reward.map((r, i) => (
          <Text key={i} style={weekDaysQuizStyles.reward}>{r}</Text>
        ))}
      </View>
      {!showResult ? (
        <View style={weekDaysQuizStyles.quizBlock}>
          <Text style={weekDaysQuizStyles.question}>{q.question}</Text>
          <Button title="🔊 Play Audio" onPress={handlePlay} />
          <View style={weekDaysQuizStyles.optionsGrid2x2}>
            {chunkOptions(q.options).map((row, rowIdx) => (
              <View key={rowIdx} style={weekDaysQuizStyles.optionsRow}>
                {row.map((opt, idx) => {
                  const globalIdx = rowIdx * 2 + idx;
                  return (
                    <TouchableOpacity
                      key={opt.en}
                      style={[
                        weekDaysQuizStyles.optionTile2x2,
                        selected === globalIdx && {
                          backgroundColor: opt.hi === q.answer ? '#c8e6c9' : '#ffcdd2',
                          borderColor: opt.hi === q.answer ? '#4caf50' : '#f44336',
                          borderWidth: 2,
                        },
                      ]}
                      onPress={() => handleOption(globalIdx)}
                      disabled={selected !== null}
                      activeOpacity={0.85}
                    >
                      <Text style={weekDaysQuizStyles.hindi}>{opt.hi}</Text>
                      <Text style={weekDaysQuizStyles.english}>{opt.en}</Text>
                      <TouchableOpacity
                        style={weekDaysQuizStyles.audioBtn}
                        onPress={() => playSoundAsync(opt.sound)}
                        disabled={selected !== null}
                      >
                        <Text style={weekDaysQuizStyles.audioIcon}>🔊</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
          {feedback && (
            <Text
              style={{
                color: feedback.startsWith('सही') ? '#4caf50' : '#f44336',
                textAlign: 'center',
                marginVertical: 8,
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              {feedback}
            </Text>
          )}
          <View style={weekDaysQuizStyles.nav}>
            <TouchableOpacity
              style={[
                weekDaysQuizStyles.navBtn,
                { backgroundColor: selected === null ? '#bdbdbd' : '#1976d2' },
              ]}
              onPress={handleNext}
              disabled={selected === null}
              activeOpacity={0.85}
            >
              <Text style={weekDaysQuizStyles.navBtnText}>
                {current === questions.length - 1 ? 'Finish' : 'Next ▶'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={weekDaysQuizStyles.resultBlock}>
          <Text style={weekDaysQuizStyles.heading}>🎉 Quiz Complete! 🎉</Text>
          <Text style={weekDaysQuizStyles.score}>
            Your score: {score} / {questions.length}
          </Text>
          <View style={weekDaysQuizStyles.rewardRow}>
            {reward.map((r, i) => (
              <Text key={i} style={weekDaysQuizStyles.reward}>{r}</Text>
            ))}
          </View>
          <TouchableOpacity style={weekDaysQuizStyles.navBtn} onPress={handleRestart}>
            <Text style={weekDaysQuizStyles.navBtnText}>Restart Quiz</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}