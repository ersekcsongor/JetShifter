import { Body, Controller, Get, Post, Param, Query, Req, BadRequestException } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { Request } from 'express';
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post('process')
  async processFlights() {
    await this.flightsService.processFlightsForNext3Days();
    return { message: 'Flight processing started' };
  }

  @Get('getAllFlights')
  async getAllFlights() {
    return await this.flightsService.getAllFlights();
  }
  
  @Get('search')
  async searchFlights(
    @Query('departure') departure: string,
    @Query('arrival') arrival: string,
    @Query('date') date: string,
    @Req() request: Request, // Inject the request object

  ) {
    const fullUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`;
    console.log('Accessed endpoint:', fullUrl);
    return await this.flightsService.searchFlights(departure, arrival, date);
  }

  @Post('add')
  async addFlightData(
    @Body() flightData: {
      origin: string;
      destination: string;
      date: string;
      flights: Record<string, any>;
    },
  ) {
    return await this.flightsService.createFlight(flightData);
  }

  @Post('save')
  async saveFlight(@Body() body: { email: string; flightNumber: string }) {
    if (!body.email || !body.flightNumber) {
      throw new BadRequestException('Missing email or flightNumber');
    }
    return this.flightsService.saveFlightForUser(body.email, body.flightNumber);
  }

  @Post('unsave')
  async unsaveFlight(@Body() body: { email: string; flightNumber: string }) {
    return this.flightsService.unsaveFlightForUser(body.email, body.flightNumber);
  }

  @Get('saved/:email')
  async getSavedFlights(@Param('email') email: string) {
    return this.flightsService.getSavedFlightsForUser(email);
  }
}