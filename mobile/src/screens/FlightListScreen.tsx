import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";

const FlightListScreen = () => {
  const route = useRoute();
  const { departure, arrival, startDate } = route.params as {
    departure: string;
    arrival: string;
    startDate: string;
  };

  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          ADT: 1,
          TEEN: 0,
          CHD: 0,
          INF: 0,
          Origin: departure, // Use the departure code from route params
          Destination: arrival, // Use the arrival code from route params
          promoCode: "",
          IncludeConnectingFlights: "false",
          DateOut: startDate, // Use the startDate from route params
          DateIn: "",
          FlexDaysBeforeOut: 2,
          FlexDaysOut: 2,
          FlexDaysBeforeIn: 2,
          FlexDaysIn: 2,
          RoundTrip: "false",
          IncludePrimeFares: "false",
          ToUs: "AGREED",
        };

        const url = "https://www.ryanair.com/api/booking/v4/en-gb/availability";

        console.log("Sending request to:", url);
        console.log("Request parameters:", JSON.stringify(params, null, 2));

        const response = await axios.get(url, { params });

        console.log("Response received:");
        console.log("Status:", response.status);
        console.log("Headers:", response.headers);
        console.log("Response data:", JSON.stringify(response.data, null, 2));

        // Extract relevant flight data for the given date
        const trips = response.data.trips;
        if (trips && trips.length > 0) {
          const dates = trips[0].dates;
          const matchingDate = dates.find(
            (date: any) => date.dateOut.startsWith(startDate)
          );
          const flightsData = matchingDate ? matchingDate.flights : [];
          setFlights(flightsData);
        } else {
          setFlights([]);
        }
        setLoading(false);
      } catch (err) {
        // TypeScript-safe error handling
        if (axios.isAxiosError(err)) {
          // Axios-specific error
          console.error("Axios error:", {
            message: err.message,
            code: err.code,
            response: err.response?.data,
            status: err.response?.status,
          });
          setError(`Axios error: ${err.message}`);
        } else if (err instanceof Error) {
          
          console.error("Generic error:", err.message);
          setError(`Error: ${err.message}`);
        } else {

          console.error("Unknown error:", err);
          setError("An unknown error occurred");
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [departure, arrival, startDate]);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Flights from {departure} to {arrival} (on {startDate}):
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : error ? (
        <Text style={{ color: "red" }}>{error}</Text>
      ) : flights.length > 0 ? (
        <FlatList
          data={flights}
          keyExtractor={(item) => item.flightNumber}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1 }}>
              <Text>Flight Number: {item.flightNumber}</Text>
              <Text>Departure: {item.time[0]}</Text>
              <Text>Arrival: {item.time[1]}</Text>
              <Text>Duration: {item.duration}</Text>
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