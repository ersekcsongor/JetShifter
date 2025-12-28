// In your main.ts or create a health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  healthCheck() {
    return { status: 'ok', message: 'Server is running' };
  }
  
  @Get('health')
  health() {
    return { status: 'ok', message: 'Server is running' };
  }
}