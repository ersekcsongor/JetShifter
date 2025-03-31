import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '~/navigation';
import moment from 'moment-timezone';

type FlightDetailsScreenRouteProp = RouteProp<RootStackParamList, 'FlightDetailsScreen'>;
type FlightDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FlightDetailsScreen'>;

type Props = {
  route: FlightDetailsScreenRouteProp;
  navigation: FlightDetailsScreenNavigationProp;
};

type JetLagResult = {
  severity: string;
  message: string;
  recommendations: string[];
};

const FlightDetailsScreen = ({ route }: Props) => {
  const [jetLagResult, setJetLagResult] = useState<JetLagResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [timezones, setTimezones] = useState<{
    originTz?: string;
    destTz?: string;
  }>({});

  useEffect(() => {
    // Fetch timezones when component mounts
    const fetchTimezones = async () => {
      try {
        setLoading(true);
        const [originRes, destRes] = await Promise.all([
          fetch(`http://172.20.10.2:3000/airports/getTimezoneByIataCode/${flight.origin}`),
          fetch(`http://172.20.10.2:3000/airports/getTimezoneByIataCode/${flight.destination}`)
        ]);
        
        const originData = await originRes.json();
        const destData = await destRes.json();
        
        setTimezones({
          originTz: originData.timeZone,
          destTz: destData.timeZone
        });
      } catch (error) {
        console.error('Failed to fetch timezones:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimezones();
  }, []);

  if (!route.params?.flight) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No flight data provided</Text>
      </View>
    );
  }

  const { flight } = route.params;

  if (!flight.flightNumber || !flight.origin || !flight.destination) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Invalid flight data</Text>
      </View>
    );
  }

  const calculateJetLag = () => {
    if (!timezones.originTz || !timezones.destTz) return;
    
    // Convert times with timezones
    const departure = moment.tz(flight.time[0], timezones.originTz);
    const arrival = moment.tz(flight.time[1], timezones.destTz);
    
    // Calculate timezone difference (hours)
    const originOffset = departure.utcOffset() / 60;
    const destOffset = arrival.utcOffset() / 60;
    const timezoneDiff = destOffset - originOffset;
    const absoluteDiff = Math.abs(timezoneDiff);
    
    // Determine direction
    const direction = timezoneDiff > 0 ? 'eastbound' : 'westbound';
    
    // Calculate severity
    let severity = 'Mild';
    const recommendations: string[] = [];
    
    if (absoluteDiff <= 2) {
      severity = 'Mild';
      recommendations.push('Minimal adjustment needed');
    } else if (absoluteDiff <= 5) {
      severity = 'Moderate';
      recommendations.push('Adjust sleep schedule 1-2 days before');
    } else if (absoluteDiff <= 8) {
      severity = 'Severe';
      recommendations.push('Adjust schedule 2-3 days before');
    } else {
      severity = 'Extreme';
      recommendations.push('Plan for 3+ days adjustment');
    }

    // Eastbound is typically harder
    if (direction === 'eastbound' && absoluteDiff > 3) {
      recommendations.push('Try to sleep on the plane (eastbound travel)');
    }

    setJetLagResult({
      severity,
      message: `Flying ${direction} across ${absoluteDiff} timezones`,
      recommendations
    });
  };

  return (
    <View style={styles.container}>
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

      <View style={styles.timezoneInfo}>
        {timezones.originTz && <Text>Origin TZ: {timezones.originTz}</Text>}
        {timezones.destTz && <Text>Destination TZ: {timezones.destTz}</Text>}
      </View>

      <Button 
        title="Calculate Jet Lag" 
        onPress={calculateJetLag} 
        disabled={loading || !timezones.originTz || !timezones.destTz}
      />

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      
      {jetLagResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.severityText}>
            {jetLagResult.severity} Jet Lag
          </Text>
          <Text>{jetLagResult.message}</Text>
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Recommendations:</Text>
            {jetLagResult.recommendations.map((rec, index) => (
              <Text key={index}>• {rec}</Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailSection: {
    marginVertical: 12,
  },
  timezoneInfo: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
  },
  error: {
    color: 'red',
    fontSize: 18,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  severityText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  recommendationsContainer: {
    marginTop: 12,
  },
  recommendationsTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default FlightDetailsScreen;