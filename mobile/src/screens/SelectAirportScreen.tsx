import React, { useState, useEffect } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList, RootStackParamList } from "~/navigation";
import axios from "axios";
import { AxiosError } from 'axios';

interface Airport {
  _id: string;
  iataCode: string;
  name: string;
  countryCode: string;
  cityCode: string;
  timeZone: string;
  latitude: number;
  longitude: number;
  routes: string[];
  __v: number;
}

const SelectAirportScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const [departure, setDeparture] = useState<string>("");
  const [arrival, setArrival] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [filteredArrivalAirports, setFilteredArrivalAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch airport data from the API
  useEffect(() => {
    const fetchAirportData = async () => {
      try {
        const response = await axios.get("http://172.20.10.2:3000/airports/getAll");
        
        // Check if response data exists
        if (!response.data) {
          throw new Error('No data received');
        }
  
        const data = response.data;
        setAirports(data);
  
        // Check if data has items before accessing
        if (data.length > 0) {
          setDeparture(data[0].iataCode);
          // Ensure routes exist before using them
          if (data[0].routes) {
            updateArrivalAirports(data[0].routes);
          }
        }
      }catch (error) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response) {
          // The request was made and server responded with status code
          console.error("Server error:", axiosError.response.status);
        } else if (axiosError.request) {
          // The request was made but no response received
          console.error("Network error:", axiosError.request);
        } else {
          // Something happened in setting up the request
          console.error("Request error:", axiosError.message);
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchAirportData();
  }, []);

  // Update the arrival airports based on the selected departure airport's routes
  const updateArrivalAirports = (routes: string[]) => {
    const airportRoutes = routes
      .filter((route) => route.startsWith("airport:"))
      .map((route) => route.replace("airport:", ""));

    const arrivalAirports = airports.filter((airport) =>
      airportRoutes.includes(airport.iataCode)
    );

    setFilteredArrivalAirports(arrivalAirports);

    // Set the default arrival airport
    if (arrivalAirports.length > 0) {
      setArrival(arrivalAirports[0].iataCode);
    }
  };

  const handleSearch = () => {
    const formattedDate = date.toISOString().split("T")[0];

    if (departure && arrival) {
      navigation.navigate("FlightListScreen", {
        departure,
        arrival,
        startDate: formattedDate,
      });
    } else {
      alert("Invalid selection");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading airport data...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginTop: 10, fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
        Select Departure Airport:
      </Text>
            {/* Departure Airport Picker */}
      <Picker
        selectedValue={departure}
        onValueChange={(value) => {
          setDeparture(value);
          const selectedAirport = airports.find((airport) => airport.iataCode === value);
          if (selectedAirport) {
            updateArrivalAirports(selectedAirport.routes);
          }
        }}
      >
        {airports.map((airport) => (
          <Picker.Item
            key={`departure-${airport._id}-${airport.iataCode}`}
            label={`${airport.name} (${airport.iataCode})`}
            value={airport.iataCode}
          />
        ))}
      </Picker>

      {/* Arrival Airport Picker */}
      <Picker selectedValue={arrival} onValueChange={setArrival}>
        {filteredArrivalAirports.map((airport) => (
          <Picker.Item
            key={`arrival-${airport._id}-${airport.iataCode}`}
            label={`${airport.name} (${airport.iataCode})`}
            value={airport.iataCode}
          />
        ))}
      </Picker>

      <Text style={{ marginTop: 10, marginBottom: 10, fontWeight: "bold", fontSize: 20, textAlign: "center" }}>
        Select Start Date:
      </Text>
      <Button title={date.toDateString()} onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setDate(selectedDate);
            }
            setShowDatePicker(false);
          }}
        />
        </View>
      )}

      <Button title="Find Flights" onPress={handleSearch} />
    </View>
  );
};

export default SelectAirportScreen;