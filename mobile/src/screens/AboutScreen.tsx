import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import styles from "~/styles/AboutScreen.styles";

const AboutScreen = ({ navigation }: { navigation: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [airports, setAirports] = useState<any[]>([]);


  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>About Jet Lag</Text>

      {/* Loading/Error States */}
      {isLoading && <ActivityIndicator size="large" />}
      {error && <Text style={{ color: "red" }}>{error}</Text>}

      {/* Display fetched data (example) */}
      {airports.length > 0 && (
        <Text>Airports loaded: {airports.length}</Text>
      )}

      {/* Information */}
      <Text style={styles.info}>
        Jet lag is a temporary sleep disorder that occurs when your body's
        internal clock is out of sync with the time zone you're traveling to.
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