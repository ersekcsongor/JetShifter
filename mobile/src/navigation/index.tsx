import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '~/contexts/AuthContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

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
import SavedFlightsScreen from '~/screens/SavedFlightsScreen';


// Define nested navigator types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  StartScreen: undefined;
  AboutScreen: undefined;
  SelectAirportScreen: undefined;
  FlightListScreen: { departure: string; arrival: string; startDate: string };
  FlightDetailsScreen: { flight: Flight };
  UserDetailsScreen: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
};

export type RootStackParamList = {
  Auth: { screen: keyof AuthStackParamList };
  App: { screen: keyof AppStackParamList };
};

// Create navigators
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const AppStack = createStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// App Tab Navigator
const AppTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#FFC700',
      tabBarInactiveTintColor: '#6B5B00',
      tabBarIcon: ({ color, size }) => {
        if (route.name === 'StartScreen') {
          return <MaterialIcons name="flight-land" size={size} color={color} />;
        }
        if (route.name === 'SavedFlightsScreen') {
          return <MaterialIcons name="bookmark" size={size} color={color} />;
        }
        if (route.name === 'UserDetailsScreen') {
          return <Ionicons name="person-circle" size={size} color={color} />;
        }
        return null;
      },
    })}
  >
    <Tab.Screen name="StartScreen" component={StartScreen} options={{ title: 'Home' }} />
    <Tab.Screen name="SavedFlightsScreen" component={SavedFlightsScreen} options={{ title: 'Saved' }} />
    <Tab.Screen name="UserDetailsScreen" component={UserDetailsScreen} options={{ title: 'Account' }} />
  </Tab.Navigator>
);

// App Stack Navigator
const AppNavigator = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="MainTabs" component={AppTabNavigator} />
    <AppStack.Screen name="AboutScreen" component={AboutScreen} />
    <AppStack.Screen name="SelectAirportScreen" component={SelectAirportScreen} />
    <AppStack.Screen name="FlightListScreen" component={FlightListScreen} />
    <AppStack.Screen name="FlightDetailsScreen" component={FlightDetailsScreen} />
    <AppStack.Screen name="LoginScreen" component={LoginScreen} />
    <AppStack.Screen name="RegisterScreen" component={RegisterScreen} />
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