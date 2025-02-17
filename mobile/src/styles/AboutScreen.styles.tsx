import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#fff",
      justifyContent: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#007AFF",
      marginBottom: 20,
      textAlign: "center",
    },
    info: {
      fontSize: 16,
      color: "#333",
      lineHeight: 24,
      marginBottom: 20,
      textAlign: "justify",
    },
    button: {
      backgroundColor: "#007AFF",
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 20,
      alignSelf: "center",
      marginTop: 20,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });
  
  export default styles;