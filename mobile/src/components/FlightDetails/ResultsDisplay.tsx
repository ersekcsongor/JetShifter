// components/FlightDetails/ResultsDisplay.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { 
  SwitchingTimes,
  StateTrajectory,
  CoStateTrajectory,
  ControlPerturbation
} from '~/utils/types';

type Props = {
  switchingTimes?: SwitchingTimes;
  stateTrajectory: StateTrajectory;
  coStateTrajectory: CoStateTrajectory;
  coStateAtSwitchingPoints: Record<string, CoState>;
  controlPerturbations: ControlPerturbation[];
  optimizationHistory: SwitchingTimes[];
  optimizationComplete: boolean;
  iterationCount: number;
  activeSwitchingCount: number;
  costHistory: number[];
  flightDuration: number;
  timezoneDiff: number;
};

export const ResultsDisplay = ({
  switchingTimes,
  stateTrajectory,
  coStateTrajectory,
  controlPerturbations,
  optimizationHistory,
  optimizationComplete,
  iterationCount,
  activeSwitchingCount,
  costHistory,
  flightDuration,
  timezoneDiff
}: Props) => {
  return (
    <View style={styles.container}>
      {/* Basic Flight Info */}
      <View style={styles.section}>
        <Text style={styles.title}>Flight Analysis Results</Text>
        <Text>Total Duration: {flightDuration.toFixed(1)} hours</Text>
        <Text>Timezone Difference: {timezoneDiff.toFixed(1)} hours</Text>
      </View>

      {/* Cost Progression */}
      {costHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Cost Reduction Progress</Text>
          <LineChart
            data={{
              labels: costHistory.map((_, i) => (i + 1).toString()),
              datasets: [{ data: costHistory }]
            }}
            width={300}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`
            }}
          />
        </View>
      )}

      {/* Switching Points */}
      {switchingTimes && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Optimal Switching Points</Text>
          {switchingTimes.switchingPoints.map((point, index) => (
            <View key={index} style={styles.pointRow}>
              <Text>{point.time}</Text>
              <Text>({point.type.toUpperCase()})</Text>
            </View>
          ))}
        </View>
      )}

      {/* Perturbation Details */}
      {controlPerturbations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Control Adjustments</Text>
          {controlPerturbations.map((pert, index) => (
            <View key={index} style={styles.perturbationRow}>
              <Text>Point {pert.point}:</Text>
              <Text>Adjustment: {pert.timeAdjustment.toFixed(2)}h</Text>
            </View>
          ))}
        </View>
      )}

      {/* Optimization Status */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Optimization Progress</Text>
        <Text>Iterations: {iterationCount}</Text>
        <Text>Active Switching Points: {activeSwitchingCount}</Text>
        <Text>Status: {optimizationComplete ? 'Complete' : 'In Progress'}</Text>
      </View>

      {/* State Trajectories */}
      {stateTrajectory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Circadian State Evolution</Text>
          <LineChart
            data={{
              labels: stateTrajectory.map((_, i) => (i * flightDuration / stateTrajectory.length).toFixed(1)),
              datasets: [
                { data: stateTrajectory.map(s => s.x), color: () => 'red' },
                { data: stateTrajectory.map(s => s.n), color: () => 'blue' }
              ]
            }}
            width={300}
            height={200}
            chartConfig={chartConfig}
          />
          <Text>Red: Circadian Phase (x), Blue: Neurotransmitter Level (n)</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    marginVertical: 8
  },
  section: {
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  pointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  perturbationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  }
});

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

export default ResultsDisplay;