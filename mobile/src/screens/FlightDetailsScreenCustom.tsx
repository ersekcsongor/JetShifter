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

type Props = {
  route: RouteProp<AppStackParamList, 'FlightDetailsScreenCustom'>;
  navigation: StackNavigationProp<AppStackParamList, 'FlightDetailsScreenCustom'>;
};

const FlightDetailsScreenCustom = ({ route }: Props) => {
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

  // Load sleep schedule from backend user profile or AsyncStorage (offline mode)
  useEffect(() => {
    const loadSleepSchedule = async () => {
      // In offline mode, skip API call and use AsyncStorage directly
      if (authState?.offlineMode || !authState?.token) {
        try {
          const savedBedTime = await AsyncStorage.getItem('userBedTime');
          const savedWakeTime = await AsyncStorage.getItem('userWakeTime');
          if (savedBedTime && savedWakeTime) {
            setSleepSchedule({
              bedtime: savedBedTime,
              wakeupTime: savedWakeTime
            });
          }
          // Load saved preferences from AsyncStorage
          const savedMelatonin = await AsyncStorage.getItem('userMelatonin');
          const savedCoffee = await AsyncStorage.getItem('userCoffee');
          const savedChronotype = await AsyncStorage.getItem('userChronotype');
          if (savedMelatonin !== null) setUseMelatonin(savedMelatonin === 'true');
          if (savedCoffee !== null) setUseCoffee(savedCoffee === 'true');
          if (savedChronotype && ['morning', 'evening', 'intermediate'].includes(savedChronotype)) {
            setChronotype(savedChronotype as 'morning' | 'evening' | 'intermediate');
          }
        } catch (e) {
          console.error('Error loading from AsyncStorage:', e);
        }
        return;
      }

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
          await AsyncStorage.setItem('userMelatonin', String(resp.data.useMelatonin));
        }
        if (resp.data.useCoffee !== undefined) {
          setUseCoffee(resp.data.useCoffee);
          await AsyncStorage.setItem('userCoffee', String(resp.data.useCoffee));
        }

        // Load chronotype
        if (resp.data.chronotype) {
          setChronotype(resp.data.chronotype);
          await AsyncStorage.setItem('userChronotype', resp.data.chronotype);
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
  }, [authState?.token, authState?.offlineMode]);

  // Fallback timezone map for offline mode
  const fallbackTimezones: { [key: string]: string } = {
    'JFK': 'America/New_York', 'LAX': 'America/Los_Angeles', 'LHR': 'Europe/London',
    'CDG': 'Europe/Paris', 'FRA': 'Europe/Berlin', 'AMS': 'Europe/Amsterdam',
    'DXB': 'Asia/Dubai', 'SIN': 'Asia/Singapore', 'HND': 'Asia/Tokyo', 'NRT': 'Asia/Tokyo',
    'SYD': 'Australia/Sydney', 'HKG': 'Asia/Hong_Kong', 'BKK': 'Asia/Bangkok',
    'ICN': 'Asia/Seoul', 'BUD': 'Europe/Budapest', 'VIE': 'Europe/Vienna',
    'BCN': 'Europe/Madrid', 'MAD': 'Europe/Madrid', 'FCO': 'Europe/Rome', 'MXP': 'Europe/Rome',
    'ORD': 'America/Chicago', 'MIA': 'America/New_York', 'SFO': 'America/Los_Angeles',
    'YYZ': 'America/Toronto', 'PEK': 'Asia/Shanghai', 'PVG': 'Asia/Shanghai',
    'DEL': 'Asia/Kolkata', 'BOM': 'Asia/Kolkata', 'CLJ': 'Europe/Bucharest', 'OTP': 'Europe/Bucharest',
  };

  console.log('Flight details:', flight);
  useEffect(() => {
    const fetchTimezones = async () => {
      // In offline mode, use fallback timezones
      if (authState?.offlineMode) {
        const originTz = fallbackTimezones[flight.origin] || 'UTC';
        const destTz = fallbackTimezones[flight.destination] || 'UTC';
        console.log('Using offline timezones:', originTz, destTz);
        updateState({
          timezones: { originTz, destTz },
          loading: false
        });
        return;
      }

      try {
        updateState({ loading: true });
        const [originRes, destRes] = await Promise.all([
          fetch(`${ENV.API_BASE_URL}/airports/getTimezoneByIataCode/${flight.origin}`),
          fetch(`${ENV.API_BASE_URL}/airports/getTimezoneByIataCode/${flight.destination}`)
        ]);

        const originData = await originRes.json();
        const destData = await destRes.json();

        console.log('Origin timezone:', originData);
        console.log('Destination timezone:', destData);

        updateState({
          timezones: {
            originTz: originData.timeZone || fallbackTimezones[flight.origin] || 'UTC',
            destTz: destData.timeZone || fallbackTimezones[flight.destination] || 'UTC'
          }
        });
      } catch (error) {
        console.error('Failed to fetch timezones, using fallback:', error);
        // Use fallback on error
        updateState({
          timezones: {
            originTz: fallbackTimezones[flight.origin] || 'UTC',
            destTz: fallbackTimezones[flight.destination] || 'UTC'
          }
        });
      } finally {
        updateState({ loading: false });
      }
    };

    fetchTimezones();
  }, [flight, authState?.offlineMode]);

  const [calculationTime, setCalculationTime] = useState<number | null>(null);

  const handleCalculateSwitchingTimes = useCallback(async () => {
    if (!timezones.originTz || !timezones.destTz) return;

    const start = performance.now(); // <-- Start measuring

    // Initial switching times calculation
    const initialSwitchingTimes = calculateSwitchingTimes(
      flight,
      timezones.originTz,
      timezones.destTz,
      sleepSchedule
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
        // Simulate dynamics
        const trajectory = simulateCircadianDynamics(currentSwitchingTimes);
        const currentCost = calculateCost(trajectory.trajectory);

        // Integrate co-state
        const [coStateTraj, coStateSwitching] = integrateCoStateEquations(
          currentSwitchingTimes,
          trajectory.trajectory
        );

        // Calculate perturbations
        const decay = Math.pow(0.8, currentIteration);
        const dynamicTS = PERTURBATION_CONSTANTS.TS * decay;
        const dynamicMaxTimeAdjustment = 2 * decay; // Decay the clamp

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
          })
        };

        currentIteration++;
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
      }
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      updateState({ isOptimizing: false });
      setCalculationTime(performance.now() - start); // <-- Save elapsed time in ms
      console.timeEnd('SwitchingTimesCalculation'); // <-- Lezárás és kiírás
    }
  }, [flight, timezones, sleepSchedule, updateState]);

  
