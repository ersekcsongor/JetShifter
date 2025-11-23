// components/FlightDetails/ResultsDisplay.tsx
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  SwitchingTimes,
  StateTrajectory,
  CoStateTrajectory,
  ControlPerturbation,
  SleepSchedule,
  CoState
} from '~/utils/types';
import { useTheme } from '~/contexts/ThemeContext';

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
  sleepSchedule: SleepSchedule;
};

export const ResultsDisplay = ({
  switchingTimes,
  sleepSchedule
}: Props) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createResultsStyles(isDarkMode);

  if (!switchingTimes) return null;

  // Group switching points by date
  const groupedByDate = switchingTimes.switchingPoints?.reduce<Record<string, any[]>>((acc, point) => {
    const date = point.time.split(' ')[0];
    if (!acc[date]) {
      acc[date] = [];

      // Calculate landing time
      const departure = moment(switchingTimes.t0);
      const landingTime = departure.clone().add(switchingTimes.flightDurationHours, 'hours');

      // Add sleep period only once per date AND only if it's after landing
      const sleepStart = moment(`${date} ${sleepSchedule.bedtime}`);
      const sleepEnd = moment(`${date} ${sleepSchedule.wakeupTime}`);

      if (sleepEnd.isBefore(sleepStart)) {
        sleepEnd.add(1, 'day');
      }

      // Only show sleep period if it starts after landing
      if (sleepStart.isAfter(landingTime)) {
        acc[date].push({
          time: sleepStart.format('YYYY-MM-DD HH:mm'),
          endTime: sleepEnd.format('YYYY-MM-DD HH:mm'),
          type: 'sleep',
          isSleepPeriod: true
        });
      }
    }

    acc[date].push({
      ...point,
      isSleepPeriod: false
    });

    return acc;
  }, {}) ?? {};

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Your Light Schedule</Text>
      <Text style={styles.subtitle}>Follow this schedule to minimize jet lag</Text>

      {Object.entries(groupedByDate).map(([date, points], dateIndex) => (
        <View key={dateIndex} style={styles.dateSection}>
          <View style={styles.dateHeaderContainer}>
            <Text style={styles.dateLabel}>
              {moment(date).format('ddd').toUpperCase()}
            </Text>
            <Text style={styles.dateValue}>
              {moment(date).format('MMM D')}
            </Text>
          </View>

          <View style={styles.timeline}>
            {points
              .sort((a, b) => moment(a.time).diff(moment(b.time)))
              .map((point, index) => {
                if (point.isSleepPeriod) {
                  return (
                    <View key={`sleep-${index}`} style={styles.timelineItem}>
                      <View style={styles.timelineLeft}>
                        <Text style={styles.timeText}>
                          {moment(point.time).format('h:mm A')}
                        </Text>
                      </View>

                      <View style={styles.timelineCenter}>
                        <View style={[styles.timelineDot, styles.sleepDot]} />
                        <View style={[styles.timelineLine, styles.sleepLine]} />
                      </View>

                      <View style={styles.timelineRight}>
                        <View style={[styles.activityCard, styles.sleepCard]}>
                          <Ionicons name="bed" size={24} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                          <View style={styles.activityTextContainer}>
                            <Text style={styles.activityTitle}>Sleep</Text>
                            <Text style={styles.activityTime}>
                              Until {moment(point.endTime).format('h:mm A')}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                }

                // Find next point to determine end time
                const currentPointTime = moment(point.time);
                const allSwitchingPoints = switchingTimes.switchingPoints || [];

                const nextSwitchingPoint = allSwitchingPoints.find(
                  p => moment(p.time).isAfter(currentPointTime)
                );

                const nextSleepInCurrentDate = points.find(
                  p => p.isSleepPeriod && moment(p.time).isAfter(currentPointTime)
                );

                let endTime;
                if (nextSwitchingPoint && nextSleepInCurrentDate) {
                  endTime = moment(nextSwitchingPoint.time).isBefore(moment(nextSleepInCurrentDate.time))
                    ? moment(nextSwitchingPoint.time)
                    : moment(nextSleepInCurrentDate.time);
                } else if (nextSwitchingPoint) {
                  endTime = moment(nextSwitchingPoint.time);
                } else if (nextSleepInCurrentDate) {
                  endTime = moment(nextSleepInCurrentDate.time);
                } else {
                  endTime = moment(switchingTimes.tf);
                }

                const isLastItem = index === points.length - 1;
                const isLight = point.type === 'light';

                return (
                  <View key={index} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <Text style={styles.timeText}>
                        {moment(point.time).format('h:mm A')}
                      </Text>
                    </View>

                    <View style={styles.timelineCenter}>
                      <View style={[
                        styles.timelineDot,
                        isLight ? styles.lightDot : styles.darkDot
                      ]} />
                      {!isLastItem && (
                        <View style={[
                          styles.timelineLine,
                          isLight ? styles.lightLine : styles.darkLine
                        ]} />
                      )}
                    </View>

                    <View style={styles.timelineRight}>
                      <View style={[
                        styles.activityCard,
                        isLight ? styles.lightCard : styles.darkCard
                      ]}>
                        <Ionicons
                          name={isLight ? "sunny" : "moon"}
                          size={24}
                          color={isLight ? "#fbbf24" : "#6366f1"}
                        />
                        <View style={styles.activityTextContainer}>
                          <Text style={styles.activityTitle}>
                            {isLight ? "Seek Light" : "Avoid Light"}
                          </Text>
                          <Text style={styles.activityTime}>
                            Until {endTime.format('h:mm A')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
          </View>
        </View>
      ))}
    </View>
  );
};

const createResultsStyles = (isDarkMode: boolean = false) => StyleSheet.create({
  container: {
    marginTop: 24,
    paddingBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  dateSection: {
    marginBottom: 32,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingLeft: 4,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    letterSpacing: 0.5,
    marginRight: 12,
  },
  dateValue: {
    fontSize: 17,
    fontWeight: '600',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
  },
  timeline: {
    paddingLeft: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLeft: {
    width: 70,
    paddingTop: 2,
    paddingRight: 12,
  },
  timeText: {
    fontSize: 13,
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    fontWeight: '500',
  },
  timelineCenter: {
    width: 32,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  lightDot: {
    backgroundColor: '#fbbf24',
  },
  darkDot: {
    backgroundColor: '#6366f1',
  },
  sleepDot: {
    backgroundColor: isDarkMode ? '#6b7280' : '#9ca3af',
  },
  timelineLine: {
    width: 3,
    flex: 1,
    marginTop: 4,
  },
  lightLine: {
    backgroundColor: '#fde68a',
  },
  darkLine: {
    backgroundColor: '#a5b4fc',
  },
  sleepLine: {
    backgroundColor: isDarkMode ? '#4b5563' : '#d1d5db',
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 8,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  lightCard: {
    backgroundColor: isDarkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(254, 243, 199, 0.5)',
    borderColor: isDarkMode ? 'rgba(251, 191, 36, 0.3)' : '#fde68a',
  },
  darkCard: {
    backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(224, 231, 255, 0.5)',
    borderColor: isDarkMode ? 'rgba(99, 102, 241, 0.3)' : '#c7d2fe',
  },
  sleepCard: {
    backgroundColor: isDarkMode ? 'rgba(107, 114, 128, 0.1)' : 'rgba(243, 244, 246, 0.8)',
    borderColor: isDarkMode ? 'rgba(107, 114, 128, 0.3)' : '#e5e7eb',
  },
  activityTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
    color: isDarkMode ? '#9ca3af' : '#6b7280',
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
