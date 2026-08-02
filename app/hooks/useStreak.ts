import { useCallback, useEffect, useState } from 'react';
import { loadProgressData, saveProgressData, StreakData } from './useProgress';

export type { StreakData };

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Whole-day difference between two 'YYYY-MM-DD' date strings (b - a). */
function dayDifference(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const dateA = new Date(`${a}T00:00:00Z`).getTime();
  const dateB = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((dateB - dateA) / msPerDay);
}

/**
 * Tracks Ira's daily play streak (current, longest, lastPlayedDate),
 * persisted to AsyncStorage under the shared 'ira_progress' key.
 */
export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastPlayedDate: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadProgressData().then((data) => {
      if (mounted) {
        setStreak(data.streak);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const getStreak = useCallback(async (): Promise<StreakData> => {
    const fresh = await loadProgressData();
    setStreak(fresh.streak);
    return fresh.streak;
  }, []);

  /**
   * Call once per play session. Increments the streak if today is the day
   * after lastPlayedDate, resets to 1 if a day (or more) was skipped, leaves
   * it unchanged if already played today, and starts at 1 the first time.
   */
  const updateStreak = useCallback(async (): Promise<StreakData> => {
    const fresh = await loadProgressData();
    const previous = fresh.streak;
    const today = todayDateString();

    let next: StreakData;
    if (!previous.lastPlayedDate) {
      next = { current: 1, longest: Math.max(1, previous.longest), lastPlayedDate: today };
    } else if (previous.lastPlayedDate === today) {
      next = previous;
    } else {
      const diff = dayDifference(previous.lastPlayedDate, today);
      if (diff === 1) {
        const current = previous.current + 1;
        next = { current, longest: Math.max(previous.longest, current), lastPlayedDate: today };
      } else {
        // A day (or more) was skipped -- streak resets.
        next = { current: 1, longest: previous.longest, lastPlayedDate: today };
      }
    }

    await saveProgressData({ ...fresh, streak: next });
    setStreak(next);
    return next;
  }, []);

  return {
    loading,
    current: streak.current,
    longest: streak.longest,
    lastPlayedDate: streak.lastPlayedDate,
    getStreak,
    updateStreak,
  };
}
