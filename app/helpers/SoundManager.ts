// SoundManager.ts
// Centralized audio manager: caches sounds by key, prevents duplicate loads,
// stops any currently playing sound before starting a new one, and auto-unloads
// one-shot sounds when they finish.
import { Audio } from 'expo-av';

const soundCache = new Map<string, Audio.Sound>();
let currentSound: Audio.Sound | null = null;

export const SoundManager = {
  /**
   * Play a sound from a source.
   * @param source  - The require()'d asset or URI object.
   * @param cacheKey - Optional stable key to cache/reuse this sound across calls.
   *                   Pass the same key for recurring sounds (correct/wrong SFX)
   *                   to avoid re-loading them on every tap.
   *                   Omit for one-shot sounds that should be discarded after playback.
   */
  async play(source: any, cacheKey?: string): Promise<void> {
    if (!source) return;
    try {
      // Stop whatever is currently playing
      if (currentSound) {
        try { await currentSound.stopAsync(); } catch { /* ignore */ }
      }

      let sound: Audio.Sound;

      if (cacheKey && soundCache.has(cacheKey)) {
        // Reuse cached sound — seek back to start
        sound = soundCache.get(cacheKey)!;
        await sound.setPositionAsync(0);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(source);
        sound = newSound;
        if (cacheKey) {
          soundCache.set(cacheKey, sound);
        } else {
          // Auto-unload one-shot sounds when they finish
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              sound.unloadAsync().catch(() => {});
              if (currentSound === sound) currentSound = null;
            }
          });
        }
      }

      currentSound = sound;
      await sound.playAsync();
    } catch (e) {
      console.warn('SoundManager.play error:', e);
    }
  },

  /**
   * Pre-load a sound into the cache so the first playback has no latency.
   */
  async preload(source: any, cacheKey: string): Promise<void> {
    if (soundCache.has(cacheKey)) return;
    try {
      const { sound } = await Audio.Sound.createAsync(source);
      soundCache.set(cacheKey, sound);
    } catch (e) {
      console.warn('SoundManager.preload error:', e);
    }
  },

  /**
   * Unload a specific cached sound to free memory.
   */
  async unload(cacheKey: string): Promise<void> {
    const sound = soundCache.get(cacheKey);
    if (sound) {
      try { await sound.unloadAsync(); } catch { /* ignore */ }
      soundCache.delete(cacheKey);
      if (currentSound === sound) currentSound = null;
    }
  },

  /**
   * Unload all cached sounds — call this in a screen's useEffect cleanup
   * if that screen preloaded sounds.
   */
  async unloadAll(): Promise<void> {
    for (const sound of soundCache.values()) {
      try { await sound.unloadAsync(); } catch { /* ignore */ }
    }
    soundCache.clear();
    currentSound = null;
  },

  /**
   * Stop the currently playing sound without unloading it.
   */
  async stop(): Promise<void> {
    if (currentSound) {
      try { await currentSound.stopAsync(); } catch { /* ignore */ }
      currentSound = null;
    }
  },
};
