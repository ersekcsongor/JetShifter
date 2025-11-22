import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AppStackParamList, RootStackParamList } from "~/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { useTheme } from "~/contexts/ThemeContext";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ScreenBackground from "~/components/ScreenBackground";
import { createThemedStyles } from "~/styles/StartScreen.styles";

type StartScreenNavigationProp = StackNavigationProp<AppStackParamList, 'StartScreen'>;
type RootNavigationProp = StackNavigationProp<RootStackParamList>;

const StartScreen = () => {
  const navigation = useNavigation<StartScreenNavigationProp>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const styles = createThemedStyles(colors);

  return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.yellowCircleButton} 
          onPress={() => navigation.navigate("ChooseScreen")}
        >
          <View style={styles.buttonContent}>
            <View style={styles.dashedLine} />
            <MaterialIcons name="flight-land" size={36} color={colors.primaryDark} />
            <Text style={styles.yellowButtonText}>Add trip</Text>
          </View>
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.yellowCircleButton}
            onPress={() => navigation.navigate("AboutScreen")}
          >
            <View style={styles.buttonContent}>
              <View style={styles.dashedLine} />
              <MaterialIcons name="info" size={36} color={colors.primaryDark} />
              <Text style={styles.yellowButtonText}>Ask about jetlag</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
  );
};

export default StartScreen;