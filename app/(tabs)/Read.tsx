import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { tabTileStyles } from './TabTile.styles'; // Use common tab tile styles

const tiles = [
	{
		title: 'Matra Words',
		subtitle: 'Read words with matras, level by level',
		color: '#1976d2',
		onPress: (router: any) => router.push('../screens/MatraLevelListScreen'),
		emoji: '🔤',
	},
	{
		title: 'Sentence Reading',
		subtitle: 'Read simple sentences with word-by-word audio',
		color: '#43a047',
		onPress: (router: any) => router.push('../screens/SentenceReadingScreen'),
		emoji: '📖',
	},
	{
		title: 'Stories',
		subtitle: 'Enjoy short Hindi stories',
		color: '#ff9800',
		onPress: (router: any) => router.push('../screens/StoryListScreen'),
		emoji: '📚',
	},
];

export default function ReadTab() {
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
