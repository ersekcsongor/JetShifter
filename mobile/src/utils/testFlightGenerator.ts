// utils/testFlightGenerator.ts
import Flight from '~/types/Flight';
import moment from 'moment-timezone';

/**
 * Generate a test flight with times starting very soon
 * This is useful for testing notification scheduling
 */
export function generateTestFlight(): Flight {
  const now = new Date();

  // Flight departs in 2 hours from now
  const departureTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const arrivalTime = new Date(departureTime.getTime() + 7 * 60 * 60 * 1000); // 7 hour flight

  // Format times as "HH:MM"
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return {
    flightNumber: 'TEST001',
    origin: 'JFK', // New York (EST/EDT, UTC-5/-4)
    destination: 'LHR', // London (GMT/BST, UTC+0/+1)
    time: [formatTime(departureTime), formatTime(arrivalTime)],
    duration: '7h 0m'
  };
}

/**
 * Generate a test flight for immediate notification testing
 * First switching time will be in ~10 minutes
 */
export function generateImmediateTestFlight(): Flight {
  const now = new Date();

  // Flight departs in 10 minutes from now
  const departureTime = new Date(now.getTime() + 10 * 60 * 1000);
  const arrivalTime = new Date(departureTime.getTime() + 7 * 60 * 60 * 1000); // 7 hour flight

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return {
    flightNumber: 'TESTNOW',
    origin: 'JFK', // New York
    destination: 'LHR', // London
    time: [formatTime(departureTime), formatTime(arrivalTime)],
    duration: '7h 0m'
  };
}

/**
 * Get current time info for debugging
 */
export function getCurrentTimeInfo() {
  const now = new Date();
  return {
    localTime: now.toLocaleString(),
    isoTime: now.toISOString(),
    timestamp: now.getTime(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}
