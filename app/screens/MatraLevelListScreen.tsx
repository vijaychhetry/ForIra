import React, { useEffect, useRef } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { matraLevels } from '../constants/readingContent';
import { useProgress } from '../hooks/useProgress';
import { StarRating } from '../../components/StarRating';

interface LevelCardProps {
  index: number;
  name: string;
  stars: number;
  unlocked: boolean;
  onPress: () => void;
}

/**
 * A single tappable level card. Tracks its own previous unlocked state so it
 * can play a short lock-to-unlock "pop" animation the moment a level flips
 * from locked to unlocked (e.g. right after the previous level is completed
 * and progress refreshes).
 */
function LevelCard({ index, name, stars, unlocked, onPress }: LevelCardProps) {
  const wasUnlockedRef = useRef(unlocked);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (unlocked && !wasUnlockedRef.current) {
      // Just unlocked: pop + a little wiggle to celebrate.
      scale.value = withSequence(
        withSpring(1.12, { damping: 5, stiffness: 180 }),
        withSpring(1, { damping: 8, stiffness: 140 }),
      );
      rotate.value = withSequence(
        withTiming(-6, { duration: 90, easing: Easing.out(Easing.ease) }),
        withTiming(6, { duration: 90, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 90, easing: Easing.in(Easing.ease) }),
      );
    }
    wasUnlockedRef.current = unlocked;
  }, [unlocked, scale, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).duration(300)}
      style={animatedStyle}
    >
      <Pressable
        onPress={unlocked ? onPress : undefined}
        disabled={!unlocked}
        style={[styles.card, !unlocked && styles.cardLocked]}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.levelBadge, !unlocked && styles.levelBadgeLocked]}>
            <Text style={styles.levelBadgeText}>{index + 1}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.levelName, !unlocked && styles.levelNameLocked]}>
            {name}
          </Text>
          <StarRating stars={stars} size={22} />
        </View>

        {!unlocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={28} color="#9e9e9e" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function MatraLevelListScreen() {
  const router = useRouter();
  const { getLevelProgress, isLevelUnlocked, loading } = useProgress();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={22} color="#1976d2" />
        </Pressable>
        <Text style={styles.headerTitle}>Matra Words</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {matraLevels.map((level, index) => {
          const { stars } = getLevelProgress(level.id);
          const unlocked = isLevelUnlocked(level.id);

          return (
            <LevelCard
              key={level.id}
              index={index}
              name={level.name}
              stars={stars}
              unlocked={unlocked}
              onPress={() =>
                router.push({
                  pathname: '/screens/MatraLevelScreen',
                  params: { levelId: level.id },
                })
              }
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingText: {
    marginTop: 100,
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerBack: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 34,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardLocked: {
    opacity: 0.55,
  },
  cardLeft: {
    marginRight: 16,
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeLocked: {
    backgroundColor: '#bdbdbd',
  },
  levelBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardBody: {
    flex: 1,
  },
  levelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  levelNameLocked: {
    color: '#888',
  },
  lockOverlay: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -14,
  },
});
