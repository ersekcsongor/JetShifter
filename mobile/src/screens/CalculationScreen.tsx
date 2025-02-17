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


const GEO_API_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo/places/%7BplaceId%7D/distance?toPlaceId=Q60";
const GEO_API_KEY = "f431a3f0e9msh39f4ca7fed3078dp1b787ajsnc01b89277179"; 
const GEO_SUGGESTIONS_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities";

const CalculationScreen = ({ navigation }: { navigation: any }) => {
  const [fromCity, setFromCity] = useState<string>("");
  const [toCity, setToCity] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);

  const fetchCitySuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.get(GEO_SUGGESTIONS_URL, {
        headers: {
          "X-RapidAPI-Key": GEO_API_KEY,
          "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
        },
        params: {
          namePrefix: query, // Input query
          limit: 10,         // Maximum suggestions
        },
      });
  
      setSuggestions(response.data.data);
    } catch (error) {
      console.error("Error fetching city suggestions:", error);
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
      setResult("Please enter both departure and destination cities.");
      return;
    }

    setResult(`Calculating time zones between ${fromCity} and ${toCity}.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jet Lag Adjustment Calculator</Text>

      {/* From City Input */}
      <Text style={styles.label}>From (City):</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Budapest"
        value={fromCity}
        onChangeText={(query) => {
          setFromCity(query);
          fetchCitySuggestions(query);
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
              {item.name} ({item.timezone})
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
          fetchCitySuggestions(query);
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
