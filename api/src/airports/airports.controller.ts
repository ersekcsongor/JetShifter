import { Controller, Post, Body, BadRequestException, Get, Param } from '@nestjs/common';
import { AirportsService } from './airports.service';
import { AirportsInputDto } from './dto/input/airports.input.dto';

@Controller('airports')
export class AirportsController {
  constructor(private readonly airportsService: AirportsService) {}

  // Insert Ryanair airports
  @Post('insert')
  async insertAirports(@Body() airportsData: AirportsInputDto[]) {
    console.log('Received payload:', airportsData);
    if (!Array.isArray(airportsData)) {
      throw new BadRequestException('Invalid payload: Expected an array of airports');
    }
    return await this.airportsService.insertAirports(airportsData.filter((airport) => airport));
  }

  // Get all airports (unified)
  @Get('getAll')
  async getAllAirports() {
    return await this.airportsService.getAllAirports();
  }

  // Get only Ryanair airports
  @Get('getRyanair')
  async getRyanairAirports() {
    return await this.airportsService.getRyanairAirports();
  }

  // Get timezone by IATA code (works for all airports)
  @Get('getTimezoneByIataCode/:iataCode')
  async getTimezoneByIataCode(@Param('iataCode') iataCode: string) {
    const timeZone = await this.airportsService.getTimezoneByIataCode(iataCode);
    return { timeZone };
  }

  // Get name by IATA code (works for all airports)
  @Get('getNameByIataCode/:iataCode')
  async getNameByIataCode(@Param('iataCode') iataCode: string) {
    const name = await this.airportsService.getNameByIataCode(iataCode);
    return { name };
  }

  // Add a single airport (for custom flights)
  @Post('add-single')
  async addSingleAirport(@Body() airportData: {
    iataCode: string;
    name: string;
    countryCode: string;
    cityCode?: string;
    timeZone: string;
    countryName?: string;
  }) {
    return await this.airportsService.addSingleAirport(airportData);
  }

  // Get Ryanair routes from an airport
  @Get('getRyanairRoutes/:iataCode')
  async getRyanairRoutes(@Param('iataCode') iataCode: string) {
    const routes = await this.airportsService.getRyanairRoutes(iataCode);
    return { routes };
  }
}
