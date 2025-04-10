import { Controller, Post, Body, BadRequestException, Get, Param } from '@nestjs/common';
import { AirportsService } from './airports.service';
import { AirportsInputDto } from './dto/input/airports.input.dto';

@Controller('airports')
export class AirportsController {
  constructor(private readonly airportsService: AirportsService) {}

@Post('insert')
async insertAirports(@Body() airportsData: AirportsInputDto[]) {
  console.log('Received payload:', airportsData);
  if (!Array.isArray(airportsData)) {
    throw new BadRequestException('Invalid payload: Expected an array of countries');
  }
  console.log(airportsData.filter((country) => country));
  return await this.airportsService.insertAirports(airportsData.filter((country) => country));
}

@Get('getAll')
async getAllAirports() {
  return await this.airportsService.getAllAirports();
}

@Get('getTimezoneByIataCode/:iataCode')
async getTimezoneByIataCode(@Param('iataCode') iataCode: string) {
  const timeZone = await this.airportsService.getTimezoneByIataCode(iataCode);
  return { timeZone };
}

@Get('getNameByIataCode/:iataCode')
async getNameByIataCode(@Param('iataCode') iataCode: string) {
  const name = await this.airportsService.getNameByIataCode(iataCode);
  return { name };
}

}