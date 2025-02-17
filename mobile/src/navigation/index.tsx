import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import StartScreen from '~/screens/StartScreen';  // Adjust according to your project structure
import AboutScreen from '~/screens/AboutScreen';
import CalculationScreen from '~/screens/CalculationScreen';

// Define the types for your navigation params (if needed)
export type RootStackParamList = {
  StartScreen: undefined;  // No params for this screen
  AboutScreen: undefined;  // No params for this screen
  CalculationScreen: undefined;  // No params for this screen
};

const Stack = createStackNavigator<RootStackParamList>();

const RootStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="StartScreen" 
          component={StartScreen} 
          options={{ headerShown: false }}  // Hide the header if needed
        />
        <Stack.Screen 
          name="CalculationScreen" 
          component={CalculationScreen} 
        />
        <Stack.Screen 
          name="AboutScreen" 
          component={AboutScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;
