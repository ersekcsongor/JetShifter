import { Body, Controller, Get, Post, Param, Query, Req, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { GlobalFlightsService } from './global-flights.service';
import { GlobalFlightsInputDto } from './dto/input/global-flights.input.dto';

@Controller('global-flights')
export class GlobalFlightsController {
  constructor(private readonly flightsService: GlobalFlightsService) {}

  @Get('getAllFlights')
  async getAllFlights() {
    return await this.flightsService.getAllFlights();
  }
  
  @Get('search')
  async searchFlights(
    @Query('departure') departure: string,
    @Query('arrival') arrival: string,
    @Query('date') date: string,
    @Req() request: Request,
  ) {
    const fullUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`;
    console.log('Accessed endpoint:', fullUrl);
    return await this.flightsService.searchFlights(departure, arrival, date);
  }

  @Post('add')
  async addFlightData(
    @Body() flightData: GlobalFlightsInputDto,
  ) {
    // Accepts a single flight, matching the flat model
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