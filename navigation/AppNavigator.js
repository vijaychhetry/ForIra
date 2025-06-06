// filepath: IRA-Hindi/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import LearnScreen from '../screens/LearnScreen';
import MatchScreen from '../screens/MatchScreen';
import TraceScreen from '../screens/TraceScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Learn" component={LearnScreen} />
        <Stack.Screen name="Match" component={MatchScreen} />
        <Stack.Screen name="Trace" component={TraceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}