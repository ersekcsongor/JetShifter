import React from 'react';
import { View, Button, ActivityIndicator } from 'react-native';
import styles from './styles';
type SimulationControlProps = {
  onSimulate: () => void;
  loading: boolean;
  switchingTimesReady: boolean;
};

export const SimulationControl = ({ 
  onSimulate, 
  loading, 
  switchingTimesReady 
}: SimulationControlProps) => (
  <View style={styles.controlContainer}>
    <Button 
      title="Simulate Circadian Dynamics" 
      onPress={onSimulate} 
      disabled={!switchingTimesReady || loading}
    />
    {loading && <ActivityIndicator size="small" color="#0000ff" />}
  </View>
);