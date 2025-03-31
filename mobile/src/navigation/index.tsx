import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import StartScreen from '~/screens/StartScreen';  
import AboutScreen from '~/screens/AboutScreen';
import FlightListScreen from '~/screens/FlightListScreen';
import SelectAirportScreen from '~/screens/SelectAirportScreen';
import FlightDetailsScreen from '~/screens/FlightDetailsScreen';
import Flight from '~/types/Flight';

export type RootStackParamList = {
  StartScreen: undefined; 
  AboutScreen: undefined;
  CalculationScreen: undefined;
  SelectAirportScreen: { departure: string; arrival: string; startDate: string };
  FlightListScreen: { departure: string; arrival: string; startDate: string };
  FlightDetailsScreen: { flight: Flight };
};

const Stack = createStackNavigator<RootStackParamList>();

const RootStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="StartScreen" 
          component={StartScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="AboutScreen" 
          component={AboutScreen} 
        />
        <Stack.Screen name = "SelectAirportScreen" component={SelectAirportScreen}></Stack.Screen>
        <Stack.Screen name = "FlightListScreen" component={FlightListScreen}></Stack.Screen>
        <Stack.Screen name = "FlightDetailsScreen" component={FlightDetailsScreen}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;
