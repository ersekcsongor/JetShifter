import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';
// Uncomment if you want to protect the endpoint with JWT auth
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post('jetlag')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard) // Uncomment to require authentication
  async sendMessage(@Body() chatDto: ChatRequestDto): Promise<ChatResponseDto> {
    this.logger.log('Received chat request');
    
    return await this.chatService.sendMessage(
      chatDto.message,
      chatDto.conversationHistory || [],
    );
  }

  @Get('health')
  async healthCheck() {
    return await this.chatService.healthCheck();
  }
}
