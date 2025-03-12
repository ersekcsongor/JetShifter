import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CountryModel } from 'src/schemas/country.schema';

@Injectable()
export class CountriesService {
  constructor(
    @InjectModel(CountryModel.name) private countryModel: Model<CountryModel>
  ) {}


  async insertCountries(countriesData: any[]): Promise<void> {
    for (const country of countriesData) {
      const newCountry = new this.countryModel(country);
      await newCountry.save();
    }
  }
}