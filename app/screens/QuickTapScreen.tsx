import { StyleSheet, Text, View } from 'react-native';

export default function QuickTapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>⚡ Quick Tap</Text>
      <Text style={styles.text}>Tap the correct letter quickly! (Coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f6fa' },
  heading: { fontSize: 32, fontWeight: 'bold', color: '#e91e63', marginBottom: 16 },
  text: { fontSize: 18, color: '#333', textAlign: 'center' },
});