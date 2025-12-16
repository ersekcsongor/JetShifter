import { Controller, Post, Body, BadRequestException, Get, Param } from '@nestjs/common';
import { GlobalAirportsService } from './global-airports.service';
import { GlobalAirportsInputDto } from './dto/input/global-airports.input.dto';

@Controller('global-airports')
export class GlobalAirportsController {
  constructor(private readonly globalAirportsService: GlobalAirportsService) {}

  @Post('insert')
  async insertGlobalAirports(@Body() airportsData: GlobalAirportsInputDto[]) {
    console.log('Received payload:', airportsData);
    if (!Array.isArray(airportsData)) {
      throw new BadRequestException('Invalid payload: Expected an array of global airports');
    }
    console.log(airportsData.filter((airport) => airport));
    return await this.globalAirportsService.insertGlobalAirports(airportsData.filter((airport) => airport));
  }

  @Get('getAll')
  async getAllGlobalAirports() {
    return await this.globalAirportsService.getAllGlobalAirports();
  }

  @Get('getTimezoneByIataCode/:iataCode')
  async getTimezoneByIataCode(@Param('iataCode') iataCode: string) {
    const timeZone = await this.globalAirportsService.getTimezoneByIataCode(iataCode);
    return { timeZone };
  }

  @Get('getNameByIataCode/:iataCode')
  async getNameByIataCode(@Param('iataCode') iataCode: string) {
    const name = await this.globalAirportsService.getNameByIataCode(iataCode);
    return { name };
  }

  @Post('add-single')
  async addSingleAirport(@Body() airportData: {
    iataCode: string;
    name: string;
    countryCode: string;
    cityCode: string;
    timeZone: string;
    countryName: string;
  }) {
    return await this.globalAirportsService.addSingleAirport(airportData);
  }
}