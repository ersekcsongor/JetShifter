// src/flights/flights.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FlightsInputDto } from './dto/input/flights.input.dto';
import { FlightDataModel } from 'src/schemas/flights.schema';
import { AirportsService } from 'src/airports/airports.service';


export interface FlightDetails {
  origin: string;
  destination: string;
  flightNumber: string;
  time: string[];
  timeUTC: string[];
  duration: string;
}

@Injectable()
export class FlightsService {
  constructor(
    @InjectModel(FlightDataModel.name) private flightDataModel: Model<FlightDataModel>,
    private readonly httpService: HttpService,
    private readonly airportsService: AirportsService,
  ) {}

  private async saveFlightData(flightData: FlightsInputDto) {
    const parsedData = JSON.parse(flightData.data);
    const flightDetails: FlightDetails[] = [];
    
    if (parsedData.trips?.length > 0) {
      for (const trip of parsedData.trips) {
        if (trip.dates?.length > 0) {
          for (const dateInfo of trip.dates) {
            if (dateInfo.dateOut.startsWith(flightData.date) && dateInfo.flights?.length > 0) {
              for (const flight of dateInfo.flights) {
                flightDetails.push({
                  origin: flightData.origin,
                  destination: flightData.destination,
                  flightNumber: flight.flightNumber,
                  time: flight.time,
                  timeUTC: flight.timeUTC,
                  duration: flight.duration
                });
              }
            }
          }
        }
      }
    }

    // Only save if there are flights
    if (flightDetails.length > 0) {
      await this.flightDataModel.create({
        origin: flightData.origin,
        destination: flightData.destination,
        date: flightData.date,
        flights: flightDetails,
      });
      console.log(`Saved flights for ${flightData.origin} -> ${flightData.destination} on ${flightData.date}`);
    } else {
      // console.log(`No flights found for ${flightData.origin} -> ${flightData.destination} on ${flightData.date}. Skipping save.`);
    }
  }

  // Fetch data from Ryanair API (unchanged)
  private async fetchRyanairData(origin: string, destination: string, date: string) {
    const url = `https://www.ryanair.com/api/booking/v4/en-gb/availability?ADT=1&TEEN=0&CHD=0&INF=0&Origin=${origin}&Destination=${destination}&promoCode=&IncludeConnectingFlights=false&DateOut=${date}&DateIn=&FlexDaysBeforeOut=2&FlexDaysOut=2&FlexDaysBeforeIn=2&FlexDaysIn=2&RoundTrip=false&IncludePrimeFares=false&ToUs=AGREED`;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      console.error(`Error fetching Ryanair data for ${origin} -> ${destination}:`, error);
      return null;
    }
  }

  // Process flights for the next 3 days (unchanged)
  async processFlightsForNext3Days() {
    const airports = await this.airportsService.getAllAirports();
    const dates = this.generateDates(new Date(), 3);

    for (const date of dates) {
      for (const originAirport of airports) {
        const destinations = originAirport.routes.map(route => 
          route.split(':')[1]
        );

        for (const destinationIata of destinations) {
          const destinationAirport = airports.find(
            a => a.iataCode === destinationIata
          );

          if (!destinationAirport) {
            console.log(`Skipping invalid destination: ${destinationIata}`);
            continue;
          }

          const data = await this.fetchRyanairData(
            originAirport.iataCode,
            destinationIata,
            date
          );

          if (data) {
            const flightData: FlightsInputDto = {
              origin: originAirport.iataCode,
              destination: destinationIata,
              date,
              data: JSON.stringify(data),
              createdAt: new Date(),
            };

            await this.saveFlightData(flightData);
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }

  // Utility to generate dates (unchanged)
  private generateDates(startDate: Date, days: number): string[] {
    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  // Updated to return the simplified flight data
  async getAllFlights() {
    return this.flightDataModel.find().select('origin destination date flights');
  }

  // Updated to return the simplified flight data
  async searchFlights(departure: string, arrival: string, date: string) {
    return this.flightDataModel
      .find({
        origin: departure,
        destination: arrival,
        date: date,
      })
      .select('origin destination date flights')
      .exec();
  }

  async createFlight(flightData: {
    origin: string;
    destination: string;
    date: string;
    flights: Record<string, any>;
  }) {
    const newFlight = new this.flightDataModel(flightData);
    return await newFlight.save();
  }

}