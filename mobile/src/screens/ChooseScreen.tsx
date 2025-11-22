import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "~/navigation";
import { createThemedStyles } from "~/styles/StartScreen.styles";
import ScreenBackground from "~/components/ScreenBackground";
import { useTheme } from '~/contexts/ThemeContext';

type ChooseScreenNavigationProp = StackNavigationProp<AppStackParamList, 'ChooseScreen'>;

const ChooseScreen = () => {
  const navigation = useNavigation<ChooseScreenNavigationProp>();
  const { colors } = useTheme();
  const styles = createThemedStyles(colors);

  return (
    <ScreenBackground>
    <View style={styles.container}>
      <Text style={styles.header}>Choose an Option</Text>
      <TouchableOpacity
        style={styles.yellowCircleButton}
        onPress={() => navigation.navigate("SelectAirportScreen")}
      >
        <Text style={styles.yellowButtonText}>Select Airports From RyanAir</Text>
      </TouchableOpacity>
      {/* Add more options here if needed */}
      <TouchableOpacity
        style={styles.yellowCircleButton}
        onPress={() => navigation.navigate("CustomFlightScreen")}
      >
        <Text style={styles.yellowButtonText}>Custom Flights</Text>
      </TouchableOpacity>
    </View>
    </ScreenBackground>
    
  );
};

export default ChooseScreen;