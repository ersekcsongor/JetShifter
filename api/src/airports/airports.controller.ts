import { Controller, Post, Body, BadRequestException, Get } from '@nestjs/common';
import { AirportsService } from './airports.service';
import { AirportsInputDto } from './dto/input/airports.input.dto';

@Controller('airports')
export class AirportsController {
  constructor(private readonly countriesService: AirportsService) {}

@Post('insert')
async insertCountries(@Body() airportsData: AirportsInputDto[]) {
  console.log('Received payload:', airportsData);
  if (!Array.isArray(airportsData)) {
    throw new BadRequestException('Invalid payload: Expected an array of countries');
  }
  console.log(airportsData.filter((country) => country));
  return await this.countriesService.insertCountries(airportsData.filter((country) => country));
}

@Get('getAll')
async getAllCountries() {
  return await this.countriesService.getAllCountries();
}
}