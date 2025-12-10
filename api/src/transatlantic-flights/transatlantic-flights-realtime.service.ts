import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalFlightDataModel } from '../schemas/global-flights.schema';
import { GoogleFlightsScraper, ScrapedFlight } from './google-flights-scraper';
import { TRANSATLANTIC_FLIGHT_SCHEDULES, getAllRoutes } from './transatlantic-flight-data';

export interface TransatlanticRoute {
  origin: string;
  destination: string;
  originName: string;
  destinationName: string;
}

@Injectable()
export class TransatlanticFlightsRealtimeService {
  private scraper: GoogleFlightsScraper;

  // Top transatlantic routes for jetlag optimization
  private readonly TOP_ROUTES: TransatlanticRoute[] = [
    // Europe to USA (Eastbound flights - harder jetlag)
    { origin: 'LHR', destination: 'JFK', originName: 'London', destinationName: 'New York' },
    { origin: 'LHR', destination: 'LAX', originName: 'London', destinationName: 'Los Angeles' },
    { origin: 'CDG', destination: 'JFK', originName: 'Paris', destinationName: 'New York' },
    { origin: 'FRA', destination: 'JFK', originName: 'Frankfurt', destinationName: 'New York' },
    { origin: 'FRA', destination: 'LAX', originName: 'Frankfurt', destinationName: 'Los Angeles' },
    { origin: 'AMS', destination: 'JFK', originName: 'Amsterdam', destinationName: 'New York' },

    // USA to Europe (Westbound flights - easier jetlag)
    { origin: 'JFK', destination: 'LHR', originName: 'New York', destinationName: 'London' },
    { origin: 'JFK', destination: 'CDG', originName: 'New York', destinationName: 'Paris' },
    { origin: 'JFK', destination: 'FRA', originName: 'New York', destinationName: 'Frankfurt' },
    { origin: 'LAX', destination: 'LHR', originName: 'Los Angeles', destinationName: 'London' },
  ];

  constructor(
    @InjectModel(GlobalFlightDataModel.name)
    private flightDataModel: Model<GlobalFlightDataModel>,
  ) {
    this.scraper = new GoogleFlightsScraper();
  }

  // Parse time string from Google Flights (e.g., "10:30 AM" or "Depart at 10:30 AM")
  private parseTime(timeStr: string): string {
    // Extract time from strings like "Depart at 10:30 AM" or "Arrive at 2:30 PM"
    const match = timeStr.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
    if (match) {
      return match[1];
    }
    return timeStr;
  }

