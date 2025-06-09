import { useRouter } from 'expo-router';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const tiles = [
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