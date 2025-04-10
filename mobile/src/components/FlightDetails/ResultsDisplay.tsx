// components/FlightDetails/ResultsDisplay.tsx
import { Ionicons } from '@expo/vector-icons';
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
        <Text style={styles.infoText}>Total Duration: {Math.trunc(flightDuration)} hours</Text>
        <Text style={styles.infoText}>Timezone Difference: {Math.abs(Math.trunc(timezoneDiff))} hours</Text>
      </View>

      {/* Switching Points */}
      {switchingTimes && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Exposure Switching Schedule</Text>
          <View style={styles.scheduleContainer}>
            {Object.entries(
              switchingTimes.switchingPoints.reduce<Record<string, typeof switchingTimes.switchingPoints>>((acc, point) => {
                const date = point.time.split(' ')[0];
                if (!acc[date]) {
                  acc[date] = [];
                }
                acc[date].push(point);
                return acc;
              }, {})
            ).map(([date, points], dateIndex) => (
              <View key={dateIndex} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{date}</Text>
                <View style={styles.timeIntervalsContainer}>
                  {points.map((point, index) => {
                    const nextPoint = switchingTimes.switchingPoints.find(
                      p => p.time > point.time
                    );
                    const timeRange = nextPoint 
                      ? `${point.time.split(' ')[1]} - ${nextPoint.time.split(' ')[1]}`
                      : `After ${point.time.split(' ')[1]}`;
                    
                    return (
                      <View 
                        key={index} 
                        style={[
                          styles.scheduleItem,
                          point.type === 'dark' ? styles.darkItem : styles.lightItem
                        ]}
                      >
                        <View style={styles.typeIndicator}>
                          {point.type === 'dark' ? (
                            <Ionicons name="moon" size={18} color="#343a40" />
                          ) : (
                            <Ionicons name="sunny" size={18} color="#fcc419" />
                          )}
                          <Text style={[
                            styles.typeText,
                            point.type === 'dark' ? styles.darkTypeText : styles.lightTypeText
                          ]}>
                            {point.type.toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.timeInfo}>
                          <Text style={styles.timeRange}>{timeRange}</Text>
                          {/* <Text style={styles.timeLabel}>Switch at: {point.time.split(' ')[1]}</Text> */}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* State Trajectories */}
      {stateTrajectory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Circadian State Evolution</Text>
          <LineChart
            data={{
              labels: stateTrajectory.map((_, i) => (i * flightDuration / stateTrajectory.length).toFixed(1)),
              datasets: [
                { data: stateTrajectory.map(s => s.x), color: () => 'red' },
                { data: stateTrajectory.map(s => s.n), color: () => 'blue' },
              ]
            }}
            width={300}
            height={200}
            chartConfig={chartConfig}
          />
          <Text style={styles.chartLegend}>Red: Circadian Phase (x), Blue: Neurotransmitter Level (n)</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    marginVertical: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  infoText: {
    fontSize: 15,
    color: '#34495e',
    marginBottom: 4,
  },
  section: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  scheduleContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  timeIntervalsContainer: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  darkItem: {
    backgroundColor: '#f8f9fa',
  },
  lightItem: {
    backgroundColor: '#fff9e6',
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  typeText: {
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  darkTypeText: {
    color: '#343ac40',
  },
  lightTypeText: {
    color: '#e67e22',
  },
  timeInfo: {
    flex: 1,
  },
  timeRange: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c3e50',
  },
  timeLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  chartLegend: {
    fontSize: 13,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 8,
  },
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