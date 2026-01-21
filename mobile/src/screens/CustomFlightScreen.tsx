import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, FlatList, TextInput, ScrollView, Switch } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList, OfflineStackParamList } from "~/navigation";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ENV from "~/utils/constants";
import { createThemedStyles } from "~/styles/CustomFlightScreen.styles";
import Flight from "~/types/Flight";
import moment from "moment-timezone";
import { useTheme } from '~/contexts/ThemeContext';
import { useAuth } from '~/contexts/AuthContext';
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

// Fallback airports for offline mode
const OFFLINE_AIRPORTS: Airport[] = [
  { _id: '1', iataCode: 'JFK', name: 'John F. Kennedy International', countryCode: 'US', cityCode: 'NYC', timeZone: 'America/New_York', countryName: 'United States', __v: 0 },
  { _id: '2', iataCode: 'LAX', name: 'Los Angeles International', countryCode: 'US', cityCode: 'LAX', timeZone: 'America/Los_Angeles', countryName: 'United States', __v: 0 },
  { _id: '3', iataCode: 'LHR', name: 'London Heathrow', countryCode: 'GB', cityCode: 'LON', timeZone: 'Europe/London', countryName: 'United Kingdom', __v: 0 },
  { _id: '4', iataCode: 'CDG', name: 'Paris Charles de Gaulle', countryCode: 'FR', cityCode: 'PAR', timeZone: 'Europe/Paris', countryName: 'France', __v: 0 },
  { _id: '5', iataCode: 'FRA', name: 'Frankfurt Airport', countryCode: 'DE', cityCode: 'FRA', timeZone: 'Europe/Berlin', countryName: 'Germany', __v: 0 },
  { _id: '6', iataCode: 'AMS', name: 'Amsterdam Schiphol', countryCode: 'NL', cityCode: 'AMS', timeZone: 'Europe/Amsterdam', countryName: 'Netherlands', __v: 0 },
  { _id: '7', iataCode: 'DXB', name: 'Dubai International', countryCode: 'AE', cityCode: 'DXB', timeZone: 'Asia/Dubai', countryName: 'United Arab Emirates', __v: 0 },
  { _id: '8', iataCode: 'SIN', name: 'Singapore Changi', countryCode: 'SG', cityCode: 'SIN', timeZone: 'Asia/Singapore', countryName: 'Singapore', __v: 0 },
  { _id: '9', iataCode: 'HND', name: 'Tokyo Haneda', countryCode: 'JP', cityCode: 'TYO', timeZone: 'Asia/Tokyo', countryName: 'Japan', __v: 0 },
  { _id: '10', iataCode: 'NRT', name: 'Tokyo Narita', countryCode: 'JP', cityCode: 'TYO', timeZone: 'Asia/Tokyo', countryName: 'Japan', __v: 0 },
  { _id: '11', iataCode: 'SYD', name: 'Sydney Kingsford Smith', countryCode: 'AU', cityCode: 'SYD', timeZone: 'Australia/Sydney', countryName: 'Australia', __v: 0 },
  { _id: '12', iataCode: 'HKG', name: 'Hong Kong International', countryCode: 'HK', cityCode: 'HKG', timeZone: 'Asia/Hong_Kong', countryName: 'Hong Kong', __v: 0 },
  { _id: '13', iataCode: 'BKK', name: 'Bangkok Suvarnabhumi', countryCode: 'TH', cityCode: 'BKK', timeZone: 'Asia/Bangkok', countryName: 'Thailand', __v: 0 },
  { _id: '14', iataCode: 'ICN', name: 'Seoul Incheon', countryCode: 'KR', cityCode: 'SEL', timeZone: 'Asia/Seoul', countryName: 'South Korea', __v: 0 },
  { _id: '15', iataCode: 'BUD', name: 'Budapest Ferenc Liszt', countryCode: 'HU', cityCode: 'BUD', timeZone: 'Europe/Budapest', countryName: 'Hungary', __v: 0 },
  { _id: '16', iataCode: 'VIE', name: 'Vienna International', countryCode: 'AT', cityCode: 'VIE', timeZone: 'Europe/Vienna', countryName: 'Austria', __v: 0 },
  { _id: '17', iataCode: 'BCN', name: 'Barcelona El Prat', countryCode: 'ES', cityCode: 'BCN', timeZone: 'Europe/Madrid', countryName: 'Spain', __v: 0 },
  { _id: '18', iataCode: 'MAD', name: 'Madrid Barajas', countryCode: 'ES', cityCode: 'MAD', timeZone: 'Europe/Madrid', countryName: 'Spain', __v: 0 },
  { _id: '19', iataCode: 'FCO', name: 'Rome Fiumicino', countryCode: 'IT', cityCode: 'ROM', timeZone: 'Europe/Rome', countryName: 'Italy', __v: 0 },
  { _id: '20', iataCode: 'MXP', name: 'Milan Malpensa', countryCode: 'IT', cityCode: 'MIL', timeZone: 'Europe/Rome', countryName: 'Italy', __v: 0 },
  { _id: '21', iataCode: 'ORD', name: 'Chicago O\'Hare', countryCode: 'US', cityCode: 'CHI', timeZone: 'America/Chicago', countryName: 'United States', __v: 0 },
  { _id: '22', iataCode: 'MIA', name: 'Miami International', countryCode: 'US', cityCode: 'MIA', timeZone: 'America/New_York', countryName: 'United States', __v: 0 },
  { _id: '23', iataCode: 'SFO', name: 'San Francisco International', countryCode: 'US', cityCode: 'SFO', timeZone: 'America/Los_Angeles', countryName: 'United States', __v: 0 },
  { _id: '24', iataCode: 'YYZ', name: 'Toronto Pearson', countryCode: 'CA', cityCode: 'YTO', timeZone: 'America/Toronto', countryName: 'Canada', __v: 0 },
  { _id: '25', iataCode: 'PEK', name: 'Beijing Capital', countryCode: 'CN', cityCode: 'BJS', timeZone: 'Asia/Shanghai', countryName: 'China', __v: 0 },
  { _id: '26', iataCode: 'PVG', name: 'Shanghai Pudong', countryCode: 'CN', cityCode: 'SHA', timeZone: 'Asia/Shanghai', countryName: 'China', __v: 0 },
  { _id: '27', iataCode: 'DEL', name: 'Delhi Indira Gandhi', countryCode: 'IN', cityCode: 'DEL', timeZone: 'Asia/Kolkata', countryName: 'India', __v: 0 },
  { _id: '28', iataCode: 'BOM', name: 'Mumbai Chhatrapati Shivaji', countryCode: 'IN', cityCode: 'BOM', timeZone: 'Asia/Kolkata', countryName: 'India', __v: 0 },
  { _id: '29', iataCode: 'CLJ', name: 'Cluj-Napoca International', countryCode: 'RO', cityCode: 'CLJ', timeZone: 'Europe/Bucharest', countryName: 'Romania', __v: 0 },
  { _id: '30', iataCode: 'OTP', name: 'Bucharest Henri Coanda', countryCode: 'RO', cityCode: 'BUH', timeZone: 'Europe/Bucharest', countryName: 'Romania', __v: 0 },
];

