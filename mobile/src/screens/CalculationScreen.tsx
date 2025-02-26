import axios from "axios";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import styles from "~/styles/CalculationScreen.styles";

const AVIATIONSTACK_API_KEY = "5cec04c272d58e4aa4a08a1fbf3f1bff"; 
const AVIATIONSTACK_FLIGHTS_URL = "http://api.aviationstack.com/v1/flights";

const CalculationScreen = ({ navigation }: { navigation: any }) => {
  const [fromCity, setFromCity] = useState<string>("");
  const [toCity, setToCity] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const fetchFlightSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.get(AVIATIONSTACK_FLIGHTS_URL, {
        params: {
          access_key: AVIATIONSTACK_API_KEY,
          flight_status: "scheduled",
          limit: 5, // Fetch more data to filter
        },
      });
  
      if (response.data && response.data.data) {
        const flights = response.data.data.filter((flight: any) => {
          const departureAirport = flight.departure.airport?.toLowerCase();
          const arrivalAirport = flight.arrival.airport?.toLowerCase();
          const lowerQuery = query.toLowerCase();
  
          // Check if either the departure or arrival airport contains the search query
          return departureAirport?.includes(lowerQuery) || arrivalAirport?.includes(lowerQuery);
        });
  
        const formattedFlights = flights.map((flight: any) => ({
          flightDate: flight.flight_date,
          departureAirport: flight.departure.airport,
          arrivalAirport: flight.arrival.airport,
        }));
  
        setSuggestions(formattedFlights);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching flight data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jet Lag Adjustment Calculator</Text>

      {/* From City Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter departure flights airport name"
        value={fromCity}
        onChangeText={(query) => {
          setFromCity(query);
          fetchFlightSuggestions(query);
        }}
      />


   
      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="small" color="#007AFF" />}

      <FlatList
        data={suggestions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestion}
            onPress={() => {
              setFromCity(item.departureAirport);
              setToCity(item.arrivalAirport);
              setSuggestions([]);
            }}
          >
            <Text style={styles.suggestionText}>
              {item.flightDate} - {item.departureAirport} → {item.arrivalAirport}
            </Text>
    </TouchableOpacity>
  )}
/>



      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CalculationScreen;
