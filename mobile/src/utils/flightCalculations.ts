// utils/flightCalculations.ts
import moment from 'moment-timezone';
import { 
  MODEL_CONSTANTS,
  PERTURBATION_CONSTANTS 
} from './constants';
import { 
  SwitchingTimes,
  CircadianState,
  StateTrajectory,
  CoState,
  CoStateTrajectory,
  ControlPerturbation,
  SleepSchedule
} from './types';
import Flight from '~/types/Flight';
import { SleepScheduleInput } from '~/components/FlightDetails/SleepScheduleInput';


export const optimizeCircadianSchedule = (
  flight: Flight,
  originTz: string,
  destTz: string,
  sleepSchedule: SleepSchedule
): { switchingTimes: SwitchingTimes; trajectory: StateTrajectory; costHistory: number[] } => {
  let switchingTimes = calculateSwitchingTimes(flight, originTz, destTz, sleepSchedule);
  const costHistory: number[] = [];
  let iteration = 0;
  let isComplete = false;

  while (!isComplete && iteration < PERTURBATION_CONSTANTS.MAX_ITERATIONS) {
    const stateTrajectory = simulateCircadianDynamics(switchingTimes);
    const currentCost = calculateCost(stateTrajectory);
    costHistory.push(currentCost);

    const [coStateTraj, coStateAtPoints] = integrateCoStateEquations(switchingTimes, stateTrajectory);
    const perturbations = calculateOptimalPerturbations(switchingTimes, stateTrajectory, coStateAtPoints);
    
    const updateResult = updateSwitchingTimes(switchingTimes, perturbations, costHistory);
    
    switchingTimes = {
      ...switchingTimes,
      switchingPoints: updateResult.newSwitchingPoints.map((time, index) => ({
        time,
        type: switchingTimes.switchingPoints[index]?.type || 'light'
      }))
    };

    isComplete = updateResult.isComplete;
    iteration++;

    if (costHistory.length > 2 && 
        Math.abs(costHistory[costHistory.length-2] - currentCost) < PERTURBATION_CONSTANTS.COST_TOLERANCE) {
      break;
    }
  }

  return {
    switchingTimes,
    trajectory: simulateCircadianDynamics(switchingTimes),
    costHistory
  };
};

