import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { CountriesService } from './countries.service';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

@Post('insert')
async insertCountries(@Body() countriesData: any[]) {
  console.log('Received payload:', countriesData); // Debugging
  if (!Array.isArray(countriesData)) {
    throw new BadRequestException('Invalid payload: Expected an array of countries');
  }
  await this.countriesService.insertCountries(countriesData);
  return { message: 'Countries inserted successfully' };
}
}