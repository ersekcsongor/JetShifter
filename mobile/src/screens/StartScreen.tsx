import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import styles from "~/styles/StartScreen.styles";
const StartScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      {/* Tagline */}
      <Text style={styles.tagline}>Conquer Jet Lag with Ease</Text>

      {/* Buttons */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate("CalculationScreen")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]} 
        onPress={() => navigation.navigate("AboutScreen")}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Learn More</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StartScreen;
