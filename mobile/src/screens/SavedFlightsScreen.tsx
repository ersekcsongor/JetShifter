import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, Pressable } from 'react-native';
import axios from 'axios';
import ENV from '~/utils/constants';
import { useAuth } from '~/contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '~/navigation';
import Flight from '~/types/Flight';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '~/contexts/ThemeContext';
import { createThemedStyles } from '~/styles/SavedFlightsScreen.styles';

const API_URL = `${ENV.API_BASE_URL}/flights`;

// Extended type for saved flights that may have additional fields from backend
type SavedFlight = Flight & {
  _id?: string;
  source: 'ryanair' | 'custom';
  departureTime?: string;
  arrivalTime?: string;
};

const SavedFlightsScreen = () => {
  const { authState } = useAuth();
  const email = authState?.user?.email || '';
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const [flights, setFlights] = useState<SavedFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createThemedStyles(colors, isDarkMode);
  const iconColor = isDarkMode ? '#ffffff' : '#1a1a1a';
  
  const fetchSavedFlights = async () => {
    setLoading(true);
    try {
      console.log('📧 Fetching saved flights for email:', email);
      if (!email) {
        console.error('❌ User not authenticated - no email');
        throw new Error('User not authenticated');
      }

      // Fetch all flights (both Ryanair and custom come from same endpoint now with source field)
      console.log('🔍 Fetching flights from:', `${API_URL}/saved/${email}`);
      const res = await axios.get(`${API_URL}/saved/${email}`);
      console.log('✅ Response:', res.data);

      const allFlights = (res.data || []).map((f: any) => {
        console.log('Flight data:', {
          flightNumber: f.flightNumber,
          duration: f.duration,
          origin: f.origin,
          destination: f.destination,
          source: f.source
        });
        return {
          ...f,
          source: f.source || 'ryanair' as const, // Use source from backend, default to ryanair for backward compatibility
        };
      });

      const ryanairCount = allFlights.filter((f: any) => f.source === 'ryanair').length;
      const customCount = allFlights.filter((f: any) => f.source === 'custom').length;
      console.log(`📊 Total flights found: ${allFlights.length} (${ryanairCount} Ryanair + ${customCount} custom)`);
      setFlights(allFlights);
    } catch (err) {
      console.error('❌ Error fetching saved flights:', err);
    }
    setLoading(false);
  };

  const unsaveFlight = async (flightNumber: string, source: 'ryanair' | 'custom') => {
    try {
      await axios.post(`${API_URL}/unsave`, { email, flightNumber });
      setFlights(flights.filter(f => f.flightNumber !== flightNumber || f.source !== source));
    } catch (err) {
      Alert.alert('Error', 'Failed to unsave flight');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSavedFlights();
    }, [email])
  );

  if (loading) {
    return (
      <View style={styles.scrollView}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={iconColor} />
          <Text style={styles.loadingText}>Loading saved flights...</Text>
        </View>
      </View>
    );
  }

  if (flights.length === 0) {
    return (
      <View style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Saved Flights</Text>
          </View>
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons
              name="bookmark-outline"
              size={64}
              color={isDarkMode ? '#666666' : '#999999'}
            />
            <Text style={styles.noFlightsText}>No saved flights</Text>
            <Text style={styles.noFlightsSubtext}>
              Save flights from search results to see them here
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Saved Flights</Text>
        </View>
        <FlatList
          data={flights}
          keyExtractor={(item, index) => `${item.source}-${item.flightNumber}-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                // Transform flight data to match expected format
                const flightForNavigation = {
                  ...item,
                  time: [item.departureTime || item.time?.[0] || '', item.arrivalTime || item.time?.[1] || ''] as [string, string]
                };
                navigation.navigate(
                  item.source === 'ryanair' ? 'FlightDetailsScreen' : 'FlightDetailsScreenCustom',
                  { flight: flightForNavigation }
                );
              }}
              style={styles.card}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconWrapper}>
                  <MaterialCommunityIcons name="airplane" size={28} color={iconColor} />
                </View>
                <View style={styles.flightInfo}>
                  <Text style={styles.route}>
                    {item.origin} → {item.destination}
                  </Text>
                  <Text style={styles.label}>
                    Flight: <Text style={styles.flightNumber}>{item.flightNumber}</Text>
                  </Text>
                  <Text style={styles.duration}>
                    Duration: {formatDuration(item.duration, item.source, item)}
                  </Text>
                  {/* <Text style={styles.sourceLabel}>
                    {item.source === 'ryanair' ? 'Ryanair' : 'Custom'}
                  </Text> */}
                  <Pressable style={styles.unsaveButton} onPress={() => unsaveFlight(item.flightNumber, item.source)}>
                    <Text style={styles.unsaveButtonText}>Unsave</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

function formatDuration(duration: string | undefined, source: 'ryanair' | 'custom', flight?: any): string {
  // Try to calculate duration from departure/arrival times if not available
  if ((!duration || duration === '—' || duration === 'N/A') && flight?.departureTime && flight?.arrivalTime) {
    try {
      const departure = new Date(flight.departureTime);
      const arrival = new Date(flight.arrivalTime);

      if (!isNaN(departure.getTime()) && !isNaN(arrival.getTime())) {
        const durationMs = arrival.getTime() - departure.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours >= 0 && minutes >= 0) {
          return `${hours}h ${minutes}m`;
        }
      }
    } catch (e) {
      console.error('Error calculating duration from times:', e);
    }
  }

  if (!duration || duration === '—') {
    return 'N/A';
  }

  // If already formatted (e.g., "2h 30m"), return as is
  if (duration.includes('h') && duration.includes('m')) {
    return duration;
  }

  // If in "HH:mm" format, convert to "Xh Ym"
  if (duration.includes(':')) {
    try {
      const [h, m] = duration.split(':');
      const hours = parseInt(h, 10);
      const minutes = parseInt(m, 10);

      if (isNaN(hours) || isNaN(minutes)) {
        return duration; // Return as is if parsing fails
      }

      return `${hours}h ${minutes}m`;
    } catch (e) {
      console.error('Error formatting duration:', e);
      return duration;
    }
  }

  // Return as is for any other format
  return duration;
}

function formatRyanairDuration(duration: string) {
  // Deprecated - use formatDuration instead
  const [h, m] = duration.split(':');
  return `${parseInt(h, 10)}h ${parseInt(m, 10)}m`;
}

export default SavedFlightsScreen;