const handleSimulateDynamics = useCallback(async () => {
    if (!switchingTimes) return;
    
    updateState({ simulationLoading: true });
    try {
      const trajectory = simulateCircadianDynamics(switchingTimes);
      updateState({ 
        stateTrajectory: trajectory.trajectory,
        costHistory: [...costHistory, calculateCost(trajectory.trajectory)]
      });
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      updateState({ simulationLoading: false });
    }
  }, [switchingTimes, costHistory]);


  const handleIntegrateCoState = useCallback(async () => {
    if (!switchingTimes || stateTrajectory.length === 0) return;
    
    try {
      const [coStateTraj, coStateSwitching] = integrateCoStateEquations(
        switchingTimes,
        stateTrajectory
      );
      updateState({ 
        coStateTrajectory: coStateTraj,
        coStateAtSwitchingPoints: coStateSwitching
      });
    } catch (error) {
      console.error('Co-state integration error:', error);
    }
  }, [switchingTimes, stateTrajectory]);

  const handleCalculatePerturbations = useCallback(async () => {
    if (!switchingTimes || Object.keys(coStateAtSwitchingPoints).length === 0) return;
    
    updateState({ perturbationLoading: true });
    try {
      const perturbations = calculateOptimalPerturbations(
        switchingTimes,
        stateTrajectory,
        coStateAtSwitchingPoints,
        2,
        PERTURBATION_CONSTANTS.TS // <-- add this
      );
      updateState({ controlPerturbations: perturbations });
    } catch (error) {
      console.error('Perturbation calculation error:', error);
    } finally {
      updateState({ perturbationLoading: false });
    }
  }, [switchingTimes, stateTrajectory, coStateAtSwitchingPoints]);

  const handleUpdateSwitchingTimes = useCallback(() => {
    if (!switchingTimes || controlPerturbations.length === 0) return;
    
    const result = updateSwitchingTimes(
      switchingTimes,
      controlPerturbations,
      costHistory
    );
    
    updateState({
      updatedSwitchingTimes: {
        ...switchingTimes, // or ...currentSwitchingTimes
        switchingPoints: result.newSwitchingPoints.map((time: any) =>
          typeof time === 'string' ? { time, type: 'light' } : time
        ),
      },
      iterationCount: result.newIterationCount,
      optimizationComplete: result.isComplete,
      activeSwitchingCount: result.newActiveCount,
      optimizationHistory: [...optimizationHistory, {...switchingTimes}]
    });
    
    if (result.isComplete) {
      console.log('Optimization complete!');
    }
  }, [switchingTimes, controlPerturbations, costHistory, optimizationHistory]);

  const handleRunOptimization = useCallback(async () => {
    if (!switchingTimes || switchingTimes.switchingPoints.length === 0) return;
    
    updateState({ isOptimizing: true });
    
    try {
      let currentSwitchingTimes = switchingTimes;
      let shouldContinue = true;
      let currentIteration = 0;
      const maxIterations = 20;
      
      while (shouldContinue && currentIteration < maxIterations) {
        // Simulate dynamics
        const trajectory = simulateCircadianDynamics(currentSwitchingTimes);
        const currentCost = calculateCost(trajectory.trajectory);
        
        // Integrate co-state
        const [coStateTraj, coStateSwitching] = integrateCoStateEquations(
          currentSwitchingTimes,
          trajectory.trajectory
        );
        
        // Calculate perturbations
        const decay = Math.pow(0.8, currentIteration); // or 0.9, tune as needed
        const dynamicTS = PERTURBATION_CONSTANTS.TS * decay;
        
        const perturbations = calculateOptimalPerturbations(
          currentSwitchingTimes,
          trajectory.trajectory,
          coStateSwitching,
          2,
          dynamicTS // <-- add this
        );
        
        // Update switching times
        const result = updateSwitchingTimes(
          currentSwitchingTimes,
          perturbations,
          [...costHistory, currentCost]
        );
        
        updateState({
          stateTrajectory: trajectory.trajectory,
          coStateTrajectory: coStateTraj,
          coStateAtSwitchingPoints: coStateSwitching,
          controlPerturbations: perturbations,
          updatedSwitchingTimes: {
            ...currentSwitchingTimes,
            switchingPoints: result.newSwitchingPoints.map((time: any) =>
              typeof time === 'string' ? { time, type: 'light' } : time
            ),
          },
          iterationCount: result.newIterationCount,
          optimizationComplete: result.isComplete,
          activeSwitchingCount: result.newActiveCount,
          costHistory: [...costHistory, currentCost],
          optimizationHistory: [...optimizationHistory, {...currentSwitchingTimes}]
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
          }) // or 'dark', depending on your requirements
        };
        
        currentIteration++;
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      }
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      updateState({ isOptimizing: false });
    }
  }, [switchingTimes, costHistory, optimizationHistory]);

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

      // Save the flight for the user with full flight data
      const flightDataToSave = {
        origin: flight.origin,
        destination: flight.destination,
        departureTime: flight.time[0],
        arrivalTime: flight.time[1],
        duration: flight.duration,
        flightNumber: flight.flightNumber
      };

      await axios.post(`${API_URL}/save`, {
        email: userEmail,
        flightNumber: flight.flightNumber,
        flightData: flightDataToSave,
        source: 'custom' // Mark as custom flight
      });
      Alert.alert('Success', 'Flight saved!');
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        Alert.alert('Already saved', 'You have already saved this flight.');
      } else {
        Alert.alert('Error', 'Failed to save flight.');
        console.error('Save flight error:', error);
      }
    }
  };

  // When you need to use the times:
  const [departureISO, arrivalISO] = flight.time;
  const departureMoment = moment(departureISO);
  const arrivalMoment = moment(arrivalISO);

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

      <FlightHeader flight={flight} />

      <TouchableOpacity onPress={handleSaveFlight}>
        <View style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Flight</Text>
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
          </View>
        </>
      )}
      {calculationTime !== null && (
        <>
          <Text style={{margin: 8, color: colors.textSecondary}}>
            Kalkuláció ideje: {calculationTime.toFixed(0)} ms
          </Text>
          {console.log('Kalkuláció ideje:', calculationTime.toFixed(0), 'ms')}
        </>
      )}
    </ScrollView>
  );
};

function parseDuration(duration: string): number {
  // "0h 0m" => 0
  const match = duration.match(/(\d+)h\s*(\d+)m/);
  if (!match) return 0;
  const [, hours, minutes] = match;
  return parseInt(hours) * 60 + parseInt(minutes);
}


export default FlightDetailsScreenCustom;