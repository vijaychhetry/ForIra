import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const unicornCards = [
  { id: 1, value: '🦄', pair: 'Unicorn', emoji: '🦄' },
  { id: 2, value: 'Unicorn', pair: '🦄', emoji: '🦄' },
  { id: 3, value: '🌈', pair: 'Rainbow', emoji: '🌈' },
  { id: 4, value: 'Rainbow', pair: '🌈', emoji: '🌈' },
  { id: 5, value: '✨', pair: 'Sparkles', emoji: '✨' },
  { id: 6, value: 'Sparkles', pair: '✨', emoji: '✨' },
  { id: 7, value: '🦋', pair: 'Butterfly', emoji: '🦋' },
  { id: 8, value: 'Butterfly', pair: '🦋', emoji: '🦋' },
  { id: 9, value: '🌸', pair: 'Flower', emoji: '🌸' },
  { id: 10, value: 'Flower', pair: '🌸', emoji: '🌸' },
];

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

export default function UnicornMemoryScreen() {
  const [cards, setCards] = useState(shuffle(unicornCards));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [reward, setReward] = useState<string[]>([]);
  const [correctSound, setCorrectSound] = useState<Audio.Sound | null>(null);
  const [wrongSound, setWrongSound] = useState<Audio.Sound | null>(null);

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
          setReward((r) => [...r, '🦄']);
          setFlipped([]);
        }, 700);
      } else {
        playSound(wrongSound);
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  const handleRestart = () => {
    setCards(shuffle(unicornCards));
    setFlipped([]);
    setMatched([]);
    setReward([]);
  };

  const allMatched = matched.length === cards.length;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🦄 Unicorn Memory Game 🦄</Text>
      <View style={styles.rewardRow}>
        {reward.map((r, i) => (
          <Text key={i} style={styles.reward}>{r}</Text>
        ))}
      </View>
      <View style={styles.cardsContainer}>
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx);
          return (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                {
                  backgroundColor: isFlipped ? '#fff' : '#f8bbd0',
                  borderWidth: isFlipped ? 2 : 0,
                  borderColor: isFlipped ? '#e91e63' : 'transparent',
                },
              ]}
              activeOpacity={isFlipped ? 1 : 0.8}
              onPress={() => handleFlip(idx)}
              disabled={isFlipped}
            >
              {isFlipped ? (
                <>
                  <Text style={styles.emoji}>{card.emoji}</Text>
                  <Text style={styles.value}>{card.value}</Text>
                </>
              ) : (
                <Text style={styles.questionMark}>?</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {allMatched && (
        <View style={styles.completionContainer}>
          <Text style={styles.congrats}>🎉 You Won! 🎉</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
            <Text style={styles.restartBtnText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fce4ec',
    padding: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#880e4f',
    textAlign: 'center',
    marginBottom: 20,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  reward: {
    fontSize: 32,
    marginHorizontal: 4,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  card: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#880e4f',
    fontWeight: 'bold',
  },
  questionMark: {
    fontSize: 36,
    color: '#fff',
  },
  completionContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(252, 228, 236, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  congrats: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#880e4f',
    marginBottom: 20,
  },
  restartBtn: {
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  restartBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 