import { useRouter } from 'expo-router';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const tiles = [
  {
    title: 'Learn Letters',
    subtitle: 'See and hear Hindi letters',
    color: '#1976d2',
    onPress: (router: any) => router.push('../screens/LearnScreen'),
    emoji: '🔤',
  },
  {
    title: 'Trace Letters',
    subtitle: 'Practice writing by tracing',
    color: '#43a047',
    onPress: (router: any) => router.push('../screens/TraceScreen'),
    emoji: '✍️',
  },
  {
    title: 'Learn Days of the Week',
    subtitle: 'Learn Hindi names for days (सोमवार, मंगलवार...)',
    color: '#ff9800',
    onPress: (router: any) => router.push('../screens/WeekDaysScreen'),
    emoji: '📅',
  },
];

export default function LearnTab() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {tiles.map((tile, idx) => (
        <TouchableOpacity
          key={tile.title}
          style={[styles.tile, { backgroundColor: tile.color }]}
          activeOpacity={0.85}
          onPress={() => tile.onPress(router)}
        >
          <Text style={styles.emoji}>{tile.emoji}</Text>
          <Text style={styles.title}>{tile.title}</Text>
          <Text style={styles.subtitle}>{tile.subtitle}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const { width } = Dimensions.get('window');
const TILE_WIDTH = width * 0.85;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
    backgroundColor: '#f5f6fa',
  },
  tile: {
    width: TILE_WIDTH,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginVertical: 10,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
    textAlign: 'center',
    marginTop: 2,
  },
});