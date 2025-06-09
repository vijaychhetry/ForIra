import { useRouter } from 'expo-router';
import { Button, View } from 'react-native';

export default function GameScreen() {
  const router = useRouter();
  return (
    <View>
      {/* ...your game UI... */}
      <Button title="Match Game" onPress={() => router.push('/(tabs)/game/MatchScreen')} />
    </View>
  );
}