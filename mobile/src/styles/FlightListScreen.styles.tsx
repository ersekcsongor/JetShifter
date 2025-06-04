import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  listFooter: {
    height: 20,
  },
  flightItem: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
    paddingBottom: 8,
  },
  flightNumber: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2c3e50",
  },
  price: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#27ae60",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeBox: {
    flex: 1,
    alignItems: "center",
  },
  durationContainer: {
    alignItems: "center",
    minWidth: 80,
  },
  durationLine: {
    height: 1,
    width: "100%",
    backgroundColor: "#bdc3c7",
    marginVertical: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  time: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 6,
  },
  airport: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3498db",
  },
  duration: {
    fontSize: 12,
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  loadingText: {
    marginTop: 12,
    color: "#7f8c8d",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  retryText: {
    color: "#3498db",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  noFlightsText: {
    fontSize: 18,
    color: "#2c3e50",
    marginBottom: 8,
    fontWeight: "500",
  },
  noFlightsSubtext: {
    fontSize: 14,
    color: "#7f8c8d",
  },
});

export default styles;