import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
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
    <TouchableOpacity
      style={[
        styles.calculateButton,
        (!timezonesReady || loading) && styles.disabledButton
      ]}
      onPress={onCalculate}
      disabled={loading || !timezonesReady}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={styles.buttonText}>Calculate Switching Times</Text>
      )}
    </TouchableOpacity>
  </View>
);