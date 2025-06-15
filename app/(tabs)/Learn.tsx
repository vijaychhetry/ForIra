import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { tabTileStyles } from './TabTile.styles'; // <-- Import common styles

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
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      <ScrollView contentContainerStyle={tabTileStyles.scrollContainer}>
        <View style={tabTileStyles.container}>
          {tiles.map((tile, idx) => (
            <TouchableOpacity
              key={tile.title}
              style={[tabTileStyles.tile, { backgroundColor: tile.color }]}
              activeOpacity={0.85}
              onPress={() => tile.onPress(router)}
            >
              <Text style={tabTileStyles.emoji}>{tile.emoji}</Text>
              <Text style={tabTileStyles.title}>{tile.title}</Text>
              <Text style={tabTileStyles.subtitle}>{tile.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}