import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, FlatList, TextInput, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "~/navigation";
import axios from "axios";
import ENV from "~/utils/constants";
import { createThemedStyles } from "~/styles/TransatlanticFlightList.styles";
import { useTheme } from '~/contexts/ThemeContext';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Flight from '~/types/Flight';

interface TransatlanticRoute {
  origin: string;
  destination: string;
  originName?: string;
  destinationName?: string;
}

interface TransatlanticFlight {
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  airline: string;
  frequency: string;
}

const AIRPORT_NAMES: Record<string, string> = {
  // Europe
  'FRA': 'Frankfurt',
  'MUC': 'Munich',
  'LHR': 'London Heathrow',
  'CDG': 'Paris CDG',
  'AMS': 'Amsterdam',
  'MAD': 'Madrid',
  'BCN': 'Barcelona',
  'FCO': 'Rome Fiumicino',
  'MXP': 'Milan Malpensa',
  // North America
  'JFK': 'New York JFK',
  'EWR': 'Newark',
  'ORD': 'Chicago O\'Hare',
  'LAX': 'Los Angeles',
  'SFO': 'San Francisco',
  'MIA': 'Miami',
  'BOS': 'Boston',
};

const TransatlanticFlightListScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const [selectedOrigin, setSelectedOrigin] = useState<string>("");
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [routes, setRoutes] = useState<TransatlanticRoute[]>([]);
  const [flights, setFlights] = useState<TransatlanticFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { colors, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createThemedStyles(colors, isDarkMode);

  const iconColor = isDarkMode ? '#ffffff' : '#1a1a1a';

  // Fetch available routes on mount
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get(`${ENV.API_BASE_URL}/transatlantic-flights/routes`);
        const routesData = response.data;

        // Add airport names to routes
        const routesWithNames = routesData.map((route: any) => ({
          ...route,
          originName: AIRPORT_NAMES[route.origin] || route.origin,
          destinationName: AIRPORT_NAMES[route.destination] || route.destination,
        }));

        setRoutes(routesWithNames);
      } catch (error) {
        console.error("Error fetching transatlantic routes:", error);
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  // Fetch flights when origin/destination selected
  const handleRouteSelect = async (route: TransatlanticRoute) => {
    setSelectedOrigin(route.origin);
    setSelectedDestination(route.destination);
    setLoadingFlights(true);

    try {
      const response = await axios.get(
        `${ENV.API_BASE_URL}/transatlantic-flights/search?origin=${route.origin}&destination=${route.destination}`
      );
      setFlights(response.data);
    } catch (error) {
      console.error("Error fetching flights:", error);
      setFlights([]);
    } finally {
      setLoadingFlights(false);
    }
  };

  const handleFlightSelect = (flight: TransatlanticFlight) => {
    // Format the flight data to match the existing Flight type
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateString = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    // Parse departure and arrival times - create full ISO timestamps
    const departureDateTime = `${dateString}T${flight.departureTime}:00`;

    // Handle next-day arrivals (indicated by +1 in arrivalTime)
    const isNextDay = flight.arrivalTime.includes('+1');
    const arrivalTime = flight.arrivalTime.replace('+1', '');

    let arrivalDateObj = new Date(date);
    if (isNextDay) {
      arrivalDateObj.setDate(arrivalDateObj.getDate() + 1);
    }

    const arrivalDateString = `${arrivalDateObj.getFullYear()}-${pad(arrivalDateObj.getMonth() + 1)}-${pad(arrivalDateObj.getDate())}`;
    const arrivalDateTime = `${arrivalDateString}T${arrivalTime}:00`;

    const formattedFlight: Flight = {
      origin: flight.origin,
      destination: flight.destination,
      flightNumber: flight.flightNumber,
      time: [departureDateTime, arrivalDateTime],
      duration: flight.duration,
    };

    navigation.navigate('FlightDetailsScreen', { flight: formattedFlight });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const getUniqueCities = () => {
    const cities = new Set<string>();
    routes.forEach(route => {
      cities.add(route.origin);
      cities.add(route.destination);
    });
    return Array.from(cities).sort();
  };

  const filteredRoutes = routes.filter(route => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      route.origin.toLowerCase().includes(search) ||
      route.destination.toLowerCase().includes(search) ||
      route.originName?.toLowerCase().includes(search) ||
      route.destinationName?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={iconColor} />
        <Text style={styles.loadingText}>Loading transatlantic routes...</Text>
      </View>
    );
  }

  // If a route is selected, show flights list
  if (selectedOrigin && selectedDestination) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedOrigin("");
              setSelectedDestination("");
              setFlights([]);
            }}
          >
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Select Flight</Text>
            <Text style={styles.headerSubtitle}>
              {AIRPORT_NAMES[selectedOrigin]} → {AIRPORT_NAMES[selectedDestination]}
            </Text>
          </View>
        </View>

        {/* Date Picker */}
        <View style={styles.dateSection}>
          <Text style={styles.sectionLabel}>Travel Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="date-range" size={24} color={iconColor} />
            <Text style={styles.dateText}>
              {date.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Flights List */}
        {loadingFlights ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={iconColor} />
            <Text style={styles.loadingText}>Loading flights...</Text>
          </View>
        ) : flights.length > 0 ? (
          <View style={styles.flightsContainer}>
            <Text style={styles.sectionLabel}>Available Flights ({flights.length})</Text>
            {flights.map((flight, index) => (
              <TouchableOpacity
                key={`${flight.flightNumber}-${index}`}
                style={styles.flightCard}
                onPress={() => handleFlightSelect(flight)}
              >
                <View style={styles.flightHeader}>
                  <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
                  <View style={styles.airlineBadge}>
                    <Text style={styles.airlineText}>{flight.airline}</Text>
                  </View>
                </View>

                <View style={styles.flightTimeRow}>
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeLabel}>Departure</Text>
                    <Text style={styles.timeValue}>{flight.departureTime}</Text>
                    <Text style={styles.airportCode}>{flight.origin}</Text>
                  </View>

                  <View style={styles.flightDurationContainer}>
                    <MaterialCommunityIcons name="airplane" size={24} color={iconColor} />
                    <Text style={styles.durationText}>{flight.duration}</Text>
                  </View>

                  <View style={styles.timeBlock}>
                    <Text style={styles.timeLabel}>Arrival</Text>
                    <Text style={styles.timeValue}>{flight.arrivalTime}</Text>
                    <Text style={styles.airportCode}>{flight.destination}</Text>
                  </View>
                </View>

                <View style={styles.flightFooter}>
                  <View style={styles.frequencyBadge}>
                    <Ionicons name="calendar" size={16} color={iconColor} />
                    <Text style={styles.frequencyText}>{flight.frequency}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={iconColor} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="airplane-off" size={64} color={iconColor} />
            <Text style={styles.emptyText}>No flights available for this route</Text>
          </View>
        )}
      </ScrollView>
    );
  }

  // Show routes list
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Transatlantic Flights</Text>
          <Text style={styles.headerSubtitle}>Select your route</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={iconColor} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by city or airport code..."
          placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={20} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Routes List */}
      <View style={styles.routesContainer}>
        <Text style={styles.sectionLabel}>Available Routes ({filteredRoutes.length})</Text>
        {filteredRoutes.length > 0 ? (
          filteredRoutes.map((route, index) => (
            <TouchableOpacity
              key={`${route.origin}-${route.destination}-${index}`}
              style={styles.routeCard}
              onPress={() => handleRouteSelect(route)}
            >
              <View style={styles.routeContent}>
                <View style={styles.routeAirports}>
                  <View style={styles.airportBlock}>
                    <Text style={styles.airportCodeLarge}>{route.origin}</Text>
                    <Text style={styles.airportName}>{route.originName}</Text>
                  </View>

                  <MaterialCommunityIcons
                    name="airplane"
                    size={28}
                    color={iconColor}
                    style={styles.airplaneIcon}
                  />

                  <View style={styles.airportBlock}>
                    <Text style={styles.airportCodeLarge}>{route.destination}</Text>
                    <Text style={styles.airportName}>{route.destinationName}</Text>
                  </View>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={24} color={iconColor} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={iconColor} />
            <Text style={styles.emptyText}>No routes found</Text>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <MaterialCommunityIcons name="information-outline" size={20} color={iconColor} />
        <Text style={styles.infoText}>
          30+ major transatlantic routes between Europe and North America
        </Text>
      </View>
    </ScrollView>
  );
};

export default TransatlanticFlightListScreen;
