import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, FlatList, Button, TextInput } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "~/navigation";
import axios from "axios";
import ENV from "~/utils/constants";
import styles from "~/styles/SelectAirportScreen.styles";
import ScreenBackground from "~/components/ScreenBackground";
import Flight from "~/types/Flight";
import { ScrollView } from "react-native-gesture-handler";
import moment from "moment-timezone";

interface Airport {
  _id: string;
  iataCode: string;
  name: string;
  countryCode: string;
  cityCode: string;
  timeZone: string;
  countryName: string;
  __v: number;
}

type CustomFlightScreenNavigationProp = StackNavigationProp<AppStackParamList, 'ChooseScreen'>;

const CustomFlightScreen = () => {
  const navigation = useNavigation<CustomFlightScreenNavigationProp>();
  const [departure, setDeparture] = useState<string>("");
  const [arrival, setArrival] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [filteredArrivalAirports, setFilteredArrivalAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [arrivalSearch, setArrivalSearch] = useState(""); // Add this state
  const [departureSearch, setDepartureSearch] = useState(""); // Add this state
  const [departureTime, setDepartureTime] = useState(new Date());
  const [showDepartureTimePicker, setShowDepartureTimePicker] = useState(false);
  const [arrivalTime, setArrivalTime] = useState(new Date());
  const [showArrivalTimePicker, setShowArrivalTimePicker] = useState(false);
  const [departureDate, setDepartureDate] = useState(new Date());
  const [showDepartureDatePicker, setShowDepartureDatePicker] = useState(false);
  const [arrivalDate, setArrivalDate] = useState(new Date());
  const [showArrivalDatePicker, setShowArrivalDatePicker] = useState(false);

  // Modal state
  const [showDepartureModal, setShowDepartureModal] = useState(false);
  const [showArrivalModal, setShowArrivalModal] = useState(false);

  useEffect(() => {
    const fetchAirportData = async () => {
      try {
        const response = await axios.get(`${ENV.API_BASE_URL}/global-airports/getAll`);
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

  useEffect(() => {
    if (!departure || airports.length === 0) return;
    const selectedAirport = airports.find((airport) => airport.iataCode === departure);
    if (selectedAirport) {
      // Filter airports with a different countryCode than the departure airport
      const arrivalAirports = airports.filter(
        (airport) => airport.countryCode !== selectedAirport.countryCode
      );
      setFilteredArrivalAirports(arrivalAirports);
      if (arrivalAirports.length > 0) {
        setArrival(arrivalAirports[0].iataCode);
      } else {
        setArrival("");
      }
    }
  }, [departure, airports]);

  const getDurationString = (start: Date, end: Date) => {
    let diff = (end.getTime() - start.getTime()) / 1000; // seconds
    if (diff < 0) diff += 24 * 3600; // handle overnight flights
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // NEW: Get airport timezone by IATA code
  const getAirportTimezone = (iata: string) => {
    const airport = airports.find(a => a.iataCode === iata);
    return airport?.timeZone || "UTC";
  };

  const handleSearch = () => {
    // Format: YYYY-MM-DDTHH:mm
    const depLocalString = `${departureDate.getFullYear()}-${String(departureDate.getMonth() + 1).padStart(2, '0')}-${String(departureDate.getDate()).padStart(2, '0')}T${String(departureTime.getHours()).padStart(2, '0')}:${String(departureTime.getMinutes()).padStart(2, '0')}`;
    const arrLocalString = `${arrivalDate.getFullYear()}-${String(arrivalDate.getMonth() + 1).padStart(2, '0')}-${String(arrivalDate.getDate()).padStart(2, '0')}T${String(arrivalTime.getHours()).padStart(2, '0')}:${String(arrivalTime.getMinutes()).padStart(2, '0')}`;

    // Get timezones
    const depTz = getAirportTimezone(departure);
    const arrTz = getAirportTimezone(arrival);

    // Parse as local time in the correct timezone
    const depMoment = moment.tz(depLocalString, "YYYY-MM-DDTHH:mm", depTz);
    const arrMoment = moment.tz(arrLocalString, "YYYY-MM-DDTHH:mm", arrTz);

    // Calculate duration in minutes
    let diffMinutes = arrMoment.diff(depMoment, "minutes");
    if (diffMinutes < 0) diffMinutes += 24 * 60; // handle overnight

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    const durationString = `${hours}h ${minutes}m`;

    if (departure && arrival) {
      const flight: Flight = {
        flightNumber: getRandomFlightNumber(),
        origin: departure,
        destination: arrival,
        // Pass ISO strings in UTC
        time: [depMoment.toISOString(), arrMoment.toISOString()],
        duration: durationString,
      };
      navigation.navigate('FlightDetailsScreenCustom', { flight });
    } else {
      alert("Invalid selection");
    }
  };

  // Generate a random flight number (e.g., "JS1234")
  const getRandomFlightNumber = () => {
    const airlineCode = "JS";
    const number = Math.floor(1000 + Math.random() * 9000);
    return `${airlineCode}${number}`;
  };

  // Filtered list for departure search
  const searchedDepartureAirports = departureSearch
    ? airports.filter(
        (airport) =>
          airport.name.toLowerCase().includes(departureSearch.toLowerCase()) ||
          airport.countryName.toLowerCase().includes(departureSearch.toLowerCase())
      )
    : airports;

  const searchedArrivalAirports = arrivalSearch
    ? filteredArrivalAirports.filter(
        (airport) =>
          airport.name.toLowerCase().includes(arrivalSearch.toLowerCase()) ||
          airport.countryName.toLowerCase().includes(arrivalSearch.toLowerCase())
      )
    : filteredArrivalAirports;

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD600" />
          <Text style={styles.loadingText}>Loading airport data...</Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
    <ScrollView>
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
              ? `${airports.find(a => a.iataCode === departure)?.name} (${departure}) - ${airports.find(a => a.iataCode === departure)?.countryName}`
              : "Select departure..."}
          </Text>
        </TouchableOpacity>
        <Modal visible={showDepartureModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose Departure Airport</Text>
              {/* Search Input */}
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  padding: 8,
                  marginBottom: 12,
                  backgroundColor: "#fff",
                }}
                placeholder="Search airport name or code..."
                value={departureSearch}
                onChangeText={setDepartureSearch}
              />
              <FlatList
                data={searchedDepartureAirports}
                keyExtractor={(item, index) => `${item._id || item.iataCode}_${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setDeparture(item.iataCode);
                      setShowDepartureModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>
                      {item.name} ({item.iataCode}) - {item.countryName}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
                    No airports found.
                  </Text>
                }
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
              ? `${filteredArrivalAirports.find(a => a.iataCode === arrival)?.name} (${arrival}) - ${filteredArrivalAirports.find(a => a.iataCode === arrival)?.countryName}`
              : "Select arrival..."}
          </Text>
        </TouchableOpacity>
        <Modal visible={showArrivalModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose Arrival Airport</Text>
              {/* Search Input */}
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  padding: 8,
                  marginBottom: 12,
                  backgroundColor: "#fff",
                }}
                placeholder="Search airport name or code..."
                value={arrivalSearch}
                onChangeText={setArrivalSearch}
              />
              <FlatList
                data={searchedArrivalAirports}
                keyExtractor={(item, index) => `${item._id || item.iataCode}_${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setArrival(item.iataCode);
                      setShowArrivalModal(false);
                      setArrivalSearch(""); // Clear search on select
                    }}
                  >
                    <Text style={styles.modalItemText}>
                      {item.name} ({item.iataCode}) - {item.countryName}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
                    No airports found.
                  </Text>
                }
              />
              <Button title="Cancel" onPress={() => { setShowArrivalModal(false); setArrivalSearch(""); }} color="#FFD600" />
            </View>
          </View>
        </Modal>

       
        {/* Departure Date Picker */}
        <Text style={styles.label}>Departure Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDepartureDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{departureDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDepartureDatePicker && (
          <DateTimePicker
            value={departureDate}
            mode="date"
            display="spinner"
            onChange={(event, selectedDate) => {
              if (selectedDate) setDepartureDate(selectedDate);
              setShowDepartureDatePicker(false);
            }}
          />
        )}

        {/* Arrival Date Picker */}
        <Text style={styles.label}>Arrival Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowArrivalDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{arrivalDate.toDateString()}</Text>
        </TouchableOpacity>
        {showArrivalDatePicker && (
          <DateTimePicker
            value={arrivalDate}
            mode="date"
            display="spinner"
            onChange={(event, selectedDate) => {
              if (selectedDate) setArrivalDate(selectedDate);
              setShowArrivalDatePicker(false);
            }}
          />
        )}

        {/* Departure Time Picker */}
        <Text style={styles.label}>Departure Time</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDepartureTimePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        {showDepartureTimePicker && (
          <DateTimePicker
            value={departureTime}
            mode="time"
            display="spinner"
            onChange={(event, selectedTime) => {
              if (selectedTime) setDepartureTime(selectedTime);
              setShowDepartureTimePicker(false);
            }}
          />
        )}

        {/* Arrival Time Picker */}
        <Text style={styles.label}>Arrival Time</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowArrivalTimePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        {showArrivalTimePicker && (
          <DateTimePicker
            value={arrivalTime}
            mode="time"
            display="spinner"
            onChange={(event, selectedTime) => {
              if (selectedTime) setArrivalTime(selectedTime);
              setShowArrivalTimePicker(false);
            }}
          />
        )}

        {/* Search Button */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Find Flights</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </ScreenBackground>
  );
};

export default CustomFlightScreen;