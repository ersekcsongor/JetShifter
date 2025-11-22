// ~/styles/CalculationScreen.styles.ts (or whatever it's called)
import { StyleSheet } from "react-native";

export const createThemedStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  suggestion: {
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: "bold",
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  result: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 20,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
  },
});

export default createThemedStyles;