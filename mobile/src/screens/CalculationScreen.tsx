import axios from "axios";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import styles from "~/styles/CalculationScreen.styles";


const AVIATIONSTACK_API_KEY = "220126b4f004b2c683896245c2982880"; // Replace with your API Key
const AVIATIONSTACK_AIRPORTS_URL = "http://api.aviationstack.com/v1/airports";


const CalculationScreen = ({ navigation }: { navigation: any }) => {
  const [fromCity, setFromCity] = useState<string>("");
  const [toCity, setToCity] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);

  const fetchAirportSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.get(AVIATIONSTACK_AIRPORTS_URL, {
        params: {
          access_key: AVIATIONSTACK_API_KEY, // ✅ Correct API Key Usage
          search: query, // ✅ Enables autocomplete search (only available on Basic Plan and higher)
          limit: 5, // ✅ Restricts the number of results
        },
      });
  
      console.log("API Response:", response.data); // ✅ Debugging API response
  
      if (response.data && response.data.data) {
        setSuggestions(response.data.data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching airport data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  
  

  

  const selectCity = (city: any, setCity: (value: string) => void) => {
    setCity(city.name);
    setSuggestions([]);
  };



  const calculateTimeZonesCrossed = () => {
    if (!fromCity || !toCity) {
      setResult("Please select both departure and destination airports.");
      return;
    }
  
    const fromAirport = suggestions.find((airport) => airport.airport_name === fromCity);
    const toAirport = suggestions.find((airport) => airport.airport_name === toCity);
  
    if (!fromAirport || !toAirport) {
      setResult("Error fetching airport data. Please try again.");
      return;
    }
  
    const fromTimezone = fromAirport.timezone;
    const toTimezone = toAirport.timezone;
  
    setResult(`Flying from ${fromAirport.airport_name} (${fromTimezone}) to ${toAirport.airport_name} (${toTimezone}).`);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jet Lag Adjustment Calculator</Text>

      {/* From City Input */}
      <Text style={styles.label}>From (City):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter airport name or code (e.g., JFK, LAX)"
        value={fromCity}
        onChangeText={(query) => {
        setFromCity(query);
        fetchAirportSuggestions(query);
     }}
      />
      {loading && <ActivityIndicator size="small" color="#007AFF" />}
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestion}
            onPress={() => selectCity(item, setFromCity)}
          >
            <Text style={styles.suggestionText}>
              {item.airport_name} ({item.iata_code}) - {item.timezone}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* To City Input */}
      <Text style={styles.label}>To (City):</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., San Francisco"
        value={toCity}
        onChangeText={(query) => {
        setToCity(query);
        fetchAirportSuggestions(query);
        }}
      />
      {loading && <ActivityIndicator size="small" color="#007AFF" />}
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestion}
            onPress={() => selectCity(item, setToCity)}
          >
            <Text style={styles.suggestionText}>
              {item.name} ({item.timezone})
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Calculate Button */}
      <TouchableOpacity style={styles.button} onPress={calculateTimeZonesCrossed}>
        <Text style={styles.buttonText}>Calculate</Text>
      </TouchableOpacity>

      {/* Result */}
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.result}>{result}</Text>
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CalculationScreen;
