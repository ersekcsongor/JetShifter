import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatResponseDto } from './dto/chat.dto';
import { config } from '../shared/config/config';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private genAI: GoogleGenerativeAI;
  private readonly modelName = 'gemini-2.5-flash'; // Updated model name
  private readonly systemPrompt = `You are a helpful jet lag and travel wellness assistant. 
Your expertise includes:
- Jet lag causes, symptoms, and science
- Time zone adjustment strategies
- Sleep hygiene and circadian rhythm management
- Travel health tips
- Light exposure recommendations
- Melatonin and supplement guidance (always recommend consulting a doctor)

Keep responses concise (2-3 paragraphs max), friendly, and practical. 
Always prioritize health and safety. If asked medical questions beyond jet lag, 
recommend consulting a healthcare professional.`;

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
      
      // Enhanced error handling
      if (error.message?.includes('API key')) {
        throw new InternalServerErrorException('API authentication failed');
      }
      
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        this.logger.error('Model not found. Available models may have changed.');
        throw new InternalServerErrorException('AI model unavailable. Please contact support.');
      }

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