// Update in your flightCalculations.tsconst calculateSwitchingTimes = (
  export const calculateSwitchingTimes = (
    flight: Flight,
    originTz: string,
    destTz: string,
    sleepSchedule: SleepSchedule
  ): SwitchingTimes => {
    // Validate input flight data
    if (!flight?.time[0] || !flight?.time[1]) {
      console.error('Invalid flight times:', flight);
      return {
        direction: 'westbound',
        flightDurationHours: 0,
        switchingPoints: [],
        t0: 'Invalid date',
        tf: 'Invalid date',
        timezoneDiff: 0,
        sleepSchedule,
        u0: 0,
        u1: 1
      };
    }
  
    try {
      // Parse dates with timezones
      const departure = moment.tz(flight.time[0], originTz);
      const arrival = moment.tz(flight.time[1], destTz);
  
      if (!departure.isValid() || !arrival.isValid()) {
        throw new Error('Invalid date format');
      }
  
      const flightDurationHours = arrival.diff(departure, 'hours', true);
      const timezoneDiff = arrival.utcOffset() - departure.utcOffset();
      const direction = timezoneDiff > 0 ? 'eastbound' : 'westbound';
  
      // Calculate sleep window in origin timezone
      const [bedHour, bedMinute] = sleepSchedule.bedtime.split(':').map(Number);
      const [wakeHour, wakeMinute] = sleepSchedule.wakeupTime.split(':').map(Number);
      
      const bedtime = departure.clone()
        .set({ hour: bedHour, minute: bedMinute, second: 0 });
      const wakeTime = departure.clone()
        .set({ hour: wakeHour, minute: wakeMinute, second: 0 });
  
      // Adjust for overnight sleep
      if (wakeTime.isBefore(bedtime)) {
        wakeTime.add(1, 'day');
      }
  
      // Calculate switching points with sleep protection
      const minInterval = 1.5;
      const maxSwitchingPoints = Math.floor(flightDurationHours / minInterval);
      const baseIntervals = Math.min(
        Math.ceil(Math.abs(timezoneDiff/60) * 1.5),
        maxSwitchingPoints
      );
  
      const intervalFactor = direction === 'westbound' ? 0.85 : 1.15;
      const intervalSize = Math.max(
        minInterval,
        (flightDurationHours * intervalFactor) / (baseIntervals + 1)
      );
  
      const switchingPoints: Array<{ time: string; type: 'light'|'dark' }> = [];
      let currentTime = departure.clone();
      let remainingDuration = flightDurationHours;
      let phaseCounter = 0;
  
      while (remainingDuration > intervalSize * 0.5) {
        const phaseType = phaseCounter % 2 === 0 ? 'light' : 'dark';
        let phaseDuration = Math.min(
          intervalSize * (phaseType === 'light' ? 1.2 : 0.8),
          remainingDuration
        );
  
        const nextTime = currentTime.clone().add(phaseDuration, 'hours');
  
        // Check for sleep period overlap
        if (currentTime.isBefore(bedtime) && nextTime.isAfter(bedtime)) {
          // Split phase at bedtime
          const preSleepDuration = bedtime.diff(currentTime, 'hours', true);
          
          if (preSleepDuration > 0.1) { // Minimum meaningful duration
            switchingPoints.push({
              time: bedtime.format('YYYY-MM-DD HH:mm'),
              type: phaseType
            });
            remainingDuration -= preSleepDuration;
            phaseCounter++;
          }
  
          // Add sleep period as dark phase
          switchingPoints.push({
            time: bedtime.format('YYYY-MM-DD HH:mm'),
            type: 'dark'
          });
          
          const sleepEnd = wakeTime.isBefore(arrival) ? wakeTime : arrival;
          switchingPoints.push({
            time: sleepEnd.format('YYYY-MM-DD HH:mm'),
            type: 'dark'
          });
  
          // Adjust tracking variables
          const sleepDuration = sleepEnd.diff(bedtime, 'hours', true);
          remainingDuration -= sleepDuration;
          currentTime = sleepEnd.clone();
          phaseCounter++; // Force phase change after sleep
          continue;
        }
  
        // Normal phase addition
        currentTime.add(phaseDuration, 'hours');
        switchingPoints.push({
          time: currentTime.format('YYYY-MM-DD HH:mm'),
          type: phaseType
        });
  
        remainingDuration -= phaseDuration;
        phaseCounter++;
      }
  
      // Ensure last point matches arrival time
      if (switchingPoints.length > 0) {
        switchingPoints[switchingPoints.length - 1].time = arrival.format('YYYY-MM-DD HH:mm');
      }
  
      return {
        direction,
        flightDurationHours,
        switchingPoints,
        t0: departure.format('YYYY-MM-DD HH:mm'),
        tf: arrival.format('YYYY-MM-DD HH:mm'),
        timezoneDiff: timezoneDiff/60,
        sleepSchedule,
        u0: 0,
        u1: 1
      };
    } catch (error) {
      console.error('Error calculating switching times:', error);
      return {
        direction: 'westbound',
        flightDurationHours: 0,
        switchingPoints: [],
        t0: 'Error in calculation',
        tf: 'Error in calculation',
        timezoneDiff: 0,
        sleepSchedule,
        u0: 0,
        u1: 1
      };
    }
  };

