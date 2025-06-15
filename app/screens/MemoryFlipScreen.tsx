import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define different card sets for different levels
const levelSets: Record<number, Card[][]> = {
  1: [
    // Set 1: Monday-Tuesday
    [
      { id: 1, value: 'सोमवार', pair: 'Monday', emoji: '🌞' },
      { id: 2, value: 'Monday', pair: 'सोमवार', emoji: '🌞' },
      { id: 3, value: 'मंगलवार', pair: 'Tuesday', emoji: '🚀' },
      { id: 4, value: 'Tuesday', pair: 'मंगलवार', emoji: '🚀' },
    ],
    // Set 2: Wednesday-Thursday
    [
      { id: 1, value: 'बुधवार', pair: 'Wednesday', emoji: '🐪' },
      { id: 2, value: 'Wednesday', pair: 'बुधवार', emoji: '🐪' },
      { id: 3, value: 'गुरुवार', pair: 'Thursday', emoji: '🌳' },
      { id: 4, value: 'Thursday', pair: 'गुरुवार', emoji: '🌳' },
    ],
    // Set 3: Friday-Saturday
    [
      { id: 1, value: 'शुक्रवार', pair: 'Friday', emoji: '✨' },
      { id: 2, value: 'Friday', pair: 'शुक्रवार', emoji: '✨' },
      { id: 3, value: 'शनिवार', pair: 'Saturday', emoji: '🌙' },
      { id: 4, value: 'Saturday', pair: 'शनिवार', emoji: '🌙' },
    ],
  ],
  2: [
    // Set 1: Monday-Tuesday-Wednesday
    [
      { id: 1, value: 'सोमवार', pair: 'Monday', emoji: '🌞' },
      { id: 2, value: 'Monday', pair: 'सोमवार', emoji: '🌞' },
      { id: 3, value: 'मंगलवार', pair: 'Tuesday', emoji: '🚀' },
      { id: 4, value: 'Tuesday', pair: 'मंगलवार', emoji: '🚀' },
      { id: 5, value: 'बुधवार', pair: 'Wednesday', emoji: '🐪' },
      { id: 6, value: 'Wednesday', pair: 'बुधवार', emoji: '🐪' },
    ],
    // Set 2: Thursday-Friday-Saturday
    [
      { id: 1, value: 'गुरुवार', pair: 'Thursday', emoji: '🌳' },
      { id: 2, value: 'Thursday', pair: 'गुरुवार', emoji: '🌳' },
      { id: 3, value: 'शुक्रवार', pair: 'Friday', emoji: '✨' },
      { id: 4, value: 'Friday', pair: 'शुक्रवार', emoji: '✨' },
      { id: 5, value: 'शनिवार', pair: 'Saturday', emoji: '🌙' },
      { id: 6, value: 'Saturday', pair: 'शनिवार', emoji: '🌙' },
    ],
    // Set 3: Sunday-Monday-Tuesday
    [
      { id: 1, value: 'रविवार', pair: 'Sunday', emoji: '☀️' },
      { id: 2, value: 'Sunday', pair: 'रविवार', emoji: '☀️' },
      { id: 3, value: 'सोमवार', pair: 'Monday', emoji: '🌞' },
      { id: 4, value: 'Monday', pair: 'सोमवार', emoji: '🌞' },
      { id: 5, value: 'मंगलवार', pair: 'Tuesday', emoji: '🚀' },
      { id: 6, value: 'Tuesday', pair: 'मंगलवार', emoji: '🚀' },
    ],
  ],
  3: [
    // Set 1: Monday to Thursday
    [
      { id: 1, value: 'सोमवार', pair: 'Monday', emoji: '🌞' },
      { id: 2, value: 'Monday', pair: 'सोमवार', emoji: '🌞' },
      { id: 3, value: 'मंगलवार', pair: 'Tuesday', emoji: '🚀' },
      { id: 4, value: 'Tuesday', pair: 'मंगलवार', emoji: '🚀' },
      { id: 5, value: 'बुधवार', pair: 'Wednesday', emoji: '🐪' },
      { id: 6, value: 'Wednesday', pair: 'बुधवार', emoji: '🐪' },
      { id: 7, value: 'गुरुवार', pair: 'Thursday', emoji: '🌳' },
      { id: 8, value: 'Thursday', pair: 'गुरुवार', emoji: '🌳' },
    ],
    // Set 2: Friday to Monday
    [
      { id: 1, value: 'शुक्रवार', pair: 'Friday', emoji: '✨' },
      { id: 2, value: 'Friday', pair: 'शुक्रवार', emoji: '✨' },
      { id: 3, value: 'शनिवार', pair: 'Saturday', emoji: '🌙' },
      { id: 4, value: 'Saturday', pair: 'शनिवार', emoji: '🌙' },
      { id: 5, value: 'रविवार', pair: 'Sunday', emoji: '☀️' },
      { id: 6, value: 'Sunday', pair: 'रविवार', emoji: '☀️' },
      { id: 7, value: 'सोमवार', pair: 'Monday', emoji: '🌞' },
      { id: 8, value: 'Monday', pair: 'सोमवार', emoji: '🌞' },
    ],
    // Set 3: Tuesday to Friday
    [
      { id: 1, value: 'मंगलवार', pair: 'Tuesday', emoji: '🚀' },
      { id: 2, value: 'Tuesday', pair: 'मंगलवार', emoji: '🚀' },
      { id: 3, value: 'बुधवार', pair: 'Wednesday', emoji: '🐪' },
      { id: 4, value: 'Wednesday', pair: 'बुधवार', emoji: '🐪' },
      { id: 5, value: 'गुरुवार', pair: 'Thursday', emoji: '🌳' },
      { id: 6, value: 'Thursday', pair: 'गुरुवार', emoji: '🌳' },
      { id: 7, value: 'शुक्रवार', pair: 'Friday', emoji: '✨' },
      { id: 8, value: 'Friday', pair: 'शुक्रवार', emoji: '✨' },
    ],
  ],
  4: [
    // Set 1: All days
    [
      { id: 1, value: 'सोमवार', pair: 'Monday', emoji: '🌞' },
      { id: 2, value: 'Monday', pair: 'सोमवार', emoji: '🌞' },
      { id: 3, value: 'मंगलवार', pair: 'Tuesday', emoji: '🚀' },
      { id: 4, value: 'Tuesday', pair: 'मंगलवार', emoji: '🚀' },
      { id: 5, value: 'बुधवार', pair: 'Wednesday', emoji: '🐪' },
      { id: 6, value: 'Wednesday', pair: 'बुधवार', emoji: '🐪' },
      { id: 7, value: 'गुरुवार', pair: 'Thursday', emoji: '🌳' },
      { id: 8, value: 'Thursday', pair: 'गुरुवार', emoji: '🌳' },
      { id: 9, value: 'शुक्रवार', pair: 'Friday', emoji: '✨' },
      { id: 10, value: 'Friday', pair: 'शुक्रवार', emoji: '✨' },
    ],
    // Set 2: All days (different order)
    [
      { id: 1, value: 'शनिवार', pair: 'Saturday', emoji: '🌙' },
      { id: 2, value: 'Saturday', pair: 'शनिवार', emoji: '🌙' },
      { id: 3, value: 'रविवार', pair: 'Sunday', emoji: '☀️' },
      { id: 4, value: 'Sunday', pair: 'रविवार', emoji: '☀️' },
      { id: 5, value: 'सोमवार', pair: 'Monday', emoji: '🌞' },
      { id: 6, value: 'Monday', pair: 'सोमवार', emoji: '🌞' },
      { id: 7, value: 'मंगलवार', pair: 'Tuesday', emoji: '🚀' },
      { id: 8, value: 'Tuesday', pair: 'मंगलवार', emoji: '🚀' },
      { id: 9, value: 'बुधवार', pair: 'Wednesday', emoji: '🐪' },
      { id: 10, value: 'Wednesday', pair: 'बुधवार', emoji: '🐪' },
    ],
    // Set 3: All days (different order)
    [
      { id: 1, value: 'गुरुवार', pair: 'Thursday', emoji: '🌳' },
      { id: 2, value: 'Thursday', pair: 'गुरुवार', emoji: '🌳' },
      { id: 3, value: 'शुक्रवार', pair: 'Friday', emoji: '✨' },
      { id: 4, value: 'Friday', pair: 'शुक्रवार', emoji: '✨' },
      { id: 5, value: 'शनिवार', pair: 'Saturday', emoji: '🌙' },
      { id: 6, value: 'Saturday', pair: 'शनिवार', emoji: '🌙' },
      { id: 7, value: 'रविवार', pair: 'Sunday', emoji: '☀️' },
      { id: 8, value: 'Sunday', pair: 'रविवार', emoji: '☀️' },
      { id: 9, value: 'सोमवार', pair: 'Monday', emoji: '🌞' },
      { id: 10, value: 'Monday', pair: 'सोमवार', emoji: '🌞' },
    ],
  ],
};

