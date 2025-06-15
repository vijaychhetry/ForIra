import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { tabTileStyles } from './TabTile.styles'; // Use common tab tile styles

const tiles = [
	{
		title: 'Unicorn Color Quiz',
		subtitle: 'Learn colors with magical unicorns',
		color: '#9c27b0',
		onPress: (router: any) => router.push('../screens/UnicornColorQuizScreen'),
		emoji: '🦄',
	},
	{
		title: 'Fruit Quiz',
		subtitle: 'Test your knowledge of fruits in Hindi',
		color: '#e91e63',
		onPress: (router: any) => router.push('../screens/UnicornFruitQuizScreen'),
		emoji: '🍎',
	},
	{
		title: 'Number Quiz',
		subtitle: 'Learn numbers in Hindi',
		color: '#ff9800',
		onPress: (router: any) => router.push('../screens/UnicornNumberQuizScreen'),
		emoji: '🔢',
	},
	{
		title: 'Pet Animals Quiz',
		subtitle: 'Test your knowledge of pet animals',
		color: '#9c27b0',
		onPress: (router: any) => router.push('../screens/UnicornPetAnimalsQuizScreen'),
		emoji: '🐶',
	},
	{
		title: 'Wild Animals Quiz',
		subtitle: 'Learn about wild animals in Hindi',
		color: '#ff9800',
		onPress: (router: any) => router.push('../screens/UnicornWildAnimalsQuizScreen'),
		emoji: '🦁',
	},
	{
		title: 'Shapes Quiz',
		subtitle: 'Test your knowledge of shapes',
		color: '#1976d2',
		onPress: (router: any) => router.push('../screens/UnicornShapesQuizScreen'),
		emoji: '⭐',
	},
	{
		title: 'Quiz: Listen & Choose',
		subtitle: 'Test by listening and picking the right answer',
		color: '#1976d2',
		onPress: (router: any) => router.push('../screens/QuizScreen'),
		emoji: '🎧',
	},
	{
		title: 'Quiz: Match Pairs',
		subtitle: 'Match letters and words for fun practice',
		color: '#ff9800',
		onPress: (router: any) => router.push('../screens/QuizScreen2'),
		emoji: '🧩',
	},
	{
		title: 'Quiz: Days of the Week',
		subtitle: 'Test your knowledge of Hindi weekdays',
		color: '#43a047',
		onPress: (router: any) => router.push('../screens/WeekDaysQuizScreen'),
		emoji: '📅',
	},
];

export default function QuizTab() {
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