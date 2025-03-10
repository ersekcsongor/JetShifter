import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "~/navigation";

const airportMapping: { [key: string]: string } = {
  "Romania (IAS)": "IAS",
  "Cyprus (LCA)": "LCA",
  "United Kingdom (LON)": "LON",
  "Germany (BER)": "BER",
  "France (CDG)": "CDG",
};

const SelectAirportScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [departure, setDeparture] = useState("Romania (IAS)");
  const [arrival, setArrival] = useState("Cyprus (LCA)");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSearch = () => {
    const departureCode = airportMapping[departure];
    const arrivalCode = airportMapping[arrival];
    const formattedDate = date.toISOString().split("T")[0];

    if (departureCode && arrivalCode) {
      navigation.navigate("FlightListScreen", {
      departure: departureCode,
      arrival: arrivalCode,
      startDate: formattedDate,  
    });

    } else {
      alert("Invalid selection");
    }
  };

  return (
  <View style={{ padding: 20 }}>
  <Text style={{ marginTop: 10 ,fontSize: 20,fontWeight: "bold",textAlign: "center"}}>Select Departure Country:</Text>
  <Picker
    selectedValue={departure}
    onValueChange={setDeparture}
    style={{ }}
  >
    {Object.keys(airportMapping).map((country) => (
      <Picker.Item key={country} label={country} value={country} />
    ))}
  </Picker>

  <Text style={{marginTop: 10 ,fontWeight: "bold",fontSize: 20,textAlign: "center"}}>Select Arrival Country:</Text>
  <Picker
    selectedValue={arrival}
    onValueChange={setArrival}
    style={{  }}
  >
    {Object.keys(airportMapping).map((country) => (
      <Picker.Item key={country} label={country} value={country} />
    ))}
  </Picker>

  <Text style={{marginTop: 10 ,marginBottom: 10,fontWeight: "bold",fontSize: 20,textAlign: "center"}}>Select Start Date:</Text>
  <Button
    title={date.toDateString()}
    onPress={() => setShowDatePicker(true)}
  />
  {showDatePicker && (
    <DateTimePicker
      value={date}
      mode="date"
      display="default"
      onChange={(event, selectedDate) => {
        if (selectedDate) {
          setDate(selectedDate);
        }
        setShowDatePicker(false);
      }}
    />
  )}

  <Button title="Find Flights" onPress={handleSearch} />
</View>
  );
};

export default SelectAirportScreen;
