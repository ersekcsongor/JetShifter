import React from 'react';
import { View, Button, ActivityIndicator } from 'react-native';
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
    <Button
      title={isOptimizing ? "Optimizing..." : "Run Full Optimization"}
      onPress={onOptimize}
      disabled={isOptimizing || !timezonesReady || !switchingPointsAvailable}
    />
    {isOptimizing && <ActivityIndicator size="small" color="#0000ff" />}
  </View>
);