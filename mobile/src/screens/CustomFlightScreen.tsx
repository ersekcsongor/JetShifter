import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, FlatList, TextInput, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "~/navigation";
import axios from "axios";
import ENV from "~/utils/constants";
import { createThemedStyles } from "~/styles/CustomFlightScreen.styles";
import Flight from "~/types/Flight";
import moment from "moment-timezone";
import { useTheme } from '~/contexts/ThemeContext';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

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
  const [arrivalSearch, setArrivalSearch] = useState("");
  const [departureSearch, setDepartureSearch] = useState("");
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

  const { colors, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createThemedStyles(colors, isDarkMode);
  const iconColor = isDarkMode ? '#ffffff' : '#1a1a1a';

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={iconColor} />
        <Text style={styles.loadingText}>Loading airport data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.header}>Custom Flight Details</Text>
        <Text style={styles.subtitle}>Enter your flight information manually</Text>
      </View>

      {/* Departure Selector Card */}
      <View style={styles.selectionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="airplane-takeoff" size={24} color={iconColor} />
          </View>
          <Text style={styles.label}>Departure</Text>
        </View>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setShowDepartureModal(true)}
        >
          <Text style={departure ? styles.selectorButtonText : styles.placeholderText}>
            {departure
              ? `${airports.find(a => a.iataCode === departure)?.name} (${departure})`
              : "Select departure airport..."}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={iconColor} />
        </TouchableOpacity>
      </View>
      <Modal visible={showDepartureModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Departure Airport</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => { setShowDepartureModal(false); setDepartureSearch(''); }}
              >
                <Ionicons name="close" size={20} color={iconColor} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or country..."
              placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
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
                    setDepartureSearch('');
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  <Text style={styles.modalItemSubtext}>{item.iataCode} - {item.countryName}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No airports found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

        {/* Arrival Selector Card */}
      <View style={styles.selectionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="airplane-landing" size={24} color={iconColor} />
          </View>
          <Text style={styles.label}>Arrival</Text>
        </View>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setShowArrivalModal(true)}
          disabled={filteredArrivalAirports.length === 0}
        >
          <Text style={arrival ? styles.selectorButtonText : styles.placeholderText}>
            {arrival
              ? `${filteredArrivalAirports.find(a => a.iataCode === arrival)?.name} (${arrival})`
              : "Select arrival airport..."}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={iconColor} />
        </TouchableOpacity>
      </View>
      <Modal visible={showArrivalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Arrival Airport</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => { setShowArrivalModal(false); setArrivalSearch(''); }}
              >
                <Ionicons name="close" size={20} color={iconColor} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or country..."
              placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
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
                    setArrivalSearch('');
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  <Text style={styles.modalItemSubtext}>{item.iataCode} - {item.countryName}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No airports found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Departure Date & Time Card */}
      <View style={styles.selectionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="event" size={24} color={iconColor} />
          </View>
          <Text style={styles.label}>Departure</Text>
        </View>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDepartureDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{departureDate.toDateString()}</Text>
          <MaterialIcons name="calendar-today" size={20} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dateButton, { marginTop: 12 }]}
          onPress={() => setShowDepartureTimePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <MaterialIcons name="access-time" size={20} color={iconColor} />
        </TouchableOpacity>
      </View>
      {showDepartureDatePicker && (
        <DateTimePicker
          value={departureDate}
          mode="date"
          display="spinner"
          textColor={iconColor}
          onChange={(event, selectedDate) => {
            if (selectedDate) setDepartureDate(selectedDate);
            setShowDepartureDatePicker(false);
          }}
        />
      )}
      {showDepartureTimePicker && (
        <DateTimePicker
          value={departureTime}
          mode="time"
          display="spinner"
          textColor={iconColor}
          onChange={(event, selectedTime) => {
            if (selectedTime) setDepartureTime(selectedTime);
            setShowDepartureTimePicker(false);
          }}
        />
      )}

      {/* Arrival Date & Time Card */}
      <View style={styles.selectionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="event-available" size={24} color={iconColor} />
          </View>
          <Text style={styles.label}>Arrival</Text>
        </View>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowArrivalDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{arrivalDate.toDateString()}</Text>
          <MaterialIcons name="calendar-today" size={20} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dateButton, { marginTop: 12 }]}
          onPress={() => setShowArrivalTimePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <MaterialIcons name="access-time" size={20} color={iconColor} />
        </TouchableOpacity>
      </View>
      {showArrivalDatePicker && (
        <DateTimePicker
          value={arrivalDate}
          mode="date"
          display="spinner"
          textColor={iconColor}
          onChange={(event, selectedDate) => {
            if (selectedDate) setArrivalDate(selectedDate);
            setShowArrivalDatePicker(false);
          }}
        />
      )}
      {showArrivalTimePicker && (
        <DateTimePicker
          value={arrivalTime}
          mode="time"
          display="spinner"
          textColor={iconColor}
          onChange={(event, selectedTime) => {
            if (selectedTime) setArrivalTime(selectedTime);
            setShowArrivalTimePicker(false);
          }}
        />
      )}

      {/* Search Button */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <MaterialIcons name="flight-takeoff" size={24} color={iconColor} />
        <Text style={styles.searchButtonText}>Let's Fly</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CustomFlightScreen;