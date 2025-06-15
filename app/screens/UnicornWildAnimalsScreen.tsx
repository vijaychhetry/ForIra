import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const wildAnimals = [
  { id: 1, value: 'Lion', hi: 'शेर', emoji: '🦁', sound: require('../../assets/sounds/WildAnimals/01_Lion.mp3') },
  { id: 2, value: 'Tiger', hi: 'बाघ', emoji: '🐯', sound: require('../../assets/sounds/WildAnimals/02_Tiger.mp3') },
  { id: 3, value: 'Elephant', hi: 'हाथी', emoji: '🐘', sound: require('../../assets/sounds/WildAnimals/03_Elephant.mp3') },
  { id: 4, value: 'Giraffe', hi: 'जिराफ', emoji: '🦒', sound: require('../../assets/sounds/WildAnimals/04_Giraffe.mp3') },
  { id: 5, value: 'Monkey', hi: 'बंदर', emoji: '🐒', sound: require('../../assets/sounds/WildAnimals/05_Monkey.mp3') },
];

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

export default function UnicornWildAnimalsScreen() {
  const [cards, setCards] = useState(shuffle([...wildAnimals, ...wildAnimals]));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [reward, setReward] = useState<string[]>([]);
  const [correctSound, setCorrectSound] = useState<Audio.Sound | null>(null);
  const [wrongSound, setWrongSound] = useState<Audio.Sound | null>(null);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);

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
      currentSound?.unloadAsync();
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

  const handleFlip = async (idx: number) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
    
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    // Play animal sound when card is flipped
    const card = cards[idx];
    if (card.sound) {
      const { sound } = await Audio.Sound.createAsync(card.sound);
      setCurrentSound(sound);
      await playSound(sound);
    }

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];
      
      if (firstCard.value === secondCard.value) {
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
    setCards(shuffle([...wildAnimals, ...wildAnimals]));
    setFlipped([]);
    setMatched([]);
    setReward([]);
  };

  const allMatched = matched.length === cards.length;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🦄 Wild Animals Match Game 🦄</Text>
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
              key={`${card.id}-${idx}`}
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
                  <Text style={styles.hindi}>{card.hi}</Text>
                  <Text style={styles.english}>{card.value}</Text>
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
  hindi: {
    fontSize: 18,
    color: '#880e4f',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  english: {
    fontSize: 14,
    color: '#880e4f',
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