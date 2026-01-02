// utils/constants.ts

// Original model constants for existing circadian dynamics
export const MODEL_CONSTANTS = {
    PI_12: Math.PI / 12,
    ALPHA: 0.05,
    BETA: 0.01,
    B: 0.4,
    I0: 1,      // Try 1 instead of 1000
    I1: 10      // Try 10 instead of 10000
  };

  export const PERTURBATION_CONSTANTS = {
    TS: 0.5, // Try 1e7
    DELTA_U: 1,
    EPSILON: 1e-6,
    MAX_ITERATIONS: 20,
    COST_TOLERANCE: 1e-4,
    TIME_TOLERANCE: 0.1
  };

// Kronauer model constants (Timeshifter-style implementation)
// Based on the Kronauer-Jewett circadian oscillator model
export const KRONAUER_CONSTANTS = {
  // Core oscillator parameters
  PI: Math.PI / 12,  // Scaling constant for ~24.2h free-running period
  a: 0.13,  // Oscillator stiffness parameter (typical value: 0.1-0.13)

  // Light input parameters for B(t) = G * α(t) * [1 – y]ⁿ
  G: 0.024,  // Intrinsic light sensitivity (calibrated for phase shifts)
  n: 2.5,    // Saturation exponent (typically 2-3)

  // Circadian time references
  CT_CBMIN: 5.0,  // CT of core body temperature minimum (hours)
  CT_MELATONIN_ONSET: 21.0,  // CT of dim light melatonin onset (hours)
};

// Pharmacology constants for melatonin and caffeine
export const PHARMACOLOGY_CONSTANTS = {
  // Melatonin Phase Response Curve (PRC) parameters
  MELATONIN: {
    // Dual Gaussian model for PRC
    // Δφ = A_advance * exp(-(φ - φ_advance)² / (2σ²)) - A_delay * exp(-(φ - φ_delay)² / (2σ²))
    PHI_ADVANCE: 21.0,  // CT for maximum advance (hours) ~2-4h before habitual bedtime
    PHI_DELAY: 5.0,     // CT for maximum delay (hours) ~late night/early morning
    SIGMA: 2.0,         // Width of Gaussian (hours)
    A_ADVANCE_BASE: 60, // Amplitude of advance phase shift (minutes) for 3mg dose
    A_DELAY_BASE: 30,   // Amplitude of delay phase shift (minutes) for 3mg dose

    // Dosing parameters
    TYPICAL_DOSE_MG: 3,     // Typical effective dose (mg)
    MIN_DOSE_MG: 0.5,       // Minimum effective dose (mg)
    MAX_DOSE_MG: 10,        // Maximum recommended dose (mg)
    ONSET_TIME_MIN: 30,     // Time before bed to take (minutes)

    // Phase shift effectiveness
    MAX_SHIFT_PER_DAY: 90,  // Maximum practical phase shift per day (minutes)
  },

  // Caffeine pharmacokinetic and pharmacodynamic parameters
  CAFFEINE: {
    // Pharmacokinetics: C(t) = C₀ * e^(-ln(2) * (t - t₀) / t_half)
    T_HALF: 5.0,  // Half-life in hours (range: 3-7h, average ~5h)

    // Pharmacodynamics: S(t) = S₀ + k * C(t)
    K_SENSITIVITY: 0.8,  // Sensitivity factor for sleep pressure increase
    SLEEP_THRESHOLD: 35.0,  // Threshold above which sleep is impaired (in mg equivalents)

    // Dosing parameters
    TYPICAL_DOSE_MG: 100,  // Typical dose per cup of coffee (mg)
    MIN_EFFECTIVE_MG: 40,  // Minimum effective dose (mg)
    MAX_SAFE_DAILY_MG: 400,  // Maximum safe daily intake (mg)

    // Timing constraints
    MIN_HOURS_BEFORE_SLEEP: 6,  // Minimum hours before sleep (conservative)
    RECOMMENDED_HOURS_BEFORE_SLEEP: 8,  // Recommended hours before sleep

    // Phase-dependent effectiveness
    // Caffeine is most effective at counteracting circadian low points
    OPTIMAL_CT_RANGE_START: 0,  // Start of optimal CT window (wake time)
    OPTIMAL_CT_RANGE_END: 12,   // End of optimal CT window (midday)
  },

  // Combined intervention parameters
  INTERVENTION: {
    // Safety margins
    MIN_INTERVAL_HOURS: 0.5,  // Minimum time between interventions (hours)

    // Alignment thresholds
    CONFLICT_THRESHOLD_MIN: 30,  // If interventions oppose by >30min, flag conflict

    // Effectiveness modifiers based on chronotype
    CHRONOTYPE_PHASE_SHIFT: {
      MORNING: -40,      // Morning types: 40 min earlier circadian phase
      INTERMEDIATE: 0,   // Intermediate: baseline
      EVENING: 40,       // Evening types: 40 min later circadian phase
    },
  },
};

  const ENV = {
  API_BASE_URL: 'https://jetshifter-api.onrender.com',  // LOCAL DEV - Use http:// not https://
  // API_BASE_URL: 'https://jetshifter-api.onrender.com',  // PRODUCTION
  // 'http://192.168.1.2:3000',  // LOCAL DEV - Use http:// not https://
};

export default ENV;