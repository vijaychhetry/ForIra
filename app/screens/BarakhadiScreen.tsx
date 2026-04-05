import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Tts from 'react-native-tts';
import { barakhadi } from '../constants/hindiLetters';
import { getBarakhadiSound, hasBarakhadiSound } from '../helpers/barakhadiHelpers';

export default function BarakhadiScreen() {
  const [selectedConsonant, setSelectedConsonant] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [ttsReady, setTtsReady] = useState(false);

  const currentBarakhadi = barakhadi[selectedConsonant];

  // Set up TTS for Hindi on mount; clean up audio on unmount
  useEffect(() => {
    Tts.setDefaultLanguage('hi-IN').catch(() => {
      // hi-IN may not be available on all devices — fall back silently
    });
    Tts.setDefaultRate(0.4);
    Tts.setDefaultPitch(1.1);
    setTtsReady(true);

    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
      Tts.stop();
    };
  }, []);

  async function playBarakhadiSound(syllable: string) {
    // Unload any currently loaded audio
    if (soundRef.current) {
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }

    if (hasBarakhadiSound(syllable)) {
      // Play the recorded MP3
      try {
        const soundSource = getBarakhadiSound(syllable);
        const { sound } = await Audio.Sound.createAsync(soundSource);
        soundRef.current = sound;
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            soundRef.current = null;
          }
        });
      } catch (e) {
        console.warn('Could not play barakhadi MP3, falling back to TTS:', e);
        speakWithTts(syllable);
      }
    } else if (ttsReady) {
      // No MP3 — use TTS to speak the syllable
      speakWithTts(syllable);
    }
  }

  function speakWithTts(syllable: string) {
    Tts.stop();
    Tts.speak(syllable);
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
              selectedConsonant === index && styles.selectedConsonant,
            ]}
            onPress={() => setSelectedConsonant(index)}
          >
            <Text style={[
              styles.consonantText,
              selectedConsonant === index && styles.selectedConsonantText,
            ]}>
              {item.consonant}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Barakhadi Grid */}
      <ScrollView style={styles.gridContainer}>
        <View style={styles.grid}>
          {currentBarakhadi.combinations.map((combination, index) => {
            const hasMp3 = hasBarakhadiSound(combination.syllable);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.gridItem, !hasMp3 && styles.gridItemTts]}
                onPress={() => playBarakhadiSound(combination.syllable)}
              >
                <Text style={styles.syllable}>{combination.syllable}</Text>
                <Text style={styles.matra}>{combination.matra}</Text>
                <Text style={styles.vowel}>{combination.vowel}</Text>
                {!hasMp3 && <Text style={styles.ttsTag}>TTS</Text>}
              </TouchableOpacity>
            );
          })}
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
  gridItemTts: {
    borderColor: '#b39ddb',
    borderStyle: 'dashed',
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
  ttsTag: {
    fontSize: 9,
    color: '#9c27b0',
    marginTop: 2,
    fontWeight: 'bold',
    letterSpacing: 0.5,
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
