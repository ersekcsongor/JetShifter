import React, { useState, useEffect } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "~/navigation";
import axios from "axios";

const SelectAirportScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [airportData, setAirportData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  // Fetch airport data from the API
  useEffect(() => {
    const fetchAirportData = async () => {
      try {
        const response = await axios.get("http://172.20.10.11:3000/countries/getAll");
        const data = response.data;

        // Transform the API response into the required format
        const airportMapping: { [key: string]: string } = {};
        data.forEach((country: { id: string; name: string; iataCode: string }) => {
          airportMapping[`${country.name} (${country.iataCode})`] = country.iataCode;
        });

        setAirportData(airportMapping);

        // Set default values for departure and arrival
        const airportKeys = Object.keys(airportMapping);
        if (airportKeys.length > 0) {
          setDeparture(airportKeys[0]);
          setArrival(airportKeys[1] || airportKeys[0]);
        }
      } catch (error) {
        console.error("Error fetching airport data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAirportData();
  }, []);

  const handleSearch = () => {
    const departureCode = airportData[departure];
    const arrivalCode = airportData[arrival];
    const formattedDate = date.toISOString().split("T")[0];

    if (departureCode && arrivalCode) {
      navigation.navigate("FlightListScreen", {
        departure: departureCode,
        arrival: arrivalCode,
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
        Select Departure Country:
      </Text>
      <Picker selectedValue={departure} onValueChange={setDeparture}>
        {Object.keys(airportData).map((country) => (
          <Picker.Item key={country} label={country} value={country} />
        ))}
      </Picker>

      <Text style={{ marginTop: 10, fontWeight: "bold", fontSize: 20, textAlign: "center" }}>
        Select Arrival Country:
      </Text>
      <Picker selectedValue={arrival} onValueChange={setArrival}>
        {Object.keys(airportData).map((country) => (
          <Picker.Item key={country} label={country} value={country} />
        ))}
      </Picker>

      <Text style={{ marginTop: 10, marginBottom: 10, fontWeight: "bold", fontSize: 20, textAlign: "center" }}>
        Select Start Date:
      </Text>
      <Button title={date.toDateString()} onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
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
      )}

      <Button title="Find Flights" onPress={handleSearch} />
    </View>
  );
};

export default SelectAirportScreen;