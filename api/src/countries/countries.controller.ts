import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountryInputDto } from './dto/input/country.input.dto';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

@Post('insert')
async insertCountries(@Body() countriesData: CountryInputDto[]) {
  console.log('Received payload:', countriesData); // Debugging
  if (!Array.isArray(countriesData)) {
    throw new BadRequestException('Invalid payload: Expected an array of countries');
  }
  console.log(countriesData.filter((country) => country.phonePrefix));
  return await this.countriesService.insertCountries(countriesData.filter((country) => country.phonePrefix));
}
}