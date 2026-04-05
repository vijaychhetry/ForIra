import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { tabTileStyles } from './TabTile.styles';

type Router = ReturnType<typeof useRouter>;

const tiles: { title: string; subtitle: string; color: string; emoji: string; onPress: (r: Router) => void }[] = [
  {
    title: 'Learn Vowels & Matras',
    subtitle: 'See and hear Hindi Vowels & Matras',
    color: '#1976d2',
    onPress: (router) => router.push('/screens/LearnScreen?type=vowels&matras=true'),
    emoji: '🔤',
  },
  {
    title: 'Learn Consonants',
    subtitle: 'See and hear Hindi Consonants',
    color: '#9c27b0',
    onPress: (router) => router.push('/screens/LearnScreen?type=consonants'),
    emoji: '📝',
  },
  {
    title: 'Learn Vowels',
    subtitle: 'See and hear Hindi Vowels',
    color: '#1976d2',
    onPress: (router) => router.push('/screens/LearnScreen?type=vowels'),
    emoji: '🔤',
  },
  {
    title: 'Barakhadi',
    subtitle: 'Learn consonant + vowel combinations',
    color: '#ff5722',
    onPress: (router) => router.push('/screens/BarakhadiScreen'),
    emoji: '📚',
  },
  {
    title: 'Trace Letters',
    subtitle: 'Practice writing by tracing',
    color: '#43a047',
    onPress: (router) => router.push('/screens/TraceScreen'),
    emoji: '✍️',
  },
  {
    title: 'Learn Days of the Week',
    subtitle: 'Learn Hindi names for days (सोमवार, मंगलवार...)',
    color: '#ff9800',
    onPress: (router) => router.push('/screens/WeekDaysScreen'),
    emoji: '📅',
  },
];

export default function LearnTab() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      <ScrollView contentContainerStyle={tabTileStyles.scrollContainer}>
        <View style={tabTileStyles.container}>
          {tiles.map((tile) => (
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
