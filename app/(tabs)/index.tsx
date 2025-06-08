import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Button, StyleSheet, View } from 'react-native';

export default function GameHomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.logo}
        />
        <ThemedText type="title" style={styles.title}>
          IRA Hindi Game
        </ThemedText>
        <HelloWave />
      </View>
      <ThemedText type="subtitle" style={styles.subtitle}>
        Choose an activity to start learning!
      </ThemedText>
      <View style={styles.buttonContainer}>
        <Button title="Learn" onPress={() => router.push('/(tabs)/LearnScreen')} />
        {/* <Button title="Match" onPress={() => router.push('./match')} /> */}
        {/* <Button title="Trace" onPress={() => router.push('./trace')} /> */}
        <Button title="Quiz" onPress={() => router.push('/(tabs)/QuizScreen')} />
        <Button title="Quiz2" onPress={() => router.push('/(tabs)/QuizScreen2')} />

      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    height: 120,
    width: 180,
    marginBottom: 12,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
});
