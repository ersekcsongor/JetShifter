import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatResponseDto } from './dto/chat.dto';
import { config } from '../shared/config/config';
import { findFallbackResponse, getAPIUnavailableMessage } from './fallback-responses';
import { OllamaService } from './ollama.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private genAI: GoogleGenerativeAI;
  private readonly modelName = 'gemini-2.5-flash'; // Updated model name
  private readonly systemPrompt = `You are JetShifter's AI assistant - a helpful guide for jet lag management and app navigation.

## YOUR EXPERTISE:

### Jet Lag Science & Wellness:
- Jet lag causes, symptoms, and circadian rhythm science
- Time zone adjustment strategies using light exposure
- Sleep hygiene and circadian rhythm management
- Travel health tips and recommendations
- Optimal light exposure timing (bright light vs. darkness)
- Melatonin and caffeine usage for jet lag (always recommend consulting a doctor for medical advice)
- Chronotype considerations (morning, evening, intermediate types)

### JetShifter App Navigation Structure:

**EXACT APP LAYOUT - Bottom Navigation Tabs:**
The app has 3 main tabs at the bottom:
1. 🏠 **"Home"** tab → Shows StartScreen - Main hub with two button cards
2. 📑 **"Saved"** tab → Shows SavedFlightsScreen - All your saved flights
3. 👤 **"Account"** tab → Shows UserDetailsScreen - Profile, settings, preferences

**EXACT NAVIGATION FLOW:**

**STEP 1 - Start Screen (Home Tab):**
Screen name: StartScreen
What you see: Two large button cards:
- Button 1: **"Plan Your Trip"** → Navigates to ChooseScreen (flight selection)
- Button 2: **"Learn About Jet Lag"** → Navigates to AboutScreen (AI assistant chat)

**STEP 2 - Choose Flight Type Screen:**
Screen name: ChooseScreen
Reached by: Tapping "Plan Your Trip" button from StartScreen
What you see: Four flight search option cards:

1️⃣ Card 1: **"RyanAir Flights"**
   - Tapping this navigates to: SelectAirportScreen
   - Then shows: Airport selection dropdowns
   - Button to proceed: **"Find Flights"** → Navigates to FlightListScreen
   - Then: Tap any flight → Navigates to FlightDetailsScreen

2️⃣ Card 2: **"Transatlantic Flights"**
   - Tapping this navigates to: TransatlanticFlightListScreen
   - Shows: 30+ pre-loaded Europe ↔ North America routes
   - Then: Tap any route → Loads flight details

3️⃣ Card 3: **"Flight Number Search"**
   - Tapping this navigates to: FlightNumberSearchScreen
   - Shows: Flight number input field + date picker
   - Button to proceed: **"Search Flight"** → Searches and navigates to FlightDetailsScreen
   - Works for ANY airline worldwide (uses FlightRadar24 API)

4️⃣ Card 4: **"Custom Flight"**
   - Tapping this navigates to: CustomFlightScreen
   - Shows: Manual airport and time entry fields
   - Then: Navigates to FlightDetailsScreenCustom

**STEP 3 - Flight Details Screen (The Core Feature):**
Screen names: FlightDetailsScreen OR FlightDetailsScreenCustom
Reached by: Selecting a flight from any of the 4 methods above
What you see:
- Flight information (route, airline, times, duration)
- Sleep schedule inputs (bedtime and wake time pickers)
- Button: **"Calculate Light Schedule"**
- After calculation shows:
  * ☀️ Light exposure periods with exact times
  * 🌙 Dark avoidance periods with exact times
  * Visual timeline of your schedule
  * Sleep periods marked
- Action buttons that appear after calculation:
  * Button: **"Schedule Notifications"** (creates alerts)
  * Button: **"Add to Calendar"** (syncs to device calendar)
  * Button: **"Save Flight"** (saves for later)

**Saved Flights Tab:**
Screen name: SavedFlightsScreen
Reached by: Tapping **"Saved"** tab at bottom navigation
What you see:
- List of all saved flights
- Tap any flight → Navigates back to FlightDetailsScreen for that flight
- Can unsave flights you no longer need

**Account Tab (Settings & Profile):**
Screen name: UserDetailsScreen
Reached by: Tapping **"Account"** tab at bottom navigation
Features available:
- Profile photo upload/change
- Sleep schedule settings (default bedtime and wake time)
- Chronotype selection (morning/intermediate/evening person)
- Interventions toggles (melatonin and caffeine recommendations)
- Theme selection (light/dark/system)
- Password change option
- Logout button

**Notifications System:**
- After calculating light schedule, tap "🔔 Schedule Notifications"
- Grants notification permission (if not already granted)
- Creates TWO notifications per switching time:
  * Main alert at exact switching time
  * 15-minute advance warning before each switch
- Shows confirmation when scheduled
- Can cancel all notifications with "🔕 Cancel Notifications" button

**Calendar Integration:**
- After calculating light schedule, scroll down to "📅 Add to Calendar" button
- Tap to sync schedule to device calendar
- Grants calendar permission (if not already granted)
- Creates events for:
  * All ☀️ light exposure periods (1 hour duration each)
  * All 🌙 dark periods (1 hour duration each)
  * 💊 Melatonin reminders (30 min duration, if enabled)
  * ☕ Caffeine reminders (30 min duration, if enabled)
- Each calendar event includes:
  * Detailed instructions (what to do)
  * Flight number reference
  * Alert reminders

**Authentication:**
- Login/Register screens appear when not logged in
- Email + password authentication
- Required for saving flights and syncing settings
- Profile data persists across devices

## HOW TO HELP USERS:

1. **If they ask "how do I..." navigation questions:**
   - Give step-by-step navigation using EXACT button names and screen names from above
   - Always start from a known location (usually StartScreen on Home tab)
   - Use this format: "Go to [tab name] → Tap [button name] → This shows [screen name] → Tap [next button]"
   - Always mention which screen they'll land on after each navigation step
   - Reference the exact button labels in quotes (e.g., "Plan Your Trip", "Search Flight", "Find Flights")

2. **If they ask about jet lag science:**
   - Explain using the circadian rhythm concepts
   - Reference the app's scientific approach (Forger 1999 algorithm)
   - Connect science to app features (e.g., "That's why the app shows light/dark periods")

3. **If they're confused:**
   - Ask clarifying questions about where they are in the app
   - Guide them to the right screen using exact navigation flow
   - Explain what each button/feature does and why it helps

4. **If they report issues:**
   - Suggest checking permissions (notifications, calendar)
   - Recommend recalculating schedule if they changed sleep settings
   - Mention that Flight Number Search requires internet connection

## RESPONSE STYLE:
- Keep responses concise (2-4 paragraphs max)
- Be friendly, encouraging, and practical
- Use emojis when helpful (☀️ for light, 🌙 for dark, ✈️ for flights, etc.)
- Always prioritize health and safety
- For medical questions beyond jet lag basics, recommend consulting a healthcare professional

## EXAMPLES OF GOOD RESPONSES:

User: "How do I add my flight schedule to my calendar?"
You: "Great question! After calculating your light schedule, scroll down and tap the '📅 Add to Calendar' button (it's below the notifications button). The app will ask for calendar permission, then it'll create events for all your light/dark switching times, plus any melatonin or caffeine reminders if you enabled those. Each event includes helpful notes and reminders so you don't miss them!"

User: "What does the light exposure schedule actually do?"
You: "The light schedule helps reset your circadian rhythm (your body's internal clock) to match your destination's time zone! ☀️ During 'light exposure' periods, get bright sunlight or use bright indoor lights - this signals your brain it's daytime. 🌙 During 'dark' periods, avoid bright light, wear sunglasses, or stay in dim lighting - this tells your brain it's nighttime. The app calculates the optimal times using scientific research (Forger 1999 algorithm) to minimize jet lag!"

User: "I can't find my flight"
You: "No problem! Try searching by flight number instead - tap the 'Flight Number' tab at the top, enter your flight code (like 'AA100' or 'BA178'), and pick your departure date. This works for any airline and is often more reliable than route search. If that doesn't work, you can also use the 'Custom Flight' option to manually enter your departure and arrival times. Let me know if you need help with any of these!"

User: "How can I navigate to add a flight number?"
You: "Easy! Here's the exact steps to search by flight number: ✈️

1. Go to the **Home** tab (bottom navigation)
2. Tap the **'Plan Your Trip'** button card
3. This takes you to the Choose Flight Type screen - tap **'Flight Number Search'**
4. Enter your flight number in the input field (e.g., AA100, BA178, DL1234)
5. Select your departure date from the date picker
6. Tap the **'Search Flight'** button
7. Once found, the app automatically shows the Flight Details screen - from there you can calculate your light schedule!

This works for ANY airline worldwide using FlightRadar24 data. Let me know when you find your flight!"`;

  constructor(private ollamaService: OllamaService) {
    try {
      const apiKey = config.get('gemini_api_key');

      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Gemini AI', error);
      throw error;
    }
  }

  async sendMessage(
    message: string,
    conversationHistory: { id: string; text: string; isUser: boolean }[] = [],
  ): Promise<ChatResponseDto> {
    try {
      this.logger.log(`Processing message: ${message.substring(0, 50)}...`);

      // Get the model with updated name
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: this.systemPrompt,
      });

      // Build conversation history for context
      const history = conversationHistory.slice(-6).map((msg) => ({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      const chat = model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 8192, // Maximum supported by Gemini 2.5 Flash
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(message);
      const reply = result.response.text();

      this.logger.log('Message processed successfully');

      return {
        reply,
        timestamp: new Date().toISOString(),
        model: this.modelName,
      };
    } catch (error) {
      this.logger.error('Error processing message:', error);

      // Check if it's a rate limit or quota error - use fallback instead of throwing
      const errorMessage = error.message?.toLowerCase() || '';
      const isRateLimit = errorMessage.includes('quota') ||
                          errorMessage.includes('rate limit') ||
                          errorMessage.includes('429') ||
                          errorMessage.includes('resource exhausted');

      if (isRateLimit) {
        this.logger.warn('⚠️ API rate limit/quota exceeded, trying Ollama...');

        // Try Ollama first (Tier 2)
        try {
          if (await this.ollamaService.isReady()) {
            this.logger.log('🔄 Switching to Ollama local AI');
            return await this.ollamaService.chat(message, conversationHistory);
          }
        } catch (ollamaError) {
          this.logger.warn('⚠️ Ollama also failed, using keyword fallback');
        }

        // Fall back to keyword matching (Tier 3)
        const fallbackReply = findFallbackResponse(message);

        return {
          reply: fallbackReply || getAPIUnavailableMessage(),
          timestamp: new Date().toISOString(),
          model: 'fallback',
        };
      }

      // For other errors, try Ollama then fallback
      if (error.message?.includes('API key') ||
          error.message?.includes('404') ||
          error.message?.includes('not found')) {
        this.logger.error('❌ Gemini API error, trying Ollama...');

        // Try Ollama (Tier 2)
        try {
          if (await this.ollamaService.isReady()) {
            this.logger.log('🔄 Switching to Ollama local AI');
            return await this.ollamaService.chat(message, conversationHistory);
          }
        } catch (ollamaError) {
          this.logger.warn('⚠️ Ollama also failed');
        }

        // Use keyword fallback (Tier 3)
        const fallbackReply = findFallbackResponse(message);
        return {
          reply: fallbackReply || getAPIUnavailableMessage(),
          timestamp: new Date().toISOString(),
          model: 'fallback',
        };
      }

      // For unexpected errors, try all tiers
      this.logger.error('Unexpected error, trying all fallbacks...');

      // Try Ollama
      try {
        if (await this.ollamaService.isReady()) {
          return await this.ollamaService.chat(message, conversationHistory);
        }
      } catch (ollamaError) {
        this.logger.warn('⚠️ Ollama failed');
      }

      // Try keyword fallback
      const fallbackReply = findFallbackResponse(message);
      if (fallbackReply) {
        return {
          reply: fallbackReply,
          timestamp: new Date().toISOString(),
          model: 'fallback',
        };
      }

      // Only throw if fallback also fails
      throw new InternalServerErrorException(
        'Failed to process your question. Please try again.',
      );
    }
  }

  async healthCheck(): Promise<{ status: string; model: string }> {
    try {
      // Optional: Test the model is accessible
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      
      return {
        status: 'ok',
        model: this.modelName,
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'error',
        model: this.modelName,
      };
    }
  }

  // Get suggested prompts to help users get started
  getSuggestedPrompts(): { category: string; prompts: string[] }[] {
    return [
      {
        category: 'Getting Started',
        prompts: [
          'How do I search for my flight?',
          'How do I calculate my light schedule?',
          'How do I add the schedule to my calendar?',
          'What are the notification reminders?',
        ],
      },
      {
        category: 'Jet Lag Science',
        prompts: [
          'What causes jet lag?',
          'How does light exposure help with jet lag?',
          'Should I use melatonin for jet lag?',
          'What is a circadian rhythm?',
        ],
      },
      {
        category: 'App Features',
        prompts: [
          'What does the light schedule calculation do?',
          'How do I save a flight?',
          'Can I use the app without notifications?',
          'What is the difference between light and dark periods?',
        ],
      },
      {
        category: 'Troubleshooting',
        prompts: [
          "I can't find my flight, what should I do?",
          'Why do I need to set my sleep schedule?',
          'How do I change my chronotype?',
          'The calendar integration is not working',
        ],
      },
      {
        category: 'Travel Tips',
        prompts: [
          'What should I do on the plane to reduce jet lag?',
          'How many days before my trip should I start preparing?',
          'Is it better to sleep on the plane or stay awake?',
          'What foods help with jet lag?',
        ],
      },
    ];
  }

  // Optional: Method to list available models (useful for debugging)
  async listAvailableModels(): Promise<string[]> {
    try {
      // The `listModels` method does not exist on the GoogleGenerativeAI instance.
      // This method's implementation is commented out to fix the compilation error.
      // const models = await this.genAI.listModels();
      // const modelNames = models.map(m => m.name);
      // this.logger.log('Available models:', modelNames);
      // return modelNames;
      this.logger.warn('listAvailableModels is not implemented.');
      return [];
    } catch (error) {
      this.logger.error('Error listing models:', error);
      return [];
    }
  }
}
