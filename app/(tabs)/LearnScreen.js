// filepath: IRA-Hindi/screens/LearnScreen.js
import { Audio } from 'expo-av';
import { useState } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { hindiLetters as letters } from '../constants/hindiLetters';

export default function LearnScreen() {
  const [index, setIndex] = useState(0);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(letters[index].sound);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.log('Error playing sound:', e);
    }
  };

  if (letters.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No letters available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={playSound}>
        <Text style={styles.letter}>{letters[index].letter}</Text>
      </TouchableOpacity>
      <Text style={styles.word}>{letters[index].letter} - {letters[index].word}</Text>
      <Image source={letters[index].image} style={styles.image} />
      <View style={styles.nav}>
        <Button title="Prev" onPress={() => setIndex(i => Math.max(i - 1, 0))} />
        <Button title="Next" onPress={() => setIndex(i => Math.min(i + 1, letters.length - 1))} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  letter: { fontSize: 80, margin: 20, color: 'red' },
  word: { fontSize: 32, margin: 10 },
  image: { width: 120, height: 120, margin: 10 },
  nav: { flexDirection: 'row', gap: 20, marginTop: 20 },
});

//https://hindi.la.utexas.edu/resources/pronouncing-the-hindi-alphabet/