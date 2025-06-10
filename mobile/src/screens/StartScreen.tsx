import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AppStackParamList, RootStackParamList } from "~/navigation";
import styles from "~/styles/StartScreen.styles";
import { useAuth } from "~/contexts/AuthContext";
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Install if needed
import ScreenBackground from "~/components/ScreenBackground";

type StartScreenNavigationProp = StackNavigationProp<AppStackParamList, 'StartScreen'>;
type RootNavigationProp = StackNavigationProp<RootStackParamList>;

const StartScreen = () => {
  const navigation = useNavigation<StartScreenNavigationProp>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  

  return (
        <ScreenBackground>
    
    <View style={styles.container}>
       

      {/* Buttons */}
      <TouchableOpacity 
      style={styles.yellowCircleButton} 
      onPress={() => navigation.navigate("SelectAirportScreen")}
    >
      <View style={styles.buttonContent}>
        <View style={styles.dashedLine} />
        <MaterialIcons name="flight-land" size={36} color="#6B5B00" />
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
          <MaterialIcons name="info" size={36} color="#6B5B00" />
          <Text style={styles.yellowButtonText}>About Jetlag</Text>
        </View>
      </TouchableOpacity>
    </View>

    
    </View>
    </ScreenBackground>
    
  );
};

export default StartScreen;