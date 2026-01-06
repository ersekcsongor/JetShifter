// Fallback responses when Gemini API is unavailable or rate limited
// This provides basic help without requiring AI API calls

export interface FallbackResponse {
  keywords: string[];
  category: string;
  response: string;
}

export const FALLBACK_RESPONSES: FallbackResponse[] = [
  // NAVIGATION & HOW-TO
  {
    keywords: ['navigate', 'how to use', 'getting started', 'where is', 'where do i'],
    category: 'App Navigation',
    response: `**JetShifter Navigation Guide** 🧭

**3 Bottom Tabs:**
• 🏠 **"Home"** tab → StartScreen (main hub)
• 📑 **"Saved"** tab → SavedFlightsScreen (your saved flights)
• 👤 **"Account"** tab → UserDetailsScreen (settings & profile)

**To Plan a Trip:**
1. Go to **"Home"** tab
2. Tap **"Plan Your Trip"** button → Goes to ChooseScreen
3. Choose from 4 flight search options:
   - "RyanAir Flights" - Real-time RyanAir data
   - "Transatlantic Flights" - 30+ pre-loaded routes
   - "Flight Number Search" - ANY airline (enter code + date, tap "Search Flight")
   - "Custom Flight" - Manual entry
4. Select your flight → Goes to FlightDetailsScreen
5. Set sleep schedule → Tap **"Calculate Light Schedule"**
6. Use **"Schedule Notifications"** or **"Add to Calendar"** buttons

Start from the Home tab! ✈️`
  },
  {
    keywords: ['search', 'find', 'flight', 'look for', 'plan trip', 'flight number', 'add flight', 'enter flight'],
    category: 'Flight Search',
    response: `**How to Search for Flights** 🔍

**Step-by-step:**
1. Go to **"Home"** tab (bottom navigation)
2. Tap **"Plan Your Trip"** button
3. This shows ChooseScreen with 4 search options:

1️⃣ **"RyanAir Flights"**
   → SelectAirportScreen → pick airports/date → **"Find Flights"** → FlightListScreen → tap flight

2️⃣ **"Transatlantic Flights"**
   → TransatlanticFlightListScreen → 30+ pre-loaded routes → tap route

3️⃣ **"Flight Number Search"** (ANY airline!)
   → FlightNumberSearchScreen → enter code (AA100, BA178) + date → **"Search Flight"** → FlightDetailsScreen

4️⃣ **"Custom Flight"**
   → CustomFlightScreen → manual entry → FlightDetailsScreenCustom

All paths lead to FlightDetailsScreen where you calculate your light schedule! ✈️`
  },
  {
    keywords: ['calculate', 'schedule', 'light', 'switching'],
    category: 'Light Schedule',
    response: `To calculate your light schedule:

1️⃣ Find and tap your flight to view flight details
2️⃣ Set your sleep schedule (bedtime and wake time)
3️⃣ Tap "Calculate Light Schedule" button
4️⃣ View your personalized ☀️ light exposure and 🌙 dark periods

The app uses the scientific Forger 1999 algorithm to minimize jet lag!`
  },
  {
    keywords: ['notification', 'reminder', 'alert', 'schedule notifications'],
    category: 'Notifications',
    response: `To get reminders for your light schedule:

1️⃣ After calculating your schedule, scroll down
2️⃣ Tap "🔔 Schedule Notifications"
3️⃣ Grant notification permissions when prompted

You'll receive TWO alerts for each switching time:
• Main notification at the exact time
• 15-minute advance warning

Cancel anytime with "🔕 Cancel Notifications"`
  },
  {
    keywords: ['calendar', 'add to calendar', 'sync'],
    category: 'Calendar Integration',
    response: `To add your schedule to your device calendar:

1️⃣ Calculate your light schedule first
2️⃣ Scroll down and tap "📅 Add to Calendar"
3️⃣ Grant calendar permission when asked

The app will create events for:
• All light exposure periods (1 hour each)
• All dark avoidance periods (1 hour each)
• Melatonin/caffeine reminders (if enabled)

Each event includes detailed instructions!`
  },
  {
    keywords: ['save', 'saved flights', 'favorite'],
    category: 'Saved Flights',
    response: `To save a flight for later:

1️⃣ Open any flight details screen
2️⃣ Tap "Save Flight" button
3️⃣ Access saved flights from your profile

You need to be logged in to save flights. Unsave anytime by tapping "Unsave Flight" on the details screen.`
  },
  {
    keywords: ['melatonin', 'caffeine', 'intervention', 'supplement'],
    category: 'Interventions',
    response: `JetShifter can recommend melatonin and caffeine timing:

**Melatonin** 💊
• Toggle in settings before calculating
• Typical 3mg dose before destination bedtime
• Helps shift your circadian rhythm faster

**Caffeine** ☕
• 100mg doses (one cup of coffee)
• Timed for circadian low points
• Maintains alertness during adjustment

⚠️ Always consult your doctor before using supplements!`
  },

  // JET LAG SCIENCE
  {
    keywords: ['jet lag', 'what is', 'cause', 'why'],
    category: 'Jet Lag Basics',
    response: `Jet lag happens when you cross time zones faster than your body can adjust! ✈️

**Causes:**
• Your internal clock (circadian rhythm) is still on home time
• Mismatch between your body's schedule and the local time
• Takes about 1 day per time zone to naturally adjust

**Symptoms:**
• Fatigue and sleepiness at wrong times
• Difficulty falling asleep or waking up
• Poor concentration and mood changes
• Digestive issues

JetShifter helps by calculating optimal light exposure to speed up your adjustment!`
  },
  {
    keywords: ['circadian', 'rhythm', 'internal clock', 'body clock'],
    category: 'Circadian Rhythm',
    response: `Your circadian rhythm is your body's internal 24-hour clock! 🕐

**What it controls:**
• Sleep-wake cycle
• Hormone release (like melatonin)
• Body temperature
• Alertness and performance

**Light is the key:** Your brain uses light to set this clock. That's why JetShifter's light schedule works:
• ☀️ Bright light = signals daytime to your brain
• 🌙 Darkness = signals nighttime

The app calculates exactly when to get light/dark to shift your clock faster!`
  },
  {
    keywords: ['light exposure', 'bright light', 'sunlight', 'why light'],
    category: 'Light Exposure',
    response: `Light exposure is the most powerful tool for resetting your circadian rhythm! ☀️

**How it works:**
• Light signals travel to your brain's "master clock"
• Tells your body what time it is
• Shifts your sleep-wake cycle

**☀️ During LIGHT periods:**
• Get bright sunlight or use bright indoor lights
• Signals "daytime" in your destination timezone

**🌙 During DARK periods:**
• Avoid bright light, wear sunglasses
• Stay in dim lighting
• Signals "nighttime" in your destination timezone

The app calculates optimal timing using scientific research (Forger 1999 algorithm)!`
  },
  {
    keywords: ['chronotype', 'morning person', 'evening person', 'night owl'],
    category: 'Chronotype',
    response: `Chronotypes are your natural sleep-wake preference! 🦉🐓

**Three types:**
• **Morning**: Wake early, sleep early (larks)
• **Intermediate**: Average sleep times
• **Evening**: Wake late, sleep late (night owls)

**Why it matters:**
JetShifter adjusts recommendations by ±40 minutes based on your chronotype. Set yours in your profile for more accurate schedules!

This accounts for your natural circadian phase differences.`
  },

  // TROUBLESHOOTING
  {
    keywords: ["can't find", "not found", "doesn't work", "not working"],
    category: 'Troubleshooting',
    response: `Having trouble? Here are common solutions:

**Can't find your flight?**
• Try flight number search instead of route search
• Check the date is correct
• Use "Custom Flight" to manually enter times

**Notifications not working?**
• Check notification permissions in phone settings
• Ensure you tapped "Schedule Notifications"
• Try recalculating if you changed your sleep schedule

**Calendar not syncing?**
• Grant calendar permissions when prompted
• Make sure you calculated the schedule first
• Check your device has a writable calendar

**Need to recalculate?**
Just tap "Calculate Light Schedule" again after making changes!`
  },

  // TRAVEL TIPS
  {
    keywords: ['plane', 'airplane', 'flight tips', 'during flight'],
    category: 'In-Flight Tips',
    response: `Tips for your flight to reduce jet lag:

**Before takeoff:**
• Start adjusting sleep schedule 2-3 days before
• Stay hydrated, avoid alcohol

**During the flight:**
• Follow your light schedule if crossing time zones
• Use sleep mask during "dark" periods
• Stay hydrated (8oz water per hour)
• Move around every 2 hours

**After landing:**
• Get outside for natural light
• Follow your calculated light/dark schedule
• Stay active during the day
• Resist napping unless schedule allows it

JetShifter's schedule starts from departure time!`
  },
  {
    keywords: ['sleep', 'sleeping', 'when to sleep', 'nap'],
    category: 'Sleep Tips',
    response: `Sleep strategy for beating jet lag:

**General rules:**
• Follow your destination's sleep schedule immediately
• Avoid long naps (maximum 20 minutes if needed)
• Get light exposure at the right times (see your schedule!)
• Keep a consistent bedtime

**On the plane:**
• Sleep during destination nighttime
• Stay awake during destination daytime
• Use sleep mask and earplugs

**After arrival:**
• Force yourself awake until destination bedtime
• Even if tired, don't sleep during "light exposure" periods
• Your JetShifter schedule shows when to sleep 😴`
  },

  // DEFAULT/GENERAL
  {
    keywords: ['help', 'how', 'what', 'guide'],
    category: 'General Help',
    response: `Welcome to JetShifter! 👋 I'm here to help with:

**App Navigation:**
• Finding and searching flights
• Calculating light schedules
• Setting up notifications and calendar
• Managing your profile

**Jet Lag Science:**
• Understanding circadian rhythms
• How light exposure works
• Melatonin and caffeine tips
• Travel wellness

**Common Questions:**
Type questions like:
• "How do I search for my flight?"
• "What is jet lag?"
• "How do I add to calendar?"
• "Should I use melatonin?"

Or explore the suggested questions below!`
  }
];

