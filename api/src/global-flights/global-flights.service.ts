// src/flights/flights.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SavedFlight } from '../schemas/saved-flight.schema';
import { GlobalFlightsInputDto } from './dto/input/global-flights.input.dto';
import { GlobalFlightDataModel } from '../schemas/global-flights.schema';
import { GlobalAirportsService } from '../global-airports/global-airports.service';

export interface FlightDetails {
  origin: string;
  destination: string;
  flightNumber: string;
  time: string[];
  timeUTC: string[];
  duration: string;
}

@Injectable()
export class GlobalFlightsService {
  constructor(
    @InjectModel(GlobalFlightDataModel.name) private flightDataModel: Model<GlobalFlightDataModel>,
    @InjectModel('SavedFlight') private savedFlightModel: Model<SavedFlight>,
    private readonly httpService: HttpService,
    private readonly airportsService: GlobalAirportsService,
  ) {}

  // Save each flight as a separate document
  
   async saveFlightData(flightData: GlobalFlightsInputDto & { data: string }) {
    const parsedData = JSON.parse(flightData.data);
    if (parsedData.trips?.length > 0) {
      for (const trip of parsedData.trips) {
        if (trip.dates?.length > 0) {
          for (const dateInfo of trip.dates) {
            if ( dateInfo.flights?.length > 0) {
              for (const flight of dateInfo.flights) {
                await this.flightDataModel.create({
                  origin: flightData.origin,
                  destination: flightData.destination,
                  flightNumber: flight.flightNumber,
                  time: flight.time,
                  duration: flight.duration,
                });
              }
            }
          }
        }
      }
    }
  
  }
  // Search flights (flat model)
  async searchFlights(departure: string, arrival: string, date: string) {
    return this.flightDataModel
      .find({
        origin: departure,
        destination: arrival,
        date: date,
      })
      .select('origin destination date flightNumber time timeUTC duration')
      .lean()
      .exec();
  }

  // Create a single flight document
  async createFlight(flightData: {
    flightNumber: string;
    origin: string;
    destination: string;
    time: string[];
    duration: string;
  }) {
    const doc = await this.flightDataModel.create(flightData);
    return doc.toObject(); // <-- Convert to plain JS object
  }

  // Save/unsave logic unchanged
  async saveFlightForUser(email: string, flightNumber: string) {
    try {
      const doc = await this.savedFlightModel.create({ email, flightNumber });
      return doc.toObject();
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictException('Flight already saved for this user');
      }
      throw err;
    }
  }

  async unsaveFlightForUser(email: string, flightNumber: string) {
    const result = await this.savedFlightModel.deleteOne({ email, flightNumber });
    return result;
  }

  // Get saved flights for user (flat model)
  async getSavedFlightsForUser(email: string) {
    const saved = await this.savedFlightModel.find({ email }).lean().exec();
    const flightNumbers = saved.map(s => s.flightNumber);
    const flightsData = await this.flightDataModel.find({ flightNumber: { $in: flightNumbers } }).lean().exec();
    return flightsData;
  }

  async getAllFlights() {
    return this.flightDataModel.find().select('origin destination date flightNumber time timeUTC duration').lean().exec();
  } 
}