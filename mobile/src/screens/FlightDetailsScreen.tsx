// screens/FlightDetailsScreen.tsx
import React, { useEffect, useCallback, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator, Button, Alert, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment-timezone';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
import { FlightHeader } from '~/components/FlightDetails/FlightHeader';
import { TimezoneInfo } from '~/components/FlightDetails/TimezoneInfo';
import { SwitchingTimesControl } from '~/components/FlightDetails/SwitchingTimesControl';
import { ResultsDisplay } from '~/components/FlightDetails/ResultsDisplay';

// Hooks and utilities
import { useFlightDetailsState } from '~/utils/useFlightDetailsState';
import {
  calculateSwitchingTimes,
  simulateCircadianDynamics,
  integrateCoStateEquations,
  calculateOptimalPerturbations,
  calculateCost,
  updateSwitchingTimes
} from '~/utils/flightCalculations';
import { createThemedStyles } from '~/styles/FlightDetailsScreen.styles';
import Flight from '~/types/Flight';
import { AppStackParamList, RootStackParamList } from '~/navigation';
import { SleepSchedule } from '~/utils/types';
import { SleepScheduleInput } from '~/components/FlightDetails/SleepScheduleInput';
import ENV from '~/utils/constants';
import { useAuth } from '~/contexts/AuthContext';
import { PERTURBATION_CONSTANTS } from '~/utils/constants';
import { useTheme } from '~/contexts/ThemeContext';
import { scheduleFlightScheduleNotifications, cancelAllScheduledNotifications } from '~/services/scheduleNotificationService';
import { useNotifications } from '~/contexts/NotificationContext';
import { addSwitchingTimesToCalendar } from '~/services/calendarService';
import { calculatePharmacologySchedule } from '~/utils/circadianPharmacology';

type Props = {
  route: RouteProp<AppStackParamList, 'FlightDetailsScreen'>;
  navigation: StackNavigationProp<AppStackParamList, 'FlightDetailsScreen'>;
};

const FlightDetailsScreen = ({ route }: Props) => {
  // Move all hooks to top
  const { flight } = route.params;
  const { authState } = useAuth();
  const { colors, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createThemedStyles(colors, isDarkMode);
  const iconColor = isDarkMode ? '#ffffff' : '#1a1a1a';

  const [sleepSchedule, setSleepSchedule] = useState<SleepSchedule>({
    bedtime: '22:00',
    wakeupTime: '06:00'
  });

  const [useMelatonin, setUseMelatonin] = useState(false);
  const [useCoffee, setUseCoffee] = useState(false);
  const [chronotype, setChronotype] = useState<'morning' | 'evening' | 'intermediate'>('intermediate');
  const [isFlightSaved, setIsFlightSaved] = useState(false);
  const [checkingSaveStatus, setCheckingSaveStatus] = useState(true);
  const [notificationsScheduled, setNotificationsScheduled] = useState(false);
  const { permissionsGranted } = useNotifications();

  const {
    loading,
    timezones,
    switchingTimes,
    stateTrajectory,
    simulationLoading,
    coStateTrajectory,
    coStateAtSwitchingPoints,
    controlPerturbations,
    perturbationLoading,
    updatedSwitchingTimes,
    iterationCount,
    optimizationComplete,
    costHistory,
    activeSwitchingCount,
    optimizationHistory,
    isOptimizing,
    updateState
  } = useFlightDetailsState();

  const API_URL = `${ENV.API_BASE_URL}/flights`;
  const userEmail = authState?.user?.email || '';

  // Check if flight is already saved
  useEffect(() => {
    const checkIfFlightSaved = async () => {
      try {
        if (!userEmail || !flight.flightNumber) {
          setCheckingSaveStatus(false);
          return;
        }

        const response = await axios.get(`${API_URL}/saved/${encodeURIComponent(userEmail)}`);

        const savedFlights = response.data || [];
        const isSaved = savedFlights.some(
          (savedFlight: Flight) => savedFlight.flightNumber === flight.flightNumber
        );

        setIsFlightSaved(isSaved);
      } catch (error) {
        console.error('Error checking flight save status:', error);
      } finally {
        setCheckingSaveStatus(false);
      }
    };

    checkIfFlightSaved();
  }, [userEmail, flight.flightNumber, API_URL]);

  // Load sleep schedule from backend user profile
  useEffect(() => {
    const loadSleepSchedule = async () => {
      try {
        // Try to load from backend first
        const resp = await axios.get(`${ENV.API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${authState.token}` },
        });

        if (resp.data.bedtime && resp.data.wakeupTime) {
          setSleepSchedule({
            bedtime: resp.data.bedtime,
            wakeupTime: resp.data.wakeupTime
          });

          // Also save to AsyncStorage for offline access
          await AsyncStorage.setItem('userBedTime', resp.data.bedtime);
          await AsyncStorage.setItem('userWakeTime', resp.data.wakeupTime);
        }

        // Load melatonin and coffee preferences
        if (resp.data.useMelatonin !== undefined) {
          setUseMelatonin(resp.data.useMelatonin);
        }
        if (resp.data.useCoffee !== undefined) {
          setUseCoffee(resp.data.useCoffee);
        }

        // Load chronotype
        if (resp.data.chronotype) {
          setChronotype(resp.data.chronotype);
        }

        if (!resp.data.bedtime || !resp.data.wakeupTime) {
          // Fallback to AsyncStorage if backend doesn't have values
          const savedBedTime = await AsyncStorage.getItem('userBedTime');
          const savedWakeTime = await AsyncStorage.getItem('userWakeTime');
          if (savedBedTime && savedWakeTime) {
            setSleepSchedule({
              bedtime: savedBedTime,
              wakeupTime: savedWakeTime
            });
          }
        }
      } catch (error) {
        console.error('Error loading sleep schedule:', error);
        // Fallback to AsyncStorage on error
        try {
          const savedBedTime = await AsyncStorage.getItem('userBedTime');
          const savedWakeTime = await AsyncStorage.getItem('userWakeTime');
          if (savedBedTime && savedWakeTime) {
            setSleepSchedule({
              bedtime: savedBedTime,
              wakeupTime: savedWakeTime
            });
          }
        } catch (e) {
          console.error('Error loading from AsyncStorage:', e);
        }
      }
    };
    loadSleepSchedule();
  }, [authState.token]);
  
  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        updateState({ loading: true });

        // Helper function to fetch timezone with fallback
        const fetchTimezone = async (iataCode: string) => {
          console.log(`Fetching timezone for ${iataCode}...`);

          try {
            // Try transatlantic endpoint first
            const transatlanticRes = await fetch(`${ENV.API_BASE_URL}/transatlantic-flights/timezone/${iataCode}`);
            if (transatlanticRes.ok) {
              const data = await transatlanticRes.json();
              console.log(`✓ Got timezone for ${iataCode} from transatlantic: ${data.timeZone}`);
              return data.timeZone;
            }
            console.log(`Transatlantic endpoint failed for ${iataCode}, trying regular airports...`);
          } catch (e) {
            console.log(`Transatlantic endpoint error for ${iataCode}:`, e);
          }

          try {
            // Fallback to regular airports endpoint
            const airportsRes = await fetch(`${ENV.API_BASE_URL}/airports/getTimezoneByIataCode/${iataCode}`);
            if (airportsRes.ok) {
              const data = await airportsRes.json();
              console.log(`✓ Got timezone for ${iataCode} from airports: ${data.timeZone}`);
              return data.timeZone;
            }
            console.log(`Regular airports endpoint failed for ${iataCode}, status: ${airportsRes.status}`);
          } catch (e) {
            console.log(`Regular airports endpoint error for ${iataCode}:`, e);
          }

          // Last resort: try global-airports endpoint
          try {
            const globalRes = await fetch(`${ENV.API_BASE_URL}/global-airports/getTimezoneByIataCode/${iataCode}`);
            if (globalRes.ok) {
              const data = await globalRes.json();
              console.log(`✓ Got timezone for ${iataCode} from global-airports: ${data.timeZone}`);
              return data.timeZone;
            }
            console.log(`Global airports endpoint failed for ${iataCode}, status: ${globalRes.status}`);
          } catch (e) {
            console.log(`Global airports endpoint error for ${iataCode}:`, e);
          }

          console.error(`❌ Could not fetch timezone for ${iataCode} from any source`);
          return null;
        };

        const [originTz, destTz] = await Promise.all([
          fetchTimezone(flight.origin),
          fetchTimezone(flight.destination)
        ]);

        console.log('Timezone fetch results:', { originTz, destTz });

        if (originTz && destTz) {
          updateState({
            timezones: {
              originTz,
              destTz
            }
          });
        } else {
          console.error('Missing timezones:', { origin: flight.origin, originTz, destination: flight.destination, destTz });
        }
      } catch (error) {
        console.error('Failed to fetch timezones:', error);
      } finally {
        updateState({ loading: false });
      }
    };
    fetchTimezones();
  }, [flight]);

  // --- UPDATED: Full Forger 1999 optimization in Calculate ---
  const handleCalculateSwitchingTimes = useCallback(async () => {
    if (!timezones.originTz || !timezones.destTz) return;

    const start = performance.now(); // <-- Start measuring

    console.time('SwitchingTimesCalculation');

    // Always use the latest sleepSchedule here!
    const initialSwitchingTimes = calculateSwitchingTimes(
      flight,
      timezones.originTz,
      timezones.destTz,
      sleepSchedule // <-- pass current sleep schedule
    );

    updateState({
      switchingTimes: initialSwitchingTimes,
      activeSwitchingCount: initialSwitchingTimes.switchingPoints.length,
      stateTrajectory: [],
      coStateTrajectory: [],
      coStateAtSwitchingPoints: {},
      controlPerturbations: [],
      optimizationComplete: false,
      iterationCount: 0,
      costHistory: [],
      isOptimizing: true
    });

    try {
      let currentSwitchingTimes = initialSwitchingTimes;
      let shouldContinue = true;
      let currentIteration = 0;
      const maxIterations = 20;
      let costHist: number[] = [];
      let optHistory: any[] = [];

      while (shouldContinue && currentIteration < maxIterations) {
        // Simulate dynamics with current sleep schedule
        const trajectory = simulateCircadianDynamics(currentSwitchingTimes);

        const currentCost = calculateCost(trajectory.trajectory);

        // Log cost information
        console.log('=== ITERATION', currentIteration, '===');
        console.log('Current Cost J:', currentCost);
        if (costHist.length > 0) {
          const previousCost = costHist[costHist.length - 1];
          console.log('Previous Cost:', previousCost);
          console.log('Cost Change:', currentCost - previousCost);
          console.log('Cost Increased:', currentCost > previousCost);
        }

        // Log trajectory state to verify it's changing
        console.log('Trajectory length:', trajectory.trajectory.length);
        console.log('First state - x:', trajectory.trajectory[0].x.toFixed(6), 'n:', trajectory.trajectory[0].n.toFixed(6));
        const midIdx = Math.floor(trajectory.trajectory.length / 2);
        console.log('Middle state - x:', trajectory.trajectory[midIdx].x.toFixed(6), 'n:', trajectory.trajectory[midIdx].n.toFixed(6));
        console.log('Last state - x:', trajectory.trajectory[trajectory.trajectory.length-1].x.toFixed(6), 'n:', trajectory.trajectory[trajectory.trajectory.length-1].n.toFixed(6));

        // Integrate co-state
        const [coStateTraj, coStateSwitching] = integrateCoStateEquations(
          currentSwitchingTimes,
          trajectory.trajectory
        );

        // Calculate perturbations
        const decay = Math.pow(0.8, currentIteration);
        const dynamicTS = PERTURBATION_CONSTANTS.TS * decay;
        const dynamicMaxTimeAdjustment = 2 * decay;

        const perturbations = calculateOptimalPerturbations(
          currentSwitchingTimes,
          trajectory.trajectory,
          coStateSwitching,
          dynamicMaxTimeAdjustment,
          dynamicTS
        );

        // Update switching times using Forger 1999 method
        const result = updateSwitchingTimes(
          currentSwitchingTimes,
          perturbations,
          [...costHist, currentCost]
        );

        // Save history for display
        costHist = [...costHist, currentCost];
        optHistory = [...optHistory, { ...currentSwitchingTimes }];

        updateState({
          stateTrajectory: trajectory.trajectory,
          coStateTrajectory: coStateTraj,
          coStateAtSwitchingPoints: coStateSwitching,
          controlPerturbations: perturbations,
          updatedSwitchingTimes: {
            ...currentSwitchingTimes,
            switchingPoints: result.newSwitchingPoints.map((newTime: any, idx: number) => {
              const original = currentSwitchingTimes.switchingPoints[idx];
              return typeof newTime === 'string'
                ? { time: newTime, type: original?.type || 'light' }
                : newTime;
            }),
          },
          iterationCount: result.newIterationCount,
          optimizationComplete: result.isComplete,
          activeSwitchingCount: result.newActiveCount,
          costHistory: costHist,
          optimizationHistory: optHistory
        });

        if (result.isComplete) {
          shouldContinue = false;
          break;
        }

        // Update for next iteration
        currentSwitchingTimes = {
          ...currentSwitchingTimes,
          switchingPoints: result.newSwitchingPoints.map((newTime: any, idx: number) => {
            const original = currentSwitchingTimes.switchingPoints[idx];
            return typeof newTime === 'string'
              ? { time: newTime, type: original?.type || 'light' }
              : newTime;
          }),
          // Always keep the latest sleepSchedule in switchingTimes
          sleepSchedule: { ...sleepSchedule }
        };

        currentIteration++;
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
      }
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      updateState({ isOptimizing: false });
      const elapsed = performance.now() - start;
      console.log('SwitchingTimesCalculation took', elapsed.toFixed(0), 'ms');
      console.timeEnd('SwitchingTimesCalculation');
    }
  }, [flight, timezones, sleepSchedule, updateState]);
  // --- END UPDATED ---

  const handleSaveFlight = async () => {
    try {
      if (!userEmail) {
        Alert.alert('Error', 'You must be logged in to save flights.');
        return;
      }
      if (!flight.flightNumber) {
        Alert.alert('Error', 'Flight number not found.');
        return;
      }
      await axios.post(`${API_URL}/save`, { email: userEmail, flightNumber: flight.flightNumber });
      setIsFlightSaved(true);
      Alert.alert('Success', 'Flight saved!');
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        Alert.alert('Already saved', 'You have already saved this flight.');
        setIsFlightSaved(true);
      } else {
        Alert.alert('Error', 'Failed to save flight.');
        console.error('Save flight error:', error);
      }
    }
  };

  const handleUnsaveFlight = async () => {
    try {
      if (!userEmail) {
        Alert.alert('Error', 'You must be logged in to unsave flights.');
        return;
      }
      if (!flight.flightNumber) {
        Alert.alert('Error', 'Flight number not found.');
        return;
      }
      await axios.post(`${API_URL}/unsave`, {
        email: userEmail,
        flightNumber: flight.flightNumber
      });
      setIsFlightSaved(false);
      Alert.alert('Success', 'Flight removed from saved flights!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to unsave flight.');
      console.error('Unsave flight error:', error);
    }
  };

  const handleScheduleNotifications = async () => {
    try {
      if (!permissionsGranted) {
        Alert.alert(
          'Permissions Required',
          'Please grant notification permissions to schedule reminders.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!switchingTimes) {
        Alert.alert('Error', 'Please calculate the schedule first.');
        return;
      }

      const finalSwitchingTimes = updatedSwitchingTimes || switchingTimes;

      // Schedule notifications for all switching points
      const scheduled = await scheduleFlightScheduleNotifications(
        finalSwitchingTimes,
        flight.flightNumber
      );

      setNotificationsScheduled(true);
      Alert.alert(
        'Success!',
        `Scheduled ${scheduled.length} notifications for your jet lag schedule.\n\nYou'll receive reminders for:\n• Light exposure times\n• Dark periods\n• 15-minute advance warnings`,
        [{ text: 'OK' }]
      );

      console.log('📅 Scheduled notifications:', scheduled);
    } catch (error) {
      console.error('Failed to schedule notifications:', error);
      Alert.alert('Error', 'Failed to schedule notifications.');
    }
  };

  const handleCancelNotifications = async () => {
    try {
      await cancelAllScheduledNotifications();
      setNotificationsScheduled(false);
      Alert.alert('Success', 'All scheduled notifications have been cancelled.');
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
      Alert.alert('Error', 'Failed to cancel notifications.');
    }
  };

  const handleAddToCalendar = async () => {
    try {
      if (!switchingTimes) {
        Alert.alert('Error', 'Please calculate the schedule first.');
        return;
      }

      const finalSwitchingTimes = updatedSwitchingTimes || switchingTimes;

      // Calculate interventions (melatonin/caffeine) if enabled
      let interventions: any[] = [];
      if (useMelatonin || useCoffee) {
        // Parse switching times to get light switching points in moment format
        const lightSwitchingPoints = finalSwitchingTimes.switchingPoints.map(sp => ({
          time: moment(sp.time),
          type: sp.type
        }));

        // Parse sleep schedule
        const sleepScheduleMoment = {
          bedtime: moment(sleepSchedule.bedtime, 'HH:mm'),
          wakeTime: moment(sleepSchedule.wakeupTime, 'HH:mm')
        };

        const departureTime = moment(flight.time[0]);
        const arrivalTime = moment(flight.time[1]);

        const pharmacologySchedule = calculatePharmacologySchedule(
          lightSwitchingPoints,
          sleepScheduleMoment,
          departureTime,
          arrivalTime,
          finalSwitchingTimes.timezoneDiff,
          useMelatonin,
          useCoffee
        );

        // Convert to intervention format
        pharmacologySchedule.melatoninDoses.forEach(dose => {
          interventions.push({
            time: dose.time,
            type: 'melatonin',
            dose: dose.dose
          });
        });

        pharmacologySchedule.caffeineDoses.forEach(dose => {
          interventions.push({
            time: dose.time,
            type: 'caffeine',
            dose: dose.dose
          });
        });
      }

      // Add to calendar
      const result = await addSwitchingTimesToCalendar(
        finalSwitchingTimes,
        flight.flightNumber,
        interventions.length > 0 ? interventions : undefined
      );

      if (result.success) {
        Alert.alert(
          'Calendar Updated!',
          result.message + '\n\nEvents include:\n• Light exposure times ☀️\n• Dark periods 🌙' +
          (interventions.length > 0 ? '\n• Melatonin/Caffeine reminders' : ''),
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Failed to add to calendar:', error);
      Alert.alert('Error', 'Failed to add events to calendar.');
    }
  };

  // Error handling
  if (!route.params?.flight) {
    return (
      <View style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.error}>No flight data provided</Text>
        </View>
      </View>
    );
  }

  if (!flight.flightNumber || !flight.origin || !flight.destination) {
    return (
      <View style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.error}>Invalid flight data</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={iconColor} />
        </View>
      )}

      <FlightHeader flight={flight} timezones={timezones} />

      <TouchableOpacity
        onPress={isFlightSaved ? handleUnsaveFlight : handleSaveFlight}
        disabled={checkingSaveStatus}
      >
        <View style={styles.saveButton}>
          <Text style={styles.saveButtonText}>
            {checkingSaveStatus ? 'Checking...' : (isFlightSaved ? 'Unsave Flight' : 'Save Flight')}
          </Text>
        </View>
      </TouchableOpacity>

      {/* <SleepScheduleInput
        schedule={sleepSchedule}
        onChange={setSleepSchedule}
      /> */}

      <SwitchingTimesControl
        onCalculate={handleCalculateSwitchingTimes}
        loading={loading || isOptimizing}
        timezonesReady={!!timezones.originTz && !!timezones.destTz}
      />

      {switchingTimes && (
        <>
          <ResultsDisplay
            switchingTimes={updatedSwitchingTimes || switchingTimes}
            stateTrajectory={stateTrajectory}
            coStateTrajectory={coStateTrajectory}
            coStateAtSwitchingPoints={coStateAtSwitchingPoints}
            controlPerturbations={controlPerturbations}
            optimizationHistory={optimizationHistory}
            optimizationComplete={optimizationComplete}
            iterationCount={iterationCount}
            activeSwitchingCount={activeSwitchingCount}
            costHistory={costHistory}
            flightDuration={switchingTimes?.flightDurationHours || 0}
            timezoneDiff={switchingTimes?.timezoneDiff || 0}
            sleepSchedule={sleepSchedule}
            useMelatonin={useMelatonin}
            useCoffee={useCoffee}
            chronotype={chronotype}
          />

          {/* Notification Scheduling Buttons */}
          <View style={{ marginTop: 20, marginBottom: 20 }}>
            <TouchableOpacity
              onPress={notificationsScheduled ? handleCancelNotifications : handleScheduleNotifications}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>
                {notificationsScheduled ? '🔕 Cancel Notifications' : '🔔 Schedule Notifications'}
              </Text>
            </TouchableOpacity>

            {notificationsScheduled && (
              <Text style={{
                textAlign: 'center',
                marginTop: 10,
                color: colors.textSecondary,
                fontSize: 12
              }}>
                ✓ You'll receive reminders for light exposure and dark periods
              </Text>
            )}

            {/* Calendar Integration Button */}
            <TouchableOpacity
              onPress={handleAddToCalendar}
              style={[styles.saveButton, { marginTop: 10 }]}
            >
              <Text style={styles.saveButtonText}>
                📅 Add to Calendar
              </Text>
            </TouchableOpacity>

            <Text style={{
              textAlign: 'center',
              marginTop: 8,
              color: colors.textSecondary,
              fontSize: 11
            }}>
              Add all switching times and interventions to your device calendar
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default FlightDetailsScreen;