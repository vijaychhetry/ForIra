import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const vegetables = [
  { id: 1, value: 'Potato', hi: 'आलू', emoji: '🥔', sound: require('../../assets/sounds/Vegetables/01_Potato.mp3') },
  { id: 2, value: 'Tomato', hi: 'टमाटर', emoji: '🍅', sound: require('../../assets/sounds/Vegetables/02_Tomato.mp3') },
  { id: 3, value: 'Onion', hi: 'प्याज', emoji: '🧅', sound: require('../../assets/sounds/Vegetables/03_Onion.mp3') },
  { id: 4, value: 'Carrot', hi: 'गाजर', emoji: '🥕', sound: require('../../assets/sounds/Vegetables/04_Carrot.mp3') },
  { id: 5, value: 'Cucumber', hi: 'खीरा', emoji: '🥒', sound: require('../../assets/sounds/Vegetables/05_Cucumber.mp3') },
  { id: 6, value: 'Cabbage', hi: 'पत्तागोभी', emoji: '🥬', sound: require('../../assets/sounds/Vegetables/06_Cabbage.mp3') },
  { id: 7, value: 'Cauliflower', hi: 'फूलगोभी', emoji: '🥦', sound: require('../../assets/sounds/Vegetables/07_Cauliflower.mp3') },
  { id: 8, value: 'Brinjal', hi: 'बैंगन', emoji: '🍆', sound: require('../../assets/sounds/Vegetables/08_Brinjal.mp3') },
  { id: 9, value: 'Spinach', hi: 'पालक', emoji: '🥬', sound: require('../../assets/sounds/Vegetables/09_Spinach.mp3') },
  { id: 10, value: 'Peas', hi: 'मटर', emoji: '🫛', sound: require('../../assets/sounds/Vegetables/10_Peas.mp3') },
];

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

export default function UnicornVegetableMatchScreen() {
  const [cards, setCards] = useState(shuffle(vegetables));
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

  const handleFlip = async (idx: number) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;

    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    // Play vegetable sound when card is flipped
    const { sound } = cards[idx];
    try {
      const { sound: vegetableSound } = await Audio.Sound.createAsync(sound);
      await vegetableSound.playAsync();
      vegetableSound.unloadAsync();
    } catch (error) {
      console.log('Error playing vegetable sound:', error);
    }

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.hi === secondCard.hi || firstCard.value === secondCard.value) {
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
    setCards(shuffle(vegetables));
    setFlipped([]);
    setMatched([]);
    setReward([]);
  };

  const allMatched = matched.length === cards.length;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🦄 Vegetables Match</Text>
      <View style={styles.rewardRow}>
        {reward.map((r, i) => (
          <Text key={i} style={styles.reward}>{r}</Text>
        ))}
      </View>
      <View style={styles.cardGrid}>
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
                  <Text style={styles.emoji}>{card.emoji}</Text>
                  <Text style={styles.text}>{card.value}</Text>
                  <Text style={styles.hindiText}>{card.hi}</Text>
                </>
              ) : (
                <Text style={styles.questionMark}>❓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {allMatched && (
        <View style={styles.completeContainer}>
          <Text style={styles.congrats}>🎉 All Matched! 🎉</Text>
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
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#43a047',
    textAlign: 'center',
    marginBottom: 20,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  reward: {
    fontSize: 24,
    marginHorizontal: 8,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  card: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  text: {
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  hindiText: {
    fontSize: 16,
    color: '#666',
  },
  questionMark: {
    fontSize: 36,
    color: '#fff',
  },
  completeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  congrats: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#43a047',
    marginBottom: 20,
  },
  restartBtn: {
    backgroundColor: '#43a047',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
  },
  restartBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 