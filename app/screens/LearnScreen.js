// filepath: IRA-Hindi/screens/LearnScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { hindiLetters as letters } from '../constants/hindiLetters';
import { playSoundAsync } from '../helpers/audioHelpers';

export default function LearnScreen() {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const router = useRouter();

  const playSound = async (idx = index) => {
    await playSoundAsync(letters[idx].sound);
  };

  if (letters.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No letters available.</Text>
      </View>
    );
  }

  const handlePrev = async () => {
    setIndex(i => {
      const newIndex = Math.max(i - 1, 0);
      if (!muted) playSound(newIndex);
      return newIndex;
    });
  };

  const handleNext = async () => {
    setIndex(i => {
      const newIndex = Math.min(i + 1, letters.length - 1);
      if (!muted) playSound(newIndex);
      return newIndex;
    });
  };

  return (
    <View style={styles.container}>
      {/* Mute button at top right */}
      <Pressable
        style={styles.muteBtn}
        onPress={() => setMuted(m => !m)}
        hitSlop={16}
      >
        <Ionicons
          name={muted ? 'volume-mute' : 'volume-high'}
          size={32}
          color={muted ? '#bdbdbd' : '#1976d2'}
        />
      </Pressable>

      <View style={styles.letterBlock}>
        <TouchableOpacity onPress={() => playSound()} activeOpacity={0.7}>
          <Text style={styles.letter}>{letters[index].letter}</Text>
        </TouchableOpacity>
      </View>
      <Image source={letters[index].image} style={styles.image} />
      <Text style={styles.word}>
        {letters[index].letter} - {letters[index].word}
      </Text>
      <View style={styles.nav}>
        <Pressable
          style={({ pressed }) => [
            styles.navBtn,
            { backgroundColor: pressed ? '#e3e3e3' : '#1976d2' },
          ]}
          onPress={handlePrev}
        >
          <Text style={styles.navBtnText}>◀ Prev</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.navBtn,
            { backgroundColor: pressed ? '#e3e3e3' : '#1976d2' },
          ]}
          onPress={handleNext}
        >
          <Text style={styles.navBtnText}>Next ▶</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  muteBtn: {
    position: 'absolute',
    top: 28,
    right: 28,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  letterBlock: {
    alignItems: 'center',
    marginBottom: 10,
  },
  letter: {
    fontSize: 110,
    marginBottom: 8,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  word: {
    fontSize: 36,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
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
    minWidth: 90,
    alignItems: 'center',
  },
  navBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

//https://hindi.la.utexas.edu/resources/pronouncing-the-hindi-alphabet/