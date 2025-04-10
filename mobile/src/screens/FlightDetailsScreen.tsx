// screens/FlightDetailsScreen.tsx
import React, { useEffect, useCallback, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment-timezone';


// Components
import { FlightHeader } from '~/components/FlightDetails/FlightHeader';
import { TimezoneInfo } from '~/components/FlightDetails/TimezoneInfo';
import { SwitchingTimesControl } from '~/components/FlightDetails/SwitchingTimesControl';
import { SimulationControl } from '~/components/FlightDetails/SimulationControl';
import { OptimizationControl } from '~/components/FlightDetails/OptimizationControl';
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
import { RootStackParamList } from '~/navigation';
import { SleepSchedule } from '~/utils/types';
import { SleepScheduleInput } from '~/components/FlightDetails/SleepScheduleInput';

type Props = {
  route: RouteProp<RootStackParamList, 'FlightDetailsScreen'>;
  navigation: StackNavigationProp<RootStackParamList, 'FlightDetailsScreen'>;
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
  


  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        updateState({ loading: true });
        const [originRes, destRes] = await Promise.all([
          fetch(`http://172.20.10.2:3000/airports/getTimezoneByIataCode/${flight.origin}`),
          fetch(`http://172.20.10.2:3000/airports/getTimezoneByIataCode/${flight.destination}`)
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

  // Error handling
  if (!route.params?.flight) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No flight data provided</Text>
      </View>
    );
  }

  if (!flight.flightNumber || !flight.origin || !flight.destination) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Invalid flight data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {loading && <ActivityIndicator size="large" style={styles.loader} />}
      
      <FlightHeader flight={flight} />
      
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
        <OptimizationControl 
          onOptimize={handleRunOptimization} 
          isOptimizing={isOptimizing} 
          switchingPointsAvailable={!!switchingTimes.switchingPoints?.length}
          timezonesReady={!!timezones.originTz && !!timezones.destTz}
        />
        
        

        {/* Always show results when switchingTimes exist */}
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
      />
      </>
    )}
    </ScrollView>
  );
};

export default FlightDetailsScreen;