/**
 * Find the best matching fallback response for a user query
 */
export function findFallbackResponse(userMessage: string): string | null {
  const lowerMessage = userMessage.toLowerCase();

  // Try to find a matching response based on keywords
  let bestMatch: FallbackResponse | null = null;
  let maxMatches = 0;

  for (const response of FALLBACK_RESPONSES) {
    const matchCount = response.keywords.filter(keyword =>
      lowerMessage.includes(keyword.toLowerCase())
    ).length;

    if (matchCount > maxMatches) {
      maxMatches = matchCount;
      bestMatch = response;
    }
  }

  // Return match if we found at least one keyword match
  if (bestMatch && maxMatches > 0) {
    return bestMatch.response;
  }

  // Default helpful response if no match
  return `I'm currently in offline mode, but I can still help! 🤖

Try asking about:
• **How to use the app**: "How do I search flights?" "How do I add to calendar?"
• **Jet lag science**: "What is jet lag?" "How does light exposure work?"
• **Features**: "How do notifications work?" "What are interventions?"

Or check out the suggested questions below for common topics!`;
}

/**
 * Get a friendly error message when API is unavailable
 */
export function getAPIUnavailableMessage(): string {
  return `I'm currently running in offline mode due to API limits. 📵

Don't worry! I can still answer common questions about:
• Using JetShifter features
• Understanding jet lag
• Travel tips and advice

Just ask your question, and I'll do my best to help with pre-loaded responses!`;
}
