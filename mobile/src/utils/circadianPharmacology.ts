// utils/circadianPharmacology.ts
// Implementation of Kronauer model-based caffeine and melatonin timing calculations
// Based on the scientific backbone used by Timeshifter

import moment, { Moment } from 'moment';
import { KRONAUER_CONSTANTS, PHARMACOLOGY_CONSTANTS } from './constants';

/**
 * Represents the circadian oscillator state
 */
export interface CircadianOscillatorState {
  x: number;  // Phase component
  y: number;  // Velocity component
  t: number;  // Time in hours
}

/**
 * Light input function B(t) from Kronauer model
 * B(t) = G * α(t) * [1 – y]ⁿ
 */
export function calculateLightInput(
  alpha: number,  // Photic drive (0 in darkness, proportional to lux when bright)
  y: number,      // Oscillator y-component
  G: number = KRONAUER_CONSTANTS.G,
  n: number = KRONAUER_CONSTANTS.n
): number {
  return G * alpha * Math.pow(Math.max(0, 1 - y), n);
}

/**
 * Kronauer circadian oscillator differential equations:
 * dx/dt = π * (x – (⅓ * x³) – y + B(t))
 * dy/dt = π * (x + a*y)
 */
export function kronauerDerivatives(
  state: CircadianOscillatorState,
  B: number,
  a: number = KRONAUER_CONSTANTS.a,
  pi: number = KRONAUER_CONSTANTS.PI
): { dx_dt: number; dy_dt: number } {
  const { x, y } = state;

  const dx_dt = pi * (x - (x * x * x / 3) - y + B);
  const dy_dt = pi * (x + a * y);

  return { dx_dt, dy_dt };
}

/**
 * Integrate the Kronauer oscillator using RK4 method
 */
export function integrateKronauerOscillator(
  initialState: CircadianOscillatorState,
  alphaSequence: number[],  // Time series of photic drive
  dt: number = 0.1  // Time step in hours
): CircadianOscillatorState[] {
  const trajectory: CircadianOscillatorState[] = [initialState];
  let current = { ...initialState };

  for (let i = 0; i < alphaSequence.length; i++) {
    const B = calculateLightInput(alphaSequence[i], current.y);

    // RK4 integration
    const k1 = kronauerDerivatives(current, B);

    const mid1 = {
      x: current.x + 0.5 * dt * k1.dx_dt,
      y: current.y + 0.5 * dt * k1.dy_dt,
      t: current.t + 0.5 * dt
    };
    const k2 = kronauerDerivatives(mid1, B);

    const mid2 = {
      x: current.x + 0.5 * dt * k2.dx_dt,
      y: current.y + 0.5 * dt * k2.dy_dt,
      t: current.t + 0.5 * dt
    };
    const k3 = kronauerDerivatives(mid2, B);

    const end = {
      x: current.x + dt * k3.dx_dt,
      y: current.y + dt * k3.dy_dt,
      t: current.t + dt
    };
    const k4 = kronauerDerivatives(end, B);

    current = {
      x: current.x + (dt / 6) * (k1.dx_dt + 2 * k2.dx_dt + 2 * k3.dx_dt + k4.dx_dt),
      y: current.y + (dt / 6) * (k1.dy_dt + 2 * k2.dy_dt + 2 * k3.dy_dt + k4.dy_dt),
      t: current.t + dt
    };

    trajectory.push({ ...current });
  }

  return trajectory;
}

/**
 * Convert circadian oscillator state to circadian phase φ (in hours, 0-24)
 * Phase is calculated as the angle in the x-y plane
 */
export function calculateCircadianPhase(x: number, y: number): number {
  // Convert to angle in radians, then to hours (0-24)
  let phase = Math.atan2(y, x);

  // Convert from radians (-π to π) to hours (0-24)
  phase = (phase / (2 * Math.PI)) * 24;

  // Normalize to 0-24 range
  if (phase < 0) phase += 24;

  return phase;
}

