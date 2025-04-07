import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { styles } from './styles';

type TimezoneInfoProps = {
  originTz?: string;
  destTz?: string;
  loading: boolean;
};

export const TimezoneInfo = ({ originTz, destTz, loading }: TimezoneInfoProps) => (
  <View style={styles.timezoneInfo}>
    {loading ? (
      <ActivityIndicator size="small" color="#0000ff" />
    ) : (
      <>
        {originTz && <Text>Origin TZ: {originTz}</Text>}
        {destTz && <Text>Destination TZ: {destTz}</Text>}
      </>
    )}
  </View>
);