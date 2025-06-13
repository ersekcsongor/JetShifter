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
  route: RouteProp<AppStackParamList, 'FlightDetailsScreenCustom'>;
  navigation: StackNavigationProp<AppStackParamList, 'FlightDetailsScreenCustom'>;
};

const FlightDetailsScreenCustom = ({ route }: Props) => {
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
  
  const API_URL = `${ENV.API_BASE_URL}/global-flights`;
  const { authState } = useAuth();
  const userEmail = authState?.user?.email || ''; // Use user._id if available

  console.log('Flight details:', flight);
  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        updateState({ loading: true });
        const [originRes, destRes] = await Promise.all([
          fetch(`${ENV.API_BASE_URL}/global-airports/getTimezoneByIataCode/${flight.origin}`),
          fetch(`${ENV.API_BASE_URL}/global-airports/getTimezoneByIataCode/${flight.destination}`)
        ]);
            
        const originData = await originRes.json();
        const destData = await destRes.json();
      
        console.log('Origin timezone:', originData);
        console.log('Destination timezone:', destData);
        
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

  const handleCalculateSwitchingTimes = useCallback(() => {
    if (!timezones.originTz || !timezones.destTz) return;
    
    const newSwitchingTimes = calculateSwitchingTimes(
      flight,
      timezones.originTz,
      timezones.destTz,
      sleepSchedule
    );
    
    console.log('Calculated switching times:', newSwitchingTimes); 
    updateState({ 
      switchingTimes: newSwitchingTimes,
      activeSwitchingCount: newSwitchingTimes.switchingPoints.length,
      stateTrajectory: [],
      coStateTrajectory: [],
      coStateAtSwitchingPoints: {},
      controlPerturbations: [],
      optimizationComplete: false,
      iterationCount: 0,
      costHistory: []
    });
  }, [flight, timezones]);

  
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
        coStateAtSwitchingPoints
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
      updatedSwitchingTimes: result.newSwitchingPoints,
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
        const perturbations = calculateOptimalPerturbations(
          currentSwitchingTimes,
          trajectory.trajectory,
          coStateSwitching
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
          updatedSwitchingTimes: result.newSwitchingPoints,
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
          switchingPoints: result.newSwitchingPoints.map((time) => ({ time, type: 'light' })) // or 'dark', depending on your requirements
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

      // Always try to add the flight to the global DB first
      try {
        await axios.post(`${API_URL}/add`, {
          flightNumber: flight.flightNumber,
          origin: flight.origin,
          destination: flight.destination,
          time: flight.time,
          duration: flight.duration,
        });
      } catch (addError: any) {
        // Ignore error if flight already exists (e.g., 409 conflict)
        if (!(axios.isAxiosError(addError) && addError.response?.status === 409)) {
          console.error('Add flight error:', addError);
        }
      }

      // Now save the flight for the user
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

  // When you need to use the times:
  const [departureISO, arrivalISO] = flight.time;
  const departureMoment = moment(departureISO);
  const arrivalMoment = moment(arrivalISO);

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
        
        <TouchableOpacity  onPress={handleSaveFlight}>
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
          loading={loading} 
          timezonesReady={!!timezones.originTz && !!timezones.destTz}
        />
        
        {switchingTimes && (
        <>
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
        </>
        )}
      </ScrollView>
    </ScreenBackground>
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