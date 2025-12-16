import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "~/navigation";
import { createThemedStyles } from "~/styles/ChooseScreen.styles";
import { useTheme } from '~/contexts/ThemeContext';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

type ChooseScreenNavigationProp = StackNavigationProp<AppStackParamList, 'ChooseScreen'>;

const ChooseScreen = () => {
  const navigation = useNavigation<ChooseScreenNavigationProp>();
  const { colors, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createThemedStyles(colors, isDarkMode);

  const iconColor = isDarkMode ? '#ffffff' : '#1a1a1a';
  const infoIconColor = isDarkMode ? '#a0a0a0' : '#666666';

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.headerSection}>
        <MaterialCommunityIcons
          name="airplane-search"
          size={56}
          color={iconColor}
        />
        <Text style={styles.title}>Choose Flight Type</Text>
        <Text style={styles.subtitle}>
          Select how you want to search for your flight
        </Text>
      </View>

      {/* Options Cards */}
      <View style={styles.cardsContainer}>
        {/* RyanAir Flights Card */}
        <TouchableOpacity
          style={styles.primaryCard}
          onPress={() => navigation.navigate("SelectAirportScreen")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons
                name="airplane"
                size={32}
                color={iconColor}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>RyanAir Flights</Text>
              <Text style={styles.cardDescription}>
                Browse and select from RyanAir's flight schedule
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={iconColor}
            />
          </View>

          <View style={styles.cardFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={iconColor} />
              <Text style={styles.featureText}>Real flight schedules</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={iconColor} />
              <Text style={styles.featureText}>Easy airport selection</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={iconColor} />
              <Text style={styles.featureText}>Quick setup</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Transatlantic Flights Card */}
        <TouchableOpacity
          style={styles.transatlanticCard}
          onPress={() => navigation.navigate("TransatlanticFlightListScreen")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons
                name="earth"
                size={32}
                color={iconColor}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Transatlantic Flights</Text>
              <Text style={styles.cardDescription}>
                Long-haul flights between Europe and North America
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={iconColor}
            />
          </View>

          <View style={styles.cardFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={iconColor} />
              <Text style={styles.featureText}>30+ major routes</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={iconColor} />
              <Text style={styles.featureText}>Multiple airlines</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={iconColor} />
              <Text style={styles.featureText}>Real-time schedules</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Flight Number Search Card */}
        <TouchableOpacity
          style={styles.flightNumberCard}
          onPress={() => navigation.navigate("FlightNumberSearchScreen")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <MaterialIcons
                name="search"
                size={32}
                color={iconColor}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Flight Number Search</Text>
              <Text style={styles.cardDescription}>
                Find any flight by its flight number
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={iconColor}
            />
          </View>

          <View style={styles.cardFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={iconColor} />
              <Text style={styles.featureText}>All airlines supported</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={iconColor} />
              <Text style={styles.featureText}>Automatic flight details</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={iconColor} />
              <Text style={styles.featureText}>Quick and easy</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Custom Flight Card */}
        <TouchableOpacity
          style={styles.secondaryCard}
          onPress={() => navigation.navigate("CustomFlightScreen")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <MaterialIcons
                name="edit-calendar"
                size={32}
                color={iconColor}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Custom Flight</Text>
              <Text style={styles.cardDescription}>
                Enter your own flight details manually
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={iconColor}
            />
          </View>

          <View style={styles.cardFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={iconColor} />
              <Text style={styles.featureText}>Any airline supported</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={iconColor} />
              <Text style={styles.featureText}>Flexible dates & times</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={iconColor} />
              <Text style={styles.featureText}>Full customization</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <MaterialCommunityIcons
          name="information-outline"
          size={20}
          color={infoIconColor}
        />
        <Text style={styles.infoText}>
          Both options will generate a personalized light exposure schedule to help you beat jet lag
        </Text>
      </View>
    </ScrollView>
  );
};

export default ChooseScreen;