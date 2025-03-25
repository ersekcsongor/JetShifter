import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import axios, { AxiosError } from "axios";

// Configure API client with better defaults
const apiClient = axios.create({
  baseURL: "http://172.20.10.2:3000",
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Type definitions for our flight data
type Flight = {
  flightNumber: string;
  origin: string;
  destination: string;
  time: [string, string];
  duration: string;
};

type FlightResponse = {
  flights: Flight[];
}[];

const FlightListScreen = () => {
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
  

  const fetchFlights = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setRefreshing(isRefreshing);
      setError(null);

      const response = await apiClient.get<FlightResponse>(`/flights/search?departure=${departure}&arrival=${arrival}&date=${startDate}`);
      
      console.log("API Response:", response.data);

      // Handle empty or invalid responses
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
      <View style={styles.flightItem}>
        <View style={styles.flightHeader}>
          <Text style={styles.flightNumber}>{item.flightNumber}</Text>
        </View>
        
        <View style={styles.timeContainer}>
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>Departure</Text>
            <Text style={styles.time}>{departureTime.time}</Text>
            <Text style={styles.date}>{departureTime.date}</Text>
            <Text style={styles.airport}>{item.origin}</Text>
          </View>
          
          <View style={styles.durationContainer}>
            <View style={styles.durationLine} />
            <Text style={styles.duration}>{item.duration}</Text>
            <View style={styles.durationLine} />
          </View>
          
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>Arrival</Text>
            <Text style={styles.time}>{arrivalTime.time}</Text>
            <Text style={styles.date}>{arrivalTime.date}</Text>
            <Text style={styles.airport}>{item.destination}</Text>
          </View>
        </View>
      </View>
    );
  };

  const handleRefresh = () => {
    fetchFlights(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Flights from {departure} to {arrival}
      </Text>
      <Text style={styles.subtitle}>
        {new Date(startDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Searching for flights...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText} onPress={() => fetchFlights()}>
            Tap to retry
          </Text>
        </View>
      ) : flights.length > 0 ? (
        <FlatList
          data={flights}
          renderItem={renderFlightItem}
          keyExtractor={(item) => `${item.flightNumber}-${item.time[0]}`}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={<View style={styles.listFooter} />}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.noFlightsText}>No flights available</Text>
          <Text style={styles.noFlightsSubtext}>
            Try adjusting your search criteria
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  listFooter: {
    height: 20,
  },
  flightItem: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
    paddingBottom: 8,
  },
  flightNumber: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2c3e50",
  },
  price: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#27ae60",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeBox: {
    flex: 1,
    alignItems: "center",
  },
  durationContainer: {
    alignItems: "center",
    minWidth: 80,
  },
  durationLine: {
    height: 1,
    width: "100%",
    backgroundColor: "#bdc3c7",
    marginVertical: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  time: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 6,
  },
  airport: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3498db",
  },
  duration: {
    fontSize: 12,
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  loadingText: {
    marginTop: 12,
    color: "#7f8c8d",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  retryText: {
    color: "#3498db",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  noFlightsText: {
    fontSize: 18,
    color: "#2c3e50",
    marginBottom: 8,
    fontWeight: "500",
  },
  noFlightsSubtext: {
    fontSize: 14,
    color: "#7f8c8d",
  },
});

export default FlightListScreen;