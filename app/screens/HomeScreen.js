// filepath: IRA-Hindi/screens/HomeScreen.js
import { Button, StyleSheet, View } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Button title="Learn" onPress={() => navigation.navigate('Learn')} />
      <Button title="Games" onPress={() => navigation.navigate('Games')} />
      <Button title="Match" onPress={() => navigation.navigate('Match')} />
      <Button title="Trace" onPress={() => navigation.navigate('Trace')} />
      <Button title="Quiz" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
    padding: 20,
  },
});