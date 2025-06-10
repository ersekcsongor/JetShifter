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
import styles from '~/styles/SavedFlightsScreen.styles';
import ScreenBackground from '~/components/ScreenBackground';

const API_URL = `${ENV.API_BASE_URL}/flights`;

const SavedFlightsScreen = () => {
  const { authState } = useAuth();
  const email = authState?.user?.email || '';
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const [flights, setFlights] = useState<(Flight & { _id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedFlights = async () => {
    setLoading(true);
    try {
      if (!email) throw new Error('User not authenticated');
      const res = await axios.get(`${API_URL}/saved/${email}`);
      setFlights(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load saved flights');
    }
    setLoading(false);
  };

  const unsaveFlight = async (flightNumber: string) => {
    try {
      await axios.post(`${API_URL}/unsave`, { email, flightNumber });
      setFlights(flights.filter(f => f.flightNumber !== flightNumber));
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
        keyExtractor={(item, index) => String(index)}        
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('FlightDetailsScreen', { flight: item })}
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
                <Text style={styles.duration}>Duration: {item.duration}</Text>
              </View>
              <Pressable style={styles.unsaveButton} onPress={() => unsaveFlight(item.flightNumber)}>
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

export default SavedFlightsScreen;