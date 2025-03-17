import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CountryModel } from 'src/schemas/country.schema';
import { CountryInputDto } from './dto/input/country.input.dto';

@Injectable()
export class CountriesService {
  constructor(
    @InjectModel(CountryModel.name) private countryModel: Model<CountryModel>
  ) {}


  async insertCountries(countriesData: CountryInputDto[]): Promise<void> {
    for (const country of countriesData) {
      const newCountry = new this.countryModel(country);
      await newCountry.save();
    }
  }

  async getAllCountries(): Promise<CountryModel[]> {
    return await this.countryModel.find().exec();
  }
}