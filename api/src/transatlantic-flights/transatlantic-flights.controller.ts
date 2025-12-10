import { Controller, Get, Query, Post, Param, NotFoundException } from '@nestjs/common';
import { TransatlanticFlightsRealtimeService } from './transatlantic-flights-realtime.service';

@Controller('transatlantic-flights')
export class TransatlanticFlightsController {
  constructor(
    private readonly realtimeService: TransatlanticFlightsRealtimeService,
  ) {}

  // Get all available transatlantic routes
  @Get('routes')
  getRoutes() {
    return this.realtimeService.getAvailableRoutes();
  }

  // Search for transatlantic flights
  @Get('search')
  async searchFlights(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    if (!origin || !destination) {
      return { error: 'Origin and destination are required' };
    }

    return this.realtimeService.searchFlights(
      origin.toUpperCase(),
      destination.toUpperCase(),
    );
  }

  // Get timezone for a transatlantic airport
  @Get('timezone/:iataCode')
  async getTimezone(@Param('iataCode') iataCode: string) {
    const timezone = this.realtimeService.getTimezoneForAirport(iataCode.toUpperCase());
    if (!timezone) {
      throw new NotFoundException(`Timezone for airport ${iataCode} not found`);
    }
    return { timeZone: timezone };
  }

  // Scrape a specific route
  @Post('scrape')
  async scrapeRoute(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('date') date: string,
  ) {
    if (!origin || !destination || !date) {
      return { error: 'Origin, destination, and date are required (format: YYYY-MM-DD)' };
    }

    return this.realtimeService.scrapeRoute(
      origin.toUpperCase(),
      destination.toUpperCase(),
      date,
    );
  }

  // Scrape top transatlantic routes (real-time data)
  @Post('scrape-all')
  async scrapeAllRoutes(@Query('days') days?: string) {
    const daysAhead = days ? parseInt(days) : 3;
    return this.realtimeService.scrapeTopRoutes(daysAhead);
  }
}