// Updated simulation with phase-type awareness
export const simulateCircadianDynamics = (
  switchingTimes: SwitchingTimes
): StateTrajectory => {
  let currentState: CircadianState = { 
    x: 0, 
    n: switchingTimes.sleepSchedule.bedtime === '22:00' ? 0.4 : 0.6 
  };
  const trajectory: StateTrajectory = [];
  const departure = moment(switchingTimes.t0);
  const totalDuration = switchingTimes.flightDurationHours;
  const timeSteps = Math.min(200, Math.ceil(totalDuration * 4)); // Adaptive resolution
  const dt = totalDuration / timeSteps;

  // Pre-calculate control sequence
  const controlSequence: Array<{ start: number; end: number; type: 'light'|'dark' }> = [];
  let prevTime = departure;
  switchingTimes.switchingPoints.forEach(point => {
    const pointTime = moment(point.time);
    controlSequence.push({
      start: prevTime.diff(departure, 'hours', true),
      end: pointTime.diff(departure, 'hours', true),
      type: point.type
    });
    prevTime = pointTime;
  });

  // Adaptive simulation loop
  for (let i = 0; i <= timeSteps; i++) {
    const currentHour = i * dt;
    const currentControl = controlSequence.find(c => 
      currentHour >= c.start && currentHour < c.end
    )?.type === 'light' ? 1 : 0;

    const I = currentControl === 0 ? MODEL_CONSTANTS.I0 : MODEL_CONSTANTS.I1;
    
    // Improved differential equations with sleep schedule modulation
    const sleepModulator = Math.sin(
      (currentHour % 24) * (Math.PI / 12) - 
      parseInt(switchingTimes.sleepSchedule.bedtime.split(':')[0]) * (Math.PI / 12)
    );
    
    const dxdt = MODEL_CONSTANTS.PI_12 * (currentState.x + MODEL_CONSTANTS.B) * (1 + 0.2 * sleepModulator);
    const dndt = 60 * (
      MODEL_CONSTANTS.ALPHA * I * (1 - currentState.n) - 
      MODEL_CONSTANTS.BETA * currentState.n * (1 + 0.15 * sleepModulator)
    );

    // Adaptive step integration
    const k1 = { x: dxdt * dt, n: dndt * dt };
    const k2 = {
      x: (dxdt + 0.5 * k1.x) * dt,
      n: (dndt + 0.5 * k1.n) * dt
    };
    
    currentState = {
      x: currentState.x + k2.x,
      n: Math.max(0, Math.min(1, currentState.n + k2.n))
    };

    trajectory.push({
      time: departure.clone().add(currentHour, 'hours').format('YYYY-MM-DD HH:mm'),
      x: currentState.x,
      n: currentState.n
    });
  }

  return trajectory;
};
  
  export const integrateCoStateEquations = (
    switchingTimes: SwitchingTimes,
    stateTrajectory: StateTrajectory
  ): [CoStateTrajectory, Record<string, CoState>] => {
    let currentCoState: CoState = { lambda1: 0, lambda2: 0 };
    const trajectory: CoStateTrajectory = [];
    const coStateSwitchingValues: Record<string, CoState> = {};
    const departure = moment(switchingTimes.t0);
    const arrival = moment(switchingTimes.tf);
    const totalDuration = arrival.diff(departure, 'hours', true);
    const timeSteps = 100;
    const dt = totalDuration / timeSteps;
  
    const getStateAtTime = (hoursFromStart: number) => {
      const index = Math.min(
        Math.floor(hoursFromStart / totalDuration * stateTrajectory.length),
        stateTrajectory.length - 1
      );
      return stateTrajectory[index];
    };
  


    const switchingHours = [
      ...switchingTimes.switchingPoints.map(t => moment(t.time).diff(departure, 'hours', true))    ];
  
    for (let i = timeSteps; i >= 0; i--) {
      const currentHour = i * dt;
      const currentTime = departure.clone().add(currentHour, 'hours');
      const state = getStateAtTime(currentHour);
      
      let currentControl = switchingTimes.u0;
      for (let j = 0; j < switchingHours.length - 1; j++) {
        if (currentHour >= switchingHours[j] && currentHour < switchingHours[j + 1]) {
          currentControl = j % 2 === 0 ? switchingTimes.u0 : switchingTimes.u1;
          break;
        }
      }
      const I = currentControl === 0 ? MODEL_CONSTANTS.I0 : MODEL_CONSTANTS.I1;
      
      const df1_dx = MODEL_CONSTANTS.PI_12;
      const df1_dn = 0;
      const df2_dx = 0;
      const df2_dn = 60 * (-MODEL_CONSTANTS.ALPHA * I - MODEL_CONSTANTS.BETA);
  
      const dlambda1_dt = -(currentCoState.lambda1 * df1_dx + currentCoState.lambda2 * df2_dx);
      const dlambda2_dt = -(currentCoState.lambda1 * df1_dn + currentCoState.lambda2 * df2_dn);
  
      currentCoState = {
        lambda1: currentCoState.lambda1 - dlambda1_dt * dt,
        lambda2: currentCoState.lambda2 - dlambda2_dt * dt
      };
  
      trajectory.push({
        time: currentTime.format('YYYY-MM-DD HH:mm'),
        lambda1: currentCoState.lambda1,
        lambda2: currentCoState.lambda2
      });
  
      const switchingIndex = switchingHours.findIndex(t => 
        Math.abs(t - currentHour) < dt/2
      );
      if (switchingIndex >= 0) {
        const pointName = switchingIndex === switchingHours.length - 1 
          ? 'tf' 
          : `t${switchingIndex + 1}`;
        coStateSwitchingValues[pointName] = {...currentCoState};
      }
    }
  
    return [trajectory.reverse(), coStateSwitchingValues];
  };
  
  export const calculateOptimalPerturbations = (
    switchingTimes: SwitchingTimes,
    stateTrajectory: StateTrajectory,
    coStateAtSwitchingPoints: Record<string, CoState>
  ): ControlPerturbation[] => {
    const perturbations: ControlPerturbation[] = [];
    const lambdaTdfDuValues: number[] = [];
    const departure = moment(switchingTimes.t0);
    const arrival = moment(switchingTimes.tf);
    const flightDurationHours = arrival.diff(departure, 'hours', true);
  
    // First pass: collect all lambdaT_df_du values
    Object.keys(coStateAtSwitchingPoints).forEach(point => {
      if (point === 'tf') return;
  
      const pointIndex = parseInt(point.replace('t', '')) - 1;
      if (pointIndex < 0 || pointIndex >= switchingTimes.switchingPoints.length) return;
  
      const switchingPoint = switchingTimes.switchingPoints[pointIndex];
      const coState = coStateAtSwitchingPoints[point];
      const currentControl = pointIndex % 2 === 0 ? switchingTimes.u0 : switchingTimes.u1;
      
      // Calculate time difference
      const pointTime = moment(switchingPoint.time);
      const hoursFromStart = pointTime.diff(departure, 'hours', true);
      
      // Find corresponding state
      const stateIndex = Math.min(
        Math.floor((hoursFromStart / flightDurationHours) * stateTrajectory.length),
        stateTrajectory.length - 1
      );
      const state = stateTrajectory[stateIndex];
  
      // Calculate derivatives
      const dI_du = currentControl === 0 
        ? (MODEL_CONSTANTS.I1 - MODEL_CONSTANTS.I0) 
        : (MODEL_CONSTANTS.I0 - MODEL_CONSTANTS.I1);
      
      const df2_du = 60 * MODEL_CONSTANTS.ALPHA * dI_du * (1 - state.n);
      const lambdaT_df_du = coState.lambda2 * df2_du;
      
      lambdaTdfDuValues.push(Math.abs((1 / PERTURBATION_CONSTANTS.DELTA_U) * lambdaT_df_du));
    });
  
    // Calculate global OU value
    const maxDenominator = Math.max(...lambdaTdfDuValues, PERTURBATION_CONSTANTS.EPSILON);
    const ou = PERTURBATION_CONSTANTS.TS / maxDenominator;
  
    // Second pass: calculate perturbations
    Object.keys(coStateAtSwitchingPoints).forEach(point => {
      if (point === 'tf') return;
  
      const pointIndex = parseInt(point.replace('t', '')) - 1;
      if (pointIndex < 0 || pointIndex >= switchingTimes.switchingPoints.length) return;
  
      const switchingPoint = switchingTimes.switchingPoints[pointIndex];
      const coState = coStateAtSwitchingPoints[point];
      const currentControl = pointIndex % 2 === 0 ? switchingTimes.u0 : switchingTimes.u1;
      
      // Calculate time difference
      const pointTime = moment(switchingPoint.time);
      const hoursFromStart = pointTime.diff(departure, 'hours', true);
      
      // Find corresponding state
      const stateIndex = Math.min(
        Math.floor((hoursFromStart / flightDurationHours) * stateTrajectory.length),
        stateTrajectory.length - 1
      );
      const state = stateTrajectory[stateIndex];
  
      // Calculate derivatives
      const dI_du = currentControl === 0 
        ? (MODEL_CONSTANTS.I1 - MODEL_CONSTANTS.I0) 
        : (MODEL_CONSTANTS.I0 - MODEL_CONSTANTS.I1);
      
      const df2_du = 60 * MODEL_CONSTANTS.ALPHA * dI_du * (1 - state.n);
      const lambdaT_df_du = coState.lambda2 * df2_du;
  
      // Calculate time adjustment
      const dtj = -ou / (PERTURBATION_CONSTANTS.DELTA_U * lambdaT_df_du);
  
      perturbations.push({
        point,
        optimalPerturbation: ou,
        timeAdjustment: isFinite(dtj) ? dtj : 0
      });
    });
  
    return perturbations;
  };
  
  export const calculateCost = (trajectory: StateTrajectory): number => {
    if (trajectory.length === 0) return 0;
    
    let cost = 0;
    trajectory.forEach(state => {
      const xDiff = Math.pow(state.x - 0, 2);
      const nDiff = Math.pow(state.n - 0.5, 2);
      cost += xDiff + nDiff;
    });
    
    // Normalize by trajectory length and ensure finite value
    const normalizedCost = cost / trajectory.length;
    return isFinite(normalizedCost) ? normalizedCost : 0;
  };
  
  export const updateSwitchingTimes = (
    switchingTimes: SwitchingTimes,
    perturbations: ControlPerturbation[],
    costHistory: number[]
  ) => {
    const currentCost = costHistory[costHistory.length - 1] || 0;
    const previousCost = costHistory.length > 1 ? costHistory[costHistory.length - 2] : Infinity;
    let filteredTimes = switchingTimes.switchingPoints.map(t => moment(t.time));
  
    if (costHistory.length > 1 && currentCost > previousCost) {
      const maxDtIndex = perturbations.reduce(
        (maxIndex, pert, index) => 
          Math.abs(pert.timeAdjustment) > Math.abs(perturbations[maxIndex].timeAdjustment) 
            ? index 
            : maxIndex,
        0
      );
      
      filteredTimes = filteredTimes.filter((_, i) => i !== maxDtIndex);
    } else {
      perturbations.forEach(pert => {
        const pointIndex = parseInt(pert.point.replace('t', '')) - 1;
        if (pointIndex >= 0 && pointIndex < filteredTimes.length) {
          const newTime = filteredTimes[pointIndex].clone().add(pert.timeAdjustment, 'hours');
          if (newTime.isBetween(moment(switchingTimes.t0), moment(switchingTimes.tf))) {
            filteredTimes[pointIndex] = newTime;
          }
        }
      });
      
      filteredTimes.sort((a, b) => a.diff(b));
      filteredTimes = filteredTimes.filter(t => 
        t.isBetween(moment(switchingTimes.t0), moment(switchingTimes.tf), undefined, '[]')
      );
    }
  
    const timeDiffs = switchingTimes.switchingPoints
      .slice(0, filteredTimes.length)
      .map((t, i) => Math.abs(moment(t.time).diff(filteredTimes[i], 'hours', true)));
  
    return {
      newSwitchingPoints: filteredTimes.map(t => t.format('YYYY-MM-DD HH:mm')),
      newIterationCount: costHistory.length,
      isComplete: Math.max(...timeDiffs) < PERTURBATION_CONSTANTS.TIME_TOLERANCE ||
                  filteredTimes.length === 0,
      newActiveCount: filteredTimes.length
    };
  };