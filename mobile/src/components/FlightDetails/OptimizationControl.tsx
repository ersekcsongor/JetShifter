import React from 'react';
import { Text,View, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import { styles } from './styles';

type OptimizationControlProps = {
  onOptimize: () => void;
  isOptimizing: boolean;
  switchingPointsAvailable: boolean;
  timezonesReady: boolean;
};

export const OptimizationControl = ({ 
  onOptimize, 
  isOptimizing, 
  switchingPointsAvailable,
  timezonesReady
}: OptimizationControlProps) => (
  <View style={styles.controlContainer}>
    <TouchableOpacity style ={styles.calculateButton}
      onPress={onOptimize}
      disabled={isOptimizing || !timezonesReady || !switchingPointsAvailable}
    >
    {isOptimizing && <ActivityIndicator size="small" color="#0000ff" />}
    <Text style={styles.buttonText}>Circadian Statistics</Text>
    </TouchableOpacity>
  </View>
);