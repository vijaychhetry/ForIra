import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Tts from 'react-native-tts';

const INACTIVE_COLOR = '#9e9e9e';
const ACTIVE_COLOR = '#ff7043';
const INACTIVE_BG = 'transparent';
const ACTIVE_BG = '#fff3e0';

const TAP_HIGHLIGHT_MS = 700;

export interface KaraokeTextProps {
  /** The sentence, split into individual words. */
  words: string[];
  /** Called with the tapped word's index. */
  onWordTap?: (index: number) => void;
  /** Whether audio playback is currently in progress. */
  isPlaying?: boolean;
  /** The word index that should be highlighted while isPlaying is true. */
  activeWordIndex?: number;
  style?: StyleProp<ViewStyle>;
}

interface WordBlockProps {
  word: string;
  isActive: boolean;
  onPress: () => void;
}

function WordBlock({ word, isActive, onPress }: WordBlockProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: 250 });
  }, [isActive, progress]);

  const animatedTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [INACTIVE_COLOR, ACTIVE_COLOR]),
  }));

  const animatedBlockStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [INACTIVE_BG, ACTIVE_BG]),
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.wordTouchable}>
      <Animated.View style={[styles.wordBlock, animatedBlockStyle]}>
        <Animated.Text style={[styles.wordText, animatedTextStyle]}>{word}</Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

/**
 * Renders a sentence as a row of tappable word blocks. While `isPlaying` is
 * true, the word at `activeWordIndex` is highlighted via a Reanimated color
 * interpolation (gray -> active -> gray). Tapping any word speaks it via TTS,
 * briefly highlights it, and calls `onWordTap`.
 */
export function KaraokeText({ words, onWordTap, isPlaying = false, activeWordIndex = -1, style }: KaraokeTextProps) {
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (tappedIndex === null) {
      return;
    }
    const timeout = setTimeout(() => setTappedIndex(null), TAP_HIGHLIGHT_MS);
    return () => clearTimeout(timeout);
  }, [tappedIndex]);

  const handleWordPress = (index: number) => {
    setTappedIndex(index);
    try {
      Tts.speak(words[index]);
    } catch {
      // TTS may be unavailable (e.g. simulator without speech synthesis) -- ignore.
    }
    onWordTap?.(index);
  };

  return (
    <View style={[styles.row, style]}>
      {words.map((word, index) => (
        <WordBlock
          key={`${index}-${word}`}
          word={word}
          isActive={(isPlaying && activeWordIndex === index) || tappedIndex === index}
          onPress={() => handleWordPress(index)}
        />
      ))}
    </View>
  );
}

export default KaraokeText;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  wordTouchable: {
    marginHorizontal: 4,
    marginVertical: 4,
  },
  wordBlock: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  wordText: {
    fontSize: 22,
    fontWeight: '600',
  },
});
