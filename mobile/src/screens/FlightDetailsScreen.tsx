// screens/FlightDetailsScreen.tsx
import React, { useEffect, useCallback, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator, Button, Alert, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment-timezone';
import axios from 'axios';

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
import styles from '~/styles/FlightDetailsScreen.styles';
import Flight from '~/types/Flight';
import { AppStackParamList, RootStackParamList } from '~/navigation';
import { SleepSchedule } from '~/utils/types';
import { SleepScheduleInput } from '~/components/FlightDetails/SleepScheduleInput';
import ENV from '~/utils/constants';
import { useAuth } from '~/contexts/AuthContext';
import ScreenBackground from '~/components/ScreenBackground';

type Props = {
  route: RouteProp<AppStackParamList, 'FlightDetailsScreen'>;
  navigation: StackNavigationProp<AppStackParamList, 'FlightDetailsScreen'>;
};

const FlightDetailsScreen = ({ route }: Props) => {
  const [sleepSchedule, setSleepSchedule] = useState<SleepSchedule>({
    bedtime: '22:00',
    wakeupTime: '06:00'
  });
  const { flight } = route.params;
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
  const { authState } = useAuth();
  const userEmail = authState?.user?.email || '';

  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        updateState({ loading: true });
        const [originRes, destRes] = await Promise.all([
          fetch(`${ENV.API_BASE_URL}/airports/getTimezoneByIataCode/${flight.origin}`),
          fetch(`${ENV.API_BASE_URL}/airports/getTimezoneByIataCode/${flight.destination}`)
        ]);
        const originData = await originRes.json();
        const destData = await destRes.json();
        updateState({
          timezones: {
            originTz: originData.timeZone,
            destTz: destData.timeZone
          }
        });
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

    console.time('SwitchingTimesCalculation');

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
        const perturbations = calculateOptimalPerturbations(
          currentSwitchingTimes,
          trajectory.trajectory,
          coStateSwitching,
          2
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

        // Log progress for each iteration
        console.log(
          `Iteration ${currentIteration + 1}: cost=${currentCost}, complete=${result.isComplete}`
        );

        updateState({
          stateTrajectory: trajectory.trajectory,
          coStateTrajectory: coStateTraj,
          coStateAtSwitchingPoints: coStateSwitching,
          controlPerturbations: perturbations,
          updatedSwitchingTimes: result.newSwitchingPoints,
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
          switchingPoints: result.newSwitchingPoints.map((time: any) =>
            typeof time === 'string' ? { time, type: 'light' } : time
          )
        };

        currentIteration++;
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      updateState({ isOptimizing: false });
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

  // Error handling
  if (!route.params?.flight) {
    return (
      <ScreenBackground>
        <View style={styles.container}>
          <Text style={styles.error}>No flight data provided</Text>
        </View>
      </ScreenBackground>
    );
  }

  if (!flight.flightNumber || !flight.origin || !flight.destination) {
    return (
      <ScreenBackground>
        <View style={styles.container}>
          <Text style={styles.error}>Invalid flight data</Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView style={styles.container}>
        {loading && <ActivityIndicator size="large" style={styles.loader} />}
        
        <FlightHeader flight={flight} />
        
        <TouchableOpacity onPress={handleSaveFlight}>
          <View style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Flight</Text>
          </View>
        </TouchableOpacity>

        <SleepScheduleInput 
          schedule={sleepSchedule}
          onChange={setSleepSchedule}
        />

        <SwitchingTimesControl
          onCalculate={handleCalculateSwitchingTimes}
          loading={loading || isOptimizing}
          timezonesReady={!!timezones.originTz && !!timezones.destTz}
        />

        {switchingTimes && (
          <ResultsDisplay
            switchingTimes={switchingTimes}
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
          />
        )}
      </ScrollView>
    </ScreenBackground>
  );
};

export default FlightDetailsScreen;