/**
 * Melatonin Phase Response Curve (PRC) using dual Gaussian model
 * Δφ = A_advance * exp(-(φ - φ_advance)² / (2σ²)) - A_delay * exp(-(φ - φ_delay)² / (2σ²))
 *
 * Returns phase shift in minutes (positive = advance, negative = delay)
 */
export function calculateMelatoninPhaseShift(
  circadianPhase: number,  // Current circadian phase in hours (0-24)
  doseMg: number = 3  // Melatonin dose in mg
): number {
  const {
    PHI_ADVANCE,
    PHI_DELAY,
    SIGMA,
    A_ADVANCE_BASE,
    A_DELAY_BASE
  } = PHARMACOLOGY_CONSTANTS.MELATONIN;

  // Dose scaling factor (3mg is typical dose)
  const doseScaling = Math.min(doseMg / 3, 2);  // Cap at 2x for high doses

  const A_advance = A_ADVANCE_BASE * doseScaling;
  const A_delay = A_DELAY_BASE * doseScaling;

  // Advance component (peaks around CT 20-22, which is ~2-4h before habitual bedtime)
  const advanceShift = A_advance * Math.exp(
    -Math.pow(circadianPhase - PHI_ADVANCE, 2) / (2 * SIGMA * SIGMA)
  );

  // Delay component (peaks around CT 4-6, which is late night/early morning)
  const delayShift = A_delay * Math.exp(
    -Math.pow(circadianPhase - PHI_DELAY, 2) / (2 * SIGMA * SIGMA)
  );

  // Net phase shift in minutes
  return advanceShift - delayShift;
}

/**
 * Calculate optimal melatonin timing for desired phase shift
 * Returns the circadian time (CT) when melatonin should be taken
 */
export function calculateOptimalMelatoninTiming(
  targetPhaseShift: number,  // Desired shift in minutes (positive = advance)
  currentCircadianPhase: number,  // Current CT in hours
  isAdvancing: boolean  // True if shifting eastward (advance), false if westward (delay)
): {
  optimalCT: number;  // Optimal circadian time for dosing (hours, 0-24)
  expectedShift: number;  // Expected phase shift at this time (minutes)
  clockTime: number;  // Clock time relative to current CT (hours offset)
} {
  const { PHI_ADVANCE, PHI_DELAY } = PHARMACOLOGY_CONSTANTS.MELATONIN;

  // Choose target CT based on direction
  const targetCT = isAdvancing ? PHI_ADVANCE : PHI_DELAY;

  // Calculate expected shift at target CT
  const expectedShift = calculateMelatoninPhaseShift(targetCT);

  // Calculate clock time offset from current circadian phase
  let clockTimeOffset = targetCT - currentCircadianPhase;
  if (clockTimeOffset < -12) clockTimeOffset += 24;
  if (clockTimeOffset > 12) clockTimeOffset -= 24;

  return {
    optimalCT: targetCT,
    expectedShift,
    clockTime: clockTimeOffset
  };
}

/**
 * Caffeine pharmacokinetic model
 * C(t) = C₀ * e^(-ln(2) * (t - t₀) / t_half)
 *
 * Returns caffeine concentration at time t
 */
export function calculateCaffeineConcentration(
  C0: number,  // Initial concentration (proportional to dose)
  t: number,   // Time since dosing in hours
  halfLife: number = PHARMACOLOGY_CONSTANTS.CAFFEINE.T_HALF
): number {
  if (t < 0) return 0;
  return C0 * Math.exp(-Math.LN2 * t / halfLife);
}

/**
 * Sleep pressure model with caffeine interference
 * S(t) = S₀ + k * C(t)
 *
 * Sleep can only occur if: S(t) < S_threshold AND circadian_wake_drive is low
 */
