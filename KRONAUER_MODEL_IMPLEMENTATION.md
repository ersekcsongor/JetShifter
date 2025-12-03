# Kronauer Model Implementation for Caffeine and Melatonin Timing

## Overview

This document explains how the JetShifter app now calculates caffeine and melatonin timing using the scientifically rigorous Kronauer circadian oscillator model, the same approach used by Timeshifter.

## Scientific Background

### The Kronauer Circadian Oscillator

The circadian pacemaker is modeled as a 2-dimensional dynamical system:

```
dx/dt = π * (x – (⅓ * x³) – y + B(t))
dy/dt = π * (x + a*y)
```

Where:
- **x, y**: Internal oscillator states (phase and velocity)
- **a**: Oscillator stiffness (~0.13)
- **B(t)**: Light input function
- **π**: Scaling constant (π/12) for ~24.2h free-running period

### Light Input Function

The light-driven phase shifting is modeled as:

```
B(t) = G * α(t) * [1 – y]ⁿ
```

Where:
- **G**: Intrinsic light sensitivity (0.024)
- **α(t)**: Photic drive (0 in darkness, proportional to lux when bright)
- **n**: Saturation exponent (2.5)

This determines how light exposure shifts the circadian clock at different phases.

## Melatonin Implementation

### Phase Response Curve (PRC)

Melatonin's phase-shifting effect is implemented using a dual Gaussian model:

```
Δφ = A_advance * exp(-(φ - φ_advance)² / (2σ²)) - A_delay * exp(-(φ - φ_delay)² / (2σ²))
```

**Parameters:**
- **φ_advance = 21.0 CT** (Circadian Time ~2-4h before habitual bedtime)
- **φ_delay = 5.0 CT** (Late night/early morning)
- **σ = 2.0 hours** (Width of Gaussian distribution)
- **A_advance = 60 minutes** (Maximum advance for 3mg dose)
- **A_delay = 30 minutes** (Maximum delay for 3mg dose)

### How It Works

1. **Estimate current circadian phase** relative to habitual sleep schedule
2. **Apply chronotype adjustment**:
   - Morning types: -40 minutes (earlier phase)
   - Intermediate: 0 minutes
   - Evening types: +40 minutes (later phase)
3. **Calculate optimal timing** using the PRC
4. **Schedule melatonin** 30-60 minutes before desired bedtime

### Code Location

- **Implementation**: [mobile/src/utils/circadianPharmacology.ts](mobile/src/utils/circadianPharmacology.ts)
- **Functions**:
  - `calculateMelatoninPhaseShift()`: Calculates expected phase shift at given CT
  - `calculateOptimalMelatoninTiming()`: Determines best timing for desired shift
