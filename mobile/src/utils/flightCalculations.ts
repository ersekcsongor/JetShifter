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
  console.log('🔧 OPTIMIZATION V2 - Cost tolerance enabled');
  let switchingTimes = calculateSwitchingTimes(flight, originTz, destTz, sleepSchedule);
  const costHistory: number[] = [];
  let iteration = 0;
  let isComplete = false;
  

  while (!isComplete && iteration < PERTURBATION_CONSTANTS.MAX_ITERATIONS) {
    const stateTrajectory = simulateCircadianDynamics(switchingTimes);
    const currentCost = calculateCost(stateTrajectory.trajectory);
    costHistory.push(currentCost);

    // Log cost information
    console.log('=== ITERATION', iteration, '===');
    console.log('Current Cost J:', currentCost);
    if (costHistory.length > 1) {
      const previousCost = costHistory[costHistory.length - 2];
      console.log('Previous Cost:', previousCost);
      console.log('Cost Change:', currentCost - previousCost);
      console.log('Cost Increased:', currentCost > previousCost);
    }

    const [coStateTraj, coStateAtPoints] = integrateCoStateEquations(switchingTimes, stateTrajectory.trajectory);

    // Dynamic step size adjustment
    const decay = Math.max(0.1, 1 - iteration * 0.05);
    const dynamicMaxTimeAdjustment = 2 * decay;
    const dynamicTS = PERTURBATION_CONSTANTS.TS * decay;

    // Pass dynamicTS to calculateOptimalPerturbations
    const perturbations = calculateOptimalPerturbations(
      switchingTimes,
      stateTrajectory.trajectory,
      coStateAtPoints,
      dynamicMaxTimeAdjustment,
      dynamicTS // <-- new parameter
    );

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

 
    // Convergence check for oscillation
    if (iteration > 1 && 
        Math.abs(costHistory[costHistory.length-1] - costHistory[costHistory.length-2]) < PERTURBATION_CONSTANTS.COST_TOLERANCE &&
        switchingTimes.switchingPoints.every((sp, i) => 
          i === 0 || moment(sp.time).diff(moment(switchingTimes.switchingPoints[i-1].time), 'hours') > dynamicMaxTimeAdjustment
        )) {
      isComplete = true;
    }
  }

  return {
    switchingTimes,
    trajectory: simulateCircadianDynamics(switchingTimes).trajectory,
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

      const timezoneDiff = arrival.utcOffset() - departure.utcOffset();

      // Schedule covers flight + 1 day after landing (for in-flight and immediate post-landing adjustment)
      const endDate = arrival.clone().add(1, 'day');

      const flightDurationHours = arrival.diff(departure, 'hours', true);
      const totalDurationHours = endDate.diff(departure, 'hours', true); // Total duration including adjustment period
      const direction = timezoneDiff > 0 ? 'eastbound' : 'westbound';
  
      // Calculate sleep window in origin timezone
      const [bedHour, bedMinute] = sleepSchedule.bedtime.split(':').map(Number);
      const [wakeHour, wakeMinute] = sleepSchedule.wakeupTime.split(':').map(Number);
      

      console.log(sleepSchedule.bedtime.split(':').map(Number))
      console.log(sleepSchedule.wakeupTime.split(':').map(Number))

      const sleepPeriods = [];

      // First day sleep
      const flightDayBedtime = arrival.clone()
      .set({ hour: bedHour, minute: bedMinute, second: 0 });
      const flightDayWakeTime = arrival.clone()
        .set({ hour: wakeHour, minute: wakeMinute, second: 0 });

      if (flightDayWakeTime.isBefore(flightDayBedtime)) {
        flightDayWakeTime.add(1, 'day');
      }
      sleepPeriods.push({ bedtime: flightDayBedtime, wakeTime: flightDayWakeTime });
    
      // Next day sleep
      const nextDayBedtime = flightDayBedtime.clone().add(1, 'day');
      const nextDayWakeTime = flightDayWakeTime.clone().add(1, 'day');
      sleepPeriods.push({ bedtime: nextDayBedtime, wakeTime: nextDayWakeTime });


      // Calculate switching points with sleep protection
      const minInterval = 1.5;
      const maxSwitchingPoints = Math.floor(flightDurationHours / minInterval);
      const baseIntervals = Math.min(
        Math.ceil(Math.abs(timezoneDiff/60) * 3),
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
      let currentPhase: 'light' | 'dark' = 'light'; // Start with light phase
      
      // Add first switching point at departure for initial light phase
      switchingPoints.push({
        time: currentTime.format('YYYY-MM-DD HH:mm'),
        type: currentPhase
      });
  
      while (remainingDuration > minInterval * 0.5 && currentTime.isBefore(endDate)) {
        // Calculate next phase duration
        let phaseDuration = Math.min(
          intervalSize * (currentPhase === 'light' ? 1.2 : 0.8),
          remainingDuration
        );

        // Check if next phase will overlap with sleep time
        const nextPhaseEnd = currentTime.clone().add(phaseDuration, 'hours');

        // Only avoid sleep periods AFTER landing (Option 2)
        // During flight, switching points are allowed even during user's sleep time
        const activeSleepPeriod = currentTime.isAfter(arrival)
          ? sleepPeriods.find(period =>
              currentTime.isBetween(period.bedtime, period.wakeTime, null, '[)') ||
              nextPhaseEnd.isBetween(period.bedtime, period.wakeTime, null, '[)') ||
              (currentTime.isBefore(period.bedtime) && nextPhaseEnd.isAfter(period.wakeTime))
            )
          : null; // During flight: no sleep protection

        if (activeSleepPeriod) {
          if (currentPhase === 'light' && currentTime.isBefore(activeSleepPeriod.bedtime)) {
            // Transition to sleep time
            const timeUntilBedtime = activeSleepPeriod.bedtime.diff(currentTime, 'hours', true);
            
            if (timeUntilBedtime > 0.5) {
              currentTime = activeSleepPeriod.bedtime.clone();
              remainingDuration -= timeUntilBedtime;
              
              switchingPoints.push({
                time: currentTime.format('YYYY-MM-DD HH:mm'),
                type: currentPhase
              });
              
              currentPhase = 'dark';
            }
          }
  
          // Handle sleep period
          const sleepEnd = activeSleepPeriod.wakeTime.isBefore(endDate) 
            ? activeSleepPeriod.wakeTime 
            : endDate;
          const sleepDuration = sleepEnd.diff(currentTime, 'hours', true);
          
          if (sleepDuration > 0.5) {
            remainingDuration -= sleepDuration;
            currentTime = sleepEnd.clone();
            
            switchingPoints.push({
              time: currentTime.format('YYYY-MM-DD HH:mm'),
              type: currentPhase
            });
            
            currentPhase = 'light';
          }
          
          continue;
        }
        
        // Regular phase processing
        currentTime.add(phaseDuration, 'hours');
        remainingDuration -= phaseDuration;
        
        switchingPoints.push({
          time: currentTime.format('YYYY-MM-DD HH:mm'),
          type: currentPhase
        });
        
        currentPhase = currentPhase === 'light' ? 'dark' : 'light';
      }
  
      // Ensure we cover the entire period
      if (currentTime.isBefore(endDate)) {
        switchingPoints.push({
          time: endDate.format('YYYY-MM-DD HH:mm'),
          type: currentPhase
        });
      }
  
      // // Add extra points in the next day if too few exist
      // const postArrivalPoints = switchingPoints.filter(
      //   point => moment(point.time).isAfter(arrival)
      // );

      // if (postArrivalPoints.length < 3) {
      //   const nextDayInterval = endDate.diff(arrival, 'hours') / 4; // Divide next day into 4 phases
      //   let current = arrival.clone();
        
      //   for (let i = 1; i <= 3; i++) {
      //     current = current.add(nextDayInterval, 'hours');
      //     switchingPoints.push({
      //       time: current.format('YYYY-MM-DD HH:mm'),
      //       type: i % 2 === 0 ? 'dark' : 'light' // Alternate
      //     });
      //   }
      //  }

      return {
        direction,
        flightDurationHours,
        switchingPoints,
        t0: departure.format('YYYY-MM-DD HH:mm'),
        tf: endDate.format('YYYY-MM-DD HH:mm'), // Now shows end of next day
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

  function calculateCircadianCost(trajectory: StateTrajectory, switchingTimes: SwitchingTimes): number {
    // Implement your cost calculation logic here
    // For example:
    const discomfort = trajectory.reduce((sum, state) => sum + Math.abs(state.x), 0);
    const sleepDisruption = trajectory.reduce((sum, state) => sum + (1 - state.n), 0);
    return discomfort + sleepDisruption;
  }

// Updated simulation with phase-type awareness
export const simulateCircadianDynamics = (
  switchingTimes: SwitchingTimes
): { trajectory: StateTrajectory, cost: number } => {
  let currentState: CircadianState = { 
    x: 0, 
    n: switchingTimes.sleepSchedule.bedtime === '22:00' ? 0.4 : 0.6 
  };
  const trajectory: StateTrajectory = [];
  const departure = moment(switchingTimes.t0);
  const endTime = moment(switchingTimes.tf);
  const totalDuration = endTime.diff(departure, 'hours', true);
  const timeSteps = 1000; // or 1000
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

  function getControl(hour: number) {
    return controlSequence.find(c => hour >= c.start && hour < c.end)?.type === 'light' ? 1 : 0;
  }

  for (let i = 0; i <= timeSteps; i++) {
    const currentHour = i * dt;
    const control = getControl(currentHour);
    const I = control === 0 ? MODEL_CONSTANTS.I0 : MODEL_CONSTANTS.I1;

    // RK4 integration
    const sleepModulator = Math.sin(
      (currentHour % 24) * (Math.PI / 12) - 
      parseInt(switchingTimes.sleepSchedule.bedtime.split(':')[0]) * (Math.PI / 12)
    );

    function dxdt(x: number, n: number) {
      return MODEL_CONSTANTS.PI_12 * (x + MODEL_CONSTANTS.B) * (1 + 0.2 * sleepModulator);
    }
    function dndt(x: number, n: number) {
      return 60 * (
        MODEL_CONSTANTS.ALPHA * I * (1 - n) - 
        MODEL_CONSTANTS.BETA * n * (1 + 0.15 * sleepModulator)
      );
    }

    // RK4 steps
    const k1x = dxdt(currentState.x, currentState.n);
    const k1n = dndt(currentState.x, currentState.n);

    const k2x = dxdt(currentState.x + 0.5 * dt * k1x, currentState.n + 0.5 * dt * k1n);
    const k2n = dndt(currentState.x + 0.5 * dt * k1x, currentState.n + 0.5 * dt * k1n);

    const k3x = dxdt(currentState.x + 0.5 * dt * k2x, currentState.n + 0.5 * dt * k2n);
    const k3n = dndt(currentState.x + 0.5 * dt * k2x, currentState.n + 0.5 * dt * k2n);

    const k4x = dxdt(currentState.x + dt * k3x, currentState.n + dt * k3n);
    const k4n = dndt(currentState.x + dt * k3x, currentState.n + dt * k3n);

    currentState = {
      x: currentState.x + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x),
      n: Math.max(0, Math.min(1, currentState.n + (dt / 6) * (k1n + 2 * k2n + 2 * k3n + k4n)))
    };

    trajectory.push({
      time: departure.clone().add(currentHour, 'hours').format('YYYY-MM-DD HH:mm'),
      x: currentState.x,
      n: currentState.n
    });
  }

  const cost = calculateCircadianCost(trajectory, switchingTimes);
  return { trajectory, cost };
};
  
  export const integrateCoStateEquations = (
    switchingTimes: SwitchingTimes,
    stateTrajectory: StateTrajectory
  ): [CoStateTrajectory, Record<string, CoState>] => {
    // Set terminal co-state based on final state (Forger 1999)
    const finalState = stateTrajectory[stateTrajectory.length - 1];
    const TARGET_N = 0.7; // Try a value different from 0.5 for testing

    let currentCoState: CoState = {
      lambda1: 2 * (finalState.x - 0),
      lambda2: 2 * (finalState.n - TARGET_N)
    };
    const trajectory: CoStateTrajectory = [];
    const coStateSwitchingValues: Record<string, CoState> = {};
    const departure = moment(switchingTimes.t0);
    const arrival = moment(switchingTimes.tf);
    const totalDuration = arrival.diff(departure, 'hours', true);
    const timeSteps = 1000;
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

      // Add running cost derivatives
      const dL_dx = 2 * state.x;
      const dL_dn = 2 * (state.n - TARGET_N);

      const dlambda1_dt = -(dL_dx + currentCoState.lambda1 * df1_dx + currentCoState.lambda2 * df2_dx);
      const dlambda2_dt = -(dL_dn + currentCoState.lambda1 * df1_dn + currentCoState.lambda2 * df2_dn);

      currentCoState = {
        lambda1: clamp(currentCoState.lambda1 - dlambda1_dt * dt, -1e3, 1e3),
        lambda2: clamp(currentCoState.lambda2 - dlambda2_dt * dt, -1e3, 1e3)
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
  
// (Removed duplicate declaration of finalState and currentCoState)

    return [trajectory.reverse(), coStateSwitchingValues];
  };
  
  export const calculateOptimalPerturbations = (
    switchingTimes: SwitchingTimes,
    stateTrajectory: StateTrajectory,
    coStateAtSwitchingPoints: Record<string, CoState>,
    maxTimeAdjustment: number,
    TS: number // <-- new parameter
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
      if (!coState) {
        console.warn(`No coState for point ${point}`);
        return;
      }
      const currentControl = pointIndex % 2 === 0 ? switchingTimes.u0 : switchingTimes.u1;

      // Calculate time difference
      const pointTime = moment(switchingPoint.time);
      const hoursFromStart = pointTime.diff(departure, 'hours', true);

      // Find corresponding state - use totalDuration not flightDuration
      const totalDuration = arrival.diff(departure, 'hours', true);
      const stateIndex = Math.min(
        Math.floor((hoursFromStart / totalDuration) * stateTrajectory.length),
        stateTrajectory.length - 1
      );
      const state = stateTrajectory[stateIndex];
      if (!state) {
        console.warn(`No state for point ${point} at index ${stateIndex}`);
        return;
      }

      // Calculate derivatives
      const dI_du = currentControl === 0
        ? (MODEL_CONSTANTS.I1 - MODEL_CONSTANTS.I0)
        : (MODEL_CONSTANTS.I0 - MODEL_CONSTANTS.I1);

      // Before calculating denominator
      console.log(`coState.lambda2: ${coState.lambda2}, dI_du: ${dI_du}, state.n: ${state.n}, ALPHA: ${MODEL_CONSTANTS.ALPHA}`);

      const df2_du = 60 * MODEL_CONSTANTS.ALPHA * dI_du * (1 - state.n);
      const lambdaT_df_du = coState.lambda2 * df2_du;

      console.log(`df2_du: ${df2_du}, lambdaT_df_du: ${lambdaT_df_du}`);

      if (isFinite(lambdaT_df_du)) {
        lambdaTdfDuValues.push(Math.abs((1 / PERTURBATION_CONSTANTS.DELTA_U) * lambdaT_df_du));
      }
    });

    // Calculate global OU value
    const maxDenominator = lambdaTdfDuValues.length > 0
      ? Math.max(...lambdaTdfDuValues, PERTURBATION_CONSTANTS.EPSILON)
      : PERTURBATION_CONSTANTS.EPSILON;
    const ou = isFinite(maxDenominator) && maxDenominator !== 0
      ? TS / maxDenominator
      : 0;

;    console.log('OU value:', ou, 'maxDenominator:', maxDenominator);

    // Second pass: calculate perturbations
    Object.keys(coStateAtSwitchingPoints).forEach(point => {
      if (point === 'tf') return;

      const pointIndex = parseInt(point.replace('t', '')) - 1;
      if (pointIndex < 0 || pointIndex >= switchingTimes.switchingPoints.length) return;

      const switchingPoint = switchingTimes.switchingPoints[pointIndex];
      const coState = coStateAtSwitchingPoints[point];
      if (!coState) return;
      const currentControl = pointIndex % 2 === 0 ? switchingTimes.u0 : switchingTimes.u1;

      // Calculate time difference
      const pointTime = moment(switchingPoint.time);
      const hoursFromStart = pointTime.diff(departure, 'hours', true);

      // Find corresponding state - use totalDuration not flightDuration
      const totalDuration = arrival.diff(departure, 'hours', true);
      const stateIndex = Math.min(
        Math.floor((hoursFromStart / totalDuration) * stateTrajectory.length),
        stateTrajectory.length - 1
      );
      const state = stateTrajectory[stateIndex];
      if (!state) return;

      // Calculate derivatives
      const dI_du = currentControl === 0
        ? (MODEL_CONSTANTS.I1 - MODEL_CONSTANTS.I0)
        : (MODEL_CONSTANTS.I0 - MODEL_CONSTANTS.I1);

      if (
        typeof coState.lambda2 !== 'number' ||
        typeof dI_du !== 'number' ||
        typeof state.n !== 'number' ||
        typeof MODEL_CONSTANTS.ALPHA !== 'number'
      ) {
        console.warn(`Invalid input for perturbation at point ${point}:`, {
          lambda2: coState.lambda2,
          dI_du,
          n: state.n,
          ALPHA: MODEL_CONSTANTS.ALPHA
        });
        return;
      }

      const df2_du = 60 * MODEL_CONSTANTS.ALPHA * dI_du * (1 - state.n);
      const lambdaT_df_du = coState.lambda2 * df2_du;

      if (!isFinite(lambdaT_df_du)) {
        console.warn(`lambdaT_df_du is not finite at point ${point}:`, lambdaT_df_du);
        return;
      }

      // Calculate time adjustment
      const numerator = -ou;
      const denominator = Math.max(
        PERTURBATION_CONSTANTS.DELTA_U * lambdaT_df_du,
        1e-3 // Prevents division by very small numbers
      );

      // Use the passed-in maxTimeAdjustment instead of hardcoded 2
      let dtj = (isFinite(numerator) && isFinite(denominator) && denominator !== 0)
        ? Math.max(-maxTimeAdjustment, Math.min(maxTimeAdjustment, -numerator / denominator))
        : 0;

      perturbations.push({
        point,
        optimalPerturbation: ou,
        timeAdjustment: dtj
      });
    });

    return perturbations;
  };
  
  export const calculateCost = (trajectory: StateTrajectory): number => {
    if (trajectory.length === 0) return 0;
    
    let cost = 0;
    const TARGET_N = 0.7; // Match your terminal condition!
    trajectory.forEach(state => {
      const xDiff = Math.pow(state.x - 0, 2);
      const nDiff = Math.pow(state.n - TARGET_N, 2);
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

    // Log switching points before update
    console.log('Switching points before:', switchingTimes.switchingPoints.map(t => t.time));
    console.log('Perturbations:', perturbations);

    // Only remove switching point if cost increase is significant (not just numerical noise)
    const COST_TOLERANCE = 0.1; // Relative tolerance: 0.1% of previous cost
    const costIncrease = currentCost - previousCost;
    const relativeIncrease = Math.abs(costIncrease / previousCost);
    const isSignificantIncrease = costHistory.length > 1 && costIncrease > 0 && relativeIncrease > COST_TOLERANCE / 100;

    if (isSignificantIncrease) {
      console.log(`⚠️ SIGNIFICANT COST INCREASE (${(relativeIncrease * 100).toFixed(4)}%) - Removing switching point with largest perturbation`);
      const maxDtIndex = perturbations.reduce(
        (maxIndex, pert, index) =>
          Math.abs(pert.timeAdjustment) > Math.abs(perturbations[maxIndex].timeAdjustment)
            ? index
            : maxIndex,
        0
      );
      console.log(`Removing switching point at index ${maxDtIndex} (dt = ${perturbations[maxDtIndex].timeAdjustment})`);

      filteredTimes = filteredTimes.filter((_, i) => i !== maxDtIndex);
    } else {
      // If cost is increasing consistently, try reversing the perturbation direction
      const shouldReverse = costHistory.length > 2 && costIncrease > 0;

      perturbations.forEach(pert => {
        const pointIndex = parseInt(pert.point.replace('t', '')) - 1;
        if (pointIndex >= 0 && pointIndex < filteredTimes.length) {
          // Reverse perturbation if cost is increasing
          const adjustment = shouldReverse ? -pert.timeAdjustment : pert.timeAdjustment;
          const newTime = filteredTimes[pointIndex].clone().add(adjustment, 'hours');
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

    // Log switching points after update
    console.log('Switching points after:', filteredTimes.map(t => t.format('YYYY-MM-DD HH:mm')));

    const timeDiffs = switchingTimes.switchingPoints
      .slice(0, filteredTimes.length)
      .map((t, i) => Math.abs(moment(t.time).diff(filteredTimes[i], 'hours', true)));

    // Log time differences and tolerance
    console.log('Time diffs:', timeDiffs);
    console.log('TIME_TOLERANCE:', PERTURBATION_CONSTANTS.TIME_TOLERANCE);

    const isComplete =
      Math.max(...timeDiffs) < PERTURBATION_CONSTANTS.TIME_TOLERANCE ||
      filteredTimes.length === 0;

    // Log convergence decision
    console.log('isComplete:', isComplete);

    return {
      newSwitchingPoints: filteredTimes.map(t => t.format('YYYY-MM-DD HH:mm')),
      newIterationCount: costHistory.length,
      isComplete,
      newActiveCount: filteredTimes.length
    };
  };

  function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
  }