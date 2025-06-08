import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Modal, FlatList, Button, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "~/navigation";
import axios from "axios";
import ENV from "~/utils/constants";
import styles from '~/styles/SelectAirportScreen.styles';

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

  // Modal state
  const [showDepartureModal, setShowDepartureModal] = useState(false);
  const [showArrivalModal, setShowArrivalModal] = useState(false);

  useEffect(() => {
    const fetchAirportData = async () => {
      try {
        const response = await axios.get(`${ENV.API_BASE_URL}/airports/getAll`);
        const data = response.data;
        setAirports(data);
        if (data.length > 0) {
          setDeparture(data[0].iataCode);
        }
      } catch (error) {
        setAirports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAirportData();
  }, []);

  // Update arrival airports when departure or airports change
  useEffect(() => {
    if (!departure || airports.length === 0) return;
    const selectedAirport = airports.find((airport) => airport.iataCode === departure);
    if (selectedAirport && selectedAirport.routes) {
      const airportRoutes = selectedAirport.routes
        .filter((route) => route.startsWith("airport:"))
        .map((route) => route.replace("airport:", ""));
      const arrivalAirports = airports.filter((airport) =>
        airportRoutes.includes(airport.iataCode)
      );
      setFilteredArrivalAirports(arrivalAirports);
      if (arrivalAirports.length > 0) {
        setArrival(arrivalAirports[0].iataCode);
      } else {
        setArrival("");
      }
    }
  }, [departure, airports]);

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD600" />
        <Text style={styles.loadingText}>Loading airport data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Your Route</Text>

      {/* Departure Selector */}
      <Text style={styles.label}>Departure Airport</Text>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setShowDepartureModal(true)}
      >
        <Text style={styles.selectorButtonText}>
          {departure
            ? `${airports.find(a => a.iataCode === departure)?.name} (${departure})`
            : "Select departure..."}
        </Text>
      </TouchableOpacity>
      <Modal visible={showDepartureModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Departure Airport</Text>
            <FlatList
              data={airports}
              keyExtractor={(item, index) => `${item._id || item.iataCode}_${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setDeparture(item.iataCode);
                    setShowDepartureModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name} ({item.iataCode})</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="Cancel" onPress={() => setShowDepartureModal(false)} color="#FFD600" />
          </View>
        </View>
      </Modal>

      {/* Arrival Selector */}
      <Text style={styles.label}>Arrival Airport</Text>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setShowArrivalModal(true)}
        disabled={filteredArrivalAirports.length === 0}
      >
        <Text style={styles.selectorButtonText}>
          {arrival
            ? `${filteredArrivalAirports.find(a => a.iataCode === arrival)?.name} (${arrival})`
            : "Select arrival..."}
        </Text>
      </TouchableOpacity>
      <Modal visible={showArrivalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Arrival Airport</Text>
            <FlatList
              data={filteredArrivalAirports}
              keyExtractor={(item, index) => `${item._id || item.iataCode}_${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setArrival(item.iataCode);
                    setShowArrivalModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name} ({item.iataCode})</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="Cancel" onPress={() => setShowArrivalModal(false)} color="#FFD600" />
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      <Text style={styles.label}>Start Date</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (selectedDate) setDate(selectedDate);
            setShowDatePicker(false);
          }}
        />
      )}

      {/* Search Button */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Find Flights</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SelectAirportScreen;