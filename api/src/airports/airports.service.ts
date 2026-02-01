// src/airports/airports.service.ts
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AirportsInputDto } from './dto/input/airports.input.dto';
import { AirportsModel } from '../schemas/airports.schema';

@Injectable()
export class AirportsService {
  constructor(
    @InjectModel(AirportsModel.name) private airportModel: Model<AirportsModel>,
  ) {}

  // Insert airports (for Ryanair data import)
  async insertAirports(countriesData: AirportsInputDto[]): Promise<void> {
    for (const country of countriesData) {
      const newCountry = new this.airportModel({
        ...country,
        ryanairRoutes: country.routes || [],
        isRyanairAirport: true,
      });
      await newCountry.save();
    }
  }

  // Get all airports (unified)
  async getAllAirports() {
    return this.airportModel.find()
      .select('iataCode name countryCode cityCode timeZone countryName latitude longitude ryanairRoutes isRyanairAirport -_id')
      .lean()
      .exec();
  }

  // Get only Ryanair airports
  async getRyanairAirports() {
    return this.airportModel.find({ isRyanairAirport: true })
      .select('iataCode name countryCode cityCode timeZone latitude longitude ryanairRoutes -_id')
      .lean()
      .exec();
  }

  // Get timezone by IATA code (works for all airports)
  async getTimezoneByIataCode(iataCode: string): Promise<string> {
    const airport = await this.airportModel.findOne({ iataCode }).exec();

    if (!airport) {
      throw new HttpException(`Airport ${iataCode} not found`, 404);
    }

    return airport.timeZone;
  }

  // Get name by IATA code (works for all airports)
  async getNameByIataCode(iataCode: string): Promise<string> {
    if (!iataCode || typeof iataCode !== 'string') {
      throw new HttpException('Invalid IATA code provided', 400);
    }

    const airport = await this.airportModel.findOne({ iataCode }).exec();

    if (!airport) {
      throw new HttpException(`Airport with IATA code ${iataCode} not found`, 404);
    }

    return airport.name;
  }

  // Add a single airport (for custom flights)
  async addSingleAirport(airportData: {
    iataCode: string;
    name: string;
    countryCode: string;
    cityCode?: string;
    timeZone: string;
    countryName?: string;
  }): Promise<{ message: string; airport: AirportsModel }> {
    // Check if airport already exists
    const existingAirport = await this.airportModel.findOne({ iataCode: airportData.iataCode }).exec();

    if (existingAirport) {
      throw new HttpException(`Airport with IATA code ${airportData.iataCode} already exists`, 409);
    }

    const newAirport = new this.airportModel({
      ...airportData,
      ryanairRoutes: [],
      isRyanairAirport: false,
    });
    await newAirport.save();

    return {
      message: `Airport ${airportData.iataCode} added successfully`,
      airport: newAirport
    };
  }

  // Get Ryanair routes from an airport
  async getRyanairRoutes(iataCode: string): Promise<string[]> {
    const airport = await this.airportModel.findOne({ iataCode, isRyanairAirport: true }).exec();

    if (!airport) {
      throw new HttpException(`Ryanair airport ${iataCode} not found`, 404);
    }

    return airport.ryanairRoutes;
  }
}
