import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

type FlightHeaderProps = {
  flight: {
    flightNumber: string;
    origin: string;
    destination: string;
    duration: string;
    time: string[];
  };
};

export const FlightHeader = ({ flight }: FlightHeaderProps) => (
  <View style={styles.headerContainer}>
    <Text style={styles.title}>Flight {flight.flightNumber}</Text>
    <View style={styles.detailRow}>
      <Text>From: {flight.origin}</Text>
      <Text>To: {flight.destination}</Text>
    </View>
    <View style={styles.detailSection}>
      <Text>Duration: {flight.duration}</Text>
      <Text>Departure: {flight.time[0]}</Text>
      <Text>Arrival: {flight.time[1]}</Text>
    </View>
  </View>
);