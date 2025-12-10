// Static transatlantic flight data based on typical airline schedules
// Flight times are consistent and suitable for jetlag optimization

export interface StaticFlightSchedule {
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string; // HH:MM format (local time at origin)
  arrivalTime: string; // HH:MM format (local time at destination)
  duration: string; // e.g., "8h 30m"
  airline: string;
  frequency: string; // e.g., "Daily"
}

export const TRANSATLANTIC_FLIGHT_SCHEDULES: StaticFlightSchedule[] = [
  // Frankfurt (FRA) to USA
  { flightNumber: 'LH400', origin: 'FRA', destination: 'JFK', departureTime: '10:00', arrivalTime: '13:30', duration: '8h 30m', airline: 'Lufthansa', frequency: 'Daily' },
  { flightNumber: 'LH404', origin: 'FRA', destination: 'JFK', departureTime: '17:30', arrivalTime: '21:00', duration: '8h 30m', airline: 'Lufthansa', frequency: 'Daily' },
  { flightNumber: 'LH402', origin: 'FRA', destination: 'EWR', departureTime: '11:00', arrivalTime: '14:30', duration: '8h 30m', airline: 'Lufthansa', frequency: 'Daily' },
  { flightNumber: 'LH430', origin: 'FRA', destination: 'ORD', departureTime: '13:30', arrivalTime: '16:30', duration: '9h 0m', airline: 'Lufthansa', frequency: 'Daily' },
  { flightNumber: 'LH452', origin: 'FRA', destination: 'LAX', departureTime: '13:30', arrivalTime: '17:00', duration: '11h 30m', airline: 'Lufthansa', frequency: 'Daily' },
  { flightNumber: 'LH454', origin: 'FRA', destination: 'SFO', departureTime: '14:00', arrivalTime: '17:00', duration: '11h 0m', airline: 'Lufthansa', frequency: 'Daily' },
  { flightNumber: 'LH462', origin: 'FRA', destination: 'MIA', departureTime: '10:30', arrivalTime: '15:30', duration: '10h 0m', airline: 'Lufthansa', frequency: 'Daily' },

  // Munich (MUC) to USA
  { flightNumber: 'LH410', origin: 'MUC', destination: 'JFK', departureTime: '10:30', arrivalTime: '14:00', duration: '9h 30m', airline: 'Lufthansa', frequency: 'Daily' },
  { flightNumber: 'LH452', origin: 'MUC', destination: 'LAX', departureTime: '12:00', arrivalTime: '15:30', duration: '11h 30m', airline: 'Lufthansa', frequency: 'Daily' },
  { flightNumber: 'LH434', origin: 'MUC', destination: 'ORD', departureTime: '10:00', arrivalTime: '13:00', duration: '9h 0m', airline: 'Lufthansa', frequency: 'Daily' },

  // London Heathrow (LHR) to USA
  { flightNumber: 'BA112', origin: 'LHR', destination: 'JFK', departureTime: '08:30', arrivalTime: '11:30', duration: '8h 0m', airline: 'British Airways', frequency: 'Daily' },
  { flightNumber: 'BA114', origin: 'LHR', destination: 'JFK', departureTime: '12:00', arrivalTime: '15:00', duration: '8h 0m', airline: 'British Airways', frequency: 'Daily' },
  { flightNumber: 'BA178', origin: 'LHR', destination: 'JFK', departureTime: '17:00', arrivalTime: '20:00', duration: '8h 0m', airline: 'British Airways', frequency: 'Daily' },
  { flightNumber: 'BA268', origin: 'LHR', destination: 'LAX', departureTime: '10:00', arrivalTime: '13:30', duration: '10h 30m', airline: 'British Airways', frequency: 'Daily' },
  { flightNumber: 'BA286', origin: 'LHR', destination: 'SFO', departureTime: '11:00', arrivalTime: '14:00', duration: '10h 0m', airline: 'British Airways', frequency: 'Daily' },
  { flightNumber: 'BA296', origin: 'LHR', destination: 'ORD', departureTime: '10:30', arrivalTime: '13:30', duration: '8h 0m', airline: 'British Airways', frequency: 'Daily' },
  { flightNumber: 'BA202', origin: 'LHR', destination: 'BOS', departureTime: '09:00', arrivalTime: '11:45', duration: '7h 45m', airline: 'British Airways', frequency: 'Daily' },

  // Paris CDG to USA
  { flightNumber: 'AF006', origin: 'CDG', destination: 'JFK', departureTime: '10:30', arrivalTime: '13:30', duration: '8h 0m', airline: 'Air France', frequency: 'Daily' },
  { flightNumber: 'AF008', origin: 'CDG', destination: 'JFK', departureTime: '14:00', arrivalTime: '17:00', duration: '8h 0m', airline: 'Air France', frequency: 'Daily' },
  { flightNumber: 'AF066', origin: 'CDG', destination: 'LAX', departureTime: '11:00', arrivalTime: '14:30', duration: '11h 30m', airline: 'Air France', frequency: 'Daily' },
  { flightNumber: 'AF083', origin: 'CDG', destination: 'SFO', departureTime: '10:30', arrivalTime: '13:30', duration: '11h 0m', airline: 'Air France', frequency: 'Daily' },

  // Amsterdam (AMS) to USA
  { flightNumber: 'KL641', origin: 'AMS', destination: 'JFK', departureTime: '10:30', arrivalTime: '13:00', duration: '7h 30m', airline: 'KLM', frequency: 'Daily' },
  { flightNumber: 'KL605', origin: 'AMS', destination: 'LAX', departureTime: '11:00', arrivalTime: '14:00', duration: '10h 0m', airline: 'KLM', frequency: 'Daily' },

  // Madrid (MAD) to USA
  { flightNumber: 'IB6251', origin: 'MAD', destination: 'JFK', departureTime: '11:00', arrivalTime: '14:00', duration: '8h 0m', airline: 'Iberia', frequency: 'Daily' },

  // Barcelona (BCN) to USA
  { flightNumber: 'IB2625', origin: 'BCN', destination: 'JFK', departureTime: '12:00', arrivalTime: '15:00', duration: '8h 0m', airline: 'Iberia', frequency: 'Daily' },

  // Rome (FCO) to USA
  { flightNumber: 'AZ608', origin: 'FCO', destination: 'JFK', departureTime: '10:00', arrivalTime: '14:00', duration: '9h 0m', airline: 'ITA Airways', frequency: 'Daily' },

  // Milan (MXP) to USA
  { flightNumber: 'AZ610', origin: 'MXP', destination: 'JFK', departureTime: '11:00', arrivalTime: '15:00', duration: '9h 0m', airline: 'ITA Airways', frequency: 'Daily' },

  // ========== RETURN FLIGHTS (USA to Europe) ==========

  // New York (JFK) to Europe
  { flightNumber: 'LH401', origin: 'JFK', destination: 'FRA', departureTime: '18:00', arrivalTime: '07:30+1', duration: '7h 30m', airline: 'Lufthansa', frequency: 'Daily' },
  { flightNumber: 'LH403', origin: 'JFK', destination: 'FRA', departureTime: '23:00', arrivalTime: '12:30+1', duration: '7h 30m', airline: 'Lufthansa', frequency: 'Daily' },
  { flightNumber: 'LH411', origin: 'JFK', destination: 'MUC', departureTime: '17:30', arrivalTime: '07:30+1', duration: '8h 0m', airline: 'Lufthansa', frequency: 'Daily' },
  { flightNumber: 'BA113', origin: 'JFK', destination: 'LHR', departureTime: '19:00', arrivalTime: '07:00+1', duration: '7h 0m', airline: 'British Airways', frequency: 'Daily' },
  { flightNumber: 'BA115', origin: 'JFK', destination: 'LHR', departureTime: '22:00', arrivalTime: '10:00+1', duration: '7h 0m', airline: 'British Airways', frequency: 'Daily' },
  { flightNumber: 'AF007', origin: 'JFK', destination: 'CDG', departureTime: '18:30', arrivalTime: '08:00+1', duration: '7h 30m', airline: 'Air France', frequency: 'Daily' },

  // Los Angeles (LAX) to Europe
  { flightNumber: 'LH453', origin: 'LAX', destination: 'FRA', departureTime: '16:30', arrivalTime: '13:30+1', duration: '11h 0m', airline: 'Lufthansa', frequency: 'Daily' },
  { flightNumber: 'BA269', origin: 'LAX', destination: 'LHR', departureTime: '17:00', arrivalTime: '11:30+1', duration: '10h 30m', airline: 'British Airways', frequency: 'Daily' },
  { flightNumber: 'AF067', origin: 'LAX', destination: 'CDG', departureTime: '18:00', arrivalTime: '14:00+1', duration: '10h 0m', airline: 'Air France', frequency: 'Daily' },

  // Chicago (ORD) to Europe
  { flightNumber: 'LH431', origin: 'ORD', destination: 'FRA', departureTime: '19:00', arrivalTime: '10:30+1', duration: '8h 30m', airline: 'Lufthansa', frequency: 'Daily' },
  { flightNumber: 'BA297', origin: 'ORD', destination: 'LHR', departureTime: '18:30', arrivalTime: '08:00+1', duration: '7h 30m', airline: 'British Airways', frequency: 'Daily' },

  // San Francisco (SFO) to Europe
  { flightNumber: 'LH455', origin: 'SFO', destination: 'FRA', departureTime: '16:00', arrivalTime: '12:30+1', duration: '10h 30m', airline: 'Lufthansa', frequency: 'Daily' },
  { flightNumber: 'BA287', origin: 'SFO', destination: 'LHR', departureTime: '18:00', arrivalTime: '12:30+1', duration: '10h 30m', airline: 'British Airways', frequency: 'Daily' },

  // Boston (BOS) to Europe
  { flightNumber: 'BA213', origin: 'BOS', destination: 'LHR', departureTime: '20:00', arrivalTime: '07:30+1', duration: '6h 30m', airline: 'British Airways', frequency: 'Daily' },

  // Miami (MIA) to Europe
  { flightNumber: 'LH463', origin: 'MIA', destination: 'FRA', departureTime: '18:30', arrivalTime: '09:30+1', duration: '9h 0m', airline: 'Lufthansa', frequency: 'Daily' },
];

// Helper to get flights by route
export function getFlightsByRoute(origin: string, destination: string): StaticFlightSchedule[] {
  return TRANSATLANTIC_FLIGHT_SCHEDULES.filter(
    f => f.origin === origin.toUpperCase() && f.destination === destination.toUpperCase()
  );
}

// Helper to get all unique routes
export function getAllRoutes(): { origin: string; destination: string; count: number }[] {
  const routeMap = new Map<string, number>();

  TRANSATLANTIC_FLIGHT_SCHEDULES.forEach(flight => {
    const key = `${flight.origin}-${flight.destination}`;
    routeMap.set(key, (routeMap.get(key) || 0) + 1);
  });

  return Array.from(routeMap.entries()).map(([route, count]) => {
    const [origin, destination] = route.split('-');
    return { origin, destination, count };
  });
}
