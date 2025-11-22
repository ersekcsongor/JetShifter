import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { useTheme } from '~/contexts/ThemeContext';

type Props = {
  children: React.ReactNode;
};

const ScreenBackground: React.FC<Props> = ({ children }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    background: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: colors.background,
    },
  });

  return (
    <ImageBackground
      // source={require('~/assets/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
};

export default ScreenBackground;