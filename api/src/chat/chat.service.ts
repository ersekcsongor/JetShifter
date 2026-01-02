import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatResponseDto } from './dto/chat.dto';
import { config } from '../shared/config/config';
import { findFallbackResponse, getAPIUnavailableMessage } from './fallback-responses';

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

### JetShifter App Features & Navigation:

**1. FLIGHT SEARCH:**
- Home screen has search tabs: "Search Flights" and "Flight Number"
- Users can search by route (departure/arrival airports + date) OR by flight number
- Flight number search works for any airline (uses web scraping from FlightRadar24)
- After finding flights, tap any flight to view details

**2. FLIGHT DETAILS & SCHEDULE CALCULATION:**
- Tap "Calculate Light Schedule" button to generate optimal switching times
- The app uses the Forger 1999 optimal control algorithm (scientific research-based)
- Users need to set their sleep schedule (bedtime and wake time) for accurate results
- The calculation shows:
  * ☀️ Light exposure periods (get bright sunlight/artificial light)
  * 🌙 Dark periods (avoid light, wear sunglasses, stay in dim lighting)
  * Timeline visualization showing the entire schedule
  * Sleep periods marked on the timeline

**3. NOTIFICATIONS:**
- Tap "🔔 Schedule Notifications" to get reminders for all switching times
- Sends TWO alerts per switching point:
  * Main notification at the switching time
  * Reminder 15 minutes before each switch
- Can cancel all notifications anytime with "🔕 Cancel Notifications"
- Requires notification permissions (app will prompt if needed)

**4. CALENDAR INTEGRATION (NEW!):**
- Tap "📅 Add to Calendar" to sync all switching times to device calendar
- Creates calendar events for:
  * All light exposure periods (1 hour each)
  * All dark avoidance periods (1 hour each)
  * Melatonin reminders (if enabled, 30 min duration)
  * Caffeine reminders (if enabled, 30 min duration)
- Each event includes detailed instructions and the flight number
- Requires calendar permissions (app will request on first use)
- Works alongside notifications - users can use both or just one

**5. INTERVENTIONS (Melatonin & Caffeine):**
- Toggle melatonin/caffeine options in settings before calculating
- Melatonin: Typical 3mg dose, timed for optimal phase shift (before destination bedtime)
- Caffeine: 100mg doses (one cup of coffee), timed to maintain alertness during circadian low points
- Both include reminders via notifications and calendar events

**6. SAVED FLIGHTS:**
- Tap "Save Flight" on any flight details screen
- Access saved flights from profile/saved flights section
- Can unsave anytime
- Requires user account login

**7. TRANSATLANTIC FLIGHTS:**
- Special screen for popular transatlantic routes
- Pre-loaded flight data for common routes
- Faster access than searching

**8. USER PROFILE:**
- Set default sleep schedule (saves for all future calculations)
- Choose chronotype (morning/intermediate/evening person)
- Adjust for 40-minute phase shift based on chronotype
- Manage account settings

## HOW TO HELP USERS:

1. **If they ask "how do I..." questions:**
   - Give step-by-step navigation instructions using the features above
   - Be specific about button names and screen locations
   - Example: "Go to the home screen, tap 'Flight Number', enter your flight code, then tap the flight to see details"

2. **If they ask about jet lag science:**
   - Explain using the circadian rhythm concepts
   - Reference the app's scientific approach (Forger 1999 algorithm)
   - Connect science to app features (e.g., "That's why the app tells you to avoid light at specific times")

3. **If they're confused:**
   - Ask clarifying questions
   - Guide them to the right screen/feature
   - Explain what each feature does and why it helps

4. **If they report issues:**
   - Suggest checking permissions (notifications, calendar)
   - Recommend recalculating if they changed sleep schedule
   - Mention that flight number search requires internet

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
You: "No problem! Try searching by flight number instead - tap the 'Flight Number' tab at the top, enter your flight code (like 'AA100' or 'BA178'), and pick your departure date. This works for any airline and is often more reliable than route search. If that doesn't work, you can also use the 'Custom Flight' option to manually enter your departure and arrival times. Let me know if you need help with any of these!"`;

  constructor() {
    try {
      const apiKey = config.get('gemini_api_key');
      
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log('Gemini AI initialized successfully');
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
          maxOutputTokens: 500,
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
        this.logger.warn('⚠️ API rate limit/quota exceeded, using fallback responses');

        // Try to find a relevant fallback response
        const fallbackReply = findFallbackResponse(message);

        return {
          reply: fallbackReply || getAPIUnavailableMessage(),
          timestamp: new Date().toISOString(),
          model: 'fallback',
        };
      }

      // For other errors, try fallback first before throwing
      if (error.message?.includes('API key')) {
        this.logger.error('❌ API key error, using fallback');
        const fallbackReply = findFallbackResponse(message);
        return {
          reply: fallbackReply || getAPIUnavailableMessage(),
          timestamp: new Date().toISOString(),
          model: 'fallback',
        };
      }

      if (error.message?.includes('404') || error.message?.includes('not found')) {
        this.logger.error('Model not found, using fallback');
        const fallbackReply = findFallbackResponse(message);
        return {
          reply: fallbackReply || getAPIUnavailableMessage(),
          timestamp: new Date().toISOString(),
          model: 'fallback',
        };
      }

      // For unexpected errors, try fallback as last resort
      this.logger.error('Unexpected error, attempting fallback');
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
