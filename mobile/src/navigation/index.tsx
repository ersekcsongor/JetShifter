import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '~/contexts/AuthContext';

// Existing imports
import StartScreen from '~/screens/StartScreen';
import AboutScreen from '~/screens/AboutScreen';
import FlightListScreen from '~/screens/FlightListScreen';
import SelectAirportScreen from '~/screens/SelectAirportScreen';
import FlightDetailsScreen from '~/screens/FlightDetailsScreen';
import Flight from '~/types/Flight';

// Auth screens
import LoginScreen from '~/screens/LoginScreen';
import RegisterScreen from '~/screens/RegisterScreen';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  StartScreen: undefined;
  AboutScreen: undefined;
  CalculationScreen: undefined;
  SelectAirportScreen: { departure: string; arrival: string; startDate: string };
  FlightListScreen: { departure: string; arrival: string; startDate: string };
  FlightDetailsScreen: { flight: Flight };
  Login: undefined;
  Register: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<RootStackParamList>();
const AppStack = createStackNavigator<RootStackParamList>();

const AuthScreens = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const AppScreens = () => (
  <AppStack.Navigator>
    <AppStack.Screen 
      name="StartScreen" 
      component={StartScreen} 
      options={{ headerShown: false }} 
    />
    <AppStack.Screen name="AboutScreen" component={AboutScreen} />
    <AppStack.Screen name="SelectAirportScreen" component={SelectAirportScreen} />
    <AppStack.Screen name="FlightListScreen" component={FlightListScreen} />
    <AppStack.Screen name="FlightDetailsScreen" component={FlightDetailsScreen} />
  </AppStack.Navigator>
);

const RootStack = () => {
  const { authState } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authState?.authenticated ? (
          <Stack.Screen name="App" component={AppScreens} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreens} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;