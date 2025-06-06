// filepath: IRA-Hindi/screens/HomeScreen.js
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Button title="Learn" onPress={() => navigation.navigate('Learn')} />
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