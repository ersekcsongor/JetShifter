import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, Pressable } from 'react-native';
import axios from 'axios';
import ENV from '~/utils/constants';
import { useAuth } from '~/contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '~/navigation';
import Flight from '~/types/Flight';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '~/contexts/ThemeContext';
import { createThemedStyles } from '~/styles/SavedFlightsScreen.styles';
import ScreenBackground from '~/components/ScreenBackground';

const API_URL = `${ENV.API_BASE_URL}/flights`; // Ryanair
const API_URL2 = `${ENV.API_BASE_URL}/global-flights`; // Custom

const SavedFlightsScreen = () => {
  const { authState } = useAuth();
  const email = authState?.user?.email || '';
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const [flights, setFlights] = useState<(Flight & { _id?: string; source: 'ryanair' | 'custom' })[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const styles = createThemedStyles(colors);
  
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
    return <ActivityIndicator size="large" />;
  }

  if (flights.length === 0) {
    return (
      <ScreenBackground>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#6B5B00', marginBottom: 16 }}>
            Saved Flights
          </Text>
          <Text>No saved flights.</Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={{ flex: 1 }}>
        <View style={{ paddingTop: 32, paddingBottom: 16, alignItems: 'center', backgroundColor: '#FFF9E3' }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#6B5B00' }}>
            Saved Flights
          </Text>
        </View>
        <FlatList
          data={flights}
          keyExtractor={(item, index) => `${item.source}-${item.flightNumber}-${index}`}
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
                <MaterialIcons name="flight" size={36} color="#6B5B00" style={styles.icon} />
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
                  <Text style={{ fontSize: 12, color: '#888' }}>
                    {item.source === 'ryanair' ? 'Ryanair' : 'Custom'}
                  </Text>
                </View>
                <Pressable style={styles.unsaveButton} onPress={() => unsaveFlight(item.flightNumber, item.source)}>
                  <Text style={styles.unsaveButtonText}>Unsave</Text>
                </Pressable>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScreenBackground>
  );
};

function formatRyanairDuration(duration: string) {
  // Expects "HH:mm"
  const [h, m] = duration.split(':');
  return `${parseInt(h, 10)}h ${parseInt(m, 10)}m`;
}

export default SavedFlightsScreen;