import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format, parseISO, isSameDay } from 'date-fns';

type FlightHeaderProps = {
  flight: {
    flightNumber: string;
    origin: string;        // e.g. "NYC"
    destination: string;   // e.g. "SFO"
    duration: string;      // e.g. "2h 10m"
    time: string[];        // [departureTimeISO, arrivalTimeISO]
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

export const FlightHeader = ({ flight }: FlightHeaderProps) => {
  const [originCountry, setOriginCountry] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');

  // Helper function to fetch country by IATA code
  const fetchCountryByIata = async (iataCode: string) => {
    try {
      const response = await fetch(`http://172.20.10.2:3000/airports/getNameByIataCode=${iataCode}`);
      
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
      console.log('Origin Country:', originRes);
      console.log('Destination Country:', destinationRes);
      setOriginCountry(originRes);
      setDestinationCountry(destinationRes);
    })();
  }, [flight.origin, flight.destination]);

  const sameDay = isSameDayCheck(flight.time[0], flight.time[1]);

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Flight {flight.flightNumber}</Text>

    

      <View style={styles.routeContainer}>
        {/* Origin */}
        <View style={styles.airportColumn}>
          <Text style={styles.timeText}>
            {formatTime(flight.time[0])}
            {!sameDay && (
              <Text style={styles.dateSmall}>
                {'\n'}{formatDate(flight.time[0])}
              </Text>
            )}
          </Text>

          <Text style={styles.airportCode}>{flight.origin}</Text>
          {!!originCountry && <Text style={styles.countryText}>{originCountry}</Text>}
          {/* <MaterialIcons 
            name="location-pin" 
            size={24} 
            color="black" 
          />

          
          <Text>{originCountry}asdasds</Text> */}
        </View>

        <View style={styles.planeContainer}>    
          <MaterialIcons 
            name="flight" 
            size={24} 
            color="white" 
            style={styles.planeIcon} 
          />
          <Text style={styles.infoValue}>{flight.duration}</Text>
        </View>

        
        {/* Destination */}
        <View style={styles.airportColumn}>
          <Text style={styles.timeText}>
            {formatTime(flight.time[1])}
            {!sameDay && (
              <Text style={styles.dateSmall}>
                {'\n'}{formatDate(flight.time[1])}
              </Text>
            )}
          </Text>

          <Text style={styles.airportCode}>{flight.destination}</Text>
          {!!destinationCountry && <Text style={styles.countryText}>{destinationCountry}</Text>}
        </View>

      
      </View>

      {/* Show date only once if same day */}
      {sameDay && (
        <Text style={styles.dateText}>
          {formatDate(flight.time[0])}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    margin: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 16,
    textAlign: 'center',
  },
  dateText: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 8,
    fontSize: 14,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  airportColumn: {
    alignItems: 'center',
    flex: 1,
  },
  airportCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 2,
  },
  // This is for the country name
  countryText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
    marginBottom: 2,
    textAlign: 'center',
  },
  dateSmall: {
    fontSize: 12,
    color: '#777',
  },
  detailSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 6,
    padding: 10,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoLabel: {
    color: '#555',
    fontSize: 14,
  },
  planeContainer: {
    backgroundColor: 'black',
    borderRadius: 20, // Adjust this value for more/less rounded corners
    padding: 10, // Adjust padding as needed
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Optional: add shadow if you want
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3, // for Android
  },
  planeIcon: {
    marginRight: 8, // Space between icon and text
    transform: [{ rotate: '90deg' }], // Rotates the plane icon horizontally
  },
  infoValue: {
    color: 'white',
    fontSize: 16, // Adjust as needed
    fontWeight: 'bold',
  },
});

export default FlightHeader;