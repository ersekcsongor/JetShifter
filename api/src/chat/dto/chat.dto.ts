import { IsString, IsArray, IsOptional, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class MessageHistoryDto {
  @IsString()
  id: string;

  @IsString()
  text: string;

  @IsBoolean()
  isUser: boolean;

  @IsOptional()
  @IsString()
  timestamp?: string;
}

export class ChatRequestDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageHistoryDto)
  conversationHistory?: MessageHistoryDto[];
}

export class ChatResponseDto {
  reply: string;
  model?: string;
  timestamp?: string;
}