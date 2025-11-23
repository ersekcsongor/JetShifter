import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Modal, FlatList, TextInput, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "~/navigation";
import axios from "axios";
import ENV from "~/utils/constants";
import { createThemedStyles } from "~/styles/SelectAirportScreen.styles"
import { useTheme } from '~/contexts/ThemeContext';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

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
  const [search, setSearch] = useState('');
  const [arrivalSearch, setArrivalSearch] = useState('');

  const { colors, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createThemedStyles(colors, isDarkMode);

  const iconColor = isDarkMode ? '#ffffff' : '#1a1a1a';

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
    const pad = (n: number) => n.toString().padStart(2, '0');
    const localDateString = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    if (departure && arrival) {
      navigation.navigate('FlightListScreen', {
        departure,
        arrival,
        startDate: localDateString,
      });
    } else {
      alert("Invalid selection");
    }
  };

  const filteredAirports = airports.filter(airport =>
    airport.name.toLowerCase().includes(search.toLowerCase()) ||
    airport.iataCode.toLowerCase().includes(search.toLowerCase())
  );

  const filteredArrivalList = filteredArrivalAirports.filter(airport =>
    airport.name.toLowerCase().includes(arrivalSearch.toLowerCase()) ||
    airport.iataCode.toLowerCase().includes(arrivalSearch.toLowerCase())
  );

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
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.header}>Select Your Route</Text>
        <Text style={styles.subtitle}>Choose departure and arrival airports for your flight</Text>
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

      {/* Date Selector Card */}
      <View style={styles.selectionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="event" size={24} color={iconColor} />
          </View>
          <Text style={styles.label}>Travel Date</Text>
        </View>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{date.toDateString()}</Text>
          <MaterialIcons name="calendar-today" size={20} color={iconColor} />
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          textColor={iconColor}
          onChange={(event, selectedDate) => {
            if (selectedDate) setDate(selectedDate);
            setShowDatePicker(false);
          }}
        />
      )}

      {/* Search Button */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <MaterialIcons name="search" size={24} color={iconColor} />
        <Text style={styles.searchButtonText}>Find Flights</Text>
      </TouchableOpacity>

      {/* Departure Modal */}
      <Modal visible={showDepartureModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Departure Airport</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDepartureModal(false)}
              >
                <Ionicons name="close" size={20} color={iconColor} />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Search by name or code..."
              placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
            <FlatList
              data={filteredAirports}
              keyExtractor={(item, index) => `${item._id || item.iataCode}_${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setDeparture(item.iataCode);
                    setShowDepartureModal(false);
                    setSearch('');
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  <Text style={styles.modalItemSubtext}>{item.iataCode}</Text>
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

      {/* Arrival Modal */}
      <Modal visible={showArrivalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Arrival Airport</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowArrivalModal(false)}
              >
                <Ionicons name="close" size={20} color={iconColor} />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Search by name or code..."
              placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
              value={arrivalSearch}
              onChangeText={setArrivalSearch}
              style={styles.searchInput}
            />
            <FlatList
              data={filteredArrivalList}
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
                  <Text style={styles.modalItemSubtext}>{item.iataCode}</Text>
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
    </ScrollView>
  );
};

export default SelectAirportScreen;
