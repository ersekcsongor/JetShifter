import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AppStackParamList } from '~/navigation';
import axios from 'axios';
import ENV from '~/utils/constants';
import { createThemedStyles } from '~/styles/FlightNumberSearch.styles';
import { useTheme } from '~/contexts/ThemeContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Flight from '~/types/Flight';

const FlightNumberSearchScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const [flightNumber, setFlightNumber] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const { colors, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createThemedStyles(colors, isDarkMode);
  const iconColor = isDarkMode ? '#ffffff' : '#1a1a1a';

  const handleSearch = async () => {
    if (!flightNumber.trim()) {
      Alert.alert('Error', 'Please enter a flight number');
      return;
    }

    setLoading(true);

    try {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateString = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

      console.log(`Searching for flight ${flightNumber} on ${dateString}`);

      const response = await axios.get(
        `${ENV.API_BASE_URL}/flights/search-by-number?flightNumber=${encodeURIComponent(flightNumber.toUpperCase())}&date=${dateString}`
      );

      if (response.data.success && response.data.flight) {
        const flight: Flight = response.data.flight;

        navigation.navigate('FlightDetailsScreen', { flight });
      } else {
        Alert.alert(
          'Flight Not Found',
          response.data.message || `Could not find flight ${flightNumber} for ${dateString}.\n\nPlease check:\n• Flight number is correct\n• Flight operates on this date\n• Try again in a moment`
        );
      }
    } catch (error: any) {
      console.error('Error searching for flight:', error);
      Alert.alert(
        'Search Failed',
        error.response?.data?.message || 'Failed to search for flight. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

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
          <Text style={styles.headerTitle}>Flight Number Search</Text>
          <Text style={styles.headerSubtitle}>Find any flight by number</Text>
        </View>
      </View>

      {/* Search Form */}
      <View style={styles.formContainer}>
        {/* Flight Number Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Flight Number</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="flight" size={24} color={iconColor} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., FR1234, LH400"
              placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
              value={flightNumber}
              onChangeText={setFlightNumber}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {flightNumber.length > 0 && (
              <TouchableOpacity onPress={() => setFlightNumber('')}>
                <Ionicons name="close-circle" size={20} color={iconColor} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.helpText}>
            Enter the airline code and flight number (e.g., FR1234 for Ryanair)
          </Text>
        </View>

        {/* Date Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Flight Date</Text>
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
            minimumDate={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)} // 7 days ago
            maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year ahead
          />
        )}

        {/* Search Button */}
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="search" size={20} color="#ffffff" />
              <Text style={styles.searchButtonText}>Search Flight</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <MaterialIcons name="info-outline" size={20} color={iconColor} />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            • Enter any airline's flight number{'\n'}
            • Select the flight date{'\n'}
            • We'll find the flight details for you{'\n'}
            • Calculate your optimal jet lag schedule
          </Text>
        </View>
      </View>

      {/* Examples */}
      <View style={styles.examplesSection}>
        <Text style={styles.examplesTitle}>Example Flight Numbers:</Text>
        <View style={styles.examplesList}>
          {[
            { code: 'FR1234', airline: 'Ryanair' },
            { code: 'LH400', airline: 'Lufthansa' },
            { code: 'BA178', airline: 'British Airways' },
            { code: 'AF1234', airline: 'Air France' },
          ].map((example, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exampleChip}
              onPress={() => setFlightNumber(example.code)}
            >
              <Text style={styles.exampleCode}>{example.code}</Text>
              <Text style={styles.exampleAirline}>{example.airline}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default FlightNumberSearchScreen;