  // Convert 12-hour time to 24-hour format
  private convertTo24Hour(time: string): string {
    const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return time;

    let [, hours, minutes, period] = match;
    let hour = parseInt(hours);

    if (period.toUpperCase() === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  }

  // Save scraped flights to database
  private async saveScrapedFlights(
    origin: string,
    destination: string,
    date: string,
    flights: ScrapedFlight[],
  ) {
    let savedCount = 0;

    for (const flight of flights) {
      try {
        // Skip flights with stops (focus on direct flights for jetlag)
        if (flight.stops > 0) {
          continue;
        }

        // Check if flight already exists
        const existing = await this.flightDataModel.findOne({
          origin,
          destination,
          flightNumber: flight.flightNumber,
        });

        if (!existing) {
          const departureTime = this.parseTime(flight.departureTime);
          const arrivalTime = this.parseTime(flight.arrivalTime);

          // Create ISO datetime strings (approximate - use today's date + times)
          const baseDate = new Date(date);
          const departure24 = this.convertTo24Hour(departureTime);
          const arrival24 = this.convertTo24Hour(arrivalTime);

          const [depHour, depMin] = departure24.split(':').map(Number);
          const [arrHour, arrMin] = arrival24.split(':').map(Number);

          const departureDateTime = new Date(baseDate);
          departureDateTime.setHours(depHour, depMin, 0);

          const arrivalDateTime = new Date(baseDate);
          arrivalDateTime.setHours(arrHour, arrMin, 0);

          // If arrival time is earlier than departure, add a day
          if (arrivalDateTime < departureDateTime) {
            arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
          }

          await this.flightDataModel.create({
            origin,
            destination,
            flightNumber: flight.flightNumber,
            time: [departureDateTime.toISOString(), arrivalDateTime.toISOString()],
            duration: flight.duration,
          });

          savedCount++;
          console.log(`✓ Saved: ${flight.airline} ${origin}→${destination} (${flight.duration})`);
        }
      } catch (error) {
        console.error(`Failed to save flight ${flight.flightNumber}:`, error.message);
      }
    }

    return savedCount;
  }

  // Scrape and save flights for a specific route
  async scrapeRoute(origin: string, destination: string, date: string) {
    console.log(`\nScraping flights: ${origin} → ${destination} on ${date}`);

    const flights = await this.scraper.scrapeFlights(origin, destination, date);

    if (flights.length === 0) {
      console.log(`  No flights found`);
      return { success: false, count: 0 };
    }

    const savedCount = await this.saveScrapedFlights(origin, destination, date, flights);

    return {
      success: true,
      count: savedCount,
      total: flights.length,
    };
  }

  // Scrape top transatlantic routes for the next few days
  async scrapeTopRoutes(daysAhead: number = 3) {
    console.log(`\n🔍 Starting real-time transatlantic flight scraping...`);
    console.log(`Routes: ${this.TOP_ROUTES.length}, Days: ${daysAhead}\n`);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dates = this.generateDates(tomorrow, daysAhead);

    const results = {
      totalRoutes: 0,
      totalFlights: 0,
      errors: 0,
    };

    for (const date of dates) {
      console.log(`\n📅 Processing date: ${date}`);

      for (const route of this.TOP_ROUTES) {
        try {
          const result = await this.scrapeRoute(route.origin, route.destination, date);

          if (result.success) {
            results.totalRoutes++;
            results.totalFlights += result.count;
          } else {
            results.errors++;
          }

          // Wait 10 seconds between requests to avoid blocking
          console.log('  ⏳ Waiting 10s...');
          await new Promise(resolve => setTimeout(resolve, 10000));

        } catch (error) {
          console.error(`Error scraping ${route.origin}→${route.destination}:`, error.message);
          results.errors++;
        }
      }
    }

    await this.scraper.close();

    console.log(`\n✅ Scraping completed!`);
    console.log(`Routes processed: ${results.totalRoutes}`);
    console.log(`Flights saved: ${results.totalFlights}`);
    console.log(`Errors: ${results.errors}`);

    return results;
  }

  // Get all available routes from static data
  getAvailableRoutes(): TransatlanticRoute[] {
    const routes = getAllRoutes();
    return routes.map(route => ({
      origin: route.origin,
      destination: route.destination,
      originName: this.getAirportName(route.origin),
      destinationName: this.getAirportName(route.destination),
    }));
  }

  // Helper to get airport names
  private getAirportName(code: string): string {
    const names: Record<string, string> = {
      'FRA': 'Frankfurt',
      'MUC': 'Munich',
      'LHR': 'London Heathrow',
      'CDG': 'Paris CDG',
      'AMS': 'Amsterdam',
      'MAD': 'Madrid',
      'BCN': 'Barcelona',
      'FCO': 'Rome Fiumicino',
      'MXP': 'Milan Malpensa',
      'JFK': 'New York JFK',
      'EWR': 'Newark',
      'ORD': 'Chicago O\'Hare',
      'LAX': 'Los Angeles',
      'SFO': 'San Francisco',
      'MIA': 'Miami',
      'BOS': 'Boston',
    };
    return names[code] || code;
  }

  // Get timezone for a transatlantic airport
  getTimezoneForAirport(code: string): string | null {
    const timezones: Record<string, string> = {
      'FRA': 'Europe/Berlin',
      'MUC': 'Europe/Berlin',
      'LHR': 'Europe/London',
      'CDG': 'Europe/Paris',
      'AMS': 'Europe/Amsterdam',
      'MAD': 'Europe/Madrid',
      'BCN': 'Europe/Madrid',
      'FCO': 'Europe/Rome',
      'MXP': 'Europe/Rome',
      'JFK': 'America/New_York',
      'EWR': 'America/New_York',
      'ORD': 'America/Chicago',
      'LAX': 'America/Los_Angeles',
      'SFO': 'America/Los_Angeles',
      'MIA': 'America/New_York',
      'BOS': 'America/New_York',
    };
    return timezones[code] || null;
  }

  // Search flights from static data
  async searchFlights(origin: string, destination: string) {
    // Return flights from static data
    const flights = TRANSATLANTIC_FLIGHT_SCHEDULES.filter(
      f => f.origin === origin.toUpperCase() && f.destination === destination.toUpperCase()
    );

    return flights.map(flight => ({
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      airline: flight.airline,
      frequency: flight.frequency,
    }));
  }

  // Generate array of date strings
  private generateDates(startDate: Date, days: number): string[] {
    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }
}
