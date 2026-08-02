import React from 'react';
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
import Animated, { FadeInDown } from 'react-native-reanimated';

import { stories } from '../constants/readingContent';
import { useProgress } from '../hooks/useProgress';

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#4caf50',
  medium: '#ff9800',
  hard: '#e53935',
};

export default function StoryListScreen() {
  const router = useRouter();
  const { getLevelProgress, getStoryProgress, loading } = useProgress();

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
        <Text style={styles.headerTitle}>Stories</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {stories.map((story, index) => {
          const unlocked =
            story.unlockAfterLevelId === null ||
            getLevelProgress(story.unlockAfterLevelId).completed;
          const progress = getStoryProgress(story.id);

          return (
            <Animated.View
              key={story.id}
              entering={FadeInDown.delay(index * 50).duration(300)}
              style={[styles.card, !unlocked && styles.cardLocked]}
            >
              <Pressable
                onPress={
                  unlocked
                    ? () =>
                        router.push({
                          pathname: '/screens/StoryScreen',
                          params: { storyId: story.id },
                        })
                    : undefined
                }
                disabled={!unlocked}
                style={styles.cardPressable}
              >
                <Text style={styles.cardEmoji}>{story.emoji}</Text>
                <Text style={[styles.cardTitle, !unlocked && styles.cardTitleLocked]}>
                  {story.title}
                </Text>

                <View
                  style={[
                    styles.difficultyPill,
                    { backgroundColor: DIFFICULTY_COLOR[story.difficulty] },
                  ]}
                >
                  <Text style={styles.difficultyText}>
                    {DIFFICULTY_LABEL[story.difficulty]}
                  </Text>
                </View>

                {progress.read && (
                  <View style={styles.readBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#fff" />
                    <Text style={styles.readBadgeText}>Read</Text>
                  </View>
                )}

                {!unlocked && (
                  <View style={styles.lockOverlay}>
                    <Ionicons name="lock-closed" size={26} color="#9e9e9e" />
                  </View>
                )}
              </Pressable>
            </Animated.View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
    gap: 14,
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardLocked: {
    opacity: 0.55,
  },
  cardPressable: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardTitleLocked: {
    color: '#888',
  },
  difficultyPill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  readBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  readBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
  },
});
