import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

/**
 * Shared AsyncStorage key for all Ira progress data (levels, coins, streak,
 * sentences, stories, avatar). See docs/superpowers/specs/
 * 2026-08-02-ira-hindi-2nd-standard-levelup-design.md section 3.4.
 */
export const PROGRESS_STORAGE_KEY = 'ira_progress';

export interface LevelProgress {
  stars: number;
  bestScore: number;
  completed: boolean;
}

export interface SentenceGroupProgress {
  completed: number;
  total: number;
}

export interface StoryProgress {
  read: boolean;
  quizScore?: number;
}

export interface StreakData {
  current: number;
  longest: number;
  lastPlayedDate: string | null;
}

export interface AvatarLoadout {
  hat: string | null;
  glasses: string | null;
  wings: string | null;
  background: string | null;
}

export interface ProgressData {
  levels: Record<string, LevelProgress>;
  sentences: Record<string, SentenceGroupProgress>;
  stories: Record<string, StoryProgress>;
  streak: StreakData;
  coins: number;
  totalStars: number;
  avatar: AvatarLoadout;
  ownedItems: string[];
}

export const DEFAULT_PROGRESS_DATA: ProgressData = {
  levels: {},
  sentences: {},
  stories: {},
  streak: { current: 0, longest: 0, lastPlayedDate: null },
  coins: 0,
  totalStars: 0,
  avatar: { hat: null, glasses: null, wings: null, background: null },
  ownedItems: [],
};

/** Ordered ids of the 10 matra levels used to compute sequential unlocks. */
export const MATRA_LEVEL_ORDER = [
  'matra_aa',
  'matra_i',
  'matra_ii',
  'matra_u',
  'matra_uu',
  'matra_e',
  'matra_ai',
  'matra_o',
  'matra_au',
  'matra_mixed',
];

/** Accuracy percentage (0-100) required on a level to unlock the next one. */
export const UNLOCK_THRESHOLD_PERCENT = 80;

export async function loadProgressData(): Promise<ProgressData> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PROGRESS_DATA };
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS_DATA,
      ...parsed,
      streak: { ...DEFAULT_PROGRESS_DATA.streak, ...(parsed?.streak ?? {}) },
      avatar: { ...DEFAULT_PROGRESS_DATA.avatar, ...(parsed?.avatar ?? {}) },
      levels: { ...(parsed?.levels ?? {}) },
      sentences: { ...(parsed?.sentences ?? {}) },
      stories: { ...(parsed?.stories ?? {}) },
      ownedItems: parsed?.ownedItems ?? [],
    };
  } catch {
    return { ...DEFAULT_PROGRESS_DATA };
  }
}

export async function saveProgressData(data: ProgressData): Promise<void> {
  await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
}

function computeTotalStars(levels: Record<string, LevelProgress>): number {
  return Object.values(levels).reduce((sum, level) => sum + (level?.stars ?? 0), 0);
}

/**
 * Reads and writes level completion progress (stars, best score) to
 * AsyncStorage under the shared 'ira_progress' key.
 */
export function useProgress() {
  const [data, setData] = useState<ProgressData>(DEFAULT_PROGRESS_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadProgressData().then((loaded) => {
      if (mounted) {
        setData(loaded);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const fresh = await loadProgressData();
    setData(fresh);
    return fresh;
  }, []);

  const getLevelProgress = useCallback(
    (levelId: string): LevelProgress => {
      return data.levels[levelId] ?? { stars: 0, bestScore: 0, completed: false };
    },
    [data]
  );

  const saveLevelProgress = useCallback(
    async (levelId: string, stars: number, score: number): Promise<LevelProgress> => {
      const fresh = await loadProgressData();
      const previous = fresh.levels[levelId];
      const bestStars = Math.max(previous?.stars ?? 0, stars);
      const bestScore = Math.max(previous?.bestScore ?? 0, score);
      const completed = (previous?.completed ?? false) || bestScore >= UNLOCK_THRESHOLD_PERCENT;

      const updatedLevel: LevelProgress = { stars: bestStars, bestScore, completed };
      const updatedLevels = { ...fresh.levels, [levelId]: updatedLevel };
      const updated: ProgressData = {
        ...fresh,
        levels: updatedLevels,
        totalStars: computeTotalStars(updatedLevels),
      };

      await saveProgressData(updated);
      setData(updated);
      return updatedLevel;
    },
    []
  );

  const isLevelUnlocked = useCallback(
    (levelId: string): boolean => {
      const idx = MATRA_LEVEL_ORDER.indexOf(levelId);
      if (idx <= 0) {
        // First level (or an id not part of the sequence) is always unlocked.
        return true;
      }
      const previousLevelId = MATRA_LEVEL_ORDER[idx - 1];
      const previousProgress = data.levels[previousLevelId];
      return !!previousProgress?.completed;
    },
    [data]
  );

  return {
    loading,
    levels: data.levels,
    totalStars: data.totalStars,
    getLevelProgress,
    saveLevelProgress,
    isLevelUnlocked,
    refresh,
  };
}
