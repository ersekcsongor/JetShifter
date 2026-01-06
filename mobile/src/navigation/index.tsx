import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '~/contexts/AuthContext';
import { useTheme } from '~/contexts/ThemeContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import ChooseScreen from '~/screens/ChooseScreen';
import CustomFlightScreen from '~/screens/CustomFlightScreen';
import FlightDetailsScreenCustom from '~/screens/FlightDetailsScreenCustom';
import TransatlanticFlightListScreen from '~/screens/TransatlanticFlightListScreen';
import FlightNumberSearchScreen from '~/screens/FlightNumberSearchScreen';


// Define nested navigator types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  StartScreen: undefined;
  AboutScreen: undefined;
  ChooseScreen: undefined; // <-- Add this line
  SelectAirportScreen: undefined;
  TransatlanticFlightListScreen: undefined;
  FlightNumberSearchScreen: undefined;
  FlightListScreen: { departure: string; arrival: string; startDate: string };
  FlightDetailsScreen: { flight: Flight };
  UserDetailsScreen: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  CustomFlightScreen: undefined;
  FlightDetailsScreenCustom : { flight: Flight };// Add this if you have a custom flight screen
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
const AppTabNavigator = () => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: isDarkMode ? '#ffffff' : '#1a1a1a',
        tabBarInactiveTintColor: isDarkMode ? '#666666' : '#999999',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
          borderTopColor: isDarkMode ? '#404040' : '#d0d0d0',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          marginBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = focused ? size + 2 : size;

          if (route.name === 'StartScreen') {
            return <MaterialIcons name="flight-land" size={iconSize} color={color} />;
          }
          if (route.name === 'SavedFlightsScreen') {
            return <MaterialIcons name="bookmark" size={iconSize} color={color} />;
          }
          if (route.name === 'UserDetailsScreen') {
            return <Ionicons name="person-circle" size={iconSize} color={color} />;
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
};

// App Stack Navigator
const AppNavigator = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="MainTabs" component={AppTabNavigator} />
    <AppStack.Screen name="SelectAirportScreen" component={SelectAirportScreen} />
    <AppStack.Screen name="TransatlanticFlightListScreen" component={TransatlanticFlightListScreen} />
    <AppStack.Screen name="FlightNumberSearchScreen" component={FlightNumberSearchScreen} />
    <AppStack.Screen name="FlightListScreen" component={FlightListScreen} />
    <AppStack.Screen name="FlightDetailsScreen" component={FlightDetailsScreen} />
    <AppStack.Screen name="LoginScreen" component={LoginScreen} />
    <AppStack.Screen name="RegisterScreen" component={RegisterScreen} />
    <AppStack.Screen name="AboutScreen" component={AboutScreen} />
    <AppStack.Screen name="ChooseScreen" component={ChooseScreen} />
    <AppStack.Screen name="CustomFlightScreen" component={CustomFlightScreen} />
    <AppStack.Screen name="FlightDetailsScreenCustom" component={FlightDetailsScreenCustom} />
  </AppStack.Navigator>
);

// Main Navigator
const MainNavigator = () => {
  const { authState, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        </RootStack.Navigator>
      </NavigationContainer>
    );
  }

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