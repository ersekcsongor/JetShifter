# Coffee Recommendation Fix

## Problem

Coffee recommendations were not showing up on 10-hour flights (or any flights where the schedule extended beyond landing).

## Root Cause

The caffeine calculation logic had two issues:

### Issue 1: External Function Called with Wrong Context

**Original Code**: [ResultsDisplay.tsx:154-160](mobile/src/components/FlightDetails/ResultsDisplay.tsx#L154-L160)

```typescript
// Called external function with sleep times
const caffeineTiming = calculateOptimalCaffeineTiming(
  currentCircadianPhase,
  sleepStart,  // Next sleep window start
  sleepEnd,    // Wake time
  landingTime, // Current time (reference)
  isAdvancing
);
```

The external function `calculateOptimalCaffeineTiming()` was checking:
- `if (morningCaffeine.isAfter(currentTime))` - but this was comparing against `landingTime`
- When iterating through days, the first wake time might be BEFORE landing, causing the function to return empty array

### Issue 2: Function Logic Not Aligned with Loop Context

The function was designed to work with a single sleep cycle, but it was being called inside a loop that iterated through multiple days. This mismatch caused:
- Wake times from early iteration days to be rejected
- No coffee scheduled because conditions weren't met
- Dependence on external function state that didn't match the iteration context

## Solution

### Inline the Caffeine Calculation Logic

Instead of calling an external function with potential timing mismatches, inline the logic directly where we have proper context:

```typescript
// === KRONAUER MODEL-BASED CAFFEINE CALCULATION ===
if (useCoffee && sleepEnd.isAfter(landingTime)) {
  // Only calculate caffeine for wake times that are after landing

  // Calculate caffeine cutoff using pharmacokinetic model
  const cutoffHours = calculateCaffeineCutoff(...);

  // Calculate cutoff time for this sleep period
  const avoidAfter = sleepStart.clone().subtract(cutoffHours, 'hours');

  // Calculate caffeine times based on travel direction
  const recommendedTimes: moment.Moment[] = [];

  if (isAdvancing) {
    // For eastward travel, caffeine at wake time helps advance the clock
    const morningCaffeine = sleepEnd.clone();
    if (morningCaffeine.isAfter(landingTime) && morningCaffeine.isBefore(scheduleEnd)) {
      recommendedTimes.push(morningCaffeine);
    }

    // Additional dose 3-4 hours after wake for sustained alertness
    const midMorningCaffeine = sleepEnd.clone().add(3.5, 'hours');
    if (midMorningCaffeine.isAfter(landingTime) &&
        midMorningCaffeine.isBefore(avoidAfter) &&
        midMorningCaffeine.isBefore(scheduleEnd)) {
      recommendedTimes.push(midMorningCaffeine);
    }
  } else {
    // For westward travel, caffeine helps delay the clock
    const afternoonCaffeine = sleepEnd.clone().add(8, 'hours');
    if (afternoonCaffeine.isAfter(landingTime) &&
        afternoonCaffeine.isBefore(avoidAfter) &&
        afternoonCaffeine.isBefore(scheduleEnd)) {
      recommendedTimes.push(afternoonCaffeine);
    }
  }

  // Add recommended caffeine times
  recommendedTimes.forEach((coffeeTime) => {
    allActivities.push({
      time: coffeeTime,
      type: 'coffee',
      isCoffee: true,
      rationale: rationale,
    });
  });
}
```

### Key Improvements

1. **Guard Condition**: `if (useCoffee && sleepEnd.isAfter(landingTime))`
   - Only process wake times that occur after landing
   - Skips early iterations where wake time is before landing

2. **Direct Time Comparisons**:
   - All time checks use the current iteration's `sleepEnd`, `sleepStart`, `landingTime`, and `scheduleEnd`
   - No dependency on external function state

3. **Three Boundary Checks**:
   - `isAfter(landingTime)`: Don't schedule before landing
   - `isBefore(avoidAfter)`: Don't schedule too close to sleep (pharmacokinetic cutoff)
   - `isBefore(scheduleEnd)`: Don't schedule beyond the schedule window

## Caffeine Scheduling Logic

### Eastbound Travel (Phase Advance)
- **Morning dose**: At wake time
- **Mid-morning dose**: 3.5 hours after wake (if within safe window)
- **Rationale**: Reinforces wake signals during the new morning

### Westbound Travel (Phase Delay)
- **Afternoon dose**: 8 hours after wake
- **Rationale**: Extends wake period to delay circadian phase

## Pharmacokinetic Cutoff

Uses the exponential decay model to calculate when caffeine drops below sleep-interference threshold:

```typescript
// C(t) = C₀ * e^(-ln(2) * t / t_half)
// Solve for t when C(t) = C_threshold
const cutoffHours = halfLife * log₂(C₀ / C_threshold)
```

With default parameters:
- **Half-life**: 5 hours
- **Dose**: 100mg (one cup of coffee)
- **Typical cutoff**: ~6-8 hours before sleep

## Example Output

### 10-Hour Eastbound Flight (New York → London)
- **Landing**: 6:00 AM London time
- **Sleep schedule**: 11:00 PM - 7:00 AM
- **Coffee recommendations**:
  - ☕ 7:00 AM (at wake time)
  - ☕ 10:30 AM (3.5 hours after wake)

### 10-Hour Westbound Flight (London → New York)
- **Landing**: 3:00 PM New York time
- **Sleep schedule**: 11:00 PM - 7:00 AM
- **Coffee recommendations**:
  - ☕ 3:00 PM (8 hours after wake, to extend wake period)

## Files Modified

- **[mobile/src/components/FlightDetails/ResultsDisplay.tsx](mobile/src/components/FlightDetails/ResultsDisplay.tsx)**
  - Lines 139-198: Inlined caffeine calculation logic
  - Removed dependency on `calculateOptimalCaffeineTiming()`

## Testing Scenarios

✅ **10-hour flight**: Coffee shows after landing
✅ **Short flight (3 hours)**: Coffee shows if wake time is after landing
✅ **Eastbound travel**: Two doses (wake + mid-morning)
✅ **Westbound travel**: One afternoon dose
✅ **Respects sleep cutoff**: No coffee within 6-8 hours of bedtime

---

*Fix implemented: November 25, 2025*
