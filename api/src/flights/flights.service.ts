// src/flights/flights.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FlightsInputDto } from './dto/input/flights.input.dto';
import { FlightDataModel } from '../schemas/flights.schema';
import { AirportsService } from '../airports/airports.service';
import { SavedFlight } from '../schemas/saved-flight.schema';
import { config } from '../shared/config/config';


export interface FlightDetails {
  origin: string;
  destination: string;
  flightNumber: string;
  time: string[];
  timeUTC: string[];
  duration: string;
  departureDate: string;
  arrivalDate: string;
}

@Injectable()
export class FlightsService {
  constructor(
    @InjectModel(FlightDataModel.name) private flightDataModel: Model<FlightDataModel>,
    @InjectModel('SavedFlight') private savedFlightModel: Model<SavedFlight>,
    private readonly httpService: HttpService,
    private readonly airportsService: AirportsService,
  ) {}

  private async saveFlightData(flightData: FlightsInputDto) {
    const parsedData = JSON.parse(flightData.data);
    const flightDetails: FlightDetails[] = [];

    // Handle farfinder API format
    if (parsedData.outbound?.fares) {
      console.log(`Processing farfinder data for ${flightData.origin} -> ${flightData.destination}`);
      for (const fare of parsedData.outbound.fares) {
        // Check if the fare is for the requested date and has valid flight data
        if (fare.day && fare.day.startsWith(flightData.date) && fare.departureDate && fare.arrivalDate && !fare.unavailable) {
          // Extract date and time portions
          const departureDateTime = fare.departureDate; // e.g., "2025-12-14T23:45:00"
          const arrivalDateTime = fare.arrivalDate;     // e.g., "2025-12-15T00:30:00"

          const departureDate = departureDateTime.split('T')[0]; // "2025-12-14"
          const arrivalDate = arrivalDateTime.split('T')[0];     // "2025-12-15"

          const departureTime = departureDateTime.split('T')[1].substring(0, 5); // "23:45"
          const arrivalTime = arrivalDateTime.split('T')[1].substring(0, 5);     // "00:30"

          // Calculate duration
          const depTime = new Date(departureDateTime);
          const arrTime = new Date(arrivalDateTime);
          const durationMs = arrTime.getTime() - depTime.getTime();
          const durationMinutes = Math.floor(durationMs / 60000);
          const hours = Math.floor(durationMinutes / 60);
          const minutes = durationMinutes % 60;
          const duration = `${hours}h ${minutes}m`;

          flightDetails.push({
            origin: flightData.origin,
            destination: flightData.destination,
            flightNumber: `FR-${fare.day}`, // Use day as unique identifier
            time: [departureDateTime, arrivalDateTime], // Store full datetime for calculations
            timeUTC: [departureDateTime, arrivalDateTime],
            duration: duration,
            departureDate: departureDate,
            arrivalDate: arrivalDate
          });
        }
      }
    }
    // Handle availability API format (original)
    else if (parsedData.trips?.length > 0) {
      for (const trip of parsedData.trips) {
        if (trip.dates?.length > 0) {
          for (const dateInfo of trip.dates) {
            if (dateInfo.dateOut.startsWith(flightData.date) && dateInfo.flights?.length > 0) {
              for (const flight of dateInfo.flights) {
                // Calculate arrival date based on departure time and duration
                const departureDate = flight.timeUTC?.[0] ? flight.timeUTC[0].split('T')[0] : flightData.date;
                let arrivalDate = departureDate;

                // If we have UTC times, calculate the actual arrival date
                if (flight.timeUTC?.[0] && flight.timeUTC?.[1]) {
                  arrivalDate = flight.timeUTC[1].split('T')[0];
                }

                flightDetails.push({
                  origin: flightData.origin,
                  destination: flightData.destination,
                  flightNumber: flight.flightNumber,
                  time: flight.time,
                  timeUTC: flight.timeUTC,
                  duration: flight.duration,
                  departureDate: departureDate,
                  arrivalDate: arrivalDate
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
      console.log(`✓ Saved ${flightDetails.length} flights for ${flightData.origin} -> ${flightData.destination} on ${flightData.date}`);
    } else {
      // console.log(`No flights found for ${flightData.origin} -> ${flightData.destination} on ${flightData.date}. Skipping save.`);
    }
  }

  // Fetch data from Ryanair API - Try simpler endpoint first
  private async fetchRyanairData(origin: string, destination: string, date: string) {
    // Try the simpler farfinder API first
    const farfinderUrl = `https://www.ryanair.com/api/farfnd/v4/oneWayFares/${origin}/${destination}/cheapestPerDay?outboundMonthOfDate=${date}`;

    try {
      const farfinderResponse = await firstValueFrom(
        this.httpService.get(farfinderUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://www.ryanair.com/gb/en',
          }
        })
      );

      // If farfinder works, transform the data
      if (farfinderResponse.data && farfinderResponse.data.outbound) {
        console.log(`✓ Farfinder API worked for ${origin} -> ${destination}`);
        console.log('📦 API Response:', JSON.stringify(farfinderResponse.data, null, 2));
        return farfinderResponse.data;
      }
    } catch (error) {
      console.log(`Farfinder failed for ${origin} -> ${destination}, trying availability API...`);
    }

    // Fallback to original availability API
    const url = `https://www.ryanair.com/api/booking/v4/en-gb/availability?ADT=1&TEEN=0&CHD=0&INF=0&Origin=${origin}&Destination=${destination}&promoCode=&IncludeConnectingFlights=false&DateOut=${date}&DateIn=&FlexDaysBeforeOut=2&FlexDaysOut=2&FlexDaysBeforeIn=2&FlexDaysIn=2&RoundTrip=false&IncludePrimeFares=false&ToUs=AGREED`;
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-GB,en;q=0.9',
            'Referer': 'https://www.ryanair.com/gb/en',
            'Origin': 'https://www.ryanair.com',
          }
        })
      );
      console.log(`✓ Availability API worked for ${origin} -> ${destination}`);
      console.log('📦 API Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error(`Both APIs failed for ${origin} -> ${destination}:`, error.message);
      return null;
    }
  }

  // Fetch Ryanair flights for a specific date (manual trigger)
  async fetchRyanairFlightsForDate(date: string) {
    if (!config.get('enable_ryanair_api')) {
      return {
        success: false,
        message: 'Ryanair API is disabled via configuration'
      };
    }

    console.log(`✓ Manually fetching Ryanair flights for ${date}...`);
    const airports = await this.airportsService.getAllAirports();
    let totalFetched = 0;
    let totalRoutes = 0;

    for (const originAirport of airports) {
      const destinations = originAirport.routes.map(route =>
        route.split(':')[1]
      );

      for (const destinationIata of destinations) {
        totalRoutes++;
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
          totalFetched++;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      success: true,
      totalRoutes,
      totalFetched,
      message: `Fetched flights for ${totalFetched} out of ${totalRoutes} routes`
    };
  }

  // Process flights for the next 3 days
  async processFlightsForNext3Days() {
    if (!config.get('enable_ryanair_api')) {
      console.log('⚠️ Ryanair API is disabled via configuration');
      return;
    }

    console.log('✓ Ryanair API is enabled, processing flights...');
    const airports = await this.airportsService.getAllAirports();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dates = this.generateDates(tomorrow, 3);

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
    return this.flightDataModel.find().lean().exec();
  }

  // Updated to return the simplified flight data
  async searchFlights(departure: string, arrival: string, date: string) {
    // First, check if we already have data
    const existingFlights = await this.flightDataModel
      .find({
        origin: departure,
        destination: arrival,
        date: date,
      })
      .select('origin destination date flights')
      .lean()
      .exec();

    // If we have data, return it
    if (existingFlights && existingFlights.length > 0) {
      console.log(`✓ Found cached flights for ${departure} -> ${arrival} on ${date}`);
      return existingFlights;
    }

    // If no data exists and Ryanair API is enabled, fetch it
    if (config.get('enable_ryanair_api')) {
      console.log(`⚡ No cached data, fetching from Ryanair API for ${departure} -> ${arrival} on ${date}...`);

      const data = await this.fetchRyanairData(departure, arrival, date);

      if (data) {
        const flightData: FlightsInputDto = {
          origin: departure,
          destination: arrival,
          date,
          data: JSON.stringify(data),
          createdAt: new Date(),
        };

        await this.saveFlightData(flightData);

        // Query again to return the newly saved data
        return this.flightDataModel
          .find({
            origin: departure,
            destination: arrival,
            date: date,
          })
          .select('origin destination date flights')
          .lean()
          .exec();
      }
    }

    // If API is disabled or fetch failed, return empty array
    console.log(`⚠️ No flights available for ${departure} -> ${arrival} on ${date}`);
    return [];
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

  async saveFlightForUser(email: string, flightNumber: string) {
    try {
      const doc = await this.savedFlightModel.create({ email, flightNumber });
      return doc.toObject();
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate key error
        throw new ConflictException('Flight already saved for this user');
      }
      throw err;
    }
  }

  async unsaveFlightForUser(email: string, flightNumber: string) {
    console.log('Deleting:', { email, flightNumber });
    const result = await this.savedFlightModel.deleteOne({ email, flightNumber });
    console.log('Delete result:', result);
    return result;
  }

  async getSavedFlightsForUser(email: string) {
    const saved = await this.savedFlightModel.find({ email }).lean().exec();
    const flightNumbers = saved.map(s => s.flightNumber);
    const flightsData = await this.flightDataModel.find({ 'flights.flightNumber': { $in: flightNumbers } }).lean().exec();

    // Flatten to only the saved flights
    const savedFlights: any[] = [];
    for (const doc of flightsData) {
        for (const flight of doc.flights) {
            if (flightNumbers.includes(flight.flightNumber)) {
                savedFlights.push({
                    ...flight,
                    origin: doc.origin,
                    destination: doc.destination,
                    date: doc.date,
                    _id: flight._id || doc._id // for React key
                });
            }
        }
    }
    return savedFlights;
}
}