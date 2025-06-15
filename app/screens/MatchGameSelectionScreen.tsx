import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const matchGames = [
  {
    title: 'Days of Week',
    subtitle: 'Match Hindi and English days',
    color: '#1976d2',
    onPress: (router: any) => router.push('/screens/MatchScreen'),
    emoji: '📅',
  },
  {
    title: 'Wild Animals',
    subtitle: 'Match wild animals in Hindi and English',
    color: '#ff9800',
    onPress: (router: any) => router.push('/screens/UnicornWildAnimalsScreen'),
    emoji: '🦁',
  },
  {
    title: 'Fruits',
    subtitle: 'Match fruits in Hindi and English',
    color: '#e91e63',
    onPress: (router: any) => router.push('/screens/UnicornFruitMatchScreen'),
    emoji: '🍎',
  },
  {
    title: 'Pet Animals',
    subtitle: 'Match pet animals in Hindi and English',
    color: '#9c27b0',
    onPress: (router: any) => router.push('/screens/UnicornPetAnimalsScreen'),
    emoji: '🐶',
  },
  {
    title: 'Vegetables',
    subtitle: 'Match vegetables in Hindi and English',
    color: '#43a047',
    onPress: (router: any) => router.push('/screens/UnicornVegetableMatchScreen'),
    emoji: '🥕',
  },
];

const quizGames = [
  {
    title: 'Colors Quiz',
    subtitle: 'Test your knowledge of colors in Hindi',
    color: '#1976d2',
    onPress: (router: any) => router.push('/screens/UnicornColorsQuizScreen'),
    emoji: '🎨',
  },
  {
    title: 'Fruits Quiz',
    subtitle: 'Test your knowledge of fruits in Hindi',
    color: '#e91e63',
    onPress: (router: any) => router.push('/screens/UnicornFruitQuizScreen'),
    emoji: '🍎',
  },
  {
    title: 'Numbers Quiz',
    subtitle: 'Test your knowledge of numbers in Hindi',
    color: '#ff9800',
    onPress: (router: any) => router.push('/screens/UnicornNumberQuizScreen'),
    emoji: '🔢',
  },
  {
    title: 'Pet Animals Quiz',
    subtitle: 'Test your knowledge of pet animals in Hindi',
    color: '#9c27b0',
    onPress: (router: any) => router.push('/screens/UnicornPetAnimalsQuizScreen'),
    emoji: '🐶',
  },
  {
    title: 'Wild Animals Quiz',
    subtitle: 'Test your knowledge of wild animals in Hindi',
    color: '#ff9800',
    onPress: (router: any) => router.push('/screens/UnicornWildAnimalsQuizScreen'),
    emoji: '🦁',
  },
  {
    title: 'Shapes Quiz',
    subtitle: 'Test your knowledge of shapes in Hindi',
    color: '#43a047',
    onPress: (router: any) => router.push('/screens/UnicornShapesQuizScreen'),
    emoji: '⭐',
  },
];

export default function MatchGameSelectionScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>🦄 Match Games</Text>
      <View style={styles.gamesContainer}>
        {matchGames.map((game, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.gameButton, { backgroundColor: game.color }]}
            onPress={() => game.onPress(router)}
          >
            <Text style={styles.gameEmoji}>{game.emoji}</Text>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameSubtitle}>{game.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.heading}>🦄 Quiz Games</Text>
      <View style={styles.gamesContainer}>
        {quizGames.map((game, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.gameButton, { backgroundColor: game.color }]}
            onPress={() => game.onPress(router)}
          >
            <Text style={styles.gameEmoji}>{game.emoji}</Text>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameSubtitle}>{game.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 20,
    marginTop: 20,
  },
  gamesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  gameButton: {
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
  },
  gameEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  gameSubtitle: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
  },
}); 