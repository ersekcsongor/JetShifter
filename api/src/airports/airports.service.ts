import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AirportsInputDto } from './dto/input/airports.input.dto';
import { AirportsModel } from 'src/schemas/airports.schema';
@Injectable()
export class AirportsService {
  constructor(
    @InjectModel(AirportsModel.name) private airportModel: Model<AirportsModel>
  ) {}


  async insertCountries(countriesData: AirportsInputDto[]): Promise<void> {
    for (const country of countriesData) {
      const newCountry = new this.airportModel(country);
      await newCountry.save();
    }
  }

  async getAllCountries(): Promise<AirportsModel[]> {
    return await this.airportModel.find().exec();
  }
}