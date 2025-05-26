import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AppStackParamList, RootStackParamList } from "~/navigation";
import styles from "~/styles/StartScreen.styles";
import { useAuth } from "~/contexts/AuthContext";
import { Ionicons } from '@expo/vector-icons'; // Install if needed

type StartScreenNavigationProp = StackNavigationProp<AppStackParamList, 'StartScreen'>;
type RootNavigationProp = StackNavigationProp<RootStackParamList>;

const StartScreen = () => {
  const navigation = useNavigation<StartScreenNavigationProp>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
       <TouchableOpacity
        style={styles.accountButton}
        onPress={() => navigation.navigate('UserDetailsScreen')}
      >
        <Ionicons name="person-circle" size={32} color="#333" />
      </TouchableOpacity>
      {/* Tagline */}
      <Text style={styles.tagline}>Conquer Jet Lag with Ease</Text>

      {/* Buttons */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate("SelectAirportScreen")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]} 
        onPress={() => navigation.navigate("AboutScreen")}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Learn More</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StartScreen;