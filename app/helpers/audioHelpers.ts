import { Audio } from 'expo-av';

export async function playSoundAsync(source: any) {
  if (!source) return;
  try {
    const { sound } = await Audio.Sound.createAsync(source);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    // Optionally handle error
    // console.warn('Audio play error:', e);
  }
}