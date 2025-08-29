import { Audio } from 'expo-av';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { barakhadi } from '../constants/hindiLetters';
import { getBarakhadiSound, hasBarakhadiSound } from '../helpers/barakhadiHelpers';

export default function BarakhadiScreen() {
  const [selectedConsonant, setSelectedConsonant] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const currentBarakhadi = barakhadi[selectedConsonant];

  async function playBarakhadiSound(syllable: string) {
    // Release previous sound if any
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    
    try {
      // Check if sound exists for this syllable
      if (!hasBarakhadiSound(syllable)) {
        console.warn(`No sound found for syllable: ${syllable}`);
        return;
      }
      
      // Get the sound source from helper
      const soundSource = getBarakhadiSound(syllable);
      const { sound: newSound } = await Audio.Sound.createAsync(soundSource);
      setSound(newSound);
      await newSound.playAsync();
    } catch (e) {
      console.warn('Could not play sound:', e);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Barakhadi</Text>
      <Text style={styles.subtitle}>Consonant + Vowel Combinations</Text>

      {/* Consonant Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.consonantSelector}>
        {barakhadi.map((item, index) => (
          <TouchableOpacity
            key={item.consonant}
            style={[
              styles.consonantButton,
              selectedConsonant === index && styles.selectedConsonant
            ]}
            onPress={() => setSelectedConsonant(index)}
          >
            <Text style={[
              styles.consonantText,
              selectedConsonant === index && styles.selectedConsonantText
            ]}>
              {item.consonant}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Barakhadi Grid */}
      <ScrollView style={styles.gridContainer}>
        <View style={styles.grid}>
          {currentBarakhadi.combinations.map((combination, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gridItem}
              onPress={() => playBarakhadiSound(combination.syllable)}
            >
              <Text style={styles.syllable}>{combination.syllable}</Text>
              <Text style={styles.matra}>{combination.matra}</Text>
              <Text style={styles.vowel}>{combination.vowel}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItem}>
          <Text style={styles.legendLabel}>Syllable:</Text>
          <Text style={styles.legendText}>क</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendLabel}>Matra:</Text>
          <Text style={styles.legendText}>ा</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendLabel}>Vowel:</Text>
          <Text style={styles.legendText}>आ</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingTop: 60,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff5722',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  consonantSelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  consonantButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedConsonant: {
    backgroundColor: '#ff5722',
    borderColor: '#ff5722',
  },
  consonantText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedConsonantText: {
    color: '#fff',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  syllable: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff5722',
    marginBottom: 5,
  },
  matra: {
    fontSize: 16,
    color: '#9c27b0',
    marginBottom: 2,
  },
  vowel: {
    fontSize: 12,
    color: '#666',
  },
  legend: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendLabel: {
    fontSize: 14,
    color: '#666',
  },
  legendText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff5722',
  },
}); 