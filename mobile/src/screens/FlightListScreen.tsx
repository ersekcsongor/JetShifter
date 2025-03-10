import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { useRoute } from "@react-navigation/native";

const FlightListScreen = () => {
  const route = useRoute();
  const { departure, arrival, startDate } = route.params as { departure: string; arrival: string; startDate: string };

  const [flightDates, setFlightDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        // Parse the startDate into a Date object
        const startDateObj = new Date(startDate);
    
        // Add one day to the startDate
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + 1);
    
        // Format the endDate back to a string (YYYY-MM-DD)
        const endDate = endDateObj.toISOString().split('T')[0];
    
        // Construct the API URL with the updated endDate
        const apiUrl = `https://be.wizzair.com/27.1.0/Api/search/flightDates?departureStation=${departure}&arrivalStation=${arrival}&from=${startDate}&to=${endDate}`;
        
        // Log the API link
        console.log("API Link:", apiUrl);
    
        const response = await fetch(apiUrl, {
          headers: {
            "Origin": "https://www.wizzair.com",
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        });
    
        const data = await response.json();
        setFlightDates(data.flightDates || []);
      } catch (error) {
        console.error("Error fetching flights:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchFlights();
  }, [departure, arrival, startDate]);
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Flights from {departure} to {arrival} (from {startDate}):
      </Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : flightDates.length > 0 ? (
        <FlatList
          data={flightDates}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1 }}>
              <Text>Date : {item.split("T")[0]} | Time : {item.split("T")[1].substring(0, 5)}</Text>
            </View>
          )}
        />
      ) : (
        <Text>No flights available.</Text>
      )}
    </View>
  );
};

export default FlightListScreen;