type Card = {
  id: number;
  value: string;
  pair: string;
  emoji: string;
};

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

function getRandomSet(level: number): Card[] {
  const sets = levelSets[level];
  const randomIndex = Math.floor(Math.random() * sets.length);
  return shuffle(sets[randomIndex]);
}

export default function MemoryFlipScreen() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [cards, setCards] = useState<Card[]>(getRandomSet(1));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [reward, setReward] = useState<string[]>([]);
  const [correctSound, setCorrectSound] = useState<Audio.Sound | null>(null);
  const [wrongSound, setWrongSound] = useState<Audio.Sound | null>(null);

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
    };
  }, []);

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

  const handleFlip = (idx: number) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];
      if (
        firstCard.value === secondCard.pair ||
        secondCard.value === firstCard.pair
      ) {
        playSound(correctSound);
        setTimeout(() => {
          setMatched((m) => [...m, firstIdx, secondIdx]);
          setReward((r) => [...r, '🍭']);
          setFlipped([]);
        }, 700);
      } else {
        playSound(wrongSound);
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  const handleRestart = () => {
    setCards(getRandomSet(currentLevel));
    setFlipped([]);
    setMatched([]);
    setReward([]);
  };

  const handleNextLevel = () => {
    if (currentLevel < 4) {
      const nextLevel = currentLevel + 1;
      setCurrentLevel(nextLevel);
      setCards(getRandomSet(nextLevel));
      setFlipped([]);
      setMatched([]);
      setReward([]);
    }
  };

  const allMatched = matched.length === cards.length;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🃏 Memory Flip</Text>
      <Text style={styles.levelText}>Level {currentLevel}</Text>
      <View style={styles.rewardRow}>
        {reward.map((r, i) => (
          <Text key={i} style={styles.reward}>{r}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 }}>
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx);
          return (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                {
                  backgroundColor: isFlipped ? '#fffde7' : '#bdbdbd',
                  borderWidth: isFlipped ? 2 : 0,
                  borderColor: isFlipped ? '#43a047' : 'transparent',
                },
              ]}
              activeOpacity={isFlipped ? 1 : 0.8}
              onPress={() => handleFlip(idx)}
              disabled={isFlipped}
            >
              {isFlipped ? (
                <>
                  <Text style={{ fontSize: 32 }}>{card.emoji}</Text>
                  <Text style={{ fontSize: 18, color: '#1976d2', fontWeight: 'bold', marginTop: 4 }}>
                    {card.value}
                  </Text>
                </>
              ) : (
                <Text style={{ fontSize: 36, color: '#fff' }}>❓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {allMatched && (
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Text style={styles.congrats}>🎉 Level {currentLevel} Complete! 🎉</Text>
          {currentLevel < 4 ? (
            <TouchableOpacity style={styles.nextLevelBtn} onPress={handleNextLevel}>
              <Text style={styles.nextLevelBtnText}>Next Level</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
              <Text style={styles.restartBtnText}>Play Again</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f6fa' },
  heading: { fontSize: 32, fontWeight: 'bold', color: '#43a047', marginBottom: 8 },
  levelText: { fontSize: 24, color: '#1976d2', marginBottom: 16 },
  text: { fontSize: 18, color: '#333', textAlign: 'center' },
  rewardRow: { flexDirection: 'row', marginBottom: 16 },
  reward: { fontSize: 24, marginHorizontal: 8 },
  congrats: { fontSize: 20, fontWeight: 'bold', color: '#43a047' },
  card: {
    width: 90,
    height: 90,
    margin: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  restartBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#43a047',
    elevation: 2,
  },
  restartBtnText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  nextLevelBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#1976d2',
    elevation: 2,
  },
  nextLevelBtnText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
});