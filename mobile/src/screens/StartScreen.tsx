import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { AppStackParamList, RootStackParamList } from "~/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { useTheme } from "~/contexts/ThemeContext";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenBackground from "~/components/ScreenBackground";
import { createThemedStyles } from "~/styles/StartScreen.styles";

type StartScreenNavigationProp = StackNavigationProp<AppStackParamList, 'StartScreen'>;
type RootNavigationProp = StackNavigationProp<RootStackParamList>;

const StartScreen = () => {
  const navigation = useNavigation<StartScreenNavigationProp>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const { colors, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createThemedStyles(colors, isDarkMode);

  const iconColor = isDarkMode ? '#ffffff' : '#1a1a1a';

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="airplane-takeoff" size={48} color={iconColor} />
        </View>
        <Text style={styles.heroTitle}>JetShifter</Text>
        <Text style={styles.heroSubtitle}>Beat jet lag with science-backed light exposure schedules</Text>
      </View>

      {/* Main Action Cards */}
      <View style={styles.cardsContainer}>
        {/* Plan Trip Card */}
        <TouchableOpacity
          style={styles.primaryCard}
          onPress={() => navigation.navigate("ChooseScreen")}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconWrapper}>
            <MaterialIcons name="flight-land" size={32} color={iconColor} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Plan Your Trip</Text>
            <Text style={styles.cardDescription}>
              Get personalized light exposure schedule for your flight
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={iconColor} />
        </TouchableOpacity>

        {/* Learn About Jetlag Card */}
        <TouchableOpacity
          style={styles.secondaryCard}
          onPress={() => navigation.navigate("AboutScreen")}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconWrapper}>
            <MaterialIcons name="info" size={32} color={iconColor} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Learn About Jet Lag</Text>
            <Text style={styles.cardDescription}>
              Ask questions and understand how it works
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="clock-fast" size={24} color={iconColor} />
          <Text style={styles.featureText}>Optimize recovery time</Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="lightbulb-on" size={24} color={iconColor} />
          <Text style={styles.featureText}>Science-based approach</Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="calendar-check" size={24} color={iconColor} />
          <Text style={styles.featureText}>Easy to follow schedule</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default StartScreen;