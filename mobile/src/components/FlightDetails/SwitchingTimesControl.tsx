import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { createFlightDetailsStyles } from './styles';
import { useTheme } from '~/contexts/ThemeContext';

type SwitchingTimesControlProps = {
  onCalculate: () => void;
  loading: boolean;
  timezonesReady: boolean;
};

export const SwitchingTimesControl = ({
  onCalculate,
  loading,
  timezonesReady
}: SwitchingTimesControlProps) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createFlightDetailsStyles(isDarkMode);

  return (
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
          <Text style={styles.buttonText}>Calculate Light Schedule</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};