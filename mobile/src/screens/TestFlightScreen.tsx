// TestFlightScreen.tsx - Test flight with notifications
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import moment from 'moment-timezone';
import { useTheme } from '~/contexts/ThemeContext';
import ResultsDisplay from '~/components/FlightDetails/ResultsDisplay';
import { scheduleLocalNotification } from '~/services/notificationService';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '~/navigation';

type Props = {
  navigation: StackNavigationProp<AppStackParamList, 'TestFlightScreen'>;
};

const TestFlightScreen = ({ navigation }: Props) => {
  const { colors, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const [showResults, setShowResults] = useState(false);

  // Create a test flight from New York to London (5 hour time difference)
  const createTestFlight = () => {
    const now = moment();
    const departureTime = now.clone().add(2, 'hours');
    const arrivalTime = departureTime.clone().add(7, 'hours'); // 7 hour flight

    return {
      flightNumber: 'TEST123',
      departure: {
        airport: 'JFK',
        city: 'New York',
        time: departureTime.format('YYYY-MM-DD HH:mm:ss'),
        timezone: 'America/New_York'
      },
      arrival: {
        airport: 'LHR',
        city: 'London',
        time: arrivalTime.format('YYYY-MM-DD HH:mm:ss'),
        timezone: 'Europe/London'
      }
    };
  };

  // Create test switching times with exposures
  const createTestSwitchingTimes = () => {
    const now = moment();
    const departureTime = now.clone().add(2, 'hours');
    const arrivalTime = departureTime.clone().add(7, 'hours');

    // Create switching points (light exposure schedule)
    const switchingPoints = [];
    let currentTime = departureTime.clone();

    // Add 6 switching points over the flight duration
    for (let i = 0; i < 6; i++) {
      switchingPoints.push({
        time: currentTime.toISOString(),
        lightIntensity: i % 2 === 0 ? 10000 : 0, // Alternate between light and dark
        label: i % 2 === 0 ? 'Bright Light' : 'Dark/Sleep'
      });
      currentTime.add(70, 'minutes');
    }

    return {
      t0: departureTime.toISOString(),
      tf: arrivalTime.clone().add(2, 'days').toISOString(),
      switchingPoints: switchingPoints,
      timezoneDiff: 5, // NYC to London
      originTz: 'America/New_York',
      destTz: 'Europe/London'
    };
  };

  const handleGenerateTestFlight = () => {
    setShowResults(true);
  };

  const handleScheduleTestNotifications = async () => {
    try {
      // Schedule notification in 10 seconds
      await scheduleLocalNotification(
        '☀️ Light Exposure Reminder',
        'Time for bright light exposure! Get sunlight or use a light therapy lamp.',
        10
      );

      // Schedule notification in 30 seconds
      await scheduleLocalNotification(
        '💊 Melatonin Reminder',
        'Take your melatonin supplement 30 minutes before bedtime.',
        30
      );

      // Schedule notification in 50 seconds
      await scheduleLocalNotification(
        '☕ Coffee Reminder',
        'Have your coffee now to help maintain alertness during adjustment.',
        50
      );

      Alert.alert(
        'Notifications Scheduled!',
        'You will receive 3 test notifications:\n\n' +
        '• Light exposure (in 10 seconds)\n' +
        '• Melatonin (in 30 seconds)\n' +
        '• Coffee (in 50 seconds)\n\n' +
        'Keep the app open or put it in background to see them.'
      );
    } catch (error) {
      console.error('Failed to schedule notifications:', error);
      Alert.alert('Error', 'Failed to schedule test notifications.');
    }
  };

  const testFlight = createTestFlight();
  const testSwitchingTimes = createTestSwitchingTimes();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 5,
    },
    buttonContainer: {
      padding: 20,
      gap: 15,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonSecondary: {
      backgroundColor: colors.accent,
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    infoBox: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
      padding: 15,
      borderRadius: 10,
      margin: 20,
    },
    infoText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },
    resultsContainer: {
      flex: 1,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Test Flight & Notifications</Text>
        <Text style={styles.subtitle}>Test notifications without building dev version</Text>
        <Text style={styles.subtitle}>Flight: New York (JFK) → London (LHR)</Text>
        <Text style={styles.subtitle}>Timezone Difference: +5 hours</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 This test screen lets you:{'\n\n'}
          • See a real flight schedule with light exposures{'\n'}
          • Test notifications in 10, 30, and 50 seconds{'\n'}
          • Works in Expo Go (no dev build needed!){'\n\n'}
          Tap "Generate Test Flight" to see the schedule, then tap "Test Notifications" to receive 3 test notifications.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleGenerateTestFlight}>
          <Text style={styles.buttonText}>
            {showResults ? '✅ Flight Generated' : '🛫 Generate Test Flight'}
          </Text>
        </TouchableOpacity>

        {showResults && (
          <TouchableOpacity style={styles.buttonSecondary} onPress={handleScheduleTestNotifications}>
            <Text style={styles.buttonText}>
              🔔 Test Notifications (10s, 30s, 50s)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showResults && (
        <View style={styles.resultsContainer}>
          <ResultsDisplay
            switchingTimes={testSwitchingTimes}
            timezones={{
              originTz: 'America/New_York',
              destTz: 'Europe/London'
            }}
            sleepSchedule={{
              bedtime: '22:00',
              wakeupTime: '06:00'
            }}
            useMelatonin={true}
            useCoffee={true}
            chronotype="intermediate"
            updateState={() => {}}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default TestFlightScreen;
