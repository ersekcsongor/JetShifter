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

const API_URL = `${ENV.API_BASE_URL}/flights`; // Ryanair
const API_URL2 = `${ENV.API_BASE_URL}/global-flights`; // Custom

const SavedFlightsScreen = () => {
  const { authState } = useAuth();
  const email = authState?.user?.email || '';
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const [flights, setFlights] = useState<(Flight & { _id?: string; source: 'ryanair' | 'custom' })[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createThemedStyles(colors, isDarkMode);
  const iconColor = isDarkMode ? '#ffffff' : '#1a1a1a';
  
  const fetchSavedFlights = async () => {
    setLoading(true);
    try {
      if (!email) throw new Error('User not authenticated');
      // Fetch Ryanair flights
      const ryanairRes = await axios.get(`${API_URL}/saved/${email}`);
      const ryanairFlights = (ryanairRes.data || []).map((f: any) => ({
        ...f,
        source: 'ryanair' as const,
      }));

      // Fetch custom flights
      const customRes = await axios.get(`${API_URL2}/saved/${email}`);
      const customFlights = (customRes.data || []).map((f: any) => ({
        ...f,
        source: 'custom' as const,
      }));

      setFlights([...ryanairFlights, ...customFlights]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const unsaveFlight = async (flightNumber: string, source: 'ryanair' | 'custom') => {
    try {
      if (source === 'ryanair') {
        await axios.post(`${API_URL}/unsave`, { email, flightNumber });
      } else {
        await axios.post(`${API_URL2}/unsave`, { email, flightNumber });
      }
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
              onPress={() =>
                navigation.navigate(
                  item.source === 'ryanair' ? 'FlightDetailsScreen' : 'FlightDetailsScreenCustom',
                  { flight: item }
                )
              }
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
                    Duration: {item.source === 'ryanair' ? formatRyanairDuration(item.duration) : item.duration}
                  </Text>
                  <Text style={styles.sourceLabel}>
                    {item.source === 'ryanair' ? 'Ryanair' : 'Custom'}
                  </Text>
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

function formatRyanairDuration(duration: string) {
  // Expects "HH:mm"
  const [h, m] = duration.split(':');
  return `${parseInt(h, 10)}h ${parseInt(m, 10)}m`;
}

export default SavedFlightsScreen;