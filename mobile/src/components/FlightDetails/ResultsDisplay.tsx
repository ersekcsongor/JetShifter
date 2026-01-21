// components/FlightDetails/ResultsDisplay.tsx
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
  SwitchingTimes,
  StateTrajectory,
  CoStateTrajectory,
  ControlPerturbation,
  SleepSchedule,
  CoState
} from '~/utils/types';
import { useTheme } from '~/contexts/ThemeContext';
import {
  calculateOptimalMelatoninTiming,
  calculateCaffeineCutoff,
} from '~/utils/circadianPharmacology';
import { PHARMACOLOGY_CONSTANTS } from '~/utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  useMelatonin?: boolean;
  useCoffee?: boolean;
  chronotype?: 'morning' | 'evening' | 'intermediate';
  showPreFlightSchedule?: boolean;
};

export const ResultsDisplay = ({
  switchingTimes,
  sleepSchedule,
  useMelatonin = false,
  useCoffee = false,
  chronotype = 'intermediate',
  showPreFlightSchedule = false,
}: Props) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createResultsStyles(isDarkMode);

  if (!switchingTimes) return null;

  // Add sleep periods
  const departure = moment(switchingTimes.t0);
  const landingTime = departure.clone().add(switchingTimes.flightDurationHours, 'hours');
  const scheduleEnd = moment(switchingTimes.tf);

  // Pre-flight schedule: 1-2 days before departure
  const preFlightStart = showPreFlightSchedule ? departure.clone().subtract(2, 'days') : null;

  // Extend schedule end by 12 hours to allow for intervention recommendations (coffee/melatonin)
  // that may fall slightly after the last switching point
  const extendedScheduleEnd = scheduleEnd.clone().add(12, 'hours');

  // Calculate chronotype phase shift using PHARMACOLOGY_CONSTANTS
  const chronotypePhaseShift =
    chronotype === 'morning' ? PHARMACOLOGY_CONSTANTS.INTERVENTION.CHRONOTYPE_PHASE_SHIFT.MORNING :
    chronotype === 'evening' ? PHARMACOLOGY_CONSTANTS.INTERVENTION.CHRONOTYPE_PHASE_SHIFT.EVENING :
    PHARMACOLOGY_CONSTANTS.INTERVENTION.CHRONOTYPE_PHASE_SHIFT.INTERMEDIATE;

  // Determine if this is an eastbound (advancing) or westbound (delaying) flight
  const isAdvancing = switchingTimes.timezoneDiff > 0;

  // Create a flat timeline of all activities sorted by time
  const allActivities: any[] = [];

  // === PRE-FLIGHT SCHEDULE (1-2 days before departure) ===
  if (showPreFlightSchedule && preFlightStart) {
    const isAdvancingFlight = switchingTimes.timezoneDiff > 0; // Eastbound = advance
    const hoursToShift = Math.abs(switchingTimes.timezoneDiff);

    // Calculate adjusted sleep times for pre-flight days
    // Eastbound: Go to bed earlier, wake up earlier
    // Westbound: Go to bed later, wake up later
    const shiftPerDay = Math.min(1, hoursToShift / 2); // Max 1 hour shift per day

    for (let daysBefore = 2; daysBefore >= 1; daysBefore--) {
      const preFlightDay = departure.clone().subtract(daysBefore, 'days').startOf('day');
      const shiftAmount = shiftPerDay * (3 - daysBefore); // Day 2: 1x shift, Day 1: 2x shift

      // Parse normal sleep times
      const normalBedHour = parseInt(sleepSchedule.bedtime.split(':')[0]);
      const normalBedMin = parseInt(sleepSchedule.bedtime.split(':')[1]);
      const normalWakeHour = parseInt(sleepSchedule.wakeupTime.split(':')[0]);
      const normalWakeMin = parseInt(sleepSchedule.wakeupTime.split(':')[1]);

      // Calculate adjusted sleep times
      let adjustedBedtime = preFlightDay.clone().hour(normalBedHour).minute(normalBedMin);
      let adjustedWakeTime = preFlightDay.clone().add(1, 'day').hour(normalWakeHour).minute(normalWakeMin);

      if (isAdvancingFlight) {
        // Eastbound: sleep earlier
        adjustedBedtime.subtract(shiftAmount, 'hours');
        adjustedWakeTime.subtract(shiftAmount, 'hours');
      } else {
        // Westbound: sleep later
        adjustedBedtime.add(shiftAmount, 'hours');
        adjustedWakeTime.add(shiftAmount, 'hours');
      }

      // Add pre-flight sleep period
      allActivities.push({
        time: adjustedBedtime,
        type: 'sleep',
        endTime: adjustedWakeTime,
        isSleep: true,
        isPreFlight: true,
      });

      // Add light exposure recommendation for pre-flight
      if (isAdvancingFlight) {
        // Eastbound: Get bright light in the morning
        const morningLightTime = adjustedWakeTime.clone();
        allActivities.push({
          time: morningLightTime,
          type: 'light',
          isSwitch: true,
          isPreFlight: true,
        });
        // Avoid light in the evening
        const eveningDarkTime = adjustedBedtime.clone().subtract(2, 'hours');
        allActivities.push({
          time: eveningDarkTime,
          type: 'dark',
          isSwitch: true,
          isPreFlight: true,
        });
      } else {
        // Westbound: Get bright light in the evening
        const eveningLightTime = adjustedBedtime.clone().subtract(3, 'hours');
        allActivities.push({
          time: eveningLightTime,
          type: 'light',
          isSwitch: true,
          isPreFlight: true,
        });
        // Avoid light in the morning
        const morningDarkTime = adjustedWakeTime.clone();
        allActivities.push({
          time: morningDarkTime,
          type: 'dark',
          isSwitch: true,
          isPreFlight: true,
        });
      }

      // Add melatonin for pre-flight if enabled
      if (useMelatonin) {
        const melatoninTime = adjustedBedtime.clone().subtract(30, 'minutes');
        allActivities.push({
          time: melatoninTime,
          type: 'melatonin',
          isMelatonin: true,
          isPreFlight: true,
        });
      }
    }
  }

  // Add all switching points with chronotype-adjusted timing
  // Light exposure timing is shifted based on circadian phase
  switchingTimes.switchingPoints?.forEach((point) => {
    const adjustedTime = moment(point.time).add(chronotypePhaseShift, 'minutes');
    allActivities.push({
      time: adjustedTime,
      type: point.type,
      isSwitch: true,
    });
  });

  // Generate sleep periods for each day (using user's stated sleep times)
  console.log(`🛏️ User sleep schedule from props: bedtime=${sleepSchedule.bedtime}, wakeup=${sleepSchedule.wakeupTime}`);

  let currentDay = landingTime.clone().startOf('day');
  while (currentDay.isBefore(scheduleEnd)) {
    const sleepStart = currentDay.clone().hour(parseInt(sleepSchedule.bedtime.split(':')[0])).minute(parseInt(sleepSchedule.bedtime.split(':')[1]));

    // Create sleepEnd starting from the NEXT day, then set the wakeup time
    // This handles the case where bedtime (22:00) is PM and wakeup (06:00) is AM
    const sleepEnd = currentDay.clone().add(1, 'day').hour(parseInt(sleepSchedule.wakeupTime.split(':')[0])).minute(parseInt(sleepSchedule.wakeupTime.split(':')[1]));

    // Only adjust if wakeup time is actually after bedtime on the same day (rare case like 01:00 bedtime, 09:00 wakeup)
    if (parseInt(sleepSchedule.wakeupTime.split(':')[0]) > parseInt(sleepSchedule.bedtime.split(':')[0])) {
      sleepEnd.subtract(1, 'day');
    }

    console.log(`🛏️ Day ${currentDay.format('YYYY-MM-DD')}: Sleep ${sleepStart.format('HH:mm')} -> Wake ${sleepEnd.format('YYYY-MM-DD HH:mm')}`);

    if (sleepStart.isAfter(landingTime)) {
      allActivities.push({
        time: sleepStart,
        type: 'sleep',
        endTime: sleepEnd,
        isSleep: true,
      });

      // === KRONAUER MODEL-BASED MELATONIN CALCULATION ===
      if (useMelatonin) {
        // Estimate current circadian phase based on time relative to habitual sleep schedule
        const wakeHour = parseInt(sleepSchedule.wakeupTime.split(':')[0]) +
                        parseInt(sleepSchedule.wakeupTime.split(':')[1]) / 60;

        // CT 0 is approximately at wake time; calculate hours since wake
        let currentCircadianPhase = (sleepStart.hour() + sleepStart.minute() / 60 - wakeHour + 24) % 24;

        // Apply chronotype adjustment to circadian phase
        currentCircadianPhase = (currentCircadianPhase + chronotypePhaseShift / 60 + 24) % 24;

        // Calculate optimal melatonin timing using phase response curve
        const melatoninTiming = calculateOptimalMelatoninTiming(
          Math.abs(switchingTimes.timezoneDiff) * 60, // Target shift in minutes
          currentCircadianPhase,
          isAdvancing
        );

        // Melatonin should be taken 30-60 minutes before desired bedtime
        // The timing is based on the PRC, which peaks around CT 21 (DLMO + 2-4h before bed)
        const melatoninTime = sleepStart.clone().subtract(
          PHARMACOLOGY_CONSTANTS.MELATONIN.ONSET_TIME_MIN,
          'minutes'
        );

        if (melatoninTime.isAfter(landingTime)) {
          allActivities.push({
            time: melatoninTime,
            type: 'melatonin',
            isMelatonin: true,
            expectedShift: melatoninTiming.expectedShift, // For debugging/display
          });
        }
      }
    }

    // === KRONAUER MODEL-BASED CAFFEINE CALCULATION ===
    console.log('☕ Coffee calculation for sleep period:', {
      currentDay: currentDay.format('YYYY-MM-DD'),
      sleepStartTime: sleepStart.format('YYYY-MM-DD HH:mm'),
      sleepEndTime: sleepEnd.format('YYYY-MM-DD HH:mm'),
      useCoffee,
      landingTime: landingTime.format('YYYY-MM-DD HH:mm'),
      sleepEndAfterLanding: sleepEnd.isAfter(landingTime),
      isAdvancing,
    });

    if (useCoffee && sleepEnd.isAfter(landingTime)) {
      // Only calculate caffeine for wake times that are after landing
      // Calculate caffeine cutoff using pharmacokinetic model
      const cutoffHours = calculateCaffeineCutoff(
        PHARMACOLOGY_CONSTANTS.CAFFEINE.TYPICAL_DOSE_MG,
        PHARMACOLOGY_CONSTANTS.CAFFEINE.SLEEP_THRESHOLD,
        PHARMACOLOGY_CONSTANTS.CAFFEINE.T_HALF,
        PHARMACOLOGY_CONSTANTS.CAFFEINE.K_SENSITIVITY
      );

      console.log(`☕ Caffeine cutoff hours: ${cutoffHours}`);

      // Calculate cutoff time - avoid caffeine X hours before the NEXT sleep period
      // (coffee consumed after waking should not interfere with tonight's sleep)
      const nextSleepStart = sleepEnd.clone().hour(parseInt(sleepSchedule.bedtime.split(':')[0])).minute(parseInt(sleepSchedule.bedtime.split(':')[1]));
      if (nextSleepStart.isBefore(sleepEnd)) {
        nextSleepStart.add(1, 'day');
      }
      const avoidAfter = nextSleepStart.clone().subtract(cutoffHours, 'hours');
      console.log(`☕ Next sleep start: ${nextSleepStart.format('YYYY-MM-DD HH:mm')}`);
      console.log(`☕ Avoid caffeine after: ${avoidAfter.format('YYYY-MM-DD HH:mm')}`);

      // Calculate actual sleep duration from user's schedule (not hardcoded 8 hours)
      const userSleepDurationHours = sleepEnd.diff(sleepStart, 'hours', true);

      // Calculate nextSleepEnd using user's actual sleep duration
      const nextSleepEnd = nextSleepStart.clone().add(userSleepDurationHours, 'hours');

      // Helper function to check if a time falls during sleep
      // Sleep period spans from sleepStart to sleepEnd (which is on the next day if wake time < bed time)
      const isDuringSleep = (time: moment.Moment): boolean => {
        // Check if time is between sleepStart and sleepEnd (current sleep period)
        if (time.isSameOrAfter(sleepStart) && time.isBefore(sleepEnd)) {
          console.log(`☕ isDuringSleep: ${time.format('HH:mm')} is during current sleep (${sleepStart.format('HH:mm')}-${sleepEnd.format('HH:mm')})`);
          return true;
        }
        // Also check the next sleep period using user's actual sleep duration
        if (time.isSameOrAfter(nextSleepStart) && time.isBefore(nextSleepEnd)) {
          console.log(`☕ isDuringSleep: ${time.format('HH:mm')} is during next sleep (${nextSleepStart.format('HH:mm')}-${nextSleepEnd.format('HH:mm')})`);
          return true;
        }
        return false;
      };

      console.log(`☕ Sleep period: ${sleepStart.format('YYYY-MM-DD HH:mm')} to ${sleepEnd.format('YYYY-MM-DD HH:mm')} (${userSleepDurationHours.toFixed(1)}h)`);

      // Calculate caffeine times based on travel direction
      const recommendedTimes: moment.Moment[] = [];

      if (isAdvancing) {
        console.log('☕ Eastbound flight - calculating morning caffeine times');
        // For eastward travel, caffeine 30 minutes after wake helps advance the clock
        const morningCaffeine = sleepEnd.clone().add(30, 'minutes');
        const morningDuringSleep = isDuringSleep(morningCaffeine);
        console.log(`☕ Morning caffeine time: ${morningCaffeine.format('YYYY-MM-DD HH:mm')}`);
        console.log(`☕ Checks: afterLanding=${morningCaffeine.isAfter(landingTime)}, beforeScheduleEnd=${morningCaffeine.isBefore(extendedScheduleEnd)}, duringSleep=${morningDuringSleep}`);

        if (morningCaffeine.isAfter(landingTime) && morningCaffeine.isBefore(extendedScheduleEnd) && !morningDuringSleep) {
          console.log('✓ Adding morning caffeine');
          recommendedTimes.push(morningCaffeine);
        }

        // Additional dose 3-4 hours after wake for sustained alertness
        const midMorningCaffeine = sleepEnd.clone().add(4, 'hours');
        const midMorningDuringSleep = isDuringSleep(midMorningCaffeine);
        console.log(`☕ Mid-morning caffeine time: ${midMorningCaffeine.format('YYYY-MM-DD HH:mm')}`);
        console.log(`☕ Checks: afterLanding=${midMorningCaffeine.isAfter(landingTime)}, beforeAvoidAfter=${midMorningCaffeine.isBefore(avoidAfter)}, beforeScheduleEnd=${midMorningCaffeine.isBefore(extendedScheduleEnd)}, duringSleep=${midMorningDuringSleep}`);

        if (midMorningCaffeine.isAfter(landingTime) &&
            midMorningCaffeine.isBefore(avoidAfter) &&
            midMorningCaffeine.isBefore(extendedScheduleEnd) &&
            !midMorningDuringSleep) {
          console.log('✓ Adding mid-morning caffeine');
          recommendedTimes.push(midMorningCaffeine);
        }
      } else {
        console.log('☕ Westbound flight - calculating afternoon caffeine times');
        // For westward travel, caffeine helps delay the clock
        // Use later in the day to extend wake period
        const afternoonCaffeine = sleepEnd.clone().add(8, 'hours');
        const afternoonDuringSleep = isDuringSleep(afternoonCaffeine);
        console.log(`☕ Afternoon caffeine time: ${afternoonCaffeine.format('YYYY-MM-DD HH:mm')}`);
        console.log(`☕ Checks: afterLanding=${afternoonCaffeine.isAfter(landingTime)}, beforeAvoidAfter=${afternoonCaffeine.isBefore(avoidAfter)}, beforeScheduleEnd=${afternoonCaffeine.isBefore(extendedScheduleEnd)}, duringSleep=${afternoonDuringSleep}`);

        if (afternoonCaffeine.isAfter(landingTime) &&
            afternoonCaffeine.isBefore(avoidAfter) &&
            afternoonCaffeine.isBefore(extendedScheduleEnd) &&
            !afternoonDuringSleep) {
          console.log('✓ Adding afternoon caffeine');
          recommendedTimes.push(afternoonCaffeine);
        }
      }

      console.log(`☕ Total recommended coffee times: ${recommendedTimes.length}`);

      const rationale = isAdvancing
        ? "Caffeine at wake time reinforces phase advance by strengthening wake signals during the new morning"
        : "Caffeine in afternoon extends wake period to delay circadian phase";

      // Add recommended caffeine times
      recommendedTimes.forEach((coffeeTime) => {
        console.log(`☕ Adding coffee to allActivities at ${coffeeTime.format('YYYY-MM-DD HH:mm')}`);
        allActivities.push({
          time: coffeeTime,
          type: 'coffee',
          isCoffee: true,
          rationale: rationale,
        });
      });
    } else {
      if (useCoffee) {
        console.log('⚠️ Coffee enabled but sleepEnd is not after landing time');
      }
    }

    currentDay.add(1, 'day');
  }

  // Sort all activities by time
  allActivities.sort((a, b) => a.time.diff(b.time));

  console.log(`📊 Total activities generated: ${allActivities.length}`);
  console.log('📊 Activity breakdown:', {
    melatonin: allActivities.filter(a => a.isMelatonin).length,
    coffee: allActivities.filter(a => a.isCoffee).length,
    light: allActivities.filter(a => a.type === 'light' && !a.isSleep).length,
    dark: allActivities.filter(a => a.type === 'dark' && !a.isSleep).length,
    sleep: allActivities.filter(a => a.isSleep).length,
  });

  // Separate instant recommendations (melatonin/coffee) from duration segments
  const instantRecommendations: any[] = [];
  const durationActivities: any[] = [];

  allActivities.forEach((activity) => {
    if (activity.isMelatonin || activity.isCoffee) {
      instantRecommendations.push(activity);
    } else {
      durationActivities.push(activity);
    }
  });

  console.log(`📊 Instant recommendations (melatonin + coffee): ${instantRecommendations.length}`);
  console.log(`📊 Duration activities (light/dark/sleep): ${durationActivities.length}`);

  // Create segments from duration activities (light exposure and sleep)
  const segments: any[] = [];
  for (let i = 0; i < durationActivities.length; i++) {
    const current = durationActivities[i];

    // Find next duration activity (skip instant recommendations)
    const next = durationActivities[i + 1];
    const endTime = next ? next.time : scheduleEnd;

    segments.push({
      startTime: current.time,
      endTime: endTime,
      type: current.type,
      isSleep: current.isSleep || false,
    });
  }

  // Add instant recommendations as overlay segments
  instantRecommendations.forEach((instant) => {
    segments.push({
      startTime: instant.time,
      endTime: instant.time,
      type: instant.type,
      isMelatonin: instant.isMelatonin || false,
      isCoffee: instant.isCoffee || false,
      isInstant: true,
    });
  });

  // Group segments by date - segments that cross midnight need to be added to both days
  const groupedByDate: Record<string, any> = {};
  segments.forEach((segment) => {
    // Add segment to its starting day
    const startDateKey = segment.startTime.format('YYYY-MM-DD');
    if (!groupedByDate[startDateKey]) {
      groupedByDate[startDateKey] = {
        date: segment.startTime.clone().startOf('day'),
        segments: [],
      };
    }
    groupedByDate[startDateKey].segments.push(segment);

    // If segment crosses midnight, also add it to the next day
    if (!segment.isInstant) {
      const endDateKey = segment.endTime.format('YYYY-MM-DD');
      if (endDateKey !== startDateKey) {
        // This segment spans multiple days
        if (!groupedByDate[endDateKey]) {
          groupedByDate[endDateKey] = {
            date: segment.endTime.clone().startOf('day'),
            segments: [],
          };
        }
        // Add the same segment reference to the next day
        groupedByDate[endDateKey].segments.push(segment);
      }
    }
  });

  // Detect overlapping segments and assign lanes
  Object.values(groupedByDate).forEach((dayData: any) => {
    const sortedSegments = [...dayData.segments].sort((a, b) => a.startTime.diff(b.startTime));

    // Build overlap groups - segments that overlap with each other
    const overlapGroups: any[][] = [];

    sortedSegments.forEach((segment: any) => {
      const segStart = segment.startTime.hours() * 60 + segment.startTime.minutes();
      const segEnd = segment.isInstant ? segStart + 60 : (segment.endTime.hours() * 60 + segment.endTime.minutes());

      // Find which overlap group this segment belongs to
      let addedToGroup = false;
      for (const group of overlapGroups) {
        // Check if this segment overlaps with any segment in this group
        const overlapsWithGroup = group.some((other: any) => {
          const otherStart = other.startTime.hours() * 60 + other.startTime.minutes();
          const otherEnd = other.isInstant ? otherStart + 60 : (other.endTime.hours() * 60 + other.endTime.minutes());
          return (segStart < otherEnd && segEnd > otherStart);
        });

        if (overlapsWithGroup) {
          group.push(segment);
          addedToGroup = true;
          break;
        }
      }

      // If not added to any group, create a new group
      if (!addedToGroup) {
        overlapGroups.push([segment]);
      }
    });

    // Assign lanes within each overlap group
    overlapGroups.forEach((group: any[]) => {
      const totalLanes = group.length;

      // Sort by start time within group
      group.sort((a, b) => a.startTime.diff(b.startTime));

      // Assign lane index to each segment
      // Coffee and melatonin always get the same lane (0) to appear on the same side
      group.forEach((segment: any, index: number) => {
        if (segment.isMelatonin || segment.isCoffee) {
          segment.lane = 1; // Always use lane 0 for instant recommendations
        } else {
          segment.lane = index;
        }
        segment.totalLanes = totalLanes;
      });
    });
  });

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Your Light Schedule</Text>
      <Text style={styles.subtitle}>Follow this schedule to minimize jet lag</Text>

      {Object.values(groupedByDate).map((dayData: any, dateIndex) => {
        const startHour = 0;
        const endHour = 24;
        const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

        return (
          <View key={dateIndex} style={styles.dateSection}>
            {/* Date Header */}
            <View style={styles.dateHeaderContainer}>
              <Text style={styles.dayLabel}>
                {dayData.date.format('ddd').toUpperCase()}
              </Text>
              <Text style={styles.dateValue}>
                {dayData.date.format('MMM D')}
              </Text>
            </View>

            {/* Timeline Grid */}
            <View style={styles.timelineContainer}>
              {/* Left hour labels */}
              <View style={styles.hourLabelsLeft}>
                {hours.map((hour) => (
                  <View key={`left-${hour}`} style={styles.hourRow}>
                    <Text style={styles.hourText}>
                      {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Center timeline bar */}
              <View style={styles.timelineBarContainer}>
                {hours.map((hour) => (
                  <View key={`grid-${hour}`} style={styles.hourRow}>
                    <View style={styles.hourLine} />
                  </View>
                ))}

                {/* Activity bars overlaid on grid */}
                <View style={styles.activitiesOverlay}>
                  {dayData.segments.map((segment: any, segIndex: number) => {
                    const currentDate = dayData.date.format('YYYY-MM-DD');
                    const currentDayStart = dayData.date.clone().startOf('day');
                    const currentDayEnd = dayData.date.clone().endOf('day');

                    // Check if segment overlaps with current day (start on this day OR spans into this day)
                    const segmentStartsOnThisDay = segment.startTime.format('YYYY-MM-DD') === currentDate;
                    const segmentSpansIntoThisDay = !segment.isInstant &&
                      segment.startTime.isBefore(currentDayStart) &&
                      segment.endTime.isAfter(currentDayStart);

                    // Skip segments that don't touch this day at all
                    if (!segmentStartsOnThisDay && !segmentSpansIntoThisDay) return null;

                    // Handle instant recommendations (melatonin/coffee)
                    if (segment.isInstant) {
                      // Only show instant recommendations on the day they occur
                      if (!segmentStartsOnThisDay) return null;

                      const instantMinutes = segment.startTime.hours() * 60 + segment.startTime.minutes();
                      const topPercent = (instantMinutes / (24 * 60)) * 100;
                      const heightPercent = 2; // Small height for instant recommendations

                      let icon: any;
                      let iconColor: string;
                      let barColor: string;

                      if (segment.isMelatonin) {
                        icon = 'medkit';
                        iconColor = '#ffffff';
                        barColor = '#8b5cf6'; // Purple for melatonin
                      } else if (segment.isCoffee) {
                        icon = 'cafe';
                        iconColor = '#ffffff';
                        barColor = '#92400e'; // Dark brown for coffee
                      } else {
                        // Fallback in case neither flag is set (should not happen)
                        return null;
                      }

                      // Fixed width for instant recommendations (melatonin/coffee)
                      // Position them outside the main timeline bar (which is 50px wide centered)
                      const fixedBarWidth = 28; // Same width for both melatonin and coffee
                      const mainBarHalfWidth = 25; // Half of the 50px main bar width
                      const gapFromMainBar = 16; // Gap between main bar and instant recommendation

                      // Melatonin = left side (outside main bar), Coffee = right side (outside main bar)
                      let leftOffset;
                      if (segment.isMelatonin) {
                        // Position to the left of the main bar
                        leftOffset = -mainBarHalfWidth - gapFromMainBar - fixedBarWidth;
                      } else {
                        // Coffee - position to the right of the main bar
                        leftOffset = mainBarHalfWidth + gapFromMainBar + 40;
                      }
                      const barWidth = fixedBarWidth;
                      return (
                        <View
                          key={segIndex}
                          style={[
                            styles.activityBarWrapper,
                            {
                              top: `${topPercent}%`,
                              height: `${heightPercent}%`,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.activityBar,
                              {
                                backgroundColor: barColor,
                                width: barWidth,
                                marginLeft: leftOffset,
                              },
                            ]}
                          >
                            <View style={styles.activityIconContainer}>
                              <Ionicons name={icon as any} size={20} color={iconColor} />
                            </View>
                          </View>
                        </View>
                      );
                    }

                    // Handle duration segments (light/dark/sleep)
                    // If segment spans from previous day, start at midnight (0:00)
                    let startMinutes;
                    if (segmentSpansIntoThisDay) {
                      startMinutes = 0; // Start at beginning of this day
                    } else {
                      startMinutes = segment.startTime.hours() * 60 + segment.startTime.minutes();
                    }

                    // If segment extends beyond this day, cap at end of day (24:00)
                    let endMinutes;
                    if (segment.endTime.isAfter(currentDayEnd)) {
                      endMinutes = 24 * 60; // End at end of this day
                    } else {
                      endMinutes = segment.endTime.hours() * 60 + segment.endTime.minutes();
                    }

                    const topPercent = (startMinutes / (24 * 60)) * 100;
                    const heightPercent = ((endMinutes - startMinutes) / (24 * 60)) * 100;

                    let barColor, icon, iconColor;
                    if (segment.isSleep) {
                      barColor = isDarkMode ? '#4b5563' : '#d1d5db';
                      icon = 'bed';
                      iconColor = isDarkMode ? '#9ca3af' : '#6b7280';
                    } else if (segment.type === 'light') {
                      barColor = '#fbbf24';
                      icon = 'sunny';
                      iconColor = '#f59e0b';
                    } else {
                      barColor = '#6366f1';
                      icon = 'moon';
                      iconColor = '#4f46e5';
                    }

                    // Duration segments (light/sleep) always use full width
                    const barWidth = 50;
                    const leftOffset = 0;

                    return (
                      <View
                        key={segIndex}
                        style={[
                          styles.activityBarWrapper,
                          {
                            top: `${topPercent}%`,
                            height: `${heightPercent}%`,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.activityBar,
                            {
                              backgroundColor: barColor,
                              width: barWidth,
                              marginLeft: leftOffset,
                            },
                          ]}
                        >
                          {/* Icon at the top of the segment - only show if segment starts on this day */}
                          {segmentStartsOnThisDay && (
                            <View style={styles.activityIconContainer}>
                              <Ionicons name={icon as any} size={20} color={iconColor} />
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Right hour labels */}
              <View style={styles.hourLabelsRight}>
                {hours.map((hour) => (
                  <View key={`right-${hour}`} style={styles.hourRow}>
                    <Text style={styles.hourText}>
                      {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Legend at bottom */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#fbbf24' }]} />
                <Text style={styles.legendText}>Seek Light</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#6366f1' }]} />
                <Text style={styles.legendText}>Avoid Light</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: isDarkMode ? '#4b5563' : '#d1d5db' }]} />
                <Text style={styles.legendText}>Sleep</Text>
              </View>
              {useMelatonin && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#8b5cf6' }]} />
                  <Text style={styles.legendText}>Melatonin</Text>
                </View>
              )}
              {useCoffee && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#92400e' }]} />
                  <Text style={styles.legendText}>Coffee</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
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
    paddingHorizontal: 20,
  },
  dateSection: {
    marginBottom: 40,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  dateValue: {
    fontSize: 17,
    fontWeight: '600',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
  },
  timelineContainer: {
    flexDirection: 'row',
    paddingLeft: 8,
    paddingRight: 8,
    minHeight: 600,
  },
  hourLabelsLeft: {
    flex: 1,
    paddingRight: 12,
    alignItems: 'flex-start',
  },
  hourLabelsRight: {
    flex: 1,
    paddingLeft: 12,
    alignItems: 'flex-end',
  },
  hourRow: {
    height: 24,
    justifyContent: 'center',
  },
  hourText: {
    fontSize: 11,
    color: isDarkMode ? '#6b7280' : '#9ca3af',
    fontWeight: '500',
  },
  hourLine: {
    height: 1,
    backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
    opacity: 0.5,
  },
  timelineBarContainer: {
    width: SCREEN_WIDTH * 0.5,
    position: 'relative',
    marginHorizontal: 8,
  },
  activitiesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  activityBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityBar: {
    width: 50,
    height: '100%',
    borderRadius: 40,
    paddingVertical: 4,
    paddingHorizontal: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  activityIconContainer: {
    marginTop: 4,
  },
  instantRecommendation: {
    position: 'absolute',
    left: -20,
    right: -20,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
    borderStyle: 'dashed',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
    paddingHorizontal: 10,
    maxWidth: SCREEN_WIDTH - 40,
    alignSelf: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    fontWeight: '500',
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
