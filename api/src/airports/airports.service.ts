// src/airports/airports.service.ts
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AirportsInputDto } from './dto/input/airports.input.dto';
import { AirportsModel } from 'src/schemas/airports.schema';

@Injectable()
export class AirportsService {
  constructor(
    @InjectModel(AirportsModel.name) private airportModel: Model<AirportsModel>,
  ) {}

  async insertAirports(countriesData: AirportsInputDto[]): Promise<void> {
    for (const country of countriesData) {
      const newCountry = new this.airportModel(country);
      await newCountry.save();
    }
  }

  async getAllAirports(): Promise<AirportsModel[]> {
    return await this.airportModel.find().exec();
  }

  async getTimezoneByIataCode(iataCode: string): Promise<string> {
    const airport = await this.airportModel.findOne({ iataCode }).exec();
    
    if (!airport) {
      throw new HttpException(`Airport ${iataCode} not found`,404);
    }
    
    return airport.timeZone;
  }
  
  async getTimezonesForAirports(iataCodes: string[]): Promise<Record<string, string>> {
    const airports = await this.airportModel.find({
      iataCode: { $in: iataCodes }
    }).exec();
    
    return airports.reduce((acc, airport) => {
      acc[airport.iataCode] = airport.timeZone;
      return acc;
    }, {});
  }
}