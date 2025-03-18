import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import styles from "~/styles/AboutScreen.styles";
import axios from 'axios';

const fetchCountries = async () => {
  try {
    // Replace with your backend URL
    const response = await axios.get('http://192.168.56.1:3000/countries/getAll');
    
    // Log the response data to the console
    console.log('Countries:', response.data);
  } catch (error) {
    console.error('Error fetching countries:', error);
  }
};

const AboutScreen = ({ navigation }: { navigation: any }) => {
  useEffect(() => {
    fetchCountries();
  })
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>About Jet Lag</Text>

      {/* Information */}
      <Text style={styles.info}>
        Jet lag is a temporary sleep disorder that occurs when your body's internal clock is out of sync with the time zone you're traveling to. 
        It can cause fatigue, difficulty concentrating, and disrupted sleep patterns.
      </Text>

      <Text style={styles.info}>
        Symptoms of jet lag are more common when traveling across multiple time zones, especially when flying eastward. 
        Adjusting your sleep schedule and exposure to light can help reduce its effects.
      </Text>
                
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AboutScreen;

