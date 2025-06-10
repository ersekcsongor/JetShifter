import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

type Props = {
  children: React.ReactNode;
};

const ScreenBackground: React.FC<Props> = ({ children }) => (
  <ImageBackground
    source={require('~/assets/background.png')}
    style={styles.background}
    resizeMode="cover"
  >
    {children}
  </ImageBackground>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default ScreenBackground;