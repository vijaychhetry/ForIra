import { useRouter } from 'expo-router';
import { Button, View } from 'react-native';

export default function GameTab() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: 'center', gap: 20, padding: 20 }}>
      <Button title="Match Game" onPress={() => router.push('/screens/MatchScreen')} />
      {/* Add more game submenu buttons here if needed */}
    </View>
  );
}