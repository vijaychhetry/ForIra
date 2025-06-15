import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { tabTileStyles } from './TabTile.styles';

const tiles = [
  {
    title: 'Match Games',
    subtitle: 'Choose from different matching games',
    color: '#1976d2',
    onPress: (router: any) => router.push('/screens/MatchGameSelectionScreen'),
    emoji: '🧩',
  },
  {
    title: 'Memory Flip',
    subtitle: 'Flip cards and find pairs',
    color: '#43a047',
    onPress: (router: any) => router.push('/screens/MemoryFlipScreen'),
    emoji: '🃏',
  },
  {
    title: 'Word Builder',
    subtitle: 'Build Hindi words from letters',
    color: '#ff9800',
    onPress: (router: any) => router.push('/screens/WordBuilderScreen'),
    emoji: '🔤',
  },
  {
    title: 'Quick Tap',
    subtitle: 'Tap the correct letter quickly!',
    color: '#e91e63',
    onPress: (router: any) => router.push('/screens/QuickTapScreen'),
    emoji: '⚡',
  },
];

export default function GameTab() {
  const router = useRouter();
  return (
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
  );
}