export function calculateSleepPressure(
  baselinePressure: number,  // S₀ - baseline sleep pressure
  caffeineConcentration: number,  // C(t) - current caffeine level
  sensitivity: number = PHARMACOLOGY_CONSTANTS.CAFFEINE.K_SENSITIVITY
): number {
  return baselinePressure + sensitivity * caffeineConcentration;
}

/**
 * Calculate caffeine cutoff time before sleep
 * Returns hours before sleep when caffeine should be avoided
 */
export function calculateCaffeineCutoff(
  doseStrength: number,  // Caffeine dose in mg (typical: 100mg)
  sleepThreshold: number = PHARMACOLOGY_CONSTANTS.CAFFEINE.SLEEP_THRESHOLD,
  halfLife: number = PHARMACOLOGY_CONSTANTS.CAFFEINE.T_HALF,
  sensitivity: number = PHARMACOLOGY_CONSTANTS.CAFFEINE.K_SENSITIVITY
): number {
  // Calculate how long it takes for caffeine to decay below threshold
  // Threshold concentration that still interferes with sleep
  const C_threshold = sleepThreshold / sensitivity;

  // Initial concentration proportional to dose (normalized to 100mg)
  const C0 = doseStrength / 100;

  // Time to decay to threshold: t = t_half * log₂(C₀ / C_threshold)
  const cutoffHours = halfLife * Math.log2(C0 / C_threshold);

  return Math.max(0, cutoffHours);
}

/**
 * Calculate optimal caffeine timing based on circadian phase and sleep schedule
 */
export function calculateOptimalCaffeineTiming(
  circadianPhase: number,  // Current circadian phase (0-24 hours)
  sleepWindowStart: Moment,  // When sleep is planned
  sleepWindowEnd: Moment,  // When wake is planned
  currentTime: Moment,
  isAdvancing: boolean  // True if shifting eastward (need to stay awake later)
): {
  recommendedTimes: Moment[];  // Optimal times for caffeine
  avoidAfter: Moment;  // Hard cutoff time
  rationale: string;
} {
  const cutoffHours = calculateCaffeineCutoff(100);  // Standard 100mg dose

  // Don't consume caffeine within cutoff window of sleep
  const avoidAfter = sleepWindowStart.clone().subtract(cutoffHours, 'hours');

  const recommendedTimes: Moment[] = [];

  // Morning caffeine: Time with circadian low point (wake time or shortly after)
  // This helps phase advance by reinforcing wake signals
  if (isAdvancing) {
    // For eastward travel, caffeine at wake time helps advance the clock
    const morningCaffeine = sleepWindowEnd.clone();
    if (morningCaffeine.isAfter(currentTime)) {
      recommendedTimes.push(morningCaffeine);
    }

    // Additional dose 3-4 hours after wake for sustained alertness
    const midMorningCaffeine = sleepWindowEnd.clone().add(3.5, 'hours');
    if (midMorningCaffeine.isAfter(currentTime) && midMorningCaffeine.isBefore(avoidAfter)) {
      recommendedTimes.push(midMorningCaffeine);
    }
  } else {
    // For westward travel, caffeine helps delay the clock
    // Use later in the day to extend wake period
    const afternoonCaffeine = sleepWindowEnd.clone().add(8, 'hours');
    if (afternoonCaffeine.isAfter(currentTime) && afternoonCaffeine.isBefore(avoidAfter)) {
      recommendedTimes.push(afternoonCaffeine);
    }
  }

  const rationale = isAdvancing
    ? "Caffeine at wake time reinforces phase advance by strengthening wake signals during the new morning"
    : "Caffeine in afternoon extends wake period to delay circadian phase";

  return {
    recommendedTimes,
    avoidAfter,
    rationale
  };
}

/**
 * Verify that caffeine/melatonin doses don't counteract light-based phase shifts
 * Returns true if the intervention is aligned with the light schedule
 */
