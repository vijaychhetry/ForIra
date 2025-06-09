import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Audio } from 'expo-av';
import React, { useRef, useState } from 'react';
import { Button, Dimensions, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { hindiLetters } from '../constants/hindiLetters';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width - 40;

export default function TraceScreen() {
  const [index, setIndex] = useState(0);
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const resetTimeout = useRef<NodeJS.Timeout | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // If a reset is pending, cancel it (user is still tracing)
        if (resetTimeout.current) {
          clearTimeout(resetTimeout.current);
          resetTimeout.current = null;
        }
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M${locationX},${locationY}`);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath((prev) => prev + ` L${locationX},${locationY}`);
      },
      onPanResponderRelease: () => {
        // Add the finished stroke to paths
        setPaths((prev) => (currentPath ? [...prev, currentPath] : prev));
        setCurrentPath('');
        // Start/reset the 5s timer to clear all traces
        if (resetTimeout.current) clearTimeout(resetTimeout.current);
        resetTimeout.current = setTimeout(() => {
          setPaths([]);
        }, 5000);
      },
    })
  ).current;

  const playSound = async () => {
    const letter = hindiLetters[index];
    if (letter.sound) {
      const { sound } = await Audio.Sound.createAsync(letter.sound);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    }
  };

  const clearTrace = () => setPaths([]);

  const nextLetter = () => {
    setIndex((i) => (i + 1) % hindiLetters.length);
    setPaths([]);
  };

  const prevLetter = () => {
    setIndex((i) => (i - 1 + hindiLetters.length) % hindiLetters.length);
    setPaths([]);
  };

  const letter = hindiLetters[index];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 8 }}>
        Trace the letter
      </ThemedText>
      <ThemedText style={styles.letter}>{letter.letter}</ThemedText>
      <View style={styles.canvasContainer}>
        <View
          style={styles.canvas}
          {...panResponder.panHandlers}
        >
          <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
            {/* Letter outline for tracing */}
            <SvgText
              x={CANVAS_SIZE / 2}
              y={CANVAS_SIZE * 0.65}
              fontSize={CANVAS_SIZE * 0.7}
              fill="#e0e0e0"
              fontWeight="bold"
              textAnchor="middle"
              opacity={0.7}
            >
              {letter.letter}
            </SvgText>
            {/* User's traced paths */}
            {paths.map((d, i) => (
              <Path key={i} d={d} stroke="#1976d2" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {currentPath ? (
              <Path d={currentPath} stroke="#1976d2" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ) : null}
          </Svg>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <Button title="◀" onPress={prevLetter} />
        <Button title="🔊" onPress={playSound} />
        <Button title="Clear" onPress={clearTrace} />
        <Button title="▶" onPress={nextLetter} />
      </View>
      <ThemedText style={styles.word}>{letter.word}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    justifyContent: 'center',
  },
  letter: {
    fontSize: 64,
    color: '#bdbdbd',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  canvasContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    marginVertical: 12,
    overflow: 'hidden',
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#fafafa',
    borderRadius: 16,
    position: 'relative',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
    justifyContent: 'center',
  },
  word: {
    fontSize: 28,
    marginTop: 8,
    color: '#333',
    fontWeight: '500',
  },
});