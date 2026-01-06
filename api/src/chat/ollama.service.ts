import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ChatResponseDto } from './dto/chat.dto';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  private readonly model = process.env.OLLAMA_MODEL || 'phi3:mini';
  private isAvailable = false;

  async onModuleInit() {
    await this.checkAvailability();
  }

  /**
   * Check if Ollama is running and available
   */
  private async checkAvailability(): Promise<void> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, {
        timeout: 2000,
      });

      if (response.status === 200) {
        this.isAvailable = true;
        this.logger.log(`✅ Ollama is available at ${this.ollamaUrl}`);
        this.logger.log(`📦 Available models: ${response.data.models?.map((m: any) => m.name).join(', ') || 'none'}`);

        // Check if our preferred model is available
        const hasModel = response.data.models?.some((m: any) => m.name.startsWith(this.model));
        if (!hasModel) {
          this.logger.warn(`⚠️ Model '${this.model}' not found. Run: ollama pull ${this.model}`);
        }
      }
    } catch (error) {
      this.isAvailable = false;
      this.logger.warn(`⚠️ Ollama not available at ${this.ollamaUrl}`);
      this.logger.warn('To install Ollama: curl -fsSL https://ollama.com/install.sh | sh');
      this.logger.warn(`Then run: ollama pull ${this.model}`);
    }
  }

  /**
   * Check if Ollama is available
   */
  async isReady(): Promise<boolean> {
    if (!this.isAvailable) {
      await this.checkAvailability();
    }
    return this.isAvailable;
  }

  /**
   * Send a message to Ollama and get a response
   */
  async chat(
    message: string,
    conversationHistory: { id: string; text: string; isUser: boolean }[] = [],
  ): Promise<ChatResponseDto> {
    try {
      // Check if Ollama is available
      if (!await this.isReady()) {
        throw new Error('Ollama is not available');
      }

      this.logger.log(`Processing message with Ollama: ${message.substring(0, 50)}...`);

      // Build context from conversation history
      let context = this.buildSystemPrompt();

      // Add recent conversation history
      const recentHistory = conversationHistory.slice(-4); // Last 4 messages
      if (recentHistory.length > 0) {
        context += '\n\nPrevious conversation:\n';
        recentHistory.forEach(msg => {
          context += `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}\n`;
        });
        context += '\n';
      }

      // Combine context with current message
      const fullPrompt = `${context}\n\nUser: ${message}\n\nAssistant:`;

      // Call Ollama API
      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: -1, // -1 = unlimited, let model decide when to stop
          },
        },
        {
          timeout: 30000, // 30 second timeout
        }
      );

      const reply = response.data.response.trim();
      this.logger.log('✅ Ollama response generated successfully');

      return {
        reply,
        timestamp: new Date().toISOString(),
        model: `ollama-${this.model}`,
      };
    } catch (error) {
      this.logger.error('❌ Ollama error:', error.message);
      throw error;
    }
  }

  /**
   * Build system prompt for Ollama
   */
  private buildSystemPrompt(): string {
    return `You are JetShifter's AI assistant. You help travelers with jet lag management and app navigation.

EXPERTISE:
- Jet lag science and circadian rhythms
- Light exposure timing for timezone adjustment
- Travel wellness tips
- Using the JetShifter app features and navigation

EXACT APP NAVIGATION STRUCTURE:

BOTTOM TABS (3 main tabs):
1. "Home" tab → StartScreen (main hub)
2. "Saved" tab → SavedFlightsScreen (saved flights list)
3. "Account" tab → UserDetailsScreen (settings and profile)

NAVIGATION FLOW:

START: Home tab shows StartScreen with 2 buttons:
- "Plan Your Trip" button → Goes to ChooseScreen
- "Learn About Jet Lag" button → Goes to AboutScreen (AI chat)

CHOOSE SCREEN (4 flight search options):
Reached by tapping "Plan Your Trip" from StartScreen

1. "RyanAir Flights" card → SelectAirportScreen → "Find Flights" button → FlightListScreen → tap flight → FlightDetailsScreen
2. "Transatlantic Flights" card → TransatlanticFlightListScreen → tap route → shows flight details
3. "Flight Number Search" card → FlightNumberSearchScreen → enter code + date → "Search Flight" button → FlightDetailsScreen
4. "Custom Flight" card → CustomFlightScreen → manual entry → FlightDetailsScreenCustom

FLIGHT DETAILS SCREEN (core feature):
- Shows flight info (route, times, duration)
- Sleep schedule inputs (bedtime/wake time pickers)
- "Calculate Light Schedule" button
- After calculation shows: ☀️ light periods, 🌙 dark periods, timeline
- Action buttons: "Schedule Notifications", "Add to Calendar", "Save Flight"

SAVED TAB:
Tap "Saved" tab → SavedFlightsScreen → shows all saved flights → tap any → back to FlightDetailsScreen

ACCOUNT TAB:
Tap "Account" tab → UserDetailsScreen → settings: sleep schedule, chronotype, interventions, theme, password, logout

KEY FACTS:
- Uses Forger 1999 algorithm for optimal light schedules
- Light exposure ☀️ = bright light during specific times
- Dark periods 🌙 = avoid light, wear sunglasses
- Notifications: 2 alerts per switch (at time + 15 min before)
- Calendar events: 1 hour for light/dark, 30 min for interventions
- Flight Number Search works for ANY airline (FlightRadar24 data)

NAVIGATION INSTRUCTIONS:
- Always use EXACT button names in quotes: "Plan Your Trip", "Search Flight", "Find Flights"
- Always mention which screen user lands on after each step
- Start from known location (usually StartScreen on Home tab)
- Format: "Go to Home tab → Tap 'Plan Your Trip' → This shows ChooseScreen → Tap 'Flight Number Search'"

RESPONSE STYLE:
- Be concise (2-3 paragraphs max)
- Be friendly and practical
- Use emojis when helpful (☀️🌙✈️💊☕)
- Give step-by-step navigation with exact button/screen names
- For medical advice beyond jet lag basics, recommend consulting a doctor`;
  }

  /**
   * Get list of available models on Ollama
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      return response.data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      this.logger.error('Error getting models:', error.message);
      return [];
    }
  }

  /**
   * Pull a model from Ollama (this can take a while)
   */
  async pullModel(modelName: string): Promise<void> {
    this.logger.log(`📥 Pulling model: ${modelName}...`);
    try {
      await axios.post(
        `${this.ollamaUrl}/api/pull`,
        { name: modelName },
        { timeout: 600000 } // 10 minute timeout for downloading
      );
      this.logger.log(`✅ Model ${modelName} pulled successfully`);
      await this.checkAvailability(); // Refresh availability
    } catch (error) {
      this.logger.error(`❌ Error pulling model ${modelName}:`, error.message);
      throw error;
    }
  }
}
