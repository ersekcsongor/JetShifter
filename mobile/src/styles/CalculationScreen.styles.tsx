import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      padding: 20,
      justifyContent: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#007AFF",
      marginBottom: 20,
      textAlign: "center",
    },
    label: {
      fontSize: 16,
      color: "#333",
      marginBottom: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
      padding: 10,
      marginBottom: 20,
      fontSize: 16,
      backgroundColor: "#f9f9f9",
    },
    suggestion: {
      backgroundColor: "#f0f0f0",
      padding: 10,
      borderRadius: 5,
      marginVertical: 5,
    },
    suggestionText: {
      fontSize: 16,
      color: "#333",
    },
    button: {
      backgroundColor: "#007AFF",
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 25,
      alignSelf: "center",
      marginBottom: 20,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    resultContainer: {
      marginTop: 20,
      padding: 15,
      backgroundColor: "#f0f8ff",
      borderRadius: 10,
    },
    result: {
      fontSize: 16,
      color: "#333",
      lineHeight: 24,
    },
    backButton: {
      backgroundColor: "#ccc",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      alignSelf: "center",
      marginTop: 20,
    },
    backButtonText: {
      color: "#333",
      fontSize: 16,
    },
  });
  
  export default styles;