type CustomFlightScreenNavigationProp = StackNavigationProp<AppStackParamList & OfflineStackParamList, 'CustomFlightScreen'>;

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

  // Offline settings state
  const [useMelatonin, setUseMelatonin] = useState(false);
  const [useCoffee, setUseCoffee] = useState(false);
  const [bedtime, setBedtime] = useState('22:00');
  const [wakeupTime, setWakeupTime] = useState('06:00');
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeupPicker, setShowWakeupPicker] = useState(false);

  const { colors, effectiveTheme, setTheme } = useTheme();
  const { authState, exitOfflineMode } = useAuth();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createThemedStyles(colors, isDarkMode);
  const iconColor = isDarkMode ? '#ffffff' : '#1a1a1a';
  const isOfflineMode = authState?.offlineMode;

  // Load offline settings from AsyncStorage
  useEffect(() => {
    const loadOfflineSettings = async () => {
      if (!isOfflineMode) return;
      try {
        const savedMelatonin = await AsyncStorage.getItem('userMelatonin');
        const savedCoffee = await AsyncStorage.getItem('userCoffee');
        const savedBedtime = await AsyncStorage.getItem('userBedTime');
        const savedWakeup = await AsyncStorage.getItem('userWakeTime');

        if (savedMelatonin !== null) setUseMelatonin(savedMelatonin === 'true');
        if (savedCoffee !== null) setUseCoffee(savedCoffee === 'true');
        if (savedBedtime) setBedtime(savedBedtime);
        if (savedWakeup) setWakeupTime(savedWakeup);
      } catch (e) {
        console.error('Error loading offline settings:', e);
      }
    };
    loadOfflineSettings();
  }, [isOfflineMode]);

  // Save offline settings to AsyncStorage
  const saveOfflineSetting = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('Error saving offline setting:', e);
    }
  };

  useEffect(() => {
    const fetchAirportData = async () => {
      // In offline mode, use the hardcoded airport list
      if (isOfflineMode) {
        setAirports(OFFLINE_AIRPORTS);
        if (OFFLINE_AIRPORTS.length > 0) {
          setDeparture(OFFLINE_AIRPORTS[0].iataCode);
        }
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${ENV.API_BASE_URL}/global-airports/getAll`);
        const data = response.data;
        setAirports(data);
        if (data.length > 0) {
          setDeparture(data[0].iataCode);
        }
      } catch (error) {
        // Fallback to offline airports if API fails
        console.log('API failed, using offline airports');
        setAirports(OFFLINE_AIRPORTS);
        if (OFFLINE_AIRPORTS.length > 0) {
          setDeparture(OFFLINE_AIRPORTS[0].iataCode);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAirportData();
  }, [isOfflineMode]);

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
      {/* Offline Mode Banner */}
      {isOfflineMode && (
        <View style={styles.offlineBanner}>
          <View style={styles.offlineBannerContent}>
            <Ionicons name="airplane-outline" size={20} color={iconColor} />
            <Text style={styles.offlineBannerText}>Offline Mode</Text>
          </View>
          <TouchableOpacity onPress={exitOfflineMode} style={styles.exitOfflineButton}>
            <Ionicons name="log-in-outline" size={18} color={iconColor} />
            <Text style={styles.exitOfflineButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      )}

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

      {/* Offline Settings Panel */}
      {isOfflineMode && (
        <View style={styles.selectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <Ionicons name="settings-outline" size={24} color={iconColor} />
            </View>
            <Text style={styles.label}>Settings</Text>
          </View>

          {/* Dark Mode Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={iconColor} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
              trackColor={{ false: '#767577', true: '#404040' }}
              thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {/* Melatonin Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <MaterialCommunityIcons name="pill" size={20} color={iconColor} />
              <Text style={styles.settingLabel}>Use Melatonin</Text>
            </View>
            <Switch
              value={useMelatonin}
              onValueChange={(value) => {
                setUseMelatonin(value);
                saveOfflineSetting('userMelatonin', String(value));
              }}
              trackColor={{ false: '#767577', true: '#404040' }}
              thumbColor={useMelatonin ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {/* Coffee Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <MaterialCommunityIcons name="coffee" size={20} color={iconColor} />
              <Text style={styles.settingLabel}>Use Coffee</Text>
            </View>
            <Switch
              value={useCoffee}
              onValueChange={(value) => {
                setUseCoffee(value);
                saveOfflineSetting('userCoffee', String(value));
              }}
              trackColor={{ false: '#767577', true: '#404040' }}
              thumbColor={useCoffee ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {/* Bedtime */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowBedtimePicker(true)}
          >
            <View style={styles.settingLabelContainer}>
              <Ionicons name="bed-outline" size={20} color={iconColor} />
              <Text style={styles.settingLabel}>Bedtime</Text>
            </View>
            <Text style={styles.settingValue}>{bedtime}</Text>
          </TouchableOpacity>

          {/* Wake-up Time */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowWakeupPicker(true)}
          >
            <View style={styles.settingLabelContainer}>
              <Ionicons name="alarm-outline" size={20} color={iconColor} />
              <Text style={styles.settingLabel}>Wake-up Time</Text>
            </View>
            <Text style={styles.settingValue}>{wakeupTime}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bedtime Picker */}
      {showBedtimePicker && (
        <DateTimePicker
          value={(() => {
            const [h, m] = bedtime.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            return d;
          })()}
          mode="time"
          display="spinner"
          textColor={iconColor}
          onChange={(event, selectedTime) => {
            setShowBedtimePicker(false);
            if (selectedTime) {
              const timeStr = `${String(selectedTime.getHours()).padStart(2, '0')}:${String(selectedTime.getMinutes()).padStart(2, '0')}`;
              setBedtime(timeStr);
              saveOfflineSetting('userBedTime', timeStr);
            }
          }}
        />
      )}

      {/* Wake-up Picker */}
      {showWakeupPicker && (
        <DateTimePicker
          value={(() => {
            const [h, m] = wakeupTime.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            return d;
          })()}
          mode="time"
          display="spinner"
          textColor={iconColor}
          onChange={(event, selectedTime) => {
            setShowWakeupPicker(false);
            if (selectedTime) {
              const timeStr = `${String(selectedTime.getHours()).padStart(2, '0')}:${String(selectedTime.getMinutes()).padStart(2, '0')}`;
              setWakeupTime(timeStr);
              saveOfflineSetting('userWakeTime', timeStr);
            }
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