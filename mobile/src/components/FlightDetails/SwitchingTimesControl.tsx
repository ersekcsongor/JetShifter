import React from 'react';
import { View, Button, ActivityIndicator } from 'react-native';
import { styles } from './styles';

type SwitchingTimesControlProps = {
  onCalculate: () => void;
  loading: boolean;
  timezonesReady: boolean;
};

export const SwitchingTimesControl = ({ 
  onCalculate, 
  loading, 
  timezonesReady 
}: SwitchingTimesControlProps) => (
  <View style={styles.controlContainer}>
    <Button 
      title="Calculate Switching Times" 
      onPress={onCalculate} 
      disabled={loading || !timezonesReady}
    />
    {loading && <ActivityIndicator size="small" color="#0000ff" />}
  </View>
);