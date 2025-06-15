import { StyleSheet, Text, View } from 'react-native';

export default function WordBuilderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🔤 Word Builder</Text>
      <Text style={styles.text}>Build Hindi words from letters! (Coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f6fa' },
  heading: { fontSize: 32, fontWeight: 'bold', color: '#ff9800', marginBottom: 16 },
  text: { fontSize: 18, color: '#333', textAlign: 'center' },
});