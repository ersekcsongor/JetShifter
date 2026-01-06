import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { OllamaService } from './ollama.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, OllamaService],
  exports: [ChatService],
})
export class ChatModule {}