import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ScreenBackground from "~/components/ScreenBackground";
import styles from "~/styles/AboutScreen.styles";

const AboutScreen = ({ navigation }: { navigation: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [airports, setAirports] = useState<any[]>([]);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Title */}
          <View style={styles.headerRow}>
            <MaterialIcons name="info" size={32} color="#6B5B00" />
            <Text style={styles.title}>About Jet Lag</Text>
          </View>

          {/* Loading/Error States */}
          {isLoading && <ActivityIndicator size="large" />}
          {error && <Text style={{ color: "red" }}>{error}</Text>}
          {airports.length > 0 && (
            <Text>Airports loaded: {airports.length}</Text>
          )}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>✈️ What is Jet Lag?</Text>
            <Text style={styles.infoText}>
              Jet lag is a temporary sleep disorder that happens when your body’s internal clock is out of sync with a new time zone after long-distance travel.
            </Text>
          </View>

          {/* Tips Card */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>🌟 How to Reduce Jet Lag</Text>
            <Text style={styles.tip}>• Adjust your schedule before travel: Gradually shift your sleep and meal times closer to your destination’s time zone a few days before you leave.</Text>
            <Text style={styles.tip}>• Stay hydrated: Drink plenty of water before, during, and after your flight.</Text>
            <Text style={styles.tip}>• Get sunlight: Spend time outside during the day at your destination to help reset your body clock.</Text>
            <Text style={styles.tip}>• Avoid caffeine and alcohol: These can disrupt your sleep and dehydrate you.</Text>
            <Text style={styles.tip}>• Take short naps: If you’re very tired, limit naps to 20–30 minutes.</Text>
            <Text style={styles.tip}>• Move around: Stretch and walk during your flight to improve circulation.</Text>
            <Text style={styles.tip}>• Consider melatonin: Consult your doctor about using melatonin supplements to help adjust your sleep cycle.</Text>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

export default AboutScreen;