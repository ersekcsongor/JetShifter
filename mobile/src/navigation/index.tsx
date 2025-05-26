import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '~/contexts/AuthContext';

// Screens
import StartScreen from '~/screens/StartScreen';
import AboutScreen from '~/screens/AboutScreen';
import FlightListScreen from '~/screens/FlightListScreen';
import SelectAirportScreen from '~/screens/SelectAirportScreen';
import FlightDetailsScreen from '~/screens/FlightDetailsScreen';
import LoginScreen from '~/screens/LoginScreen';
import RegisterScreen from '~/screens/RegisterScreen';
import Flight from '~/types/Flight';
import UserDetailsScreen from '~/screens/UserDetailsScreen';

// Define nested navigator types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  StartScreen: undefined;
  AboutScreen: undefined;
  SelectAirportScreen: undefined;
  FlightListScreen: { departure: string; arrival: string; startDate: string };
  FlightDetailsScreen: { flight: Flight };
  UserDetailsScreen: undefined;
};

export type RootStackParamList = {
  Auth: { screen: keyof AuthStackParamList };
  App: { screen: keyof AppStackParamList };
};

// Create navigators
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const AppStack = createStackNavigator<AppStackParamList>();

// Auth Stack Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// App Stack Navigator
const AppNavigator = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="StartScreen" component={StartScreen} />
    <AppStack.Screen name="AboutScreen" component={AboutScreen} />
    <AppStack.Screen name="SelectAirportScreen" component={SelectAirportScreen} />
    <AppStack.Screen name="FlightListScreen" component={FlightListScreen} />
    <AppStack.Screen name="FlightDetailsScreen" component={FlightDetailsScreen} />
    <AppStack.Screen name="UserDetailsScreen" component={UserDetailsScreen} options={{ title: 'Profile' }} />
  </AppStack.Navigator>
);

// Main Navigator
const MainNavigator = () => {
  const { authState } = useAuth();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {authState?.authenticated ? (
          <RootStack.Screen name="App" component={AppNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;