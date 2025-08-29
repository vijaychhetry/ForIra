// filepath: IRA-Hindi/screens/LearnScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { hindiConsonants, hindiVowels, hindiVowelsWithMatras } from '../constants/hindiLetters';
import { playSoundAsync } from '../helpers/audioHelpers';

// Mapping of vowels to their corresponding matras
const vowelToMatraMap = {
  'अ': '्', // No matra (inherent vowel)
  'आ': 'ा',
  'इ': 'ि',
  'ई': 'ी',
  'उ': 'ु',
  'ऊ': 'ू',
  'ऋ': 'ृ',
  'ए': 'े',
  'ऐ': 'ै',
  'ओ': 'ो',
  'औ': 'ौ',
  'अं': 'ं',
  'अः': 'ः',
};

export default function LearnScreen() {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const { type, matras } = useLocalSearchParams();

  // Determine which letters to use based on the type parameter
  let letters;
  let title;
  
  if (type === 'consonants') {
    letters = hindiConsonants;
    title = 'Hindi Consonants';
  } else if (matras === 'true') {
    letters = hindiVowelsWithMatras;
    title = 'Hindi Vowels & Matras';
  } else {
    letters = hindiVowels;
    title = 'Hindi Vowels';
  }

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

  const currentItem = letters[index];
  const isMatra = matras === 'true' && index >= hindiVowels.length;
  const isVowel = matras === 'true' && index < hindiVowels.length;
  
  // Get the corresponding matra for the current vowel
  const currentMatra = vowelToMatraMap[currentItem.letter] || '्';

  return (
    <View style={styles.container}>
      {/* Header with title */}
      <Text style={styles.header}>{title}</Text>
      
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

      {/* Show vowel and matra side by side when in matras mode */}
      {matras === 'true' && isVowel ? (
        <View style={styles.sideBySideContainer}>
          {/* Vowel */}
          <View style={styles.sideBySideItem}>
            <TouchableOpacity onPress={() => playSound()} activeOpacity={0.7}>
              <Text style={styles.letter}>{currentItem.letter} {"-"} {currentMatra}</Text>
            </TouchableOpacity>
            <Image source={currentItem.image} style={styles.smallImage} />
            <Text style={styles.word}>{currentItem.word}</Text>
            {currentMatra !== '्' && (
              <Text style={styles.exampleText}>क{currentMatra}</Text>
            )}
          </View>
        </View>
      ) : (
        /* Regular display for consonants or individual items */
        <>
          <View style={styles.letterBlock}>
            <TouchableOpacity onPress={() => playSound()} activeOpacity={0.7}>
              <Text style={[styles.letter, isMatra && styles.matraLetter]}>{currentItem.letter}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Show image only for vowels and consonants, not for matras */}
          {!isMatra && (
            <Image source={currentItem.image} style={styles.image} />
          )}
          
          <Text style={styles.word}>
            {currentItem.letter} - {currentItem.word}
          </Text>
          
          {/* Show example for matras */}
          {isMatra && currentItem.example && (
            <View style={styles.matraExample}>
              <Text style={styles.exampleLabel}>Example:</Text>
              <Text style={styles.exampleText}>{currentItem.example}</Text>
            </View>
          )}
        </>
      )}
      
      <Text style={styles.progress}>
        {index + 1} of {letters.length}
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
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 20,
    textAlign: 'center',
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
  progress: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    fontWeight: '500',
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
  matraLetter: {
    color: '#9c27b0',
  },
  matraExample: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  exampleLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9c27b0',
    marginRight: 10,
  },
  exampleText: {
    fontSize: 24,
    color: '#9c27b0',
    fontWeight: 'bold',
  },
  sideBySideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sideBySideItem: {
    alignItems: 'center',
    flex: 1,
  },
  smallImage: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976d2',
    backgroundColor: '#fff',
  },
  matraPlaceholder: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9c27b0',
    backgroundColor: '#f3e5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matraSymbol: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#9c27b0',
  },
});

//https://hindi.la.utexas.edu/resources/pronouncing-the-hindi-alphabet/