import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { playSoundAsync } from '../helpers/audioHelpers';

const days = [
  { en: 'Monday', hi: 'सोमवार', sound: require('../../assets/sounds/WeekDays/01_Monday.mp3') },
  { en: 'Tuesday', hi: 'मंगलवार', sound: require('../../assets/sounds/WeekDays/02_Tuesday.mp3') },
  { en: 'Wednesday', hi: 'बुधवार', sound: require('../../assets/sounds/WeekDays/03_Wednesday.mp3') },
  { en: 'Thursday', hi: 'गुरुवार', sound: require('../../assets/sounds/WeekDays/04_Thursday.mp3') },
  { en: 'Friday', hi: 'शुक्रवार', sound: require('../../assets/sounds/WeekDays/05_Friday.mp3') },
  { en: 'Saturday', hi: 'शनिवार', sound: require('../../assets/sounds/WeekDays/06_Saturday.mp3') },
  { en: 'Sunday', hi: 'रविवार', sound: require('../../assets/sounds/WeekDays/07_Sunday.mp3') },
];

export default function WeekDaysScreen() {
  const handlePlay = async (sound: any) => {
    await playSoundAsync(sound);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Days of the Week in Hindi</Text>
      <ScrollView contentContainerStyle={styles.daysList}>
        {days.map((d, i) => (
          <TouchableOpacity
            key={d.en}
            style={styles.dayTile}
            activeOpacity={0.8}
            onPress={() => handlePlay(d.sound)}
          >
            <Text style={styles.hindi}>{d.hi}</Text>
            <Text style={styles.english}>{d.en}</Text>
            <Text style={styles.audioHint}>🔊 Tap to hear</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e1',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: 24,
    textAlign: 'center',
  },
  daysList: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  dayTile: {
    backgroundColor: '#ffe0b2',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginVertical: 10,
    alignItems: 'center',
    width: 280,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  hindi: {
    fontSize: 32,
    color: '#ff9800',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  english: {
    fontSize: 18,
    color: '#6d4c41',
    letterSpacing: 1,
  },
  audioHint: {
    fontSize: 14,
    color: '#888',
    marginTop: 6,
  },
});