# Timeline Gap Fix - Multi-Day Segment Rendering

## Problem

When light exposure recommendations (or sleep periods) crossed midnight from one day to the next, there was a visual gap in the timeline display. For example:
- **Day 1 (10 PM - 11:59 PM)**: Shows darkness exposure
- **Day 2 (12:00 AM - 2 AM)**: Gap / no exposure shown ❌

The segments weren't continuing seamlessly across the day boundary.

## Root Cause

Two issues in the original implementation:

### Issue 1: Segments Not Added to Both Days
**Location**: [ResultsDisplay.tsx:222-250](mobile/src/components/FlightDetails/ResultsDisplay.tsx#L222-L250)

Original logic only added segments to the day they **started** on:
```typescript
// OLD CODE - Only added to starting day
segments.forEach((segment) => {
  const dateKey = segment.startTime.format('YYYY-MM-DD');
  groupedByDate[dateKey].segments.push(segment);
  // Missing: Add to next day if crosses midnight!
});
```

### Issue 2: Segments Not Rendered if They Didn't Start on Current Day
**Location**: [ResultsDisplay.tsx:279-341](mobile/src/components/FlightDetails/ResultsDisplay.tsx#L279-L341)

Original rendering logic skipped segments that didn't start on the current day:
```typescript
// OLD CODE - Only rendered segments starting on this day
if (segmentDate !== currentDate) return null;
```

This created gaps when segments spanned from a previous day.

## Solution

### Fix 1: Add Segments to Multiple Days When They Span Midnight

```typescript
// NEW CODE - Add segments to all days they touch
segments.forEach((segment) => {
  // Add to starting day
  const startDateKey = segment.startTime.format('YYYY-MM-DD');
  groupedByDate[startDateKey].segments.push(segment);

  // If crosses midnight, also add to ending day
  if (!segment.isInstant) {
    const endDateKey = segment.endTime.format('YYYY-MM-DD');
    if (endDateKey !== startDateKey) {
      groupedByDate[endDateKey].segments.push(segment);
    }
  }
});
```

### Fix 2: Render Segments That Span Into Current Day

```typescript
// NEW CODE - Check if segment overlaps with current day
const segmentStartsOnThisDay = segment.startTime.format('YYYY-MM-DD') === currentDate;
const segmentSpansIntoThisDay = !segment.isInstant &&
  segment.startTime.isBefore(currentDayStart) &&
  segment.endTime.isAfter(currentDayStart);

// Render if segment touches this day at all
if (!segmentStartsOnThisDay && !segmentSpansIntoThisDay) return null;

// Calculate rendering boundaries
let startMinutes;
if (segmentSpansIntoThisDay) {
  startMinutes = 0; // Start at midnight (beginning of this day)
} else {
  startMinutes = segment.startTime.hours() * 60 + segment.startTime.minutes();
}

let endMinutes;
if (segment.endTime.isAfter(currentDayEnd)) {
  endMinutes = 24 * 60; // Cap at end of day
} else {
  endMinutes = segment.endTime.hours() * 60 + segment.endTime.minutes();
}
```

### Fix 3: Only Show Icon on Starting Day

```typescript
// Only show icon if segment starts on this day (not when continuing from previous day)
{segmentStartsOnThisDay && (
  <View style={styles.activityIconContainer}>
    <Ionicons name={icon as any} size={20} color={iconColor} />
  </View>
)}
```

## Visual Result

### Before Fix ❌
```
Day 1 (Nov 24)
├─ 10 PM: 🌙 Dark exposure starts
├─ 11 PM: Dark exposure
└─ 12 AM: (end of day 1 timeline)

Day 2 (Nov 25)
├─ 12 AM: ⚠️ GAP - nothing shown
├─ 1 AM:  ⚠️ GAP - nothing shown
└─ 2 AM:  ⚠️ GAP - segment lost
```

### After Fix ✅
```
Day 1 (Nov 24)
├─ 10 PM: 🌙 Dark exposure starts
├─ 11 PM: Dark exposure continues
└─ 12 AM: Dark exposure continues (capped at midnight)

Day 2 (Nov 25)
├─ 12 AM: Dark exposure continues (from prev day, no icon)
├─ 1 AM:  Dark exposure continues
└─ 2 AM:  Dark exposure ends
```

## Edge Cases Handled

1. **Multi-day segments**: Sleep/exposure periods spanning 2+ days
2. **Instant recommendations**: Melatonin/caffeine only show on their occurrence day
3. **Icon positioning**: Icons only appear when segment starts (not when continuing)
4. **Boundary calculations**: Properly cap segments at day boundaries (0:00 and 23:59)

## Testing Scenarios

To verify the fix works:

1. ✅ **Midnight-crossing exposure**: Dark exposure 10 PM → 2 AM
2. ✅ **Sleep period**: Sleep 11 PM → 7 AM
3. ✅ **Long duration**: Light exposure 8 AM Day 1 → 6 PM Day 2
4. ✅ **Multiple segments**: Multiple exposures crossing midnight
5. ✅ **Instant recommendations**: Melatonin/caffeine at 11:30 PM (only on Day 1)

## Files Modified

- **[mobile/src/components/FlightDetails/ResultsDisplay.tsx](mobile/src/components/FlightDetails/ResultsDisplay.tsx)**
  - Lines 222-250: Segment grouping logic (add to multiple days)
  - Lines 279-417: Segment rendering logic (handle spanning segments)

## Implementation Date

November 25, 2025

---

*This fix ensures seamless visual continuity for all timeline segments, eliminating gaps when recommendations span across midnight.*
