import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format, parseISO, isSameDay } from 'date-fns';
import moment from 'moment-timezone';
import ENV from '~/utils/constants';
import { useTheme } from '~/contexts/ThemeContext';

type FlightHeaderProps = {
  flight: {
    flightNumber: string;
    origin: string;        // e.g. "NYC"
    destination: string;   // e.g. "SFO"
    duration: string;      // e.g. "2h 10m"
    time: string[];        // [departureTimeISO, arrivalTimeISO]
  };
  timezones?: {
    originTz?: string;
    destTz?: string;
  };
};

const isSameDayCheck = (dateString1: string, dateString2: string) => {
  const date1 = parseISO(dateString1);
  const date2 = parseISO(dateString2);
  return isSameDay(date1, date2);
};

const formatDate = (dateString: string) => {
  return format(parseISO(dateString), 'dd MMM yyyy');
};

const formatTime = (dateString: string) => {
  return format(parseISO(dateString), 'HH:mm');
};

const formatTimeInTimezone = (dateString: string, timezone?: string) => {
  if (!timezone) {
    return formatTime(dateString);
  }
  return moment(dateString).tz(timezone).format('HH:mm');
};

const formatDateInTimezone = (dateString: string, timezone?: string) => {
  if (!timezone) {
    return format(parseISO(dateString), 'dd MMM yyyy');
  }
  return moment(dateString).tz(timezone).format('DD MMM YYYY');
};

export const FlightHeader = ({ flight, timezones }: FlightHeaderProps) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const [originCountry, setOriginCountry] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');

  // Helper function to fetch country by IATA code
  const fetchCountryByIata = async (iataCode: string) => {
    try {

      const response = await fetch(`${ENV.API_BASE_URL}/global-airports/getNameByIataCode/${iataCode}`);
      

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      if (!data.name) {
        console.warn('No "name" field in response:', data);
        return '';
      }
  
      return data.name;
    } catch (error) {
      console.error('Error fetching country:', error);
      return '';
    }
  };

  // Fetch countries for origin & destination
  useEffect(() => {
    (async () => {
      const originRes = await fetchCountryByIata(flight.origin);
      const destinationRes = await fetchCountryByIata(flight.destination);
      setOriginCountry(originRes);
      setDestinationCountry(destinationRes);
    })();
  }, [flight.origin, flight.destination]);

  const sameDay = isSameDayCheck(flight.time[0], flight.time[1]);

  const iconColor = isDarkMode ? '#9ca3af' : '#6b7280';
  const textColor = isDarkMode ? '#ffffff' : '#1a1a1a';
  const subtextColor = isDarkMode ? '#9ca3af' : '#6b7280';

  return (
    <View style={styles.headerContainer}>
      <Text style={[styles.flightNumber, { color: subtextColor }]}>
        Flight {flight.flightNumber}
      </Text>

      <View style={styles.routeContainer}>
        <View style={styles.cityColumn}>
          <Text style={[styles.cityCode, { color: textColor }]}>{flight.origin}</Text>
          {!!originCountry && (
            <Text style={[styles.cityName, { color: subtextColor }]}>{originCountry}</Text>
          )}
          <Text style={[styles.timeText, { color: textColor }]}>
            {formatTimeInTimezone(flight.time[0], timezones?.originTz)}
          </Text>
          {timezones?.originTz && (
            <Text style={[styles.timezoneText, { color: subtextColor }]}>
              {moment.tz(timezones.originTz).format('z')}
            </Text>
          )}
        </View>

        <View style={styles.flightInfoCenter}>
          <MaterialIcons
            name="flight"
            size={28}
            color={iconColor}
            style={styles.planeIcon}
          />
          <Text style={[styles.duration, { color: subtextColor }]}>
            {flight.duration}
          </Text>
        </View>

        <View style={styles.cityColumn}>
          <Text style={[styles.cityCode, { color: textColor }]}>{flight.destination}</Text>
          {!!destinationCountry && (
            <Text style={[styles.cityName, { color: subtextColor }]}>{destinationCountry}</Text>
          )}
          <Text style={[styles.timeText, { color: textColor }]}>
            {formatTimeInTimezone(flight.time[1], timezones?.destTz)}
          </Text>
          {timezones?.destTz && (
            <Text style={[styles.timezoneText, { color: subtextColor }]}>
              {moment.tz(timezones.destTz).format('z')}
            </Text>
          )}
          {!sameDay && (
            <Text style={[styles.nextDayBadge, { color: '#ff6b6b' }]}>+1 day</Text>
          )}
        </View>
      </View>

      <Text style={[styles.dateText, { color: subtextColor }]}>
        {formatDateInTimezone(flight.time[0], timezones?.originTz)}
        {!sameDay && ` → ${formatDateInTimezone(flight.time[1], timezones?.destTz)}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  flightNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    width: '100%',
  },
  cityColumn: {
    alignItems: 'center',
    flex: 1,
  },
  cityCode: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  cityName: {
    fontSize: 14,
    fontWeight: '500',
  },
  flightInfoCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  planeIcon: {
    transform: [{ rotate: '90deg' }],
    marginBottom: 4,
  },
  duration: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  timezoneText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  nextDayBadge: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
  },
});

export default FlightHeader;