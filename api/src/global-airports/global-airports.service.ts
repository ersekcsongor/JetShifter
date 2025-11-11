// filepath: d:\Allamvizsga2\JetShifter\JetShifter\api\src\global-airports\global-airports.service.ts
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalAirportsInputDto } from './dto/input/global-airports.input.dto';
import { GlobalAirportsModel } from '../schemas/global-airports.schema';

@Injectable()
export class GlobalAirportsService {
  constructor(
    @InjectModel(GlobalAirportsModel.name) private globalAirportModel: Model<GlobalAirportsModel>,
  ) {}

  async insertGlobalAirports(globalAirportsData: GlobalAirportsInputDto[]): Promise<void> {
    for (const airport of globalAirportsData) {
      const newAirport = new this.globalAirportModel(airport);
      await newAirport.save();
    }
  }

  async getAllGlobalAirports(): Promise<GlobalAirportsModel[]> {
    return this.globalAirportModel.find()
      .select('iataCode name countryCode cityCode timeZone countryName -_id')
      .lean()
      .exec();
  }

  async getTimezoneByIataCode(iataCode: string): Promise<string> {
    const airport = await this.globalAirportModel.findOne({ iataCode }).exec();
    
    if (!airport) {
      throw new HttpException(`Global Airport ${iataCode} not found`, 404);
    }
    
    return airport.timeZone;
  }

  async getNameByIataCode(iataCode: string): Promise<string> {
    if (!iataCode || typeof iataCode !== 'string') {
      throw new HttpException('Invalid IATA code provided', 400);
    }
    
    const airport = await this.globalAirportModel.findOne({ iataCode }).exec();
    
    if (!airport) {
      throw new HttpException(`Global Airport with IATA code ${iataCode} not found`, 404);
    }
    
    return airport.name;
  }
}