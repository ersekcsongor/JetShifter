import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      marginTop: 20,
      flex: 1,
      padding: 24,
      alignItems: "center",
      justifyContent: "flex-start",
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginLeft: 10,
      color: "#6B5B00",
    },
    infoCard: {
      backgroundColor: "#fffbe6",
      borderRadius: 12,
      padding: 18,
      marginBottom: 18,
      width: "100%",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    infoTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 8,
      color: "#6B5B00",
    },
    infoText: {
      fontSize: 16,
      color: "#333",
    },
    tipsCard: {
      backgroundColor: "#e6f7ff",
      borderRadius: 12,
      padding: 18,
      marginBottom: 24,
      width: "100%",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    tipsTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 8,
      color: "#0077b6",
    },
    tip: {
      fontSize: 15,
      color: "#333",
      marginBottom: 6,
    },
    button: {
      backgroundColor: "#6B5B00",
      borderRadius: 24,
      paddingVertical: 12,
      paddingHorizontal: 32,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: {
      color: "#fffbe6",
      fontSize: 18,
      fontWeight: "bold",
    },
  });
  
  export default styles;