import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";
import axios, { AxiosError } from "axios";
import { useNavigation } from "@react-navigation/native";
import Flight from "~/types/Flight";
import { AppStackParamList } from "~/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import ENV from "~/utils/constants";
import { createThemedStyles } from "~/styles/FlightListScreen.styles";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '~/contexts/ThemeContext';

// Configure API client with better defaults
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});



type FlightResponse = {
  flights: Flight[];
}[];

const FlightListScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const route = useRoute();
  const { departure, arrival, startDate } = route.params as {
    departure: string;
    arrival: string;
    startDate: string;
  };

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { colors, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createThemedStyles(colors, isDarkMode);
  const iconColor = isDarkMode ? '#ffffff' : '#1a1a1a';
  

  const fetchFlights = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setRefreshing(isRefreshing);
      setError(null);

      const response = await apiClient.get<FlightResponse>(`/flights/search?departure=${departure}&arrival=${arrival}&date=${startDate}`);
      
      console.log("API Response:", response.data);

      if (!response.data || response.data.length === 0 || !response.data[0].flights) {
        setFlights([]);
        return;
      }

      setFlights(response.data[0].flights);
    } catch (err) {
      handleApiError(err as AxiosError | Error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApiError = (err: AxiosError | Error) => {
    if (axios.isAxiosError(err)) {
      if (err.code === "ECONNABORTED") {
        setError("Request timed out. Please check your network connection.");
      } else if (err.response) {
        // Server responded with error status
        setError(`Server error: ${err.response.status}`);
      } else if (err.request) {
        // No response received
        setError("Network error. Please check your connection.");
      } else {
        setError(`Request failed: ${err.message}`);
      }
    } else {
      setError("An unexpected error occurred.");
    }
    console.error("API Error:", err);
  };

  useEffect(() => {
    fetchFlights();
  }, [departure, arrival, startDate]);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const renderFlightItem = ({ item }: { item: Flight }) => {
    const departureTime = formatDateTime(item.time[0]);
    const arrivalTime = formatDateTime(item.time[1]);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('FlightDetailsScreen', { flight: item })}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="airplane" size={28} color={iconColor} />
          </View>
          <View style={styles.flightInfo}>
            <Text style={styles.route}>
              {item.origin} → {item.destination}
            </Text>
            <Text style={styles.label}>
              Flight: <Text style={styles.flightNumber}>{item.flightNumber}</Text>
            </Text>
            <Text style={styles.duration}>Duration: {item.duration}</Text>

            <View style={styles.timeRow}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>Departure</Text>
                <Text style={styles.time}>{departureTime.time}</Text>
                <Text style={styles.date}>{departureTime.date}</Text>
              </View>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>Arrival</Text>
                <Text style={styles.time}>{arrivalTime.time}</Text>
                <Text style={styles.date}>{arrivalTime.date}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleRefresh = () => {
    fetchFlights(true);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.scrollView}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={iconColor} />
          <Text style={styles.loadingText}>Searching for flights...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.scrollView}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchFlights()}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.scrollView}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>
            {departure} → {arrival}
          </Text>
          <Text style={styles.subtitle}>
            {new Date(startDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {flights.length > 0 ? (
          <FlatList
            data={flights}
            renderItem={renderFlightItem}
            keyExtractor={(item) => `${item.flightNumber}-${item.time[0]}`}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListFooterComponent={<View style={styles.listFooter} />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="airplane-off" size={64} color={isDarkMode ? '#666666' : '#999999'} />
            <Text style={styles.noFlightsText}>No flights available</Text>
            <Text style={styles.noFlightsSubtext}>
              Try adjusting your search criteria
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};



export default FlightListScreen;