export function verifyInterventionAlignment(
  melatoninTime: Moment | null,
  caffeineTime: Moment | null,
  lightPhaseAdvance: number,  // Expected phase shift from light (minutes)
  currentCircadianPhase: number  // Current CT in hours
): {
  melatoninAligned: boolean;
  caffeineAligned: boolean;
  conflicts: string[];
} {
  const conflicts: string[] = [];
  let melatoninAligned = true;
  let caffeineAligned = true;

  if (melatoninTime) {
    const melatoninShift = calculateMelatoninPhaseShift(currentCircadianPhase);

    // Check if melatonin and light have opposite effects
    if (Math.sign(melatoninShift) !== Math.sign(lightPhaseAdvance)) {
      melatoninAligned = false;
      conflicts.push(
        `Melatonin timing conflicts with light schedule: ` +
        `melatonin would shift ${melatoninShift.toFixed(0)}min, ` +
        `light would shift ${lightPhaseAdvance.toFixed(0)}min`
      );
    }
  }

  // Caffeine alignment is primarily about not interfering with planned sleep
  // (checked separately in timing calculations)

  return {
    melatoninAligned,
    caffeineAligned,
    conflicts
  };
}

/**
 * Main integration function: Calculate melatonin and caffeine schedule
 * based on Kronauer oscillator state and light schedule
 */
export function calculatePharmacologySchedule(
  lightSwitchingTimes: { time: Moment; type: 'light' | 'dark' }[],
  sleepSchedule: { bedtime: Moment; wakeTime: Moment },
  departureTime: Moment,
  arrivalTime: Moment,
  timezoneDiff: number,  // Hours
  useMelatonin: boolean,
  useCaffeine: boolean
): {
  melatoninDoses: { time: Moment; dose: number; expectedShift: number }[];
  caffeineDoses: { time: Moment; dose: number; rationale: string }[];
  avoidCaffeineAfter: Moment;
} {
  const isAdvancing = timezoneDiff > 0;  // Eastward travel

  // Estimate initial circadian phase from departure time and typical sleep schedule
  const departureHour = departureTime.hour() + departureTime.minute() / 60;
  const wakeHour = sleepSchedule.wakeTime.hour() + sleepSchedule.wakeTime.minute() / 60;

  // CT 0 is approximately at wake time
  let currentCircadianPhase = (departureHour - wakeHour + 24) % 24;

  const melatoninDoses: { time: Moment; dose: number; expectedShift: number }[] = [];
  const caffeineDoses: { time: Moment; dose: number; rationale: string }[] = [];

  // Calculate melatonin timing if enabled
  if (useMelatonin) {
    const targetPhaseShift = Math.abs(timezoneDiff) * 60;  // Convert hours to minutes

    const melatoninTiming = calculateOptimalMelatoninTiming(
      targetPhaseShift,
      currentCircadianPhase,
      isAdvancing
    );

    // Schedule melatonin 30-60 minutes before desired bedtime in destination timezone
    const melatoninTime = sleepSchedule.bedtime.clone().subtract(45, 'minutes');

    melatoninDoses.push({
      time: melatoninTime,
      dose: 3,  // Standard 3mg dose
      expectedShift: melatoninTiming.expectedShift
    });
  }

  // Calculate caffeine timing if enabled
  let avoidCaffeineAfter = sleepSchedule.bedtime.clone().subtract(
    calculateCaffeineCutoff(100),
    'hours'
  );

  if (useCaffeine) {
    const caffeineTiming = calculateOptimalCaffeineTiming(
      currentCircadianPhase,
      sleepSchedule.bedtime,
      sleepSchedule.wakeTime,
      arrivalTime,
      isAdvancing
    );

    caffeineTiming.recommendedTimes.forEach(time => {
      caffeineDoses.push({
        time,
        dose: 100,  // Standard 100mg dose (one cup of coffee)
        rationale: caffeineTiming.rationale
      });
    });

    avoidCaffeineAfter = caffeineTiming.avoidAfter;
  }

  return {
    melatoninDoses,
    caffeineDoses,
    avoidCaffeineAfter
  };
}