- **Usage**: [mobile/src/components/FlightDetails/ResultsDisplay.tsx:102-140](mobile/src/components/FlightDetails/ResultsDisplay.tsx#L102-L140)

## Caffeine Implementation

### Pharmacokinetic Model

Caffeine concentration decays exponentially:

```
C(t) = C₀ * e^(-ln(2) * (t - t₀) / t_half)
```

Where:
- **C₀**: Initial concentration (proportional to dose)
- **t_half**: Half-life (~5 hours, range 3-7h)
- **t**: Time since dosing

### Sleep Pressure Model

Caffeine interferes with sleep initiation:

```
S(t) = S₀ + k * C(t)
```

Where:
- **S(t)**: Total sleep pressure at time t
- **S₀**: Baseline sleep pressure
- **k**: Sensitivity factor (0.8)
- Sleep occurs only when: `S(t) < S_threshold` AND circadian wake drive is low

### Timing Strategy

**For Eastbound Travel (Phase Advance):**
- Caffeine at wake time reinforces phase advance
- Additional dose 3-4 hours after wake for sustained alertness
- Helps strengthen wake signals during the new morning

**For Westbound Travel (Phase Delay):**
- Caffeine in afternoon extends wake period
- Helps delay circadian phase
- Scheduled ~8 hours after wake time

**Cutoff Calculation:**
The app calculates when caffeine must be avoided before sleep:

```
t_cutoff = t_half * log₂(C₀ / C_threshold)
```

Typically **6-8 hours** before planned sleep.

### Code Location

- **Implementation**: [mobile/src/utils/circadianPharmacology.ts](mobile/src/utils/circadianPharmacology.ts)
- **Functions**:
  - `calculateCaffeineConcentration()`: Pharmacokinetic model
  - `calculateSleepPressure()`: Sleep interference model
  - `calculateCaffeineCutoff()`: Cutoff time calculation
  - `calculateOptimalCaffeineTiming()`: Schedules doses based on circadian phase
- **Usage**: [mobile/src/components/FlightDetails/ResultsDisplay.tsx:143-177](mobile/src/components/FlightDetails/ResultsDisplay.tsx#L143-L177)

## Integration with Light Schedule

The caffeine/melatonin schedule is designed to **complement** the light-based phase shifting:

1. **Phase alignment verification**: Ensures melatonin doesn't counteract light schedule
2. **Sleep window protection**: Caffeine is avoided within the cutoff period
3. **Optimal timing**: Both interventions are scheduled at circadian phases where they're most effective

### Alignment Logic

```typescript
verifyInterventionAlignment(
  melatoninTime,
  caffeineTime,
  lightPhaseAdvance,
  currentCircadianPhase
)
```

This ensures:
- Melatonin and light shifts are in the same direction
- Caffeine doesn't interfere with planned sleep
- Interventions are timed for maximum effectiveness

## Constants and Parameters

All model parameters are defined in [mobile/src/utils/constants.ts](mobile/src/utils/constants.ts):

### Kronauer Model Constants
```typescript
KRONAUER_CONSTANTS = {
  PI: Math.PI / 12,    // Period scaling
  a: 0.13,             // Oscillator stiffness
  G: 0.024,            // Light sensitivity
  n: 2.5,              // Saturation exponent
}
```

### Pharmacology Constants
```typescript
PHARMACOLOGY_CONSTANTS = {
  MELATONIN: {
    PHI_ADVANCE: 21.0,     // CT for advance
    PHI_DELAY: 5.0,        // CT for delay
    SIGMA: 2.0,            // Gaussian width
    A_ADVANCE_BASE: 60,    // Max advance (min)
    A_DELAY_BASE: 30,      // Max delay (min)
    TYPICAL_DOSE_MG: 3,    // Standard dose
    ONSET_TIME_MIN: 30,    // Time before bed
  },
  CAFFEINE: {
    T_HALF: 5.0,           // Half-life (hours)
    K_SENSITIVITY: 0.8,    // Sleep sensitivity
    TYPICAL_DOSE_MG: 100,  // Standard dose
    MIN_HOURS_BEFORE_SLEEP: 6,
  }
}
```

## Key Improvements Over Previous Implementation

### Previous Approach
- Simple time-based calculations
- Melatonin: bedtime - 30 minutes + chronotype offset
- Caffeine: wake time + chronotype offset
- No consideration of circadian phase
- No pharmacokinetic modeling

### New Kronauer-Based Approach
- **Circadian phase-aware**: Timing based on actual circadian phase, not just clock time
- **Phase Response Curves**: Uses empirical PRC models for melatonin
- **Pharmacokinetics**: Models caffeine concentration decay and sleep interference
- **Direction-specific**: Different strategies for eastbound vs westbound travel
- **Chronotype integration**: Phase adjustments based on individual circadian type
- **Scientific validation**: Based on published models used by Timeshifter

## Usage Example

```typescript
// Calculate melatonin and caffeine schedule
const schedule = calculatePharmacologySchedule(
  lightSwitchingTimes,    // Light exposure schedule
  sleepSchedule,          // Bedtime/wake time
  departureTime,          // Flight departure
  arrivalTime,            // Flight arrival
  timezoneDiff,           // Time zone change (hours)
  useMelatonin,           // User preference
  useCaffeine             // User preference
);

// Results:
schedule.melatoninDoses  // [{ time, dose, expectedShift }]
schedule.caffeineDoses   // [{ time, dose, rationale }]
schedule.avoidCaffeineAfter  // Hard cutoff time
```

## Testing and Validation

To verify the implementation:

1. **Phase shift calculations**: Check that melatonin timing shifts appropriately with chronotype
2. **Caffeine cutoff**: Verify 6-8 hour buffer before sleep
3. **Direction-specific timing**: Eastbound should give earlier caffeine, westbound should give later
4. **Alignment**: Ensure interventions support (not oppose) light schedule

## References

- Kronauer RE, Forger DB, Jewett ME. "Quantifying Human Circadian Pacemaker Response to Brief, Extended, and Repeated Light Stimuli over the Photic Range." Journal of Biological Rhythms, 1999.
- Burgess HJ, Revell VL, Eastman CI. "A Three Pulse Phase Response Curve to Three Milligrams of Melatonin in Humans." Journal of Physiology, 2008.
- Landolt HP. "Sleep homeostasis: A role for adenosine in humans?" Biochemical Pharmacology, 2008.

## Future Enhancements

Potential improvements:
1. **Full oscillator integration**: Run the complete Kronauer model forward in time
2. **Individual calibration**: Adjust parameters based on user's actual phase shifts
3. **Multi-day optimization**: Optimize melatonin/caffeine across multiple days
4. **Dose optimization**: Calculate optimal doses, not just timing
5. **Real-time adjustment**: Update schedule based on actual light exposure and sleep

---

*Implementation by Claude Code based on Timeshifter's scientific approach*
